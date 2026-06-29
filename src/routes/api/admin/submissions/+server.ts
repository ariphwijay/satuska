import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { listSubmissions } from '$lib/server/repositories/submissions';

export const GET: RequestHandler = async (event) => {
	const db = getDb(event);
	if (!db) return json({ ok: false, error: 'DB belum tersedia di environment ini.' }, { status: 503 });
	const submissions = await listSubmissions(db);
	return json(submissions);
};
