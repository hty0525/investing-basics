import Link from 'next/link';
import { pageMeta } from '@/lib/seo';
import { CATS } from '@/lib/catalog';
import { label } from '@/lib/data';
import { totalReturn } from '@/lib/stats';
import { rolling } from '@/lib/rolling';
import { P } from '@/lib/data';
import { abs } from '@/lib/site';
import Crumbs from '@/components/Crumbs';
import Disclaimer from '@/components/Disclaimer';
import JsonLd from '@/components/JsonLd';
import Calculator, { type RefRow } from '@/components/Calculator';
export const metadata = pageMeta({ title: '적립식 투자 가정 계산기 — 월 적립 예상 금액·목표 역산(손실 가정 포함)', description: '월 적립금·기간·연 수익률 가정을 넣어 예상 금액을 계산하고, 목표 금액을 위한 월 적립금을 역산합니다. 연 −20%까지 손실 가정을 함께 보여주고 과거 ETF의 최악·중앙·최고 시작 결과를 참고로 제공합니다.', path: '/calculator/', keywords: ['적립식 계산기', '복리 계산기', '목표금액 월 적립금', '적립식 예상 수익'] });
const ann = (tot: number, days: number) => Math.pow(1 + tot, 365 / days) - 1;
export default function Page() {
  const refs: RefRow[] = CATS.flatMap((c) => [...c.us, ...c.kr]).map((k) => {
    const m = P(k); const all = totalReturn(k, m.first, m.last);
    const t = new Date(m.last); t.setFullYear(t.getFullYear() - 5); const s5 = t.toISOString().slice(0, 10);
    const y5 = s5 >= m.first ? totalReturn(k, s5, m.last) : null; const bad = m.div_status === 'review';
    const roll = rolling(k, [3, 5, 10]); const pick = (y: number) => { const w = roll.find((r) => r.years === y); return w && w.xirr ? { min: w.xirr.min, median: w.xirr.median, max: w.xirr.max } : null; };
    return { key: k, label: label(k), since: all && !bad ? ann(all.total, all.days) : null, sinceFrom: m.first, y5: y5 && !bad ? ann(y5.total, y5.days) : null, r3: bad ? null : pick(3), r5: bad ? null : pick(5) };
  });
  return (
    <div className="prose">
      <Crumbs items={[{ name: '가정 계산기', path: '/calculator/' }]} />
      <h1>적립식 가정 계산기</h1>
      <p className="lead">“매달 얼마를 몇 년 넣으면 얼마가 될까?”를 <b>내가 입력한 수익률 가정</b>으로 계산합니다. 좋을 때만이 아니라 <b>손실 가정(−5%, −10%, −20%)까지</b> 함께 보여줍니다.</p>
      <Disclaimer />
      <div className="hint"><b>사용법</b> ① 탭에서 “얼마가 될까” 또는 “목표까지 월 얼마”를 고릅니다 → ② 월 적립금·기간·수익률 가정을 입력합니다 → ③ 표에서 수익률 가정이 달라질 때 결과가 어떻게 변하는지(마이너스 포함)를 확인합니다 → ④ 아래 “참고” 카드에서 실제 ETF가 과거에 시작 시점별로 얼마나 달랐는지(최악 포함)를 봅니다. <Link href="/guide/">전체 사용법</Link></div>
      <Calculator refs={refs} />
      <h2>결과를 읽을 때 주의할 점</h2>
      <ul>
        <li>수익률 가정은 사이트의 전망이 아니라 <b>입력한 숫자</b>입니다. 같은 가정이어도 실제 시장은 매년 들쭉날쭉합니다.</li>
        <li>수익률이 같아도 <b>손실이 먼저 오는지 나중에 오는지</b>에 따라 적립식 결과는 달라질 수 있습니다(시퀀스 위험). 이 계산기는 매년 같은 수익률을 가정합니다.</li>
        <li>세금, 환율, 거래 수수료는 반영하지 않습니다. 실제 ETF의 과거 결과는 <Link href="/simulator/">시뮬레이터</Link>에서 확인하세요.</li>
      </ul>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebApplication', name: '적립식 투자 가정 계산기', url: abs('/calculator/'), applicationCategory: 'FinanceApplication', operatingSystem: 'Any', inLanguage: 'ko-KR', offers: { '@type': 'Offer', price: '0', priceCurrency: 'KRW' } }} />
    </div>
  );
}
