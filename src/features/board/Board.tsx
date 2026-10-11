import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useEffect, useMemo, useRef, useState, type RefObject } from 'react';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';
import { BoardIcon, PlusIcon } from '@/components/Icons';
import { useAnnounce } from '@/components/LiveAnnouncer';
import { queryCleared, selectQuery } from '@/features/filter/filterSlice';
import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { focusCard, focusLater } from '@/utils/focus';
import { cardMoved } from './boardSlice';
import { useBoardUi } from './BoardUiContext';
import { CardView } from './Card';
import { Column, DropHint, NoMatchHint } from './Column';
import columnStyles from './Column.module.css';
import {
  createAnnouncements,
  findColumn,
  resolveDrop,
  screenReaderInstructions,
  type ColumnsMap,
} from './dnd/announcements';
import { DragStateContext, type DragUiState } from './dnd/DragStateContext';
import { KeyboardDragHint } from './KeyboardDragHint';
import { NoResults } from './NoResults';
import {
  selectCardById,
  selectColumnCounts,
  selectFilteredColumnCards,
  selectIsFiltering,
} from './selectors';
import { STAGES } from './stages';
import type { ColumnId } from './types';
import styles from './Board.module.css';

interface DragSession {
  activeId: string;
  mode: 'pointer' | 'keyboard';
  from: ColumnId;
  fromIndex: number;
  /** Prévia das colunas durante o arraste (o card "viaja" entre listas). */
  columns: ColumnsMap;
}

interface BoardProps {
  stripRef: RefObject<HTMLDivElement | null>;
  onActiveColumnChange: (index: number) => void;
}

export function Board({ stripRef, onActiveColumnChange }: BoardProps) {
  const dispatch = useAppDispatch();
  const ui = useBoardUi();
  const announce = useAnnounce();
  const reduced = usePrefersReducedMotion();

  const query = useAppSelector(selectQuery);
  const isFiltering = useAppSelector(selectIsFiltering);
  const counts = useAppSelector(selectColumnCounts);
  const todo = useAppSelector((s) => selectFilteredColumnCards(s, 'todo'));
  const doing = useAppSelector((s) => selectFilteredColumnCards(s, 'doing'));
  const done = useAppSelector((s) => selectFilteredColumnCards(s, 'done'));

  const visible = useMemo<ColumnsMap>(
    () => ({
      todo: todo.map((c) => c.id),
      doing: doing.map((c) => c.id),
      done: done.map((c) => c.id),
    }),
    [todo, doing, done],
  );

  const [drag, setDrag] = useState<DragSession | null>(null);
  const [lastDropAt, setLastDropAt] = useState(0);
  const columns = drag?.columns ?? visible;
  const activeCard = useAppSelector((s) => (drag ? selectCardById(s, drag.activeId) : undefined));

  const totalCards = counts.todo.total + counts.doing.total + counts.done.total;
  const visibleCards = visible.todo.length + visible.doing.length + visible.done.length;
  const boardEmpty = totalCards === 0 && !isFiltering;
  const noResults = isFiltering && visibleCards === 0 && !drag;

  // Anúncio do resultado da busca (só quando o termo muda).
  const announcedQuery = useRef('');
  useEffect(() => {
    const term = query.trim();
    if (term === announcedQuery.current) return;
    announcedQuery.current = term;
    if (!term) return;
    announce(
      visibleCards === 0
        ? `Nenhum card encontrado para '${term}'`
        : visibleCards === 1
          ? '1 card encontrado'
          : `${visibleCards} cards encontrados`,
    );
  }, [query, visibleCards, announce]);

  // Estado atual lido pelos anúncios do @dnd-kit (chamados fora do render).
  const live = useRef({ columns, isFiltering, drag });
  useEffect(() => {
    live.current = { columns, isFiltering, drag };
  });

  // Os anúncios são chamados pelo @dnd-kit durante o arraste, nunca no render.
  const announcements = useMemo(
    () =>
      // eslint-disable-next-line react-hooks/refs
      createAnnouncements({
        columns: () => live.current.columns,
        appendOnly: () => live.current.isFiltering,
        origin: () => {
          const d = live.current.drag;
          return d ? { column: d.from, index: d.fromIndex } : undefined;
        },
      }),
    [],
  );

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
      keyboardCodes: { start: ['Space'], cancel: ['Escape'], end: ['Space', 'Enter'] },
    }),
  );

  const handleDragStart = ({ active, activatorEvent }: DragStartEvent) => {
    const id = String(active.id);
    const from = findColumn(id, visible);
    if (!from) return;
    setDrag({
      activeId: id,
      mode: activatorEvent instanceof KeyboardEvent ? 'keyboard' : 'pointer',
      from,
      fromIndex: visible[from].indexOf(id),
      columns: visible,
    });
  };

  // Ao passar sobre outra coluna, o card entra na lista dela (placeholder no destino).
  const handleDragOver = ({ active, over }: DragOverEvent) => {
    if (!over) return;
    setDrag((d) => {
      if (!d) return d;
      const id = String(active.id);
      const from = findColumn(id, d.columns);
      const to = findColumn(over.id, d.columns);
      if (!from || !to || from === to) return d;

      const target = d.columns[to];
      let index = target.indexOf(String(over.id));
      if (index < 0 || isFiltering) {
        index = target.length;
      } else {
        const rect = active.rect.current.translated;
        if (rect && rect.top > over.rect.top + over.rect.height / 2) index += 1;
      }
      return {
        ...d,
        columns: {
          ...d.columns,
          [from]: d.columns[from].filter((x) => x !== id),
          [to]: [...target.slice(0, index), id, ...target.slice(index)],
        },
      };
    });
  };

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    const d = drag;
    setDrag(null);
    setLastDropAt(Date.now());
    if (!d || !over) return;

    const id = String(active.id);
    const drop = resolveDrop(id, over.id, d.columns, isFiltering);
    if (!drop) return;

    if (isFiltering) {
      // Com busca: só muda de coluna, sempre para o fim (RF03).
      if (drop.column === d.from) return;
      dispatch(cardMoved({ id, toColumn: drop.column, toIndex: counts[drop.column].total }));
    } else {
      if (drop.column === d.from && drop.index === d.fromIndex) return;
      dispatch(cardMoved({ id, toColumn: drop.column, toIndex: drop.index }));
    }
    if (d.mode === 'keyboard') focusCard(id);
  };

  const handleDragCancel = () => {
    setDrag(null);
    setLastDropAt(Date.now());
  };

  // Seletor de etapas (mobile): qual coluna está encostada no início do quadro.
  const handleScroll = () => {
    const strip = stripRef.current;
    if (!strip) return;
    const cols = Array.from(strip.querySelectorAll<HTMLElement>('[data-column]'));
    const first = cols[0];
    if (!first) return;
    const max = strip.scrollWidth - strip.clientWidth;
    if (strip.scrollLeft >= max - 2) {
      onActiveColumnChange(cols.length - 1);
      return;
    }
    let best = 0;
    let bestDistance = Infinity;
    cols.forEach((col, i) => {
      const distance = Math.abs(col.offsetLeft - first.offsetLeft - strip.scrollLeft);
      if (distance < bestDistance) {
        best = i;
        bestDistance = distance;
      }
    });
    onActiveColumnChange(best);
  };

  const dragState = useMemo<DragUiState>(
    () => ({ activeId: drag?.activeId ?? null, mode: drag?.mode ?? null, lastDropAt }),
    [drag?.activeId, drag?.mode, lastDropAt],
  );

  const overColumn = drag ? findColumn(drag.activeId, drag.columns) : undefined;
  const keyboardInfo =
    drag?.mode === 'keyboard' && overColumn
      ? {
          column: overColumn,
          index: columns[overColumn].indexOf(drag.activeId),
          total: columns[overColumn].length,
        }
      : null;

  const emptyContentFor = (index: number) => {
    if (boardEmpty && index === 0)
      return (
        <div className={columnStyles.emptyBoard}>
          <EmptyState
            icon={<BoardIcon size={32} />}
            title="Seu quadro está vazio."
            description="Comece criando o primeiro card."
            action={
              <Button variant="primary" icon={<PlusIcon />} onClick={ui.openCreate}>
                Adicionar card
              </Button>
            }
          />
        </div>
      );
    if (isFiltering && !drag) return noResults ? null : <NoMatchHint />;
    return <DropHint />;
  };

  return (
    <DragStateContext.Provider value={dragState}>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        accessibility={{ announcements, screenReaderInstructions }}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div ref={stripRef} className={styles.strip} onScroll={handleScroll}>
          {STAGES.map((stage, i) => (
            <Column
              key={stage.id}
              stage={stage}
              ids={columns[stage.id]}
              count={counts[stage.id]}
              isFiltering={isFiltering}
              query={query}
              isDropTarget={drag !== null && overColumn === stage.id && stage.id !== drag.from}
              isLast={i === STAGES.length - 1}
              emptyContent={emptyContentFor(i)}
            />
          ))}
        </div>
        <DragOverlay
          zIndex={200}
          dropAnimation={reduced ? null : { duration: 200, easing: 'cubic-bezier(0.2, 0, 0, 1)' }}
        >
          {drag?.mode === 'pointer' && activeCard ? (
            <div aria-hidden="true">
              <CardView card={activeCard} query={query} variant="dragging" />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {noResults && (
        <NoResults
          term={query.trim()}
          onClear={() => {
            dispatch(queryCleared());
            focusLater('input[type="search"]');
          }}
        />
      )}
      {keyboardInfo && <KeyboardDragHint {...keyboardInfo} />}
    </DragStateContext.Provider>
  );
}
