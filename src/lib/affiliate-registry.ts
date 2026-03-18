import type { AffiliateProduct } from '@/lib/affiliate-types';

const productModules = import.meta.glob('../content/affiliate-products/*.json', {
  eager: true,
  import: 'default',
});

export const affiliateProducts = Object.values(productModules) as AffiliateProduct[];

export const affiliateProductMap = new Map(
  affiliateProducts.map((product) => [product.productId, product]),
);
