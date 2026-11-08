'use client';
import { useEffect, useState } from 'react';
export type Mode = 'visual' | 'easy' | 'detail';
const KEY = 'ib-mode';
export function useMode(): Mode {
  const [m, setM] = useState<Mode>('visual');
  useEffect(() => {
    const read = () => setM((document.documentElement.dataset.mode as Mode) || 'visual');
    read(); const o = new MutationObserver(read); o.observe(document.documentElement, { attributes: true, attributeFilter: ['data-mode'] });
    return () => o.disconnect();
  }, []);
  return m;
}
export default function ModeToggle() {
  const m = useMode();
  const set = (v: Mode) => { document.documentElement.dataset.mode = v; try { localStorage.setItem(KEY, v); } catch { /* ignore */ } };
  return (
    <div className="seg" role="group" aria-label="보기 방식: 그림으로, 간단하게, 상세하게">
      <button className={m === 'visual' ? 'on' : ''} aria-pressed={m === 'visual'} onClick={() => set('visual')}>그림으로</button>
      <button className={m === 'easy' ? 'on' : ''} aria-pressed={m === 'easy'} onClick={() => set('easy')}>간단히</button>
      <button className={m === 'detail' ? 'on' : ''} aria-pressed={m === 'detail'} onClick={() => set('detail')}>상세히</button>
    </div>
  );
}
