# PROJECT-SPEC.md — Satuska Home Improvement Platform Specification

> **Purpose:** Full reference for building, maintaining, and extending **Satuska**, a home improvement content platform built on **SvelteKit + Cloudflare**, with **guest-post monetization** as the primary business model and **local SEO / affiliate** as optional expansion modules.

> **Monetization model:** guest posts, sponsored placements, and affiliate content where relevant.

---

## 1. Overview

**Project:** Satuska  
**Project type:** Home improvement content publisher platform  
**Primary stack:** SvelteKit + Cloudflare Pages + D1 + R2  
**What it supports:**
- Public home improvement content site
- Dynamic article/detail pages
- Static evergreen service and guide pages
- Local SEO landing pages
- Guest post / advertise pages
- Affiliate comparison / buying-guide pages
- Admin dashboard
- Content publishing workflow
- SEO controls
- Media storage
- Agent-assisted editorial operations

**Target users:**
- Homeowners and renters
- Readers researching home improvement topics
- Local search visitors by city/service intent
- Internal editor / operator
- SEO manager
- Content agents
- Owner/admin

**Core principle:**
One platform, one codebase, modular by domain. Satuska should work cleanly as a **blog + guest-post business first**, while allowing local SEO pages and affiliate surfaces to be enabled later without rebuilding the system.

**Suggested local project root:**
- use `~/projects/<project-slug>`
- example naming style: `~/projects/satuska`

---

## 2. Architecture

```text
┌────────────────────────────────────────────────────────────┐
│                    Cloudflare Pages                        │
│              SvelteKit App (public + admin)               │
├────────────────────────────────────────────────────────────┤
│                    Server / SSR Layer                      │
│        SvelteKit server load + endpoints + actions        │
├────────────────────────────────────────────────────────────┤
│              Internal Service / Repository Layer           │
│      SEO helpers • publishing • media • taxonomy logic    │
├────────────────────────────────────────────────────────────┤
│                  Cloudflare Data Services                  │
│              D1 Database • R2 Media Storage               │
└────────────────────────────────────────────────────────────┘
```

### Architecture style
- **One repo**
- **Hybrid rendering**
- **Public + admin in one SvelteKit app**
- **Internal server layer first**
- **Optional public API endpoints where useful**

### Core components
- **Public frontend** — home improvement site, category pages, article pages, evergreen content, with optional local pages
- **Admin dashboard** — content operations, media, SEO, publish states
- **Server layer** — auth, repositories, services, SEO, cache, publishing logic
- **D1** — structured content data
- **R2** — image/media object storage

---

## 3. Frontend — Svelte Site

### Stack
- **SvelteKit**
- **Tailwind CSS v4**
- **TypeScript**
- **@sveltejs/adapter-cloudflare**
- Optional markdown/MD processing later if needed

### Rendering model
- **Static/prerender** for evergreen pages
- **Dynamic SSR** for article/detail pages that read from D1
- **Cached listing/index pages** where appropriate

### Key frontend goals
- Fast first load
- Clean niche-specific information architecture
- Reusable component system
- Strong SEO defaults
- Easy admin/public separation

### Visual direction
Frontend should support:
- editorial-style public presentation
- trustworthy home/lifestyle presentation
- modular homepage sections
- strong readability for long-form content
- obvious internal linking blocks
- location/service discovery blocks
- guest-post / partner CTA placements

---

## 4. Dynamic Detail Page Renderer

In the Svelte version, the old edge function role is absorbed by **SvelteKit dynamic routes**.

### Detail routes
Examples:
- `/blog/[slug]`
- `/guides/[slug]`
- `/category/[slug]`
- `/locations/[city]`
- `/locations/[city]/[service]`
- `/services/[slug]`
- `/reviews/[slug]`
- `/best/[slug]`

### Route map by intent
- `/` — homepage with category, local, and monetization entry points
- `/blog` — latest editorial content
- `/guides/[slug]` — evergreen informational guides
- `/category/[slug]` — cluster hub by room/topic
- `/locations/[city]` — city landing page *(optional local SEO module)*
- `/locations/[city]/[service]` — city + service SEO page *(optional local SEO module)*
- `/services/[slug]` — evergreen service explainer page *(optional local SEO module)*
- `/reviews/[slug]` — single affiliate review page
- `/best/[slug]` — affiliate comparison / best-of page
- `/write-for-us` — guest-post landing page
- `/advertise` — sponsor / partner page
- `/contact` — commercial and editorial inquiry page

### Responsibilities
Each dynamic route should:
- fetch content from D1 or repository layer
- render SEO meta tags
- render canonical URL
- render JSON-LD schema
- include breadcrumbs
- include related/internal links
- support cache headers
- handle not-found gracefully

### Cache policy
Recommended:
- HTML pages: short browser cache + longer edge cache
- listing pages: medium cache
- media: long-lived immutable cache where possible

---

## 5. Data Layer — Cloudflare D1 + R2

### Database
**D1** is the source of truth for structured content and operational metadata.

### Media
**R2** stores:
- featured images
- uploaded media
- future downloadable assets
- future generated images if needed

### Data access policy
Do not query D1 directly in page components. Use:
- repositories
- services
- typed helper functions

### Baseline content model
Core entities should include at least:
- `posts`
- `categories`
- `locations` *(optional local SEO module)*
- `service_pages` *(optional local SEO module)*
- `affiliate_pages`
- `offers`
- `media`
- `seo_meta`
- `submissions` (for guest-post/contact intake)
- workflow status

### Recommended D1 tables
- `posts` — editorial and guide content
- `categories` — room/topic taxonomy
- `post_categories` — many-to-many post/category mapping
- `locations` — city/state landing entities
- `services` — evergreen service definitions
- `location_service_pages` — city + service SEO pages
- `affiliate_pages` — review / best-of affiliate content
- `offers` — affiliate products, vendors, or offer blocks
- `media` — uploaded assets and metadata
- `seo_meta` — canonical, meta, schema overrides
- `submissions` — guest-post / advertise / contact intake

### Content type intent
- `posts` = informational/editorial traffic
- `location_service_pages` = local SEO traffic *(optional module)*
- `affiliate_pages` = monetization content
- `submissions` = commercial lead capture

---

## 6. Admin Dashboard

### Purpose
The admin is an **operator-first dashboard**, not just a form collection.

### Main functions
- content CRUD
- slug + SEO management
- status workflow
- media upload/selection
- taxonomy management
- local page management
- guest-post / advertise page management
- affiliate page and offer management
- publish controls
- internal QA/SEO review support

### Admin philosophy
- simple first
- desktop-first layout
- minimal clicks for core operations
- visible publish state
- obvious ownership / approval gate

### Recommended modules
- Dashboard overview
- Content list
- Content editor
- Location pages
- Service pages
- Affiliate pages
- Offer blocks
- Media library
- Taxonomy manager
- SEO review
- Guest post submissions
- Settings
- Reports / monitoring (phase 2)

### Admin workflow groups
- **Editorial** — posts, categories, internal links
- **Local SEO** — locations, services, location-service pages *(optional module)*
- **Monetization** — guest posts, sponsor pages, affiliate pages, offers
- **Operations** — media, SEO review, settings

---

## 7. Infrastructure & Accounts

### Cloudflare resources
Expected production resources:
- **Cloudflare Pages project**
- **D1 database**
- **R2 bucket**
- **custom domain**
- optional analytics / email / queues later

### Environment structure
Typical bindings:
- `DB` → D1 database
- `IMAGES` → R2 bucket
- optional `API_KEY`
- optional auth/session secrets
- optional rebuild hooks / service tokens

### Deployment target
- **Cloudflare Pages** for production
- optional preview deploys per branch

---

## 8. Content Strategy

### Role of content strategy
Satuska is focused on **home improvement**, with **guest-post monetization** as the core business model. **Local SEO** and **affiliate content** are optional growth layers that can be enabled when needed.

### Supported content patterns
- Home improvement guides
- Room-specific articles
- How-to / maintenance content
- Inspiration / trend pieces
- Category cluster pages
- City pages
- Service-area pages
- Guest post / advertise / partner pages
- Affiliate comparison pages
- Best-of / buying-guide pages

### Universal quality rules
- clear search intent
- unique page purpose
- internal links built in
- no duplicate content pattern
- title/meta reviewed before publish
- content state tracked in workflow
- location pages must not be thin doorway pages
- guest-post pages must keep editorial quality and disclosure standards
- affiliate pages must include clear disclosure and useful comparison intent

### Content workflow states
Recommended states:
- `idea`
- `brief_ready`
- `draft_ready`
- `editing`
- `seo_review`
- `approved`
- `scheduled`
- `published`
- `refresh_needed`

---

## 9. SEO Configuration

### Technical SEO requirements
- canonical URLs
- page title system
- meta description system
- Open Graph tags
- Twitter Card tags
- JSON-LD / structured data
- XML sitemap
- robots.txt
- noindex controls
- admin route blocking

### SEO fields per content item
Recommended fields:
- `title`
- `slug`
- `excerpt`
- `seo_title`
- `seo_description`
- `featured_image`
- `canonical_url` (optional)
- `noindex` (optional)
- `schema_type` (optional)

### Structured data
Minimum supported schema:
- `WebSite`
- `Organization`
- `BreadcrumbList`
- `Article` / `BlogPosting`

Additional schema for Satuska:
- `CollectionPage`
- `FAQPage`
- `LocalBusiness` (where relevant)
- `Service`
- `Product`
- `Review`

### Internal linking
SEO is not only metadata. The platform should support:
- related content blocks
- category/cluster linking
- breadcrumbs
- orphan page detection
- outbound internal link suggestions
- links between guides ↔ service pages ↔ location pages
- guest-post landing pages linked from commercial/contact surfaces
- affiliate pages linked from relevant guides and category hubs

---

## 10. Known Issues (Legacy Reference / June 2026 Baseline)

These are legacy issues from the reference project and should be treated as **anti-regression checks** for the Svelte version.

### Legacy issues to avoid
- orphan pages with no inbound internal links
- articles with zero outbound internal links
- duplicate H1 caused by markdown H1 + layout H1
- titles too long for SERP display
- meta descriptions too long
- schema only implemented on some route types
- weak visibility due to poor content structure
- no backlink/distribution process

### QA interpretation
Before launch, the Svelte version should explicitly check for:
- heading duplication
- title length
- meta length
- route discoverability
- internal linking coverage
- schema coverage consistency

---

## 11. Agent Roles

### 1. Research Agent
- topic research
- source gathering
- competitor/entity notes
- duplicate topic checking
- brief preparation
- local intent / city-service opportunity discovery

### 2. Writer Agent
- draft generation
- section structure
- title options
- FAQ/CTA drafting
- internal link candidate suggestions
- affiliate comparison section drafting where appropriate

### 3. Editor Agent
- tone cleanup
- repetition reduction
- heading cleanup
- structural editing
- anti-slop pass

### 4. SEO Agent
- title/meta audit
- schema recommendations
- internal link review
- slug/canonical checks
- orphan/content gap detection
- local landing page quality review
- affiliate disclosure and intent alignment review

### 5. Publisher Agent
- save content to D1
- upload/select media in R2
- set publish state
- trigger rebuild / cache refresh if required

### 6. Monitor Agent
- site health checks
- indexing review
- broken-page detection
- refresh candidate tracking
- local SEO page coverage tracking

### Approval rule
- research/writer/SEO agents do **not** publish directly
- publisher executes publish flow
- owner/admin should retain final approval for high-value pages

---

## 12. Cron / Scheduled Work

Possible scheduled jobs:
- content queue review
- draft generation windows
- site health checks
- weekly SEO audit
- orphan page checks
- stale content refresh queue
- media cleanup audit

### Suggested job categories
- **editorial ops**
- **SEO ops**
- **technical monitoring**
- **distribution support**

### Satuska-specific recurring jobs
- location page expansion review
- guest-post intake review
- internal link sweeps between guides and city/service pages
- affiliate link and disclosure audit

The exact cron schedule should be defined per niche and traffic strategy.

---

## 13. Local Development

### Standard flow
```bash
cd ~/projects/<project-slug>
npm install
npm run dev
npm run check
npm run build
```

Example:
```bash
cd ~/projects/satuska
```

### D1 local validation
Use migration files for schema validation.

Recommended structure:
- `migrations/0001_init.sql`
- `migrations/0002_seed.sql`

### Local development goals
- app should run without live production bindings where possible
- fallback/mock data is acceptable for UI work
- D1/R2 wiring should remain production-ready

---

## 14. Publishing Flow

### Recommended workflow
1. Create idea / brief
2. Research
3. Draft content
4. Editorial cleanup
5. SEO review
6. Approval
7. Publish to D1
8. Upload/link media in R2
9. Trigger deploy/cache refresh if needed
10. Verify live URL
11. Add to monitoring / refresh queue

### Publish states
At minimum:
- draft
- approved
- scheduled
- published
- archived

---

## 15. Key Files Reference

### Core files/directories
- `src/routes/` — public + admin routes
- `src/lib/components/` — UI/site/admin/domain components
- `src/lib/server/` — repositories, services, auth, SEO, media
- `src/lib/types/` — shared types
- `src/lib/constants/` — config constants
- `src/hooks.server.ts` — request/session/cache hooks
- `wrangler.jsonc` — Cloudflare bindings/config
- `migrations/` — D1 schema + seeds
- `static/robots.txt` — robots config
- `PROJECT-SPEC.md` — this document

---

## 16. Recreating From Scratch

To rebuild this platform from zero:

0. Create the local project directory in `~/projects/<project-slug>`
1. Create a new **SvelteKit** project
2. Add **Cloudflare adapter**
3. Add **Tailwind CSS**
4. Create **Cloudflare Pages** project
5. Create **D1 database**
6. Create **R2 bucket**
7. Define bindings in `wrangler.jsonc`
8. Create baseline route groups for public site, optional local SEO pages, affiliate pages, and admin
9. Create migrations and seed data
10. Implement repository/service layer
11. Implement SEO system
12. Implement publish workflow
13. Deploy to Pages
14. Attach custom domain
15. Verify sitemap/robots/schema
16. Set up monitoring and scheduled jobs

---

## 17. Frontend + Directory Structure

```text
src/
  app.html
  app.d.ts

  lib/
    components/
      ui/
      site/
      admin/
      domain/

    server/
      auth/
      db/
      repositories/
      services/
      seo/
      media/

    content/
      config/
      schema/
      defaults/

    utils/
    types/
    constants/

  routes/
    (site)/
      +layout.svelte
      +page.svelte
      blog/
      categories/
      guides/
      locations/            # optional local SEO module
      services/             # optional local SEO module
      reviews/
      best/
      write-for-us/
      advertise/
      contact/
      about/
      privacy/
      terms/

    (admin)/
      admin/
        +layout.server.ts
        +layout.svelte
        +page.svelte
        content/
        locations/          # optional local SEO module
        services/           # optional local SEO module
        affiliate/
        submissions/
        taxonomy/
        media/
        seo/
        settings/

    api/
      content/
      submissions/
      media/
      webhooks/

  hooks.server.ts

static/
  favicon.ico
  robots.txt

migrations/
  0001_init.sql
  0002_seed.sql
```

### Structure principle
- separate **site** and **admin** via route groups
- keep pages thin
- move data/business logic into `lib/server/*`
- keep domain-specific components isolated

### Route-group intent
- `(site)` = public pages for editorial and monetization, with optional local SEO pages
- `(admin)` = operator workflow only
- `api/` = form intake, media, webhooks, and programmatic actions

---

## 18. Component System

### UI primitives
Reusable low-level components:
- buttons
- inputs
- cards
- badges
- modals
- tabs
- tables
- pagination

### Site components
Public-facing content modules:
- header
- footer
- hero
- article card
- breadcrumb
- related content
- author/info box
- FAQ block
- location/service finder
- sponsor / guest-post CTA block
- affiliate comparison table
- product / offer card

### Admin components
Dashboard modules:
- sidebar
- content table
- editor form
- status badge
- SEO preview
- media picker
- publish controls
- submission review table
- affiliate offer picker

### Domain components
Niche-specific blocks that should remain isolated from the shared engine.

Examples for Satuska:
- service-area grid
- city cluster links
- room/category cluster cards
- guest-post pricing / package blocks
- affiliate comparison sections

---

## 19. Security & Access Control

### Admin protection
Admin routes should not be public by default.

Recommended controls:
- session-based auth or edge-protected login
- role-based access if needed later
- noindex on admin pages
- secret-backed publish actions

### Sensitive actions
Protect:
- publish
- delete
- media upload overwrite
- settings changes
- webhook/manual rebuild endpoints

---

## 20. Monitoring & QA Checklist

### Technical checks
- homepage returns 200
- detail pages resolve correctly
- sitemap loads
- robots.txt loads
- no broken canonical tags
- no duplicate H1
- no empty title/meta on publish

### Editorial checks
- internal links present
- correct content state
- slug is clean
- excerpt exists
- schema renders
- featured image handled correctly when required
- affiliate disclosures present where needed
- location pages are unique enough to avoid doorway-page patterns

### Operational checks
- admin workflow works
- D1 writes succeed
- R2 uploads succeed
- publish state transitions are valid

---

## 21. Future Expansion

The platform should be able to evolve into:
- multi-site setup
- richer taxonomy
- richer workflow states
- revision history
- analytics dashboard
- backlink/distribution operations
- AI-assisted content pipelines
- niche-specific monetization modules
- affiliate revenue reporting
- sponsor / partner package management

---

## 22. Final Implementation Philosophy

This specification is tailored to **Satuska** as a **home improvement publisher with guest-post monetization**, plus optional **local SEO** and **affiliate** expansion modules, built with SvelteKit and Cloudflare.

### What stays stable
- architecture pattern
- deployment stack
- admin/public split
- SEO system
- publish workflow
- data/storage model

### Core domain model
- editorial content for home improvement topics
- city and service landing pages for local SEO *(optional)*
- monetization surfaces for guest posts / advertise inquiries
- affiliate comparison and buying-guide surfaces

**In short:** this is a unified home-improvement publisher spec for Satuska, designed to work as a blog + guest-post business first, with optional local SEO and affiliate expansion later.
