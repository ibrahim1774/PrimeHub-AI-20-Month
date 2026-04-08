import { useState, useCallback, useRef, useEffect } from 'react';
import { FormData, GeneratedWebsite, GeneratedImages, ExtractedContent } from '../types';
import { generateWebsiteContent, generateImage, searchUnsplashImages, searchPixabayImages } from '../services/geminiService';

const LOADING_MESSAGES = [
  "Initializing project structure...",
  "Assembling page layout and sections...",
  "Generating content and service details...",
  "Applying responsive styling for all devices...",
  "Placing images and visual elements...",
  "Finalizing calls to action and interactions...",
  "Running final checks before completion..."
];

export const useWebsiteGenerator = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [statusMessage, setStatusMessage] = useState('');
  const [generatedData, setGeneratedData] = useState<GeneratedWebsite | null>(null);
  const [generatedImages, setGeneratedImages] = useState<GeneratedImages | null>(null);
  const [error, setError] = useState<string | null>(null);

  const targetProgress = useRef(0);
  const progressTimer = useRef<number | null>(null);
  const messageInterval = useRef<number | null>(null);

  // Restore persisted state on mount
  useEffect(() => {
    try {
      const savedData = sessionStorage.getItem('primehub_generatedData');
      const savedImages = sessionStorage.getItem('primehub_generatedImages');
      if (savedData && savedImages) {
        setGeneratedData(JSON.parse(savedData));
        setGeneratedImages(JSON.parse(savedImages));
      }
    } catch (e) {
      console.warn('[Generator] Failed to restore from sessionStorage:', e);
    }
  }, []);

  useEffect(() => {
    if (isGenerating) {
      progressTimer.current = window.setInterval(() => {
        setProgress(prev => {
          if (prev < targetProgress.current) {
            const step = (targetProgress.current - prev) * 0.05;
            return Math.min(prev + Math.max(0.05, step), 100);
          }
          if (prev < 99.5) return prev + 0.03;
          return prev;
        });
      }, 60);

      let msgIdx = 0;
      setStatusMessage(LOADING_MESSAGES[0]);
      messageInterval.current = window.setInterval(() => {
        msgIdx = (msgIdx + 1) % LOADING_MESSAGES.length;
        setStatusMessage(LOADING_MESSAGES[msgIdx]);
      }, 2500);
    } else {
      if (progressTimer.current) clearInterval(progressTimer.current);
      if (messageInterval.current) clearInterval(messageInterval.current);
    }
    return () => {
      if (progressTimer.current) clearInterval(progressTimer.current);
      if (messageInterval.current) clearInterval(messageInterval.current);
    };
  }, [isGenerating]);

  const generateWebsite = useCallback(async (formData: FormData) => {
    console.log("[Generator] Initiating synthesis sequence...");
    setIsGenerating(true);
    setProgress(0);
    targetProgress.current = 10;
    setError(null);
    setGeneratedData(null);
    setGeneratedImages(null);

    try {
      // Step 0: Extract content from profiles if provided
      let extractedContent: ExtractedContent | undefined;
      const hasProfileLinks = formData.profileLinks &&
        (formData.profileLinks.googleBusiness || formData.profileLinks.instagram || formData.profileLinks.facebook);

      if (hasProfileLinks) {
        console.log("[Generator] Step 0: Extracting content from profiles...");
        setStatusMessage("Importing content from your profiles...");
        targetProgress.current = 15;
        try {
          const extractRes = await fetch('/api/extract-profiles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              profileLinks: formData.profileLinks,
              companyName: formData.companyName,
              serviceArea: formData.serviceArea,
            }),
          });
          if (extractRes.ok) {
            extractedContent = await extractRes.json();
            console.log(`[Generator] Extracted ${extractedContent?.photos?.length || 0} photos, source: ${extractedContent?.source?.join(', ')}`);
          }
        } catch (extractErr) {
          console.warn("[Generator] Profile extraction failed, continuing with AI generation:", extractErr);
        }
      }

      console.log("[Generator] Step 1: Initiating Parallel Generation (Text + Images)");
      targetProgress.current = 30;

      // Define standard industry fallbacks
      const getFallback = (type: 'hero' | 'value') => {
        const industry = formData.industry.toLowerCase();
        // Dynamic construction of high-quality Unsplash industry shots
        const terms: Record<string, string> = {
          hero: `${industry} professional service site`,
          value: `${industry} technician working repair`
        };
        return `https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1200`; // High-quality generic construction/service default
      };

      // Fire all requests at once (Text + Smart Image Queries)
      const contentPromise = generateWebsiteContent(
        formData.industry,
        formData.companyName,
        formData.serviceArea,
        formData.phone,
        formData.brandColor,
        extractedContent
      );

      // Use extracted photos when available, fall back to AI generation
      const extractedPhotos = extractedContent?.photos || [];

      const heroGenPromise = extractedPhotos.length >= 1
        ? Promise.resolve(extractedPhotos[0])
        : generateImage(`Wide angle hero shot of ${formData.industry} professional team on site, daylight`, "16:9");
      const valueGenPromise = extractedPhotos.length >= 2
        ? Promise.resolve(extractedPhotos[1])
        : generateImage(`Close-up of ${formData.industry} technician working with specialized tools`, "4:3");

      // Wait for content and images
      const [content, heroUrl, valueUrl] = await Promise.all([
        contentPromise,
        heroGenPromise,
        valueGenPromise
      ]);

      // Resolve images with robust fallback logic and GUARANTEED UNIQUENESS
      const usedUrls = new Set<string>();

      const resolveWithFallback = async (primaryUrl: string, query: string, fallbackType: 'hero' | 'value') => {
        // 1. If Gemini succeeded and is unique, use it
        if (primaryUrl && !usedUrls.has(primaryUrl)) {
          usedUrls.add(primaryUrl);
          return primaryUrl;
        }

        console.warn(`[Generator] Gemini fallback or duplicate for ${fallbackType}, searching alternatives...`);

        // 2. Try Pixabay search (fetch 5 to ensure we find a unique one)
        const pixabayHits = await searchPixabayImages(query, "landscape", 5);
        const uniquePixabay = pixabayHits.find(h => !usedUrls.has(h.url));
        if (uniquePixabay) {
          usedUrls.add(uniquePixabay.url);
          return uniquePixabay.url;
        }

        // 3. Try Unsplash search (fetch 5 to ensure we find a unique one)
        const unsplashHits = await searchUnsplashImages(query, "landscape", 5);
        const uniqueUnsplash = unsplashHits.find(h => !usedUrls.has(h.url));
        if (uniqueUnsplash) {
          usedUrls.add(uniqueUnsplash.url);
          return uniqueUnsplash.url;
        }

        // 4. Last resort: Static
        return getFallback(fallbackType);
      };

      const heroImg = await resolveWithFallback(heroUrl, `${formData.industry} service truck team`, 'hero');
      const valueImg = await resolveWithFallback(valueUrl, `${formData.industry} technician tools detail`, 'value');

      targetProgress.current = 80;
      setGeneratedData(content);

      setGeneratedImages({
        heroBackground: heroImg,
        industryValue: valueImg,
      });

      console.log("[Generator] Synthesis complete.");
      targetProgress.current = 100;
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsGenerating(false);

      // Persist to sessionStorage for refresh resilience
      try {
        sessionStorage.setItem('primehub_generatedData', JSON.stringify(content));
        sessionStorage.setItem('primehub_generatedImages', JSON.stringify({
          heroBackground: heroImg,
          industryValue: valueImg,
        }));
      } catch (e) {
        console.warn('[Generator] Failed to persist to sessionStorage:', e);
      }

    } catch (err: any) {
      console.error("[Generator Error]:", err);
      // Surface actual error message if it's readable, else fallback
      const readableError = err.message || "An unexpected synthesis error occurred.";
      setError(readableError);
      setIsGenerating(false);
    }
  }, []);

  const resetGenerator = () => {
    setGeneratedData(null);
    setGeneratedImages(null);
    setProgress(0);
    targetProgress.current = 0;
    setStatusMessage('');
    setError(null);
    setIsGenerating(false);
    try {
      sessionStorage.removeItem('primehub_generatedData');
      sessionStorage.removeItem('primehub_generatedImages');
    } catch (e) {}
  };

  return {
    isGenerating,
    progress: Math.floor(progress),
    statusMessage,
    generatedData,
    generatedImages,
    error,
    generateWebsite,
    resetGenerator
  };
};
