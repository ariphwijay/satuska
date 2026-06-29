import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { requireAdminApiSession } from '$lib/server/admin-api';
import { writeAdminMutationLog } from '$lib/server/audit';
import { getDb } from '$lib/server/db';
import { getOperatorErrorMessage } from '$lib/server/errors';
import { guardAgainstDuplicateRequest } from '$lib/server/idempotency';
import { createPost, listPosts } from '$lib/server/repositories/posts';
import { validatePostPayload } from '$lib/server/validation';

export const GET: RequestHandler = async (event) => {
	const unauthorized = requireAdminApiSession(event);
	if (unauthorized) return unauthorized;

	const db = getDb(event);
	if (!db) return json({ ok: false, error: 'DB belum tersedia di environment ini.' }, { status: 503 });
	const posts = await listPosts(db);
	return json({
		ok: true,
		items: posts,
		total: posts.length,
		workflow: {
			draft: posts.filter((post) => post.status === 'draft').length,
			seoReview: posts.filter((post) => post.status === 'seo_review').length,
			published: posts.filter((post) => post.status === 'published').length
		}
	});
};

export const POST: RequestHandler = async (event) => {
	const unauthorized = requireAdminApiSession(event);
	if (unauthorized) return unauthorized;

	const db = getDb(event);
	if (!db) return json({ ok: false, error: 'DB belum tersedia di environment ini.' }, { status: 503 });
	const body = await event.request.json().catch(() => null);
	const parsed = validatePostPayload(body, 'create');
	if (!parsed.ok) return json({ ok: false, error: parsed.error }, { status: 400 });
	const duplicate = await guardAgainstDuplicateRequest(event, db, 'api_admin_create_post', parsed.data, 20);
	if (!duplicate.ok) return json({ ok: false, error: duplicate.message }, { status: 409 });

	try {
		const result = await createPost(parsed.data, db);
		await writeAdminMutationLog(event, db, {
			action: 'api_create_post',
			entityType: 'post',
			entityId: result.id,
			summary: `API create post ${parsed.data.slug}`,
			payload: { slug: parsed.data.slug, status: parsed.data.status }
		});
		return json({ ok: true, result, message: 'Post berhasil dibuat.' }, { status: 201 });
	} catch (error) {
		return json({ ok: false, error: getOperatorErrorMessage(error, 'Post gagal dibuat.') }, { status: 400 });
	}
};
