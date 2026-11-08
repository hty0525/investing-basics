import Engine from './engine.js';
import { engineData, loadSeries, loadFx, P } from './data';

const dayDiff = (a: string, b: string) => (Date.parse(b) - Date.parse(a)) / 86400000;
export const FX_START = '2010-01-04';

export function sliceSeries(k: string, start: string, end: string) {
  const s = loadSeries(k); const d: string[] = [], c: number[] = [];
  s.d.forEach((x, i) => { if (x >= start && x <= end) { d.push(x); c.push(s.c[i]); } });
  return { d, c };
}
export function totalReturn(k: string, start: string, end: string) {
  const s = loadSeries(k); const idx: number[] = [];
  s.d.forEach((x, i) => { if (x >= start && x <= end) idx.push(i); });
  if (idx.length < 2) return null;
  const c0 = s.c[idx[0]]; let sh = 1; const dm: Record<number, number> = {};
  Object.entries(s.div).forEach(([d, a]) => {
    if (d > s.d[idx[0]] && d <= s.d[idx[idx.length - 1]]) { const j = idx.find((i) => s.d[i] >= d); if (j !== undefined) dm[j] = (dm[j] || 0) + a; }
  });
  idx.forEach((i) => { if (dm[i]) sh += (sh * dm[i]) / s.c[i]; });
  const cl = s.c[idx[idx.length - 1]];
  const dts = idx.map((i) => s.d[i]), px = idx.map((i) => s.c[i]);
  return { price: cl / c0 - 1, total: (sh * cl) / c0 - 1, mdd: Engine.mdd(dts, px) as Mdd, days: dayDiff(dts[0], dts[dts.length - 1]), start: dts[0], end: dts[dts.length - 1] };
}
export type Mdd = { mdd: number; peakDate: string; troughDate: string; recoveryDate: string | null; recoveryDays: number | null; peakToRecoveryDays: number | null };

export function annVol(k: string, start: string, end: string) {
  const { c } = sliceSeries(k, start, end); if (c.length < 30) return null;
  const rs: number[] = []; for (let i = 1; i < c.length; i++) rs.push(Math.log(c[i] / c[i - 1]));
  const m = rs.reduce((a, b) => a + b, 0) / rs.length;
  return Math.sqrt(rs.reduce((a, b) => a + (b - m) ** 2, 0) / (rs.length - 1)) * Math.sqrt(252);
}
export function krwTotal(k: string, start: string, end: string) {
  const s = start < FX_START ? FX_START : start;
  const D = engineData([k]);
  const r = Engine.run(D, [{ k, w: 1 }], { monthly: 0, lump: 1e6, start: s, end, reinvest: true, fee: 0, spread: 0 });
  return r.error ? null : (r.summary.value / 1e6 - 1) as number;
}
/** 지난 N년 창 (상장 이전이면 null) */
export function horizon(k: string, years: number) {
  const m = P(k); const t = new Date(m.last); t.setFullYear(t.getFullYear() - years);
  const start = t.toISOString().slice(0, 10);
  if (start < m.first) return null;
  return totalReturn(k, start, m.last);
}
export function productStats(k: string) {
  const m = P(k);
  const all = totalReturn(k, m.first, m.last)!;
  const hz = [1, 3, 5, 10].map((y) => ({ y, r: horizon(k, y) }));
  const D = engineData([k]); const start = m.first < FX_START ? FX_START : m.first;
  const run = Engine.run(D, [{ k, w: 1 }], { monthly: 0, lump: 1e6, start, end: m.last, reinvest: true, fee: 0, spread: 0 });
  return {
    all, hz, vol: annVol(k, m.first, m.last),
    krwTotal: run.error ? null : (run.summary.value / 1e6 - 1) as number, krwStart: start,
    krwMdd: run.error ? null : (run.etf[0].krw as Mdd), month: run.error ? null : run.etf[0].monthly,
  };
}
export function lastPrice(k: string) { const s = loadSeries(k); return { d: s.d[s.d.length - 1], c: s.c[s.c.length - 1] }; }
export function recentDivs(k: string, n = 8) { const s = loadSeries(k); return Object.entries(s.div).slice(-n).reverse(); }

/** 서버 렌더 SVG 경로 (로그 스케일, 시작=100) */
export function sparkPath(k: string, w = 640, h = 180, pts = 220, start?: string) {
  const s = loadSeries(k); const i0 = start ? Math.max(0, s.d.findIndex((d) => d >= start)) : 0;
  const d = s.d.slice(i0), c = s.c.slice(i0); const step = Math.max(1, Math.floor(d.length / pts));
  const xs: number[] = [], ys: number[] = [];
  for (let i = 0; i < d.length; i += step) { xs.push(i); ys.push(Math.log(c[i] / c[0])); }
  xs.push(d.length - 1); ys.push(Math.log(c[c.length - 1] / c[0]));
  const mn = Math.min(...ys), mx = Math.max(...ys), sp = mx - mn || 1;
  const X = (i: number) => 8 + ((w - 16) * i) / (d.length - 1), Y = (v: number) => h - 8 - ((h - 16) * (v - mn)) / sp;
  return { path: xs.map((x, i) => `${i ? 'L' : 'M'}${X(x).toFixed(1)},${Y(ys[i]).toFixed(1)}`).join(''), from: d[0], to: d[d.length - 1], last: c[c.length - 1] / c[0] - 1 };
}
export function commonRange(keys: string[]) {
  return { start: keys.map((k) => P(k).first).sort().pop()!, end: keys.map((k) => P(k).last).sort()[0] };
}
export { loadFx };
