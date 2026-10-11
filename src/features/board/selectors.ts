/**
 * Seletores do quadro — ETAPA 2 (sua)
 * ------------------------------------------------------------------
 * STUBS. Estas são as assinaturas que a UI chama hoje (nomes da spec §7.4).
 * Enquanto não forem implementadas, devolvem valores vazios e o quadro aparece
 * vazio. Requisitos completos: docs/etapa-2-requisitos.md.
 *
 * Você é livre para mudar o desenho (ex.: fábricas `makeSelect…`), desde que
 * ajuste os call sites listados no documento de requisitos.
 */
import type { RootState } from '@/store';
import type { Card, ColumnId } from './types';

export interface ColumnCount {
  /** Cards na coluna, ignorando a busca. */
  total: number;
  /** Cards visíveis com a busca atual (igual a `total` sem busca). */
  filtered: number;
}

const EMPTY_CARDS: Card[] = [];
const EMPTY_COUNTS: Record<ColumnId, ColumnCount> = {
  todo: { total: 0, filtered: 0 },
  doing: { total: 0, filtered: 0 },
  done: { total: 0, filtered: 0 },
};

/** Cards da coluna, na ordem, ignorando a busca. */
export const selectColumnCards = (_state: RootState, _columnId: ColumnId): Card[] => EMPTY_CARDS;

/** Cards da coluna que correspondem à busca (sem acento e sem caixa), na ordem. */
export const selectFilteredColumnCards = (_state: RootState, _columnId: ColumnId): Card[] =>
  EMPTY_CARDS;

/** Total e filtrado por coluna. */
export const selectColumnCounts = (_state: RootState): Record<ColumnId, ColumnCount> =>
  EMPTY_COUNTS;

/** true quando há termo de busca (ignorando espaços). */
export const selectIsFiltering = (_state: RootState): boolean => false;

export const selectCardById = (_state: RootState, _id: string): Card | undefined => undefined;
