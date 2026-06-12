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

function isOfficialEnglishEvidence(url: string): boolean {
  const host = hostname(url);
  if (!host) return false;
  return OFFICIAL_DOMAIN_PARTS.some((part) => host === part || host.endsWith(part) || host.includes(part));
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
  const englishResults = await serperSearch(input.englishQuery, 'en', 10);
  const officialEnglish = englishResults
    .filter((result) => isOfficialEnglishEvidence(result.url))
    .slice(0, 6)
    .map((result) => ({ ...result, evidenceTier: 'official_english' as const }));

  const shouldFetchArabic = input.isArabic && (input.isArabicContext || hasArabicContext(input.text));
  const arabicContext = shouldFetchArabic
    ? (await serperSearch(input.arabicQuery || `${input.text.substring(0, 120)} مصدر رسمي عربي`, 'ar', 6))
        .slice(0, 3)
        .map((result) => ({ ...result, evidenceTier: 'arabic_context' as const }))
    : [];

  return {
    officialEnglish: uniqueByUrl(officialEnglish),
    arabicContext: uniqueByUrl(arabicContext),
    all: uniqueByUrl([...officialEnglish, ...arabicContext]),
  };
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

export function isRepetitive(text: string): boolean {
  if (!text || text.length < 50) return true;
  const sentences = text.split(/[.!?؟\n]+/).map(s => s.trim()).filter(s => s.length > 20);
  if (sentences.length < 2) return false;
  const unique = new Set(sentences.map(s => s.toLowerCase().substring(0, 60)));
  return unique.size < sentences.length * 0.6;
}
