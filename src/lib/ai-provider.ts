export interface AIProvider {
  generateJSON<T>(input: {
    system: string;
    prompt: string;
  }): Promise<{ data: T; demoMode: boolean; reason?: string }>;
}

export const aiProvider: AIProvider = {
  async generateJSON<T>({ system, prompt }: { system: string; prompt: string }): Promise<{ data: T; demoMode: boolean; reason?: string }> {
    const apiBase = (process.env.AI_API_BASE_URL || 'http://localhost:1234/v1').replace(/\/$/, '');
    const apiKey = process.env.OPENAI_API_KEY || 'no-key-required';
    const model = process.env.AI_MODEL || 'google/gemma-4-12b';

    const isLocalhost = apiBase.includes('localhost') || apiBase.includes('127.0.0.1');
    const timeoutDuration = isLocalhost ? 1500 : 25000;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutDuration);

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
          response_format: { type: 'json_object' },
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`AI API error ${response.status} from ${apiBase} (model: ${model})`);
      }

      const resJson = await response.json();
      let contentText = resJson.choices?.[0]?.message?.content;
      if (!contentText) {
        throw new Error('API returned empty message content');
      }

      // Clean markdown code block if present
      contentText = contentText.trim();
      if (contentText.startsWith('```')) {
        const lines = contentText.split('\n');
        if (lines[0].startsWith('```')) lines.shift();
        if (lines[lines.length - 1].startsWith('```')) lines.pop();
        contentText = lines.join('\n').trim();
      }

      // Slice out actual JSON payload if LLM added preamble like "Here is the JSON:"
      const firstCurly = contentText.indexOf('{');
      const lastCurly = contentText.lastIndexOf('}');
      if (firstCurly !== -1 && lastCurly !== -1 && lastCurly > firstCurly) {
        contentText = contentText.substring(firstCurly, lastCurly + 1);
      }

      const parsed = JSON.parse(contentText);
      return { data: parsed as T, demoMode: false };
    } catch (e: any) {
      const reason = e?.name === 'AbortError'
        ? `AI request timed out after ${timeoutDuration / 1000}s (${apiBase}, model: ${model})`
        : String(e?.message || e);
      console.warn('AI Provider error — falling back to demo mode:', reason);
      return { data: null as unknown as T, demoMode: true, reason };
    } finally {
      clearTimeout(timeoutId);
    }
  },
};
