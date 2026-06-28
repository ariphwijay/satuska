import { json } from '@sveltejs/kit';
import { publishedArticles } from '$lib/content';

export function GET() {
	return json(publishedArticles());
}
