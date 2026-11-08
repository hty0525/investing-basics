/* 백테스트 엔진: 간편/상세 모드가 공유. 결정적(동일 입력+동일 데이터 → 동일 결과). */
(function (root) {
  function bsLE(arr, x) { // 마지막 arr[i] <= x 의 index, 없으면 -1
    let lo = 0, hi = arr.length - 1, r = -1;
    while (lo <= hi) { const m = (lo + hi) >> 1; if (arr[m] <= x) { r = m; lo = m + 1; } else hi = m - 1; }
    return r;
  }
  function dayDiff(a, b) { return (Date.parse(b) - Date.parse(a)) / 86400000; }

  function xirr(flows) { // [{d, v}]
    const t0 = flows[0].d;
    const f = (r) => flows.reduce((s, x) => s + x.v / Math.pow(1 + r, dayDiff(t0, x.d) / 365), 0);
    let lo = -0.99, hi = 10, flo = f(lo), fhi = f(hi);
    if (!isFinite(flo) || !isFinite(fhi) || flo * fhi > 0) return null;
    for (let i = 0; i < 200; i++) { const m = (lo + hi) / 2, fm = f(m); if (flo * fm <= 0) { hi = m; } else { lo = m; flo = fm; } }
    return (lo + hi) / 2;
  }

  function priceKRW(D, k, date, px) { // 해당 통화 가격 → KRW
    const p = D.products[k];
    if (p.currency === 'KRW') return px;
    const i = bsLE(D.fx.d, date); return i < 0 ? null : px * D.fx.r[i];
  }

  function run(D, sel, o) {
    const ks = sel.map(s => s.k);
    const maps = {}, divAt = {};
    ks.forEach(k => { const p = D.products[k]; maps[k] = {}; p.d.forEach((d, i) => maps[k][d] = p.c[i]); });
    // 공통 거래일(교집합)
    let cal = D.products[ks[0]].d.filter(d => ks.every(k => maps[k][d] !== undefined) && d >= o.start && d <= o.end);
    if (cal.length < 2) return { error: '선택한 상품의 공통 거래일이 부족합니다 (자료 부족).' };
    const firstFx = D.fx.d[0];
    if (cal[0] < firstFx) return { error: '환율 자료 부족' };
    // 분배금 → 교집합 달력의 첫 거래일 >= ex-date 로 이월 (기록)
    ks.forEach(k => {
      divAt[k] = {};
      for (const [dd, amt] of Object.entries(D.products[k].div)) {
        if (dd < cal[0] || dd > cal[cal.length - 1]) continue;
        const i = cal.findIndex(c => c >= dd); if (i < 0) continue;
        divAt[k][cal[i]] = (divAt[k][cal[i]] || 0) + amt;
      }
    });
    const shares = {}; ks.forEach(k => shares[k] = 0);
    let cash = 0, principal = 0, divTotal = 0, costTotal = 0;
    const fee = (o.fee || 0) / 100, spread = (o.spread || 0) / 100;
    const flows = [], trades = [], series = [];
    const buyMonthSeen = {};
    const buy = (k, krw, date, kind) => {
      const p = D.products[k], px = maps[k][date];
      const f = kind === 'div' ? 0 : fee, sp = kind === 'div' ? 0 : spread;
      const net = krw * (1 - f);
      let sh;
      if (p.currency === 'KRW') sh = net / px;
      else { const fx = D.fx.r[bsLE(D.fx.d, date)]; sh = (net * (1 - sp) / fx) / px; }
      costTotal += krw - (p.currency === 'KRW' ? net : net * (1 - sp));
      shares[k] += sh;
      trades.push({ date, k, kind, krw, price: px, shares: sh });
    };
    cal.forEach((date, idx) => {
      // 1) 분배금 (보유수량 × 주당분배금, 세전; USD는 당일 환율)
      ks.forEach(k => {
        const a = divAt[k][date]; if (!a || !shares[k]) return;
        const p = D.products[k];
        const krw = shares[k] * a * (p.currency === 'KRW' ? 1 : D.fx.r[bsLE(D.fx.d, date)]);
        divTotal += krw;
        if (o.reinvest) buy(k, krw, date, 'div'); else cash += krw;
      });
      // 2) 적립/최초일시금 (월 첫 공통거래일)
      const ym = date.slice(0, 7);
      if (!buyMonthSeen[ym]) {
        buyMonthSeen[ym] = 1;
        let amt = o.monthly + (idx === 0 ? (o.lump || 0) : 0);
        if (amt > 0) {
          sel.forEach(s => buy(s.k, amt * s.w, date, 'dca'));
          principal += amt; flows.push({ d: date, v: -amt });
        }
      }
      // 3) 평가
      let val = cash, parts = {};
      ks.forEach(k => { const v = shares[k] * priceKRW(D, k, date, maps[k][date]); parts[k] = v; val += v; });
      series.push({ d: date, principal, value: val, parts });
    });
    // 분배금 재투자: buy()에서 수수료 차감이 중복되지 않도록 위에서 krw/(1-fee)로 보정(재투자 수수료 0 가정)
    const last = series[series.length - 1];
    flows.push({ d: last.d, v: last.value });
    const profit = last.value - last.principal;

    // 원금 미달 구간 (평가액 < 누적 납입원금)
    const uw = []; let cur = null;
    series.forEach((s, i) => {
      const under = s.value < s.principal - 1e-9;
      if (under && !cur) cur = { start: s.d, worst: 0, worstDate: s.d, worstPct: 0 };
      if (under) { const l = s.value - s.principal; if (l < cur.worst) { cur.worst = l; cur.worstDate = s.d; cur.worstPct = l / s.principal; } }
      if (!under && cur) { cur.end = s.d; cur.days = dayDiff(cur.start, s.d); uw.push(cur); cur = null; }
    });
    if (cur) { cur.end = null; cur.days = dayDiff(cur.start, last.d); cur.open = true; uw.push(cur); }
    let worst = { worst: 0 }; let worstPct = { worstPct: 0 };
    uw.forEach(u => { if (u.worst < worst.worst) worst = u; if (u.worstPct < worstPct.worstPct) worstPct = u; });
    // 계좌 평가액 낙폭 (납입 포함이므로 ETF MDD와 별개)
    let peak = 0, dd = 0, ddDate = null;
    series.forEach(s => { if (s.value > peak) peak = s.value; const x = peak ? s.value / peak - 1 : 0; if (x < dd) { dd = x; ddDate = s.d; } });

    // ETF별 가격 지표 (현지통화 / 원화환산)
    const etf = ks.map(k => {
      const p = D.products[k];
      const local = cal.map(d => maps[k][d]);
      const krw = cal.map((d, i) => priceKRW(D, k, d, local[i]));
      return { k, local: mdd(cal, local), krw: mdd(cal, krw), monthly: monthStats(cal, krw), ret: { local: local[local.length - 1] / local[0] - 1, krw: krw[krw.length - 1] / krw[0] - 1 }, currency: p.currency };
    });
    return {
      cal, series, trades, flows, summary: {
        start: cal[0], end: last.d, principal: last.principal, value: last.value, profit,
        ret: last.principal ? profit / last.principal : null, xirr: xirr(flows),
        divTotal, cash, costTotal, worstLossAmt: worst.worst, worstLossAmtDate: worst.worstDate,
        worstLossPct: worstPct.worstPct, worstLossPctDate: worstPct.worstDate, acctDD: dd, acctDDDate: ddDate,
        underwater: uw, shares
      }, etf
    };
  }

  function mdd(dates, px) {
    let peak = px[0], peakI = 0, best = 0, bi = 0, bp = 0;
    for (let i = 0; i < px.length; i++) {
      if (px[i] > peak) { peak = px[i]; peakI = i; }
      const x = px[i] / peak - 1; if (x < best) { best = x; bi = i; bp = peakI; }
    }
    // 회복: 해당 최고점 가격을 다시 회복한 첫날
    let rec = null; for (let i = bi; i < px.length; i++) if (px[i] >= px[bp]) { rec = i; break; }
    return { mdd: best, peakDate: dates[bp], troughDate: dates[bi], recoveryDate: rec === null ? null : dates[rec], recoveryDays: rec === null ? null : dayDiff(dates[bi], dates[rec]), peakToRecoveryDays: rec === null ? null : dayDiff(dates[bp], dates[rec]) };
  }
  function monthStats(dates, px) {
    const me = []; // 월말 종가
    for (let i = 0; i < dates.length; i++) if (i === dates.length - 1 || dates[i].slice(0, 7) !== dates[i + 1].slice(0, 7)) me.push({ d: dates[i], p: px[i], ym: dates[i].slice(0, 7) });
    // 첫 달이 부분월이면 시작일 가격을 기준으로 사용
    const base = [{ d: dates[0], p: px[0] }].concat(me);
    let wm = null; for (let i = 1; i < base.length; i++) { const r = base[i].p / base[i - 1].p - 1; if (wm === null || r < wm.r) wm = { r, d: base[i].d }; }
    let w12 = null; for (let i = 0; i < base.length; i++) { const t = new Date(base[i].d); t.setFullYear(t.getFullYear() - 1); const j = bsLE(base.map(x => x.d), t.toISOString().slice(0, 10)); if (j < 0) continue; const r = base[i].p / base[j].p - 1; if (w12 === null || r < w12.r) w12 = { r, d: base[i].d }; }
    // 변동성: 일간수익률 표준편차 × √252
    let rs = []; for (let i = 1; i < px.length; i++) rs.push(Math.log(px[i] / px[i - 1]));
    const m = rs.reduce((a, b) => a + b, 0) / rs.length; const sd = Math.sqrt(rs.reduce((a, b) => a + (b - m) ** 2, 0) / (rs.length - 1));
    return { worstMonth: wm, worst12m: w12, vol: sd * Math.sqrt(252) };
  }

  function toCSV(res) {
    const L = ['date,cumulative_principal_krw,account_value_krw,profit_krw'];
    res.series.forEach(s => L.push([s.d, s.principal.toFixed(2), s.value.toFixed(2), (s.value - s.principal).toFixed(2)].join(',')));
    return L.join('\n');
  }
  function tradesCSV(res) {
    const L = ['date,ticker,kind,krw_amount,price_local,shares'];
    res.trades.forEach(t => L.push([t.date, t.k, t.kind, t.krw.toFixed(2), t.price, t.shares.toFixed(8)].join(',')));
    return L.join('\n');
  }
  root.Engine = { run, xirr, mdd, toCSV, tradesCSV, bsLE, dayDiff };
  if (typeof module !== 'undefined') module.exports = root.Engine;
})(typeof window !== 'undefined' ? window : globalThis);
