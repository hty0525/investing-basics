import Link from 'next/link';
import { CATS } from '@/lib/catalog';
import { pageMeta } from '@/lib/seo';
import Crumbs from '@/components/Crumbs';
import Disclaimer from '@/components/Disclaimer';
export const metadata = pageMeta({ title: 'ETF 유형별 비교 — 미국 대형주·나스닥·배당·채권·반도체', description: '미국 대형주, 나스닥100, 배당, 채권, 옵션 인컴, 반도체 등 10개 유형으로 나눠 미국·국내 상장 ETF를 같은 기간·같은 규칙으로 비교합니다.', path: '/compare/' });
export default function Page() {
  return (
    <div className="prose">
      <Crumbs items={[{ name: '유형별 비교', path: '/compare/' }]} />
      <h1>ETF 유형별 비교</h1>
      <p className="lead">상품을 하나 골라주지 않습니다. 같은 유형 안에서 미국·국내 상장 상품이 어떻게 다른지 같은 기간·같은 규칙으로 보여줍니다.</p>
      <Disclaimer />
      <div className="grid g2">{CATS.map((c) => (
        <div className="card" key={c.id}><Link className="stretch" href={`/compare/${c.id}/`}><h3>{c.label}</h3><p className="mut">{c.intro}</p><span className="mut">미국 {c.us.length} · 국내 {c.kr.length} →</span></Link></div>
      ))}</div>
    </div>
  );
}
