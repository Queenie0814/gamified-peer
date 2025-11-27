import { NextRequest, NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import sharp from 'sharp';
import { getImageFilename } from '@/lib/groupUtils';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const groupNumber = formData.get('group') as string;

    if (!file) {
      return NextResponse.json({ error: '請選擇要上傳的檔案' }, { status: 400 });
    }

    if (!groupNumber) {
      return NextResponse.json({ error: '請指定組別編號' }, { status: 400 });
    }

    // 檢查檔案類型，接受所有圖片格式
    const fileType = file.type;
    if (!fileType.startsWith('image/')) {
      return NextResponse.json({ error: '只能上傳圖片檔案' }, { status: 400 });
    }

    // 將檔案轉換為 Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // 使用 sharp 將圖片轉換為 JPEG 格式並優化
    const convertedBuffer = await sharp(buffer)
      .jpeg({
        quality: 90, // 設定品質為 90（可調整，範圍 1-100）
        progressive: true, // 漸進式載入
      })
      .toBuffer();

    // 設定檔名：group-{星期幾}-{組別}.jpeg
    const filename = getImageFilename(groupNumber);

    // 上傳到 Vercel Blob Storage
    const blob = await put(filename, convertedBuffer, {
      access: 'public',
      contentType: 'image/jpeg',
    });

    console.log(`✅ 圖片已上傳到 Vercel Blob：${filename}`);
    console.log(`   Blob URL：${blob.url}`);
    console.log(`   原始格式：${fileType}`);
    console.log(`   原始大小：${(buffer.length / 1024).toFixed(2)} KB`);
    console.log(`   轉換後大小：${(convertedBuffer.length / 1024).toFixed(2)} KB`);

    return NextResponse.json({
      success: true,
      message: '上傳成功（已自動轉換為 JPEG）',
      filename: filename,
      url: blob.url,
      originalFormat: fileType,
      originalSize: `${(buffer.length / 1024).toFixed(2)} KB`,
      convertedSize: `${(convertedBuffer.length / 1024).toFixed(2)} KB`,
    });
  } catch (error) {
    console.error('上傳失敗:', error);
    return NextResponse.json(
      { error: '上傳失敗：' + (error as Error).message },
      { status: 500 }
    );
  }
}
