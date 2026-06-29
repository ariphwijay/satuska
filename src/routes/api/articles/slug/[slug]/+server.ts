import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { getPublishedPostBySlug } from '$lib/server/repositories/posts';

export const GET: RequestHandler = async (event) => {
	const post = await getPublishedPostBySlug(event.params.slug, getDb(event));
	if (!post) error(404, 'Post not found');
	return json(post);
};
