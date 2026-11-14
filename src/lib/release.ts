import { fromGitHub, RELEASE_API, type Release } from './assets';
import fallback from './release-fallback.json';

let pending: Promise<Release> | undefined;

/**
 * The latest ORQWA release, fetched once per build. The site rebuilds when ORQWA publishes a
 * release; the browser also checks for a newer one (src/scripts/release.ts). Without network
 * access the build uses the snapshot in release-fallback.json.
 */
export function getRelease(): Promise<Release> {
  return (pending ??= load());
}

async function load(): Promise<Release> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'User-Agent': 'orqwa-website' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const res = await fetch(RELEASE_API, { headers, signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
    return fromGitHub(await res.json());
  } catch (err) {
    console.warn(`[release] using the snapshot of ${fallback.version}: ${err}`);
    return fromGitHub({
      tag_name: fallback.version,
      published_at: fallback.date,
      assets: Object.entries(fallback.assets).map(([name, a]) => ({ name, size: a.size, browser_download_url: a.url })),
    });
  }
}
