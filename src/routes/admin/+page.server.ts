import { fail } from '@sveltejs/kit';
import type { Actions, ServerLoad } from '@sveltejs/kit';
import { categorySeeds } from '$lib/content';
import {
	ADMIN_AUDIT_MAX_ROWS,
	ADMIN_AUDIT_PAGE_SIZE,
	ADMIN_AUDIT_RETENTION_DAYS,
	getAdminAuditAnalyticsSummary,
	getAdminAuditHousekeepingSummary,
	getAdminMutationLogSummary,
	pruneAdminMutationLogs,
	writeAdminMutationLog
} from '$lib/server/audit';
import { getDb } from '$lib/server/db';
import { getOperatorErrorMessage } from '$lib/server/errors';
import {
	getIdempotencyHousekeepingSummary,
	guardAgainstDuplicateRequest,
	IDEMPOTENCY_RETENTION_SECONDS,
	pruneExpiredIdempotencyRows
} from '$lib/server/idempotency';
import { createPost, deletePost, listPosts, updatePost } from '$lib/server/repositories/posts';
import { listSubmissions, updateSubmissionStatus } from '$lib/server/repositories/submissions';
import { validatePostForm, validateSubmissionStatus } from '$lib/server/validation';

function stringValue(formData: FormData, key: string) {
	return String(formData.get(key) ?? '').trim();
}

function positiveNumber(value: string | null) {
	const parsed = Number(value ?? '');
	return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
}

export const load: ServerLoad = async (event) => {
	const db = getDb(event);
	const auditSummaryPromise = getAdminMutationLogSummary(
		db,
		{
			action: event.url.searchParams.get('auditAction'),
			entityType: event.url.searchParams.get('auditEntity'),
			entityId: positiveNumber(event.url.searchParams.get('auditEntityId')),
			query: event.url.searchParams.get('auditQuery'),
			selectedId: positiveNumber(event.url.searchParams.get('auditLog')),
			page: positiveNumber(event.url.searchParams.get('auditPage')) ?? 1
		},
		ADMIN_AUDIT_PAGE_SIZE
	);
	const [posts, submissions, auditSummary, auditAnalytics, auditHousekeeping, idempotencyHousekeeping] = await Promise.all([
		listPosts(db),
		listSubmissions(db),
		auditSummaryPromise,
		getAdminAuditAnalyticsSummary(db),
		getAdminAuditHousekeepingSummary(db),
		getIdempotencyHousekeepingSummary(db)
	]);
	return {
		posts,
		submissions,
		recentMutations: auditSummary.recentMutations,
		auditFilters: auditSummary.filters,
		availableAuditActions: auditSummary.availableActions,
		availableAuditEntityTypes: auditSummary.availableEntityTypes,
		selectedAuditMutation: auditSummary.selectedMutation,
		auditTotalCount: auditSummary.totalCount,
		auditPage: auditSummary.page,
		auditPageSize: auditSummary.pageSize,
		auditTotalPages: auditSummary.totalPages,
		auditRangeStart: auditSummary.rangeStart,
		auditRangeEnd: auditSummary.rangeEnd,
		auditAnalytics,
		auditHousekeeping,
		idempotencyHousekeeping,
		auditRetentionDays: ADMIN_AUDIT_RETENTION_DAYS,
		auditMaxRows: ADMIN_AUDIT_MAX_ROWS,
		idempotencyRetentionSeconds: IDEMPOTENCY_RETENTION_SECONDS,
		categories: categorySeeds,
		hasDb: Boolean(db)
	};
};

export const actions: Actions = {
	createPost: async (event) => {
		const db = getDb(event);
		if (!db) return fail(503, { createError: 'DB belum tersedia di environment ini.' });

		const formData = await event.request.formData();
		const parsed = validatePostForm(formData, 'create');
		if (!parsed.ok) return fail(400, { createError: parsed.error });
		const duplicate = await guardAgainstDuplicateRequest(event, db, 'admin_create_post', parsed.data, 20);
		if (!duplicate.ok) return fail(409, { createError: duplicate.message });

		try {
			const result = await createPost(parsed.data, db);
			await writeAdminMutationLog(event, db, {
				action: 'create_post',
				entityType: 'post',
				entityId: result.id,
				summary: `Create post ${parsed.data.slug}`,
				payload: { slug: parsed.data.slug, status: parsed.data.status, category: parsed.data.category }
			});
		} catch (error) {
			return fail(400, { createError: getOperatorErrorMessage(error, 'Post gagal dibuat.') });
		}

		return { createSuccess: 'Post berhasil dibuat.' };
	},

	updatePost: async (event) => {
		const db = getDb(event);
		if (!db) return fail(503, { updateError: 'DB belum tersedia di environment ini.' });

		const formData = await event.request.formData();
		const parsed = validatePostForm(formData, 'update');
		if (!parsed.ok) return fail(400, { updateError: parsed.error });
		const duplicate = await guardAgainstDuplicateRequest(event, db, 'admin_update_post', parsed.data, 20);
		if (!duplicate.ok) return fail(409, { updateError: duplicate.message });

		try {
			await updatePost(parsed.data.id!, parsed.data, db);
			await writeAdminMutationLog(event, db, {
				action: 'update_post',
				entityType: 'post',
				entityId: parsed.data.id,
				summary: `Update post #${parsed.data.id} ke status ${parsed.data.status}`,
				payload: { slug: parsed.data.slug, status: parsed.data.status, category: parsed.data.category }
			});
		} catch (error) {
			return fail(400, { updateError: getOperatorErrorMessage(error, 'Post gagal diupdate.') });
		}

		return { updateSuccess: `Post #${parsed.data.id} berhasil diupdate.` };
	},

	deletePost: async (event) => {
		const db = getDb(event);
		if (!db) return fail(503, { deleteError: 'DB belum tersedia di environment ini.' });

		const formData = await event.request.formData();
		const id = Number(stringValue(formData, 'id'));
		if (!id) return fail(400, { deleteError: 'ID post tidak valid.' });
		const duplicate = await guardAgainstDuplicateRequest(event, db, 'admin_delete_post', { id }, 20);
		if (!duplicate.ok) return fail(409, { deleteError: duplicate.message });
		await deletePost(id, db);
		await writeAdminMutationLog(event, db, {
			action: 'delete_post',
			entityType: 'post',
			entityId: id,
			summary: `Delete post #${id}`,
			payload: { id }
		});
		return { deleteSuccess: `Post #${id} dihapus.` };
	},

	reviewSubmission: async (event) => {
		const db = getDb(event);
		if (!db) return fail(503, { submissionError: 'DB belum tersedia di environment ini.' });

		const formData = await event.request.formData();
		const parsed = validateSubmissionStatus(formData);
		if (!parsed.ok) return fail(400, { submissionError: parsed.error });
		const duplicate = await guardAgainstDuplicateRequest(event, db, 'admin_review_submission', parsed.data, 20);
		if (!duplicate.ok) return fail(409, { submissionError: duplicate.message });
		await updateSubmissionStatus(parsed.data.id, parsed.data.status, db);
		await writeAdminMutationLog(event, db, {
			action: 'review_submission',
			entityType: 'submission',
			entityId: parsed.data.id,
			summary: `Update submission #${parsed.data.id} ke ${parsed.data.status}`,
			payload: parsed.data
		});
		return { submissionSuccess: `Submission #${parsed.data.id} diubah ke ${parsed.data.status}.` };
	},

	pruneHousekeeping: async (event) => {
		const db = getDb(event);
		if (!db) return fail(503, { housekeepingError: 'DB belum tersedia di environment ini.' });

		const deletedIdempotencyRows = await pruneExpiredIdempotencyRows(db);
		const deletedAuditRows = await pruneAdminMutationLogs(db);

		return {
			housekeepingSuccess: `Prune selesai. Idempotency dibersihkan ${deletedIdempotencyRows} row, audit dibersihkan ${deletedAuditRows} row.`
		};
	}
};
