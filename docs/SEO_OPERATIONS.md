# SEO 운영·검증 체크리스트

대상: https://hty0525.github.io/investing-basics/

이 문서는 **구현된 기술적 SEO**와 **계정 소유자가 직접 해야 하는 검색엔진 등록·실측 작업**을 구분합니다. 검색 결과 순위·색인은 보장하지 않습니다.

## 1. 자동 검증: 배포할 때마다 확인

```bash
npm ci
npm run build
npm run seo:check
```

`scripts/seo-check.mjs`은 `out/`의 정적 HTML을 직접 검사합니다.

- 각 HTML의 고유한 `<title>`, `meta description`, `H1`, 한국어 문서 언어
- `rel=canonical`과 `og:url`이 `https://hty0525.github.io/investing-basics/...`와 일치하는지
- `noindex` 실수 여부, JSON-LD 문법, 사이트 내 HTML 링크 대상의 실재 여부
- `sitemap.xml`이 모든 공개 정적 페이지를 빠짐없이 포함하는지, 중복·잘못된 날짜가 없는지

GitHub Actions는 Pull Request와 `main` 빌드에서 실행합니다. **정적 파일 검증은 실제 Google 크롤링·색인이나 Core Web Vitals 실측의 대체물이 아닙니다.**

## 2. Search Console — 계정 소유자 작업 (P0)

1. [Google Search Console](https://search.google.com/search-console/)에서 **URL 접두어 속성**으로 `https://hty0525.github.io/investing-basics/`를 등록합니다.
2. Google이 제공한 수단 중 사용 가능한 소유권 확인을 진행합니다. 필요한 태그/파일/토큰은 실제 발급받은 값만 사용하세요. **토큰을 임의 생성하거나 README에 공개하지 마세요.**
3. 속성에서 사이트맵 `https://hty0525.github.io/investing-basics/sitemap.xml`을 제출합니다.
4. URL 검사에서 홈, `/etf/voo/`, `/compare/sp500/`(실제 존재하는 비교 URL 확인), `/concepts/dca/`, `/simulator/`의 HTTP 200, 선택된 Canonical, 색인 허용, 색인 여부를 각각 확인합니다.
5. 색인이 누락된 페이지는 제외 이유를 확인하고, 핵심 URL의 색인 생성 요청을 필요할 때만 진행합니다. 색인 요청은 즉시 노출을 보장하지 않습니다.

Search Console 권한이 없으면 코드만으로 사이트 등록, 소유권 확인, 색인 보장을 할 수 없습니다.

## 3. 네이버·Bing — 계정 소유자 작업 (P1)

- [네이버 서치어드바이저](https://searchadvisor.naver.com/): 사이트 등록·소유 확인·사이트맵 제출 기능을 확인하세요. **GitHub Pages의 하위 경로 URL 등록을 허용하는지는 실제 등록 화면에서 확인**해야 합니다. 등록이 어려우면 자체 도메인을 검토할 수 있습니다.
- [Bing Webmaster Tools](https://www.bing.com/webmasters): 사이트 등록·소유권 확인 후 사이트맵 제출. 필요하면 Google Search Console 가져오기 기능을 검토합니다.
- 제출했다고 검색 결과 상단에 표시되는 것은 아닙니다. 색인·노출·클릭 자료를 관찰하세요.

## 4. robots.txt와 GitHub Pages 하위 경로 (주의)

현재 GitHub Pages 배포 경로는 `https://hty0525.github.io/investing-basics/`입니다.

`/investing-basics/robots.txt`가 만들어지더라도 **Google이 호스트에 적용하는 robots 규칙 파일은 `https://hty0525.github.io/robots.txt`입니다.** 프로젝트 하위 경로 파일을 호스트 루트의 robots.txt처럼 안내하면 안 됩니다.

이 저장소에서 `src/app/robots.ts`를 생성하는 이유는 프로젝트 경로에서의 참고용 파일과 사이트맵 주소 안내입니다. **호스트 루트 robots 정책을 설정하거나 대체하는 기능은 없습니다.** 실제 호스트 루트 robots를 수정하려면 해당 호스트를 관리할 수 있는 별도 배포 권한이 필요합니다. robots 파일이 없어도 공개 페이지가 기본적으로 색인 금지되는 것은 아닙니다.

Search Console에 사이트맵을 직접 제출하는 것이 현실적인 우선 조치입니다.

## 5. Sitemap 수정일 운영 규칙 (P1)

- ETF 상세 URL: 해당 ETF의 가장 최근에 반영한 가격 데이터 날짜
- 메인·ETF 목록·계산기·롤링·상품 유형별 상세: 계산/메타 데이터가 갱신된 날짜
- 개념 글: 데이터 예시가 있다면 해당 예시 데이터 갱신일, 없다면 마지막 콘텐츠 검토일
- 정적 설명(사용법·용어집·방법론): `src/lib/site.ts`의 `LAST_REVIEW`를 **내용이 실질적으로 변경됐을 때만** 갱신
- Google은 sitemap의 `priority`, `changefreq`를 무시하므로 이 사이트는 출력하지 않습니다.

## 6. 콘텐츠·신뢰성 품질 확인 (P1)

- 실측 가격·분배금·환율, 계산 가정, 실제 세금 미반영을 명확히 구분합니다.
- 검증되지 않은 분배금이나 오류 의심 데이터는 결과를 확정된 총수익률처럼 표시하지 않습니다.
- [운영 주체와 방법론](/investing-basics/about/), [출처 검증](/investing-basics/sources/), [오류 제보](https://github.com/hty0525/investing-basics/issues)를 쉽게 찾아갈 수 있게 유지합니다.
- 운영자의 경력·전문 자격을 입증할 수 없다면 단정해 기재하지 않습니다.
- 검색 의도에 맞는 페이지 제목·첫 설명·표·실제 수치·한계 및 출처를 함께 제공하고, 광고성 키워드 반복이나 얇은 중복 페이지 양산은 피합니다.
- 사용자에게 보이는 내용과 Article 등 JSON-LD가 일치하는지 확인합니다. FAQ/HowTo 마크업 자체가 Google 리치 결과를 보장하지는 않습니다.

## 7. 모바일·속도 실측 (P1)

대표 URL 각각을 [PageSpeed Insights](https://pagespeed.web.dev/)와 실제 모바일 브라우저에서 검사합니다.

- 홈, ETF 상세, 유형별 비교, 시뮬레이터, 계산기
- 사용자 중심 Core Web Vitals: LCP ≤ 2.5초, INP ≤ 200ms, CLS ≤ 0.1 (75번째 백분위 기준)
- 모바일 터치: 가격 그래프의 날짜/종가 확인, 검색 필터, 넓은 표 좌우 스크롤, 하단 메뉴
- 모바일에서 제목 잘림·가로 넘침·작은 터치 영역·모드 전환 시 콘텐츠 접근성 점검
- 성능 문제가 확인되면 페이지별 JS·차트 데이터 요청·불필요한 렌더링을 실측에 따라 우선 개선합니다.

## 8. 공유 미리보기와 콘텐츠 유지보수 (P2)

- 홈과 개별 ETF URL을 실제로 공유해 Open Graph/Twitter 카드의 제목·이미지·설명을 확인합니다.
- `public/og.png`은 공통 이미지로 유지하되, 사용자 가치가 입증되면 유형별 OG 이미지 추가를 검토합니다.
- 검색 노출수, 클릭률, 검색어, 쿼리별 사용자 유입을 월별로 보고 실제 검색 의도에 맞춰 기존 내용을 개선합니다.

## 공식 근거

- Google sitemap: https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap
- Google 색인 기본 요건: https://developers.google.com/search/docs/essentials/technical
- Google Core Web Vitals: https://developers.google.com/search/docs/appearance/core-web-vitals
- 네이버 사이트맵: https://searchadvisor.naver.com/guide/request-feed
- Bing 사이트맵: https://www2.bing.com/webmasters/help/sitemaps-3b5cf6ed
