import React from 'react';
import { GeneratedWebsite } from '../../types';
import Icon from '../Icon';
import EditableText from '../EditableText';
import ImageReplace from '../ImageReplace';

interface CredentialsProps {
  data: GeneratedWebsite['credentials'];
  image: string;
  brandColor: string;
  industry: string;
  location: string;
  onUpdateData: (newData: Partial<GeneratedWebsite['credentials']>) => void;
  onUpdateImage: (newBase64: string) => void;
}

const Credentials: React.FC<CredentialsProps> = ({ data, image, brandColor, industry, location, onUpdateData, onUpdateImage }) => {
  return (
    <section className="py-24 bg-white overflow-hidden max-sm:py-16">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row-reverse items-center gap-16 max-sm:gap-8">
          <div className="lg:w-1/2">
            <ImageReplace
              src={image}
              onChange={onUpdateImage}
              className="rounded-lg shadow-xl w-full h-[500px] object-cover max-sm:h-[300px]"
              alt="Work Site"
            />
          </div>
          <div className="lg:w-1/2">
            <span style={{ color: brandColor }} className="font-bold text-sm tracking-widest uppercase mb-4 block max-sm:text-xs">
              <EditableText
                value={data.badge}
                onChange={(v) => onUpdateData({ badge: v })}
              />
            </span>
            <h2 className="text-[#1A1D2E] text-4xl font-extrabold mb-6 leading-tight max-sm:text-3xl max-sm:mb-4">
              <EditableText
                value={data.headline}
                onChange={(v) => onUpdateData({ headline: v })}
                multiline
              />
            </h2>
            <div className="text-gray-600 mb-8 leading-relaxed text-lg max-sm:text-base max-sm:mb-6">
              <EditableText
                value={data.description}
                onChange={(v) => onUpdateData({ description: v })}
                multiline
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-4 gap-x-8 mb-12 max-sm:mb-8">
              {data.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3">
                  <div style={{ color: brandColor }}>
                    <Icon name="check" size={20} />
                  </div>
                  <div className="text-gray-700 font-bold text-base tracking-tight uppercase max-sm:text-xs">
                    <EditableText
                      value={item}
                      onChange={(v) => {
                        const next = [...data.items];
                        next[idx] = v;
                        onUpdateData({ items: next });
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-50 p-8 rounded-2xl flex flex-col sm:flex-row items-center gap-8 border border-gray-100 shadow-inner max-sm:p-6 max-sm:gap-4">
              <div className="text-center sm:text-left">
                <div className="flex justify-center sm:justify-start gap-1 mb-2">
                  <span className="text-blue-500 text-2xl">★★★★★</span>
                </div>
                <div className="text-gray-500 font-bold text-[10px] uppercase tracking-widest">Customer Satisfaction</div>
              </div>
              <div className="w-px h-12 bg-gray-200 hidden sm:block" />
              <div className="text-[#1A1D2E] text-xs font-black uppercase tracking-widest text-center sm:text-left flex-1 leading-relaxed">
                <EditableText
                  value={data.certificationText}
                  onChange={(v) => onUpdateData({ certificationText: v })}
                  multiline
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Credentials;
