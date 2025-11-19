'use client';

import { useState } from 'react';
import styles from './index.module.scss';

export interface StarRatingProps {
  value: number;
  onChange: (value: number) => void;
  error?: string;
}

export default function StarRating({ value, onChange, error }: StarRatingProps) {
  const [hoveredStar, setHoveredStar] = useState(0);

  const stars = [1, 2, 3, 4, 5];

  return (
    <div className={styles.starRatingContainer}>
      <div className={styles.starsWrapper}>
        {stars.map((star) => (
          <button
            key={star}
            type="button"
            className={`${styles.star} ${star <= (hoveredStar || value) ? styles.active : ''}`}
            onClick={() => onChange(star)}
            onMouseEnter={() => setHoveredStar(star)}
            onMouseLeave={() => setHoveredStar(0)}
          >
            ⭐
          </button>
        ))}
      </div>
      {error && <p className={styles.errorText}>{error}</p>}
    </div>
  );
}
