import type { MetadataRoute } from 'next';
import { abs, LAST_REVIEW } from '@/lib/site';
import { KEYS, CATS } from '@/lib/catalog';
import { CONCEPTS } from '@/lib/concepts';
import { META } from '@/lib/data';
export const dynamic = 'force-static';
export default function sitemap(): MetadataRoute.Sitemap {
  const built = new Date(META.built);
  const mk = (p: string, priority: number, freq: 'daily' | 'weekly' | 'monthly' = 'weekly') => ({ url: abs(p), lastModified: built, changeFrequency: freq, priority });
  return [
    mk('/', 1, 'daily'), mk('/etf/', 0.9), mk('/compare/', 0.9), mk('/concepts/', 0.9), mk('/simulator/', 0.8), mk('/sources/', 0.6, 'monthly'), mk('/glossary/', 0.6, 'monthly'), mk('/about/', 0.4, 'monthly'),
    ...CATS.map((c) => mk(`/compare/${c.id}/`, 0.8)), ...CONCEPTS.map((c) => mk(`/concepts/${c.slug}/`, 0.8, 'monthly')), ...KEYS.map((k) => mk(`/etf/${k.toLowerCase()}/`, 0.7)),
  ].map((e) => ({ ...e, lastModified: e.lastModified ?? new Date(LAST_REVIEW) }));
}
