import { ReactNode } from 'react';
import styles from './index.module.scss';

interface LoadingSpinnerProps {
  message?: ReactNode;
}

export default function LoadingSpinner({ message = 'Loading...' }: LoadingSpinnerProps) {
  return (
    <div className={styles.loadingContainer}>
      <div className={styles.spinnerContainer}>
        <div className={styles.orbit}></div>
        <div className={styles.orbit}></div>
        <div className={styles.orbit}></div>
        <div className={`${styles.particle} ${styles.particle1}`}></div>
        <div className={`${styles.particle} ${styles.particle2}`}></div>
        <div className={`${styles.particle} ${styles.particle3}`}></div>
        <div className={`${styles.particle} ${styles.particle4}`}></div>
        <div className={styles.core}></div>
      </div>
      <div className={styles.statusText}>{message}</div>
    </div>
  );
}
