import Engine from './engine.js';
import { engineData, FACT, label, P, loadSeries } from './data';
import { totalReturn } from './stats';
import { rolling } from './rolling';
import { pct, won } from './fmt';
import { loadFx } from './data';

export type Vis =
  | { type: 'bars'; data: { l: string; v: number; note?: string }[]; fmt?: 'pct' | 'raw' }
  | { type: 'lines'; series: { y: number[]; color: string; dash?: boolean; name: string }[]; marks?: { i: number; label: string; color?: string }[]; x0: string; x1: string }
  | { type: 'icons'; items: { e: string; t: string }[] };
export type DeckCard = { title: string; line: string; vis: Vis; worst?: string; foot?: string; href?: string };

const ds = (a: number[], n = 110) => { if (a.length <= n) return a; const st = (a.length - 1) / (n - 1); return Array.from({ length: n }, (_, i) => a[Math.round(i * st)]); };
const run = (k: string, o: Record<string, unknown>) => Engine.run(engineData([k]), [{ k, w: 1 }], { reinvest: true, fee: 0, spread: 0, lump: 0, ...o });
const yb = (k: string, y: number) => { const t = new Date(P(k).last); t.setFullYear(t.getFullYear() - y); const s = t.toISOString().slice(0, 10); return s < P(k).first ? P(k).first : s; };
const fxAt = (d: string) => { const f = loadFx(); let lo = 0, hi = f.d.length - 1, r = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (f.d[m] <= d) { r = m; lo = m + 1; } else hi = m - 1; } return f.r[r]; };
const priceLine = (k: string, start: string) => { const s = loadSeries(k); const i0 = s.d.findIndex((d) => d >= start); return { d: s.d.slice(i0), c: s.c.slice(i0) }; };
const baseNote = '과거 실제 데이터 · 원화 · 세전';

export function buildCards(slug: string): DeckCard[] {
  switch (slug) {
    case 'dca': {
      const k = 'VOO'; const pl = priceLine(k, yb(k, 2)); const y = pl.c; const marks: { i: number; label: string }[] = []; let last = '';
      pl.d.forEach((d, i) => { if (d.slice(0, 7) !== last) { last = d.slice(0, 7); marks.push({ i: Math.round((i / (y.length - 1)) * 109), label: '' }); } });
      const q = 'QQQM', s = yb(q, 5), a = run(q, { monthly: 1e6, start: s, end: P(q).last });
      const roll = rolling('VOO', [5]).find((w) => w.years === 5);
      return [
        { title: '매달 같은 금액을 사요', line: '가격이 오르내려도 금액은 그대로. 비쌀 땐 적게, 쌀 땐 많이 사게 돼요.', vis: { type: 'lines', series: [{ y: ds(y), color: '#6db3ff', name: `${k} 가격` }], marks, x0: pl.d[0], x1: pl.d[pl.d.length - 1] }, foot: '점 = 매달 첫 거래일에 같은 금액을 산 날 · 과거 실제 가격' },
        { title: '그러면 결과는?', line: `${won(a.summary.principal)}을 넣어 ${won(a.summary.value)}이 됐어요(${pct(a.summary.ret)}).`, vis: { type: 'lines', series: [{ y: ds(a.series.map((v: { principal: number }) => v.principal)), color: '#a3aec6', dash: true, name: '넣은 돈' }, { y: ds(a.series.map((v: { value: number }) => v.value)), color: '#c792ff', name: '평가액' }], x0: a.summary.start, x1: a.summary.end }, foot: `${q} 월 100만원 · ${baseNote}` },
        { title: '그런데 최악도 있었어요', line: '같은 ETF도 언제 시작했느냐에 따라 결과가 크게 달랐어요.', vis: { type: 'bars', fmt: 'pct', data: roll ? [{ l: '운 나쁜 시작', v: roll.ret.min, note: roll.worstStart.d.slice(0, 7) }, { l: '중앙값', v: roll.ret.median }, { l: '운 좋은 시작', v: roll.ret.max, note: roll.bestStart.d.slice(0, 7) }] : [] }, worst: a.summary.worstLossPct ? `가장 힘들었을 땐 넣은 돈보다 ${pct(Math.abs(a.summary.worstLossPct))} 적었어요` : undefined, foot: `VOO 5년 적립 · 월 100만원 · ${baseNote}` },
      ];
    }
    case 'price-vs-total-return': {
      const ks = ['SCHD', 'VYM', 'VOO']; const rs = ks.map((k) => ({ k, r: totalReturn(k, yb(k, 5), P(k).last)! }));
      return [
        { title: '번 돈은 두 가지로 셀 수 있어요', line: '가격이 오른 것만 센 것(가격수익률)과, 배당금까지 더한 것(총수익률)은 달라요.', vis: { type: 'bars', fmt: 'pct', data: rs.flatMap(({ k, r }) => [{ l: `${k} 가격만`, v: r.price }, { l: `${k} 배당 더함`, v: r.total }]) }, foot: '최근 5년 · USD · 세전 · 총수익률 = 분배금 재투자' },
        { title: '배당금이 나오면?', line: '배당금(분배금)이 나온 날 ETF 가격은 대체로 그만큼 내려가요. 그래서 더해서 봐요.', vis: { type: 'icons', items: [{ e: '💰', t: '배당금 받음' }, { e: '⬇️', t: '가격은 그만큼 하락' }, { e: '➕', t: '둘을 합쳐서 비교' }] } },
        { title: '배당이 많다고 유리하진 않아요', line: '배당만 많이 주는 걸 보고 고르면, 전체로 번 돈은 오히려 적을 수 있어요.', vis: { type: 'icons', items: [{ e: '⚠️', t: '배당 많음 ≠ 많이 벎' }] }, worst: '가격이 내려가면 배당을 받아도 손해일 수 있어요' },
      ];
    }
    case 'xirr': {
      const ks = ['VOO', 'QQQM', 'SCHD']; const rs = ks.map((k) => ({ k, r: run(k, { monthly: 1e6, start: yb(k, 3), end: P(k).last }).summary }));
      return [
        { title: '같은 결과, 두 가지 숫자', line: '“넣은 돈 대비 몇 %”와 “1년에 평균 몇 %(XIRR)”는 서로 다른 숫자예요.', vis: { type: 'bars', fmt: 'pct', data: rs.flatMap(({ k, r }) => [{ l: `${k} 넣은 돈 대비`, v: r.ret }, { l: `${k} 연 평균`, v: r.xirr }]) }, foot: '최근 3년 월 100만원 · ' + baseNote },
        { title: '왜 다를까요?', line: '적립식은 돈이 들어간 시기가 제각각이라, 평균 투자 기간이 짧아요.', vis: { type: 'icons', items: [{ e: '📅', t: '앞에 넣은 돈은 오래 굴림' }, { e: '🆕', t: '최근 넣은 돈은 거의 안 불어남' }] } },
      ];
    }
    case 'mdd-vs-underwater': {
      const k = 'QQQM'; const r = run(k, { monthly: 1e6, start: '2021-11-01', end: P(k).last }); const m = r.etf[0].local; const u = r.summary.underwater; const pl = priceLine(k, '2021-11-01');
      return [
        { title: '가장 많이 떨어졌던 때', line: `가격이 제일 비쌌을 때보다 ${pct(Math.abs(m.mdd))}까지 내려갔어요.`, vis: { type: 'lines', series: [{ y: ds(pl.c), color: '#6db3ff', name: `${k} 가격` }], x0: pl.d[0], x1: pl.d[pl.d.length - 1] }, worst: `가장 많이 떨어진 폭(최대낙폭) ${pct(m.mdd)} · ${m.peakDate} → ${m.troughDate}`, foot: '가격 기준 · 분배금 제외 · 현지통화' },
        { title: '내 계좌는 다르게 움직여요', line: '계속 돈을 넣고 있으니, 지금 가치가 넣은 돈보다 적은 기간(원금 미달)을 따로 봐요.', vis: { type: 'lines', series: [{ y: ds(r.series.map((v: { principal: number }) => v.principal)), color: '#a3aec6', dash: true, name: '넣은 돈' }, { y: ds(r.series.map((v: { value: number }) => v.value)), color: '#c792ff', name: '평가액' }], x0: r.summary.start, x1: r.summary.end }, worst: u.length ? `넣은 돈보다 적었던 적 ${u.length}번, 가장 길었던 건 ${Math.round(Math.max(...u.map((x: { days: number }) => x.days)))}일` : undefined, foot: `${k} 월 100만원 · ${baseNote}` },
      ];
    }
    case 'fx-decomposition': {
      const k = 'VOO'; const s = yb(k, 3), r = totalReturn(k, s, P(k).last)!; const f0 = fxAt(r.start), f1 = fxAt(P(k).last), rf = f1 / f0 - 1;
      return [
        { title: '내 수익 = 달러 자산 × 환율', line: '달러로 오른 만큼, 환율이 변한 만큼 곱해져서 원화 수익이 돼요.', vis: { type: 'bars', fmt: 'pct', data: [{ l: '달러로 오른 폭', v: r.price }, { l: '환율이 변한 폭', v: rf }, { l: '원화로는 오른 폭', v: (1 + r.price) * (1 + rf) - 1 }] }, foot: `${k} 최근 3년 일시금 가정 · 환율 ${f0.toFixed(0)}→${f1.toFixed(0)}원` },
        { title: '환율이 반대로 가면?', line: '자산이 올라도 원화가 강해지면(환율 하락) 원화로는 덜 벌어요.', vis: { type: 'icons', items: [{ e: '📈', t: '달러 자산 상승' }, { e: '💱', t: '환율 하락' }, { e: '😕', t: '원화 수익 감소' }] }, worst: '반대 방향이면 손실이 더 커질 수도 있어요' },
      ];
    }
    case 'hedge': {
      const a = '379800', b = '449180'; const s = P(a).first > P(b).first ? P(a).first : P(b).first; const ra = totalReturn(a, s, P(a).last)!, rb = totalReturn(b, s, P(a).last)!;
      return [
        { title: '이름에 (H)가 붙은 ETF', line: '환율 영향을 줄이도록 만든 상품(환헤지)이에요. 완전히 없애진 못해요.', vis: { type: 'bars', fmt: 'pct', data: [{ l: '환노출 (KODEX 미국S&P500)', v: ra.price }, { l: '환헤지(H)', v: rb.price }] }, foot: `${s}~ 같은 기간 가격수익률 · 구조 차이가 섞여 순수한 헤지 효과만은 아니에요` },
        { title: '어느 쪽이 낫다고 말할 수 없어요', line: '원화 약세 땐 환노출, 강세 땐 환헤지가 유리했을 수 있어요. 기간에 따라 달라요.', vis: { type: 'icons', items: [{ e: '⚖️', t: '우열이 아니라 위험 노출의 차이' }] } },
      ];
    }
    case 'fees-tracking': {
      const ks = ['VOO', 'IVV', 'SPY', 'QQQM', 'QQQ'];
      return [
        { title: '해마다 빠지는 비용(총보수)', line: '같은 걸 따라가도 상품마다 비용이 달라요.', vis: { type: 'bars', fmt: 'raw', data: ks.map((k) => ({ l: k, v: FACT(k).fee_pct ?? 0, note: FACT(k).fee_pct == null ? '검증 대기' : '%' })) }, foot: '운용사 공식 자료 · 단위 % · 변경될 수 있어요' },
        { title: '비용을 또 빼면 안 돼요', line: '비용은 가격에 이미 반영돼 있어요. 또 빼면 두 번 빼는 거예요.', vis: { type: 'icons', items: [{ e: '🧾', t: '비용은 가격에 반영됨' }, { e: '🚫', t: '또 빼기 금지' }] } },
      ];
    }
    case 'bond-duration': {
      const ks = ['BND', 'AGG', 'SGOV', '305080'].filter((k) => P(k).first <= '2022-01-01'); const rs = ks.map((k) => ({ k, r: totalReturn(k, '2022-01-01', '2022-12-31')! }));
      return [
        { title: '채권도 떨어질 수 있어요', line: '2022년에 금리(이자율)가 오르자 채권 ETF 가격이 내려갔어요.', vis: { type: 'bars', fmt: 'pct', data: rs.map(({ k, r }) => ({ l: label(k), v: r.price })) }, worst: '만기가 길수록 더 많이 떨어졌어요', foot: '2022년 연간 가격변화 · 현지통화 · 분배금 제외' },
        { title: '금리에 얼마나 민감한가(듀레이션)', line: '이 숫자가 클수록 금리가 바뀔 때 가격이 더 크게 흔들려요.', vis: { type: 'icons', items: [{ e: '⏳', t: '만기 길다' }, { e: '📉', t: '금리 오르면 더 크게 하락' }] } },
      ];
    }
    case 'covered-call': {
      const s = P('JEPQ').first, e = P('JEPQ').last; const a = totalReturn('JEPQ', s, e)!, b = totalReturn('QQQM', s, e)!;
      return [
        { title: '배당금을 많이 주는 ETF', line: '주식을 들고 옵션을 팔아서 배당금을 만드는 전략(커버드콜)이에요.', vis: { type: 'bars', fmt: 'pct', data: [{ l: 'JEPQ 총수익', v: a.total }, { l: 'QQQM 총수익', v: b.total }, { l: 'JEPQ 가장 많이 떨어진 폭', v: a.mdd.mdd }, { l: 'QQQM 가장 많이 떨어진 폭', v: b.mdd.mdd }] }, foot: `${s}~ · USD · 세전 · 서로 다른 전략의 구조 차이를 보는 예시일 뿐 우열이 아니에요` },
        { title: '배당이 많다 ≠ 많이 번다', line: '많이 오르는 장에서는 덜 오를 수 있고, 배당금 일부는 내 원금을 돌려주는 걸 수도 있어요.', vis: { type: 'icons', items: [{ e: '✂️', t: '상승 이익 제한' }, { e: '❓', t: '배당금이 어디서 나오는지 확인' }] }, worst: '하락장에서는 주식 하락 위험은 그대로예요' },
      ];
    }
    case 'tax-basics':
    default:
      return [
        { title: '세금은 별도로 확인해요', line: '계좌 종류, 미국/국내 상장, 시점에 따라 달라요.', vis: { type: 'icons', items: [{ e: '🏦', t: '계좌 종류' }, { e: '🌎', t: '미국/국내 상장' }, { e: '📆', t: '적용 시점' }] } },
        { title: '이 사이트 숫자는 세금 떼기 전(세전)', line: '세후 수익은 계산하지 않아요. 공식 자료로 직접 확인하세요.', vis: { type: 'icons', items: [{ e: '📋', t: '국세청·금융기관 안내 확인' }] }, worst: '세금을 빼면 실제 수익은 더 낮을 수 있어요' },
      ];
  }
}
