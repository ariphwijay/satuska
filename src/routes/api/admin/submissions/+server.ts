import { json } from '@sveltejs/kit';
import type { RequestHandler } from '@sveltejs/kit';
import { requireAdminApiSession } from '$lib/server/admin-api';
import { getDb } from '$lib/server/db';
import { listSubmissions } from '$lib/server/repositories/submissions';

export const GET: RequestHandler = async (event) => {
	const unauthorized = requireAdminApiSession(event);
	if (unauthorized) return unauthorized;

	const db = getDb(event);
	if (!db) return json({ ok: false, error: 'DB belum tersedia di environment ini.' }, { status: 503 });
	const submissions = await listSubmissions(db);
	return json({
		ok: true,
		items: submissions,
		total: submissions.length,
		statusCounts: {
			received: submissions.filter((item) => item.status === 'received').length,
			reviewing: submissions.filter((item) => item.status === 'reviewing').length,
			accepted: submissions.filter((item) => item.status === 'accepted').length,
			rejected: submissions.filter((item) => item.status === 'rejected').length
		}
	});
};
