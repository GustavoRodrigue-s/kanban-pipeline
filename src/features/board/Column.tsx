import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { memo, useId, type ReactNode } from 'react';
import { Counter } from '@/components/Counter';
import { ArrowDownIcon } from '@/components/Icons';
import { cx } from '@/utils/cx';
import { SortableCard } from './Card';
import type { ColumnCount } from './selectors';
import type { StageMeta } from './stages';
import styles from './Column.module.css';

interface ColumnProps {
  stage: StageMeta;
  ids: string[];
  count: ColumnCount;
  isFiltering: boolean;
  query: string;
  isDropTarget: boolean;
  isLast: boolean;
  /** Conteúdo quando a coluna não tem cards (dica, estado vazio do quadro…). */
  emptyContent?: ReactNode;
}

export const Column = memo(function Column({
  stage,
  ids,
  count,
  isFiltering,
  query,
  isDropTarget,
  isLast,
  emptyContent,
}: ColumnProps) {
  const { setNodeRef } = useDroppable({ id: stage.id });
  const headingId = useId();
  const counter = isFiltering ? `${count.filtered} de ${count.total}` : String(count.total);

  return (
    <section
      className={styles.column}
      aria-label={`${stage.num} ${stage.name}, ${counter} cards`}
      data-column={stage.id}
    >
      <div className={styles.header}>
        <span
          className={styles.ring}
          style={{ borderColor: `var(--color-stage-${stage.id})` }}
          aria-hidden="true"
        />
        <span className={styles.num}>{stage.num}</span>
        <h2 id={headingId} className={styles.name}>
          {stage.name}
        </h2>
        <Counter>{counter}</Counter>
        <span className={cx(styles.line, isLast && styles.lineLast)} aria-hidden="true" />
      </div>

      <div ref={setNodeRef} className={cx(styles.body, isDropTarget && styles.dropTarget)}>
        {isDropTarget && (
          <p className={styles.dropLabel} aria-hidden="true">
            <ArrowDownIcon size={14} />
            Soltar em {stage.num} {stage.name}
          </p>
        )}
        <SortableContext id={stage.id} items={ids} strategy={verticalListSortingStrategy}>
          {ids.length > 0 && (
            <ul className={styles.list} aria-labelledby={headingId}>
              {ids.map((id, index) => (
                <SortableCard
                  key={id}
                  id={id}
                  columnId={stage.id}
                  index={index}
                  total={ids.length}
                  query={query}
                  sortingDisabled={isFiltering}
                />
              ))}
            </ul>
          )}
        </SortableContext>
        {ids.length === 0 && emptyContent}
      </div>
    </section>
  );
});

export function DropHint() {
  return <div className={styles.dropHint}>Arraste um card para cá</div>;
}

export function NoMatchHint() {
  return <p className={styles.noMatch}>Nenhum card desta etapa corresponde à busca</p>;
}
