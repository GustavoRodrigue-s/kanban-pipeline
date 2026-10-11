import styles from './App.module.css';

// Placeholder da Etapa 0 ("Hello" para validar o deploy).
// A UI completa do design entra na Etapa 3.
export function App() {
  return (
    <main className={styles.root}>
      <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true">
        <rect
          x="0.75"
          y="0.75"
          width="18.5"
          height="18.5"
          rx="4.25"
          fill="none"
          stroke="var(--color-text)"
          strokeWidth="1.5"
        />
        <rect x="4" y="4.5" width="2.5" height="9" rx="1" fill="var(--color-stage-todo)" />
        <rect x="8.75" y="4.5" width="2.5" height="6" rx="1" fill="var(--color-stage-doing)" />
        <rect x="13.5" y="4.5" width="2.5" height="11" rx="1" fill="var(--color-stage-done)" />
      </svg>
      <h1 className={styles.title}>Kanban</h1>
    </main>
  );
}
