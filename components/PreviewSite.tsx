import React, { useState, useEffect } from 'react';
import { GeneratedWebsite, GeneratedImages } from '../types';
import Hero from './sections/Hero';
import Services from './sections/Services';
import Feature from './sections/Feature';
import IndustryValue from './sections/IndustryValue';
import BenefitsList from './sections/BenefitsList';
import Process from './sections/Process';
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
          padding-top: 4rem !important; 
          padding-bottom: 4rem !important;
        }
        @media (max-width: 640px) {
          section {
            padding-top: 2.5rem !important;
            padding-bottom: 2.5rem !important;
          }
          body { font-size: 14px; }
        }
      `}</style>

      {/* Navigation */}
      <div className="bg-white border-b border-gray-100 py-3 px-4 md:px-6 flex items-center justify-between sticky top-0 z-50 shadow-sm max-sm:py-2">
        <div className="flex items-center gap-4">
          <button 
            onClick={onExit}
            className="text-gray-600 font-medium px-3 md:px-4 py-2 border border-gray-200 rounded hover:bg-gray-50 flex items-center gap-2 text-sm md:text-base transition-colors max-sm:px-2 max-sm:py-1"
          >
            <Icon name="arrow-left" size={16} /> <span className="hidden sm:inline font-bold uppercase">Exit Preview</span>
          </button>
          
          <div className="flex flex-col border-l border-gray-200 pl-4 max-sm:pl-2">
            <span className="font-black tracking-tighter text-base uppercase leading-none text-[#1A1D2E] max-sm:text-sm">
              {data.companyName}
            </span>
          </div>
        </div>
        
        <a 
          href={`tel:${formattedPhone}`}
          style={{ backgroundColor: data.brandColor }}
          className="text-white font-black px-4 md:px-6 py-2.5 rounded shadow-lg hover:brightness-110 flex items-center gap-2 whitespace-nowrap text-xs md:text-sm tracking-widest uppercase transition-all active:scale-95 max-sm:px-3 max-sm:py-1.5"
        >
          <Icon name="phone" size={14} />
          <span>{formattedPhone}</span>
        </a>
      </div>

      <main>
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
      </main>

      {/* Sticky Bottom CTA */}
      <div className="fixed bottom-6 right-6 left-6 z-[55]">
        <a 
          href={`tel:${formattedPhone}`}
          style={{ backgroundColor: data.brandColor }}
          className="max-w-md mx-auto flex items-center justify-center gap-3 text-white font-black py-4 rounded-full shadow-[0_10px_40px_rgba(0,0,0,0.3)] text-xs md:text-sm uppercase tracking-widest transition-transform hover:scale-105 active:scale-95 max-sm:max-w-none"
        >
          <Icon name="phone" size={18} />
          <span>{data.ctaVariations.getEstimate}: {formattedPhone}</span>
        </a>
      </div>

      {showPopup && <OfferPopup />}
    </div>
  );
};

export default PreviewSite;
