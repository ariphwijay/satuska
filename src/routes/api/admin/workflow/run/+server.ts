import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { requireAdminApiSession } from '$lib/server/admin-api';
import { writeAdminMutationLog } from '$lib/server/audit';
import { getDb } from '$lib/server/db';
import { getOperatorErrorMessage } from '$lib/server/errors';
import { guardAgainstDuplicateRequest } from '$lib/server/idempotency';
import {
	getPostById,
	isPostReadyForPublish,
	isPostReadyForSeoReview,
	updatePost
} from '$lib/server/repositories/posts';
import { validatePositiveId } from '$lib/server/validation';

export const POST: RequestHandler = async (event) => {
	const unauthorized = requireAdminApiSession(event);
	if (unauthorized) return unauthorized;

	const db = getDb(event);
	if (!db) return json({ ok: false, error: 'DB belum tersedia di environment ini.' }, { status: 503 });

	const body = await event.request.json().catch(() => null);
	const items = Array.isArray(body?.items) ? body.items : null;
	if (!items || items.length === 0) {
		return json({ ok: false, error: 'Items workflow wajib berupa array dan tidak boleh kosong.' }, { status: 400 });
	}
	if (items.length > 20) {
		return json({ ok: false, error: 'Batch workflow maksimal 20 item per request.' }, { status: 400 });
	}

	const duplicate = await guardAgainstDuplicateRequest(event, db, 'api_admin_workflow_batch', items, 20);
	if (!duplicate.ok) return json({ ok: false, error: duplicate.message }, { status: 409 });

	const results: Array<Record<string, unknown>> = [];

	for (const item of items) {
		const idResult = validatePositiveId(item?.id, 'ID post');
		const targetStatus = String(item?.targetStatus ?? '').trim();
		if (!idResult.ok || !['seo_review', 'published'].includes(targetStatus)) {
			results.push({ ok: false, id: item?.id ?? null, targetStatus, error: idResult.ok ? 'Target status tidak valid.' : idResult.error });
			continue;
		}

		const post = await getPostById(idResult.data.id, db);
		if (!post) {
			results.push({ ok: false, id: idResult.data.id, targetStatus, error: 'Post tidak ditemukan.' });
			continue;
		}

		if (targetStatus === 'seo_review' && !isPostReadyForSeoReview(post)) {
			results.push({ ok: false, id: post.id, targetStatus, error: 'Draft belum siap masuk seo_review.' });
			continue;
		}
		if (targetStatus === 'published' && !isPostReadyForPublish({ ...post, status: 'seo_review' })) {
			results.push({ ok: false, id: post.id, targetStatus, error: 'Post belum siap dipublish dari seo_review.' });
			continue;
		}

		try {
			await updatePost(post.id, { ...post, status: targetStatus as 'seo_review' | 'published' }, db);
			await writeAdminMutationLog(event, db, {
				action: 'api_batch_promote_post',
				entityType: 'post',
				entityId: post.id,
				summary: `Batch promote post #${post.id} ke ${targetStatus}`,
				payload: { fromStatus: post.status, targetStatus, slug: post.slug }
			});
			results.push({ ok: true, id: post.id, slug: post.slug, fromStatus: post.status, targetStatus });
		} catch (error) {
			results.push({ ok: false, id: post.id, targetStatus, error: getOperatorErrorMessage(error, 'Promote post gagal.') });
		}
	}

	const successCount = results.filter((item) => item.ok === true).length;
	const failureCount = results.length - successCount;

	return json({
		ok: successCount > 0,
		successCount,
		failureCount,
		results
	});
};
