import React, { useRef, useState } from 'react';
import styles from './index.module.scss';

export interface CreepyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary';
}

type Coords = {
  x: number;
  y: number;
};

export default function CreepyButton({
  onClick,
  children,
  variant = 'primary',
  className,
  ...props
}: CreepyButtonProps) {
  const eyesRef = useRef<HTMLSpanElement>(null);
  const [eyeCoords, setEyeCoords] = useState<Coords>({ x: 0, y: 0 });

  const translateX = `${-50 + eyeCoords.x * 50}%`;
  const translateY = `${-50 + eyeCoords.y * 50}%`;

  const eyeStyle: React.CSSProperties = {
    transform: `translate(${translateX}, ${translateY})`,
  };

  const updateEyes = (
    e: React.MouseEvent<HTMLButtonElement> | React.TouchEvent<HTMLButtonElement>
  ) => {
    const userEvent = 'touches' in e ? e.touches[0] : e;

    // 獲取眼睛容器中心和鼠標位置
    const eyesRect = eyesRef.current?.getBoundingClientRect() as DOMRect;
    const eyes: Coords = {
      x: eyesRect.left + eyesRect.width / 2,
      y: eyesRect.top + eyesRect.height / 2,
    };
    const cursor: Coords = {
      x: userEvent.clientX,
      y: userEvent.clientY,
    };

    // 計算眼睛角度
    const dx = cursor.x - eyes.x;
    const dy = cursor.y - eyes.y;
    const angle = Math.atan2(-dy, dx) + Math.PI / 2;

    // 計算瞳孔距離眼睛中心的距離
    const visionRangeX = 180;
    const visionRangeY = 75;
    const distance = Math.hypot(dx, dy);
    const x = Math.sin(angle) * distance / visionRangeX;
    const y = Math.cos(angle) * distance / visionRangeY;

    setEyeCoords({ x, y });
  };

  const buttonClasses = [styles.creepyBtn, styles[variant], className].filter(Boolean).join(' ');

  return (
    <button
      className={buttonClasses}
      type="button"
      onClick={onClick}
      onMouseMove={updateEyes}
      onTouchMove={updateEyes}
      {...props}
    >
      <span className={styles.creepyBtn__eyes} ref={eyesRef}>
        <span className={styles.creepyBtn__eye}>
          <span className={styles.creepyBtn__pupil} style={eyeStyle}></span>
        </span>
        <span className={styles.creepyBtn__eye}>
          <span className={styles.creepyBtn__pupil} style={eyeStyle}></span>
        </span>
      </span>
      <span className={styles.creepyBtn__cover}>{children}</span>
    </button>
  );
}
