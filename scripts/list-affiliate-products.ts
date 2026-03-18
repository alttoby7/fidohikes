import {
  affiliateProducts,
} from '../src/lib/affiliate-registry-node.ts';
import { trackingBuckets } from '../src/lib/affiliate-types.ts';

const query = process.argv.slice(2).join(' ').trim().toLowerCase();

const products = affiliateProducts.filter((product) => {
  if (!query) {
    return true;
  }

  return [
    product.productId,
    product.title,
    product.category,
    product.asin,
    product.defaultTrackingBucket,
    product.notes ?? '',
  ].some((field) => field.toLowerCase().includes(query));
});

if (products.length === 0) {
  console.log(`No affiliate products matched "${query}".`);
  process.exit(0);
}

console.log(`Affiliate products (${products.length})`);
console.log(`Buckets: ${trackingBuckets.join(', ')}`);
console.log('');

for (const product of products) {
  console.log(`${product.productId}`);
  console.log(`  title: ${product.title}`);
  console.log(`  asin: ${product.asin}`);
  console.log(`  category: ${product.category}`);
  console.log(`  bucket: ${product.defaultTrackingBucket}`);
  console.log(`  image: ${product.image}`);
  if (product.notes) {
    console.log(`  notes: ${product.notes}`);
  }
  console.log('');
}
