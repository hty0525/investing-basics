export const pct = (v: number | null | undefined, d = 1) =>
  v == null || !isFinite(v) ? '자료 부족' : `${(v * 100).toFixed(d)}%`;
export const won = (v: number | null | undefined) =>
  v == null || !isFinite(v) ? '자료 부족' : `${v < 0 ? '-' : ''}${Math.round(Math.abs(v)).toLocaleString('ko-KR')}원`;
export const signCls = (v: number | null | undefined) => (v == null ? '' : v > 0 ? 'good' : v < 0 ? 'bad' : '');
