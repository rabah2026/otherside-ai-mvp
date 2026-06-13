export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  publisher: string;
  date?: string;
  evidenceTier?: 'official_english' | 'arabic_context' | 'general';
}

const OFFICIAL_DOMAIN_PARTS = [
  '.gov',
  '.int',
  '.edu',
  'fifa.com',
  'uefa.com',
  'olympics.com',
  'the-afc.com',
  'premierleague.com',
  'laliga.com',
  'nba.com',
  'un.org',
  'who.int',
  'worldbank.org',
  'imf.org',
  'wto.org',
  'oecd.org',
  'europa.eu',
  'openai.com',
  'microsoft.com',
  'apple.com',
  'google.com',
  'deepmind.google',
  'anthropic.com',
  'meta.com',
  'tesla.com',
  'spacex.com',
];

// Reputable news agencies — used as a second evidence tier when no primary
// official source is found, so non-sports/tech topics still get real citations.
const REPUTABLE_NEWS_PARTS = [
  'reuters.com',
  'apnews.com',
  'bbc.com',
  'bbc.co.uk',
  'nytimes.com',
  'theguardian.com',
  'aljazeera.com',
  'aljazeera.net',
  'ft.com',
  'washingtonpost.com',
  'wsj.com',
  'bloomberg.com',
  'economist.com',
  'npr.org',
  'cnbc.com',
  'forbes.com',
  'time.com',
  'nature.com',
  'sciencemag.org',
];

// Social/video/UGC platforms — never usable as report evidence regardless
// of tier; their presence produced "strong source: tiktok.com" citations.
const BLOCKED_DOMAIN_PARTS = [
  'youtube.com',
  'youtu.be',
  'tiktok.com',
  'facebook.com',
  'instagram.com',
  'twitter.com',
  'x.com',
  'reddit.com',
  'quora.com',
  'pinterest.com',
  'snapchat.com',
  'threads.net',
  'medium.com',
  'blogspot.com',
  'wordpress.com',
];

const ARABIC_CONTEXT_TERMS = [
  'السعودية', 'الرياض', 'جدة', 'مكة', 'الإمارات', 'دبي', 'قطر', 'الكويت',
  'مصر', 'القاهرة', 'السودان', 'الخرطوم', 'اليمن', 'العراق', 'الأردن',
  'لبنان', 'سوريا', 'فلسطين', 'غزة', 'المغرب', 'الجزائر', 'تونس',
  'وزارة', 'هيئة', 'منصة', 'قوى', 'مدد', 'أبشر', 'ناجز', 'واس',
];

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '').toLowerCase();
  } catch {
    return '';
  }
}

// Safe host matching: a TLD-style part (".gov") matches only as a suffix; a
// full-domain part ("fifa.com") matches the domain itself or a subdomain of it.
// This rejects spoofs like "abc.gov.evil.com" that a naive includes() accepts.
function hostMatchesPart(host: string, part: string): boolean {
  if (part.startsWith('.')) return host.endsWith(part);
  return host === part || host.endsWith('.' + part);
}

function isOfficialEnglishEvidence(url: string): boolean {
  const host = hostname(url);
  if (!host) return false;
  return OFFICIAL_DOMAIN_PARTS.some((part) => hostMatchesPart(host, part));
}

function isReputableNews(url: string): boolean {
  const host = hostname(url);
  if (!host) return false;
  return REPUTABLE_NEWS_PARTS.some((part) => hostMatchesPart(host, part));
}

function isBlockedDomain(url: string): boolean {
  const host = hostname(url);
  if (!host) return true;
  return BLOCKED_DOMAIN_PARTS.some((part) => hostMatchesPart(host, part));
}

export function hasArabicContext(text: string): boolean {
  const lower = text.toLowerCase();
  return ARABIC_CONTEXT_TERMS.some((term) => lower.includes(term.toLowerCase()));
}

async function serperSearch(query: string, lang: 'en' | 'ar', limit = 8): Promise<SearchResult[]> {
  const serperKey = process.env.SERPER_API_KEY;
  if (!serperKey) return [];

  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num: limit, hl: lang }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.organic || []).slice(0, limit).map((r: any) => ({
      title: r.title || '',
      snippet: r.snippet || '',
      url: r.link || '',
      publisher: hostname(r.link || ''),
      date: r.date || '',
      evidenceTier: 'general',
    }));
  } catch {
    return [];
  }
}

function uniqueByUrl(results: SearchResult[]): SearchResult[] {
  const seen = new Set<string>();
  return results.filter((result) => {
    if (!result.url || seen.has(result.url)) return false;
    seen.add(result.url);
    return true;
  });
}

export async function searchForContext(query: string, lang: string): Promise<SearchResult[]> {
  return serperSearch(query, lang === 'ar' ? 'ar' : 'en', 8).then((results) => results.slice(0, 6));
}

export async function searchEvidenceForReport(input: {
  text: string;
  isArabic: boolean;
  isArabicContext?: boolean;
  englishQuery: string;
  arabicQuery?: string;
}): Promise<{ officialEnglish: SearchResult[]; arabicContext: SearchResult[]; all: SearchResult[] }> {
  const englishResults = (await serperSearch(input.englishQuery, 'en', 10))
    .filter((r) => !isBlockedDomain(r.url));

  // Tier 1: primary/official domains. Tier 2: reputable news agencies.
  // Tier 3: top general results — so every topic gets some real citation
  // instead of being told "no evidence found".
  const primary = englishResults.filter((r) => isOfficialEnglishEvidence(r.url));
  const news = englishResults.filter((r) => !isOfficialEnglishEvidence(r.url) && isReputableNews(r.url));
  const general = englishResults.filter((r) => !isOfficialEnglishEvidence(r.url) && !isReputableNews(r.url));

  const officialEnglish = uniqueByUrl([...primary, ...news, ...general.slice(0, 3)])
    .slice(0, 6)
    .map((result) => ({ ...result, evidenceTier: 'official_english' as const }));

  const shouldFetchArabic = input.isArabic && (input.isArabicContext || hasArabicContext(input.text));
  const arabicContext = shouldFetchArabic
    ? (await serperSearch(input.arabicQuery || `${input.text.substring(0, 120)} مصدر رسمي عربي`, 'ar', 6))
        .filter((r) => !isBlockedDomain(r.url))
        .slice(0, 3)
        .map((result) => ({ ...result, evidenceTier: 'arabic_context' as const }))
    : [];

  return {
    officialEnglish: uniqueByUrl(officialEnglish),
    arabicContext: uniqueByUrl(arabicContext),
    all: uniqueByUrl([...officialEnglish, ...arabicContext]),
  };
}

// Normalize a URL for comparison (strip trailing slash, lowercase host).
function normalizeUrl(url: string): string {
  try {
    const u = new URL(url);
    return (u.hostname.replace(/^www\./, '').toLowerCase() + u.pathname.replace(/\/$/, '')).toLowerCase();
  } catch {
    return (url || '').trim().toLowerCase();
  }
}

// Set of normalized URLs the model was actually shown, so generated
// sourceNotes can be checked against it and fabricated links removed.
export function allowedEvidenceUrls(results: SearchResult[]): Set<string> {
  return new Set(results.filter((r) => r.url).map((r) => normalizeUrl(r.url)));
}

export function isUrlInEvidence(url: string, allowed: Set<string>): boolean {
  if (!url) return false;
  return allowed.has(normalizeUrl(url));
}

export function formatSearchContext(results: SearchResult[], isArabic: boolean): string {
  if (!results.length) return '';
  const header = isArabic
    ? '### مصادر متاحة من البحث — استخدمها بحذر في sourceNotes:\n'
    : '### AVAILABLE WEB SOURCES — use carefully in sourceNotes:\n';
  const items = results
    .map((r, i) => `[${i + 1}] ${r.publisher}${r.date ? ' · ' + r.date : ''}\nTitle: ${r.title}\nURL: ${r.url}\nSnippet: ${r.snippet}`)
    .join('\n\n');
  return `\n\n${header}${items}`;
}

export function formatEvidenceContext(
  evidence: { officialEnglish: SearchResult[]; arabicContext: SearchResult[] },
  isArabic: boolean
): string {
  const officialItems = evidence.officialEnglish
    .map((r, i) => `[EN-OFFICIAL-${i + 1}] ${r.publisher}${r.date ? ' · ' + r.date : ''}\nTitle: ${r.title}\nURL: ${r.url}\nSnippet: ${r.snippet}`)
    .join('\n\n');

  const arabicItems = evidence.arabicContext
    .map((r, i) => `[AR-CONTEXT-${i + 1}] ${r.publisher}${r.date ? ' · ' + r.date : ''}\nTitle: ${r.title}\nURL: ${r.url}\nSnippet: ${r.snippet}`)
    .join('\n\n');

  const noOfficial = isArabic
    ? 'لم يتم العثور على مصدر إنجليزي رسمي موثوق في البحث. لا تخترع مصادر؛ استخدم sourceNotes بقوة missing واذكر أن المصدر الرسمي غير متاح ضمن البحث.'
    : 'No official English evidence source was found by search. Do not invent sources; use sourceNotes with strength missing and state that official evidence was not available in the search.';

  const policy = isArabic
    ? 'سياسة الأدلة: ابن الوقائع فقط على مصادر EN-OFFICIAL الإنجليزية الرسمية أدناه، ثم اشرحها بالعربية. مصادر AR-CONTEXT، إن وجدت، تستخدم فقط لفهم السياق المحلي أو العربي.'
    : 'Evidence policy: base factual claims only on the EN-OFFICIAL sources below. AR-CONTEXT sources, if present, are supplemental context only.';

  return `\n\n### EVIDENCE POLICY\n${policy}\n\n### EN-OFFICIAL SOURCES\n${officialItems || noOfficial}${arabicItems ? `\n\n### AR-CONTEXT SOURCES\n${arabicItems}` : ''}`;
}

function wordTrigrams(text: string): Set<string> {
  const words = (text || '').toLowerCase().split(/\s+/).filter(w => w.length > 1);
  const grams = new Set<string>();
  for (let i = 0; i < words.length - 2; i++) {
    grams.add(`${words[i]} ${words[i + 1]} ${words[i + 2]}`);
  }
  return grams;
}

// Fraction of `a`'s word-trigrams that also appear in `b`.
// For very short texts (fewer than 4 trigrams) falls back to
// word-bigram overlap so short list items are still compared correctly.
export function trigramContainment(a: string, b: string): number {
  const wordsA = (a || '').toLowerCase().split(/\s+/).filter(w => w.length > 1);
  const wordsB = (b || '').toLowerCase().split(/\s+/).filter(w => w.length > 1);
  if (wordsA.length < 3 || wordsB.length < 3) return 0;

  // Use bigrams for short texts (< 6 unique trigrams), trigrams otherwise.
  const useBigrams = wordsA.length < 8;
  const buildGrams = (words: string[]): Set<string> => {
    const g = new Set<string>();
    const step = useBigrams ? 1 : 2;
    for (let i = 0; i < words.length - step; i++) {
      g.add(useBigrams ? `${words[i]} ${words[i + 1]}` : `${words[i]} ${words[i + 1]} ${words[i + 2]}`);
    }
    return g;
  };

  const gramsA = buildGrams(wordsA);
  const gramsB = buildGrams(wordsB);
  if (gramsA.size === 0) return 0;
  let shared = 0;
  for (const g of gramsA) if (gramsB.has(g)) shared++;
  return shared / gramsA.size;
}

export function isRepetitive(text: string): boolean {
  if (!text || text.length < 50) return true;
  const sentences = text.split(/[.!?؟\n]+/).map(s => s.trim()).filter(s => s.length > 20);
  if (sentences.length < 2) return false;
  // Catch copy-paste filler: same sentence prefix appearing more than once.
  // Threshold 0.75: up to 25% sentence-prefix repetition is tolerated
  // (a topic word like "الحرب السودانية" may open multiple paragraphs).
  const unique = new Set(sentences.map(s => s.toLowerCase().substring(0, 60)));
  return unique.size < sentences.length * 0.75;
  // Note: the trigram-uniqueness check was removed. Focused Arabic writing
  // about a single topic legitimately repeats topic words ("الجيش السوداني",
  // "قوات الدعم السريع") across sentences, which tank trigram uniqueness
  // even in genuine, non-repetitive prose.
}
