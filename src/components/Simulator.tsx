'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import Engine from '@/lib/engine.js';
import { useMode } from './ModeToggle';
import MoneyInput from './MoneyInput';

export type SimProduct = { key: string; label: string; cat: string; currency: 'USD' | 'KRW'; first: string; last: string; kind: 'US' | 'KR'; review: boolean };
type Slot = { k: string; w: number };
const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const won = (v: number | null | undefined) => (v == null || !isFinite(v) ? '자료 부족' : `${v < 0 ? '-' : ''}${Math.round(Math.abs(v)).toLocaleString('ko-KR')}원`);
const pct = (v: number | null | undefined, d = 1) => (v == null || !isFinite(v) ? '자료 부족' : `${(v * 100).toFixed(d)}%`);
const man = (v: number) => `${Math.round(v / 1e4).toLocaleString('ko-KR')}만`;

function LineChart({ x, lines }: { x: string[]; lines: { y: (number | null)[]; color: string; dash?: string; w?: number }[] }) {
  const W = 800, H = 300, pl = 62, pr = 10, pt = 10, pb = 24;
  const all = lines.flatMap((l) => l.y.filter((v): v is number => v != null));
  const mn = Math.min(...all), mx = Math.max(...all), sp = mx - mn || 1;
  const X = (i: number) => pl + ((W - pl - pr) * i) / Math.max(1, x.length - 1), Y = (v: number) => H - pb - ((H - pt - pb) * (v - mn)) / sp;
  const ticks = [0, 1, 2, 3, 4].map((i) => mn + (sp * i) / 4);
  return (
    <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label="월별 누적 납입금과 평가액 그래프" style={{ width: '100%', height: 300, background: 'var(--card2)', borderRadius: 12 }}>
      {ticks.map((t) => (<g key={t}><line x1={pl} x2={W - pr} y1={Y(t)} y2={Y(t)} stroke="#2a3550" /><text x={4} y={Y(t) + 4} fill="#a3aec6" fontSize="11">{man(t)}</text></g>))}
      {[0, 1, 2, 3, 4].map((i) => { const k = Math.round(((x.length - 1) * i) / 4); return <text key={i} x={Math.min(X(k) - 20, W - 70)} y={H - 6} fill="#a3aec6" fontSize="11">{x[k]}</text>; })}
      {lines.map((l, li) => { let d = '', on = false; l.y.forEach((v, i) => { if (v == null) { on = false; return; } d += `${on ? 'L' : 'M'}${X(i).toFixed(1)},${Y(v).toFixed(1)}`; on = true; }); return <path key={li} d={d} fill="none" stroke={l.color} strokeWidth={l.w ?? 1.8} strokeDasharray={l.dash} />; })}
    </svg>
  );
}

export default function Simulator({ products }: { products: SimProduct[] }) {
  const byKey = useMemo(() => Object.fromEntries(products.map((p) => [p.key, p])), [products]);
  const mode = useMode();
  const [slots, setSlots] = useState<Slot[]>([{ k: 'VOO', w: 100 }, { k: '', w: 0 }, { k: '', w: 0 }]);
  const [monthly, setMonthly] = useState(1000000), [lump, setLump] = useState(0);
  const [reinvest, setReinvest] = useState('1'), [fee, setFee] = useState(0), [spread, setSpread] = useState(0);
  const [start, setStart] = useState(''), [end, setEnd] = useState('');
  const [acct, setAcct] = useState('g'), [ccy, setCcy] = useState('krw');
  const [msg, setMsg] = useState(''), [busy, setBusy] = useState(false);
  const [res, setRes] = useState<any>(null);
  const cache = useRef<Record<string, any>>({}); const fxRef = useRef<any>(null);

  const chosen = slots.filter((s) => s.k);
  const defStart = chosen.length ? chosen.map((s) => byKey[s.k].first).sort().pop()! : '';
  const defEnd = chosen.length ? chosen.map((s) => byKey[s.k].last).sort()[0] : '';
  useEffect(() => { setStart(defStart); setEnd(defEnd); }, [defStart, defEnd]);

  const setSlot = (i: number, k: string) => {
    if (k && slots.some((s, j) => j !== i && s.k === k)) { setMsg('같은 상품을 중복 선택할 수 없습니다.'); return; }
    const n = slots.map((s, j) => (j === i ? { ...s, k } : s)); const c = n.filter((s) => s.k); const b = Math.floor(100 / (c.length || 1));
    let first = true; c.forEach((s) => { s.w = first ? 100 - b * (c.length - 1) : b; first = false; }); n.filter((s) => !s.k).forEach((s) => (s.w = 0)); setSlots(n); setMsg('');
  };
  const wsum = chosen.reduce((a, s) => a + s.w, 0);

  async function load(k: string) {
    if (cache.current[k]) return cache.current[k];
    const r = await fetch(`${BASE}/data/products/${k.toLowerCase()}.json`); const j = await r.json(); const p = byKey[k];
    cache.current[k] = { ...j, currency: p.currency, first: p.first, last: p.last, kind: p.kind }; return cache.current[k];
  }
  async function run() {
    setMsg('');
    if (!chosen.length) return setMsg('ETF를 선택하세요.');
    if (wsum !== 100) return setMsg('비중 합계를 100%로 맞춰주세요.');
    if (start < defStart) return setMsg(`시작일이 선택 상품 최초 거래일(${defStart})보다 빠릅니다. 상장 이전 구간은 실제 결과로 표시하지 않습니다.`);
    if (monthly <= 0 && lump <= 0) return setMsg('월 투자금 또는 일시금을 입력하세요.');
    setBusy(true);
    try {
      if (!fxRef.current) fxRef.current = await (await fetch(`${BASE}/data/fx.json`)).json();
      const D: any = { products: {}, fx: fxRef.current };
      for (const s of chosen) D.products[s.k] = await load(s.k);
      const sel = chosen.map((s) => ({ k: s.k, w: s.w / 100 })); const o = { monthly, lump, start, end, reinvest: reinvest === '1', fee, spread };
      const r = Engine.run(D, sel, o); if (r.error) { setMsg(r.error); setBusy(false); return; }
      const l = Engine.run(D, sel, { ...o, monthly: 0, lump: r.summary.principal });
      setRes({ r, l, sel, o, D });
    } catch (e) { setMsg('데이터를 불러오지 못했습니다. 잠시 후 다시 시도하세요.'); }
    setBusy(false);
  }
  useEffect(() => { if (start && end && !res) run(); /* 최초 1회 */ }, [start, end]); // eslint-disable-line

  const dl = (name: string, text: string) => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob(['\ufeff' + text], { type: 'text/csv' })); a.download = name; a.click(); };
  const s = res?.r.summary; const det = mode === 'detail';
  const fxAt = (d: string) => { const f = fxRef.current; const i = Engine.bsLE(f.d, d); return f.r[i]; };

  return (
    <div>
      <p className="hint">위쪽의 <b>간단하게 보기 / 상세하게 보기</b>를 바꾸면 결과 화면의 깊이가 달라집니다. 같은 데이터·같은 계산입니다.</p>
      <div className="card" style={{ marginTop: 12 }}>
        <div className="grid g2">
          <div>
            <label>ETF 선택 (최대 3종, 비중 합 100%)</label>
            {slots.map((s, i) => (
              <div className="pickrow" key={i}>
                <select aria-label={`ETF ${i + 1}`} value={s.k} onChange={(e) => setSlot(i, e.target.value)} style={{ flex: 1 }}>
                  <option value="">(선택 안 함)</option>
                  {Array.from(new Set(products.map((p) => p.cat))).map((c) => (<optgroup key={c} label={c}>{products.filter((p) => p.cat === c).map((p) => <option key={p.key} value={p.key}>{p.label}{p.kind === 'KR' ? ` · ${p.key}` : ''}</option>)}</optgroup>))}
                </select>
                <input type="number" aria-label={`비중 ${i + 1}`} min={0} max={100} value={s.w} onChange={(e) => setSlots(slots.map((x, j) => (j === i ? { ...x, w: +e.target.value } : x)))} />%
              </div>))}
            <div className="mut">{wsum !== 100 ? <span className="bad">비중 합계 {wsum}% (100%여야 함) </span> : null}{chosen.length ? `선택 상품 공통 최초일: ${defStart}` : ''}{chosen.some((x) => byKey[x.k].review) ? ' · 분배금 불일치 검토 상품 포함' : ''}</div>
          </div>
          <div className="grid g2" style={{ alignContent: 'start' }}>
            <div><label>월 투자금 (원)</label><MoneyInput value={monthly} onChange={setMonthly} label="월 투자금" /></div>
            <div><label>최초 일시금 (원, 선택)</label><MoneyInput value={lump} onChange={setLump} label="최초 일시금" /></div>
            <div><label>시작일</label><input type="date" value={start} onChange={(e) => setStart(e.target.value)} /></div>
            <div><label>종료일</label><input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /></div>
            <div><label>분배금 처리</label><select value={reinvest} onChange={(e) => setReinvest(e.target.value)}><option value="1">재투자 (배당락일 종가)</option><option value="0">현금 보유 (이자 없음)</option></select></div>
            <div><label>적립일 규칙</label><select disabled><option>매월 첫 공통 거래일</option></select></div>
            <div><label>계좌 유형</label><select value={acct} onChange={(e) => setAcct(e.target.value)}><option value="g">일반계좌</option><option value="isa">중개형 ISA</option><option value="pen">연금저축·IRP</option></select></div>
            <div><label>표시 통화</label><select value={ccy} onChange={(e) => setCcy(e.target.value)}><option value="krw">원화</option><option value="usd">원화 + 달러 환산 보조</option></select></div>
            {det ? (<><div><label>거래 수수료 (%, 가정)</label><input type="number" value={fee} step={0.01} min={0} onChange={(e) => setFee(+e.target.value)} /></div><div><label>환전 스프레드 (%, 가정, USD 상품)</label><input type="number" value={spread} step={0.05} min={0} onChange={(e) => setSpread(+e.target.value)} /></div></>) : null}
          </div>
        </div>
        <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <button className="btn" onClick={run} disabled={busy}>{busy ? '계산 중…' : '계산'}</button>
          <button className="btn sec" disabled={!res} onClick={() => dl('etf_dca_value.csv', Engine.toCSV(res.r))}>평가액 CSV</button>
          {det ? <button className="btn sec" disabled={!res} onClick={() => dl('etf_dca_trades.csv', Engine.tradesCSV(res.r))}>거래내역 CSV</button> : null}
          <span className="mut" role="status">{msg}</span>
        </div>
        {det ? <p className="mut">수수료·스프레드 기본값은 0(미반영)입니다. 소수점 매수, 잔여 현금 없음 가정. 분배금은 세전.</p> : null}
      </div>

      {res ? (<>
        {acct !== 'g' ? <div className="banner" style={{ marginTop: 14 }}><span className="tag wait">세후 계산 미지원(기준 검증 필요)</span> 선택한 계좌 유형의 세금·한도는 검증된 세법 모듈 도입 전까지 반영하지 않습니다. 아래는 계좌와 무관한 세전 결과입니다.</div> : null}
        {!det ? (
          <div className="card" style={{ marginTop: 14, borderColor: '#2b5c93' }}><b>한 줄 요약</b>
            <div style={{ fontSize: 17, marginTop: 4 }}>{won(s.principal)}을 넣어 {won(s.value)}이 됐고({s.profit >= 0 ? '+' : ''}{won(s.profit)}), 가장 힘들었을 때는 넣은 돈보다 {won(Math.abs(s.worstLossAmt))}({pct(Math.abs(s.worstLossPct))}) 적었습니다{s.worstLossAmt ? ` (${s.worstLossAmtDate})` : ''}.</div>
            <div className="mut">과거 데이터 기준 · 세전 · 미래를 보장하지 않습니다. 더 자세한 숫자는 “상세하게 보기”에서 볼 수 있습니다.</div></div>
        ) : null}
        <div className="card" style={{ marginTop: 14 }}>
          <span className="tag hist">과거 데이터 기반 계산</span><span className="tag">세전</span><span className="tag">분배금 {res.o.reinvest ? '재투자' : '현금보유'}</span><span className="tag">{s.start} ~ {s.end}</span>
          <div className="grid g4" style={{ marginTop: 12 }}>
            <div className="kpi"><div className="l">누적 납입원금</div><div className="v">{won(s.principal)}</div></div>
            <div className="kpi"><div className="l">평가액</div><div className="v">{won(s.value)}</div></div>
            <div className="kpi"><div className="l">손익</div><div className={`v ${s.profit >= 0 ? 'good' : 'bad'}`}>{won(s.profit)}</div></div>
            <div className="kpi"><div className="l">납입금 대비 수익률</div><div className={`v ${s.ret >= 0 ? 'good' : 'bad'}`}>{pct(s.ret)}</div><div className="s">단순 누적 · XIRR과 다름</div></div>
            <div className="kpi"><div className="l">최악 손실 경험(금액)</div><div className={`v ${s.worstLossAmt < 0 ? 'bad' : ''}`}>{won(s.worstLossAmt)}</div><div className="s">{s.worstLossAmt ? s.worstLossAmtDate : '원금 미달 없음'}</div></div>
            <div className="kpi"><div className="l">최악 손실 경험(납입금 대비)</div><div className={`v ${s.worstLossPct < 0 ? 'bad' : ''}`}>{pct(s.worstLossPct)}</div><div className="s">{s.worstLossPct ? s.worstLossPctDate : ''}</div></div>
            {det ? (<>
              <div className="kpi"><div className="l">XIRR(연환산)</div><div className="v">{pct(s.xirr)}</div></div>
              <div className="kpi"><div className="l">분배금 합계(세전)</div><div className="v">{won(s.divTotal)}</div></div>
              <div className="kpi"><div className="l">비용(수수료·스프레드)</div><div className="v">{won(s.costTotal)}</div><div className="s">입력 가정값</div></div>
              <div className="kpi"><div className="l">계좌 평가액 낙폭</div><div className="v bad">{pct(s.acctDD)}</div><div className="s">{s.acctDDDate} · ETF MDD와 별개</div></div>
            </>) : null}
          </div>
          <h3 style={{ marginTop: 14 }}>월별 누적 납입금 vs 평가액</h3>
          <LineChart x={res.r.series.map((v: any) => v.d)} lines={(() => { const lm: Record<string, number> = {}; res.l.series.forEach((v: any) => (lm[v.d] = v.value)); const xs = res.r.series.map((v: any) => v.d); return [
            { y: res.r.series.map((v: any) => v.principal), color: '#a3aec6', dash: '4 4' }, { y: res.r.series.map((v: any) => v.value), color: '#6db3ff', w: 2.2 }, { y: xs.map((d: string) => lm[d] ?? null), color: '#ffc857', w: 1.2 }]; })()} />
          <div className="legend"><span><i style={{ background: '#a3aec6' }} />누적 납입원금</span><span><i style={{ background: '#6db3ff' }} />계좌 평가액</span><span><i style={{ background: '#ffc857' }} />일시금 투입 시 평가액(참고)</span></div>
        </div>
        <div className="card" style={{ marginTop: 14 }}>
          <h3>적립식 vs 일시금 <span className="tag hist">과거 데이터 기반 계산</span></h3>
          <div className="mut">동일 기간·동일 총 납입액({won(s.principal)})을 비교하되 <b>자금 가용 조건이 다릅니다</b>.</div>
          <div className="grid g2" style={{ marginTop: 8 }}>
            <div className="kpi"><div className="l">A. 초기 목돈 보유 → 시작일 전액 투자</div><div className="v">{won(res.l.summary.value)}</div><div className="s">수익률 {pct(res.l.summary.ret)}{det ? ` · XIRR ${pct(res.l.summary.xirr)}` : ''}</div></div>
            <div className="kpi"><div className="l">B. 매달 신규 현금 유입 → 적립식</div><div className="v">{won(s.value)}</div><div className="s">수익률 {pct(s.ret)}{det ? ` · XIRR ${pct(s.xirr)}` : ''}</div></div>
          </div>
          <div className="mut" style={{ marginTop: 6 }}>B 상황에서는 시작일에 목돈이 없으므로 A는 현실적 대안이 아닌 참고치입니다.</div>
        </div>
        <div className="card" style={{ marginTop: 14 }}>
          <h3>위험·회복 <span className="tag hist">과거 데이터 기반 계산</span></h3>
          <div className="tbl"><table><thead><tr><th>ETF</th><th>가격 MDD(현지)</th><th>최고점→저점</th><th>최고가 회복</th>{det ? <><th>MDD(원화환산)</th><th>최악 월간</th><th>최악 12개월</th></> : null}</tr></thead><tbody>
            {res.r.etf.map((e: any) => (<tr key={e.k}><th scope="row">{byKey[e.k].label}</th><td className="bad">{pct(e.local.mdd)}</td><td>{e.local.peakDate} → {e.local.troughDate}</td><td>{e.local.recoveryDate ? `${e.local.recoveryDate} (저점 후 ${e.local.recoveryDays}일)` : '기간 내 미회복'}</td>
              {det ? <><td className="bad">{pct(e.krw.mdd)}</td><td>{e.monthly.worstMonth ? `${pct(e.monthly.worstMonth.r)} (${e.monthly.worstMonth.d.slice(0, 7)})` : '자료 부족'}</td><td>{e.monthly.worst12m ? `${pct(e.monthly.worst12m.r)} (~${e.monthly.worst12m.d.slice(0, 7)})` : '자료 부족(12개월 미만)'}</td></> : null}</tr>))}</tbody></table></div>
          <h3 style={{ marginTop: 12 }}>내 적립식 계좌 — 원금 미달 구간</h3>
          <div className="tbl"><table><thead><tr><th>미달 시작</th><th>해소(원금 회복)</th><th>지속(일)</th><th>구간 내 최악 손실</th></tr></thead><tbody>
            {s.underwater.length ? s.underwater.map((u: any, i: number) => (<tr key={i}><td>{u.start}</td><td>{u.end ?? '미해소'}</td><td>{Math.round(u.days)}</td><td>{won(u.worst)} ({pct(u.worstPct)})</td></tr>)) : <tr><td colSpan={4}>원금 미달 구간 없음</td></tr>}</tbody></table></div>
          <div className="mut">‘원금 회복’ = 평가액이 같은 시점까지의 누적 납입원금 이상이 된 첫 거래일. ETF MDD와 계좌 낙폭은 별개의 지표입니다.</div>
        </div>
        {ccy === 'usd' ? (() => {
          const us = res.r.trades.filter((t: any) => byKey[t.k].currency === 'USD');
          if (!us.length) return <div className="card" style={{ marginTop: 14 }}><b>달러 환산 보조</b><div className="mut">선택한 상품에 미국 상장(USD) 상품이 없어 표시하지 않습니다(자료 부족).</div></div>;
          const usd = us.reduce((a: number, t: any) => a + t.krw / fxAt(t.date), 0), krw = us.reduce((a: number, t: any) => a + t.krw, 0), fe = fxAt(s.end);
          return (<div className="card" style={{ marginTop: 14 }}><b>달러 환산 보조</b> <span className="tag hist">USD 상품분만</span><div className="grid g4" style={{ marginTop: 8 }}>
            <div className="kpi"><div className="l">평균 매수 환율</div><div className="v">{(krw / usd).toFixed(1)}원</div></div><div className="kpi"><div className="l">종료일 환율</div><div className="v">{fe.toFixed(1)}원</div><div className="s">{s.end} · ECB</div></div>
            <div className="kpi"><div className="l">환율 영향(단순)</div><div className="v">{pct(fe / (krw / usd) - 1)}</div><div className="s">평균 매수환율 대비</div></div></div><div className="mut">원화 계좌 기준이 본 결과이며 이 패널은 환율 영향을 이해하기 위한 보조 표시입니다.</div></div>);
        })() : null}
        {det ? (<div className="card" style={{ marginTop: 14 }}><h3>계산 근거</h3><div className="mut">매수수량 = (납입액−수수료)×(1−환전스프레드)/환율/매수가격 (KRW 상품은 환율 생략) · 평가액 = Σ보유수량×종가×환율 + 현금 · 거래 {res.r.trades.length}건(분배금 재투자 {res.r.trades.filter((t: any) => t.kind === 'div').length}건) · 적립일: 매월 첫 공통 거래일 · 최종 보유수량: {Object.entries(s.shares).map(([k, v]: any) => `${k} ${v.toFixed(4)}주`).join(', ')}</div></div>) : null}
      </>) : null}
    </div>
  );
}
