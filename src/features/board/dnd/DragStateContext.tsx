import { createContext, useContext } from 'react';

export interface DragUiState {
  activeId: string | null;
  mode: 'pointer' | 'keyboard' | null;
  /** Momento do último "soltar", para ignorar o clique que o segue. */
  lastDropAt: number;
}

export const DragStateContext = createContext<DragUiState>({
  activeId: null,
  mode: null,
  lastDropAt: 0,
});

export const useDragState = () => useContext(DragStateContext);
