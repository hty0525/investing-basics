# investing-basics — 적립식 투자·ETF 이해 대시보드

추천이 아니라 **비교**, 수익률보다 **투자 과정**, 쉬운 설명과 **검증 가능한 수치**를 원칙으로 한 교육용 정적 사이트.
미국 상장 21개 + 국내 상장 20개 ETF를 같은 기간·같은 규칙으로 비교하고, 적립식(DCA) 과거 결과를 계산합니다.

- 사이트: https://hty0525.github.io/investing-basics/
- Next.js(App Router) **정적 export(SSG)** → 서버 런타임 없음, GitHub Pages 무료 호스팅
- SEO: 페이지별 title/description/canonical/OG, `sitemap.xml`, `robots.txt`, JSON-LD(Article·FAQPage·BreadcrumbList·WebSite·WebApplication·DefinedTermSet), 상품 41 + 비교 10 + 개념 10 정적 페이지

## 구조
```
src/app          페이지 (etf/[slug], compare/[cat], concepts/[slug], simulator, sources, glossary, about)
src/lib          engine.js(백테스트 엔진), stats/concepts/catalog/data
src/data         빌드용 메타(팩트·검증 요약)
public/data      클라이언트 시뮬레이터용 가격·분배금 시계열 + 환율
pipeline         데이터 수집·검증·병합 스크립트, 팩트시트 조사 결과, 독립 재계산 테스트
```

## 개발
```bash
npm install
npm run dev            # http://localhost:3000
npm run build          # out/ 에 정적 사이트 생성 (basePath=/investing-basics)
npm run test:engine    # JS 엔진 vs 독립 Python 재계산 대조
```

## 데이터 갱신
```bash
bash pipeline/fetch.sh && python3 pipeline/build_v2.py && python3 pipeline/merge_facts.py && npm run prepare-data
```
`main`에 push 하면 GitHub Actions가 빌드·배포합니다.

## 데이터와 검증
- 가격: 미국 Yahoo↔Nasdaq.com, 국내 Naver(한국거래소 시세)↔Yahoo 교차 대조 / 분배금: 가격 변동과 정합성 검사 / 환율: ECB↔Yahoo
- 상품 정보(보수·지수·설정일): 운용사 공식 페이지·투자설명서. 확인 못한 값은 비우고 “검증 대기”로 표시
- 한계: 운용사 NAV·분배 공시와는 대조하지 못함, 10년 이전 미국 ETF 가격은 단일 출처, 분배금 재투자는 배당락일 기준, 세전만 제공
- **데이터 이용 주의**: 가격 데이터는 외부 서비스에서 수집한 값입니다. 재사용·재배포 전 각 출처의 이용약관을 확인하세요.

## 고지
교육·비교용 정보이며 투자 권유가 아닙니다. 과거 성과는 미래를 보장하지 않으며 투자 판단과 책임은 이용자에게 있습니다.
