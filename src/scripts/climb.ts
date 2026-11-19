/**
 * First ride, on narrow screens: the climb is pinned under the bar until the last step comes up to
 * it, one row gap below. --release is how far above the end of the ride that is (see global.css).
 */
export function initClimb() {
  const ride = document.getElementById('ride');
  const last = ride?.querySelector<HTMLElement>('.ride-steps li:last-child');
  if (!ride || !last) return;
  const set = () => {
    const gap = parseFloat(getComputedStyle(ride).rowGap) || 0;
    const release = ride.getBoundingClientRect().bottom - last.getBoundingClientRect().top + gap;
    ride.style.setProperty('--release', `${Math.round(release)}px`);
  };
  new ResizeObserver(set).observe(ride);
  set();
}
