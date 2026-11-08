export default function Tag({ kind = '', children }: { kind?: 'real' | 'hist' | 'sim' | 'wait' | 'bad' | ''; children: React.ReactNode }) {
  return <span className={`tag ${kind}`}>{children}</span>;
}
