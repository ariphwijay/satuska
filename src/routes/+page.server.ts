import type { PageServerLoad } from './$types';
import { getDb } from '$lib/server/db';
import { listPublishedPosts } from '$lib/server/repositories/posts';

export const load: PageServerLoad = async (event) => {
	const posts = await listPublishedPosts(getDb(event));
	const featuredPosts = posts.filter((post) => post.featured).slice(0, 3);

	return {
		heroPosts: featuredPosts.length > 0 ? featuredPosts : posts.slice(0, 3)
	};
};
