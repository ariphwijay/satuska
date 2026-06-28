import { error } from '@sveltejs/kit';
import { guides, articleBySlug } from '$lib/content';

export function load({ params }) {
	const guide = guides.find((item) => item.href.endsWith(params.slug));
	if (!guide) error(404, 'Guide not found');
	const article = articleBySlug(params.slug);
	return { guide, article };
}
