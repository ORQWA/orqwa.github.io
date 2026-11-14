import { formatStars, REPO_API } from '../lib/assets';
import { store } from './util';

/** Refreshes the star count in the top bar from GitHub, at most once an hour per visitor. */
export function initStars() {
  const els = document.querySelectorAll<HTMLElement>('[data-stars]');
  if (!els.length) return;
  const session = store('session');
  const show = (n: number) => els.forEach((el) => { el.textContent = formatStars(n); el.hidden = false; });
  try {
    const cached = JSON.parse(session.get('orqwa-stars') ?? 'null');
    if (cached && Date.now() - cached.at < 3_600_000) return show(cached.n);
  } catch { /* fetch again */ }
  fetch(REPO_API, { headers: { Accept: 'application/vnd.github+json' } })
    .then((res) => (res.ok ? res.json() : Promise.reject(new Error(`GitHub answered ${res.status}`))))
    .then((j) => {
      if (typeof j.stargazers_count !== 'number') return;
      session.set('orqwa-stars', JSON.stringify({ at: Date.now(), n: j.stargazers_count }));
      show(j.stargazers_count);
    })
    .catch(() => { /* keep the count from the build */ });
}
