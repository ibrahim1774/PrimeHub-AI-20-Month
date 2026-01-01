import React, { useState } from 'react';
import Icon from '../Icon';
import EditableText from '../EditableText';

interface FAQProps {
  faqs: Array<{ question: string; answer: string }>;
  brandColor: string;
  onUpdateData: (newFaqs: Array<{ question: string; answer: string }>) => void;
}

const FAQItem: React.FC<{
  question: string;
  answer: string;
  brandColor: string;
  onUpdateQuestion: (v: string) => void;
  onUpdateAnswer: (v: string) => void;
}> = ({ question, answer, brandColor, onUpdateQuestion, onUpdateAnswer }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-gray-100">
      <div className="w-full py-6 flex items-center justify-between text-left hover:text-gray-900 transition-colors">
        <div className="text-lg font-bold text-[#1A1D2E] tracking-tight pr-8 flex-1">
          <EditableText value={question} onChange={onUpdateQuestion} />
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          style={{ color: isOpen ? brandColor : '#9CA3AF' }}
          className="shrink-0 transition-transform duration-300"
        >
          <Icon name={isOpen ? "minus" : "plus"} size={20} />
        </button>
      </div>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6' : 'max-h-0'}`}
      >
        <div className="text-gray-600 leading-relaxed font-medium">
          <EditableText value={answer} onChange={onUpdateAnswer} multiline />
        </div>
      </div>
    </div>
  );
};

const FAQ: React.FC<FAQProps> = ({ faqs, brandColor, onUpdateData }) => {
  if (!faqs || faqs.length === 0) return null;

  return (
    <section className="py-24 bg-white max-sm:py-16">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-12">
          <span style={{ color: brandColor }} className="font-bold text-[10px] tracking-[0.4em] uppercase mb-4 block">
            COMMON QUESTIONS
          </span>
          <h2 className="text-[#1A1D2E] text-4xl font-extrabold mb-4 max-sm:text-3xl">
            Everything You Need To Know
          </h2>
        </div>

        <div className="divide-y divide-gray-100">
          {faqs.map((faq, idx) => (
            <FAQItem
              key={idx}
              question={faq.question}
              answer={faq.answer}
              brandColor={brandColor}
              onUpdateQuestion={(v) => {
                const next = [...faqs];
                next[idx] = { ...faq, question: v };
                onUpdateData(next);
              }}
              onUpdateAnswer={(v) => {
                const next = [...faqs];
                next[idx] = { ...faq, answer: v };
                onUpdateData(next);
              }}
            />
          ))}
        </div>
      </div>
    </section>
  );
};

export default FAQ;
