import { REPO_API } from './assets';

let pending: Promise<number | null> | undefined;

/** The repository's star count at build time; null when GitHub cannot be reached. */
export function getStars(): Promise<number | null> {
  return (pending ??= load());
}

async function load(): Promise<number | null> {
  const headers: Record<string, string> = { Accept: 'application/vnd.github+json', 'User-Agent': 'orqwa-website' };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  try {
    const res = await fetch(REPO_API, { headers, signal: AbortSignal.timeout(10_000) });
    if (!res.ok) throw new Error(`GitHub answered ${res.status}`);
    return (await res.json()).stargazers_count ?? null;
  } catch (err) {
    console.warn(`[repo] no star count: ${err}`);
    return null;
  }
}
