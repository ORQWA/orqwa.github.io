import { reduceMotion, store } from './util';

/**
 * Hero: the teaser video settles into the logo. The video's last frame is the static logo on
 * the page background, at the same size and place, so the logo is shown at once and the video
 * fades out underneath it. The intro plays once per session.
 */
export function initHero() {
  const hero = document.querySelector<HTMLElement>('.hero');
  const video = document.getElementById('teaser') as HTMLVideoElement | null;
  const replay = document.getElementById('replay') as HTMLButtonElement | null;
  if (!hero || !video || !replay) return;
  const session = store('session');
  const reduce = reduceMotion();

  function settle(instant: boolean) {
    hero!.classList.toggle('instant', instant);
    hero!.classList.remove('is-playing');
  }
  function play() {
    hero!.classList.remove('instant');
    hero!.classList.add('has-video', 'is-playing');
    replay!.hidden = false;
    video!.currentTime = 0;
    video!.play().catch(() => settle(true));
  }
  video.addEventListener('ended', () => { session.set('orqwa-intro', '1'); settle(false); });
  video.addEventListener('error', () => settle(true));
  replay.addEventListener('click', play);
  if (!reduce && !session.get('orqwa-intro')) play();
  else { replay.hidden = reduce; hero.classList.add('has-video'); settle(true); }
}
