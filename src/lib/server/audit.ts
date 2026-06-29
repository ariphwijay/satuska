import type { RequestEvent } from '@sveltejs/kit';
import type { D1Database } from '$lib/server/db';

export type AdminMutationLog = {
	id: number;
	action: string;
	entity_type: string;
	entity_id: number | null;
	summary: string;
	payload_json: string | null;
	actor_label: string | null;
	ip_address: string | null;
	user_agent: string | null;
	created_at: string;
};

function requestMeta(event: RequestEvent) {
	return {
		ip: event.request.headers.get('cf-connecting-ip') ?? event.getClientAddress?.() ?? 'unknown',
		userAgent: event.request.headers.get('user-agent') ?? 'unknown'
	};
}

export async function writeAdminMutationLog(
	event: RequestEvent,
	db: D1Database,
	input: {
		action: string;
		entityType: string;
		entityId?: number | null;
		summary: string;
		payload?: unknown;
	}
) {
	const meta = requestMeta(event);
	await db
		.prepare(`
			INSERT INTO admin_mutation_logs (
				action, entity_type, entity_id, summary, payload_json, actor_label, ip_address, user_agent
			) VALUES (?1, ?2, ?3, ?4, ?5, 'admin', ?6, ?7)
		`)
		.bind(
			input.action,
			input.entityType,
			input.entityId ?? null,
			input.summary,
			input.payload ? JSON.stringify(input.payload) : null,
			meta.ip,
			meta.userAgent
		)
		.run();
}

export async function listRecentAdminMutationLogs(db: D1Database | null = null, limit = 12) {
	if (!db) return [] as AdminMutationLog[];
	const result = await db
		.prepare(`
			SELECT id, action, entity_type, entity_id, summary, payload_json, actor_label, ip_address, user_agent, created_at
			FROM admin_mutation_logs
			ORDER BY datetime(created_at) DESC, id DESC
			LIMIT ?1
		`)
		.bind(limit)
		.all<AdminMutationLog>();
	return result.results ?? [];
}
