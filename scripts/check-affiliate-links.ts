import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  affiliateProducts,
  affiliateProductMap,
} from '../src/lib/affiliate-registry-node.ts';
import { trackingBuckets } from '../src/lib/affiliate-types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const contentRoot = path.join(projectRoot, 'src', 'content', 'pages');

const validTrackingBuckets = new Set(trackingBuckets);

async function getMdxFiles(dir: string): Promise<string[]> {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const entryPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      return getMdxFiles(entryPath);
    }
    return entry.isFile() && entry.name.endsWith('.mdx') ? [entryPath] : [];
  }));
  return files.flat();
}

function extractFrontmatter(source: string): string {
  const match = source.match(/^---\n([\s\S]*?)\n---/);
  return match?.[1] ?? '';
}

function getBoolean(frontmatter: string, key: string): boolean | undefined {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*(true|false)\\s*$`, 'm'));
  return match ? match[1] === 'true' : undefined;
}

function getString(frontmatter: string, key: string): string | undefined {
  const match = frontmatter.match(new RegExp(`^${key}:\\s*"([^"]+)"\\s*$`, 'm'));
  return match?.[1];
}

function getAffiliateProducts(frontmatter: string): string[] {
  const match = frontmatter.match(/^affiliateProducts:\s*\n((?:\s+-\s+.+\n?)*)/m);
  if (!match) {
    return [];
  }

  return Array.from(match[1].matchAll(/^\s+-\s+["']?([^"'\n]+)["']?\s*$/gm)).map(
    ([, productId]) => productId.trim(),
  );
}

function getLegacyAffiliateEnabled(frontmatter: string): boolean {
  const block = frontmatter.match(/^affiliate:\s*\n([\s\S]*?)(?=^[A-Za-z][\w-]*:\s|\Z)/m);
  if (!block) {
    return false;
  }
  return /^\s+enabled:\s*true\s*$/m.test(block[1]);
}

function getComponentProductIds(source: string): string[] {
  return Array.from(
    source.matchAll(/<Amazon(?:Link|Button|ProductCard)\b[^>]*\bproduct=(["'])([^"']+)\1/g),
  ).map(([, , productId]) => productId);
}

function getComponentUsages(source: string): Array<{ productId: string; destinationMode?: string }> {
  return Array.from(source.matchAll(/<Amazon(?:Link|Button|ProductCard)\b([^>]*)\/?>/g)).flatMap(([, attrs]) => {
    const productMatch = attrs.match(/\bproduct=(["'])([^"']+)\1/);
    if (!productMatch) {
      return [];
    }
    const destinationModeMatch = attrs.match(/\bdestinationMode=(["'])([^"']+)\1/);
    return [{
      productId: productMatch[2],
      destinationMode: destinationModeMatch?.[2],
    }];
  });
}

function validateRegistry(errors: string[]): void {
  const seenAsins = new Map<string, string>();

  for (const product of affiliateProducts) {
    for (const field of [
      'productId',
      'asin',
      'title',
      'category',
      'defaultTrackingBucket',
      'image',
      'status',
    ] as const) {
      if (!product[field]) {
        errors.push(`Registry product "${product.productId}" is missing required field "${field}".`);
      }
    }

    if (!validTrackingBuckets.has(product.defaultTrackingBucket)) {
      errors.push(
        `Registry product "${product.productId}" uses unknown tracking bucket "${product.defaultTrackingBucket}".`,
      );
    }

    if (seenAsins.has(product.asin)) {
      errors.push(
        `Duplicate ASIN "${product.asin}" found for "${product.productId}" and "${seenAsins.get(product.asin)}".`,
      );
    } else {
      seenAsins.set(product.asin, product.productId);
    }

    if (product.urlVueSlug && !product.asin) {
      errors.push(`Registry product "${product.productId}" enables URL Vue without an Amazon fallback ASIN.`);
    }

    if (product.status === 'active' && product.image === '/images/logo/pawprint.png') {
      errors.push(`Registry product "${product.productId}" is active but still uses the placeholder pawprint image.`);
    }
  }
}

async function validateContent(errors: string[]): Promise<void> {
  const files = await getMdxFiles(contentRoot);

  for (const file of files) {
    const source = await readFile(file, 'utf8');
    const frontmatter = extractFrontmatter(source);
    const relativePath = path.relative(projectRoot, file);

    if (/https?:\/\/(?:www\.)?amazon\.com\//i.test(source)) {
      errors.push(`${relativePath}: raw Amazon URLs are not allowed; use affiliate components instead.`);
    }

    const hasAffiliateLinks = getBoolean(frontmatter, 'hasAffiliateLinks') ?? false;
    const affiliateBucket = getString(frontmatter, 'affiliateBucket');
    const affiliateProductsInFrontmatter = getAffiliateProducts(frontmatter);
    const componentProducts = getComponentProductIds(source);
    const componentUsages = getComponentUsages(source);
    const legacyAffiliateEnabled = getLegacyAffiliateEnabled(frontmatter);
    const hasAffiliateSignals =
      hasAffiliateLinks ||
      legacyAffiliateEnabled ||
      affiliateProductsInFrontmatter.length > 0 ||
      componentProducts.length > 0;

    const allProductIds = new Set([...affiliateProductsInFrontmatter, ...componentProducts]);
    for (const productId of allProductIds) {
      if (!affiliateProductMap.has(productId)) {
        errors.push(`${relativePath}: unknown affiliate productId "${productId}".`);
      }
    }

    for (const usage of componentUsages) {
      if (usage.destinationMode === 'urlvue') {
        const product = affiliateProductMap.get(usage.productId);
        if (!product?.urlVueSlug) {
          errors.push(
            `${relativePath}: product "${usage.productId}" uses destinationMode="urlvue" but has no urlVueSlug fallback config.`,
          );
        }
      }
    }

    if (!hasAffiliateSignals) {
      continue;
    }

    if (componentProducts.length === 0) {
      errors.push(`${relativePath}: affiliate content must include at least one AmazonLink, AmazonButton, or AmazonProductCard.`);
    }

    if (!hasAffiliateLinks) {
      errors.push(`${relativePath}: affiliate content must set hasAffiliateLinks: true.`);
    }

    if (!affiliateBucket) {
      errors.push(`${relativePath}: affiliate content must set affiliateBucket.`);
    } else if (!validTrackingBuckets.has(affiliateBucket)) {
      errors.push(`${relativePath}: affiliateBucket "${affiliateBucket}" is not valid.`);
    }
  }
}

async function main(): Promise<void> {
  const errors: string[] = [];

  validateRegistry(errors);
  await validateContent(errors);

  if (errors.length > 0) {
    console.error('Affiliate validation failed:\n');
    for (const error of errors) {
      console.error(`- ${error}`);
    }
    process.exit(1);
  }

  console.log(`Affiliate validation passed for ${affiliateProducts.length} registry products.`);
}

await main();
