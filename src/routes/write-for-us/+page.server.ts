import { fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { getOperatorErrorMessage } from '$lib/server/errors';
import { guardAgainstDuplicateRequest } from '$lib/server/idempotency';
import { enforceRateLimit } from '$lib/server/rate-limit';
import { createSubmission } from '$lib/server/repositories/submissions';
import { validateSubmission } from '$lib/server/validation';

export const actions: Actions = {
	default: async (event) => {
		const db = getDb(event);
		if (!db) return fail(503, { error: 'DB belum tersedia di environment ini.' });
		const rateLimit = await enforceRateLimit(event, db, {
			action: 'write_for_us_submission',
			limit: 3,
			windowSeconds: 60 * 60
		});
		if (!rateLimit.allowed) {
			return fail(429, {
				error: `Terlalu banyak pitch dari jaringan ini. Coba lagi dalam ${rateLimit.retryAfterSeconds} detik.`
			});
		}

		const formData = await event.request.formData();
		const parsed = validateSubmission(formData, 'write_for_us');
		if (!parsed.ok) {
			return fail(400, { error: parsed.error });
		}
		const duplicate = await guardAgainstDuplicateRequest(event, db, 'write_for_us_form', parsed.data, 30);
		if (!duplicate.ok) {
			return fail(409, { error: duplicate.message });
		}

		try {
			await createSubmission(parsed.data, db);
		} catch (error) {
			return fail(400, { error: getOperatorErrorMessage(error, 'Pitch gagal dikirim. Coba lagi.') });
		}

		return { success: 'Pitch guest post sudah masuk ke review queue.' };
	}
};
