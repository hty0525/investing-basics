import Link from 'next/link';
import { pageMeta } from '@/lib/seo';
import { CATS } from '@/lib/catalog';
import { label } from '@/lib/data';
import { rolling } from '@/lib/rolling';
import { pct } from '@/lib/fmt';
import Crumbs from '@/components/Crumbs';
import Disclaimer from '@/components/Disclaimer';
import Table from '@/components/Table';
import Tag from '@/components/Tag';
import T from '@/components/T';
export const metadata = pageMeta({ title: '과거 롤링 결과 — 월 적립 N년, 최악의 시작 시점은 언제였나', description: 'ETF 41종을 가능한 모든 시작월부터 3·5·10년 적립했을 때의 실제 과거 결과 분포. 최악·25%·중앙값·최고 시작 결과와 종료 시 원금 미달 비율을 공개합니다. 예측이 아닙니다.', path: '/rolling/', keywords: ['적립식 최악', 'ETF 롤링 수익률', '적립식 손실 사례', '시작 시점 차이'] });
export default function Page() {
  const all = CATS.flatMap((c) => [...c.us, ...c.kr]);
  const years = [3, 5, 10];
  return (
    <div className="prose">
      <Crumbs items={[{ name: '과거 롤링 결과', path: '/rolling/' }]} />
      <h1>과거 롤링 결과 — 최악일 때는 어땠을까</h1>
      <p className="lead">같은 ETF를 같은 방식(월 100만원)으로 적립해도 <b>언제 시작했느냐</b>에 따라 결과가 크게 달랐습니다. 가능한 모든 시작월마다 N년 적립한 실제 과거 결과를 보여줍니다.</p>
      <Tag kind="hist">과거 데이터 기반 계산</Tag><Tag>원화 기준</Tag><Tag>분배금 재투자</Tag><Tag>세전</Tag>
      <Disclaimer />
      <section className="card easy-only"><h2 style={{ marginTop: 0 }}>쉽게 읽는 법</h2>
        <ul><li><b>최악 시작</b>: 가장 운이 나빴던 시작 시점의 결과예요. 빨간 숫자가 마이너스면 그때 시작한 사람은 손실을 봤다는 뜻이에요.</li><li><b>중앙값</b>: 시작 시점을 한 줄로 세웠을 때 가운데 결과예요.</li><li><b>최고 시작</b>: 운이 가장 좋았던 경우예요. 이걸 기대하면 안 돼요.</li><li><b>종료 시 원금 미달 비율</b>: 끝났을 때 넣은 돈보다 적었던 경우의 비율이에요.</li></ul></section>
      <div className="hint">표본은 시작월이 한 달씩 밀린 겹치는 기간이라 서로 독립적인 관측이 아닙니다. 상장 기간이 짧으면 N년 창이 12개 미만이라 <Tag kind="wait">자료 부족</Tag>으로 숨깁니다. <b>과거 최악이 미래의 한계가 아닙니다.</b></div>
      {years.map((y) => (
        <section key={y}>
          <h2>{y}년 적립 결과</h2>
          <div className="tbl wide"><table><caption>월 100만원 · {y}년 · 납입금 대비 수익률 · 정렬: 유형 순</caption><thead><tr><th>ETF</th><th>표본</th><th><T e="운 나쁜 시작" d="최악 시작" /></th><th className="detail-only">25% 지점</th><th><T e="가운데 값" d="중앙값" /></th><th className="detail-only">75% 지점</th><th><T e="운 좋은 시작" d="최고 시작" /></th><th><T e="끝났을 때 넣은 돈보다 적었던 비율" d="종료 시 원금 미달" /></th><th className="detail-only">적립 중 최악 손실(중앙값)</th></tr></thead><tbody>
            {all.map((k) => { const w = rolling(k, [3, 5, 10]).find((r) => r.years === y); return w ? (
              <tr key={k}><th scope="row"><Link href={`/etf/${k.toLowerCase()}/`}>{label(k)}</Link>{w.noDiv ? <div><Tag kind="wait">분배금 제외(검증 대기)</Tag></div> : null}</th><td>{w.n}개</td>
                <td className={w.ret.min < 0 ? 'bad' : ''}>{pct(w.ret.min)} <span className="mut">({w.worstStart.d.slice(0, 7)})</span></td><td className="detail-only">{pct(w.ret.p25)}</td><td>{pct(w.ret.median)}</td><td className="detail-only">{pct(w.ret.p75)}</td>
                <td>{pct(w.ret.max)} <span className="mut">({w.bestStart.d.slice(0, 7)})</span></td><td className={w.endBelow > 0 ? 'warn' : ''}>{pct(w.endBelow, 0)}</td><td className="detail-only bad">{pct(w.worstLoss.median)}</td></tr>) : null; })}
          </tbody></table></div>
        </section>
      ))}
      <h2>이 표로 알 수 있는 것과 없는 것</h2>
      <ul>
        <li>알 수 있는 것: 시작 시점에 따라 결과 범위가 얼마나 넓었는지, 최악의 시작이 어땠는지.</li>
        <li>알 수 없는 것: 앞으로의 결과. 과거에 없던 상황이 올 수 있습니다.</li>
        <li>직접 시작월을 고르려면 <Link href="/simulator/">시뮬레이터</Link>, 수익률을 가정해 보려면 <Link href="/calculator/">가정 계산기</Link>를 쓰세요.</li>
      </ul>
    </div>
  );
}
