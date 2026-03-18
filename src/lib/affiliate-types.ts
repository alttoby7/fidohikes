export const trackingBuckets = [
  'reviews',
  'comparisons',
  'info',
  'homepage',
  'email',
  'social',
] as const;

export const destinationModes = ['amazon', 'urlvue'] as const;

export const linkPlacements = [
  'article-inline',
  'article-cta',
  'article-card',
  'homepage',
  'email',
  'social',
] as const;

export const linkTypes = ['text', 'button', 'card'] as const;

export type TrackingBucket = (typeof trackingBuckets)[number];
export type DestinationMode = (typeof destinationModes)[number];
export type LinkPlacement = (typeof linkPlacements)[number];
export type LinkType = (typeof linkTypes)[number];

export interface AffiliateProduct {
  productId: string;
  asin: string;
  title: string;
  category: string;
  defaultTrackingBucket: TrackingBucket;
  image: string;
  status: 'active' | 'draft' | 'disabled';
  urlVueSlug?: string;
  notes?: string;
}
