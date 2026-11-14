import type { APIRoute } from 'astro';
import { asset } from '../i18n';

// Only read at the domain's root, so it counts when the site has its own domain or is orqwa.github.io.
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nSitemap: ${new URL(asset('sitemap.xml'), site).href}\n`, {
    headers: { 'Content-Type': 'text/plain' },
  });
