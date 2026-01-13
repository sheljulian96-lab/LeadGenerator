
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { HashRouter as Router, Routes, Route, Link, useLocation, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, Mic, Image as ImageIcon, Video, Layers, ChevronRight, 
  Search, Zap, Star, Activity, Bell, Linkedin, CheckCircle, Database, 
  Loader2, Settings2, Sliders, ArrowRight, Share2, ExternalLink, ShieldCheck,
  Cpu, Smartphone, Shield, Gauge, Filter, History, MapPin, Mail, Phone,
  TrendingUp, HelpCircle, Globe, Code, Terminal, FileJson, RefreshCw, Clock,
  Trophy, AlertTriangle, FileText
} from 'lucide-react';
import { Lead, LinkedInSignal, AlgorithmWeights, CRMProvider, CRMConnection } from './types';
import { generateLeadsWithSearch, analyzeSignalIntelligence, calculatePropensityScore, refreshLeadSignals, generateGrowthProfile } from './services/gemini';
import LeadCard from './components/LeadCard';
import VoiceInterface from './components/VoiceInterface';
import VideoOutreach from './components/VideoOutreach';
import GrowthProfile from './components/GrowthProfile';

const CRM_DETAILS = {
  [CRMProvider.SALESFORCE]: { color: 'text-blue-400', bg: 'bg-blue-400', icon: '☁️' },
  [CRMProvider.HUBSPOT]: { color: 'text-orange-400', bg: 'bg-orange-400', icon: '🟧' },
  [CRMProvider.PIPEDRIVE]: { color: 'text-emerald-400', bg: 'bg-emerald-400', icon: '📈' },
  [CRMProvider.ZOHO]: { color: 'text-red-400', bg: 'bg-red-400', icon: '🔴' },
};

const InteractiveScoringHub = ({ weights, setWeights }: { weights: AlgorithmWeights, setWeights: (w: AlgorithmWeights) => void }) => {
  const updateWeight = (key: keyof AlgorithmWeights, value: number) => {
    setWeights({ ...weights, [key]: value / 100 });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 p-8 opacity-10">
          <Sliders size={120} />
        </div>
        
        <h2 className="text-3xl font-black gradient-text mb-2 flex items-center gap-3">
          <Terminal className="text-amber-500" /> Scoring Engine Control
        </h2>
        <p className="text-slate-400 text-sm mb-10">Fine-tune the weights of the "Hot Lead" Algorithm to pivot your strategy.</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {[
            { label: 'Revenue Momentum', key: 'revenue', icon: <TrendingUp size={18} className="text-emerald-500" />, color: 'accent-emerald-500' },
            { label: 'Market Reach', key: 'customerBase', icon: <Globe size={18} className="text-blue-500" />, color: 'accent-blue-500' },
            { label: 'Technical Debt', key: 'webScore', icon: <Shield size={18} className="text-rose-500" />, color: 'accent-rose-500' }
          ].map((item) => (
            <div key={item.key} className="space-y-4 p-6 bg-slate-950 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {item.icon}
                  <span className="text-xs font-bold text-slate-100 uppercase tracking-widest">{item.label}</span>
                </div>
                <span className="text-lg font-black text-slate-100">{Math.round((weights as any)[item.key] * 100)}%</span>
              </div>
              <input 
                type="range" min="0" max="100" step="5"
                value={(weights as any)[item.key] * 100}
                onChange={(e) => updateWeight(item.key as any, parseInt(e.target.value))}
                className={`w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer ${item.color}`}
              />
              <p className="text-[10px] text-slate-500 leading-relaxed italic">
                {item.key === 'webScore' ? "Higher weight targets companies with the worst digital health." : "Higher weight targets larger, more established revenue streams."}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-amber-500/10 border border-amber-500/20 p-6 rounded-2xl">
          <h3 className="text-amber-500 font-bold text-sm mb-4 flex items-center gap-2">
            <Code size={16} /> Live Engine Formula
          </h3>
          <div className="font-mono text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800 leading-loose">
            Score = (Revenue × <span className="text-emerald-400 font-bold">{weights.revenue}</span>) 
            + (MarketReach × <span className="text-blue-400 font-bold">{weights.customerBase}</span>) 
            + ((100 - WebScore) × <span className="text-rose-400 font-bold">{weights.webScore}</span>)
          </div>
        </div>
      </div>
    </div>
  );
};

const TechnicalBlueprint = () => {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8">
        <h2 className="text-3xl font-black gradient-text mb-6 flex items-center gap-3">
          <Code className="text-amber-500" /> Technical Architecture
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800">
            <h3 className="text-amber-500 font-bold mb-3 flex items-center gap-2">
              <Zap size={18} /> Real-time Data Engine
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Orchestrates parallel calls to Google Maps and LinkedIn via Gemini 2.5 series models to synthesize SMB profiles with deep decision-maker context.
            </p>
          </div>
          <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800">
            <h3 className="text-blue-500 font-bold mb-3 flex items-center gap-2">
              <Cpu size={18} /> Neural Scoring Hub
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed">
              Propensity scores are calculated server-side using multi-variable linear regression weighted against live technical debt metrics and revenue momentum.
            </p>
          </div>
        </div>
        <div className="mt-8 p-6 bg-slate-950 rounded-2xl border border-slate-800">
          <h3 className="text-emerald-500 font-bold mb-3 flex items-center gap-2">
            <Layers size={18} /> Intelligence Stack
          </h3>
          <ul className="space-y-3 text-sm text-slate-400">
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Gemini 3 Pro Preview: Complex reasoning & CRM orchestration.</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Gemini 2.5 Flash Native Audio: Ultra-low latency voice simulations.</li>
            <li className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> Veo 3.1 Fast: Personalized video outreach rendering.</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ leads, setLeads, isGenerating, handleGenerate, niche, setNiche, location, setLocation, connections, lastUpdated, isRefreshing, weights }: any) => {
  const [selectedLeadId, setSelectedLeadId] = useState<string | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isGeneratingAudit, setIsGeneratingAudit] = useState(false);
  const [targetCRM, setTargetCRM] = useState<CRMProvider>(CRMProvider.SALESFORCE);
  const [viewMode, setViewMode] = useState<'signals' | 'crm' | 'video' | 'audit'>('signals');
  const [crmSearchQuery, setCrmSearchQuery] = useState('');
  const navigate = useNavigate();

  const leadsWithLiveScoring = useMemo(() => {
    return leads.map((l: any) => ({
      ...l,
      propensityScore: calculatePropensityScore(l, weights)
    })).sort((a: any, b: any) => b.propensityScore - a.propensityScore);
  }, [leads, weights]);

  const selectedLead = leadsWithLiveScoring.find((l: Lead) => l.id === selectedLeadId) || null;
  const connectedCRMs = connections.filter((c: CRMConnection) => c.isConnected).map((c: CRMConnection) => c.provider);

  const filteredLeads = viewMode === 'signals' 
    ? leadsWithLiveScoring 
    : leadsWithLiveScoring.filter((l: Lead) => {
        const isSynced = l.pushedCRMs && l.pushedCRMs.length > 0;
        const matchesQuery = l.businessName.toLowerCase().includes(crmSearchQuery.toLowerCase()) || 
                             l.name.toLowerCase().includes(crmSearchQuery.toLowerCase());
        return isSynced && matchesQuery;
      });

  const toggleMonitor = (id: string) => {
    setLeads((prev: Lead[]) => prev.map(l => l.id === id ? { ...l, isMonitored: !l.isMonitored } : l));
  };

  const handlePushToCRM = async () => {
    if (!selectedLead || !targetCRM) return;
    setIsSyncing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLeads((prev: Lead[]) => prev.map(l => {
      if (l.id === selectedLead.id) {
        const currentPushed = l.pushedCRMs || [];
        if (!currentPushed.includes(targetCRM)) return { ...l, pushedCRMs: [...currentPushed, targetCRM] };
      }
      return l;
    }));
    setIsSyncing(false);
  };

  const handleGenerateAudit = async () => {
    if (!selectedLead || isGeneratingAudit) return;
    setIsGeneratingAudit(true);
    const profile = await generateGrowthProfile(selectedLead);
    setLeads((prev: Lead[]) => prev.map(l => l.id === selectedLead.id ? { ...l, growthProfile: profile } : l));
    setIsGeneratingAudit(false);
    setViewMode('audit');
  };

  const isCurrentLeadInTargetCRM = selectedLead?.pushedCRMs?.includes(targetCRM);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex flex-col xl:flex-row xl:items-center justify-between gap-6">
        <div className="flex-shrink-0">
          <h1 className="text-4xl font-black text-slate-100 tracking-tight flex items-center gap-3">
            {viewMode === 'crm' || viewMode === 'audit' ? 'CRM Explorer' : 'Signal Intelligence'}
            {(leads.some((l: Lead) => l.isMonitored) || isRefreshing) && <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />}
          </h1>
          <div className="flex flex-wrap items-center gap-4 mt-1">
            <p className="text-slate-400 text-sm flex items-center gap-2">
              <Globe size={14} className="text-blue-400" />
              {viewMode === 'signals' 
                ? `Real-time sync: ${niche} in ${location}.` 
                : `Browsing ${filteredLeads.length} active CRM targets.`}
            </p>
            {lastUpdated && (
              <p className="text-slate-600 text-xs flex items-center gap-1.5 border-l border-slate-800 pl-4">
                <Clock size={12} />
                Last updated: {lastUpdated.toLocaleTimeString()}
                {isRefreshing && <RefreshCw size={12} className="animate-spin text-emerald-500" />}
              </p>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-slate-900 p-1 rounded-xl border border-slate-800 flex shadow-inner">
            <button 
              onClick={() => setViewMode('signals')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'signals' ? 'bg-amber-500 text-slate-950 shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Zap size={14} /> Global Sync
            </button>
            <button 
              onClick={() => setViewMode('crm')}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${viewMode === 'crm' || viewMode === 'audit' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Database size={14} /> CRM Stack
            </button>
          </div>

          {viewMode === 'signals' ? (
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
                <input 
                  type="text" value={niche} onChange={(e) => setNiche(e.target.value)}
                  placeholder="Target Niche..."
                  className="bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-amber-500 w-48 shadow-lg"
                />
              </div>
              <button onClick={handleGenerate} disabled={isGenerating} className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold px-6 py-3 rounded-lg shadow-xl flex items-center gap-2 transition-all active:scale-95 disabled:opacity-50">
                {isGenerating ? <Loader2Icon className="animate-spin" /> : <TrendingUp size={18} />}
                {isGenerating ? 'Enriching...' : 'Sync Leads'}
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input 
                type="text" placeholder="Filter CRM syncs..." value={crmSearchQuery}
                onChange={(e) => setCrmSearchQuery(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg pl-10 pr-4 py-3 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500 w-64 shadow-lg"
              />
            </div>
          )}
        </div>
      </header>

      {filteredLeads.length > 0 ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 h-fit">
            {filteredLeads.map((lead: Lead, idx: number) => (
              <LeadCard key={lead.id} lead={lead} isPriority={idx < 3 && viewMode === 'signals'} onSelect={(l) => setSelectedLeadId(l.id)} onToggleMonitor={toggleMonitor} />
            ))}
          </div>
          
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sticky top-24 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className={`text-xl font-bold flex items-center gap-2 ${viewMode === 'signals' ? 'text-amber-500' : 'text-blue-400'}`}>
                  {viewMode === 'signals' ? <Star size={20} fill="currentColor" /> : <History size={20} />} 
                  Intelligence Hub
                </h2>
                {selectedLead && (
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setViewMode('signals')}
                      title="Signals"
                      className={`p-1.5 rounded-lg border transition-all ${viewMode === 'signals' ? 'bg-amber-500/10 border-amber-500/30 text-amber-500' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                    >
                      <Zap size={16} />
                    </button>
                    <button 
                      onClick={() => setViewMode('video')}
                      title="Personalized Video"
                      className={`p-1.5 rounded-lg border transition-all ${viewMode === 'video' ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                    >
                      <Video size={16} />
                    </button>
                    {selectedLead.growthProfile && (
                      <button 
                        onClick={() => setViewMode('audit')}
                        title="Strategic Audit"
                        className={`p-1.5 rounded-lg border transition-all ${viewMode === 'audit' ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' : 'bg-slate-950 border-slate-800 text-slate-500'}`}
                      >
                        <FileText size={16} />
                      </button>
                    )}
                  </div>
                )}
              </div>
              
              {selectedLead ? (
                <div className="space-y-6 animate-in slide-in-from-right-4">
                  {viewMode === 'video' ? (
                    <VideoOutreach lead={selectedLead} />
                  ) : viewMode === 'audit' && selectedLead.growthProfile ? (
                    <GrowthProfile report={selectedLead.growthProfile} businessName={selectedLead.businessName} />
                  ) : (
                    <>
                      <div>
                        <h3 className="text-slate-100 font-bold text-lg">{selectedLead.businessName}</h3>
                        <div className="flex items-center gap-2 text-slate-500 text-xs mt-1 mb-4">
                          <Linkedin size={12} className="text-blue-400" />
                          <span>{selectedLead.name} • <span className="text-slate-300 font-bold">{selectedLead.title}</span></span>
                        </div>
                        
                        <div className={`${viewMode === 'signals' ? 'bg-amber-500/10 border-amber-500/20' : 'bg-blue-500/10 border-blue-500/20'} border p-4 rounded-xl shadow-inner`}>
                          <p className={`${viewMode === 'signals' ? 'text-amber-500' : 'text-blue-400'} text-[10px] font-black uppercase tracking-widest mb-2`}>Perfect Icebreaker</p>
                          <p className="text-slate-200 text-sm leading-relaxed italic">"{selectedLead.icebreaker}"</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-4">
                        {/* High-Level Audit Trigger */}
                        {viewMode === 'crm' && !selectedLead.growthProfile && (
                          <button 
                            onClick={handleGenerateAudit}
                            disabled={isGeneratingAudit}
                            className="w-full bg-slate-100 hover:bg-white text-slate-950 font-black py-4 rounded-xl flex items-center justify-center gap-3 transition-all shadow-xl disabled:opacity-50"
                          >
                            {isGeneratingAudit ? <Loader2Icon className="animate-spin" /> : <ShieldCheck size={20} />}
                            {isGeneratingAudit ? 'Synthesizing Strategic Profile...' : 'Generate Comprehensive Growth Audit'}
                          </button>
                        )}

                        {selectedLead.signals && selectedLead.signals.length > 0 && (
                          <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 shadow-md max-h-48 overflow-y-auto">
                            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-2">
                              <Activity size={10} /> Neural Activity Feed
                            </p>
                            {selectedLead.signals.map((sig: LinkedInSignal) => (
                              <div key={sig.id} className="border-l-2 border-emerald-500/30 pl-3 py-1">
                                <p className="text-[10px] text-slate-500 mb-1">{new Date(sig.timestamp).toLocaleTimeString()}</p>
                                <p className="text-[11px] text-slate-300 line-clamp-2">{sig.content}</p>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3 shadow-md">
                          <div className="flex justify-between items-center mb-1">
                            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Enrichment Data</p>
                            {selectedLead.metrics.revenueInferred && (
                              <div className="group relative">
                                <HelpCircle size={12} className="text-slate-600" />
                                <div className="absolute right-0 bottom-full mb-2 w-48 p-2 bg-slate-800 text-[10px] text-slate-300 rounded shadow-xl hidden group-hover:block z-50">
                                  Revenue inferred from {selectedLead.metrics.googleReviews} reviews & ${selectedLead.metrics.avgServicePrice} price signal.
                                </div>
                              </div>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-4">
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-600 uppercase font-bold">Signal Revenue</span>
                              <span className="text-sm text-emerald-500 font-black">${selectedLead.revenue}M</span>
                            </div>
                            <div className="flex flex-col">
                              <span className="text-[10px] text-slate-600 uppercase font-bold">G-Reviews</span>
                              <span className="text-sm text-amber-500 font-black">{selectedLead.metrics.googleReviews}</span>
                            </div>
                          </div>
                          <div className="h-px bg-slate-900 my-2" />
                          <div className="flex items-center gap-3 text-sm text-slate-300">
                            <Mail size={14} className="text-slate-500" />
                            <span className="truncate">{selectedLead.contactInfo.email}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-slate-300">
                            <Phone size={14} className="text-slate-500" />
                            <span>{selectedLead.contactInfo.phone}</span>
                          </div>
                        </div>

                        <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 shadow-md">
                          <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-3">Technical Audit</p>
                          <div className="grid grid-cols-2 gap-3 mb-4">
                            <div className="flex items-center gap-2">
                              <Gauge size={12} className="text-rose-500" />
                              <span className="text-xs text-slate-300">LCP: {selectedLead.technicalAudit.lcp}s</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Cpu size={12} className="text-rose-500" />
                              <span className="text-xs text-slate-300">CLS: {selectedLead.technicalAudit.cls}</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Smartphone size={12} className={selectedLead.technicalAudit.mobileOptimization > 80 ? 'text-emerald-500' : 'text-amber-500'} />
                              <span className="text-xs text-slate-300">Mobile: {selectedLead.technicalAudit.mobileOptimization}%</span>
                            </div>
                            <div className="flex items-center gap-2">
                              <Shield size={12} className={selectedLead.technicalAudit.securityHeader ? 'text-emerald-500' : 'text-rose-500'} />
                              <span className="text-xs text-slate-300">{selectedLead.technicalAudit.securityHeader ? 'Secure' : 'Headers missing'}</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => navigate('/voice', { state: { lead: selectedLead } })}
                            className="w-full bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95"
                          >
                            <Mic size={14} /> Rehearse Simulation
                          </button>
                        </div>
                      </div>

                      {connectedCRMs.length > 0 ? (
                        <button onClick={handlePushToCRM} disabled={isSyncing || isCurrentLeadInTargetCRM} className={`w-full font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl active:scale-95 ${isCurrentLeadInTargetCRM ? 'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30' : 'bg-slate-100 text-slate-900 hover:bg-white'}`}>
                          {isSyncing ? <><Loader2Icon className="animate-spin" size={18} /> Syncing...</> : isCurrentLeadInTargetCRM ? <><CheckCircle size={18} /> Synced to {targetCRM}</> : <><Database size={18} /> Export to CRM <ChevronRight size={18} /></>}
                        </button>
                      ) : (
                        <Link to="/integrations" className="w-full bg-slate-800 text-slate-300 font-bold py-4 rounded-xl flex items-center justify-center gap-2 border border-slate-700">Connect Stack <ExternalLink size={16} /></Link>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Layers className="mx-auto text-slate-800 mb-4 opacity-50" size={48} />
                  <p className="text-slate-500 text-sm">Select a lead to unlock intelligence.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/50 border border-slate-800 border-dashed rounded-3xl py-32 text-center shadow-inner">
          <div className="max-w-md mx-auto text-slate-700">
            {viewMode === 'signals' ? (
              <>
                <Zap size={48} className="mx-auto mb-6 opacity-20" />
                <h2 className="text-2xl font-bold">Awaiting Logic Sync</h2>
                <p className="text-sm mt-2 text-slate-500">Cross-referencing Google Maps SMB data with LinkedIn Decision-Maker profiles...</p>
              </>
            ) : (
              <>
                <Database size={48} className="mx-auto mb-6 opacity-20" />
                <h2 className="text-2xl font-bold">No Leads Synced</h2>
                <p className="text-sm mt-2 text-slate-500">Push high-signal targets from your dashboard to track them here.</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const Layout = ({ leads, setLeads, isGenerating, handleGenerate, niche, setNiche, location, setLocation, weights, setWeights, connections, setConnections, lastUpdated, isRefreshing }: any) => {
  const loc = useLocation();
  const currentPath = loc.pathname;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col md:flex-row">
      <nav className="w-full md:w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col gap-8 shadow-2xl z-50">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 bg-amber-500 rounded flex items-center justify-center font-black text-slate-950 shadow-[0_0_15px_rgba(251,191,36,0.4)]">CS</div>
          <span className="font-bold tracking-tight text-slate-200 uppercase text-xs">Connective Solutions</span>
        </div>
        <div className="flex flex-col gap-2">
          <Link to="/" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentPath === '/' ? 'bg-amber-500 text-slate-950 font-bold shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}><LayoutDashboard size={20} /> Dashboard</Link>
          <Link to="/scoring" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentPath === '/scoring' ? 'bg-amber-500 text-slate-950 font-bold shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}><Sliders size={20} /> Scoring Hub</Link>
          <Link to="/blueprint" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentPath === '/blueprint' ? 'bg-amber-500 text-slate-950 font-bold shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}><Code size={20} /> Tech Blueprint</Link>
          <div className="h-px bg-slate-800 my-2 mx-4" />
          <Link to="/voice" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentPath === '/voice' ? 'bg-amber-500 text-slate-950 font-bold shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}><Mic size={20} /> Voice Coaching</Link>
          <Link to="/integrations" className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentPath === '/integrations' ? 'bg-amber-500 text-slate-950 font-bold shadow-lg' : 'text-slate-400 hover:bg-slate-800 hover:text-slate-100'}`}><Share2 size={20} /> Stack Integrations</Link>
        </div>
        <div className="mt-auto p-4 bg-emerald-500/5 rounded-2xl border border-emerald-500/10">
          <p className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-1">
            <CheckCircle size={10} /> Data Engine Live
            {isRefreshing && <RefreshCw size={10} className="animate-spin" />}
          </p>
          <p className="text-[9px] text-slate-500 leading-tight">Syncing local SMB signal from Google Maps & LinkedIn APIs every 5m.</p>
        </div>
      </nav>
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto">
          <Routes>
            <Route path="/" element={<Dashboard leads={leads} setLeads={setLeads} isGenerating={isGenerating} handleGenerate={handleGenerate} niche={niche} setNiche={setNiche} location={location} setLocation={setLocation} connections={connections} lastUpdated={lastUpdated} isRefreshing={isRefreshing} weights={weights} />} />
            <Route path="/scoring" element={<InteractiveScoringHub weights={weights} setWeights={setWeights} />} />
            <Route path="/blueprint" element={<TechnicalBlueprint />} />
            <Route path="/voice" element={<VoiceRoute />} />
            <Route path="/integrations" element={<div className="p-20 text-center text-slate-600">Integrations Module Active</div>} />
          </Routes>
        </div>
      </main>
    </div>
  );
};

const VoiceRoute = () => {
  const location = useLocation();
  const lead = location.state?.lead;
  return <VoiceInterface lead={lead} />;
};

const App = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isBackgroundRefreshing, setIsBackgroundRefreshing] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [niche, setNiche] = useState('Fintech SMBs');
  const [location, setLocation] = useState('San Francisco, CA');
  const [coords, setCoords] = useState<{lat: number, lng: number} | undefined>(undefined);
  const [weights, setWeights] = useState<AlgorithmWeights>({ revenue: 0.4, customerBase: 0.2, webScore: 0.4 });
  const [connections] = useState<CRMConnection[]>([{ provider: CRMProvider.HUBSPOT, isConnected: true, lastSync: Date.now() }]);
  const initialSyncRef = useRef(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
        (err) => console.debug("Geolocation skipped.")
      );
    }
  }, []);

  const handleGenerate = useCallback(async () => {
    if (isGenerating) return;
    setIsGenerating(true);
    try {
      const data = await generateLeadsWithSearch(niche, location, weights, coords);
      setLeads(data);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Enrichment Error:", err);
    } finally {
      setIsGenerating(false);
    }
  }, [niche, location, weights, isGenerating, coords]);

  const handleBackgroundRefresh = useCallback(async () => {
    if (leads.length === 0 || isBackgroundRefreshing || isGenerating) return;
    
    setIsBackgroundRefreshing(true);
    try {
      const updatedLeads = await refreshLeadSignals(leads, weights);
      setLeads(updatedLeads);
      setLastUpdated(new Date());
    } catch (err) {
      console.error("Background Refresh Error:", err);
    } finally {
      setIsBackgroundRefreshing(false);
    }
  }, [leads, isBackgroundRefreshing, isGenerating, weights]);

  useEffect(() => {
    if (!initialSyncRef.current) {
      initialSyncRef.current = true;
      handleGenerate();
    }
  }, [handleGenerate]);

  useEffect(() => {
    const interval = setInterval(() => {
      handleBackgroundRefresh();
    }, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [handleBackgroundRefresh]);

  return (
    <Router>
      <Layout 
        leads={leads} 
        setLeads={setLeads} 
        isGenerating={isGenerating} 
        handleGenerate={handleGenerate} 
        niche={niche} 
        setNiche={setNiche} 
        location={location}
        setLocation={setLocation}
        weights={weights} 
        setWeights={setWeights}
        connections={connections}
        lastUpdated={lastUpdated}
        isRefreshing={isBackgroundRefreshing}
      />
    </Router>
  );
};

export default App;

const Loader2Icon = ({ className, size = 18 }: { className?: string, size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`animate-spin ${className}`}><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);
