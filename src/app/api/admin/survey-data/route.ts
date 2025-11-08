import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '50');
    const search = searchParams.get('search') || '';
    const sortBy = searchParams.get('sortBy') || 'submitTime';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    const skip = (page - 1) * limit;

    // 建構搜尋條件
    const where = search
      ? {
          OR: [
            { studentId: { contains: search, mode: 'insensitive' as const } },
            { studentName: { contains: search, mode: 'insensitive' as const } },
            { groupName: { contains: search, mode: 'insensitive' as const } },
          ],
        }
      : {};

    // 獲取總數
    const total = await prisma.surveyResponse.count({ where });

    // 建構排序條件
    const orderBy: Record<string, 'asc' | 'desc'> = {
      [sortBy]: sortOrder as 'asc' | 'desc',
    };

    // 獲取資料
    const data = await prisma.surveyResponse.findMany({
      where,
      orderBy,
      skip,
      take: limit,
    });

    // 格式化資料
    const formattedData = data.map((item) => ({
      id: item.id,
      studentId: item.studentId,
      studentName: item.studentName,
      groupName: item.groupName,
      completeness: item.completeness,
      accuracy: item.accuracy,
      richness: item.richness,
      referability: item.referability,
      conceptMapTotalScore: item.conceptMapTotalScore,
      advantage: item.advantage,
      suggest: item.suggest,
      skillReflection: item.skillReflection,
      cognitiveReflection: item.cognitiveReflection,
      recommend: item.recommend,
      personalScore: item.personalScore,
      submitTime: item.submitTime.toISOString(),
      createdAt: item.createdAt.toISOString(),
    }));

    return NextResponse.json({
      success: true,
      data: formattedData,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
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
