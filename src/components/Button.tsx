import type { ButtonHTMLAttributes, ReactNode, Ref } from 'react';
import { cx } from '@/utils/cx';
import styles from './Button.module.css';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'danger-ghost';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  icon?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

const VARIANT_CLASS: Record<ButtonVariant, string | undefined> = {
  primary: styles.primary,
  secondary: styles.secondary,
  ghost: styles.ghost,
  danger: styles.danger,
  'danger-ghost': styles.dangerGhost,
};

export function Button({
  variant = 'secondary',
  icon,
  className,
  children,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={cx(
        styles.button,
        VARIANT_CLASS[variant],
        icon != null && styles.withIcon,
        className,
      )}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** Rótulo acessível obrigatório (botão só com ícone). */
  label: string;
  /** Tamanho visual (padrão 36, ou o definido via className); a área de toque é sempre ≥ 44 × 44 px. */
  size?: 24 | 28 | 32 | 36 | 44;
  bordered?: boolean;
  ref?: Ref<HTMLButtonElement>;
}

export function IconButton({
  label,
  size,
  bordered = false,
  className,
  children,
  type = 'button',
  ...rest
}: IconButtonProps) {
  return (
    <button
      type={type}
      aria-label={label}
      className={cx(styles.iconButton, bordered && styles.bordered, className)}
      style={size ? { width: size, height: size } : undefined}
      {...rest}
    >
      {children}
    </button>
  );
}
