import json,bisect,subprocess
D=json.load(open('pipeline/dataset3.json'))
def ref(sel,re,fee,sp,start='2023-06-20',end='2026-11-06',monthly=1e6):
    P=D['products']; fd=D['fx']['d'];fr=D['fx']['r']
    fx=lambda d: fr[bisect.bisect_right(fd,d)-1]
    pm={k:dict(zip(P[k]['d'],P[k]['c'])) for k,_ in sel}
    cal=[d for d in P[sel[0][0]]['d'] if all(d in pm[k] for k,_ in sel) and start<=d<=end]
    sh={k:0 for k,_ in sel};cash=0;pr=0;seen=set()
    divs={k:{} for k,_ in sel}
    for k,_ in sel:
        for dd,a in P[k]['div'].items():
            if cal[0]<=dd<=cal[-1]:
                c=next(x for x in cal if x>=dd);divs[k][c]=divs[k].get(c,0)+a
    for d in cal:
        for k,_ in sel:
            a=divs[k].get(d)
            if a and sh[k]:
                cur=1 if P[k]['currency']=='KRW' else fx(d)
                krw=sh[k]*a*cur
                if re: sh[k]+=krw/cur/pm[k][d]
                else: cash+=krw
        if d[:7] not in seen:
            seen.add(d[:7]);pr+=monthly
            for k,w in sel:
                net=monthly*w*(1-fee/100)
                if P[k]['currency']=='KRW': sh[k]+=net/pm[k][d]
                else: sh[k]+=net*(1-sp/100)/fx(d)/pm[k][d]
    d=cal[-1]
    v=cash+sum(sh[k]*pm[k][d]*(1 if P[k]['currency']=='KRW' else fx(d)) for k,_ in sel)
    return v,pr
js=json.loads(subprocess.check_output(['node','pipeline/test_engine.js']))
for t in js:
    v,p=ref([(s['k'],s['w']) for s in t['sel']],t['re'],t['fee'],t['sp'])
    print(t['sel'][0]['k'],t['re'],'JS',round(t['value'],2),'PY',round(v,2),'diff',abs(t['value']-v)<0.01,'xirr',t['xirr'])
