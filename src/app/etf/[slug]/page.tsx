import type { Metadata } from 'next';
import Link from 'next/link';
import { KEYS, catOf, CATS } from '@/lib/catalog';
import { P, FACT, label, isKR, loadSeries } from '@/lib/data';
import { productStats, recentDivs, lastPrice } from '@/lib/stats';
import { pct } from '@/lib/fmt';
import { pageMeta, crumbLd, faqLd } from '@/lib/seo';
import { abs, LAST_REVIEW } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import Crumbs from '@/components/Crumbs';
import Tag from '@/components/Tag';
import Table from '@/components/Table';
import Spark from '@/components/Spark';
import FactTable from '@/components/FactTable';
import Disclaimer from '@/components/Disclaimer';

export const dynamicParams = false;
export function generateStaticParams() { return KEYS.map((k) => ({ slug: k.toLowerCase() })); }
const nm = (k: string) => (label(k) === P(k).ticker ? label(k) : `${label(k)}(${P(k).ticker})`);
const keyOf = (slug: string) => KEYS.find((k) => k.toLowerCase() === slug)!;

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const k = keyOf((await params).slug); const f = FACT(k); const c = catOf(k);
  const fee = f.fee_pct != null ? ` 총보수 ${f.fee_pct}%` : '';
  return pageMeta({
    title: `${nm(k)} — 수익률·최대낙폭·분배금·총보수 정리`,
    description: `${label(k)}: ${c.where}에 투자하는 ${isKR(k) ? '국내' : '미국'} 상장 ETF.${fee ? fee + '.' : ''} 기간별 수익률, 최대낙폭과 회복기간, 분배금, 데이터 검증 상태를 과거 데이터로 정리했습니다(${P(k).last} 기준).`,
    path: `/etf/${k.toLowerCase()}/`, keywords: [label(k), P(k).ticker, c.label, 'ETF', '적립식', '최대낙폭'], type: 'article',
  });
}

export default async function EtfPage({ params }: { params: Promise<{ slug: string }> }) {
  const k = keyOf((await params).slug); const p = P(k), f = FACT(k), c = catOf(k);
  const st = productStats(k); const lp = lastPrice(k); const ser = loadSeries(k);
  const peers = [...c.us, ...c.kr].filter((x) => x !== k);
  const divs = recentDivs(k, 8);
  const hedged = isKR(k) && /\(H\)|\(합성 H\)/.test(p.name ?? '');
  const faq = [
    { q: `${label(k)}의 총보수는 얼마인가요?`, a: f.fee_pct != null ? `운용사 공식 자료 기준 총보수는 연 ${f.fee_pct}%입니다(${f.fee_asof ?? '기준일 확인 필요'}). 보수는 변경될 수 있으므로 최신 자료를 확인하세요.` : '공식 자료로 확인되지 않아 이 사이트에서는 표시하지 않습니다(검증 대기).' },
    { q: `${label(k)}는 환율의 영향을 받나요?`, a: isKR(k) ? (hedged ? '환헤지(H) 상품으로 환율 변동을 줄이도록 설계됐지만 완전히 제거하지는 못하며 헤지 비용이 있습니다.' : (f.hedge ? `${f.hedge}. 환노출형이면 원/달러 변화가 수익에 반영됩니다.` : '환헤지 여부가 공식 자료로 확인되지 않았습니다(검증 대기).')) : '미국 상장 ETF는 달러로 거래되므로 원화 투자자는 매수·매도 시점의 원/달러 환율 영향을 직접 받습니다.' },
    { q: `${label(k)}의 분배 주기는 어떻게 되나요?`, a: f.dist ? `공식 자료 기준: ${f.dist}` : '분배 주기가 공식 자료로 확인되지 않았습니다(검증 대기).' },
    { q: `${label(k)}의 과거 최대낙폭은 얼마였나요?`, a: `${st.all.start} ~ ${st.all.end} 가격 기준 최대낙폭은 ${pct(st.all.mdd.mdd)}(${st.all.mdd.peakDate} → ${st.all.mdd.troughDate})입니다. 과거 낙폭이 미래 손실 한도를 뜻하지는 않습니다.` },
  ];
  const rows = [...st.hz.filter((h) => h.r).map((h) => [`최근 ${h.y}년`, pct(h.r!.price), p.div_status === 'review' ? '검증 대기' : pct(h.r!.total), pct(h.r!.mdd.mdd)]),
    [`상장 이후(${st.all.start}~)`, pct(st.all.price), p.div_status === 'review' ? '검증 대기' : pct(st.all.total), pct(st.all.mdd.mdd)]];
  const skipped = st.hz.filter((h) => !h.r).map((h) => `${h.y}년`);
  const ld = {
    '@context': 'https://schema.org', '@type': 'Article', headline: `${nm(k)} 수익률·최대낙폭·분배금 정리`,
    description: `${c.where} ETF ${label(k)}의 과거 데이터 기반 정리`, inLanguage: 'ko-KR', datePublished: LAST_REVIEW, dateModified: p.last,
    author: { '@type': 'Person', name: 'hty0525', url: 'https://github.com/hty0525' }, mainEntityOfPage: abs(`/etf/${k.toLowerCase()}/`),
    about: { '@type': 'Thing', name: label(k), alternateName: p.ticker },
  };
  return (
    <article className="prose">
      <Crumbs items={[{ name: 'ETF', path: '/etf/' }, { name: label(k), path: `/etf/${k.toLowerCase()}/` }]} />
      <h1>{label(k)}{label(k) !== p.ticker ? <span className="mut"> ({p.ticker})</span> : null}</h1>
      <p className="lead">{c.where}에 투자하는 {isKR(k) ? '국내' : '미국'} 상장 ETF입니다. {c.role}. 아래 수치는 모두 과거 데이터 기반이며 {p.last} 종가까지 반영했습니다.</p>
      <div><Tag>{isKR(k) ? '국내 상장' : '미국 상장'}</Tag><Tag>{p.currency}</Tag>{hedged ? <Tag>환헤지(H)</Tag> : null}<Tag kind="hist">과거 데이터 기반 계산</Tag><Tag>세전</Tag>
        <Tag kind={p.price_status === 'ok' ? 'real' : 'bad'}>{p.price_status === 'ok' ? '가격 2출처 교차검증' : '가격 불일치 검토 필요'}</Tag>
        <Tag kind={p.div_status === 'ok' ? 'real' : p.div_status === 'none' ? 'wait' : 'bad'}>{p.div_status === 'ok' ? `분배금 ${p.xcheck.div_check.ok}/${p.xcheck.div_check.n} 정합` : p.div_status === 'none' ? '분배 기록 없음' : '분배금 불일치 검토 필요'}</Tag></div>
      <Disclaimer />
      <h2>한눈에 보기</h2>
      <div className="grid g4">
        <div className="card"><h3>어디에 투자하나?</h3>{c.where}</div><div className="card"><h3>어떤 역할인가?</h3>{c.role}</div>
        <div className="card"><h3 className="good">장점</h3>{c.pro}</div><div className="card"><h3 className="warn">주의점</h3>{c.con}</div>
      </div>
      <h2>가격 추이</h2>
      <Spark k={k} title={`${label(k)} 가격 추이`} />
      <p className="mut">최근 종가 {lp.c.toLocaleString('ko-KR')} {p.currency} ({lp.d}) · 거래일 {ser.d.length.toLocaleString('ko-KR')}일 · 분할 반영 종가(분배금 별도 처리).</p>
      <h2>기간별 수익률과 낙폭</h2>
      <Table head={['기간', '가격수익률', '총수익률(분배 재투자)', '기간 내 최대낙폭']} rows={rows} caption={`${p.currency} 기준, 세전. 총수익률은 배당락일 종가에 분배금을 재투자한 가정.`} />
      {skipped.length ? <p className="mut">상장 이후 기간이 짧아 {skipped.join(', ')} 수익률은 <Tag kind="wait">자료 부족</Tag>으로 표시하지 않습니다.</p> : null}
      <h2>위험과 회복</h2>
      <div className="grid g4">
        <div className="kpi"><div className="l">최대낙폭(가격, {p.currency})</div><div className="v bad">{pct(st.all.mdd.mdd)}</div><div className="s">{st.all.mdd.peakDate} → {st.all.mdd.troughDate}</div></div>
        <div className="kpi"><div className="l">최고가 회복</div><div className="v">{st.all.mdd.recoveryDate ?? '기간 내 미회복'}</div><div className="s">{st.all.mdd.recoveryDays ? `저점 후 ${st.all.mdd.recoveryDays}일` : ''}</div></div>
        <div className="kpi"><div className="l">연환산 변동성</div><div className="v">{pct(st.vol)}</div><div className="s">일간 로그수익률 기준</div></div>
        <div className="kpi"><div className="l">원화 환산 최대낙폭</div><div className="v bad">{st.krwMdd ? pct(st.krwMdd.mdd) : '자료 부족'}</div><div className="s">{st.krwMdd ? `${st.krwStart}~ 기준` : ''}</div></div>
      </div>
      {st.month ? <p className="mut">원화 기준 최악 월간 수익률 {st.month.worstMonth ? `${pct(st.month.worstMonth.r)} (${st.month.worstMonth.d.slice(0, 7)})` : '자료 부족'} · 최악 12개월 {st.month.worst12m ? `${pct(st.month.worst12m.r)} (~${st.month.worst12m.d.slice(0, 7)})` : '자료 부족'}</p> : null}
      <p className="mut">과거 최대낙폭이 미래에 가능한 최대 손실 한도를 뜻하지는 않습니다. 적립식 계좌 기준 원금 미달·회복은 <Link href="/simulator/">시뮬레이터</Link>에서 계산하세요.</p>
      <h2>분배금</h2>
      {p.div_status === 'none' ? <p>데이터상 분배 기록이 없습니다.</p> : (
        <>
          <p>데이터상 분배 {p.divCount}건. 정합성 검사: {p.div_status === 'ok' ? '가격 변동과 일치(통과)' : <Tag kind="bad">불일치 검토 필요 — 총수익률 숨김</Tag>}</p>
          <Table head={['배당락일', `주당 분배금(${p.currency})`, '당시 분배율(전일 종가 대비)']} rows={divs.map(([d, a]) => { const i = ser.d.indexOf(d); const pc = i > 0 ? ser.c[i - 1] : null; return [d, String(a), pc ? pct(a / pc, 2) : '자료 부족']; })} caption="최근 8건" />
          <p className="mut">분배금은 세전이며 원천징수·과세는 반영하지 않았습니다. 실제 지급일은 데이터가 없어 배당락일 기준으로 처리합니다.</p>
        </>
      )}
      <h2>상품 정보 (운용사 공식 자료)</h2>
      <FactTable k={k} />
      <h2>데이터 출처와 검증</h2>
      <p>가격: {p.xcheck.price_primary}, 대조: {p.xcheck.price_secondary} (겹치는 {p.xcheck.overlap_days.toLocaleString('ko-KR')}일 중 불일치 {p.xcheck.mismatch_days}일{p.excluded_days?.length ? `, 제외한 날 ${p.excluded_days.join(', ')}` : ''}). 환율: ECB 일일 참조환율. 자세한 내용은 <Link href="/sources/">출처·검증</Link>을 참고하세요.</p>
      {p.trimmed_before ? <p className="warn">공식 설정일({p.trimmed_before}) 이전 구간은 현재 ETF 구조와 달라 제외했습니다.</p> : null}
      <h2>자주 묻는 질문</h2>
      {faq.map((x) => (<details key={x.q}><summary>{x.q}</summary><p>{x.a}</p></details>))}
      <h2>같은 유형 상품</h2>
      <div className="chips">{peers.map((x) => <Link key={x} href={`/etf/${x.toLowerCase()}/`}>{label(x)}</Link>)}<Link href={`/compare/${c.id}/`} className="on">{c.label} 한눈에 비교 →</Link></div>
      <JsonLd data={ld} /><JsonLd data={faqLd(faq)} />
    </article>
  );
}
