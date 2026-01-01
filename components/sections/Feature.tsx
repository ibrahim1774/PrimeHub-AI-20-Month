import React from 'react';
import { GeneratedWebsite } from '../../types';
import Icon from '../Icon';
import EditableText from '../EditableText';

interface FeatureProps {
  data: GeneratedWebsite['featureHighlight'];
  brandColor: string;
  onUpdateData: (newData: Partial<GeneratedWebsite['featureHighlight']>) => void;
}

const Feature: React.FC<FeatureProps> = ({ data, brandColor, onUpdateData }) => {
  return (
    <section className="py-20 bg-white max-sm:py-12">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="text-center mb-16 max-sm:mb-8">
          <span style={{ color: brandColor }} className="font-bold text-[10px] tracking-[0.4em] uppercase mb-4 block">
            <EditableText
              value={data.badge}
              onChange={(v) => onUpdateData({ badge: v })}
            />
          </span>
          <h2 className="text-[#1A1D2E] text-4xl font-extrabold leading-tight max-w-3xl mx-auto max-sm:text-2xl">
            <EditableText
              value={data.headline}
              onChange={(v) => onUpdateData({ headline: v })}
              multiline
            />
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 justify-center">
          {data.cards.map((card, idx) => (
            <div key={idx} className="bg-[#F8F9FA] p-8 rounded-2xl border border-gray-100 flex flex-col items-start text-left hover:bg-gray-50 transition-colors max-sm:p-6">
              <div style={{ color: brandColor }} className="mb-6 max-sm:mb-4">
                <Icon name={card.icon} size={36} />
              </div>
              <h3 className="text-xl font-bold mb-3 text-[#1A1D2E] max-sm:text-lg leading-tight">
                <EditableText
                  value={card.title}
                  onChange={(v) => {
                    const next = [...data.cards];
                    next[idx] = { ...card, title: v };
                    onUpdateData({ cards: next });
                  }}
                />
              </h3>
              <div className="text-gray-600 text-sm leading-relaxed font-medium opacity-80">
                <EditableText
                  value={card.description}
                  onChange={(v) => {
                    const next = [...data.cards];
                    next[idx] = { ...card, description: v };
                    onUpdateData({ cards: next });
                  }}
                  multiline
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Feature;
