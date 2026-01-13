
import React from 'react';
import { Lead, CRMProvider } from '../types';
import { Globe, Users, DollarSign, Zap, Bell, BellOff, Database } from 'lucide-react';

interface LeadCardProps {
  lead: Lead;
  isPriority: boolean;
  onSelect: (lead: Lead) => void;
  onToggleMonitor?: (id: string) => void;
}

const getCRMColor = (provider: CRMProvider) => {
  switch (provider) {
    case CRMProvider.SALESFORCE: return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
    case CRMProvider.HUBSPOT: return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    case CRMProvider.PIPEDRIVE: return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    case CRMProvider.ZOHO: return 'bg-red-500/20 text-red-400 border-red-500/30';
    default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
  }
};

const LeadCard: React.FC<LeadCardProps> = ({ lead, isPriority, onSelect, onToggleMonitor }) => {
  return (
    <div 
      onClick={() => onSelect(lead)}
      className={`relative p-6 rounded-xl transition-all cursor-pointer group hover:scale-[1.02] active:scale-[0.98] ${
        isPriority 
          ? 'golden-glow bg-slate-900 border-amber-500/50' 
          : 'bg-slate-900/50 border border-slate-800'
      } ${lead.isMonitored ? 'ring-2 ring-emerald-500/30' : ''}`}
      role="button"
      aria-label={`Select lead ${lead.businessName}`}
    >
      {isPriority && (
        <div className="absolute -top-3 -right-3 bg-amber-500 text-slate-950 text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1">
          <Zap size={12} />
          HOT LEAD
        </div>
      )}

      <div className="absolute top-4 right-4 flex flex-wrap justify-end gap-1 max-w-[120px] pointer-events-none">
        {lead.pushedCRMs?.map(crm => (
          <div key={crm} className={`${getCRMColor(crm)} text-[8px] font-black px-1.5 py-0.5 rounded border flex items-center gap-1`}>
            <Database size={8} />
            {crm.toUpperCase()}
          </div>
        ))}
      </div>

      {lead.isMonitored && (
        <div className="absolute -top-3 left-6 bg-emerald-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full flex items-center gap-1 animate-pulse">
          <div className="w-1.5 h-1.5 bg-white rounded-full"></div>
          LIVE MONITORING
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div className="max-w-[70%]">
          <h3 className="text-xl font-bold text-slate-100 group-hover:text-amber-400 transition-colors truncate">
            {lead.businessName}
          </h3>
          <p className="text-slate-400 text-sm truncate">{lead.name} • {lead.title || 'Decision Maker'}</p>
        </div>
        <div className="text-right">
          <div className="text-2xl font-black text-amber-500">{lead.propensityScore}</div>
          <div className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Signal Strength</div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="flex items-center gap-2 text-slate-300">
          <DollarSign size={16} className="text-emerald-500" />
          <span className="text-sm font-semibold">${lead.revenue}M Rev</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Users size={16} className="text-blue-500" />
          <span className="text-sm font-semibold">{lead.customerBase}k Users</span>
        </div>
        <div className="flex items-center gap-2 text-slate-300">
          <Globe size={16} className="text-rose-500" />
          <span className="text-sm font-semibold">{lead.webScore}/100 Web</span>
        </div>
      </div>

      <div className="space-y-3">
        <div className="bg-slate-950/50 p-3 rounded-lg border border-slate-800">
          <p className="text-xs text-slate-400 font-medium mb-1 uppercase tracking-tight">Pain Point Summary</p>
          <p className="text-sm text-slate-300 line-clamp-2 italic">"{lead.painPointSummary}"</p>
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center gap-2">
        <span className="text-xs text-slate-500 italic truncate max-w-[100px]">{lead.websiteUrl}</span>
        <div className="flex gap-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onToggleMonitor?.(lead.id);
            }}
            className={`p-2 rounded transition-colors ${lead.isMonitored ? 'bg-emerald-500 text-slate-950 shadow-inner' : 'bg-slate-800 text-slate-400 hover:text-slate-200'}`}
          >
            {lead.isMonitored ? <Bell size={14} /> : <BellOff size={14} />}
          </button>
          <button className="bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold px-4 py-2 rounded transition-all active:scale-95 uppercase whitespace-nowrap shadow-lg">
            Review Icebreaker
          </button>
        </div>
      </div>
    </div>
  );
};

export default LeadCard;
