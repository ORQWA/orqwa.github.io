import de from './de.json';
import deAttr from './de-attr.json';
import deExtra from './de-extra.json';

export type Lang = 'en' | 'de';
export type Page = 'home' | 'how' | 'download' | 'credits';

const DE: Record<string, string> = { ...de, ...deAttr, ...deExtra };
const norm = (s: string) => s.replace(/\s+/g, ' ').trim();
const missing = new Set<string>();

/** The German text for an English string, keyed by the English text itself. */
export function t(lang: Lang, en: string): string {
  if (lang === 'en') return en;
  const key = norm(en);
  const de = DE[key];
  if (de !== undefined) return de;
  if (!missing.has(key)) {
    missing.add(key);
    console.warn(`[i18n] no German text for: ${key}`);
  }
  return en;
}

const base = import.meta.env.BASE_URL.replace(/\/?$/, '/');
const slugs: Record<Page, string> = { home: '', how: 'how-it-works/', download: 'download/', credits: 'credits/' };

/** The URL of a page in a language, e.g. /de/download/. */
export const pageUrl = (lang: Lang, page: Page, hash = '') =>
  `${base}${lang === 'de' ? 'de/' : ''}${slugs[page]}${hash}`;

export const asset = (path: string) => base + path.replace(/^\//, '');

export const dateLocale = (lang: Lang) => (lang === 'de' ? 'de-CH' : 'en-GB');
