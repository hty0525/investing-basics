"""pipeline/facts/group*.json → 공통 스키마로 정규화해 data.js의 facts에 주입. 값이 없으면 키를 넣지 않음(=화면에서 검증 대기)."""
import json,glob,os
D=json.load(open("pipeline/dataset2.json"))
facts={}
def put(k,**v):
    v={a:b for a,b in v.items() if b not in (None,"",[],{})}
    facts.setdefault(k,{}).update(v)
A=json.load(open("pipeline/facts/groupA.json"))
for x in A:
    put(x["ticker"],name=x.get("official_name"),issuer=x.get("issuer"),index=x.get("benchmark_index"),inception=x.get("inception_date"),listing=x.get("listing_date"),exchange=x.get("listing_exchange"),fee_pct=x.get("expense_ratio_pct"),fee_asof=x.get("expense_ratio_as_of"),dist=x.get("distribution_frequency"),strategy=x.get("structure"),sources=x.get("source_urls"),notes=x.get("notes"),secondary=(x.get("source_type")!="official"))
B=json.load(open("pipeline/facts/groupB.json"))["tickers"]
for k,x in B.items():
    strat=x.get("strategy_notes") or x.get("fixed_income")
    if isinstance(strat,dict): strat=json.dumps(strat,ensure_ascii=False)
    put(k,name=x.get("official_name"),issuer=x.get("issuer"),index=x.get("benchmark_index"),inception=x.get("inception_date"),listing=x.get("listing_date"),exchange=x.get("listing_exchange"),fee_pct=x.get("expense_ratio_pct"),fee_asof=x.get("expense_ratio_as_of"),dist=x.get("distribution_frequency"),strategy=strat,sources=x.get("source_urls"),notes=x.get("notes") if isinstance(x.get("notes"),str) else "; ".join(x.get("notes") or []),splits=x.get("split_events"))
def kr(code,x):
    put(code,name=x.get("official_name"),name_history=x.get("name_history"),issuer=x.get("issuer"),index=x.get("benchmark_index"),inception=x.get("inception_date"),listing=x.get("listing_date"),hedge=x.get("currency_exposure"),fee_pct=x.get("total_expense_pct"),fee_asof=x.get("expense_as_of"),real_fee_pct=x.get("real_expense_ratio_pct"),dist=x.get("distribution_policy"),strategy=x.get("strategy_notes"),same_index_as=x.get("same_index_as"),tracking=x.get("tracking_error_info"),sources=x.get("source_urls"),notes=x.get("notes"),exchange="KRX")
for x in json.load(open("pipeline/facts/groupC.json"))["etfs"]: kr(x["code"],x)
for f in sorted(glob.glob("pipeline/facts/groupD[123].json")):
    for code,x in json.load(open(f)).items():
        if x.get("official_name") or x.get("total_expense_pct") is not None: kr(code,x)
# 지수 동일성: 공식 지수명 문자열이 같은 계열일 때만, PR/TR 차이를 명시해 기록 (파생 판단 → derived 표기)
for k in ("458730","446720","402970","489250"):
    facts[k]["same_index_as"]=["SCHD (Dow Jones U.S. Dividend 100 계열 · 국내 상품은 PR·원화환산, SCHD는 TR 추종 — 지수명 문자열 기준 판단)"]
facts["390390"]["same_index_as"]=["SMH (MVIS US Listed Semiconductor 25 계열 · 국내는 원화환산 — 지수명 문자열 기준 판단)"]
facts["469060"]["same_index_as"]=["SOXX (NYSE Semiconductor Index 계열 · 국내는 원화환산)"]
# 교차 점검: facts의 설정/상장일이 데이터 첫 거래일 이전/동일한지, 이름 일치
chk=[]
for k,p in D["products"].items():
    f=facts.get(k,{})
    lv=f.get("listing")
    if lv and p["kind"]=="KR" and lv[:10]!=p["first"]: chk.append(f"{k}: 운용사 상장일({lv}) ≠ 데이터 첫 거래일({p['first']}) — 불일치 검토 필요")
    for fld in ("listing","inception"):
        v=f.get(fld)
        if v and p["first"]<v[:10] and k not in("VOO",): chk.append(f"{k}: 데이터 첫 거래일({p['first']})이 {fld}({v})보다 이름 — 불일치 검토")
NOTE={k:"2025-02-21 이전은 총수익(TR) 지수 추종으로 분배금이 가격에 내부 재투자되어 반영됨 → 이 구간 종가는 총수익 성격이며 이후는 가격(PR) 지수 + 현금분배. 구간을 이어서 비교할 때 주의." for k in ("379800","379810")}
for k,v in NOTE.items(): facts.setdefault(k,{})["structure_note"]=v; D["warnings"].append(f"{k}: {v}")
# SMH: 공식 설정일(현 지수 ETF) 이전 구간은 다른 구조(HOLDRS 등) 이력이므로 제외
CUT={"SMH":"2011-12-20"}
for k,cut in CUT.items():
    p=D["products"][k];i=next(j for j,x in enumerate(p["d"]) if x>=cut)
    D["warnings"].append(f"{k}: 공식 설정일 {cut} 이전 {i}거래일 제외(현 ETF 구조 이전 이력, 동일 상품 성과로 보지 않음)")
    p["d"]=p["d"][i:];p["c"]=p["c"][i:];p["div"]={a:b for a,b in p["div"].items() if a>=cut};p["first"]=p["d"][0];p["trimmed_before"]=cut
chk=[c for c in chk if not c.startswith("SMH")]
D["facts"]=facts;D["facts_check"]=chk
json.dump(D,open("pipeline/dataset3.json","w"),ensure_ascii=False,separators=(",",":"))
D["warnings"]+= [c for c in chk]
print(len(facts),"facts;",len(chk),"checks");print(*chk,sep="\n")
miss=[k for k in D["products"] if k not in facts];print("no facts:",miss)
