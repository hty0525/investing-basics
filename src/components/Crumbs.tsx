import Link from 'next/link';
import JsonLd from './JsonLd';
import { crumbLd } from '@/lib/seo';
export default function Crumbs({ items }: { items: { name: string; path: string }[] }) {
  const all = [{ name: '홈', path: '/' }, ...items];
  return (
    <nav aria-label="breadcrumb" className="crumbs">
      {all.map((it, i) => (
        <span key={it.path}>{i < all.length - 1 ? <Link href={it.path}>{it.name}</Link> : <span aria-current="page">{it.name}</span>}{i < all.length - 1 ? ' › ' : ''}</span>
      ))}
      <JsonLd data={crumbLd(all)} />
    </nav>
  );
}
