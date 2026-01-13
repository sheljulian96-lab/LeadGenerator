
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { Lead, LinkedInSignal, AlgorithmWeights } from "../types";

export const getAIClient = (apiKey?: string) => {
  return new GoogleGenAI({ apiKey: apiKey || process.env.API_KEY || "" });
};

export const calculatePropensityScore = (
  data: { revenue: number; customerBase: number; webScore: number },
  weights: AlgorithmWeights
): number => {
  // Defensive checks to prevent NaN
  const rev = Number(data.revenue) || 0;
  const cust = Number(data.customerBase) || 0;
  const web = Number(data.webScore) || 50;

  const score = 
    (rev * weights.revenue) + 
    (cust * weights.customerBase) + 
    ((100 - web) * weights.webScore);
  
  return Math.round(score * 10) / 10;
};

export const generateLeadsWithSearch = async (
  niche: string, 
  location: string,
  weights: AlgorithmWeights,
  coords?: { lat: number, lng: number }
): Promise<Lead[]> => {
  const ai = getAIClient();
  
  const prompt = `Role: Connective Solutions Backend Data Engine.
  Location: ${location}
  Niche: ${niche}

  CRITICAL LOGIC:
  1. PRIORITY SOURCE: Use Google Maps to find real, active SMBs in ${location}. 
  2. CROSS-REFERENCE: Use LinkedIn to identify Decision Makers (CEO/Owner). Provide FULL NAME and EXACT TITLE.
  3. REVENUE INFERENCE: If public data is missing, calculate: Revenue = (Google Reviews * 100) * (Avg Service Price / 10). Assume 10% review rate.
  4. WEB AUDIT: Identify 3 technical flaws (LCP, CLS, FID).
  
  OUTPUT REQUIREMENT:
  Return ONLY a JSON array of objects. Do not include any text before or after the JSON block.
  Each object MUST follow this structure:
  {
    "businessName": "string",
    "name": "Decision Maker Name",
    "title": "Decision Maker Title",
    "revenue": number (in millions),
    "customerBase": number (in thousands),
    "webScore": number (0-100),
    "websiteUrl": "string",
    "websiteFlaws": ["flaw1", "flaw2", "flaw3"],
    "painPointSummary": "string",
    "icebreaker": "string",
    "contactInfo": { "email": "string", "phone": "string" },
    "metrics": { "googleReviews": number, "avgServicePrice": number, "revenueInferred": boolean },
    "technicalAudit": { "lcp": "string", "cls": "string", "fid": "string", "mobileOptimization": number, "securityHeader": boolean }
  }`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }, { googleMaps: {} }],
        toolConfig: coords ? {
          retrievalConfig: {
            latLng: {
              latitude: coords.lat,
              longitude: coords.lng
            }
          }
        } : undefined
      },
    });

    const text = response.text || "";
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    const jsonStr = jsonMatch ? jsonMatch[0] : "[]";
    
    let rawLeads = [];
    try {
      rawLeads = JSON.parse(jsonStr);
    } catch (e) {
      console.error("JSON Parsing Error:", e, "Raw Text:", text);
      return [];
    }

    const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    const sources = groundingChunks.map((chunk: any) => {
      if (chunk.web) return { title: chunk.web.title, uri: chunk.web.uri };
      if (chunk.maps) return { title: chunk.maps.title, uri: chunk.maps.uri };
      return null;
    }).filter(Boolean);
    
    return rawLeads.map((l: any, index: number) => ({
      ...l,
      id: `lead-${Date.now()}-${index}`,
      location,
      propensityScore: calculatePropensityScore(l, weights),
      isMonitored: false,
      signals: l.signals || [],
      groundingSources: sources
    })).sort((a: Lead, b: Lead) => b.propensityScore - a.propensityScore);
  } catch (err) {
    console.error("API Call Failed:", err);
    return [];
  }
};

export const generateGrowthProfile = async (lead: Lead): Promise<string> => {
  const ai = getAIClient();
  const prompt = `Role: Lead Strategy Consultant for Connective Solutions. 
  Task: Generate a "Comprehensive Growth Profile" for the following lead.
  Lead Data:
  - Business: ${lead.businessName}
  - Decision Maker: ${lead.name} (${lead.title})
  - Niche: ${lead.niche}
  - Revenue: $${lead.revenue}M
  - Technical Flaws: ${lead.websiteFlaws.join(', ')}
  - Web Score: ${lead.webScore}/100
  - Metrics: ${lead.metrics.googleReviews} Google Reviews

  Generate the report in Markdown format following these specific sections:
  1. Business Deep-Dive (Firmographics, Market Positioning vs 3 Competitors, Social Proof Audit)
  2. The "Leak" Report (Technical Leaks, Conversion Leaks, Trust Leaks)
  3. Custom Solution Roadmap (Quick-Wins, Custom App Suggestion, 3-tier MRR Strategy)
  4. The "Closing" Playbook (The Hook, The Bridge, The Knockout Stat)

  TONE: Professional, elite, and data-driven. Make it look like a $5,000 professional audit report. Use bold headers and bullet points.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-pro-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 4000 }
      }
    });
    return response.text || "Failed to generate audit report.";
  } catch (err) {
    console.error("Audit Generation Failed:", err);
    return "Error generating profile.";
  }
};

export const refreshLeadSignals = async (
  leads: Lead[],
  weights: AlgorithmWeights
): Promise<Lead[]> => {
  if (leads.length === 0) return [];
  
  const ai = getAIClient();
  const leadContext = leads.map(l => ({
    id: l.id,
    businessName: l.businessName,
    currentScore: l.propensityScore,
    location: l.location
  }));

  const prompt = `Role: Connective Solutions Real-Time Intelligence Synchronizer.
  Target Leads: ${JSON.stringify(leadContext)}
  
  TASK:
  1. For each lead, search for NEW signals (recent LinkedIn posts, new Google Reviews, recent news).
  2. RE-CALCULATE their Propensity Score based on any new data found.
  3. If a significant new signal is found, generate a new 'LinkedInSignal' object.
  4. Return updates in the specified JSON format.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            updates: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  newPropensityScore: { type: Type.NUMBER },
                  newSignal: {
                    type: Type.OBJECT,
                    nullable: true,
                    properties: {
                      type: { type: Type.STRING },
                      content: { type: Type.STRING },
                      analysis: { type: Type.STRING }
                    }
                  },
                  revenueUpdate: { type: Type.NUMBER, nullable: true },
                  reviewsUpdate: { type: Type.NUMBER, nullable: true }
                },
                required: ["id", "newPropensityScore"]
              }
            }
          }
        }
      }
    });

    const updatesData = JSON.parse(response.text || '{"updates": []}');
    const updates = updatesData.updates || [];

    return leads.map(lead => {
      const update = updates.find((u: any) => u.id === lead.id);
      if (!update) return lead;

      const newSignals = [...(lead.signals || [])];
      if (update.newSignal) {
        newSignals.unshift({
          id: `sig-${Date.now()}`,
          timestamp: Date.now(),
          type: update.newSignal.type as any,
          content: update.newSignal.content,
          analysis: update.newSignal.analysis
        });
      }

      return {
        ...lead,
        propensityScore: update.newPropensityScore,
        revenue: update.revenueUpdate ?? lead.revenue,
        metrics: {
          ...lead.metrics,
          googleReviews: update.reviewsUpdate ?? (lead.metrics?.googleReviews || 0)
        },
        signals: newSignals.slice(0, 5)
      };
    });
  } catch (err) {
    console.error("Refresh signals failed:", err);
    return leads;
  }
};

export const analyzeSignalIntelligence = async (lead: Lead, signalContent: string): Promise<{ newIcebreaker: string, scoreAdjustment: number, analysis: string }> => {
  const ai = getAIClient();
  const prompt = `Lead: ${lead.businessName}
  Activity: "${signalContent}"
  Generate a new sharp icebreaker and propensity score adjustment (-5 to +15).`;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          newIcebreaker: { type: Type.STRING },
          scoreAdjustment: { type: Type.NUMBER },
          analysis: { type: Type.STRING }
        },
        required: ["newIcebreaker", "scoreAdjustment", "analysis"]
      }
    }
  });

  return JSON.parse(response.text || "{}");
};

export function decodeBase64(base64: string) {
  const binaryString = atob(base64);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) bytes[i] = binaryString.charCodeAt(i);
  return bytes;
}

export function encodeBase64(bytes: Uint8Array) {
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) binary += String.fromCharCode(bytes[i]);
  return btoa(binary);
}

export async function decodeAudioData(data: Uint8Array, ctx: AudioContext, sampleRate: number, numChannels: number): Promise<AudioBuffer> {
  const dataInt16 = new Int16Array(data.buffer);
  const frameCount = dataInt16.length / numChannels;
  const buffer = ctx.createBuffer(numChannels, frameCount, sampleRate);
  for (let channel = 0; channel < numChannels; channel++) {
    const channelData = buffer.getChannelData(channel);
    for (let i = 0; i < frameCount; i++) {
      channelData[i] = dataInt16[i * numChannels + channel] / 32768.0;
    }
  }
  return buffer;
}
