'use client';
import { useMemo, useState } from 'react';
import Link from 'next/link';
import MoneyInput from './MoneyInput';
import { useMode } from './ModeToggle';

export type RollD = { min: number; median: number; max: number };
export type RefRow = { key: string; label: string; since: number | null; sinceFrom: string; y5: number | null; r3: RollD | null; r5: RollD | null };
const won = (v: number) => `${v < 0 ? '-' : ''}${Math.round(Math.abs(v)).toLocaleString('ko-KR')}원`;
const eok = (v: number) => (Math.abs(v) >= 1e8 ? `${(v / 1e8).toFixed(2)}억원` : won(v));
const pc = (v: number) => `${(v * 100).toFixed(1)}%`;

/** 월초 납입 → 월말 복리. 월 수익률 = (1+연)^(1/12)-1 */
function sim(lump: number, monthly: number, years: number, annual: number, cost: number, infl: number) {
  const net = (1 + annual) * (1 - cost) - 1; const m = Math.pow(1 + net, 1 / 12) - 1; const n = Math.round(years * 12);
  let v = lump; const path: number[] = [v], inv: number[] = [lump]; let p = lump;
  for (let i = 0; i < n; i++) { v = (v + monthly) * (1 + m); p += monthly; path.push(v); inv.push(p); }
  const real = v / Math.pow(1 + infl, years);
  return { value: v, principal: p, profit: v - p, real, path, inv, n, m };
}
function needMonthly(goal: number, lump: number, years: number, annual: number, cost: number) {
  const net = (1 + annual) * (1 - cost) - 1; const m = Math.pow(1 + net, 1 / 12) - 1; const n = Math.round(years * 12);
  const fvLump = lump * Math.pow(1 + m, n); const fa = Math.abs(m) < 1e-12 ? n : ((Math.pow(1 + m, n) - 1) / m) * (1 + m);
  return Math.max(0, (goal - fvLump) / fa);
}

export default function Calculator({ refs }: { refs: RefRow[] }) {
  const mode = useMode(); const det = mode === 'detail';
  const [tab, setTab] = useState<'fv' | 'goal'>('fv');
  const [lump, setLump] = useState(0), [monthly, setMonthly] = useState(500000), [years, setYears] = useState(10);
  const [rate, setRate] = useState(5), [cost, setCost] = useState(0), [infl, setInfl] = useState(2);
  const [goal, setGoal] = useState(100000000);
  const [refKey, setRefKey] = useState('VOO');
  const r = useMemo(() => sim(lump, monthly, years, rate / 100, cost / 100, infl / 100), [lump, monthly, years, rate, cost, infl]);
  const SC = [-20, -10, -5, 0, 3, 5, 7, 10];
  const ref = refs.find((x) => x.key === refKey);
  const W = 640, H = 220, all = [...r.path, ...r.inv], mn = Math.min(...all), mx = Math.max(...all), sp = mx - mn || 1;
  const X = (i: number) => 8 + ((W - 16) * i) / Math.max(1, r.n), Y = (v: number) => H - 10 - ((H - 20) * (v - mn)) / sp;
  const path = (ys: number[]) => ys.map((v, i) => `${i ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`).join('');
  const zero = useMemo(() => sim(lump, monthly, years, 0, cost / 100, infl / 100).path, [lump, monthly, years, cost, infl]);
  const num = (set: (n: number) => void) => (e: React.ChangeEvent<HTMLInputElement>) => set(Number.isFinite(+e.target.value) ? +e.target.value : 0);

  return (
    <div>
      <div className="sim-box">
        <span className="tag sim">미래 가정 시나리오 · 예측이 아닙니다</span>
        <p className="mut" style={{ margin: '6px 0 0' }}>아래 수익률은 <b>제가 입력한 가정</b>일 뿐 이 사이트가 제시하는 기대수익률이 아닙니다. 실제 결과는 이 숫자보다 훨씬 좋거나 나쁠 수 있고 원금을 잃을 수도 있습니다.</p>
      </div>
      <div className="seg" style={{ margin: '12px 0' }} role="tablist"><button className={tab === 'fv' ? 'on' : ''} onClick={() => setTab('fv')}>얼마가 될까 (예상 금액)</button><button className={tab === 'goal' ? 'on' : ''} onClick={() => setTab('goal')}>목표까지 월 얼마 (역산)</button></div>
      <div className="card">
        <div className="grid g3">
          {tab === 'goal' ? <div><label htmlFor="cg">목표 금액 (원)</label><MoneyInput id="cg" value={goal} onChange={setGoal} /></div> : <div><label htmlFor="cm">월 적립금 (원)</label><MoneyInput id="cm" value={monthly} onChange={setMonthly} /></div>}
          <div><label htmlFor="cl">시작 일시금 (원, 선택)</label><MoneyInput id="cl" value={lump} onChange={setLump} /></div>
          <div><label htmlFor="cy">기간 (년)</label><input id="cy" type="number" inputMode="decimal" min={1} max={50} value={years} onChange={num((n) => setYears(Math.min(50, Math.max(1, n))))} /></div>
          <div><label htmlFor="cr">연 수익률 가정 (%)</label><input id="cr" type="number" inputMode="decimal" step={0.5} min={-50} max={50} value={rate} onChange={num(setRate)} /></div>
          {det ? <div><label htmlFor="cc">연 비용 (%, 선택)</label><input id="cc" type="number" inputMode="decimal" step={0.01} min={0} value={cost} onChange={num(setCost)} /></div> : null}
          {det ? <div><label htmlFor="ci">물가상승률 가정 (%, 선택)</label><input id="ci" type="number" inputMode="decimal" step={0.5} value={infl} onChange={num(setInfl)} /></div> : null}
        </div>
        {!det ? <p className="mut">더 자세한 입력(비용·물가)은 위쪽 “상세하게 보기”에서 켤 수 있습니다.</p> : null}
      </div>

      {tab === 'fv' ? (<>
        <div className="grid g4" style={{ marginTop: 14 }}>
          <div className="kpi"><div className="l">납입원금</div><div className="v">{eok(r.principal)}</div></div>
          <div className="kpi"><div className="l">예상 평가액 (가정 {rate}%)</div><div className="v">{eok(r.value)}</div></div>
          <div className="kpi"><div className="l">수익금</div><div className={`v ${r.profit >= 0 ? 'good' : 'bad'}`}>{eok(r.profit)}</div></div>
          <div className="kpi detail-only"><div className="l">물가 반영 실질 가치</div><div className="v">{eok(r.real)}</div><div className="s">물가 {infl}% 가정</div></div>
        </div>
        <div className="card" style={{ marginTop: 14 }}>
          <h3>시간에 따른 변화 <span className="tag sim">가정</span></h3>
          <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="가정 수익률 기준 납입원금과 평가액 그래프" style={{ width: '100%', height: 220, background: 'var(--card2)', borderRadius: 12 }}>
            <path d={path(r.inv)} fill="none" stroke="#a3aec6" strokeDasharray="4 4" /><path d={path(zero)} fill="none" stroke="#ffc857" strokeWidth="1.2" /><path d={path(r.path)} fill="none" stroke="#c792ff" strokeWidth="2.2" />
          </svg>
          <div className="legend"><span><i style={{ background: '#a3aec6' }} />납입원금</span><span><i style={{ background: '#ffc857' }} />수익률 0% 가정</span><span><i style={{ background: '#c792ff' }} />수익률 {rate}% 가정</span></div>
        </div>
        <div className="card" style={{ marginTop: 14 }}>
          <h3>좋을 때도, 나쁠 때도 — 수익률 가정별 결과</h3>
          <p className="mut">숫자 하나가 예측처럼 읽히지 않도록 <b>마이너스 가정까지</b> 나란히 보여줍니다. 연 −20%는 극단적인 가정이지만 실제 시장에서 한 해에 그 정도 떨어진 ETF도 있습니다(최대낙폭 참고). (월 {won(monthly)} · {years}년 · 일시금 {won(lump)})</p>
          <div className="tbl"><table><thead><tr><th>연 수익률 가정</th><th>예상 평가액</th><th>수익금</th><th className="detail-only">납입금 대비</th></tr></thead><tbody>
            {SC.map((a) => { const x = sim(lump, monthly, years, a / 100, cost / 100, infl / 100); return (<tr key={a}><th scope="row" className={a < 0 ? 'bad' : ''}>{a > 0 ? '+' : ''}{a}%{a < 0 ? ' (손실 가정)' : ''}</th><td>{eok(x.value)}</td><td className={x.profit >= 0 ? 'good' : 'bad'}>{eok(x.profit)}</td><td className="detail-only">{x.principal ? pc(x.profit / x.principal) : '-'}</td></tr>); })}</tbody></table></div>
        </div>
      </>) : (<>
        <div className="card" style={{ marginTop: 14 }}>
          <h3>목표 {eok(goal)} 을 {years}년 안에 만들려면 <span className="tag sim">가정</span></h3>
          <div className="tbl"><table><thead><tr><th>연 수익률 가정</th><th>필요한 월 적립금</th><th className="detail-only">총 납입액</th></tr></thead><tbody>
            {SC.map((a) => { const m = needMonthly(goal, lump, years, a / 100, cost / 100); return (<tr key={a}><th scope="row">{a > 0 ? '+' : ''}{a}%</th><td><b>{won(m)}</b></td><td className="detail-only">{eok(lump + m * years * 12)}</td></tr>); })}</tbody></table></div>
          <p className="mut">입력한 연 수익률 {rate}% 가정: 월 <b>{won(needMonthly(goal, lump, years, rate / 100, cost / 100))}</b> 필요. 가정이 틀리면 필요한 금액도 달라집니다.</p>
        </div>
      </>)}

      <div className="card" style={{ marginTop: 14 }}>
        <h3>참고: 이 ETF의 과거 연환산 수익률 <span className="tag hist">과거 데이터</span></h3>
        <p className="mut">가정 수익률을 정할 때 참고만 하세요. <b>과거 값은 미래의 기대수익률이 아닙니다.</b> 상장 이후 기간이 짧거나 상승기 중심이면 과대평가될 수 있습니다. (분배금 재투자 가정 · 현지통화 · 세전)</p>
        <div className="grid g3">
          <div><label htmlFor="rk">ETF</label><select id="rk" value={refKey} onChange={(e) => setRefKey(e.target.value)}>{refs.map((x) => <option key={x.key} value={x.key}>{x.label}</option>)}</select></div>
          <div className="kpi"><div className="l">상장 이후 연환산 ({ref?.sinceFrom}~)</div><div className="v">{ref?.since == null ? '자료 부족' : pc(ref.since)}</div></div>
          <div className="kpi"><div className="l">최근 5년 연환산</div><div className="v">{ref?.y5 == null ? '자료 부족' : pc(ref.y5)}</div></div>
        </div>
        <h3 style={{ marginTop: 14 }}>월 적립 시작 시점별 연환산 수익률(XIRR) — 최악·중앙·최고</h3>
        <div className="tbl"><table><thead><tr><th>적립 기간</th><th>최악 시작</th><th>중앙값</th><th>최고 시작</th></tr></thead><tbody>
          {[['3년', ref?.r3], ['5년', ref?.r5]].map(([n, d]) => { const x = d as RollD | null; return (<tr key={String(n)}><th scope="row">{String(n)}</th><td className={x && x.min < 0 ? 'bad' : ''}>{x ? pc(x.min) : '자료 부족'}</td><td>{x ? pc(x.median) : '자료 부족'}</td><td>{x ? pc(x.max) : '자료 부족'}</td></tr>); })}</tbody></table></div>
        <p className="mut">같은 ETF라도 <b>언제 시작했느냐</b>에 따라 이만큼 차이가 났습니다. 최악 시작 값이 마이너스면 그 시점에 시작한 사람은 실제로 손실을 봤다는 뜻입니다. 시작월이 겹치는 표본이라 독립 관측이 아닙니다.</p>
      </div>
      <p className="mut" style={{ marginTop: 10 }}>계산식: 월초 납입 후 월말에 복리 적용, 월 수익률 = (1 + 연 순수익률)^(1/12) − 1, 연 순수익률 = (1 + 가정 수익률) × (1 − 연 비용) − 1. 세금·환율·수수료는 반영하지 않습니다. 실제 과거 ETF 결과는 <Link href="/simulator/">시뮬레이터</Link> 와 <Link href="/rolling/">과거 롤링 결과</Link>에서 확인하세요.</p>
    </div>
  );
}
