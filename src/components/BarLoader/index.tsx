import styles from './index.module.scss';

export default function BarLoader() {
  return (
    <div className={styles.preloader}>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}
