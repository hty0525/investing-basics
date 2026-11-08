/** 쉬운 말(그림으로·간단히) / 정식 용어(상세히)를 모드에 따라 바꿔 보여줌 */
export default function T({ e, d, hint }: { e: string; d: string; hint?: string }) {
  return (<><span className="easy-only" title={hint}>{e}<span className="mut" style={{ fontSize: '0.8em' }}> ({d})</span></span><span className="detail-only">{d}</span></>);
}
