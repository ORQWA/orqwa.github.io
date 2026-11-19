import { reduceMotion } from './util';

/** Scrolls the page to y over a duration in seconds; the smooth scroller takes over when it runs. */
type Scroller = (y: number, duration: number) => void;

export interface Ride {
  /** Scrolls to where step i has just become current: its title on the middle of the window. */
  goTo(i: number, duration?: number): void;
  scrollWith(scroller: Scroller): void;
}

const NS = 'http://www.w3.org/2000/svg';

/**
 * First ride: the real Twann – Chasseral route beside the steps, each step's number standing on the
 * route where it happens. The step whose title is on the middle of the window (below the bar) is
 * current; the route is drawn up to it and, with motion, a rider rides there.
 */
export function initRide(): Ride | undefined {
  const root = document.getElementById('ride');
  const box = document.getElementById('ride-route');
  const list = document.getElementById('ride-steps');
  if (!root || !box || !list) return;
  // [x, y, distance] in metres: x south of Twann (north is left), y west of it (see first-course.json).
  const route: number[][] = JSON.parse(box.dataset.route ?? '[]');
  if (route.length < 2) return;
  const lis = [...list.querySelectorAll<HTMLElement>('li')];
  const [startName, summitName] = [...box.querySelectorAll<HTMLElement>('.place')];
  const live = !reduceMotion();
  // The route's column shows from here on; without this script the steps stay a numbered list.
  root.classList.add('has-route');
  const el = (tag: string, attrs: Record<string, string | number>, parent: Element) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, String(attrs[k]));
    parent.appendChild(e);
    return e;
  };

  // Step i happens at i/5 of the way; its number stands on the route point nearest that distance.
  const total = route[route.length - 1][2];
  const at = lis.map((_, i) => {
    const want = (i / (lis.length - 1)) * total;
    let best = 0;
    route.forEach((p, k) => { if (Math.abs(p[2] - want) < Math.abs(route[best][2] - want)) best = k; });
    return best;
  });
  const xMin = Math.min(...route.map((p) => p[0]));
  const xMax = Math.max(...route.map((p) => p[0]));

  let pts: number[][] = [];
  let lens: number[] = [];
  let pinY: number[] = [];
  let pins: HTMLElement[] = [];
  let svg: SVGElement | undefined;
  let done: SVGElement | undefined;
  let riders: SVGElement[] = [];
  let length = 0;
  let cur = -2;
  let scroller: Scroller = (y, duration) => scrollTo({ top: y, behavior: duration && live ? 'smooth' : 'auto' });

  /**
   * Draws the route to fit its column and the steps as they are laid out now. Across, the route
   * keeps its true shape. Down, each stretch between two steps is spread over the space between
   * their titles and its bends keep their true size, so every number is level with its title.
   */
  const build = () => {
    const W = box.clientWidth;
    const H = list.offsetHeight;
    if (!W || !H) return;
    const lt = list.getBoundingClientRect().top;
    pinY = lis.map((li) => li.querySelector('.h3')!.getBoundingClientRect().top + 16 - lt);
    const pad = W < 120 ? 18 : 22;
    const s = (W - 2 * pad) / (xMax - xMin); // px per metre, across and for the bends
    pts = route.map((p, k) => {
      const i = Math.min(at.length - 2, Math.max(0, at.findIndex((a, j) => k >= a && k <= at[j + 1])));
      const a = route[at[i]];
      const b = route[at[i + 1]];
      const f = (p[2] - a[2]) / (b[2] - a[2]);
      const straight = a[1] + f * (b[1] - a[1]);
      return [pad + (p[0] - xMin) * s, pinY[i] + f * (pinY[i + 1] - pinY[i]) + (p[1] - straight) * s];
    });
    lens = [0];
    for (let k = 1; k < pts.length; k++) lens.push(lens[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
    length = lens[lens.length - 1];

    svg?.remove();
    pins.forEach((p) => p.remove());
    box.style.height = `${H}px`;
    const gap = parseFloat(getComputedStyle(root).columnGap) || 0;
    svg = el('svg', { width: W + gap, height: H, viewBox: `0 0 ${W + gap} ${H}` }, box) as SVGElement;
    box.prepend(svg);
    const d = 'M' + pts.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(' L');
    // Faint leaders from each number over to its title.
    at.forEach((k, i) => el('line', { class: 'lead', x1: pts[k][0] + 18, y1: pinY[i], x2: W + gap - 6, y2: pinY[i] }, svg!));
    el('path', { class: 'track', d }, svg);
    done = el('path', { class: 'done', d, 'stroke-dasharray': `${length} ${length}`, 'stroke-dashoffset': live ? length : 0 }, svg);
    riders = live ? [el('circle', { class: 'halo', r: 10 }, svg), el('circle', { class: 'rider', r: 5 }, svg)] : [];
    pins = at.map((k, i) => {
      const b = document.createElement('span');
      b.className = 'pin';
      b.textContent = String(i + 1);
      b.style.left = `${pts[k][0]}px`;
      b.style.top = `${pinY[i]}px`;
      b.addEventListener('click', () => goTo(i));
      box.appendChild(b);
      return b;
    });
    // The place names at either end, on the side of the column their end is on.
    const place = (name: HTMLElement | undefined, k: number, y: number, above: boolean) => {
      if (!name) return;
      const right = pts[k][0] > W / 2;
      name.style.cssText = '';
      name.style[right ? 'right' : 'left'] = `${Math.max(0, (right ? W - pts[k][0] : pts[k][0]) - 16)}px`;
      name.style.textAlign = right ? 'right' : 'left';
      if (above) name.style.bottom = `${H - y + 22}px`;
      else name.style.top = `${y + 22}px`;
    };
    place(startName, at[0], pinY[0], true);
    place(summitName, at[at.length - 1], pinY[pinY.length - 1], false);
    cur = -2;
    update();
  };

  /**
   * Where the middle of the window (below the bar) is in the list, now: `rel`, and once scrolled to
   * the end: `end`. The section ends the page, so where the page runs out before the last title
   * reaches the middle, the ride from `from` to `to` is spread over the scrolling that is left and
   * the rider still reaches Chasseral.
   */
  const measure = () => {
    const bar = document.getElementById('bar')?.offsetHeight ?? 0;
    const rel = bar + (innerHeight - bar) / 2 - list.getBoundingClientRect().top;
    const end = rel + Math.max(0, document.documentElement.scrollHeight - innerHeight - scrollY);
    const from = pinY[0] - 240;
    const to = pinY[pinY.length - 1] + 120;
    return { rel, end, from, to, squeezed: end < to && end > from };
  };

  const update = () => {
    if (!pts.length || !done) return;
    const m = measure();
    let rel = m.rel;
    if (m.squeezed && rel > m.from) rel = m.from + ((rel - m.from) * (m.to - m.from)) / (m.end - m.from);
    const n = rel < pinY[0] - 1 ? -1 : pinY.filter((y) => y <= rel + 1).length - 1;
    if (n !== cur) {
      cur = n;
      pins.forEach((p, i) => p.classList.toggle('is-cur', i === n));
      lis.forEach((li, i) => li.classList.toggle('is-cur', i === n));
      root.classList.toggle('has-cur', n >= 0);
    }
    if (!live) return;
    // Between two titles the rider rides the stretch between their numbers.
    const last = pinY.length - 1;
    let k: number;
    if (rel <= pinY[0]) k = 0;
    else if (rel >= pinY[last]) k = at[last];
    else {
      const i = pinY.findIndex((y, j) => rel >= y && rel < pinY[j + 1]);
      k = at[i] + ((rel - pinY[i]) / (pinY[i + 1] - pinY[i])) * (at[i + 1] - at[i]);
    }
    const k0 = Math.floor(k);
    const k1 = Math.min(pts.length - 1, k0 + 1);
    const f = k - k0;
    done.setAttribute('stroke-dashoffset', String(length - (lens[k0] + f * (lens[k1] - lens[k0]))));
    const x = pts[k0][0] + f * (pts[k1][0] - pts[k0][0]);
    const y = pts[k0][1] + f * (pts[k1][1] - pts[k0][1]);
    for (const c of riders) { c.setAttribute('cx', String(x)); c.setAttribute('cy', String(y)); }
  };

  const goTo = (i: number, duration = 0.9) => {
    if (!pts.length) return;
    const m = measure();
    let want = pinY[i] + 2;
    if (m.squeezed && want > m.from) want = m.from + ((want - m.from) * (m.end - m.from)) / (m.to - m.from);
    scroller(scrollY + want - m.rel, duration);
  };

  let queued = false;
  addEventListener('scroll', () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => { queued = false; update(); });
  }, { passive: true });
  let pending = false;
  const rebuild = () => {
    if (pending) return;
    pending = true;
    requestAnimationFrame(() => { pending = false; build(); });
  };
  new ResizeObserver(rebuild).observe(list);
  addEventListener('resize', rebuild);
  document.fonts?.ready.then(rebuild);
  build();

  return { goTo, scrollWith: (s) => { scroller = s; } };
}
