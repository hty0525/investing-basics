import Link from 'next/link';
export default function Disclaimer() {
  return (
    <aside className="banner" role="note">
      교육·비교용 정보입니다. 특정 상품 추천, 개인별 적합성 판정, 미래 수익 예측이 아니며 과거 성과는 미래를 보장하지 않습니다. 모든 결과는 세전이고 세후 계산은 지원하지 않습니다. <Link href="/about/">자세한 고지와 방법론</Link>
    </aside>
  );
}
