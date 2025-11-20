import { forwardRef, ButtonHTMLAttributes } from 'react';
import styles from './index.module.scss';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary';
  size?: 'small' | 'medium' | 'large';
  fullWidth?: boolean;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      children,
      variant = 'primary',
      size = 'medium',
      fullWidth = false,
      loading = false,
      className,
      disabled,
      ...props
    },
    ref
  ) => {
    const buttonClasses = [
      styles.button,
      styles[variant],
      styles[size],
      fullWidth && styles.fullWidth,
      loading && styles.loading,
      disabled && styles.disabled,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    return (
      <button ref={ref} className={buttonClasses} disabled={disabled || loading} {...props}>
        {loading && (
          <div className={styles.spinnerWrapper}>
            <span className={styles.spinner} />
          </div>
        )}
        <span className={styles.content}>{children}</span>
      </button>
    );
  }
);

Button.displayName = 'Button';

export default Button;
