import Link from 'next/link';
import { META } from '@/lib/data';
export default function Footer() {
  return (
    <footer className="ftr">
      <p>“모르거나 검증하지 못한 값은 보여주지 않는다.” — 이 사이트의 운영 원칙</p>
      <p>데이터 수집 {META.built.slice(0, 10)} · 가격은 외부 데이터 업체 간 교차검증, 상품 정보는 운용사 공식 자료 · <Link href="/sources/">출처·검증 이력</Link> · <Link href="/about/">고지·방법론</Link></p>
      <p>본 사이트는 투자 권유가 아니며 투자 판단과 책임은 이용자에게 있습니다. <a href="https://github.com/hty0525/investing-basics">GitHub</a></p>
    </footer>
  );
}
