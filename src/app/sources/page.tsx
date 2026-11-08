import Link from 'next/link';
import { pageMeta } from '@/lib/seo';
import { META, P, label } from '@/lib/data';
import { KEYS } from '@/lib/catalog';
import Crumbs from '@/components/Crumbs';
import Tag from '@/components/Tag';
import Table from '@/components/Table';
export const metadata = pageMeta({ title: '데이터 출처·검증 이력 — 가격·분배금·환율 교차검증 결과', description: 'ETF 41종의 가격 출처, 교차검증 일치 여부, 분배금 정합성, 환율 대조 결과, 제외한 날과 이상값 경고를 투명하게 공개합니다.', path: '/sources/' });
export default function Page() {
  const fx = META.fx.xcheck as Record<string, number | string | unknown[]>;
  const rows = KEYS.map((k) => { const p = P(k), x = p.xcheck;
    const price = x.mismatch_days > 3 ? <Tag kind="bad">불일치 검토</Tag> : p.kind === 'US' && x.secondary_from > p.first ? <Tag kind="wait">{x.secondary_from}~ 2출처 · 이전 단일</Tag> : <Tag kind="real">2출처 일치</Tag>;
    const div = p.div_status === 'none' ? <Tag kind="wait">분배 없음</Tag> : p.div_status === 'ok' ? <Tag kind="real">{x.div_check.ok}/{x.div_check.n} 정합</Tag> : <Tag kind="bad">{x.div_check.ok}/{x.div_check.n} 검토</Tag>;
    return [<Link key={k} href={`/etf/${k.toLowerCase()}/`}>{label(k)}</Link>, p.currency, `${p.first} ~ ${p.last}`, p.days.toLocaleString('ko-KR'), x.price_primary, `${x.overlap_days.toLocaleString('ko-KR')}일 / 불일치 ${x.mismatch_days}`, price, div]; });
  return (
    <div className="prose">
      <Crumbs items={[{ name: '출처·검증', path: '/sources/' }]} />
      <h1>데이터 출처·검증 이력</h1>
      <p className="lead">모르거나 검증하지 못한 값은 보여주지 않습니다. 아래는 어떤 데이터를 어떻게 맞춰봤는지에 대한 기록입니다. 수집 시각: {META.built}</p>
      <h2>데이터 등급</h2>
      <p><Tag kind="real">교차검증 일치</Tag> 서로 다른 출처 두 곳이 일치 · <Tag kind="hist">과거 데이터 기반 계산</Tag> 실측값에 정해진 투자 행동을 적용 · <Tag kind="sim">미래 가정 시나리오</Tag> 가정값 · <Tag kind="wait">검증 대기 / 자료 부족</Tag> 수치 확정 표시 금지</p>
      <Table head={['상품', '통화', '기간', '거래일', '1차 출처', '겹침/불일치', '가격 검증', '분배금 검증']} rows={rows} caption="상품별 데이터 현황" />
      <h2>환율 교차검증</h2>
      <p>1차: {META.fx.source}<br />2차: {String(fx.secondary)} — 비교 {String(fx.compared_days)}일 · 평균 절대차 {String(fx.mean_abs_diff_pct)}% · 95% 구간 {String(fx.p95_abs_diff_pct)}% 이내 · 1.5% 초과 {String(fx.over_1_5pct_days)}일.<br /><span className="mut">{String(fx.note)}</span></p>
      <h2>처리 규칙</h2>
      <ul>
        <li>가격: 분할만 반영한 일간 종가 + 분배금 별도 가산(수정주가 미사용 → 이중 반영 없음).</li>
        <li>국내 ETF 가격은 한국거래소 시세(Naver)를 1차로 사용합니다. Yahoo의 국내 ETF 종가는 분배금이 소급 반영된 값이라 1차로 쓰지 않습니다.</li>
        <li>달력: 선택 상품이 모두 거래한 날만 사용, 결측일은 보간하지 않고 제외.</li>
        <li>환율: 해당일 값이 없으면 직전 값 이월, 매수일·분배일마다 개별 적용.</li>
        <li>비용: 운용보수는 가격에 이미 반영돼 추가 차감하지 않음. 거래 수수료·환전 스프레드는 사용자 입력(기본 0).</li>
      </ul>
      <h2>이상값·경고 ({META.warnings.length}건)</h2>
      <ul className="mut">{META.warnings.map((w) => <li key={w}>{w}</li>)}</ul>
      <h2>변경 로그</h2>
      <p className="mut">v1.0 · 최초 적재({META.built.slice(0, 10)}). 과거 데이터 정정 이력 없음. 초기 내부 버전에서 국내 ETF 분배금 이중 반영 오류를 발견해 수정했으며 공개 버전에는 포함되지 않습니다.</p>
    </div>
  );
}
