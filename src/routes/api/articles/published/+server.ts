import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { listPublishedPosts } from '$lib/server/repositories/posts';

export const GET: RequestHandler = async (event) => {
	const posts = await listPublishedPosts(getDb(event));
	return json(posts);
};
