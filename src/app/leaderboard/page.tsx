'use client';

import { useState, useEffect, Suspense } from 'react';
import classNames from 'classnames';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';

import styles from './page.module.scss';
import BarLoader from '@/components/BarLoader';

interface Group {
  group: string;
  total_score: number;
}

interface Personal {
  student_id: string;
  student_name: string;
  score: number;
}

interface LeaderboardData {
  groupList: Group[];
  personalList: Personal[];
  personalInfo?: Personal;
}

function LeaderboardContent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<Personal[]>([]);
  const [personalInfo, setPersonalInfo] = useState<Personal | null>(null);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const studentId = searchParams.get('student_id');
  const currentDate = searchParams.get('date');

  useEffect(() => {
    fetchLeaderboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const response = await fetch(`/api/get-leaderboard?student_id=${studentId}&date=${currentDate}`);
      const data: LeaderboardData = await response.json();

      console.log('排行榜資料:', data);

      if (data.groupList) {
        setGroups(data.groupList);
      }
      if (data.personalList) {
        setStudents(data.personalList);
      }
      if (data.personalInfo) {
        setPersonalInfo(data.personalInfo);
      }
    } catch (error) {
      console.error('取得排行榜失敗:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>Group Ranking</h1>
        {loading ? (
          <div className={styles.group}>
            <BarLoader />
          </div>
        ) : (
          <div className={styles.group}>
            {groups.slice(0, 3).map((group, index) => {
              // 排序：第二名在左、第一名在中、第三名在右
              const displayOrder = [1, 0, 2];
              const displayIndex = displayOrder.indexOf(index);

              return (
                <div
                  key={group.group}
                  className={classNames(styles.item, {
                    [styles.first]: index === 0,
                  })}
                  style={{ order: displayIndex }}
                >
                  <div className={styles.avatar}>
                    <div>{index + 1}</div>
                  </div>
                  <span>{group.group}</span>
                </div>
              );
            })}
          </div>
        )}
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
        {loading ? (
          <div className={styles.personal}>
            <BarLoader />
          </div>
        ) : (
          <div className={styles.personal}>
            {students.length > 0 ? (
              <>
                {students.map((person, index) => (
                  <div
                    key={`${person.student_name}-${index}`}
                    className={classNames(styles.item, {
                      [styles.first]: index === 0,
                      [styles.highlight]: person.student_id === studentId,
                    })}
                  >
                    <div className={styles.info}>
                      <div className={styles.rank}>{index + 1}</div>
                      <div className={styles.name}>{person.student_name}</div>
                    </div>
                    <div className={styles.score}>{person.score}</div>
                  </div>
                ))}
                {/* 如果前五名沒有當前學生，額外顯示該學生資訊 */}
                {personalInfo && studentId && !students.some((s) => s.student_id === studentId) && (
                  <div className={classNames(styles.item, styles.highlight)}>
                    <div className={styles.info}>
                      <div className={styles.rank}>-</div>
                      <div className={styles.name}>{personalInfo.student_name}</div>
                    </div>
                    <div className={styles.score}>{personalInfo.score}</div>
                  </div>
                )}
              </>
            ) : (
              <div>暫無資料</div>
            )}
          </div>
        )}
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

export default function Leaderboard() {
  return (
    <Suspense
      fallback={
        <div className={styles.page}>
          <main className={styles.main}>
            <BarLoader />
          </main>
        </div>
      }
    >
      <LeaderboardContent />
    </Suspense>
  );
}
