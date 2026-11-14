/**
 * Screenshot reels: the shot nearest the middle comes forward (--f from 0 at the edges to 1 in
 * the middle), and any shot opens large in a lightbox.
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
  if (lb && lbImg) {
    document.querySelectorAll<HTMLButtonElement>('.shot button').forEach((b) =>
      b.addEventListener('click', () => {
        const img = b.querySelector('img')!;
        lbImg.src = b.dataset.full || img.currentSrc;
        lbImg.alt = img.alt;
        const cap = document.getElementById('lb-cap');
        if (cap) cap.textContent = b.dataset.caption ?? '';
        lb.showModal();
        document.dispatchEvent(new CustomEvent('orqwa:modal', { detail: true }));
      }),
    );
    document.getElementById('lb-close')?.addEventListener('click', () => lb.close());
    lb.addEventListener('click', (e) => { if (e.target === lb) lb.close(); });
    lb.addEventListener('close', () => document.dispatchEvent(new CustomEvent('orqwa:modal', { detail: false })));
  }
  return reels;
}
