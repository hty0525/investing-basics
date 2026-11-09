'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';

type PriceSeries = { d: string[]; c: number[] };
type Period = '1M' | '3M' | '6M' | '1Y' | '3Y' | '5Y' | 'ALL';
type Props = { ticker: string; title: string; path: string; currency: 'USD' | 'KRW'; from: string; to: string; change: number; lastPrice: number };

const PERIODS: { id: Period; label: string; months: number }[] = [
  { id: '1M', label: '1개월', months: 1 }, { id: '3M', label: '3개월', months: 3 },
  { id: '6M', label: '6개월', months: 6 }, { id: '1Y', label: '1년', months: 12 },
  { id: '3Y', label: '3년', months: 36 }, { id: '5Y', label: '5년', months: 60 },
  { id: 'ALL', label: '전체', months: 0 },
];
const W = 720, H = 280, LEFT = 14, RIGHT = 98, TOP = 18, BOTTOM = 34;
const PW = W - LEFT - RIGHT, PH = H - TOP - BOTTOM;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
const money = (v: number, currency: Props['currency']) => v.toLocaleString('ko-KR', { minimumFractionDigits: currency === 'USD' ? 2 : 0, maximumFractionDigits: 2 });
const shortDate = (v: string, period: Period) => (period === '1M' || period === '3M' || period === '6M' ? v.slice(5) : v.slice(2, 7)).replace('-', '.');
// Axes use rounded, readable ticks; the readout always shows the original exact closing price.
const axisPrice = (v: number, currency: Props['currency']) => {
  if (currency === 'KRW' && Math.abs(v) >= 10000) {
    return (v / 10000).toLocaleString('ko-KR', { maximumFractionDigits: 1 }) + '만';
  }
  return v.toLocaleString('ko-KR', { maximumFractionDigits: Math.abs(v) >= 100 ? 0 : Math.abs(v) >= 10 ? 1 : 2 });
};
const niceStep = (rough: number) => {
  const magnitude = 10 ** Math.floor(Math.log10(Math.max(rough, 1e-9)));
  const unit = rough / magnitude;
  return (unit <= 1 ? 1 : unit <= 2 ? 2 : unit <= 2.5 ? 2.5 : unit <= 5 ? 5 : 10) * magnitude;
};

function periodStart(end: string, months: number) {
  const d = new Date(end + 'T00:00:00Z');
  const day = d.getUTCDate();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() - months);
  const lastDay = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + 1, 0)).getUTCDate();
  d.setUTCDate(Math.min(day, lastDay));
  return d.toISOString().slice(0, 10);
}
function firstIndex(dates: string[], target: string) {
  let lo = 0, hi = dates.length;
  while (lo < hi) { const mid = (lo + hi) >>> 1; if (dates[mid] < target) lo = mid + 1; else hi = mid; }
  return lo;
}

export default function PriceChart({ ticker, title, path, currency, from, to, change, lastPrice }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const [series, setSeries] = useState<PriceSeries | null>(null);
  const [period, setPeriod] = useState<Period>('1Y');
  const [trend, setTrend] = useState(true);
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setSeries(null); setSelected(null); setError(false);
    fetch(basePath + '/data/products/' + ticker.toLowerCase() + '.json', { signal: controller.signal })
      .then((r) => { if (!r.ok) throw new Error('price data unavailable'); return r.json() as Promise<PriceSeries>; })
      .then((data) => {
        if (!Array.isArray(data.d) || !Array.isArray(data.c) || data.d.length !== data.c.length || data.d.length < 2 ||
          data.c.some((n) => typeof n !== 'number' || !Number.isFinite(n) || n <= 0)) throw new Error('invalid price series');
        setSeries(data);
      })
      .catch((e: unknown) => { if (!(e instanceof Error && e.name === 'AbortError')) setError(true); });
    return () => controller.abort();
  }, [ticker]);

  const view = useMemo(() => {
    if (!series) return null;
    const last = series.d.length - 1;
    const spec = PERIODS.find((p) => p.id === period)!;
    const start = spec.months === 0 ? 0 : Math.min(last - 1, firstIndex(series.d, periodStart(series.d[last], spec.months)));
    const count = last - start + 1;
    const values = series.c.slice(start);
    const min = Math.min(...values), max = Math.max(...values);
    const pad = Math.max((max - min) * .1, max * .002);
    const tickStep = niceStep((max - min + pad * 2) / 4);
    const low = Math.max(0, Math.floor((min - pad) / tickStep) * tickStep);
    const high = Math.max(low + tickStep, Math.ceil((max + pad) / tickStep) * tickStep);
    const y = (price: number) => TOP + ((high - price) / (high - low)) * PH;
    const x = (i: number) => LEFT + ((i - start) / (count - 1)) * PW;
    const step = Math.max(1, Math.ceil(count / 480)), samples: number[] = [];
    for (let i = start; i <= last; i += step) samples.push(i);
    if (samples[samples.length - 1] !== last) samples.push(last);
    const line = samples.map((i, n) => (n ? 'L' : 'M') + x(i).toFixed(2) + ',' + y(series.c[i]).toFixed(2)).join(' ');
    const area = line + ' L' + x(last).toFixed(2) + ',' + (TOP + PH) + ' L' + x(start).toFixed(2) + ',' + (TOP + PH) + ' Z';
    // Moving average is clearly labelled and never replaces the actual raw prices.
    const avg = samples.map((i) => {
      let sum = 0;
      for (let j = Math.max(0, i - 9); j <= i; j++) sum += series.c[j];
      return sum / (i - Math.max(0, i - 9) + 1);
    });
    const trendLine = samples.map((i, n) => (n ? 'L' : 'M') + x(i).toFixed(2) + ',' + y(avg[n]).toFixed(2)).join(' ');
    const trendArea = trendLine + ' L' + x(last).toFixed(2) + ',' + (TOP + PH) + ' L' + x(start).toFixed(2) + ',' + (TOP + PH) + ' Z';
    const ticks: number[] = [];
    for (let v = high; v >= low - tickStep * .001 && ticks.length < 9; v -= tickStep) {
      ticks.push(Number(v.toPrecision(12)));
    }
    return { start, last, count, x, y, line, area, trendLine, trendArea, ticks,
      dateIndices: Array.from({ length: 5 }, (_, i) => start + Math.round(((count - 1) * i) / 4)) };
  }, [series, period]);

  const index = view ? Math.max(view.start, Math.min(view.last, selected ?? view.last)) : 0;
  const price = series && view ? series.c[index] : lastPrice;
  const date = series && view ? series.d[index] : to;
  const initial = series && view ? series.c[view.start] : lastPrice / (1 + change);
  const ret = initial > 0 ? price / initial - 1 : 0;
  const daily = series && index > 0 ? price / series.c[index - 1] - 1 : null;

  function pointer(e: PointerEvent<SVGSVGElement>) {
    if (!series || !view || !svg.current) return;
    const bounds = svg.current.getBoundingClientRect();
    if (!bounds.width) return;
    const xx = ((e.clientX - bounds.left) / bounds.width) * W;
    const ratio = Math.max(0, Math.min(1, (xx - LEFT) / PW));
    const next = view.start + Math.round(ratio * (view.count - 1));
    setSelected((current) => current === next ? current : next);
  }

  function keyboard(e: KeyboardEvent<SVGSVGElement>) {
    if (!view) return;
    let next = index;
    if (e.key === 'ArrowLeft') next--;
    else if (e.key === 'ArrowRight') next++;
    else if (e.key === 'Home') next = view.start;
    else if (e.key === 'End') next = view.last;
    else return;
    e.preventDefault();
    setSelected(Math.max(view.start, Math.min(view.last, next)));
  }

  return (
    <figure className="price-chart">
      <div className="price-chart-periods" role="group" aria-label="가격 그래프 표시 기간">
        {PERIODS.map((p) => <button key={p.id} type="button" aria-pressed={period === p.id}
          className={period === p.id ? 'on' : ''} onClick={() => { setPeriod(p.id); setSelected(null); }} disabled={!series}>{p.label}</button>)}
      </div>
      <div className="price-chart-options">
        <label className="price-trend-label">
          <input type="checkbox" checked={trend} onChange={(e) => setTrend(e.target.checked)} disabled={!series}/>
          추세선으로 부드럽게 보기 <span>(10거래일 이동평균)</span>
        </label>
      </div>
      <div className="price-chart-summary">
        <div><span className="mut">{selected == null ? '최근 종가' : '선택한 날짜의 종가'} · {date}</span>
          <strong>{money(price, currency)} <small>{currency}</small></strong></div>
        <div><span className="mut">표시 시작일 대비</span>
          <strong className={ret >= 0 ? 'good' : 'bad'}>{ret >= 0 ? '+' : ''}{(ret * 100).toFixed(2)}%</strong>
          {selected != null && daily != null ? <span className="mut">전일 대비 {daily >= 0 ? '+' : ''}{(daily * 100).toFixed(2)}%</span> : null}</div>
      </div>
      {view && series ? (
        <svg ref={svg} className="price-chart-svg" viewBox={'0 0 ' + W + ' ' + H} preserveAspectRatio="none"
          role="img" tabIndex={0}
          aria-label={title + ', ' + series.d[view.start] + '부터 ' + series.d[view.last] + '까지 종가 그래프. 마우스나 터치, 좌우 방향키로 날짜별 가격 확인.'}
          onPointerMove={(e) => { if (e.pointerType === 'mouse' || e.buttons > 0) pointer(e); }}
          onPointerDown={pointer}
          onKeyDown={keyboard}>
          <title>{title} ({currency}, 분배금 제외 종가)</title>
          <defs><linearGradient id={'priceArea-' + ticker} x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="var(--ac)" stopOpacity=".2"/><stop offset="100%" stopColor="var(--ac)" stopOpacity="0"/>
          </linearGradient></defs>
          {view.ticks.map((v, i) => <g key={i}>
            <line x1={LEFT} y1={view.y(v)} x2={LEFT + PW} y2={view.y(v)} stroke="var(--line)" strokeWidth="1"/>
            <text x={LEFT + PW + 8} y={view.y(v) + 4} fill="var(--mut)" fontSize="12">{axisPrice(v, currency)}</text>
          </g>)}
          {view.dateIndices.map((i, n) => <text key={n} x={view.x(i)} y={H - 10} fill="var(--mut)" fontSize="12"
            textAnchor={n === 0 ? 'start' : n === view.dateIndices.length - 1 ? 'end' : 'middle'}>{shortDate(series.d[i], period)}</text>)}
          <path d={trend ? view.trendArea : view.area} fill={'url(#priceArea-' + ticker + ')'} pointerEvents="none"/>
          <path d={view.line} fill="none" stroke="var(--ac)" strokeOpacity={trend ? .28 : 1} strokeWidth={trend ? 1.4 : 2.5} strokeLinejoin="round" strokeLinecap="round" pointerEvents="none"/>
          {trend ? <path d={view.trendLine} fill="none" stroke="var(--ac)" strokeWidth="2.6" strokeLinejoin="round" strokeLinecap="round" pointerEvents="none"/> : null}
          {selected != null ? <g pointerEvents="none">
            <line x1={view.x(index)} x2={view.x(index)} y1={TOP} y2={TOP + PH} stroke="var(--warn)" strokeDasharray="4 4"/>
            <circle cx={view.x(index)} cy={view.y(price)} r="5" fill="var(--warn)" stroke="var(--card2)" strokeWidth="2"/>
          </g> : null}
        </svg>
      ) : <svg className="price-chart-svg" viewBox="0 0 640 180" role="img" aria-label={title + ' 기본 가격 추이'}>
        <title>{title}</title><path d={path} fill="none" stroke="var(--ac)" strokeWidth="2"/></svg>}
      <figcaption className="price-chart-caption">
        {series && view ? series.d[view.start] + ' ~ ' + series.d[view.last] : from + ' ~ ' + to}
        {' · 분할 반영 종가 · 분배금 제외 · ' + currency + ' 기준'}
        {series && trend ? ' · 진한 선: 10거래일 평균 / 연한 선: 실제 종가' : ''}
        {error ? ' · 상세 가격 데이터를 불러오지 못해 기본 그래프만 표시합니다.' :
          series ? ' · 터치·마우스 이동 또는 키보드 방향키로 날짜별 가격 확인' : ' · 가격 데이터를 불러오는 중'}
      </figcaption>
    </figure>
  );
}
