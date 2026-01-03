import { useState, useCallback, useRef, useEffect } from 'react';
import { FormData, GeneratedWebsite, GeneratedImages } from '../types';
import { generateWebsiteContent, generateImage, searchUnsplashImages } from '../services/geminiService';

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
      console.log("[Generator] Step 1: Initiating Parallel Generation (Text + Images)");
      targetProgress.current = 30;

      // Define standard industry fallbacks
      const getFallback = (type: 'hero' | 'value' | 'cred') => {
        const industry = formData.industry.toLowerCase();
        // Dynamic construction of high-quality Unsplash industry shots
        const terms: Record<string, string> = {
          hero: `${industry} professional service site`,
          value: `${industry} technician working repair`,
          cred: `${industry} service truck team`
        };
        return `https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&q=80&w=1200`; // High-quality generic construction/service default
      };

      // Fire all requests at once (Text + Smart Image Queries)
      const contentPromise = generateWebsiteContent(
        formData.industry,
        formData.companyName,
        formData.serviceArea,
        formData.phone,
        formData.brandColor
      );

      // Smart Image Intent Strategy (Batched for deduplication)
      const heroBatchPromise = searchUnsplashImages(`${formData.industry} professional technician working`, "landscape", 5);
      const valueBatchPromise = searchUnsplashImages(`${formData.industry} repair tools`, "landscape", 5);
      const credBatchPromise = searchUnsplashImages(`${formData.industry} team professional`, "landscape", 5);

      // Wait for everything to finish concurrently
      const [content, heroBatch, valueBatch, credBatch] = await Promise.all([
        contentPromise,
        heroBatchPromise,
        valueBatchPromise,
        credBatchPromise
      ]);

      // Resolve images while ensuring uniqueness (Deduplication)
      const usedIds = new Set<string>();
      const pickUnique = (batch: { url: string; id: string }[]) => {
        const found = batch.find(img => !usedIds.has(img.id)) || batch[0];
        if (found) {
          usedIds.add(found.id);
          return found.url;
        }
        return "";
      };

      const heroImg = pickUnique(heroBatch);
      const valueImg = pickUnique(valueBatch);
      const credImg = pickUnique(credBatch);

      targetProgress.current = 80;
      setGeneratedData(content);

      setGeneratedImages({
        heroBackground: heroImg || getFallback('hero'),
        industryValue: valueImg || getFallback('value'),
        credentialsShowcase: credImg || getFallback('cred'),
        ourWorkImages: [null, null, null, null],
      });

      console.log("[Generator] Synthesis complete.");
      targetProgress.current = 100;
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsGenerating(false);

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
