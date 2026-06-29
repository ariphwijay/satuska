import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { updateSubmissionStatus } from '$lib/server/repositories/submissions';
import { validateSubmissionStatusPayload } from '$lib/server/validation';

export const PUT: RequestHandler = async (event) => {
	const db = getDb(event);
	if (!db) return json({ ok: false, error: 'DB belum tersedia di environment ini.' }, { status: 503 });
	const body = await event.request.json().catch(() => null);
	const parsed = validateSubmissionStatusPayload(body?.status, event.params.id);
	if (!parsed.ok) return json({ ok: false, error: parsed.error }, { status: 400 });
	const result = await updateSubmissionStatus(parsed.data.id, parsed.data.status, db);
	return json({ ok: true, result });
};
