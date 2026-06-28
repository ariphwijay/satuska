import { error } from '@sveltejs/kit';
import { lawPages } from '$lib/content';

export function load({ params }) {
	const page = lawPages.find((item) => item.href.endsWith(params.slug));
	if (!page) error(404, 'Law page not found');
	return { page };
}
