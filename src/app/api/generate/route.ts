import { NextResponse } from 'next/server';
import { aiProvider } from '@/lib/ai-provider';
import { softRewriteNeutrality, cleanArabicLeakage } from '@/lib/neutrality-guard';
import { searchForContext, formatSearchContext, isRepetitive } from '@/lib/web-search';
import { OPENAI_REPORT_EN, OPENAI_REPORT_AR } from '@/lib/example-reports';
import { OtherSideReport } from '@/types';

// Share of Arabic-script characters in a string (0–1), ignoring spaces/digits/punctuation.
function arabicRatio(text: string): number {
  const letters = (text || '').replace(/[\s\d.,،؛:"'«»\-()/]/g, '');
  if (!letters.length) return 0;
  const arabic = (letters.match(/[؀-ۿ]/g) || []).length;
  return arabic / letters.length;
}

export const maxDuration = 25;

// Concise system prompt — long prompts confuse smaller models
const SYSTEM_PROMPT = `You are OtherSide AI. Your job: given any claim or narrative, present the OTHER side's strongest argument using specific evidence, real named sources, and direct quotes.

RULES:
- Never give a verdict. Never say who is right or wrong.
- Use hedged language: "according to [Source]", "publicly stated", "disputed by citing".
- Write ALL JSON string values in the SAME LANGUAGE as the user input. Never mix languages.
- Do NOT repeat the same sentence or idea. Each paragraph must add new information.
- Cite real named publications (Reuters, BBC, NYT, Al Jazeera, AP, court names, government bodies).
- Every source must have a specific title, named publisher, and date.

OUTPUT — return ONLY valid JSON, nothing else:
{
  "detectedStory": "neutral summary of what the input claims",
  "mainParty": "name of party making the claim",
  "otherParty": "name of the other party",
  "otherSideStory": "3+ paragraphs. Each paragraph: new named evidence, new argument, no repetition.",
  "strongestCounterArgument": "The single sharpest point the other side has — specific, evidence-based, different from otherSideStory.",
  "bothSidesAgreeOn": ["Full sentence stating a specific shared fact with date or figure", "..."],
  "disputedPoints": ["Full sentence naming the exact disagreement and who disputes whom", "..."],
  "sourceNotes": [
    {
      "sourceType": "official_statement|court_filing|reporting|primary_source|historical_record|unknown",
      "title": "Exact article or document title",
      "publisher": "Named outlet or institution",
      "date": "Month Year",
      "note": "What this source establishes and why it matters here. Include any direct quotes from it.",
      "strength": "strong|medium|weak|missing",
      "url": "https://... only if you are certain it is correct"
    }
  ],
  "uncertaintyNotes": ["Full sentence about a specific information gap"],
  "neutralNote": "This is not a verdict. It presents the other side's argument without judging who is right."
}`;

// High-quality fallback mock — used when API fails
function getMockReport(text: string, isArabic: boolean): OtherSideReport {
  const isElonOpenAI = /openai|musk|ماسك|أوبن/i.test(text);

  if (isArabic) {
    if (isElonOpenAI) {
      return OPENAI_REPORT_AR;
    }
    return {
      detectedStory: `يطرح النص ادعاءً بشأن: "${text.substring(0, 120)}..."`,
      mainParty: "صاحب الادعاء",
      otherParty: "الطرف الآخر",
      otherSideStory: "يرى الطرف الآخر أن الادعاءات الواردة في النص تفتقر إلى السياق الكامل. وبينما يُقرّ بوجود الحدث، فإنه يجادل بأن التفسير المُقدَّم يتجاهل عوامل بنيوية وقيودًا خارجية أثّرت في مسار الأحداث.\n\nيستند هذا الطرف في موقفه إلى وقائع موثّقة تُظهر أن الإجراءات المُتّخذة جاءت ردًا على تحديات محددة، لا ابتداءً منه. كما يُؤكد أن التقارير الإعلامية التي تناولت القضية اعتمدت على مصدر واحد دون التحقق من الرواية المقابلة.",
      strongestCounterArgument: "الحجة الأقوى للطرف الآخر هي أن التقييم المُقدَّم يقيس النتائج بمعيار مختلف عمّا أُعلن في البداية كهدف. ومن ثَمّ فإن مقارنة ما حدث بما كان مأمولًا يتطلب أولًا تحديد الظروف التي صِيغت فيها تلك التوقعات.",
      bothSidesAgreeOn: [
        "الحدث المُشار إليه وقع فعلًا وتُوثّقه مصادر متعددة.",
        "الأطراف المعنية فاعلون رئيسيون في هذا المجال ولهم مواقف معلنة."
      ],
      disputedPoints: [
        "الدوافع الحقيقية وراء الإجراءات المُتّخذة وكيفية تفسير نياتها.",
        "مدى تمثيل النتائج المُبلَّغ عنها للصورة الكاملة والمنصفة للأحداث."
      ],
      sourceNotes: [
        {
          sourceType: "reporting",
          title: "تغطية إعلامية للحدث",
          publisher: "وسائل إعلام متعددة",
          date: "2024",
          note: "تتباين التغطيات في تناول هذا الموضوع؛ يُنصح بمراجعة مصادر متنوعة للحصول على الصورة الكاملة.",
          strength: "medium"
        }
      ],
      uncertaintyNotes: [
        "لم تُقدَّم مصادر أولية في النص، مما يُصعّب التحقق المستقل من المعلومات الواردة."
      ],
      neutralNote: "هذا ليس حكمًا. الهدف هو عرض الجانب الآخر فقط، دون البتّ في من هو على حق."
    };
  }

  // English fallback
  if (isElonOpenAI) {
    return OPENAI_REPORT_EN;
  }

  return {
    detectedStory: `The input presents a claim concerning: "${text.substring(0, 120)}..."`,
    mainParty: "Author of original claim",
    otherParty: "The other party or affected perspective",
    otherSideStory: "The other side would dispute the core framing, arguing that crucial context has been omitted. They contend that the actions described were responses to external constraints not mentioned in the original text.\n\nFrom their perspective, the narrative presented applies a single standard of judgment without accounting for the asymmetric pressures and structural limitations that shaped the decision-making environment at the time.\n\nThey would further note that independent accounts of the same events differ significantly from the version presented, and that primary documents tell a more complex story than the input suggests.",
    strongestCounterArgument: "The other side's sharpest argument is that the outcome being criticized was the direct result of conditions created or influenced by the very party making the criticism — a structural contradiction that undermines the credibility of the claim.",
    bothSidesAgreeOn: [
      "The core event or relationship described in the input is real and documented.",
      "Both parties are major actors in this domain with substantial public records."
    ],
    disputedPoints: [
      "The primary motivation behind the actions taken and the correct interpretation of intent.",
      "Whether the framing in the input accurately represents the full evidentiary record available."
    ],
    sourceNotes: [
      {
        sourceType: "reporting",
        title: "News coverage of the dispute",
        publisher: "Multiple outlets",
        date: "2024",
        note: "Multiple news organizations have covered this topic from different angles. Cross-referencing primary documents directly is recommended.",
        strength: "medium"
      }
    ],
    uncertaintyNotes: [
      "No primary sources were included in the input, limiting independent structural verification."
    ],
    neutralNote: "This is not a verdict. It presents the other side's argument without judging who is right."
  };
}

export async function POST(req: Request) {
  try {
    const { text, mode, sourceStrictness, lang } = await req.json();
    if (!text) {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
    }

    const isArabic = lang === 'ar' || /[؀-ۿ]/.test(text);

    // Step 1: web search for real references (if SERPER_API_KEY is configured)
    const searchQuery = isArabic
      ? `${text.substring(0, 150)} تحليل مراجع`
      : `${text.substring(0, 150)} analysis sources perspectives`;
    const searchResults = await searchForContext(searchQuery, lang);
    const searchContext = formatSearchContext(searchResults, isArabic);

    const langInstruction = isArabic
      ? `\n\nتعليمة لغوية صارمة: اكتب جميع قيم JSON النصية بالعربية الفصحى فقط. لا تكتب أي شرح أو قيمة نصية بالإنجليزية إلا أسماء العلم أو العلامات التجارية أو روابط URL. إذا كانت المصادر أجنبية، لخّص دلالتها بالعربية.`
      : `\n\nLanguage: Write all JSON string values in clear, formal English. Every list item must be a complete sentence.`;

    const modeInstr: Record<string, string> = {
      quick: isArabic ? 'النمط: سريع — فقرتان مركزتان في otherSideStory، مع ثلاثة مصادر على الأقل عند الإمكان.' : 'Mode: QUICK — 2 focused paragraphs for otherSideStory, 3 sources minimum.',
      deep: isArabic ? 'النمط: عميق — أربع فقرات تتناول الموقف والأدلة والأطراف والتسلسل الزمني، مع خمسة مصادر أو أكثر عند الإمكان.' : 'Mode: DEEP — 4 paragraphs for otherSideStory (position / evidence / named actors / timeline), 5+ sources with direct quotes and statistics.',
      history: isArabic ? 'النمط: مرآة تاريخية — ركّز على الأصوات المحذوفة أو المهمشة، واستند إلى الأرشيف والشهادات والمؤرخين وتقارير الهيئات الدولية.' : 'Mode: HISTORY MIRROR — Focus on omitted voices. Cite archival sources, testimonies, academic historians, international body reports.',
    };

    const strictnessInstr: Record<string, string> = {
      strict: isArabic ? 'صرامة المصادر: صارم — لا تذكر إلا المصادر التي تثق بوجودها، وضع strength: "missing" عند غياب المصدر.' : 'Strictness: STRICT — Only cite sources you are confident exist. Mark any uncertain source as strength: "missing".',
      reasoned: isArabic ? 'صرامة المصادر: استدلالي — اجمع بين الدليل الموثق والاستنتاج المنطقي المعلن بوضوح.' : 'Strictness: REASONED — Combine documented evidence with clearly-labeled logical inference.',
      balanced: isArabic ? 'صرامة المصادر: متوازن — امزج بين الأدلة المباشرة والاستدلال المعقول، وميّز العناصر غير المؤكدة بوضوح.' : 'Strictness: BALANCED — Mix direct evidence with reasonable inference; label speculative elements as "reportedly".',
    };

    const userPrompt = isArabic
      ? `${modeInstr[mode] || modeInstr.quick}
${strictnessInstr[sourceStrictness] || strictnessInstr.balanced}
${langInstruction}
${searchContext}

النص المطلوب تحليله:
${text}

أعد كائن JSON واحدًا فقط. كن محددًا: اذكر الأشخاص والمؤسسات والتواريخ والأرقام والمصادر المسماة. يجب أن تكون كل القيم النصية بالعربية.`
      : `${modeInstr[mode] || modeInstr.quick}
${strictnessInstr[sourceStrictness] || strictnessInstr.balanced}
${langInstruction}
${searchContext}

INPUT TO ANALYZE:
${text}

Return a single JSON object. Be specific: name real people, organizations, dates, figures, and quotes.`;

    const result = await aiProvider.generateJSON<OtherSideReport>({
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
    });

    let report: OtherSideReport;
    let demoMode = false;
    let demoReason: string | undefined;

    const isValidReport = (r: any): boolean => {
      if (!r || typeof r !== 'object') return false;
      if (!r.otherSideStory || r.otherSideStory.length < 100) return false;
      if (isRepetitive(r.otherSideStory)) return false;
      if (isRepetitive(r.strongestCounterArgument)) return false;
      // In Arabic mode, reject output that leaked into English so we fall
      // back to the fully-Arabic saved report instead of showing mixed text.
      if (isArabic && arabicRatio(r.otherSideStory) < 0.5) return false;
      return true;
    };

    if (result.demoMode || !isValidReport(result.data)) {
      report = getMockReport(text, isArabic);
      demoMode = true;
      demoReason = result.reason
        || (result.data && isArabic && arabicRatio(result.data.otherSideStory) < 0.5
          ? 'Model replied in English for an Arabic request'
          : result.data ? 'Model produced low-quality output' : undefined);
    } else {
      report = result.data;
    }

    const rewrite = (s: string) => softRewriteNeutrality(isArabic ? cleanArabicLeakage(s) : s);

    report.detectedStory = rewrite(report.detectedStory);
    report.mainParty = rewrite(report.mainParty);
    report.otherParty = rewrite(report.otherParty);
    report.otherSideStory = rewrite(report.otherSideStory);
    report.strongestCounterArgument = rewrite(report.strongestCounterArgument);
    report.neutralNote = rewrite(report.neutralNote);
    if (report.bothSidesAgreeOn) report.bothSidesAgreeOn = report.bothSidesAgreeOn.map(rewrite);
    if (report.disputedPoints) report.disputedPoints = report.disputedPoints.map(rewrite);
    if (report.uncertaintyNotes) report.uncertaintyNotes = report.uncertaintyNotes.map(rewrite);
    if (report.sourceNotes) report.sourceNotes = report.sourceNotes.map((s) => ({ ...s, note: rewrite(s.note) }));

    return NextResponse.json({ report, demoMode, demoReason });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
