import type { Metadata } from 'next';
import { abs, SITE_NAME } from './site';

export function pageMeta(o: { title: string; description: string; path: string; keywords?: string[]; type?: 'website' | 'article' }): Metadata {
  const url = abs(o.path.endsWith('/') ? o.path : o.path + '/');
  return {
    title: o.title, description: o.description, keywords: o.keywords,
    alternates: { canonical: url },
    openGraph: { title: o.title, description: o.description, url, siteName: SITE_NAME, locale: 'ko_KR', type: o.type ?? 'website', images: [{ url: abs('/og.png'), width: 1200, height: 630, alt: SITE_NAME }] },
    twitter: { card: 'summary_large_image', title: o.title, description: o.description, images: [abs('/og.png')] },
  };
}
export const crumbLd = (items: { name: string; path: string }[]) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map((it, i) => ({ '@type': 'ListItem', position: i + 1, name: it.name, item: abs(it.path.endsWith('/') ? it.path : it.path + '/') })),
});
export const faqLd = (faq: { q: string; a: string }[]) => ({
  '@context': 'https://schema.org', '@type': 'FAQPage',
  mainEntity: faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
});
