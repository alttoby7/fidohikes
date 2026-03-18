import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const pillarSlugs = ['gear', 'apparel', 'hiking', 'camping', 'water', 'safety', 'training', 'destinations'] as const;
const formatTypes = ['guide', 'listicle', 'review', 'destination_guide', 'how_to'] as const;
const pageRoles = ['pillar', 'cluster', 'supporting'] as const;
const funnelStages = ['awareness', 'consideration', 'decision'] as const;

const seoSchema = z.object({
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  ogImage: z.string().optional(),
});

const faqSchema = z.object({
  question: z.string(),
  answer: z.string(),
});

const affiliateSchema = z.object({
  enabled: z.boolean().default(false),
  products: z.array(z.string()).optional(),
});

// Base fields shared by all formats
const baseFields = {
  title: z.string(),
  slug: z.string(),
  format: z.enum(formatTypes),
  pageRole: z.enum(pageRoles),
  pillar: z.enum(pillarSlugs),
  cluster: z.string().optional(),
  seo: seoSchema.optional(),
  excerpt: z.string().optional(),
  targetKeyword: z.string(),
  secondaryKeywords: z.array(z.string()).default([]),
  status: z.enum(['draft', 'review', 'published']).default('draft'),
  publishedDate: z.coerce.date().optional(),
  updatedDate: z.coerce.date().optional(),
  heroImage: z.string().optional(),
  relatedPages: z.array(z.string()).default([]),
  faqs: z.array(faqSchema).default([]),
  affiliate: affiliateSchema.optional(),
  funnelStage: z.enum(funnelStages).default('awareness'),
  // Listicle
  listItems: z.array(z.string()).optional(),
  comparisonProducts: z.array(z.string()).optional(),
  // Review
  product: z.string().optional(),
  rating: z.number().min(0).max(5).optional(),
  verdict: z.string().optional(),
  bestFor: z.array(z.string()).optional(),
  notFor: z.array(z.string()).optional(),
  // Destination guide
  locationName: z.string().optional(),
  state: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
  trailLength: z.string().optional(),
  difficulty: z.enum(['easy', 'moderate', 'hard', 'expert']).optional(),
  dogRules: z.string().optional(),
  bestSeasons: z.array(z.string()).optional(),
  // How-to
  stepCount: z.number().optional(),
  estimatedTime: z.string().optional(),
  tools: z.array(z.string()).optional(),
  supplies: z.array(z.string()).optional(),
};

const pages = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/pages' }),
  schema: z.object(baseFields),
});

const pillars = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/pillars' }),
  schema: z.object({
    name: z.string(),
    slug: z.enum(pillarSlugs),
    description: z.string(),
    primaryKeyword: z.string(),
    combinedVolume: z.number(),
    avgDifficulty: z.number(),
    order: z.number(),
  }),
});

const clusters = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/clusters' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    pillar: z.enum(pillarSlugs),
    description: z.string(),
    primaryKeyword: z.string(),
    combinedVolume: z.number(),
    avgDifficulty: z.number().optional(),
    contentFormat: z.enum(formatTypes),
  }),
});

const products = defineCollection({
  loader: glob({ pattern: '*.json', base: './src/content/products' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    brand: z.string().optional(),
    category: z.string(),
    asin: z.string().optional(),
    affiliateUrl: z.string().optional(),
    image: z.string().optional(),
    price: z.string().optional(),
    rating: z.number().min(0).max(5).optional(),
    pros: z.array(z.string()).default([]),
    cons: z.array(z.string()).default([]),
    description: z.string().optional(),
  }),
});

export const collections = { pages, pillars, clusters, products };
