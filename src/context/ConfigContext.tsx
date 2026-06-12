'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';
type Theme = 'light' | 'dark';

interface ConfigContextProps {
  lang: Language;
  theme: Theme;
  setLang: (lang: Language) => void;
  setTheme: (theme: Theme) => void;
  t: (key: string) => any;
}

const translations: Record<Language, Record<string, any>> = {
  en: {
    title: "OtherSide AI",
    tagline: "Every story has another side.",
    desc: "Paste a claim, article, tweet, or historical narrative. OtherSide AI shows the other party's story without giving a verdict.",
    cta: "Show me the other side",
    neutralityPolicy: "Neutrality Policy",
    policyNote: "No judgment. No winner. No moral lecture. Just the missing perspective.",
    workspace: "Workspace",
    examples: "Examples",
    about: "About",
    home: "Home",
    policyTitle: "Neutrality Policy",
    policySubtitle: "Last Updated: June 2026",
    backToHome: "Back to Home",
    launchWorkspace: "Launch Workspace",
    quickCounter: "Quick Counter",
    quickCounterDesc: "Concise summary of alternative views.",
    deepDispute: "Deep Dispute",
    deepDisputeDesc: "Detailed history, timeline and key positions.",
    historyMirror: "History Mirror",
    historyMirrorDesc: "Narrative omissions and primary accounts.",
    researchWorkspace: "Research Workspace",
    workspaceDesc: "ENTER AN INCOMING CLAIM TO START THE EXTRACTION",
    strictnessFilter: "Source Strictness Filter:",
    generateBrief: "Generate Case Brief",
    generating: "Analyzing...",
    compiling: "COMPILING SOURCE INDEXES AND REWRITING PERSPECTIVES...",
    seededClaims: "Or select a seeded research claim",
    select: "Select →",
    copyright: "OtherSide AI © 2026. All source notes strictly guarded for linguistic neutrality.",
    neutralPositionGuarded: "Neutral Position Guarded",
    demoMode: "Demo Fallback Mode",
    intelBrief: "Intelligence Brief: The Counter-Position",
    detectedNarrative: "Detected Narrative",
    mainParty: "Main party",
    otherParty: "Other party",
    otherSideStory: "The Other Side's Narrative",
    strongestCounter: "Strongest Counter-Argument",
    pointsAgreement: "Points of Agreement",
    disputedPoints: "Disputed Points",
    refSources: "Checked Reference Sources",
    uncertaintyAreas: "Areas of Uncertainty",
    sourceStrength: "source",
    policyText: "This is not a verdict. It presents the other side's argument without judging who is right.",
    disclaimerTitle: "Disclaimer Note:",
    disclaimerText: "OtherSide AI is designed as a neutral reference synthesis engine. It does not replace independent legal, financial, or primary academic research. Use responsibly.",
    caseStudiesTitle: "Case Studies & Examples",
    caseStudiesSubtitle: "Explore how OtherSide AI dissects complex disputes and presents structured, non-judgmental reports.",
    exampleOpenAI: "Example 1: The OpenAI Restructuring Dispute",
  },
  ar: {
    title: "الجانب الآخر",
    tagline: "لكل رأي جانب آخر.",
    desc: "الصق ادعاءً أو مقالًا أو تغريدةً أو روايةً تاريخية، وسيعرض لك «الجانب الآخر» وجهة النظر المقابلة في أقوى صورها، مدعومةً بالمصادر، ودون إصدار أحكام.",
    cta: "أرِني الجانب الآخر",
    neutralityPolicy: "سياسة الحياد",
    policyNote: "لا أحكام، ولا رابح، ولا وعظ — فقط الجانب الغائب من الصورة.",
    workspace: "مساحة العمل",
    examples: "أمثلة",
    about: "عن الأداة",
    home: "الرئيسية",
    policyTitle: "سياسة الحياد",
    policySubtitle: "آخر تحديث: يونيو 2026",
    backToHome: "العودة إلى الرئيسية",
    launchWorkspace: "ابدأ التحليل",
    quickCounter: "ردّ سريع",
    quickCounterDesc: "في دقيقة واحدة — ملخّص الموقف المقابل وأبرز الحجج الغائبة عن الصورة.",
    deepDispute: "تحليل معمّق",
    deepDisputeDesc: "تفصيلٌ كامل: التسلسل الزمني، ونقاط الخلاف، والردود الرسمية الموثّقة.",
    historyMirror: "مرآة التاريخ",
    historyMirrorDesc: "للقضايا التاريخية — يكشف الأطراف المهمّشة والأصوات والوثائق الأصلية.",
    researchWorkspace: "مساحة التحليل",
    workspaceDesc: "أدخِل ادعاءً أو خبرًا لاستخلاص الجانب الآخر منه",
    strictnessFilter: "مستوى دقّة المصادر:",
    generateBrief: "أرِني الجانب الآخر",
    generating: "جارٍ التحليل...",
    compiling: "جارٍ تحليل الموقف وصياغة وجهة النظر المقابلة...",
    seededClaims: "أو اختر مثالًا جاهزًا",
    select: "اختر ←",
    copyright: "«الجانب الآخر» © 2026 — محايدٌ بطبيعته.",
    neutralPositionGuarded: "حياد مضمون",
    demoMode: "نموذج تجريبي",
    intelBrief: "تقرير الجانب الآخر",
    detectedNarrative: "النص كما ورد",
    mainParty: "الطرف الأول",
    otherParty: "الطرف الآخر",
    otherSideStory: "ماذا يقول الطرف الآخر؟",
    strongestCounter: "أقوى حجّة مقابلة",
    pointsAgreement: "نقاط الاتفاق",
    disputedPoints: "نقاط الخلاف",
    refSources: "المصادر والمراجع",
    uncertaintyAreas: "نقاط غير مؤكَّدة",
    sourceStrength: "مصدر",
    policyText: "هذا ليس حكمًا. الغاية هي عرض الجانب الآخر فقط، دون البتّ في من هو على حق.",
    disclaimerTitle: "تنبيه:",
    disclaimerText: "«الجانب الآخر» أداةٌ مرجعيةٌ محايدة، ولا تُغني عن الاستشارة القانونية أو الأكاديمية أو المالية المتخصصة. استخدمها بوعي.",
    caseStudiesTitle: "أمثلة وحالات دراسية",
    caseStudiesSubtitle: "اكتشف كيف يُحلّل «الجانب الآخر» قضايا حقيقية ويقدّم تقارير موضوعيةً ومنظّمة.",
    exampleOpenAI: "مثال: نزاع OpenAI وإيلون ماسك",
  }
};

const ConfigContext = createContext<ConfigContextProps | undefined>(undefined);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>('en');
  const [theme, setThemeState] = useState<Theme>('dark');

  // Load configuration from localstorage on mount
  useEffect(() => {
    const savedLang = localStorage.getItem('os-lang') as Language;
    const savedTheme = localStorage.getItem('os-theme') as Theme;
    if (savedLang) setLangState(savedLang);
    if (savedTheme) {
      setThemeState(savedTheme);
      if (savedTheme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    } else {
      setThemeState('dark');
      document.documentElement.classList.add('dark');
    }
  }, []);

  const setLang = (newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('os-lang', newLang);
  };

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    localStorage.setItem('os-theme', newTheme);
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const t = (key: string) => {
    return translations[lang][key] || key;
  };

  return (
    <ConfigContext.Provider value={{ lang, theme, setLang, setTheme, t }}>
      <div dir={lang === 'ar' ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </ConfigContext.Provider>
  );
}

export function useConfig() {
  const context = useContext(ConfigContext);
  if (!context) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
}
