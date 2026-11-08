import fs from 'node:fs';
import path from 'node:path';
import meta from '@/data/meta.json';

export type Facts = {
  name?: string; name_history?: string; issuer?: string; index?: string; inception?: string; listing?: string; exchange?: string;
  hedge?: string; fee_pct?: number; fee_asof?: string; real_fee_pct?: number; dist?: string; strategy?: string;
  same_index_as?: string[]; tracking?: string; sources?: string[]; notes?: string; secondary?: boolean; structure_note?: string;
};
export type XCheck = {
  price_primary: string; price_secondary: string; secondary_from: string; overlap_days: number; mismatch_days: number;
  div_check: { ok: number; n: number; bad: unknown[] };
};
export type PMeta = {
  key: string; slug: string; kind: 'US' | 'KR'; ticker: string; name: string | null; currency: 'USD' | 'KRW'; exchange: string;
  first: string; last: string; days: number; divCount: number; div_status: 'ok' | 'review' | 'none'; price_status: 'ok' | 'review';
  excluded_days?: string[]; trimmed_before?: string; xcheck: XCheck;
};
export const META = meta as unknown as {
  products: Record<string, PMeta>; facts: Record<string, Facts>; warnings: string[]; built: string;
  fx: { source: string; source_url: string; last: string; lastRate: number; xcheck: Record<string, unknown> };
};
export const P = (k: string) => META.products[k];
export const FACT = (k: string): Facts => META.facts[k] ?? {};
export const label = (k: string) => (P(k).kind === 'KR' ? P(k).name ?? k : k);
export const isKR = (k: string) => P(k).kind === 'KR';

export type Series = { key: string; d: string[]; c: number[]; div: Record<string, number> };
const cache: Record<string, Series> = {};
export function loadSeries(k: string): Series {
  if (!cache[k]) cache[k] = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/data/products', `${k.toLowerCase()}.json`), 'utf8'));
  return cache[k];
}
let fxCache: { d: string[]; r: number[] } | null = null;
export function loadFx() {
  if (!fxCache) fxCache = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'public/data/fx.json'), 'utf8'));
  return fxCache!;
}
/** 엔진용 데이터 객체 (빌드 시) */
export function engineData(keys: string[]) {
  const products: Record<string, unknown> = {};
  keys.forEach((k) => { const s = loadSeries(k); const m = P(k); products[k] = { ...s, currency: m.currency, first: m.first, last: m.last, kind: m.kind }; });
  return { products, fx: loadFx() };
}
