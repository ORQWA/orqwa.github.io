// Shared by the build (src/lib/release.ts) and the browser (src/scripts/release.ts).

export const RELEASE_API = 'https://api.github.com/repos/ORQWA/ORQWA/releases/latest';
export const RELEASES_PAGE = 'https://github.com/ORQWA/ORQWA/releases/latest';

/** Release files by the slot they fill on the download page. */
export const ASSET_PATTERNS = {
  macos: /^ORQWA-.+?-macos-arm64\.zip$/,
  windows: /^ORQWA-.+?-windows-x86_64\.msi$/,
  'windows-zip': /^ORQWA-.+?-windows-x86_64\.zip$/,
  linux: /^ORQWA-.+?-linux-x86_64\.tar\.gz$/,
  'linux-arm': /^ORQWA-.+?-linux-arm64\.tar\.gz$/,
  android: /^ORQWA-.+?-android-arm64\.apk$/,
} as const;

export type Slot = keyof typeof ASSET_PATTERNS;
export interface Asset { name: string; size: number; url: string }
export interface Release { version: string; date: string; assets: Partial<Record<Slot, Asset>> }

export const slotOf = (name: string) =>
  (Object.keys(ASSET_PATTERNS) as Slot[]).find((k) => ASSET_PATTERNS[k].test(name));

/** Sizes in MB as the page shows them: whole numbers above 50 MB, one decimal below. */
export const mb = (bytes: number) => {
  const m = bytes / 1048576;
  return m >= 50 ? String(Math.round(m)) : m.toFixed(1);
};

export const formatDate = (iso: string, locale: string) =>
  new Intl.DateTimeFormat(locale, { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(iso));

interface GitHubRelease {
  tag_name: string;
  published_at: string;
  assets: { name: string; size: number; browser_download_url: string }[];
}

export function fromGitHub(j: GitHubRelease): Release {
  const assets: Release['assets'] = {};
  for (const a of j.assets) {
    const slot = slotOf(a.name);
    if (slot) assets[slot] = { name: a.name, size: a.size, url: a.browser_download_url };
  }
  return { version: j.tag_name.replace(/^v/, ''), date: j.published_at, assets };
}

export const REPO_API = 'https://api.github.com/repos/ORQWA/ORQWA';

/** Star counts as GitHub shows them: 987, 1.2k, 12k. */
export const formatStars = (n: number) =>
  n < 1000 ? String(n) : `${(n / 1000).toFixed(n < 10000 ? 1 : 0).replace(/\.0$/, '')}k`;
