import React from 'react';
import { GeneratedWebsite } from '../../types';
import Icon from '../Icon';
import EditableText from '../EditableText';

interface ProcessProps {
  data: GeneratedWebsite['processSteps'];
  brandColor: string;
  onUpdateData: (newData: Partial<GeneratedWebsite['processSteps']>) => void;
}

const Process: React.FC<ProcessProps> = ({ data, brandColor, onUpdateData }) => {
  return (
    <section className="py-24 bg-[#1A1D2E] text-white">
      <div className="container mx-auto px-6 max-w-7xl text-center">
        <span style={{ color: brandColor }} className="font-bold text-[10px] tracking-[0.3em] uppercase mb-4 block">
          OUR METHOD
        </span>
        <h2 className="text-4xl font-extrabold mb-4">
          <EditableText
            value={data.title}
            onChange={(v) => onUpdateData({ title: v })}
          />
        </h2>
        <div className="text-gray-400 max-w-2xl mx-auto mb-20 text-sm">
          <EditableText
            value={data.subtitle}
            onChange={(v) => onUpdateData({ subtitle: v })}
            multiline
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-16 md:gap-8 max-w-5xl mx-auto">
          {data.steps.slice(0, 3).map((step, idx) => (
            <div key={idx} className="relative flex flex-col items-center group">
              {/* Giant background number centered */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-16 text-8xl font-black text-white/[0.03] pointer-events-none select-none">
                {idx + 1}
              </div>

              <div className="mb-8 relative z-10">
                <div style={{ color: brandColor }} className="transition-transform duration-300 group-hover:scale-110">
                  <Icon name={step.icon} size={56} />
                </div>
              </div>

              <h3 className="text-xl font-bold mb-4 relative z-10">
                <EditableText
                  value={step.title}
                  onChange={(v) => {
                    const next = [...data.steps];
                    next[idx] = { ...step, title: v };
                    onUpdateData({ steps: next });
                  }}
                />
              </h3>
              <div className="text-gray-400 text-xs leading-relaxed max-w-[240px] relative z-10 mx-auto">
                <EditableText
                  value={step.description}
                  onChange={(v) => {
                    const next = [...data.steps];
                    next[idx] = { ...step, description: v };
                    onUpdateData({ steps: next });
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

export default Process;
