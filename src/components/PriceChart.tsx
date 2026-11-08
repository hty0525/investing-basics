'use client';
import { useEffect, useRef, useState } from 'react';
import type { KeyboardEvent, PointerEvent } from 'react';

type PriceSeries = { d: string[]; c: number[] };
type Props = {
  ticker: string;
  title: string;
  path: string;
  currency: 'USD' | 'KRW';
  from: string;
  to: string;
  change: number;
  lastPrice: number;
};

const W = 640;
const MARGIN = 8;
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

export default function PriceChart({ ticker, title, path, currency, from, to, change, lastPrice }: Props) {
  const svg = useRef<SVGSVGElement>(null);
  const [series, setSeries] = useState<PriceSeries | null>(null);
  const [selected, setSelected] = useState<number | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    setSeries(null);
    setSelected(null);
    setError(false);
    fetch(`${basePath}/data/products/${ticker.toLowerCase()}.json`, { signal: controller.signal })
      .then((r) => {
        if (!r.ok) throw new Error('price data unavailable');
        return r.json() as Promise<PriceSeries>;
      })
      .then((data) => {
        if (!Array.isArray(data.d) || !Array.isArray(data.c) || data.d.length !== data.c.length || !data.d.length) throw new Error('invalid price series');
        setSeries(data);
      })
      .catch((e: unknown) => { if (!(e instanceof Error && e.name === 'AbortError')) setError(true); });
    return () => controller.abort();
  }, [ticker]);

  const maxIndex = series ? series.d.length - 1 : 0;
  const activeIndex = selected == null ? maxIndex : Math.min(maxIndex, selected);
  const activeDate = series?.d[activeIndex] ?? to;
  const activePrice = series?.c[activeIndex] ?? lastPrice;
  const x = MARGIN + ((W - 2 * MARGIN) * activeIndex) / Math.max(1, maxIndex);
  const formattedPrice = activePrice.toLocaleString('ko-KR', {
    minimumFractionDigits: currency === 'USD' ? 2 : 0,
    maximumFractionDigits: 2,
  });

  function onPointer(e: PointerEvent<SVGSVGElement>) {
    if (!series || !svg.current) return;
    const bounds = svg.current.getBoundingClientRect();
    if (!bounds.width) return;
    const viewX = ((e.clientX - bounds.left) / bounds.width) * W;
    const ratio = Math.max(0, Math.min(1, (viewX - MARGIN) / (W - 2 * MARGIN)));
    setSelected(Math.round(ratio * maxIndex));
  }

  function onKeys(e: KeyboardEvent<SVGSVGElement>) {
    if (!series) return;
    let next = activeIndex;
    if (e.key === 'ArrowLeft') next--;
    else if (e.key === 'ArrowRight') next++;
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = maxIndex;
    else return;
    e.preventDefault();
    setSelected(Math.max(0, Math.min(maxIndex, next)));
  }

  return (
    <figure className="spark spark-interactive">
      <svg
        ref={svg}
        viewBox="0 0 640 180"
        preserveAspectRatio="none"
        role="img"
        tabIndex={0}
        aria-label={`${title}. 마우스로 탐색하거나 포커스 후 좌우 방향키로 날짜별 가격을 확인하세요.`}
        onPointerMove={onPointer}
        onPointerDown={onPointer}
        onPointerLeave={(e) => { if (e.pointerType !== 'touch') setSelected(null); }}
        onKeyDown={onKeys}
      >
        <title>{title}</title>
        <path d={path} fill="none" stroke="var(--ac)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
        {series && selected !== null ? <line x1={x} x2={x} y1={0} y2={180} stroke="var(--warn)" strokeWidth={1.5} strokeDasharray="4 4" vectorEffect="non-scaling-stroke" pointerEvents="none" /> : null}
      </svg>
      <div className="spark-readout" aria-live="polite" aria-atomic="true">
        <span>{selected === null ? '최근 종가' : '선택한 날짜의 종가'}</span>
        <strong>{activeDate} · {formattedPrice} {currency}</strong>
      </div>
      <figcaption className="mut">
        {from} ~ {to} · 로그 스케일 가격 추이(분배금 제외, 현지통화) · 같은 기간 가격 변화 {(change * 100).toFixed(1)}%
        <span className="spark-help"> · {error ? '상세 가격 데이터를 불러오지 못했습니다.' : series ? '마우스 이동·터치 또는 좌우 방향키로 날짜별 가격 확인' : '날짜별 가격 불러오는 중'}</span>
      </figcaption>
    </figure>
  );
}
