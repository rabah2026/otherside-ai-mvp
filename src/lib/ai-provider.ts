function extractJson(raw: string): string {
  let text = raw.trim();
  if (text.startsWith('```')) {
    const lines = text.split('\n');
    if (lines[0].startsWith('```')) lines.shift();
    if (lines[lines.length - 1].startsWith('```')) lines.pop();
    text = lines.join('\n').trim();
  }
  const first = text.indexOf('{');
  const last = text.lastIndexOf('}');
  if (first !== -1 && last !== -1 && last > first) {
    return text.substring(first, last + 1);
  }
  return text;
}

function fetchWithTimeout(url: string, options: RequestInit, timeoutMs: number): Promise<Response> {
  // Do NOT pass AbortSignal to fetch — Next.js Turbopack's fetch patch calls
  // .replace() on all option values and throws when it encounters a non-string
  // (AbortSignal is an object). Use Promise.race for timeout instead.
  const fetchPromise = fetch(url, options);
  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`AI request timed out after ${timeoutMs / 1000}s`)), timeoutMs)
  );
  return Promise.race([fetchPromise, timeoutPromise]);
}

export interface AIProvider {
  generateJSON<T>(input: {
    system: string;
    prompt: string;
    timeoutMs?: number;
    maxTokens?: number;
    temperature?: number;
  }): Promise<{ data: T; demoMode: boolean; reason?: string }>;
}

export const aiProvider: AIProvider = {
  async generateJSON<T>({ system, prompt, timeoutMs, maxTokens, temperature }: { system: string; prompt: string; timeoutMs?: number; maxTokens?: number; temperature?: number }): Promise<{ data: T; demoMode: boolean; reason?: string }> {
    const apiBase = (process.env.AI_API_BASE_URL || 'http://localhost:1234/v1').replace(/\/$/, '');
    const apiKey = process.env.OPENAI_API_KEY || 'no-key-required';
    const model = process.env.AI_MODEL || 'google/gemma-4-12b';
    const tokens = maxTokens ?? 4096;
    const temp = temperature ?? 0.1;

    const isLocalhost = apiBase.includes('localhost') || apiBase.includes('127.0.0.1');

    // Fast-fail when no real API is configured (catches misconfigured Vercel deployments).
    if (isLocalhost) {
      const reason = `AI_API_BASE_URL not set — using localhost fallback. Set it in Vercel environment variables.`;
      console.warn('AI Provider:', reason);
      return { data: null as unknown as T, demoMode: true, reason };
    }

    const duration = timeoutMs ?? 25000;

    try {
      const response = await fetchWithTimeout(
        `${apiBase}/chat/completions`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model,
            messages: [
              { role: 'system', content: system },
              { role: 'user', content: prompt },
            ],
            temperature: temp,
            max_tokens: tokens,
            response_format: { type: 'json_object' },
          }),
        },
        duration
      );

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        // Some models don't support response_format — retry without it.
        if (response.status === 400 && errBody.includes('response_format')) {
          const retryRes = await fetchWithTimeout(
            `${apiBase}/chat/completions`,
            {
              method: 'POST',
              headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
              body: JSON.stringify({
                model,
                messages: [
                  { role: 'system', content: system },
                  { role: 'user', content: prompt },
                ],
                temperature: temp,
                max_tokens: tokens,
              }),
            },
            duration
          );
          if (!retryRes.ok) {
            throw new Error(`AI API error ${retryRes.status} (model: ${model})`);
          }
          const retryJson = await retryRes.json();
          const retryText = extractJson(retryJson.choices?.[0]?.message?.content || '');
          if (!retryText) throw new Error('API returned empty content on retry');
          const parsed = JSON.parse(retryText);
          return { data: parsed as T, demoMode: false };
        }
        throw new Error(`AI API error ${response.status} (model: ${model}): ${errBody.slice(0, 200)}`);
      }

      const resJson = await response.json();
      const contentText = extractJson(resJson.choices?.[0]?.message?.content || '');
      if (!contentText) {
        throw new Error('API returned empty message content');
      }

      const parsed = JSON.parse(contentText);
      return { data: parsed as T, demoMode: false };
    } catch (e: any) {
      const reason = String(e?.message || e || 'Unknown error');
      console.warn('AI Provider error — falling back to demo mode:', reason);
      return { data: null as unknown as T, demoMode: true, reason };
    }
  },
};
