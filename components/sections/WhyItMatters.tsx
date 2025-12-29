
import React from 'react';
import { GeneratedWebsite } from '../../types';

interface WhyItMattersProps {
  // Fixed: Property 'whyItMatters' does not exist on 'GeneratedWebsite'.
  // Using 'industryValue' which provides the same content structure (title, content).
  data: GeneratedWebsite['industryValue'];
  brandColor: string;
}

const WhyItMatters: React.FC<WhyItMattersProps> = ({ data, brandColor }) => {
  return (
    <section className="py-16 bg-white border-b border-gray-100 max-sm:py-10">
      <div className="container mx-auto px-6 max-w-4xl text-center">
        <h2 className="text-[#1A1D2E] text-3xl font-extrabold mb-6 max-sm:text-2xl">
          {data.title}
        </h2>
        <div className="w-16 h-1 mx-auto mb-8 rounded-full" style={{ backgroundColor: brandColor }}></div>
        <p className="text-gray-600 text-lg leading-relaxed max-sm:text-base">
          {data.content}
        </p>
      </div>
    </section>
  );
};

export default WhyItMatters;
