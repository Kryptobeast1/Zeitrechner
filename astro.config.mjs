// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';

export default defineConfig({
  site: 'https://zeit-rechner.com',
  i18n: {
    defaultLocale: 'de',
    locales: ['de', 'en'],
    routing: {
      prefixDefaultLocale: false,
    }
  },
  integrations: [
    react(),
  ],
  build: {
    format: 'directory',
  },
  trailingSlash: 'always',
});