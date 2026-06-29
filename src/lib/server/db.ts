import type { RequestEvent } from '@sveltejs/kit';

export type D1Database = globalThis.D1Database;

export function getDb(event: RequestEvent): D1Database | null {
	return event.platform?.env?.DB ?? null;
}
