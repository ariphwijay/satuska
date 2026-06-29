import { json } from '@sveltejs/kit';
import type { RequestEvent } from '@sveltejs/kit';

export function requireAdminApiSession(event: RequestEvent) {
	if (!event.locals.adminSession?.authenticated) {
		return json({ ok: false, error: 'Unauthorized admin session.' }, { status: 401 });
	}
	return null;
}
