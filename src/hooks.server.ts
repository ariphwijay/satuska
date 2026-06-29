import type { Handle } from '@sveltejs/kit';
import {
	adminApiUnauthorized,
	adminLoginRedirect,
	getAdminSession,
	isAdminApiPath,
	isProtectedAdminPath
} from '$lib/server/auth';

const canonicalHost = 'www.gushdesign.com';
const apexHost = 'gushdesign.com';

function applySecurityHeaders(response: Response) {
	response.headers.set('x-content-type-options', 'nosniff');
	response.headers.set('x-frame-options', 'DENY');
	response.headers.set('referrer-policy', 'strict-origin-when-cross-origin');
	return response;
}

export const handle: Handle = async ({ event, resolve }) => {
	if (event.url.hostname === apexHost) {
		const canonicalUrl = new URL(event.url);
		canonicalUrl.hostname = canonicalHost;
		return applySecurityHeaders(new Response(null, {
			status: 308,
			headers: { location: canonicalUrl.toString() }
		}));
	}

	event.locals.adminSession = await getAdminSession(event);

	if (isProtectedAdminPath(event.url.pathname) && !event.locals.adminSession.authenticated) {
		if (isAdminApiPath(event.url.pathname)) {
			return applySecurityHeaders(adminApiUnauthorized());
		}
		return applySecurityHeaders(adminLoginRedirect(event));
	}

	const response = await resolve(event);
	if (
		event.url.pathname.startsWith('/admin') ||
		event.url.pathname === '/login' ||
		event.url.pathname.startsWith('/api/admin/') ||
		event.url.pathname.startsWith('/api/articles/')
	) {
		response.headers.set('cache-control', 'no-store');
	} else if (event.url.pathname.startsWith('/api/')) {
		response.headers.set('cache-control', 'public, max-age=60');
	} else if (response.headers.get('content-type')?.includes('text/html')) {
		response.headers.set('cache-control', 'no-store');
	}
	return applySecurityHeaders(response);
};
