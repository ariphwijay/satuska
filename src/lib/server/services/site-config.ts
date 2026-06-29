import type { SiteProfile } from '$lib/content';
import type { D1Database } from '$lib/server/db';
import { getSiteProfile } from '$lib/server/repositories/settings';

export async function resolveSiteConfig(db: D1Database | null = null): Promise<SiteProfile> {
	return getSiteProfile(db);
}
