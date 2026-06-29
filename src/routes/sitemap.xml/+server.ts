import { site } from '$lib/content';
import { getDb } from '$lib/server/db';
import { listPublishedPosts } from '$lib/server/repositories/posts';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async (event) => {
	const publishedPosts = await listPublishedPosts(getDb(event));
	const staticUrls = [
		{ path: '', priority: '1.0', changefreq: 'weekly' },
		{ path: '/blog', priority: '0.9', changefreq: 'daily' },
		{ path: '/write-for-us', priority: '0.7', changefreq: 'weekly' },
		{ path: '/advertise', priority: '0.7', changefreq: 'weekly' },
		{ path: '/contact', priority: '0.6', changefreq: 'monthly' },
		{ path: '/about', priority: '0.5', changefreq: 'monthly' }
	];

	const postUrls = publishedPosts.map((post) => ({
		path: `/blog/${post.slug}`,
		lastmod: post.updated_at || post.published_at,
		priority: post.featured ? '0.9' : '0.8',
		changefreq: 'weekly'
	}));

	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${[
		...staticUrls,
		...postUrls
	]
		.map((url) => `<url><loc>${site.url}${url.path}</loc>${'lastmod' in url && url.lastmod ? `<lastmod>${url.lastmod}</lastmod>` : ''}<changefreq>${url.changefreq}</changefreq><priority>${url.priority}</priority></url>`)
		.join('')}</urlset>`;

	return new Response(body, {
		headers: {
			'content-type': 'application/xml',
			'cache-control': 'no-store'
		}
	});
};
