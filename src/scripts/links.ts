/** Links that open a new tab say so to screen readers, as the arrow icon does on screen. */
export function initLinks() {
  if (!document.getElementById('new-tab')) return;
  document.querySelectorAll<HTMLAnchorElement>('a[target="_blank"]').forEach((a) => {
    const ids = a.getAttribute('aria-describedby');
    a.setAttribute('aria-describedby', ids ? `${ids} new-tab` : 'new-tab');
  });
}
