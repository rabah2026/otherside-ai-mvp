export interface AIProvider {
  generateJSON<T>(input: {
    system: string;
    prompt: string;
  }): Promise<{ data: T; demoMode: boolean }>;
}

async function callAnthropic<T>(system: string, prompt: string): Promise<T> {
  const apiKey = process.env.ANTHROPIC_API_KEY!;
  const model = process.env.AI_MODEL || 'claude-sonnet-4-6';

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 55000);

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 4096,
        system,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.1,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`Anthropic API ${response.status}: ${body}`);
    }

    const resJson = await response.json();
    let contentText: string = resJson.content?.[0]?.text ?? '';
    if (!contentText) throw new Error('Anthropic returned empty content');

    return parseJSONContent<T>(contentText);
  } finally {
    clearTimeout(timeoutId);
  }
}

async function callOpenAICompat<T>(system: string, prompt: string): Promise<T> {
  const apiBase = process.env.AI_API_BASE_URL || 'http://localhost:1234/v1';
  const apiKey = process.env.OPENAI_API_KEY || 'no-key-required';
  const isGroq = apiBase.includes('groq.com');
  const isZAI  = apiBase.includes('z.ai');
  const defaultModel = isGroq ? 'qwen/qwen3-32b'
                     : isZAI  ? 'glm-4.7'
                     : 'gpt-4o';
  // Ignore a stale llama env var on Groq — Llama leaks foreign tokens into Arabic
  const envModel = process.env.AI_MODEL;
  const model = envModel && !(isGroq && envModel.toLowerCase().includes('llama'))
    ? envModel
    : defaultModel;

  // Strip trailing slash so we never produce double-slash paths
  const base = apiBase.replace(/\/$/, '');
  const chatUrl = `${base}/chat/completions`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 55000);

  console.info(`[ai-provider] → ${chatUrl} (model: ${model})`);

  try {
    const response = await fetch(chatUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://otherside.ai',
        'X-Title': 'OtherSide AI',
      },
      body: JSON.stringify({
        model,
        messages: [
          { role: 'system', content: system },
          { role: 'user', content: prompt },
        ],
        temperature: 0.1,
        // Groq: suppress Qwen3 <think> reasoning blocks in the response
        ...(isGroq && model.includes('qwen') ? { reasoning_format: 'hidden' } : {}),
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      const body = await response.text().catch(() => '');
      throw new Error(`API ${response.status} at ${chatUrl} (model: ${model}): ${body.substring(0, 300)}`);
    }

    const resJson = await response.json();
    const contentText: string = resJson.choices?.[0]?.message?.content ?? '';
    if (!contentText) throw new Error('API returned empty message content');

    return parseJSONContent<T>(contentText);
  } finally {
    clearTimeout(timeoutId);
  }
}

function parseJSONContent<T>(raw: string): T {
  // Strip reasoning blocks emitted by thinking models (Qwen3, DeepSeek R1)
  let text = raw.replace(/<think>[\s\S]*?<\/think>/g, '').trim();

  // Strip markdown code fences
  if (text.startsWith('```')) {
    const lines = text.split('\n');
    if (lines[0].startsWith('```')) lines.shift();
    if (lines[lines.length - 1].startsWith('```')) lines.pop();
    text = lines.join('\n').trim();
  }

  // Slice to the outermost JSON object (handles LLM preamble)
  const firstCurly = text.indexOf('{');
  const lastCurly = text.lastIndexOf('}');
  if (firstCurly !== -1 && lastCurly > firstCurly) {
    text = text.substring(firstCurly, lastCurly + 1);
  }

  return JSON.parse(text) as T;
}

export const aiProvider: AIProvider = {
  async generateJSON<T>({ system, prompt }: { system: string; prompt: string }): Promise<{ data: T; demoMode: boolean }> {
    try {
      let data: T;
      if (process.env.ANTHROPIC_API_KEY) {
        data = await callAnthropic<T>(system, prompt);
      } else if (process.env.OPENAI_API_KEY || process.env.AI_API_BASE_URL) {
        data = await callOpenAICompat<T>(system, prompt);
      } else {
        throw new Error('No AI provider configured. Set ANTHROPIC_API_KEY or OPENAI_API_KEY.');
      }
      return { data, demoMode: false };
    } catch (e) {
      console.warn('AI Provider error — falling back to demo mode:', e);
      return { data: null as unknown as T, demoMode: true };
    }
  },
};
