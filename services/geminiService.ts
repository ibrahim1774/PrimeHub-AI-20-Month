
import { GoogleGenAI, Type } from "@google/genai";
import { GeneratedWebsite } from "../types";

const getAI = () => {
  // Prioritize GEMINI_API_KEY for Vercel production, fallback to API_KEY for Studio/Local
  const apiKey = process.env.GEMINI_API_KEY || process.env.API_KEY;

  if (!apiKey) {
    console.error("CRITICAL: Gemini API key is missing from environment variables.");
    throw new Error("Missing server env var. Set GEMINI_API_KEY (or API_KEY) in Vercel for Production.");
  }

  return new GoogleGenAI({ apiKey });
};

const getUnsplashKey = () => {
  return process.env.UNSPLASH_ACCESS_KEY || "3JabxFut430D5h-XZmnhE4eMhGHgDfiD_IuqtoSfWZo";
};

/**
 * Robustly extracts and parses JSON from a model response, 
 * handling potential markdown code blocks or extra text.
 */
const parseModelResponse = (text: string) => {
  try {
    // Attempt to find JSON block if model wrapped it in markdown
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const cleanStr = jsonMatch ? jsonMatch[0] : text.trim();
    return JSON.parse(cleanStr);
  } catch (e) {
    console.error("RAW MODEL OUTPUT:", text);
    console.error("JSON PARSE ERROR:", e);
    throw new Error("Failed to parse synthesis response. The model output was malformed.");
  }
};

export const generateWebsiteContent = async (industry: string, companyName: string, location: string, phone: string, brandColor: string): Promise<GeneratedWebsite> => {
  console.log(`[Synthesis] Starting content generation for: ${companyName} (${industry})`);

  const ai = getAI();
  const prompt = `Act as a senior conversion-focused copywriter for ${industry}. 
  Generate website content JSON for "${companyName}" in ${location}. Phone: ${phone}.

  STRICT CONTENT RULES:
  1. DO NOT include any contact forms, email addresses, or "Contact Us" pages.
  2. DO NOT include email links or mentions of emails.
  3. ALL actions must be phone-based. 
  4. Use neutral, trustworthy language. DO NOT use "best", "elite", "#1". Use "Local", "Trusted", "Reliable".
  5. Mention "${companyName}" exactly 3-4 times total across the page.
  6. Industry Value: Explain why ${industry} is critical for ${location} property owners.
  7. Generate EXACTLY 4 FAQ items. These should be universal, non-industry-specific common sense topics:
     - Scheduling (How quickly can you start?)
     - Estimates (How do your estimates work?)
     - Service Area (Where do you work?)
     - Satisfaction Guarantee (What if I'm not happy with the work?)
  8. Our Work Section: Generate title as "Our Work" and subtitle as "Real photos from our recent projects in ${location}."
  9. Provide 4 unique CTA variations. 
     CRITICAL: DO NOT include the phone number ${phone} in these text strings. 
     Only provide the action phrase (e.g., "Request a Quote", "Get an Estimate", "Speak With Our Team", "Call & Text").
     The application will append the phone number to these phrases automatically.

  RETURN RAW JSON ONLY. NO MARKDOWN.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
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
            faqs: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  answer: { type: Type.STRING }
                },
                required: ["question", "answer"]
              },
              minItems: 4,
              maxItems: 4
            },

            ourWork: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                subtitle: { type: Type.STRING }
              },
              required: ["title", "subtitle"]
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
                requestQuote: { type: Type.STRING, description: "Action phrase ONLY, e.g., Request a Quote" },
                getEstimate: { type: Type.STRING, description: "Action phrase ONLY, e.g., Get an Estimate" },
                speakWithTeam: { type: Type.STRING, description: "Action phrase ONLY, e.g., Speak With Our Team" },
                callAndText: { type: Type.STRING, description: "Action phrase ONLY, e.g., Call & Text" }
              },
              required: ["requestQuote", "getEstimate", "speakWithTeam", "callAndText"]
            }
          },
          required: ["companyName", "brandColor", "industry", "location", "phone", "hero", "services", "industryValue", "featureHighlight", "benefits", "processSteps", "ourWork", "faqs", "emergencyCTA", "credentials", "ctaVariations"]
        }
      }
    });

    console.log("[Synthesis] Content response received.");
    return parseModelResponse(response.text);
  } catch (error: any) {
    console.error("[Synthesis Error] Content failure:", error);
    throw error;
  }
};

export const generateImage = async (prompt: string, aspectRatio: "1:1" | "16:9" | "3:4" | "4:3" | "9:16" = "1:1"): Promise<string> => {
  console.log(`[Synthesis] Requesting image for prompt: ${prompt.substring(0, 50)}...`);
  const ai = getAI();

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{
          text: `${prompt}. Photorealistic commercial photography. Show real workers on site using safety gear. Natural lighting, candid but professional, NO text overlays.`
        }]
      },
      config: { imageConfig: { aspectRatio } },
    });

    for (const part of response.candidates[0].content.parts) {
      if (part.inlineData) {
        console.log("[Synthesis] Image data received.");
        const base64EncodeString: string = part.inlineData.data;
        return `data:image/png;base64,${base64EncodeString}`;
      }
    }
    throw new Error("Model returned no image data.");
  } catch (error: any) {
    console.warn("[Synthesis Warning] Image failure, returning null for fallback:", error);
    return ""; // Return empty string to trigger fallback in the hook
  }
};

export const searchUnsplashImages = async (
  query: string,
  orientation: "landscape" | "portrait" | "squarish" = "landscape",
  count: number = 1,
  excludeIds: string[] = []
): Promise<{ url: string; id: string }[]> => {
  const apiKey = getUnsplashKey();
  console.log(`[Unsplash] Human-like search for: "${query}" (Target: ${count} images)`);

  try {
    // 1. Fetch a "page" of results to simulate scanning the top of Unsplash.com
    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&orientation=${orientation}&per_page=25&order_by=relevant&content_filter=high&client_id=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.statusText}`);
    }

    const data = await response.json();
    const results = data.results || [];

    if (results.length === 0) return [];

    // 2. Human-like Filtering & Scoring Logic
    const scoredResults = results.map((img: any, index: number) => {
      let score = 0;
      const meta = (img.alt_description || "" + " " + (img.description || "")).toLowerCase();
      const tags = (img.tags || []).map((t: any) => t.title.toLowerCase()).join(" ");

      // Prefer "top of page" results (relevance ranking from Unsplash)
      if (index < 8) score += 10;

      // Relevance Check: Boost if primary keywords are found
      const primaryQuery = query.split(" ")[0].toLowerCase();
      if (meta.includes(primaryQuery) || tags.includes(primaryQuery)) score += 5;

      // "Action/Professional" Boost
      const actionKeywords = ["work", "technician", "tools", "repair", "service", "contractor", "crew", "project"];
      if (actionKeywords.some(k => meta.includes(k) || tags.includes(k))) score += 3;

      // Quality Check: Penalize illustrations/graphics
      const graphicKeywords = ["illustration", "vector", "3d render", "drawing", "graphic", "logo"];
      if (graphicKeywords.some(k => meta.includes(k) || tags.includes(k))) score -= 20;

      // Penalize off-topic vibes for contractors
      const offTopicKeywords = ["office", "laptop", "meeting", "suit", "fashion", "nature"];
      if (offTopicKeywords.some(k => meta.includes(k) || tags.includes(k))) score -= 5;

      return { img, score };
    });

    // 3. Selection
    // Filter out excluded IDs and very low scores
    const filtered = scoredResults
      .filter((item: any) => !excludeIds.includes(item.img.id) && item.score > 0)
      .sort((a: any, b: any) => b.score - a.score);

    // Take the top requested number
    return filtered.slice(0, count).map((item: any) => ({
      url: item.img.urls.regular,
      id: item.img.id
    }));

  } catch (error) {
    console.error("[Unsplash Error]:", error);
    return [];
  }
};

/**
 * Legacy wrapper for single image search
 */
export const searchUnsplashImage = async (query: string, orientation: "landscape" | "portrait" | "squarish" = "landscape"): Promise<string> => {
  const results = await searchUnsplashImages(query, orientation, 1);
  return results.length > 0 ? results[0].url : "";
};
