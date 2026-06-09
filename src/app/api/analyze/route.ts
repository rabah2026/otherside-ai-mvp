import { NextResponse } from 'next/server';
import { aiProvider } from '@/lib/ai-provider';
import { StoryAnalysis } from '@/types';

const EXTRACTION_SYSTEM = `You are a text analysis engine. Analyze the user input to detect the structure of the dispute or story. Respond with a strict JSON format matching the schema provided.`;

function getMockAnalysis(text: string): StoryAnalysis {
  const isElonOpenAI = text.toLowerCase().includes('openai') || text.toLowerCase().includes('musk');
  return {
    inputType: isElonOpenAI ? 'business_dispute' : 'unclear',
    mainClaim: isElonOpenAI 
      ? 'Elon Musk claims OpenAI abandoned its original nonprofit mission and became too commercially aligned with Microsoft.' 
      : `Original claim: "${text.substring(0, 100)}${text.length > 100 ? '...' : ''}"`,
    mainParty: isElonOpenAI ? 'Elon Musk' : 'Claimant / Author',
    targetOrOtherParty: isElonOpenAI ? 'OpenAI and Microsoft' : 'Opposing side / Disputed Party',
    topic: isElonOpenAI ? 'Artificial Intelligence Governance & Nonprofit Mission' : 'General Topic',
    timeframe: isElonOpenAI ? '2015 - Present' : null,
    isCurrentEvent: true,
    requiresWebResearch: false,
    sensitiveTopic: isElonOpenAI ? 'legal' : 'none',
    confidence: 'high',
    assumptions: ['Assuming the statement refers to the public dispute between Musk and OpenAI leadership.']
  };
}

export async function POST(req: Request) {
  try {
    const { text, mode } = await req.json();
    if (!text) {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
    }

    const systemPrompt = EXTRACTION_SYSTEM;
    const userPrompt = `Analyze the user input and extract the dispute structure. Return JSON only conforming to the schema.

User input:
${text}

JSON schema:
{
  "inputType": "tweet_or_social_post | article | speech | historical_narrative | legal_claim | business_dispute | unclear",
  "mainClaim": "string",
  "mainParty": "string",
  "targetOrOtherParty": "string",
  "topic": "string",
  "timeframe": "string or null",
  "isCurrentEvent": boolean,
  "requiresWebResearch": boolean,
  "sensitiveTopic": "legal | medical | financial | politics | violence | none",
  "confidence": "high | medium | low",
  "assumptions": ["string"]
}`;

    const result = await aiProvider.generateJSON<StoryAnalysis>({
      system: systemPrompt,
      prompt: userPrompt,
    });

    if (result.demoMode || !result.data || typeof result.data !== 'object') {
      return NextResponse.json({
        ...getMockAnalysis(text),
        demoMode: true,
      });
    }

    return NextResponse.json({
      ...result.data,
      demoMode: false,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal analysis error' }, { status: 500 });
  }
}
