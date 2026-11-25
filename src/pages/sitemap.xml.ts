import type { APIRoute } from 'astro';
import { pageUrl, type Lang, type Page } from '../i18n';

const pages: Page[] = ['home', 'how', 'download', 'alternatives', 'credits', 'privacy'];
const langs: Lang[] = ['en', 'de'];

/**
 * Every page in both languages, for search engines. The hreflang alternates live in each page's
 * <head>; repeating them here as xhtml:link would make browsers render the sitemap as plain text.
 */
export const GET: APIRoute = ({ site }) => {
  const entries = pages.flatMap((page) =>
    langs.map((lang) => `  <url>
    <loc>${new URL(pageUrl(lang, page), site).href}</loc>
  </url>`),
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
