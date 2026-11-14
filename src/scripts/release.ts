import { fromGitHub, formatDate, mb, RELEASE_API, type Release, type Slot } from '../lib/assets';
import { store } from './util';

/**
 * The page is built with the release that was latest then. This asks GitHub for the latest one
 * (at most once an hour per visitor) and swaps in its version, date, links, file names and sizes.
 * If GitHub cannot be reached, the built values stay.
 */
export function initRelease() {
  if (!document.querySelector('[data-rel], [data-asset]')) return;
  load().then(render).catch(() => {});
}

async function load(): Promise<Release> {
  const session = store('session');
  try {
    const cached = JSON.parse(session.get('orqwa-release') ?? 'null');
    if (cached && Date.now() - cached.at < 3_600_000) return cached.release;
  } catch { /* fetch again */ }
  const res = await fetch(RELEASE_API, { headers: { Accept: 'application/vnd.github+json' } });
  if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
  const release = fromGitHub(await res.json());
  session.set('orqwa-release', JSON.stringify({ at: Date.now(), release }));
  return release;
}

function render(rel: Release) {
  const locale = document.documentElement.lang === 'de' ? 'de-CH' : 'en-GB';
  document.querySelectorAll<HTMLElement>('[data-rel="version"]').forEach((el) => (el.textContent = rel.version));
  document.querySelectorAll<HTMLElement>('[data-rel="date"]').forEach((el) => (el.textContent = formatDate(rel.date, locale)));
  const asset = (el: HTMLElement, key: string) => rel.assets[el.dataset[key] as Slot];
  document.querySelectorAll<HTMLAnchorElement>('a[data-asset]').forEach((a) => {
    const found = asset(a, 'asset');
    if (found) a.href = found.url;
  });
  document.querySelectorAll<HTMLElement>('[data-asset-name]').forEach((el) => {
    const found = asset(el, 'assetName');
    if (found) el.textContent = found.name;
  });
  document.querySelectorAll<HTMLElement>('[data-asset-size]').forEach((el) => {
    const found = asset(el, 'assetSize');
    if (found) el.textContent = mb(found.size);
  });
}
