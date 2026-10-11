import { useRef, useState } from 'react';
import { Button } from '@/components/Button';
import { PlusIcon } from '@/components/Icons';
import { LiveAnnouncerProvider } from '@/components/LiveAnnouncer';
import { Board } from '@/features/board/Board';
import { BoardUiProvider, useBoardUi } from '@/features/board/BoardUiContext';
import { StageSelector } from '@/features/board/StageSelector';
import { useIsDesktop, useIsMobile } from '@/hooks/useMediaQuery';
import { Header } from './Header';
import styles from './App.module.css';

export function App() {
  return (
    <LiveAnnouncerProvider>
      <BoardUiProvider>
        <Layout />
      </BoardUiProvider>
    </LiveAnnouncerProvider>
  );
}

function Layout() {
  const ui = useBoardUi();
  const isMobile = useIsMobile();
  const isDesktop = useIsDesktop();
  const stripRef = useRef<HTMLDivElement>(null);
  const [activeColumn, setActiveColumn] = useState(0);

  const scrollToColumn = (index: number) => {
    const strip = stripRef.current;
    const cols = strip?.querySelectorAll<HTMLElement>('[data-column]');
    const first = cols?.[0];
    const target = cols?.[index];
    if (!strip || !first || !target) return;
    strip.scrollTo({ left: target.offsetLeft - first.offsetLeft });
    setActiveColumn(index);
  };

  return (
    <div id="app" className={styles.app}>
      <a href="#quadro" className={styles.skipLink}>
        Pular para o quadro
      </a>
      <Header isMobile={isMobile} isDesktop={isDesktop} />
      {isMobile && <StageSelector active={activeColumn} onSelect={scrollToColumn} />}
      <main id="quadro" tabIndex={-1} className={styles.main}>
        <Board stripRef={stripRef} onActiveColumnChange={setActiveColumn} />
      </main>
      {isMobile && (
        <div className={styles.mobileBar}>
          <Button
            variant="primary"
            icon={<PlusIcon size={18} />}
            onClick={ui.openCreate}
            className={styles.mobileAdd}
            data-add-card=""
          >
            Adicionar card
          </Button>
        </div>
      )}
    </div>
  );
}
