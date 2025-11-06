// src/app/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams /* , useRouter */ } from 'next/navigation';
import CryptoJS from 'crypto-js';

export default function Home() {
  const searchParams = useSearchParams();
  // const router = useRouter();
  const [status, setStatus] = useState('');
  const [processed, setProcessed] = useState(false);

  // Google Apps Script 部署 URL
  // const APPS_SCRIPT_URL = 'https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec';

  useEffect(() => {
    const svid = searchParams.get('svid');
    const hash = searchParams.get('hash');

    if (svid && hash && !processed) {
      handleSurveySubmission(svid, hash);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, processed]);

  const handleSurveySubmission = async (svid: string, hash: string) => {
    if (processed) return;

    setProcessed(true);

    try {
      setStatus('正在取得問卷資料...');

      // 1. 從 SurveyCake 取得加密資料
      const webhookUrl = `https://www.surveycake.com/webhook/v0/${svid}/${hash}`;
      console.log('請求 URL:', webhookUrl);

      const response = await fetch(webhookUrl);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const encryptedData = await response.text();
      console.log('取得加密資料成功，長度:', encryptedData.length);

      setStatus('正在解密資料...');

      // 2. 在前端解密資料
      const decryptedData = decryptSurveyData(encryptedData);
      const surveyData = JSON.parse(decryptedData);

      console.log('result:', surveyData);

      // 3. POST 解密後的資料到 Google Apps Script
      // const saveResponse = await fetch(APPS_SCRIPT_URL, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //   },
      //   body: JSON.stringify({
      //     action: 'saveSurvey',
      //     data: surveyData
      //   })
      // });

      // const result = await saveResponse.json();

      // if (result.success) {
      //   setStatus('資料儲存完成，正在轉址到排行榜...');

      //   setTimeout(() => {
      //     router.push(`/leaderboard?highlight=${result.studentId}`);
      //   }, 1500);
      // } else {
      //   setStatus('❌ 儲存失敗：' + result.error);
      // }
    } catch (error) {
      console.error('處理失敗:', error);
      setStatus('❌ 發生錯誤：' + (error as Error).message);
    }
  };

  // 解密函數
  const decryptSurveyData = (encryptedData: string): string => {
    const hashKey = 'a194f94ed8aa6875';
    const ivKey = '710a88927e935676';

    try {
      const key = CryptoJS.enc.Utf8.parse(hashKey);
      const iv = CryptoJS.enc.Utf8.parse(ivKey);

      const decrypted = CryptoJS.AES.decrypt(encryptedData, key, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.ZeroPadding,
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
    <div>
      <h1>{status}</h1>
    </div>
  );
}
