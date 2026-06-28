import type { Handle } from '@sveltejs/kit';

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event);
	if (event.url.pathname.startsWith('/api/')) {
		response.headers.set('cache-control', 'public, max-age=60');
	} else if (response.headers.get('content-type')?.includes('text/html')) {
		response.headers.set('cache-control', 'public, max-age=300, s-maxage=3600');
	}
	return response;
};
