import { useEffect, useRef, useState } from 'react';
import { Button, IconButton } from '@/components/Button';
import { CloseIcon, LogoIcon, PlusIcon, SearchIcon } from '@/components/Icons';
import { useBoardUi } from '@/features/board/BoardUiContext';
import { FlowBar } from '@/features/board/FlowBar';
import { queryCleared, selectQuery } from '@/features/filter/filterSlice';
import { SearchField } from '@/features/filter/SearchField';
import { useHotkey } from '@/hooks/useHotkey';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import styles from './Header.module.css';

interface HeaderProps {
  isMobile: boolean;
  isDesktop: boolean;
}

export function Header({ isMobile, isDesktop }: HeaderProps) {
  const ui = useBoardUi();
  const dispatch = useAppDispatch();
  const query = useAppSelector(selectQuery);
  const searchRef = useRef<HTMLInputElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const mobileSearchVisible = isMobile && (searchOpen || query !== '');

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // "/" foca a busca de qualquer ponto (no mobile, abre a busca recolhida).
  useHotkey('/', () => {
    if (isMobile && !mobileSearchVisible) setSearchOpen(true);
    else searchRef.current?.focus();
  });

  const closeMobileSearch = () => {
    dispatch(queryCleared());
    setSearchOpen(false);
  };

  return (
    <header className={styles.header}>
      <div className={styles.row}>
        {mobileSearchVisible ? (
          <>
            <SearchField
              ref={searchRef}
              onEscapeEmpty={closeMobileSearch}
              className={styles.mobileSearch}
            />
            <IconButton label="Fechar busca" size={44} onClick={closeMobileSearch}>
              <CloseIcon size={20} />
            </IconButton>
          </>
        ) : (
          <>
            <h1 className={styles.brand}>
              <LogoIcon />
              <span>Kanban</span>
            </h1>
            <div className={styles.spacer} />
            {isMobile ? (
              <IconButton
                label="Buscar cards"
                size={44}
                className={styles.searchToggle}
                onClick={() => setSearchOpen(true)}
              >
                <SearchIcon size={20} />
              </IconButton>
            ) : (
              <>
                <SearchField ref={searchRef} className={styles.search} />
                <Button
                  variant="primary"
                  icon={<PlusIcon />}
                  onClick={ui.openCreate}
                  data-add-card=""
                >
                  Adicionar card
                </Button>
              </>
            )}
          </>
        )}
      </div>
      <FlowBar showLegend={isDesktop} />
    </header>
  );
}
