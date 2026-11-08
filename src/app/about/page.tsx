import Link from 'next/link';
import { pageMeta } from '@/lib/seo';
import Crumbs from '@/components/Crumbs';
import { META } from '@/lib/data';
import { LAST_REVIEW } from '@/lib/site';
export const metadata = pageMeta({ title: '고지 및 방법론 — 이 사이트가 하지 않는 것', description: '이 사이트는 투자 권유가 아닌 교육용 비교 도구입니다. 데이터 처리 기준, 세전 계산 원칙, 오차 정책, 한계와 면책 고지를 설명합니다.', path: '/about/' });
export default function Page() {
  return (
    <div className="prose">
      <Crumbs items={[{ name: '고지·방법론', path: '/about/' }]} />
      <h1>고지 및 방법론</h1>
      <h2>운영 주체 및 자료 검증</h2>
      <p>이 사이트의 공개 운영 계정은 <a href="https://github.com/hty0525">GitHub @hty0525</a>입니다. <a href="https://github.com/hty0525/investing-basics">소스 코드와 계산 방법</a>, <Link href="/sources/">데이터 출처·교차검증 내역</Link>, <a href="https://github.com/hty0525/investing-basics/issues">오류 제보 및 정정 요청</a>을 공개합니다. 운영자의 투자 자격·경력은 별도로 검증되어 있지 않으며, 이 사이트는 전문 투자자문 서비스를 제공하지 않습니다.</p>
      <p>설명·방법론 검토일: {LAST_REVIEW} · 현재 공개 데이터 빌드 시각: {META.built}. 두 날짜는 다른 의미이며, 데이터가 갱신됐다고 모든 교육 내용이 새로 작성된 것은 아닙니다.</p>
      <h2>내용 검증 및 정정 절차</h2>
      <p>가격·분배금·환율을 출처 간에 비교하고, 일부 자료가 불일치하거나 부족하면 결과에 이를 표시하거나 계산에서 제외합니다. 공개된 결과에도 데이터 오류가 있을 수 있으며, 오류 제보 후 확인과 재계산을 거쳐 변경 이력을 남기는 것을 원칙으로 합니다. 실제 투자 전에는 운용사·거래소의 공식 최신 공시를 따로 확인하세요.</p>
      <h2>이 사이트의 목적</h2>
      <p>적립식 투자에 관심 있는 초보자부터 검증을 원하는 사용자까지 ETF 투자 방식의 장점·한계·실제 위험을 균형 있게 이해하도록 돕습니다. 원칙은 <b>추천보다 비교 / 수익률보다 투자 과정 / 이해하기 쉬운 설명 / 검증 가능한 수치</b>입니다.</p>
      <h2>하지 않는 것</h2>
      <ul>
        <li>특정 상품을 ‘최고’, ‘정답’, ‘안전’이라고 소개하거나 매매를 권유하지 않습니다.</li>
        <li>개인별 적합성 판정, 미래 수익률 예측을 제공하지 않습니다. 가상 경로는 ‘미래 가정 시나리오’로 분리 표시합니다.</li>
        <li>세후 수익을 계산하지 않습니다. 세법·계좌 조건 검증이 끝나기 전까지 세전 결과만 공개합니다.</li>
        <li>검증하지 못한 값은 표시하지 않고 ‘검증 대기’ 또는 ‘자료 부족’으로 표기합니다.</li>
      </ul>
      <h2>데이터 처리 원칙</h2>
      <ul>
        <li>가격은 서로 다른 출처 두 곳을 대조하고(미국: Yahoo↔Nasdaq, 국내: Naver(한국거래소 시세)↔Yahoo), 불일치한 날은 숨기지 않고 기록하며 해당 일은 계산에서 제외합니다.</li>
        <li>분배금은 가격 변동과의 정합성을 검사하고, 통과하지 못한 상품은 총수익률을 숨깁니다.</li>
        <li>환율은 ECB 일일 참조환율을 쓰고 Yahoo와 교차 비교합니다.</li>
        <li>상품 정보(보수·지수·설정일 등)는 운용사 공식 페이지와 투자설명서 기준이며 확인하지 못한 항목은 비워 둡니다.</li>
        <li>같은 입력과 같은 데이터 버전에서는 결과가 재현되며, 계산 엔진은 독립 재계산 테스트로 검증합니다. ‘오차 0%’를 보장한다고 주장하지 않습니다.</li>
      </ul>
      <h2>한계</h2>
      <ul>
        <li>가격·분배금·환율은 외부 데이터 업체 값끼리 맞춘 것이며 운용사 NAV·분배 공시와는 대조하지 못했습니다. 10년 이전 미국 ETF 가격은 단일 출처입니다.</li>
        <li>분배금 재투자는 배당락일 종가 기준이며 실제 지급일과 원천징수는 반영하지 않습니다.</li>
        <li>상품 정보는 변경될 수 있어 투자 전 운용사의 최신 자료를 확인해야 합니다.</li>
      </ul>
      <h2>오류 제보</h2>
      <p>잘못된 값을 발견하면 <a href="https://github.com/hty0525/investing-basics/issues">GitHub 이슈</a>로 알려주세요. 정정 시 재계산하고 변경 이력을 남깁니다. 전체 소스: <a href="https://github.com/hty0525/investing-basics">hty0525/investing-basics</a></p>
      <p><Link href="/sources/">데이터 출처·검증 이력 →</Link></p>
    </div>
  );
}
