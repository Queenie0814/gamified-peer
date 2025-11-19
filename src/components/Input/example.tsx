/**
 * Input 元件使用範例
 * 此文件展示如何在實際專案中使用 Input 元件
 */

'use client';

import { useState } from 'react';
import Input from './index';

export default function InputExample() {
  const [formData, setFormData] = useState({
    studentId: '',
    studentName: '',
    email: '',
    group: '',
  });

  const [errors, setErrors] = useState({
    studentId: '',
    email: '',
  });

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [field]: e.target.value,
    }));

    // 清除錯誤訊息
    if (errors[field as keyof typeof errors]) {
      setErrors((prev) => ({
        ...prev,
        [field]: '',
      }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 簡單驗證
    const newErrors = {
      studentId: formData.studentId ? '' : '請輸入學號',
      email: formData.email.includes('@') ? '' : '請輸入有效的電子郵件',
    };

    setErrors(newErrors);

    if (!newErrors.studentId && !newErrors.email) {
      console.log('表單提交:', formData);
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '500px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem', color: '#8b4513' }}>學生資料表單</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ color: '#f2ad4e', marginBottom: '1rem', fontSize: '1.125rem' }}>
            ✨ 浮動標籤樣式（預設，推薦）
          </h3>

          {/* 浮動標籤 - Outlined */}
          <div style={{ marginBottom: '1.5rem' }}>
            <Input
              label="學號"
              placeholder="例如: A123456789"
              value={formData.studentId}
              onChange={handleChange('studentId')}
              error={errors.studentId}
              required
              fullWidth
            />
          </div>

          {/* 浮動標籤 - 姓名 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <Input
              label="姓名"
              placeholder="請輸入您的姓名"
              value={formData.studentName}
              onChange={handleChange('studentName')}
              fullWidth
            />
          </div>

          {/* 浮動標籤 - Email */}
          <div style={{ marginBottom: '1.5rem' }}>
            <Input
              label="電子郵件"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange('email')}
              error={errors.email}
              helperText="請輸入有效的電子郵件地址"
              required
              fullWidth
            />
          </div>

          {/* 浮動標籤 - Filled 樣式 */}
          <Input
            label="組別"
            variant="filled"
            placeholder="請輸入組別"
            value={formData.group}
            onChange={handleChange('group')}
            helperText="例如: A組、B組"
            fullWidth
          />
        </div>

        <div style={{ borderTop: '2px dashed #f2ad4e', paddingTop: '1.5rem' }}>
          <h3 style={{ color: '#8b4513', marginBottom: '1rem', fontSize: '1.125rem' }}>
            傳統上方標籤樣式
          </h3>

          {/* 傳統標籤樣式 */}
          <Input
            label="備註"
            labelStyle="top"
            placeholder="其他資訊"
            fullWidth
          />
        </div>

        <button
          type="submit"
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: '#f2ad4e',
            color: 'white',
            border: 'none',
            borderRadius: '0.5rem',
            fontSize: '1rem',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: 'Noto Sans TC, sans-serif',
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.backgroundColor = '#ff9500';
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.backgroundColor = '#f2ad4e';
          }}
        >
          提交表單
        </button>
      </form>

      <div style={{ marginTop: '2rem', padding: '1rem', backgroundColor: '#fcf2c3', borderRadius: '0.5rem' }}>
        <h3 style={{ color: '#8b4513', marginBottom: '0.5rem' }}>當前表單資料：</h3>
        <pre style={{ fontSize: '0.875rem', color: '#666' }}>
          {JSON.stringify(formData, null, 2)}
        </pre>
      </div>
    </div>
  );
}
