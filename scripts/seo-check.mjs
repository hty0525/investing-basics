#!/usr/bin/env node
/**
 * Check generated GitHub Pages output rather than trusting only source metadata.
 * Run after `npm run build`: `npm run seo:check`.
 * This validates HTML structure; it cannot prove Google indexing or performance.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve, sep } from 'node:path';

const out = resolve('out');
const origin = 'https://hty0525.github.io';
const basePath = '/investing-basics';
const siteUrl = origin + basePath;
const problems = [];

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return name === '_next' ? [] : walk(path);
    return [path];
  });
}
function attr(tag, name) {
  return tag.match(new RegExp('(?:^|\\s)' + name + '="([^"]*)"', 'i'))?.[1] ?? null;
}
function tags(html, tag) {
  return [...html.matchAll(new RegExp('<' + tag + '\\b[^>]*>', 'gi'))].map((m) => m[0]);
}
function check(condition, path, message) {
  if (!condition) problems.push(path + ': ' + message);
}
function fileToPath(file) {
  const rel = relative(out, file).split(sep).join('/');
  return rel === 'index.html' ? '/' : '/' + rel.replace(/\/index\.html$/, '/');
}

if (!existsSync(out)) throw new Error('out/ not found. Run npm run build first.');
// Next.js exports error pages too; these are intentionally noindex, non-sitemap pages.
const files = walk(out).filter((file) => file.endsWith('index.html') && !/(?:^|[\\/])(?:404|_not-found)[\\/]index\\.html$/.test(file));
const paths = new Set(files.map(fileToPath));
check(paths.size >= 60, 'out/', 'expected 60+ static pages, found ' + paths.size);

for (const file of files) {
  const path = fileToPath(file);
  const html = readFileSync(file, 'utf8');
  const expected = siteUrl + path;
  const canonicalTags = tags(html, 'link').filter((tag) => attr(tag, 'rel') === 'canonical');
  const canonical = canonicalTags.length === 1 ? attr(canonicalTags[0], 'href') : null;
  const description = tags(html, 'meta').find((tag) => attr(tag, 'name') === 'description');
  const ogUrl = tags(html, 'meta').find((tag) => attr(tag, 'property') === 'og:url');
  const robots = tags(html, 'meta').find((tag) => attr(tag, 'name') === 'robots');
  const titles = [...html.matchAll(/<title>(.*?)<\/title>/gis)];
  const h1 = [...html.matchAll(/<h1\b/gi)];
  check(canonical === expected, path, 'canonical mismatch: ' + String(canonical));
  check(titles.length === 1 && !!titles[0][1].trim(), path, 'expected one nonempty title, found ' + titles.length + ' [' + titles.map((t) => t[1].slice(0, 90)).join(' / ') + ']');
  check(!!description && !!attr(description, 'content')?.trim(), path, 'missing meta description');
  check(attr(ogUrl ?? '', 'content') === expected, path, 'og:url mismatch');
  check(!robots || !/noindex/i.test(attr(robots, 'content') ?? ''), path, 'unexpected noindex');
  check(h1.length === 1, path, 'expected exactly one H1, found ' + h1.length);
  check(/<html\b[^>]*lang="ko"/i.test(html), path, 'missing Korean document language');

  for (const match of html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)) {
    try { JSON.parse(match[1]); } catch { check(false, path, 'invalid JSON-LD script'); }
  }

  for (const link of tags(html, 'a')) {
    const href = attr(link, 'href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    let url;
    try { url = new URL(href, expected); } catch { continue; }
    if (url.origin !== origin || !url.pathname.startsWith(basePath + '/')) continue;
    const raw = decodeURIComponent(url.pathname.slice(basePath.length));
    if (/\.[a-z0-9]+$/i.test(raw)) continue;
    const target = raw.endsWith('/') ? raw : raw + '/';
    check(paths.has(target), path, 'internal link target missing: ' + href);
  }
}
const sitemapPath = join(out, 'sitemap.xml');
check(existsSync(sitemapPath), 'out/', 'sitemap.xml not found');
if (existsSync(sitemapPath)) {
  const xml = readFileSync(sitemapPath, 'utf8');
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/gi)].map((m) => m[1].replaceAll('&amp;', '&'));
  const expectedLocs = new Set([...paths].map((p) => siteUrl + p));
  check(locs.length === expectedLocs.size, 'sitemap.xml', 'URL count differs from static page count');
  check(new Set(locs).size === locs.length, 'sitemap.xml', 'duplicate sitemap URLs');
  for (const loc of locs) check(expectedLocs.has(loc), 'sitemap.xml', 'unmatched URL: ' + loc);
  for (const loc of expectedLocs) check(locs.includes(loc), 'sitemap.xml', 'missing page: ' + loc);
  for (const lastmod of [...xml.matchAll(/<lastmod>([^<]+)<\/lastmod>/gi)]) {
    check(!Number.isNaN(Date.parse(lastmod[1])), 'sitemap.xml', 'invalid lastmod: ' + lastmod[1]);
  }
}
if (problems.length) {
  for (const item of problems) console.error('SEO ERROR ' + item);
  console.error('SEO audit failed: ' + problems.length + ' problem(s) across ' + paths.size + ' pages.');
  process.exitCode = 1;
} else {
  console.log('SEO audit passed: ' + paths.size + ' static pages, canonicals, titles, descriptions, OG URLs, JSON-LD, internal links, sitemap.');
}
