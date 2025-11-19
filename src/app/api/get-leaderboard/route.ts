import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const studentId = searchParams.get('student_id');
    const date = searchParams.get('date');

    // 設定日期範圍 (以台灣時間 UTC+8 為準)
    let startDate: Date;
    let endDate: Date;

    if (date) {
      // 將輸入的日期視為台灣時間，轉換為 UTC 時間查詢
      // 例如：2024-01-15 台灣時間 00:00:00 = 2024-01-14 16:00:00 UTC
      startDate = dayjs(date).utcOffset(8).startOf('day').utc().toDate();
      endDate = dayjs(date).utcOffset(8).endOf('day').utc().toDate();
    } else {
      // 沒有提供日期則使用台灣今天
      startDate = dayjs().utcOffset(8).startOf('day').utc().toDate();
      endDate = dayjs().utcOffset(8).endOf('day').utc().toDate();
    }

    // 查詢當日的所有有效資料
    const validRecords = await prisma.surveyResponse.findMany({
      where: {
        submitTime: {
          gte: startDate,
          lte: endDate,
        },
      },
      orderBy: {
        submitTime: 'desc',
      },
    });

    // 1. 計算組別排行榜 (使用概念圖總分)
    const groupScores: Record<string, number> = {};

    validRecords.forEach((record) => {
      const group = record.groupName.trim();
      if (!groupScores[group]) {
        groupScores[group] = 0;
      }
      groupScores[group] += record.conceptMapTotalScore;
    });

    const groupList = Object.entries(groupScores)
      .map(([group, total_score]) => ({
        group,
        total_score,
      }))
      .sort((a, b) => b.total_score - a.total_score);

    // 2. 計算個人積分總和
    const studentScores: Record<
      string,
      {
        student_name: string;
        student_id: string;
        score: number;
      }
    > = {};

    validRecords.forEach((record) => {
      const id = record.studentId.trim();
      if (!studentScores[id]) {
        studentScores[id] = {
          student_name: record.studentName,
          student_id: id,
          score: 0,
        };
      }
      studentScores[id].score += record.personalScore;
    });

    // 3. 取得個人前五名
    const personalList = Object.values(studentScores)
      .filter((person) => person.student_name && person.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 5);

    // 4. 取得特定學生的資訊
    let personalInfo = {
      student_name: '',
      student_id: '',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      records: [] as any[],
    };

    if (studentId) {
      const studentRecords = validRecords.filter((record) => record.studentId.trim() === studentId.trim());

      if (studentRecords.length > 0) {
        // 將資料格式轉換成前端期望的格式
        const formattedRecords = studentRecords.map((record) => ({
          student_id: record.studentId,
          student_name: record.studentName,
          group: record.groupName,
          completeness: record.completeness,
          accuracy: record.accuracy,
          richness: record.richness,
          referability: record.referability,
          concept_map_total_score: record.conceptMapTotalScore,
          advantage: record.advantage,
          suggest: record.suggest,
          skill_reflection: record.skillReflection,
          cognitive_reflection: record.cognitiveReflection,
          recommend: record.recommend,
          personal_score: record.personalScore,
          submit_time: record.submitTime.toISOString(),
        }));

        personalInfo = {
          student_name: studentRecords[0].studentName,
          student_id: studentId,
          records: formattedRecords,
        };
      }
    } else if (personalList.length > 0) {
      // 如果沒有指定學生，回傳第一名的資料
      const topStudentId = personalList[0].student_id;
      const topStudentRecords = validRecords.filter((record) => record.studentId.trim() === topStudentId);

      const formattedRecords = topStudentRecords.map((record) => ({
        student_id: record.studentId,
        student_name: record.studentName,
        group: record.groupName,
        completeness: record.completeness,
        accuracy: record.accuracy,
        richness: record.richness,
        referability: record.referability,
        concept_map_total_score: record.conceptMapTotalScore,
        advantage: record.advantage,
        suggest: record.suggest,
        skill_reflection: record.skillReflection,
        cognitive_reflection: record.cognitiveReflection,
        recommend: record.recommend,
        personal_score: record.personalScore,
        submit_time: record.submitTime.toISOString(),
      }));

      personalInfo = {
        student_name: personalList[0].student_name,
        student_id: topStudentId,
        records: formattedRecords,
      };
    }

    return NextResponse.json({
      groupList,
      personalList,
      personalInfo,
    });
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
