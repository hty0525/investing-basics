'use client';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { DeckCard, Vis } from '@/lib/cards';

const pc = (v: number, raw = false) => (raw ? `${v}` : `${(v * 100).toFixed(1)}%`);
function VisView({ v, title }: { v: Vis; title: string }) {
  if (v.type === 'icons') return (<div className="vicons" role="img" aria-label={v.items.map((i) => i.t).join(', ')}>{v.items.map((i, n) => (<div key={n}><span aria-hidden="true">{i.e}</span><b>{i.t}</b></div>))}</div>);
  if (v.type === 'bars') {
    const vals = v.data.map((d) => d.v), mx = Math.max(0.0001, ...vals.map(Math.abs)); const raw = v.fmt === 'raw';
    return (<div className="vbars" role="img" aria-label={`${title}: ${v.data.map((d) => `${d.l} ${pc(d.v, raw)}`).join(', ')}`}>{v.data.map((d, i) => (
      <div className="vb" key={i}><span className="vl">{d.l}</span><div className="vt"><i style={{ width: `${(Math.abs(d.v) / mx) * 100}%`, background: d.v < 0 ? 'var(--bad)' : 'var(--ac)' }} /></div><span className={`vv ${d.v < 0 ? 'bad' : ''}`}>{pc(d.v, raw)}{d.note ? <small> {d.note}</small> : null}</span></div>))}</div>);
  }
  const W = 320, H = 140; const all = v.series.flatMap((s) => s.y); const mn = Math.min(...all), mx = Math.max(...all), sp = mx - mn || 1; const n = Math.max(...v.series.map((s) => s.y.length));
  const X = (i: number, len: number) => 6 + ((W - 12) * i) / Math.max(1, len - 1), Y = (a: number) => H - 8 - ((H - 16) * (a - mn)) / sp;
  return (<div><svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title} 그래프 ${v.x0} ~ ${v.x1}`} className="vsvg" preserveAspectRatio="none">{v.series.map((s, k) => (<path key={k} d={s.y.map((a, i) => `${i ? 'L' : 'M'}${X(i, s.y.length).toFixed(1)},${Y(a).toFixed(1)}`).join('')} fill="none" stroke={s.color} strokeWidth="2.2" vectorEffect="non-scaling-stroke" strokeDasharray={s.dash ? '4 4' : undefined} />))}
    {v.marks?.map((m, i) => { const s = v.series[0]; const idx = Math.min(s.y.length - 1, m.i); const cx = X(idx, s.y.length).toFixed(1), cy = Y(s.y[idx]).toFixed(1); return <path key={i} d={`M${cx},${cy}L${cx},${cy}`} stroke="#ffc857" strokeWidth="7" strokeLinecap="round" vectorEffect="non-scaling-stroke" />; })}</svg>
    <div className="vleg">{v.series.map((s) => (<span key={s.name}><i style={{ background: s.color }} />{s.name}</span>))}<span className="mut">{v.x0} ~ {v.x1}</span></div></div>);
}

export default function CardDeck({ cards, endLinks, label }: { cards: DeckCard[]; endLinks?: { href: string; text: string }[]; label: string }) {
  const ref = useRef<HTMLDivElement>(null); const [idx, setIdx] = useState(0);
  const total = cards.length + (endLinks ? 1 : 0);
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const on = () => { const sl = Array.from(el.children) as HTMLElement[]; let b = 0, bd = Infinity; sl.forEach((c, i) => { const d = Math.abs(c.offsetLeft - el.scrollLeft); if (d < bd) { bd = d; b = i; } }); setIdx(b); };
    el.addEventListener('scroll', on, { passive: true }); return () => el.removeEventListener('scroll', on);
  }, []);
  const go = (d: number) => { const el = ref.current; if (!el) return; const t = Math.max(0, Math.min(total - 1, idx + d)); const c = el.children[t] as HTMLElement; el.scrollTo({ left: c.offsetLeft, behavior: 'smooth' }); };
  return (
    <section className="deck" aria-roledescription="carousel" aria-label={label}>
      <div className="deckbar"><div className="dots" aria-hidden="true">{Array.from({ length: total }).map((_, i) => <i key={i} className={i === idx ? 'on' : ''} />)}</div><span className="mut">{idx + 1} / {total}</span></div>
      <div className="track" ref={ref} tabIndex={0} onKeyDown={(e) => { if (e.key === 'ArrowRight') { e.preventDefault(); go(1); } if (e.key === 'ArrowLeft') { e.preventDefault(); go(-1); } }}>
        {cards.map((c, i) => (
          <article className="slide" key={i} aria-label={`${i + 1}/${total} ${c.title}`}>
            <h3>{c.title}</h3><p className="vline">{c.line}</p>
            <VisView v={c.vis} title={c.title} />
            {c.worst ? <p className="vworst">⚠ {c.worst}</p> : null}
            {c.foot ? <p className="vfoot">{c.foot}</p> : null}
            {c.href ? <Link className="btn sec" href={c.href} style={{ alignSelf: 'flex-start' }}>자세히 보기 →</Link> : null}
          </article>))}
        {endLinks ? (<article className="slide" aria-label="다음 단계"><h3>이제 직접 해볼까요?</h3><p className="vline">그림으로 이해했다면 숫자를 직접 확인해 보세요.</p><div className="vend">{endLinks.map((l) => <Link key={l.href} className="btn" href={l.href}>{l.text}</Link>)}</div></article>) : null}
      </div>
      <div className="deckctl"><button className="btn sec" onClick={() => go(-1)} disabled={idx === 0} aria-label="이전 카드">← 이전</button><button className="btn" onClick={() => go(1)} disabled={idx >= total - 1} aria-label="다음 카드">다음 →</button></div>
    </section>
  );
}
