import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { memo, useId, type HTMLAttributes, type KeyboardEvent, type ReactNode } from 'react';
import {
  ArrowRightIcon,
  CheckCircleIcon,
  DotsIcon,
  MoveIcon,
  PencilIcon,
  TrashIcon,
} from '@/components/Icons';
import { MenuButton, type MenuEntry } from '@/components/Menu';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { useAppSelector } from '@/store/hooks';
import { cx } from '@/utils/cx';
import { useBoardUi } from './BoardUiContext';
import { useDragState } from './dnd/DragStateContext';
import { highlight } from './highlight';
import { selectCardById } from './selectors';
import { STAGES, stageLabel } from './stages';
import type { Card, ColumnId } from './types';
import styles from './Card.module.css';

type CardVariant = 'default' | 'dragging' | 'grabbed' | 'placeholder';

interface CardViewProps {
  card: Card;
  query: string;
  variant?: CardVariant;
  /** Props do elemento focável/arrastável. Ausente no overlay (só visual). */
  handleProps?: HTMLAttributes<HTMLDivElement> & Record<`data-${string}`, string>;
  /** Texto de apoio lido após o título ("01 A fazer, posição 1 de 5…"). */
  description?: string;
  menu?: ReactNode;
}

/** Visual do card (design › Card.dc). Usado na lista e no overlay de arraste. */
export function CardView({
  card,
  query,
  variant = 'default',
  handleProps,
  description,
  menu,
}: CardViewProps) {
  const titleId = useId();
  const descId = useId();
  const done = card.columnId === 'done';

  return (
    <div className={cx(styles.shell, styles[variant], done && styles.done)}>
      <div
        className={styles.card}
        {...(handleProps && {
          ...handleProps,
          'aria-labelledby': titleId,
          'aria-describedby': cx(descId, handleProps['aria-describedby']),
        })}
      >
        <span
          className={styles.rail}
          style={{ background: `var(--color-stage-${card.columnId})` }}
          aria-hidden="true"
        />
        <div className={styles.body}>
          <div className={styles.titleRow}>
            {done && <CheckCircleIcon className={styles.check} />}
            <p id={titleId} className={styles.title}>
              {highlight(card.title, query, styles.mark)}
            </p>
          </div>
          {card.description && (
            <p className={styles.description}>{highlight(card.description, query, styles.mark)}</p>
          )}
          {variant === 'grabbed' && (
            <p className={styles.grabbedLabel} aria-hidden="true">
              <MoveIcon size={14} />
              Movendo · use as setas
            </p>
          )}
        </div>
        {description && (
          <span id={descId} hidden>
            {description}
          </span>
        )}
      </div>
      {menu ??
        (!handleProps && (
          <span className={styles.menuButton} aria-hidden="true">
            <DotsIcon />
          </span>
        ))}
    </div>
  );
}

interface SortableCardProps {
  id: string;
  columnId: ColumnId;
  index: number;
  total: number;
  query: string;
  /** Com busca ativa, reordenar na mesma coluna fica desabilitado (RF03). */
  sortingDisabled: boolean;
}

/** Card na coluna: focável, arrastável (mouse, toque, teclado) e com menu de ações. */
export const SortableCard = memo(function SortableCard({
  id,
  columnId,
  index,
  total,
  query,
  sortingDisabled,
}: SortableCardProps) {
  const card = useAppSelector((state) => selectCardById(state, id));
  const ui = useBoardUi();
  const drag = useDragState();
  const reduced = usePrefersReducedMotion();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    data: { title: card?.title ?? '' },
    disabled: sortingDisabled ? { droppable: true } : false,
    transition: reduced ? null : { duration: 200, easing: 'cubic-bezier(0.2, 0, 0, 1)' },
  });

  if (!card) return null;

  const variant: CardVariant = isDragging
    ? drag.mode === 'keyboard'
      ? 'grabbed'
      : 'placeholder'
    : 'default';

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && !drag.activeId) {
      event.preventDefault();
      ui.openEdit(id);
      return;
    }
    listeners?.onKeyDown?.(event);
  };

  const handleClick = () => {
    if (drag.activeId || Date.now() - drag.lastDropAt < 250) return;
    ui.openEdit(id);
  };

  const entries: MenuEntry[] = [
    {
      type: 'item',
      key: 'edit',
      label: 'Editar',
      icon: <PencilIcon />,
      onSelect: () => ui.openEdit(id),
    },
    { type: 'separator', key: 's1' },
    {
      type: 'group',
      key: 'move',
      label: 'Mover para',
      items: STAGES.filter((s) => s.id !== card.columnId).map((s) => ({
        type: 'item' as const,
        key: s.id,
        label: (
          <span className={styles.moveLabel}>
            <span
              className={styles.moveRing}
              style={{ borderColor: `var(--color-stage-${s.id})` }}
              aria-hidden="true"
            />
            <span className={styles.moveNum}>{s.num}</span> {s.name}
          </span>
        ),
        trailing: <ArrowRightIcon size={14} className={styles.moveArrow} />,
        onSelect: () => ui.moveCardTo(id, s.id),
      })),
    },
    { type: 'separator', key: 's2' },
    {
      type: 'item',
      key: 'delete',
      label: 'Excluir',
      icon: <TrashIcon />,
      danger: true,
      onSelect: () => ui.requestDelete(id),
    },
  ];

  return (
    <li
      ref={setNodeRef}
      className={styles.item}
      style={{ transform: CSS.Translate.toString(transform), transition }}
    >
      <CardView
        card={card}
        query={query}
        variant={variant}
        description={`${stageLabel(columnId)}, posição ${index + 1} de ${total}. Espaço para mover, Enter para editar.`}
        handleProps={{
          ...attributes,
          ...listeners,
          'aria-roledescription': 'card arrastável',
          'aria-pressed': undefined,
          'data-card-id': id,
          onKeyDown: handleKeyDown,
          onClick: handleClick,
        }}
        menu={
          <MenuButton
            label={`Abrir menu do card '${card.title}'`}
            menuLabel="Ações do card"
            entries={entries}
            className={styles.menuButton}
          >
            <DotsIcon />
          </MenuButton>
        }
      />
    </li>
  );
});
