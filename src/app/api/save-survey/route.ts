// src/app/api/save-survey/route.ts
import { NextRequest, NextResponse } from 'next/server';

const APPS_SCRIPT_URL =
  'https://script.google.com/macros/s/AKfycbwM0DoC-IgFyejzPSgzpibBSXZQOcQfRw82HUV_ddr14UqM-NPll4yOK8UFog0uI0GP/exec';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { surveyData } = body;

    if (!surveyData) {
      return NextResponse.json(
        { success: false, error: '缺少問卷資料' },
        { status: 400 }
      );
    }

    // 轉發到 Google Apps Script
    const response = await fetch(APPS_SCRIPT_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        action: 'saveSurvey',
        data: surveyData,
      }),
    });

    const result = await response.json();

    return NextResponse.json(result);
  } catch (error) {
    console.error('API 錯誤:', error);
    return NextResponse.json(
      {
        success: false,
        error: '伺服器錯誤：' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}
