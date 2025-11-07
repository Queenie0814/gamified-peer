'use client';

import { useState, useEffect, Suspense } from 'react';
import classNames from 'classnames';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import dayjs from 'dayjs';

import BarLoader from '@/components/BarLoader';

import styles from './page.module.scss';

interface Group {
  group: string;
  total_score: number;
}

interface IPersonalList {
  student_id: string;
  student_name: string;
  score: number;
}

interface Personal {
  student_id: string;
  student_name: string;
  records: {
    student_id: string;
    student_name: string;
    group: string;
    completeness: number;
    accuracy: number;
    richness: number;
    referability: number;
    concept_map_total_score: number;
    advantage: string;
    suggest: string;
    skill_reflection: string;
    cognitive_reflection: string;
    recommend: number;
    personal_score: number;
    submit_time: string;
  }[];
}

interface LeaderboardData {
  groupList: Group[];
  personalList: IPersonalList[];
  personalInfo?: Personal;
}

function LeaderboardContent() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [groups, setGroups] = useState<Group[]>([]);
  const [students, setStudents] = useState<IPersonalList[]>([]);
  const [personalInfo, setPersonalInfo] = useState<Personal>({ student_name: '', student_id: '', records: [] });
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<string>('');
  const searchParams = useSearchParams();
  const studentId = searchParams.get('student_id');
  const currentDate = searchParams.get('date');

  useEffect(() => {
    fetchLeaderboard();

    // 每 5 分鐘重新提取資料
    const interval = setInterval(() => {
      fetchLeaderboard();
    }, 5 * 60 * 1000); // 5 分鐘 = 300000 毫秒

    // 清除 interval，避免 memory leak
    return () => clearInterval(interval);
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

      // 更新最後取得資料的時間
      setLastUpdate(dayjs().format('YYYY-MM-DD HH:mm:ss'));
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
                    <div className={styles.score}>
                      {personalInfo.records.reduce((sum, record) => sum + record.personal_score, 0) +
                        (personalInfo.records.length >= 6 ? 30 : 0)}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div>暫無資料</div>
            )}
          </div>
        )}
        {lastUpdate && <div className={styles.lastUpdate}>最後更新時間：{lastUpdate}</div>}
      </main>

      {isDialogOpen &&
        (() => {
          // 計算回饋品質平均字數（advantage + suggest）
          const feedbackAvgLength =
            personalInfo.records.length > 0
              ? personalInfo.records.reduce((sum, record) => {
                  const advantageLength = record.advantage?.length || 0;
                  const suggestLength = record.suggest?.length || 0;
                  return sum + advantageLength + suggestLength;
                }, 0) /
                (personalInfo.records.length * 2)
              : 0;

          // 計算反思類平均字數（skill_reflection + cognitive_reflection）
          const reflectionAvgLength =
            personalInfo.records.length > 0
              ? personalInfo.records.reduce((sum, record) => {
                  const skillLength = record.skill_reflection?.length || 0;
                  const cognitiveLength = record.cognitive_reflection?.length || 0;
                  return sum + skillLength + cognitiveLength;
                }, 0) /
                (personalInfo.records.length * 2)
              : 0;

          return (
            <div className={styles.dialogOverlay} onClick={() => setIsDialogOpen(false)}>
              <div className={styles.dialog} onClick={(e) => e.stopPropagation()}>
                <h2>Achievement</h2>
                <div className={styles.achievementContent}>
                  <div>
                    <Image src="/ach_1.png" alt="任務啟動者" width={64} height={64} />
                    <p>任務啟動者</p>
                    <span>完成首次評分任務</span>
                  </div>
                  {personalInfo.records.length >= 6 && (
                    <div>
                      <Image src="/ach_2.png" alt="全勤評審員" width={64} height={64} />
                      <p>全勤評審員</p>
                      <span>完成全部互評</span>
                    </div>
                  )}
                  {feedbackAvgLength > 40 && (
                    <div>
                      <Image src="/acg_3.png" alt="回饋大師" width={64} height={64} />
                      <p>回饋大師</p>
                      <span>回饋平均字數 40 字</span>
                    </div>
                  )}
                  {feedbackAvgLength > 30 && feedbackAvgLength <= 40 && (
                    <div>
                      <Image src="/ach_3.png" alt="回饋高手" width={64} height={64} style={{ opacity: 0.8 }} />
                      <p>回饋高手</p>
                      <span>回饋平均字數 30 字</span>
                    </div>
                  )}
                  {reflectionAvgLength > 40 && (
                    <div>
                      <Image src="/ach_4.png" alt="反思導師" width={64} height={64} />
                      <p>反思導師</p>
                      <span>回饋平均字數 40 字</span>
                    </div>
                  )}
                  {reflectionAvgLength > 30 && reflectionAvgLength <= 40 && (
                    <div>
                      <Image src="/ach_4.png" alt="深度思考者" width={64} height={64} style={{ opacity: 0.8 }} />
                      <p>深度思考者</p>
                      <span>回饋平均字數 30 字</span>
                    </div>
                  )}
                </div>
                <button onClick={() => setIsDialogOpen(false)}>確認</button>
              </div>
            </div>
          );
        })()}
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
