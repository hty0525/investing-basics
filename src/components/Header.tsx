import Link from 'next/link';
const NAV: [string, string][] = [['/concepts/', '개념'], ['/etf/', 'ETF'], ['/compare/', '유형별 비교'], ['/simulator/', '시뮬레이터'], ['/sources/', '출처·검증'], ['/glossary/', '용어집']];
export default function Header() {
  return (
    <header className="hdr">
      <Link href="/" className="brand">📊 투자 기초</Link>
      <nav aria-label="주 메뉴" className="nav">{NAV.map(([h, l]) => <Link key={h} href={h}>{l}</Link>)}</nav>
    </header>
  );
}
