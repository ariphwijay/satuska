import { site, type SiteProfile } from '$lib/content';
import type { D1Database } from '$lib/server/db';

type SiteProfileRow = {
	site_name: string | null;
	site_url: string | null;
	description: string | null;
	tagline: string | null;
	niche: string | null;
	primary_monetization: string | null;
	module_local_seo: number | null;
	module_affiliate: number | null;
	module_multisite: number | null;
};

export async function getSiteProfile(db: D1Database | null = null): Promise<SiteProfile> {
	if (!db) return site;

	const row = await db
		.prepare(`
			SELECT site_name, site_url, description, tagline, niche, primary_monetization,
			       module_local_seo, module_affiliate, module_multisite
			FROM site_profiles
			ORDER BY id ASC
			LIMIT 1
		`)
		.first<SiteProfileRow>();

	if (!row) return site;

	return {
		name: row.site_name ?? site.name,
		url: row.site_url ?? site.url,
		description: row.description ?? site.description,
		tagline: row.tagline ?? site.tagline,
		niche: row.niche ?? site.niche,
		primaryMonetization: 'guest_post',
		optionalModules: {
			localSeo: Boolean(row.module_local_seo),
			affiliate: Boolean(row.module_affiliate),
			multisiteSetup: Boolean(row.module_multisite)
		}
	};
}
