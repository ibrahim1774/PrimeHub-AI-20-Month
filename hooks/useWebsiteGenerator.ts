import { useState, useCallback, useRef, useEffect } from 'react';
import { FormData, GeneratedWebsite, GeneratedImages } from '../types';
import { generateWebsiteContent, generateImage } from '../services/geminiService';

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
    setIsGenerating(true);
    setProgress(0);
    targetProgress.current = 10;
    setError(null);
    setGeneratedData(null);
    setGeneratedImages(null);

    try {
      targetProgress.current = 25;
      const content = await generateWebsiteContent(
        formData.industry, 
        formData.companyName, 
        formData.serviceArea, 
        formData.phone, 
        formData.brandColor
      ).catch(err => {
        throw new Error("Content Synthesis Failed: " + (err.message || "Unknown error"));
      });
      
      setGeneratedData(content);
      targetProgress.current = 50;

      const [heroImg, valueImg, credImg] = await Promise.all([
        generateImage(`Candid high-end professional photography of ${formData.industry} technicians at a project site in ${formData.serviceArea}, 16:9`, "16:9"),
        generateImage(`Action shot of a professional ${formData.industry} technician performing a repair, cinematic lighting, 4:3`, "4:3"),
        generateImage(`Professional ${formData.industry} service team with vehicle, daylight, high-quality photorealistic 16:9`, "16:9")
      ]).catch(err => {
        throw new Error("Image Synthesis Failed: " + (err.message || "Unknown error"));
      });
      
      setGeneratedImages({
        heroBackground: heroImg,
        industryValue: valueImg,
        credentialsShowcase: credImg,
      });

      targetProgress.current = 100;
      await new Promise(resolve => setTimeout(resolve, 800));
      setIsGenerating(false);
      
    } catch (err: any) {
      console.error("Synthesis failed:", err);
      setError(err.message || "An error occurred during synthesis. Please re-initiate the request.");
      setIsGenerating(false);
      setGeneratedData(null);
      setGeneratedImages(null);
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
