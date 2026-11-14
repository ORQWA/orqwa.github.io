/**
 * Screenshot reels: the shot nearest the middle comes forward (--f from 0 at the edges to 1 in
 * the middle), and any shot opens large in a lightbox, where you can step through the reel.
 */
export function initReels(): HTMLElement[] {
  const reels = [...document.querySelectorAll<HTMLElement>('.reel')];
  for (const reel of reels) {
    const shots = [...reel.querySelectorAll<HTMLElement>('.shot')];
    let queued = false;
    const update = () => {
      queued = false;
      const r = reel.getBoundingClientRect();
      const mid = r.left + r.width / 2;
      let best: HTMLElement | null = null;
      let bestD = Infinity;
      for (const s of shots) {
        const b = s.getBoundingClientRect();
        const d = Math.abs(b.left + b.width / 2 - mid);
        s.style.setProperty('--f', (1 - Math.min(1, d / (r.width / 2))).toFixed(3));
        if (d < bestD) { bestD = d; best = s; }
      }
      shots.forEach((s) => s.classList.toggle('is-focus', s === best));
    };
    const queue = () => {
      if (!queued) { queued = true; requestAnimationFrame(update); }
    };
    reel.addEventListener('scroll', queue, { passive: true });
    addEventListener('resize', queue);
    update();
  }

  const lb = document.getElementById('lightbox') as HTMLDialogElement | null;
  const lbImg = document.getElementById('lb-img') as HTMLImageElement | null;
  if (lb && lbImg) initLightbox(lb, lbImg, reels);
  return reels;
}

/**
 * The lightbox: a shot opens large, and the arrows, the arrow keys or a swipe step through the
 * other shots of the same reel, wrapping around at the ends.
 */
function initLightbox(lb: HTMLDialogElement, lbImg: HTMLImageElement, reels: HTMLElement[]) {
  const cap = document.getElementById('lb-cap');
  const count = document.getElementById('lb-count');
  const rows = reels.map((r) => [...r.querySelectorAll<HTMLButtonElement>('.shot button')]);
  let row: HTMLButtonElement[] = [];
  let at = 0;
  const src = (b: HTMLButtonElement) => b.dataset.full || b.querySelector('img')!.currentSrc;
  const show = (i: number) => {
    at = (i + row.length) % row.length;
    const b = row[at];
    lbImg.src = src(b);
    lbImg.alt = b.querySelector('img')!.alt;
    if (cap) cap.textContent = b.dataset.caption ?? '';
    if (count) count.textContent = `${at + 1} / ${row.length}`;
    // The neighbours load in the background, so stepping on is instant.
    [at - 1, at + 1].forEach((j) => { new Image().src = src(row[(j + row.length) % row.length]); });
  };
  rows.forEach((buttons) => buttons.forEach((b, i) =>
    b.addEventListener('click', () => {
      row = buttons;
      show(i);
      lb.showModal();
      document.dispatchEvent(new CustomEvent('orqwa:modal', { detail: true }));
    }),
  ));
  document.getElementById('lb-prev')?.addEventListener('click', () => show(at - 1));
  document.getElementById('lb-next')?.addEventListener('click', () => show(at + 1));
  lb.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(at - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(at + 1); }
  });
  // A horizontal swipe on the picture steps too.
  const stage = document.getElementById('lb-stage');
  let start: { x: number; y: number } | null = null;
  stage?.addEventListener('pointerdown', (e) => { start = { x: e.clientX, y: e.clientY }; });
  stage?.addEventListener('pointerup', (e) => {
    if (!start) return;
    const dx = e.clientX - start.x, dy = e.clientY - start.y;
    start = null;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) show(at + (dx < 0 ? 1 : -1));
  });
  document.getElementById('lb-close')?.addEventListener('click', () => lb.close());
  lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
  lb.addEventListener('close', () => document.dispatchEvent(new CustomEvent('orqwa:modal', { detail: false })));
}
