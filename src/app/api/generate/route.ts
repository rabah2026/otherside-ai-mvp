import { NextResponse } from 'next/server';
import { aiProvider } from '@/lib/ai-provider';
import { softRewriteNeutrality, cleanArabicLeakage } from '@/lib/neutrality-guard';
import { searchForContext, formatSearchContext, isRepetitive } from '@/lib/web-search';
import { OPENAI_REPORT_EN, OPENAI_REPORT_AR } from '@/lib/example-reports';
import { OtherSideReport } from '@/types';

function arabicRatio(text: string): number {
  const letters = (text || '').replace(/[\s\d.,،؛:"'«»\-()/]/g, '');
  if (!letters.length) return 0;
  const arabic = (letters.match(/[؀-ۿ]/g) || []).length;
  return arabic / letters.length;
}

function isValidReport(r: any, isArabic: boolean): boolean {
  if (!r || typeof r !== 'object') return false;
  if (!r.otherSideStory || r.otherSideStory.length < 100) return false;
  if (!r.strongestCounterArgument || r.strongestCounterArgument.length < 40) return false;
  if (isRepetitive(r.otherSideStory)) return false;
  if (isRepetitive(r.strongestCounterArgument)) return false;
  if (isArabic && arabicRatio(r.otherSideStory) < 0.5) return false;
  return true;
}

export const maxDuration = 25;

const SYSTEM_PROMPT = `You are OtherSide AI. Given any claim or narrative, present the other side's strongest fair argument using evidence and named sources.

Rules:
- Never give a verdict or say who is right.
- Use careful language such as "according to", "publicly stated", and "the opposing view argues".
- Write every JSON string value in the same language as the user input.
- Do not repeat the same sentence or idea.
- Use real named sources where possible.
- Return only valid JSON.

Schema:
{
  "detectedStory": "neutral summary of the input claim",
  "mainParty": "party making the claim",
  "otherParty": "other party or affected side",
  "otherSideStory": "2 or more paragraphs with evidence and context",
  "strongestCounterArgument": "the sharpest evidence-based point from the other side",
  "bothSidesAgreeOn": ["complete sentence", "complete sentence"],
  "disputedPoints": ["complete sentence", "complete sentence"],
  "sourceNotes": [
    {
      "sourceType": "official_statement|court_filing|reporting|primary_source|historical_record|unknown",
      "title": "source title",
      "publisher": "publisher or institution",
      "date": "date",
      "note": "why this source matters",
      "strength": "strong|medium|weak|missing",
      "url": "https://... only if certain"
    }
  ],
  "uncertaintyNotes": ["complete sentence"],
  "neutralNote": "neutral disclaimer"
}`;

function getMockReport(text: string, isArabic: boolean): OtherSideReport {
  const isElonOpenAI = /openai|musk|ماسك|أوبن/i.test(text);

  if (isArabic) {
    if (isElonOpenAI) return OPENAI_REPORT_AR;
    return {
      detectedStory: `يطرح النص ادعاءً بشأن: "${text.substring(0, 120)}..."`,
      mainParty: 'صاحب الادعاء',
      otherParty: 'الطرف الآخر',
      otherSideStory: 'يرى الطرف الآخر أن الادعاءات الواردة في النص تفتقر إلى السياق الكامل. وبينما يُقرّ بوجود الحدث، فإنه يجادل بأن التفسير المُقدَّم يتجاهل عوامل بنيوية وقيودًا خارجية أثّرت في مسار الأحداث.\n\nيستند هذا الطرف في موقفه إلى وقائع موثّقة تُظهر أن الإجراءات المُتّخذة جاءت ردًا على تحديات محددة، لا ابتداءً منه. كما يُؤكد أن التقارير الإعلامية التي تناولت القضية اعتمدت على مصدر واحد دون التحقق من الرواية المقابلة.',
      strongestCounterArgument: 'الحجة الأقوى للطرف الآخر هي أن التقييم المُقدَّم يقيس النتائج بمعيار مختلف عمّا أُعلن في البداية كهدف. ومن ثَمّ فإن مقارنة ما حدث بما كان مأمولًا يتطلب أولًا تحديد الظروف التي صِيغت فيها تلك التوقعات.',
      bothSidesAgreeOn: [
        'الحدث المُشار إليه وقع فعلًا وتُوثّقه مصادر متعددة.',
        'الأطراف المعنية فاعلون رئيسيون في هذا المجال ولهم مواقف معلنة.'
      ],
      disputedPoints: [
        'الدوافع الحقيقية وراء الإجراءات المُتّخذة وكيفية تفسير نياتها.',
        'مدى تمثيل النتائج المُبلَّغ عنها للصورة الكاملة والمنصفة للأحداث.'
      ],
      sourceNotes: [
        {
          sourceType: 'reporting',
          title: 'تغطية إعلامية للحدث',
          publisher: 'وسائل إعلام متعددة',
          date: '2024',
          note: 'تتباين التغطيات في تناول هذا الموضوع؛ يُنصح بمراجعة مصادر متنوعة للحصول على الصورة الكاملة.',
          strength: 'medium'
        }
      ],
      uncertaintyNotes: [
        'لم تُقدَّم مصادر أولية في النص، مما يُصعّب التحقق المستقل من المعلومات الواردة.'
      ],
      neutralNote: 'هذا ليس حكمًا. الهدف هو عرض الجانب الآخر فقط، دون البتّ في من هو على حق.'
    };
  }

  if (isElonOpenAI) return OPENAI_REPORT_EN;
  return {
    detectedStory: `The input presents a claim concerning: "${text.substring(0, 120)}..."`,
    mainParty: 'Author of original claim',
    otherParty: 'The other party or affected perspective',
    otherSideStory: 'The other side would dispute the core framing, arguing that crucial context has been omitted. They contend that the actions described were responses to external constraints not mentioned in the original text.\n\nFrom their perspective, the narrative presented applies a single standard of judgment without accounting for the asymmetric pressures and structural limitations that shaped the decision-making environment at the time.\n\nThey would further note that independent accounts of the same events differ significantly from the version presented, and that primary documents tell a more complex story than the input suggests.',
    strongestCounterArgument: "The other side's sharpest argument is that the outcome being criticized was the direct result of conditions created or influenced by the very party making the criticism — a structural contradiction that undermines the credibility of the claim.",
    bothSidesAgreeOn: [
      'The core event or relationship described in the input is real and documented.',
      'Both parties are major actors in this domain with substantial public records.'
    ],
    disputedPoints: [
      'The primary motivation behind the actions taken and the correct interpretation of intent.',
      'Whether the framing in the input accurately represents the full evidentiary record available.'
    ],
    sourceNotes: [
      {
        sourceType: 'reporting',
        title: 'News coverage of the dispute',
        publisher: 'Multiple outlets',
        date: '2024',
        note: 'Multiple news organizations have covered this topic from different angles. Cross-referencing primary documents directly is recommended.',
        strength: 'medium'
      }
    ],
    uncertaintyNotes: [
      'No primary sources were included in the input, limiting independent structural verification.'
    ],
    neutralNote: 'This is not a verdict. It presents the other side\'s argument without judging who is right.'
  };
}

export async function POST(req: Request) {
  try {
    const { text, mode, sourceStrictness, lang } = await req.json();
    if (!text) {
      return NextResponse.json({ error: 'Text input is required' }, { status: 400 });
    }

    const isArabic = lang === 'ar' || /[؀-ۿ]/.test(text);

    const searchQuery = isArabic
      ? `${text.substring(0, 150)} تحليل مراجع`
      : `${text.substring(0, 150)} analysis sources perspectives`;
    const searchResults = await searchForContext(searchQuery, lang);
    const searchContext = formatSearchContext(searchResults, isArabic);

    const langInstruction = isArabic
      ? `\n\nArabic language rule: keep the JSON keys in English, but write every text value in formal Arabic only. Foreign source names, brand names, and URLs may remain in their original spelling. Summarize foreign sources in Arabic.`
      : `\n\nLanguage: Write all JSON string values in clear, formal English. Every list item must be a complete sentence.`;

    const modeInstr: Record<string, string> = {
      quick: isArabic ? 'Mode: QUICK. Write 2 focused Arabic paragraphs in otherSideStory and include sources where possible.' : 'Mode: QUICK — 2 focused paragraphs for otherSideStory, 3 sources minimum.',
      deep: isArabic ? 'Mode: DEEP. Write 4 Arabic paragraphs covering position, evidence, named actors, and timeline.' : 'Mode: DEEP — 4 paragraphs for otherSideStory (position / evidence / named actors / timeline), 5+ sources with direct quotes and statistics.',
      history: isArabic ? 'Mode: HISTORY MIRROR. Focus on omitted voices and historical context, written in Arabic.' : 'Mode: HISTORY MIRROR — Focus on omitted voices. Cite archival sources, testimonies, academic historians, international body reports.',
    };

    const strictnessInstr: Record<string, string> = {
      strict: isArabic ? 'Source strictness: strict. If a source is uncertain, mark its strength as missing.' : 'Strictness: STRICT — Only cite sources you are confident exist. Mark any uncertain source as strength: "missing".',
      reasoned: isArabic ? 'Source strictness: reasoned. Separate evidence from inference clearly.' : 'Strictness: REASONED — Combine documented evidence with clearly-labeled logical inference.',
      balanced: isArabic ? 'Source strictness: balanced. Combine evidence with careful reasoning and mark uncertainty.' : 'Strictness: BALANCED — Mix direct evidence with reasonable inference; label speculative elements as "reportedly".',
    };

    const userPrompt = `${modeInstr[mode] || modeInstr.quick}
${strictnessInstr[sourceStrictness] || strictnessInstr.balanced}
${langInstruction}
${searchContext}

${isArabic ? 'Text to analyze. Respond with Arabic values only:' : 'INPUT TO ANALYZE:'}
${text}

Return one JSON object only.`;

    const firstResult = await aiProvider.generateJSON<OtherSideReport>({
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
    });

    let report: OtherSideReport | null = firstResult.data;
    let demoMode = Boolean(firstResult.demoMode);
    let demoReason: string | undefined = firstResult.reason;

    if (isArabic && !firstResult.demoMode && !isValidReport(report, true)) {
      const retryPrompt = `${langInstruction}

The previous result was not suitable for an Arabic interface. Regenerate the report from the original text. Keep the JSON keys exactly as required. Write all user-facing values in formal Arabic. Do not translate brand names or URLs.

Original text:
${text}

Return valid JSON only using the required schema.`;

      const retryResult = await aiProvider.generateJSON<OtherSideReport>({
        system: SYSTEM_PROMPT,
        prompt: retryPrompt,
      });

      if (!retryResult.demoMode && isValidReport(retryResult.data, true)) {
        report = retryResult.data;
        demoMode = false;
        demoReason = undefined;
      } else {
        demoReason = retryResult.reason || 'Arabic retry did not produce a valid report';
      }
    }

    if (demoMode || !isValidReport(report, isArabic)) {
      report = getMockReport(text, isArabic);
      demoMode = true;
      demoReason = demoReason
        || (firstResult.data && isArabic && arabicRatio(firstResult.data.otherSideStory) < 0.5
          ? 'Model replied in English for an Arabic request'
          : firstResult.data ? 'Model produced low-quality output' : undefined);
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
