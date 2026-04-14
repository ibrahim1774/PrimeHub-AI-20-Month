
import React, { useState } from 'react';
import { GeneratedWebsite, GeneratedImages } from '../types';
import Hero from './sections/Hero';
import Services from './sections/Services';
import Feature from './sections/Feature';
import IndustryValue from './sections/IndustryValue';
import BenefitsList from './sections/BenefitsList';
import Process from './sections/Process';
import FAQ from './sections/FAQ';
import EmergencyCTA from './sections/EmergencyCTA';
import LeadForm from './sections/LeadForm';
import ChatWidget from './sections/ChatWidget';
import DeployPopup from './sections/DeployPopup';
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

      <main className="pb-52">
        <Hero
          data={data.hero}
          image={images.heroBackground}
          brandColor={data.brandColor}
          location={data.location}
          phone={formattedPhone}
          ctaText={data.ctaVariations.callAndText}
        />

        <LeadForm brandColor={data.brandColor} phone={formattedPhone} companyName={data.companyName} />

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

        <FAQ faqs={data.faqs} brandColor={data.brandColor} />
      </main>
    </div>
  );
};

interface PreviewSiteProps {
  data: GeneratedWebsite;
  images: GeneratedImages;
  onExit: () => void;
}

const PreviewSite: React.FC<PreviewSiteProps> = ({ data: initialData, images: initialImages, onExit }) => {
  const [showPopup] = useState(true);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimStatus, setClaimStatus] = useState('');
  const [deployedUrl, setDeployedUrl] = useState<string | null>(null);

  const [data] = useState<GeneratedWebsite>(initialData);
  const [images] = useState<GeneratedImages>(initialImages);

  const handleClaimSite = async (plan: 'monthly' | 'yearly' = 'monthly') => {
    if (isClaiming) return;

    setIsClaiming(true);
    setClaimStatus("Preparing for checkout...");

    try {
      // 1. Upload Images to GCS
      setClaimStatus("Uploading assets...");
      const imageKeys = Object.keys(images) as Array<keyof GeneratedImages>;
      const uploadTasks: Promise<void>[] = [];
      const uploadedImages: GeneratedImages = JSON.parse(JSON.stringify(images));

      imageKeys.forEach(key => {
        const value = images[key];

        if (typeof value === 'string' && value.startsWith('data:')) {
          const filename = `pending/assets/${data.companyName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${key}_${Date.now()}.png`;
          uploadTasks.push(
            fetch('/api/upload', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ image: value, filename })
            }).then(async res => {
              if (!res.ok) throw new Error(`Failed to upload ${key}`);
              const { url } = await res.json();
              (uploadedImages as any)[key] = url;
            })
          );
        }
      });

      if (uploadTasks.length > 0) {
        await Promise.all(uploadTasks);
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
    <script src="https://fast.wistia.com/player.js" async></script>
    <script src="https://fast.wistia.com/embed/nq97ub8w34.js" async type="module"></script>
    <style>wistia-player[media-id='nq97ub8w34']:not(:defined) { background: center / contain no-repeat url('https://fast.wistia.com/embed/medias/nq97ub8w34/swatch'); display: block; filter: blur(5px); padding-top:56.25%; }</style>
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
    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const toggles = document.querySelectorAll('[data-faq-toggle]');
            toggles.forEach(toggle => {
                toggle.addEventListener('click', () => {
                    const item = toggle.closest('.faq-item');
                    const content = item.querySelector('[data-faq-content]');
                    const icon = item.querySelector('.faq-icon');
                    const brandColor = icon.getAttribute('data-brand-color');
                    
                    const isOpen = !content.classList.contains('max-h-0');
                    
                    // Close all others
                    document.querySelectorAll('.faq-item').forEach(otherItem => {
                        if (otherItem !== item) {
                           const otherContent = otherItem.querySelector('[data-faq-content]');
                           const otherIcon = otherItem.querySelector('.faq-icon');
                           otherContent.classList.add('max-h-0');
                           otherContent.classList.remove('max-h-96', 'pb-6');
                           otherIcon.style.color = '#9CA3AF';
                           otherIcon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>';
                        }
                    });

                    if (isOpen) {
                        content.classList.add('max-h-0');
                        content.classList.remove('max-h-96', 'pb-6');
                        icon.style.color = '#9CA3AF';
                        icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-plus"><path d="M5 12h14"/><path d="M12 5v14"/></svg>';
                    } else {
                        content.classList.remove('max-h-0');
                        content.classList.add('max-h-96', 'pb-6');
                        icon.style.color = brandColor;
                        icon.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-minus"><path d="M5 12h14"/></svg>';
                    }
                });
            });
        });
    </script>
    ${styles}
</head>
<body>
    ${staticContent}
</body>
</html>`;

      const pendingId = `site_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // 3. HARDENING: Sanitization pass to ensure 100% static output
      const sanitizedHtml = finalHtml
        .replace(/contenteditable="true"/g, '')
        .replace(/contenteditable/g, '')
        .replace(/suppresscontenteditablewarning="true"/g, '')
        .replace(/suppresscontenteditablewarning/g, '')
        // Remove ANY React-injected data attributes (e.g., data-reactroot, data-reactid)
        // Keep ONLY the manual ones for FAQ logic
        .replace(/\sdata-[a-zA-Z0-9-]+="[^"]*"/g, (match) => {
          if (match.includes('data-faq-toggle') || match.includes('data-faq-content') || match.includes('data-brand-color')) {
            return match;
          }
          return '';
        })
        // Remove all React event handlers (onBlur, onClick, etc) if they somehow leaked
        .replace(/\son[a-zA-Z]+="[^"]*"/g, '')
        // Remove specific editor CSS fragments that might have leaked into class strings
        .replace(/hover:bg-black\/5/g, '')
        .replace(/focus:ring-2/g, '')
        .replace(/focus:ring-blue-400/g, '')
        .replace(/focus:ring-opacity-50/g, '')
        .replace(/cursor-pointer/g, (match, offset, fullString) => {
          // Keep cursor-pointer for links and FAQ toggles, remove for everything else? 
          // Actually, better to just let it be or just remove from non-interactive elements.
          // For now, let's keep it simple and just remove known editor styling.
          return match;
        })
        // Ensure no hidden inputs or other builder UI leaked
        .replace(/<input[^>]*type="file"[^>]*>/g, '')
        .replace(/<button[^>]*class="[^"]*camera-icon[^"]*"[^>]*>.*?<\/button>/g, '');

      const syncRes = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: btoa(unescape(encodeURIComponent(sanitizedHtml))), // Safe UTF-8 base64
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
        body: JSON.stringify({ pendingId, companyName: data.companyName, plan })
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

  const formattedPhone = data.phone || "(555) 123-4567";

  return (
    <div className="bg-white min-h-screen relative font-inter max-sm:text-[85%]">
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

      {/* Site Navigation */}
      <div className="bg-white border-b border-gray-100 py-3 md:py-4 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm">
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

      <main className="pb-52">
        <Hero
          data={data.hero}
          image={images.heroBackground}
          brandColor={data.brandColor}
          location={data.location}
          phone={formattedPhone}
          ctaText={data.ctaVariations.callAndText}
        />

        <LeadForm brandColor={data.brandColor} phone={formattedPhone} companyName={data.companyName} />

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

        <FAQ faqs={data.faqs} brandColor={data.brandColor} />
      </main>

      <ChatWidget brandColor={data.brandColor} />
      {showPopup && <DeployPopup onClaim={handleClaimSite} isClaiming={isClaiming} />}
    </div>
  );
};

export default PreviewSite;
