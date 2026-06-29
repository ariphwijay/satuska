import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { getOperatorErrorMessage } from '$lib/server/errors';
import { createPost, listPosts } from '$lib/server/repositories/posts';
import { validatePostPayload } from '$lib/server/validation';

export const GET: RequestHandler = async (event) => {
	const db = getDb(event);
	if (!db) return json({ ok: false, error: 'DB belum tersedia di environment ini.' }, { status: 503 });
	const posts = await listPosts(db);
	return json(posts);
};

export const POST: RequestHandler = async (event) => {
	const db = getDb(event);
	if (!db) return json({ ok: false, error: 'DB belum tersedia di environment ini.' }, { status: 503 });
	const body = await event.request.json().catch(() => null);
	const parsed = validatePostPayload(body, 'create');
	if (!parsed.ok) return json({ ok: false, error: parsed.error }, { status: 400 });

	try {
		const result = await createPost(parsed.data, db);
		return json({ ok: true, result }, { status: 201 });
	} catch (error) {
		return json({ ok: false, error: getOperatorErrorMessage(error, 'Post gagal dibuat.') }, { status: 400 });
	}
};
