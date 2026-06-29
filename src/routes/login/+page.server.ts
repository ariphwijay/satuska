import { fail, redirect } from '@sveltejs/kit';
import type { Actions, ServerLoad } from '@sveltejs/kit';
import {
	hasAdminAuthConfig,
	sanitizeNext,
	startAdminSession,
	validateAdminPassword
} from '$lib/server/auth';

export const load: ServerLoad = async (event) => {
	const next = sanitizeNext(event.url.searchParams.get('next'));
	if (event.locals.adminSession?.authenticated) {
		throw redirect(303, next);
	}

	return {
		next,
		hasConfig: hasAdminAuthConfig(event)
	};
};

export const actions: Actions = {
	default: async (event) => {
		const formData = await event.request.formData();
		const password = String(formData.get('password') ?? '');
		const next = sanitizeNext(String(formData.get('next') ?? '/admin'));

		if (!hasAdminAuthConfig(event)) {
			return fail(503, { error: 'Auth admin belum dikonfigurasi di environment.' });
		}

		if (!password) {
			return fail(400, { error: 'Password wajib diisi.', next });
		}

		const valid = await validateAdminPassword(event, password);
		if (!valid) {
			return fail(401, { error: 'Password salah.', next });
		}

		await startAdminSession(event);
		throw redirect(303, next);
	}
};
