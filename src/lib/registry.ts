import { getCollection } from 'astro:content';
import type { CollectionEntry } from 'astro:content';

export type Page = CollectionEntry<'pages'>;
export type Pillar = CollectionEntry<'pillars'>;
export type Cluster = CollectionEntry<'clusters'>;

let _pages: Page[] | null = null;
let _pillars: Pillar[] | null = null;
let _clusters: Cluster[] | null = null;

async function loadPages() {
  if (!_pages) _pages = await getCollection('pages');
  return _pages;
}

async function loadPillars() {
  if (!_pillars) _pillars = await getCollection('pillars');
  return _pillars;
}

async function loadClusters() {
  if (!_clusters) _clusters = await getCollection('clusters');
  return _clusters;
}

/** Get all published pages */
export async function getPublishedPages() {
  const pages = await loadPages();
  return pages.filter((p) => p.data.status === 'published');
}

/** Get a page by its slug */
export async function getPageBySlug(slug: string) {
  const pages = await loadPages();
  return pages.find((p) => p.data.slug === slug);
}

/** Get all pages for a pillar */
export async function getPagesByPillar(pillarSlug: string) {
  const pages = await loadPages();
  return pages.filter((p) => p.data.pillar === pillarSlug && p.data.status === 'published');
}

/** Get all pages for a cluster */
export async function getPagesByCluster(clusterSlug: string) {
  const pages = await loadPages();
  return pages.filter((p) => p.data.cluster === clusterSlug && p.data.status === 'published');
}

/** Get pillar data by slug */
export async function getPillarBySlug(slug: string) {
  const pillars = await loadPillars();
  return pillars.find((p) => p.data.slug === slug);
}

/** Get all clusters for a pillar */
export async function getClustersByPillar(pillarSlug: string) {
  const clusters = await loadClusters();
  return clusters.filter((c) => c.data.pillar === pillarSlug);
}

/** Build breadcrumb trail for a page */
export async function getBreadcrumbs(page: Page) {
  const crumbs: { label: string; href: string }[] = [{ label: 'Home', href: '/' }];

  const pillars = await loadPillars();
  const pillar = pillars.find((p) => p.data.slug === page.data.pillar);
  if (pillar) {
    crumbs.push({ label: pillar.data.name, href: `/${pillar.data.slug}/` });
  }

  if (page.data.cluster) {
    const clusters = await loadClusters();
    const cluster = clusters.find((c) => c.data.slug === page.data.cluster);
    if (cluster) {
      crumbs.push({ label: cluster.data.name, href: `/${page.data.pillar}/${cluster.data.slug}/` });
    }
  }

  crumbs.push({ label: page.data.title, href: `/${page.data.slug}/` });
  return crumbs;
}

/** Get related pages for a given page */
export async function getRelatedPages(page: Page, limit = 4) {
  const pages = await loadPages();
  const related = page.data.relatedPages;
  if (related.length > 0) {
    return pages.filter((p) => related.includes(p.data.slug) && p.data.status === 'published').slice(0, limit);
  }
  // Fallback: same cluster or pillar
  return pages
    .filter(
      (p) =>
        p.data.slug !== page.data.slug &&
        p.data.status === 'published' &&
        (p.data.cluster === page.data.cluster || p.data.pillar === page.data.pillar)
    )
    .slice(0, limit);
}
