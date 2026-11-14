import type { APIRoute } from 'astro';
import { pageUrl, type Lang, type Page } from '../i18n';

const pages: Page[] = ['home', 'how', 'download', 'credits', 'privacy'];
const langs: Lang[] = ['en', 'de'];

/** Every page in both languages, each listing its translations, for search engines. */
export const GET: APIRoute = ({ site }) => {
  const url = (lang: Lang, page: Page) => new URL(pageUrl(lang, page), site).href;
  const entries = pages.flatMap((page) =>
    langs.map((lang) => `  <url>
    <loc>${url(lang, page)}</loc>
${langs.map((l) => `    <xhtml:link rel="alternate" hreflang="${l}" href="${url(l, page)}"/>`).join('\n')}
    <xhtml:link rel="alternate" hreflang="x-default" href="${url('en', page)}"/>
  </url>`),
  );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.join('\n')}
</urlset>
`;
  return new Response(xml, { headers: { 'Content-Type': 'application/xml' } });
};
