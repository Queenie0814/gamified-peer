import { forwardRef, SelectHTMLAttributes, useState } from 'react';
import styles from './index.module.scss';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  fullWidth?: boolean;
  variant?: 'outlined' | 'filled';
  /** Label 樣式：'floating' 為浮動標籤，'top' 為傳統上方標籤 */
  labelStyle?: 'floating' | 'top';
  /** 選項列表 */
  options: SelectOption[];
  /** Placeholder 選項文字 */
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
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
      options,
      placeholder = '請選擇',
      onChange,
      onFocus,
      onBlur,
      ...props
    },
    ref
  ) => {
    const [isFocused, setIsFocused] = useState(false);
    const [selectRef, setSelectRef] = useState<HTMLSelectElement | null>(null);

    // 判斷 label 是否應該浮動（聚焦或有值時）
    const hasValue = value !== undefined && value !== '';
    const isLabelFloating = isFocused || hasValue;

    const containerClasses = [
      styles.selectContainer,
      fullWidth && styles.fullWidth,
      labelStyle === 'floating' && styles.floatingLabel,
      isLabelFloating && styles.labelActive,
      className,
    ]
      .filter(Boolean)
      .join(' ');

    const selectClasses = [
      styles.select,
      styles[variant],
      error && styles.error,
      disabled && styles.disabled,
      label && labelStyle === 'floating' && styles.withFloatingLabel,
    ]
      .filter(Boolean)
      .join(' ');

    const handleFocus = (e: React.FocusEvent<HTMLSelectElement>) => {
      setIsFocused(true);
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLSelectElement>) => {
      setIsFocused(false);
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
      // 執行用戶的 onChange
      onChange?.(e);

      // 選擇後自動失去焦點，改善用戶體驗
      // 使用 setTimeout 確保 onChange 完成後再 blur
      setTimeout(() => {
        if (selectRef) {
          selectRef.blur();
        }
      }, 0);
    };

    // 合併 ref
    const handleRef = (element: HTMLSelectElement | null) => {
      setSelectRef(element);
      if (typeof ref === 'function') {
        ref(element);
      } else if (ref) {
        ref.current = element;
      }
    };

    return (
      <div className={containerClasses}>
        <div className={styles.selectWrapper}>
          {label && <label className={styles.label}>{label}</label>}
          <select
            ref={handleRef}
            className={selectClasses}
            disabled={disabled}
            value={value}
            onFocus={handleFocus}
            onBlur={handleBlur}
            onChange={handleChange}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${props.id}-error` : helperText ? `${props.id}-helper` : undefined}
            {...props}
          >
            {/*
              在浮動標籤模式下，placeholder 使用空字串避免與 label 重疊
              在傳統標籤模式下，顯示正常的 placeholder 文字
            */}
            {placeholder && (
              <option value="" disabled>
                {labelStyle === 'floating' ? '' : placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          {/* 自定義下拉箭頭 */}
          <div className={styles.arrow}>▼</div>
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

Select.displayName = 'Select';

export default Select;
