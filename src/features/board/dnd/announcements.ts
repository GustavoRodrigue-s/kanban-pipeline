import type { Announcements, ScreenReaderInstructions, UniqueIdentifier } from '@dnd-kit/core';
import { COLUMN_IDS, type ColumnId } from '../types';
import { stageLabel } from '../stages';

export type ColumnsMap = Record<ColumnId, string[]>;

export const isColumnId = (id: UniqueIdentifier): id is ColumnId =>
  (COLUMN_IDS as readonly UniqueIdentifier[]).includes(id);

/** Coluna que contém `id` (ou a própria coluna, se `id` for uma). */
export function findColumn(id: UniqueIdentifier, columns: ColumnsMap): ColumnId | undefined {
  if (isColumnId(id)) return id;
  return COLUMN_IDS.find((col) => columns[col].includes(String(id)));
}

/**
 * Onde o card cairia se fosse solto agora sobre `overId`.
 * Mesma coluna: semântica de arrayMove (índice final = índice do alvo).
 */
export function resolveDrop(
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier,
  columns: ColumnsMap,
  appendOnly: boolean,
): { column: ColumnId; index: number; total: number } | undefined {
  const column = findColumn(overId, columns);
  if (!column) return undefined;
  const list = columns[column];
  const contains = list.includes(String(activeId));
  const total = contains ? list.length : list.length + 1;
  if (appendOnly)
    return { column, index: contains ? list.indexOf(String(activeId)) : list.length, total };
  const overIndex = list.indexOf(String(overId));
  const index =
    overIndex >= 0 ? overIndex : contains ? list.indexOf(String(activeId)) : list.length;
  return { column, index, total };
}

export const screenReaderInstructions: ScreenReaderInstructions = {
  draggable:
    'Para mover um card, pressione Espaço. Use as setas esquerda e direita para mudar de etapa e as setas para cima e para baixo para mudar a posição. Pressione Espaço para soltar ou Esc para cancelar. Enter abre a edição.',
};

interface AnnouncementContext {
  columns: () => ColumnsMap;
  appendOnly: () => boolean;
  origin: () => { column: ColumnId; index: number } | undefined;
}

const titleOf = (data: unknown) =>
  typeof data === 'object' && data && 'title' in data ? String(data.title) : '';

/** Anúncios do design (06 › Anúncios do arrastar e soltar). */
export function createAnnouncements(ctx: AnnouncementContext): Announcements {
  return {
    onDragStart({ active }) {
      const columns = ctx.columns();
      const column = findColumn(active.id, columns);
      if (!column) return undefined;
      const list = columns[column];
      return `Card '${titleOf(active.data.current)}' pego. Posição ${list.indexOf(String(active.id)) + 1} de ${list.length} em ${stageLabel(column)}. Use as setas para mover, Espaço para soltar, Esc para cancelar.`;
    },
    onDragOver({ active, over }) {
      const title = titleOf(active.data.current);
      if (!over) return `Card '${title}' fora das etapas.`;
      const drop = resolveDrop(active.id, over.id, ctx.columns(), ctx.appendOnly());
      if (!drop) return undefined;
      return `Card '${title}' sobre ${stageLabel(drop.column)}, posição ${drop.index + 1} de ${drop.total}.`;
    },
    onDragEnd({ active, over }) {
      const title = titleOf(active.data.current);
      const origin = ctx.origin();
      if (!over) {
        return origin
          ? `Movimento cancelado. Card '${title}' voltou para ${stageLabel(origin.column)}, posição ${origin.index + 1}.`
          : undefined;
      }
      const drop = resolveDrop(active.id, over.id, ctx.columns(), ctx.appendOnly());
      if (!drop) return undefined;
      return `Card '${title}' solto em ${stageLabel(drop.column)}, posição ${drop.index + 1} de ${drop.total}.`;
    },
    onDragCancel({ active }) {
      const origin = ctx.origin();
      if (!origin) return undefined;
      return `Movimento cancelado. Card '${titleOf(active.data.current)}' voltou para ${stageLabel(origin.column)}, posição ${origin.index + 1}.`;
    },
  };
}
