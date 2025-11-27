import { NextRequest, NextResponse } from 'next/server';
import { list } from '@vercel/blob';

export async function GET(request: NextRequest) {
  try {
    // 列出所有 blob
    const { blobs } = await list();

    return NextResponse.json({
      success: true,
      count: blobs.length,
      blobs: blobs.map((blob) => ({
        pathname: blob.pathname,
        url: blob.url,
        size: blob.size,
        uploadedAt: blob.uploadedAt,
      })),
    });
  } catch (error) {
    console.error('列出 blob 失敗:', error);
    return NextResponse.json(
      { error: '列出 blob 失敗：' + (error as Error).message },
      { status: 500 }
    );
  }
}
