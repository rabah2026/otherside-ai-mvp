'use client';

import React, { useRef, useState } from 'react';
import { OtherSideReport } from '@/types';
import NeutralityBadge from './NeutralityBadge';
import SourceStrengthBadge from './SourceStrengthBadge';
import { ChevronDown, ChevronUp, Scale, ShieldCheck, CheckCircle2, CircleDot, BookOpen, AlertCircle, Download, Image as ImageIcon, Link as LinkIcon } from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';

interface Props {
  report: OtherSideReport;
  demoMode: boolean;
  demoReason?: string | null;
}

const SOURCE_TYPE_LABELS: Record<string, { en: string; ar: string }> = {
  official_statement: { en: 'official statement', ar: 'بيان رسمي' },
  court_filing: { en: 'court filing', ar: 'ملف قضائي' },
  reporting: { en: 'reporting', ar: 'تقرير صحفي' },
  primary_source: { en: 'primary source', ar: 'مصدر أوّلي' },
  historical_record: { en: 'historical record', ar: 'سجل تاريخي' },
  unknown: { en: 'unknown', ar: 'غير محدّد' },
};

function sourceTypeLabel(type: string, lang: 'en' | 'ar'): string {
  const entry = SOURCE_TYPE_LABELS[type];
  if (entry) return lang === 'ar' ? entry.ar : entry.en;
  return type.replace(/_/g, ' ');
}

function Section({
  title,
  icon,
  children,
  defaultOpen = true,
  forceOpen = false,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  forceOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const isOpen = forceOpen || open;
  return (
    <div className="border-b border-neutral-100 dark:border-neutral-800/60 last:border-0">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-4 gap-3 group"
      >
        <span className="flex items-center gap-2 text-xs font-semibold tracking-wide text-neutral-500 dark:text-neutral-400 group-hover:text-neutral-800 dark:group-hover:text-neutral-200 transition-colors">
          {icon}
          {title}
        </span>
        {isOpen
          ? <ChevronUp className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />
          : <ChevronDown className="w-3.5 h-3.5 text-neutral-400 flex-shrink-0" />}
      </button>
      {isOpen && <div className="pb-5">{children}</div>}
    </div>
  );
}

export default function ReportBrief({ report, demoMode, demoReason }: Props) {
  const { t, lang } = useConfig();
  const briefRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  const [forceExpandAll, setForceExpandAll] = useState(false);
  const reportId = React.useMemo(
    () => `OB_${Math.random().toString(36).substring(2, 5).toUpperCase()}_${Math.random().toString(36).substring(2, 4).toUpperCase()}`,
    []
  );

  // Use html-to-image (SVG foreignObject) rather than html2canvas: the
  // browser itself rasterizes the node, so Arabic glyph shaping and RTL
  // ordering are preserved (html2canvas re-renders text and breaks both).
  const renderCanvas = async () => {
    const { toCanvas } = await import('html-to-image');
    return toCanvas(briefRef.current as HTMLDivElement, {
      pixelRatio: 2,
      backgroundColor: document.documentElement.classList.contains('dark') ? '#050508' : '#fcfcfd',
    });
  };

  const captureExpanded = async (): Promise<HTMLCanvasElement> => {
    setForceExpandAll(true);
    // Wait one frame for React to re-render all sections open before capturing.
    await new Promise<void>((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => resolve())));
    try {
      return await renderCanvas();
    } finally {
      setForceExpandAll(false);
    }
  };

  const handleExportPNG = async () => {
    if (!briefRef.current) return;
    setExporting(true);
    setExportError(null);
    try {
      const canvas = await captureExpanded();
      const link = document.createElement('a');
      link.download = `OtherSide-${reportId}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (e) {
      console.error('PNG export failed', e);
      setExportError(lang === 'ar' ? 'تعذّر تصدير الصورة. حاول مرة أخرى.' : 'PNG export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!briefRef.current) return;
    setExporting(true);
    setExportError(null);
    try {
      const jsPDF = (await import('jspdf')).default;
      const canvas = await captureExpanded();
      const w = canvas.width / 2;
      const h = canvas.height / 2;
      const pdf = new jsPDF({ orientation: 'p', unit: 'px', format: [w, h] });
      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, w, h);
      pdf.save(`OtherSide-${reportId}.pdf`);
    } catch (e) {
      console.error('PDF export failed', e);
      setExportError(lang === 'ar' ? 'تعذّر تصدير PDF. حاول مرة أخرى.' : 'PDF export failed. Please try again.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-3 max-w-3xl mx-auto">
      {/* Export controls */}
      <div className="flex gap-2 justify-end">
        <button
          onClick={handleExportPNG}
          disabled={exporting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors disabled:opacity-50"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          {lang === 'ar' ? 'تصدير صورة' : 'Export PNG'}
        </button>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-200 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-white transition-colors disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          {lang === 'ar' ? 'تصدير PDF' : 'Export PDF'}
        </button>
      </div>

      {exportError && (
        <p className={`text-[11px] text-rose-500 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
          {exportError}
        </p>
      )}

      {/* Main card */}
      <div
        ref={briefRef}
        className="rounded-2xl border border-neutral-200 dark:border-neutral-800/60 bg-white dark:bg-[#0d0d14] overflow-hidden"
      >
        {/* Demo mode banner */}
        {demoMode && (
          <div className="px-5 py-2.5 bg-amber-50 dark:bg-amber-950/30 border-b border-amber-200 dark:border-amber-800/40 flex items-start gap-2">
            <AlertCircle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
            <div className="text-[11px] text-amber-700 dark:text-amber-400 leading-snug">
              <span className="font-semibold">{lang === 'ar' ? 'نموذج تجريبي — ' : 'Demo Mode — '}</span>
              {lang === 'ar'
                ? 'لم يتمكن النظام من الاتصال بالذكاء الاصطناعي. تأكد من إعداد متغيرات البيئة في Vercel.'
                : 'Could not reach the AI. Check that environment variables are set in Vercel.'}
              {demoReason && (
                <span className="block mt-0.5 text-amber-500 dark:text-amber-600 font-mono text-[10px] truncate" title={demoReason}>
                  {demoReason}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Card header */}
        <div className="px-5 py-4 border-b border-neutral-100 dark:border-neutral-800/60 flex items-start justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <NeutralityBadge />
            </div>
          </div>
          <div className={`text-[10px] font-mono text-neutral-400 dark:text-neutral-500 space-y-0.5 flex-shrink-0 ${lang === 'ar' ? 'text-left' : 'text-right'}`}>
            <div>{lang === 'ar' ? 'رقم التقرير:' : 'Report ID:'} {reportId}</div>
            <div>{lang === 'ar' ? 'تقرير محايد' : 'PUBLIC / NON-PARTISAN'}</div>
          </div>
        </div>

        {/* Detected narrative — always open */}
        <div className="px-5 py-4 bg-neutral-50 dark:bg-neutral-900/30 border-b border-neutral-100 dark:border-neutral-800/60">
          <div className="text-[10px] uppercase font-bold tracking-widest text-neutral-400 dark:text-neutral-500 mb-2">
            {lang === 'ar' ? 'النص كما ورد' : 'Detected Narrative'}
          </div>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed italic mb-3">
            "{report.detectedStory}"
          </p>
          <div className="grid grid-cols-2 gap-3 text-xs pt-3 border-t border-neutral-200 dark:border-neutral-800/40">
            <div>
              <span className="text-neutral-400 dark:text-neutral-500">{lang === 'ar' ? 'الطرف الأول' : 'Main party'}: </span>
              <span className="text-neutral-800 dark:text-neutral-200 font-medium">{report.mainParty}</span>
            </div>
            <div>
              <span className="text-neutral-400 dark:text-neutral-500">{lang === 'ar' ? 'الطرف الآخر' : 'Other party'}: </span>
              <span className="text-neutral-800 dark:text-neutral-200 font-medium">{report.otherParty}</span>
            </div>
          </div>
        </div>

        {/* Accordion sections */}
        <div className="px-5 divide-y divide-neutral-100 dark:divide-neutral-800/60">

          <Section
            title={lang === 'ar' ? 'ماذا يقول الطرف الآخر؟' : "The Other Side's Narrative"}
            icon={<Scale className="w-3.5 h-3.5" />}
            forceOpen={forceExpandAll}
          >
            <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed font-serif">
              {report.otherSideStory}
            </p>
          </Section>

          <Section
            title={lang === 'ar' ? 'أقوى حجة مقابلة' : 'Strongest Counter-Argument'}
            icon={<ShieldCheck className="w-3.5 h-3.5" />}
            forceOpen={forceExpandAll}
          >
            <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
              {report.strongestCounterArgument}
            </p>
          </Section>

          {report.bothSidesAgreeOn && report.bothSidesAgreeOn.length > 0 && (
            <Section
              title={lang === 'ar' ? 'نقاط الاتفاق' : 'Points of Agreement'}
              icon={<CheckCircle2 className="w-3.5 h-3.5" />}
              defaultOpen={false}
              forceOpen={forceExpandAll}
            >
              <ul className="space-y-2">
                {report.bothSidesAgreeOn.map((pt, i) => (
                  <li key={i} className="flex gap-2.5 items-start text-sm text-neutral-700 dark:text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{pt}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {report.disputedPoints && report.disputedPoints.length > 0 && (
            <Section
              title={lang === 'ar' ? 'نقاط الخلاف' : 'Disputed Points'}
              icon={<CircleDot className="w-3.5 h-3.5" />}
              defaultOpen={false}
              forceOpen={forceExpandAll}
            >
              <ul className="space-y-2">
                {report.disputedPoints.map((pt, i) => (
                  <li key={i} className="flex gap-2.5 items-start text-sm text-neutral-700 dark:text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500/70 mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{pt}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {report.uncertaintyNotes && report.uncertaintyNotes.length > 0 && (
            <Section
              title={lang === 'ar' ? 'نقاط غير مؤكَّدة' : 'Areas of Uncertainty'}
              icon={<AlertCircle className="w-3.5 h-3.5" />}
              defaultOpen={false}
              forceOpen={forceExpandAll}
            >
              <ul className="space-y-2">
                {report.uncertaintyNotes.map((note, i) => (
                  <li key={i} className="flex gap-2.5 items-start text-sm text-neutral-700 dark:text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500/60 mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{note}</span>
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {report.sourceNotes && report.sourceNotes.length > 0 && (
            <Section
              title={lang === 'ar' ? 'المصادر والمراجع' : 'Sources & References'}
              icon={<BookOpen className="w-3.5 h-3.5" />}
              defaultOpen={false}
              forceOpen={forceExpandAll}
            >
              <div className="space-y-3">
                {report.sourceNotes.map((src, i) => (
                  <div key={i} className="rounded-xl border border-neutral-200 dark:border-neutral-800/50 bg-neutral-50 dark:bg-neutral-900/40 p-3.5 space-y-2">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] text-neutral-500 dark:text-neutral-400 font-medium uppercase tracking-wide">
                          {sourceTypeLabel(src.sourceType, lang)}
                        </span>
                        {(src.publisher || src.date) && (
                          <span className="text-[10px] text-neutral-400 dark:text-neutral-500 font-mono">
                            {[src.publisher, src.date].filter(Boolean).join(' · ')}
                          </span>
                        )}
                      </div>
                      <SourceStrengthBadge strength={src.strength} />
                    </div>
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 leading-relaxed">{src.note}</p>
                    {src.title && (
                      <div className="pt-1.5 border-t border-neutral-200 dark:border-neutral-800/40">
                        {src.url ? (
                          <a
                            href={src.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-200 transition-colors"
                          >
                            <LinkIcon className="w-2.5 h-2.5 opacity-60 flex-shrink-0" />
                            {src.title}
                          </a>
                        ) : (
                          <span className="text-[11px] text-neutral-500 italic">{src.title}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          )}
        </div>

        {/* Footer note */}
        <div className="px-5 py-3 border-t border-neutral-100 dark:border-neutral-800/60 text-[10px] text-neutral-400 dark:text-neutral-500 leading-relaxed">
          {report.neutralNote || t('policyText')}
        </div>
      </div>
    </div>
  );
}
