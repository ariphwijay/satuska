import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';
import { relatedPosts } from '$lib/content';
import { getDb } from '$lib/server/db';
import { getPublishedPostBySlug, listPublishedPosts } from '$lib/server/repositories/posts';

export const load: PageServerLoad = async (event) => {
	const db = getDb(event);
	const post = await getPublishedPostBySlug(event.params.slug, db);
	if (!post) error(404, 'Post not found');

	const related = db
		? (await listPublishedPosts(db))
				.filter((item) => item.slug !== post.slug)
				.filter((item) => item.category === post.category || item.intent === post.intent)
				.slice(0, 3)
		: relatedPosts(post);

	return { post, related };
};
