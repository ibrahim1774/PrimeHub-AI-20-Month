
import React from 'react';
import { GeneratedWebsite } from '../../types';
import Icon from '../Icon';

interface BenefitsListProps {
  data: GeneratedWebsite['benefits'];
  brandColor: string;
  companyName: string;
}

const BenefitsList: React.FC<BenefitsListProps> = ({ data, brandColor, companyName }) => {
  return (
    <section className="py-24 bg-white max-sm:py-12">
      <div className="container mx-auto px-6 max-w-6xl text-center">
        <h2 className="text-[#1A1D2E] text-3xl md:text-4xl font-extrabold mb-4 max-sm:text-2xl leading-tight">
          The {companyName} Advantage
        </h2>
        <p className="text-gray-500 font-medium mb-16 max-w-3xl mx-auto max-sm:text-sm max-sm:mb-10">
          {data.intro}
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-x-20 gap-y-12 max-sm:gap-8 text-left">
          {data.items.map((benefit, idx) => (
            <div key={idx} className="flex gap-5 items-start group">
              <div 
                style={{ color: brandColor }} 
                className="shrink-0 mt-1"
              >
                <Icon name="check-circle" size={28} />
              </div>
              <p className="text-gray-800 font-bold text-lg leading-snug tracking-tight max-sm:text-base">
                {benefit}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default BenefitsList;
