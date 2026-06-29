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
	const idResult = validatePositiveId(body?.id, 'ID post');
	if (!idResult.ok) return json({ ok: false, error: idResult.error }, { status: 400 });
	const targetStatus = String(body?.targetStatus ?? '').trim();
	if (!['seo_review', 'published'].includes(targetStatus)) {
		return json({ ok: false, error: 'Target status tidak valid.' }, { status: 400 });
	}

	const post = await getPostById(idResult.data.id, db);
	if (!post) return json({ ok: false, error: 'Post tidak ditemukan.' }, { status: 404 });

	if (targetStatus === 'seo_review' && !isPostReadyForSeoReview(post)) {
		return json({ ok: false, error: 'Draft belum siap masuk seo_review.' }, { status: 409 });
	}
	if (targetStatus === 'published' && !isPostReadyForPublish({ ...post, status: 'seo_review' })) {
		return json({ ok: false, error: 'Post belum siap dipublish dari seo_review.' }, { status: 409 });
	}

	const duplicate = await guardAgainstDuplicateRequest(event, db, 'api_admin_promote_post', { id: post.id, targetStatus }, 20);
	if (!duplicate.ok) return json({ ok: false, error: duplicate.message }, { status: 409 });

	try {
		const result = await updatePost(post.id, { ...post, status: targetStatus as 'seo_review' | 'published' }, db);
		await writeAdminMutationLog(event, db, {
			action: 'api_promote_post',
			entityType: 'post',
			entityId: post.id,
			summary: `Promote post #${post.id} ke ${targetStatus}`,
			payload: { fromStatus: post.status, targetStatus, slug: post.slug }
		});
		return json({ ok: true, result, fromStatus: post.status, targetStatus });
	} catch (error) {
		return json({ ok: false, error: getOperatorErrorMessage(error, 'Promote post gagal.') }, { status: 400 });
	}
};
