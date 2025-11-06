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

    // 優質回饋積分計算 (advantage, suggest)
    const feedbackTexts = [advantage, suggest];
    feedbackTexts.forEach((text) => {
      const length = text.length;

      if (length >= 40) {
        score += 25;
      } else if (length >= 30) {
        score += 20;
      } else if (length >= 20) {
        score += 15;
      }
    });

    // 深度反思積分計算 (skill_reflection, cognitive_reflection)
    const reflectionTexts = [skillReflection, cognitiveReflection];
    reflectionTexts.forEach((text) => {
      const length = text.length;

      if (length >= 40) {
        score += 25;
      } else if (length >= 30) {
        score += 20;
      } else if (length >= 20) {
        score += 15;
      }
    });

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

      // 5. 透過 API Route 儲存到 Google Apps Script
      const saveResponse = await fetch('/api/save-survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          surveyData: enhancedSurveyData,
        }),
      });

      const result = await saveResponse.json();

      if (result.success) {
        setStatus(`✅ 資料儲存完成！個人積分: ${personalScore}分，概念圖總分: ${totalScore}分`);

        setTimeout(() => {
          setStatus('正在轉址到排行榜...');
          router.push(
            `/leaderboard?student_id=${surveyData.alias.student_id?.[0]}&date=${dayjs().format('YYYY-MM-DD')}`
          );
        }, 3000);
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
