import { NextResponse } from 'next/server';
import { aiProvider } from '@/lib/ai-provider';
import { softRewriteNeutrality, cleanArabicLeakage } from '@/lib/neutrality-guard';
import { OtherSideReport } from '@/types';

export const maxDuration = 25;

const SYSTEM_PROMPT = `You are OtherSide AI — a senior counter-narrative research analyst producing professional intelligence briefs.

YOUR MISSION: Given any claim or narrative, construct the opposing side's fullest, most evidence-rich case using real named sources, direct quotes, specific dates, statistics, and named actors from your training knowledge.

════ ABSOLUTE RULES ════
1. Never give a verdict. Never say who is right, wrong, or lying.
2. Never moralize. Maintain strict analytical neutrality throughout.
3. Use precise hedged language: "according to [Named Source, Date]", "publicly stated in [outlet]", "disputes this by citing", "filed in [court]", "testified that".
4. ALL text values in the JSON MUST be in the SAME LANGUAGE as the user input. Arabic input → ALL strings in Arabic. English input → ALL strings in English. No exceptions, no mixing.

════ SOURCE REQUIREMENTS ════
5. Provide 4–6 sourceNotes minimum. Mix source types: official statements, court filings, news reporting, primary documents, academic research.
6. Every sourceNote MUST include: specific "title", named "publisher" (Reuters / BBC / AP / NYT / Al Jazeera / FT / government body / court name / etc.), and "date" (Month Year).
7. Include direct verbatim quotes from named public figures whenever you have them from training data. Format: [Name] stated: "[quote]" ([outlet], [year]).
8. Include at least one piece of quantitative data, statistic, or financial figure where applicable (e.g., "invested $13 billion", "26% market share", "filed 847 pages of evidence").
9. If uncertain about a specific source, mark strength: "weak" and write "reportedly" or "according to unverified reports". NEVER fabricate a URL — omit url if not confident.
10. If a source type is genuinely missing, use strength: "missing" and explain precisely what evidence gap exists.

════ CONTENT DEPTH REQUIREMENTS ════
11. otherSideStory: MINIMUM 3 substantial paragraphs. Each paragraph must: name specific people or organizations, cite specific evidence or documents, include dates, and present a distinct argument. Do not repeat the same point across paragraphs.
12. strongestCounterArgument: Must be a DISTINCT, sharper, more focused argument than otherSideStory — the single most powerful piece of evidence or logic that the other side holds. Make it specific and quantified where possible.
13. bothSidesAgreeOn: 4–5 items. Each must be a FULL SENTENCE describing a specific verifiable shared fact. Include numbers, dates, or named actors. NOT fragments like "mission" or "AI cooperation".
14. disputedPoints: 4–5 items. Each must be a FULL SENTENCE naming the exact point of contention and who disputes whom. Include quantitative claims where relevant.
15. uncertaintyNotes: 2–3 items. Name specific information gaps, conflicting evidence, or methodological limitations.
16. detectedStory: One precise paragraph summarizing what the INPUT ITSELF claims — name the parties, the core allegation, and the implied timeline. Same language as input.

Return ONLY a valid JSON object. No preamble. No markdown. No explanation outside the JSON:
{
  "detectedStory": "string",
  "mainParty": "string",
  "otherParty": "string",
  "otherSideStory": "string — minimum 3 paragraphs, separated by \\n\\n",
  "strongestCounterArgument": "string — specific, evidence-based, distinct from otherSideStory",
  "bothSidesAgreeOn": ["full sentence with specific fact, date, or figure"],
  "disputedPoints": ["full sentence naming the specific contention and parties"],
  "sourceNotes": [
    {
      "sourceType": "official_statement | court_filing | reporting | primary_source | historical_record | unknown",
      "title": "Exact title of article, document, or statement",
      "publisher": "Named outlet, court, government body, or institution",
      "date": "Month Year",
      "note": "2–3 sentences: what this source establishes, what direct evidence it contains, and why it matters to this dispute",
      "strength": "strong | medium | weak | missing",
      "url": "https://... only if you are highly confident it is accurate and accessible"
    }
  ],
  "uncertaintyNotes": ["full sentence identifying a specific information gap or conflicting evidence"],
  "neutralNote": "This is not a verdict. It presents the other side's argument without judging who is right."
}`;

function getMockReport(text: string, isArabic: boolean): OtherSideReport {
  const isElonOpenAI = text.toLowerCase().includes('openai') || text.toLowerCase().includes('musk') || text.includes('ماسك') || text.includes('أوبن');

  if (isArabic) {
    if (isElonOpenAI) {
      return {
        detectedStory: "يدّعي النص المُدخَل أن OpenAI انحرفت عن مهمتها الأصلية كمنظمة غير ربحية، وأصبحت مرتبطة تجاريًا بشكل وثيق بمايكروسوفت على حساب استقلاليتها.",
        mainParty: "إيلون ماسك / المنتقدون لإعادة هيكلة OpenAI",
        otherParty: "OpenAI وسام ألتمان",
        otherSideStory: "ترى OpenAI أن تحوّلها إلى هيكل «محدود الأرباح» لم يكن تراجعًا عن المهمة، بل ضرورة عملية لتمويل تطوير نماذج الذكاء الاصطناعي المتقدمة التي تتطلب مليارات الدولارات من طاقة الحوسبة. وقد صرّح سام ألتمان في مقابلات عديدة بأن التمويل التجاري هو الوسيلة الوحيدة الواقعية لتحقيق المهمة التقنية على نطاق واسع.\n\nوتؤكد OpenAI أن مجلس إدارتها غير الربحي لا يزال يمتلك حق النقض (veto) على القرارات المصيرية، وأن هذا الهيكل يُبقي الجانب التجاري خادمًا للمهمة لا مُتحكِّمًا فيها. وفي رد رسمي على دعوى ماسك، نفّت الشركة وجود أي انتهاك لالتزاماتها التأسيسية.",
        strongestCounterArgument: "النقطة الأقوى لصالح OpenAI هي أن ماسك نفسه كان شريكًا مؤسسًا ومموّلًا أوليًا للشركة، وغادرها عام 2018 قبل أي تحوّل هيكلي جوهري. ولاحقًا أطلق شركة xAI المنافسة المباشرة. ويرى محامو OpenAI أن الدعوى القضائية جاءت بعد أن رفضت الشركة قيادته من جديد، مما يطرح تساؤلات جدية حول دوافع الدعوى الحقيقية.",
        bothSidesAgreeOn: [
          "تأسست OpenAI عام 2015 بوصفها منظمة غير ربحية تهدف إلى تطوير الذكاء الاصطناعي لمنفعة البشرية.",
          "أطلقت OpenAI عام 2019 هيكلًا جديدًا «محدود الأرباح» لجذب الاستثمارات الخارجية.",
          "ضخّت مايكروسوفت أكثر من عشرة مليارات دولار في OpenAI وأصبحت شريكتها الاستراتيجية الرئيسية.",
          "غادر إيلون ماسك مجلس إدارة OpenAI عام 2018 وأسس لاحقًا شركة xAI المنافسة."
        ],
        disputedPoints: [
          "هل يُعدّ التحوّل إلى هيكل محدود الأرباح خيانةً للمهمة التأسيسية أم أداةً ضروريةً لتحقيقها؟",
          "هل أفقد دور مايكروسوفت الممتد OpenAI استقلاليتها في اتخاذ القرارات المصيرية؟",
          "هل ظل هيكل الحوكمة غير الربحي ذا أثر فعلي بعد دخول المستثمرين التجاريين؟",
          "هل كانت دوافع دعوى ماسك القضائية حرصًا على المصلحة العامة أم منافسةً تجارية؟"
        ],
        sourceNotes: [
          {
            sourceType: "official_statement",
            title: "OpenAI Charter — هيكل الشركة ومهمتها",
            publisher: "OpenAI",
            date: "2019",
            note: "الميثاق التأسيسي الرسمي لـ OpenAI يوضح هيكل محدود الأرباح والحوكمة غير الربحية وضمانات المهمة.",
            strength: "strong",
            url: "https://openai.com/charter"
          },
          {
            sourceType: "court_filing",
            title: "Musk v. OpenAI — شكوى المحكمة العليا بكاليفورنيا",
            publisher: "Superior Court of California",
            date: "فبراير 2024",
            note: "تتضمن ادعاءات ماسك بأن OpenAI انتهكت اتفاقياتها التأسيسية. ردّت OpenAI بنفي جميع التهم.",
            strength: "strong",
            url: "https://www.courthousenews.com/wp-content/uploads/2024/03/musk-v-openai-complaint.pdf"
          },
          {
            sourceType: "reporting",
            title: "Elon Musk drops lawsuit against OpenAI",
            publisher: "Reuters",
            date: "يونيو 2024",
            note: "أسقط ماسك دعواه القضائية ثم أعاد رفعها لاحقًا، مما أثار تساؤلات حول الجدية القانونية للادعاءات.",
            strength: "strong",
            url: "https://www.reuters.com/technology/elon-musk-drops-lawsuit-against-openai-2024-06-11/"
          }
        ],
        uncertaintyNotes: [
          "لا تتوفر حاليًا وثائق داخلية تكشف عن آليات عمل مجلس الإدارة الفعلية مقارنةً بالهيكل المُعلن.",
          "أُسقطت دعوى ماسك ثم أُعيد رفعها، مما يجعل الوضع القانوني متغيرًا وغير مستقر."
        ],
        neutralNote: "هذا ليس حكمًا. الهدف هو عرض الجانب الآخر فقط، دون البتّ في من هو على حق."
      };
    }
    return {
      detectedStory: `يطرح النص المُدخَل ادعاءً أو موقفًا بشأن: "${text.substring(0, 100)}..."`,
      mainParty: "صاحب الادعاء في النص",
      otherParty: "الطرف الآخر أو المتأثر",
      otherSideStory: "من المرجح أن يطعن الطرف الآخر في التفسيرات الجوهرية الواردة في النص، مؤكدًا أن ثمة سياقًا أو وقائع بديلة جوهرية أُغفلت. وقد يرى هذا الطرف أن الإجراءات المنسوبة إليه جاءت استجابةً لضرورات خارجية لم يُشَر إليها، وأن القراءة الأحادية تُشوّه الصورة الكاملة للحدث.",
      strongestCounterArgument: "الحجة الأقوى للطرف الآخر أنه لا يمكن تقييم أي قرار بمعزل عن سياقه الكامل. ويرى هذا الطرف أن الموقف المُقدَّم يختزل قضية معقدة في رواية مُبسَّطة تُغفل عوامل هيكلية وقيودًا خارجية حاسمة.",
      bothSidesAgreeOn: [
        "الحدث أو العلاقة المُشار إليها قائمة فعلًا وتستدعي النقاش.",
        "الأطراف المعنية فاعلون رئيسيون في هذا المجال ولهم مواقف معلنة."
      ],
      disputedPoints: [
        "الدوافع الحقيقية وراء الإجراءات المتخذة وتفسير نياتها.",
        "مدى تمثيل النتائج المُبلَّغ عنها للصورة الكاملة والعادلة للوضع."
      ],
      sourceNotes: [
        {
          sourceType: "reporting",
          title: "تغطية إعلامية للحدث",
          publisher: "وسائل إعلام متعددة",
          date: "2024",
          note: "تتباين وسائل الإعلام في تناول هذا الموضوع من زوايا متعددة؛ يُنصح بمراجعة مصادر متنوعة.",
          strength: "medium"
        }
      ],
      uncertaintyNotes: [
        "لم تُقدَّم مصادر أولية كافية في النص، مما يُصعّب التحقق الكامل من المعلومات الواردة."
      ],
      neutralNote: "هذا ليس حكمًا. الهدف هو عرض الجانب الآخر فقط، دون البتّ في من هو على حق."
    };
  }

  // English fallback
  if (isElonOpenAI) {
    return {
      detectedStory: "The pasted text argues that OpenAI has betrayed its original nonprofit mission and become excessively aligned with Microsoft's commercial interests.",
      mainParty: "Elon Musk / critics of OpenAI's restructuring",
      otherParty: "OpenAI and Sam Altman",
      otherSideStory: "OpenAI would likely argue that its 2019 transition to a 'capped-profit' structure was not a retreat from the mission but a practical necessity to fund the enormous compute resources required to develop frontier AI systems safely. Sam Altman has stated publicly on multiple occasions that commercial partnerships were the only realistic mechanism to fund the technical mission at scale without compromising research independence.\n\nThe organization further contends that its nonprofit parent board retains veto authority over existential decisions, and that this governance structure keeps the commercial entity subordinate to the mission. In its formal response to Musk's lawsuit, OpenAI denied any breach of its foundational commitments and accused Musk of bringing the suit after the company declined to restore his leadership role.",
      strongestCounterArgument: "OpenAI's sharpest counter-point is that Musk himself was a co-founder and early funder who departed the board in 2018 — before any significant structural change — and subsequently launched xAI, a direct commercial competitor. OpenAI's legal team argued publicly that the lawsuit arrived precisely after Musk's request to retake control of the organization was rejected, raising material questions about the litigation's true motivation.",
      bothSidesAgreeOn: [
        "OpenAI was founded in 2015 as a nonprofit organization with the stated goal of developing AI for the broad benefit of humanity.",
        "In 2019, OpenAI introduced a new 'capped-profit' structure specifically to attract external investment while nominally preserving its mission governance.",
        "Microsoft has invested over $13 billion in OpenAI and become its primary cloud and distribution partner.",
        "Elon Musk departed OpenAI's board in 2018 and later founded xAI as a direct competitor."
      ],
      disputedPoints: [
        "Whether the structural shift to a capped-profit model constitutes a betrayal of the nonprofit mission or a necessary tool for achieving it.",
        "Whether Microsoft's deep integration has materially undermined OpenAI's independence in research and governance decisions.",
        "Whether the nonprofit parent board retains meaningful authority over strategic direction, or functions primarily as a compliance formality.",
        "Whether Musk's lawsuit reflects genuine concern for the public interest or competitive motivation from his position as founder of a rival AI company."
      ],
      sourceNotes: [
        {
          sourceType: "official_statement",
          title: "OpenAI Charter",
          publisher: "OpenAI",
          date: "2019",
          note: "OpenAI's founding charter describes the capped-profit structure, the nonprofit parent board's authority, and the mission guardrails intended to prevent purely commercial capture.",
          strength: "strong",
          url: "https://openai.com/charter"
        },
        {
          sourceType: "court_filing",
          title: "Musk v. OpenAI — Superior Court of California Complaint",
          publisher: "Superior Court of California",
          date: "February 2024",
          note: "Contains Musk's formal legal claims that OpenAI violated its founding agreements. OpenAI filed a counter-response denying all allegations.",
          strength: "strong",
          url: "https://www.courthousenews.com/wp-content/uploads/2024/03/musk-v-openai-complaint.pdf"
        },
        {
          sourceType: "reporting",
          title: "Elon Musk drops lawsuit against OpenAI",
          publisher: "Reuters",
          date: "June 2024",
          note: "Musk withdrew then re-filed his lawsuit, a pattern that OpenAI's lawyers cited as evidence of litigation strategy rather than principled legal action.",
          strength: "strong",
          url: "https://www.reuters.com/technology/elon-musk-drops-lawsuit-against-openai-2024-06-11/"
        }
      ],
      uncertaintyNotes: [
        "Internal board deliberations are not public, making it impossible to verify whether the nonprofit governance structure functions as described in official documents.",
        "The lawsuit's legal status has changed multiple times; the full evidentiary record is not yet available."
      ],
      neutralNote: "This is not a verdict. It presents the other side's argument without judging who is right."
    };
  }

  return {
    detectedStory: `The input presents a claim or narrative concerning: "${text.substring(0, 100)}..."`,
    mainParty: "Author of original claim",
    otherParty: "The other party or affected perspective",
    otherSideStory: "The other side would likely dispute the core framing of the input, arguing that crucial context or alternative facts have been omitted. They may contend that the actions described were necessary responses to external constraints not mentioned in the original text, and that a one-sided reading distorts the full picture.",
    strongestCounterArgument: "The other side's strongest argument is that no decision can be fairly evaluated in isolation from its structural context. From their perspective, the narrative presented simplifies a complex situation into a single-cause explanation that ignores systemic factors and external constraints that shaped the outcome.",
    bothSidesAgreeOn: [
      "The event or relationship described in the input is real and has generated substantive debate.",
      "Both parties are significant actors in this domain and have made public statements about their positions."
    ],
    disputedPoints: [
      "The primary motivation behind the actions taken and how those motivations should be interpreted.",
      "Whether the reported outcomes accurately represent the full picture or reflect a partial framing of events."
    ],
    sourceNotes: [
      {
        sourceType: "reporting",
        title: "News coverage of the event",
        publisher: "Multiple outlets",
        date: "2024",
        note: "News coverage addresses this topic from multiple angles. Cross-referencing primary sources directly is recommended.",
        strength: "medium"
      }
    ],
    uncertaintyNotes: [
      "No primary sources were included in the input, limiting the depth of structural verification possible."
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

    const languageBlock = isArabic
      ? `\n\n⚠️ CRITICAL — ARABIC MODE ACTIVE:
اكتب جميع القيم النصية في JSON باللغة العربية الفصحى فقط. هذا ينطبق على جميع الحقول: detectedStory وmainParty وotherParty وotherSideStory وstrongestCounterArgument وكل عنصر في bothSidesAgreeOn وdisputedPoints وsourceNotes وuncertaintyNotes وneutralNote.
لا تكتب أي كلمة إنجليزية داخل قيم JSON النصية (باستثناء أسماء العلم المعروفة كـ OpenAI وMicrosoft وما شابه).
يجب أن تكون كل جملة في القوائم جملةً كاملةً باللغة العربية، وليست مجرد مصطلح أو كلمة منفردة.`
      : `\n\nWrite all JSON string values in clear, formal English. Every list item must be a complete sentence, not a single word or phrase.`;

    const modeInstructions: Record<string, string> = {
      quick: `QUICK COUNTER MODE:
- otherSideStory: 2 focused paragraphs, each naming at least one specific actor or source.
- Provide 3–4 sourceNotes with named publishers and dates.
- bothSidesAgreeOn: 3–4 items. disputedPoints: 3–4 items.
- Include at least one direct quote or statistic.`,

      deep: `DEEP DISPUTE MODE:
- otherSideStory: 4–5 substantial paragraphs. Cover: (1) the other side's core position, (2) key evidence they cite, (3) named actors and their stated positions, (4) timeline of events with specific dates, (5) structural or systemic arguments.
- Provide 5–6 sourceNotes spanning official statements, court filings or government documents, and news reporting.
- bothSidesAgreeOn: 5 items with specific dates/figures. disputedPoints: 5 items.
- Include multiple direct quotes from named figures with source attribution.
- Include quantitative data (financial figures, vote counts, statistics, percentages) where available.`,

      history: `HISTORY MIRROR MODE:
- Focus on voices, groups, or perspectives OMITTED from the dominant narrative.
- otherSideStory: 4 paragraphs covering: (1) who is marginalized, (2) their documented experience, (3) primary source testimonies or archival evidence, (4) how mainstream accounts have historically ignored or misrepresented their position.
- Prioritize: archives, testimonies, academic historiography, international body reports, primary documents.
- Provide 5–6 sourceNotes with academic publishers, archival sources, or international organization reports.
- Name specific historians, researchers, or institutions who have documented the alternative record.`,
    };

    const userPrompt = `${modeInstructions[mode] || modeInstructions.quick}

SOURCE STRICTNESS: ${sourceStrictness || 'balanced'}
${sourceStrictness === 'strict' ? '→ Only include sourceNotes with strength: "strong". Mark any unverifiable claim as strength: "missing" and explain the gap.' : sourceStrictness === 'reasoned' ? '→ Combine documented evidence with clearly-labeled reasoned inference. Distinguish between "established fact" and "logical inference from available evidence".' : '→ Balance direct evidence with reasonable inference. Label speculative elements as "reportedly" or "this would suggest".'}
${languageBlock}

INPUT TEXT TO ANALYZE:
${text}

Produce a single JSON object. Make it as specific, evidence-rich, and deeply researched as your training data allows.`;

    const result = await aiProvider.generateJSON<OtherSideReport>({
      system: SYSTEM_PROMPT,
      prompt: userPrompt,
    });

    let report: OtherSideReport;
    let demoMode = false;
    let demoReason: string | undefined;

    if (result.demoMode || !result.data || typeof result.data !== 'object') {
      report = getMockReport(text, isArabic);
      demoMode = true;
      demoReason = result.reason;
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
    if (report.bothSidesAgreeOn) {
      report.bothSidesAgreeOn = report.bothSidesAgreeOn.map(rewrite);
    }
    if (report.disputedPoints) {
      report.disputedPoints = report.disputedPoints.map(rewrite);
    }
    if (report.uncertaintyNotes) {
      report.uncertaintyNotes = report.uncertaintyNotes.map(rewrite);
    }
    if (report.sourceNotes) {
      report.sourceNotes = report.sourceNotes.map((s) => ({ ...s, note: rewrite(s.note) }));
    }

    return NextResponse.json({ report, demoMode, demoReason });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal report generation error' }, { status: 500 });
  }
}
