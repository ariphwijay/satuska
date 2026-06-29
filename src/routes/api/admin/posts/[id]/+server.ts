import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { deletePost, updatePost } from '$lib/server/repositories/posts';

export const PUT: RequestHandler = async (event) => {
	const id = Number(event.params.id);
	const body = await event.request.json().catch(() => null);
	if (!id || !body?.title || !body?.slug || !body?.content) {
		return json({ ok: false, error: 'valid id, title, slug, and content are required' }, { status: 400 });
	}

	const result = await updatePost(
		id,
		{
			title: body.title,
			slug: body.slug,
			excerpt: body.excerpt ?? '',
			content: body.content,
			category: body.category ?? 'General',
			status: body.status ?? 'draft',
			seo_title: body.seo_title,
			seo_description: body.seo_description,
			tags: Array.isArray(body.tags)
				? body.tags
				: String(body.tags ?? '')
						.split(',')
						.map((tag) => tag.trim())
						.filter(Boolean),
			read_time: body.read_time,
			intent: body.intent ?? 'informational',
			monetization: body.monetization ?? 'editorial',
			featured: Boolean(body.featured)
		},
		getDb(event)
	);

	return json({ ok: true, result });
};

export const DELETE: RequestHandler = async (event) => {
	const id = Number(event.params.id);
	if (!id) return json({ ok: false, error: 'valid id is required' }, { status: 400 });
	const result = await deletePost(id, getDb(event));
	return json({ ok: true, result });
};
