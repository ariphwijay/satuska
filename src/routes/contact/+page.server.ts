import { fail } from '@sveltejs/kit';
import type { Actions } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { createSubmission } from '$lib/server/repositories/submissions';

function stringValue(formData: FormData, key: string) {
	return String(formData.get(key) ?? '').trim();
}

export const actions: Actions = {
	default: async (event) => {
		const db = getDb(event);
		if (!db) return fail(503, { error: 'DB belum tersedia di environment ini.' });

		const formData = await event.request.formData();
		const name = stringValue(formData, 'name');
		const email = stringValue(formData, 'email');
		const message = stringValue(formData, 'message');
		if (!name || !email || !message) {
			return fail(400, { error: 'Nama, email, dan pesan wajib diisi.' });
		}

		const submissionType = stringValue(formData, 'submissionType') || 'general';
		const subject = stringValue(formData, 'subject');
		await createSubmission(
			{
				name,
				email,
				company: stringValue(formData, 'company'),
				siteUrl: stringValue(formData, 'siteUrl'),
				targetUrl: stringValue(formData, 'targetUrl'),
				topic: subject || submissionType,
				message,
				submissionType: submissionType === 'advertise' ? 'sponsored' : submissionType === 'guest_post' ? 'guest_post' : 'general',
				desiredPackage: stringValue(formData, 'desiredPackage')
			},
			db
		);

		return { success: 'Pesanmu sudah masuk ke inbox admin.' };
	}
};
