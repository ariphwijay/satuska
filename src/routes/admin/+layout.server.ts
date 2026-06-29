import { redirect } from '@sveltejs/kit';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }) => {
	if (!locals.adminSession?.authenticated) {
		throw redirect(303, '/login');
	}

	return {
		adminSession: locals.adminSession
	};
};
