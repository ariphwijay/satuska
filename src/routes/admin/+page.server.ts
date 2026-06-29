import { fail } from '@sveltejs/kit';
import type { Actions, ServerLoad } from '@sveltejs/kit';
import { categorySeeds } from '$lib/content';
import { getDb } from '$lib/server/db';
import { createPost, deletePost, listPosts, updatePost } from '$lib/server/repositories/posts';
import { listSubmissions, updateSubmissionStatus } from '$lib/server/repositories/submissions';

function stringValue(formData: FormData, key: string) {
	return String(formData.get(key) ?? '').trim();
}

function tagsValue(formData: FormData, key: string) {
	return stringValue(formData, key)
		.split(',')
		.map((tag) => tag.trim())
		.filter(Boolean);
}

export const load: ServerLoad = async (event) => {
	const db = getDb(event);
	const [posts, submissions] = await Promise.all([listPosts(db), listSubmissions(db)]);
	return {
		posts,
		submissions,
		categories: categorySeeds,
		hasDb: Boolean(db)
	};
};

export const actions: Actions = {
	createPost: async (event) => {
		const db = getDb(event);
		if (!db) return fail(503, { createError: 'DB belum tersedia di environment ini.' });

		const formData = await event.request.formData();
		const title = stringValue(formData, 'title');
		const slug = stringValue(formData, 'slug');
		const content = stringValue(formData, 'content');
		if (!title || !slug || !content) {
			return fail(400, { createError: 'Judul, slug, dan konten wajib diisi.' });
		}

		await createPost(
			{
				title,
				slug,
				excerpt: stringValue(formData, 'excerpt'),
				content,
				category: stringValue(formData, 'category') || 'General',
				status: (stringValue(formData, 'status') || 'draft') as 'draft' | 'seo_review' | 'published',
				seo_title: stringValue(formData, 'seo_title'),
				seo_description: stringValue(formData, 'seo_description'),
				tags: tagsValue(formData, 'tags'),
				read_time: stringValue(formData, 'read_time') || '5 min read',
				intent: (stringValue(formData, 'intent') || 'informational') as 'informational' | 'commercial',
				monetization: (stringValue(formData, 'monetization') || 'editorial') as
					| 'editorial'
					| 'guest_post'
					| 'affiliate',
				featured: formData.get('featured') === 'on'
			},
			db
		);

		return { createSuccess: 'Post berhasil dibuat.' };
	},

	updatePost: async (event) => {
		const db = getDb(event);
		if (!db) return fail(503, { updateError: 'DB belum tersedia di environment ini.' });

		const formData = await event.request.formData();
		const id = Number(stringValue(formData, 'id'));
		const title = stringValue(formData, 'title');
		const slug = stringValue(formData, 'slug');
		const content = stringValue(formData, 'content');
		if (!id || !title || !slug || !content) {
			return fail(400, { updateError: 'ID, judul, slug, dan konten wajib valid.' });
		}

		await updatePost(
			id,
			{
				title,
				slug,
				excerpt: stringValue(formData, 'excerpt'),
				content,
				category: stringValue(formData, 'category') || 'General',
				status: (stringValue(formData, 'status') || 'draft') as 'draft' | 'seo_review' | 'published',
				seo_title: stringValue(formData, 'seo_title'),
				seo_description: stringValue(formData, 'seo_description'),
				tags: tagsValue(formData, 'tags'),
				read_time: stringValue(formData, 'read_time') || '5 min read',
				intent: (stringValue(formData, 'intent') || 'informational') as 'informational' | 'commercial',
				monetization: (stringValue(formData, 'monetization') || 'editorial') as
					| 'editorial'
					| 'guest_post'
					| 'affiliate',
				featured: formData.get('featured') === 'on'
			},
			db
		);

		return { updateSuccess: `Post #${id} berhasil diupdate.` };
	},

	deletePost: async (event) => {
		const db = getDb(event);
		if (!db) return fail(503, { deleteError: 'DB belum tersedia di environment ini.' });

		const formData = await event.request.formData();
		const id = Number(stringValue(formData, 'id'));
		if (!id) return fail(400, { deleteError: 'ID post tidak valid.' });
		await deletePost(id, db);
		return { deleteSuccess: `Post #${id} dihapus.` };
	},

	reviewSubmission: async (event) => {
		const db = getDb(event);
		if (!db) return fail(503, { submissionError: 'DB belum tersedia di environment ini.' });

		const formData = await event.request.formData();
		const id = Number(stringValue(formData, 'id'));
		const status = stringValue(formData, 'status');
		if (!id || !status) return fail(400, { submissionError: 'ID submission dan status wajib ada.' });
		await updateSubmissionStatus(id, status, db);
		return { submissionSuccess: `Submission #${id} diubah ke ${status}.` };
	}
};
