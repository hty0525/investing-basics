'use client';
import Link from 'next/link';
import { useMemo, useState } from 'react';
export type EtfItem = { key: string; slug: string; label: string; ticker: string; kind: 'US' | 'KR'; cat: string; catId: string; fee: number | null; first: string; role: string };
const norm = (s: string) => s.toLowerCase().replace(/\s+/g, '');
const ALIASES: Record<string, string> = { 배당: '배당 dividend 분배', 나스닥: '나스닥 nasdaq qqq', 반도체: '반도체 semiconductor', 채권: '채권 bond 국채', 에스앤피: 's&p500 sp500 s&p' };
export default function EtfSearch({ items, cats }: { items: EtfItem[]; cats: { id: string; label: string }[] }) {
  const [q, setQ] = useState(''), [mk, setMk] = useState<'all' | 'KR' | 'US'>('all'), [cat, setCat] = useState('all');
  const list = useMemo(() => {
    const nq = norm(q);
    return items.filter((it) => {
      if (mk !== 'all' && it.kind !== mk) return false; if (cat !== 'all' && it.catId !== cat) return false;
      if (!nq) return true;
      const hay = norm(`${it.label} ${it.ticker} ${it.cat} ${it.role} ${Object.entries(ALIASES).filter(([k]) => it.cat.includes(k) || it.label.includes(k)).map(([, v]) => v).join(' ')}`);
      return hay.includes(nq);
    });
  }, [items, q, mk, cat]);
  const reset = () => { setQ(''); setMk('all'); setCat('all'); };
  const grouped = cats.map((c) => ({ ...c, items: list.filter((i) => i.catId === c.id) })).filter((g) => g.items.length);
  return (
    <div>
      <div className="search" role="search">
        <label htmlFor="etf-q" className="sr">ETF 검색</label>
        <input id="etf-q" type="search" inputMode="search" placeholder="티커·이름·키워드로 찾기 (예: SCHD, 나스닥, 배당, 반도체)" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
        <div className="chips" role="group" aria-label="상장 시장">{([['all', '전체'], ['KR', '국내 상장'], ['US', '미국 상장']] as const).map(([v, l]) => (<button key={v} type="button" aria-pressed={mk === v} className={mk === v ? 'on' : ''} onClick={() => setMk(v)}>{l}</button>))}</div>
        <div className="chips" role="group" aria-label="유형"><button type="button" aria-pressed={cat === 'all'} className={cat === 'all' ? 'on' : ''} onClick={() => setCat('all')}>모든 유형</button>{cats.map((c) => (<button key={c.id} type="button" aria-pressed={cat === c.id} className={cat === c.id ? 'on' : ''} onClick={() => setCat(c.id)}>{c.label}</button>))}</div>
        <div className="mut" role="status" aria-live="polite">{list.length}개 표시 중 / 전체 {items.length}개</div>
      </div>
      {list.length === 0 ? (<div className="card"><b>검색 결과가 없어요.</b><p className="mut">철자를 확인하거나 다른 키워드(예: 티커, ‘배당’, ‘나스닥’)를 써 보세요.</p><button className="btn" onClick={reset}>검색어·필터 초기화</button></div>) : null}
      {grouped.map((g) => (
        <section key={g.id}>
          <h2><Link href={`/compare/${g.id}/`}>{g.label}</Link></h2>
          <div className="grid g3">{g.items.map((it) => (
            <div className="card" key={it.key}><Link className="stretch" href={`/etf/${it.slug}/`}>
              <h3>{it.label}</h3>
              <div className="mut"><b>{it.ticker}</b> · {it.kind === 'KR' ? '국내 상장' : '미국 상장'} · {g.label}</div>
              <div className="mut">해마다 빠지는 비용(총보수) {it.fee == null ? '검증 대기' : it.fee + '%'} · 데이터 {it.first}~</div></Link></div>))}</div>
        </section>))}
    </div>
  );
}
