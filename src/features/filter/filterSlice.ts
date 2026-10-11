/**
 * filterSlice — EXEMPLO DE ESTUDO (Etapa 0)
 * ------------------------------------------------------------------
 * Este é o slice de referência do projeto. Leia de cima para baixo antes de
 * começar o boardSlice: ele mostra as convenções que os outros slices seguem.
 *
 * Responsabilidade: guardar o termo de busca (RF05). Só isso.
 *   - O debounce NÃO mora aqui: é responsabilidade da UI (hook useDebouncedValue).
 *     O Redux recebe o valor já "assentado", e a store fica livre de timers.
 *   - A normalização (sem acento / sem caixa) NÃO mora aqui: é derivação, e
 *     derivação é trabalho de seletor (Etapa 2). O estado guarda o que o
 *     usuário digitou, do jeito que ele digitou.
 *   - Este estado NÃO é persistido (RF04). Quem decide o que persiste é a
 *     camada de persistência, não o slice.
 */
import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

// 1) Tipo do estado — exportado para testes e para o RootState.
export interface FilterState {
  query: string;
}

// 2) Estado inicial — exportado: os testes partem dele, e a store também.
export const initialFilterState: FilterState = {
  query: '',
};

// 3) createSlice gera action creators + reducer a partir de "case reducers".
export const filterSlice = createSlice({
  // O `name` vira o prefixo dos action types: 'filter/queryChanged'.
  // É isso que aparece no Redux DevTools.
  name: 'filter',
  initialState: initialFilterState,
  reducers: {
    // Convenção de nomes: actions descrevem EVENTOS no passado ("queryChanged"),
    // não comandos ("setQuery"). Ver https://redux.js.org/style-guide/#model-actions-as-events-not-setters
    //
    // PayloadAction<string> tipa `action.payload`. Sem ele, o payload seria `any`.
    queryChanged(state, action: PayloadAction<string>) {
      // "Mutação" segura: o RTK usa Immer por baixo, que transforma esta escrita
      // em uma cópia imutável. Só funciona DENTRO de createSlice/createReducer.
      state.query = action.payload;
    },

    // Action sem payload: o RTK gera `queryCleared()` sem argumentos.
    // Usada pelo botão "×", pelo Esc no campo e pelo "Limpar busca" (RF05/RF08).
    queryCleared(state) {
      state.query = '';
    },
  },

  // 4) Seletores "de slice" (RTK 2): recebem SÓ o estado deste slice.
  //    Use para leituras diretas. Derivações (lista filtrada, contadores,
  //    selectIsFiltering…) ficam em seletores memoizados com createSelector —
  //    essa é a sua Etapa 2.
  selectors: {
    selectQuery: (state) => state.query,
  },
});

// 5) Exports nomeados: actions, seletores e reducer.
//    O reducer é o default de fato do slice, mas export nomeado deixa
//    explícito no import da store o que está sendo plugado.
export const { queryChanged, queryCleared } = filterSlice.actions;
export const { selectQuery } = filterSlice.selectors;
export const filterReducer = filterSlice.reducer;
