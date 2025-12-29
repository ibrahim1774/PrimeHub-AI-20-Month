import React from 'react';
import { GeneratedWebsite } from '../../types';
import Icon from '../Icon';

interface EmergencyCTAProps {
  data: GeneratedWebsite['emergencyCTA'];
  brandColor: string;
  phone: string;
  ctaText: string;
}

const EmergencyCTA: React.FC<EmergencyCTAProps> = ({ data, brandColor, phone, ctaText }) => {
  // Ensure the ctaText doesn't already contain the phone number to avoid duplication
  const cleanCtaText = ctaText.includes(phone) 
    ? ctaText.replace(phone, '').replace(/[:\s]+$/, '').trim() 
    : ctaText.trim();

  return (
    <section className="py-20 bg-[#0F111A] text-white max-sm:py-12">
      <div className="container mx-auto px-6 max-w-7xl text-center">
        <h2 className="text-3xl md:text-5xl font-extrabold mb-6 leading-tight max-w-4xl mx-auto max-sm:text-2xl">
          {data.headline}
        </h2>
        <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto leading-relaxed max-sm:text-sm">
          {data.subtext}
        </p>
        <a 
          href={`tel:${phone}`}
          style={{ backgroundColor: brandColor }}
          className="inline-flex items-center gap-3 px-12 py-5 text-white font-black text-lg rounded-full shadow-2xl hover:brightness-110 active:scale-95 transition-all uppercase tracking-widest max-sm:px-8 max-sm:py-4 max-sm:text-sm"
        >
          <Icon name="phone" size={20} />
          {cleanCtaText}: {phone}
        </a>
      </div>
    </section>
  );
};

export default EmergencyCTA;
