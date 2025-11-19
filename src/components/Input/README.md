# Input 元件

共用的輸入框元件，採用網站整體橘黃色系設計，支援多種樣式和狀態。

## 設計配色

- **主色調**: #f2ad4e (橘色)
- **強調色**: #ff9500 (深橘色)
- **亮色**: #ffed6d (亮黃色)
- **文字色**: #8b4513 (棕色)
- **灰色**: #999999

## 使用範例

### 🌟 浮動標籤（預設，推薦）

浮動標籤是現代化的設計，當輸入框獲得焦點或有值時，標籤會優雅地浮動到上方。

```tsx
import Input from '@/components/Input';

// 預設使用浮動標籤
<Input
  label="用戶名稱"
  placeholder="請輸入用戶名稱"
  value={name}
  onChange={(e) => setName(e.target.value)}
  fullWidth
/>
```

**效果說明：**
- 初始狀態：標籤顯示在輸入框內部，像 placeholder
- 聚焦/有值：標籤浮動到輸入框上方，縮小並變色（橘色）
- 平滑動畫：使用 cubic-bezier 緩動函數

### 傳統上方標籤

如果你偏好傳統的上方標籤樣式，可以設置 `labelStyle="top"`：

```tsx
<Input
  label="用戶名稱"
  labelStyle="top"
  placeholder="請輸入用戶名稱"
/>
```

### 基本用法（無標籤）

```tsx
<Input placeholder="請輸入文字" />
```

### 必填欄位

```tsx
<Input
  label="電子郵件"
  placeholder="example@email.com"
  required
/>
```

### 顯示錯誤訊息

```tsx
<Input
  label="密碼"
  type="password"
  error="密碼至少需要 8 個字元"
/>
```

### 輔助文字

```tsx
<Input
  label="用戶名稱"
  helperText="用戶名稱不可包含特殊字元"
/>
```

### 填充樣式

```tsx
<Input
  label="搜尋"
  variant="filled"
  placeholder="搜尋內容..."
/>
```

### 全寬度

```tsx
<Input
  label="完整地址"
  fullWidth
  placeholder="請輸入完整地址"
/>
```

### 禁用狀態

```tsx
<Input
  label="唯讀欄位"
  value="無法編輯"
  disabled
/>
```

### 搭配 React Hook Form

```tsx
import { useForm } from 'react-hook-form';
import Input from '@/components/Input';

function MyForm() {
  const { register, formState: { errors } } = useForm();

  return (
    <form>
      <Input
        label="電子郵件"
        {...register('email', { required: '此欄位為必填' })}
        error={errors.email?.message}
      />
    </form>
  );
}
```

## Props

| 屬性 | 類型 | 預設值 | 說明 |
|------|------|--------|------|
| label | string | - | 輸入框標籤 |
| labelStyle | 'floating' \| 'top' | 'floating' | 標籤樣式：floating 為浮動標籤，top 為傳統上方標籤 |
| error | string | - | 錯誤訊息（顯示警告圖示） |
| helperText | string | - | 輔助說明文字 |
| fullWidth | boolean | false | 是否佔滿容器寬度 |
| variant | 'outlined' \| 'filled' | 'outlined' | 輸入框樣式 |
| value | string | - | **重要**：使用浮動標籤時必須提供 value，否則標籤無法正確浮動 |

此外，元件也支援所有原生 input 的屬性（type, placeholder, onChange, etc.）

## 重要提醒

使用浮動標籤時，請務必：
1. ✅ 提供 `value` prop（即使是空字串）
2. ✅ 提供 `onChange` handler
3. ✅ 使用受控元件模式（controlled component）

```tsx
// ✅ 正確
const [name, setName] = useState('');
<Input label="姓名" value={name} onChange={(e) => setName(e.target.value)} />

// ❌ 錯誤（標籤不會正確浮動）
<Input label="姓名" />
```
