import React, { useRef, useState } from 'react';
import { OtherSideReport } from '@/types';
import NeutralityBadge from './NeutralityBadge';
import EvidenceStrip from './EvidenceStrip';
import DisputedPoints from './DisputedPoints';
import { ShieldCheck, Scale, AlertCircle, FileText, CheckCircle2, Download, Image as ImageIcon } from 'lucide-react';
import { useConfig } from '@/context/ConfigContext';

interface Props {
  report: OtherSideReport;
  demoMode: boolean;
}

export default function ReportBrief({ report, demoMode }: Props) {
  const { t, lang } = useConfig();
  const briefRef = useRef<HTMLDivElement>(null);
  const [exporting, setExporting] = useState(false);
  const reportId = React.useMemo(() => `OB-${Math.random().toString(36).substring(2, 7).toUpperCase()}`, []);

  const handleExportPNG = async () => {
    if (!briefRef.current) return;
    setExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(briefRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#050508' : '#fcfcfd',
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `OtherSide-Brief-${reportId}.png`;
      link.href = dataUrl;
      link.click();
    } catch (e) {
      console.error('Failed to export PNG', e);
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = async () => {
    if (!briefRef.current) return;
    setExporting(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(briefRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#050508' : '#fcfcfd',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'px',
        format: [canvas.width / 2, canvas.height / 2],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save(`OtherSide-Brief-${reportId}.pdf`);
    } catch (e) {
      console.error('Failed to export PDF', e);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Export Action Controls */}
      <div className="flex gap-2 justify-end">
        <button
          onClick={handleExportPNG}
          disabled={exporting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'تصدير صورة' : 'Export PNG'}</span>
        </button>
        <button
          onClick={handleExportPDF}
          disabled={exporting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-neutral-300 dark:border-neutral-800 bg-white dark:bg-neutral-900 text-xs font-semibold text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors disabled:opacity-50"
        >
          <Download className="w-3.5 h-3.5" />
          <span>{lang === 'ar' ? 'تصدير PDF' : 'Export PDF'}</span>
        </button>
      </div>

      {/* Main Exportable Container */}
      <div
        ref={briefRef}
        className="glass-panel rounded-xl overflow-hidden border border-neutral-200 dark:border-neutral-800/60 p-6 sm:p-8 space-y-8 relative text-slate-800 dark:text-neutral-300 bg-slate-50 dark:bg-[#050508] transition-colors duration-300"
      >
        {/* Premium Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-neutral-200 dark:border-neutral-900">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <NeutralityBadge />
              {demoMode && (
                <span className="bg-amber-100 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/40 text-amber-700 dark:text-amber-400 text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-wider">
                  {t('demoMode')}
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-serif text-slate-900 dark:text-white leading-tight font-semibold">
              {t('intelBrief')}
            </h2>
          </div>
          <div className={`text-xs text-neutral-500 font-mono space-y-0.5 ${lang === 'ar' ? 'text-right sm:text-left' : 'text-left sm:text-right'}`}>
            <div>Report ID: {reportId}</div>
            <div>Classification: PUBLIC / NON-PARTISAN</div>
          </div>
        </div>

        {/* Input Context Summary */}
        <div className="bg-neutral-100/40 dark:bg-neutral-900/20 border border-neutral-200 dark:border-neutral-800/30 p-4 rounded-lg space-y-2">
          <div className="text-[10px] uppercase font-bold tracking-wider text-neutral-500 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5" /> {t('detectedNarrative')}
          </div>
          <p className="text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed italic">
            "{report.detectedStory}"
          </p>
          <div className="grid grid-cols-2 gap-4 pt-3 border-t border-neutral-200 dark:border-neutral-900 text-xs">
            <div>
              <span className="text-neutral-500">{t('mainParty')}:</span>{' '}
              <span className="text-neutral-800 dark:text-neutral-300 font-medium">{report.mainParty}</span>
            </div>
            <div>
              <span className="text-neutral-500">{t('otherParty')}:</span>{' '}
              <span className="text-neutral-800 dark:text-neutral-300 font-medium">{report.otherParty}</span>
            </div>
          </div>
        </div>

        {/* The Other Side Story */}
        <div className="space-y-3">
          <h3 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold flex items-center gap-1.5">
            <Scale className="w-3.5 h-3.5" /> {t('otherSideStory')}
          </h3>
          <p className="text-base text-slate-800 dark:text-neutral-200 leading-relaxed font-serif">
            {report.otherSideStory}
          </p>
        </div>

        {/* Strongest Counter Argument */}
        <div className={`p-5 rounded-lg border-neutral-300 dark:border-neutral-700 bg-neutral-100/50 dark:bg-neutral-900/20 space-y-2 ${lang === 'ar' ? 'border-r-2' : 'border-l-2'}`}>
          <h3 className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-semibold flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-neutral-500 dark:text-neutral-400" /> {t('strongestCounter')}
          </h3>
          <p className="text-sm text-neutral-700 dark:text-neutral-300 leading-relaxed">
            {report.strongestCounterArgument}
          </p>
        </div>

        {/* Split grid for agreements and disputes */}
        <div className="grid gap-6 sm:grid-cols-2">
          {/* Agreements */}
          {report.bothSidesAgreeOn && report.bothSidesAgreeOn.length > 0 && (
            <div className="space-y-2.5">
              <h3 className="text-xs uppercase tracking-wider text-neutral-500 font-semibold flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" /> {t('pointsAgreement')}
              </h3>
              <ul className="space-y-2">
                {report.bothSidesAgreeOn.map((pt, idx) => (
                  <li key={idx} className="flex gap-2.5 items-start text-sm text-neutral-800 dark:text-neutral-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/80 mt-1.5 flex-shrink-0" />
                    <span className="leading-relaxed">{pt}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disputes */}
          <DisputedPoints points={report.disputedPoints} />
        </div>

        {/* Thin Divider */}
        <div className="thin-divider" />

        {/* Sources */}
        <EvidenceStrip sources={report.sourceNotes} />

        {/* Uncertainty & Policy notes */}
        <div className="grid gap-4 sm:grid-cols-2 pt-4 text-xs text-neutral-500 border-t border-neutral-200 dark:border-neutral-900">
          {report.uncertaintyNotes && report.uncertaintyNotes.length > 0 && (
            <div className="space-y-1">
              <div className="font-semibold uppercase tracking-wider flex items-center gap-1">
                <AlertCircle className="w-3 h-3 text-neutral-400 dark:text-neutral-600" /> {t('uncertaintyAreas')}
              </div>
              <ul className="list-disc px-4 space-y-0.5">
                {report.uncertaintyNotes.map((note, idx) => (
                  <li key={idx}>{note}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="space-y-1">
            <div className="font-semibold uppercase tracking-wider">{lang === 'ar' ? 'ملاحظة السياسة' : 'Policy Note'}</div>
            <p className="leading-relaxed">{report.neutralNote || t('policyText')}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
