import type { RequestEvent } from '@sveltejs/kit';
import type { D1Database } from '$lib/server/db';

function textValue(value: unknown) {
	if (value == null) return '';
	if (typeof value === 'string') return value;
	return JSON.stringify(value);
}

async function sha256Hex(value: string) {
	const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
	return Array.from(new Uint8Array(buffer), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function clientIp(event: RequestEvent) {
	return event.request.headers.get('cf-connecting-ip') ?? event.getClientAddress?.() ?? 'unknown';
}

export async function guardAgainstDuplicateRequest(
	event: RequestEvent,
	db: D1Database,
	action: string,
	payload: unknown,
	windowSeconds = 15
) {
	const now = Math.floor(Date.now() / 1000);
	const expiresAt = now + windowSeconds;
	const fingerprint = await sha256Hex(`${action}:${clientIp(event)}:${textValue(payload)}`);

	await db.prepare(`DELETE FROM request_idempotency WHERE expires_at < ?1`).bind(now).run();

	const existing = await db
		.prepare(`SELECT id FROM request_idempotency WHERE action = ?1 AND fingerprint = ?2 AND expires_at >= ?3 LIMIT 1`)
		.bind(action, fingerprint, now)
		.first<{ id: number }>();

	if (existing?.id) {
		return {
			ok: false,
			message: 'Request yang sama baru saja diproses. Tunggu sebentar sebelum submit ulang.'
		};
	}

	await db
		.prepare(`
			INSERT OR REPLACE INTO request_idempotency (action, fingerprint, created_at, expires_at)
			VALUES (?1, ?2, ?3, ?4)
		`)
		.bind(action, fingerprint, now, expiresAt)
		.run();

	return { ok: true } as const;
}
