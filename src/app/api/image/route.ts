import { NextRequest, NextResponse } from 'next/server';
import { head } from '@vercel/blob';
import { getImageFilename } from '@/lib/groupUtils';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupNumber = searchParams.get('group');

    if (!groupNumber) {
      return NextResponse.json({ error: '請提供組別編號' }, { status: 400 });
    }

    // 取得檔名
    const filename = getImageFilename(groupNumber);

    // 從 Vercel Blob 獲取圖片資訊
    const blob = await head(filename);

    if (!blob) {
      return NextResponse.json({ error: '找不到圖片' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      url: blob.url,
      filename: filename,
    });
  } catch (error) {
    console.error('獲取圖片失敗:', error);
    return NextResponse.json(
      { error: '獲取圖片失敗：' + (error as Error).message },
      { status: 500 }
    );
  }
}
