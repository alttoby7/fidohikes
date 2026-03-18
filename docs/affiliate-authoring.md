# Affiliate Authoring

Use the affiliate components instead of pasting raw Amazon URLs into MDX.

Affiliate product records now live in `src/content/affiliate-products/*.json`, which makes them editable in Decap CMS as well as through the CLI.

## Quick Add Workflow

Use the CLI to add a product record:

```bash
npm run affiliate:add
```

The CLI prompts for:
- ASIN
- title
- category
- tracking bucket
- optional URL Vue slug
- optional notes

It auto-generates the `productId`, checks for duplicate ASINs and product IDs, and writes the new record to `src/content/affiliate-products/<productId>.json`.

It can also take a real image path. Active products should not ship with the pawprint placeholder image.

To browse or search existing products:

```bash
npm run affiliate:list
npm run affiliate:find harness
```

## Experimental Modes

Direct Amazon remains the default outbound path.

### URL Vue

- Product records may include `urlVueSlug`
- Components can opt into URL Vue with `destinationMode="urlvue"`
- Current controlled test pages:
  - `honest-kitchen-dehydrated-dog-food-review`
  - `gear/best-dog-harness-for-hiking` (single harness CTA only)
- URL Vue only activates when both of these env vars are set:

```bash
PUBLIC_ENABLE_URLVUE=true
PUBLIC_URLVUE_BASE_URL=https://your-urlvue-domain.example
```

If either the env flag or product slug is missing, links fall back to direct Amazon automatically.

### oneTag

oneTag is disabled by default and only loads when:

```bash
PUBLIC_ENABLE_ONETAG=true
PUBLIC_ONETAG_SCRIPT_SRC=https://your-onetag-script.example
PUBLIC_ONETAG_SITE_ID=your-site-id
```

Pages can opt out with `disableOneTag: true` in page frontmatter, and standalone policy pages already disable it explicitly.

## Examples

```mdx
import AmazonLink from '@/components/affiliate/AmazonLink.astro';
import AmazonButton from '@/components/affiliate/AmazonButton.astro';
import AmazonProductCard from '@/components/affiliate/AmazonProductCard.astro';

<AmazonLink product="mushers-secret" />

<AmazonButton
  product="ruffwear-front-range-harness"
  ctaText="Check price on Amazon"
/>

<AmazonProductCard product="honest-kitchen-dehydrated" />
```

## Frontmatter

Affiliate pages should set:

```yaml
hasAffiliateLinks: true
affiliateProducts:
  - "mushers-secret"
affiliateBucket: "reviews"
```

Keep legacy `affiliate.enabled` only while older pages are still migrating.
