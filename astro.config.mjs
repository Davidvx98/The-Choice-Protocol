import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';
import compressor from 'astro-compressor';

export default defineConfig({
  site: 'https://the-choice-protocol.com',
  compressHTML: true,
  integrations: [
    sitemap({
      i18n: {
        defaultLocale: 'es',
        locales: {
          es: 'es-ES',
          en: 'en-US',
        },
      },
      filter: (page) => !page.includes('/api/'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date(),
    }),
    compressor({ gzip: true, brotli: true }),
  ],
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  devToolbar: { enabled: false },
  vite: {
    build: {
      cssMinify: true,
      minify: 'esbuild',
    },
  },
});
