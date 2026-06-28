import { site, publishedArticles, guides, lawPages } from '$lib/content';

export function GET() {
	const urls = [
		'',
		'/blog',
		'/cases',
		'/laws',
		'/learn',
		'/tools',
		'/for-creators',
		'/for-businesses',
		...publishedArticles().map((article) => `/blog/${article.slug}`),
		...guides.map((guide) => guide.href),
		...lawPages.map((page) => page.href),
		'/tools/ai-copyright-checker',
		'/tools/ai-disclosure-generator',
		'/tools/robots-txt-ai-blocker'
	];
	const body = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls
		.map((url) => `<url><loc>${site.url}${url}</loc></url>`)
		.join('')}</urlset>`;
	return new Response(body, { headers: { 'content-type': 'application/xml' } });
}
