import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';

export async function GET(context: APIContext) {
  const pages = await getCollection('pages');
  const published = pages
    .filter((p) => p.data.status === 'published')
    .sort((a, b) => {
      const da = a.data.publishedDate?.getTime() ?? 0;
      const db = b.data.publishedDate?.getTime() ?? 0;
      return db - da;
    });

  return rss({
    title: 'FidoHikes',
    description: 'Hiking, camping, and outdoor adventures with your dog.',
    site: context.site!,
    items: published.map((page) => ({
      title: page.data.title,
      description: page.data.excerpt ?? '',
      pubDate: page.data.publishedDate ?? new Date(),
      link: `/${page.data.slug}/`,
    })),
  });
}
