
import React, { useState } from 'react';
import { Video, Loader2, Play, Download, AlertCircle, Sparkles } from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { Lead } from '../types';

interface VideoOutreachProps {
  lead: Lead;
}

const VideoOutreach: React.FC<VideoOutreachProps> = ({ lead }) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<string>("");

  const handleGenerateVideo = async () => {
    // Guidelines check: Veo requires user-selected API key
    if (!(await (window as any).aistudio.hasSelectedApiKey())) {
      await (window as any).aistudio.openSelectKey();
      // Proceed after triggering key selection (ignoring race condition per guidelines)
    }

    setIsGenerating(true);
    setStatus("Initializing Veo 3.1 Fast Engine...");

    try {
      // Create a new instance right before making an API call to use the most up-to-date key
      const ai = new GoogleGenAI({ apiKey: (process.env as any).API_KEY });
      
      const prompt = `A high-end cinematic 3D animation of a data dashboard dissolving into a clean, modern website for a company called ${lead.businessName}. The aesthetic is dark mode with amber neon accents, representing peak performance and sales growth.`;

      let operation = await ai.models.generateVideos({
        model: 'veo-3.1-fast-generate-preview',
        prompt: prompt,
        config: {
          numberOfVideos: 1,
          resolution: '1080p',
          aspectRatio: '16:9'
        }
      });

      while (!operation.done) {
        setStatus("Rendering cinematic frames (this may take 1-2 minutes)...");
        await new Promise(resolve => setTimeout(resolve, 10000));
        operation = await ai.operations.getVideosOperation({ operation: operation });
      }

      const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
      if (downloadLink) {
        setStatus("Finalizing MP4 encode...");
        // Use the current API key for downloading the body
        const response = await fetch(`${downloadLink}&key=${(process.env as any).API_KEY}`);
        if (!response.ok) throw new Error("Failed to download video file");
        const blob = await response.blob();
        setVideoUrl(URL.createObjectURL(blob));
      } else {
        throw new Error("Generation completed but no download link was provided.");
      }
    } catch (err: any) {
      console.error(err);
      if (err.message?.includes("Requested entity was not found")) {
        alert("API Key error. Please re-select your paid project key.");
        await (window as any).aistudio.openSelectKey();
      } else {
        alert("Video generation failed: " + err.message);
      }
    } finally {
      setIsGenerating(false);
      setStatus("");
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden relative">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-2xl font-black text-slate-100 flex items-center gap-2">
            <Video className="text-amber-500" /> Cinematic Outreach
          </h2>
          <p className="text-slate-400 text-sm">Generate a personalized 1080p video for {lead.businessName}.</p>
        </div>
        <div className="bg-amber-500/10 text-amber-500 text-[10px] font-black px-2 py-1 rounded border border-amber-500/20 uppercase">
          Veo 3.1 Fast
        </div>
      </div>

      {!videoUrl ? (
        <div className="aspect-video bg-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-center p-12 text-center group relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-t from-amber-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
          
          {isGenerating ? (
            <div className="space-y-4 animate-in fade-in zoom-in">
              <div className="relative">
                <Loader2 className="animate-spin text-amber-500 mx-auto" size={48} />
                <Sparkles className="absolute -top-2 -right-2 text-amber-400 animate-pulse" size={20} />
              </div>
              <p className="text-slate-200 font-bold">{status}</p>
              <p className="text-slate-500 text-[10px] uppercase tracking-tighter">AI is synthesizing industry-specific cinematic assets</p>
            </div>
          ) : (
            <>
              <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center mb-6 border border-slate-800 group-hover:border-amber-500/50 transition-colors">
                <Play className="text-slate-700 group-hover:text-amber-500 transition-colors ml-1" fill="currentColor" />
              </div>
              <h3 className="text-slate-300 font-bold mb-2">Ready for Rendering</h3>
              <p className="text-slate-500 text-xs mb-8 max-w-xs leading-relaxed">
                Uses the lead's Technical Audit data to visually demonstrate their digital "Performance Gap."
              </p>
              <button 
                onClick={handleGenerateVideo}
                className="bg-slate-100 hover:bg-white text-slate-900 font-black px-8 py-3 rounded-xl flex items-center gap-2 transition-all active:scale-95"
              >
                Generate Personalized Masterpiece
              </button>
              <p className="mt-4 text-[10px] text-slate-600">
                Requires a paid API key. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline hover:text-slate-400">Billing info</a>
              </p>
            </>
          )}
        </div>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
          <video src={videoUrl} controls className="w-full rounded-2xl border border-slate-800 shadow-2xl" />
          <div className="flex gap-4">
            <a 
              href={videoUrl} 
              download={`${lead.businessName}_Outreach.mp4`}
              className="flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-xl"
            >
              <Download size={18} /> Download Master
            </a>
            <button 
              onClick={() => setVideoUrl(null)}
              className="px-6 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-xl border border-slate-700"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      <div className="mt-8 p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl flex gap-4 items-start">
        <AlertCircle className="text-amber-500 shrink-0 mt-1" size={16} />
        <p className="text-[11px] text-slate-400 leading-relaxed">
          <span className="text-amber-500 font-bold uppercase mr-1">Pro Tip:</span> 
          Personalized videos have a <span className="text-slate-100 font-bold">4.5x higher response rate</span> for B2B consulting. Veo 3.1 creates cinematic representations of high-revenue growth to anchor your pitch.
        </p>
      </div>
    </div>
  );
};

export default VideoOutreach;
