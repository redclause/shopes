import test from "node:test";
import assert from "node:assert/strict";
import { GET as getCoreSitemap } from "../src/app/core-sitemap.xml/route.ts";
import { GET as getSitemapIndex } from "../src/app/sitemap.xml/route.ts";
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

test("core sitemap includes the homepage, blog, and paginated blog indexes", async () => {
  const response = await getCoreSitemap();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /application\/xml/);

  const xml = await response.text();
  assert.match(xml, /<urlset /);
  assert.match(xml, /https:\/\/shopes\.online\//);
  assert.match(xml, /https:\/\/shopes\.online\/blog<\/loc>/);
  assert.match(xml, /https:\/\/shopes\.online\/blog\/page\/2<\/loc>/);
  assert.match(xml, /https:\/\/shopes\.online\/blog\/page\/1000<\/loc>/);
});

test("sitemap index references the core sitemap and all article sitemap chunks", async () => {
  const response = await getSitemapIndex();
  assert.equal(response.status, 200);

  const xml = await response.text();
  assert.match(xml, /<sitemapindex /);
  assert.match(xml, /https:\/\/shopes\.online\/core-sitemap\.xml/);
  assert.match(xml, /https:\/\/shopes\.online\/blog-sitemap\/1<\/loc>/);
  assert.match(xml, /https:\/\/shopes\.online\/blog-sitemap\/100<\/loc>/);
});
