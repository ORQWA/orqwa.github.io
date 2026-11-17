import type { APIRoute } from 'astro';
import { asset } from '../i18n';

// Only read at the domain's root, so it counts when the site has its own domain or is orqwa.github.io.
// Google Images skips the brand SVGs: the light logo is drawn for the dark page and turns
// unreadable as a search thumbnail on a light ground; logo.png is the one to show.
export const GET: APIRoute = ({ site }) =>
  new Response(`User-agent: *\nAllow: /\n\nUser-agent: Googlebot-Image\nDisallow: ${asset('brand/')}\n\nSitemap: ${new URL(asset('sitemap.xml'), site).href}\n`, {
    headers: { 'Content-Type': 'text/plain' },
  });
