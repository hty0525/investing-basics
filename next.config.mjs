const isProd = process.env.NODE_ENV === 'production';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? (isProd ? '/investing-basics' : '');
/** @type {import('next').NextConfig} */
export default {
  output: 'export',          // 정적 HTML만 생성 — 서버 런타임 없음
  trailingSlash: true,       // GitHub Pages 호환 (/page/ → /page/index.html)
  basePath,
  assetPrefix: basePath || undefined,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  reactStrictMode: true,
};
