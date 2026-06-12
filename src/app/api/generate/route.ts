import { NextResponse } from 'next/server';
import { aiProvider } from '@/lib/ai-provider';
import { softRewriteNeutrality, cleanArabicLeakage } from '@/lib/neutrality-guard';
import { searchForContext, formatSearchContext, isRepetitive } from '@/lib/web-search';
import { OtherSideReport } from '@/types';

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
      return {
        detectedStory: "يدّعي النص المُدخَل أن OpenAI خانت مهمتها الأصلية بوصفها منظمة غير ربحية، وأصبحت مرتبطة تجاريًا بشكل وثيق بمايكروسوفت على حساب استقلاليتها.",
        mainParty: "إيلون ماسك / المنتقدون لإعادة هيكلة OpenAI",
        otherParty: "OpenAI وسام ألتمان",
        otherSideStory: `ترى OpenAI أن تحوّلها عام 2019 إلى هيكل «محدود الأرباح» لم يكن تراجعًا عن المهمة، بل ضرورة عملية لتأمين التمويل اللازم لتطوير نماذج ذكاء اصطناعي متقدمة تتطلب مليارات الدولارات من طاقة الحوسبة. وقد صرّح سام ألتمان في مقابلة مع MIT Technology Review (أبريل 2023): "لا يمكنك بناء الذكاء الاصطناعي العام بالتبرعات وحدها، التمويل التجاري ضروري لتحقيق المهمة، لا لنقيضها."

وتؤكد OpenAI أن مجلس إدارتها غير الربحي لا يزال يمتلك حق النقض على القرارات المصيرية، بما في ذلك إطلاق المنتجات وعمليات الاندماج. وقد أكد هذا الهيكل عمليًا في نوفمبر 2023 حين أقال المجلس سام ألتمان مؤقتًا قبل إعادته، مما يُثبت وجود رقابة مؤسسية فعلية تتجاوز المصالح التجارية.

أما فيما يخص ماسك، فقد غادر مجلس الإدارة عام 2018 قبل أي تحوّل هيكلي جوهري، وأطلق لاحقًا شركة xAI في يوليو 2023 كمنافس مباشر لـ OpenAI. وقد رأى محامو OpenAI أن توقيت الدعوى القضائية — التي جاءت بعد رفض الشركة قيادته — يكشف عن دوافع تنافسية لا قانونية.`,
        strongestCounterArgument: "أقوى حجة لصالح OpenAI هي أن ماسك عرض عام 2017 ضمّ الشركة بالكامل إلى Tesla، وهو عرض رفضه المجلس لأنه كان سيحوّل الشركة إلى كيان ربحي خالص. ويرى محامو OpenAI أن هذا الموقف يُناقض ادعاءاته اللاحقة بالحرص على المهمة غير الربحية — إذ كان هو نفسه من اقترح تحويلها إلى شركة ربحية بشكل أكثر جذرية مما حدث.",
        bothSidesAgreeOn: [
          "تأسست OpenAI عام 2015 بوصفها منظمة غير ربحية بتمويل أولي قدره مليار دولار من مجموعة من المستثمرين.",
          "أطلقت OpenAI عام 2019 هيكل «محدود الأرباح» الذي يحدد عوائد المستثمرين بمضاعف يتراوح بين 10 و100 مرة.",
          "ضخّت مايكروسوفت ما يزيد على 13 مليار دولار في OpenAI وحصلت على 49% من الكيان الربحي.",
          "غادر إيلون ماسك مجلس الإدارة عام 2018، وأطلق xAI في يوليو 2023 بتمويل بلغ 6 مليارات دولار."
        ],
        disputedPoints: [
          "هل التحوّل إلى هيكل محدود الأرباح خيانة للمهمة التأسيسية أم أداة ضرورية لتحقيقها على نطاق واسع؟",
          "هل أفقدت حصة مايكروسوفت البالغة 49% OpenAI استقلاليتها في القرارات البحثية والحوكمة؟",
          "هل يمتلك مجلس الإدارة غير الربحي سيطرة فعلية أم أنه مجرد هيكل إداري شكلي؟",
          "هل جاءت دعوى ماسك دفاعًا عن المصلحة العامة أم انعكاسًا لمنافسة تجارية مع xAI؟"
        ],
        sourceNotes: [
          {
            sourceType: "official_statement",
            title: "OpenAI Charter — Our Structure",
            publisher: "OpenAI",
            date: "2019",
            note: "الوثيقة التأسيسية الرسمية لـ OpenAI تشرح هيكل محدود الأرباح، وصلاحيات مجلس الإدارة غير الربحي، وضمانات المهمة. تنص صراحةً على أن المهمة تتقدم على العوائد التجارية.",
            strength: "strong",
            url: "https://openai.com/charter"
          },
          {
            sourceType: "court_filing",
            title: "Musk v. OpenAI, Inc. — Complaint",
            publisher: "Superior Court of California, County of San Francisco",
            date: "فبراير 2024",
            note: "تتضمن ادعاءات ماسك الرسمية بأن OpenAI انتهكت التزاماتها التأسيسية. ردّت OpenAI بنفي جميع التهم وطالبت برفض الدعوى.",
            strength: "strong",
            url: "https://www.courthousenews.com/wp-content/uploads/2024/03/musk-v-openai-complaint.pdf"
          },
          {
            sourceType: "reporting",
            title: "Elon Musk drops lawsuit against OpenAI",
            publisher: "Reuters",
            date: "يونيو 2024",
            note: "أسقط ماسك دعواه القضائية الأولى في يونيو 2024، ثم أعاد رفعها في أغسطس 2024، في خطوة وصفها محامو OpenAI بأنها تُقوّض مصداقية الادعاءات.",
            strength: "strong",
            url: "https://www.reuters.com/technology/elon-musk-drops-lawsuit-against-openai-2024-06-11/"
          },
          {
            sourceType: "reporting",
            title: "OpenAI board fires Sam Altman",
            publisher: "The Verge",
            date: "نوفمبر 2023",
            note: "إقالة مجلس الإدارة لألتمان ثم إعادته خلال أسبوع واحد تُثبت أن الهيكل الرقابي غير الربحي يمتلك صلاحيات حقيقية، وهو ما يدعم موقف OpenAI في النزاع.",
            strength: "strong",
            url: "https://www.theverge.com/2023/11/17/23965982/openai-board-fires-sam-altman"
          }
        ],
        uncertaintyNotes: [
          "لا تتوفر وثائق داخلية تكشف كيف يتخذ مجلس الإدارة قراراته فعليًا مقارنةً بالهيكل المُعلن.",
          "الوضع القانوني للدعوى متغيّر؛ أُسقطت ثم أُعيد رفعها، والسجل الاستدلالي الكامل غير متاح بعد."
        ],
        neutralNote: "هذا ليس حكمًا. الهدف هو عرض الجانب الآخر فقط، دون البتّ في من هو على حق."
      };
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
    return {
      detectedStory: "The input claims that OpenAI betrayed its original nonprofit mission and has become excessively aligned with Microsoft's commercial interests at the expense of its founding principles.",
      mainParty: "Elon Musk / critics of OpenAI's restructuring",
      otherParty: "OpenAI and Sam Altman",
      otherSideStory: `OpenAI would argue that its 2019 transition to a 'capped-profit' entity was a structural necessity, not a betrayal. Developing frontier AI requires billions in compute costs that nonprofit donations cannot fund. Sam Altman stated in an interview with MIT Technology Review (April 2023): "You cannot build AGI on charity alone. The commercial structure is a tool for the mission, not against it."\n\nOpenAI further contends that its nonprofit parent board retained veto authority over existential decisions — a claim validated in November 2023 when the board fired Altman and then reinstated him within a week, demonstrating that governance mechanisms function independently of commercial pressure.\n\nRegarding Musk specifically, OpenAI's legal team noted publicly that he departed the board in 2018 before any structural change, later offered to acquire OpenAI and merge it with Tesla (which would have made it more commercial, not less), and then launched xAI as a direct competitor in July 2023. OpenAI filed a countersuit in March 2024 arguing that Musk's lawsuit was motivated by competitive interest rather than principled legal concern.`,
      strongestCounterArgument: "OpenAI's strongest counter-point is that Musk himself proposed in 2017 to take full control of OpenAI and merge it into Tesla — a move the board rejected precisely because it would have converted the organization into a purely for-profit entity. If his concern were genuinely about nonprofit mission preservation, this proposal contradicts it fundamentally. OpenAI's lawyers argued this publicly in their March 2024 court filing.",
      bothSidesAgreeOn: [
        "OpenAI was founded in December 2015 as a nonprofit with approximately $1 billion in initial funding commitments.",
        "OpenAI introduced a capped-profit structure in 2019, limiting investor returns to 100x the initial investment.",
        "Microsoft has invested over $13 billion in OpenAI and holds approximately 49% of the for-profit entity.",
        "Elon Musk left OpenAI's board in February 2018 and launched xAI in July 2023 with $6 billion in funding."
      ],
      disputedPoints: [
        "Whether the capped-profit structure constitutes a betrayal of OpenAI's nonprofit mission or a necessary mechanism for achieving it at scale.",
        "Whether Microsoft's 49% stake has materially compromised OpenAI's independence in research and governance decisions.",
        "Whether the nonprofit parent board retains meaningful authority or functions primarily as a compliance formality.",
        "Whether Musk's litigation reflects genuine concern for the public interest or is primarily motivated by competitive position of xAI."
      ],
      sourceNotes: [
        {
          sourceType: "official_statement",
          title: "OpenAI Charter — Our Structure",
          publisher: "OpenAI",
          date: "2019",
          note: "OpenAI's founding charter explicitly states that the mission takes precedence over commercial returns, and describes the nonprofit board's veto authority over strategic decisions. This is the primary document OpenAI cites in its defense.",
          strength: "strong",
          url: "https://openai.com/charter"
        },
        {
          sourceType: "court_filing",
          title: "Musk v. OpenAI — OpenAI Counterclaim",
          publisher: "Superior Court of California",
          date: "March 2024",
          note: "OpenAI's counterclaim alleges Musk proposed a Tesla merger in 2017, demanded majority equity control, and filed the lawsuit only after his leadership bid was rejected. This document contains the key factual disputes in the case.",
          strength: "strong",
          url: "https://www.courthousenews.com/wp-content/uploads/2024/03/musk-v-openai-complaint.pdf"
        },
        {
          sourceType: "reporting",
          title: "OpenAI board fires Sam Altman",
          publisher: "The Verge",
          date: "November 2023",
          note: "The board's decision to fire and then reinstate Altman within five days demonstrated that the nonprofit governance structure has real operational authority, supporting OpenAI's claim that commercial interests do not override board control.",
          strength: "strong",
          url: "https://www.theverge.com/2023/11/17/23965982/openai-board-fires-sam-altman"
        },
        {
          sourceType: "reporting",
          title: "Elon Musk drops lawsuit against OpenAI",
          publisher: "Reuters",
          date: "June 2024",
          note: "Musk withdrew his original lawsuit in June 2024 then re-filed it in August 2024, a pattern OpenAI's lawyers cited as evidence of litigation strategy rather than principled legal action.",
          strength: "strong",
          url: "https://www.reuters.com/technology/elon-musk-drops-lawsuit-against-openai-2024-06-11/"
        }
      ],
      uncertaintyNotes: [
        "Internal board deliberations are not public, making it impossible to independently verify whether the governance structure operates as described in official documents.",
        "The lawsuit's evidentiary record is incomplete as of mid-2024; key depositions and document disclosures had not yet occurred."
      ],
      neutralNote: "This is not a verdict. It presents the other side's argument without judging who is right."
    };
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
      ? `\n\nتعليمة لغوية: اكتب جميع قيم JSON النصية باللغة العربية الفصحى فقط. لا تكتب أي كلمة إنجليزية داخل القيم النصية (ما عدا أسماء العلم كـ OpenAI وMicrosoft). كل عنصر في القوائم يجب أن يكون جملةً عربيةً كاملةً.`
      : `\n\nLanguage: Write all JSON string values in clear, formal English. Every list item must be a complete sentence.`;

    const modeInstr: Record<string, string> = {
      quick: 'Mode: QUICK — 2 focused paragraphs for otherSideStory, 3 sources minimum.',
      deep: 'Mode: DEEP — 4 paragraphs for otherSideStory (position / evidence / named actors / timeline), 5+ sources with direct quotes and statistics.',
      history: 'Mode: HISTORY MIRROR — Focus on omitted voices. Cite archival sources, testimonies, academic historians, international body reports.',
    };

    const strictnessInstr: Record<string, string> = {
      strict: 'Strictness: STRICT — Only cite sources you are confident exist. Mark any uncertain source as strength: "missing".',
      reasoned: 'Strictness: REASONED — Combine documented evidence with clearly-labeled logical inference.',
      balanced: 'Strictness: BALANCED — Mix direct evidence with reasonable inference; label speculative elements as "reportedly".',
    };

    const userPrompt = `${modeInstr[mode] || modeInstr.quick}
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
      return true;
    };

    if (result.demoMode || !isValidReport(result.data)) {
      report = getMockReport(text, isArabic);
      demoMode = true;
      demoReason = result.reason || (result.data && !isValidReport(result.data) ? 'Model produced low-quality output' : undefined);
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
