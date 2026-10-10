export type SearchIntent = "Informational" | "Commercial" | "Transactional" | "Navigational" | "Local" | "Unclassified";
export type KeywordLanguage = "English" | "Georgian";
export type KeywordIdea = {
  phrase: string;
  normalized: string;
  kind: string;
  intent: SearchIntent;
  intentConfidence: "heuristic";
  cluster: string;
  wordCount: number;
  longTail: boolean;
  specificityScore: number;
  relevanceScore: number;
  opportunityScore: number;
  provenance: "locally-generated";
  metricsStatus: "unavailable";
};

type LanguageRules = {
  modifiers: Array<{ phrase: string; kind: string; intent: SearchIntent }>;
  questions: string[];
  suffixes: Array<{ phrase: string; kind: string; intent: SearchIntent }>;
  synonyms: Record<string, string[]>;
};

const RULES: Record<KeywordLanguage, LanguageRules> = {
  English: {
    modifiers: [
      { phrase: "best", kind: "Commercial modifier", intent: "Commercial" },
      { phrase: "top", kind: "Commercial modifier", intent: "Commercial" },
      { phrase: "affordable", kind: "Commercial modifier", intent: "Commercial" },
      { phrase: "reviews", kind: "Review modifier", intent: "Commercial" },
      { phrase: "alternatives", kind: "Comparison modifier", intent: "Commercial" },
      { phrase: "vs", kind: "Comparison modifier", intent: "Commercial" },
      { phrase: "buy", kind: "Purchase modifier", intent: "Transactional" },
      { phrase: "price", kind: "Price modifier", intent: "Transactional" },
      { phrase: "online", kind: "Purchase modifier", intent: "Transactional" },
      { phrase: "near me", kind: "Local modifier", intent: "Local" },
      { phrase: "how to choose", kind: "Question modifier", intent: "Informational" },
      { phrase: "how to use", kind: "Question modifier", intent: "Informational" },
      { phrase: "for beginners", kind: "Audience modifier", intent: "Informational" },
      { phrase: "checklist", kind: "Content modifier", intent: "Informational" },
      { phrase: "ideas", kind: "Content modifier", intent: "Informational" },
    ],
    questions: ["what is", "how to", "why does", "when to choose", "where to find", "which", "is it worth"],
    suffixes: [
      { phrase: "guide", kind: "Topic variation", intent: "Informational" },
      { phrase: "tips", kind: "Topic variation", intent: "Informational" },
      { phrase: "examples", kind: "Topic variation", intent: "Informational" },
      { phrase: "benefits", kind: "Topic variation", intent: "Informational" },
      { phrase: "cost", kind: "Price modifier", intent: "Transactional" },
      { phrase: "comparison", kind: "Comparison modifier", intent: "Commercial" },
    ],
    synonyms: {
      "buy": ["purchase", "shop for"],
      "cheap": ["affordable", "budget"],
      "guide": ["tutorial", "how-to"],
      "reviews": ["ratings", "customer feedback"],
    },
  },
  Georgian: {
    modifiers: [
      { phrase: "საუკეთესო", kind: "კომერციული მოდიფიკატორი", intent: "Commercial" },
      { phrase: "იაფი", kind: "ფასის მოდიფიკატორი", intent: "Commercial" },
      { phrase: "ფასი", kind: "ფასის მოდიფიკატორი", intent: "Transactional" },
      { phrase: "ყიდვა", kind: "შეძენის მოდიფიკატორი", intent: "Transactional" },
      { phrase: "ონლაინ", kind: "შეძენის მოდიფიკატორი", intent: "Transactional" },
      { phrase: "მიმოხილვა", kind: "მიმოხილვის მოდიფიკატორი", intent: "Commercial" },
      { phrase: "შედარება", kind: "შედარების მოდიფიკატორი", intent: "Commercial" },
      { phrase: "ალტერნატივები", kind: "შედარების მოდიფიკატორი", intent: "Commercial" },
      { phrase: "როგორ გამოვიყენოთ", kind: "კითხვითი მოდიფიკატორი", intent: "Informational" },
      { phrase: "როგორ ავირჩიოთ", kind: "კითხვითი მოდიფიკატორი", intent: "Informational" },
      { phrase: "დამწყებთათვის", kind: "აუდიტორიის მოდიფიკატორი", intent: "Informational" },
      { phrase: "იდეები", kind: "თემატური მოდიფიკატორი", intent: "Informational" },
      { phrase: "რჩევები", kind: "თემატური მოდიფიკატორი", intent: "Informational" },
      { phrase: "ახლო მდებარე", kind: "ლოკალური მოდიფიკატორი", intent: "Local" },
    ],
    questions: ["რა არის", "როგორ", "რატომ", "როდის", "სად ვიყიდოთ", "რომელი", "ღირს თუ არა"],
    suffixes: [
      { phrase: "გზამკვლევი", kind: "თემატური ვარიანტი", intent: "Informational" },
      { phrase: "რჩევები", kind: "თემატური ვარიანტი", intent: "Informational" },
      { phrase: "მაგალითები", kind: "თემატური ვარიანტი", intent: "Informational" },
      { phrase: "უპირატესობები", kind: "თემატური ვარიანტი", intent: "Informational" },
      { phrase: "ღირებულება", kind: "ფასის მოდიფიკატორი", intent: "Transactional" },
      { phrase: "შედარება", kind: "შედარების მოდიფიკატორი", intent: "Commercial" },
    ],
    synonyms: {
      "ყიდვა": ["შეძენა", "შეკვეთა"],
      "იაფი": ["ხელმისაწვდომი", "ბიუჯეტური"],
      "გზამკვლევი": ["ინსტრუქცია", "სახელმძღვანელო"],
    },
  },
};

export function normalizeKeyword(value: string): string {
  return value.normalize("NFKC").toLocaleLowerCase().replace(/[\u200B-\u200D\uFEFF]/g, "").replace(/[“”„]/g, '"').replace(/[’‘]/g, "'").replace(/\s+/g, " ").trim();
}

export function classifyIntent(phrase: string, language: KeywordLanguage): SearchIntent {
  const value = normalizeKeyword(phrase);
  const rules = RULES[language];
  if (/(?:^|\s)(?:near me|nearby|local|close to me)(?:\s|$)/i.test(value) || /ახლო მდებარე|ჩემთან ახლოს|ახლომახლო/.test(value)) return "Local";
  if (/(?:^|\s)(?:buy|purchase|order|price|pricing|cost|shop|coupon|discount)(?:\s|$)/i.test(value) || /ყიდვა|შეძენა|შეკვეთა|ფასი|ღირებულება|ფასდაკლება/.test(value)) return "Transactional";
  if (/(?:^|\s)(?:best|top|review|reviews|vs|versus|alternative|alternatives|compare|comparison|rating)(?:\s|$)/i.test(value) || /საუკეთესო|მიმოხილვა|შედარება|ალტერნატივა|რეიტინგი/.test(value)) return "Commercial";
  if (rules.questions.some((prefix) => value === prefix || value.startsWith(prefix + " ")) || /(?:^|\s)(?:how|what|why|when|where|which|guide|tutorial|tips|examples|benefits)(?:\s|$)/i.test(value) || /^(რა არის|როგორ|რატომ|როდის|სად|რომელი|რჩევები|მაგალითები)(?:\s|$)/.test(value)) return "Informational";
  if (/^(?:www\.)?[^\s]+\.(?:com|org|net|io|ge|co\.uk)(?:\s|$)/i.test(value) || /(?:^|\s)(?:login|sign in|official website|website)(?:\s|$)/i.test(value)) return "Navigational";
  return "Unclassified";
}

function words(value: string): string[] {
  return value.split(/[\s\p{P}\p{S}]+/u).filter(Boolean);
}

function clusterFor(kind: string, intent: SearchIntent, language: KeywordLanguage): string {
  const value = kind.toLocaleLowerCase();
  if (/question|კითხვით/.test(value)) return language === "Georgian" ? "კითხვები და სწავლა" : "Questions & learning";
  if (/comparison|review|შედარებ|მიმოხილვ/.test(value)) return language === "Georgian" ? "შედარება და ალტერნატივები" : "Comparison & alternatives";
  if (/purchase|price|buying|შეძენის|ფასის|ფასის/.test(value)) return language === "Georgian" ? "ყიდვა და ფასი" : "Buying & pricing";
  if (/local|ლოკალურ/.test(value) || intent === "Local") return language === "Georgian" ? "ლოკალური ძიება" : "Local intent";
  if (/synonym|სინონიმ/.test(value)) return language === "Georgian" ? "სინონიმები" : "Synonyms";
  if (/audience|content|topic|თემატურ|აუდიტორიის/.test(value)) return language === "Georgian" ? "თემები და აუდიტორია" : "Topics & audience";
  if (/shorter|short-tail|მოკლე/.test(value)) return language === "Georgian" ? "ფრაზის ვარიანტები" : "Phrase variations";
  return language === "Georgian" ? "ძირითადი თემა" : "Core topic";
}

function scorePhrase(phrase: string, seed: string, intent: SearchIntent): Pick<KeywordIdea, "wordCount" | "longTail" | "specificityScore" | "relevanceScore" | "opportunityScore"> {
  const wordCount = words(phrase).length;
  const seedTokens = new Set(words(normalizeKeyword(seed)));
  const phraseTokens = words(normalizeKeyword(phrase));
  const overlap = phraseTokens.filter((token) => seedTokens.has(token)).length / Math.max(1, seedTokens.size);
  const specificityScore = Math.min(100, Math.round((Math.min(wordCount, 8) / 8) * 65 + (phrase.length >= 18 ? 20 : phrase.length >= 10 ? 12 : 4) + (phraseTokens.some((token) => /^\d+$/.test(token)) ? 5 : 0)));
  const relevanceScore = Math.min(100, Math.max(0, Math.round(overlap * 75 + (normalizeKeyword(phrase).includes(normalizeKeyword(seed)) ? 25 : 10))));
  const intentBonus: Record<SearchIntent, number> = { Informational: 8, Commercial: 12, Transactional: 10, Navigational: 0, Local: 7, Unclassified: 3 };
  // A transparent prioritization heuristic, not an estimate of search demand or SERP difficulty.
  const opportunityScore = Math.min(100, Math.max(0, Math.round(specificityScore * 0.45 + relevanceScore * 0.4 + intentBonus[intent])));
  return { wordCount, longTail: wordCount >= 4, specificityScore, relevanceScore, opportunityScore };
}

export function generateKeywordIdeas(seedInput: string, language: KeywordLanguage, maxResults = 250): KeywordIdea[] {
  const seed = seedInput.trim().replace(/\s+/g, " ");
  if (!seed) return [];
  if (seed.length > 120) throw new Error("Seed keyword must be 120 characters or fewer.");
  const rules = RULES[language];
  const candidates: Array<{ phrase: string; kind: string; intent?: SearchIntent }> = [{ phrase: seed, kind: "Seed keyword", intent: classifyIntent(seed, language) }];
  for (const item of rules.modifiers) {
    candidates.push({ phrase: item.phrase + " " + seed, kind: item.kind, intent: item.intent });
    candidates.push({ phrase: seed + " " + item.phrase, kind: item.kind, intent: item.intent });
  }
  for (const question of rules.questions) candidates.push({ phrase: question + " " + seed, kind: language === "Georgian" ? "კითხვითი ვარიანტი" : "Question variation", intent: "Informational" });
  for (const item of rules.suffixes) candidates.push({ phrase: seed + " " + item.phrase, kind: item.kind, intent: item.intent });
  for (const [needle, alternatives] of Object.entries(rules.synonyms)) {
    if (normalizeKeyword(seed).includes(normalizeKeyword(needle))) {
      for (const alternative of alternatives) candidates.push({ phrase: normalizeKeyword(seed).replace(normalizeKeyword(needle), alternative), kind: language === "Georgian" ? "სინონიმური ვარიანტი" : "Synonym variation" });
    }
  }
  const tokens = seed.split(" ");
  if (tokens.length > 1) {
    candidates.push({ phrase: tokens.slice(0, -1).join(" "), kind: language === "Georgian" ? "მოკლე ფრაზა" : "Shorter phrase" });
    candidates.push({ phrase: tokens.slice(1).join(" "), kind: language === "Georgian" ? "მოკლე ფრაზა" : "Shorter phrase" });
  }
  const unique = new Map<string, KeywordIdea>();
  for (const candidate of candidates) {
    const phrase = candidate.phrase.trim().replace(/\s+/g, " ");
    const normalized = normalizeKeyword(phrase);
    if (!normalized || normalized.length > 180 || unique.has(normalized)) continue;
    const intent = candidate.intent || classifyIntent(phrase, language);
    unique.set(normalized, {
      phrase, normalized, kind: candidate.kind, intent, intentConfidence: "heuristic",
      cluster: clusterFor(candidate.kind, intent, language), ...scorePhrase(phrase, seed, intent),
      provenance: "locally-generated", metricsStatus: "unavailable",
    });
    if (unique.size >= Math.min(Math.max(1, maxResults), 250)) break;
  }
  return [...unique.values()];
}

export type ImportedSerpRecord = {
  keyword: string;
  url: string;
  domain: string;
  title: string;
  description: string;
  rank?: number;
  source: string;
  sourceDate?: string;
  importedAt: string;
};

export type DomainOverlap = { domain: string; occurrences: number; keywords: string[]; averageRank: number | null };

function parseCsvLine(line: string): string[] {
  const fields: string[] = [];
  let value = "";
  let quoted = false;
  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];
    if (char === '"' && quoted && line[i + 1] === '"') { value += '"'; i += 1; }
    else if (char === '"') quoted = !quoted;
    else if (char === "," && !quoted) { fields.push(value); value = ""; }
    else value += char;
  }
  fields.push(value);
  return fields;
}

export function parseImportedSerpData(input: string, format: "csv" | "json", sourceLabel = "User-provided dataset"): ImportedSerpRecord[] {
  if (!input.trim()) throw new Error("Choose a non-empty CSV or JSON file.");
  if (input.length > 2_000_000) throw new Error("Dataset exceeds the 2 MB import limit.");
  let rows: Array<Record<string, unknown>>;
  if (format === "json") {
    let parsed: unknown;
    try { parsed = JSON.parse(input); } catch { throw new Error("The JSON file is not valid JSON."); }
    if (!Array.isArray(parsed)) throw new Error("JSON must contain an array of result objects.");
    rows = parsed as Array<Record<string, unknown>>;
  } else {
    const lines = input.replace(/^\uFEFF/, "").split(/\r?\n/).filter((line) => line.trim());
    if (lines.length < 2) throw new Error("CSV needs a header row and at least one result row.");
    const headers = parseCsvLine(lines[0]).map((header) => normalizeKeyword(header).replace(/[\s-]+/g, "_"));
    rows = lines.slice(1).map((line) => Object.fromEntries(parseCsvLine(line).map((value, index) => [headers[index] || "column_" + index, value])));
  }
  if (rows.length > 5000) throw new Error("Dataset is limited to 5,000 rows per import.");
  const importedAt = new Date().toISOString();
  const output: ImportedSerpRecord[] = [];
  for (const row of rows) {
    if (!row || typeof row !== "object") continue;
    const keyword = String(row.keyword ?? row.query ?? "").trim().slice(0, 180);
    const rawUrl = String(row.url ?? row.link ?? "").trim();
    const title = String(row.title ?? "").trim().slice(0, 300);
    const description = String(row.description ?? row.snippet ?? "").trim().slice(0, 1000);
    let url: URL;
    try { url = new URL(rawUrl); } catch { continue; }
    if (!["http:", "https:"].includes(url.protocol) || !keyword) continue;
    const rawRank = Number(row.rank ?? row.position);
    const rank = Number.isInteger(rawRank) && rawRank >= 1 && rawRank <= 1000 ? rawRank : undefined;
    const rawDate = String(row.source_date ?? row.date ?? row.fetched_at ?? "").trim();
    const parsedDate = rawDate ? new Date(rawDate) : null;
    const sourceDate = parsedDate && Number.isFinite(parsedDate.getTime()) ? parsedDate.toISOString() : undefined;
    output.push({ keyword, url: url.toString(), domain: url.hostname.toLowerCase().replace(/^www\./, ""), title, description, ...(rank ? { rank } : {}), source: sourceLabel.slice(0, 120), ...(sourceDate ? { sourceDate } : {}), importedAt });
  }
  if (!output.length) throw new Error("No valid results found. Include keyword/query and an absolute http(s) URL/link column.");
  return output;
}

export function summarizeDomainOverlap(records: ImportedSerpRecord[]): DomainOverlap[] {
  const byDomain = new Map<string, { keywords: Set<string>; ranks: number[]; occurrences: number }>();
  for (const record of records) {
    const current = byDomain.get(record.domain) || { keywords: new Set<string>(), ranks: [], occurrences: 0 };
    current.keywords.add(normalizeKeyword(record.keyword));
    current.occurrences += 1;
    if (record.rank !== undefined) current.ranks.push(record.rank);
    byDomain.set(record.domain, current);
  }
  return [...byDomain.entries()].map(([domain, value]) => ({
    domain, occurrences: value.occurrences, keywords: [...value.keywords],
    averageRank: value.ranks.length ? Math.round(value.ranks.reduce((sum, rank) => sum + rank, 0) / value.ranks.length * 10) / 10 : null,
  })).sort((a, b) => b.keywords.length - a.keywords.length || b.occurrences - a.occurrences || a.domain.localeCompare(b.domain));
}

export function csvEscape(value: unknown): string {
  let cell = String(value ?? "");
  // Neutralize spreadsheet formulas while preserving valid CSV quoting.
  if (/^[\s]*[=+@\-\t\r]/.test(cell)) cell = "'" + cell;
  return '"' + cell.replace(/"/g, '""') + '"';
}

export function exportKeywordCsv(ideas: KeywordIdea[], country: string, language: string): string {
  const headers = ["Keyword", "Type", "Intent (heuristic)", "Cluster", "Word count", "Long-tail", "Specificity score", "Relevance score", "Shopes Opportunity Score", "Provenance", "Verified metrics", "Market", "Language"];
  return [headers, ...ideas.map((item) => [item.phrase, item.kind, item.intent, item.cluster, item.wordCount, item.longTail ? "Yes" : "No", item.specificityScore, item.relevanceScore, item.opportunityScore, item.provenance, "Unavailable", country, language])]
    .map((row) => row.map(csvEscape).join(",")).join("\r\n");
}
