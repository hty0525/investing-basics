import { CATS } from '@/lib/catalog';
import { label, P, FACT } from '@/lib/data';
import { pageMeta } from '@/lib/seo';
import Crumbs from '@/components/Crumbs';
import Disclaimer from '@/components/Disclaimer';
import EtfSearch, { type EtfItem } from '@/components/EtfSearch';
export const metadata = pageMeta({ title: 'ETF 41종 목록·검색 — 미국 상장 21·국내 상장 20', description: '티커·이름·키워드로 ETF를 바로 찾으세요. 적립식 투자에서 자주 비교하는 미국·국내 상장 ETF 41종의 상품 정보, 수익률, 최대낙폭, 분배금, 데이터 검증 상태를 한곳에서 볼 수 있습니다.', path: '/etf/' });
export default function Page() {
  const items: EtfItem[] = CATS.flatMap((c) => [...c.us, ...c.kr].map((k) => ({ key: k, slug: k.toLowerCase(), label: label(k), ticker: P(k).ticker, kind: P(k).kind, cat: c.label, catId: c.id, fee: FACT(k).fee_pct ?? null, first: P(k).first, role: c.role })));
  return (
    <div className="prose">
      <Crumbs items={[{ name: 'ETF', path: '/etf/' }]} />
      <h1>ETF 41종 찾기</h1>
      <p className="lead">이미 알고 있는 ETF는 검색으로 바로, 처음이면 유형별로 둘러보세요.</p>
      <Disclaimer />
      <EtfSearch items={items} cats={CATS.map((c) => ({ id: c.id, label: c.label }))} />
    </div>
  );
}
