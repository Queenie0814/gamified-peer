// src/app/page.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import CryptoJS from 'crypto-js';
import dayjs from 'dayjs';

import LoadingSpinner from '@/components/LoadingSpinner';

// SurveyCake 資料型別定義
interface SurveyResult {
  subject: string;
  type: string;
  sn: number;
  label: string;
  alias: string;
  answer: string[];
  otherAnswer: string[];
  answerLabel: string[];
  answerAlias: string[];
  extras?: Record<string, unknown> | null;
}

interface SurveyAlias {
  student_id: string[];
  student_name: string[];
  group: string[];
  score: string[];
  advantage: string[];
  suggest: string[];
  skill_reflection: string[];
  cognitive_reflection: string[];
  recommend: number[];
}

interface SurveyData {
  id: number;
  svid: string;
  title: string;
  status: string;
  submitTime: string;
  mbunq: string | null;
  serialNumber: string | null;
  landingToken: string | null;
  endStatus: string | null;
  meta: {
    isolated: {
      status: boolean;
      type: string | null;
    };
  };
  mbrid: string | null;
  alias: SurveyAlias;
  result: SurveyResult[];
  variables: unknown[];
}

const HomeContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [processed, setProcessed] = useState(false);

  // 監聽 status 變化並輸出到 console
  useEffect(() => {
    if (status) {
      console.log('狀態更新:', status);
    }
  }, [status]);

  useEffect(() => {
    const svid = searchParams.get('svid');
    const hash = searchParams.get('hash');

    if (svid && hash && !processed) {
      handleSurveySubmission(svid, hash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, processed]);

  // 輔助函數：從結果中取得分數
  const getScoreFromResults = (results: SurveyResult[], keyword: string, alias?: string): number => {
    if (alias) {
      const item = results.find((item) => item.alias === alias);
      return parseInt(item?.answer?.[0] || '0') || 0;
    }

    const item = results.find((item) => item.subject.includes(keyword) && item.type === 'NESTCHILD');
    return parseInt(item?.answer?.[0] || '0') || 0;
  };

  // 輔助函數：從結果中取得文字答案
  const getAnswerFromResults = (results: SurveyResult[], alias: string): string => {
    const item = results.find((item) => item.alias === alias);
    return item?.answer?.[0] || '';
  };

  // 積分計算函數
  const calculatePersonalScore = (surveyData: SurveyData): number => {
    let score = 10; // 基本分數：完成每組評分 +10分

    // 從 result 陣列中找到對應的答案
    const results = surveyData.result;

    // 尋找各個欄位的答案
    const advantage = results.find((item) => item.alias === 'advantage')?.answer?.[0] || '';
    const suggest = results.find((item) => item.alias === 'suggest')?.answer?.[0] || '';
    const skillReflection = results.find((item) => item.alias === 'skill_reflection')?.answer?.[0] || '';
    const cognitiveReflection = results.find((item) => item.alias === 'cognitive_reflection')?.answer?.[0] || '';

    // 優質回饋積分計算 (advantage, suggest) - 平均計算
    const feedbackTexts = [advantage, suggest];
    const averageFeedbackLength = feedbackTexts.reduce((sum, text) => sum + text.length, 0) / feedbackTexts.length;

    if (averageFeedbackLength >= 40) {
      score += 25;
    } else if (averageFeedbackLength >= 30) {
      score += 20;
    } else if (averageFeedbackLength >= 20) {
      score += 15;
    }

    // 深度反思積分計算 (skill_reflection, cognitive_reflection) - 平均計算
    const reflectionTexts = [skillReflection, cognitiveReflection];
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

  // 概念圖總分計算函數
  const calculateTotalScore = (surveyData: SurveyData): number => {
    const results = surveyData.result;

    let completeness = 0;
    let accuracy = 0;
    let richness = 0;
    let referability = 0;
    let recommend = 0;

    results.forEach((item) => {
      if (item.type === 'NESTCHILD') {
        const answer = parseInt(item.answer?.[0]) || 0;

        // 根據 subject 內容判斷是哪個維度
        if (item.subject.includes('完整性') || item.subject.includes('Completeness')) {
          completeness = answer;
        } else if (item.subject.includes('準確性') || item.subject.includes('Accuracy')) {
          accuracy = answer;
        } else if (item.subject.includes('豐富度') || item.subject.includes('Richness')) {
          richness = answer;
        } else if (item.subject.includes('參考價值') || item.subject.includes('Referability')) {
          referability = answer;
        }
      } else if (item.alias === 'recommend') {
        recommend = parseInt(item.answer?.[0]) || 0;
      }
    });

    const total = completeness + accuracy + richness + referability + recommend;

    return total;
  };

  const handleSurveySubmission = async (svid: string, hash: string) => {
    if (processed) return;

    setProcessed(true);

    try {
      setStatus('正在取得問卷資料...');

      // 1. 從 SurveyCake 取得加密資料
      const webhookUrl = `https://www.surveycake.com/webhook/v0/${svid}/${hash}`;
      const response = await fetch(webhookUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const encryptedData = await response.text();
      setStatus('正在解密資料...');

      // 2. 在前端解密資料
      const decryptedData = decryptSurveyData(encryptedData);
      const surveyData = JSON.parse(decryptedData) as SurveyData;
      setStatus('正在計算積分...');

      // 3. 計算積分
      const personalScore = calculatePersonalScore(surveyData);
      const totalScore = calculateTotalScore(surveyData);

      // 4. 在 surveyData 中添加新欄位
      const enhancedSurveyData = {
        ...surveyData,
        submit_time: dayjs(surveyData.submitTime).format('YYYY-MM-DD HH:mm:ss'),
        personalScore,
        totalScore,
      };

      setStatus('正在儲存資料...');

      // 5. 透過 API Route 儲存到資料庫
      const saveResponse = await fetch('/api/survey', {
        // 改為你的新 API
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          student_id: surveyData.alias.student_id?.[0] || '',
          student_name: surveyData.alias.student_name?.[0] || '',
          group: surveyData.alias.group?.[0] || '',
          completeness: getScoreFromResults(surveyData.result, '完整性'),
          accuracy: getScoreFromResults(surveyData.result, '準確性'),
          richness: getScoreFromResults(surveyData.result, '豐富度'),
          referability: getScoreFromResults(surveyData.result, '參考價值'),
          concept_map_total_score: totalScore,
          advantage: getAnswerFromResults(surveyData.result, 'advantage'),
          suggest: getAnswerFromResults(surveyData.result, 'suggest'),
          skill_reflection: getAnswerFromResults(surveyData.result, 'skill_reflection'),
          cognitive_reflection: getAnswerFromResults(surveyData.result, 'cognitive_reflection'),
          recommend: getScoreFromResults(surveyData.result, 'recommend', 'recommend'),
          personal_score: personalScore,
          submit_time: enhancedSurveyData.submit_time,
        }),
      });

      const result = await saveResponse.json();

      if (result.success) {
        setStatus(`✅ 資料儲存完成！個人積分: ${personalScore}分，概念圖總分: ${totalScore}分`);
        setStatus('正在轉址到排行榜...');
        router.push(`/leaderboard?student_id=${surveyData.alias.student_id?.[0]}&date=${dayjs().format('YYYY-MM-DD')}`);
      } else {
        setStatus('❌ 儲存失敗：' + result.error);
      }
    } catch (error) {
      console.error('處理失敗:', error);
      setStatus('❌ 發生錯誤：' + (error as Error).message);
    }
  };

  // 解密函數
  const decryptSurveyData = (encryptedData: string): string => {
    const hashKey = '0a11beefaa02dac4';
    const ivKey = 'e836c6f0b112b736';

    try {
      const key = CryptoJS.enc.Utf8.parse(hashKey);
      const iv = CryptoJS.enc.Utf8.parse(ivKey);

      const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7,
      });

      const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);

      if (!decryptedText) {
        throw new Error('解密結果為空，請檢查金鑰是否正確');
      }

      return decryptedText;
    } catch (error) {
      console.error('解密失敗:', error);
      throw new Error('解密失敗: ' + (error as Error).message);
    }
  };

  return (
    <LoadingSpinner
      message={
        <>
          正在處理資料，請耐心等候
          <br />
          請勿離開此頁面
        </>
      }
    />
  );
};

export default function Home() {
  return (
    <Suspense fallback={<LoadingSpinner message="Loading..." />}>
      <HomeContent />
    </Suspense>
  );
}
