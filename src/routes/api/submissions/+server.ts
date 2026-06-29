import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { getOperatorErrorMessage } from '$lib/server/errors';
import { createSubmission } from '$lib/server/repositories/submissions';
import { validateSubmissionPayload } from '$lib/server/validation';

export const POST: RequestHandler = async (event) => {
	const db = getDb(event);
	if (!db) {
		return json({ ok: false, error: 'DB belum tersedia di environment ini.' }, { status: 503 });
	}
	const body = await event.request.json().catch(() => null);
	const mode = body?.submissionType === 'guest_post' ? 'write_for_us' : 'contact';
	const parsed = validateSubmissionPayload(body, mode);
	if (!parsed.ok) {
		error(400, parsed.error);
	}

	let submission;
	try {
		submission = await createSubmission(parsed.data, db);
	} catch (caught) {
		const message = getOperatorErrorMessage(caught, 'Submission gagal dikirim.');
			error(400, message);
	}

	return json({ ok: true, submission }, { status: 201 });
};
