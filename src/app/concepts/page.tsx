import Link from 'next/link';
import { CONCEPTS } from '@/lib/concepts';
import { pageMeta } from '@/lib/seo';
import Crumbs from '@/components/Crumbs';
export const metadata = pageMeta({ title: '적립식 투자·ETF 핵심 개념 10가지', description: '적립식(DCA), 가격수익률과 총수익률, XIRR, 최대낙폭, 환율, 환헤지, 총보수, 채권 듀레이션, 커버드콜, 세금까지 ETF 투자 개념을 실제 데이터 예시와 함께 설명합니다.', path: '/concepts/' });
export default function Page() {
  return (
    <div className="prose">
      <Crumbs items={[{ name: '개념', path: '/concepts/' }]} />
      <h1>적립식 투자·ETF 핵심 개념</h1>
      <p className="lead">숫자를 읽기 전에 알아야 할 개념입니다. 각 글에는 이 사이트가 보유한 실제 과거 데이터로 계산한 예시가 들어 있습니다.</p>
      <div className="grid g2">{CONCEPTS.map((c, i) => (
        <div className="card" key={c.slug}><Link className="stretch" href={`/concepts/${c.slug}/`}><h3>{i + 1}. {c.title}</h3><p className="mut">{c.short}</p></Link></div>
      ))}</div>
      <p><Link href="/glossary/">용어집 보기 →</Link></p>
    </div>
  );
}
