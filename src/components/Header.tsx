import Link from 'next/link';
import ModeToggle from './ModeToggle';
const NAV: [string, string][] = [['/guide/', '사용법'], ['/concepts/', '개념'], ['/etf/', 'ETF'], ['/compare/', '유형별 비교'], ['/simulator/', '시뮬레이터'], ['/calculator/', '가정 계산기'], ['/rolling/', '과거 롤링'], ['/sources/', '출처·검증']];
export default function Header() {
  return (
    <header className="hdr">
      <Link href="/" className="brand">📊 투자 기초</Link>
      <ModeToggle />
      <nav aria-label="주 메뉴" className="nav">{NAV.map(([h, l]) => <Link key={h} href={h}>{l}</Link>)}</nav>
    </header>
  );
}
