import { useAppSelector } from '@/store/hooks';
import { cx } from '@/utils/cx';
import { selectColumnCounts } from './selectors';
import { STAGES } from './stages';
import styles from './StageSelector.module.css';

interface StageSelectorProps {
  active: number;
  onSelect: (index: number) => void;
}

/** Mobile: a linha do pipeline vira o seletor 01 · 02 · 03. */
export function StageSelector({ active, onSelect }: StageSelectorProps) {
  const counts = useAppSelector(selectColumnCounts);

  return (
    <nav aria-label="Etapas do quadro" className={styles.nav}>
      {STAGES.map((s, i) => {
        const isActive = i === active;
        return (
          <button
            key={s.id}
            type="button"
            className={cx(styles.item, isActive && styles.active)}
            aria-label={`Ir para ${s.num} ${s.name}, ${counts[s.id].total} cards`}
            aria-current={isActive ? 'step' : undefined}
            onClick={() => onSelect(i)}
            style={{ '--stage': `var(--color-stage-${s.id})` } as React.CSSProperties}
          >
            <span className={styles.track} aria-hidden="true">
              <span className={cx(styles.line, i === 0 && styles.hidden)} />
              <span className={styles.ring} />
              <span className={cx(styles.line, i === STAGES.length - 1 && styles.hidden)} />
            </span>
            <span className={styles.label}>
              <span className={styles.num}>{s.num}</span> {s.name}
            </span>
          </button>
        );
      })}
    </nav>
  );
}
