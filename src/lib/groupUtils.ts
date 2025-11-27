import dayjs from 'dayjs';

/**
 * 根據當天星期幾取得組別數量
 * 星期一：7個組別
 * 星期二：8個組別
 * 其他日子：預設7個組別
 */
export function getGroupCount(): number {
  const dayOfWeek = dayjs().day(); // 0 = 星期日, 1 = 星期一, 2 = 星期二, ...

  switch (dayOfWeek) {
    case 1: // 星期一
      return 7;
    case 2: // 星期二
      return 8;
    default:
      return 7; // 預設值
  }
}

/**
 * 產生組別選項陣列
 * @returns 組別選項陣列，格式：[{ value: '1', label: '第一組' }, ...]
 */
export function getGroupOptions() {
  const groupCount = getGroupCount();
  const numberWords = ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];

  return Array.from({ length: groupCount }, (_, i) => ({
    value: String(i + 1),
    label: `第${numberWords[i]}組`,
  }));
}

/**
 * 取得當天星期幾的數字 (0-6, 0=星期日)
 */
export function getDayOfWeekNumber(): number {
  return dayjs().day();
}

/**
 * 取得當天星期幾的中文名稱
 */
export function getDayOfWeekName(): string {
  const dayOfWeek = dayjs().day();
  const dayNames = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
  return dayNames[dayOfWeek];
}

/**
 * 產生圖片檔名
 * 格式：group-{星期幾}-{組別}.jpeg
 * @param groupNumber 組別編號
 * @returns 檔名字串，例如：group-1-3.jpeg (星期一第3組)
 */
export function getImageFilename(groupNumber: string | number): string {
  const dayOfWeek = getDayOfWeekNumber();
  return `group-${dayOfWeek}-${groupNumber}.jpeg`;
}

/**
 * 取得圖片路徑
 * @param groupNumber 組別編號
 * @returns 圖片路徑，例如：/image/group-1-3.jpeg
 */
export function getImagePath(groupNumber: string | number): string {
  const filename = getImageFilename(groupNumber);
  return `/image/${filename}`;
}
