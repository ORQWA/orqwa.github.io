import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import { reduceMotion } from './util';

/** Smooth scrolling and the scroll-driven scenes. Nothing here runs with reduced motion. */
export function initMotion(reels: HTMLElement[]) {
  if (reduceMotion()) return;
  gsap.registerPlugin(ScrollTrigger);
  document.documentElement.classList.add('js-motion');

  const lenis = new Lenis({ lerp: 0.1 });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  document.addEventListener('orqwa:modal', (e) => ((e as CustomEvent<boolean>).detail ? lenis.stop() : lenis.start()));
  document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((a) =>
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href')!;
      const el = id.length > 1 ? document.querySelector<HTMLElement>(id) : null;
      if (!el) return;
      e.preventDefault();
      lenis.scrollTo(el, { duration: 1.4 });
    }),
  );

  hero();
  features();
  timeline();
  const mm = gsap.matchMedia();
  mm.add('(min-width: 900px)', () => {
    const cleanups = [screens(reels, lenis), flow(), groupFlow()];
    return () => cleanups.forEach((c) => c?.());
  });

  addEventListener('load', () => ScrollTrigger.refresh());
}

/** The stage turns into a card as it scrolls away. */
function hero() {
  if (!document.getElementById('stage')) return;
  const scrollTrigger = { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: true };
  gsap.to('#stage', { scale: 0.93, borderRadius: 28, ease: 'none', scrollTrigger });
  gsap.to('#lockup-wrap', { yPercent: 14, opacity: 0.4, ease: 'none', scrollTrigger: { ...scrollTrigger } });
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
function screens(reels: HTMLElement[], lenis: Lenis) {
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
      trigger: section, start: 'top top', end: () => '+=' + Math.max(...reels.map(room)) * 1.4,
      pin: true, scrub: 0.8, invalidateOnRefresh: true, onRefresh: apply,
    },
  });
  const st = tween.scrollTrigger!;

  // "The middle": as wide as the shot in focus, in the middle of the reels.
  let inMiddle = false;
  const onMove = (e: PointerEvent) => {
    const focus = section.querySelector('.shot.is-focus button')?.getBoundingClientRect();
    inMiddle = !!focus && e.clientX >= focus.left && e.clientX <= focus.right;
  };
  const onLeave = () => { inMiddle = false; };
  const onWheel = (e: WheelEvent) => {
    if (inMiddle || !st.isActive || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
    // Captured before Lenis sees it, so the pinned stretch is skipped instead of scrolled.
    e.preventDefault();
    e.stopImmediatePropagation();
    lenis.scrollTo(e.deltaY > 0 ? st.end + 2 : st.start - 2, { duration: 0.9, lock: true });
  };
  section.addEventListener('pointermove', onMove);
  section.addEventListener('pointerleave', onLeave);
  window.addEventListener('wheel', onWheel, { passive: false, capture: true });
  return () => {
    section.removeEventListener('pointermove', onMove);
    section.removeEventListener('pointerleave', onLeave);
    window.removeEventListener('wheel', onWheel, { capture: true });
  };
}

/** First ride: the step nearest the middle of the window is active, the line fills up to it. */
function timeline() {
  const list = document.getElementById('first-steps');
  if (!list) return;
  const steps = [...list.querySelectorAll<HTMLElement>('li')];
  list.classList.add('is-live');
  let queued = false;
  const update = () => {
    queued = false;
    const mid = innerHeight * 0.5;
    let active = steps[0];
    let best = Infinity;
    for (const li of steps) {
      const d = Math.abs(li.getBoundingClientRect().top + 16 - mid);
      if (d < best) { best = d; active = li; }
    }
    steps.forEach((li) => li.classList.toggle('is-on', li === active));
    list.style.setProperty('--total', `${steps[steps.length - 1].offsetTop}px`);
    const top = list.getBoundingClientRect().top;
    list.style.setProperty('--fill', `${Math.max(0, active.getBoundingClientRect().top - top)}px`);
  };
  const queue = () => { if (!queued) { queued = true; requestAnimationFrame(update); } };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  update();
}

/** How it works: the diagram builds up step by step while the scene stays in place. */
function flow() {
  const svg = document.getElementById('flow');
  const scene = document.getElementById('scene');
  if (!svg || !scene) return;
  const q = (s: string) => svg.querySelectorAll(s);
  const steps = [...document.querySelectorAll<HTMLElement>('#steps li')];
  scene.classList.add('is-live');
  const list = document.getElementById('steps')!;
  list.classList.add('is-live');
  // The active pill lights up and the line fills up to it.
  const setStep = (n: number) => {
    steps.forEach((li, i) => li.classList.toggle('is-on', i === n));
    list.style.setProperty('--fill', `${steps[n].offsetTop}px`);
    list.style.setProperty('--total', `${steps[steps.length - 1].offsetTop}px`);
  };
  setStep(0);

  gsap.set(q('[data-draw]'), { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.set(q('.ah'), { opacity: 0 });
  gsap.set(q('.chip'), { opacity: 0, x: -8 });
  gsap.set(q('#l-gpx .lbl, #l-write .lbl, #l-read .lbl, #l-bt .lbl, #l-ride .lbl, #l-sync .lbl'), { opacity: 0 });
  gsap.set(q('#rides-node, #sync-zone'), { opacity: 0 });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '#scene-pin', end: '+=3200', pin: true, scrub: 0.6,
      // Pin when the scene's middle reaches the middle of the space below the top bar.
      start: centredStart,
      invalidateOnRefresh: true,
      onUpdate: (s) => {
        const t = s.progress * tl.duration();
        setStep(t < 3.9 ? 0 : t < 6.5 ? 1 : t < 9.1 ? 2 : t < 10.7 ? 3 : 4);
      },
    },
  });
  const draw = (sel: string, at: number, d = 0.8) => {
    tl.to(q(`${sel} [data-draw]`), { strokeDashoffset: 0, duration: d }, at)
      .to(q(`${sel} .ah`), { opacity: 1, duration: 0.15 }, at + d - 0.1);
    const labels = q(`${sel} .lbl`);
    if (labels.length) tl.to(labels, { opacity: 1, duration: 0.3 }, at + d * 0.5);
  };
  draw('#l-gpx', 0);
  draw('#net-links', 0.8, 1.2);
  q('.packet').forEach((p, i) => {
    const left = i < 3;
    const at = 1.4 + (i % 3) * 0.55 + (left ? 0 : 0.2);
    tl.fromTo(p, { attr: { cx: left ? 260 : 640, cy: 138 }, opacity: 0 },
      { attr: { cx: left ? 410 : 490, cy: 290 }, opacity: 1, duration: 0.9, ease: 'power1.in' }, at)
      .to(p, { opacity: 0, duration: 0.12 }, at + 0.9);
  });
  draw('#l-write', 4.0);
  tl.to(q('.chip'), { opacity: 1, x: 0, duration: 0.35, stagger: 0.32, ease: 'power2.out' }, 4.5);
  tl.to('#net-zone', { opacity: 0.32, duration: 0.6 }, 6.6)
    .to('#net-links', { opacity: 0, duration: 0.6 }, 6.6)
    .to('#pill-a', { opacity: 0, duration: 0.3 }, 6.7)
    .to('#pill-b', { opacity: 1, duration: 0.3 }, 6.9)
    .to('#sub-a', { opacity: 0, duration: 0.3 }, 6.9)
    .to('#sub-b', { opacity: 1, duration: 0.3 }, 7.1);
  draw('#l-read', 7.4);
  draw('#l-bt', 7.9);
  tl.to('#rides-node', { opacity: 1, duration: 0.4 }, 9.2);
  draw('#l-ride', 9.3);
  tl.to('#sync-zone', { opacity: 1, duration: 0.5 }, 10.8);
  draw('#l-sync', 11.0);
  tl.to({}, { duration: 1.2 });

  return () => {
    scene.classList.remove('is-live');
    list.classList.remove('is-live');
    steps.forEach((li) => li.classList.remove('is-on'));
  };
}

/** Pins a scene centred in the space below the top bar. */
const centredStart = () => {
  const bar = document.getElementById('bar')?.offsetHeight ?? 0;
  return `center ${bar + (innerHeight - bar) / 2}px`;
};

/** Group rides: the same build-up as the solo scene, mirrored. */
function groupFlow() {
  const svg = document.getElementById('gflow');
  const list = document.getElementById('group-steps');
  if (!svg || !list) return;
  const q = (s: string) => svg.querySelectorAll(s);
  const steps = [...list.querySelectorAll<HTMLElement>('li')];
  list.classList.add('is-live');
  const setStep = (n: number) => {
    steps.forEach((li, i) => li.classList.toggle('is-on', i === n));
    list.style.setProperty('--fill', `${steps[n].offsetTop}px`);
    list.style.setProperty('--total', `${steps[steps.length - 1].offsetTop}px`);
  };
  setStep(0);

  const friends = q('.g-friend');
  const packets = [...svg.querySelectorAll<SVGCircleElement>('.g-packet')];
  gsap.set(q('[data-draw]'), { strokeDasharray: 1, strokeDashoffset: 1 });
  gsap.set(q('#g-stun .ah'), { opacity: 0 });
  gsap.set(friends, { opacity: 0.3 });
  gsap.set(q('.g-voice'), { opacity: 0 });
  gsap.set('#g-data', { opacity: 0 });

  const tl = gsap.timeline({
    defaults: { ease: 'none' },
    scrollTrigger: {
      trigger: '#group-pin', start: centredStart, end: '+=2600', pin: true, scrub: 0.6, invalidateOnRefresh: true,
      onUpdate: (s) => {
        const t = s.progress * tl.duration();
        setStep(t < 1.6 ? 0 : t < 4 ? 1 : t < 6 ? 2 : 3);
      },
    },
  });
  // 1 · The STUN servers tell the organizer its address.
  tl.to(q('#g-stun [data-draw]'), { strokeDashoffset: 0, duration: 0.8 }, 0)
    .to(q('#g-stun .ah'), { opacity: 1, duration: 0.15 }, 0.7);
  // 2 · Friends join and connect straight to the organizer; the internet is no longer needed.
  q('#g-links [data-draw]').forEach((line, i) => {
    tl.to(line, { strokeDashoffset: 0, duration: 0.6 }, 1.7 + i * 0.3).to(friends[i], { opacity: 1, duration: 0.3 }, 2.1 + i * 0.3);
  });
  tl.to('#g-net-zone', { opacity: 0.32, duration: 0.6 }, 3.3)
    .to('#g-stun', { opacity: 0, duration: 0.6 }, 3.3)
    .to('#g-pill-a', { opacity: 0, duration: 0.3 }, 3.4)
    .to('#g-pill-b', { opacity: 1, duration: 0.3 }, 3.6);
  // 3 · The course travels from the organizer to everyone.
  tl.to('#g-sub-a', { opacity: 0, duration: 0.3 }, 4)
    .to('#g-sub-b', { opacity: 1, duration: 0.3 }, 4.1);
  const travel = (at: number, outwards: boolean) => packets.forEach((p) => {
    const [x1, y1, x2, y2] = ['x1', 'y1', 'x2', 'y2'].map((k) => Number(p.dataset[k]));
    // (x1, y1) is the organizer's end of the link, (x2, y2) the friend's.
    const from = outwards ? { cx: x1, cy: y1 } : { cx: x2, cy: y2 };
    const to = outwards ? { cx: x2, cy: y2 } : { cx: x1, cy: y1 };
    tl.fromTo(p, { attr: from, opacity: 0 }, { attr: to, opacity: 1, duration: 0.8, ease: 'power1.inOut' }, at)
      .to(p, { opacity: 0, duration: 0.15 }, at + 0.8);
  });
  travel(4.3, true);
  travel(5.1, true);
  // 4 · Position, power and voice, both ways through the organizer.
  tl.to('#g-sub-b', { opacity: 0, duration: 0.3 }, 6)
    .to('#g-sub-a', { opacity: 1, duration: 0.3 }, 6.1)
    .to('#g-data', { opacity: 1, duration: 0.4 }, 6.1)
    .to(q('.g-voice'), { opacity: 1, duration: 0.4, stagger: 0.08 }, 6.4);
  travel(6.3, false);
  travel(6.9, true);
  tl.to({}, { duration: 1.4 });

  return () => {
    list.classList.remove('is-live');
    steps.forEach((li) => li.classList.remove('is-on'));
  };
}
