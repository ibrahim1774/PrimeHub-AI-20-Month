import React from 'react';
import { GeneratedWebsite } from '../../types';
import EditableText from '../EditableText';
import ImageReplace from '../ImageReplace';

interface IndustryValueProps {
  data: GeneratedWebsite['industryValue'];
  image: string;
  brandColor: string;
  companyName: string;
  onUpdateData: (newData: Partial<GeneratedWebsite['industryValue']>) => void;
  onUpdateImage: (newBase64: string) => void;
}

const IndustryValue: React.FC<IndustryValueProps> = ({ data, image, brandColor, companyName, onUpdateData, onUpdateImage }) => {
  return (
    <section className="py-24 bg-white max-sm:py-12">
      <div className="container mx-auto px-6 max-w-7xl">
        <div className="flex flex-col lg:flex-row items-center gap-16 md:gap-24">
          <div className="lg:w-1/2 w-full">
            <div className="relative">
              <ImageReplace
                src={image}
                onChange={onUpdateImage}
                className="rounded-2xl shadow-2xl w-full h-[550px] object-cover max-sm:h-[350px]"
                alt="Professional service at work"
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
              <div className="text-gray-700 text-lg leading-relaxed font-bold max-sm:text-base">
                <EditableText
                  value={data.title}
                  onChange={(v) => onUpdateData({ title: v })}
                  multiline
                />
              </div>
              <div className="text-gray-600 text-lg leading-relaxed max-sm:text-base">
                <EditableText
                  value={data.content}
                  onChange={(v) => onUpdateData({ content: v })}
                  multiline
                />
              </div>
              <div className="text-gray-500 italic text-base leading-relaxed border-l-4 pl-6" style={{ borderColor: brandColor }}>
                <EditableText
                  value={data.subtext}
                  onChange={(v) => onUpdateData({ subtext: v })}
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

export default IndustryValue;
