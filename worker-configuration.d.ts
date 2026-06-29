interface D1Result<T = unknown> {
	results?: T[];
	success: boolean;
	meta?: Record<string, unknown>;
	error?: string;
}

interface D1PreparedStatement {
	bind(...values: unknown[]): D1PreparedStatement;
	first<T = unknown>(colName?: string): Promise<T | null>;
	run<T = unknown>(): Promise<D1Result<T>>;
	all<T = unknown>(): Promise<D1Result<T>>;
	raw<T = unknown>(): Promise<T[]>;
}

interface D1Database {
	prepare(query: string): D1PreparedStatement;
	dump(): Promise<ArrayBuffer>;
	batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
	exec(query: string): Promise<D1Result>;
}

interface R2Bucket {
	get(key: string): Promise<unknown>;
	put(key: string, value: ReadableStream | ArrayBuffer | ArrayBufferView | string | null | Blob): Promise<unknown>;
	delete(key: string | string[]): Promise<void>;
}

interface Env {
	IMAGES: R2Bucket;
	DB: D1Database;
	API_KEY?: string;
	ADMIN_PASSWORD?: string;
	ADMIN_SESSION_SECRET?: string;
}

declare namespace Cloudflare {
	interface Env {
		IMAGES: R2Bucket;
		DB: D1Database;
		API_KEY?: string;
		ADMIN_PASSWORD?: string;
		ADMIN_SESSION_SECRET?: string;
	}
}
