/** The top bar turns solid once the page scrolls; feature cards light up under the pointer. */
export function initBar() {
  const bar = document.getElementById('bar');
  if (bar) {
    const onScroll = () => bar.classList.toggle('is-solid', scrollY > 40);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  initMenu();
  document.querySelectorAll<HTMLElement>('.feat').forEach((el) =>
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    }),
  );
}

/**
 * The menu on narrow screens. Opens below the bar; a link, Escape, a tap outside it or a wider
 * window closes it. While it is open the page behind stays still (motion.ts listens for orqwa:modal).
 */
function initMenu() {
  const btn = document.getElementById('menu-btn');
  const menu = document.getElementById('menu');
  const bar = document.getElementById('bar');
  if (!btn || !menu || !bar) return;
  const wide = matchMedia('(min-width: 961px)');
  const set = (open: boolean) => {
    if (open === !menu.hidden) return;
    menu.hidden = !open;
    btn.setAttribute('aria-expanded', String(open));
    bar.classList.toggle('is-open', open);
    document.documentElement.classList.toggle('menu-open', open);
    document.dispatchEvent(new CustomEvent('orqwa:modal', { detail: open }));
  };
  btn.addEventListener('click', () => set(menu.hidden !== false));
  // Captured, so the menu is closed (and smooth scrolling running again) before a #link scrolls.
  menu.addEventListener('click', (e) => { if ((e.target as Element).closest('a')) set(false); }, true);
  addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && !menu.hidden) { set(false); btn.focus(); }
  });
  document.addEventListener('pointerdown', (e) => { if (!bar.contains(e.target as Node)) set(false); });
  wide.addEventListener('change', () => set(false));
}
