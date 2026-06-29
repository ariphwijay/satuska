import type { RequestEvent } from '@sveltejs/kit';
import type { D1Database } from '$lib/server/db';

export const ADMIN_AUDIT_RETENTION_DAYS = 30;
export const ADMIN_AUDIT_MAX_ROWS = 250;
export const ADMIN_AUDIT_PAGE_SIZE = 6;

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
	entityId?: number | null;
	query?: string | null;
	selectedId?: number | null;
	page?: number | null;
};

export type AdminMutationLogSummary = {
	recentMutations: AdminMutationLog[];
	availableActions: string[];
	availableEntityTypes: string[];
	selectedMutation: AdminMutationLog | null;
	totalCount: number;
	page: number;
	pageSize: number;
	totalPages: number;
	rangeStart: number;
	rangeEnd: number;
	filters: {
		action: string;
		entityType: string;
		entityId: number | null;
		query: string;
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

export type AdminAuditAnalyticsSummary = {
	totalRows: number;
	last24HoursCount: number;
	last7DaysCount: number;
	averagePerDayLast7Days: number;
	hotAction: { label: string; count: number } | null;
	hotEntityType: { label: string; count: number } | null;
	latestCreatedAt: string | null;
	recentWindowLabel: 'quiet' | 'active' | 'busy';
};

function requestMeta(event: RequestEvent) {
	return {
		ip: event.request.headers.get('cf-connecting-ip') ?? event.getClientAddress?.() ?? 'unknown',
		userAgent: event.request.headers.get('user-agent') ?? 'unknown'
	};
}

function normalizePositiveNumber(value: number | null | undefined, fallback = 1) {
	if (!value || !Number.isFinite(value) || value < 1) return fallback;
	return Math.floor(value);
}

function buildAuditWhereClause(filters: {
	action: string;
	entityType: string;
	entityId: number | null;
	query: string;
}) {
	const where: string[] = [];
	const params: Array<string | number> = [];

	if (filters.action) {
		where.push(`action = ?${params.length + 1}`);
		params.push(filters.action);
	}
	if (filters.entityType) {
		where.push(`entity_type = ?${params.length + 1}`);
		params.push(filters.entityType);
	}
	if (filters.entityId) {
		where.push(`entity_id = ?${params.length + 1}`);
		params.push(filters.entityId);
	}
	if (filters.query) {
		where.push(`(LOWER(summary) LIKE ?${params.length + 1} OR LOWER(COALESCE(payload_json, '')) LIKE ?${params.length + 2})`);
		const likeValue = `%${filters.query.toLowerCase()}%`;
		params.push(likeValue, likeValue);
	}

	return {
		whereSql: where.length ? `WHERE ${where.join(' AND ')}` : '',
		params
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

export async function getAdminAuditAnalyticsSummary(
	db: D1Database | null = null
): Promise<AdminAuditAnalyticsSummary> {
	if (!db) {
		return {
			totalRows: 0,
			last24HoursCount: 0,
			last7DaysCount: 0,
			averagePerDayLast7Days: 0,
			hotAction: null,
			hotEntityType: null,
			latestCreatedAt: null,
			recentWindowLabel: 'quiet'
		};
	}

	const [
		totalResult,
		last24HoursResult,
		last7DaysResult,
		hotActionResult,
		hotEntityResult,
		latestResult
	] = await Promise.all([
		db.prepare(`SELECT COUNT(*) AS count FROM admin_mutation_logs`).first<{ count: number }>(),
		db
			.prepare(`SELECT COUNT(*) AS count FROM admin_mutation_logs WHERE created_at >= datetime('now', '-1 day')`)
			.first<{ count: number }>(),
		db
			.prepare(`SELECT COUNT(*) AS count FROM admin_mutation_logs WHERE created_at >= datetime('now', '-7 days')`)
			.first<{ count: number }>(),
		db
			.prepare(`
				SELECT action, COUNT(*) AS count
				FROM admin_mutation_logs
				WHERE created_at >= datetime('now', '-7 days')
				GROUP BY action
				ORDER BY count DESC, action ASC
				LIMIT 1
			`)
			.first<{ action: string; count: number }>(),
		db
			.prepare(`
				SELECT entity_type, COUNT(*) AS count
				FROM admin_mutation_logs
				WHERE created_at >= datetime('now', '-7 days')
				GROUP BY entity_type
				ORDER BY count DESC, entity_type ASC
				LIMIT 1
			`)
			.first<{ entity_type: string; count: number }>(),
		db
			.prepare(`SELECT created_at FROM admin_mutation_logs ORDER BY datetime(created_at) DESC, id DESC LIMIT 1`)
			.first<{ created_at: string }>()
	]);

	const totalRows = Number(totalResult?.count ?? 0);
	const last24HoursCount = Number(last24HoursResult?.count ?? 0);
	const last7DaysCount = Number(last7DaysResult?.count ?? 0);
	const averagePerDayLast7Days = Number((last7DaysCount / 7).toFixed(1));
	const recentWindowLabel = last24HoursCount >= 8 ? 'busy' : last24HoursCount >= 3 ? 'active' : 'quiet';

	return {
		totalRows,
		last24HoursCount,
		last7DaysCount,
		averagePerDayLast7Days,
		hotAction: hotActionResult ? { label: hotActionResult.action, count: Number(hotActionResult.count ?? 0) } : null,
		hotEntityType: hotEntityResult ? { label: hotEntityResult.entity_type, count: Number(hotEntityResult.count ?? 0) } : null,
		latestCreatedAt: latestResult?.created_at ?? null,
		recentWindowLabel
	};
}

export async function getAdminMutationLogSummary(
	db: D1Database | null = null,
	filters: AdminMutationLogFilters = {},
	pageSize = ADMIN_AUDIT_PAGE_SIZE
): Promise<AdminMutationLogSummary> {
	const fallback: AdminMutationLogSummary = {
		recentMutations: [],
		availableActions: [],
		availableEntityTypes: [],
		selectedMutation: null,
		totalCount: 0,
		page: 1,
		pageSize,
		totalPages: 1,
		rangeStart: 0,
		rangeEnd: 0,
		filters: {
			action: filters.action?.trim() ?? '',
			entityType: filters.entityType?.trim() ?? '',
			entityId: filters.entityId ?? null,
			query: filters.query?.trim() ?? '',
			selectedId: filters.selectedId ?? null
		}
	};

	if (!db) return fallback;

	const normalizedFilters = {
		action: filters.action?.trim() ?? '',
			entityType: filters.entityType?.trim() ?? '',
			entityId: filters.entityId ?? null,
			query: filters.query?.trim() ?? ''
	};
	const selectedId = filters.selectedId ?? null;
	const requestedPage = normalizePositiveNumber(filters.page ?? 1, 1);
	const { whereSql, params } = buildAuditWhereClause(normalizedFilters);
	const totalResult = await db
		.prepare(`SELECT COUNT(*) AS count FROM admin_mutation_logs ${whereSql}`)
		.bind(...params)
		.first<{ count: number }>();
	const totalCount = Number(totalResult?.count ?? 0);
	const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
	const page = Math.min(requestedPage, totalPages);
	const offset = (page - 1) * pageSize;

	const recentResult = await db
		.prepare(`
			SELECT id, action, entity_type, entity_id, summary, payload_json, actor_label, ip_address, user_agent, created_at
			FROM admin_mutation_logs
			${whereSql}
			ORDER BY datetime(created_at) DESC, id DESC
			LIMIT ?${params.length + 1}
			OFFSET ?${params.length + 2}
		`)
		.bind(...params, pageSize, offset)
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

	const rangeStart = totalCount === 0 ? 0 : offset + 1;
	const rangeEnd = totalCount === 0 ? 0 : Math.min(offset + recentMutations.length, totalCount);

	return {
		recentMutations,
		availableActions: (actionsResult.results ?? []).map((item) => item.action),
		availableEntityTypes: (entityTypesResult.results ?? []).map((item) => item.entity_type),
		selectedMutation,
		totalCount,
		page,
		pageSize,
		totalPages,
		rangeStart,
		rangeEnd,
		filters: {
			...normalizedFilters,
			selectedId
		}
	};
}
