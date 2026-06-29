import { fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { getOperatorErrorMessage } from '$lib/server/errors';
import { enforceRateLimit } from '$lib/server/rate-limit';
import { createSubmission } from '$lib/server/repositories/submissions';
import { validateSubmission } from '$lib/server/validation';

export const actions: Actions = {
	default: async (event) => {
		const db = getDb(event);
		if (!db) return fail(503, { error: 'DB belum tersedia di environment ini.' });
		const rateLimit = await enforceRateLimit(event, db, {
			action: 'contact_submission',
			limit: 5,
			windowSeconds: 60 * 60
		});
		if (!rateLimit.allowed) {
			return fail(429, {
				error: `Terlalu banyak submission dari jaringan ini. Coba lagi dalam ${rateLimit.retryAfterSeconds} detik.`
			});
		}

		const formData = await event.request.formData();
		const parsed = validateSubmission(formData, 'contact');
		if (!parsed.ok) {
			return fail(400, { error: parsed.error });
		}

		try {
			await createSubmission(parsed.data, db);
		} catch (error) {
			return fail(400, { error: getOperatorErrorMessage(error, 'Pesan gagal dikirim. Coba lagi.') });
		}

		return { success: 'Pesanmu sudah masuk ke inbox admin.' };
	}
};
