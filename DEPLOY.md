# Satuska Deploy Notes

## Current Cloudflare resources

This repo is currently wired to these dedicated Satuska resources:

- Pages project: `satuska-project`
- Production URL: `https://satuska-project.pages.dev`
- D1 database: `satuska-cms`
- D1 database id: `dd33deac-944e-4f85-a4ab-94246cb202f9`
- R2 bucket: `satuska-project-media`

## Important isolation note

Satuska is no longer pointed at the old AI Copyright Legal resources.

Old shared resources that should **not** be restored in this repo:
- old D1: `aicopyrightlegal`
- old R2: `aicopyrightlegal-images`

The active `wrangler.jsonc` should keep Satuska on its own D1 + R2 resources.

## Current Wrangler bindings

`wrangler.jsonc` should contain:

- D1 binding: `DB` → `satuska-cms`
- R2 binding: `IMAGES` → `satuska-project-media`

## Admin auth secrets

Pages project secrets expected in Cloudflare:

- `ADMIN_PASSWORD`
- `ADMIN_SESSION_SECRET`

Do not hardcode these in the app.

## Local commands

```bash
cd ~/projects/satuska
npm install
npm run check
npm run build
```

## Deploy command

```bash
cd ~/projects/satuska
npm run build
npx wrangler pages deploy .svelte-kit/cloudflare --project-name satuska-project --branch main --commit-dirty=true
```

## D1 migration commands

Apply schema:

```bash
cd ~/projects/satuska
npx wrangler d1 execute satuska-cms --remote --file migrations/0001_init.sql
```

Apply seed:

```bash
cd ~/projects/satuska
npx wrangler d1 execute satuska-cms --remote --file migrations/0002_seed.sql
```

## Verification checklist

After deploy, verify these paths:

1. `/admin` redirects to `/login` when logged out
2. login works with the configured admin password
3. `/api/admin/posts` returns `401` when logged out
4. admin panel loads existing seeded posts after login
5. logout returns the session to the login page

## Known live verification references

Latest verified preview deploys during setup:

- `https://0e5a7e44.satuska-project.pages.dev`
- `https://593ed5cd.satuska-project.pages.dev`

These were used only for verification. The canonical project URL remains:

- `https://satuska-project.pages.dev`

## Config backups created during cleanup

Before rewiring resources, these local config backups were created:

- `~/projects/satuska-config-backup-20260629_073116`
- `~/projects/satuska-r2-config-backup-20260629_083450`

## Remote D1 backup created before earlier DB rewiring

- `~/projects/satuska/backups/d1-remote-before-satuska-20260629_071040.sql`
