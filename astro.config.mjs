// @ts-check
import { defineConfig } from 'astro/config';

// SITE_URL and BASE_PATH come from the Pages workflow (actions/configure-pages), so the site
// works on orqwa.github.io, on a project path or on its own domain.
export default defineConfig({
  site: process.env.SITE_URL || 'https://orqwa.github.io',
  base: process.env.BASE_PATH || '/',
  trailingSlash: 'always',
  build: { format: 'directory' },
  // Listen on all interfaces, so the dev container can forward the port.
  server: { host: true },
  vite: {
    // Screenshots are read from ../orqwa/docs through the orqwa-docs link.
    server: { fs: { allow: ['..'] } },
  },
});
