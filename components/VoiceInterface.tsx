
import React, { useState, useEffect, useRef } from 'react';
import { Mic, MicOff, Volume2, Loader2, Zap, User, Target } from 'lucide-react';
import { getAIClient, decodeBase64, encodeBase64, decodeAudioData } from '../services/gemini';
import { Modality } from '@google/genai';
import { Lead } from '../types';

interface VoiceInterfaceProps {
  lead?: Lead | null;
}

const VoiceInterface: React.FC<VoiceInterfaceProps> = ({ lead }) => {
  const [isActive, setIsActive] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  
  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef(new Set<AudioBufferSourceNode>());

  const getSystemInstruction = () => {
    if (!lead) {
      return "You are the 'Connective Solutions' AI Sales Coach. Help the user rehearse their B2B pitches. Be professional, direct, and slightly challenging.";
    }

    return `You are roleplaying as the CEO/Decision Maker of ${lead.businessName}. 
    Company Stats: $${lead.revenue}M Revenue, ${lead.customerBase}k Customers.
    Technical Issues: ${lead.websiteFlaws.join(', ')}. Core Web Vitals are failing.
    
    The user is a consultant calling to solve your technical debt. 
    BEHAVIOR: You are busy and skeptical. Only give them your time if they use a sharp, data-backed icebreaker.
    CONTEXT: Their current AI-suggested icebreaker is: "${lead.icebreaker}". If they use something similar to this, become more engaged.
    GOAL: If they pitch well, agree to a 15-minute meeting. Otherwise, shut them down professionally.`;
  };

  const startSession = async () => {
    setIsConnecting(true);
    const ai = getAIClient();
    
    const inputAudioContext = new AudioContext({ sampleRate: 16000 });
    const outputAudioContext = new AudioContext({ sampleRate: 24000 });
    audioContextRef.current = outputAudioContext;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsConnecting(false);
            setIsActive(true);
            const source = inputAudioContext.createMediaStreamSource(stream);
            const scriptProcessor = inputAudioContext.createScriptProcessor(4096, 1, 1);
            
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const l = inputData.length;
              const int16 = new Int16Array(l);
              for (let i = 0; i < l; i++) int16[i] = inputData[i] * 32768;
              
              const pcmBlob = {
                data: encodeBase64(new Uint8Array(int16.buffer)),
                mimeType: 'audio/pcm;rate=16000',
              };

              sessionPromise.then((session) => {
                session.sendRealtimeInput({ media: pcmBlob });
              });
            };

            source.connect(scriptProcessor);
            scriptProcessor.connect(inputAudioContext.destination);
          },
          onmessage: async (message) => {
            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData) {
              const buffer = await decodeAudioData(decodeBase64(audioData), outputAudioContext, 24000, 1);
              const source = outputAudioContext.createBufferSource();
              source.buffer = buffer;
              source.connect(outputAudioContext.destination);
              
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, outputAudioContext.currentTime);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              
              source.addEventListener('ended', () => {
                sourcesRef.current.delete(source);
              });
            }

            const interrupted = message.serverContent?.interrupted;
            if (interrupted) {
              for (const source of sourcesRef.current.values()) {
                source.stop();
                sourcesRef.current.delete(source);
              }
              nextStartTimeRef.current = 0;
            }
          },
          onclose: () => setIsActive(false),
          onerror: (e) => console.error(e),
        },
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Zephyr' } },
          },
          systemInstruction: getSystemInstruction(),
        },
      });

      sessionRef.current = await sessionPromise;
    } catch (err) {
      console.error(err);
      setIsConnecting(false);
    }
  };

  const stopSession = () => {
    if (sessionRef.current) {
      sessionRef.current.close();
    }
    setIsActive(false);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-10 max-w-2xl mx-auto text-center shadow-2xl relative overflow-hidden">
      {isActive && (
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-500 via-emerald-500 to-amber-500 animate-pulse" />
      )}

      <div className="mb-8">
        <h2 className="text-3xl font-black gradient-text mb-3">Neural Sales Simulator</h2>
        <p className="text-slate-400 text-sm max-w-md mx-auto">
          {lead 
            ? `Rehearsing pitch for ${lead.businessName}. AI is roleplaying as the Decision Maker.`
            : "Practice your B2B sales skills with our elite AI coach."}
        </p>
      </div>

      {lead && (
        <div className="mb-8 p-4 bg-slate-950/50 border border-slate-800 rounded-2xl flex items-center justify-between text-left">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-500">
              <Target size={20} />
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Active Target</p>
              <h4 className="text-slate-200 font-bold">{lead.businessName}</h4>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-amber-500 uppercase">Rev: ${lead.revenue}M</p>
            <p className="text-[10px] font-black text-emerald-500 uppercase">Web: {lead.webScore}/100</p>
          </div>
        </div>
      )}

      <div className="relative inline-block mb-10">
        <div className={`absolute inset-0 rounded-full blur-3xl transition-all duration-700 ${isActive ? 'bg-amber-500/40 scale-125' : 'bg-slate-800/0'}`}></div>
        <button
          onClick={isActive ? stopSession : startSession}
          disabled={isConnecting}
          className={`relative z-10 w-28 h-28 rounded-full flex items-center justify-center transition-all ${
            isActive ? 'bg-rose-500 hover:bg-rose-600 ring-4 ring-rose-500/20' : 'bg-amber-500 hover:bg-amber-600 ring-4 ring-amber-500/20'
          } shadow-[0_0_50px_rgba(251,191,36,0.2)] transform active:scale-90`}
        >
          {isConnecting ? <Loader2 className="animate-spin text-slate-900" size={40} /> : 
           isActive ? <MicOff className="text-white" size={40} /> : <Mic className="text-slate-900" size={40} />}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 text-left">
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-2 text-amber-500 mb-2">
            <Target size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Persona-Driven</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">AI adapts its personality based on company revenue and industry.</p>
        </div>
        <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/50 hover:border-slate-700 transition-colors">
          <div className="flex items-center gap-2 text-emerald-500 mb-2">
            <Zap size={14} />
            <span className="text-[10px] font-black uppercase tracking-widest">Low Latency</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">Sub-500ms response time for a natural conversational flow.</p>
        </div>
      </div>
    </div>
  );
};

export default VoiceInterface;
