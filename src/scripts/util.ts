export const reduceMotion = () => matchMedia('(prefers-reduced-motion: reduce)').matches;

/** Web storage that never throws (private windows, blocked site data). */
export const store = (kind: 'local' | 'session') => ({
  get(key: string): string | null {
    try { return (kind === 'local' ? localStorage : sessionStorage).getItem(key); } catch { return null; }
  },
  set(key: string, value: string) {
    try { (kind === 'local' ? localStorage : sessionStorage).setItem(key, value); } catch { /* not stored */ }
  },
});
