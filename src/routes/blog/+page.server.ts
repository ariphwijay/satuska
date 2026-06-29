import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { listPublishedPosts } from '$lib/server/repositories/posts';

export const load: PageServerLoad = async (event) => {
	const posts = await listPublishedPosts(getDb(event));
	return { posts };
};
