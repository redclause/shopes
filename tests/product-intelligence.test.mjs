import test from "node:test";
import assert from "node:assert/strict";
import { buildRecommendations, scoreProduct, sentimentSignals } from "../src/lib/product-intelligence.ts";

test("product score uses the six published categories and weights sum to 100", () => {
  const result = scoreProduct({
    title: "Trail Running Shoes for Wet Weather",
    description: "Lightweight trail running shoes with a grippy outsole and a breathable upper for wet weather training and everyday use.",
    price: 89.99,
    currency: "USD",
    imageCount: 4,
    imagesWithAlt: 4,
    canonical: "https://store.example/products/trail-shoe",
    productSchema: true,
    availability: "InStock",
    rating: 4.6,
    reviewCount: 125,
    url: "https://store.example/products/trail-shoe",
  });
  assert.equal(result.categories.length, 6);
  assert.equal(result.categories.reduce((sum, category) => sum + category.weight, 0), 100);
  assert.ok(result.overall >= 0 && result.overall <= 100);
  assert.equal(result.coverage, 100);
});

test("missing product details lower the score and generate actionable recommendations", () => {
  const product = { title: "", description: "", imageCount: 0, price: null, productSchema: false };
  const result = scoreProduct(product);
  const recommendations = buildRecommendations(product);
  assert.ok(result.overall < 50);
  assert.ok(recommendations.some((item) => item.priority === "Critical" && item.target === "title"));
  assert.ok(recommendations.some((item) => item.priority === "Critical" && item.target === "description"));
  assert.ok(recommendations.every((item) => ["Critical", "Recommended", "Optional"].includes(item.priority)));
});

test("review keyword signal is transparent when no sentiment words exist", () => {
  const result = sentimentSignals("The item arrived on Tuesday.");
  assert.equal(result.positive, 0);
  assert.equal(result.negative, 0);
  assert.equal(result.neutral, 100);
  assert.match(result.note, /not a model-based sentiment analysis/i);
});

test("review keyword signal calculates simple positive and negative word proportions", () => {
  const result = sentimentSignals("Great quality, comfortable fit, but slow delivery and a broken box.");
  assert.equal(result.positive, 50);
  assert.equal(result.negative, 50);
});
