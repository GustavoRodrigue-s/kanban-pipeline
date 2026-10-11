import {
  useCallback,
  useEffect,
  useId,
  useLayoutEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { cx } from '@/utils/cx';
import styles from './Menu.module.css';

export interface MenuItemEntry {
  type: 'item';
  key: string;
  label: ReactNode;
  icon?: ReactNode;
  trailing?: ReactNode;
  danger?: boolean;
  onSelect: () => void;
}

export type MenuEntry =
  | MenuItemEntry
  | { type: 'separator'; key: string }
  | { type: 'group'; key: string; label: string; items: MenuItemEntry[] };

interface MenuButtonProps {
  /** Rótulo acessível do botão (ex.: "Abrir menu do card 'X'"). */
  label: string;
  /** Rótulo acessível do menu (ex.: "Ações do card"). */
  menuLabel: string;
  entries: MenuEntry[];
  className?: string;
  children: ReactNode;
}

const MENU_GAP = 3;
const VIEWPORT_MARGIN = 8;

/**
 * Padrão WAI-ARIA "Menu Button": Enter/Espaço/↓ abre no primeiro item, ↑ no último;
 * setas navegam, Home/End vão às pontas, Esc e Tab fecham e devolvem o foco ao botão.
 * O menu é renderizado em portal para não ser cortado pelo scroll da coluna.
 */
export function MenuButton({ label, menuLabel, entries, className, children }: MenuButtonProps) {
  const [open, setOpen] = useState(false);
  const [initialFocus, setInitialFocus] = useState<'first' | 'last'>('first');
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  const items = entries.flatMap((e) =>
    e.type === 'item' ? [e] : e.type === 'group' ? e.items : [],
  );

  const close = useCallback((returnFocus: boolean) => {
    setOpen(false);
    if (returnFocus) buttonRef.current?.focus();
  }, []);

  const openMenu = (focus: 'first' | 'last') => {
    setInitialFocus(focus);
    setOpen(true);
  };

  // Posiciona abaixo do botão (ou acima, se faltar espaço) e foca o item inicial.
  useLayoutEffect(() => {
    const menu = menuRef.current;
    const button = buttonRef.current;
    if (!open || !menu || !button) return;
    const rect = button.getBoundingClientRect();
    const { offsetWidth: w, offsetHeight: h } = menu;
    let top = rect.bottom + MENU_GAP;
    if (
      top + h > window.innerHeight - VIEWPORT_MARGIN &&
      rect.top - h - MENU_GAP > VIEWPORT_MARGIN
    ) {
      top = rect.top - h - MENU_GAP;
    }
    const left = Math.min(
      Math.max(rect.right + MENU_GAP - w, VIEWPORT_MARGIN),
      window.innerWidth - w - VIEWPORT_MARGIN,
    );
    menu.style.top = `${top}px`;
    menu.style.left = `${left}px`;

    const nodes = menu.querySelectorAll<HTMLElement>('[role="menuitem"]');
    nodes[initialFocus === 'first' ? 0 : nodes.length - 1]?.focus();
  }, [open, initialFocus]);

  // Clique fora, rolagem ou redimensionamento fecham o menu.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node;
      if (menuRef.current?.contains(target) || buttonRef.current?.contains(target)) return;
      close(false);
    };
    const onScroll = (event: Event) => {
      if (menuRef.current?.contains(event.target as Node)) return;
      close(false);
    };
    const onResize = () => close(false);
    document.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onResize);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onResize);
    };
  }, [open, close]);

  const handleButtonKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      openMenu('first');
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      openMenu('last');
    }
  };

  const handleMenuKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const nodes = Array.from(
      menuRef.current?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [],
    );
    const index = nodes.indexOf(document.activeElement as HTMLElement);
    const focusAt = (i: number) => nodes[(i + nodes.length) % nodes.length]?.focus();

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        focusAt(index + 1);
        break;
      case 'ArrowUp':
        event.preventDefault();
        focusAt(index - 1);
        break;
      case 'Home':
        event.preventDefault();
        focusAt(0);
        break;
      case 'End':
        event.preventDefault();
        focusAt(nodes.length - 1);
        break;
      case 'Escape':
        event.preventDefault();
        event.stopPropagation();
        close(true);
        break;
      case 'Tab':
        event.preventDefault();
        close(true);
        break;
    }
  };

  const select = (item: MenuItemEntry) => {
    close(true);
    item.onSelect();
  };

  const renderItem = (item: MenuItemEntry) => (
    <button
      key={item.key}
      type="button"
      role="menuitem"
      tabIndex={-1}
      className={cx(styles.item, item.danger && styles.danger)}
      onClick={() => select(item)}
    >
      {item.icon}
      {item.label}
      {item.trailing}
    </button>
  );

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        aria-label={label}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        className={className}
        data-open={open || undefined}
        onClick={() => (open ? close(false) : openMenu('first'))}
        onKeyDown={handleButtonKeyDown}
      >
        {children}
      </button>
      {open &&
        items.length > 0 &&
        createPortal(
          <div
            ref={menuRef}
            id={menuId}
            role="menu"
            tabIndex={-1}
            aria-label={menuLabel}
            className={styles.menu}
            onKeyDown={handleMenuKeyDown}
          >
            {entries.map((entry) => {
              if (entry.type === 'separator')
                return <div key={entry.key} role="separator" className={styles.separator} />;
              if (entry.type === 'group')
                return (
                  <div
                    key={entry.key}
                    role="group"
                    aria-label={entry.label}
                    className={styles.group}
                  >
                    <div aria-hidden="true" className={styles.groupLabel}>
                      {entry.label}
                    </div>
                    {entry.items.map(renderItem)}
                  </div>
                );
              return renderItem(entry);
            })}
          </div>,
          // Dentro do <main> para continuar em um landmark (o position: fixed escapa do scroll).
          document.getElementById('quadro') ?? document.body,
        )}
    </>
  );
}
