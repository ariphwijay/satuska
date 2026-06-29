import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { deletePost, updatePost } from '$lib/server/repositories/posts';
import { validatePositiveId, validatePostPayload } from '$lib/server/validation';

export const PUT: RequestHandler = async (event) => {
	const db = getDb(event);
	if (!db) return json({ ok: false, error: 'DB belum tersedia di environment ini.' }, { status: 503 });
	const idResult = validatePositiveId(event.params.id, 'ID post');
	if (!idResult.ok) return json({ ok: false, error: idResult.error }, { status: 400 });
	const body = await event.request.json().catch(() => null);
	const parsed = validatePostPayload(body, 'update', idResult.data.id);
	if (!parsed.ok) return json({ ok: false, error: parsed.error }, { status: 400 });

	const result = await updatePost(idResult.data.id, parsed.data, db);

	return json({ ok: true, result });
};

export const DELETE: RequestHandler = async (event) => {
	const db = getDb(event);
	if (!db) return json({ ok: false, error: 'DB belum tersedia di environment ini.' }, { status: 503 });
	const idResult = validatePositiveId(event.params.id, 'ID post');
	if (!idResult.ok) return json({ ok: false, error: idResult.error }, { status: 400 });
	const result = await deletePost(idResult.data.id, db);
	return json({ ok: true, result });
};
