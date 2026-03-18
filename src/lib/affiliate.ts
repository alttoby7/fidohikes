import {
  affiliateProductMap,
} from '@/lib/affiliate-registry';
import type {
  AffiliateProduct,
  DestinationMode,
  LinkPlacement,
  LinkType,
  TrackingBucket,
} from '@/lib/affiliate-types';

const DEFAULT_AMAZON_TAG = 'fidohikes-20';
const URLVUE_ENABLED = import.meta.env.PUBLIC_ENABLE_URLVUE === 'true';
const URLVUE_BASE_URL = import.meta.env.PUBLIC_URLVUE_BASE_URL;

const trackingBucketMap: Record<TrackingBucket, string> = {
  reviews: DEFAULT_AMAZON_TAG,
  comparisons: DEFAULT_AMAZON_TAG,
  info: DEFAULT_AMAZON_TAG,
  homepage: DEFAULT_AMAZON_TAG,
  email: DEFAULT_AMAZON_TAG,
  social: DEFAULT_AMAZON_TAG,
};

export interface AffiliateHrefOptions {
  trackingBucket?: TrackingBucket;
  destinationMode?: DestinationMode;
  placement?: LinkPlacement;
  linkType?: LinkType;
  articleSlug?: string;
  ctaText?: string;
}

export function getAffiliateProduct(productId: string): AffiliateProduct | undefined {
  return affiliateProductMap.get(productId);
}

export function buildAmazonUrl(asin: string, trackingId: string): string {
  const url = new URL(`https://www.amazon.com/dp/${asin}`);
  url.searchParams.set('tag', trackingId);
  return url.toString();
}

export function getTrackingId(bucket: TrackingBucket): string {
  return trackingBucketMap[bucket] ?? DEFAULT_AMAZON_TAG;
}

export function getUrlVueHref(productId: string, trackingBucket?: TrackingBucket): string {
  const product = getAffiliateProduct(productId);
  if (!product) {
    throw new Error(`Unknown affiliate product: ${productId}`);
  }

  if (!URLVUE_ENABLED || !URLVUE_BASE_URL || !product.urlVueSlug) {
    return buildAmazonUrl(product.asin, getTrackingId(trackingBucket ?? product.defaultTrackingBucket));
  }

  const url = new URL(`/${product.urlVueSlug.replace(/^\/+/, '')}`, URLVUE_BASE_URL);
  url.searchParams.set('fallback', 'amazon');
  return url.toString();
}

export function getAffiliateHref(productId: string, options: AffiliateHrefOptions = {}): string {
  const product = getAffiliateProduct(productId);
  if (!product) {
    throw new Error(`Unknown affiliate product: ${productId}`);
  }

  const bucket = options.trackingBucket ?? product.defaultTrackingBucket;
  const destinationMode = options.destinationMode ?? 'amazon';

  if (destinationMode === 'urlvue') {
    return getUrlVueHref(productId, bucket);
  }

  const url = new URL(buildAmazonUrl(product.asin, getTrackingId(bucket)));
  if (options.placement) {
    url.searchParams.set('fh_placement', options.placement);
  }
  if (options.linkType) {
    url.searchParams.set('fh_link_type', options.linkType);
  }
  if (options.articleSlug) {
    url.searchParams.set('fh_article', options.articleSlug);
  }
  if (options.ctaText) {
    url.searchParams.set('fh_cta', options.ctaText);
  }
  return url.toString();
}

export function isAffiliateDestinationMode(value: string): value is DestinationMode {
  return value === 'amazon' || value === 'urlvue';
}

export { DEFAULT_AMAZON_TAG, URLVUE_BASE_URL, URLVUE_ENABLED };
