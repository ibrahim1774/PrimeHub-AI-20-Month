import React from 'react';
import { GeneratedWebsite } from '../../types';
import Icon from '../Icon';
import EditableText from '../EditableText';

interface ServicesProps {
  data: GeneratedWebsite['services'];
  brandColor: string;
  phone: string;
  onUpdateData: (newData: Partial<GeneratedWebsite['services']>) => void;
}

const Services: React.FC<ServicesProps> = ({ data, brandColor, phone, onUpdateData }) => {
  return (
    <section className="py-20 bg-gray-50 max-sm:py-12">
      <div className="container mx-auto px-6 max-w-7xl text-center">
        <span style={{ color: brandColor }} className="font-bold text-[10px] tracking-[0.4em] uppercase mb-4 block">
          <EditableText
            value={data.badge}
            onChange={(v) => onUpdateData({ badge: v })}
          />
        </span>
        <h2 className="text-[#1A1D2E] text-4xl font-extrabold mb-4 max-sm:text-2xl">
          <EditableText
            value={data.title}
            onChange={(v) => onUpdateData({ title: v })}
          />
        </h2>
        <div className="text-gray-500 font-medium max-w-2xl mx-auto mb-16 max-sm:mb-8 max-sm:text-sm">
          <EditableText
            value={data.subtitle}
            onChange={(v) => onUpdateData({ subtitle: v })}
            multiline
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {data.cards.map((service, idx) => (
            <div key={idx} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow max-sm:p-6">
              <div style={{ color: brandColor }} className="mb-6 max-sm:mb-4">
                <Icon name={service.icon} size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-[#1A1D2E] leading-tight max-sm:text-lg">
                <EditableText
                  value={service.title}
                  onChange={(v) => {
                    const next = [...data.cards];
                    next[idx] = { ...service, title: v };
                    onUpdateData({ cards: next });
                  }}
                />
              </h3>
              <div className="text-gray-600 mb-8 text-sm leading-relaxed flex-1">
                <EditableText
                  value={service.description}
                  onChange={(v) => {
                    const next = [...data.cards];
                    next[idx] = { ...service, description: v };
                    onUpdateData({ cards: next });
                  }}
                  multiline
                />
              </div>
              <a
                href={`tel:${phone}`}
                style={{ color: brandColor }}
                className="font-bold text-xs flex items-center gap-2 group cursor-pointer uppercase tracking-widest mt-auto"
              >
                Call: {phone} <span className="group-hover:translate-x-1 transition-transform">→</span>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
