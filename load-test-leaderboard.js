import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// 自定義指標
const errorRate = new Rate('errors');

// 測試配置
export const options = {
  stages: [
    { duration: '30s', target: 50 },   // 30秒內逐漸增加到 50 個虛擬用戶
    { duration: '1m', target: 100 },   // 1分鐘內增加到 100 個虛擬用戶
    { duration: '2m', target: 100 },   // 維持 100 個虛擬用戶 2 分鐘
    { duration: '30s', target: 50 },   // 30秒內減少到 50 個虛擬用戶
    { duration: '30s', target: 0 },    // 30秒內完全停止
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% 的請求應在 500ms 內完成
    http_req_failed: ['rate<0.1'],    // 錯誤率應低於 10%
    errors: ['rate<0.1'],             // 自定義錯誤率應低於 10%
  },
};

// 模擬不同的學生 ID
const studentIds = [
  'student_001',
  'student_002',
  'student_003',
  'student_004',
  'student_005',
  'student_006',
  'student_007',
  'student_008',
  'student_009',
  'student_010',
  null, // 測試沒有 student_id 的情況
];

// 模擬不同的日期
const dates = [
  '2025-01-01',
  '2025-01-02',
  '2025-01-03',
  null, // 測試沒有 date 的情況（使用今天）
];

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

export default function () {
  // 隨機選擇參數
  const studentId = studentIds[Math.floor(Math.random() * studentIds.length)];
  const date = dates[Math.floor(Math.random() * dates.length)];

  // 建構 URL
  let url = `${BASE_URL}/api/get-leaderboard?`;
  const params = [];

  if (studentId) {
    params.push(`student_id=${studentId}`);
  }
  if (date) {
    params.push(`date=${date}`);
  }

  url += params.join('&');

  // 發送請求
  const response = http.get(url, {
    tags: { name: 'GetLeaderboard' },
  });

  // 檢查回應
  const checkResult = check(response, {
    '狀態碼是 200': (r) => r.status === 200,
    '回應時間 < 500ms': (r) => r.timings.duration < 500,
    '回應時間 < 1000ms': (r) => r.timings.duration < 1000,
    '有 groupList': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.groupList !== undefined;
      } catch (e) {
        return false;
      }
    },
    '有 personalList': (r) => {
      try {
        const body = JSON.parse(r.body);
        return body.personalList !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  // 記錄錯誤
  errorRate.add(!checkResult);

  // 模擬使用者思考時間（1-3秒隨機延遲）
  sleep(Math.random() * 2 + 1);
}

// 測試結束後執行
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
  };
}

function textSummary(data, options) {
  const indent = options.indent || '';
  const enableColors = options.enableColors || false;

  let summary = '\n' + indent + '壓力測試總結\n';
  summary += indent + '='.repeat(50) + '\n\n';

  // 基本統計
  summary += indent + `總請求數: ${data.metrics.http_reqs.values.count}\n`;
  summary += indent + `失敗請求數: ${data.metrics.http_req_failed.values.passes}\n`;
  summary += indent + `錯誤率: ${(data.metrics.http_req_failed.values.rate * 100).toFixed(2)}%\n\n`;

  // 回應時間統計
  summary += indent + '回應時間統計:\n';
  summary += indent + `  平均: ${data.metrics.http_req_duration.values.avg.toFixed(2)}ms\n`;
  summary += indent + `  最小: ${data.metrics.http_req_duration.values.min.toFixed(2)}ms\n`;
  summary += indent + `  最大: ${data.metrics.http_req_duration.values.max.toFixed(2)}ms\n`;
  summary += indent + `  p(90): ${data.metrics.http_req_duration.values['p(90)'].toFixed(2)}ms\n`;
  summary += indent + `  p(95): ${data.metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  summary += indent + `  p(99): ${data.metrics.http_req_duration.values['p(99)'].toFixed(2)}ms\n\n`;

  // 吞吐量
  summary += indent + `請求率: ${data.metrics.http_reqs.values.rate.toFixed(2)} 請求/秒\n`;

  return summary;
}
