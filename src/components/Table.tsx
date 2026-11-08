export default function Table({ head, rows, caption, detail = [] }: { head: string[]; rows: React.ReactNode[][]; caption?: string; detail?: number[] }) {
  const dc = (i: number) => (detail.includes(i) ? 'detail-only' : undefined);
  return (
    <div className={`tbl${head.length >= 5 ? " wide" : ""}`}>
      <table>
        {caption ? <caption>{caption}</caption> : null}
        <thead><tr>{head.map((h, i) => <th key={h} scope="col" className={dc(i)}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((r, i) => <tr key={i}>{r.map((c, j) => (j === 0 ? <th scope="row" key={j}>{c}</th> : <td key={j} className={dc(j)}>{c}</td>))}</tr>)}</tbody>
      </table>
    </div>
  );
}
