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
    title: "الجانب الآخر AI",
    tagline: "لكل قصة جانب آخر.",
    desc: "أدخل أي ادعاء، مقال، تغريدة، أو رواية تاريخية. يعرض لك الذكاء الاصطناعي الجانب الآخر للقصة دون إصدار أحكام.",
    cta: "أظهر لي الجانب الآخر",
    neutralityPolicy: "سياسة الحياد",
    policyNote: "لا أحكام. لا رابح. لا مواعظ أخلاقية. فقط المنظور الغائب.",
    workspace: "مساحة العمل",
    examples: "أمثلة",
    about: "حول",
    home: "الرئيسية",
    policyTitle: "سياسة الحياد",
    policySubtitle: "آخر تحديث: يونيو 2026",
    backToHome: "العودة للرئيسية",
    launchWorkspace: "دخول مساحة العمل",
    quickCounter: "رد سريع",
    quickCounterDesc: "ملخص موجز لوجهات النظر البديلة.",
    deepDispute: "نزاع عميق",
    deepDisputeDesc: "تاريخ مفصل، وجدول زمني ومواقف رئيسية.",
    historyMirror: "مرآة التاريخ",
    historyMirrorDesc: "الإغفالات الروائية والحسابات الأساسية.",
    researchWorkspace: "مساحة عمل الأبحاث",
    workspaceDesc: "أدخل ادعاءً واردًا لبدء الاستخراج",
    strictnessFilter: "تصفية صرامة المصدر:",
    generateBrief: "إنشاء موجز الحالة",
    generating: "جاري التحليل...",
    compiling: "جاري تجميع فهارس المصادر وإعادة صياغة المنظور...",
    seededClaims: "أو اختر ادعاءً بحثيًا جاهزًا",
    select: "اختر ←",
    copyright: "الجانب الآخر AI © 2026. جميع ملاحظات المصادر محمية بدقة للحياد اللغوي.",
    neutralPositionGuarded: "موقف حيادي محمي",
    demoMode: "وضع العرض التوضيحي الاحتياطي",
    intelBrief: "موجز الاستخبارات: الموقف المقابل",
    detectedNarrative: "الرواية المكتشفة",
    mainParty: "الطرف الرئيسي",
    otherParty: "الطرف الآخر",
    otherSideStory: "رواية الجانب الآخر",
    strongestCounter: "أقوى حجة مضادة",
    pointsAgreement: "نقاط الاتفاق",
    disputedPoints: "النقاط المتنازع عليها",
    refSources: "المصادر المرجعية المفحوصة",
    uncertaintyAreas: "مناطق عدم اليقين",
    sourceStrength: "مصدر",
    policyText: "هذا ليس حكمًا. إنه يقدم حجة الجانب الآخر دون الحكم على من هو على حق.",
    disclaimerTitle: "ملاحظة إخلاء المسؤولية:",
    disclaimerText: "تم تصميم الجانب الآخر AI كمحرك توليد مرجعي محايد. ولا يغني عن الأبحاث الأكاديمية أو القانونية أو المالية المستقلة. استخدمه بمسؤولية.",
    caseStudiesTitle: "دراسات الحالة والأمثلة",
    caseStudiesSubtitle: "استكشف كيف يقوم الجانب الآخر AI بتحليل النزاعات المعقدة وتقديم تقارير منظمة وغير منحازة.",
    exampleOpenAI: "مثال 1: نزاع إعادة هيكلة OpenAI",
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
