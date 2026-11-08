export const SITE_NAME = '투자 기초 — 적립식·ETF 이해 대시보드';
export const SITE_SHORT = 'investing-basics';
export const SITE_ORIGIN = 'https://hty0525.github.io';
export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
export const SITE_URL = SITE_ORIGIN + BASE_PATH;
export const DESCRIPTION =
  '적립식 투자와 ETF를 추천이 아닌 비교로 이해하는 교육용 대시보드. 미국·국내 상장 ETF 41종의 수익률·최대낙폭·회복기간·환율·분배금을 검증 가능한 과거 데이터로 보여줍니다.';
export const abs = (path: string) => `${SITE_URL}${path}`;
export const LAST_REVIEW = '2026-11-08';
