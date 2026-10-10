export type SearchIntent = "Informational" | "Commercial" | "Transactional" | "Navigational" | "Local" | "Unclassified";
export type KeywordLanguage =
  | "English" | "Georgian" | "Spanish" | "French" | "German" | "Portuguese" | "Italian"
  | "Dutch" | "Russian" | "Ukrainian" | "Turkish" | "Arabic" | "Hindi" | "Chinese"
  | "Japanese" | "Korean" | "Indonesian" | "Vietnamese" | "Polish" | "Swedish";

export type KeywordIdea = {
  phrase: string; normalized: string; kind: string; intent: SearchIntent;
  intentConfidence: "heuristic"; cluster: string; wordCount: number; longTail: boolean;
  specificityScore: number; relevanceScore: number; opportunityScore: number;
  estimatedCpcLowUsd: number; estimatedCpcHighUsd: number; cpcConfidence: "low";
  provenance: "locally-generated"; metricsStatus: "unavailable";
};

type LanguageRules = {
  label: string;
  modifiers: Array<{ phrase: string; kind: string; intent: SearchIntent }>;
  questions: string[];
  suffixes: Array<{ phrase: string; kind: string; intent: SearchIntent }>;
  synonyms: Record<string, string[]>;
};

const makeRules = (
  label: string,
  modifiers: Array<[string, string, SearchIntent]>,
  questions: string[],
  suffixes: Array<[string, string, SearchIntent]>,
  synonyms: Record<string, string[]> = {},
): LanguageRules => ({
  label,
  modifiers: modifiers.map(([phrase, kind, intent]) => ({ phrase, kind, intent })),
  questions,
  suffixes: suffixes.map(([phrase, kind, intent]) => ({ phrase, kind, intent })),
  synonyms,
});

export const KEYWORD_LANGUAGE_RULES: Record<KeywordLanguage, LanguageRules> = {
  English: makeRules("English", [
    ["best","Commercial modifier","Commercial"],["top","Commercial modifier","Commercial"],["affordable","Commercial modifier","Commercial"],
    ["reviews","Review modifier","Commercial"],["alternatives","Comparison modifier","Commercial"],["vs","Comparison modifier","Commercial"],
    ["buy","Purchase modifier","Transactional"],["price","Price modifier","Transactional"],["online","Purchase modifier","Transactional"],
    ["near me","Local modifier","Local"],["for beginners","Audience modifier","Informational"],["checklist","Content modifier","Informational"],
  ], ["what is","how to","why does","when to choose","where to find","which","is it worth"], [
    ["guide","Topic variation","Informational"],["tips","Topic variation","Informational"],["examples","Topic variation","Informational"],
    ["benefits","Topic variation","Informational"],["cost","Price modifier","Transactional"],["comparison","Comparison modifier","Commercial"],
  ], { buy:["purchase","shop for"], cheap:["affordable","budget"], guide:["tutorial","how-to"], reviews:["ratings","customer feedback"] }),
  Georgian: makeRules("ქართული", [
    ["საუკეთესო","კომერციული მოდიფიკატორი","Commercial"],["იაფი","ფასის მოდიფიკატორი","Commercial"],["ფასი","ფასის მოდიფიკატორი","Transactional"],
    ["ყიდვა","შეძენის მოდიფიკატორი","Transactional"],["ონლაინ","შეძენის მოდიფიკატორი","Transactional"],["მიმოხილვა","მიმოხილვის მოდიფიკატორი","Commercial"],
    ["შედარება","შედარების მოდიფიკატორი","Commercial"],["ალტერნატივები","შედარების მოდიფიკატორი","Commercial"],["დამწყებთათვის","აუდიტორიის მოდიფიკატორი","Informational"],
    ["ახლო მდებარე","ლოკალური მოდიფიკატორი","Local"],["რჩევები","თემატური მოდიფიკატორი","Informational"],
  ], ["რა არის","როგორ","რატომ","როდის","სად ვიყიდოთ","რომელი","ღირს თუ არა"], [
    ["გზამკვლევი","თემატური ვარიანტი","Informational"],["რჩევები","თემატური ვარიანტი","Informational"],["მაგალითები","თემატური ვარიანტი","Informational"],
    ["უპირატესობები","თემატური ვარიანტი","Informational"],["ღირებულება","ფასის მოდიფიკატორი","Transactional"],["შედარება","შედარების მოდიფიკატორი","Commercial"],
  ], { ყიდვა:["შეძენა","შეკვეთა"], იაფი:["ხელმისაწვდომი","ბიუჯეტური"], გზამკვლევი:["ინსტრუქცია","სახელმძღვანელო"] }),
  Spanish: makeRules("Español", [
    ["mejor","Modificador comercial","Commercial"],["barato","Modificador de precio","Commercial"],["reseñas","Modificador de reseñas","Commercial"],
    ["alternativas","Comparación","Commercial"],["comprar","Compra","Transactional"],["precio","Precio","Transactional"],["en línea","Compra","Transactional"],["cerca de mí","Local","Local"],["para principiantes","Audiencia","Informational"],
  ], ["qué es","cómo","por qué","cuándo","dónde comprar","cuál","vale la pena"], [
    ["guía","Tema","Informational"],["consejos","Tema","Informational"],["ejemplos","Tema","Informational"],["beneficios","Tema","Informational"],["costo","Precio","Transactional"],["comparación","Comparación","Commercial"],
  ], { comprar:["adquirir","pedir"], barato:["económico","asequible"], guía:["tutorial","manual"] }),
  French: makeRules("Français", [
    ["meilleur","Modificateur commercial","Commercial"],["pas cher","Prix","Commercial"],["avis","Avis","Commercial"],["alternatives","Comparaison","Commercial"],
    ["acheter","Achat","Transactional"],["prix","Prix","Transactional"],["en ligne","Achat","Transactional"],["près de moi","Local","Local"],["pour débutants","Public","Informational"],
  ], ["qu'est-ce que","comment","pourquoi","quand","où acheter","quel","est-ce que ça vaut"], [
    ["guide","Sujet","Informational"],["conseils","Sujet","Informational"],["exemples","Sujet","Informational"],["avantages","Sujet","Informational"],["coût","Prix","Transactional"],["comparaison","Comparaison","Commercial"],
  ], { acheter:["commander","acquérir"], pas:["abordable","économique"], guide:["tutoriel","manuel"] }),
  German: makeRules("Deutsch", [
    ["beste","Kommerziell","Commercial"],["günstig","Preis","Commercial"],["bewertungen","Bewertungen","Commercial"],["alternativen","Vergleich","Commercial"],
    ["kaufen","Kauf","Transactional"],["preis","Preis","Transactional"],["online","Kauf","Transactional"],["in meiner nähe","Lokal","Local"],["für anfänger","Zielgruppe","Informational"],
  ], ["was ist","wie","warum","wann","wo kaufen","welche","lohnt sich"], [
    ["ratgeber","Thema","Informational"],["tipps","Thema","Informational"],["beispiele","Thema","Informational"],["vorteile","Thema","Informational"],["kosten","Preis","Transactional"],["vergleich","Vergleich","Commercial"],
  ], { kaufen:["bestellen","erwerben"], günstig:["preiswert","erschwinglich"], ratgeber:["anleitung","leitfaden"] }),
  Portuguese: makeRules("Português", [
    ["melhor","Comercial","Commercial"],["barato","Preço","Commercial"],["avaliações","Avaliações","Commercial"],["alternativas","Comparação","Commercial"],
    ["comprar","Compra","Transactional"],["preço","Preço","Transactional"],["online","Compra","Transactional"],["perto de mim","Local","Local"],["para iniciantes","Público","Informational"],
  ], ["o que é","como","por que","quando","onde comprar","qual","vale a pena"], [
    ["guia","Tema","Informational"],["dicas","Tema","Informational"],["exemplos","Tema","Informational"],["benefícios","Tema","Informational"],["custo","Preço","Transactional"],["comparação","Comparação","Commercial"],
  ], { comprar:["adquirir","encomendar"], barato:["econômico","acessível"], guia:["tutorial","manual"] }),
  Italian: makeRules("Italiano", [
    ["migliore","Commerciale","Commercial"],["economico","Prezzo","Commercial"],["recensioni","Recensioni","Commercial"],["alternative","Confronto","Commercial"],
    ["comprare","Acquisto","Transactional"],["prezzo","Prezzo","Transactional"],["online","Acquisto","Transactional"],["vicino a me","Locale","Local"],["per principianti","Pubblico","Informational"],
  ], ["che cos'è","come","perché","quando","dove comprare","quale","ne vale la pena"], [
    ["guida","Argomento","Informational"],["consigli","Argomento","Informational"],["esempi","Argomento","Informational"],["vantaggi","Argomento","Informational"],["costo","Prezzo","Transactional"],["confronto","Confronto","Commercial"],
  ]),
  Dutch: makeRules("Nederlands", [
    ["beste","Commercieel","Commercial"],["goedkoop","Prijs","Commercial"],["reviews","Reviews","Commercial"],["alternatieven","Vergelijking","Commercial"],
    ["kopen","Aankoop","Transactional"],["prijs","Prijs","Transactional"],["online","Aankoop","Transactional"],["bij mij in de buurt","Lokaal","Local"],["voor beginners","Doelgroep","Informational"],
  ], ["wat is","hoe","waarom","wanneer","waar kopen","welke","is het de moeite waard"], [
    ["gids","Onderwerp","Informational"],["tips","Onderwerp","Informational"],["voorbeelden","Onderwerp","Informational"],["voordelen","Onderwerp","Informational"],["kosten","Prijs","Transactional"],["vergelijking","Vergelijking","Commercial"],
  ]),
  Russian: makeRules("Русский", [
    ["лучший","Коммерческий","Commercial"],["недорогой","Цена","Commercial"],["отзывы","Отзывы","Commercial"],["альтернативы","Сравнение","Commercial"],
    ["купить","Покупка","Transactional"],["цена","Цена","Transactional"],["онлайн","Покупка","Transactional"],["рядом со мной","Местный","Local"],["для начинающих","Аудитория","Informational"],
  ], ["что такое","как","почему","когда","где купить","какой","стоит ли"], [
    ["руководство","Тема","Informational"],["советы","Тема","Informational"],["примеры","Тема","Informational"],["преимущества","Тема","Informational"],["стоимость","Цена","Transactional"],["сравнение","Сравнение","Commercial"],
  ]),
  Ukrainian: makeRules("Українська", [
    ["найкращий","Комерційний","Commercial"],["недорогий","Ціна","Commercial"],["відгуки","Відгуки","Commercial"],["альтернативи","Порівняння","Commercial"],
    ["купити","Покупка","Transactional"],["ціна","Ціна","Transactional"],["онлайн","Покупка","Transactional"],["поруч зі мною","Місцевий","Local"],["для початківців","Аудиторія","Informational"],
  ], ["що таке","як","чому","коли","де купити","який","чи варто"], [
    ["посібник","Тема","Informational"],["поради","Тема","Informational"],["приклади","Тема","Informational"],["переваги","Тема","Informational"],["вартість","Ціна","Transactional"],["порівняння","Порівняння","Commercial"],
  ]),
  Turkish: makeRules("Türkçe", [
    ["en iyi","Ticari","Commercial"],["ucuz","Fiyat","Commercial"],["yorumlar","Yorumlar","Commercial"],["alternatifler","Karşılaştırma","Commercial"],
    ["satın al","Satın alma","Transactional"],["fiyat","Fiyat","Transactional"],["online","Satın alma","Transactional"],["yakınımda","Yerel","Local"],["yeni başlayanlar için","Kitle","Informational"],
  ], ["nedir","nasıl","neden","ne zaman","nereden alınır","hangi","değer mi"], [
    ["rehber","Konu","Informational"],["ipuçları","Konu","Informational"],["örnekler","Konu","Informational"],["faydalar","Konu","Informational"],["maliyet","Fiyat","Transactional"],["karşılaştırma","Karşılaştırma","Commercial"],
  ]),
  Arabic: makeRules("العربية", [
    ["أفضل","تجاري","Commercial"],["رخيص","السعر","Commercial"],["مراجعات","مراجعات","Commercial"],["بدائل","مقارنة","Commercial"],
    ["شراء","شراء","Transactional"],["سعر","السعر","Transactional"],["عبر الإنترنت","شراء","Transactional"],["بالقرب مني","محلي","Local"],["للمبتدئين","جمهور","Informational"],
  ], ["ما هو","كيف","لماذا","متى","أين أشتري","أي","هل يستحق"], [
    ["دليل","موضوع","Informational"],["نصائح","موضوع","Informational"],["أمثلة","موضوع","Informational"],["فوائد","موضوع","Informational"],["تكلفة","السعر","Transactional"],["مقارنة","مقارنة","Commercial"],
  ]),
  Hindi: makeRules("हिन्दी", [
    ["सबसे अच्छा","व्यावसायिक","Commercial"],["सस्ता","कीमत","Commercial"],["समीक्षा","समीक्षा","Commercial"],["विकल्प","तुलना","Commercial"],
    ["खरीदें","खरीद","Transactional"],["कीमत","कीमत","Transactional"],["ऑनलाइन","खरीद","Transactional"],["मेरे पास","स्थानीय","Local"],["शुरुआती लोगों के लिए","दर्शक","Informational"],
  ], ["क्या है","कैसे","क्यों","कब","कहाँ खरीदें","कौन सा","क्या यह उपयोगी है"], [
    ["गाइड","विषय","Informational"],["सुझाव","विषय","Informational"],["उदाहरण","विषय","Informational"],["लाभ","विषय","Informational"],["लागत","कीमत","Transactional"],["तुलना","तुलना","Commercial"],
  ]),
  Chinese: makeRules("简体中文", [
    ["最佳","商业修饰词","Commercial"],["便宜","价格","Commercial"],["评价","评价","Commercial"],["替代品","比较","Commercial"],
    ["购买","购买","Transactional"],["价格","价格","Transactional"],["在线","购买","Transactional"],["附近","本地","Local"],["适合初学者","受众","Informational"],
  ], ["什么是","如何","为什么","何时","哪里购买","哪个","值得吗"], [
    ["指南","主题","Informational"],["技巧","主题","Informational"],["示例","主题","Informational"],["优点","主题","Informational"],["费用","价格","Transactional"],["比较","比较","Commercial"],
  ]),
  Japanese: makeRules("日本語", [
    ["おすすめ","商用修飾語","Commercial"],["安い","価格","Commercial"],["レビュー","レビュー","Commercial"],["代替","比較","Commercial"],
    ["購入","購入","Transactional"],["価格","価格","Transactional"],["オンライン","購入","Transactional"],["近く","ローカル","Local"],["初心者向け","対象","Informational"],
  ], ["とは","方法","なぜ","いつ","どこで買う","どれ","価値がある"], [
    ["ガイド","トピック","Informational"],["ヒント","トピック","Informational"],["例","トピック","Informational"],["メリット","トピック","Informational"],["費用","価格","Transactional"],["比較","比較","Commercial"],
  ]),
  Korean: makeRules("한국어", [
    ["최고의","상업","Commercial"],["저렴한","가격","Commercial"],["리뷰","리뷰","Commercial"],["대안","비교","Commercial"],
    ["구매","구매","Transactional"],["가격","가격","Transactional"],["온라인","구매","Transactional"],["내 주변","지역","Local"],["초보자를 위한","대상","Informational"],
  ], ["무엇인가","방법","왜","언제","어디서 구매","어떤","가치가 있나"], [
    ["가이드","주제","Informational"],["팁","주제","Informational"],["예시","주제","Informational"],["장점","주제","Informational"],["비용","가격","Transactional"],["비교","비교","Commercial"],
  ]),
  Indonesian: makeRules("Bahasa Indonesia", [
    ["terbaik","Komersial","Commercial"],["murah","Harga","Commercial"],["ulasan","Ulasan","Commercial"],["alternatif","Perbandingan","Commercial"],
    ["beli","Pembelian","Transactional"],["harga","Harga","Transactional"],["online","Pembelian","Transactional"],["dekat saya","Lokal","Local"],["untuk pemula","Audiens","Informational"],
  ], ["apa itu","cara","mengapa","kapan","tempat membeli","mana","apakah layak"], [
    ["panduan","Topik","Informational"],["tips","Topik","Informational"],["contoh","Topik","Informational"],["manfaat","Topik","Informational"],["biaya","Harga","Transactional"],["perbandingan","Perbandingan","Commercial"],
  ]),
  Vietnamese: makeRules("Tiếng Việt", [
    ["tốt nhất","Thương mại","Commercial"],["giá rẻ","Giá","Commercial"],["đánh giá","Đánh giá","Commercial"],["lựa chọn thay thế","So sánh","Commercial"],
    ["mua","Mua hàng","Transactional"],["giá","Giá","Transactional"],["trực tuyến","Mua hàng","Transactional"],["gần tôi","Địa phương","Local"],["cho người mới bắt đầu","Đối tượng","Informational"],
  ], ["là gì","cách","tại sao","khi nào","mua ở đâu","nào","có đáng không"], [
    ["hướng dẫn","Chủ đề","Informational"],["mẹo","Chủ đề","Informational"],["ví dụ","Chủ đề","Informational"],["lợi ích","Chủ đề","Informational"],["chi phí","Giá","Transactional"],["so sánh","So sánh","Commercial"],
  ]),
  Polish: makeRules("Polski", [
    ["najlepszy","Komercyjny","Commercial"],["tani","Cena","Commercial"],["opinie","Opinie","Commercial"],["alternatywy","Porównanie","Commercial"],
    ["kup","Zakup","Transactional"],["cena","Cena","Transactional"],["online","Zakup","Transactional"],["w pobliżu","Lokalny","Local"],["dla początkujących","Odbiorcy","Informational"],
  ], ["co to jest","jak","dlaczego","kiedy","gdzie kupić","który","czy warto"], [
    ["poradnik","Temat","Informational"],["wskazówki","Temat","Informational"],["przykłady","Temat","Informational"],["korzyści","Temat","Informational"],["koszt","Cena","Transactional"],["porównanie","Porównanie","Commercial"],
  ]),
  Swedish: makeRules("Svenska", [
    ["bästa","Kommersiell","Commercial"],["billig","Pris","Commercial"],["recensioner","Recensioner","Commercial"],["alternativ","Jämförelse","Commercial"],
    ["köp","Köp","Transactional"],["pris","Pris","Transactional"],["online","Köp","Transactional"],["nära mig","Lokal","Local"],["för nybörjare","Målgrupp","Informational"],
  ], ["vad är","hur","varför","när","var kan man köpa","vilken","är det värt"], [
    ["guide","Ämne","Informational"],["tips","Ämne","Informational"],["exempel","Ämne","Informational"],["fördelar","Ämne","Informational"],["kostnad","Pris","Transactional"],["jämförelse","Jämförelse","Commercial"],
  ]),
};

export const SUPPORTED_KEYWORD_LANGUAGES = Object.keys(KEYWORD_LANGUAGE_RULES) as KeywordLanguage[];
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

function estimateCpc(intent: SearchIntent): Pick<KeywordIdea, "estimatedCpcLowUsd" | "estimatedCpcHighUsd" | "cpcConfidence"> {
  // Deliberately broad, uncalibrated ranges based only on heuristic intent—not observed bids or keyword data.
  const ranges: Record<SearchIntent, [number, number]> = {
    Informational: [0.05, 1.25],
    Commercial: [0.25, 2.75],
    Transactional: [0.35, 3.5],
    Navigational: [0.05, 1.5],
    Local: [0.2, 2.5],
    Unclassified: [0.05, 1.75],
  };
  const [estimatedCpcLowUsd, estimatedCpcHighUsd] = ranges[intent];
  return { estimatedCpcLowUsd, estimatedCpcHighUsd, cpcConfidence: "low" };
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
      ...estimateCpc(intent), provenance: "locally-generated", metricsStatus: "unavailable",
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
  const headers = ["Keyword", "Type", "Intent (heuristic)", "Cluster", "Word count", "Long-tail", "Specificity score", "Relevance score", "Shopes Opportunity Score", "Modelled CPC low (USD)", "Modelled CPC high (USD)", "CPC confidence", "Provenance", "Verified metrics", "Market", "Language"];
  return [headers, ...ideas.map((item) => [item.phrase, item.kind, item.intent, item.cluster, item.wordCount, item.longTail ? "Yes" : "No", item.specificityScore, item.relevanceScore, item.opportunityScore, item.estimatedCpcLowUsd, item.estimatedCpcHighUsd, "Low — uncalibrated heuristic", item.provenance, "Unavailable", country, language])]
    .map((row) => row.map(csvEscape).join(",")).join("\r\n");
}
