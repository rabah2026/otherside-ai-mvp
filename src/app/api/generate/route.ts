import { NextResponse } from 'next/server';
import { aiProvider } from '@/lib/ai-provider';
import { softRewriteNeutrality, cleanArabicLeakage } from '@/lib/neutrality-guard';
import { searchEvidenceForReport, formatEvidenceContext, isRepetitive, allowedEvidenceUrls, isUrlInEvidence } from '@/lib/web-search';
import { OPENAI_REPORT_EN, OPENAI_REPORT_AR } from '@/lib/example-reports';
import { OtherSideReport } from '@/types';

function arabicRatio(text: string): number {
  const letters = (text || '').replace(/[\s\d.,،؛:"'«»\-()/]/g, '');
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

// Subjective "greatest/best ever" claims in any domain (sports, science,
// art…) — used to steer the model toward criteria-based comparison rather
// than picking a winner.
function isSubjectiveSuperlative(text: string): boolean {
  return /(الأفضل|الأعظم|افضل|اعظم|greatest|best ever|goat|أهم|اهم)/i.test(text || '');
}

function isValidReport(r: any, isArabic: boolean): { ok: boolean; reason: string } {
  if (!r || typeof r !== 'object') return { ok: false, reason: 'not_object' };

  const story = String(r.otherSideStory || '');
  const counter = String(r.strongestCounterArgument || '');
  // GLM-4.7 writes concise but correct Arabic — use lenient minimums.
  const minStoryLength = isArabic ? 200 : 380;
  const minCounterLength = isArabic ? 70 : 120;

  if (story.length < minStoryLength)
    return { ok: false, reason: `story_short:${story.length}<${minStoryLength}` };
  if (counter.length < minCounterLength)
    return { ok: false, reason: `counter_short:${counter.length}<${minCounterLength}` };
  if (!Array.isArray(r.bothSidesAgreeOn) || r.bothSidesAgreeOn.length < 2)
    return { ok: false, reason: `bothSides_missing:${JSON.stringify(r.bothSidesAgreeOn)?.slice(0, 80)}` };
  if (!Array.isArray(r.disputedPoints) || r.disputedPoints.length < 2)
    return { ok: false, reason: `disputed_missing:${JSON.stringify(r.disputedPoints)?.slice(0, 80)}` };
  if (!Array.isArray(r.sourceNotes) || r.sourceNotes.length < 1)
    return { ok: false, reason: `sources_missing:${JSON.stringify(r.sourceNotes)?.slice(0, 80)}` };
  if (isRepetitive(story)) return { ok: false, reason: 'story_repetitive' };
  if (isRepetitive(counter)) return { ok: false, reason: 'counter_repetitive' };
  if (hasConversationalLeakage(story) || hasConversationalLeakage(counter))
    return { ok: false, reason: 'conversational_leakage' };
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
- If the input is subjective, such as "the greatest" or "the best", frame the other side around criteria, competing candidates, measurable achievements, historical context, and uncertainty.
- Use named sources and institutions where possible.
- Write every JSON string value in the user's language.
- Return only valid JSON.

Quality floor:
- otherSideStory must be substantial: at least 3 paragraphs.
- strongestCounterArgument must be a complete evidence-based paragraph.
- bothSidesAgreeOn and disputedPoints must each contain at least 2 complete sentences.
- sourceNotes must contain at least 2 source notes. Use strength "missing" only when no source is available.

Schema:
{
  "detectedStory": "neutral summary of the input claim",
  "mainParty": "party making the claim",
  "otherParty": "other party or affected side",
  "otherSideStory": "3 or more substantial paragraphs with evidence, criteria, and context",
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

function footballGoatReport(isArabic: boolean): OtherSideReport {
  if (isArabic) {
    return {
      detectedStory: 'يطرح النص ادعاءً بأن ليونيل ميسي هو اللاعب الأفضل في تاريخ كرة القدم.',
      mainParty: 'مؤيدو اعتبار ميسي اللاعب الأعظم تاريخيًا',
      otherParty: 'أنصار مرشحين آخرين مثل بيليه ودييغو مارادونا وكريستيانو رونالدو',
      otherSideStory: 'الرواية المقابلة لا تنكر مكانة ميسي الاستثنائية، لكنها ترفض تحويل لقب «الأفضل في التاريخ» إلى نتيجة محسومة بمعيار واحد. فأنصار بيليه مثلًا يستندون إلى هيمنته في زمن مختلف، وإلى ارتباط اسمه بثلاثة ألقاب لكأس العالم مع البرازيل، وهو إنجاز يصعب مقارنته مباشرة بعصر كرة القدم الحديثة لأن عدد المباريات، شكل البطولات، أساليب التدريب، وقوة الإعلام كانت مختلفة جذريًا. من هذا المنظور، المقارنة العادلة لا تبدأ بالسؤال: من الأكثر مهارة؟ بل بالسؤال: أي لاعب ترك الأثر الأكبر داخل شروط عصره؟\n\nويرى أنصار دييغو مارادونا أن معيار «حمل الفريق» يغيّر النتيجة. حجتهم أن مارادونا قدّم في كأس العالم 1986 نموذجًا نادرًا للاعب غيّر مسار بطولة كبرى تقريبًا بقدرات فردية وقيادة نفسية وفنية، كما أعاد تشكيل مكانة نابولي في كرة القدم الإيطالية في فترة كانت شديدة التنافس. وفق هذه القراءة، التفوق لا يُقاس فقط بالاستمرارية أو عدد الجوائز، بل بقدرة اللاعب على تغيير مصير فريق أقل اكتمالًا في لحظة تاريخية ضاغطة.\n\nأما أنصار كريستيانو رونالدو فيركّزون على معيار مختلف: الاستمرارية التهديفية، التكيف مع أكثر من دوري، الحضور في دوري أبطال أوروبا، والقدرة على المحافظة على مستوى عالٍ لسنوات طويلة في بيئات تكتيكية مختلفة. حجتهم ليست أن ميسي أقل موهبة، بل أن لقب «الأعظم» يمكن أن يُمنح للاعب جمع بين الإنتاج الرقمي، التحول البدني، النجاح في أكثر من منظومة، والتأثير التجاري والجماهيري العالمي. لذلك فالطرف الآخر يقول إن الادعاء يحتاج أولًا إلى تعريف المعيار: المهارة الخالصة، الألقاب، التأثير التاريخي، الاستمرارية، أو الأداء في البطولات الكبرى.',
      strongestCounterArgument: 'أقوى حجة للطرف المقابل هي أن عبارة «الأفضل في التاريخ» ليست حقيقة قابلة للحسم دون تحديد معيار القياس. إذا كان المعيار هو الذروة الفنية في بطولة واحدة فقد يتقدم مارادونا عند بعض المحللين؛ وإذا كان المعيار هو الأثر العالمي وكأس العالم فقد يدخل بيليه بقوة؛ وإذا كان المعيار هو الاستمرارية التهديفية والتكيف بين الدوريات فقد تكون حجة كريستيانو رونالدو قوية. لذلك لا يعترض الطرف الآخر على عظمة ميسي، بل يعترض على تقديمها كحكم نهائي يتجاوز اختلاف العصور والمعايير.',
      bothSidesAgreeOn: [
        'يتفق الطرفان على أن ليونيل ميسي من أعظم لاعبي كرة القدم في العصر الحديث وفي التاريخ عمومًا.',
        'يتفق الطرفان على أن المقارنة بين أجيال مختلفة في كرة القدم معقدة بسبب تغير البطولات والتكتيك واللياقة وقواعد اللعبة.'
      ],
      disputedPoints: [
        'الخلاف الأساسي هو ما إذا كان الفوز بكأس العالم والجوائز الفردية كافيًا لحسم لقب الأفضل تاريخيًا لصالح ميسي.',
        'هناك خلاف حول وزن المهارة الفردية مقارنة بالاستمرارية الرقمية والتأثير التاريخي والقدرة على تغيير مصير الفرق.'
      ],
      sourceNotes: [
        {
          sourceType: 'historical_record',
          title: 'سجل كأس العالم للاعبين والمنتخبات',
          publisher: 'FIFA',
          date: 'تحديثات متعددة',
          note: 'يفيد في مقارنة إنجازات اللاعبين في كأس العالم، خصوصًا عند مناقشة بيليه ومارادونا وميسي ضمن سياق البطولات الكبرى.',
          strength: 'strong'
        },
        {
          sourceType: 'reporting',
          title: 'سجل الكرة الذهبية وتاريخ الفائزين',
          publisher: 'France Football / Ballon d’Or',
          date: 'تحديثات سنوية',
          note: 'يفيد في فهم وزن الجوائز الفردية في حجة ميسي مقارنة بغيره، مع التنبيه إلى أن الجائزة نفسها ليست معيارًا وحيدًا للحسم.',
          strength: 'medium'
        },
        {
          sourceType: 'historical_record',
          title: 'سجلات دوري أبطال أوروبا والإحصاءات التهديفية',
          publisher: 'UEFA',
          date: 'تحديثات متعددة',
          note: 'تدعم حجة المقارنة الرقمية والاستمرارية، وهي نقطة يستخدمها أنصار كريستيانو رونالدو كثيرًا في نقاشات الأفضل تاريخيًا.',
          strength: 'strong'
        }
      ],
      uncertaintyNotes: [
        'لا يوجد معيار عالمي ملزم يحدد معنى «الأفضل في التاريخ»، لذلك تعتمد النتيجة على وزن كل معيار.',
        'المقارنة بين العصور تبقى غير مباشرة لأن ظروف التدريب والتحكيم والإعلام وعدد المباريات تغيّرت كثيرًا.'
      ],
      neutralNote: 'هذا ليس حكمًا. التقرير يعرض حجة الطرف المقابل دون ترجيح لاعب على آخر.'
    };
  }

  return {
    detectedStory: 'The input claims that Lionel Messi is the greatest football player in history.',
    mainParty: 'Supporters of Messi as the greatest player ever',
    otherParty: 'Supporters of other candidates such as Pelé, Diego Maradona, and Cristiano Ronaldo',
    otherSideStory: 'The opposing view does not deny Messi’s exceptional status. It argues that “greatest ever” cannot be settled without first defining the criteria. Pelé supporters emphasize dominance in a different era and his association with three World Cup-winning Brazil squads, while noting that direct comparison across eras is distorted by changes in training, media, tournament formats, and the global football calendar.\n\nMaradona supporters often shift the criterion toward peak influence and carrying power. They point to the 1986 World Cup and Napoli’s rise as examples of a player changing the competitive fate of teams under intense pressure. In that framing, greatness is not only consistency or awards, but the capacity to alter history with a less complete supporting structure.\n\nCristiano Ronaldo supporters use another benchmark: elite scoring longevity, adaptation across leagues, Champions League production, and sustained performance in different tactical environments. Their point is not necessarily that Messi lacks genius, but that a final judgment depends on whether the evaluator values skill, peak, trophies, longevity, portability, or historical influence most.',
    strongestCounterArgument: 'The strongest counterargument is that “greatest in history” is not a single factual claim unless the measurement standard is defined first. By peak tournament influence, Maradona has a case; by World Cup-era mythology and global historical impact, Pelé has a case; by longevity, scoring scale, and adaptation across leagues, Cristiano Ronaldo has a case. The counter-position therefore challenges the certainty of the claim rather than Messi’s greatness itself.',
    bothSidesAgreeOn: [
      'Both sides agree that Lionel Messi is one of the greatest players in football history.',
      'Both sides agree that comparing players across eras is difficult because football conditions changed significantly.'
    ],
    disputedPoints: [
      'The central disagreement is whether Messi’s combination of World Cup success, club dominance, and individual awards is enough to settle the historical debate.',
      'The sides disagree over how much weight should be given to skill, peak influence, international trophies, longevity, and adaptation across different football environments.'
    ],
    sourceNotes: [
      {
        sourceType: 'historical_record',
        title: 'World Cup player and team records',
        publisher: 'FIFA',
        date: 'Various updates',
        note: 'Useful for comparing claims about World Cup performance and historical impact among Pelé, Maradona, and Messi.',
        strength: 'strong'
      },
      {
        sourceType: 'reporting',
        title: 'Ballon d’Or winners archive',
        publisher: 'France Football / Ballon d’Or',
        date: 'Annual updates',
        note: 'Useful for understanding individual-award arguments, while recognizing that awards do not settle every historical criterion.',
        strength: 'medium'
      },
      {
        sourceType: 'historical_record',
        title: 'UEFA Champions League statistics and records',
        publisher: 'UEFA',
        date: 'Various updates',
        note: 'Relevant to longevity and elite club-performance arguments, especially in comparisons involving Cristiano Ronaldo and Messi.',
        strength: 'strong'
      }
    ],
    uncertaintyNotes: [
      'There is no universally binding standard for “greatest ever,” so the conclusion changes with the chosen criteria.',
      'Era-to-era comparison remains indirect because training, rules, media, and match volume changed substantially.'
    ],
    neutralNote: 'This is not a verdict. It presents the opposing argument without ranking the players.'
  };
}

function getMockReport(text: string, isArabic: boolean): OtherSideReport {
  const isElonOpenAI = /openai|musk|ماسك|أوبن/i.test(text);
  if (isFootballGoatClaim(text)) return footballGoatReport(isArabic);

  if (isArabic) {
    if (isElonOpenAI) return OPENAI_REPORT_AR;
    return {
      detectedStory: `يطرح النص ادعاءً بشأن: "${text.substring(0, 120)}..."`,
      mainParty: 'صاحب الادعاء',
      otherParty: 'الطرف الآخر',
      otherSideStory: 'يرى الطرف الآخر أن الادعاءات الواردة في النص تفتقر إلى السياق الكامل. وبينما يُقرّ بوجود الحدث، فإنه يجادل بأن التفسير المُقدَّم يتجاهل عوامل بنيوية وقيودًا خارجية أثّرت في مسار الأحداث.\n\nيستند هذا الطرف في موقفه إلى وقائع موثّقة تُظهر أن الإجراءات المُتّخذة جاءت ردًا على تحديات محددة، لا ابتداءً منه. كما يُؤكد أن التقارير الإعلامية التي تناولت القضية اعتمدت على مصدر واحد دون التحقق من الرواية المقابلة.\n\nومن زاويته، لا يكفي عرض النتيجة النهائية وحدها؛ إذ يجب النظر إلى التسلسل الزمني، وتوزيع المسؤولية، وما إذا كانت الوقائع المختارة تمثل الصورة كاملة أم مجرد جزء منها.',
      strongestCounterArgument: 'الحجة الأقوى للطرف الآخر هي أن التقييم المُقدَّم يقيس النتائج بمعيار مختلف عمّا أُعلن في البداية كهدف. ومن ثَمّ فإن مقارنة ما حدث بما كان مأمولًا يتطلب أولًا تحديد الظروف التي صِيغت فيها تلك التوقعات والمعايير التي يُفترض القياس عليها.',
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
          date: 'غير محدد',
          note: 'تتباين التغطيات في تناول هذا الموضوع؛ يُنصح بمراجعة مصادر متنوعة للحصول على الصورة الكاملة.',
          strength: 'medium'
        },
        {
          sourceType: 'unknown',
          title: 'مصادر أولية غير مرفقة في النص',
          publisher: 'غير محدد',
          date: 'غير محدد',
          note: 'غياب المصدر الأصلي يجعل التقرير محدودًا ويزيد الحاجة إلى التحقق قبل تبني أي رواية.',
          strength: 'missing'
        }
      ],
      uncertaintyNotes: [
        'لم تُقدَّم مصادر أولية في النص، مما يُصعّب التحقق المستقل من المعلومات الواردة.',
        'قد تتغير قوة الحجة إذا توفرت وثائق أو تصريحات أصلية من الأطراف المعنية.'
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
        date: 'Unspecified',
        note: 'Multiple news organizations have covered this topic from different angles. Cross-referencing primary documents directly is recommended.',
        strength: 'medium'
      },
      {
        sourceType: 'unknown',
        title: 'Primary source not included in input',
        publisher: 'Unknown',
        date: 'Unspecified',
        note: 'The absence of primary material limits the report and increases the need for verification.',
        strength: 'missing'
      }
    ],
    uncertaintyNotes: [
      'No primary sources were included in the input, limiting independent structural verification.',
      'The strength of the counter-position may change if original documents or statements are provided.'
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
    const footballGoat = isFootballGoatClaim(text);

    const searchQuery = footballGoat
      ? (isArabic
        ? 'ليونيل ميسي بيليه مارادونا كريستيانو رونالدو الأفضل في التاريخ كأس العالم الكرة الذهبية دوري أبطال أوروبا'
        : 'Lionel Messi Pele Maradona Cristiano Ronaldo greatest footballer World Cup Ballon d Or Champions League')
      : (isArabic
        ? `${text.substring(0, 150)} تحليل مراجع`
        : `${text.substring(0, 150)} analysis sources perspectives`);
    const evidence = await searchEvidenceForReport({
      text,
      isArabic,
      englishQuery: footballGoat
        ? 'Lionel Messi Pele Maradona Cristiano Ronaldo FIFA UEFA official records World Cup Champions League'
        : `${text.substring(0, 150)} official English source evidence`,
      arabicQuery: searchQuery,
    });
    const searchContext = formatEvidenceContext(evidence, isArabic);

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
      quick: isArabic ? 'Mode: QUICK. Write at least 3 focused Arabic paragraphs in otherSideStory and include at least 2 source notes.' : 'Mode: QUICK. Write at least 3 focused paragraphs and include at least 2 source notes.',
      deep: isArabic ? 'Mode: DEEP. Write 4 Arabic paragraphs covering position, evidence, named actors, and timeline.' : 'Mode: DEEP. Write 4 paragraphs covering position, evidence, named actors, and timeline.',
      history: isArabic ? 'Mode: HISTORY MIRROR. Focus on omitted voices and historical context, written in Arabic.' : 'Mode: HISTORY MIRROR. Focus on omitted voices and historical context.',
    };

    const strictnessInstr: Record<string, string> = {
      strict: isArabic ? 'Source strictness: strict. If a source is uncertain, mark its strength as missing.' : 'Source strictness: strict. If a source is uncertain, mark its strength as missing.',
      reasoned: isArabic ? 'Source strictness: reasoned. Separate evidence from inference clearly.' : 'Source strictness: reasoned. Separate evidence from inference clearly.',
      balanced: isArabic ? 'Source strictness: balanced. Combine evidence with careful reasoning and mark uncertainty.' : 'Source strictness: balanced. Combine evidence with careful reasoning and mark uncertainty.',
    };

    const userPrompt = `${modeInstr[mode] || modeInstr.quick}
${strictnessInstr[sourceStrictness] || strictnessInstr.balanced}
${langInstruction}
${subjectiveGuidance}
${searchContext}

${isArabic ? 'Text to analyze. Respond with Arabic values only:' : 'INPUT TO ANALYZE:'}
${text}

Return one JSON object only.`;

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

    const firstCheck = isValidReport(report, isArabic);
    console.log('[generate] first call demoMode:', firstResult.demoMode, '| validity:', firstCheck.reason,
      '| story_len:', report?.otherSideStory?.length, '| counter_len:', report?.strongestCounterArgument?.length,
      '| arabic_ratio:', report?.otherSideStory ? arabicRatio(report.otherSideStory).toFixed(2) : 'n/a');

    if (isArabic && !firstResult.demoMode && !firstCheck.ok) {
      const retryPrompt = `${langInstruction}
${subjectiveGuidance}
${searchContext}

The previous result had an issue: ${firstCheck.reason}. Regenerate from the original text. Keep JSON keys exactly as required. Write all user-facing values in formal Arabic. Produce substantive paragraphs in otherSideStory, at least 1 source note, and no conversational phrases.

Original text:
${text}

Return valid JSON only using the required schema.`;

      const retryResult = await aiProvider.generateJSON<OtherSideReport>({
        system: SYSTEM_PROMPT,
        prompt: retryPrompt,
        timeoutMs: 18000,
      });

      const retryCheck = isValidReport(retryResult.data, true);
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

    const finalCheck = isValidReport(report, isArabic);
    if (demoMode || !finalCheck.ok) {
      console.log('[generate] falling to demo mode. reason:', demoReason || finalCheck.reason);
      report = getMockReport(text, isArabic);
      demoMode = true;
      demoReason = demoReason || finalCheck.reason;
    } else if (evidence.all.length > 0 && report.sourceNotes) {
      // The model passed the quality gate AND we supplied real search
      // evidence. Guard against fabricated links: any sourceNote URL not
      // present in that evidence is dropped and downgraded to "missing".
      // (Skipped when search is disabled, since then citations legitimately
      // come from the model's training data and we have nothing to verify against.)
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
    if (report.sourceNotes) report.sourceNotes = report.sourceNotes.map((s) => ({
      ...s,
      note: rewrite(s.note),
      title: s.title ? rewrite(s.title) : s.title,
    }));

    return NextResponse.json({ report, demoMode, demoReason });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || 'Internal error' }, { status: 500 });
  }
}
