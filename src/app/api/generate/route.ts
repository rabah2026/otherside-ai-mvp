import { NextResponse } from 'next/server';
import { aiProvider } from '@/lib/ai-provider';
import { softRewriteNeutrality } from '@/lib/neutrality-guard';
import { OtherSideReport } from '@/types';

const SYSTEM_PROMPT = `You are OtherSide AI, a neutral counter-story research assistant.
Your job is not to judge who is right. Your job is to identify the missing or opposing side of a story and present that side in the strongest fair form using careful, source-aware language.

Absolute rules:
1. Do not give a verdict.
2. Do not say who is right.
3. Do not say who is lying.
4. Do not morally lecture the user.
5. Do not create false balance. You may describe source strength and uncertainty.
6. Use careful language: "would likely argue", "appears to claim", "may dispute", "based on available sources".
7. Separate facts, claims, interpretations, and disputed points.
8. If sources are missing, say so.
9. If the input is too vague, make a best-effort identification and state assumptions.
10. For current events, prefer official statements, court filings, primary documents, reputable reporting, and direct quotes.

Return JSON matching this schema:
{
  "detectedStory": "string",
  "mainParty": "string",
  "otherParty": "string",
  "otherSideStory": "string",
  "strongestCounterArgument": "string",
  "bothSidesAgreeOn": ["string"],
  "disputedPoints": ["string"],
  "sourceNotes": [
    {
      "sourceType": "official_statement | court_filing | reporting | primary_source | historical_record | unknown",
      "note": "string",
      "strength": "strong | medium | weak | missing",
      "title": "string (optional)",
      "url": "string (optional)"
    }
  ],
  "uncertaintyNotes": ["string"],
  "neutralNote": "This is not a verdict. It presents the other side’s argument without judging who is right."
}`;

function getMockReport(text: string): OtherSideReport {
  const isElonOpenAI = text.toLowerCase().includes('openai') || text.toLowerCase().includes('musk');
  if (isElonOpenAI) {
    return {
      detectedStory: "The pasted story claims that OpenAI betrayed its original nonprofit mission and became too commercially aligned with Microsoft.",
      mainParty: "Elon Musk / critics of OpenAI’s restructuring",
      otherParty: "OpenAI and its leadership",
      otherSideStory: "From OpenAI’s side, the counter-story would likely argue that developing frontier AI required large-scale computing resources, safety work, and capital. The organization may argue that its capped-profit structure and strategic partnerships were created to make the mission practically achievable at scale, rather than to abandon it.",
      strongestCounterArgument: "A strong version of OpenAI’s counter-position is that mission and funding structure are not automatically opposed. From this view, the commercial structure was a tool to fund advanced AI development, while governance and stated mission language remained intended to keep the organization aligned with public benefit.",
      bothSidesAgreeOn: [
        "OpenAI began with a mission focused on broadly beneficial AI.",
        "OpenAI later adopted a capped-profit structure.",
        "Microsoft became a major partner and investor."
      ],
      disputedPoints: [
        "Whether the structural change was a betrayal or a practical necessity.",
        "Whether Microsoft’s role undermined OpenAI’s independence.",
        "Whether OpenAI’s original mission remained meaningfully intact."
      ],
      sourceNotes: [
        {
          sourceType: "official_statement",
          note: "OpenAI official statements would be important for its stated rationale.",
          strength: "strong",
          title: "OpenAI: Our Structure",
          url: "https://openai.com/blog/openai-lp"
        },
        {
          sourceType: "court_filing",
          note: "Court filings would be strong sources for the legal claims made by each side.",
          strength: "strong",
          title: "Superior Court of California Complaint",
          url: "https://www.courthousenews.com/wp-content/uploads/2024/03/musk-v-openai-complaint.pdf"
        },
        {
          sourceType: "reporting",
          note: "Reputable reporting can provide timeline context, but should not replace primary documents.",
          strength: "medium",
          title: "Bloomberg: OpenAI's Journey from Nonprofit to Tech Giant",
          url: "https://www.bloomberg.com"
        }
      ],
      uncertaintyNotes: [
        "This mock report does not include live source retrieval.",
        "A production version should verify current legal filings and official statements before final output."
      ],
      neutralNote: "This is not a verdict. It presents the other side’s argument without judging who is right."
    };
  }

  // General Mock Fallback
  return {
    detectedStory: `A claim/narrative concerning: "${text.substring(0, 80)}..."`,
    mainParty: "Author of original text / Original Claimant",
    otherParty: "The alternative perspective / Affected Party",
    otherSideStory: `The other side would likely dispute the core interpretations presented in the input, arguing that context or crucial alternative facts have been omitted. They may contend that actions taken were necessary responses to external conditions.`,
    strongestCounterArgument: "The counter-position suggests that when evaluating the situation, one must look at the structural rules, motivations, and external constraints of the other side rather than evaluating decisions in isolation.",
    bothSidesAgreeOn: [
      "The event or relationship exists and has caused discussion.",
      "The parties involved are main actors in this space."
    ],
    disputedPoints: [
      "The primary motivation behind the actions.",
      "Whether the reported outcomes are fair representations."
    ],
    sourceNotes: [
      {
        sourceType: "reporting",
        note: "News coverage details the event from multiple viewpoints.",
        strength: "medium"
      }
    ],
    uncertaintyNotes: [
      "No primary sources were provided in the prompt, leading to uncertainty in structural validation."
    ],
    neutralNote: "This is not a verdict. It presents the other side’s argument without judging who is right."
  };
}

export async function POST(req: Request) {
  try {
    const { text, mode, sourceStrictness, language } = await req.json();
    if (!text) {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
    }

    const arabicInstructions = language === 'ar' ? `

Language: Arabic
- Write ALL JSON string fields in Arabic (Modern Standard Arabic / الفصحى). Every field — detectedStory, mainParty, otherParty, otherSideStory, strongestCounterArgument, bothSidesAgreeOn items, disputedPoints items, sourceNotes notes, uncertaintyNotes items, neutralNote — must be in Arabic.
- If high-quality Arabic-language primary sources exist specifically for this dispute (official Arab government statements, Arabic court documents, Arabic-language journalism from reputable outlets such as Al Jazeera, BBC Arabic, Al Arabiya, Reuters Arabic), cite them preferentially and include Arabic titles.
- If no meaningful Arabic-language sources exist for this topic, cite the best available sources in any language and note their language in the source note field.` : '';

    const userPrompt = `You are generating the other side of a story. Do not judge who is right.

User Input Claim:
${text}

User Selected Mode:
${mode || 'quick'}

Source Strictness Setting:
${sourceStrictness || 'balanced'}${arabicInstructions}

Generate a neutral counter-story report matching the system prompt schema.
Mode instructions:
- Quick Counter: Short, clear, no long timeline.
- Deep Dispute: More complete, include timeline-style context.
- History Mirror: Identify who is omitted or affected by the dominant narrative. Separate primary sources.`;

    const result = await aiProvider.generateJSON<OtherSideReport>({
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
    });

    let report: OtherSideReport;
    let demoMode = false;

    if (result.demoMode || !result.data || typeof result.data !== 'object') {
      report = getMockReport(text);
      demoMode = true;
    } else {
      report = result.data;
    }

    // Apply neutrality guard to ensure no banned language exists in the report fields
    report.otherSideStory = softRewriteNeutrality(report.otherSideStory);
    report.strongestCounterArgument = softRewriteNeutrality(report.strongestCounterArgument);
    if (report.bothSidesAgreeOn) {
      report.bothSidesAgreeOn = report.bothSidesAgreeOn.map(softRewriteNeutrality);
    }
    if (report.disputedPoints) {
      report.disputedPoints = report.disputedPoints.map(softRewriteNeutrality);
    }

    return NextResponse.json({
      report,
      demoMode,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal report generation error' }, { status: 500 });
  }
}
