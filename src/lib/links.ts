/** Build internal links with trailing slashes */
export function pageUrl(slug: string): string {
  const clean = slug.replace(/^\/|\/$/g, '');
  return `/${clean}/`;
}

export function pillarUrl(pillarSlug: string): string {
  return pageUrl(pillarSlug);
}

export function articleUrl(slug: string): string {
  return pageUrl(slug);
}

export function canonicalUrl(slug: string, site: string = 'https://fidohikes.com'): string {
  return `${site}${pageUrl(slug)}`;
}
