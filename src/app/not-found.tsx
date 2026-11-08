import Link from 'next/link';
export default function NotFound() {
  return (<div className="prose"><h1>페이지를 찾을 수 없습니다</h1><p><Link href="/">홈으로</Link> 또는 <Link href="/etf/">ETF 목록</Link>으로 이동하세요.</p></div>);
}
