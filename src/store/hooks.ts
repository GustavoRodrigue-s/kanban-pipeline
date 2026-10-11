import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './index';

// Hooks pré-tipados: evitam repetir `RootState`/`AppDispatch` em cada componente.
// https://redux-toolkit.js.org/tutorials/typescript#define-typed-hooks
export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();
