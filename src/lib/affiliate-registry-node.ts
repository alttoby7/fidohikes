import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import type { AffiliateProduct } from './affiliate-types';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
export const affiliateProductsDirectory = path.resolve(__dirname, '../content/affiliate-products');

function loadAffiliateProducts(): AffiliateProduct[] {
  return readdirSync(affiliateProductsDirectory)
    .filter((file) => file.endsWith('.json'))
    .sort()
    .map((file) => {
      const source = readFileSync(path.join(affiliateProductsDirectory, file), 'utf8');
      return JSON.parse(source) as AffiliateProduct;
    });
}

export const affiliateProducts = loadAffiliateProducts();

export const affiliateProductMap = new Map(
  affiliateProducts.map((product) => [product.productId, product]),
);
