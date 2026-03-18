import { existsSync } from 'node:fs';
import { writeFile } from 'node:fs/promises';
import path from 'node:path';
import readline from 'node:readline/promises';
import { stdin as input, stdout as output } from 'node:process';
import { fileURLToPath } from 'node:url';

import {
  affiliateProducts,
  affiliateProductsDirectory,
} from '../src/lib/affiliate-registry-node.ts';
import { trackingBuckets, type TrackingBucket } from '../src/lib/affiliate-types.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');
const DEFAULT_IMAGE = '/images/logo/pawprint.png';

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function isValidAsin(value: string): boolean {
  return /^[A-Z0-9]{10}$/.test(value.trim().toUpperCase());
}

function buildProductSource(product: {
  productId: string;
  asin: string;
  title: string;
  category: string;
  defaultTrackingBucket: TrackingBucket;
  image: string;
  urlVueSlug?: string;
  notes?: string;
}): string {
  return `${JSON.stringify({
    productId: product.productId,
    asin: product.asin,
    title: product.title,
    category: product.category,
    defaultTrackingBucket: product.defaultTrackingBucket,
    image: product.image,
    status: 'active',
    ...(product.urlVueSlug ? { urlVueSlug: product.urlVueSlug } : {}),
    ...(product.notes ? { notes: product.notes } : {}),
  }, null, 2)}\n`;
}

async function promptUntilValid(
  rl: readline.Interface,
  label: string,
  validate: (value: string) => string | undefined,
): Promise<string> {
  while (true) {
    const value = (await rl.question(label)).trim();
    const error = validate(value);
    if (!error) {
      return value;
    }
    console.log(error);
  }
}

async function main(): Promise<void> {
  const rl = readline.createInterface({ input, output });

  try {
    const asin = (await promptUntilValid(
      rl,
      'ASIN: ',
      (value) => {
        if (!value) {
          return 'ASIN is required.';
        }
        if (!isValidAsin(value)) {
          return 'ASIN must be 10 uppercase letters/numbers.';
        }
        if (affiliateProducts.some((product) => product.asin === value.toUpperCase())) {
          return `ASIN "${value.toUpperCase()}" already exists in the registry.`;
        }
        return undefined;
      },
    )).toUpperCase();

    const title = await promptUntilValid(rl, 'Title: ', (value) => {
      if (!value) {
        return 'Title is required.';
      }
      return undefined;
    });

    const suggestedProductId = slugify(title);
    const productId = await promptUntilValid(
      rl,
      `Product ID [${suggestedProductId}]: `,
      (value) => {
        const candidate = value || suggestedProductId;
        if (!candidate) {
          return 'Product ID cannot be empty.';
        }
        if (!/^[a-z0-9-]+$/.test(candidate)) {
          return 'Product ID must use lowercase letters, numbers, and hyphens only.';
        }
        if (affiliateProducts.some((product) => product.productId === candidate)) {
          return `Product ID "${candidate}" already exists in the registry.`;
        }
        return undefined;
      },
    );
    const finalProductId = productId || suggestedProductId;

    const category = await promptUntilValid(rl, 'Category: ', (value) => {
      if (!value) {
        return 'Category is required.';
      }
      return undefined;
    });

    const bucketList = trackingBuckets.join(', ');
    const defaultBucket = await promptUntilValid(
      rl,
      `Tracking bucket (${bucketList}): `,
      (value) => {
        if (!value) {
          return 'Tracking bucket is required.';
        }
        if (!trackingBuckets.includes(value as TrackingBucket)) {
          return `Tracking bucket must be one of: ${bucketList}.`;
        }
        return undefined;
      },
    );

    const urlVueSlug = (await rl.question('URL Vue slug (optional): ')).trim();
    const image = await promptUntilValid(
      rl,
      `Image path (optional, default ${DEFAULT_IMAGE}): `,
      (value) => {
        if (!value) {
          return undefined;
        }
        if (!value.startsWith('/')) {
          return 'Image path must start with /.';
        }
        const imagePath = path.join(projectRoot, 'public', value.replace(/^\/+/, ''));
        if (!existsSync(imagePath)) {
          return `Image file does not exist at public path "${value}".`;
        }
        return undefined;
      },
    );
    const notes = (await rl.question('Notes (optional): ')).trim();

    const finalProductIdValue = finalProductId || suggestedProductId;
    const productSource = buildProductSource({
      productId: finalProductIdValue,
      asin,
      title,
      category,
      defaultTrackingBucket: defaultBucket as TrackingBucket,
      image: image || DEFAULT_IMAGE,
      urlVueSlug: urlVueSlug || undefined,
      notes: notes || undefined,
    });
    const outputPath = path.join(affiliateProductsDirectory, `${finalProductIdValue}.json`);
    await writeFile(outputPath, productSource);

    console.log('\nAdded affiliate product:');
    console.log(`- productId: ${finalProductIdValue}`);
    console.log(`- asin: ${asin}`);
    console.log(`- title: ${title}`);
    console.log(`- image: ${image || DEFAULT_IMAGE}`);
    console.log(`- file: ${path.relative(projectRoot, outputPath)}`);
    console.log('\nNext steps:');
    console.log('- Add the productId to page frontmatter under affiliateProducts.');
    console.log('- Use AmazonLink/AmazonButton/AmazonProductCard in MDX.');
    console.log('- Run `npm run affiliate:check`.');
  } finally {
    rl.close();
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
