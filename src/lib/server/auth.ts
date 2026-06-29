import { json, type Cookies, type RequestEvent } from '@sveltejs/kit';

const ADMIN_COOKIE = 'satuska_admin_session';
const SESSION_MAX_AGE = 60 * 60 * 12;

type RuntimeEnv = {
	ADMIN_PASSWORD?: string;
	ADMIN_SESSION_SECRET?: string;
};

export type AdminSession = {
	authenticated: boolean;
};

function readProcessEnv() {
	return (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env ?? {};
}

function readRuntimeEnv(event?: RequestEvent | null): RuntimeEnv {
	const env = event?.platform?.env;
	const processEnv = readProcessEnv();
	return {
		ADMIN_PASSWORD: env?.ADMIN_PASSWORD ?? processEnv.ADMIN_PASSWORD,
		ADMIN_SESSION_SECRET: env?.ADMIN_SESSION_SECRET ?? processEnv.ADMIN_SESSION_SECRET
	};
}

function cookieSecure(event: RequestEvent) {
	return event.url.protocol === 'https:';
}

function toBase64Url(bytes: Uint8Array) {
	const binary = Array.from(bytes, (byte) => String.fromCharCode(byte)).join('');
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sha256(value: string) {
	const buffer = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
	return toBase64Url(new Uint8Array(buffer));
}

async function expectedSessionToken(env: RuntimeEnv) {
	if (!env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) return null;
	return sha256(`${env.ADMIN_PASSWORD}:${env.ADMIN_SESSION_SECRET}:admin`);
}

export function hasAdminAuthConfig(event?: RequestEvent | null) {
	const env = readRuntimeEnv(event);
	return Boolean(env.ADMIN_PASSWORD && env.ADMIN_SESSION_SECRET);
}

export async function validateAdminPassword(event: RequestEvent, password: string) {
	const env = readRuntimeEnv(event);
	if (!env.ADMIN_PASSWORD || !env.ADMIN_SESSION_SECRET) return false;
	return password === env.ADMIN_PASSWORD;
}

export async function getAdminSession(event: RequestEvent): Promise<AdminSession> {
	const token = event.cookies.get(ADMIN_COOKIE);
	const expected = await expectedSessionToken(readRuntimeEnv(event));
	return { authenticated: Boolean(token && expected && token === expected) };
}

export async function startAdminSession(event: RequestEvent) {
	const token = await expectedSessionToken(readRuntimeEnv(event));
	if (!token) throw new Error('ADMIN auth env is not configured');

	event.cookies.set(ADMIN_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure: cookieSecure(event),
		maxAge: SESSION_MAX_AGE
	});
}

export function clearAdminSession(cookies: Cookies, secure = true) {
	cookies.set(ADMIN_COOKIE, '', {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure,
		maxAge: 0
	});
}

export function sanitizeNext(next: string | null | undefined) {
	if (!next || !next.startsWith('/') || next.startsWith('//')) return '/admin';
	if (next.startsWith('/login')) return '/admin';
	return next;
}

export function adminLoginRedirect(event: RequestEvent) {
	const next = encodeURIComponent(`${event.url.pathname}${event.url.search}`);
	return new Response(null, {
		status: 303,
		headers: {
			location: `/login?next=${next}`,
			'cache-control': 'no-store'
		}
	});
}

export function adminApiUnauthorized() {
	return json(
		{ ok: false, error: 'Unauthorized' },
		{
			status: 401,
			headers: { 'cache-control': 'no-store' }
		}
	);
}

export function isProtectedAdminPath(pathname: string) {
	return pathname === '/admin' || pathname.startsWith('/admin/') || pathname.startsWith('/api/admin/');
}

export function isAdminApiPath(pathname: string) {
	return pathname.startsWith('/api/admin/');
}
