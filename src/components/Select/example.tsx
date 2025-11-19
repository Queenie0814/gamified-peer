/**
 * Select 元件使用範例
 * 此文件展示如何在實際專案中使用 Select 元件
 */

'use client';

import { useState } from 'react';
import Select from './index';

export default function SelectExample() {
  const [formData, setFormData] = useState({
    group: '',
    department: '',
    grade: '',
    hobby: '',
  });

  const [errors, setErrors] = useState({
    group: '',
    department: '',
  });

  // 選項資料
  const groupOptions = [
    { value: 'A', label: 'A組' },
    { value: 'B', label: 'B組' },
    { value: 'C', label: 'C組' },
    { value: 'D', label: 'D組' },
  ];

  const departmentOptions = [
    { value: 'cs', label: '資訊工程系' },
    { value: 'ee', label: '電機工程系' },
    { value: 'me', label: '機械工程系' },
    { value: 'ce', label: '土木工程系' },
  ];

  const gradeOptions = [
    { value: '1', label: '一年級' },
    { value: '2', label: '二年級' },
    { value: '3', label: '三年級' },
    { value: '4', label: '四年級' },
  ];

  const hobbyOptions = [
    { value: 'reading', label: '閱讀' },
    { value: 'sports', label: '運動' },
    { value: 'music', label: '音樂' },
    { value: 'travel', label: '旅遊' },
    { value: 'gaming', label: '遊戲' },
  ];

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLSelectElement>) => {
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
      group: formData.group ? '' : '請選擇組別',
      department: formData.department ? '' : '請選擇系所',
    };

    setErrors(newErrors);

    if (!newErrors.group && !newErrors.department) {
      console.log('表單提交:', formData);
      alert('表單提交成功！請查看 console');
    }
  };

  return (
    <div style={{ padding: '2rem', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ marginBottom: '1.5rem', color: '#8b4513' }}>學生選課表單</h2>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
        <div style={{ marginBottom: '1rem' }}>
          <h3 style={{ color: '#f2ad4e', marginBottom: '1rem', fontSize: '1.125rem' }}>
            ✨ 浮動標籤樣式（預設，推薦）
          </h3>

          {/* 浮動標籤 - Outlined */}
          <div style={{ marginBottom: '1.5rem' }}>
            <Select
              label="組別"
              options={groupOptions}
              placeholder="請選擇組別"
              value={formData.group}
              onChange={handleChange('group')}
              error={errors.group}
              required
              fullWidth
            />
          </div>

          {/* 浮動標籤 - 系所 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <Select
              label="系所"
              options={departmentOptions}
              placeholder="請選擇系所"
              value={formData.department}
              onChange={handleChange('department')}
              error={errors.department}
              helperText="請選擇您所屬的系所"
              required
              fullWidth
            />
          </div>

          {/* 浮動標籤 - Filled 樣式 */}
          <div style={{ marginBottom: '1.5rem' }}>
            <Select
              label="年級"
              variant="filled"
              options={gradeOptions}
              placeholder="請選擇年級"
              value={formData.grade}
              onChange={handleChange('grade')}
              helperText="選填項目"
              fullWidth
            />
          </div>

          {/* 浮動標籤 - 興趣 */}
          <Select
            label="興趣"
            options={hobbyOptions}
            placeholder="請選擇興趣"
            value={formData.hobby}
            onChange={handleChange('hobby')}
            fullWidth
          />
        </div>

        <div style={{ borderTop: '2px dashed #f2ad4e', paddingTop: '1.5rem' }}>
          <h3 style={{ color: '#8b4513', marginBottom: '1rem', fontSize: '1.125rem' }}>
            傳統上方標籤樣式
          </h3>

          {/* 傳統標籤樣式 */}
          <Select
            label="其他選項"
            labelStyle="top"
            options={groupOptions}
            placeholder="請選擇"
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
        <pre style={{ fontSize: '0.875rem', color: '#666' }}>{JSON.stringify(formData, null, 2)}</pre>
      </div>
    </div>
  );
}
