import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { listSubmissions } from '$lib/server/repositories/submissions';

export const GET: RequestHandler = async (event) => {
	const submissions = await listSubmissions(getDb(event));
	return json(submissions);
};
