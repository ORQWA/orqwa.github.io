import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { reduceMotion } from './util';
import type { Ride } from './ride';

/** Smooth scrolling and the scroll-driven scenes. Nothing here runs with reduced motion. */
export function initMotion(reels: HTMLElement[], ride?: Ride) {
  if (reduceMotion()) return;
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('js-motion');

  const lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.addEventListener('orqwa:modal', (e) => ((e as CustomEvent<boolean>).detail ? lenis.stop() : lenis.start()));
  ride?.scrollWith((y, duration) => lenis.scrollTo(y, { duration }));
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')!;
      const el = id.length > 1 ? document.querySelector<HTMLElement>(id) : null;
      if (!el) return;
      e.preventDefault();
      // The first ride's link lands on step 1, not on the section's top.
      if (id === '#first-ride' && ride) ride.goTo(0, 1.4);
      else lenis.scrollTo(el, { duration: 1.4 });
    }),
  );

  hero();
  features();
  const mm = gsap.matchMedia();
  // Screens: pinned and run by scrolling on every width; phones get a shorter, snappier stretch.
  mm.add({ wide: '(min-width: 900px)', phone: '(max-width: 899.98px)' }, (ctx) =>
    screens(reels, lenis, !!ctx.conditions?.phone));
  // How it works: the wide drawings from 1024px (see global.css), the tall ones below.
  mm.add('(min-width: 1024px)', () => {
    const cleanups = [flow(false, lenis), groupFlow(false, lenis), remoteFlow(false, lenis)];
    return () => cleanups.forEach((c) => c?.());
  });
  mm.add('(max-width: 1023.98px)', () => {
    const cleanups = [flow(true, lenis), groupFlow(true, lenis), remoteFlow(true, lenis), shareStepHeight()];
    return () => cleanups.forEach((c) => c?.());
  });

  addEventListener('load', () => ScrollTrigger.refresh());
}

/** The logo drifts down and fades a little as the stage scrolls away; the stage keeps its size. */
function hero() {
  if (!document.getElementById('stage')) return;
  gsap.to('#lockup-wrap', {
    yPercent: 14, opacity: 0.4, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true },
  });
}

/** Feature cards rise in, from a visible state. */
function features() {
  if (!document.getElementById('feature-grid')) return;
  gsap.from('#feature-grid .feat', {
    y: 18, opacity: 0.3, duration: 0.7, ease: 'power2.out', stagger: { each: 0.05, grid: 'auto' },
    scrollTrigger: { trigger: '#feature-grid', start: 'top 85%', once: true },
  });
}

/**
 * The section stays in place while scrolling runs the two reels, in opposite directions. With
 * the pointer outside the middle shot, a scroll skips past the section instead (or back above it).
 */
function screens(reels: HTMLElement[], lenis: Lenis, phone = false) {
  const section = document.getElementById('screens');
  if (!section || !reels.length) return;
  const room = (r: HTMLElement) => r.scrollWidth - r.clientWidth;
  const state = { p: 0 };
  const apply = () =>
    reels.forEach((r) => (r.scrollLeft = (r.hasAttribute('data-reverse') ? 1 - state.p : state.p) * room(r)));
  apply();
  const tween = gsap.to(state, {
    p: 1, ease: 'none', onUpdate: apply,
    scrollTrigger: {
      trigger: section, start: 'top top', end: () => '+=' + Math.max(...reels.map(room)) * (phone ? 0.8 : 1.4),
      pin: true, scrub: phone ? 0.5 : 0.8, invalidateOnRefresh: true, onRefresh: apply,
    },
  });
  const st = tween.scrollTrigger!;

  // "The middle": a fixed band in the middle of the reels, as wide as a shot in focus, or the
  // focused shots themselves, which drift off centre a little as the reels run. The wheel event
  // carries the pointer position, which stays right while the section slides under a still mouse.
  const inMiddle = (x: number) => {
    const r = reels[0].getBoundingClientRect();
    const h = reels[0].querySelector('.shot button')?.clientHeight ?? 0;
    if (Math.abs(x - (r.left + r.width / 2)) <= h * 8 / 9 * 1.1) return true;
    return [...section.querySelectorAll('.shot.is-focus button')]
      .some((b) => { const f = b.getBoundingClientRect(); return x >= f.left && x <= f.right; });
  };
  const onWheel = (e: WheelEvent) => {
    if (!st.isActive || Math.abs(e.deltaY) < Math.abs(e.deltaX) || inMiddle(e.clientX)) return;
    // Captured before Lenis sees it, so the pinned stretch is skipped instead of scrolled.
    e.preventDefault();
    e.stopImmediatePropagation();
    lenis.scrollTo(e.deltaY > 0 ? st.end + 2 : st.start - 2, { duration: 0.9, lock: true });
  };
  window.addEventListener('wheel', onWheel, { passive: false, capture: true });
  return () => {
    window.removeEventListener('wheel', onWheel, { capture: true });
  };
}

/**
 * The steps beside a diagram follow its timeline. On phones only one step shows at a time, under
 * the drawing: each fades and slides in as you scroll into it and out as the next one arrives,
 * and the progress dashes below jump to a step.
 */
function stepper(scene: HTMLElement, list: HTMLElement, phone: boolean, stepAt: number[], lenis: Lenis) {
  const steps = [...list.querySelectorAll<HTMLElement>('li')];
  const dotsEl = scene.querySelector<HTMLElement>('.step-dots')!;
  let st: ScrollTrigger | undefined;
  let total = 1;
  const dots = phone ? steps.map((li, i) => {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = li.className;
    b.setAttribute('aria-label', `${i + 1}: ${li.querySelector('.h3')?.textContent ?? ''}`);
    // Jumps to just after the step begins, where its text is fully in.
    b.addEventListener('click', () => {
      if (!st) return;
      const at = i ? stepAt[i - 1] + 0.6 : 0;
      lenis.scrollTo(st.start + (at / total) * (st.end - st.start), { duration: 1.1 });
    });
    dotsEl.appendChild(b);
    return b;
  }) : [];
  dotsEl.hidden = !phone;
  scene.classList.toggle('is-m', phone);
  scene.classList.add('is-live');
  list.classList.add('is-live');

  let cur = -1;
  const setStep = (n: number) => {
    if (n === cur) return;
    cur = n;
    steps.forEach((li, i) => li.classList.toggle('is-on', i === n));
    dots.forEach((b, i) => (i === n ? b.setAttribute('aria-current', 'step') : b.removeAttribute('aria-current')));
    list.style.setProperty('--fill', `${steps[n].offsetTop}px`);
    list.style.setProperty('--total', `${steps[steps.length - 1].offsetTop}px`);
  };
  const FADE = 0.45;
  const blend = (t: number) => {
    const bounds = [0, ...stepAt, Infinity];
    steps.forEach((li, i) => {
      const inn = i === 0 ? 1 : Math.min(1, Math.max(0, (t - bounds[i]) / FADE));
      const out = Math.min(1, Math.max(0, (bounds[i + 1] - t) / FADE));
      const dy = inn < 1 ? (1 - inn) * 16 : (1 - out) * -16;
      li.style.opacity = Math.min(inn, out).toFixed(3);
      li.style.transform = `translateY(${dy.toFixed(1)}px)`;
    });
  };
  setStep(0);
  if (phone) blend(0);

  return {
    /** Called with the timeline's time as the scroll moves. */
    update: (t: number) => {
      setStep(stepAt.filter((a) => t >= a).length);
      if (phone) blend(t);
    },
    attach: (tl: gsap.core.Timeline) => { st = tl.scrollTrigger; total = tl.duration(); },
    cleanup: () => {
      st = undefined;
      scene.classList.remove('is-live', 'is-m');
      list.classList.remove('is-live');
      dotsEl.hidden = true;
      dotsEl.replaceChildren();
      steps.forEach((li) => { li.classList.remove('is-on'); li.style.opacity = ''; li.style.transform = ''; });
    },
  };
}

/**
 * Phones: the drawings share one size (360×544) and fill the height above their steps, so the
 * steps get the same room in every scene (the tallest step of any) and the drawings the same scale.
 */
function shareStepHeight() {
  const lists = [...document.querySelectorAll<HTMLElement>('.scene.is-m .steps')];
  const measure = () => {
    lists.forEach((l) => (l.style.minHeight = ''));
    const h = Math.max(...lists.map((l) => l.offsetHeight));
    lists.forEach((l) => (l.style.minHeight = `${h}px`));
  };
  measure();
  ScrollTrigger.addEventListener('refreshInit', measure);
  return () => {
    ScrollTrigger.removeEventListener('refreshInit', measure);
    lists.forEach((l) => (l.style.minHeight = ''));
  };
}

/** Pin options: centred below the top bar on wide screens, filling the screen on phones. */
const pin = (trigger: string, phone: boolean, length: number) => ({
  trigger, pin: true, invalidateOnRefresh: true,
  start: phone ? 'top top' : centredStart,
  end: `+=${phone ? Math.round(length * 0.8) : length}`,
  scrub: phone ? 0.4 : 0.6,
});

/** How it works: the diagram builds up step by step while the scene stays in place. */
function flow(phone: boolean, lenis: Lenis) {
  const svg = document.getElementById(phone ? 'flow-m' : 'flow');
  const scene = document.getElementById('scene');
  const list = document.getElementById('steps');
  if (!svg || !scene || !list) return;
  // Both drawings name their moving parts with data-k, so the same timeline drives either one.
  const k = (n: string, sub = '') => svg.querySelectorAll(`[data-k="${n}"]${sub ? ' ' + sub : ''}`);
  const q = (s: string) => svg.querySelectorAll(s);
  const steps = stepper(scene, list, phone, [3.9, 6.5, 9.1, 10.7], lenis);

  gsap.set(q('[data-draw]'), { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.set(q('.ah'), { opacity: 0 });
  gsap.set(q('.chip'), { opacity: 0, x: -8 });
  gsap.set(q('[data-k] .lbl'), { opacity: 0 });
  gsap.set([...k('rides-node'), ...k('sync-zone')], { opacity: 0 });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { ...pin('#scene-pin', phone, 3200), onUpdate: (s) => steps.update(s.progress * tl.duration()) },
  });
  const draw = (n: string, at: number, d = 0.8) => {
    tl.to(k(n, '[data-draw]'), { strokeDashoffset: 0, duration: d }, at)
      .to(k(n, '.ah'), { opacity: 1, duration: 0.15 }, at + d - 0.1);
    const labels = k(n, '.lbl');
    if (labels.length) tl.to(labels, { opacity: 1, duration: 0.3 }, at + d * 0.5);
  };
  draw('l-gpx', 0);
  draw('net-links', 0.8, 1.2);
  const pk = svg.dataset.pk!.split(';').map((p) => p.split(',').map(Number));
  q('.packet').forEach((p, i) => {
    const [x1, y1, x2, y2] = pk[i < 3 ? 0 : 1];
    const at = 1.4 + (i % 3) * 0.55 + (i < 3 ? 0 : 0.2);
    tl.fromTo(p, { attr: { cx: x1, cy: y1 }, opacity: 0 },
      { attr: { cx: x2, cy: y2 }, opacity: 1, duration: 0.9, ease: 'power1.in' }, at)
      .to(p, { opacity: 0, duration: 0.12 }, at + 0.9);
  });
  draw('l-write', 4.0);
  tl.to(q('.chip'), { opacity: 1, x: 0, duration: 0.35, stagger: 0.32, ease: 'power2.out' }, 4.5);
  tl.to(k('net-zone'), { opacity: 0.32, duration: 0.6 }, 6.6)
    .to(k('net-links'), { opacity: 0, duration: 0.6 }, 6.6)
    .to(k('pill-a'), { opacity: 0, duration: 0.3 }, 6.7)
    .to(k('pill-b'), { opacity: 1, duration: 0.3 }, 6.9)
    .to(k('sub-a'), { opacity: 0, duration: 0.3 }, 6.9)
    .to(k('sub-b'), { opacity: 1, duration: 0.3 }, 7.1);
  draw('l-read', 7.4);
  draw('l-bt', 7.9);
  tl.to(k('rides-node'), { opacity: 1, duration: 0.4 }, 9.2);
  draw('l-ride', 9.3);
  tl.to(k('sync-zone'), { opacity: 1, duration: 0.5 }, 10.8);
  draw('l-sync', 11.0);
  tl.to({}, { duration: 1.2 });
  steps.attach(tl);

  return steps.cleanup;
}

/** Pins a scene centred in the space below the top bar. */
const centredStart = () => {
  const bar = document.getElementById('bar')?.offsetHeight ?? 0;
  return `center ${bar + (innerHeight - bar) / 2}px`;
};

/** Group rides: the same build-up as the solo scene, mirrored. */
function groupFlow(phone: boolean, lenis: Lenis) {
  const svg = document.getElementById(phone ? 'gflow-m' : 'gflow');
  const scene = document.getElementById('group-scene');
  const list = document.getElementById('group-steps');
  if (!svg || !scene || !list) return;
  const k = (n: string, sub = '') => svg.querySelectorAll(`[data-k="${n}"]${sub ? ' ' + sub : ''}`);
  const q = (s: string) => svg.querySelectorAll(s);
  const steps = stepper(scene, list, phone, [1.6, 4, 6], lenis);

  const friends = q('.g-friend');
  const packets = [...svg.querySelectorAll<SVGCircleElement>('.g-packet')];
  gsap.set(q('[data-draw]'), { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.set(k('g-stun', '.ah'), { opacity: 0 });
  gsap.set(friends, { opacity: 0.3 });
  gsap.set(q('.g-voice'), { opacity: 0 });
  gsap.set(k('g-data'), { opacity: 0 });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { ...pin('#group-pin', phone, 2600), onUpdate: (s) => steps.update(s.progress * tl.duration()) },
  });
  // 1 · The STUN servers tell the organizer its address.
  tl.to(k('g-stun', '[data-draw]'), { strokeDashoffset: 0, duration: 0.8 }, 0)
    .to(k('g-stun', '.ah'), { opacity: 1, duration: 0.15 }, 0.7);
  // 2 · Friends join and connect straight to the organizer; the internet is no longer needed.
  k('g-links', '[data-draw]').forEach((line, i) => {
    tl.to(line, { strokeDashoffset: 0, duration: 0.6 }, 1.7 + i * 0.3).to(friends[i], { opacity: 1, duration: 0.3 }, 2.1 + i * 0.3);
  });
  tl.to(k('g-net-zone'), { opacity: 0.32, duration: 0.6 }, 3.3)
    .to(k('g-stun'), { opacity: 0, duration: 0.6 }, 3.3)
    .to(k('g-pill-a'), { opacity: 0, duration: 0.3 }, 3.4)
    .to(k('g-pill-b'), { opacity: 1, duration: 0.3 }, 3.6);
  // 3 · The course travels from the organizer to everyone.
  tl.to(k('g-sub-a'), { opacity: 0, duration: 0.3 }, 4)
    .to(k('g-sub-b'), { opacity: 1, duration: 0.3 }, 4.1);
  const travel = (at: number, outwards: boolean) => packets.forEach((p) => {
    const [x1, y1, x2, y2] = ['x1', 'y1', 'x2', 'y2'].map((key) => Number(p.dataset[key]));
    // (x1, y1) is the organizer's end of the link, (x2, y2) the friend's.
    const from = outwards ? { cx: x1, cy: y1 } : { cx: x2, cy: y2 };
    const to = outwards ? { cx: x2, cy: y2 } : { cx: x1, cy: y1 };
    tl.fromTo(p, { attr: from, opacity: 0 }, { attr: to, opacity: 1, duration: 0.8, ease: 'power1.inOut' }, at)
      .to(p, { opacity: 0, duration: 0.15 }, at + 0.8);
  });
  travel(4.3, true);
  travel(5.1, true);
  // 4 · Position, power and voice, both ways through the organizer.
  tl.to(k('g-sub-b'), { opacity: 0, duration: 0.3 }, 6)
    .to(k('g-sub-a'), { opacity: 1, duration: 0.3 }, 6.1)
    .to(k('g-data'), { opacity: 1, duration: 0.4 }, 6.1)
    .to(q('.g-voice'), { opacity: 1, duration: 0.4, stagger: 0.08 }, 6.4);
  travel(6.3, false);
  travel(6.9, true);
  tl.to({}, { duration: 1.4 });
  steps.attach(tl);

  return steps.cleanup;
}

/** Phone remote: switched on, scanned, taps travel, and a stranger is kept out. */
function remoteFlow(phone: boolean, lenis: Lenis) {
  const svg = document.getElementById(phone ? 'rflow-m' : 'rflow');
  const scene = document.getElementById('remote-scene');
  const list = document.getElementById('remote-steps');
  if (!svg || !scene || !list) return;
  const k = (n: string, sub = '') => svg.querySelectorAll(`[data-k="${n}"]${sub ? ' ' + sub : ''}`);
  const q = (s: string) => svg.querySelectorAll(s);
  const steps = stepper(scene, list, phone, [1.6, 3.6, 6], lenis);

  const packets = [...svg.querySelectorAll<SVGCircleElement>('.r-packet')];
  gsap.set(q('[data-draw]'), { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.set(k('r-link', '.ah'), { opacity: 0 });
  gsap.set(k('r-link', '.lbl'), { opacity: 0 });
  // The switch starts off; its knob's cx in the markup is the on position, data-off the off one.
  const track = k('r-switch', '.sw-track');
  const knob = svg.querySelector<SVGCircleElement>('[data-k="r-switch"] .sw-knob')!;
  const knobOn = Number(knob.getAttribute('cx'));
  gsap.set(track, { fill: 'rgba(150, 190, 240, .22)' });
  gsap.set(knob, { attr: { cx: Number(knob.dataset.off) } });
  gsap.set(k('r-qr'), { opacity: 0 });
  gsap.set(k('r-phone'), { opacity: 0.3 });
  gsap.set(k('r-screen'), { opacity: 0 });
  gsap.set(k('r-block', '.node'), { opacity: 0 });
  gsap.set(k('r-block', '.ln'), { opacity: 0 });
  gsap.set(k('r-block', '.no-x'), { opacity: 0 });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: { ...pin('#remote-pin', phone, 2200), onUpdate: (s) => steps.update(s.progress * tl.duration()) },
  });
  // 1 · The remote is switched on, and ORQWA shows its code.
  tl.to(track, { fill: '#2EB0FF', duration: 0.3 }, 0.2)
    .to(knob, { attr: { cx: knobOn }, duration: 0.3, ease: 'power2.out' }, 0.2)
    .to(k('r-qr'), { opacity: 1, duration: 0.5 }, 0.7);
  // 2 · The phone scans it, joins straight over the Wi-Fi, and shows the remote.
  tl.to(k('r-link', '[data-draw]'), { strokeDashoffset: 0, duration: 0.8 }, 1.7)
    .to(k('r-link', '.ah'), { opacity: 1, duration: 0.15 }, 2.4)
    .to(k('r-link', '.lbl'), { opacity: 1, duration: 0.3 }, 2.1)
    .to(k('r-phone'), { opacity: 1, duration: 0.4 }, 2.3)
    .to(k('r-screen'), { opacity: 1, duration: 0.5 }, 2.5);
  // 3 · Presses go to the computer, the gear comes back.
  tl.to(k('r-sub-a'), { opacity: 0, duration: 0.3 }, 3.7)
    .to(k('r-sub-b'), { opacity: 1, duration: 0.3 }, 3.9);
  packets.forEach((p, i) => {
    const [x1, y1, x2, y2] = ['x1', 'y1', 'x2', 'y2'].map((key) => Number(p.dataset[key]));
    const at = 4.1 + i * 0.6;
    tl.fromTo(p, { attr: { cx: x1, cy: y1 }, opacity: 0 }, { attr: { cx: x2, cy: y2 }, opacity: 1, duration: 0.6, ease: 'power1.inOut' }, at)
      .to(p, { opacity: 0, duration: 0.12 }, at + 0.6);
  });
  // 4 · Someone else on the network gets no further than the secret address.
  tl.to(k('r-block', '.node'), { opacity: 1, duration: 0.4 }, 6.1)
    .to(k('r-block', '.ln'), { opacity: 1, duration: 0.5 }, 6.4)
    .to(k('r-block', '.no-x'), { opacity: 1, duration: 0.2 }, 7);
  tl.to({}, { duration: 1.4 });
  steps.attach(tl);

  return steps.cleanup;
}
