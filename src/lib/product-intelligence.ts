export type ProductData = {
  id?: string;
  url?: string;
  title?: string;
  description?: string;
  price?: number | null;
  currency?: string;
  brand?: string;
  category?: string;
  imageCount?: number;
  imagesWithAlt?: number;
  canonical?: string;
  productSchema?: boolean;
  availability?: string;
  reviewCount?: number;
  rating?: number;
  reviewText?: string;
  source?: "url" | "catalog";
};

export type ScoreCategory = {
  key: string;
  label: string;
  score: number;
  weight: number;
  detail: string;
};

export type ProductRecommendation = {
  id: string;
  priority: "Critical" | "Recommended" | "Optional";
  category: string;
  title: string;
  detail: string;
  draft?: string;
  target?: "title" | "description";
};

const clamp = (value: number) => Math.max(0, Math.min(100, Math.round(value)));

export function scoreProduct(product: ProductData): { overall: number; categories: ScoreCategory[]; coverage: number } {
  const title = (product.title || "").trim();
  const description = (product.description || "").trim();
  const images = Math.max(0, product.imageCount || 0);
  const altImages = Math.max(0, product.imagesWithAlt || 0);
  const hasPrice = typeof product.price === "number" && Number.isFinite(product.price) && product.price > 0;
  const hasRating = typeof product.rating === "number" && Number.isFinite(product.rating) && product.rating >= 0 && product.rating <= 5;
  const hasReviews = typeof product.reviewCount === "number" && product.reviewCount >= 0;
  const titleScore = !title ? 0 : title.length >= 25 && title.length <= 70 ? 100 : title.length >= 15 && title.length <= 90 ? 72 : 42;
  const descriptionScore = !description ? 0 : description.length >= 120 && description.length <= 1000 ? 100 : description.length >= 60 ? 70 : 38;
  const imageScore = images === 0 ? 15 : clamp(Math.min(images, 5) * 16 + (altImages >= images ? 20 : images > 0 ? 8 : 0));
  const categories: ScoreCategory[] = [
    { key: "seo", label: "SEO & discoverability", score: clamp((titleScore * 0.3) + (descriptionScore * 0.25) + ((product.canonical ? 100 : 30) * 0.15) + ((product.productSchema ? 100 : 25) * 0.3)), weight: 25, detail: "Title, description, canonical URL, and Product structured data." },
    { key: "content", label: "Product content", score: clamp((titleScore * 0.4) + (descriptionScore * 0.6)), weight: 20, detail: "Title clarity and description depth." },
    { key: "visual", label: "Visual merchandising", score: imageScore, weight: 15, detail: "Image quantity and alternative-text coverage." },
    { key: "conversion", label: "Conversion readiness", score: clamp(((hasPrice ? 100 : 20) * 0.35) + ((product.availability ? 100 : 35) * 0.2) + ((hasRating ? 100 : 35) * 0.2) + ((hasReviews && (product.reviewCount || 0) > 0 ? 100 : 30) * 0.25)), weight: 20, detail: "Visible price, availability, rating, and customer proof." },
    { key: "pricing", label: "Pricing signals", score: hasPrice ? 82 : 25, weight: 10, detail: "Price visibility and available competitor price context." },
    { key: "reviews", label: "Review signals", score: hasRating ? clamp((product.rating! / 5) * 75 + (hasReviews && (product.reviewCount || 0) >= 10 ? 25 : hasReviews && (product.reviewCount || 0) > 0 ? 12 : 0)) : 25, weight: 10, detail: "Published rating and review volume; sentiment is not inferred without review text." },
  ];
  const overall = clamp(categories.reduce((total, category) => total + category.score * category.weight, 0) / 100);
  const filled = [title, description, product.url, product.canonical, product.productSchema, product.imageCount !== undefined, product.price, product.availability, product.reviewCount, product.rating].filter((value) => value !== undefined && value !== null && value !== "").length;
  const coverage = clamp((filled / 10) * 100);
  return { overall, categories, coverage };
}

export function buildRecommendations(product: ProductData): ProductRecommendation[] {
  const title = (product.title || "").trim();
  const description = (product.description || "").trim();
  const recommendations: ProductRecommendation[] = [];
  if (!title) {
    recommendations.push({ id: "title-missing", priority: "Critical", category: "SEO", title: "Add a descriptive product title", detail: "The product title is missing. Include the product type and its most useful differentiator without inventing specifications.", target: "title", draft: product.brand ? product.brand + " product" : "Product name — add a verified differentiator" });
  } else if (title.length < 25 || title.length > 70) {
    recommendations.push({ id: "title-length", priority: title.length < 15 || title.length > 100 ? "Critical" : "Recommended", category: "SEO", title: "Refine the product title", detail: "Aim for a concise, specific title. Keep the real product name and add only verified attributes.", target: "title", draft: title.length > 70 ? title.slice(0, 67).trimEnd() + "…" : title });
  }
  if (!description) {
    recommendations.push({ id: "description-missing", priority: "Critical", category: "Content", title: "Write a complete product description", detail: "Explain what the product is, its verified benefits, materials or compatibility where known, and who it is for.", target: "description", draft: "Describe the product’s verified features, intended use, materials or compatibility, care instructions, and what customers should know before purchasing." });
  } else if (description.length < 120) {
    recommendations.push({ id: "description-short", priority: "Recommended", category: "Content", title: "Expand the product description", detail: "Add useful, factual details that answer buyer questions. Avoid unsupported claims and repetitive keywords.", target: "description", draft: description + (description.endsWith(".") ? "" : ".") + " Add verified specifications, key benefits, dimensions or compatibility, usage guidance, and care or warranty information where applicable." });
  }
  if (!product.productSchema) {
    recommendations.push({
      id: "schema", priority: "Recommended", category: "Technical SEO",
      title: "Add valid Product structured data",
      detail: "Include accurate Product JSON-LD for name, image, description, SKU, brand, and eligible offer/review fields. Validate before publishing.",
    });
  }
  if (!product.canonical) {
    recommendations.push({
      id: "canonical", priority: "Recommended", category: "Technical SEO",
      title: "Review the canonical URL",
      detail: "Set a self-referencing canonical URL for the preferred product page and verify variants do not conflict.",
    });
  }
  if (!product.imageCount) {
    recommendations.push({
      id: "images", priority: "Critical", category: "Visuals",
      title: "Add clear product imagery",
      detail: "Provide several distinct, high-resolution product views and ensure images load on mobile.",
    });
  } else if ((product.imagesWithAlt || 0) < product.imageCount) {
    recommendations.push({
      id: "image-alt", priority: "Recommended", category: "Accessibility",
      title: "Improve image alternative text",
      detail: "Write concise alt text for meaningful product images. Describe what is visible; do not stuff keywords.",
    });
  }
  if (!(typeof product.price === "number" && product.price > 0)) {
    recommendations.push({
      id: "price", priority: "Critical", category: "Conversion",
      title: "Make the current price clear",
      detail: "Confirm the price, currency, and applicable offer are visible and consistent with structured data and the checkout.",
    });
  }
  if (!product.availability) {
    recommendations.push({
      id: "availability", priority: "Recommended", category: "Conversion",
      title: "Expose accurate stock availability",
      detail: "Show current availability and keep it synchronized with the inventory source.",
    });
  }
  if (!product.rating || !product.reviewCount) {
    recommendations.push({
      id: "reviews", priority: "Optional", category: "Trust",
      title: "Provide authentic customer feedback",
      detail: "If available, show genuine customer ratings and review counts. Never fabricate reviews or ratings.",
    });
  }
  if (recommendations.length < 3) {
    recommendations.push({
      id: "qa", priority: "Optional", category: "Quality assurance",
      title: "Run a final product-page QA check",
      detail: "Verify mobile layout, image loading, price consistency, variant selection, shipping information, and the checkout path.",
    });
  }
  return recommendations;
}

export function sentimentSignals(text: string): { positive: number; negative: number; neutral: number; note: string } {
  const positiveWords = ["excellent", "great", "love", "easy", "comfortable", "quality", "perfect", "fast", "recommend", "useful", "good", "durable"];
  const negativeWords = ["bad", "poor", "broken", "slow", "difficult", "cheap", "return", "defect", "disappointed", "uncomfortable", "issue", "waste"];
  const words = (text.toLowerCase().match(/[a-z]+/g) || []);
  const positive = words.filter((word) => positiveWords.includes(word)).length;
  const negative = words.filter((word) => negativeWords.includes(word)).length;
  const total = positive + negative;
  if (!total) return { positive: 0, negative: 0, neutral: 100, note: "No clear sentiment keywords found. This simple lexical signal is not a model-based sentiment analysis." };
  return { positive: Math.round(positive / total * 100), negative: Math.round(negative / total * 100), neutral: 0, note: "Basic keyword counts only; context, sarcasm, language coverage, and review authenticity are not evaluated." };
}
