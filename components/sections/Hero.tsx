import React from 'react';
import { GeneratedWebsite } from '../../types';
import Icon from '../Icon';
import EditableText from '../EditableText';
import ImageReplace from '../ImageReplace';

interface HeroProps {
  data: GeneratedWebsite['hero'];
  image: string;
  brandColor: string;
  location: string;
  phone: string;
  ctaText: string;
  companyName?: string;
  onUpdateData?: (newData: Partial<GeneratedWebsite['hero']>) => void;
  onUpdateImage?: (newBase64: string) => void;
}

const Hero: React.FC<HeroProps> = ({ data, image, brandColor, location, phone, ctaText, companyName, onUpdateData, onUpdateImage }) => {
  // Ensure the ctaText doesn't already contain the phone number to avoid duplication
  const cleanCtaText = ctaText.includes(phone)
    ? ctaText.replace(phone, '').replace(/[:\s]+$/, '').trim()
    : ctaText.trim();

  return (
    <section className="relative min-h-[750px] flex items-center overflow-hidden max-sm:min-h-[600px]">
      <div className="absolute inset-0 z-0">
        <ImageReplace
          src={image}
          onChange={onUpdateImage}
          className="w-full h-full"
          alt="Service Background"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/65 to-transparent" />
      </div>

      <div className="container mx-auto px-6 relative z-10 max-w-7xl">
        <div className="flex flex-col lg:flex-row lg:items-center lg:gap-12">
          {/* Left: Headline + CTA */}
          <div className="lg:flex-1 text-left">
            <span className="inline-block font-black text-xs md:text-sm tracking-[0.3em] uppercase mb-6 text-white/90 max-sm:mb-3">
              {location} • TRUSTED LOCAL SERVICE
            </span>

            <h1 className="text-white text-5xl md:text-[70px] font-extrabold leading-[1.05] mb-6 max-sm:text-4xl max-sm:mb-4 tracking-tighter">
              <span className="block">
                <EditableText
                  value={data.headline.line1}
                  onChange={onUpdateData ? (v) => onUpdateData({ headline: { ...data.headline, line1: v } }) : undefined}
                />
              </span>
              <span style={{ color: brandColor }} className="block brightness-125">
                <EditableText
                  value={data.headline.line2}
                  onChange={onUpdateData ? (v) => onUpdateData({ headline: { ...data.headline, line2: v } }) : undefined}
                />
              </span>
              <span className="block">
                <EditableText
                  value={data.headline.line3}
                  onChange={onUpdateData ? (v) => onUpdateData({ headline: { ...data.headline, line3: v } }) : undefined}
                />
              </span>
            </h1>

            <div className="text-white/90 text-lg md:text-xl max-w-xl mb-8 leading-relaxed max-sm:text-base max-sm:mb-6 font-medium">
              <EditableText
                value={data.subtext}
                onChange={onUpdateData ? (v) => onUpdateData({ subtext: v }) : undefined}
                multiline
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-4 mb-10 max-sm:mb-6">
              <a
                href={`tel:${phone}`}
                style={{ backgroundColor: brandColor }}
                className="px-10 py-5 text-white font-black text-lg rounded-md shadow-[0_10px_30px_rgba(0,0,0,0.5)] hover:brightness-110 text-center uppercase tracking-widest transition-all active:scale-95 max-sm:px-6 max-sm:py-4 max-sm:text-base"
              >
                {cleanCtaText}: {phone}
              </a>
            </div>

            <div className="hidden lg:grid grid-cols-3 gap-10">
              {data.trustIndicators.map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 group">
                  <div style={{ color: brandColor }} className="shrink-0 transition-transform group-hover:scale-110 brightness-110">
                    <Icon name={item.icon} size={32} />
                  </div>
                  <div>
                    <div className="text-white font-black uppercase text-[11px] tracking-widest leading-tight mb-0.5">
                      <EditableText
                        value={item.label}
                        onChange={onUpdateData ? (v) => {
                          const next = [...data.trustIndicators];
                          next[idx] = { ...item, label: v };
                          onUpdateData({ trustIndicators: next });
                        } : undefined}
                      />
                    </div>
                    <div className="text-white/60 text-[10px] font-bold uppercase tracking-tight">
                      <EditableText
                        value={item.sublabel}
                        onChange={onUpdateData ? (v) => {
                          const next = [...data.trustIndicators];
                          next[idx] = { ...item, sublabel: v };
                          onUpdateData({ trustIndicators: next });
                        } : undefined}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Lead Form */}
          <div id="contact" className="lg:w-[380px] shrink-0 mt-8 lg:mt-0">
            <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl">
              <h3 className="text-gray-900 font-extrabold text-lg mb-4 text-center">
                Get a Free Quote{companyName ? ` from ${companyName}` : ''}
              </h3>
              <form
                data-lead-form
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const thanks = form.nextElementSibling;
                  if (thanks) {
                    form.style.display = 'none';
                    (thanks as HTMLElement).style.display = 'block';
                  }
                }}
                className="space-y-3"
              >
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="John Smith"
                    className="w-full border-2 border-gray-200 rounded-lg py-2.5 px-3 text-sm text-gray-800 focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    placeholder="(555) 123-4567"
                    className="w-full border-2 border-gray-200 rounded-lg py-2.5 px-3 text-sm text-gray-800 focus:outline-none focus:border-gray-400 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">Message *</label>
                  <textarea
                    required
                    rows={2}
                    placeholder="Tell us about your project..."
                    className="w-full border-2 border-gray-200 rounded-lg py-2.5 px-3 text-sm text-gray-800 focus:outline-none focus:border-gray-400 transition-colors resize-none"
                  />
                </div>
                <button
                  type="submit"
                  style={{ backgroundColor: brandColor }}
                  className="w-full py-3 text-white font-extrabold text-sm rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-wider"
                >
                  SEND
                </button>
              </form>
              <div style={{ display: 'none' }} className="text-center py-4 space-y-3">
                <div className="text-3xl">✅</div>
                <p className="text-gray-900 font-bold">Thank you!</p>
                <p className="text-gray-500 text-xs">We'll get back to you soon.</p>
                <a
                  href={`tel:${phone}`}
                  style={{ backgroundColor: brandColor }}
                  className="inline-block text-white font-bold py-2 px-6 rounded-lg text-sm shadow-lg hover:brightness-110 transition-all"
                >
                  Call {phone}
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
