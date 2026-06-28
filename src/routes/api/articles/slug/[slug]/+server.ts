import { json, error } from '@sveltejs/kit';
import { articleBySlug } from '$lib/content';

export function GET({ params }) {
	const article = articleBySlug(params.slug);
	if (!article) error(404, 'Article not found');
	return json(article);
}
