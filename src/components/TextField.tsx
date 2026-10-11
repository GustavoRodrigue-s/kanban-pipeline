import type { ChangeEvent, KeyboardEvent, ReactNode, Ref } from 'react';
import { cx } from '@/utils/cx';
import { AlertIcon } from './Icons';
import styles from './TextField.module.css';

export interface TextFieldProps {
  id: string;
  label: ReactNode;
  value: string;
  onValueChange: (value: string) => void;
  /** Limite exibido no contador ("0/120"). Não bloqueia a digitação: a validação avisa. */
  limit: number;
  error?: string;
  required?: boolean;
  onKeyDown?: (event: KeyboardEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  multiline?: boolean;
  ref?: Ref<HTMLInputElement | HTMLTextAreaElement>;
}

/** TextField e TextArea do design: rótulo visível, erro com ícone + texto + borda de 2 px. */
export function TextField({
  id,
  label,
  value,
  onValueChange,
  limit,
  error,
  required,
  onKeyDown,
  multiline = false,
  ref,
}: TextFieldProps) {
  const errorId = `${id}-erro`;
  const common = {
    id,
    value,
    required,
    onKeyDown,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': error ? errorId : undefined,
    className: cx(styles.control, multiline && styles.textarea),
    onChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      onValueChange(e.target.value),
  };

  return (
    <div className={styles.field}>
      <label htmlFor={id} className={styles.label}>
        {label}
      </label>
      {multiline ? (
        <textarea {...common} ref={ref as Ref<HTMLTextAreaElement>} rows={4} />
      ) : (
        <input {...common} ref={ref as Ref<HTMLInputElement>} type="text" autoComplete="off" />
      )}
      <div className={styles.meta}>
        {error && (
          <p id={errorId} className={styles.error}>
            <AlertIcon size={16} />
            {error}
          </p>
        )}
        <span className={styles.counter}>
          {value.length}/{limit}
        </span>
      </div>
    </div>
  );
}
