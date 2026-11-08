import Engine from './engine.js';
import { engineData, P } from './data';
import { FX_START } from './stats';

export type Dist = { min: number; p25: number; median: number; p75: number; max: number };
export type RollWin = {
  years: number; n: number; firstStart: string; lastStart: string;
  ret: Dist; xirr: Dist | null; worstLoss: Dist; belowShare: number; endBelow: number;
  worstStart: { d: string; ret: number }; bestStart: { d: string; ret: number };
};
const q = (a: number[], p: number) => { const s = [...a].sort((x, y) => x - y); const i = (s.length - 1) * p; const lo = Math.floor(i), hi = Math.ceil(i); return s[lo] + (s[hi] - s[lo]) * (i - lo); };
const dist = (a: number[]): Dist => ({ min: Math.min(...a), p25: q(a, 0.25), median: q(a, 0.5), p75: q(a, 0.75), max: Math.max(...a) });
const addYears = (d: string, y: number) => { const t = new Date(d); t.setFullYear(t.getFullYear() + y); return t.toISOString().slice(0, 10); };
const memo: Record<string, RollWin[]> = {};

/** 월 100만원 적립 · 분배금 재투자 · 원화 기준 · 세전. 시작월마다 N년 적립한 결과. */
export function rolling(k: string, windows = [3, 5, 10]): RollWin[] {
  if (memo[k]) return memo[k];
  const m = P(k); const D = engineData([k]);
  const base = m.first < FX_START ? FX_START : m.first;
  const out: RollWin[] = [];
  for (const y of windows) {
    const rets: number[] = [], xs: number[] = [], worst: number[] = [], starts: string[] = []; let below = 0, endBelow = 0, cnt = 0;
    const s = (D.products[k] as { d: string[] }).d;
    let lastMonth = '';
    for (const d of s) {
      if (d < base) continue; const ym = d.slice(0, 7); if (ym === lastMonth) continue; lastMonth = ym;
      const end = addYears(d, y); if (end > m.last) break;
      const r = Engine.run(D, [{ k, w: 1 }], { monthly: 1e6, lump: 0, start: d, end, reinvest: true, fee: 0, spread: 0 });
      if (r.error) continue;
      cnt++; rets.push(r.summary.ret); if (r.summary.xirr != null) xs.push(r.summary.xirr); worst.push(r.summary.worstLossPct);
      if (r.summary.underwater.length) below++; if (r.summary.value < r.summary.principal) endBelow++; starts.push(d);
    }
    if (cnt < 12) continue; // 표본이 12개월 미만이면 표시하지 않음 (자료 부족)
    const iw = rets.indexOf(Math.min(...rets)), ib = rets.indexOf(Math.max(...rets));
    out.push({ years: y, n: cnt, firstStart: starts[0], lastStart: starts[starts.length - 1], ret: dist(rets), xirr: xs.length ? dist(xs) : null, worstLoss: dist(worst), belowShare: below / cnt, endBelow: endBelow / cnt, worstStart: { d: starts[iw], ret: rets[iw] }, bestStart: { d: starts[ib], ret: rets[ib] } });
  }
  return (memo[k] = out);
}
