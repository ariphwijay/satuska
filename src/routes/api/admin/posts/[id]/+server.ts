import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { writeAdminMutationLog } from '$lib/server/audit';
import { getDb } from '$lib/server/db';
import { getOperatorErrorMessage } from '$lib/server/errors';
import { guardAgainstDuplicateRequest } from '$lib/server/idempotency';
import { deletePost, updatePost } from '$lib/server/repositories/posts';
import { validatePositiveId, validatePostPayload } from '$lib/server/validation';

export const PUT: RequestHandler = async (event) => {
	const db = getDb(event);
	if (!db) return json({ ok: false, error: 'DB belum tersedia di environment ini.' }, { status: 503 });
	const idResult = validatePositiveId(event.params.id, 'ID post');
	if (!idResult.ok) return json({ ok: false, error: idResult.error }, { status: 400 });
	const body = await event.request.json().catch(() => null);
	const parsed = validatePostPayload(body, 'update', idResult.data.id);
	if (!parsed.ok) return json({ ok: false, error: parsed.error }, { status: 400 });
	const duplicate = await guardAgainstDuplicateRequest(event, db, 'api_admin_update_post', parsed.data, 20);
	if (!duplicate.ok) return json({ ok: false, error: duplicate.message }, { status: 409 });

	try {
		const result = await updatePost(idResult.data.id, parsed.data, db);
		await writeAdminMutationLog(event, db, {
			action: 'api_update_post',
			entityType: 'post',
			entityId: idResult.data.id,
			summary: `API update post #${idResult.data.id}`,
			payload: { slug: parsed.data.slug, status: parsed.data.status }
		});
		return json({ ok: true, result });
	} catch (error) {
		return json({ ok: false, error: getOperatorErrorMessage(error, 'Post gagal diupdate.') }, { status: 400 });
	}
};

export const DELETE: RequestHandler = async (event) => {
	const db = getDb(event);
	if (!db) return json({ ok: false, error: 'DB belum tersedia di environment ini.' }, { status: 503 });
	const idResult = validatePositiveId(event.params.id, 'ID post');
	if (!idResult.ok) return json({ ok: false, error: idResult.error }, { status: 400 });
	const duplicate = await guardAgainstDuplicateRequest(event, db, 'api_admin_delete_post', { id: idResult.data.id }, 20);
	if (!duplicate.ok) return json({ ok: false, error: duplicate.message }, { status: 409 });
	const result = await deletePost(idResult.data.id, db);
	await writeAdminMutationLog(event, db, {
		action: 'api_delete_post',
		entityType: 'post',
		entityId: idResult.data.id,
		summary: `API delete post #${idResult.data.id}`,
		payload: { id: idResult.data.id }
	});
	return json({ ok: true, result });
};
