import { site } from '$lib/content';
import { getDb } from '$lib/server/db';
import { listPublishedPosts } from '$lib/server/repositories/posts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	const urls = [
		'',
		'/blog',
		'/write-for-us',
		'/advertise',
		'/contact',
		'/about',
		...(await listPublishedPosts(getDb(event))).map((post) => `/blog/${post.slug}`)
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls
		.map((url) => `<url><loc>${site.url}${url}</loc></url>`)
		.join('')}</urlset>`;

	return new Response(body, {
		headers: {
			'content-type': 'application/xml',
			'cache-control': 'no-store'
		}
	});
};
