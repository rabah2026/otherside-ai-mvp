export interface AIProvider {
  generateJSON<T>(input: {
    system: string;
    prompt: string;
  }): Promise<{ data: T; demoMode: boolean }>;
}

export const aiProvider: AIProvider = {
  async generateJSON<T>({ system, prompt }: { system: string; prompt: string }): Promise<{ data: T; demoMode: boolean }> {
    const apiBase = process.env.AI_API_BASE_URL || 'http://localhost:1234/v1';
    const apiKey = process.env.OPENAI_API_KEY || 'no-key-required';
    const model = process.env.AI_MODEL || 'google/gemma-4-12b';

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
        }),
      });

      if (!response.ok) {
        throw new Error(`LM Studio / OpenAI API returned error status: ${response.status}`);
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
        if (lines[0].startsWith('```')) {
          lines.shift();
        }
        if (lines[lines.length - 1].startsWith('```')) {
          lines.pop();
        }
        contentText = lines.join('\n').trim();
      }

      const parsed = JSON.parse(contentText);
      return { data: parsed as T, demoMode: false };
    } catch (e) {
      console.warn('AI Provider failed to fetch or parse. Falling back to Demo Mode mocks:', e);
      return { data: null as unknown as T, demoMode: true };
    }
  },
};
