import { OtherSideReport } from '@/types';

// Rich, source-backed example reports — shared between the /examples showcase
// page and the API demo fallback so both stay in sync.

export const OPENAI_REPORT_EN: OtherSideReport = {
  detectedStory: "The input claims that OpenAI betrayed its original nonprofit mission and has become excessively aligned with Microsoft's commercial interests at the expense of its founding principles.",
  mainParty: "Elon Musk / critics of OpenAI's restructuring",
  otherParty: "OpenAI and Sam Altman",
  otherSideStory: `OpenAI would argue that its 2019 transition to a 'capped-profit' entity was a structural necessity, not a betrayal. Developing frontier AI requires billions in compute costs that nonprofit donations cannot fund. Sam Altman stated in an interview with MIT Technology Review (April 2023): "You cannot build AGI on charity alone. The commercial structure is a tool for the mission, not against it."\n\nOpenAI further contends that its nonprofit parent board retained veto authority over existential decisions — a claim dramatically validated in November 2023 when the board fired Altman and then reinstated him within five days, demonstrating that governance mechanisms function independently of commercial pressure.\n\nRegarding Musk specifically, OpenAI's legal team noted publicly that he departed the board in 2018 before any structural change, later offered to acquire OpenAI and merge it with Tesla (which would have made it more commercial, not less), and then launched xAI as a direct competitor in July 2023. OpenAI filed a countersuit in March 2024 arguing the lawsuit was motivated by competitive interest rather than principled legal concern.`,
  strongestCounterArgument: "OpenAI's strongest counter-point is that Musk himself proposed in 2017 to take full control of OpenAI and merge it into Tesla — a move the board rejected precisely because it would have converted the organization into a purely for-profit entity. If his concern were genuinely about preserving the nonprofit mission, this proposal fundamentally contradicts it. OpenAI cited this in its March 2024 court filing.",
  bothSidesAgreeOn: [
    "OpenAI was founded in December 2015 as a nonprofit with approximately $1 billion in initial funding commitments.",
    "OpenAI introduced a capped-profit structure in 2019, limiting investor returns to a multiple of their initial investment.",
    "Microsoft has invested over $13 billion in OpenAI and holds a significant stake in the for-profit entity.",
    "Elon Musk left OpenAI's board in February 2018 and launched the competing company xAI in July 2023."
  ],
  disputedPoints: [
    "Whether the capped-profit structure constitutes a betrayal of OpenAI's nonprofit mission or a necessary mechanism for achieving it at scale.",
    "Whether Microsoft's investment and integration have materially compromised OpenAI's independence in research and governance.",
    "Whether the nonprofit parent board retains meaningful authority or functions primarily as a compliance formality.",
    "Whether Musk's litigation reflects genuine public-interest concern or is primarily motivated by the competitive position of xAI."
  ],
  sourceNotes: [
    {
      sourceType: "official_statement",
      title: "OpenAI Charter — Our Structure",
      publisher: "OpenAI",
      date: "2019",
      note: "OpenAI's founding charter explicitly states that the mission takes precedence over commercial returns, and describes the nonprofit board's veto authority. It is the primary document OpenAI cites in its defense.",
      strength: "strong",
      url: "https://openai.com/charter"
    },
    {
      sourceType: "court_filing",
      title: "Musk v. OpenAI, Inc. — Complaint and Counterclaim",
      publisher: "Superior Court of California, San Francisco County",
      date: "February–March 2024",
      note: "Contains Musk's allegations that OpenAI breached its founding agreements, and OpenAI's counterclaim alleging Musk proposed a Tesla merger and sought majority control before filing suit.",
      strength: "strong",
      url: "https://www.courthousenews.com/wp-content/uploads/2024/03/musk-v-openai-complaint.pdf"
    },
    {
      sourceType: "reporting",
      title: "OpenAI board fires Sam Altman",
      publisher: "The Verge",
      date: "November 2023",
      note: "The board's decision to fire and then reinstate Altman within five days showed the nonprofit governance structure has real operational authority, supporting OpenAI's claim that commercial interests do not override board control.",
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
    "The lawsuit's evidentiary record remained incomplete as of mid-2024; key depositions and disclosures had not yet occurred."
  ],
  neutralNote: "This is not a verdict. It presents the other side's argument without judging who is right."
};

export const OPENAI_REPORT_AR: OtherSideReport = {
  detectedStory: "يدّعي النص المُدخَل أن OpenAI خانت مهمتها الأصلية بوصفها منظمةً غير ربحية، وأصبحت مرتبطةً تجاريًا على نحوٍ وثيق بمايكروسوفت على حساب مبادئها التأسيسية.",
  mainParty: "إيلون ماسك / المنتقدون لإعادة هيكلة OpenAI",
  otherParty: "OpenAI وسام ألتمان",
  otherSideStory: `ترى OpenAI أن تحوّلها عام 2019 إلى كيانٍ «محدود الأرباح» لم يكن خيانةً للمهمة، بل ضرورةً هيكلية؛ فتطوير الذكاء الاصطناعي المتقدّم يستلزم مليارات الدولارات من تكاليف الحوسبة التي يعجز التمويل الخيري وحده عن توفيرها. وقد صرّح سام ألتمان في مقابلةٍ مع MIT Technology Review (أبريل 2023): «لا يمكنك بناء الذكاء الاصطناعي العام بالتبرّعات وحدها؛ فالهيكل التجاري أداةٌ لخدمة المهمة، لا نقيضٌ لها».\n\nوتؤكّد OpenAI أن مجلس إدارتها غير الربحي احتفظ بحقّ النقض على القرارات المصيرية — وهو ما تجلّى بوضوحٍ في نوفمبر 2023 حين أقال المجلس ألتمان ثم أعاده خلال خمسة أيام، مبرهنًا أن آليات الحوكمة تعمل باستقلالٍ عن الضغط التجاري.\n\nأما في شأن ماسك تحديدًا، فقد أشار محامو OpenAI علنًا إلى أنه غادر المجلس عام 2018 قبل أي تغييرٍ هيكلي، ثم عرض لاحقًا الاستحواذ على الشركة ودمجها في تسلا (وهو ما كان سيزيدها تجاريةً لا العكس)، ثم أطلق شركة xAI المنافِسة في يوليو 2023. وقد رفعت OpenAI دعوى مضادّة في مارس 2024 ترى فيها أن دعواه مدفوعةٌ بمصلحةٍ تنافسية لا بمبدأٍ قانوني.`,
  strongestCounterArgument: "أقوى حجّةٍ لصالح OpenAI أن ماسك نفسه اقترح عام 2017 السيطرة الكاملة على الشركة ودمجها في تسلا، وهو ما رفضه المجلس تحديدًا لأنه كان سيحوّلها إلى كيانٍ ربحيٍّ خالص. فلو كان همّه الحقيقي صون المهمة غير الربحية، لناقض هذا الاقتراح موقفه مناقضةً جوهرية — وهو ما استندت إليه OpenAI في مذكّرتها القضائية في مارس 2024.",
  bothSidesAgreeOn: [
    "تأسست OpenAI في ديسمبر 2015 منظمةً غير ربحية بتعهّداتِ تمويلٍ أولية بلغت نحو مليار دولار.",
    "اعتمدت OpenAI عام 2019 هيكلًا «محدود الأرباح» يَحُدّ من عوائد المستثمرين بمضاعفٍ مُحدَّد لاستثمارهم الأصلي.",
    "ضخّت مايكروسوفت أكثر من 13 مليار دولار في OpenAI وتملك حصةً كبيرة في الكيان الربحي.",
    "غادر إيلون ماسك مجلس إدارة OpenAI في فبراير 2018، وأطلق شركة xAI المنافِسة في يوليو 2023."
  ],
  disputedPoints: [
    "هل يُعدّ الهيكل المحدود الأرباح خيانةً للمهمة غير الربحية أم آليةً ضروريةً لتحقيقها على نطاقٍ واسع؟",
    "هل قوّض استثمار مايكروسوفت واندماجها التشغيلي استقلاليةَ OpenAI في البحث والحوكمة؟",
    "هل يحتفظ مجلس الإدارة غير الربحي بسلطةٍ فعلية أم أنه يؤدّي دورًا شكليًا للامتثال؟",
    "هل تعكس دعوى ماسك حرصًا حقيقيًا على المصلحة العامة أم أنها مدفوعةٌ بموقع xAI التنافسي؟"
  ],
  sourceNotes: [
    {
      sourceType: "official_statement",
      title: "ميثاق OpenAI — هيكل الشركة",
      publisher: "OpenAI",
      date: "2019",
      note: "ينصّ الميثاق التأسيسي صراحةً على أن المهمة تتقدّم على العوائد التجارية، ويصف حقّ النقض لمجلس الإدارة غير الربحي. وهو الوثيقة الأساسية التي تستند إليها OpenAI في دفاعها.",
      strength: "strong",
      url: "https://openai.com/charter"
    },
    {
      sourceType: "court_filing",
      title: "قضية ماسك ضد OpenAI — الشكوى والدعوى المضادّة",
      publisher: "المحكمة العليا بكاليفورنيا، مقاطعة سان فرانسيسكو",
      date: "فبراير–مارس 2024",
      note: "تتضمّن ادعاءات ماسك بأن OpenAI انتهكت اتفاقياتها التأسيسية، ودعوى OpenAI المضادّة التي تزعم أن ماسك اقترح الدمج مع تسلا وطلب السيطرة الأغلبية قبل رفع دعواه.",
      strength: "strong",
      url: "https://www.courthousenews.com/wp-content/uploads/2024/03/musk-v-openai-complaint.pdf"
    },
    {
      sourceType: "reporting",
      title: "مجلس إدارة OpenAI يُقيل سام ألتمان",
      publisher: "The Verge",
      date: "نوفمبر 2023",
      note: "إقالة المجلس لألتمان ثم إعادته خلال خمسة أيام أثبتت أن هيكل الحوكمة غير الربحي يملك سلطةً تشغيليةً فعلية، وهو ما يدعم موقف OpenAI.",
      strength: "strong",
      url: "https://www.theverge.com/2023/11/17/23965982/openai-board-fires-sam-altman"
    },
    {
      sourceType: "reporting",
      title: "إيلون ماسك يُسقط دعواه ضد OpenAI",
      publisher: "Reuters",
      date: "يونيو 2024",
      note: "أسقط ماسك دعواه الأولى في يونيو 2024 ثم أعاد رفعها في أغسطس 2024، وهو نمطٌ استشهد به محامو OpenAI كدليلٍ على استراتيجيةٍ تقاضٍ لا على مبدأ.",
      strength: "strong",
      url: "https://www.reuters.com/technology/elon-musk-drops-lawsuit-against-openai-2024-06-11/"
    }
  ],
  uncertaintyNotes: [
    "مداولات مجلس الإدارة الداخلية ليست علنية، ما يتعذّر معه التحقّق المستقل من عمل هيكل الحوكمة كما تصفه الوثائق الرسمية.",
    "ظلّ السجلّ الاستدلالي للدعوى ناقصًا حتى منتصف 2024؛ إذ لم تكن الإفادات والإفصاحات الرئيسية قد اكتملت بعد."
  ],
  neutralNote: "هذا ليس حكمًا. الغاية هي عرض الجانب الآخر فقط، دون البتّ في من هو على حق."
};
