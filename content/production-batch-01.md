# Production Article Batch 01

Status: ready to load into D1 after approval.

This batch is intended to replace the current dummy/seed articles as the first real Satuska content set. It is intentionally practical, home-improvement focused, and suitable for the current site structure.

## Articles

1. `entryway-storage-ideas-small-homes`
   - Category: Room Guides
   - Intent: informational
   - Featured: yes
   - Topic: entryway organization for small homes

2. `bathroom-counter-organization-ideas`
   - Category: Room Guides
   - Intent: informational
   - Featured: yes
   - Topic: bathroom counter organization and daily routines

3. `make-rental-living-room-feel-finished`
   - Category: Decor & Styling
   - Intent: informational
   - Featured: yes
   - Topic: rental-friendly living room improvements

4. `pantry-organization-ideas-small-kitchens`
   - Category: Room Guides
   - Intent: informational
   - Featured: no
   - Topic: pantry systems for small kitchens

5. `buying-peel-and-stick-floor-tiles`
   - Category: Buying Guides
   - Intent: commercial
   - Monetization: affiliate
   - Featured: no
   - Topic: buying guide for peel-and-stick floor tiles

## Load Order

1. Apply `content/production-batch-01.sql` to remote D1.
2. Verify the new slugs return `200` on `https://www.gushdesign.com/blog/[slug]`.
3. Verify `/`, `/blog`, and `/sitemap.xml` include the new articles.
4. After verification, move the four original dummy posts to draft using the SQL in `DUMMY_CONTENT_CLEANUP.md`.

## Notes

- This batch does not open indexing.
- `noindex, nofollow` and `robots.txt Disallow: /` should stay active until final content QA and credential rotation are done.
