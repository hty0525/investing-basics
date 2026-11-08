import Link from 'next/link';
import { pageMeta } from '@/lib/seo';
import { SITE_NAME, DESCRIPTION, abs } from '@/lib/site';
import { CONCEPTS, LEARN } from '@/lib/concepts';
import { CATS } from '@/lib/catalog';
import JsonLd from '@/components/JsonLd';
import Disclaimer from '@/components/Disclaimer';
import CardDeck from '@/components/CardDeck';
import { buildCards } from '@/lib/cards';
import GoalGuide from '@/components/GoalGuide';
import VirtualDca from '@/components/VirtualDca';

export const metadata = { ...pageMeta({ title: '적립식 투자, 나에게 맞을까? — ETF 비교·시뮬레이터', description: DESCRIPTION, path: '/' }), title: { absolute: `적립식 투자, 나에게 맞을까? | ${SITE_NAME}` } };

export default function Home() {
  return (
    <div className="prose">
      <h1>적립식 투자, 나에게 맞을까?</h1>
      <p className="lead visual-only">투자가 처음이어도 괜찮아요. 아래 그림을 <b>오른쪽으로 넘겨</b> 보세요.</p>
      <p className="lead text-only">어떤 ETF가 ‘정답’인지 말하지 않습니다. 같은 금액으로도 상품·시점·환율·분배금에 따라 결과가 어떻게 달랐는지 검증 가능한 과거 데이터로 보여줍니다.</p>
      <section aria-labelledby="start" className="card" style={{ borderColor: '#2b5c93' }}>
        <h2 id="start" style={{ marginTop: 0 }}>처음이라면 이 순서로 보세요</h2>
        <div className="visual-only"><p>글이 많은 건 싫으시죠? <b>오른쪽으로 넘기면서</b> 그림으로 하나씩 익혀보세요. 한 장에 하나만 나와요.</p>
          <CardDeck label="처음이라면: 그림으로 배우는 투자 기초 10장" cards={LEARN.map((l, i) => ({ ...buildCards(l.slug)[0], title: `${i + 1}. ${l.step}`, href: `/concepts/${l.slug}/` }))} endLinks={[{ href: '/rolling/', text: '최악 사례 보기' }, { href: '/simulator/', text: '시뮬레이터' }, { href: '/calculator/', text: '가정 계산기' }]} /></div>
        <p className="easy-only text-only">투자 지식이 전혀 없어도 괜찮아요. 아래 순서대로 <b>하루 5~10분씩</b> 읽으면 이 사이트의 숫자를 이해할 수 있어요. 각 단계는 쉬운 설명(간단하게 보기)과 자세한 설명(상세하게 보기)이 따로 있어요.</p>
        <p className="detail-only text-only">개념 → 지표 해석 → 직접 계산의 순서입니다. 각 개념 글은 정의·공식·한계·실제 데이터 예시를 포함합니다.</p>
        <ol className="steps text-only">{LEARN.map((l) => (<li key={l.slug}><Link href={`/concepts/${l.slug}/`}><b>{l.step}</b></Link> <span className="mut">· {l.min}분</span><div className="easy-only mut">{l.easy}</div><div className="detail-only mut">{l.detail}</div></li>))}
          <li><Link href="/rolling/"><b>직접 확인: 최악일 때는 어땠나</b></Link> <span className="mut">· 5분</span><div className="mut">같은 ETF도 시작 시점에 따라 결과가 크게 달랐어요. 최악의 경우를 꼭 보세요.</div></li>
          <li><Link href="/simulator/"><b>직접 해보기: 시뮬레이터 → 가정 계산기</b></Link> <span className="mut">· 10분</span><div className="mut">과거 실제 데이터로, 그다음 내가 가정한 수익률로 계산해 보세요.</div></li></ol>
        <p style={{ marginBottom: 0 }} className="text-only"><Link className="btn" href="/concepts/dca/">1단계 시작하기 →</Link> <Link className="btn sec" href="/guide/">사이트 사용법</Link></p>
      </section>
      <Disclaimer />
      <div className="banner" style={{ marginTop: 14 }}><b>이 사이트는 좋을 때만 보여주지 않습니다.</b> 모든 결과에 최대낙폭, 원금 미달 기간, 가장 운이 나빴던 시작 시점의 결과를 함께 표시합니다. <Link href="/rolling/">최악 사례 보기</Link></div>
      <div className="grid g3">
        <div className="card"><h3 className="good">좋은 점</h3>한 번에 매수할 시점을 정해야 하는 부담을 줄이고, 정기적으로 투자하기 쉽습니다. 하락 시 같은 금액으로 더 많은 수량을 사게 됩니다.</div>
        <div className="card"><h3 className="warn">주의할 점</h3>시장이 장기간 하락하면 계속 투자해도 손실이 날 수 있습니다. 원금·수익이 보장되지 않으며 상승장에서는 일시금보다 불리할 수도 있습니다.</div>
        <div className="card"><h3 style={{ color: 'var(--ac)' }}>핵심 안내</h3>‘과거 수익률’과 ‘투자 중 감수해야 했던 하락’을 같이 확인하세요. 최종 수익률과 최대낙폭·회복기간은 다른 지표입니다.</div>
      </div>
      <h2>이 사이트로 할 수 있는 것</h2>
      <div className="grid g4">
        <Link className="card stretch" href="/calculator/"><h3>가정 계산기</h3><span className="mut">월 적립·목표 역산, −20%까지 손실 가정 포함</span></Link>
        <Link className="card stretch" href="/rolling/"><h3>과거 롤링 결과</h3><span className="mut">시작 시점별 최악·중앙·최고, 종료 시 원금 미달 비율</span></Link>
        <Link className="card stretch" href="/simulator/"><h3>시뮬레이터</h3><span className="mut">ETF 최대 3종 월 적립 과거 결과, 일시금 비교, 원금 미달·회복</span></Link>
        <Link className="card stretch" href="/compare/"><h3>유형별 비교</h3><span className="mut">미국·국내 상장 ETF 41종을 10개 유형으로 같은 기간 비교</span></Link>
        <Link className="card stretch" href="/concepts/"><h3>핵심 개념 10</h3><span className="mut">XIRR, 최대낙폭, 환율, 환헤지, 총보수, 세금까지</span></Link>
        <Link className="card stretch" href="/sources/"><h3>출처·검증</h3><span className="mut">가격·분배금·환율을 어떻게 교차검증했는지</span></Link>
      </div>
      <h2>자주 하는 오해</h2>
      <ul>
        <li>“무조건 우상향한다” → 장기 횡보·하락 구간이 존재할 수 있습니다.</li>
        <li>“배당이 많으면 총수익이 높다” → 가격 변동과 합친 총수익으로 봐야 합니다. <Link href="/concepts/price-vs-total-return/">자세히</Link></li>
        <li>“ETF는 모두 안전하다” → 기초자산에 따라 위험이 다릅니다.</li>
        <li>“국내 상장이면 환율과 무관하다” → 환노출형이면 원/달러 영향을 받습니다. <Link href="/concepts/hedge/">자세히</Link></li>
      </ul>
      <h2>가상 경로로 연습하기</h2>
      <VirtualDca />
      <h2>유형부터 찾아보기</h2>
      <GoalGuide />
      <h2>개념부터 읽기</h2>
      <div className="chips">{CONCEPTS.map((c) => <Link key={c.slug} href={`/concepts/${c.slug}/`}>{c.title.split('—')[0].split('?')[0]}</Link>)}</div>
      <h2>유형별 ETF 비교</h2>
      <div className="chips">{CATS.map((c) => <Link key={c.id} href={`/compare/${c.id}/`}>{c.label}</Link>)}</div>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'WebSite', name: SITE_NAME, url: abs('/'), inLanguage: 'ko-KR', description: DESCRIPTION, publisher: { '@type': 'Person', name: 'hty0525', url: 'https://github.com/hty0525' } }} />
    </div>
  );
}
