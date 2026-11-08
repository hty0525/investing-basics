import Link from 'next/link';
import { pageMeta } from '@/lib/seo';
import { CATS } from '@/lib/catalog';
import { P, label } from '@/lib/data';
import Crumbs from '@/components/Crumbs';
import Disclaimer from '@/components/Disclaimer';
import JsonLd from '@/components/JsonLd';
import Simulator, { type SimProduct } from '@/components/Simulator';
import { abs } from '@/lib/site';
export const metadata = pageMeta({ title: '적립식 투자 시뮬레이터 — 월 적립 과거 결과·일시금 비교·원금 회복', description: '미국·국내 상장 ETF 41종 중 최대 3종을 골라 월 적립식 과거 결과를 계산합니다. 납입원금 대비 수익률, XIRR, 일시금 비교, 최대낙폭, 원금 미달·회복 구간, 환율 영향을 확인하세요.', path: '/simulator/', keywords: ['적립식 투자 시뮬레이터', 'ETF 백테스트', '적립식 계산기', 'XIRR'] });
export default function Page() {
  const products: SimProduct[] = CATS.flatMap((c) => [...c.us, ...c.kr].map((k) => ({ key: k, label: label(k), cat: c.label, currency: P(k).currency, first: P(k).first, last: P(k).last, kind: P(k).kind, review: P(k).div_status === 'review' })));
  return (
    <div className="prose">
      <Crumbs items={[{ name: '시뮬레이터', path: '/simulator/' }]} />
      <h1>적립식 투자 시뮬레이터</h1>
      <p className="lead">고른 ETF에 매달 같은 금액을 넣었다면 과거에 어떻게 됐는지 계산합니다. 계산은 모두 내 브라우저에서 이뤄지며 입력값은 어디에도 전송되지 않습니다.</p>
      <Disclaimer />
      <Simulator products={products} />
      <h2>계산 규칙</h2>
      <ul>
        <li>적립일은 매월 첫 공통 거래일, 선택 상품이 모두 거래된 날만 사용하고 결측일은 보간하지 않습니다.</li>
        <li>미국 상장 ETF는 매수일·분배일 환율(ECB 일일 참조환율, 휴일은 직전값)을 적용합니다.</li>
        <li>분배금은 세전이며 배당락일 종가에 재투자하는 가정입니다(실제 지급일 데이터 없음).</li>
        <li>수정주가를 쓰지 않고 분할만 반영한 종가에 분배금을 별도로 더해 이중 반영을 피합니다.</li>
        <li>계산 엔진은 독립적으로 작성한 Python 재계산과 평가액이 소수점 둘째 자리까지 일치하는지 테스트합니다(<a href="https://github.com/hty0525/investing-basics/tree/main/pipeline">pipeline/test_ref.py</a>).</li>
      </ul>
      <p className="mut">개념이 낯설면 <Link href="/concepts/xirr/">XIRR</Link>, <Link href="/concepts/mdd-vs-underwater/">최대낙폭과 원금 미달</Link>부터 읽어보세요.</p>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebApplication', name: '적립식 투자 시뮬레이터', url: abs('/simulator/'), applicationCategory: 'FinanceApplication', operatingSystem: 'Any', inLanguage: 'ko-KR', offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' } }} />
    </div>
  );
}
