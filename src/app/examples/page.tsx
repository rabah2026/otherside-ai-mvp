'use client';

import React from 'react';
import Link from 'next/link';
import ReportBrief from '@/components/ReportBrief';
import { OtherSideReport } from '@/types';
import { useConfig } from '@/context/ConfigContext';
import ThemeLangControls from '@/components/ThemeLangControls';

const OPENAI_MOCK_EN: OtherSideReport = {
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
    }
  ],
  uncertaintyNotes: [
    "This report relies on public legal arguments filed during litigation."
  ],
  neutralNote: "This is not a verdict. It presents the other side’s argument without judging who is right."
};

const OPENAI_MOCK_AR: OtherSideReport = {
  detectedStory: "تدعي القصة الملصقة أن OpenAI خانت مهمتها الأصلية غير الربحية وأصبحت متحالفة تجاريًا بشكل كبير مع مايكروسوفت.",
  mainParty: "إيلون ماسك / منتقدو إعادة هيكلة OpenAI",
  otherParty: "OpenAI وإدارتها",
  otherSideStory: "من جانب OpenAI، من المحتمل أن تجادل القصة المقابلة بأن تطوير الذكاء الاصطناعي العام يتطلب موارد حوسبة واسعة النطاق، وعملاً على السلامة، ورأس مال كبير. قد تجادل المنظمة بأن هيكلها الهادف للربح المحدود والشراكات الإستراتيجية تم إنشاؤها لجعل المهمة قابلة للتحقيق عمليًا على نطاق واسع، بدلاً من التخلي عنها.",
  strongestCounterArgument: "النسخة القوية من موقف OpenAI المقابل هي أن المهمة وهيكل التمويل لا يتعارضان تلقائيًا. من وجهة النظر هذه، كان الهيكل التجاري أداة لتمويل تطوير الذكاء الاصطناعي المتقدم، في حين ظل الحكم ولغة المهمة المعلنة تهدف إلى إبقاء المنظمة متماشية مع المنفعة العامة.",
  bothSidesAgreeOn: [
    "بدأت OpenAI بمهمة تركز على الذكاء الاصطناعي المفيد على نطاق واسع.",
    "تبنت OpenAI لاحقًا هيكلًا محدد الأرباح.",
    "أصبحت مايكروسوفت شريكًا ومستثمرًا رئيسيًا."
  ],
  disputedPoints: [
    "ما إذا كان التغيير الهيكلي خيانة أم ضرورة عملية.",
    "ما إذا كان دور مايكروسوفت قد قوض استقلال OpenAI.",
    "ما إذا كانت المهمة الأصلية لـ OpenAI قد ظلت قائمة بشكل ملموس."
  ],
  sourceNotes: [
    {
      sourceType: "official_statement",
      note: "ستكون البيانات الرسمية لـ OpenAI مهمة لمعرفة منطقها المعلن.",
      strength: "strong",
      title: "OpenAI: هيكلنا",
      url: "https://openai.com/blog/openai-lp"
    },
    {
      sourceType: "court_filing",
      note: "ستكون وثائق المحكمة مصادر قوية للمطالبات القانونية المقدمة من كل جانب.",
      strength: "strong",
      title: "شكوى المحكمة العليا في كاليفورنيا",
      url: "https://www.courthousenews.com/wp-content/uploads/2024/03/musk-v-openai-complaint.pdf"
    }
  ],
  uncertaintyNotes: [
    "يعتمد هذا التقرير على الحجج القانونية العامة المقدمة أثناء التقاضي."
  ],
  neutralNote: "هذا ليس حكمًا. إنه يقدم حجة الجانب الآخر دون الحكم على من هو على حق."
};

export default function Examples() {
  const { t, lang } = useConfig();
  const mockData = lang === 'ar' ? OPENAI_MOCK_AR : OPENAI_MOCK_EN;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 dark:bg-[#050508] dark:text-neutral-300 relative overflow-hidden transition-colors duration-300">
      <div className="glow-beam" />
      
      <div className="max-w-4xl mx-auto px-4 py-20 relative z-10 space-y-12">
        {/* Navigation */}
        <div className="flex justify-between items-center border-b border-neutral-200 dark:border-neutral-900 pb-6">
          <Link href="/" className="font-serif text-slate-900 dark:text-white hover:text-neutral-500 font-semibold tracking-wide">
            {t('title')}
          </Link>
          <div className="flex items-center gap-4">
            <div className="space-x-4 text-xs font-mono">
              <Link href="/app" className="hover:text-slate-900 dark:hover:text-white">{t('workspace')}</Link>
              <Link href="/about" className="hover:text-slate-900 dark:hover:text-white">{t('neutralityPolicy')}</Link>
            </div>
            <ThemeLangControls />
          </div>
        </div>

        {/* Title */}
        <div className="space-y-3 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-serif text-slate-900 dark:text-white tracking-tight">
            {t('caseStudiesTitle')}
          </h1>
          <p className="text-sm text-neutral-500 max-w-xl">
            {t('caseStudiesSubtitle')}
          </p>
        </div>

        {/* Example Render */}
        <div className="space-y-6">
          <div className="text-xs font-mono uppercase tracking-widest text-neutral-500 font-semibold border-b border-neutral-200 dark:border-neutral-900 pb-2">
            {t('exampleOpenAI')}
          </div>
          <ReportBrief report={mockData} demoMode={false} />
        </div>
      </div>
    </div>
  );
}
