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

function normalizeIsoish(value: string | null | undefined) {
	if (!value) return null;
	const normalized = value.includes('T') ? value : value.replace(' ', 'T');
	const timestamp = Date.parse(normalized);
	return Number.isNaN(timestamp) ? null : timestamp;
}

function formatCompactDate(value: string | null | undefined) {
	const timestamp = normalizeIsoish(value);
	if (!timestamp) return 'Belum ada';
	return new Date(timestamp).toISOString().slice(0, 16).replace('T', ' ');
}

function hoursSince(value: string | null | undefined) {
	const timestamp = normalizeIsoish(value);
	if (!timestamp) return null;
	return Math.floor((Date.now() - timestamp) / (1000 * 60 * 60));
}

function buildDistributionSummary(posts: Awaited<ReturnType<typeof listPosts>>, submissions: Awaited<ReturnType<typeof listSubmissions>>) {
	const statusCounts = {
		draft: posts.filter((post) => post.status === 'draft').length,
		seoReview: posts.filter((post) => post.status === 'seo_review').length,
		published: posts.filter((post) => post.status === 'published').length,
		featured: posts.filter((post) => post.featured).length
	};

	const lastPublishedPost = posts
		.filter((post) => post.status === 'published' && post.published_at)
		.sort((a, b) => (normalizeIsoish(b.published_at) ?? 0) - (normalizeIsoish(a.published_at) ?? 0))[0] ?? null;

	const lastTouchedPost = posts
		.slice()
		.sort((a, b) => (normalizeIsoish(b.updated_at) ?? 0) - (normalizeIsoish(a.updated_at) ?? 0))[0] ?? null;

	const submissionCounts = {
		received: submissions.filter((item) => item.status === 'received').length,
		reviewing: submissions.filter((item) => item.status === 'reviewing').length,
		accepted: submissions.filter((item) => item.status === 'accepted').length,
		rejected: submissions.filter((item) => item.status === 'rejected').length
	};

	const openSubmissionCount = submissionCounts.received + submissionCounts.reviewing;
	const latestSubmission = submissions
		.slice()
		.sort((a, b) => (normalizeIsoish(b.updated_at ?? b.created_at) ?? 0) - (normalizeIsoish(a.updated_at ?? a.created_at) ?? 0))[0] ?? null;

	const dominantCategory = Object.entries(
		posts.reduce<Record<string, number>>((acc, post) => {
			const key = post.category?.trim() || 'Uncategorized';
			acc[key] = (acc[key] ?? 0) + 1;
			return acc;
		}, {})
	)
		.sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0] ?? null;

	return {
		statusCounts,
		submissionCounts,
		openSubmissionCount,
		lastPublishedPost: lastPublishedPost
			? {
				title: lastPublishedPost.title,
				slug: lastPublishedPost.slug,
				publishedAt: formatCompactDate(lastPublishedPost.published_at)
			}
			: null,
		lastTouchedPost: lastTouchedPost
			? {
				title: lastTouchedPost.title,
				slug: lastTouchedPost.slug,
				updatedAt: formatCompactDate(lastTouchedPost.updated_at)
			}
			: null,
		latestSubmission: latestSubmission
			? {
				name: latestSubmission.name,
				topic: latestSubmission.topic || latestSubmission.submission_type,
				status: latestSubmission.status,
				updatedAt: formatCompactDate(latestSubmission.updated_at ?? latestSubmission.created_at)
			}
			: null,
		dominantCategory: dominantCategory ? { name: dominantCategory[0], count: dominantCategory[1] } : null,
		publishReadinessLabel:
			statusCounts.seoReview > 0
				? 'Needs review'
				: statusCounts.draft > statusCounts.published
					? 'Building queue'
					: 'Stable'
	};
}

type AdminWarning = {
	severity: 'critical' | 'warn' | 'info';
	title: string;
	detail: string;
	score: number;
	ctaLabel: string;
	ctaHref: string;
};

function buildAdminWarnings(
	distributionSummary: ReturnType<typeof buildDistributionSummary>,
	auditAnalytics: Awaited<ReturnType<typeof getAdminAuditAnalyticsSummary>>
) {
	const warnings: AdminWarning[] = [];

	if (distributionSummary.statusCounts.seoReview >= 5) {
		warnings.push({
			severity: 'critical',
			title: 'SEO review macet',
			detail: `${distributionSummary.statusCounts.seoReview} post tertahan di seo_review.`,
			score: 95,
			ctaLabel: 'Lihat post review',
			ctaHref: '#edit-posts'
		});
	} else if (distributionSummary.statusCounts.seoReview >= 3) {
		warnings.push({
			severity: 'warn',
			title: 'SEO review menumpuk',
			detail: `${distributionSummary.statusCounts.seoReview} post masih di seo_review.`,
			score: 72,
			ctaLabel: 'Review post',
			ctaHref: '#edit-posts'
		});
	}

	if (distributionSummary.openSubmissionCount >= 6) {
		warnings.push({
			severity: 'critical',
			title: 'Submission open sangat tinggi',
			detail: `${distributionSummary.openSubmissionCount} submission belum ditutup atau diproses.`,
			score: 90,
			ctaLabel: 'Buka submission',
			ctaHref: '#submission-review'
		});
	} else if (distributionSummary.openSubmissionCount >= 4) {
		warnings.push({
			severity: 'warn',
			title: 'Submission open tinggi',
			detail: `${distributionSummary.openSubmissionCount} submission masih butuh tindak lanjut.`,
			score: 68,
			ctaLabel: 'Triage submission',
			ctaHref: '#submission-review'
		});
	}

	const publishGapHours = hoursSince(distributionSummary.lastPublishedPost?.publishedAt);
	if (distributionSummary.statusCounts.published > 0 && publishGapHours !== null && publishGapHours >= 168) {
		warnings.push({
			severity: 'warn',
			title: 'Publish terlalu lama idle',
			detail: `Post terakhir live sekitar ${publishGapHours} jam lalu.`,
			score: 64,
			ctaLabel: 'Cek publish queue',
			ctaHref: '#distribution-snapshot'
		});
	} else if (distributionSummary.statusCounts.published > 0 && publishGapHours !== null && publishGapHours >= 72) {
		warnings.push({
			severity: 'info',
			title: 'Publish melambat',
			detail: `Post terakhir live sekitar ${publishGapHours} jam lalu.`,
			score: 38,
			ctaLabel: 'Cek snapshot',
			ctaHref: '#distribution-snapshot'
		});
	}

	if (distributionSummary.statusCounts.draft >= 8 && distributionSummary.statusCounts.published === 0) {
		warnings.push({
			severity: 'critical',
			title: 'Queue draft tersumbat',
			detail: `${distributionSummary.statusCounts.draft} draft aktif tapi belum ada post published.`,
			score: 88,
			ctaLabel: 'Buka draft queue',
			ctaHref: '#edit-posts'
		});
	} else if (distributionSummary.statusCounts.draft >= 5 && distributionSummary.statusCounts.published === 0) {
		warnings.push({
			severity: 'warn',
			title: 'Queue draft belum tembus publish',
			detail: `${distributionSummary.statusCounts.draft} draft aktif tapi belum ada post published.`,
			score: 66,
			ctaLabel: 'Lihat draft',
			ctaHref: '#edit-posts'
		});
	}

	if (auditAnalytics.last24HoursCount >= 14) {
		warnings.push({
			severity: 'warn',
			title: 'Mutation admin sangat padat',
			detail: `${auditAnalytics.last24HoursCount} mutation tercatat dalam 24 jam terakhir.`,
			score: 62,
			ctaLabel: 'Audit log',
			ctaHref: '#audit-trail'
		});
	} else if (auditAnalytics.recentWindowLabel === 'busy' && auditAnalytics.last24HoursCount >= 8) {
		warnings.push({
			severity: 'info',
			title: 'Mutation admin sedang padat',
			detail: `${auditAnalytics.last24HoursCount} mutation tercatat dalam 24 jam terakhir.`,
			score: 34,
			ctaLabel: 'Buka audit',
			ctaHref: '#audit-trail'
		});
	}

	if (warnings.length === 0) {
		warnings.push({
			severity: 'info',
			title: 'Panel sehat',
			detail: 'Belum ada anomali utama yang perlu perhatian cepat.',
			score: 0,
			ctaLabel: 'Lihat snapshot',
			ctaHref: '#distribution-snapshot'
		});
	}

	return warnings.sort((a, b) => b.score - a.score).slice(0, 4);
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
	const distributionSummary = buildDistributionSummary(posts, submissions);
	const adminWarnings = buildAdminWarnings(distributionSummary, auditAnalytics);
	return {
		posts,
		submissions,
		distributionSummary,
		adminWarnings,
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
