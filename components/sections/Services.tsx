import React from 'react';
import { GeneratedWebsite } from '../../types';
import Icon from '../Icon';

interface ServicesProps {
  data: GeneratedWebsite['services'];
  brandColor: string;
  phone: string;
}

const Services: React.FC<ServicesProps> = ({ data, brandColor, phone }) => {
  return (
    <section className="py-20 bg-gray-50 max-sm:py-12">
      <div className="container mx-auto px-6 max-w-7xl text-center">
        <span style={{ color: brandColor }} className="font-bold text-[10px] tracking-[0.4em] uppercase mb-4 block">
          {data.badge}
        </span>
        <h2 className="text-[#1A1D2E] text-4xl font-extrabold mb-4 max-sm:text-2xl">{data.title}</h2>
        <p className="text-gray-500 font-medium max-w-2xl mx-auto mb-16 max-sm:mb-8 max-sm:text-sm">{data.subtitle}</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 text-left">
          {data.cards.map((service, idx) => (
            <div key={idx} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col h-full hover:shadow-md transition-shadow max-sm:p-6">
              <div style={{ color: brandColor }} className="mb-6 max-sm:mb-4">
                <Icon name={service.icon} size={32} />
              </div>
              <h3 className="text-xl font-bold mb-4 text-[#1A1D2E] leading-tight max-sm:text-lg">{service.title}</h3>
              <p className="text-gray-600 mb-8 text-sm leading-relaxed flex-1">
                {service.description}
              </p>
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
