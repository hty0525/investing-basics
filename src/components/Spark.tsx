import { sparkPath } from '@/lib/stats';
import { P, loadSeries } from '@/lib/data';
import PriceChart from './PriceChart';

export default function Spark({ k, title, start }: { k: string; title: string; start?: string }) {
  const series = loadSeries(k);
  // Match the interactive chart's default 1-year window to avoid a jump
  // from all-time history to a short range when client data finishes loading.
  const lastDate = new Date(series.d[series.d.length - 1] + 'T00:00:00Z');
  lastDate.setUTCFullYear(lastDate.getUTCFullYear() - 1);
  const defaultStart = lastDate.toISOString().slice(0, 10);
  const s = sparkPath(k, 640, 180, 220, start ?? defaultStart);
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
