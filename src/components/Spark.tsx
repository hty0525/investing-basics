import { sparkPath } from '@/lib/stats';
import { P, loadSeries } from '@/lib/data';
import PriceChart from './PriceChart';

export default function Spark({ k, title, start }: { k: string; title: string; start?: string }) {
  const s = sparkPath(k, 640, 180, 220, start);
  const series = loadSeries(k);
  return (
    <PriceChart
      ticker={k}
      title={title}
      path={s.path}
      from={s.from}
      to={s.to}
      change={s.last}
      currency={P(k).currency}
      lastPrice={series.c[series.c.length - 1]}
    />
  );
}
