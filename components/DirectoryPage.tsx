import { useState } from 'react';
import { Globe, Smartphone, Target, Users, CheckCircle, ArrowRight } from 'lucide-react';

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

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');

        .dir-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
          color: #fff;
          font-family: 'DM Sans', sans-serif;
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
          margin: 0 auto 16px;
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
          margin: 0 auto 32px;
        }

        .dir-btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          padding: 16px 36px;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 16px;
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
          padding: 28px;
          transition: all 0.2s ease;
        }
        .dir-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
        }

        .dir-card-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #22c55e;
          margin-bottom: 16px;
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
          margin-bottom: 16px;
        }

        .dir-section-title {
          font-family: 'Instrument Serif', serif;
          font-size: 32px;
          color: #fff;
          line-height: 1.2;
          margin: 0 0 12px;
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
          margin: 0 auto 24px;
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
          margin-top: 16px;
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

        .dir-sample-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          overflow: hidden;
        }
        .dir-sample-bar {
          padding: 8px 12px;
          display: flex;
          align-items: center;
          gap: 6px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.06);
        }
        .dir-sample-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }
        .dir-sample-body {
          height: 200px;
          background: linear-gradient(135deg, rgba(34, 197, 94, 0.05), rgba(26, 26, 46, 0.5));
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748b;
          font-size: 14px;
        }
        .dir-sample-label {
          padding: 12px 16px;
          font-weight: 600;
          font-size: 14px;
          color: #e2e8f0;
        }

        .dir-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.06);
          margin: 0;
          border: none;
        }

        @media (max-width: 640px) {
          .dir-hero-title { font-size: 32px; }
          .dir-subtitle { font-size: 15px; }
          .dir-section-title { font-size: 26px; }
          .dir-price { font-size: 44px; }
          .dir-btn-primary { width: 100%; justify-content: center; }
        }
      `}</style>

      <div className="dir-page">
        {/* Nav */}
        <header className="dir-section" style={{ paddingTop: 16, paddingBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ background: '#fff', color: '#000', padding: 2, borderRadius: 4, fontWeight: 700 }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m13 2-2 10h3L12 22l2-10h-3l2-10z" /></svg>
          </div>
          <span style={{ fontWeight: 900, letterSpacing: '-0.05em', fontSize: 14, textTransform: 'uppercase' as const }}>PRIMEHUB.AI</span>
        </header>

        {/* Hero */}
        <section className="dir-section" style={{ textAlign: 'center', paddingTop: 64, paddingBottom: 80 }}>
          <div className="dir-section-label">For Home Service Contractors</div>
          <h1 className="dir-hero-title">
            Get More Booked Jobs with a <em>Website That Works for You</em>
          </h1>
          <p className="dir-subtitle">
            A fully custom, AI-built website for your business — live in 60 seconds, starting at $20/mo.
          </p>
          <button className="dir-btn-primary" onClick={handleCheckout} disabled={isLoading}>
            {isLoading ? 'Loading...' : `Get Started — ${priceLabel}`}
            {!isLoading && <ArrowRight size={18} />}
          </button>
        </section>

        <hr className="dir-divider" />

        {/* What You Get */}
        <section className="dir-section" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="dir-section-label">Everything Included</div>
            <h2 className="dir-section-title">Everything You Need to <em>Grow Your Business</em></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
            {[
              { icon: <Globe size={22} />, title: 'Fully Custom Website', desc: 'AI-built, multi-page, SEO-optimized, and fully editable.' },
              { icon: <Smartphone size={22} />, title: 'Mobile App', desc: 'Your business on your customer\'s phone.' },
              { icon: <Target size={22} />, title: 'Lead Connector', desc: 'Capture and manage leads directly from your site.' },
              { icon: <Users size={22} />, title: 'CRM System', desc: 'Track customers, jobs, and follow-ups in one place.' },
            ].map((item, i) => (
              <div className="dir-card" key={i}>
                <div className="dir-card-icon">{item.icon}</div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 14, color: '#94a3b8', lineHeight: 1.5, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <hr className="dir-divider" />

        {/* Why You Need a Website */}
        <section className="dir-section" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="dir-section-label">Why It Matters</div>
            <h2 className="dir-section-title">Why You Need a <em>Website</em></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16, maxWidth: 720, margin: '0 auto' }}>
            {[
              'Rank higher on Google',
              'Look more professional',
              'Show off your work',
              'Get found by new customers',
              'Book more jobs online',
              'Build trust before the first call',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 0' }}>
                <CheckCircle size={20} color="#22c55e" />
                <span style={{ fontSize: 15, fontWeight: 500, color: '#e2e8f0' }}>{item}</span>
              </div>
            ))}
          </div>
        </section>

        <hr className="dir-divider" />

        {/* Sample Sites */}
        <section className="dir-section" style={{ paddingTop: 80, paddingBottom: 80 }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <div className="dir-section-label">Sample Sites</div>
            <h2 className="dir-section-title">See What We <em>Build</em></h2>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
            {['Plumbing', 'HVAC', 'Landscaping'].map((industry) => (
              <div className="dir-sample-card" key={industry}>
                <div className="dir-sample-bar">
                  <div className="dir-sample-dot" style={{ background: '#ef4444' }} />
                  <div className="dir-sample-dot" style={{ background: '#eab308' }} />
                  <div className="dir-sample-dot" style={{ background: '#22c55e' }} />
                </div>
                <div className="dir-sample-body">Coming Soon</div>
                <div className="dir-sample-label">{industry}</div>
              </div>
            ))}
          </div>
        </section>

        <hr className="dir-divider" />

        {/* Pricing */}
        <section className="dir-section" style={{ paddingTop: 80, paddingBottom: 80, textAlign: 'center' }}>
          <div className="dir-section-label">Simple Pricing</div>
          <h2 className="dir-section-title" style={{ marginBottom: 32 }}>
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
              Yearly <span className="dir-save-badge">Save 59%</span>
            </button>
          </div>

          <div style={{ marginBottom: 32 }}>
            <span className="dir-price">
              {pricingPlan === 'monthly' ? '$20' : '$99'}
            </span>
            <span className="dir-price-per">
              {pricingPlan === 'monthly' ? '/month' : '/year'}
            </span>
            {pricingPlan === 'yearly' && <span className="dir-price-was">$240/yr</span>}
          </div>

          <button className="dir-btn-primary" onClick={handleCheckout} disabled={isLoading}>
            {isLoading ? 'Loading...' : `Get Started — ${priceLabel}`}
            {!isLoading && <ArrowRight size={18} />}
          </button>

          <div className="dir-perks">
            <div className="dir-perk"><div className="dir-perk-dot" /> Cancel anytime</div>
            <div className="dir-perk"><div className="dir-perk-dot" /> Free design</div>
            <div className="dir-perk"><div className="dir-perk-dot" /> Full account access</div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '20px 24px' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexWrap: 'wrap' as const, alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
            <span style={{ fontWeight: 900, letterSpacing: '-0.05em', fontSize: 11, textTransform: 'uppercase' as const, opacity: 0.5 }}>PRIMEHUB.AI</span>
            <span style={{ fontSize: 8, color: '#4b5563', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>© 2024 HIGH IMPACT CREATIVE. ALL RIGHTS RESERVED.</span>
            <div style={{ display: 'flex', gap: 24 }}>
              <a href="#" style={{ fontSize: 8, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.1em', textDecoration: 'none' }}>PRIVACY</a>
              <a href="#" style={{ fontSize: 8, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.1em', textDecoration: 'none' }}>SUPPORT</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default DirectoryPage;
