import { store } from './util';

/** Remember the language a rider picks, so English pages stop sending German browsers to /de/. */
export function initLang() {
  document.querySelectorAll<HTMLAnchorElement>('a[data-lang]').forEach((a) =>
    a.addEventListener('click', () => store('local').set('orqwa-lang', a.dataset.lang!)),
  );
}
