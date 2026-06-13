import { aiProvider } from './ai-provider';
import { OtherSideReport } from '@/types';

export interface JudgeVerdict {
  pass: boolean;
  worstIssue: string;
}

// Qualitative quality gate: an LLM editor scores the draft on the dimensions
// that regex heuristics cannot judge — neutrality, grounding, distinctness, and
// fluency. Replaces threshold-tuning with actual reading comprehension.
//
// Fails OPEN: if the judge errors or is unreachable, we do not block the report
// (a judge outage must not take down the whole product). The deterministic
// structural checks in isValidReport remain the hard floor.
export async function judgeReport(
  report: OtherSideReport,
  inputText: string,
  isArabic: boolean,
  timeoutMs = 9000
): Promise<JudgeVerdict> {
  const lang = isArabic ? 'Arabic' : 'English';
  const system = `You are a strict editor reviewing a neutral "other side" analysis report before publication. Judge ONLY craft and quality — never whether you personally agree with the content.

Evaluate four dimensions, each acceptable or not:
1. NEUTRALITY — presents the opposing perspective without delivering a verdict, ranking, or declaring any side right/best/wrong.
2. GROUNDING — claims are specific and credible (named people, institutions, dates, numbers), not vague filler or invented-sounding assertions.
3. DISTINCTNESS — otherSideStory, strongestCounterArgument, bothSidesAgreeOn, and disputedPoints each make DIFFERENT points; no sentence is repeated or only lightly reworded across them.
4. FLUENCY — natural, varied ${lang} prose; sentences do not all open the same way; no garbled tokens, broken words, truncated sentences, or rhetorical questions used as filler.

Return JSON only:
{"pass": boolean, "worstIssue": "short phrase naming the single biggest problem, or empty if pass"}
Set pass=true ONLY if all four dimensions are acceptable for a professional publication.`;

  const draft = {
    otherSideStory: report.otherSideStory,
    strongestCounterArgument: report.strongestCounterArgument,
    bothSidesAgreeOn: report.bothSidesAgreeOn,
    disputedPoints: report.disputedPoints,
    uncertaintyNotes: report.uncertaintyNotes,
  };

  const prompt = `INPUT CLAIM:\n${inputText}\n\nDRAFT REPORT (JSON):\n${JSON.stringify(draft)}\n\nReview it against the four dimensions and return your verdict.`;

  try {
    const res = await aiProvider.generateJSON<{ pass?: boolean; worstIssue?: string }>({
      system,
      prompt,
      timeoutMs,
      maxTokens: 300,
      temperature: 0,
    });
    if (res.demoMode || !res.data) return { pass: true, worstIssue: '' };
    return { pass: res.data.pass !== false, worstIssue: String(res.data.worstIssue || '') };
  } catch {
    return { pass: true, worstIssue: '' };
  }
}
