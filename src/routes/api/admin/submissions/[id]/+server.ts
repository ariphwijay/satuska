import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { writeAdminMutationLog } from '$lib/server/audit';
import { getDb } from '$lib/server/db';
import { guardAgainstDuplicateRequest } from '$lib/server/idempotency';
import { updateSubmissionStatus } from '$lib/server/repositories/submissions';
import { validateSubmissionStatusPayload } from '$lib/server/validation';

export const PUT: RequestHandler = async (event) => {
	const db = getDb(event);
	if (!db) return json({ ok: false, error: 'DB belum tersedia di environment ini.' }, { status: 503 });
	const body = await event.request.json().catch(() => null);
	const parsed = validateSubmissionStatusPayload(body?.status, event.params.id);
	if (!parsed.ok) return json({ ok: false, error: parsed.error }, { status: 400 });
	const duplicate = await guardAgainstDuplicateRequest(event, db, 'api_admin_review_submission', parsed.data, 20);
	if (!duplicate.ok) return json({ ok: false, error: duplicate.message }, { status: 409 });
	const result = await updateSubmissionStatus(parsed.data.id, parsed.data.status, db);
	await writeAdminMutationLog(event, db, {
		action: 'api_review_submission',
		entityType: 'submission',
		entityId: parsed.data.id,
		summary: `API update submission #${parsed.data.id} ke ${parsed.data.status}`,
		payload: parsed.data
	});
	return json({ ok: true, result });
};
