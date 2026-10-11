import { useEffect, useId, useState, type KeyboardEvent, type Ref } from 'react';
import { CloseIcon, SearchIcon } from '@/components/Icons';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { cx } from '@/utils/cx';
import { queryChanged, queryCleared, selectQuery } from './filterSlice';
import styles from './SearchField.module.css';

export const SEARCH_DEBOUNCE_MS = 300;

interface SearchFieldProps {
  ref?: Ref<HTMLInputElement>;
  /** Esc com o campo já vazio (no mobile, recolhe a busca). */
  onEscapeEmpty?: () => void;
  className?: string;
}

/**
 * Campo de busca (RF05). O valor digitado vive aqui; o Redux recebe o termo
 * só depois de 300 ms sem digitação.
 */
export function SearchField({ ref, onEscapeEmpty, className }: SearchFieldProps) {
  const dispatch = useAppDispatch();
  const query = useAppSelector(selectQuery);
  const [value, setValue] = useState(query);
  const inputId = useId();

  // Se a busca for limpa por fora (ex.: "Limpar busca"), espelha no campo.
  const [prevQuery, setPrevQuery] = useState(query);
  if (query !== prevQuery) {
    setPrevQuery(query);
    if (query === '') setValue('');
  }

  const debounced = useDebouncedValue(value, SEARCH_DEBOUNCE_MS);
  useEffect(() => {
    dispatch(queryChanged(debounced));
  }, [debounced, dispatch]);

  const clear = () => {
    setValue('');
    dispatch(queryCleared());
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key !== 'Escape') return;
    event.preventDefault();
    if (value) clear();
    else onEscapeEmpty?.();
  };

  return (
    <div role="search" className={cx(styles.field, className)}>
      <SearchIcon className={styles.icon} />
      <label htmlFor={inputId} className="visually-hidden">
        Buscar cards
      </label>
      <input
        ref={ref}
        id={inputId}
        type="search"
        className={styles.input}
        placeholder="Buscar cards…"
        autoComplete="off"
        spellCheck={false}
        aria-keyshortcuts="/"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
      />
      {value ? (
        <button
          type="button"
          className={styles.clear}
          aria-label="Limpar busca"
          onClick={() => {
            clear();
            (document.getElementById(inputId) as HTMLInputElement | null)?.focus();
          }}
        >
          <CloseIcon size={14} />
        </button>
      ) : (
        <kbd className={styles.kbd} aria-hidden="true">
          /
        </kbd>
      )}
    </div>
  );
}
