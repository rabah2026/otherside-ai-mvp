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

export interface AIProvider {
  generateJSON<T>(input: {
    system: string;
    prompt: string;
    timeoutMs?: number;
  }): Promise<{ data: T; demoMode: boolean; reason?: string }>;
}

export const aiProvider: AIProvider = {
  async generateJSON<T>({ system, prompt, timeoutMs }: { system: string; prompt: string; timeoutMs?: number }): Promise<{ data: T; demoMode: boolean; reason?: string }> {
    const apiBase = (process.env.AI_API_BASE_URL || 'http://localhost:1234/v1').replace(/\/$/, '');
    const apiKey = process.env.OPENAI_API_KEY || 'no-key-required';
    const model = process.env.AI_MODEL || 'google/gemma-4-12b';

    const isLocalhost = apiBase.includes('localhost') || apiBase.includes('127.0.0.1');
    const timeoutDuration = isLocalhost ? 1500 : (timeoutMs ?? 25000);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

    // Fast-fail when no real API is configured (catches misconfigured Vercel deployments).
    if (isLocalhost) {
      clearTimeout(timeoutId);
      const reason = `AI_API_BASE_URL not set — using localhost fallback (${apiBase}). Set it in Vercel environment variables.`;
      console.warn('AI Provider:', reason);
      return { data: null as unknown as T, demoMode: true, reason };
    }

    try {
      const response = await fetch(`${apiBase}/chat/completions`, {
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
          temperature: 0.1,
          max_tokens: 4096,
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errBody = await response.text().catch(() => '');
        // Some models don't support response_format — retry without it.
        if (response.status === 400 && errBody.includes('response_format')) {
          const retryRes = await fetch(`${apiBase}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({
              model,
              messages: [
                { role: 'system', content: system },
                { role: 'user', content: prompt },
              ],
              temperature: 0.1,
              max_tokens: 4096,
            }),
            signal: controller.signal,
          });
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
      const reason = e?.name === 'AbortError'
        ? `AI request timed out after ${timeoutDuration / 1000}s (model: ${model})`
        : String(e?.message || e);
      console.warn('AI Provider error — falling back to demo mode:', reason);
      return { data: null as unknown as T, demoMode: true, reason };
    } finally {
      clearTimeout(timeoutId);
    }
  },
};
