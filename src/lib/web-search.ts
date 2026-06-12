export interface SearchResult {
  title: string;
  snippet: string;
  url: string;
  publisher: string;
  date?: string;
}

export async function searchForContext(query: string, lang: string): Promise<SearchResult[]> {
  const serperKey = process.env.SERPER_API_KEY;
  if (!serperKey) return [];

  try {
    const res = await fetch('https://google.serper.dev/search', {
      method: 'POST',
      headers: { 'X-API-KEY': serperKey, 'Content-Type': 'application/json' },
      body: JSON.stringify({ q: query, num: 8, hl: lang === 'ar' ? 'ar' : 'en' }),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) return [];
    const data = await res.json();
    return (data.organic || []).slice(0, 6).map((r: any) => ({
      title: r.title || '',
      snippet: r.snippet || '',
      url: r.link || '',
      publisher: (() => { try { return new URL(r.link).hostname.replace('www.', ''); } catch { return ''; } })(),
      date: r.date || '',
    }));
  } catch {
    return [];
  }
}

export function formatSearchContext(results: SearchResult[], isArabic: boolean): string {
  if (!results.length) return '';
  const header = isArabic
    ? '### مصادر حقيقية من الإنترنت — اقتبس منها واذكر روابطها في sourceNotes:\n'
    : '### LIVE WEB SOURCES — cite these with their exact URLs in sourceNotes:\n';
  const items = results
    .map((r, i) => `[${i + 1}] ${r.publisher}${r.date ? ' · ' + r.date : ''}\nTitle: ${r.title}\nURL: ${r.url}\nSnippet: ${r.snippet}`)
    .join('\n\n');
  return `\n\n${header}${items}`;
}

export function isRepetitive(text: string): boolean {
  if (!text || text.length < 50) return true;
  const sentences = text.split(/[.!?؟\n]+/).map(s => s.trim()).filter(s => s.length > 20);
  if (sentences.length < 2) return false;
  const unique = new Set(sentences.map(s => s.toLowerCase().substring(0, 60)));
  return unique.size < sentences.length * 0.6;
}
