import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { useAnnounce } from '@/components/LiveAnnouncer';
import { Toast } from '@/components/Toast';
import { useAppDispatch, useAppStore } from '@/store/hooks';
import { focusAddButton, focusCard } from '@/utils/focus';
import { cardAdded, cardDeleted, cardDeleteUndone, cardMoved, cardUpdated } from './boardSlice';
import type { CardFormValues } from './cardValidation';
import { CardFormModal, type FormDialog } from './CardFormModal';
import { ConfirmDeleteDialog, type ConfirmDialog } from './ConfirmDeleteDialog';
import { selectCardById, selectColumnCards, selectFilteredColumnCards } from './selectors';
import { stageLabel } from './stages';
import type { ColumnId } from './types';

export const TOAST_DURATION = 6000;

interface BoardUi {
  openCreate: () => void;
  openEdit: (id: string) => void;
  requestDelete: (id: string) => void;
  moveCardTo: (id: string, toColumn: ColumnId) => void;
}

type Dialog = FormDialog | ConfirmDialog;
// Omit distributivo: preserva cada variante da união.
type DialogInput = Dialog extends infer D ? (D extends Dialog ? Omit<D, 'session'> : never) : never;

const BoardUiContext = createContext<BoardUi | null>(null);

// eslint-disable-next-line react-refresh/only-export-components
export function useBoardUi() {
  const ctx = useContext(BoardUiContext);
  if (!ctx) throw new Error('useBoardUi precisa estar dentro de <BoardUiProvider>.');
  return ctx;
}

/**
 * Orquestra as ações de UI do quadro: modais, confirmação, toast "Desfazer",
 * anúncios e para onde o foco vai depois de cada ação (spec §8).
 */
export function BoardUiProvider({ children }: { children: ReactNode }) {
  const dispatch = useAppDispatch();
  const store = useAppStore();
  const announce = useAnnounce();

  const [dialog, setDialog] = useState<Dialog | null>(null);
  const session = useRef(0);
  const [toast, setToast] = useState<{ key: number; deletedId: string } | null>(null);

  const open = useCallback((next: DialogInput) => {
    session.current += 1;
    setDialog({ ...next, session: session.current } as Dialog);
  }, []);
  const close = useCallback(() => setDialog(null), []);

  const ui = useMemo<BoardUi>(
    () => ({
      openCreate: () => open({ kind: 'create' }),
      openEdit: (id) => open({ kind: 'edit', id }),
      requestDelete: (id) => {
        const card = selectCardById(store.getState(), id);
        if (card) open({ kind: 'confirm', id, title: card.title });
      },
      moveCardTo: (id, toColumn) => {
        const state = store.getState();
        const card = selectCardById(state, id);
        if (!card || card.columnId === toColumn) return;
        const toIndex = selectColumnCards(state, toColumn).length; // vai para o fim
        dispatch(cardMoved({ id, toColumn, toIndex }));
        announce(`Card '${card.title}' movido para ${stageLabel(toColumn)}.`);
        focusCard(id);
      },
    }),
    [announce, dispatch, open, store],
  );

  const handleSubmit = (values: CardFormValues) => {
    if (!dialog || dialog.kind === 'confirm') return;
    if (dialog.kind === 'create') {
      const action = dispatch(cardAdded({ ...values, columnId: 'todo' }));
      close();
      focusCard(action.payload.id);
    } else {
      dispatch(cardUpdated({ id: dialog.id, changes: values }));
      close();
    }
  };

  const handleConfirmDelete = () => {
    if (dialog?.kind !== 'confirm') return;
    const state = store.getState();
    const card = selectCardById(state, dialog.id);
    let nextId: string | undefined;
    if (card) {
      const list = selectFilteredColumnCards(state, card.columnId);
      nextId = list[list.findIndex((c) => c.id === card.id) + 1]?.id;
    }
    dispatch(cardDeleted({ id: dialog.id }));
    close();
    setToast((t) => ({ key: (t?.key ?? 0) + 1, deletedId: dialog.id }));
    announce(`Card excluído. Desfazer disponível por ${TOAST_DURATION / 1000} segundos.`);
    if (nextId) focusCard(nextId);
    else focusAddButton();
  };

  const handleUndo = () => {
    if (!toast) return;
    dispatch(cardDeleteUndone());
    setToast(null);
    focusCard(toast.deletedId);
  };

  const formDialog = dialog && dialog.kind !== 'confirm' ? dialog : null;
  const confirmDialog = dialog?.kind === 'confirm' ? dialog : null;

  return (
    <BoardUiContext.Provider value={ui}>
      {children}
      <Toast
        key={toast?.key ?? 0}
        open={toast !== null}
        message="Card excluído"
        actionLabel="Desfazer"
        duration={TOAST_DURATION}
        onAction={handleUndo}
        onDismiss={() => setToast(null)}
      />
      <CardFormModal
        dialog={formDialog}
        onClose={close}
        onSubmit={handleSubmit}
        onDelete={(id) => ui.requestDelete(id)}
      />
      <ConfirmDeleteDialog dialog={confirmDialog} onClose={close} onConfirm={handleConfirmDelete} />
    </BoardUiContext.Provider>
  );
}
