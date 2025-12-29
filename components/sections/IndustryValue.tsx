
import React from 'react';
import { GeneratedWebsite } from '../../types';

interface IndustryValueProps {
  data: GeneratedWebsite['industryValue'];
  image: string;
  brandColor: string;
  companyName: string;
}

const IndustryValue: React.FC<IndustryValueProps> = ({ data, image, brandColor, companyName }) => {
  return (
    <section className="py-24 bg-white max-sm:py-12">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-16 md:gap-24">
          <div className="lg:w-1/2 w-full">
            <div className="relative">
              <img 
                src={image} 
                alt="Professional service at work" 
                className="rounded-2xl shadow-2xl w-full h-[550px] object-cover max-sm:h-[350px]" 
              />
              <div 
                className="absolute -bottom-6 -right-6 w-32 h-32 rounded-2xl -z-10 opacity-20" 
                style={{ backgroundColor: brandColor }}
              />
            </div>
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-[#1A1D2E] text-3xl md:text-5xl font-extrabold mb-8 leading-[1.2] max-sm:text-3xl max-sm:mb-6">
              The {companyName} Value
            </h2>
            <div className="space-y-6">
              <p className="text-gray-700 text-lg leading-relaxed font-bold max-sm:text-base">
                {data.title}
              </p>
              <p className="text-gray-600 text-lg leading-relaxed max-sm:text-base">
                {data.content}
              </p>
              <p className="text-gray-500 italic text-base leading-relaxed border-l-4 pl-6" style={{ borderColor: brandColor }}>
                {data.subtext}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default IndustryValue;
