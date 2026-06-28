import type { RequestEvent } from '@sveltejs/kit';

export function getDb(event: RequestEvent): D1Database | null {
	return event.platform?.env?.DB ?? null;
}
