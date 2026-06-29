import { site, publishedPosts } from '$lib/content';

export function GET() {
	const urls = [
		'',
		'/blog',
		'/write-for-us',
		'/advertise',
		'/contact',
		'/about',
		...publishedPosts().map((post) => `/blog/${post.slug}`)
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls
		.map((url) => `<url><loc>${site.url}${url}</loc></url>`)
		.join('')}</urlset>`;

	return new Response(body, {
		headers: { 'content-type': 'application/xml' }
	});
}
