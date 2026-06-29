import { site } from '$lib/content';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
	const body = `User-agent: *\nAllow: /\n\nSitemap: ${site.url}/sitemap.xml\n`;

	return new Response(body, {
		headers: {
			'content-type': 'text/plain; charset=utf-8',
			'cache-control': 'no-store'
		}
	});
};
