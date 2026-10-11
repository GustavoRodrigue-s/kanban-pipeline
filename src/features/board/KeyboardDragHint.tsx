import { stageLabel } from './stages';
import type { ColumnId } from './types';
import styles from './KeyboardDragHint.module.css';

interface KeyboardDragHintProps {
  column: ColumnId;
  index: number;
  total: number;
}

/** T5b — barra de ajuda enquanto um card está "pego" pelo teclado. */
export function KeyboardDragHint({ column, index, total }: KeyboardDragHintProps) {
  return (
    <div className={styles.bar} aria-hidden="true">
      <span className={styles.status}>
        Card pego · posição {index + 1} de {total} em {stageLabel(column)}
      </span>
      <span className={styles.divider} />
      <span className={styles.key}>
        <kbd>← →</kbd>etapa
      </span>
      <span className={styles.key}>
        <kbd>↑ ↓</kbd>ordem
      </span>
      <span className={styles.key}>
        <kbd>Espaço</kbd>soltar
      </span>
      <span className={styles.key}>
        <kbd>Esc</kbd>cancelar
      </span>
    </div>
  );
}
