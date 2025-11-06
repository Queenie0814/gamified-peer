// src/app/api/get-leaderboard/route.ts
import { NextRequest, NextResponse } from 'next/server';

const APPS_SCRIPT_GET_URL =
  'https://script.google.com/macros/s/AKfycbwxMKYsueSJ0LgUGrQII5ZhjhzX_sIFIi5AF90C6D5vlCQEwahHHHsWRrXlM47JrTVS/exec';

export async function GET(request: NextRequest) {
  try {
    // 從 URL 中取得 query parameters
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('student_id');
    const date = searchParams.get('date');

    // 建立完整的 URL（包含 query parameters）
    let url = APPS_SCRIPT_GET_URL;
    if (studentId) {
      url += `?student_id=${studentId}`;
    }

    if (date) {
      url += studentId ? `&date=${date}` : `?date=${date}`;
    }

    console.log('呼叫 Google Apps Script:', url);

    // 呼叫 Google Apps Script
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return NextResponse.json(data);
  } catch (error) {
    console.error('API 錯誤:', error);
    return NextResponse.json(
      {
        success: false,
        error: '取得資料失敗：' + (error as Error).message,
      },
      { status: 500 }
    );
  }
}
