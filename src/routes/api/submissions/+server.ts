import { error, json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { getDb } from '$lib/server/db';
import { createSubmission } from '$lib/server/repositories/submissions';

export const POST: RequestHandler = async (event) => {
	const body = await event.request.json().catch(() => null);
	if (!body?.name || !body?.email || !body?.message) {
		error(400, 'name, email, and message are required');
	}

	const submission = await createSubmission(
		{
			name: body.name,
			email: body.email,
			company: body.company,
			siteUrl: body.siteUrl,
			targetUrl: body.targetUrl,
			topic: body.topic,
			message: body.message,
			submissionType: body.submissionType,
			desiredPackage: body.desiredPackage
		},
		getDb(event)
	);

	return json({ ok: true, submission }, { status: 201 });
};
