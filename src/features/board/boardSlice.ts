/**
 * boardSlice — ETAPA 1 (sua): TDD invertido
 * ------------------------------------------------------------------
 * Aqui estão só os TIPOS e as ASSINATURAS das actions. Os corpos estão vazios.
 * A especificação é a suíte em tests/unit/boardSlice.test.ts: implemente até
 * ficar verde, SEM alterar os testes.
 *
 * A UI já despacha estas actions — o quadro "ganha vida" quando você terminar.
 *
 * Regras (spec §2.2 e §7.3):
 *  - cardAdded: gera id (crypto.randomUUID) e datas no `prepare`; aplica trim no
 *    título; insere no TOPO da coluna.
 *  - cardUpdated: aplica `changes` e atualiza `updatedAt` (createdAt não muda).
 *  - cardDeleted: remove e guarda { card, index } em `lastDeleted`.
 *  - cardDeleteUndone: restaura `lastDeleted` na posição original.
 *  - cardMoved: `toIndex` é a posição FINAL do card na coluna de destino
 *    (mesma semântica do arrayMove). Mesma coluna = reordenação.
 *  - boardHydrated: substitui o estado (vem da persistência).
 *
 * Pode trocar o formato interno (ex.: createEntityAdapter) desde que os testes
 * continuem verdes e as assinaturas abaixo se mantenham — a UI depende delas.
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { BoardState, Card, CardChanges, CardDraft, ColumnId } from './types';

export const initialBoardState: BoardState = {
  cards: {},
  columns: { todo: [], doing: [], done: [] },
};

const notImplemented = (what: string) =>
  new Error(`boardSlice: ${what} ainda não implementado (Etapa 1).`);

export const boardSlice = createSlice({
  name: 'board',
  initialState: initialBoardState,
  reducers: {
    cardAdded: {
      reducer(_state, _action: PayloadAction<Card>) {
        // TODO(Etapa 1)
      },
      prepare(_draft: CardDraft): { payload: Card } {
        // TODO(Etapa 1): gerar id, datas e aplicar trim
        throw notImplemented('cardAdded.prepare');
      },
    },
    cardUpdated(_state, _action: PayloadAction<{ id: string; changes: CardChanges }>) {
      // TODO(Etapa 1)
    },
    cardDeleted(_state, _action: PayloadAction<{ id: string }>) {
      // TODO(Etapa 1)
    },
    cardDeleteUndone(_state) {
      // TODO(Etapa 1)
    },
    cardMoved(_state, _action: PayloadAction<{ id: string; toColumn: ColumnId; toIndex: number }>) {
      // TODO(Etapa 1)
    },
    boardHydrated(_state, _action: PayloadAction<BoardState>) {
      // TODO(Etapa 1)
    },
  },
});

export const { cardAdded, cardUpdated, cardDeleted, cardDeleteUndone, cardMoved, boardHydrated } =
  boardSlice.actions;
export const boardReducer = boardSlice.reducer;
