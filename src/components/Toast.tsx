import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { usePresence } from '@/hooks/usePresence';
import { IconButton } from './Button';
import { CloseIcon } from './Icons';
import styles from './Toast.module.css';

interface ToastProps {
  open: boolean;
  message: string;
  actionLabel: string;
  onAction: () => void;
  onDismiss: () => void;
  /** Tempo até sumir (design: 6 s). Pausa com hover ou foco dentro do toast. */
  duration?: number;
}

/** Para reiniciar o tempo a cada novo aviso, o pai troca a `key`. */
export function Toast({
  open,
  message,
  actionLabel,
  onAction,
  onDismiss,
  duration = 6000,
}: ToastProps) {
  const reduced = usePrefersReducedMotion();
  const { isMounted, isClosing } = usePresence(open, reduced ? 0 : 150);
  const [hovered, setHovered] = useState(false);
  const [focused, setFocused] = useState(false);
  const remaining = useRef(duration);
  const onDismissRef = useRef(onDismiss);
  useEffect(() => {
    onDismissRef.current = onDismiss;
  });

  const paused = hovered || focused;
  useEffect(() => {
    if (!open || paused) return;
    const startedAt = Date.now();
    const timer = setTimeout(() => onDismissRef.current(), remaining.current);
    return () => {
      clearTimeout(timer);
      remaining.current -= Date.now() - startedAt;
    };
  }, [open, paused]);

  if (!isMounted) return null;

  return (
    <section
      aria-label="Avisos"
      className={styles.toast}
      data-state={isClosing ? 'closing' : 'open'}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onFocus={() => setFocused(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setFocused(false);
      }}
    >
      <span>{message}</span>
      <button type="button" className={styles.action} onClick={onAction}>
        {actionLabel}
      </button>
      <IconButton label="Fechar aviso" size={32} className={styles.close} onClick={onDismiss}>
        <CloseIcon />
      </IconButton>
    </section>
  );
}
