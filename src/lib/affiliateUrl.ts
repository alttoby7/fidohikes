const AMAZON_TAG = 'fidohikes-20';

export function amazonUrl(asin: string): string {
  return `https://www.amazon.com/dp/${asin}?tag=${AMAZON_TAG}`;
}

export function affiliateUrl(merchant: string, url: string, params?: Record<string, string>): string {
  const u = new URL(url);
  if (merchant === 'amazon') {
    u.searchParams.set('tag', AMAZON_TAG);
  }
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      u.searchParams.set(k, v);
    }
  }
  return u.toString();
}
