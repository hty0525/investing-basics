'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
const ITEMS: [string, string, string][] = [['/', '홈', '🏠'], ['/simulator/', '시뮬레이터', '📈'], ['/calculator/', '계산기', '🧮'], ['/etf/', 'ETF', '📋'], ['/guide/', '사용법', '❓']];
export default function MobileNav() {
  const p = usePathname() || '/';
  const on = (h: string) => (h === '/' ? p === '/' || p === '' : p.startsWith(h));
  return (
    <nav className="mnav" aria-label="모바일 메뉴">
      {ITEMS.map(([h, l, i]) => (<Link key={h} href={h} className={on(h) ? 'on' : ''}><span aria-hidden="true">{i}</span>{l}</Link>))}
    </nav>
  );
}
