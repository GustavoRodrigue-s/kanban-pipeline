import { Button } from '@/components/Button';
import { SearchOffIcon } from '@/components/Icons';
import styles from './NoResults.module.css';

/** T4 — busca sem resultados. O anúncio sai pela região viva da busca. */
export function NoResults({ term, onClear }: { term: string; onClear: () => void }) {
  return (
    <div className={styles.overlay}>
      <div className={styles.card}>
        <SearchOffIcon size={28} className={styles.icon} />
        <p className={styles.title}>Nenhum card encontrado para &apos;{term}&apos;</p>
        <p className={styles.text}>Confira a grafia ou busque por outra palavra.</p>
        <Button variant="secondary" onClick={onClear} className={styles.action}>
          Limpar busca
        </Button>
      </div>
    </div>
  );
}
