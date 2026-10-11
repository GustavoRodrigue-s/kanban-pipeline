/**
 * Store da aplicação.
 * Reducers e middlewares são plugados aqui; os componentes nunca importam
 * a store diretamente — usam os hooks tipados de ./hooks.
 */
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { filterReducer } from '@/features/filter/filterSlice';

// combineReducers separado do configureStore para que o RootState possa ser
// inferido do reducer (e não da store). Isso permite criar stores de teste
// com `preloadedState` tipado — ver setupStore abaixo.
const rootReducer = combineReducers({
  filter: filterReducer,
  // board: boardReducer,  ← Etapa 1 (você)
});

export type RootState = ReturnType<typeof rootReducer>;

// Fábrica em vez de singleton: cada teste pode montar sua própria store
// com um estado inicial diferente, sem vazamento entre testes.
export function setupStore(preloadedState?: Partial<RootState>) {
  return configureStore({
    reducer: rootReducer,
    preloadedState,
    // middleware: (getDefault) => getDefault().prepend(listenerMiddleware.middleware)  ← Etapa 2 (você)
    // devTools fica ligado por padrão em dev (DoD: "Redux DevTools funcionando").
  });
}

export type AppStore = ReturnType<typeof setupStore>;
export type AppDispatch = AppStore['dispatch'];
