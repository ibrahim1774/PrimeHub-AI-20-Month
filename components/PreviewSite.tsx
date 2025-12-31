
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

interface PreviewSiteProps {
  data: GeneratedWebsite;
  images: GeneratedImages;
  onExit: () => void;
}

const PreviewSite: React.FC<PreviewSiteProps> = ({ data, images, onExit }) => {
  const [showPopup, setShowPopup] = useState(false);

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
    </div>
  );
};

export default PreviewSite;
