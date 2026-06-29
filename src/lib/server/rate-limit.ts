import type { RequestEvent } from '@sveltejs/kit';
import type { D1Database } from '$lib/server/db';

export type RateLimitPolicy = {
	action: string;
	limit: number;
	windowSeconds: number;
};

export type RateLimitResult = {
	allowed: boolean;
	remaining: number;
	retryAfterSeconds: number;
};

function clientIp(event: RequestEvent) {
	return (
		event.request.headers.get('cf-connecting-ip') ??
		event.request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
		'unknown'
	);
}

function rateLimitKey(event: RequestEvent, action: string) {
	return `${action}:${clientIp(event)}`;
}

export async function enforceRateLimit(event: RequestEvent, db: D1Database | null, policy: RateLimitPolicy): Promise<RateLimitResult> {
	if (!db) {
		return { allowed: true, remaining: policy.limit, retryAfterSeconds: 0 };
	}

	const now = Math.floor(Date.now() / 1000);
	const resetAt = now + policy.windowSeconds;
	const key = rateLimitKey(event, policy.action);

	await db.prepare(`DELETE FROM request_rate_limits WHERE reset_at <= ?1`).bind(now).run();

	const current = await db
		.prepare(`SELECT count, reset_at FROM request_rate_limits WHERE action = ?1 AND key = ?2 LIMIT 1`)
		.bind(policy.action, key)
		.first<{ count: number; reset_at: number }>();

	if (!current) {
		await db
			.prepare(`INSERT INTO request_rate_limits (action, key, count, reset_at, updated_at) VALUES (?1, ?2, 1, ?3, datetime('now'))`)
			.bind(policy.action, key, resetAt)
			.run();
		return { allowed: true, remaining: policy.limit - 1, retryAfterSeconds: 0 };
	}

	if (current.reset_at <= now) {
		await db
			.prepare(`UPDATE request_rate_limits SET count = 1, reset_at = ?3, updated_at = datetime('now') WHERE action = ?1 AND key = ?2`)
			.bind(policy.action, key, resetAt)
			.run();
		return { allowed: true, remaining: policy.limit - 1, retryAfterSeconds: 0 };
	}

	if (current.count >= policy.limit) {
		return {
			allowed: false,
			remaining: 0,
			retryAfterSeconds: Math.max(1, current.reset_at - now)
		};
	}

	const nextCount = current.count + 1;
	await db
		.prepare(`UPDATE request_rate_limits SET count = ?3, updated_at = datetime('now') WHERE action = ?1 AND key = ?2`)
		.bind(policy.action, key, nextCount)
		.run();

	return {
		allowed: true,
		remaining: Math.max(0, policy.limit - nextCount),
		retryAfterSeconds: 0
	};
}
