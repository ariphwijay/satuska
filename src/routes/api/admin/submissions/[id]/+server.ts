import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { updateSubmissionStatus } from '$lib/server/repositories/submissions';

export const PUT: RequestHandler = async (event) => {
	const id = Number(event.params.id);
	const body = await event.request.json().catch(() => null);
	if (!id || !body?.status) {
		return json({ ok: false, error: 'valid id and status are required' }, { status: 400 });
	}
	const result = await updateSubmissionStatus(id, String(body.status), getDb(event));
	return json({ ok: true, result });
};
