import Engine from './engine.js';
import { engineData, FACT, label, P } from './data';
import { pct, won } from './fmt';
import { totalReturn, horizon, FX_START } from './stats';
import { loadFx } from './data';

export type Example = { caption: string; head: string[]; rows: string[][]; note?: string };
export type Concept = {
  slug: string; title: string; short: string; description: string; keywords: string[];
  sections: { h: string; p: string[] }[]; faq: { q: string; a: string }[]; related: string[];
  example?: () => Example;
};
const fxAt = (d: string) => { const f = loadFx(); let lo = 0, hi = f.d.length - 1, r = -1; while (lo <= hi) { const m = (lo + hi) >> 1; if (f.d[m] <= d) { r = m; lo = m + 1; } else hi = m - 1; } return r < 0 ? null : f.r[r]; };
const run = (k: string, o: Record<string, unknown>) => Engine.run(engineData([k]), [{ k, w: 1 }], { reinvest: true, fee: 0, spread: 0, lump: 0, ...o });
const yearsBack = (k: string, y: number) => { const t = new Date(P(k).last); t.setFullYear(t.getFullYear() - y); const s = t.toISOString().slice(0, 10); return s < P(k).first ? P(k).first : s; };

export const CONCEPTS: Concept[] = [
  {
    slug: 'dca', title: '적립식 투자(DCA)란? 시점 분산이지 손실 방지가 아닙니다',
    short: '정해진 금액을 정해진 간격으로 꾸준히 사는 방식. 매수 시점을 분산하지만 손실을 막아주지는 않습니다.',
    description: '적립식 투자(Dollar-Cost Averaging)의 원리, 장점, 한계를 실제 ETF 과거 데이터로 일시금 투자와 나란히 설명합니다.',
    keywords: ['적립식 투자', 'DCA', '분할 매수', '일시금 투자', '평균 매입단가'],
    sections: [
      { h: '무엇인가', p: ['DCA(Dollar-Cost Averaging)는 매달 100만원처럼 같은 금액을 일정한 주기로 투자하는 방법입니다. 이름의 ‘달러’는 미국 돈이 아니라 투자 금액을 뜻하며, 원화로 투자해도 같은 방식입니다.', '가격이 낮을 때는 같은 금액으로 더 많은 수량을, 높을 때는 더 적은 수량을 사게 되어 매수 시점이 자연스럽게 분산됩니다.'] },
      { h: '좋은 점', p: ['언제 사야 할지 고민하는 부담이 줄고 투자 습관을 만들기 쉽습니다. 하락기에는 같은 돈으로 더 많은 수량이 쌓입니다.'] },
      { h: '한계', p: ['원금과 수익은 보장되지 않습니다. 시장이 장기간 하락하면 계속 적립해도 평가액이 납입원금보다 낮을 수 있고, 꾸준히 상승한 시장에서는 먼저 목돈을 투자한 쪽이 유리했을 수 있습니다.', '또한 적립식과 일시금은 자금 사정이 다릅니다. 월급처럼 매달 현금이 들어오는 사람은 일시금 투자를 선택지로 갖고 있지 않으므로 두 결과를 단순 비교하면 오해가 생깁니다.'] },
      { h: '이 사이트에서 보는 법', p: ['시뮬레이터는 적립식 결과와 같은 총액을 시작일에 한 번에 투자한 결과를 나란히 보여주되, ‘초기 목돈 보유’와 ‘매달 신규 현금 유입’ 시나리오를 분리해 표시합니다.'] },
    ],
    faq: [{ q: 'DCA의 ‘달러’는 미국 달러인가요?', a: '아닙니다. 투자 금액을 뜻하는 관용어이며 원화로도 같은 방식으로 투자할 수 있습니다.' }, { q: '적립식이면 손실을 막을 수 있나요?', a: '막지 못합니다. 매수 시점을 분산할 뿐이며 시장이 장기간 하락하면 손실이 날 수 있습니다.' }],
    related: ['xirr', 'mdd-vs-underwater'],
    example: () => {
      const k = 'QQQM'; const s = yearsBack(k, 5); const e = P(k).last;
      const a = run(k, { monthly: 1e6, start: s, end: e }); const l = run(k, { monthly: 0, lump: a.summary.principal, start: s, end: e });
      return { caption: `${k} · ${a.summary.start} ~ ${a.summary.end} · 월 100만원 vs 같은 총액 일시금(원화 기준, 분배금 재투자, 세전)`, head: ['시나리오', '납입원금', '평가액', '수익률', '비고'], rows: [
        ['B. 매달 적립(신규 현금 유입)', won(a.summary.principal), won(a.summary.value), pct(a.summary.ret), `최악 원금 대비 ${pct(a.summary.worstLossPct)}`],
        ['A. 시작일 일시금(목돈 보유 가정)', won(l.summary.principal), won(l.summary.value), pct(l.summary.ret), '자금 가용 조건이 다름']], note: '과거 데이터 기반 계산이며 미래 성과를 의미하지 않습니다.' };
    },
  },
  {
    slug: 'price-vs-total-return', title: '가격수익률과 총수익률의 차이 — 배당금이 만드는 착시',
    short: '가격수익률은 종가 변화만, 총수익률은 분배금을 재투자한 값까지 포함합니다. 둘을 같은 지표처럼 비교하면 안 됩니다.',
    description: '배당주·인컴 ETF를 비교할 때 가격수익률과 총수익률을 구분해야 하는 이유를 실제 ETF 데이터로 설명합니다.',
    keywords: ['총수익률', '가격수익률', '배당 재투자', '분배금', '배당주 ETF'],
    sections: [
      { h: '무엇이 다른가', p: ['가격수익률은 매수가와 현재가의 차이만 봅니다. 총수익률은 중간에 받은 분배금을 다시 투자했다고 가정해 더한 값입니다.', '분배금이 지급되면 ETF 가격이 대체로 그만큼 내려가기 때문에, 분배금이 큰 ETF일수록 가격수익률이 총수익률보다 낮게 보입니다.'] },
      { h: '흔한 오해', p: ['“배당이 많으면 총수익이 높다”는 생각은 틀릴 수 있습니다. 분배금은 가격에서 빠져나간 돈이 입금되는 것에 가깝기 때문에, 분배율만으로 우열을 판단하면 안 됩니다.'] },
      { h: '이중 반영 주의', p: ['수정주가에는 분배금이 이미 반영되어 있습니다. 수정주가에 분배금을 다시 더하면 이중 반영입니다. 이 사이트는 분할만 반영한 종가를 쓰고 분배금을 별도로 재투자해 이중 반영을 피합니다.'] },
    ],
    faq: [{ q: '분배금이 많은 ETF가 더 수익이 좋은가요?', a: '그렇지 않을 수 있습니다. 분배금은 가격 하락과 함께 지급되므로 가격 변화와 합친 총수익률로 비교해야 합니다.' }],
    related: ['covered-call', 'fees-tracking'],
    example: () => {
      const ks = ['SCHD', 'VYM', 'VOO']; return { caption: '최근 5년(USD, 세전, 분배금은 배당락일 종가에 재투자 가정)', head: ['ETF', '가격수익률', '총수익률', '분배금 기여(%p)'], rows: ks.map((k) => { const r = horizon(k, 5); return [k, pct(r?.price), pct(r?.total), r ? (((r.total - r.price) * 100).toFixed(1) + '%p') : '자료 부족']; }) };
    },
  },
  {
    slug: 'xirr', title: '납입금 대비 수익률과 XIRR — 적립식 수익률을 제대로 읽는 법',
    short: '매달 넣는 적립식은 돈이 들어간 기간이 제각각이라, 단순 누적 수익률과 연환산 수익률(XIRR)은 다른 숫자입니다.',
    description: '적립식 투자의 수익률을 납입금 대비 수익률과 XIRR로 구분해 설명하고 실제 ETF 데이터로 두 값의 차이를 보여줍니다.',
    keywords: ['XIRR', '적립식 수익률', '납입금 대비 수익률', '연환산 수익률'],
    sections: [
      { h: '두 숫자는 다릅니다', p: ['납입금 대비 수익률은 (평가액 − 납입원금) ÷ 납입원금입니다. 마지막에 넣은 돈은 아직 거의 불어나지 않았는데도 분모에 들어가므로 적립식에서는 연 수익률보다 작아 보입니다.', 'XIRR은 각 납입일과 평가일을 고려해 연환산한 수익률입니다. 같은 결과를 서로 다르게 표현한 값이라 크기를 직접 비교하면 안 됩니다.'] },
      { h: '언제 어떤 걸 보나', p: ['“넣은 돈이 얼마가 되었나”를 보려면 납입금 대비 수익률, 다른 투자와 연 단위로 비교하려면 XIRR이 적합합니다. 이 사이트는 두 이름을 섞어 쓰지 않고 따로 표시합니다.'] },
    ],
    faq: [{ q: 'XIRR이 단순 수익률보다 높게 나오는 이유는?', a: '적립식은 평균적으로 투자 기간이 전체 기간보다 짧기 때문에 같은 손익이라도 연환산하면 더 큰 값이 나옵니다.' }],
    related: ['dca', 'mdd-vs-underwater'],
    example: () => {
      const ks = ['VOO', 'QQQM', 'SCHD']; return { caption: '최근 3년 월 100만원 적립(원화 기준, 분배금 재투자, 세전)', head: ['ETF', '기간', '납입금 대비 수익률', 'XIRR(연환산)'], rows: ks.map((k) => { const r = run(k, { monthly: 1e6, start: yearsBack(k, 3), end: P(k).last }).summary; return [k, `${r.start}~${r.end}`, pct(r.ret), pct(r.xirr)]; }) };
    },
  },
  {
    slug: 'mdd-vs-underwater', title: 'ETF 최대낙폭(MDD)과 적립식 원금 미달은 다른 지표입니다',
    short: 'ETF가 전고점을 회복했는지와 내 적립식 계좌가 원금을 회복했는지는 서로 다른 질문입니다.',
    description: '최대낙폭(MDD), 최고가 회복기간, 적립식 계좌의 원금 미달 구간과 회복 시점의 차이를 실제 데이터로 설명합니다.',
    keywords: ['최대낙폭', 'MDD', '회복기간', '원금 미달', '적립식 손실'],
    sections: [
      { h: 'ETF 기준 지표', p: ['MDD는 과거 최고점에서 가장 크게 떨어진 비율, 회복기간은 그 최고점 가격을 다시 넘기까지 걸린 시간입니다. 가격 기준 지표이며 미래 최대 손실 한도가 아닙니다.'] },
      { h: '내 계좌 기준 지표', p: ['적립식 계좌는 추가 납입이 있어 평가액이 계속 늘어납니다. 그래서 ‘평가액이 누적 납입원금보다 낮은 상태’(원금 미달)를 따로 정의하고, 그 상태가 해소될 때까지의 기간을 원금 회복기간으로 봅니다.', '계좌 평가액의 고점 대비 낙폭도 ETF MDD와 섞이지 않도록 별도 이름으로 표시합니다.'] },
      { h: '왜 구분하나', p: ['ETF가 전고점을 회복하지 못했어도 하락기에 싸게 쌓은 수량 덕에 계좌는 원금을 회복했을 수 있고, 반대로 마지막 납입 직후 하락하면 ETF가 회복해도 계좌는 원금 미달일 수 있습니다.'] },
    ],
    faq: [{ q: '최대낙폭이 -30%였다면 앞으로도 -30%까지만 떨어지나요?', a: '그렇지 않습니다. 과거 최대낙폭은 미래 하락 폭의 한도를 의미하지 않습니다.' }],
    related: ['dca', 'xirr'],
    example: () => {
      const k = 'QQQM'; const r = run(k, { monthly: 1e6, start: '2021-11-01', end: P(k).last }); const m = r.etf[0].local; const u = r.summary.underwater;
      return { caption: `${k} · 2021-11 ~ 현재 월 100만원 적립`, head: ['지표', '값', '시점/설명'], rows: [
        ['ETF 가격 MDD(USD)', pct(m.mdd), `${m.peakDate} → ${m.troughDate}`], ['ETF 최고가 회복', m.recoveryDate ?? '기간 내 미회복', m.recoveryDays ? `저점 후 ${m.recoveryDays}일` : ''],
        ['계좌 최악 손실(납입금 대비)', pct(r.summary.worstLossPct), r.summary.worstLossPctDate ?? ''], ['원금 미달 구간', `${u.length}회`, u.length ? `가장 긴 구간 ${Math.round(Math.max(...u.map((x: { days: number }) => x.days)))}일` : '없음']] };
    },
  },
  {
    slug: 'fx-decomposition', title: '환율이 수익률에 미치는 영향 — 원화 수익률 분해',
    short: '원화 수익률은 (1 + 현지통화 수익률) × (1 + 환율 변동) − 1 입니다. 자산이 올라도 환율이 내리면 원화 수익은 줄어듭니다.',
    description: '미국 상장 ETF의 원화 수익률을 달러 수익률과 환율 변동으로 분해해 설명하고 실제 환율 데이터로 계산해 보여줍니다.',
    keywords: ['환율', '원달러', '환노출', '원화 수익률', '해외 ETF 환율'],
    sections: [
      { h: '분해 공식', p: ['원화 투자수익률 = (1 + 달러 수익률) × (기말 USD/KRW ÷ 기초 USD/KRW) − 1. 이 식은 배당과 비용이 없는 일시금 단순 예시입니다.', '매달 사는 적립식은 매수일과 분배일마다 환율이 다르므로 위 단순 공식 대신 현금흐름별로 그날 환율을 적용해 계산해야 합니다. 이 사이트의 시뮬레이터가 그렇게 합니다.'] },
      { h: '국내 상장 ETF도 영향을 받나', p: ['국내 상장 해외 ETF라도 환노출형이면 기초자산의 달러 가치 변화가 원화 가격에 반영됩니다. 환헤지(H) 상품은 이를 줄이도록 설계됐습니다.'] },
      { h: '환율 데이터', p: ['환율은 ECB 일일 참조환율을 사용하며 거래일이 없는 날은 직전 값을 이월합니다. Yahoo Finance 값과 교차 비교한 결과는 출처·검증 페이지에서 확인할 수 있습니다.'] },
    ],
    faq: [{ q: '달러 수익률이 +20%인데 원화 수익률이 더 낮을 수 있나요?', a: '네. 같은 기간 원화가 강세(환율 하락)였다면 원화 수익률이 달러 수익률보다 낮아집니다.' }],
    related: ['hedge', 'dca'],
    example: () => {
      const ks = ['VOO', 'QQQM', 'SCHD']; return { caption: '최근 3년 일시금 가정(가격수익률, 분배금 제외)', head: ['ETF', '달러 가격수익률', '환율 변동', '원화 가격수익률', '환율(시작→끝)'], rows: ks.map((k) => {
        const s = yearsBack(k, 3), e = P(k).last; const r = totalReturn(k, s, e)!; const f0 = fxAt(r.start)!, f1 = fxAt(e)!; const rf = f1 / f0 - 1;
        return [k, pct(r.price), pct(rf), pct((1 + r.price) * (1 + rf) - 1), `${f0.toFixed(0)} → ${f1.toFixed(0)}`]; }) };
    },
  },
  {
    slug: 'hedge', title: '환노출과 환헤지(H) ETF의 차이',
    short: '환노출형은 원/달러 변화가 그대로 수익에 반영되고, 환헤지(H)형은 환율 변동을 줄이도록 설계되지만 비용과 한계가 있습니다.',
    description: '국내 상장 해외 ETF의 환노출형과 환헤지(H)형 차이를 같은 지수 상품 쌍의 실제 성과 비교로 설명합니다.',
    keywords: ['환헤지', '환노출', '(H) ETF', 'KODEX 미국S&P500(H)', '환율 위험'],
    sections: [
      { h: '무엇이 다른가', p: ['환노출형은 기초자산 가격과 환율 변화가 모두 원화 수익에 반영됩니다. 환헤지(H)형은 선물환 등으로 환율 변동 영향을 줄이는 구조이며, 헤지 비용과 완전히 상쇄되지 않는 부분이 있습니다.'] },
      { h: '어느 쪽이 낫다고 단정할 수 없는 이유', p: ['원화 약세 구간에서는 환노출형이, 원화 강세 구간에서는 환헤지형이 유리했을 수 있습니다. 기간에 따라 달라지므로 우열이 아니라 위험 노출의 차이로 이해해야 합니다.'] },
    ],
    faq: [{ q: '(H)가 붙으면 환율 위험이 완전히 없나요?', a: '아닙니다. 환율 변동을 줄이도록 설계된 것일 뿐 완전히 제거하지 못하며 헤지 비용이 발생합니다.' }],
    related: ['fx-decomposition', 'fees-tracking'],
    example: () => {
      const pairs: [string, string][] = [['379800', '449180'], ['379810', '449190']]; return { caption: '같은 기간(두 상품이 모두 거래된 기간) 가격수익률, 원화 기준', head: ['환노출 상품', '환헤지(H) 상품', '기간', '환노출', '환헤지'], rows: pairs.map(([a, b]) => {
        const s = P(a).first > P(b).first ? P(a).first : P(b).first, e = P(a).last; const ra = totalReturn(a, s, e)!, rb = totalReturn(b, s, e)!;
        return [label(a), label(b), `${s} ~ ${e}`, pct(ra.price), pct(rb.price)]; }), note: '지수 구조 변경(총수익→가격지수) 등 상품별 차이가 섞여 있어 순수한 환헤지 효과만의 비교는 아닙니다.' };
    },
  },
  {
    slug: 'fees-tracking', title: '총보수·추적오차·괴리율 — ETF 비용을 읽는 법',
    short: '총보수는 가격에 이미 반영되는 연간 비용, 추적오차는 지수와의 차이, 괴리율은 시장가격과 순자산가치의 차이입니다.',
    description: '총보수, 총비용, 추적오차, 괴리율의 의미와 수익률에서 비용을 이중 차감하면 안 되는 이유를 공식 팩트시트 값과 함께 설명합니다.',
    keywords: ['총보수', 'ETF 보수', '추적오차', '괴리율', 'ETF 비용'],
    sections: [
      { h: '총보수', p: ['ETF가 운용 자산에서 해마다 차감하는 비용입니다. 순자산가치(NAV)와 가격에 이미 반영되어 있으므로 과거 수익률에서 다시 빼면 이중 차감입니다.'] },
      { h: '총비용(실질 비용)', p: ['총보수 외에 기타 비용이 포함된 비율입니다. 국내 ETF의 투자설명서에는 ‘총보수비용’ 형태로 표시되며 증권 거래비용은 별도입니다.'] },
      { h: '추적오차와 괴리율', p: ['추적오차는 ETF가 지수를 얼마나 비슷하게 따라가는지, 괴리율은 시장가격과 NAV가 얼마나 벌어졌는지를 말합니다. 공시값이 확인되지 않은 항목은 이 사이트에서 ‘검증 대기’로 표시합니다.'] },
      { h: '직접 매매 비용', p: ['호가 스프레드, 증권사 수수료, 미국 상장 ETF의 환전 비용은 총보수와 별개로 발생합니다. 시뮬레이터에서 가정값으로 입력해 영향을 볼 수 있으며 기본값은 0입니다.'] },
    ],
    faq: [{ q: '총보수가 낮은 ETF가 항상 좋은가요?', a: '비용은 낮을수록 유리하지만 추종 지수, 환헤지 여부, 구조가 다르면 단순 비교가 어렵습니다.' }],
    related: ['price-vs-total-return', 'hedge'],
    example: () => {
      const ks = ['VOO', 'IVV', 'SPY', 'QQQ', 'QQQM', 'SCHD', 'VYM']; return { caption: '미국 상장 ETF 총보수(운용사 공식 자료, 기준일 포함)', head: ['ETF', '총보수(%)', '기준일/출처 메모'], rows: ks.map((k) => { const f = FACT(k); return [k, f.fee_pct == null ? '검증 대기' : String(f.fee_pct), (f.fee_asof ?? '기준일 확인 필요').slice(0, 60)]; }), note: '값은 변경될 수 있으므로 투자 전 운용사의 최신 자료를 확인하세요.' };
    },
  },
  {
    slug: 'bond-duration', title: '채권 ETF와 듀레이션 — 금리가 오르면 왜 가격이 내려가나',
    short: '채권 가격은 금리와 반대로 움직이고, 듀레이션이 길수록 더 민감합니다. 초단기 국채와 종합채권, 10년 국채는 위험이 다릅니다.',
    description: '듀레이션의 의미와 2022년 금리 상승기의 BND·AGG·SGOV·국내 국채선물 ETF 가격 변화를 실제 데이터로 비교합니다.',
    keywords: ['채권 ETF', '듀레이션', '금리 상승', 'BND', 'AGG', 'SGOV'],
    sections: [
      { h: '듀레이션', p: ['듀레이션이 5라면 금리가 1%p 오를 때 가격이 대략 5% 내려간다는 근사치로 이해할 수 있습니다. 실제 변화는 곡선 모양과 신용 등에 따라 다릅니다.'] },
      { h: '채권이라고 다 안전하지 않다', p: ['만기가 긴 채권이나 신용도가 낮은 채권, 환율에 노출된 채권은 주식과 비슷한 수준으로 변동할 수 있습니다. 초단기 국채 ETF는 금리 민감도가 낮은 편이지만 원금 보장은 아닙니다.'] },
    ],
    faq: [{ q: '채권 ETF는 원금이 보장되나요?', a: '아닙니다. 금리 상승, 신용 위험, 환율 변동으로 가격이 내릴 수 있습니다.' }],
    related: ['fx-decomposition', 'covered-call'],
    example: () => {
      const ks = ['BND', 'AGG', 'SGOV', '305080']; return { caption: '2022년 연간 가격 변화(현지통화, 분배금 제외)', head: ['ETF', '2022 가격수익률', '기간 내 MDD'], rows: ks.map((k) => { if (P(k).first > '2022-01-01') return [label(k), '자료 부족(상장 이전)', '']; const r = totalReturn(k, '2022-01-01', '2022-12-31')!; return [label(k), pct(r.price), pct(r.mdd.mdd)]; }) };
    },
  },
  {
    slug: 'covered-call', title: '커버드콜·옵션 인컴 ETF — 높은 분배금의 이면',
    short: '주식 보유와 옵션 매도로 분배금을 만드는 전략입니다. 상승 이익이 제한될 수 있고 분배금의 일부가 원금 성격일 수 있습니다.',
    description: '옵션 인컴 ETF(JEPI·JEPQ·국내 커버드콜)의 구조와 위험을 설명하고 나스닥100 ETF와의 실제 성과 차이를 보여줍니다.',
    keywords: ['커버드콜 ETF', 'JEPI', 'JEPQ', '옵션 인컴', '분배금'],
    sections: [
      { h: '구조', p: ['주식을 보유하면서 콜옵션을 팔아 받은 프리미엄을 분배금의 재원으로 씁니다. 상승장에서는 옵션이 상승 이익의 일부를 가져가 상승분을 다 못 얻을 수 있습니다.'] },
      { h: '분배금을 읽는 법', p: ['분배율이 높다고 총수익률이 높은 것은 아닙니다. 분배금이 배당·옵션 프리미엄·원금 중 어디서 나오는지 상품별로 확인해야 하며, 이 사이트에서는 분배금 정합성 검사를 통과하지 못한 상품의 총수익률을 숨깁니다.'] },
    ],
    faq: [{ q: '커버드콜 ETF는 분배금이 많으니 유리한가요?', a: '분배금과 가격 변화를 합친 총수익률로 평가해야 하며, 상승 이익 제한과 하락 위험은 그대로 남습니다.' }],
    related: ['price-vs-total-return', 'bond-duration'],
    example: () => {
      const a = totalReturn('JEPQ', P('JEPQ').first, P('JEPQ').last)!, b = totalReturn('QQQM', P('JEPQ').first, P('JEPQ').last)!;
      return { caption: `JEPQ vs QQQM · ${a.start} ~ ${a.end} (USD, 세전, 분배금 재투자 가정)`, head: ['ETF', '가격수익률', '총수익률', '가격 MDD'], rows: [['JEPQ', pct(a.price), pct(a.total), pct(a.mdd.mdd)], ['QQQM', pct(b.price), pct(b.total), pct(b.mdd.mdd)]], note: '서로 다른 전략의 구조 차이를 보는 예시이며 우열 평가가 아닙니다.' };
    },
  },
  {
    slug: 'tax-basics', title: 'ETF 세금은 계좌·상품·시점으로 결정됩니다',
    short: '같은 ETF라도 일반계좌, ISA, 연금계좌, 미국/국내 상장, 분배금/매매차익에 따라 과세가 다릅니다. 이 사이트는 세전 결과만 제공합니다.',
    description: '미국 상장 ETF와 국내 상장 해외 ETF의 세금을 비교할 때 확인해야 할 항목과, 이 사이트가 세후 수익을 계산하지 않는 이유를 설명합니다.',
    keywords: ['ETF 세금', '해외주식 양도세', 'ISA', '연금저축', '배당소득세'],
    sections: [
      { h: '확인해야 할 항목', p: ['적용 연도, 거주지, 계좌 유형(일반·중개형 ISA·연금저축·IRP), 상품 유형(미국 상장/국내 상장), 소득 종류(분배금/매매차익), 실현 방식에 따라 결과가 달라집니다.'] },
      { h: '이 사이트가 세후를 계산하지 않는 이유', p: ['세법은 해마다 바뀌고 계좌별 조건이 복잡해서 검증되지 않은 세율로 세후 수익을 확정값처럼 보여주면 오해를 만들 수 있습니다. 그래서 세율·한도 수치를 싣지 않고 ‘세후 계산 미지원’으로 표시합니다.'] },
      { h: '어디서 확인하나', p: ['국세청, 금융감독원, 이용하는 금융기관의 공식 안내를 기준으로 해당 연도 규정을 확인하세요. 개인별 세무 판단은 세무 전문가와 상담하는 것이 안전합니다.'] },
    ],
    faq: [{ q: '이 사이트의 수익률은 세후인가요?', a: '아닙니다. 모든 결과는 세전이며 분배금 원천징수와 매매차익 과세는 반영하지 않습니다.' }],
    related: ['fees-tracking', 'dca'],
  },
];
export const concept = (slug: string) => CONCEPTS.find((c) => c.slug === slug)!;
export const GLOSSARY: [string, string][] = [
  ['적립식(DCA)', '일정 금액을 정해진 간격으로 투자하는 방식. 매수 시점을 분산하지만 손실을 막지는 못함.'],
  ['가격수익률', '종가 변화만 본 수익률. 분배금(배당)은 포함하지 않음.'],
  ['총수익률', '분배금을 재투자한 것으로 계산한 수익률.'],
  ['분배금', 'ETF가 투자자에게 지급하는 현금(배당·이자·옵션 프리미엄 등).'],
  ['배당락일', '이 날 이후 매수하면 직전 분배금을 받을 수 없는 첫날. 가격이 분배금만큼 조정되는 것이 일반적.'],
  ['MDD(최대낙폭)', '과거 최고점 대비 가장 크게 떨어진 비율.'],
  ['회복기간', '최고점이 깨진 뒤 다시 그 가격을 넘기까지 걸린 시간.'],
  ['원금 미달', '적립식 계좌 평가액이 누적 납입원금보다 작은 상태.'],
  ['XIRR', '납입 시점이 다른 현금흐름을 반영한 연환산 수익률.'],
  ['총보수', 'ETF가 자산에서 매년 차감하는 비용. 가격에 이미 반영됨.'],
  ['추적오차', 'ETF가 추종 지수를 따라가는 정도의 차이.'],
  ['괴리율', 'ETF 시장가격과 순자산가치(NAV)의 차이.'],
  ['환노출', '원/달러 변화가 그대로 수익에 반영되는 구조.'],
  ['환헤지(H)', '환율 변동 영향을 줄이도록 설계한 구조. 비용이 들고 완벽하지 않음.'],
  ['합성 ETF', '스왑 등 파생계약으로 지수 성과를 얻는 구조.'],
  ['커버드콜', '주식 보유 + 콜옵션 매도. 상승 이익이 제한될 수 있음.'],
  ['듀레이션', '금리 변화에 대한 채권 가격의 민감도.'],
  ['원천징수', '분배금을 받을 때 미리 세금을 떼는 방식.'],
  ['수정주가', '분배·분할을 소급 반영한 가격. 분배금을 따로 더하면 이중 반영.'],
  ['시퀀스 위험', '평균 수익률이 같아도 손실의 순서에 따라 결과가 달라지는 위험.'],
];
export { FX_START };

export const SIMPLE: Record<string, { easy: string[]; why: string }> = {
  dca: { easy: ['매달 같은 금액을 꾸준히 사는 방법이에요.', '비쌀 때는 적게, 쌀 때는 많이 사게 돼서 “언제 살지” 고민이 줄어요.', '하지만 시장이 계속 내려가면 적립해도 손해가 날 수 있어요.'], why: '“적립식 = 안전”이 아니라는 걸 먼저 알아야 해요.' },
  'price-vs-total-return': { easy: ['가격수익률은 “가격이 얼마나 올랐나”만 본 거예요.', '총수익률은 중간에 받은 배당(분배금)까지 합친 거예요.', '배당이 많아 보여도 가격이 그만큼 내려가는 경우가 많아서 합친 숫자로 봐야 해요.'], why: '배당 많은 ETF가 무조건 유리하다는 착각을 막아줘요.' },
  xirr: { easy: ['적립식은 돈을 넣은 시기가 제각각이에요.', '“넣은 돈 대비 얼마 벌었나”와 “1년에 몇 %씩 벌었나(XIRR)”는 다른 숫자예요.', '두 숫자를 같은 것처럼 비교하면 안 돼요.'], why: '수익률 숫자를 올바르게 읽는 첫걸음이에요.' },
  'mdd-vs-underwater': { easy: ['최대낙폭은 “가장 많이 떨어졌던 비율”이에요.', '적립식에서는 “넣은 돈보다 평가액이 적은 기간(원금 미달)”도 따로 봐야 해요.', '과거 최악이 앞으로의 한계라는 뜻은 아니에요.'], why: '수익이 아니라 “버텨야 했던 시간”을 보게 해줘요.' },
  'fx-decomposition': { easy: ['미국 ETF는 달러로 움직여요. 우리는 원화로 사니까 환율도 수익에 들어가요.', '자산이 올라도 환율이 내리면 원화로는 덜 벌 수 있어요.'], why: '해외 ETF의 “숨은 변수”를 알려줘요.' },
  hedge: { easy: ['국내에서 사는 해외 ETF도 환율 영향을 받을 수 있어요.', '(H)가 붙은 상품은 환율 영향을 줄이도록 만든 상품이에요. 완전히 없애진 못해요.'], why: '이름이 비슷한 상품 두 개의 차이를 이해하게 해줘요.' },
  'fees-tracking': { easy: ['총보수는 ETF를 들고 있는 동안 해마다 빠지는 비용이에요.', '수익률에는 이미 반영돼 있으니 또 빼면 안 돼요.', '지수를 얼마나 잘 따라가는지(추적오차)도 봐요.'], why: '비용이 낮다고 항상 같은 상품은 아니에요.' },
  'bond-duration': { easy: ['채권은 금리가 오르면 가격이 내려가요.', '만기가 길수록 더 많이 흔들려요.', '채권도 원금이 보장되지 않아요.'], why: '“채권 = 안전”이라는 오해를 풀어줘요.' },
  'covered-call': { easy: ['주식을 가지고 옵션을 팔아서 분배금을 만드는 전략이에요.', '분배금이 높아 보여도 많이 오르는 장에서는 덜 오를 수 있어요.'], why: '높은 분배율에 끌리기 전에 알아야 해요.' },
  'tax-basics': { easy: ['세금은 계좌 종류, 미국/국내 상장, 시점에 따라 달라요.', '이 사이트는 세금이 빠진 “세전” 숫자만 보여줘요.'], why: '숫자를 볼 때 세금이 빠져 있다는 걸 기억하세요.' },
};
export const LEARN: { slug: string; step: string; min: number; easy: string; detail: string }[] = [
  { slug: 'dca', step: '적립식이 뭘까', min: 2, easy: '매달 같은 금액을 꾸준히 사는 방법. 안전을 보장하진 않아요.', detail: '매수 시점 분산의 효과와 한계, 일시금과의 자금 가용 조건 차이까지.' },
  { slug: 'price-vs-total-return', step: '수익률은 두 가지', min: 3, easy: '가격만 본 수익률 vs 배당까지 합친 수익률.', detail: '분배금 재투자 가정, 수정주가와의 이중 반영 문제까지.' },
  { slug: 'mdd-vs-underwater', step: '최악일 때는 어땠나', min: 4, easy: '가장 많이 떨어진 때와, 넣은 돈보다 적었던 기간.', detail: 'ETF 최대낙폭과 적립식 계좌의 원금 미달·회복이 다른 이유.' },
  { slug: 'xirr', step: '수익률 숫자 읽기', min: 3, easy: '“넣은 돈 대비”와 “연 환산(XIRR)”은 다른 숫자.', detail: '현금흐름별 기간을 반영한 연환산 계산.' },
  { slug: 'fx-decomposition', step: '환율의 영향', min: 3, easy: '해외 ETF는 환율도 내 수익에 들어가요.', detail: '(1+자산수익률)×(1+환율변동)−1 분해와 현금흐름별 적용.' },
  { slug: 'hedge', step: '(H)가 붙은 ETF', min: 2, easy: '환율 영향을 줄인 상품. 완전히 없애진 못해요.', detail: '헤지 비용, 같은 지수 상품 쌍의 실제 성과 비교.' },
  { slug: 'fees-tracking', step: 'ETF를 고르기 전 확인', min: 3, easy: '총보수와 추종 지수, 환헤지 여부.', detail: '총비용, 추적오차, 괴리율, 직접 매매 비용.' },
  { slug: 'bond-duration', step: '주식 말고 채권은?', min: 3, easy: '채권도 금리에 따라 떨어질 수 있어요.', detail: '듀레이션과 2022년 금리 상승기 실제 낙폭.' },
  { slug: 'covered-call', step: '배당 많은 ETF의 함정', min: 2, easy: '분배금이 높다고 총수익이 높은 건 아니에요.', detail: '옵션 인컴 구조와 상승 이익 제한.' },
  { slug: 'tax-basics', step: '세금은 별도 확인', min: 2, easy: '이 사이트 숫자는 모두 세전이에요.', detail: '계좌·상품·시점별 확인 항목.' },
];
