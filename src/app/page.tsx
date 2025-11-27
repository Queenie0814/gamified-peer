'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

import PageLayout from '@/components/PageLayout';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Button from '@/components/Button';
import { getGroupOptions } from '@/lib/groupUtils';

import styles from './page.module.scss';

export default function Home() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 將所有表單欄位定義為 object array
  const [formFields, setFormFields] = useState([
    {
      name: 'student_number',
      label: '你的學號',
      type: 'input' as const,
      value: '',
      error: '',
      helperText: '',
      fullWidth: true,
      labelStyle: 'floating' as const,
    },
    {
      name: 'name',
      label: '你的姓名',
      type: 'input' as const,
      value: '',
      error: '',
      helperText: '',
      fullWidth: true,
      labelStyle: 'floating' as const,
    },
    {
      name: 'group',
      label: '挑選你的評分對象',
      type: 'select' as const,
      value: '',
      error: '',
      helperText: '',
      fullWidth: true,
      labelStyle: 'floating' as const,
      options: getGroupOptions(), // 動態產生組別選項
    },
  ]);

  // 更新特定欄位的值
  const handleFieldChange = (name: string, value: string) => {
    setFormFields((prev) =>
      prev.map((field) =>
        field.name === name
          ? { ...field, value, error: '' } // 更新值並清除錯誤
          : field
      )
    );
  };

  // 更新特定欄位的錯誤訊息
  const setFieldError = (name: string, error: string) => {
    setFormFields((prev) => prev.map((field) => (field.name === name ? { ...field, error } : field)));
  };

  // 驗證表單
  const validateForm = () => {
    let isValid = true;

    formFields.forEach((field) => {
      // 驗證必填欄位
      if (!field.value.trim()) {
        setFieldError(field.name, '此欄位為必填');
        isValid = false;
      }
      // 驗證學號格式：8碼，由數字和大寫字母組成
      else if (field.name === 'student_number' && field.value) {
        if (!/^[A-Z0-9]{8}$/.test(field.value)) {
          setFieldError(field.name, '格式有誤');
          isValid = false;
        }
      }
    });

    return isValid;
  };

  // 提交表單
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setIsSubmitting(true);

      // 將 formFields 轉換為簡單的 key-value object
      const formData = formFields.reduce((acc, field) => {
        acc[field.name] = field.value;
        return acc;
      }, {} as Record<string, string>);

      // 建立查詢參數
      const queryParams = new URLSearchParams({
        group: formData.group,
        name: formData.name,
        student_id: formData.student_number,
      });

      // 跳轉到表單頁面
      router.push(`/form?${queryParams.toString()}`);
    }
  };

  return (
    <PageLayout className={styles.pageLayout} showPattern={false}>
      <form className={styles.form} onSubmit={handleSubmit} noValidate>
        <Image src="/logov2.png" className={styles.logo} alt="Logo" width={640} height={133} />
        {formFields.map((field) => {
          if (field.type === 'input') {
            return (
              <Input
                key={field.name}
                name={field.name}
                label={field.label}
                value={field.value}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                error={field.error}
                helperText={!field.error ? field.helperText : undefined}
                fullWidth={field.fullWidth}
                labelStyle={field.labelStyle}
                maxLength={8}
              />
            );
          }

          if (field.type === 'select') {
            return (
              <Select
                key={field.name}
                name={field.name}
                label={field.label}
                value={field.value}
                onChange={(e) => handleFieldChange(field.name, e.target.value)}
                options={field.options || []}
                error={field.error}
                helperText={!field.error ? field.helperText : undefined}
                fullWidth={field.fullWidth}
                labelStyle={field.labelStyle}
              />
            );
          }

          return null;
        })}

        <Button type="submit" className={styles.submitButton} loading={isSubmitting} fullWidth>
          ENTER
        </Button>
      </form>
    </PageLayout>
  );
}
