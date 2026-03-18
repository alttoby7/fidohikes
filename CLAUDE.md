# fidohikes.com

## Tech Stack

- **Framework:** Astro 6 (static output)
- **Content:** MDX via Astro content collections (Content Layer API)
- **Styling:** Tailwind CSS v4 via `@tailwindcss/vite`
- **Hosting:** Vercel (static, `@astrojs/vercel` adapter for 301 redirects)
- **DNS:** Cloudflare (DNS-only mode, no proxy)
- **Repo:** GitHub (`alttoby7/fidohikes`, `main` branch = production)
- **Location:** `/home/trisha/dev/fidohikes/`

## Site Overview

- **Domain:** fidohikes.com
- **Type:** Content blog about hiking, camping, and outdoor adventures with dogs
- **Target Audience:** All dog owners who hike, camp, or do outdoor activities with their dogs
- **Monetization:** Affiliate (Amazon Associates tag: `fidohikes-20`), gear reviews

## Architecture

### Content Collections (src/content.config.ts)
- **pages** — MDX articles in `src/content/pages/{pillar}/` (glob loader)
- **pillars** — 8 JSON files in `src/content/pillars/`
- **clusters** — 52 JSON files in `src/content/clusters/`
- **products** — Product data JSON in `src/content/products/`

### Content Schema
One `pages` collection with discriminated `format` field:
- `guide` — Base fields only
- `listicle` — listItems[], comparisonProducts[]
- `review` — product, rating, verdict, bestFor[], notFor[]
- `destination_guide` — locationName, state, lat/lng, difficulty, dogRules, bestSeasons
- `how_to` — stepCount, estimatedTime, difficulty, tools[], supplies[]

All pages have: title, slug, format, pageRole, pillar, cluster, targetKeyword, secondaryKeywords, status, faqs[], affiliate

### Routing
- `[...slug].astro` — Catch-all renders both pillar hubs and content pages
- Pillar slugs (gear, apparel, hiking, camping, water, safety, training, destinations) → PillarHub component
- Content page slugs → ArticleLayout component
- WordPress ranking pages keep root-level slugs (e.g., `/mushers-secret/`, `/when-to-hike-with-puppy/`)
- New content uses pillar-prefixed URLs (e.g., `/gear/best-dog-harness/`)
- Reserved routes excluded from catch-all: tools/*, about, contact, affiliate-disclosure, editorial-policy, privacy-policy, 404

### JSON-LD Schema
- SiteSchema (WebSite + Organization) — sitewide
- ArticleSchema — all content pages
- BreadcrumbSchema — all content + pillar pages
- FAQSchema — pages with faqs[]
- ReviewSchema, HowToSchema, ItemListSchema — format-specific (use in MDX or layouts)

### Key Design Decisions
1. `trailingSlash: 'always'` — matches WordPress URL structure
2. Astro Content Layer API with glob loaders (not legacy type:'content')
3. Registry pattern in `src/lib/registry.ts` for content graph queries
4. Affiliate links use `rel="nofollow noopener sponsored"` + `target="_blank"`
5. Static output — no SSR needed

## Colors & Fonts
- **Forest:** #2d5016 (primary), #1a3a0a (dark)
- **Trail:** #8b6914 (accent), #d4a843 (light)
- **Earth:** #3e2723 (headings), #5d4037 (subheadings)
- **Fonts:** Inter (body), Plus Jakarta Sans (headings)

## WordPress Migration (SEO-Preserving)

### Tier 1: Keep URL, refresh content (6 ranking pages)
| URL | Position | Action |
|-----|----------|--------|
| `/when-to-hike-with-puppy/` | 7.5 | Rewrite in MDX (**done**) |
| `/mushers-secret/` | 7.2 | Rewrite as review (**done**) |
| `/hiking-dog-calorie-needs-with-dog-food-calculator/` | 10.4 | Rebuild calculator |
| `/hammock-camping-with-your-dog-guide/` | 11.5 | Rewrite |
| `/waterproof-backpacking-dog-collar/` | 14.5 | Rewrite |
| `/honest-kitchen-dehydrated-dog-food-review/` | 15.3 | Rewrite |

### Tier 2: Keep URL, rewrite (7 pages)
`/dog-gear-list-for-long-distance-or-thru-hiking-with-a-dog/`, `/thru-hike-with-a-dog/`, `/10-national-parks-you-can-hike-with-your-dog/`, `/dog-first-aid-kit/`, `/backpacking-with-your-dog/`, `/hiking-dog-health/`, `/dog-hiking-gear/`

### Tier 3: 301 Redirects (in src/data/redirects.ts)
`/rideshare-with-dogs/` → `/destinations/`, `/guide-to-hike-the-appalachian-trail-with-a-dog/` → `/hiking/appalachian-trail-with-dog/`, `/dogs-on-the-appalachian-trail/` → `/hiking/appalachian-trail-with-dog/`, `/blog/` → `/`, `/guides/` → `/`

## Commands

```bash
npm run dev      # Local dev server
npm run build    # Production build
npm run preview  # Preview production build locally
```

## Adding Content

1. Create MDX file in `src/content/pages/{pillar}/filename.mdx`
2. Add frontmatter matching the schema (title, slug, format, pageRole, pillar, cluster, targetKeyword, status)
3. Set `status: 'published'` when ready to go live
4. `npm run build` validates schema automatically
5. Push to main → Vercel auto-deploys

## Topical Map

- **Location:** `02-areas/seo/topical-maps/fidohikes.com/`
- **Generated:** 2026-03-17
- **Data source:** DataForSEO Labs API

| Metric | Value |
|--------|-------|
| Total pages planned | 239 |
| Total keywords targeted | 3,201 |
| Combined search volume | 16,154,120 |
| Average keyword difficulty | 5.3 |

### 8 Pillars
1. **gear** — Dog Hiking Gear (2.2M vol)
2. **apparel** — Dog Apparel & Weather Protection (1.4M vol)
3. **hiking** — Hiking with Dogs (273K vol)
4. **camping** — Camping with Dogs (75K vol)
5. **water** — Dog Water Activities (404K vol)
6. **safety** — Dog Trail Safety & Health (336K vol)
7. **training** — Dog Training for Trails (72K vol)
8. **destinations** — Dog-Friendly Destinations & Travel (2.3M vol)

## Key Files

| File | Purpose |
|------|---------|
| `src/content.config.ts` | Content collection schemas |
| `src/lib/registry.ts` | Content graph queries (bySlug, byPillar, breadcrumbs) |
| `src/lib/affiliateUrl.ts` | Amazon tag builder |
| `src/data/redirects.ts` | WordPress → Astro URL map |
| `src/pages/[...slug].astro` | Catch-all route for all content |
| `src/components/ArticleLayout.astro` | Article wrapper with breadcrumbs, TOC, related |
| `src/components/PillarHub.astro` | Pillar hub page component |
| `astro.config.mjs` | Astro config with Vercel adapter |

Topical map files: `/home/trisha/google-drive/0-AI/02-areas/seo/topical-maps/fidohikes.com/`
