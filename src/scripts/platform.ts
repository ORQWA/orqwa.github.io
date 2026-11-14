type OS = 'macos' | 'windows' | 'linux' | 'android';

function detectOS(): OS | null {
  const ua = navigator.userAgent.toLowerCase();
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const p = (nav.userAgentData?.platform || navigator.platform || '').toLowerCase();
  if (/android/.test(ua)) return 'android';
  if (/iphone|ipad|ipod/.test(ua)) return null;
  // iPads ask for the desktop site and look like a Mac, except for touch.
  if (p.includes('mac') || /mac os x/.test(ua)) return navigator.maxTouchPoints > 1 ? null : 'macos';
  if (p.includes('win') || /windows/.test(ua)) return 'windows';
  if (p.includes('linux') || /linux|x11|cros/.test(ua)) return 'linux';
  return null;
}

/** Names the visitor's system on the hero button and opens its tab on the download page. */
export function initPlatform() {
  const os = detectOS();
  const heroDl = document.getElementById('hero-dl');
  const label = os && heroDl?.dataset[os];
  if (label) heroDl!.querySelector('span')!.textContent = label;

  const tabs = [...document.querySelectorAll<HTMLButtonElement>('#tabs [role=tab]')];
  if (!tabs.length) return;
  const select = (tab: HTMLButtonElement, focus = false) => {
    for (const t of tabs) {
      const on = t === tab;
      t.setAttribute('aria-selected', String(on));
      t.tabIndex = on ? 0 : -1;
      document.getElementById(t.getAttribute('aria-controls')!)!.hidden = !on;
    }
    if (focus) tab.focus();
  };
  tabs.forEach((t, i) => {
    t.addEventListener('click', () => select(t));
    t.addEventListener('keydown', (e) => {
      const d = e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0;
      if (d) {
        e.preventDefault();
        select(tabs[(i + d + tabs.length) % tabs.length], true);
      }
    });
  });
  const mine = tabs.find((t) => t.dataset.os === os);
  if (mine) {
    select(mine);
    // A small blue pill marks the visitor's system; screen readers hear "yours".
    const badge = document.createElement('span');
    badge.className = 'yours';
    const label = document.createElement('span');
    label.className = 'sr-only';
    label.textContent = document.getElementById('tabs')!.dataset.yours ?? 'yours';
    badge.append(label);
    mine.append(badge);
  }
}
