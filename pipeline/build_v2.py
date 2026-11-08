"""데이터 빌드 v2: 가격 2중 출처 대조, 분배금 정합성 검사, 환율 대조. 불일치는 숨기지 않고 xcheck에 기록."""
import json,datetime as d,re,statistics
US="VOO IVV SPY VTI ITOT QQQM QQQ SCHG VUG SCHD VYM VIG DGRO VT BND AGG SGOV JEPI JEPQ SMH SOXX".split()
KR="360750 379800 449180 133690 379810 449190 494410 458730 446720 402970 489250 429000 381180 469060 390390 305080 437080 329750 441680 441640".split()
NAMES=json.load(open("pipeline/naver_names.json"))
def ychart(f):
    r=json.load(open(f))["chart"]["result"][0];off=r["meta"].get("gmtoffset",0)
    dd=lambda ts:d.datetime.fromtimestamp(ts+off,d.timezone.utc).date().isoformat()
    c={};adj={}
    for ts,x,a in zip(r["timestamp"],r["indicators"]["quote"][0]["close"],r["indicators"]["adjclose"][0]["adjclose"]):
        if x is not None: c[dd(ts)]=round(x,4);adj[dd(ts)]=a
    ev=r.get("events",{})
    dv={}
    for e in ev.get("dividends",{}).values(): dv[dd(e["date"])]=dv.get(dd(e["date"]),0)+e["amount"]
    sp=[(dd(e["date"]),e["splitRatio"]) for e in ev.get("splits",{}).values()]
    return c,adj,dv,sp,r["meta"]
def kr_div_check(raw,yc,dv):
    ds=sorted(raw);ix={x:i for i,x in enumerate(ds)};res={"ok":0,"bad":[],"n":0}
    for dt,a in dv.items():
        i=ix.get(dt)
        if not i or dt not in yc or ds[i-1] not in yc: res["bad"].append([dt,"no-both-price"]);continue
        g0=yc[ds[i-1]]/raw[ds[i-1]];g1=yc[dt]/raw[dt]
        implied=abs(1-g0/g1);exp=a/raw[ds[i-1]];res["n"]+=1
        if abs(implied-exp)<=0.0015: res["ok"]+=1
        else: res["bad"].append([dt,round(implied*100,3),round(exp*100,3)])
    return res
def div_check(c,adj,dv):
    """adjclose 비율 변화로 내재 분배율을 구해 분배금/전일종가와 비교. 허용오차: 0.15%p."""
    ds=sorted(c);ix={x:i for i,x in enumerate(ds)};res={"ok":0,"bad":[],"n":0}
    for dt,a in dv.items():
        i=ix.get(dt)
        if not i: res["bad"].append([dt,"no-price-day"]);continue
        f0=adj[ds[i-1]]/c[ds[i-1]];f1=adj[dt]/c[dt]
        implied=f1/f0-1;exp=a/c[ds[i-1]];res["n"]+=1
        if abs(implied-exp)<=0.0015: res["ok"]+=1
        else: res["bad"].append([dt,round(implied*100,3),round(exp*100,3)])
    return res
out={"products":{},"warnings":[],"built":d.datetime.now(d.timezone.utc).isoformat(timespec="seconds")}
def jl(f): return json.load(open(f))
for t in US:
    c,adj,dv,sp,meta=ychart(f"pipeline/raw/{t}.json")
    rows=jl(f"pipeline/raw/{t}.nasdaq.json")["data"]["tradesTable"]["rows"]
    nm={}
    for r in rows:
        m,dy,y=r["date"].split("/");nm[f"{y}-{m}-{dy}"]=float(r["close"].replace("$","").replace(",",""))
    both=[x for x in nm if x in c];bad=[(x,c[x],nm[x]) for x in both if abs(nm[x]/c[x]-1)>0.0015]
    only_n=[x for x in nm if x not in c];only_y=[x for x in c if x>=min(nm) and x not in nm]
    # 대조 불일치일은 기록. 가격은 Yahoo(전 기간) 사용, 최근 10년은 Nasdaq 일치 확인.
    # Nasdaq 쪽에만 있는 날은 Yahoo 값이 없으므로 추가하지 않고(출처 1개) 경고
    excl=sorted(set(x[0] for x in bad))
    dates=[x for x in sorted(c) if x not in excl];cl=[c[x] for x in dates]
    for i in range(1,len(cl)):
        ch=cl[i]/cl[i-1]-1
        if abs(ch)>0.12: out["warnings"].append(f"{t}: {dates[i]} 일간 {ch*100:.1f}% (분할/이상값 확인 필요)")
    out["products"][t]={"key":t,"kind":"US","ticker":t,"name":meta.get("longName"),"currency":"USD","exchange":meta.get("fullExchangeName") or meta.get("exchangeName"),
      "d":dates,"c":cl,"div":{k:round(v,6) for k,v in sorted(dv.items())},"splits":sp,"first":dates[0],"last":dates[-1],"excluded_days":excl,
      "xcheck":{"price_primary":"Yahoo Finance chart API (분할 반영 종가)","price_secondary":"Nasdaq.com historical API","secondary_from":min(nm),"overlap_days":len(both),"mismatch_days":len(bad),"mismatch_sample":bad[:5],"secondary_only_days":only_n[:10],"primary_only_days":only_y[:10],"div_check":div_check(c,adj,dv)},
      "source_urls":[f"https://finance.yahoo.com/quote/{t}/history",f"https://www.nasdaq.com/market-activity/etf/{t.lower()}/historical"]}
    if bad: out["warnings"].append(f"{t}: Yahoo↔Nasdaq 종가 불일치 {len(bad)}일 — {bad[:2]} → 해당일 계산에서 제외(불일치 검토 필요)")
    if only_n: out["warnings"].append(f"{t}: Nasdaq에만 있는 거래일 {len(only_n)}건 {only_n[:3]} (Yahoo 누락, 제외)")
for k in KR:
    c,adj,dv,sp,meta=ychart(f"pipeline/raw/{k}.KS.json")
    txt=open(f"pipeline/raw/{k}.naver.txt").read()
    nv={}
    for m in re.finditer(r'\["(\d{8})",\s*([\d.]+),\s*([\d.]+),\s*([\d.]+),\s*([\d.]+)',txt):
        s=m.group(1);nv[f"{s[:4]}-{s[4:6]}-{s[6:]}"]=float(m.group(5))
    both=[x for x in nv if x in c];nd=sorted(nv);bad=[]
    for i in range(1,len(nd)):
        t,p=nd[i],nd[i-1]
        if t in c and p in c and t not in dv:
            if abs((nv[t]/nv[p])/(c[t]/c[p])-1)>0.002: bad.append((t,round(nv[t]/nv[p]-1,5),round(c[t]/c[p]-1,5)))
    only_n=[x for x in nv if x not in c];only_y=[x for x in c if x not in nv]
    dates=sorted(nv);cl=[nv[x] for x in dates]
    for i in range(1,len(cl)):
        ch=cl[i]/cl[i-1]-1
        if abs(ch)>0.12: out["warnings"].append(f"{k}: {dates[i]} 일간 {ch*100:.1f}% (이상값 확인 필요)")
    out["products"][k]={"key":k,"kind":"KR","ticker":k,"name":NAMES.get(k),"currency":"KRW","exchange":"KRX","d":dates,"c":cl,
      "div":{x:round(v,4) for x,v in sorted(dv.items()) if x>=dates[0]},"splits":sp,"first":dates[0],"last":dates[-1],
      "xcheck":{"price_primary":"Naver Finance 시세(KRX 거래 데이터)","price_secondary":"Yahoo Finance (분배금 소급조정 종가 → 일간 수익률로 대조, 분배락일 제외)","secondary_from":min(c),"overlap_days":len(both),"mismatch_days":len(bad),"mismatch_sample":bad[:5],"secondary_only_days":only_y[:10],"primary_only_days":len(only_n),"div_check":kr_div_check(nv,c,{x:v for x,v in dv.items() if x>=dates[0]}),"yahoo_close_is_distribution_adjusted":True},
      "source_urls":[f"https://finance.naver.com/item/main.naver?code={k}",f"https://finance.yahoo.com/quote/{k}.KS/history"]}
    if bad: out["warnings"].append(f"{k}: Naver↔Yahoo 일간수익률 불일치 {len(bad)}일 — {bad[:2]}")
    if only_y: out["warnings"].append(f"{k}: Yahoo에만 있는 거래일 {len(only_y)}건")
# FX
ecb=jl("pipeline/raw/fx_ecb.json")["rates"];fd=sorted(ecb);fr=[ecb[x]["KRW"] for x in fd]
yr=jl("pipeline/raw/KRW=X.json")["chart"]["result"][0]
yf={}
for ts,x in zip(yr["timestamp"],yr["indicators"]["quote"][0]["close"]):
    if x is not None: yf[d.datetime.fromtimestamp(ts,d.timezone.utc).date().isoformat()]=x
diffs=[];big=[]
for dt,r in zip(fd,fr):
    if dt in yf and dt>="2010-01-01":
        df=yf[dt]/r-1;diffs.append(df)
        if abs(df)>0.015: big.append((dt,r,round(yf[dt],2),round(df*100,2)))
out["fx"]={"d":fd,"r":fr,"pair":"USD/KRW","source":"ECB 일일 참조환율(Frankfurter API) — USD 기준 KRW. 휴일은 직전 영업일 값 이월","source_url":"https://www.frankfurter.app/ (ECB reference rates)",
  "xcheck":{"secondary":"Yahoo Finance KRW=X","compared_days":len(diffs),"mean_abs_diff_pct":round(statistics.mean(abs(x) for x in diffs)*100,3),"p95_abs_diff_pct":round(sorted(abs(x) for x in diffs)[int(len(diffs)*.95)]*100,3),"over_1_5pct_days":len(big),"over_sample":big[:8],
   "note":"ECB 기준 시각(14:15 CET)과 Yahoo 종가 시각이 달라 일중 변동만큼 차이가 남. 1.5% 초과일은 불일치 검토 대상."}}
for k,p in out["products"].items():
    x=p["xcheck"];dc=x["div_check"];checked=dc["n"]
    p["div_status"]="none" if not p["div"] else ("ok" if checked and dc["ok"]/checked>=0.95 else "review")
    p["price_status"]="review" if x["mismatch_days"]>3 else "ok"
json.dump(out,open("pipeline/dataset2.json","w"),ensure_ascii=False,separators=(",",":"))
print(len(out["products"]),"products")
print(out["fx"]["xcheck"])
for k,p in out["products"].items():
    x=p["xcheck"];dc=x["div_check"];print(k,p["first"],len(p["d"]),"ovl",x["overlap_days"],"mis",x["mismatch_days"],"div",dc["ok"],"/",dc["n"],"bad",dc["bad"][:2])
print(*out["warnings"],sep="\n")
