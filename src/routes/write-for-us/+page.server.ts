import { fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { enforceRateLimit } from '$lib/server/rate-limit';
import { createSubmission } from '$lib/server/repositories/submissions';

function stringValue(formData: FormData, key: string) {
	return String(formData.get(key) ?? '').trim();
}

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
		const name = stringValue(formData, 'name');
		const email = stringValue(formData, 'email');
		const topic = stringValue(formData, 'topic');
		const message = stringValue(formData, 'message');
		if (!name || !email || !topic || !message) {
			return fail(400, { error: 'Nama, email, topik, dan pesan wajib diisi.' });
		}

		await createSubmission(
			{
				name,
				email,
				company: stringValue(formData, 'company'),
				siteUrl: stringValue(formData, 'siteUrl'),
				targetUrl: stringValue(formData, 'targetUrl'),
				topic,
				message,
				submissionType: 'guest_post',
				desiredPackage: stringValue(formData, 'desiredPackage')
			},
			db
		);

		return { success: 'Pitch guest post sudah masuk ke review queue.' };
	}
};
