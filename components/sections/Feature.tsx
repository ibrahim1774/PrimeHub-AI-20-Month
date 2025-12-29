
import React from 'react';
import { GeneratedWebsite } from '../../types';
import Icon from '../Icon';

interface FeatureProps {
  data: GeneratedWebsite['featureHighlight'];
  brandColor: string;
}

const Feature: React.FC<FeatureProps> = ({ data, brandColor }) => {
  return (
    <section className="py-20 bg-white max-sm:py-12">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16 max-sm:mb-8">
          <span style={{ color: brandColor }} className="font-bold text-[10px] tracking-[0.4em] uppercase mb-4 block">
            {data.badge}
          </span>
          <h2 className="text-[#1A1D2E] text-4xl font-extrabold leading-tight max-w-3xl mx-auto max-sm:text-2xl">
            {data.headline}
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-center">
          {data.cards.map((card, idx) => (
            <div key={idx} className="bg-[#F8F9FA] p-8 rounded-2xl border border-gray-100 flex flex-col items-start text-left hover:bg-gray-50 transition-colors max-sm:p-6">
              <div style={{ color: brandColor }} className="mb-6 max-sm:mb-4">
                <Icon name={card.icon} size={36} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#1A1D2E] max-sm:text-lg leading-tight">{card.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed font-medium opacity-80">
                {card.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Feature;
