import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://the-choice-protocol.com',
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
    }),
  ],
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  devToolbar: { enabled: false },
});
