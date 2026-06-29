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

export type AdminMutationLogFilters = {
	action?: string | null;
	entityType?: string | null;
	selectedId?: number | null;
};

export type AdminMutationLogSummary = {
	recentMutations: AdminMutationLog[];
	availableActions: string[];
	availableEntityTypes: string[];
	selectedMutation: AdminMutationLog | null;
	filters: {
		action: string;
		entityType: string;
		selectedId: number | null;
	};
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

export async function getAdminMutationLogSummary(
	db: D1Database | null = null,
	filters: AdminMutationLogFilters = {},
	limit = 12
): Promise<AdminMutationLogSummary> {
	const fallback: AdminMutationLogSummary = {
		recentMutations: [],
		availableActions: [],
		availableEntityTypes: [],
		selectedMutation: null,
		filters: {
			action: filters.action?.trim() ?? '',
			entityType: filters.entityType?.trim() ?? '',
			selectedId: filters.selectedId ?? null
		}
	};

	if (!db) return fallback;

	const action = filters.action?.trim() ?? '';
	const entityType = filters.entityType?.trim() ?? '';
	const selectedId = filters.selectedId ?? null;
	const where: string[] = [];
	const params: Array<string | number> = [];

	if (action) {
		where.push(`action = ?${params.length + 1}`);
		params.push(action);
	}
	if (entityType) {
		where.push(`entity_type = ?${params.length + 1}`);
		params.push(entityType);
	}

	const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
	const recentResult = await db
		.prepare(`
			SELECT id, action, entity_type, entity_id, summary, payload_json, actor_label, ip_address, user_agent, created_at
			FROM admin_mutation_logs
			${whereSql}
			ORDER BY datetime(created_at) DESC, id DESC
			LIMIT ?${params.length + 1}
		`)
		.bind(...params, limit)
		.all<AdminMutationLog>();

	const recentMutations = recentResult.results ?? [];
	const [actionsResult, entityTypesResult] = await Promise.all([
		db.prepare(`SELECT DISTINCT action FROM admin_mutation_logs ORDER BY action ASC`).all<{ action: string }>(),
		db.prepare(`SELECT DISTINCT entity_type FROM admin_mutation_logs ORDER BY entity_type ASC`).all<{ entity_type: string }>()
	]);

	let selectedMutation = selectedId
		? (await db
				.prepare(`
					SELECT id, action, entity_type, entity_id, summary, payload_json, actor_label, ip_address, user_agent, created_at
					FROM admin_mutation_logs
					WHERE id = ?1
					LIMIT 1
				`)
				.bind(selectedId)
				.first<AdminMutationLog>()) ?? null
		: null;

	if (!selectedMutation && recentMutations.length > 0) {
		selectedMutation = recentMutations[0];
	}

	return {
		recentMutations,
		availableActions: (actionsResult.results ?? []).map((item) => item.action),
		availableEntityTypes: (entityTypesResult.results ?? []).map((item) => item.entity_type),
		selectedMutation,
		filters: {
			action,
			entityType,
			selectedId
		}
	};
}
