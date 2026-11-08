'use client';
import Link from 'next/link';
import { useState } from 'react';
const L: Record<string, string> = { sp500: '미국 대형주(S&P500)', ndx: '나스닥100', total: '미국 전체시장', world: '글로벌 주식', bond: '채권·단기자금', div: '배당주', divg: '배당성장', income: '옵션 인컴' };
export default function GoalGuide() {
  const [g, setG] = useState('grow'), [r, setR] = useState('us'), [f, setF] = useState('high');
  let types: string[], checks: string[];
  if (g === 'income') { types = ['div', 'divg', 'income']; checks = ['분배금의 원천(배당/이자/옵션 프리미엄/원금)', '상승 이익 제한 여부', '분배금 감소 이력', '세금(계좌 유형별)']; }
  else if (g === 'safe') { types = ['bond']; checks = ['듀레이션과 금리 민감도', '환율 위험', '2022년 같은 금리 상승기 낙폭', '인출 예정일']; }
  else if (r === 'world') { types = ['world', 'total', f === 'high' ? 'bond' : 'sp500']; checks = ['국가·지수 구성', '최악 낙폭과 회복기간', '환율 위험', '인출 예정일']; }
  else { types = f === 'high' ? ['sp500', 'world', 'bond'] : ['sp500', 'ndx', 'total']; checks = ['최악 낙폭·회복기간', '인출 예정일', '환율 위험', '특정 업종·기업 집중도']; }
  return (
    <div className="card">
      <h2 style={{ marginTop: 0 }}>내 목적에 맞게 먼저 볼 유형 찾기 <span className="tag">추천 아님</span></h2>
      <div className="grid g3">
        <div><label htmlFor="gg">투자 목적</label><select id="gg" value={g} onChange={(e) => setG(e.target.value)}><option value="grow">장기 자산 증식</option><option value="income">현금 분배(인컴) 관심</option><option value="safe">변동성 낮추기·단기 자금</option></select></div>
        <div><label htmlFor="gr">투자 지역</label><select id="gr" value={r} onChange={(e) => setR(e.target.value)}><option value="us">미국 주식 중심</option><option value="world">전 세계 분산</option></select></div>
        <div><label htmlFor="gf">큰 손실에 대한 부담</label><select id="gf" value={f} onChange={(e) => setF(e.target.value)}><option value="high">크다</option><option value="low">감수 가능</option></select></div>
      </div>
      <p style={{ marginTop: 10 }}><b>먼저 비교할 유형:</b> {types.map((t) => <Link key={t} className="btn sec" style={{ margin: '0 4px 4px 0' }} href={`/compare/${t}/`}>{L[t]}</Link>)}</p>
      <p><b>반드시 확인할 항목:</b> {checks.join(' · ')}</p>
      <p className="mut">개인별 적합성 판정: 제공하지 않음 · 특정 상품 추천 아님</p>
    </div>
  );
}
