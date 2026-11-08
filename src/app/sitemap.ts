import type { MetadataRoute } from 'next';
import { abs, LAST_REVIEW } from '@/lib/site';
import { KEYS, CATS } from '@/lib/catalog';
import { CONCEPTS } from '@/lib/concepts';
import { META, P } from '@/lib/data';

export const dynamic = 'force-static';

/**
 * Google uses lastmod only when it describes significant changes to that URL.
 * - Data-driven pages: updated when their input data is refreshed.
 * - Editorial pages: updated when the editorial review date is changed.
 * Google ignores sitemap priority and changefreq, so neither is emitted.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const dataDate = META.built.slice(0, 10);
  const entry = (path: string, changed: string) => ({
    url: abs(path),
    lastModified: new Date(changed),
  });
  return [
    entry('/', dataDate),
    entry('/etf/', dataDate),
    entry('/compare/', LAST_REVIEW),
    entry('/concepts/', LAST_REVIEW),
    entry('/simulator/', dataDate),
    entry('/calculator/', dataDate),
    entry('/rolling/', dataDate),
    entry('/guide/', LAST_REVIEW),
    entry('/sources/', dataDate),
    entry('/glossary/', LAST_REVIEW),
    entry('/about/', LAST_REVIEW),
    ...CATS.map((c) => entry(`/compare/${c.id}/`, dataDate)),
    ...CONCEPTS.map((c) => entry(`/concepts/${c.slug}/`, c.example ? dataDate : LAST_REVIEW)),
    ...KEYS.map((k) => entry(`/etf/${k.toLowerCase()}/`, P(k).last)),
  ];
}
