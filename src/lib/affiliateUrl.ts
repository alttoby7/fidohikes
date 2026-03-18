import { buildAmazonUrl, DEFAULT_AMAZON_TAG } from '@/lib/affiliate';

export function amazonUrl(asin: string): string {
  return buildAmazonUrl(asin, DEFAULT_AMAZON_TAG);
}

export function affiliateUrl(merchant: string, url: string, params?: Record<string, string>): string {
  const u = new URL(url);
  if (merchant === 'amazon') {
    u.searchParams.set('tag', DEFAULT_AMAZON_TAG);
  }
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      u.searchParams.set(k, v);
    }
  }
  return u.toString();
}
