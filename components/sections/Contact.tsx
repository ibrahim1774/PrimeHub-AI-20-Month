
import React from 'react';
import { GeneratedWebsite } from '../../types';
import Icon from '../Icon';

// Note: 'contactForm' is not present in GeneratedWebsite as per strict content rules (no forms).
// Defining a local interface to satisfy the compiler for this unused component.
interface ContactProps {
  data: {
    sidebarTitle: string;
    sidebarDescription: string;
    contactMethods: Array<{ icon: string; title: string; subtitle: string }>;
    formTitle: string;
  };
  brandColor: string;
  phone: string;
  industry: string;
  location: string;
}

const Contact: React.FC<ContactProps> = ({ data, brandColor, phone, industry, location }) => {
  return (
    <section id="contact" className="bg-gray-50">
      <div className="container mx-auto max-w-7xl px-6 py-24">
        <div className="flex flex-col lg:flex-row overflow-hidden rounded-2xl shadow-2xl">
          {/* Sidebar */}
          <div 
            style={{ backgroundColor: brandColor }}
            className="lg:w-[40%] p-12 text-white flex flex-col justify-between"
          >
            <div>
              <h2 className="text-4xl font-extrabold mb-6">{data.sidebarTitle}</h2>
              <p className="text-white/80 mb-12 leading-relaxed">
                {data.sidebarDescription}
              </p>

              <div className="space-y-8">
                {data.contactMethods.map((method, idx) => (
                  <div key={idx} className="flex items-start gap-5">
                    <div className="bg-white/20 p-3 rounded-lg">
                      <Icon name={method.icon} size={24} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1">{method.title}</h4>
                      <p className="text-white/70">{method.subtitle}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:w-[60%] bg-white p-12">
            <h3 className="text-[#1A1D2E] text-3xl font-extrabold mb-10">{data.formTitle}</h3>
            <form className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="John Doe"
                    className="w-full border-gray-200 border-2 rounded-lg py-3 px-4 focus:outline-none transition-colors"
                    style={{ borderColor: '#f3f4f6' }}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Phone Number</label>
                  <input 
                    type="tel" 
                    placeholder="(555) 000-0000"
                    className="w-full border-gray-200 border-2 rounded-lg py-3 px-4 focus:outline-none transition-colors"
                    style={{ borderColor: '#f3f4f6' }}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                <input 
                  type="email" 
                  placeholder="john@example.com"
                  className="w-full border-gray-200 border-2 rounded-lg py-3 px-4 focus:outline-none transition-colors"
                  style={{ borderColor: '#f3f4f6' }}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Service Needed</label>
                <input 
                  type="text" 
                  placeholder={`e.g., Emergency ${industry} Repair`}
                  className="w-full border-gray-200 border-2 rounded-lg py-3 px-4 focus:outline-none transition-colors"
                  style={{ borderColor: '#f3f4f6' }}
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Tell us about your project</label>
                <textarea 
                  rows={4}
                  placeholder="How can we help you today?"
                  className="w-full border-gray-200 border-2 rounded-lg py-3 px-4 focus:outline-none transition-colors"
                  style={{ borderColor: '#f3f4f6' }}
                />
              </div>
              <button 
                type="button"
                style={{ backgroundColor: brandColor }}
                className="w-full py-5 text-white font-bold text-xl rounded shadow-lg hover:brightness-110 active:scale-95 transition-all"
              >
                Request Dispatch →
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
