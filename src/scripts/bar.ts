/** The top bar turns solid once the page scrolls; feature cards light up under the pointer. */
export function initBar() {
  const bar = document.getElementById('bar');
  if (bar) {
    const onScroll = () => bar.classList.toggle('is-solid', scrollY > 40);
    addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }
  document.querySelectorAll<HTMLElement>('.feat').forEach((el) =>
    el.addEventListener('pointermove', (e) => {
      const r = el.getBoundingClientRect();
      el.style.setProperty('--mx', `${e.clientX - r.left}px`);
      el.style.setProperty('--my', `${e.clientY - r.top}px`);
    }),
  );
}
