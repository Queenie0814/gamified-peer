import { useState } from 'react';
import styles from './index.module.scss';

export interface RatingInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  error?: string;
  description?: string;
}

export default function RatingInput({ label, value, onChange, error, description }: RatingInputProps) {
  const [hoveredValue, setHoveredValue] = useState<number | null>(null);

  const ratings = [
    { value: 1, label: '1分' },
    { value: 2, label: '2分' },
    { value: 3, label: '3分' },
    { value: 4, label: '4分' },
    { value: 5, label: '5分' },
  ];

  return (
    <div className={styles.ratingContainer}>
      <div className={styles.header}>
        <label className={styles.label}>{label}</label>
        {description && <span className={styles.description}>{description}</span>}
      </div>

      <div className={styles.ratingButtons}>
        {ratings.map((rating) => (
          <button
            key={rating.value}
            type="button"
            className={`${styles.ratingButton} ${value === rating.value ? styles.active : ''} ${
              hoveredValue !== null && hoveredValue >= rating.value ? styles.hovered : ''
            }`}
            onClick={() => onChange(rating.value)}
            onMouseEnter={() => setHoveredValue(rating.value)}
            onMouseLeave={() => setHoveredValue(null)}
          >
            <span className={styles.ratingValue}>{rating.value}</span>
            {/* <span className={styles.ratingLabel}>{rating.label}</span> */}
          </button>
        ))}
      </div>

      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}
