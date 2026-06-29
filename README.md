# Satuska

Satuska is a SvelteKit + Cloudflare Pages content site with a lightweight operator admin, public editorial pages, and server routes backed by Cloudflare D1.

## Stack

- SvelteKit
- Tailwind CSS v4
- Cloudflare Pages
- Cloudflare D1
- Cloudflare R2

## Main areas

- Public pages: home, blog, cases, laws, learn, tools, contact, write-for-us
- Admin area: `/admin`
- Login flow: `/login`, `/logout`
- Public API routes under `/api/articles`, `/api/cases`, `/api/submissions`
- Protected admin API routes under `/api/admin/*`

## Local development

```bash
cd ~/projects/satuska
npm install
npm run dev
```

Useful commands:

```bash
npm run check
npm run build
npm run preview
```

## Project structure

- `src/routes/` — pages and API routes
- `src/routes/admin/` — operator admin UI
- `src/lib/server/` — auth, DB, repositories
- `migrations/` — D1 schema + seed files
- `static/` — static assets like `robots.txt`
- `wrangler.jsonc` — Cloudflare bindings
- `DEPLOY.md` — deployment + infrastructure notes

## Deployment + infra

For the current live Cloudflare resources, bindings, secrets, migration commands, and verification checklist, read:

- [DEPLOY.md](./DEPLOY.md)

## Notes

- Admin auth depends on Cloudflare Pages secrets, not hardcoded credentials.
- On this macOS 12 host, Wrangler type generation is limited by `workerd` runtime support, so `worker-configuration.d.ts` may be maintained manually for local checks.
