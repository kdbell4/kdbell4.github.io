import { defineConfig } from 'astro/config';
import vue from '@astrojs/vue';

export default defineConfig({
  site: 'https://kdbell4.github.io',
  integrations: [vue()],
});
