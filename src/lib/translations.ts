export type Lang = 'en' | 'ar';

export interface Translations {
  // Nav
  nav_brand: string;
  nav_neutrality_policy: string;
  nav_examples: string;
  nav_workspace: string;
  // Hero
  hero_badge: string;
  hero_title: string;
  hero_title_italic: string;
  hero_title_end: string;
  hero_desc: string;
  hero_disclaimer: string;
  hero_neutrality_link: string;
  // Quick try form
  form_placeholder: string;
  form_submit: string;
  form_sample_openai: string;
  form_sample_galileo: string;
  form_sample_apple: string;
  // Landing pillars
  pillars_header: string;
  pillars_title: string;
  pillar_quick_title: string;
  pillar_quick_desc: string;
  pillar_deep_title: string;
  pillar_deep_desc: string;
  pillar_history_title: string;
  pillar_history_desc: string;
  // Process
  process_header: string;
  process_s1_num: string;
  process_s1_title: string;
  process_s1_desc: string;
  process_s2_num: string;
  process_s2_title: string;
  process_s2_desc: string;
  process_s3_num: string;
  process_s3_title: string;
  process_s3_desc: string;
  // Footer
  footer_copy: string;
  // App workspace
  workspace_title: string;
  workspace_subtitle: string;
  workspace_advanced: string;
  workspace_advanced_hide: string;
  workspace_strictness_label: string;
  workspace_balanced: string;
  workspace_strict: string;
  workspace_lenient: string;
  workspace_strict_desc: string;
  workspace_balanced_desc: string;
  workspace_lenient_desc: string;
  workspace_loading: string;
  workspace_error_prefix: string;
  workspace_report_label: string;
  workspace_share: string;
  workspace_copied: string;
  workspace_footer: string;
  // Story input
  input_placeholder: string;
  input_disclaimer: string;
  input_submit: string;
  input_analyzing: string;
  input_clear: string;
  // Mode selector
  mode_quick_label: string;
  mode_quick_desc: string;
  mode_deep_label: string;
  mode_deep_desc: string;
  mode_history_label: string;
  mode_history_desc: string;
  // Report
  report_demo_title: string;
  report_demo_body_prefix: string;
  report_demo_env_key1: string;
  report_demo_env_key2: string;
  report_demo_body_suffix: string;
  report_title: string;
  report_id_prefix: string;
  report_classification: string;
  report_detected_narrative: string;
  report_main_party: string;
  report_other_party: string;
  report_other_side_title: string;
  report_strongest_counter_title: string;
  report_agreement_title: string;
  report_uncertainty_title: string;
  report_policy_note_title: string;
  // Neutrality badge
  badge_neutral: string;
  // Evidence strip
  evidence_title: string;
  // Disputed points
  disputed_title: string;
  // Demo panel
  demo_panel_header: string;
  demo_select_arrow: string;
  demo_openai_title: string;
  demo_openai_category: string;
  demo_openai_claim: string;
  demo_galileo_title: string;
  demo_galileo_category: string;
  demo_galileo_claim: string;
  demo_apple_title: string;
  demo_apple_category: string;
  demo_apple_claim: string;
  // Examples page
  examples_title: string;
  examples_desc: string;
  examples_ex1_label: string;
  examples_ex2_label: string;
  examples_ex3_label: string;
  examples_cta_q: string;
  examples_cta_btn: string;
  // About page
  about_title: string;
  about_updated: string;
  about_s1_title: string;
  about_s1_body: string;
  about_s2_title: string;
  about_s2_body: string;
  about_s3_title: string;
  about_s3_body: string;
  about_s4_title: string;
  about_s4_body: string;
  about_strong_label: string;
  about_strong_desc: string;
  about_medium_label: string;
  about_medium_desc: string;
  about_weak_label: string;
  about_weak_desc: string;
  about_disclaimer_title: string;
  about_disclaimer_body: string;
  about_launch_btn: string;
  // Export
  report_export_pdf: string;
  report_export_png: string;
  // New report sections
  report_logical_leaps_title: string;
  report_evidence_gaps_title: string;
  report_source_by: string;
  // Language toggle
  lang_switch: string;
}

const en: Translations = {
  nav_brand: 'OtherSide AI',
  nav_neutrality_policy: 'Neutrality Policy',
  nav_examples: 'Examples',
  nav_workspace: 'Workspace',
  hero_badge: 'Intelligence Desk MVP',
  hero_title: 'Every story has ',
  hero_title_italic: 'another',
  hero_title_end: ' side.',
  hero_desc: 'Paste a claim, article, tweet, or historical narrative. OtherSide AI shows the counter-story and supporting references without giving a verdict.',
  hero_disclaimer: 'No judgment. No winner. No moral lecture. Just the missing perspective.',
  hero_neutrality_link: 'Neutrality Policy →',
  form_placeholder: 'Paste a claim, article excerpt, or headline…',
  form_submit: 'Show the other side',
  form_sample_openai: 'OpenAI vs Elon',
  form_sample_galileo: 'Galileo Trial',
  form_sample_apple: 'Apple vs Epic',
  pillars_header: 'Guiding Frameworks',
  pillars_title: 'Three perspectives of analysis',
  pillar_quick_title: 'Quick Counter',
  pillar_quick_desc: 'Immediate context summary. Designed to provide instant access to the core alternative claims and arguments without wading through deep documentation.',
  pillar_deep_title: 'Deep Dispute',
  pillar_deep_desc: 'Exhaustive dispute mapping. Generates a breakdown of the debate timeline, point-by-point disagreements, and source-backed official responses.',
  pillar_history_title: 'History Mirror',
  pillar_history_desc: 'Perspective alignment tool. Re-contextualizes historical narratives by evaluating marginalized or unexamined historical actors and primary documents.',
  process_header: 'The Process',
  process_s1_num: '01 / SUBMIT',
  process_s1_title: 'Paste one side',
  process_s1_desc: 'Input any statement, article snippet, or news excerpt.',
  process_s2_num: '02 / DETECT',
  process_s2_title: 'Identify parties',
  process_s2_desc: 'The AI parses claims, identifying core organizations and alternative parties.',
  process_s3_num: '03 / CONSTRUCT',
  process_s3_title: 'Guarded Mirror',
  process_s3_desc: 'A neutrality-guarded counter-story is outputted with evaluated citations.',
  footer_copy: 'OtherSide AI © 2026. Non-partisan and objective by design.',
  workspace_title: 'Research Workspace',
  workspace_subtitle: 'ENTER AN INCOMING CLAIM TO START THE EXTRACTION',
  workspace_advanced: 'Advanced settings',
  workspace_advanced_hide: 'Hide settings',
  workspace_strictness_label: 'Source strictness:',
  workspace_balanced: 'balanced',
  workspace_strict: 'strict',
  workspace_lenient: 'lenient',
  workspace_strict_desc: 'Primary sources only — inferred claims are flagged.',
  workspace_balanced_desc: 'Mix of primary sources and reputable reporting.',
  workspace_lenient_desc: 'Accepts inferred and circumstantial evidence.',
  workspace_loading: 'COMPILING SOURCE INDEXES AND REWRITING PERSPECTIVES...',
  workspace_error_prefix: 'Error:',
  workspace_report_label: 'Generated Analysis Report',
  workspace_share: 'Share',
  workspace_copied: 'Link copied',
  workspace_footer: 'OtherSide AI © 2026. All source notes strictly guarded for linguistic neutrality.',
  input_placeholder: 'Paste an article excerpt, tweet, legal claim, historical account, or argument...',
  input_disclaimer: 'Presenting missing perspectives only.',
  input_submit: 'Generate Case Brief',
  input_analyzing: 'Analyzing...',
  input_clear: 'Clear',
  mode_quick_label: 'Quick Counter',
  mode_quick_desc: 'Fast summary of the core alternative argument — no timeline, just the key counter-claim.',
  mode_deep_label: 'Deep Dispute',
  mode_deep_desc: 'Full breakdown with timeline, point-by-point disagreements, and source-backed responses.',
  mode_history_label: 'History Mirror',
  mode_history_desc: 'For historical disputes — surfaces omitted actors, marginalized voices, and primary documents.',
  report_demo_title: 'Sample Report — No AI provider connected.',
  report_demo_body_prefix: 'This output is a pre-written example, not a live analysis. To generate real reports, configure',
  report_demo_env_key1: 'AI_API_BASE_URL',
  report_demo_env_key2: 'OPENAI_API_KEY',
  report_demo_body_suffix: 'in your environment.',
  report_title: 'Intelligence Brief: The Counter-Position',
  report_id_prefix: 'Report ID:',
  report_classification: 'Classification: PUBLIC / NON-PARTISAN',
  report_detected_narrative: 'Detected Narrative',
  report_main_party: 'Main party:',
  report_other_party: 'Other party:',
  report_other_side_title: "The Other Side's Narrative",
  report_strongest_counter_title: 'Strongest Counter-Argument',
  report_agreement_title: 'Points of Agreement',
  report_uncertainty_title: 'Areas of Uncertainty',
  report_policy_note_title: 'Policy Note',
  badge_neutral: 'Neutral Position Guarded',
  evidence_title: 'Checked Reference Sources',
  disputed_title: 'Disputed Points',
  demo_panel_header: 'Or select a seeded research claim',
  demo_select_arrow: 'Select →',
  demo_openai_title: 'OpenAI vs Elon Musk',
  demo_openai_category: 'Corporate Dispute',
  demo_openai_claim: 'Elon Musk says OpenAI betrayed its original nonprofit mission and became too close to Microsoft.',
  demo_galileo_title: 'Galileo Trial (1633)',
  demo_galileo_category: 'Historical Narrative',
  demo_galileo_claim: 'The Catholic Inquisition forced Galileo Galilei to recant his heliocentric view, declaring it contrary to holy scripture.',
  demo_apple_title: 'Apple vs Epic Games',
  demo_apple_category: 'Antitrust Dispute',
  demo_apple_claim: 'Epic Games accuses Apple of maintaining an illegal monopoly by charging a 30% commission on the iOS App Store.',
  examples_title: 'Sample Reports',
  examples_desc: 'Pre-written examples showing how OtherSide AI structures a counter-position report. These are not live AI outputs — they demonstrate the report format.',
  examples_ex1_label: 'Example 1: The OpenAI Restructuring Dispute',
  examples_ex2_label: 'Example 2: The Galileo Trial (1633)',
  examples_ex3_label: 'Example 3: Apple vs Epic Games — App Store Antitrust',
  examples_cta_q: 'Ready to analyze your own claim?',
  examples_cta_btn: 'Open the Workspace',
  about_title: 'Neutrality Policy',
  about_updated: 'Last Updated: June 2026',
  about_s1_title: '1. Absolute Lack of Verdicts',
  about_s1_body: 'OtherSide AI does not arbitrate disputes, determine absolute correctness, or issue verdicts. We reject the binary categorization of complex matters. Our software is built solely to present the counter-perspective of a submitted narrative.',
  about_s2_title: '2. Counter-Narrative Presentation',
  about_s2_body: 'Every public dispute contains overlooked context, differences in foundational assumptions, and varying interpretations of facts. Our goal is to synthesize the strongest possible fair version of that alternative perspective so users can read the dispute with balanced context.',
  about_s3_title: '3. Guarded Language Policy',
  about_s3_body: 'To ensure impartiality, all generated summaries pass through a static Neutrality Guard. Words implying moral absolutes, outright deception, or absolute correctness are replaced with conditional, objective phrases (e.g., "appears to claim", "disputes this representation").',
  about_s4_title: '4. Transparency of Citations',
  about_s4_body: 'We prioritize primary sources (official organization statements, court filings, direct transcripts) over secondary reporting. Each source is evaluated and labelled by strength:',
  about_strong_label: 'Strong:',
  about_strong_desc: 'Direct, unfiltered evidence (e.g. court motions, official press releases).',
  about_medium_label: 'Medium:',
  about_medium_desc: 'Balanced journalistic reporting, regulatory context.',
  about_weak_label: 'Weak:',
  about_weak_desc: 'Unverified public claims, opinion blogs, indirect comments.',
  about_disclaimer_title: 'Disclaimer Note:',
  about_disclaimer_body: 'OtherSide AI is designed as a neutral reference synthesis engine. It does not replace independent legal, financial, or primary academic research. Use responsibly.',
  about_launch_btn: 'Launch workspace',
  report_export_pdf: 'Save as PDF',
  report_export_png: 'Save as Image',
  report_logical_leaps_title: 'Unstated Assumptions',
  report_evidence_gaps_title: 'Key Evidence Gaps',
  report_source_by: 'by',
  lang_switch: 'العربية',
};

const ar: Translations = {
  nav_brand: 'الجانب الآخر',
  nav_neutrality_policy: 'سياسة الحياد',
  nav_examples: 'أمثلة',
  nav_workspace: 'ابدأ التحليل',
  hero_badge: 'الجانب الآخر',
  hero_title: 'لكل رأي ',
  hero_title_italic: 'جانب آخر',
  hero_title_end: '.',
  hero_desc: 'الصق خبراً أو تغريدة أو رأياً — وسنريك الصورة الكاملة. الموقف المقابل مع المصادر، بدون أحكام.',
  hero_disclaimer: 'ما نقوله هنا لا يُحكم على أحد. فقط ما لم تسمعه.',
  hero_neutrality_link: '← سياسة الحياد',
  form_placeholder: 'الصق خبراً أو تغريدة أو رأياً...',
  form_submit: 'أرني الجانب الآخر',
  form_sample_openai: 'أوبن إيه آي وإيلون',
  form_sample_galileo: 'محاكمة غاليليو',
  form_sample_apple: 'آبل وإيبيك',
  pillars_header: 'أساليب التحليل',
  pillars_title: 'ثلاث طرق لرؤية القضية',
  pillar_quick_title: 'رد سريع',
  pillar_quick_desc: 'في دقيقة واحدة — ملخص الموقف المقابل والحجج التي لم تسمعها، بدون تفاصيل طويلة.',
  pillar_deep_title: 'تحليل معمق',
  pillar_deep_desc: 'تفصيل كامل: التسلسل الزمني، نقاط الخلاف واحدة بواحدة، والردود الرسمية الموثقة.',
  pillar_history_title: 'مرآة التاريخ',
  pillar_history_desc: 'للقضايا التاريخية — يكشف الأطراف المنسية والأصوات المهمشة والوثائق الأصلية.',
  process_header: 'كيف يعمل الموقع',
  process_s1_num: '١ / أضف',
  process_s1_title: 'أضف ما تقرأ',
  process_s1_desc: 'أي خبر أو رأي أو مقتطف — من أي مكان.',
  process_s2_num: '٢ / تحليل',
  process_s2_title: 'نحلل الأطراف',
  process_s2_desc: 'الذكاء الاصطناعي يحدد من يقول ماذا، ومن غاب عن القصة.',
  process_s3_num: '٣ / النتيجة',
  process_s3_title: 'الصورة كاملة',
  process_s3_desc: 'تقرير محايد يعرض الموقف المقابل مع تقييم المصادر.',
  footer_copy: '© ٢٠٢٦ الجانب الآخر. محايد بالتصميم.',
  workspace_title: 'ابدأ التحليل',
  workspace_subtitle: 'أضف ما تريد فهمه من زاوية أخرى',
  workspace_advanced: 'إعدادات إضافية',
  workspace_advanced_hide: 'إخفاء الإعدادات',
  workspace_strictness_label: 'نوع المصادر:',
  workspace_balanced: 'متوازن',
  workspace_strict: 'صارم',
  workspace_lenient: 'متساهل',
  workspace_strict_desc: 'المصادر الأولية فقط — وثائق ووتصريحات رسمية.',
  workspace_balanced_desc: 'مزيج من المصادر الأولية والتقارير الموثوقة.',
  workspace_lenient_desc: 'يشمل الأدلة الظرفية والمستنتجة.',
  workspace_loading: 'نجمع المصادر ونبني الصورة المقابلة...',
  workspace_error_prefix: 'حدث خطأ:',
  workspace_report_label: 'تقرير التحليل',
  workspace_share: 'مشاركة',
  workspace_copied: 'تم نسخ الرابط',
  workspace_footer: '© ٢٠٢٦ الجانب الآخر. جميع المصادر مراجعة بعناية.',
  input_placeholder: 'الصق خبراً أو تغريدة أو رأياً أو أي شيء تريد فهمه من زاوية أخرى...',
  input_disclaimer: 'نعرض ما غاب، لا نصدر أحكاماً.',
  input_submit: 'أرني الجانب الآخر',
  input_analyzing: 'جاري التحليل...',
  input_clear: 'مسح',
  mode_quick_label: 'رد سريع',
  mode_quick_desc: 'ملخص مختصر للموقف المقابل — بدون تفاصيل زائدة، فقط الحجة الأساسية.',
  mode_deep_label: 'تحليل معمق',
  mode_deep_desc: 'تفصيل كامل مع السياق والتسلسل الزمني وردود الأطراف الموثقة.',
  mode_history_label: 'مرآة التاريخ',
  mode_history_desc: 'للقضايا التاريخية — يكشف الأطراف المغيّبة والوثائق الأصلية.',
  report_demo_title: 'مثال توضيحي — لا يوجد مزود ذكاء اصطناعي.',
  report_demo_body_prefix: 'هذا التقرير مثال مكتوب مسبقاً وليس تحليلاً حقيقياً. لتفعيل التحليل الفعلي، أضف',
  report_demo_env_key1: 'AI_API_BASE_URL',
  report_demo_env_key2: 'OPENAI_API_KEY',
  report_demo_body_suffix: 'في إعدادات البيئة.',
  report_title: 'تقرير: الجانب الآخر',
  report_id_prefix: 'رقم التقرير:',
  report_classification: 'عام · غير حزبي',
  report_detected_narrative: 'الرواية المُدخلة',
  report_main_party: 'الطرف الأول:',
  report_other_party: 'الطرف الآخر:',
  report_other_side_title: 'ماذا يقول الطرف الآخر',
  report_strongest_counter_title: 'أقوى حجة مقابلة',
  report_agreement_title: 'ما يتفق عليه الطرفان',
  report_uncertainty_title: 'نقاط غير مؤكدة',
  report_policy_note_title: 'ملاحظة الحياد',
  badge_neutral: 'تقرير محايد',
  evidence_title: 'المصادر والمراجع',
  disputed_title: 'نقاط الخلاف',
  demo_panel_header: 'أو اختر مثالاً جاهزاً',
  demo_select_arrow: '← اختر',
  demo_openai_title: 'أوبن إيه آي وإيلون ماسك',
  demo_openai_category: 'نزاع تجاري',
  demo_openai_claim: 'يقول إيلون ماسك إن أوبن إيه آي خانت رسالتها وانحازت لمايكروسوفت على حساب المصلحة العامة.',
  demo_galileo_title: 'محاكمة غاليليو ١٦٣٣',
  demo_galileo_category: 'حدث تاريخي',
  demo_galileo_claim: 'أجبرت محاكم التفتيش الكاثوليكية غاليليو على التراجع عن نظرية مركزية الشمس بحجة تعارضها مع الكتاب المقدس.',
  demo_apple_title: 'آبل وإيبيك غيمز',
  demo_apple_category: 'نزاع احتكاري',
  demo_apple_claim: 'تتهم إيبيك غيمز آبل باحتكار متجر التطبيقات وفرض عمولة ٣٠٪ بشكل غير عادل على المطورين.',
  examples_title: 'أمثلة على التقارير',
  examples_desc: 'أمثلة مكتوبة مسبقاً توضح شكل التقرير. هذه ليست نتائج حقيقية من الذكاء الاصطناعي — فقط للتوضيح.',
  examples_ex1_label: 'مثال ١: نزاع أوبن إيه آي',
  examples_ex2_label: 'مثال ٢: محاكمة غاليليو ١٦٣٣',
  examples_ex3_label: 'مثال ٣: آبل ضد إيبيك غيمز',
  examples_cta_q: 'جاهز لتحليل قضيتك؟',
  examples_cta_btn: 'ابدأ الآن',
  about_title: 'سياسة الحياد',
  about_updated: 'آخر تحديث: يونيو ٢٠٢٦',
  about_s1_title: '١. لا أحكام على أحد',
  about_s1_body: 'الجانب الآخر لا يحكم على أحد ولا يقرر من المصيب ومن المخطئ. نرفض اختزال القضايا المعقدة في موقف واحد. هدفنا الوحيد هو إظهار ما غاب من الصورة.',
  about_s2_title: '٢. نعرض ما لم تسمعه',
  about_s2_body: 'كل نزاع فيه سياق مُغفل، وافتراضات مختلفة، وتفسيرات متعددة لنفس الأحداث. هدفنا بناء أقوى نسخة ممكنة من الموقف المقابل حتى تقرأ القضية كاملة.',
  about_s3_title: '٣. لغة حذرة دائماً',
  about_s3_body: 'كل النصوص تمر عبر "حارس الحياد" — فلتر يستبدل الكلمات القاطعة أو المتهمة بعبارات أكثر دقة مثل "يبدو أن..." و"يُحتمل أن يقول...".',
  about_s4_title: '٤. مصادر موثقة وشفافة',
  about_s4_body: 'نُقدّم المصادر الأولية — وثائق رسمية وملفات محاكم وتصريحات مباشرة — على التقارير الإعلامية. كل مصدر مُصنَّف حسب قوته:',
  about_strong_label: 'قوي:',
  about_strong_desc: 'وثائق مباشرة لا تحتاج وسيطاً — ملفات محاكم، بيانات رسمية.',
  about_medium_label: 'متوسط:',
  about_medium_desc: 'تقارير صحفية موثوقة أو سياق تنظيمي.',
  about_weak_label: 'ضعيف:',
  about_weak_desc: 'ادعاءات غير مؤكدة، مدونات رأي، أو تعليقات غير مباشرة.',
  about_disclaimer_title: 'تنبيه:',
  about_disclaimer_body: 'الجانب الآخر أداة مرجعية محايدة، لا تغني عن الاستشارة القانونية أو البحث الأكاديمي المتخصص. استخدم بوعي.',
  about_launch_btn: 'جرّب الآن',
  report_export_pdf: 'تصدير PDF',
  report_export_png: 'تصدير صورة',
  report_logical_leaps_title: 'افتراضات غير مُعلنة',
  report_evidence_gaps_title: 'أدلة مفقودة مهمة',
  report_source_by: 'بقلم',
  lang_switch: 'English',
};

export const translations: Record<Lang, Translations> = { en, ar };
