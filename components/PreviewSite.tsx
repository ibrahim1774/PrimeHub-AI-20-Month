
import React, { useState, useEffect } from 'react';
import { GeneratedWebsite, GeneratedImages } from '../types';
import Hero from './sections/Hero';
import Services from './sections/Services';
import Feature from './sections/Feature';
import IndustryValue from './sections/IndustryValue';
import BenefitsList from './sections/BenefitsList';
import Process from './sections/Process';
import FAQ from './sections/FAQ';
import EmergencyCTA from './sections/EmergencyCTA';
import Credentials from './sections/Credentials';
import OfferPopup from './sections/OfferPopup';
import Icon from './Icon';
import { renderToStaticMarkup } from 'react-dom/server';

// Helper to gather styles
const getPageStyles = () => {
  const styleTags = Array.from(document.getElementsByTagName('style')).map(s => s.outerHTML).join('\n');
  // For Tailwind in dev mode, it might be in style tags. In prod, link.
  // We'll try to capture all styles.
  return styleTags;
};

// SiteContent Component for Static Export
const SiteContent: React.FC<{ data: GeneratedWebsite; images: GeneratedImages }> = ({ data, images }) => {
  const formattedPhone = data.phone || "(555) 123-4567";
  return (
    <div className="bg-white min-h-screen relative font-inter overflow-x-hidden text-[16px]">
      <style>{`
        section {
          padding-top: 4.6rem !important; 
          padding-bottom: 4.6rem !important;
        }
        @media (max-width: 640px) {
          section {
            padding-top: 2.875rem !important;
            padding-bottom: 2.875rem !important;
          }
          body { font-size: 14px; }
        }
        /* Ensure font is available - Inter from Google Fonts */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;900&display=swap');
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      {/* Site Navigation */}
      <div className="bg-white border-b border-gray-100 py-3 md:py-4 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
        <div className="flex flex-col">
          <span className="font-black tracking-tighter text-base md:text-lg uppercase leading-none text-[#1A1D2E]">
            {data.companyName}
          </span>
        </div>

        <a
          href={`tel:${formattedPhone}`}
          style={{ backgroundColor: data.brandColor }}
          className="text-white font-black px-4 md:px-8 py-2.5 md:py-3.5 rounded shadow-lg flex items-center gap-2 whitespace-nowrap text-[10px] md:text-xs tracking-widest uppercase"
        >
          <span className="inline">GET AN ESTIMATE:</span>
          <span>{formattedPhone}</span>
        </a>
      </div>

      <main className="pb-16">
        <Hero
          data={data.hero}
          image={images.heroBackground}
          brandColor={data.brandColor}
          location={data.location}
          phone={formattedPhone}
          ctaText={data.ctaVariations.callAndText}
        />

        <Services
          data={data.services}
          brandColor={data.brandColor}
          phone={formattedPhone}
        />

        <IndustryValue
          data={data.industryValue}
          image={images.industryValue}
          brandColor={data.brandColor}
          companyName={data.companyName}
        />

        <Feature
          data={data.featureHighlight}
          brandColor={data.brandColor}
        />

        <BenefitsList
          data={data.benefits}
          brandColor={data.brandColor}
          companyName={data.companyName}
        />

        <Process data={data.processSteps} brandColor={data.brandColor} />

        <EmergencyCTA
          data={data.emergencyCTA}
          brandColor={data.brandColor}
          phone={formattedPhone}
          ctaText={data.ctaVariations.speakWithTeam}
        />

        <Credentials
          data={data.credentials}
          image={images.credentialsShowcase}
          brandColor={data.brandColor}
          industry={data.industry}
          location={data.location}
        />

        <FAQ faqs={data.faqs} brandColor={data.brandColor} />
      </main>

      {/* We exclude popup from static export to avoid instant popup on load usually, or keep it if desired */}
    </div>
  );
};

interface PreviewSiteProps {
  data: GeneratedWebsite;
  images: GeneratedImages;
  onExit: () => void;
}

const PreviewSite: React.FC<PreviewSiteProps> = ({ data, images, onExit }) => {
  const [showPopup, setShowPopup] = useState(false);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState('');
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);

  const handleClaimSite = async () => {
    if (isClaiming) return;

    setIsClaiming(true);
    setClaimStatus("Preparing for checkout...");

    try {
      // 1. Upload Images to GCS
      setClaimStatus("Uploading assets...");
      const uploadedImages: any = { ...images };
      const imageKeys = Object.keys(images) as Array<keyof GeneratedImages>;

      for (const key of imageKeys) {
        const base64 = images[key];
        if (base64?.startsWith('data:')) {
          const filename = `pending/assets/${data.companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${key}_${Date.now()}.png`;
          const uploadRes = await fetch('/api/upload', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ image: base64, filename })
          });

          if (!uploadRes.ok) throw new Error(`Failed to upload ${key}`);
          const { url } = await uploadRes.json();
          uploadedImages[key] = url;
        }
      }

      // 2. Generate Static HTML & Sync to GCS
      setClaimStatus("Syncing site data...");
      const staticContent = renderToStaticMarkup(
        <SiteContent data={data} images={uploadedImages} />
      );
      const styles = getPageStyles();
      const finalHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.companyName} - Trusted ${data.industry} Services</title>
    <meta name="description" content="Professional ${data.industry} services in ${data.location}. Trusted, reliable, and local. Call ${data.phone}.">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        primary: '${data.brandColor}',
                    },
                    fontFamily: {
                        inter: ['Inter', 'sans-serif'],
                    }
                }
            }
        }
    </script>
    ${styles}
</head>
<body>
    ${staticContent}
</body>
</html>`;

      const pendingId = `site_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      const syncRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: btoa(finalHtml), // Store HTML as base64 string
          filename: `pending/html/${pendingId}.html`
        })
      });

      if (!syncRes.ok) throw new Error("Failed to sync site data");

      // 3. Initiate Checkout Redirect
      setClaimStatus("Redirecting to Stripe...");

      // We call our API to get a checkout session
      const checkoutRes = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingId, companyName: data.companyName })
      });

      if (!checkoutRes.ok) throw new Error("Failed to create checkout session");
      const { url } = await checkoutRes.json();

      // Redirect to Stripe
      window.location.href = url;

    } catch (error: any) {
      console.error("Claim Error:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsClaiming(false);
    }
  };

  useEffect(() => {
    const timer = setTimeout(() => setShowPopup(true), 3000);
    return () => clearTimeout(timer);
  }, []);

  const formattedPhone = data.phone || "(555) 123-4567";

  return (
    <div className="bg-white min-h-screen relative font-inter overflow-x-hidden max-sm:text-[85%]">
      <style>{`
        section {
          padding-top: 4.6rem !important; 
          padding-bottom: 4.6rem !important;
        }
        @media (max-width: 640px) {
          section {
            padding-top: 2.875rem !important;
            padding-bottom: 2.875rem !important;
          }
          body { font-size: 14px; }
        }
      `}</style>

      {/* Site Navigation - Adjusted sticky top to 0 since banner is removed */}
      <div className="bg-white border-b border-gray-100 py-3 md:py-4 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm transition-all">
        <div className="flex flex-col">
          <span className="font-black tracking-tighter text-base md:text-lg uppercase leading-none text-[#1A1D2E] max-sm:text-sm">
            {data.companyName}
          </span>
        </div>

        <a
          href={`tel:${formattedPhone}`}
          style={{ backgroundColor: data.brandColor }}
          className="text-white font-black px-4 md:px-8 py-2.5 md:py-3.5 rounded shadow-lg hover:brightness-110 flex items-center gap-2 whitespace-nowrap text-[10px] md:text-xs tracking-widest uppercase transition-all active:scale-95 max-sm:px-3 max-sm:py-2"
        >
          <span className="hidden sm:inline">GET AN ESTIMATE:</span>
          <span>{formattedPhone}</span>
        </a>
      </div>

      <main className="pb-16">
        <Hero
          data={data.hero}
          image={images.heroBackground}
          brandColor={data.brandColor}
          location={data.location}
          phone={formattedPhone}
          ctaText={data.ctaVariations.callAndText}
        />

        <Services
          data={data.services}
          brandColor={data.brandColor}
          phone={formattedPhone}
        />

        <IndustryValue
          data={data.industryValue}
          image={images.industryValue}
          brandColor={data.brandColor}
          companyName={data.companyName}
        />

        <Feature
          data={data.featureHighlight}
          brandColor={data.brandColor}
        />

        <BenefitsList
          data={data.benefits}
          brandColor={data.brandColor}
          companyName={data.companyName}
        />

        <Process data={data.processSteps} brandColor={data.brandColor} />

        <EmergencyCTA
          data={data.emergencyCTA}
          brandColor={data.brandColor}
          phone={formattedPhone}
          ctaText={data.ctaVariations.speakWithTeam}
        />

        <Credentials
          data={data.credentials}
          image={images.credentialsShowcase}
          brandColor={data.brandColor}
          industry={data.industry}
          location={data.location}
        />

        {/* FAQ is now the very last section */}
        <FAQ faqs={data.faqs} brandColor={data.brandColor} />
      </main>


      {showPopup && <OfferPopup />}

      {/* Claim Site Floating Action Bar */}
      <div className="fixed bottom-6 right-6 z-[100] flex gap-4">
        {isClaiming && (
          <div className="bg-black/80 text-white px-6 py-3 rounded-full shadow-xl backdrop-blur-md animate-pulse font-medium">
            {claimStatus}
          </div>
        )}

        {!isClaiming && !deployedUrl && (
          <button
            onClick={handleClaimSite}
            className="bg-black hover:bg-gray-900 text-white font-bold text-lg px-8 py-4 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 border-4 border-white"
          >
            <span>🚀</span>
            CLAIM THIS SITE
          </button>
        )}

        {deployedUrl && (
          <a
            href={deployedUrl}
            target="_blank"
            rel="noreferrer"
            className="bg-blue-600 hover:bg-blue-500 text-white font-bold text-lg px-8 py-4 rounded-full shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-3 border-4 border-white"
          >
            <span>🌐</span>
            VIEW LIVE SITE
          </a>
        )}
      </div>
    </div>
  );
};

export default PreviewSite;
