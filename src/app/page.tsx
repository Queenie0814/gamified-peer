'use client';

import classNames from 'classnames';
import styles from './page.module.scss';
import Image from 'next/image';
import { useState } from 'react';

export default function Home() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>Group Ranking</h1>
        <div className={styles.group}>
          <div className={styles.item}>
            <div className={styles.avatar}>
              <div>2</div>
            </div>
            <span>第一組</span>
          </div>
          <div className={classNames(styles.item, styles.first)}>
            <div className={styles.avatar}>
              <div>1</div>
            </div>
            <span>第一組</span>
          </div>
          <div className={styles.item}>
            <div className={styles.avatar}>
              <div>3</div>
            </div>
            <span>第三組</span>
          </div>
        </div>
        <div className={styles.box}>
          <div>
            <Image
              className={styles.image}
              src="/box.png"
              alt="medal"
              width={152}
              height={152}
              onClick={() => setIsDialogOpen(true)}
            />
          </div>
        </div>
        <h1 className={styles.title}>Individual Ranking</h1>
        <div className={styles.personal}>
          {[
            { name: 'Sam', score: 95 },
            { name: 'Alex', score: 90 },
            { name: 'Jordan', score: 85 },
          ].map((person, index) => (
            <div key={person.name} className={classNames(styles.item, index === 0 && styles.first)}>
              <div className={styles.info}>
                <div className={styles.rank}>{index + 1}</div>
                <div className={styles.name}>{person.name}</div>
              </div>
              <div className={styles.score}>
                {person.score}
              </div>
            </div>
          ))}
        </div>
      </main>

      {isDialogOpen && (
        <div className={styles.dialogOverlay} onClick={() => setIsDialogOpen(false)}>
          <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
            <h2>Congratulations!</h2>
            <p>You opened the treasure box!</p>
            <button onClick={() => setIsDialogOpen(false)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
