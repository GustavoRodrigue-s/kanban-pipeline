import {
  useEffect,
  useRef,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  type RefObject,
} from 'react';
import { createPortal } from 'react-dom';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { usePresence } from '@/hooks/usePresence';
import { cx } from '@/utils/cx';
import { getFocusable } from '@/utils/focus';
import styles from './Modal.module.css';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  /** "alertdialog" para confirmações destrutivas. */
  role?: 'dialog' | 'alertdialog';
  labelledBy: string;
  describedBy?: string;
  /** Elemento que recebe o foco ao abrir (padrão: primeiro focável). */
  initialFocusRef?: RefObject<HTMLElement | null>;
  variant?: 'form' | 'confirm';
  children: ReactNode;
}

// Conta modais abertos para tornar o app de fundo `inert` só uma vez.
let openCount = 0;
function setBackgroundInert(delta: 1 | -1) {
  openCount = Math.max(0, openCount + delta);
  document.getElementById('app')?.toggleAttribute('inert', openCount > 0);
}

export function Modal({
  open,
  onClose,
  role = 'dialog',
  labelledBy,
  describedBy,
  initialFocusRef,
  variant = 'form',
  children,
}: ModalProps) {
  const reduced = usePrefersReducedMotion();
  const { isMounted, isClosing } = usePresence(open, reduced ? 0 : 150);
  const panelRef = useRef<HTMLDivElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  });

  // Abrir: guarda o gatilho, isola o fundo e posiciona o foco.
  // Fechar: libera o fundo e devolve o foco ao gatilho (se ele ainda existir).
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    setBackgroundInert(1);
    const panel = panelRef.current;
    const target = initialFocusRef?.current ?? (panel && getFocusable(panel)[0]) ?? panel;
    target?.focus();

    return () => {
      setBackgroundInert(-1);
      if (opener?.isConnected) opener.focus();
    };
  }, [open, initialFocusRef]);

  if (!isMounted) return null;

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      event.preventDefault();
      onCloseRef.current();
      return;
    }
    if (event.key !== 'Tab' || !panelRef.current) return;
    const focusable = getFocusable(panelRef.current);
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const handleScrimMouseDown = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) onCloseRef.current();
  };

  return createPortal(
    <div
      role="presentation"
      className={styles.scrim}
      data-state={isClosing ? 'closing' : 'open'}
      onMouseDown={handleScrimMouseDown}
    >
      <div
        ref={panelRef}
        role={role}
        aria-modal="true"
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
        tabIndex={-1}
        className={cx(styles.panel, variant === 'confirm' ? styles.confirm : styles.form)}
        onKeyDown={handleKeyDown}
      >
        {variant === 'form' && <div className={styles.handle} aria-hidden="true" />}
        {children}
      </div>
    </div>,
    document.body,
  );
}
