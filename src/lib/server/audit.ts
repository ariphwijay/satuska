import type { RequestEvent } from '@sveltejs/kit';
import type { D1Database } from '$lib/server/db';

export const ADMIN_AUDIT_RETENTION_DAYS = 30;
export const ADMIN_AUDIT_MAX_ROWS = 250;

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

export type AdminAuditHousekeepingSummary = {
	totalRows: number;
	oldRows: number;
	rowsBeyondCap: number;
	retentionDays: number;
	maxRows: number;
};

function requestMeta(event: RequestEvent) {
	return {
		ip: event.request.headers.get('cf-connecting-ip') ?? event.getClientAddress?.() ?? 'unknown',
		userAgent: event.request.headers.get('user-agent') ?? 'unknown'
	};
}

export async function pruneAdminMutationLogs(
	db: D1Database,
	retentionDays = ADMIN_AUDIT_RETENTION_DAYS,
	maxRows = ADMIN_AUDIT_MAX_ROWS
) {
	const result = await db
		.prepare(`
			DELETE FROM admin_mutation_logs
			WHERE id IN (
				SELECT id
				FROM admin_mutation_logs
				WHERE created_at < datetime('now', ?1)
				AND id NOT IN (
					SELECT id
					FROM admin_mutation_logs
					ORDER BY datetime(created_at) DESC, id DESC
					LIMIT ?2
				)
			)
		`)
		.bind(`-${retentionDays} days`, maxRows)
		.run();
	return Number(result.meta?.changes ?? 0);
}

export async function getAdminAuditHousekeepingSummary(
	db: D1Database | null = null,
	retentionDays = ADMIN_AUDIT_RETENTION_DAYS,
	maxRows = ADMIN_AUDIT_MAX_ROWS
): Promise<AdminAuditHousekeepingSummary> {
	if (!db) {
		return {
			totalRows: 0,
			oldRows: 0,
			rowsBeyondCap: 0,
			retentionDays,
			maxRows
		};
	}

	const [totalResult, oldResult, rowsBeyondCapResult] = await Promise.all([
		db.prepare(`SELECT COUNT(*) AS count FROM admin_mutation_logs`).first<{ count: number }>(),
		db
			.prepare(`SELECT COUNT(*) AS count FROM admin_mutation_logs WHERE created_at < datetime('now', ?1)`)
			.bind(`-${retentionDays} days`)
			.first<{ count: number }>(),
		db
			.prepare(`
				SELECT CASE WHEN COUNT(*) > ?1 THEN COUNT(*) - ?1 ELSE 0 END AS count
				FROM admin_mutation_logs
			`)
			.bind(maxRows)
			.first<{ count: number }>()
	]);

	return {
		totalRows: Number(totalResult?.count ?? 0),
		oldRows: Number(oldResult?.count ?? 0),
		rowsBeyondCap: Number(rowsBeyondCapResult?.count ?? 0),
		retentionDays,
		maxRows
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
	await pruneAdminMutationLogs(db);
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
