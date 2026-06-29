import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { requireAdminApiSession } from '$lib/server/admin-api';
import { getDb } from '$lib/server/db';
import {
	getPublishReadinessSummary,
	isPostReadyForSeoReview,
	listPosts
} from '$lib/server/repositories/posts';

export const GET: RequestHandler = async (event) => {
	const unauthorized = requireAdminApiSession(event);
	if (unauthorized) return unauthorized;

	const db = getDb(event);
	if (!db) return json({ ok: false, error: 'DB belum tersedia di environment ini.' }, { status: 503 });

	const posts = await listPosts(db);
	const draftPosts = posts.filter((post) => post.status === 'draft');
	const seoReviewPosts = posts.filter((post) => post.status === 'seo_review');
	const publishReadiness = getPublishReadinessSummary(posts);

	return json({
		ok: true,
		workflow: {
			draft: {
				total: draftPosts.length,
				readyForSeoReview: draftPosts.filter((post) => isPostReadyForSeoReview(post)).map((post) => ({ id: post.id, title: post.title, slug: post.slug })),
				blocked: draftPosts.filter((post) => !isPostReadyForSeoReview(post)).map((post) => ({ id: post.id, title: post.title, slug: post.slug }))
			},
			seoReview: {
				total: seoReviewPosts.length,
				readyForPublish: posts.filter((post) => publishReadiness.readyPostIds.includes(post.id)).map((post) => ({ id: post.id, title: post.title, slug: post.slug })),
				blocked: posts.filter((post) => publishReadiness.blockedPostIds.includes(post.id)).map((post) => ({ id: post.id, title: post.title, slug: post.slug }))
			},
			published: {
				total: posts.filter((post) => post.status === 'published').length
			}
		}
	});
};
