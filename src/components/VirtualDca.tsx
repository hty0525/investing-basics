'use client';
import { useMemo, useState } from 'react';
const PATHS: Record<string, [string, (m: number) => number]> = {
  rise: ['꾸준한 상승 (가정)', (m) => 1 + 0.012 * m + 0.03 * Math.sin(m / 3)],
  dip: ['하락 후 반등 (가정)', (m) => (m < 12 ? 1 - 0.025 * m : 0.7 + 0.03 * (m - 12))],
  flat: ['장기 횡보 (가정)', (m) => 1 + 0.08 * Math.sin(m / 5)],
  fall: ['지속 하락 (가정)', (m) => Math.max(0.2, 1 - 0.012 * m + 0.02 * Math.sin(m / 3))],
  spike: ['급등 후 급락 (가정)', (m) => (m < 18 ? 1 + 0.03 * m : Math.max(0.3, 1.54 - 0.04 * (m - 18)))],
};
const won = (v: number) => `${Math.round(v).toLocaleString('ko-KR')}원`;
export default function VirtualDca() {
  const [p, setP] = useState('dip'), [a, setA] = useState(1000000), [M, setM] = useState(36);
  const r = useMemo(() => {
    const f = PATHS[p][1]; let sh = 0, pr = 0; const dca: number[] = [], inv: number[] = [], lump: number[] = [];
    const total = a * M, ls = total / f(0);
    for (let m = 0; m < M; m++) { const px = f(m); sh += a / px; pr += a; dca.push(sh * px); inv.push(pr); lump.push(ls * px); }
    return { dca, inv, lump, total };
  }, [p, a, M]);
  const W = 640, H = 220, all = [...r.dca, ...r.inv, ...r.lump], mn = Math.min(...all), mx = Math.max(...all), sp = mx - mn || 1;
  const X = (i: number) => 10 + ((W - 20) * i) / Math.max(1, M - 1), Y = (v: number) => H - 10 - ((H - 20) * (v - mn)) / sp;
  const path = (ys: number[]) => ys.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join('');
  return (
    <div className="sim-box">
      <span className="tag sim">미래 가정 시나리오 · 실제 데이터 아님</span>
      <h3 style={{ margin: '8px 0' }}>가상 가격 경로로 보는 “적립식 vs 일시금”</h3>
      <div className="grid g3">
        <div><label htmlFor="vp">가상 경로</label><select id="vp" value={p} onChange={(e) => setP(e.target.value)}>{Object.entries(PATHS).map(([k, v]) => <option key={k} value={k}>{v[0]}</option>)}</select></div>
        <div><label htmlFor="va">월 적립금 (원)</label><input id="va" type="number" step={100000} value={a} onChange={(e) => setA(+e.target.value)} /></div>
        <div><label htmlFor="vm">기간 (개월)</label><input id="vm" type="number" min={6} max={120} value={M} onChange={(e) => setM(Math.min(120, Math.max(6, +e.target.value)))} /></div>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="가상 경로 적립식 대 일시금 그래프" style={{ width: '100%', height: 220, marginTop: 10 }}>
        <path d={path(r.inv)} fill="none" stroke="#a3aec6" strokeDasharray="4 4" /><path d={path(r.dca)} fill="none" stroke="#c792ff" strokeWidth="2" /><path d={path(r.lump)} fill="none" stroke="#ffc857" strokeWidth="2" />
      </svg>
      <div className="legend"><span><i style={{ background: '#a3aec6' }} />누적 납입원금</span><span><i style={{ background: '#c792ff' }} />적립식 평가액(가정)</span><span><i style={{ background: '#ffc857' }} />일시금 평가액(가정)</span></div>
      <p>납입원금 {won(r.inv[M - 1])} · 적립식 {won(r.dca[M - 1])} ({((r.dca[M - 1] / r.inv[M - 1] - 1) * 100).toFixed(1)}%) · 일시금 {won(r.lump[M - 1])} ({((r.lump[M - 1] / r.total - 1) * 100).toFixed(1)}%)</p>
      <p className="mut">가상 경로는 설명용으로 임의 생성한 값이며 어떤 실제 ETF의 과거·미래도 나타내지 않습니다. 일시금은 시작일에 전체 자금이 있는 경우(자금 가용 조건이 다름)입니다.</p>
    </div>
  );
}
