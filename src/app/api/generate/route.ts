import { NextResponse } from 'next/server';
import { aiProvider } from '@/lib/ai-provider';
import { softRewriteNeutrality, cleanArabicLeakage } from '@/lib/neutrality-guard';
import { searchEvidenceForReport, formatEvidenceContext, isRepetitive, trigramContainment, allowedEvidenceUrls, isUrlInEvidence } from '@/lib/web-search';
import { checkRateLimit, getCached, setCached, cacheKey, clientKey } from '@/lib/rate-limit';
import { OtherSideReport } from '@/types';

function arabicRatio(text: string): number {
  if (!text || typeof text !== 'string') return 0;
  const letters = text.replace(/[\s\d.,،؛:"'«»\-()/]/g, '');
  if (!letters.length) return 0;
  const arabic = (letters.match(/[؀-ۿ]/g) || []).length;
  return arabic / letters.length;
}

function isFootballGoatClaim(text: string): boolean {
  return /(ميسي|messi|lionel|ليونيل|رونالدو|ronaldo|cristiano|كريستيانو|مارادونا|maradona|بيليه|pele|pelé|الأفضل|افضل|greatest|goat|تاريخ)/i.test(text)
    && /(لاعب|كرة|football|soccer|تاريخ|goat|الأفضل|افضل|greatest)/i.test(text);
}

function hasConversationalLeakage(text: string): boolean {
  // Catches colloquial / chatbot-style replies. Avoid matching legitimate
  // proper nouns (e.g. player names) so real reports are not falsely rejected.
  return /(أعطيك|اعطيك|لو أعطيتك|بتحطلي|sonder|sondern)/i.test(text || '');
}

function hasExcessiveQuestions(text: string): boolean {
  if (!text) return false;
  const questionMarks = (text.match(/[؟?]/g) || []).length;
  // A report body should state arguments, not ask questions.
  // More than 4 question marks in the narrative is a sign the model
  // wrote a list of rhetorical questions instead of a proper counter-narrative.
  return questionMarks > 4;
}

// Literal schema placeholder text the model sometimes copies verbatim
// instead of generating real content (e.g. "why this source matters").
const PLACEHOLDER_PATTERNS = [
  /^why this source matters$/i,
  /^complete sentence$/i,
  /^source title$/i,
  /^publisher or institution$/i,
  /^neutral disclaimer$/i,
  /^party making the claim$/i,
  /^the other party or affected side$/i,
  /<[^>]+>/, // any leftover <...> instruction text
];

function isPlaceholderLeak(text: unknown): boolean {
  const s = String(text || '').trim();
  if (!s) return false;
  return PLACEHOLDER_PATTERNS.some((p) => p.test(s));
}

// Subjective "greatest/best ever" claims in any domain (sports, science,
// art…) — used to steer the model toward criteria-based comparison rather
// than picking a winner.
function isSubjectiveSuperlative(text: string): boolean {
  return /(الأفضل|الأعظم|افضل|اعظم|greatest|best ever|goat|أهم|اهم)/i.test(text || '');
}

function isValidReport(r: any, isArabic: boolean, mode = 'quick'): { ok: boolean; reason: string } {
  if (!r || typeof r !== 'object') return { ok: false, reason: 'not_object' };

  const story = String(r.otherSideStory || '');
  const counter = String(r.strongestCounterArgument || '');

  // Mode-specific quality floors: deep and history require more content.
  const minStoryLength = isArabic
    ? (mode === 'deep' ? 350 : mode === 'history' ? 280 : 200)
    : (mode === 'deep' ? 550 : mode === 'history' ? 450 : 380);
  const minCounterLength = isArabic ? 70 : 120;
  const minSources = mode === 'quick' ? 1 : 2;

  if (story.length < minStoryLength)
    return { ok: false, reason: `story_short:${story.length}<${minStoryLength}` };
  if (counter.length < minCounterLength)
    return { ok: false, reason: `counter_short:${counter.length}<${minCounterLength}` };
  if (!Array.isArray(r.bothSidesAgreeOn) || r.bothSidesAgreeOn.length < 1)
    return { ok: false, reason: `bothSides_missing:${JSON.stringify(r.bothSidesAgreeOn)?.slice(0, 80)}` };
  if (!Array.isArray(r.disputedPoints) || r.disputedPoints.length < 1)
    return { ok: false, reason: `disputed_missing:${JSON.stringify(r.disputedPoints)?.slice(0, 80)}` };
  if (!Array.isArray(r.sourceNotes) || r.sourceNotes.length < minSources)
    return { ok: false, reason: `sources_missing:${JSON.stringify(r.sourceNotes)?.slice(0, 80)}` };
  if (isRepetitive(story)) return { ok: false, reason: 'story_repetitive' };
  if (isRepetitive(counter)) return { ok: false, reason: 'counter_repetitive' };
  if (hasConversationalLeakage(story) || hasConversationalLeakage(counter))
    return { ok: false, reason: 'conversational_leakage' };
  if (hasExcessiveQuestions(story))
    return { ok: false, reason: `excessive_questions_in_story:${(story.match(/[؟?]/g) || []).length}` };
  if (hasExcessiveQuestions(counter))
    return { ok: false, reason: `excessive_questions_in_counter:${(counter.match(/[؟?]/g) || []).length}` };
  // Reject literal schema placeholders copied into the output.
  const allListItems = [
    ...(r.bothSidesAgreeOn as unknown[]),
    ...(r.disputedPoints as unknown[]),
    ...((r.uncertaintyNotes as unknown[]) || []),
  ];
  if (isPlaceholderLeak(story) || isPlaceholderLeak(counter) || allListItems.some(isPlaceholderLeak))
    return { ok: false, reason: 'placeholder_leak' };
  if (Array.isArray(r.sourceNotes) && r.sourceNotes.some((s: any) => isPlaceholderLeak(s?.note)))
    return { ok: false, reason: 'placeholder_leak_source_note' };

  // Exact sentence overlap between agree and disputed — the same point cannot
  // be both agreed and contested. Use 70-char prefix: enough to distinguish
  // different points about the same topic while catching verbatim copies.
  const normPrefix = (s: unknown) => String(s || '').replace(/\s+/g, ' ').trim().toLowerCase().slice(0, 70);
  const agreeSet = new Set((r.bothSidesAgreeOn as unknown[]).map(normPrefix));
  if ((r.disputedPoints as unknown[]).some((p) => agreeSet.has(normPrefix(p))))
    return { ok: false, reason: 'agree_disputed_exact_overlap' };

  // Cross-section fuzzy check: list items and counter-argument must not be
  // near-copies of each other. Threshold 0.70 — at this overlap the same
  // point is being recycled; below this, topical similarity is normal.
  const atomicItems = [counter, ...allListItems.map((s) => String(s || ''))].filter((s) => s.length > 15);
  for (let i = 0; i < atomicItems.length; i++) {
    for (let j = i + 1; j < atomicItems.length; j++) {
      if (trigramContainment(atomicItems[i], atomicItems[j]) > 0.70)
        return { ok: false, reason: 'cross_section_duplicate' };
    }
  }
  // The counter-argument must add content beyond the story, not copy it.
  // 0.80 threshold: counter and story are about the same topic and will
  // naturally share many words; only reject when it's a near-verbatim copy.
  const counterOverlap = trigramContainment(counter, story);
  if (counterOverlap > 0.80)
    return { ok: false, reason: `counter_duplicates_story:${counterOverlap.toFixed(2)}` };
  if (isArabic) {
    const ratio = arabicRatio(story);
    if (ratio < 0.45) return { ok: false, reason: `arabic_ratio:${ratio.toFixed(2)}` };
  }
  return { ok: true, reason: 'ok' };
}

export const maxDuration = 60;

const SYSTEM_PROMPT = `You are OtherSide AI, a neutral counter-perspective engine.

Your role is not to agree, disagree, rank, praise, mock, or choose a winner. Your role is to reconstruct the strongest fair opposing perspective.

Hard rules:
- Never give a verdict.
- Never answer casually or conversationally.
- Never say who is right, who is wrong, who is the best, or who wins.
- otherSideStory must OPPOSE or complicate the input claim. Never write a story that restates, supports, or amplifies the claim — that is the main party's side, not the other side. For "Canada is a great immigration choice", the other side is costs, obstacles, downsides, and people for whom it went badly — NOT more praise of Canada.
- Stay strictly on the topic of the input. Do not introduce comparisons to countries, people, or products the input never mentioned, even if web sources mention them. Web sources serve the input's claim; they do not redefine it.
- NEVER pose rhetorical or open questions in the report body. Every sentence must be a declarative statement presenting evidence, a named alternative, an achievement, or a documented fact. Do not write "هل هو معيار الأفضلية؟" or "Is goals the right metric?" — instead state the alternative directly: "Critics point to X, who achieved Y according to Z."
- NEVER attribute claims to anonymous "experts" ("وفقًا لما قاله خبراء", "experts say"). Name the institution, report, dataset, or person — or present the point as the other side's argument without fake attribution.
- bothSidesAgreeOn and disputedPoints must not overlap: a sentence cannot be both agreed and disputed.
- If the input is subjective, such as "the greatest" or "the best", name specific real alternative candidates with their documented achievements, and explain why each represents a legitimate competing claim using concrete facts.
- Use named sources, institutions, and real statistics where possible.
- Write every JSON string value in the user's language.
- Return only valid JSON.

Quality floor:
- otherSideStory must be substantial: at least 3 declarative paragraphs naming specific people, institutions, or documented facts, including at least 2 concrete numbers (statistics, dates, costs, rankings).
- strongestCounterArgument must introduce a NEW specific fact or argument that does not already appear in otherSideStory. Never copy or rephrase sentences from otherSideStory — write the single sharpest distinct point.
- Every sentence in the report must appear exactly once. Never reuse a sentence or its rephrased copy across otherSideStory, strongestCounterArgument, bothSidesAgreeOn, or disputedPoints.
- bothSidesAgreeOn and disputedPoints must each contain at least 2 complete declarative sentences with different content.
- sourceNotes must contain at least 2 source notes. Use strength "missing" only when no source is available. Mark strength "strong" only for government, intergovernmental, academic, or major news institutions; commercial sites and blogs are at most "weak".

IMPORTANT: The schema below shows REQUIRED KEYS with angle-bracket INSTRUCTIONS describing what to write. Never copy the instruction text literally. Replace every <...> with real content in the user's language. A response that contains any literal placeholder text like "why this source matters" or "complete sentence" will be rejected.

Schema:
{
  "detectedStory": "<neutral one-sentence summary of the input claim, in the user's language>",
  "mainParty": "<who makes the claim, in the user's language>",
  "otherParty": "<the opposing or affected side, in the user's language>",
  "otherSideStory": "<3+ substantial paragraphs of the opposing perspective with named facts, in the user's language>",
  "strongestCounterArgument": "<the single sharpest distinct counter-point, in the user's language>",
  "bothSidesAgreeOn": ["<a specific point both sides accept>", "<a different shared point>"],
  "disputedPoints": ["<a specific contested point>", "<a different contested point>"],
  "sourceNotes": [
    {
      "sourceType": "official_statement|court_filing|reporting|primary_source|historical_record|unknown",
      "title": "<actual source title>",
      "publisher": "<actual publisher or institution>",
      "date": "<publication date>",
      "note": "<one specific sentence explaining what this source contributes, in the user's language>",
      "strength": "strong|medium|weak|missing",
      "url": "https://... only if certain"
    }
  ],
  "uncertaintyNotes": ["<a specific open question or limitation>"],
  "neutralNote": "<neutral closing disclaimer, in the user's language>"
}`;

export async function POST(req: Request) {
  let _step = 'parse';
  try {
    // Abuse / cost control: cap requests per client before doing any work.
    const rate = checkRateLimit(clientKey(req));
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'rate_limited', retryAfter: rate.retryAfterSec },
        { status: 429, headers: { 'Retry-After': String(rate.retryAfterSec) } }
      );
    }

    const { text, mode, sourceStrictness, lang } = await req.json();
    if (!text || typeof text !== 'string' || !text.trim()) {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
    }
    if (text.length > 5000) {
      return NextResponse.json({ error: 'Input too long (max 5000 characters)' }, { status: 400 });
    }

    // Serve identical queries from cache to save Serper + LLM cost.
    const key = cacheKey({ text: text.trim(), mode, sourceStrictness, lang });
    const cached = getCached<OtherSideReport>(key);
    if (cached) {
      console.log('[generate] cache hit');
      return NextResponse.json({ report: cached, cached: true });
    }

    _step = 'detect';
    const isArabic = lang === 'ar' || /[؀-ۿ]/.test(text);
    const footballGoat = isFootballGoatClaim(text);
    console.log('[generate] step=detect', { isArabic, mode, lang, textLen: text.length });

    _step = 'search';
    // Primary evidence query
    const englishQuery = footballGoat
      ? 'Lionel Messi Pele Maradona Cristiano Ronaldo FIFA UEFA official records World Cup Champions League'
      : `${text.substring(0, 150)} official English source evidence`;
    const arabicQuery = footballGoat
      ? 'ليونيل ميسي بيليه مارادونا كريستيانو رونالدو الأفضل في التاريخ كأس العالم الكرة الذهبية دوري أبطال أوروبا'
      : (isArabic
        ? `${text.substring(0, 150)} تحليل مراجع`
        : `${text.substring(0, 150)} analysis sources perspectives`);
    const evidence = await searchEvidenceForReport({
      text,
      isArabic,
      englishQuery,
      arabicQuery,
    });
    const searchContext = formatEvidenceContext(evidence, isArabic);
    console.log('[generate] step=search done', { official: evidence.officialEnglish.length, arabic: evidence.arabicContext.length });

    _step = 'build_prompt';
    const subjectiveGuidance = footballGoat
      ? (isArabic
        ? '\n\nإرشاد خاص: هذا ادعاء تفضيلي عن الأفضل في التاريخ. لا تقل إن ميسي هو الأفضل ولا إن غيره هو الأفضل. اعرض الطرف المقابل عبر معايير مقارنة واضحة: بيليه، مارادونا، كريستيانو رونالدو، الأثر التاريخي، كأس العالم، الاستمرارية، الجوائز، ودوري الأبطال.'
        : '\n\nSpecial guidance: this is a subjective greatest-ever claim. Do not decide the winner. Present the counter-side through criteria: Pelé, Maradona, Cristiano Ronaldo, historical impact, World Cup, longevity, awards, and Champions League record.')
      : isSubjectiveSuperlative(text)
      ? (isArabic
        ? '\n\nإرشاد خاص: هذا ادعاء تفضيلي ذاتي (الأفضل/الأعظم). لا تحسم فائزًا. اعرض الطرف المقابل عبر معايير مقارنة واضحة، ومرشحين بديلين بارزين في المجال، وأدلة قابلة للقياس، والسياق التاريخي، مع التأكيد على أن النتيجة تتغير بتغير المعيار.'
        : '\n\nSpecial guidance: this is a subjective superlative claim (greatest/best). Do not decide a winner. Present the counter-side through explicit comparison criteria, notable alternative candidates in the field, measurable evidence, and historical context, stressing that the conclusion changes with the chosen criterion.')
      : '';

    const langInstruction = isArabic
      ? `\n\nArabic language rule: keep the JSON keys in English, but write every text value in formal Arabic only. Use EN-OFFICIAL English sources as the factual base, then translate and synthesize the evidence properly into Arabic. Foreign source names, brand names, and URLs may remain in their original spelling. Use AR-CONTEXT sources only as supplemental Arabic/local context.`
      : `\n\nLanguage: Write all JSON string values in clear, formal English. Every list item must be a complete sentence. Use EN-OFFICIAL sources as the factual base.`;

    const modeInstr: Record<string, string> = {
      quick: isArabic
        ? 'الوضع: سريع. اكتب 3 فقرات مركّزة ومباشرة في otherSideStory تعرض أقوى حجج الطرف الآخر فقط. لا تتوسّع في التاريخ أو السياق البعيد. في strongestCounterArgument ركّز على النقطة الواحدة الأكثر حدةً. أدرج مصدرًا واحدًا على الأقل.'
        : 'Mode: QUICK. Write 3 focused, direct paragraphs in otherSideStory presenting only the sharpest counter-arguments. Do not expand into history or distant context. In strongestCounterArgument give the single most pointed counter-fact. Include at least 1 source.',
      deep: isArabic
        ? 'الوضع: عميق. اكتب 4 فقرات تغطي: (1) موقف الطرف الآخر بدقة، (2) الأدلة الموثّقة والأرقام والإحصائيات، (3) الفاعلون المسمّون والمؤسسات والوثائق الرسمية، (4) الجدول الزمني للأحداث الرئيسية. أدرج 3 مصادر على الأقل مع تواريخ دقيقة. كل فقرة يجب أن تحمل معلومة جديدة غير موجودة في الأخريات.'
        : 'Mode: DEEP. Write 4 paragraphs covering: (1) the other side\'s position precisely, (2) documented evidence with numbers and statistics, (3) named actors, institutions, and official documents, (4) a timeline of key events with specific dates. Include at least 3 sources with exact dates. Each paragraph must add new information not covered by the others.',
      history: isArabic
        ? 'الوضع: مرآة التاريخ. ركّز حصراً على: (1) الأصوات المغيّبة — من لم يُسمع رأيه في هذه القضية؟ (2) السياق التاريخي الذي سبق الحدث الحالي بسنوات أو عقود، (3) أنماط مشابهة في التاريخ — هل حدث هذا من قبل؟ ماذا كانت النتيجة؟ (4) العوامل الهيكلية والأنظمة التي أفرزت هذا الوضع، وليس الأحداث الفردية. تجنّب التركيز على الجدل الراهن وركّز على الجذور والسياق الأعمق. أدرج مصدرين على الأقل.'
        : 'Mode: HISTORY MIRROR. Focus exclusively on: (1) omitted voices — who was not heard in this dispute?, (2) historical context that predates the current event by years or decades, (3) similar historical patterns — has this happened before and what was the outcome?, (4) structural factors and systems that produced this situation, not individual events. Avoid focus on current controversy; focus on roots and deeper context. Include at least 2 sources.',
    };

    const strictnessInstr: Record<string, string> = {
      strict: isArabic ? 'Source strictness: strict. If a source is uncertain, mark its strength as missing.' : 'Source strictness: strict. If a source is uncertain, mark its strength as missing.',
      reasoned: isArabic ? 'Source strictness: reasoned. Separate evidence from inference clearly.' : 'Source strictness: reasoned. Separate evidence from inference clearly.',
      balanced: isArabic ? 'Source strictness: balanced. Combine evidence with careful reasoning and mark uncertainty.' : 'Source strictness: balanced. Combine evidence with careful reasoning and mark uncertainty.',
    };

    const now = new Date();
    const todayISO = now.toISOString().slice(0, 10);
    const currentYear = now.getUTCFullYear();
    const dateContext = isArabic
      ? `\n\nالتاريخ الحالي: ${todayISO} (نحن في عام ${currentYear}). تحذير حاسم: بيانات تدريبك تنتهي عند تاريخ أقدم من هذا — معلوماتك عن الإحصائيات والسجلات والمسيرات الرياضية والأحداث الجارية قديمة وقد تكون خاطئة. يُحظر عليك استخدام أي إحصاء أو رقم أو سجل أو لقب من ذاكرتك. استخدم الأرقام والأحداث الواردة في مصادر EN-OFFICIAL فقط. إذا لم تجد الإحصاء في المصادر، لا تذكره وأشر إلى أن البيانات الكاملة تتطلب مراجعة مصدر محدّث.`
      : `\n\nCurrent date: ${todayISO} (we are in ${currentYear}). CRITICAL WARNING: your training data ends before this date — your knowledge of statistics, records, sports careers, and recent events is outdated and may be wrong. You are FORBIDDEN from citing any statistic, score, record, or achievement from your training memory. Use ONLY numbers and facts found in the EN-OFFICIAL search sources below. If a statistic is not in the sources, do not invent it — state that current data requires a verified source.`;

    const userPrompt = `${modeInstr[mode] || modeInstr.quick}
${strictnessInstr[sourceStrictness] || strictnessInstr.balanced}
${langInstruction}
${dateContext}
${subjectiveGuidance}
${searchContext}

${isArabic ? 'Text to analyze. Respond with Arabic values only:' : 'INPUT TO ANALYZE:'}
${text}

Return one JSON object only.`;

    _step = 'ai_call';
    console.log('[generate] step=ai_call start');
    // Budget under Vercel's 60s cap: search (~10s) + first call (22s) +
    // retry (18s) leaves headroom for parsing and the neutrality pass.
    const firstResult = await aiProvider.generateJSON<OtherSideReport>({
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
      timeoutMs: 22000,
    });

    let report: OtherSideReport | null = firstResult.data;
    let demoMode = Boolean(firstResult.demoMode);
    let demoReason: string | undefined = firstResult.reason;

    const firstCheck = isValidReport(report, isArabic, mode);
    console.log('[generate] first call demoMode:', firstResult.demoMode, '| validity:', firstCheck.reason,
      '| story_len:', report?.otherSideStory?.length, '| counter_len:', report?.strongestCounterArgument?.length,
      '| arabic_ratio:', report?.otherSideStory ? arabicRatio(String(report.otherSideStory)).toFixed(2) : 'n/a');

    if (isArabic && !firstResult.demoMode && !firstCheck.ok) {
      const retryGuidance = firstCheck.reason.startsWith('excessive_questions')
        ? 'Critical fix needed: your previous response used rhetorical questions. Replace EVERY question with a declarative sentence that states a fact, a named actor, or a documented finding.'
        : firstCheck.reason.startsWith('counter_duplicates')
        ? 'Critical fix needed: strongestCounterArgument must introduce a NEW specific fact not already in otherSideStory. Do not repeat or rephrase sentences from the story.'
        : (firstCheck.reason.startsWith('cross_section_duplicate') || firstCheck.reason.startsWith('list_item_duplicates'))
        ? 'Critical fix needed: you reused the same sentences across strongestCounterArgument, bothSidesAgreeOn, disputedPoints, and uncertaintyNotes. Each section must make a DIFFERENT point — no sentence or paraphrase of it may appear in more than one place in the entire response.'
        : firstCheck.reason.startsWith('placeholder_leak')
        ? 'Critical fix needed: you left literal template text (like "why this source matters" or angle-bracket instructions) in the output. Replace every field with real, specific content in formal Arabic.'
        : firstCheck.reason.startsWith('bothSides_missing')
        ? 'Critical fix needed: the bothSidesAgreeOn array is empty or missing. You MUST include at least 2 complete declarative sentences describing what both sides of the argument genuinely agree on (facts, common ground, shared context). Every report must have this field populated.'
        : firstCheck.reason.startsWith('disputed_missing')
        ? 'Critical fix needed: the disputedPoints array is empty or missing. You MUST include at least 2 complete declarative sentences describing the specific points each side contests. Every report must have this field populated.'
        : firstCheck.reason.startsWith('arabic_ratio')
        ? 'Critical fix needed: write ALL values in formal Arabic script only. Do not mix languages.'
        : firstCheck.reason.startsWith('story_short')
        ? 'Critical fix needed: otherSideStory is too short. Write at least 3 full paragraphs with concrete named facts, actors, and documented events.'
        : `Critical fix needed: the previous result failed quality check (${firstCheck.reason}). Regenerate carefully.`;

      const retryPrompt = `${langInstruction}
${dateContext}
${subjectiveGuidance}
${searchContext}

${retryGuidance}

Original text to analyze:
${text}

Return valid JSON only using the required schema. Write all values in formal Arabic.`;

      const retryResult = await aiProvider.generateJSON<OtherSideReport>({
        system: SYSTEM_PROMPT,
        prompt: retryPrompt,
        timeoutMs: 18000,
      });

      const retryCheck = isValidReport(retryResult.data, true, mode);
      console.log('[generate] retry demoMode:', retryResult.demoMode, '| validity:', retryCheck.reason,
        '| story_len:', retryResult.data?.otherSideStory?.length);

      if (!retryResult.demoMode && retryCheck.ok) {
        report = retryResult.data;
        demoMode = false;
        demoReason = undefined;
      } else {
        demoReason = retryResult.reason || `Arabic retry failed: ${retryCheck.reason}`;
      }
    }

    const finalCheck = isValidReport(report, isArabic, mode);
    // No fake fallback: if we could not produce a verified report, say so
    // honestly. Never serve fabricated content under a real query.
    if (demoMode || !report || !finalCheck.ok) {
      const reason = demoReason || finalCheck.reason;
      const kind = /localhost|AI_API_BASE_URL|timed out|ECONNREFUSED|50\d|no-key/i.test(reason || '')
        ? 'connectivity'
        : 'quality';
      console.warn('[generate] unavailable. kind=' + kind + ' reason:', reason);
      return NextResponse.json({ unavailable: true, kind, reason }, { status: 200 });
    }

    // The model passed the quality gate AND we supplied real search evidence.
    // Guard against fabricated links: any sourceNote URL not present in that
    // evidence is dropped and downgraded to "missing". (Skipped when search is
    // disabled, since then citations legitimately come from training data.)
    if (evidence.all.length > 0 && report.sourceNotes) {
      const allowed = allowedEvidenceUrls(evidence.all);
      report.sourceNotes = report.sourceNotes.map((s) =>
        s.url && !isUrlInEvidence(s.url, allowed)
          ? { ...s, url: undefined, strength: 'missing' as const }
          : s
      );
    }

    // Null-safe rewrite: real AI output may omit optional fields.
    const rewrite = (s: string | null | undefined): string => {
      if (!s || typeof s !== 'string') return s ?? '';
      return softRewriteNeutrality(isArabic ? cleanArabicLeakage(s) : s);
    };

    report.detectedStory = rewrite(report.detectedStory);
    report.mainParty = rewrite(report.mainParty);
    report.otherParty = rewrite(report.otherParty);
    report.otherSideStory = rewrite(report.otherSideStory);
    report.strongestCounterArgument = rewrite(report.strongestCounterArgument);
    report.neutralNote = rewrite(report.neutralNote);
    if (report.bothSidesAgreeOn) report.bothSidesAgreeOn = report.bothSidesAgreeOn.map(rewrite);
    if (report.disputedPoints) report.disputedPoints = report.disputedPoints.map(rewrite);
    if (report.uncertaintyNotes) report.uncertaintyNotes = report.uncertaintyNotes.map(rewrite);
    // Source titles/publishers are factual metadata (often real names that
    // legitimately contain Latin script) — preserve them as-is. Only the
    // generated `note` prose goes through the neutrality/Arabic cleanup.
    if (report.sourceNotes) report.sourceNotes = report.sourceNotes.map((s) => ({
      ...s,
      note: rewrite(s.note),
    }));

    setCached(key, report);
    return NextResponse.json({ report });
  } catch (err: any) {
    const msg = err?.message || String(err) || 'Internal error';
    console.error('[generate] ERROR at step=' + (_step as string) + ':', msg, err?.stack?.slice(0, 600));
    return NextResponse.json({ error: msg, step: _step }, { status: 500 });
  }
}
