import { useCallback, useSyncExternalStore } from 'react';

const canMatch = () => typeof window !== 'undefined' && typeof window.matchMedia === 'function';

/**
 * true enquanto a media query casar.
 * Sem matchMedia (ex.: jsdom), devolve `fallback`.
 */
export function useMediaQuery(query: string, fallback = false): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      if (!canMatch()) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener('change', onChange);
      return () => mql.removeEventListener('change', onChange);
    },
    [query],
  );
  const getSnapshot = () => (canMatch() ? window.matchMedia(query).matches : fallback);
  return useSyncExternalStore(subscribe, getSnapshot, () => fallback);
}

/** Breakpoints do design (§4.4): sm < 640 ≤ md < 1024 ≤ lg. */
export const useIsMobile = () => useMediaQuery('(max-width: 639.98px)');
export const useIsDesktop = () => useMediaQuery('(min-width: 1024px)', true);

/** Sem matchMedia (testes) trata como "reduzido": sem animações nem atrasos. */
export const usePrefersReducedMotion = () =>
  useMediaQuery('(prefers-reduced-motion: reduce)', true);
