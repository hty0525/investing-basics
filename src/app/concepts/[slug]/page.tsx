import type { Metadata } from 'next';
import Link from 'next/link';
import { CONCEPTS, concept, SIMPLE } from '@/lib/concepts';
import { pageMeta, faqLd } from '@/lib/seo';
import { abs, LAST_REVIEW } from '@/lib/site';
import { META } from '@/lib/data';
import JsonLd from '@/components/JsonLd';
import Crumbs from '@/components/Crumbs';
import Tag from '@/components/Tag';
import Table from '@/components/Table';
import Disclaimer from '@/components/Disclaimer';
import CardDeck from '@/components/CardDeck';
import { buildCards } from '@/lib/cards';
export const dynamicParams = false;
export function generateStaticParams() { return CONCEPTS.map((c) => ({ slug: c.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const c = concept((await params).slug);
  return pageMeta({ title: c.title, description: c.description, path: `/concepts/${c.slug}/`, keywords: c.keywords, type: 'article' });
}
export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const c = concept((await params).slug); const ex = c.example?.();
  return (
    <article className="prose">
      <Crumbs items={[{ name: '개념', path: '/concepts/' }, { name: c.title, path: `/concepts/${c.slug}/` }]} />
      <h1>{c.title}</h1>
      <p className="lead">{c.short}</p>
      <Disclaimer />
      <div className="visual-only"><CardDeck label={`${c.title} 카드`} cards={buildCards(c.slug)} endLinks={[{ href: '/rolling/', text: '최악 사례 보기' }, { href: '/simulator/', text: '시뮬레이터' }, { href: '/calculator/', text: '가정 계산기' }]} />
        <p className="hint">그림으로 보는 중이에요. 글로 읽으려면 위쪽 <b>간단히</b>, 정의·공식까지 보려면 <b>상세히</b>를 누르세요.</p></div>
      <section className="card easy-only text-only" style={{ borderColor: '#2b5c93' }}>
        <h2 style={{ marginTop: 0 }}>쉽게 말하면</h2>
        <ul>{SIMPLE[c.slug].easy.map((t) => <li key={t}>{t}</li>)}</ul>
        <p className="mut">왜 알아야 하나요? {SIMPLE[c.slug].why}</p>
      </section>
      {c.sections.map((s) => (<section key={s.h} className="detail-only"><h2>{s.h}</h2>{s.p.map((t, i) => <p key={i}>{t}</p>)}</section>))}
      <p className="hint easy-only text-only">쉬운 설명만 보고 있어요. 위쪽의 <b>상세하게 보기</b>를 누르면 정의·공식·한계까지 전체 설명이 나옵니다.</p>
      {ex ? (
        <section className="text-only">
          <h2>실제 데이터로 보기 <Tag kind="hist">과거 데이터 기반 계산</Tag></h2>
          <Table head={ex.head} rows={ex.rows} caption={ex.caption} />
          {ex.note ? <p className="mut">{ex.note}</p> : null}
          <p className="mut">데이터 수집 {META.built.slice(0, 10)} · 출처와 검증은 <Link href="/sources/">출처·검증</Link> 참고</p>
        </section>
      ) : null}
      <h2 className="detail-only">자주 묻는 질문</h2>
      {c.faq.map((x) => (<details className="detail-only" key={x.q}><summary>{x.q}</summary><p>{x.a}</p></details>))}
      <h2>함께 보면 좋은 글</h2>
      <div className="chips">{c.related.map((s) => <Link key={s} href={`/concepts/${s}/`}>{concept(s).title.split('—')[0].split('?')[0]}</Link>)}<Link href="/simulator/" className="on">시뮬레이터로 직접 계산 →</Link></div>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Article', headline: c.title, description: c.description, inLanguage: 'ko-KR', datePublished: LAST_REVIEW, dateModified: META.built.slice(0, 10), author: { '@type': 'Person', name: 'hty0525', url: 'https://github.com/hty0525' }, mainEntityOfPage: abs(`/concepts/${c.slug}/`) }} />
      <JsonLd data={faqLd(c.faq)} />
    </article>
  );
}
