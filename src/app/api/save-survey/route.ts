// src/app/api/save-survey/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

interface LegacySurveyData {
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
}

export async function POST(request: NextRequest) {
  try {
    const data = (await request.json()) as LegacySurveyData;

    const response = await prisma.surveyResponse.create({
      data: {
        studentId: data.student_id,
        studentName: data.student_name,
        groupName: data.group,
        completeness: data.completeness,
        accuracy: data.accuracy,
        richness: data.richness,
        referability: data.referability,
        conceptMapTotalScore: data.concept_map_total_score,
        advantage: data.advantage,
        suggest: data.suggest,
        skillReflection: data.skill_reflection,
        cognitiveReflection: data.cognitive_reflection,
        recommend: data.recommend,
        personalScore: data.personal_score,
        submitTime: new Date(data.submit_time),
      },
    });

    return NextResponse.json({
      success: true,
      id: response.id,
      studentId: data.student_id,
      personalScore: data.personal_score,
      totalScore: data.concept_map_total_score,
      message: '資料已成功儲存',
    });
  } catch (error) {
    console.error('Database error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';

    return NextResponse.json(
      {
        success: false,
        error: 'Apps Script 處理錯誤: ' + errorMessage,
      },
      { status: 500 }
    );
  }
}
