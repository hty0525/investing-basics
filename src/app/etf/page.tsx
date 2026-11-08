import Link from 'next/link';
import { CATS } from '@/lib/catalog';
import { label, P, FACT } from '@/lib/data';
import { pageMeta } from '@/lib/seo';
import Crumbs from '@/components/Crumbs';
import Disclaimer from '@/components/Disclaimer';
export const metadata = pageMeta({ title: 'ETF 41종 목록 — 미국 상장 21·국내 상장 20', description: '적립식 투자에서 자주 비교하는 미국·국내 상장 ETF 41종의 상품 정보, 수익률, 최대낙폭, 분배금, 데이터 검증 상태를 한곳에서 찾아보세요.', path: '/etf/' });
export default function Page() {
  return (
    <div className="prose">
      <Crumbs items={[{ name: 'ETF', path: '/etf/' }]} />
      <h1>ETF 41종 목록</h1>
      <p className="lead">유형별로 묶었습니다. 각 상품 페이지에서 기간별 수익률, 최대낙폭, 분배금, 총보수, 데이터 검증 상태를 볼 수 있습니다.</p>
      <Disclaimer />
      {CATS.map((c) => (
        <section key={c.id}>
          <h2><Link href={`/compare/${c.id}/`}>{c.label}</Link></h2>
          <div className="grid g3">{[...c.us, ...c.kr].map((k) => (
            <div className="card" key={k}><Link className="stretch" href={`/etf/${k.toLowerCase()}/`}><h3>{label(k)}</h3><div className="mut">{P(k).ticker} · {P(k).kind === 'KR' ? '국내 상장' : '미국 상장'} · {P(k).currency}</div><div className="mut">총보수 {FACT(k).fee_pct == null ? '검증 대기' : FACT(k).fee_pct + '%'} · 데이터 {P(k).first} ~</div></Link></div>
          ))}</div>
        </section>
      ))}
    </div>
  );
}
