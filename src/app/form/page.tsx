'use client';

import { useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import dayjs from 'dayjs';

import PageLayout from '@/components/PageLayout';
import RatingInput from '@/components/RatingInput';
import Button from '@/components/Button';
import StarRating from '@/components/StarRating';
import LoadingSpinner from '@/components/LoadingSpinner';

import styles from './page.module.scss';

function FormContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('');
  const [showConceptMap, setShowConceptMap] = useState(false);
  const [isZoomed, setIsZoomed] = useState(false);
  const [step, setStep] = useState(1); // 當前步驟

  // 從 URL 獲取參數
  const group = searchParams.get('group') || '';
  const name = searchParams.get('name') || '';
  const studentId = searchParams.get('student_id') || '';

  // 評分資料
  const [ratings, setRatings] = useState({
    completeness: 0,
    accuracy: 0,
    richness: 0,
    referability: 0,
  });

  // 文字回答
  const [advantage, setAdvantage] = useState('');
  const [improvement, setImprovement] = useState('');
  const [selfReflection, setSelfReflection] = useState('');
  const [rethinking, setRethinking] = useState('');
  const [recommendation, setRecommendation] = useState(0);

  // 字數計數器的前一個值（用於動畫）
  const [prevCountAdvantage, setPrevCountAdvantage] = useState(0);
  const [prevCountImprovement, setPrevCountImprovement] = useState(0);
  const [prevCountSelfReflection, setPrevCountSelfReflection] = useState(0);
  const [prevCountRethinking, setPrevCountRethinking] = useState(0);

  // 錯誤訊息
  const [errors, setErrors] = useState({
    completeness: '',
    accuracy: '',
    richness: '',
    referability: '',
    advantage: '',
    improvement: '',
    selfReflection: '',
    rethinking: '',
    recommendation: '',
  });

  // 評分維度定義
  const ratingDimensions = [
    {
      key: 'completeness' as const,
      label: '完整性 (Completeness)',
      description: '概念圖包含的概念是否完整',
    },
    {
      key: 'accuracy' as const,
      label: '準確性 (Accuracy)',
      description: '概念與連結是否正確無誤',
    },
    {
      key: 'richness' as const,
      label: '豐富度 (Richness)',
      description: '概念圖的層次與細節是否豐富',
    },
    {
      key: 'referability' as const,
      label: '參考價值 (Referability)',
      description: '對學習的參考價值有多高',
    },
  ];

  // 更新評分
  const handleRatingChange = (key: keyof typeof ratings, value: number) => {
    setRatings((prev) => ({ ...prev, [key]: value }));
    // 清除錯誤訊息
    if (errors[key]) {
      setErrors((prev) => ({ ...prev, [key]: '' }));
    }
  };

  // 清空錯誤訊息
  const clearErrors = () => ({
    completeness: '',
    accuracy: '',
    richness: '',
    referability: '',
    advantage: '',
    improvement: '',
    selfReflection: '',
    rethinking: '',
    recommendation: '',
  });

  // 驗證文字欄位
  const validateTextField = (value: string, fieldName: keyof typeof errors) => {
    const newErrors = clearErrors();
    let isValid = true;

    if (!value.trim()) {
      newErrors[fieldName] = '此欄位為必填';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // 驗證評分欄位
  const validateRatingField = (value: number, fieldName: keyof typeof errors) => {
    const newErrors = clearErrors();
    let isValid = true;

    if (value === 0) {
      newErrors[fieldName] = '請選擇分數';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  // 驗證第一步（評分）
  const validateStep1 = () => {
    let isValid = true;
    const newErrors = clearErrors();

    // 檢查每個維度是否都有評分
    ratingDimensions.forEach((dimension) => {
      if (ratings[dimension.key] === 0) {
        newErrors[dimension.key] = '請選擇分數';
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  // 處理下一步或提交
  const handleNext = (e: React.FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      if (validateStep1()) {
        setStep(2);
      }
    } else if (step === 2) {
      if (validateTextField(advantage, 'advantage')) {
        setStep(3);
      }
    } else if (step === 3) {
      if (validateTextField(improvement, 'improvement')) {
        setStep(4);
      }
    } else if (step === 4) {
      if (validateTextField(selfReflection, 'selfReflection')) {
        setStep(5);
      }
    } else if (step === 5) {
      if (validateTextField(rethinking, 'rethinking')) {
        setStep(6);
      }
    } else if (step === 6) {
      if (validateRatingField(recommendation, 'recommendation')) {
        handleSubmit();
      }
    }
  };

  // 積分計算函數
  const calculatePersonalScore = (): number => {
    let score = 10; // 基本分數：完成每組評分 +10分

    // 優質回饋積分計算 (advantage, improvement) - 平均計算
    const feedbackTexts = [advantage, improvement];
    const averageFeedbackLength = feedbackTexts.reduce((sum, text) => sum + text.length, 0) / feedbackTexts.length;

    if (averageFeedbackLength >= 40) {
      score += 25;
    } else if (averageFeedbackLength >= 30) {
      score += 20;
    } else if (averageFeedbackLength >= 20) {
      score += 15;
    }

    // 深度反思積分計算 (selfReflection, rethinking) - 平均計算
    const reflectionTexts = [selfReflection, rethinking];
    const averageReflectionLength =
      reflectionTexts.reduce((sum, text) => sum + text.length, 0) / reflectionTexts.length;

    if (averageReflectionLength >= 40) {
      score += 25;
    } else if (averageReflectionLength >= 30) {
      score += 20;
    } else if (averageReflectionLength >= 20) {
      score += 15;
    }

    return score;
  };

  // 提交表單
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setLoadingMessage('正在計算積分...');

    try {
      // 計算概念圖總分
      const conceptMapTotalScore = ratings.completeness + ratings.accuracy + ratings.richness + ratings.referability + recommendation;

      // 計算個人積分
      const personalScore = calculatePersonalScore();

      setLoadingMessage('正在準備資料...');

      // 準備提交資料
      const submitData = {
        student_id: studentId,
        student_name: name,
        group: group,
        completeness: ratings.completeness,
        accuracy: ratings.accuracy,
        richness: ratings.richness,
        referability: ratings.referability,
        concept_map_total_score: conceptMapTotalScore,
        advantage: advantage,
        suggest: improvement,
        skill_reflection: selfReflection,
        cognitive_reflection: rethinking,
        recommend: recommendation,
        personal_score: personalScore,
        submit_time: dayjs().format('YYYY-MM-DD HH:mm:ss'),
      };

      console.log('提交資料：', submitData);

      setLoadingMessage('正在儲存資料...');

      // 發送 API 請求
      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submitData),
      });

      const result = await response.json();

      if (result.success) {
        console.log(`✅ 資料儲存完成！個人積分: ${personalScore}分，概念圖總分: ${conceptMapTotalScore}分`);
        setLoadingMessage(`✅ 資料儲存完成！個人積分: ${personalScore}分，概念圖總分: ${conceptMapTotalScore}分`);

        // 延遲一下讓使用者看到成功訊息
        await new Promise((resolve) => setTimeout(resolve, 1000));

        setLoadingMessage('正在轉址到排行榜...');

        // 轉址到排行榜
        router.push(`/leaderboard?student_id=${studentId}&date=${dayjs().format('YYYY-MM-DD')}`);
      } else {
        console.error('❌ 儲存失敗：', result.error);
        alert('提交失敗：' + result.error);
        setIsSubmitting(false);
        setLoadingMessage('');
      }
    } catch (error) {
      console.error('提交失敗:', error);
      alert('提交失敗：' + (error as Error).message);
      setIsSubmitting(false);
      setLoadingMessage('');
    }
  };

  // 如果正在提交，顯示 Loading 畫面
  if (isSubmitting) {
    return (
      <LoadingSpinner
        message={
          <>
            {loadingMessage}
            <br />
            請勿離開此頁面
          </>
        }
      />
    );
  }

  return (
    <PageLayout showPattern={false}>
      {/* 評分表單 */}
      <div className={styles.formContainer}>
        <form className={styles.form} onSubmit={handleNext} noValidate>
          {/* 標題與資訊 */}
          <div className={styles.header}>
            <div className={styles.userInfo}>
              <span>{studentId}</span>
              <span>{name}</span>
              <span>{`正在評比 <第 ${group} 組>`}</span>
            </div>
          </div>

          {/* 主要內容區 - 左右佈局 */}
          <div className={styles.mainContent}>
            {/* 概念圖預覽 */}
            <div className={styles.conceptMap} onClick={() => setShowConceptMap(true)}>
              <div className={styles.conceptMapPreview}>
                <Image
                  src="/example.jpeg"
                  alt="概念圖"
                  width={600}
                  height={400}
                  style={{ objectFit: 'contain', cursor: 'pointer' }}
                />
              </div>
            </div>

            {/* 評分區域 */}
            <div className={styles.ratingArea}>
              {step === 1 && (
                <>
                  <h1>概念圖評分</h1>
                  {/* 評分說明 */}
                  <div className={styles.instructions}>
                    <h2>評分說明</h2>
                    <p>請根據以下四個維度仔細評分，每個維度給予 1-5 分。</p>
                  </div>
                  {/* 評分維度 */}
                  <div className={styles.ratingsSection}>
                    {ratingDimensions.map((dimension) => (
                      <RatingInput
                        key={dimension.key}
                        label={dimension.label}
                        description={dimension.description}
                        value={ratings[dimension.key]}
                        onChange={(value) => handleRatingChange(dimension.key, value)}
                        error={errors[dimension.key]}
                      />
                    ))}
                  </div>
                </>
              )}

              {step === 2 && (
                <>
                  {/* 文字問題 */}
                  <div className={styles.textQuestion}>
                    <h2>這份作品最大的優點是什麼？</h2>
                    <p>請詳細描述這份概念圖的優點與亮點（字數越多可獲得更多積分）</p>
                  </div>
                  <div className={styles.textareaContainer}>
                    <textarea
                      className={styles.textarea}
                      value={advantage}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setPrevCountAdvantage(advantage.length);
                        setAdvantage(newValue);
                        if (errors.advantage) {
                          setErrors((prev) => ({ ...prev, advantage: '' }));
                        }
                      }}
                      placeholder={`💡概念選擇是否恰當\n💡組織邏輯是否清晰\n💡視覺呈現是否美觀\n💡是否有創新的呈現方式`}
                      rows={8}
                    />
                    <div
                      className={`${styles.characterCount} ${
                        advantage.length > prevCountAdvantage ? styles.countUp : ''
                      } ${advantage.length >= 20 && advantage.length % 20 < 10 ? styles.milestone : ''}`}
                    >
                      <span>目前字數：</span>
                      <span className={styles.count} key={advantage.length}>
                        {advantage.length}
                      </span>
                      <span> 字</span>
                      {advantage.length >= 20 && advantage.length % 20 < 10 && (
                        <span className={styles.fire}>🔥</span>
                      )}
                    </div>
                    {errors.advantage && <p className={styles.errorText}>{errors.advantage}</p>}
                  </div>
                </>
              )}

              {step === 3 && (
                <>
                  {/* 改進建議 */}
                  <div className={styles.textQuestion}>
                    <h2>具體的改進建議</h2>
                    <p>請針對四個維度中較弱的部分，提供可行的改進建議</p>
                  </div>
                  <div className={styles.textareaContainer}>
                    <textarea
                      className={styles.textarea}
                      value={improvement}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setPrevCountImprovement(improvement.length);
                        setImprovement(newValue);
                        if (errors.improvement) {
                          setErrors((prev) => ({ ...prev, improvement: '' }));
                        }
                      }}
                      placeholder={`💡 好的建議範例：\n✅ "建議在『再生能源』和『環境保護』之間增加連結，說明再生能源如何減少環境污染"\n❌ "應該做得更好一點"(太模糊)`}
                      rows={8}
                    />
                    <div
                      className={`${styles.characterCount} ${
                        improvement.length > prevCountImprovement ? styles.countUp : ''
                      } ${improvement.length >= 20 && improvement.length % 20 < 10 ? styles.milestone : ''}`}
                    >
                      <span>目前字數：</span>
                      <span className={styles.count} key={improvement.length}>
                        {improvement.length}
                      </span>
                      <span> 字</span>
                      {improvement.length >= 20 && improvement.length % 20 < 10 && (
                        <span className={styles.fire}>🔥</span>
                      )}
                    </div>
                    {errors.improvement && <p className={styles.errorText}>{errors.improvement}</p>}
                  </div>
                </>
              )}

              {step === 4 && (
                <>
                  {/* 自我反思 */}
                  <div className={styles.textQuestion}>
                    <h2>評分這份作品的過程中，你發現自己的概念圖製作還可以如何改進？</h2>
                    <p>請具體說明這份作品帶給你的啟發</p>
                  </div>
                  <div className={styles.textareaContainer}>
                    <textarea
                      className={styles.textarea}
                      value={selfReflection}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setPrevCountSelfReflection(selfReflection.length);
                        setSelfReflection(newValue);
                        if (errors.selfReflection) {
                          setErrors((prev) => ({ ...prev, selfReflection: '' }));
                        }
                      }}
                      placeholder={`範例："我原本沒有想到『核能發電』和『碳排放』可以這樣連結，這份作品讓我了解核能雖然有風險，但在減碳方面有其優勢"`}
                      rows={8}
                    />
                    <div
                      className={`${styles.characterCount} ${
                        selfReflection.length > prevCountSelfReflection ? styles.countUp : ''
                      } ${selfReflection.length >= 20 && selfReflection.length % 20 < 10 ? styles.milestone : ''}`}
                    >
                      <span>目前字數：</span>
                      <span className={styles.count} key={selfReflection.length}>
                        {selfReflection.length}
                      </span>
                      <span> 字</span>
                      {selfReflection.length >= 20 && selfReflection.length % 20 < 10 && (
                        <span className={styles.fire}>🔥</span>
                      )}
                    </div>
                    {errors.selfReflection && <p className={styles.errorText}>{errors.selfReflection}</p>}
                  </div>
                </>
              )}

              {step === 5 && (
                <>
                  {/* 觀點改變 */}
                  <div className={styles.textQuestion}>
                    <h2>這份作品讓你重新思考哪些能源議題？你的觀點有什麼改變？</h2>
                  </div>
                  <div className={styles.textareaContainer}>
                    <textarea
                      className={styles.textarea}
                      value={rethinking}
                      onChange={(e) => {
                        const newValue = e.target.value;
                        setPrevCountRethinking(rethinking.length);
                        setRethinking(newValue);
                        if (errors.rethinking) {
                          setErrors((prev) => ({ ...prev, rethinking: '' }));
                        }
                      }}
                      placeholder={`我重新審視火力發電的複雜面向。原本只關注空汙問題，但透過概念圖的連結分析，發現火力發電還涉及能源安全、經濟成本、技術轉型等多重議題。`}
                      rows={8}
                    />
                    <div
                      className={`${styles.characterCount} ${
                        rethinking.length > prevCountRethinking ? styles.countUp : ''
                      } ${rethinking.length >= 20 && rethinking.length % 20 < 10 ? styles.milestone : ''}`}
                    >
                      <span>目前字數：</span>
                      <span className={styles.count} key={rethinking.length}>
                        {rethinking.length}
                      </span>
                      <span> 字</span>
                      {rethinking.length >= 20 && rethinking.length % 20 < 10 && (
                        <span className={styles.fire}>🔥</span>
                      )}
                    </div>
                    {errors.rethinking && <p className={styles.errorText}>{errors.rethinking}</p>}
                  </div>
                </>
              )}

              {step === 6 && (
                <>
                  {/* 推薦評分 */}
                  <div className={styles.textQuestion}>
                    <h2>你會推薦其他同學參考這份作品嗎？</h2>
                    <p>請給予 1-5 顆星的評分</p>
                  </div>
                  <StarRating
                    value={recommendation}
                    onChange={(value) => {
                      setRecommendation(value);
                      if (errors.recommendation) {
                        setErrors((prev) => ({ ...prev, recommendation: '' }));
                      }
                    }}
                    error={errors.recommendation}
                  />
                </>
              )}

              {/* 提交按鈕 */}
              <Button type="submit" className={styles.submitButton} loading={isSubmitting}>
                NEXT
              </Button>
            </div>
          </div>
        </form>
      </div>

      {/* 概念圖彈出視窗（小螢幕） */}
      {showConceptMap && (
        <div className={styles.modalOverlay} onClick={() => setShowConceptMap(false)}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setShowConceptMap(false)}>
              ✕
            </button>
            <h3>第 {group} 組概念圖</h3>
            <div className={styles.modalContent}>
              <div
                className={`${styles.imageContainer} ${isZoomed ? styles.zoomed : ''}`}
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <Image
                  src="/example.jpeg"
                  alt="概念圖"
                  width={800}
                  height={600}
                  style={{ objectFit: 'contain', width: '100%', height: 'auto' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}

export default function Form() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <FormContent />
    </Suspense>
  );
}
