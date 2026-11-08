import type { Metadata } from 'next';
import Link from 'next/link';
import { CATS, catById } from '@/lib/catalog';
import { P, label, isKR, FACT } from '@/lib/data';
import { totalReturn, krwTotal, annVol, commonRange } from '@/lib/stats';
import { pct } from '@/lib/fmt';
import { pageMeta, faqLd } from '@/lib/seo';
import { abs, LAST_REVIEW } from '@/lib/site';
import JsonLd from '@/components/JsonLd';
import Crumbs from '@/components/Crumbs';
import Tag from '@/components/Tag';
import Table from '@/components/Table';
import Disclaimer from '@/components/Disclaimer';

export const dynamicParams = false;
export function generateStaticParams() { return CATS.map((c) => ({ cat: c.id })); }

export async function generateMetadata({ params }: { params: Promise<{ cat: string }> }): Promise<Metadata> {
  const c = catById((await params).cat);
  return pageMeta({
    title: `${c.label} ETF 비교 — 미국·국내 상장 수익률·낙폭·총보수`,
    description: `${c.label} ETF ${c.us.length + c.kr.length}개(미국 ${c.us.length}·국내 ${c.kr.length})를 같은 기간·같은 규칙으로 비교합니다. 가격수익률, 총수익률, 최대낙폭, 총보수를 검증 가능한 데이터로 정리했습니다.`,
    path: `/compare/${c.id}/`, keywords: [`${c.label} ETF`, 'ETF 비교', '미국 ETF 국내 ETF 차이', '적립식'], type: 'article',
  });
}

export default async function ComparePage({ params }: { params: Promise<{ cat: string }> }) {
  const c = catById((await params).cat); const all = [...c.us, ...c.kr];
  const { start, end } = commonRange(all);
  const rows = all.map((k) => {
    const r = totalReturn(k, start, end)!; const rv = P(k).div_status === 'review'; const f = FACT(k);
    return [<Link key={k} href={`/etf/${k.toLowerCase()}/`}>{label(k)}</Link>, isKR(k) ? '국내' : '미국', P(k).currency, pct(r.price), rv ? '검증 대기' : pct(r.total), rv ? '검증 대기' : pct(krwTotal(k, start, end)), pct(r.mdd.mdd), pct(annVol(k, start, end)), f.fee_pct == null ? '검증 대기' : `${f.fee_pct}%`];
  });
  const faq = [
    { q: `${c.label} ETF는 미국 상장과 국내 상장 중 무엇이 다른가요?`, a: '거래 통화(USD/KRW), 환전·환헤지, 총보수, 분배 방식, 세금과 계좌 제약이 다를 수 있습니다. 추종 지수가 같아 보여도 상품 구조가 동일하다고 단정할 수 없습니다.' },
    { q: `${c.label} ETF를 비교할 때 가장 주의할 점은?`, a: '같은 기간으로 비교해야 하고, 달러 수익률과 원화 수익률을 환산 없이 비교하면 안 되며, 가격수익률과 분배금 재투자 총수익률을 구분해야 합니다.' },
  ];
  return (
    <article className="prose">
      <Crumbs items={[{ name: '유형별 비교', path: '/compare/' }, { name: c.label, path: `/compare/${c.id}/` }]} />
      <h1>{c.label} ETF 비교</h1>
      <p className="lead">{c.intro}</p>
      <Tag kind="hist">과거 데이터 기반 계산</Tag><Tag>세전</Tag><Tag>공통 기간 {start} ~ {end}</Tag>
      <Disclaimer />
      <h2>같은 기간 성과 비교</h2>
      <p className="mut">선택한 상품이 모두 거래된 공통 기간만 동일기간 비교로 표시합니다. 현지통화(USD/KRW) 수익률끼리 순위를 매기지 않으며, 원화 총수익률은 매수일·분배일 환율을 적용했습니다.</p>
      <Table head={['ETF', '상장', '통화', '가격수익률(현지)', '총수익률(현지)', '원화 총수익률', '가격 MDD', '연환산 변동성', '총보수']} rows={rows} caption={`공통 기간 ${start} ~ ${end} · 세전 · 분배금 배당락일 재투자 가정`} />
      <p className="mut">{c.note}</p>
      <h2>역할과 양면성</h2>
      <Table head={['ETF', '기대 역할', '장점', '주의점']} rows={all.map((k) => [<Link key={k} href={`/etf/${k.toLowerCase()}/`}>{label(k)}</Link>, c.role, c.pro, c.con])} />
      <h2>비교하는 방법</h2>
      <ul>
        <li>같은 기간인지 먼저 확인합니다(상장일이 다르면 가장 늦은 상장일부터).</li>
        <li>가격수익률과 총수익률(분배금 포함)을 구분합니다. <Link href="/concepts/price-vs-total-return/">자세히</Link></li>
        <li>환율의 영향을 따로 확인합니다. <Link href="/concepts/fx-decomposition/">자세히</Link></li>
        <li>수익률과 함께 최대낙폭과 회복기간을 봅니다. <Link href="/concepts/mdd-vs-underwater/">자세히</Link></li>
      </ul>
      <h2>자주 묻는 질문</h2>
      {faq.map((x) => (<details key={x.q}><summary>{x.q}</summary><p>{x.a}</p></details>))}
      <h2>다른 유형 비교</h2>
      <div className="chips">{CATS.filter((x) => x.id !== c.id).map((x) => <Link key={x.id} href={`/compare/${x.id}/`}>{x.label}</Link>)}</div>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Article', headline: `${c.label} ETF 비교`, inLanguage: 'ko-KR', datePublished: LAST_REVIEW, dateModified: end, author: { '@type': 'Person', name: 'hty0525' }, mainEntityOfPage: abs(`/compare/${c.id}/`) }} />
      <JsonLd data={faqLd(faq)} />
    </article>
  );
}
