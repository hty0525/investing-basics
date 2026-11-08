import { sparkPath } from '@/lib/stats';
export default function Spark({ k, title, start }: { k: string; title: string; start?: string }) {
  const s = sparkPath(k, 640, 180, 220, start);
  return (
    <figure className="spark">
      <svg viewBox="0 0 640 180" role="img" aria-label={title} preserveAspectRatio="none">
        <title>{title}</title>
        <path d={s.path} fill="none" stroke="var(--ac)" strokeWidth="2" vectorEffect="non-scaling-stroke" />
      </svg>
      <figcaption className="mut">{s.from} ~ {s.to} · 로그 스케일 가격 추이(분배금 제외, 현지통화) · 같은 기간 가격 변화 {(s.last * 100).toFixed(1)}%</figcaption>
    </figure>
  );
}
