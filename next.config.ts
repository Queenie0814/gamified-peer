import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        // 匹配所有圖片檔案
        source: '/:all*(svg|jpg|jpeg|png|gif|webp|ico)',
        headers: [
          {
            key: 'Cache-Control',
            // 開發環境：不緩存，每次都重新驗證
            // 如果要啟用緩存，可改為 'public, max-age=31536000, immutable'
            value: 'public, max-age=0, must-revalidate',
          },
        ],
      },
    ];
  },
};

export default nextConfig;
