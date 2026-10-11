/**
 * ESPECIFICAÇÃO do boardSlice (Etapa 1 — TDD invertido).
 * Implemente src/features/board/boardSlice.ts até esta suíte ficar verde.
 * Não altere este arquivo.
 */
import {
  boardHydrated,
  boardReducer,
  cardAdded,
  cardDeleted,
  cardDeleteUndone,
  cardMoved,
  cardUpdated,
  initialBoardState,
} from '@/features/board/boardSlice';
import type { BoardState, Card, ColumnId } from '@/features/board/types';

const T0 = '2026-01-01T10:00:00.000Z';
const T1 = '2026-01-02T15:30:00.000Z';

function makeCard(id: string, columnId: ColumnId, overrides: Partial<Card> = {}): Card {
  return { id, title: `Card ${id}`, columnId, createdAt: T0, updatedAt: T0, ...overrides };
}

/** Monta um BoardState a partir das listas de ids por coluna. */
function makeBoard(columns: Partial<Record<ColumnId, string[]>>): BoardState {
  const full: Record<ColumnId, string[]> = { todo: [], doing: [], done: [], ...columns };
  const cards: Record<string, Card> = {};
  (Object.keys(full) as ColumnId[]).forEach((col) =>
    full[col].forEach((id) => (cards[id] = makeCard(id, col))),
  );
  return { cards, columns: full };
}

describe('boardSlice', () => {
  describe('estado inicial', () => {
    it('começa com o quadro vazio e as três colunas', () => {
      const state = boardReducer(undefined, { type: '@@INIT' });
      expect(state).toEqual(initialBoardState);
      expect(state.cards).toEqual({});
      expect(state.columns).toEqual({ todo: [], doing: [], done: [] });
      expect(state.lastDeleted).toBeUndefined();
    });
  });

  describe('cardAdded', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(T0));
    });
    afterEach(() => jest.useRealTimers());

    it('o action creator gera id único e datas ISO no prepare', () => {
      const a = cardAdded({ title: 'A', columnId: 'todo' });
      const b = cardAdded({ title: 'B', columnId: 'todo' });

      expect(a.payload.id).toEqual(expect.any(String));
      expect(a.payload.id).not.toBe('');
      expect(a.payload.id).not.toBe(b.payload.id);
      expect(a.payload.createdAt).toBe(T0);
      expect(a.payload.updatedAt).toBe(T0);
    });

    it('aplica trim no título e na descrição', () => {
      const { payload } = cardAdded({
        title: '  Configurar CI  ',
        description: '  lint + test  ',
        columnId: 'todo',
      });
      expect(payload.title).toBe('Configurar CI');
      expect(payload.description).toBe('lint + test');
    });

    it('não guarda descrição vazia (só espaços vira ausente)', () => {
      const { payload } = cardAdded({ title: 'A', description: '   ', columnId: 'todo' });
      expect(payload.description).toBeUndefined();
    });

    it('cria o card e insere no TOPO da coluna escolhida', () => {
      const start = makeBoard({ doing: ['x', 'y'] });
      const action = cardAdded({ title: 'Novo', columnId: 'doing' });
      const state = boardReducer(start, action);

      const { id } = action.payload;
      expect(state.columns.doing).toEqual([id, 'x', 'y']);
      expect(state.cards[id]).toEqual({
        id,
        title: 'Novo',
        columnId: 'doing',
        createdAt: T0,
        updatedAt: T0,
      });
    });

    it('não mexe nas outras colunas', () => {
      const start = makeBoard({ todo: ['a'], done: ['z'] });
      const state = boardReducer(start, cardAdded({ title: 'Novo', columnId: 'doing' }));
      expect(state.columns.todo).toEqual(['a']);
      expect(state.columns.done).toEqual(['z']);
    });
  });

  describe('cardUpdated', () => {
    beforeEach(() => {
      jest.useFakeTimers();
      jest.setSystemTime(new Date(T1));
    });
    afterEach(() => jest.useRealTimers());

    it('atualiza título e descrição e renova updatedAt', () => {
      const start = makeBoard({ todo: ['a'] });
      const state = boardReducer(
        start,
        cardUpdated({ id: 'a', changes: { title: 'Título novo', description: 'Desc' } }),
      );
      expect(state.cards.a).toMatchObject({
        title: 'Título novo',
        description: 'Desc',
        updatedAt: T1,
        createdAt: T0,
      });
    });

    it('aplica trim no título editado', () => {
      const start = makeBoard({ todo: ['a'] });
      const state = boardReducer(start, cardUpdated({ id: 'a', changes: { title: '  Oi  ' } }));
      expect(state.cards.a?.title).toBe('Oi');
    });

    it('não muda a posição nem a coluna do card', () => {
      const start = makeBoard({ todo: ['a', 'b'] });
      const state = boardReducer(start, cardUpdated({ id: 'b', changes: { title: 'B2' } }));
      expect(state.columns.todo).toEqual(['a', 'b']);
      expect(state.cards.b?.columnId).toBe('todo');
    });

    it('ignora id inexistente (devolve o mesmo estado)', () => {
      const start = makeBoard({ todo: ['a'] });
      const state = boardReducer(start, cardUpdated({ id: 'nope', changes: { title: 'X' } }));
      expect(state).toBe(start);
    });
  });

  describe('cardDeleted', () => {
    it('remove o card do mapa e da coluna', () => {
      const start = makeBoard({ todo: ['a', 'b', 'c'] });
      const state = boardReducer(start, cardDeleted({ id: 'b' }));
      expect(state.columns.todo).toEqual(['a', 'c']);
      expect(state.cards.b).toBeUndefined();
    });

    it('guarda o card e a posição original em lastDeleted', () => {
      const start = makeBoard({ doing: ['a', 'b', 'c'] });
      const state = boardReducer(start, cardDeleted({ id: 'b' }));
      expect(state.lastDeleted).toEqual({ card: start.cards.b, index: 1 });
    });

    it('uma nova exclusão substitui lastDeleted', () => {
      const start = makeBoard({ todo: ['a', 'b'] });
      const s1 = boardReducer(start, cardDeleted({ id: 'a' }));
      const s2 = boardReducer(s1, cardDeleted({ id: 'b' }));
      expect(s2.lastDeleted?.card.id).toBe('b');
      expect(s2.lastDeleted?.index).toBe(0);
    });

    it('ignora id inexistente (devolve o mesmo estado)', () => {
      const start = makeBoard({ todo: ['a'] });
      expect(boardReducer(start, cardDeleted({ id: 'nope' }))).toBe(start);
    });
  });

  describe('cardDeleteUndone', () => {
    it('restaura o card na posição original e limpa lastDeleted', () => {
      const start = makeBoard({ todo: ['a', 'b', 'c'] });
      const deleted = boardReducer(start, cardDeleted({ id: 'b' }));
      const state = boardReducer(deleted, cardDeleteUndone());
      expect(state.columns.todo).toEqual(['a', 'b', 'c']);
      expect(state.cards.b).toEqual(start.cards.b);
      expect(state.lastDeleted).toBeUndefined();
    });

    it('restaura no fim quando a coluna encolheu desde a exclusão', () => {
      const start = makeBoard({ todo: ['a', 'b', 'c'] });
      let state = boardReducer(start, cardDeleted({ id: 'c' })); // index 2
      state = boardReducer(state, cardMoved({ id: 'a', toColumn: 'done', toIndex: 0 }));
      state = boardReducer(state, cardDeleteUndone());
      expect(state.columns.todo).toEqual(['b', 'c']);
    });

    it('sem nada para desfazer, devolve o mesmo estado', () => {
      const start = makeBoard({ todo: ['a'] });
      expect(boardReducer(start, cardDeleteUndone())).toBe(start);
    });
  });

  describe('cardMoved', () => {
    describe('entre colunas', () => {
      it('remove da origem, insere no destino na posição pedida e atualiza columnId', () => {
        const start = makeBoard({ todo: ['a', 'b'], doing: ['x', 'y'] });
        const state = boardReducer(start, cardMoved({ id: 'a', toColumn: 'doing', toIndex: 1 }));
        expect(state.columns.todo).toEqual(['b']);
        expect(state.columns.doing).toEqual(['x', 'a', 'y']);
        expect(state.cards.a?.columnId).toBe('doing');
      });

      it('toIndex 0 insere no topo', () => {
        const start = makeBoard({ todo: ['a'], done: ['x', 'y'] });
        const state = boardReducer(start, cardMoved({ id: 'a', toColumn: 'done', toIndex: 0 }));
        expect(state.columns.done).toEqual(['a', 'x', 'y']);
      });

      it('toIndex igual ao tamanho do destino insere no fim', () => {
        const start = makeBoard({ todo: ['a'], done: ['x', 'y'] });
        const state = boardReducer(start, cardMoved({ id: 'a', toColumn: 'done', toIndex: 2 }));
        expect(state.columns.done).toEqual(['x', 'y', 'a']);
      });

      it('toIndex além do fim é limitado ao fim', () => {
        const start = makeBoard({ todo: ['a'], done: ['x'] });
        const state = boardReducer(start, cardMoved({ id: 'a', toColumn: 'done', toIndex: 99 }));
        expect(state.columns.done).toEqual(['x', 'a']);
      });

      it('toIndex negativo é limitado ao topo', () => {
        const start = makeBoard({ todo: ['a'], done: ['x'] });
        const state = boardReducer(start, cardMoved({ id: 'a', toColumn: 'done', toIndex: -3 }));
        expect(state.columns.done).toEqual(['a', 'x']);
      });

      it('funciona para coluna de destino vazia', () => {
        const start = makeBoard({ todo: ['a', 'b'] });
        const state = boardReducer(start, cardMoved({ id: 'b', toColumn: 'done', toIndex: 0 }));
        expect(state.columns).toEqual({ todo: ['a'], doing: [], done: ['b'] });
      });
    });

    describe('na mesma coluna (reordenação)', () => {
      it('move para baixo: toIndex é a posição final', () => {
        const start = makeBoard({ todo: ['a', 'b', 'c', 'd'] });
        const state = boardReducer(start, cardMoved({ id: 'a', toColumn: 'todo', toIndex: 2 }));
        expect(state.columns.todo).toEqual(['b', 'c', 'a', 'd']);
      });

      it('move para cima', () => {
        const start = makeBoard({ todo: ['a', 'b', 'c', 'd'] });
        const state = boardReducer(start, cardMoved({ id: 'd', toColumn: 'todo', toIndex: 0 }));
        expect(state.columns.todo).toEqual(['d', 'a', 'b', 'c']);
      });

      it('para a última posição', () => {
        const start = makeBoard({ todo: ['a', 'b', 'c'] });
        const state = boardReducer(start, cardMoved({ id: 'a', toColumn: 'todo', toIndex: 2 }));
        expect(state.columns.todo).toEqual(['b', 'c', 'a']);
      });

      it('mesma posição não altera a ordem', () => {
        const start = makeBoard({ todo: ['a', 'b', 'c'] });
        const state = boardReducer(start, cardMoved({ id: 'b', toColumn: 'todo', toIndex: 1 }));
        expect(state.columns.todo).toEqual(['a', 'b', 'c']);
      });
    });

    it('não altera updatedAt ao mover (mover não é editar)', () => {
      const start = makeBoard({ todo: ['a'] });
      const state = boardReducer(start, cardMoved({ id: 'a', toColumn: 'done', toIndex: 0 }));
      expect(state.cards.a?.updatedAt).toBe(T0);
    });

    it('ignora id inexistente (devolve o mesmo estado)', () => {
      const start = makeBoard({ todo: ['a'] });
      expect(boardReducer(start, cardMoved({ id: 'nope', toColumn: 'done', toIndex: 0 }))).toBe(
        start,
      );
    });

    it('não altera o estado anterior (imutabilidade)', () => {
      const start = makeBoard({ todo: ['a', 'b'], doing: ['x'] });
      const snapshot = JSON.parse(JSON.stringify(start)) as BoardState;
      boardReducer(start, cardMoved({ id: 'a', toColumn: 'doing', toIndex: 0 }));
      expect(start).toEqual(snapshot);
    });
  });

  describe('boardHydrated', () => {
    it('substitui o estado inteiro pelo carregado', () => {
      const loaded = makeBoard({ todo: ['a'], done: ['b'] });
      const state = boardReducer(makeBoard({ doing: ['z'] }), boardHydrated(loaded));
      expect(state).toEqual(loaded);
    });
  });
});
