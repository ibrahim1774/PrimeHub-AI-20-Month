import React from 'react';
import { GeneratedWebsite } from '../../types';
import Icon from '../Icon';

interface HeroProps {
  data: GeneratedWebsite['hero'];
  image: string;
  brandColor: string;
  location: string;
  phone: string;
  ctaText: string;
}

const Hero: React.FC<HeroProps> = ({ data, image, brandColor, location, phone, ctaText }) => {
  // Ensure the ctaText doesn't already contain the phone number to avoid duplication
  const cleanCtaText = ctaText.includes(phone) 
    ? ctaText.replace(phone, '').replace(/[:\s]+$/, '').trim() 
    : ctaText.trim();

  return (
    <section className="relative min-h-[750px] flex items-center overflow-hidden max-sm:min-h-[600px]">
      <div className="absolute inset-0 z-0">
        <img src={image} alt="Service Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="max-w-3xl text-left">
          <span className="inline-block font-black text-xs md:text-sm tracking-[0.3em] uppercase mb-6 text-white/90 max-sm:mb-3">
            {location} • TRUSTED LOCAL SERVICE
          </span>
          
          <h1 className="text-white text-5xl md:text-[80px] font-extrabold leading-[1.05] mb-8 max-sm:text-4xl max-sm:mb-4 tracking-tighter">
            <span className="block">{data.headline.line1}</span>
            <span style={{ color: brandColor }} className="block brightness-125">{data.headline.line2}</span>
            <span className="block">{data.headline.line3}</span>
          </h1>

          <p className="text-white/90 text-lg md:text-xl max-w-xl mb-12 leading-relaxed max-sm:text-base max-sm:mb-8 font-medium">
            {data.subtext}
          </p>

          <div className="flex flex-col sm:flex-row gap-4 mb-20 max-sm:mb-10">
            <a 
              href={`tel:${phone}`}
              style={{ backgroundColor: brandColor }}
              className="px-10 py-5 text-white font-black text-lg rounded-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:brightness-110 text-center uppercase tracking-widest transition-all active:scale-95 max-sm:px-6 max-sm:py-4 max-sm:text-base"
            >
              {cleanCtaText}: {phone}
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-sm:gap-4 max-sm:grid-cols-1">
            {data.trustIndicators.map((item, idx) => (
              <div key={idx} className="flex items-center gap-4 group">
                <div style={{ color: brandColor }} className="shrink-0 transition-transform group-hover:scale-110 brightness-110">
                  <Icon name={item.icon} size={32} />
                </div>
                <div>
                  <div className="text-white font-black uppercase text-[11px] tracking-widest leading-tight mb-0.5">{item.label}</div>
                  <div className="text-white/60 text-[10px] font-bold uppercase tracking-tight">{item.sublabel}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
