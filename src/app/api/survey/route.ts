// src/app/api/survey/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// 新增調查資料
export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const response = await prisma.surveyResponse.create({
      data: {
        studentId: data.student_id,
        studentName: data.student_name,
        groupName: data.group,
        completeness: parseInt(data.completeness),
        accuracy: parseInt(data.accuracy),
        richness: parseInt(data.richness),
        referability: parseInt(data.referability),
        conceptMapTotalScore: parseInt(data.concept_map_total_score),
        advantage: data.advantage,
        suggest: data.suggest,
        skillReflection: data.skill_reflection,
        cognitiveReflection: data.cognitive_reflection,
        recommend: parseInt(data.recommend),
        personalScore: parseInt(data.personal_score),
        submitTime: new Date(data.submit_time),
      },
    });

    return NextResponse.json({ success: true, id: response.id });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to insert data' }, { status: 500 });
  }
}

// 查詢資料
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    const groupName = searchParams.get('group');
    const limit = searchParams.get('limit');

    let whereClause = {};
    if (studentId) {
      whereClause = { studentId };
    } else if (groupName) {
      whereClause = { groupName };
    }

    const responses = await prisma.surveyResponse.findMany({
      where: whereClause,
      orderBy: { submitTime: 'desc' },
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json(responses);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 });
  }
}
