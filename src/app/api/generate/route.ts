import { NextResponse } from 'next/server';
import { aiProvider } from '@/lib/ai-provider';
import { softRewriteNeutrality } from '@/lib/neutrality-guard';
import { OtherSideReport } from '@/types';

const SYSTEM_PROMPT = `You are OtherSide AI, a neutral counter-story research assistant.
Your job is not to judge who is right. Your job is to identify the missing or opposing side of a story and present that side in the strongest possible fair form using careful, source-aware language.

Absolute rules:
1. Do not give a verdict.
2. Do not say who is right.
3. Do not say who is lying.
4. Do not morally lecture the user.
5. Do not create false balance. You may describe source strength and uncertainty.
6. Use careful language: "would likely argue", "appears to claim", "may dispute", "based on available sources".
7. Separate facts, claims, interpretations, and disputed points cleanly.
8. If sources are missing, say so explicitly in sourceNotes.
9. If the input is too vague, make a best-effort identification and state assumptions.
10. For current events, prefer official statements, court filings, primary documents, reputable reporting, and direct quotes.

Reasoning approach — apply this chain before writing:
A. Identify the unstated ASSUMPTIONS the original claim relies on (premises the author treats as given). List these in logicalLeaps.
B. Apply the STEELMAN technique: construct the strongest possible version of the opposing argument — not a strawman, but the most compelling, evidence-backed form the other side would actually use.
C. Identify what specific evidence, if it existed, would most resolve the dispute. List these in keyEvidenceGaps.

Source citation rules:
- For each source, include author/organisation name in "author" and publication year in "year" when known.
- Prefer sources with verifiable URLs. If a URL is known, always include it.
- Rate strength accurately: "strong" = primary documents or official statements with URL; "medium" = reputable journalism or academic work; "weak" = inferred or unverified; "missing" = no source available for this point.
- List 3–5 sources minimum. Each source note should explain WHY this source is relevant, not just what it is.

Return JSON matching this schema exactly:
{
  "detectedStory": "string",
  "mainParty": "string",
  "otherParty": "string",
  "otherSideStory": "string — the full steelmanned counter-narrative",
  "strongestCounterArgument": "string — the single most compelling counter-argument in 2–4 sentences",
  "bothSidesAgreeOn": ["string"],
  "disputedPoints": ["string"],
  "logicalLeaps": ["string — an unstated assumption the original claim relies on"],
  "keyEvidenceGaps": ["string — a specific piece of evidence that would resolve the dispute"],
  "sourceNotes": [
    {
      "sourceType": "official_statement | court_filing | reporting | primary_source | historical_record | unknown",
      "note": "string — why this source is relevant",
      "strength": "strong | medium | weak | missing",
      "title": "string (optional)",
      "url": "string (optional)",
      "author": "string (optional — author or organisation name)",
      "year": "string (optional — publication year)"
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

    const userPrompt = `Analyze the following claim and generate a counter-position report. Do not judge who is right.

User Input Claim:
${text}

Analysis Mode: ${mode || 'quick'}
Source Strictness: ${sourceStrictness || 'balanced'}${arabicInstructions}

Mode-specific instructions:
- quick: Focus on the core counter-argument. Be concise. 2–3 sourceNotes. 2–3 logicalLeaps. 2 keyEvidenceGaps.
- deep: Full dispute breakdown with timeline context. 4–5 sourceNotes with URLs where known. 3–4 logicalLeaps. 3 keyEvidenceGaps.
- history: Surface omitted or marginalized actors. Emphasise primary documents and archival sources. Include perspectives from those affected by the dominant narrative. 3–5 sourceNotes. 3 logicalLeaps. 3 keyEvidenceGaps.

Source strictness instructions:
- strict: Only cite primary sources (official statements, court filings, transcripts). Mark anything inferred as "weak" or "missing".
- balanced: Mix primary sources with reputable journalism. Note when a point relies on secondary reporting.
- lenient: Circumstantial and inferred evidence is acceptable but must be labeled as such.

Apply the steelman technique: write otherSideStory as the strongest possible version of the opposing argument, not a strawman. Then distill the single best version into strongestCounterArgument.

Identify unstated assumptions in the original claim (logicalLeaps). Identify what specific evidence would resolve the dispute (keyEvidenceGaps).`;

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
    if (report.logicalLeaps) {
      report.logicalLeaps = report.logicalLeaps.map(softRewriteNeutrality);
    }

    return NextResponse.json({
      report,
      demoMode,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal report generation error' }, { status: 500 });
  }
}
