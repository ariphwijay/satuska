import type { D1Database } from '$lib/server/db';
import { postBySlug, posts, publishedPosts, type Post, type PostStatus } from '$lib/content';

export type PostRow = {
	id: number;
	title: string;
	slug: string;
	excerpt: string | null;
	content: string | null;
	category: string | null;
	status: string | null;
	featured_image: string | null;
	seo_title: string | null;
	seo_description: string | null;
	tags: string | null;
	read_time: string | null;
	published_at: string | null;
	updated_at: string | null;
	intent: string | null;
	monetization: string | null;
	featured: number | null;
};

export type PostInput = {
	title: string;
	slug: string;
	excerpt: string;
	content: string;
	category: string;
	status: PostStatus;
	seo_title?: string;
	seo_description?: string;
	tags?: string[];
	read_time?: string;
	intent?: Post['intent'];
	monetization?: Post['monetization'];
	featured?: boolean;
};

function normalizeStatus(status: string | null | undefined): PostStatus {
	if (status === 'draft' || status === 'seo_review' || status === 'published') return status;
	return 'draft';
}

function mapRow(row: PostRow): Post {
	return {
		id: row.id,
		title: row.title,
		slug: row.slug,
		excerpt: row.excerpt ?? '',
		content: row.content ?? '',
		category: row.category ?? 'General',
		status: normalizeStatus(row.status),
		featured_image: row.featured_image ?? undefined,
		seo_title: row.seo_title ?? undefined,
		seo_description: row.seo_description ?? undefined,
		tags: (row.tags ?? '').split(',').map((tag) => tag.trim()).filter(Boolean),
		read_time: row.read_time ?? '5 min read',
		published_at: row.published_at ?? new Date().toISOString().slice(0, 10),
		updated_at: row.updated_at ?? new Date().toISOString().slice(0, 10),
		intent: row.intent === 'commercial' ? 'commercial' : 'informational',
		monetization:
			row.monetization === 'affiliate'
				? 'affiliate'
				: row.monetization === 'guest_post'
					? 'guest_post'
					: 'editorial',
		featured: Boolean(row.featured)
	};
}

function nowDate() {
	return new Date().toISOString().slice(0, 10);
}

export async function listPosts(db: D1Database | null = null) {
	if (!db) return posts;

	const result = await db
		.prepare(`
			SELECT id, title, slug, excerpt, content, category, status, featured_image, seo_title,
			       seo_description, tags, read_time, published_at, updated_at, intent, monetization, featured
			FROM posts
			ORDER BY updated_at DESC, id DESC
		`)
		.all<PostRow>();

	return (result.results ?? []).map(mapRow);
}

export async function listPublishedPosts(db: D1Database | null = null) {
	if (!db) return publishedPosts();
	return (await listPosts(db)).filter((post) => post.status === 'published');
}

export async function getPostBySlug(slug: string, db: D1Database | null = null) {
	if (!db) return postBySlug(slug) ?? null;

	const row = await db
		.prepare(`
			SELECT id, title, slug, excerpt, content, category, status, featured_image, seo_title,
			       seo_description, tags, read_time, published_at, updated_at, intent, monetization, featured
			FROM posts
			WHERE slug = ?1
			LIMIT 1
		`)
		.bind(slug)
		.first<PostRow>();

	return row ? mapRow(row) : null;
}

export async function getPublishedPostBySlug(slug: string, db: D1Database | null = null) {
	const post = await getPostBySlug(slug, db);
	return post?.status === 'published' ? post : null;
}

export async function createPost(input: PostInput, db: D1Database | null = null) {
	if (!db) {
		return {
			id: Date.now(),
			stored: false,
			...input,
			published_at: input.status === 'published' ? nowDate() : '',
			updated_at: nowDate(),
			read_time: input.read_time ?? '5 min read',
			tags: input.tags ?? []
		};
	}

	const publishedAt = input.status === 'published' ? nowDate() : null;
	const result = await db
		.prepare(`
			INSERT INTO posts (
				title, slug, excerpt, content, category, status, seo_title, seo_description,
				tags, read_time, published_at, updated_at, intent, monetization, featured
			) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11, datetime('now'), ?12, ?13, ?14)
		`)
		.bind(
			input.title,
			input.slug,
			input.excerpt,
			input.content,
			input.category,
			input.status,
			input.seo_title ?? null,
			input.seo_description ?? null,
			(input.tags ?? []).join(','),
			input.read_time ?? '5 min read',
			publishedAt,
			input.intent ?? 'informational',
			input.monetization ?? 'editorial',
			input.featured ? 1 : 0
		)
		.run();

	const id = Number(result.meta?.last_row_id ?? 0);
	return { id, stored: true };
}

export async function updatePost(id: number, input: PostInput, db: D1Database | null = null) {
	if (!db) return { id, stored: false };

	await db
		.prepare(`
			UPDATE posts
			SET title = ?1,
			    slug = ?2,
			    excerpt = ?3,
			    content = ?4,
			    category = ?5,
			    status = ?6,
			    seo_title = ?7,
			    seo_description = ?8,
			    tags = ?9,
			    read_time = ?10,
			    published_at = CASE
			      WHEN ?11 = 'published' AND published_at IS NULL THEN ?12
			      WHEN ?11 != 'published' THEN NULL
			      ELSE published_at
			    END,
			    updated_at = datetime('now'),
			    intent = ?13,
			    monetization = ?14,
			    featured = ?15
			WHERE id = ?16
		`)
		.bind(
			input.title,
			input.slug,
			input.excerpt,
			input.content,
			input.category,
			input.status,
			input.seo_title ?? null,
			input.seo_description ?? null,
			(input.tags ?? []).join(','),
			input.read_time ?? '5 min read',
			input.status,
			nowDate(),
			input.intent ?? 'informational',
			input.monetization ?? 'editorial',
			input.featured ? 1 : 0,
			id
		)
		.run();

	return { id, stored: true };
}

export async function deletePost(id: number, db: D1Database | null = null) {
	if (!db) return { id, stored: false };
	await db.prepare(`DELETE FROM posts WHERE id = ?1`).bind(id).run();
	return { id, stored: true };
}

export function listSeedPosts() {
	return posts;
}
