import type { D1Database } from '$lib/server/db';
import { DuplicateSubmissionError } from '$lib/server/errors';

export type SubmissionInput = {
	name: string;
	email: string;
	company?: string;
	siteUrl?: string;
	targetUrl?: string;
	topic?: string;
	message: string;
	submissionType?: 'guest_post' | 'sponsored' | 'general';
	desiredPackage?: string;
};

export type Submission = {
	id: number;
	submission_type: string;
	desired_package: string | null;
	name: string;
	email: string;
	company: string | null;
	site_url: string | null;
	target_url: string | null;
	topic: string | null;
	message: string;
	status: string;
	created_at?: string;
	updated_at?: string;
};

export async function listSubmissions(db: D1Database | null = null): Promise<Submission[]> {
	if (!db) return [];
	const result = await db
		.prepare(`
			SELECT id, submission_type, desired_package, name, email, company, site_url, target_url,
			       topic, message, status, created_at, updated_at
			FROM submissions
			ORDER BY created_at DESC, id DESC
		`)
		.all<Submission>();
	return result.results ?? [];
}

async function ensureSubmissionIsNotDuplicate(payload: {
	email: string;
	topic: string | null;
	message: string;
	submissionType: string;
	targetUrl: string | null;
}, db: D1Database) {
	const row = await db
		.prepare(`
			SELECT id
			FROM submissions
			WHERE lower(email) = lower(?1)
			  AND submission_type = ?2
			  AND ifnull(topic, '') = ifnull(?3, '')
			  AND ifnull(target_url, '') = ifnull(?4, '')
			  AND message = ?5
			  AND created_at >= datetime('now', '-24 hours')
			LIMIT 1
		`)
		.bind(payload.email, payload.submissionType, payload.topic, payload.targetUrl, payload.message)
		.first<{ id: number }>();
	if (row?.id) throw new DuplicateSubmissionError();
}

export async function createSubmission(input: SubmissionInput, db: D1Database | null = null) {
	const payload = {
		name: input.name.trim(),
		email: input.email.trim(),
		company: input.company?.trim() || null,
		siteUrl: input.siteUrl?.trim() || null,
		targetUrl: input.targetUrl?.trim() || null,
		topic: input.topic?.trim() || null,
		message: input.message.trim(),
		submissionType: input.submissionType ?? 'guest_post',
		desiredPackage: input.desiredPackage?.trim() || null
	};

	if (!db) {
		return {
			id: Date.now(),
			status: 'received',
			stored: false,
			...payload
		};
	}

	await ensureSubmissionIsNotDuplicate(payload, db);

	const result = await db
		.prepare(`
			INSERT INTO submissions (
				name, email, company, site_url, target_url, topic, message,
				submission_type, desired_package, status
			) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, 'received')
		`)
		.bind(
			payload.name,
			payload.email,
			payload.company,
			payload.siteUrl,
			payload.targetUrl,
			payload.topic,
			payload.message,
			payload.submissionType,
			payload.desiredPackage
		)
		.run();

	return {
		id: Number(result.meta?.last_row_id ?? 0),
		status: 'received',
		stored: true,
		...payload
	};
}

export async function updateSubmissionStatus(id: number, status: string, db: D1Database | null = null) {
	if (!db) return { id, status, stored: false };
	await db
		.prepare(`UPDATE submissions SET status = ?1, updated_at = datetime('now') WHERE id = ?2`)
		.bind(status, id)
		.run();
	return { id, status, stored: true };
}
