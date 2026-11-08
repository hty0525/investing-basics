import Table from './Table';
import Tag from './Tag';
import { FACT, P, isKR } from '@/lib/data';
const W = <Tag kind="wait">검증 대기</Tag>;
export function factRows(k: string): [string, React.ReactNode][] {
  const f = FACT(k), p = P(k);
  const hedge = f.hedge ?? (isKR(k) ? null : '해당 없음(USD 거래)');
  return [
    ['ETF명', (f.name ?? p.name ?? k) + (f.name_history ? ` (${f.name_history})` : '')],
    ['티커/시장', `${p.ticker} · ${f.exchange ?? p.exchange}`],
    ['운용사', f.issuer ?? W],
    ['추종지수', f.index ? <>{f.index}{f.secondary ? <> <Tag kind="wait">2차 출처</Tag></> : null}</> : W],
    ['거래 통화', p.currency],
    ['환헤지/환노출', hedge ?? W],
    ['설정일', f.inception ?? W],
    ['상장일', f.listing ?? W],
    ['데이터상 첫 거래일', p.first],
    ['분배 정책', f.dist ?? W],
    ['총보수', f.fee_pct == null ? W : <>{f.fee_pct}% <span className="mut">({f.fee_asof ?? '기준일 확인 필요'})</span></>],
    ['총보수+기타비용', f.real_fee_pct == null ? '-' : `${f.real_fee_pct}%`],
    ['추적오차/괴리', f.tracking ?? <Tag kind="wait">공시값 확인 못함</Tag>],
    ['전략/구조', f.strategy ?? W],
    ['동일 지수 대응', f.same_index_as?.length ? f.same_index_as.join(', ') : <Tag kind="wait">확인되지 않음</Tag>],
    ...(f.structure_note ? ([['구조 변경 주의', <span className="warn" key="s">{f.structure_note}</span>]] as [string, React.ReactNode][]) : []),
    ['데이터 기준일', p.last],
  ];
}
export default function FactTable({ k }: { k: string }) {
  const rows = factRows(k); const f = FACT(k);
  return (
    <>
      <Table head={['항목', '내용']} rows={rows.map(([a, b]) => [a, b])} caption="공식 자료 기준 상품 정보" />
      <p className="mut">공식 출처: {f.sources?.length ? f.sources.slice(0, 3).map((u, i) => <span key={u}>{i ? ' · ' : ''}<a href={u} rel="noopener nofollow" target="_blank">{u.replace(/^https?:\/\//, '').slice(0, 52)}</a></span>) : '확인 대기'}</p>
      {f.notes ? <details><summary>조사 메모</summary><p className="mut">{String(f.notes).replace(/\bnull\b/g, '확인 못함')}</p></details> : null}
    </>
  );
}
