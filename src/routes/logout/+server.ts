import { redirect } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { clearAdminSession } from '$lib/server/auth';

export const POST: RequestHandler = async (event) => {
	clearAdminSession(event.cookies, event.url.protocol === 'https:');
	throw redirect(303, '/login');
};
