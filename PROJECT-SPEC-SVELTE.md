# aicopyrightlegal.com — SvelteKit Implementation Notes

This repo is the SvelteKit + Cloudflare Pages version of the provided Astro/Worker/Vue specification.

## V1 architecture

- One SvelteKit app deployed to Cloudflare Pages.
- Public site routes live in `src/routes/`.
- Blog detail pages use SvelteKit dynamic routes: `src/routes/blog/[slug]`.
- Public API routes live under `src/routes/api/*`.
- D1 and R2 bindings are declared in `wrangler.jsonc`.
- Seed data is available in `src/lib/content.ts` for local/fallback operation.
- SQL migrations are in `migrations/`.

## Why one repo for V1

The original spec separates Astro, Worker API, and Vue dashboard. For a fast Svelte deployment, one SvelteKit repo reduces moving parts while preserving the same product surface: public site, dynamic article rendering, public API endpoints, admin shell, D1 schema, and R2 binding.

## Implemented routes

- `/`
- `/blog`
- `/blog/[slug]`
- `/cases`
- `/laws`, `/laws/[slug]`
- `/learn`, `/learn/[slug]`
- `/tools`, `/tools/[slug]`
- `/for-creators`, `/for-businesses`
- `/about`, `/privacy`, `/terms`
- `/admin`
- `/api/articles/published`
- `/api/articles/slug/[slug]`
- `/api/cases/public`
- `/sitemap.xml`

## Cloudflare resources to finalize

Replace the placeholder D1 `database_id` in `wrangler.jsonc` after creating or selecting the real D1 database in the target Cloudflare account. The current Wrangler login is not the same Cloudflare account as the provided spec, so custom-domain go-live for `aicopyrightlegal.com` must use the correct account/zone.
