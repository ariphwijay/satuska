import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { getDb } from '$lib/server/db';
import { createPost, listPosts } from '$lib/server/repositories/posts';

export const GET: RequestHandler = async (event) => {
	const posts = await listPosts(getDb(event));
	return json(posts);
};

export const POST: RequestHandler = async (event) => {
	const body = await event.request.json().catch(() => null);
	if (!body?.title || !body?.slug || !body?.content) {
		return json({ ok: false, error: 'title, slug, and content are required' }, { status: 400 });
	}

	const result = await createPost(
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

	return json({ ok: true, result }, { status: 201 });
};
