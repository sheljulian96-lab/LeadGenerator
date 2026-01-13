
import React from 'react';
import { FileText, ChevronRight, Briefcase, AlertTriangle, Lightbulb, PlayCircle, ShieldCheck } from 'lucide-react';

interface GrowthProfileProps {
  report: string;
  businessName: string;
}

const GrowthProfile: React.FC<GrowthProfileProps> = ({ report, businessName }) => {
  // Simple markdown-ish parser for the structure we requested
  const sections = report.split(/\d\.\s+/).filter(Boolean);
  const sectionIcons = [
    <Briefcase className="text-blue-500" />,
    <AlertTriangle className="text-rose-500" />,
    <Lightbulb className="text-amber-500" />,
    <PlayCircle className="text-emerald-500" />
  ];

  return (
    <div className="animate-in fade-in slide-in-from-right-4 duration-700">
      <div className="flex items-center gap-3 mb-8 border-b border-slate-800 pb-4">
        <FileText className="text-amber-500" size={24} />
        <h2 className="text-2xl font-black text-slate-100 uppercase tracking-tight">Strategic Growth Profile</h2>
      </div>

      <div className="bg-slate-950 rounded-2xl border border-slate-800 p-8 shadow-inner space-y-10 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
          <ShieldCheck size={200} />
        </div>

        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1">Confidential Audit</p>
            <h1 className="text-3xl font-black text-slate-100">{businessName}</h1>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-1">Service Tier</p>
            <p className="text-xs font-bold text-slate-300">High-Ticket / Retention Priority</p>
          </div>
        </div>

        <div className="space-y-12">
          {sections.map((section, idx) => {
            const [title, ...contentLines] = section.split('\n');
            return (
              <div key={idx} className="relative pl-12">
                <div className="absolute left-0 top-0 w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center">
                  {sectionIcons[idx] || <ChevronRight className="text-slate-500" />}
                </div>
                <h3 className="text-lg font-black text-slate-100 mb-4 border-b border-slate-900 pb-2 flex items-center justify-between">
                  {title.replace(/^\*\*/, '').replace(/\*\*$/, '')}
                  <span className="text-[10px] text-slate-600 font-mono">SEC_0{idx + 1}</span>
                </h3>
                <div className="prose prose-invert prose-sm max-w-none text-slate-400 space-y-2 leading-relaxed whitespace-pre-line">
                  {contentLines.join('\n').trim()}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-12 pt-8 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-600 font-bold uppercase tracking-widest">
          <span>Connective Solutions Proprietary Engine</span>
          <span>Ref ID: CS-AUDIT-{Date.now().toString().slice(-6)}</span>
        </div>
      </div>
    </div>
  );
};

export default GrowthProfile;
