'use client';

import { useState } from 'react';
import Image from 'next/image';
import PageLayout from '@/components/PageLayout';
import Button from '@/components/Button';
import Select from '@/components/Select';
import { getGroupOptions } from '@/lib/groupUtils';
import styles from './page.module.scss';

export default function UploadPage() {
  const [groupNumber, setGroupNumber] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message: string;
  } | null>(null);

  // 處理檔案選擇
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      // 建立預覽 URL
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
      setUploadResult(null);
    }
  };

  // 處理上傳
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedFile || !groupNumber) {
      alert('請選擇檔案並輸入組別編號');
      return;
    }

    setIsUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('group', groupNumber);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      // 檢查回應是否為 JSON
      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const text = await response.text();
        throw new Error(`伺服器返回非 JSON 格式：${text.substring(0, 100)}`);
      }

      const result = await response.json();

      if (result.success) {
        setUploadResult({
          success: true,
          message: `上傳成功！`,
        });
        // 清空表單
        setSelectedFile(null);
        setPreviewUrl('');
        setGroupNumber('');
        // 重置檔案輸入
        const fileInput = document.getElementById('fileInput') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setUploadResult({
          success: false,
          message: result.error || '上傳失敗',
        });
      }
    } catch (error) {
      setUploadResult({
        success: false,
        message: '上傳失敗：' + (error as Error).message,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const groupOptions = getGroupOptions();

  return (
    <PageLayout showPattern={false}>
      <div className={styles.container}>
        <h1 className={styles.title}>UPLOAD!</h1>
        <form onSubmit={handleUpload} className={styles.form}>
          {/* 組別選擇 */}
          <Select
            name="groupNumber"
            label="選擇組別"
            value={groupNumber}
            onChange={(e) => setGroupNumber(e.target.value)}
            options={groupOptions}
            fullWidth
            labelStyle="floating"
          />

          {/* 檔案選擇 */}
          <div className={styles.formGroup}>
            <label htmlFor="fileInput" className={styles.label}>
              選擇圖片
            </label>
            <input
              id="fileInput"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className={styles.fileInput}
              required
            />
          </div>

          {/* 預覽區域 */}
          {previewUrl && (
            <div className={styles.preview}>
              <h3 className={styles.previewTitle}>預覽</h3>
              <div className={styles.previewImage}>
                <Image
                  src={previewUrl}
                  alt="預覽圖片"
                  width={600}
                  height={400}
                  style={{ objectFit: 'contain' }}
                  unoptimized
                />
              </div>
            </div>
          )}

          {/* 上傳結果 */}
          {uploadResult && (
            <div className={`${styles.result} ${uploadResult.success ? styles.success : styles.error}`}>
              {uploadResult.message}
            </div>
          )}

          {/* 上傳按鈕 */}
          <Button
            type="submit"
            className={styles.uploadButton}
            loading={isUploading}
            disabled={!selectedFile || !groupNumber}
          >
            SUBMIT
          </Button>
        </form>
      </div>
    </PageLayout>
  );
}
