import test from "node:test";
import { readFile } from "node:fs/promises";
import assert from "node:assert/strict";
import { buildCoreSitemapXml, buildSitemapIndexXml } from "../src/lib/seo/sitemaps.ts";
import {
  ARTICLE_COUNT,
  SITEMAP_PAGE_SIZE,
  articleIdToParts,
  getArticle,
  getArticleIdFromSlug,
  getArticleMeta
} from "../src/lib/blog/shopping-articles.ts";

test("source generator exposes 100,000 addressable article records", () => {
  assert.equal(ARTICLE_COUNT, 100_000);
  assert.equal(getArticleMeta(1)?.id, 1);
  assert.equal(getArticleMeta(ARTICLE_COUNT)?.id, ARTICLE_COUNT);
  assert.equal(getArticleMeta(0), null);
  assert.equal(getArticleMeta(ARTICLE_COUNT + 1), null);
});

test("article slugs are deterministic and resolve only to exact known slugs", () => {
  const article = getArticleMeta(42);
  assert.ok(article);
  assert.equal(getArticleIdFromSlug(article.slug), 42);
  assert.equal(getArticleIdFromSlug(article.slug + "-extra"), null);
  assert.equal(getArticleIdFromSlug("not-a-valid-slug"), null);
});

test("article content retains structured long-form HTML", () => {
  const article = getArticle(1);
  assert.ok(article);
  assert.ok(article.content.length >= 10_500);
  assert.match(article.content, /<h2>/);
  assert.match(article.content, /<ul>/);
  assert.match(article.content, /<p>/);
  assert.match(article.title, /Online Shopping|Online shopping|shopping/i);
});

test("article ID mapping and sitemap chunk sizing are valid", () => {
  assert.deepEqual(articleIdToParts(1), { angleIndex: 0, themeIndex: 0, topicIndex: 0 });
  assert.equal(articleIdToParts(-1), null);
  assert.equal(SITEMAP_PAGE_SIZE, 1_000);
  assert.equal(Math.ceil(ARTICLE_COUNT / SITEMAP_PAGE_SIZE), 100);
});

test("core sitemap contains only public URLs approved for indexing", () => {
  const xml = buildCoreSitemapXml();

  assert.match(xml, /<urlset /);
  assert.match(xml, /https:\/\/shopes\.online\//);
  assert.match(xml, /https:\/\/shopes\.online\/privacy<\/loc>/);
  assert.match(xml, /https:\/\/shopes\.online\/terms<\/loc>/);
  assert.doesNotMatch(xml, /\/blog(?:\/|<\/loc>)/);
});

test("sitemap index references only the reviewed core sitemap", () => {
  const xml = buildSitemapIndexXml();

  assert.match(xml, /<sitemapindex /);
  assert.match(xml, /https:\/\/shopes\.online\/core-sitemap\.xml/);
  assert.doesNotMatch(xml, /blog-sitemap/);
});

test("sitemap XML escapes unsafe characters in URL values", () => {
  const xml = buildCoreSitemapXml(["/test?x=<tag>&q='quote'"]);
  assert.match(xml, /&lt;tag&gt;/);
  assert.match(xml, /&amp;q=&apos;quote&apos;/);
});

test("generated blog routes stay noindex until editorial review", async () => {
  const files = [
    "src/app/blog/[slug]/page.tsx",
    "src/app/blog/page.tsx",
    "src/app/blog/page/[page]/page.tsx"
  ];

  for (const file of files) {
    const source = await readFile(file, "utf8");
    assert.match(source, /robots:\s*\{\s*index:\s*false,\s*follow:\s*true\s*\}/, file);
  }
});

test("authenticated workspace and sign-in routes are not indexable", async () => {
  const files = [
    "src/app/audit/page.tsx",
    "src/app/backlink-maker/page.tsx",
    "src/app/keyword-research/page.tsx",
    "src/app/dashboard/page.tsx",
    "src/app/login/page.tsx"
  ];

  for (const file of files) {
    const source = await readFile(file, "utf8");
    assert.match(source, /robots:\s*\{\s*index:\s*false,\s*follow:\s*false\s*\}/, file);
  }
});
