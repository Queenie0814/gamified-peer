import { forwardRef, InputHTMLAttributes, useState } from 'react';
import styles from './index.module.scss';

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled';
  /** Label 樣式：'floating' 為浮動標籤，'top' 為傳統上方標籤 */
  labelStyle?: 'floating' | 'top';
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      fullWidth = false,
      variant = 'outlined',
      labelStyle = 'floating',
      className,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);

    // 判斷 label 是否應該浮動（聚焦或有值時）
    const hasValue = value !== undefined && value !== '';
    const isLabelFloating = isFocused || hasValue;

    const containerClasses = [
      styles.inputContainer,
      fullWidth && styles.fullWidth,
      labelStyle === 'floating' && styles.floatingLabel,
      isLabelFloating && styles.labelActive,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const inputClasses = [
      styles.input,
      styles[variant],
      error && styles.error,
      disabled && styles.disabled,
      label && labelStyle === 'floating' && styles.withFloatingLabel,
    ]
      .filter(Boolean)
      .join(' ');

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    return (
      <div className={containerClasses}>
        <div className={styles.inputWrapper}>
          {label && <label className={styles.label}>{label}</label>}
          <input
            ref={ref}
            className={inputClasses}
            disabled={disabled}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
            {...props}
          />
        </div>
        {error && (
          <span id={`${props.id}-error`} className={styles.errorText}>
            {error}
          </span>
        )}
        {!error && helperText && (
          <span id={`${props.id}-helper`} className={styles.helperText}>
            {helperText}
          </span>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';

export default Input;
