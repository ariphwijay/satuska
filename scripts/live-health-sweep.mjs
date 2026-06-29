const BASE_URL = 'https://www.gushdesign.com';

const corePaths = [
	'/',
	'/blog',
	'/write-for-us',
	'/advertise',
	'/contact',
	'/about',
	'/privacy',
	'/terms',
	'/sitemap.xml',
	'/robots.txt',
	'/api/articles/published'
];

const expectedBlogSlugs = [
	'entryway-storage-ideas-small-homes',
	'bathroom-counter-organization-ideas',
	'make-rental-living-room-feel-finished',
	'pantry-organization-ideas-small-kitchens',
	'buying-peel-and-stick-floor-tiles'
];

const legacySlugs = [
	'small-kitchen-makeover-ideas-budget',
	'living-room-lighting-upgrades',
	'best-peel-and-stick-backsplash-options',
	'how-to-pitch-home-improvement-guest-post'
];

const checks = [];

function record(name, pass, detail = '') {
	checks.push({ name, pass, detail });
}

async function fetchText(url, init = {}) {
	return fetch(url, {
		...init,
		headers: {
			'user-agent': 'SatuskaLiveHealthSweep/1.0',
			...(init.headers ?? {})
		}
	});
}

async function checkStatus(url, expectedStatus, name) {
	const response = await fetchText(url, { redirect: 'manual' });
	record(name, response.status === expectedStatus, `${response.status} ${url}`);
	return response;
}

async function main() {
	for (const path of corePaths) {
		await checkStatus(`${BASE_URL}${path}`, 200, `core route ${path}`);
	}

	for (const slug of expectedBlogSlugs) {
		await checkStatus(`${BASE_URL}/blog/${slug}`, 200, `production article ${slug}`);
	}

	for (const slug of legacySlugs) {
		await checkStatus(`${BASE_URL}/blog/${slug}`, 404, `legacy dummy article hidden ${slug}`);
	}

	const apexRoot = await checkStatus('https://gushdesign.com/', 308, 'apex root redirects');
	record('apex root location is www', apexRoot.headers.get('location') === `${BASE_URL}/`, apexRoot.headers.get('location') ?? 'missing location');

	const apexBlog = await checkStatus('https://gushdesign.com/blog', 308, 'apex blog redirects');
	record('apex blog location is www', apexBlog.headers.get('location') === `${BASE_URL}/blog`, apexBlog.headers.get('location') ?? 'missing location');

	const admin = await checkStatus(`${BASE_URL}/admin`, 303, 'admin requires login');
	record('admin login redirect target', admin.headers.get('location') === '/login?next=%2Fadmin', admin.headers.get('location') ?? 'missing location');

	await checkStatus(`${BASE_URL}/api/admin/posts`, 401, 'admin api rejects anonymous');

	const home = await fetchText(`${BASE_URL}/`);
	const homeHtml = await home.text();
	record('homepage has no noindex', !homeHtml.toLowerCase().includes('noindex'), 'meta robots should be index, follow');
	record('homepage canonical www', homeHtml.includes(`<link rel="canonical" href="${BASE_URL}/"`), 'canonical should use www');

	const robots = await fetchText(`${BASE_URL}/robots.txt`);
	const robotsText = await robots.text();
	record('robots allows crawling', robotsText.includes('Allow: /') && !robotsText.includes('Disallow: /'), robotsText.trim());
	record('robots includes sitemap', robotsText.includes(`Sitemap: ${BASE_URL}/sitemap.xml`), robotsText.trim());

	const sitemap = await fetchText(`${BASE_URL}/sitemap.xml`);
	const sitemapText = await sitemap.text();
	const locs = [...sitemapText.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => match[1]);
	record('sitemap has expected URL count', locs.length === 11, `${locs.length} URLs`);
	record('sitemap has no apex URLs', !sitemapText.includes('https://gushdesign.com'), 'apex refs should be 0');
	for (const slug of expectedBlogSlugs) {
		record(`sitemap includes ${slug}`, locs.includes(`${BASE_URL}/blog/${slug}`));
	}

	for (const path of ['/', '/admin', '/api/admin/posts']) {
		const response = await fetchText(`${BASE_URL}${path}`, { redirect: 'manual' });
		record(`${path} has x-content-type-options`, response.headers.get('x-content-type-options') === 'nosniff');
		record(`${path} has x-frame-options`, response.headers.get('x-frame-options') === 'DENY');
		record(`${path} has referrer-policy`, response.headers.get('referrer-policy') === 'strict-origin-when-cross-origin');
	}

	const failed = checks.filter((check) => !check.pass);
	for (const check of checks) {
		console.log(`${check.pass ? 'PASS' : 'FAIL'} ${check.name}${check.detail ? ` - ${check.detail}` : ''}`);
	}

	console.log(`\n${checks.length - failed.length}/${checks.length} checks passed`);
	if (failed.length) process.exit(1);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
