// See https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {
		interface Platform {
			env?: {
				DB?: D1Database;
				IMAGES?: R2Bucket;
				API_KEY?: string;
				ADMIN_PASSWORD?: string;
				ADMIN_SESSION_SECRET?: string;
			};
			context: { waitUntil(promise: Promise<unknown>): void };
			caches: CacheStorage & { default: Cache };
		}

		interface Locals {
			adminSession: {
				authenticated: boolean;
			};
		}
	}
}

export {};
