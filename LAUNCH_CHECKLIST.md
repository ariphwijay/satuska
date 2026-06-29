# Satuska Launch Checklist

Canonical production host: `https://www.gushdesign.com`

## Current Staging Locks

- `src/routes/+layout.svelte` sets global `noindex, nofollow`.
- `static/robots.txt` blocks all crawlers with `Disallow: /`.
- `src/hooks.server.ts` sets HTML and key API responses to `cache-control: no-store`.

Keep these locks while content, credentials, and final QA are still in progress.

## Before Opening Indexing

- Rotate `ADMIN_PASSWORD` in Cloudflare Pages production secrets.
- Rotate `ADMIN_SESSION_SECRET` at the same time so old admin sessions become invalid.
- Confirm only `www.gushdesign.com` is used as the canonical host.
- Confirm `https://gushdesign.com/*` redirects with `308` to `https://www.gushdesign.com/*`.
- Confirm `/admin` redirects to `/login?next=%2Fadmin` when logged out.
- Confirm `/api/admin/*` returns `401` when logged out.
- Confirm all sitemap URLs return `200` on `www.gushdesign.com`.
- Confirm no temporary QA posts or submissions remain in D1.
- Confirm final production posts are edited, published, and have real SEO titles/descriptions.
- Confirm `/contact` and `/write-for-us` submissions still reach the admin submissions table.

## To Open Indexing

1. Update `src/routes/+layout.svelte`:
   - replace `noindex, nofollow` with `index, follow`, or remove the robots meta tag.
2. Update `static/robots.txt`:
   - allow crawling and add the sitemap URL.

Suggested production `robots.txt`:

```txt
User-agent: *
Allow: /

Sitemap: https://www.gushdesign.com/sitemap.xml
```

3. Consider changing HTML cache policy in `src/hooks.server.ts` from `no-store` to a short production cache window only after content update behavior is confirmed.
4. Run local checks:
   - `npm run check`
   - `npm run build`
5. Deploy to Cloudflare Pages.
6. Verify live:
   - `https://www.gushdesign.com/robots.txt`
   - `https://www.gushdesign.com/sitemap.xml`
   - at least one public blog detail page
   - apex-to-www redirect

## Post-Launch Checks

- Submit `https://www.gushdesign.com/sitemap.xml` in Google Search Console.
- Inspect a sample blog URL in Search Console.
- Check that pages no longer contain `noindex`.
- Check Cloudflare analytics and form submissions after first crawl traffic.
- Keep admin password and session secret out of commits, docs, and chat logs.
