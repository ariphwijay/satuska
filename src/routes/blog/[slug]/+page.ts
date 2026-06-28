import { error } from '@sveltejs/kit';
import { articleBySlug, relatedArticles } from '$lib/content';

export function load({ params }) {
	const article = articleBySlug(params.slug);
	if (!article) error(404, 'Article not found');
	return { article, related: relatedArticles(article) };
}
