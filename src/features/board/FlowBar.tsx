import { useAppSelector } from '@/store/hooks';
import { selectColumnCounts } from './selectors';
import { STAGES } from './stages';
import styles from './FlowBar.module.css';

/** Barra de fluxo do cabeçalho: "6 de 14 concluídos" + segmentos proporcionais. */
export function FlowBar({ showLegend }: { showLegend: boolean }) {
  const counts = useAppSelector(selectColumnCounts);
  const total = counts.todo.total + counts.doing.total + counts.done.total;
  const label = total
    ? STAGES.map((s) => `${counts[s.id].total} ${s.legend}`).join(', ')
    : 'Nenhum card no quadro';

  return (
    <div className={styles.row} role="img" aria-label={label}>
      <span className={styles.summary}>
        {total ? (
          <>
            <span className={styles.n}>{counts.done.total}</span> de{' '}
            <span className={styles.n}>{total}</span> concluídos
          </>
        ) : (
          'Nenhum card ainda'
        )}
      </span>
      <div className={styles.track}>
        {STAGES.map((s) => (
          <div
            key={s.id}
            className={styles.segment}
            style={{
              flexGrow: counts[s.id].total,
              background: `var(--color-stage-${s.id})`,
              display: counts[s.id].total ? undefined : 'none',
            }}
          />
        ))}
      </div>
      {showLegend && (
        <div className={styles.legend}>
          {STAGES.map((s) => (
            <span key={s.id} className={styles.legendItem}>
              <span className={styles.dot} style={{ background: `var(--color-stage-${s.id})` }} />
              <span>
                <span className={styles.legendN}>{counts[s.id].total}</span> {s.legend}
              </span>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
