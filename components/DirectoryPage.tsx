import { useState } from 'react';
import { Globe, Smartphone, Target, Users, CheckCircle, ArrowRight } from 'lucide-react';

const galleryItems = [
  { src: '/gallery/home-services.png', label: 'Home Services' },
  { src: '/gallery/landscaping.png', label: 'Landscaping' },
  { src: '/gallery/cleaning.png', label: 'Cleaning Services' },
  { src: '/gallery/barbershop.png', label: 'Barbershop' },
  { src: '/gallery/home-services-2.png', label: 'Home Services' },
];

const DirectoryPage = () => {
  const [pricingPlan, setPricingPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: pricingPlan, source: 'directory' }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
      setIsLoading(false);
    }
  };

  const priceLabel = pricingPlan === 'yearly' ? '$99/yr' : '$20/mo';

  const CtaButton = ({ className = '' }: { className?: string }) => (
    <button className={`dir-btn-primary ${className}`} onClick={handleCheckout} disabled={isLoading}>
      {isLoading ? 'Loading...' : `Get Started — ${priceLabel}`}
      {!isLoading && <ArrowRight size={18} />}
    </button>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');

        .dir-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
          padding-bottom: 80px;
        }

        .dir-section {
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 24px;
        }

        .dir-hero-title {
          font-family: 'Instrument Serif', serif;
          font-size: 48px;
          line-height: 1.15;
          color: #fff;
          max-width: 720px;
          margin: 0 auto 12px;
        }
        .dir-hero-title em {
          color: #22c55e;
          font-style: italic;
        }

        .dir-subtitle {
          color: #94a3b8;
          font-size: 18px;
          line-height: 1.6;
          max-width: 560px;
          margin: 0 auto 24px;
        }

        .dir-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 14px 32px;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border: none;
          color: #fff;
          letter-spacing: 0.02em;
          box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);
        }
        .dir-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(34, 197, 94, 0.45);
        }
        .dir-btn-primary:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .dir-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 16px;
          padding: 20px;
          transition: all 0.2s ease;
        }
        .dir-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
        }

        .dir-card-icon {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #22c55e;
          margin-bottom: 12px;
        }

        .dir-section-label {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 100px;
          padding: 6px 14px;
          font-size: 11px;
          font-weight: 600;
          color: #22c55e;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .dir-section-title {
          font-family: 'Instrument Serif', serif;
          font-size: 32px;
          color: #fff;
          line-height: 1.2;
          margin: 0 0 8px;
        }
        .dir-section-title em {
          color: #22c55e;
          font-style: italic;
        }

        .dir-pricing-toggle {
          display: flex;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 3px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          max-width: 320px;
          margin: 0 auto 20px;
        }
        .dir-pricing-tab {
          flex: 1;
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          background: transparent;
          color: #94a3b8;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .dir-pricing-tab.active {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }
        .dir-save-badge {
          background: #22c55e;
          color: #000;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .dir-price {
          font-family: 'Instrument Serif', serif;
          font-size: 56px;
          color: #22c55e;
          font-style: italic;
          line-height: 1;
        }
        .dir-price-per {
          color: #64748b;
          font-size: 18px;
          margin-left: 4px;
        }
        .dir-price-was {
          color: #64748b;
          font-size: 16px;
          text-decoration: line-through;
          margin-left: 12px;
        }

        .dir-perks {
          display: flex;
          justify-content: center;
          gap: 24px;
          flex-wrap: wrap;
          margin-top: 14px;
        }
        .dir-perk {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 13px;
          color: #94a3b8;
        }
        .dir-perk-dot {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
        }

        .dir-gallery-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .dir-gallery-item {
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
          transition: all 0.2s ease;
        }
        .dir-gallery-item:hover {
          border-color: rgba(255, 255, 255, 0.15);
          transform: translateY(-4px);
          box-shadow: 0 12px 40px rgba(0, 0, 0, 0.3);
        }
        .dir-gallery-item img {
          width: 100%;
          aspect-ratio: 1;
          object-fit: cover;
          object-position: center top;
          transform: scale(1.15);
          display: block;
        }
        .dir-gallery-label {
          padding: 10px 14px;
          font-weight: 600;
          font-size: 13px;
          color: #e2e8f0;
        }

        .dir-step-number {
          font-family: 'Instrument Serif', serif;
          font-size: 40px;
          color: #22c55e;
          font-style: italic;
          line-height: 1;
          margin-bottom: 8px;
        }

        .dir-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.06);
          margin: 0;
          border: none;
        }

        /* Sticky Add to Cart Bar */
        .dir-sticky-bar {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 100;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 12px 24px;
          font-family: 'DM Sans', sans-serif;
          backdrop-filter: blur(12px);
        }
        .dir-sticky-inner {
          max-width: 1080px;
          margin: 0 auto;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .dir-sticky-toggle {
          display: flex;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 2px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .dir-sticky-tab {
          padding: 8px 14px;
          border-radius: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
          border: none;
          color: #94a3b8;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 5px;
        }
        .dir-sticky-tab.active {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }
        .dir-sticky-price {
          font-family: 'Instrument Serif', serif;
          font-size: 22px;
          color: #22c55e;
          font-style: italic;
          white-space: nowrap;
        }
        .dir-sticky-btn {
          padding: 12px 28px;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border: none;
          color: #fff;
          letter-spacing: 0.02em;
          box-shadow: 0 2px 12px rgba(34, 197, 94, 0.3);
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .dir-sticky-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(34, 197, 94, 0.45);
        }
        .dir-sticky-btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        @media (max-width: 768px) {
          .dir-gallery-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 640px) {
          .dir-hero-title { font-size: 32px; }
          .dir-subtitle { font-size: 15px; }
          .dir-section-title { font-size: 26px; }
          .dir-price { font-size: 44px; }
          .dir-btn-primary { width: 100%; justify-content: center; }
          .dir-step-number { font-size: 32px; }
          .dir-sticky-inner {
            flex-direction: column;
            gap: 10px;
          }
          .dir-sticky-btn {
            width: 100%;
            justify-content: center;
          }
          .dir-sticky-toggle { width: 100%; }
          .dir-sticky-tab { flex: 1; justify-content: center; }
        }
        @media (max-width: 480px) {
          .dir-gallery-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="dir-page">
        {/* Nav */}
        <header className="dir-section" style={{ paddingTop: 16, paddingBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontWeight: 900, letterSpacing: '-0.05em', fontSize: 14, textTransform: 'uppercase' as const }}>AMALVERA WEBSITE AGENCY</span>
        </header>

        {/* Hero */}
        <section className="dir-section" style={{ textAlign: 'center', paddingTop: 40, paddingBottom: 48 }}>
          <div className="dir-section-label" style={{ fontSize: 14, padding: '8px 20px' }}>For Home Service Contractors</div>
          <h1 className="dir-hero-title">
            Get the Help You Need with a <em>Custom Website for Your Business</em>
          </h1>
          <p className="dir-subtitle">
            A fully custom, AI-built website for your business — live in 60 seconds, starting at $20/mo.
          </p>
          <CtaButton />
        </section>

        <hr className="dir-divider" />

        {/* What You Get */}
        <section className="dir-section" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div className="dir-section-label">Everything Included</div>
            <h2 className="dir-section-title">Everything You Need to <em>Grow Your Business</em></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 12 }}>
            {[
              { icon: <Globe size={20} />, title: 'Fully Custom Website', desc: 'AI-built, multi-page, SEO-optimized, and fully editable.' },
              { icon: <Smartphone size={20} />, title: 'Mobile App', desc: 'Your business on your customer\'s phone.' },
              { icon: <Target size={20} />, title: 'Lead Connector', desc: 'Capture and manage leads directly from your site.' },
              { icon: <Users size={20} />, title: 'CRM System', desc: 'Track customers, jobs, and follow-ups in one place.' },
            ].map((item, i) => (
              <div className="dir-card" key={i}>
                <div className="dir-card-icon">{item.icon}</div>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="dir-divider" />

        {/* Gallery */}
        <section className="dir-section" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div className="dir-section-label">Custom Websites</div>
            <h2 className="dir-section-title">See What We <em>Build for Contractors</em></h2>
            <p style={{ color: '#94a3b8', fontSize: 14, lineHeight: 1.6, maxWidth: 520, margin: '8px auto 0' }}>
              Each site is fully custom — designed to showcase your services and help grow your business.
            </p>
          </div>
          <div className="dir-gallery-grid">
            {galleryItems.map((item, i) => (
              <div className="dir-gallery-item" key={i}>
                <img src={item.src} alt={`${item.label} sample website`} loading="lazy" />
                <div className="dir-gallery-label">{item.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA #2 — Mid-page */}
        <section className="dir-section" style={{ textAlign: 'center', paddingTop: 16, paddingBottom: 48 }}>
          <p style={{ color: '#94a3b8', fontSize: 15, marginBottom: 16 }}>Ready to get started?</p>
          <CtaButton />
        </section>

        <hr className="dir-divider" />

        {/* How It Works */}
        <section className="dir-section" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div className="dir-section-label">How It Works</div>
            <h2 className="dir-section-title">Your Website in <em>3 Simple Steps</em></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 16 }}>
            {[
              { step: '1', title: 'Subscribe', desc: 'Pay $20/month for hosting — that\'s it. No setup fees, no hidden costs.' },
              { step: '2', title: 'Onboarding Form', desc: 'After payment, fill out a quick form with your business details, services, and preferences.' },
              { step: '3', title: 'Get Your Website', desc: 'We build and deliver your fully custom, multi-page website within 48–72 hours.' },
            ].map((item, i) => (
              <div className="dir-card" key={i} style={{ textAlign: 'center' }}>
                <div className="dir-step-number">{item.step}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{item.title}</h3>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="dir-divider" />

        {/* Why You Need a Website */}
        <section className="dir-section" style={{ paddingTop: 48, paddingBottom: 48 }}>
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div className="dir-section-label">Why It Matters</div>
            <h2 className="dir-section-title">Why You Need a <em>Website</em></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 12, maxWidth: 720, margin: '0 auto' }}>
            {[
              'Rank higher on Google',
              'Look more professional',
              'Show off your work',
              'Get found by new customers',
              'Book more jobs online',
              'Build trust before the first call',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 0' }}>
                <CheckCircle size={18} color="#22c55e" />
                <span style={{ fontSize: 14, fontWeight: 500, color: '#e2e8f0' }}>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <hr className="dir-divider" />

        {/* Pricing — CTA #3 */}
        <section className="dir-section" style={{ paddingTop: 48, paddingBottom: 48, textAlign: 'center' }}>
          <div className="dir-section-label">Simple Pricing</div>
          <h2 className="dir-section-title" style={{ marginBottom: 24 }}>
            One Plan. <em>Everything Included.</em>
          </h2>

          <div className="dir-pricing-toggle">
            <button
              className={`dir-pricing-tab ${pricingPlan === 'monthly' ? 'active' : ''}`}
              onClick={() => setPricingPlan('monthly')}
            >
              Monthly
            </button>
            <button
              className={`dir-pricing-tab ${pricingPlan === 'yearly' ? 'active' : ''}`}
              onClick={() => setPricingPlan('yearly')}
            >
              Yearly <span className="dir-save-badge">Save 44%</span>
            </button>
          </div>

          <div style={{ marginBottom: 24 }}>
            <span className="dir-price">
              {pricingPlan === 'monthly' ? '$20' : '$99'}
            </span>
            <span className="dir-price-per">
              {pricingPlan === 'monthly' ? '/month' : '/year'}
            </span>
            {pricingPlan === 'yearly' && <span className="dir-price-was">$240/yr</span>}
          </div>

          <CtaButton />

          <div className="dir-perks">
            <div className="dir-perk"><div className="dir-perk-dot" /> Cancel anytime</div>
            <div className="dir-perk"><div className="dir-perk-dot" /> Free design</div>
            <div className="dir-perk"><div className="dir-perk-dot" /> Full account access</div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 24px' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexWrap: 'wrap' as const, alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <span style={{ fontWeight: 900, letterSpacing: '-0.05em', fontSize: 11, textTransform: 'uppercase' as const, opacity: 0.5 }}>AMALVERA</span>
            <span style={{ fontSize: 8, color: '#4b5563', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>© 2024 HIGH IMPACT CREATIVE. ALL RIGHTS RESERVED.</span>
            <div style={{ display: 'flex', gap: 24 }}>
              <a href="#" style={{ fontSize: 8, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.1em', textDecoration: 'none' }}>PRIVACY</a>
              <a href="#" style={{ fontSize: 8, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.1em', textDecoration: 'none' }}>SUPPORT</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Sticky Add to Cart Bar */}
      <div className="dir-sticky-bar">
        <div className="dir-sticky-inner">
          <div className="dir-sticky-toggle">
            <button
              className={`dir-sticky-tab ${pricingPlan === 'monthly' ? 'active' : ''}`}
              onClick={() => setPricingPlan('monthly')}
            >
              Monthly
            </button>
            <button
              className={`dir-sticky-tab ${pricingPlan === 'yearly' ? 'active' : ''}`}
              onClick={() => setPricingPlan('yearly')}
            >
              Yearly <span className="dir-save-badge">Save 44%</span>
            </button>
          </div>
          <span className="dir-sticky-price">
            {pricingPlan === 'monthly' ? '$20/mo' : '$99/yr'}
          </span>
          <button className="dir-sticky-btn" onClick={handleCheckout} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Add to Cart'}
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </>
  );
};

export default DirectoryPage;
