import styles from './Counter.module.css';

/** Badge de contagem: "5", "2 de 5". */
export function Counter({ children }: { children: React.ReactNode }) {
  return <span className={styles.counter}>{children}</span>;
}
