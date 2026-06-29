# Satuska Content Production Plan

Canonical site: `https://www.gushdesign.com`

## Phase 7 Goal

Replace dummy/scaffold articles with production-ready home improvement content before opening indexing.

The current articles are treated as placeholders. Do not spend time auditing them for quality; replace or delete them during production content work.

## Phase 7.1 Scope

- Lock the content direction and publishing rules.
- Define the first production article batch.
- Define the minimum fields every post needs in admin/D1.
- Keep indexing locked until production content is ready.

## Editorial Direction

Satuska should publish practical, reader-first home improvement content:

- room-by-room ideas
- renovation and makeover tips
- decor and styling guidance
- storage and organization ideas
- outdoor living improvements
- buying guides where commercial intent is useful
- guest-post/sponsored content only when topical and useful

Avoid:

- generic SEO filler
- off-topic niches like casino, crypto, finance, or unrelated tech
- thin listicles without examples or practical advice
- undisclosed promotional copy

## Core Categories

- Room Guides
- Renovation Tips
- Decor & Styling
- Buying Guides
- Outdoor Living

## First Production Batch

Recommended first batch before indexing:

1. Small kitchen storage ideas for apartments and rentals
2. Living room lighting ideas for a warmer, more functional space
3. Budget bathroom refresh ideas without a full renovation
4. Peel-and-stick backsplash guide for renters and quick makeovers
5. Outdoor patio ideas for small backyards and balconies
6. Entryway organization ideas for small homes
7. Bedroom decor ideas that make a room feel calmer
8. Laundry room storage ideas for tight spaces

Minimum target: publish 5 strong articles before removing `noindex`.
Better target: publish 8-12 articles before launch indexing.

## Required Post Fields

Every production post should have:

- title
- slug
- excerpt
- content
- category
- status: `published`
- SEO title
- SEO description
- tags
- read time
- intent: `informational` or `commercial`
- monetization: `editorial`, `guest_post`, or `affiliate`
- featured flag for homepage candidates

## Suggested Article Template

```md
# Article Title

Short intro that explains the reader problem and what they will get.

## Why this matters

Practical context for the room, budget, constraint, or use case.

## Idea 1

Specific advice with examples.

## Idea 2

Specific advice with examples.

## What to avoid

Common mistakes or overbuilding warnings.

## Quick checklist

- Action item
- Action item
- Action item

## Final thought

Short wrap-up with the practical next step.
```

## Pre-Indexing Content Checklist

Before opening indexing:

- Replace or delete dummy posts.
- Make sure homepage featured posts are real production posts.
- Make sure `/blog` only lists production posts.
- Make sure sitemap only includes production posts.
- Confirm each article has unique SEO title and description.
- Confirm no article title/content still says test, dummy, scaffold, seed, or placeholder.
- Rotate admin password and session secret.
- Remove global `noindex` and open `robots.txt` only after final content QA.
