import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

import { redirects } from './src/data/redirects.ts';

export default defineConfig({
  site: 'https://fidohikes.com',
  output: 'static',
  trailingSlash: 'always',
  adapter: vercel(),
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
  redirects,
});
