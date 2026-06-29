import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';
import { postBySlug, relatedPosts } from '$lib/content';

export const load: PageLoad = ({ params }) => {
	const post = postBySlug(params.slug);
	if (!post) error(404, 'Post not found');
	return { post, related: relatedPosts(post) };
};
