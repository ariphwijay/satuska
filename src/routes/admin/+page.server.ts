import { fail } from '@sveltejs/kit';
import type { Actions, ServerLoad } from '@sveltejs/kit';
import { categorySeeds } from '$lib/content';
import { getDb } from '$lib/server/db';
import { getOperatorErrorMessage } from '$lib/server/errors';
import { createPost, deletePost, listPosts, updatePost } from '$lib/server/repositories/posts';
import { listSubmissions, updateSubmissionStatus } from '$lib/server/repositories/submissions';
import { validatePostForm, validateSubmissionStatus } from '$lib/server/validation';

function stringValue(formData: FormData, key: string) {
	return String(formData.get(key) ?? '').trim();
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
		const parsed = validatePostForm(formData, 'create');
		if (!parsed.ok) return fail(400, { createError: parsed.error });

		try {
			await createPost(parsed.data, db);
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

		try {
			await updatePost(parsed.data.id!, parsed.data, db);
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
		await deletePost(id, db);
		return { deleteSuccess: `Post #${id} dihapus.` };
	},

	reviewSubmission: async (event) => {
		const db = getDb(event);
		if (!db) return fail(503, { submissionError: 'DB belum tersedia di environment ini.' });

		const formData = await event.request.formData();
		const parsed = validateSubmissionStatus(formData);
		if (!parsed.ok) return fail(400, { submissionError: parsed.error });
		await updateSubmissionStatus(parsed.data.id, parsed.data.status, db);
		return { submissionSuccess: `Submission #${parsed.data.id} diubah ke ${parsed.data.status}.` };
	}
};
