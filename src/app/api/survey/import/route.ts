// src/app/api/survey/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface RowData {
  student_id: string;
  student_name: string;
  group: string;
  completeness: string;
  accuracy: string;
  richness: string;
  referability: string;
  concept_map_total_score: string;
  advantage: string;
  suggest: string;
  skill_reflection: string;
  cognitive_reflection: string;
  recommend: string;
  personal_score: string;
  submit_time: string;
}

export async function POST(request: NextRequest) {
  try {
    const { csvData } = await request.json();

    // 解析 CSV 資料
    const lines = csvData.trim().split('\n');
    const headers = lines[0].split(',');

    const results: number[] = [];

    for (let i = 1; i < lines.length; i++) {
      if (!lines[i].trim()) continue; // 跳過空行

      const values = lines[i].split(',');
      const rowData: Partial<RowData> = {};

      // 明確指定 header 為 string 類型
      headers.forEach((header: string, index: number) => {
        const key = header.trim() as keyof RowData;
        rowData[key] = values[index]?.trim() || '';
      });

      // 檢查必要欄位是否存在
      const requiredFields: (keyof RowData)[] = [
        'student_id',
        'student_name',
        'group',
        'completeness',
        'accuracy',
        'richness',
        'referability',
        'concept_map_total_score',
        'advantage',
        'suggest',
        'skill_reflection',
        'cognitive_reflection',
        'recommend',
        'personal_score',
        'submit_time',
      ];

      const missingFields = requiredFields.filter((field) => !rowData[field]);
      if (missingFields.length > 0) {
        console.warn(`Skipping row ${i}: missing fields ${missingFields.join(', ')}`);
        continue;
      }

      // 現在可以安全地轉換為完整的 RowData
      const completeRowData = rowData as RowData;

      // 建立資料庫記錄
      const response = await prisma.surveyResponse.create({
        data: {
          studentId: completeRowData.student_id,
          studentName: completeRowData.student_name,
          groupName: completeRowData.group,
          completeness: parseInt(completeRowData.completeness),
          accuracy: parseInt(completeRowData.accuracy),
          richness: parseInt(completeRowData.richness),
          referability: parseInt(completeRowData.referability),
          conceptMapTotalScore: parseInt(completeRowData.concept_map_total_score),
          advantage: completeRowData.advantage,
          suggest: completeRowData.suggest,
          skillReflection: completeRowData.skill_reflection,
          cognitiveReflection: completeRowData.cognitive_reflection,
          recommend: parseInt(completeRowData.recommend),
          personalScore: parseInt(completeRowData.personal_score),
          submitTime: new Date(completeRowData.submit_time),
        },
      });

      results.push(response.id);
    }

    return NextResponse.json({
      success: true,
      imported: results.length,
      ids: results,
    });
  } catch (error) {
    console.error('Import error:', error);

    // 型別安全的錯誤處理
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json({ error: 'Failed to import data', details: errorMessage }, { status: 500 });
  }
}
