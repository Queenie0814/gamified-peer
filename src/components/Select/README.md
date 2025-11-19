# Select 元件

共用的下拉選單元件，採用網站整體橘黃色系設計，支援浮動標籤和多種樣式。

## 設計配色

- **主色調**: #f2ad4e (橘色)
- **強調色**: #ff9500 (深橘色)
- **亮色**: #ffed6d (亮黃色)
- **文字色**: #8b4513 (棕色)
- **灰色**: #999999

## 使用範例

### 🌟 浮動標籤（預設，推薦）

浮動標籤是現代化的設計，當下拉選單獲得焦點或有選擇值時，標籤會優雅地浮動到上方。

```tsx
import Select from '@/components/Select';
import { useState } from 'react';

function MyForm() {
  const [group, setGroup] = useState('');

  const groupOptions = [
    { value: 'A', label: 'A組' },
    { value: 'B', label: 'B組' },
    { value: 'C', label: 'C組' },
  ];

  return (
    <Select
      label="組別"
      options={groupOptions}
      placeholder="請選擇組別"
      value={group}
      onChange={(e) => setGroup(e.target.value)}
      required
      fullWidth
    />
  );
}
```

**效果說明：**
- 初始狀態：標籤顯示在選單內部作為提示（未選擇時文字透明，避免與 label 重疊）
- 聚焦/選擇值：標籤浮動到選單上方，縮小並變色（橘色）
- 選擇後：選項文字正常顯示
- 箭頭動畫：聚焦時箭頭旋轉 180 度

**設計特點：**
- ✨ 在浮動標籤模式下，label 本身就是 placeholder，不會出現重疊問題
- 📝 傳統標籤模式下，會顯示正常的 placeholder 文字
- 🎯 完美解決 label 與 placeholder 重疊的問題
- 🔄 選擇選項後自動失去焦點，提供更好的用戶體驗（label 保持浮動，但移除 focus 樣式）

### 傳統上方標籤

```tsx
<Select
  label="系所"
  labelStyle="top"
  options={departmentOptions}
  placeholder="請選擇系所"
  fullWidth
/>
```

### 帶錯誤訊息

```tsx
<Select
  label="年級"
  options={gradeOptions}
  value={grade}
  onChange={(e) => setGrade(e.target.value)}
  error="請選擇年級"
  required
/>
```

### Filled 樣式

```tsx
<Select
  label="興趣"
  variant="filled"
  options={hobbyOptions}
  placeholder="請選擇興趣"
  helperText="可選填"
  fullWidth
/>
```

### 禁用選項

```tsx
const options = [
  { value: '1', label: '選項 1' },
  { value: '2', label: '選項 2（禁用）', disabled: true },
  { value: '3', label: '選項 3' },
];

<Select
  label="選項"
  options={options}
  fullWidth
/>
```

### 禁用整個選單

```tsx
<Select
  label="禁用的選單"
  options={options}
  disabled
  fullWidth
/>
```

## Props

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| label | string | - | 選單標籤 |
| labelStyle | 'floating' \| 'top' | 'floating' | 標籤樣式：floating 為浮動標籤，top 為傳統上方標籤 |
| options | SelectOption[] | - | **必填**：選項列表 |
| placeholder | string | '請選擇' | Placeholder 文字 |
| error | string | - | 錯誤訊息（顯示警告圖示） |
| helperText | string | - | 輔助說明文字 |
| fullWidth | boolean | false | 是否佔滿容器寬度 |
| variant | 'outlined' \| 'filled' | 'outlined' | 選單樣式 |
| value | string | - | **重要**：使用浮動標籤時必須提供 value |
| onChange | function | - | 值改變時的回調函數 |

### SelectOption 型別

```tsx
interface SelectOption {
  value: string;      // 選項的值
  label: string;      // 顯示的文字
  disabled?: boolean; // 是否禁用該選項
}
```

此外，元件也支援所有原生 select 的屬性（required, disabled, etc.）

## 重要提醒

使用浮動標籤時，請務必：
1. ✅ 提供 `value` prop（即使是空字串）
2. ✅ 提供 `onChange` handler
3. ✅ 使用受控元件模式（controlled component）
4. ✅ 提供 `options` 陣列

```tsx
// ✅ 正確
const [value, setValue] = useState('');
<Select
  label="組別"
  options={groupOptions}
  value={value}
  onChange={(e) => setValue(e.target.value)}
/>

// ❌ 錯誤（標籤不會正確浮動）
<Select label="組別" options={groupOptions} />
```

## 特殊功能

### 自定義箭頭動畫
- 聚焦時箭頭會旋轉 180 度
- 箭頭顏色會從橘色變為深橘色

### 無障礙支援
- 完整的 ARIA 屬性
- 鍵盤導航支援
- 螢幕閱讀器友好

### 深色模式
- 自動支援深色主題
- 選項列表背景也會適配

## 與 Input 元件的一致性

Select 元件與 Input 元件保持完全一致的設計：
- ✅ 相同的配色方案
- ✅ 相同的浮動標籤動畫
- ✅ 相同的錯誤處理方式
- ✅ 相同的 variant 樣式
- ✅ 相同的輔助文字顯示

可以混合使用兩個元件而不會有視覺不一致！
