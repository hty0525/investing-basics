import { GLOSSARY } from '@/lib/concepts';
import { pageMeta } from '@/lib/seo';
import Crumbs from '@/components/Crumbs';
import JsonLd from '@/components/JsonLd';
export const metadata = pageMeta({ title: '투자·ETF 용어집 — DCA, XIRR, MDD, 환헤지, 듀레이션', description: '적립식(DCA), 총수익률, 배당락일, 최대낙폭(MDD), XIRR, 총보수, 추적오차, 괴리율, 환헤지, 듀레이션 등 ETF 투자 용어를 쉬운 한국어로 정리했습니다.', path: '/glossary/' });
export default function Page() {
  return (
    <div className="prose">
      <Crumbs items={[{ name: '용어집', path: '/glossary/' }]} />
      <h1>투자·ETF 용어집</h1>
      <dl>{GLOSSARY.map(([t, d]) => (<div key={t} className="card" style={{ marginBottom: 10 }}><dt><b>{t}</b></dt><dd style={{ margin: '4px 0 0' }}>{d}</dd></div>))}</dl>
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'DefinedTermSet', name: '투자·ETF 용어집', hasDefinedTerm: GLOSSARY.map(([t, d]) => ({ '@type': 'DefinedTerm', name: t, description: d })) }} />
    </div>
  );
}
