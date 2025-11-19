import { ReactNode } from 'react';
import styles from './index.module.scss';

export interface PageLayoutProps {
  children: ReactNode;
  /** 是否顯示背景圖案 */
  showPattern?: boolean;
  /** Main 區域的對齊方式 */
  alignItems?: 'flex-start' | 'center' | 'flex-end';
  /** Main 區域的內邊距 */
  padding?: string;
  /** 自定義 className */
  className?: string;
  /** Main 區域自定義 className */
  mainClassName?: string;
}

export default function PageLayout({
  children,
  showPattern = true,
  alignItems = 'center',
  padding,
  className,
  mainClassName,
}: PageLayoutProps) {
  const mainStyle: React.CSSProperties = {
    ...(alignItems && { alignItems }),
    ...(padding && { padding }),
  };

  return (
    <div className={`${styles.page} ${className || ''}`}>
      <main
        className={`${styles.main} ${!showPattern ? styles.noPattern : ''} ${mainClassName || ''}`}
        style={mainStyle}
      >
        {/* 第三個 blob 形狀 */}
        <div className={styles.blob3}></div>

        {/* 背景圖案覆蓋層 */}
        {showPattern && <div className={styles.patternOverlay}></div>}

        {children}
      </main>
    </div>
  );
}
