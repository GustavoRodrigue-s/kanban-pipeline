import { useEffect, useState } from 'react';

/**
 * Mantém um elemento montado por `exitMs` depois de `open` virar false, para a
 * animação de saída. Com exitMs = 0 desmonta na hora.
 */
export function usePresence(open: boolean, exitMs: number) {
  const [mounted, setMounted] = useState(open);
  const [prevOpen, setPrevOpen] = useState(open);

  if (open !== prevOpen) {
    setPrevOpen(open);
    setMounted(open || exitMs > 0);
  }

  useEffect(() => {
    if (open || !mounted) return;
    const timer = setTimeout(() => setMounted(false), exitMs);
    return () => clearTimeout(timer);
  }, [open, mounted, exitMs]);

  return { isMounted: open || mounted, isClosing: !open && mounted };
}
