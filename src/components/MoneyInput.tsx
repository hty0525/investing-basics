'use client';
export function koWon(n: number) {
  if (!n) return '0원';
  const eok = Math.floor(n / 1e8), man = Math.floor((n % 1e8) / 1e4), rest = n % 1e4;
  return [eok ? `${eok.toLocaleString('ko-KR')}억` : '', man ? `${man.toLocaleString('ko-KR')}만` : '', rest ? rest.toLocaleString('ko-KR') : ''].filter(Boolean).join(' ') + '원';
}
/** 천 단위 쉼표 자동 입력 + 한글 금액 보조 표시 */
export default function MoneyInput({ id, value, onChange, max = 1e13, label }: { id?: string; value: number; onChange: (n: number) => void; max?: number; label?: string }) {
  return (
    <>
      <input id={id} aria-label={label} type="text" inputMode="numeric" autoComplete="off" value={value ? value.toLocaleString('ko-KR') : ''} placeholder="0"
        onChange={(e) => { const d = e.target.value.replace(/[^\d]/g, '').slice(0, 14); onChange(Math.min(max, d ? Number(d) : 0)); }} />
      <div className="mut" style={{ fontSize: 12, marginTop: 2 }}>= {koWon(value)}</div>
    </>
  );
}
