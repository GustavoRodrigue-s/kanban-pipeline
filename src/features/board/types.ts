// Modelo de dados do quadro (spec §7.2).

export type ColumnId = 'todo' | 'doing' | 'done';

export const COLUMN_IDS = ['todo', 'doing', 'done'] as const satisfies readonly ColumnId[];

export interface Card {
  id: string;
  title: string;
  description?: string;
  columnId: ColumnId;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface BoardState {
  cards: Record<string, Card>;
  /** Ordem dos ids em cada coluna (índice 0 = topo). */
  columns: Record<ColumnId, string[]>;
  /** Último card excluído — suporte ao "Desfazer". */
  lastDeleted?: { card: Card; index: number };
}

/** O que a UI envia para criar um card. id e datas são gerados pela action. */
export interface CardDraft {
  title: string;
  description?: string;
  columnId: ColumnId;
}

/** Campos editáveis de um card. */
export type CardChanges = Partial<Pick<Card, 'title' | 'description'>>;
