import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedWebsite } from "../types";

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

const cleanJsonString = (str: string): string => {
  // Removes potential markdown code block wrappers if the model ignores the mimeType setting
  return str.replace(/^```json\n?/, '').replace(/```\n?$/, '').trim();
};

export const generateWebsiteContent = async (industry: string, companyName: string, location: string, phone: string, brandColor: string): Promise<GeneratedWebsite> => {
  const ai = getAI();
  const prompt = `Act as a senior conversion-focused copywriter for the ${industry} industry. 
  Generate a comprehensive website content structure in JSON format for "${companyName}" located in ${location}. 
  Contact Phone: ${phone}.

  STRICT CONTENT RULES:
  1. FORBIDDEN: Do not include contact forms, email addresses, or email links.
  2. FORBIDDEN: Do not use hyperbolic words like "best", "elite", or "#1". Use "Reliable", "Professional", "Local".
  3. MANDATORY: All user actions must be phone-call based.
  4. MANDATORY: Mention the brand name "${companyName}" exactly 3 times in the content.
  5. CTA VARIATIONS: Provide 4 unique action phrases (e.g., "Request a Quote", "Speak With Our Team"). 
     IMPORTANT: DO NOT include the phone number ${phone} inside these specific text strings; the app handles that.

  RETURN VALID RAW JSON ONLY.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [{ parts: [{ text: prompt }] }],
      config: {
        thinkingConfig: { thinkingBudget: 0 }, // Minimize latency for layout generation
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            companyName: { type: Type.STRING },
            brandColor: { type: Type.STRING },
            industry: { type: Type.STRING },
            location: { type: Type.STRING },
            phone: { type: Type.STRING },
            hero: {
              type: Type.OBJECT,
              properties: {
                badge: { type: Type.STRING },
                headline: {
                  type: Type.OBJECT,
                  properties: {
                    line1: { type: Type.STRING },
                    line2: { type: Type.STRING },
                    line3: { type: Type.STRING }
                  },
                  required: ["line1", "line2", "line3"]
                },
                subtext: { type: Type.STRING },
                trustIndicators: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { icon: { type: Type.STRING }, label: { type: Type.STRING }, sublabel: { type: Type.STRING } },
                    required: ["icon", "label", "sublabel"]
                  }
                }
              },
              required: ["badge", "headline", "subtext", "trustIndicators"]
            },
            services: {
              type: Type.OBJECT,
              properties: {
                badge: { type: Type.STRING },
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                cards: {
                  type: Type.ARRAY,
                  minItems: 4,
                  maxItems: 4,
                  items: {
                    type: Type.OBJECT,
                    properties: { icon: { type: Type.STRING }, title: { type: Type.STRING }, description: { type: Type.STRING } },
                    required: ["icon", "title", "description"]
                  }
                }
              },
              required: ["badge", "title", "subtitle", "cards"]
            },
            industryValue: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                content: { type: Type.STRING },
                subtext: { type: Type.STRING }
              },
              required: ["title", "content", "subtext"]
            },
            featureHighlight: {
              type: Type.OBJECT,
              properties: {
                badge: { type: Type.STRING },
                headline: { type: Type.STRING },
                cards: {
                  type: Type.ARRAY,
                  minItems: 4,
                  maxItems: 4,
                  items: {
                    type: Type.OBJECT,
                    properties: { icon: { type: Type.STRING }, title: { type: Type.STRING }, description: { type: Type.STRING } },
                    required: ["icon", "title", "description"]
                  }
                }
              },
              required: ["badge", "headline", "cards"]
            },
            benefits: {
              type: Type.OBJECT,
              properties: { 
                title: { type: Type.STRING }, 
                intro: { type: Type.STRING },
                items: { type: Type.ARRAY, items: { type: Type.STRING }, minItems: 5, maxItems: 6 } 
              },
              required: ["title", "intro", "items"]
            },
            processSteps: {
              type: Type.OBJECT,
              properties: {
                badge: { type: Type.STRING },
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING },
                steps: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: { title: { type: Type.STRING }, description: { type: Type.STRING }, icon: { type: Type.STRING } },
                    required: ["title", "description", "icon"]
                  }
                }
              },
              required: ["badge", "title", "subtitle", "steps"]
            },
            emergencyCTA: {
              type: Type.OBJECT,
              properties: { headline: { type: Type.STRING }, subtext: { type: Type.STRING }, buttonText: { type: Type.STRING } },
              required: ["headline", "subtext", "buttonText"]
            },
            credentials: {
              type: Type.OBJECT,
              properties: {
                badge: { type: Type.STRING },
                headline: { type: Type.STRING },
                description: { type: Type.STRING },
                items: { type: Type.ARRAY, items: { type: Type.STRING } },
                certificationText: { type: Type.STRING }
              },
              required: ["badge", "headline", "description", "items", "certificationText"]
            },
            ctaVariations: {
              type: Type.OBJECT,
              properties: {
                requestQuote: { type: Type.STRING },
                getEstimate: { type: Type.STRING },
                speakWithTeam: { type: Type.STRING },
                callAndText: { type: Type.STRING }
              },
              required: ["requestQuote", "getEstimate", "speakWithTeam", "callAndText"]
            }
          },
          required: ["companyName", "brandColor", "industry", "location", "phone", "hero", "services", "industryValue", "featureHighlight", "benefits", "processSteps", "emergencyCTA", "credentials", "ctaVariations"]
        }
      }
    });

    const jsonStr = cleanJsonString(response.text || "");
    return JSON.parse(jsonStr);
  } catch (error) {
    console.error("Content generation failed:", error);
    throw error;
  }
};

export const generateImage = async (prompt: string, aspectRatio: "1:1" | "16:9" | "3:4" | "4:3" | "9:16" = "1:1"): Promise<string> => {
  const ai = getAI();
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [{ parts: [{ text: `${prompt}. Photorealistic commercial photography. Show workers on site. Professional lighting, candid, high resolution.` }] }],
      config: { imageConfig: { aspectRatio } },
    });

    for (const part of response.candidates?.[0]?.content?.parts || []) {
      if (part.inlineData) {
        return `data:image/png;base64,${part.inlineData.data}`;
      }
    }
    throw new Error("No image data returned from API");
  } catch (error) {
    console.error("Image generation failed:", error);
    throw error;
  }
};
