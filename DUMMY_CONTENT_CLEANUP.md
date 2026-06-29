# Dummy Content Cleanup Strategy

Current state: the live D1 database has 4 published placeholder articles. They are useful for testing the publishing system, but they should not be indexed as production content.

## Recommended Approach

Use a two-step replacement strategy:

1. Keep the existing dummy posts until the first production batch is ready.
2. When production articles are prepared, replace the dummy rows in-place or move them to draft before opening indexing.

This avoids an empty public site while staging is still locked with `noindex` and `robots.txt Disallow: /`.

## Why Not Delete Immediately

Deleting the dummy posts now would make these surfaces thin or empty:

- Homepage featured articles
- `/blog` listing
- `/sitemap.xml` blog URLs
- Related reading blocks on article detail pages

Because indexing is still blocked, keeping placeholders temporarily is safer than creating empty production surfaces.

## Cleanup Options

### Option A — Replace Existing Rows In-Place

Best when the first production batch has exactly 4 starter articles.

Pros:

- Keeps IDs stable.
- No temporary empty blog state.
- Homepage and sitemap stay populated throughout.

Cons:

- Requires carefully updating every field on each existing row.
- Old slugs must be replaced and verified.

Suggested use: if launching with 4 polished articles first.

### Option B — Set Dummy Posts to Draft, Then Insert New Posts

Best when launching with 5-12 production articles.

Pros:

- Cleaner separation between placeholder and real content.
- New content gets fresh IDs and clean publish dates.
- Easier to verify that no placeholder slug remains public.

Cons:

- Blog can become empty if drafts are applied before new posts are inserted.
- Requires sequencing carefully.

Suggested use: if launching with a full first content batch.

## Recommended Sequence For Satuska

Use Option B, but only when the first production batch is ready.

1. Prepare 5-8 production articles.
2. Insert production articles into D1 as `published`.
3. Mark old dummy posts as `draft`.
4. Verify live public surfaces:
   - `/`
   - `/blog`
   - each `/blog/[slug]`
   - `/sitemap.xml`
5. Confirm no dummy slugs remain in sitemap or public pages.
6. Rotate admin credentials.
7. Open indexing.

## Dummy Slugs To Remove Before Indexing

Current placeholder slugs to draft/delete before launch:

- `small-kitchen-makeover-ideas-budget`
- `living-room-lighting-upgrades`
- `best-peel-and-stick-backsplash-options`
- `how-to-pitch-home-improvement-guest-post`

## Verification Queries

Check all public posts:

```sql
SELECT id, title, slug, status, featured, published_at
FROM posts
ORDER BY published_at DESC, id DESC;
```

Check remaining dummy posts:

```sql
SELECT id, title, slug, status
FROM posts
WHERE slug IN (
  'small-kitchen-makeover-ideas-budget',
  'living-room-lighting-upgrades',
  'best-peel-and-stick-backsplash-options',
  'how-to-pitch-home-improvement-guest-post'
);
```

Draft all dummy posts after production posts are inserted:

```sql
UPDATE posts
SET status = 'draft', featured = 0, updated_at = datetime('now')
WHERE slug IN (
  'small-kitchen-makeover-ideas-budget',
  'living-room-lighting-upgrades',
  'best-peel-and-stick-backsplash-options',
  'how-to-pitch-home-improvement-guest-post'
);
```

Confirm no dummy posts are public:

```sql
SELECT COUNT(*) AS remaining_public_dummy_posts
FROM posts
WHERE status = 'published'
  AND slug IN (
    'small-kitchen-makeover-ideas-budget',
    'living-room-lighting-upgrades',
    'best-peel-and-stick-backsplash-options',
    'how-to-pitch-home-improvement-guest-post'
  );
```

Expected result before opening indexing: `0`.

## Do Not Open Indexing Until

- At least 5 real production posts are published.
- Dummy slugs are no longer public.
- Sitemap only contains production article URLs.
- Homepage featured cards show production articles.
- Admin credentials have been rotated.
