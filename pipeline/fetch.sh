#!/bin/bash
# 원본 수집(재현용). 결과는 pipeline/raw/ (gitignore). 이후: python3 pipeline/build_v2.py && python3 pipeline/merge_facts.py && npm run prepare-data
# 주의: 각 출처의 이용약관을 확인하고 개인·교육 목적 범위에서만 사용하세요.
set -e; cd "$(dirname "$0")"; mkdir -p raw; cd raw
US="VOO IVV SPY VTI ITOT QQQM QQQ SCHG VUG SCHD VYM VIG DGRO VT BND AGG SGOV JEPI JEPQ SMH SOXX"
KR="360750 379800 449180 133690 379810 449190 494410 458730 446720 402970 489250 429000 381180 469060 390390 305080 437080 329750 441680 441640"
UA="Mozilla/5.0"
for t in $US; do
  curl -s -A "$UA" "https://query1.finance.yahoo.com/v8/finance/chart/$t?period1=946684800&period2=$(date +%s)&interval=1d&events=div%7Csplit" -o "$t.json"
  curl -s -A "$UA" -H "Accept: application/json" "https://api.nasdaq.com/api/quote/$t/historical?assetclass=etf&fromdate=2000-01-01&limit=9999&todate=$(date +%F)" -o "$t.nasdaq.json"
done
for c in $KR; do
  curl -s -A "$UA" "https://query1.finance.yahoo.com/v8/finance/chart/$c.KS?period1=946684800&period2=$(date +%s)&interval=1d&events=div%7Csplit" -o "$c.KS.json"
  curl -s -A "$UA" "https://api.finance.naver.com/siseJson.naver?symbol=$c&requestType=1&startTime=20000101&endTime=$(date +%Y%m%d)&timeframe=day" -o "$c.naver.txt"
done
curl -s -A "$UA" "https://query1.finance.yahoo.com/v8/finance/chart/KRW=X?period1=946684800&period2=$(date +%s)&interval=1d" -o "KRW=X.json"
curl -sL "https://api.frankfurter.dev/v1/2010-01-01..$(date +%F)?base=USD&symbols=KRW" -o fx_ecb.json
curl -s -A "$UA" "https://finance.naver.com/api/sise/etfItemList.nhn?etfType=0&targetColumn=market_sum&sortOrder=desc" | iconv -f euc-kr -t utf-8 > naver_etf.json
