import Link from 'next/link';
import { pageMeta, faqLd } from '@/lib/seo';
import { LEARN } from '@/lib/concepts';
import { abs } from '@/lib/site';
import Crumbs from '@/components/Crumbs';
import JsonLd from '@/components/JsonLd';
import Disclaimer from '@/components/Disclaimer';
export const metadata = pageMeta({ title: '사용법 — 투자 지식이 없어도 5분 만에 이해하는 이 사이트 활용 가이드', description: '간단하게 보기/상세하게 보기 전환, 개념 학습 순서, 시뮬레이터·가정 계산기·과거 롤링 결과 읽는 법, 모바일 사용 팁을 단계별로 안내합니다.', path: '/guide/', keywords: ['사용법', '적립식 투자 입문', 'ETF 처음', '시뮬레이터 사용법'], type: 'article' });
const faq = [
  { q: '투자를 전혀 몰라도 쓸 수 있나요?', a: '네. 홈의 “처음이라면 이 순서로”를 따라 개념 글(간단하게 보기)을 읽고, 이후 시뮬레이터와 계산기를 사용해 보세요.' },
  { q: '간단하게 보기와 상세하게 보기는 무엇이 다른가요?', a: '같은 데이터와 같은 계산을 쓰고 표현의 깊이만 다릅니다. 간단하게 보기는 핵심 숫자와 쉬운 설명, 상세하게 보기는 계산 근거·출처·세부 지표까지 보여줍니다. 선택은 브라우저에 저장됩니다.' },
  { q: '입력한 값이 서버로 전송되나요?', a: '아니요. 시뮬레이터와 계산기는 모두 브라우저에서 계산하며 입력값을 전송하지 않습니다.' },
  { q: '이 사이트의 결과로 투자 결정을 해도 되나요?', a: '교육·비교용 정보이며 투자 권유가 아닙니다. 과거 성과는 미래를 보장하지 않고 모든 결과는 세전입니다.' },
];
export default function Page() {
  return (
    <article className="prose">
      <Crumbs items={[{ name: '사용법', path: '/guide/' }]} />
      <h1>사용법 — 처음 오셨다면</h1>
      <p className="lead">투자 지식이 없어도 괜찮습니다. 아래 순서대로 보면 이 사이트의 숫자를 읽을 수 있습니다.</p>
      <Disclaimer />
      <h2>0. 먼저: 보기 방식 고르기</h2>
      <p>화면 위쪽(모바일은 맨 위 줄)의 <b>그림으로 / 간단히 / 상세히</b> 버튼으로 바꿉니다. 같은 데이터이고 표현의 깊이만 달라지며 선택은 이 브라우저에 저장됩니다. 처음에는 <b>그림으로</b>가 기본이에요.</p>
      <div className="grid g3">
        <div className="card"><h3>그림으로</h3><ul><li>한 장에 하나씩, 오른쪽으로 넘기는 카드</li><li>그래프와 한 줄 설명, 최악 수치는 빨간색</li><li>글이 많은 게 싫은 분께 추천</li></ul></div>
        <div className="card"><h3>간단히</h3><ul><li>쉬운 말 설명, 핵심 숫자 몇 개</li><li>“한 줄 요약” 문장</li><li>처음 보는 사람에게 추천</li></ul></div>
        <div className="card"><h3>상세히</h3><ul><li>정의·공식·한계·출처까지 전체 설명</li><li>XIRR, 변동성, 거래 내역, 검증 상태</li><li>계산 근거를 확인하고 싶은 사람에게</li></ul></div>
      </div>
      <h2>1. 개념을 이 순서로 익히세요</h2>
      <ol className="steps">{LEARN.map((l) => (<li key={l.slug}><Link href={`/concepts/${l.slug}/`}><b>{l.step}</b></Link> <span className="mut">· {l.min}분</span><div className="easy-only mut">{l.easy}</div><div className="detail-only mut">{l.detail}</div></li>))}</ol>
      <h2>2. 직접 해보기 — 세 가지 도구</h2>
      <div className="grid g3">
        <div className="card"><h3><Link href="/rolling/">과거 롤링 결과</Link></h3><p className="mut">“언제 시작했느냐에 따라 얼마나 달랐나”를 최악·중앙·최고로 봅니다. <b>제일 먼저 보세요.</b></p></div>
        <div className="card"><h3><Link href="/simulator/">시뮬레이터</Link></h3><p className="mut">ETF 최대 3종을 골라 내가 정한 시작일부터 월 적립한 실제 과거 결과를 계산합니다.</p></div>
        <div className="card"><h3><Link href="/calculator/">가정 계산기</Link></h3><p className="mut">내가 정한 수익률 가정(마이너스 포함)으로 예상 금액을 계산하고 목표 금액을 역산합니다.</p></div>
      </div>
      <h2>3. 시뮬레이터 사용법</h2>
      <ol className="steps">
        <li><b>ETF 고르기</b> — 드롭다운에서 최대 3종. 2종 이상이면 비중 합이 100%여야 해요.</li>
        <li><b>월 투자금·기간</b> — 시작일은 선택한 ETF 중 가장 늦게 상장한 ETF의 상장일 이후만 가능해요.</li>
        <li><b>계산</b> 버튼 — 결과 맨 위의 “한 줄 요약”을 먼저 읽으세요.</li>
        <li><b>결과 읽기</b> — 납입원금 vs 평가액, 최악 손실 경험, 일시금 비교. “상세하게 보기”를 켜면 XIRR·거래 내역·분배금 합계가 추가돼요.</li>
        <li><b>저장</b> — CSV 버튼으로 내려받아 엑셀에서 확인할 수 있어요.</li>
      </ol>
      <h2>4. 어려운 말 ↔ 쉬운 말</h2>
      <p>“그림으로/간단히”에서는 오른쪽 쉬운 말이 먼저 나오고, “상세히”에서는 왼쪽 정식 용어가 나옵니다.</p>
      <div className="tbl"><table><thead><tr><th>정식 용어</th><th>쉬운 말</th><th>뜻</th></tr></thead><tbody>
        <tr><th scope="row">납입원금</th><td>지금까지 넣은 돈</td><td>내가 실제로 넣은 금액의 합계.</td></tr>
        <tr><th scope="row">평가액</th><td>지금 가치</td><td>지금 팔면 받을 수 있는 금액.</td></tr>
        <tr><th scope="row">납입금 대비 수익률</th><td>넣은 돈 대비 번 비율</td><td>(지금 가치 − 넣은 돈) ÷ 넣은 돈. 1년 수익률이 아님.</td></tr>
        <tr><th scope="row">최대낙폭(MDD)</th><td>가장 많이 떨어진 폭</td><td>가장 비쌌을 때 대비 가장 많이 떨어진 비율.</td></tr>
        <tr><th scope="row">최악 손실 경험</th><td>가장 힘들었던 때</td><td>적립하는 동안 넣은 돈보다 가장 많이 적었던 순간.</td></tr>
        <tr><th scope="row">원금 미달 / 회복</th><td>넣은 돈보다 적은 상태 / 되찾은 날</td><td>지금 가치가 넣은 돈 아래였던 기간과 그 끝.</td></tr>
        <tr><th scope="row">XIRR</th><td>연 평균 수익률</td><td>돈을 넣은 시기를 반영해 1년 단위로 환산한 수익률.</td></tr>
        <tr><th scope="row">분배금</th><td>배당금</td><td>ETF가 나눠 주는 돈(배당·이자 등).</td></tr>
        <tr><th scope="row">가격수익률 / 총수익률</th><td>가격만 / 배당 더한 수익률</td><td>총수익률 = 배당금까지 다시 투자했다고 보고 계산.</td></tr>
        <tr><th scope="row">환헤지(H)</th><td>환율 영향 줄이기</td><td>환율이 변해도 수익이 덜 흔들리게 만든 상품. 완전하진 않음.</td></tr>
        <tr><th scope="row">총보수</th><td>해마다 빠지는 비용</td><td>ETF를 들고 있으면 자동으로 차감되는 연 비용.</td></tr>
        <tr><th scope="row">듀레이션</th><td>금리에 얼마나 민감한가</td><td>클수록 금리 변화에 가격이 크게 흔들림.</td></tr>
        <tr><th scope="row">검증 대기 / 자료 부족</th><td>아직 확인 못함 / 기간이 짧음</td><td>믿을 수 없는 값은 일부러 숨겼다는 표시.</td></tr></tbody></table></div>
      <h2>5. 모바일에서 쓰기</h2>
      <ul>
        <li>화면 아래 메뉴(홈·시뮬레이터·계산기·ETF·사용법)로 이동하세요. 더 많은 메뉴는 홈에서 찾을 수 있어요.</li>
        <li>표가 넓으면 <b>좌우로 밀어서</b> 보세요. 간단하게 보기에서는 열이 줄어 더 읽기 쉬워요.</li>
        <li>숫자 입력칸은 숫자 키패드가 열려요. 입력 후 “계산”을 누르세요.</li>
      </ul>
      <h2>자주 묻는 질문</h2>
      {faq.map((x) => (<details key={x.q}><summary>{x.q}</summary><p>{x.a}</p></details>))}
      <JsonLd data={faqLd(faq)} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'HowTo', name: '투자 기초 사이트 사용법', description: '개념 학습 순서와 시뮬레이터 사용 순서', inLanguage: 'ko-KR', step: LEARN.map((l, i) => ({ '@type': 'HowToStep', position: i + 1, name: l.step, text: l.easy, url: abs(`/concepts/${l.slug}/`) })) }} />
    </article>
  );
}
