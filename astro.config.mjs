import { defineConfig } from 'astro/config';
import preact from '@astrojs/preact';

import vue from '@astrojs/vue';
import tailwind from '@astrojs/tailwind';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://rokitsky.ru',
  integrations: [preact(), vue(), tailwind(), sitemap()],
});
