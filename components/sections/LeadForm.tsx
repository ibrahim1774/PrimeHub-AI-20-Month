import React, { useState } from 'react';

interface LeadFormProps {
  brandColor: string;
  phone: string;
  companyName: string;
}

const LeadForm: React.FC<LeadFormProps> = ({ brandColor, phone, companyName }) => {
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <section id="contact" className="bg-[#0f1724] py-16 md:py-20 px-4">
      <div className="max-w-lg mx-auto">
        <h2 className="text-center text-white font-extrabold text-2xl md:text-3xl tracking-tight mb-2">
          Get a Free Quote from {companyName}
        </h2>
        <p className="text-center text-gray-400 text-sm mb-8">
          Fill out the form below and we'll get back to you right away.
        </p>

        {submitted ? (
          <div className="bg-white/10 border border-white/20 rounded-2xl p-8 text-center space-y-4">
            <div className="text-4xl">✅</div>
            <h3 className="text-white text-xl font-bold">Thank you!</h3>
            <p className="text-gray-300 text-sm">
              We got your message. For a faster response, give us a call:
            </p>
            <a
              href={`tel:${phone}`}
              style={{ backgroundColor: brandColor }}
              className="inline-block text-white font-bold py-3 px-8 rounded-xl text-lg shadow-lg hover:brightness-110 transition-all"
            >
              Call {phone}
            </a>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 md:p-8 shadow-xl space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1.5">Full Name *</label>
              <input
                type="text"
                required
                placeholder="John Smith"
                className="w-full border-2 border-gray-200 rounded-lg py-3 px-4 text-gray-800 focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1.5">Phone</label>
              <input
                type="tel"
                placeholder="(555) 123-4567"
                className="w-full border-2 border-gray-200 rounded-lg py-3 px-4 text-gray-800 focus:outline-none focus:border-gray-400 transition-colors"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-800 mb-1.5">Short message about your needs *</label>
              <textarea
                required
                rows={3}
                placeholder="Your message goes straight to my phone, I'll get back to you as soon as I'm available"
                className="w-full border-2 border-gray-200 rounded-lg py-3 px-4 text-gray-800 focus:outline-none focus:border-gray-400 transition-colors resize-none"
              />
            </div>

            <button
              type="submit"
              style={{ backgroundColor: brandColor }}
              className="w-full py-4 text-white font-extrabold text-lg rounded-xl shadow-lg hover:brightness-110 active:scale-[0.98] transition-all uppercase tracking-wider"
            >
              SEND
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default LeadForm;
