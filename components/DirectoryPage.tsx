import { useState, useEffect, useRef } from 'react';
import { Globe, Smartphone, MessageSquare, Headphones, CheckCircle, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const galleryItems = [
  { src: '/gallery/home-services.png', label: 'Home Services' },
  { src: '/gallery/landscaping.png', label: 'Landscaping' },
  { src: '/gallery/roofing.png', label: 'Roofing' },
  { src: '/gallery/barbershop.png', label: 'Barbershop' },
];

const DirectoryPage = () => {
  const [pricingPlan, setPricingPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [showSticky, setShowSticky] = useState(false);
  const [carouselIndex, setCarouselIndex] = useState(1);
  const heroRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => setShowSticky(!entry.isIntersecting),
      { threshold: 0 }
    );
    if (heroRef.current) observer.observe(heroRef.current);
    return () => observer.disconnect();
  }, []);

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

  const CtaButton = () => (
    <button className="dir-btn-primary" onClick={handleCheckout} disabled={isLoading}>
      {isLoading ? 'Loading...' : 'Get Started'}
      {!isLoading && <ArrowRight size={18} />}
    </button>
  );

  const PricingToggle = () => (
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
          padding-bottom: 70px;
        }
        .dir-section {
          max-width: 1080px;
          margin: 0 auto;
          padding: 0 24px;
        }
        .dir-hero-title {
          font-family: 'Instrument Serif', serif;
          font-size: 46px;
          line-height: 1.12;
          color: #fff;
          max-width: 700px;
          margin: 0 auto 10px;
        }
        .dir-hero-title em { color: #3B82F6; font-style: italic; }
        .dir-subtitle {
          color: #94a3b8;
          font-size: 16px;
          line-height: 1.6;
          max-width: 540px;
          margin: 0 auto 12px;
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
          background: linear-gradient(135deg, #3B82F6, #2563EB);
          border: none;
          color: #fff;
          letter-spacing: 0.02em;
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.3);
        }
        .dir-btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(59, 130, 246, 0.45);
        }
        .dir-btn-primary:disabled {
          opacity: 0.6; cursor: not-allowed; transform: none;
        }
        .dir-card {
          background: rgba(255, 255, 255, 0.04);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 14px;
          padding: 12px;
          transition: all 0.2s ease;
        }
        .dir-card:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.12);
        }
        .dir-card-icon {
          width: 38px; height: 38px;
          border-radius: 10px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          display: flex; align-items: center; justify-content: center;
          color: #3B82F6;
          margin-bottom: 10px;
        }
        .dir-section-label {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(59, 130, 246, 0.1);
          border: 1px solid rgba(59, 130, 246, 0.2);
          border-radius: 100px;
          padding: 5px 12px;
          font-size: 10px; font-weight: 600;
          color: #3B82F6;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 10px;
        }
        .dir-section-title {
          font-family: 'Instrument Serif', serif;
          font-size: 30px; color: #fff;
          line-height: 1.2; margin: 0 0 6px;
        }
        .dir-section-title em { color: #3B82F6; font-style: italic; }
        .dir-pricing-toggle {
          display: flex;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px; padding: 3px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          max-width: 300px;
          margin: 0 auto 12px;
        }
        .dir-pricing-tab {
          flex: 1; padding: 9px 14px;
          border: none; border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 600;
          cursor: pointer; background: transparent;
          color: #94a3b8; transition: all 0.2s;
          display: flex; align-items: center; justify-content: center; gap: 6px;
        }
        .dir-pricing-tab.active {
          background: rgba(59, 130, 246, 0.15);
          color: #3B82F6;
        }
        .dir-save-badge {
          background: #3B82F6; color: #fff;
          font-size: 9px; font-weight: 700;
          padding: 2px 5px; border-radius: 4px;
          text-transform: uppercase;
        }
        .dir-price {
          font-family: 'Instrument Serif', serif;
          font-size: 52px; color: #3B82F6;
          font-style: italic; line-height: 1;
        }
        .dir-price-per { color: #64748b; font-size: 16px; margin-left: 4px; }
        .dir-price-was {
          color: #64748b; font-size: 14px;
          text-decoration: line-through; margin-left: 10px;
        }
        .dir-perks {
          display: flex; justify-content: center;
          gap: 20px; flex-wrap: wrap; margin-top: 12px;
        }
        .dir-perk {
          display: flex; align-items: center;
          gap: 6px; font-size: 12px; color: #94a3b8;
        }
        .dir-perk-dot {
          width: 5px; height: 5px;
          background: #3B82F6; border-radius: 50%;
        }
        .dir-carousel {
          position: relative;
          max-width: 460px;
          margin: 0 auto;
        }
        .dir-carousel-frame {
          border-radius: 12px;
          overflow: hidden;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(255, 255, 255, 0.03);
        }
        .dir-carousel-frame img {
          width: 100%; aspect-ratio: 1;
          object-fit: cover; object-position: center top;
          transform: scale(1.15); display: block;
        }
        .dir-carousel-label {
          text-align: center; padding: 10px 0 0;
          font-weight: 600; font-size: 13px; color: #e2e8f0;
        }
        .dir-carousel-arrow {
          position: absolute; top: 50%;
          transform: translateY(-50%);
          width: 36px; height: 36px;
          border-radius: 50%;
          background: rgba(0,0,0,0.6);
          border: 1px solid rgba(255,255,255,0.15);
          color: #fff;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; transition: all 0.2s; z-index: 2;
          padding: 0;
        }
        .dir-carousel-arrow:hover {
          background: rgba(0,0,0,0.85);
          border-color: rgba(255,255,255,0.3);
        }
        .dir-carousel-dots {
          display: flex; justify-content: center;
          gap: 8px; margin-top: 12px;
        }
        .dir-carousel-dot {
          width: 7px; height: 7px; border-radius: 50%;
          background: rgba(255,255,255,0.2);
          transition: all 0.2s; cursor: pointer;
          border: none; padding: 0;
        }
        .dir-carousel-dot.active { background: #3B82F6; }
        .dir-step-number {
          font-family: 'Instrument Serif', serif;
          font-size: 36px; color: #3B82F6;
          font-style: italic; line-height: 1; margin-bottom: 6px;
        }
        @keyframes offerFlash {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        .dir-offer-box {
          display: inline-block;
          background: rgba(59, 130, 246, 0.08);
          border: 1px solid rgba(59, 130, 246, 0.35);
          border-radius: 10px;
          padding: 10px 20px;
          color: #60A5FA;
          font-size: 13px;
          font-weight: 700;
          margin-top: 8px;
          animation: dirOfferPulse 2.5s ease-in-out infinite, dirOfferShake 3.5s ease-in-out infinite;
        }
        @keyframes dirOfferPulse {
          0%, 100% { box-shadow: 0 0 8px 2px rgba(59, 130, 246, 0.2); }
          50% { box-shadow: 0 0 28px 8px rgba(59, 130, 246, 0.45); }
        }
        @keyframes dirOfferShake {
          0%, 85%, 100% { transform: translateX(0); }
          88% { transform: translateX(-2px); }
          91% { transform: translateX(2px); }
          94% { transform: translateX(-1px); }
          97% { transform: translateX(1px); }
        }
        .dir-trust {
          color: #64748b; font-size: 12px;
          margin-top: 8px; letter-spacing: 0.02em;
        }
        .dir-divider {
          height: 1px;
          background: rgba(255, 255, 255, 0.06);
          margin: 0; border: none;
        }
        .dir-muted { color: #94a3b8; font-size: 13px; line-height: 1.5; }

        /* Sticky Bar */
        .dir-sticky-bar {
          position: fixed; bottom: 0; left: 0; right: 0;
          z-index: 100;
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 6px 16px;
          font-family: 'DM Sans', sans-serif;
          backdrop-filter: blur(12px);
          transform: translateY(100%);
          transition: transform 0.3s ease;
        }
        .dir-sticky-bar.visible {
          transform: translateY(0);
        }
        .dir-sticky-inner {
          max-width: 1080px; margin: 0 auto;
          display: flex; align-items: center;
          justify-content: space-between; gap: 12px;
        }
        .dir-sticky-toggle {
          display: flex;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px; padding: 2px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .dir-sticky-tab {
          padding: 6px 12px; border-radius: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px; font-weight: 600;
          cursor: pointer; transition: all 0.2s ease;
          background: transparent; border: none;
          color: #94a3b8; white-space: nowrap;
          display: flex; align-items: center; gap: 5px;
        }
        .dir-sticky-tab.active {
          background: rgba(59, 130, 246, 0.15);
          color: #3B82F6;
        }
        .dir-sticky-price {
          font-family: 'Instrument Serif', serif;
          font-size: 22px; color: #3B82F6;
          font-style: italic; white-space: nowrap;
        }
        .dir-sticky-btn {
          padding: 10px 24px; border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px; font-weight: 700;
          cursor: pointer; transition: all 0.2s ease;
          background: linear-gradient(135deg, #3B82F6, #2563EB);
          border: none; color: #fff;
          letter-spacing: 0.02em;
          box-shadow: 0 2px 12px rgba(59, 130, 246, 0.3);
          white-space: nowrap;
          display: flex; align-items: center; gap: 8px;
        }
        .dir-sticky-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(59, 130, 246, 0.45);
        }
        .dir-sticky-btn:disabled {
          opacity: 0.6; cursor: not-allowed; transform: none;
        }

        @keyframes dirCallPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(59,130,246,0.55), 0 6px 20px rgba(59,130,246,0.25); }
          50% { box-shadow: 0 0 0 8px rgba(59,130,246,0), 0 6px 24px rgba(59,130,246,0.45); }
        }
        .dir-call-cta {
          display: flex;
          align-items: center;
          gap: 8px;
          text-decoration: none;
          padding: 8px 14px;
          border-radius: 999px;
          background: linear-gradient(135deg, #3B82F6 0%, #2563EB 100%);
          border: 1px solid rgba(255,255,255,0.15);
          transition: transform 0.15s ease, box-shadow 0.2s ease;
          animation: dirCallPulse 2s ease-in-out infinite;
          white-space: nowrap;
        }
        .dir-call-cta:hover {
          transform: translateY(-1px) scale(1.02);
        }
        .dir-call-cta:active {
          transform: translateY(0) scale(0.98);
        }
        .dir-call-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 22px;
          height: 22px;
          border-radius: 50%;
          background: rgba(255,255,255,0.2);
          color: #fff;
          flex-shrink: 0;
        }
        .dir-call-text {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          line-height: 1.1;
        }
        .dir-call-label {
          font-size: 9px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.09em;
          color: rgba(255,255,255,0.9);
        }
        .dir-call-number {
          font-size: 14px;
          font-weight: 900;
          color: #fff;
          letter-spacing: -0.01em;
        }

        @media (max-width: 768px) {
        }
        @media (max-width: 640px) {
          .dir-hero-title { font-size: 30px; }
          .dir-subtitle { font-size: 14px; }
          .dir-section-title { font-size: 24px; }
          .dir-price { font-size: 40px; }
          .dir-btn-primary { width: 100%; justify-content: center; }
          .dir-step-number { font-size: 28px; }
          .dir-sticky-inner { flex-direction: column; gap: 10px; }
          .dir-sticky-btn { width: 100%; justify-content: center; }
          .dir-sticky-toggle { width: 100%; }
          .dir-sticky-tab { flex: 1; justify-content: center; }
          .dir-call-label { font-size: 8px; letter-spacing: 0.06em; }
          .dir-call-number { font-size: 12px; }
          .dir-call-cta { padding: 5px 9px; border-radius: 8px; }
        }
        @media (max-width: 480px) {
        }
      `}</style>

      <div className="dir-page">
        {/* Nav */}
        <header className="dir-section" style={{ paddingTop: 14, paddingBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <span style={{ fontWeight: 900, letterSpacing: '-0.04em', fontSize: 13, textTransform: 'uppercase' as const }}>AMALVERA WEBSITE AGENCY</span>
          <a href="tel:+18302549274" className="dir-call-cta" aria-label="Tap to call 24/7 customer representative">
            <span className="dir-call-icon">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/>
              </svg>
            </span>
            <span className="dir-call-text">
              <span className="dir-call-label">Tap to Call • 24/7 Rep</span>
              <span className="dir-call-number">(830) 254-9274</span>
            </span>
          </a>
        </header>

        {/* 1. Hero */}
        <section ref={heroRef} className="dir-section" style={{ textAlign: 'center', paddingTop: 22, paddingBottom: 26 }}>
          <div className="dir-section-label" style={{ fontSize: 13, padding: '7px 18px' }}>For Home Service Contractors</div>
          <h1 className="dir-hero-title">
            Get a Website That Can Help You <em>Win More Jobs</em>
          </h1>
          <p className="dir-subtitle">
            Built for home service contractors — we design, build, and manage everything for you. Typically ready in <strong style={{ color: '#3B82F6' }}>48 hours</strong>.
          </p>
          {/* Video + How It Works side by side */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '16px auto', maxWidth: 500, textAlign: 'left' }}>
            <div style={{ flexShrink: 0, width: 160 }}>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 5,
                padding: '4px 9px',
                marginBottom: 6,
                borderRadius: 999,
                background: 'rgba(59,130,246,0.18)',
                border: '1px solid rgba(59,130,246,0.45)',
                boxShadow: '0 0 10px rgba(59,130,246,0.35)',
                color: '#f1f5f9',
                fontSize: 9,
                fontWeight: 800,
                letterSpacing: '0.05em',
                textTransform: 'uppercase' as const,
                lineHeight: 1,
              }}>
                <span aria-hidden="true">🔊</span>
                <span>Tap to Unmute</span>
              </div>
              <div style={{ borderRadius: 10, overflow: 'hidden', boxShadow: '0 4px 20px rgba(0,0,0,0.2)' }}>
                <wistia-player media-id="p4uzw25p63" aspect="0.5625" autoplay="true" muted="false"></wistia-player>
              </div>
            </div>
            <div style={{ flex: 1 }}>
              <div className="dir-section-label" style={{ marginBottom: 10, display: 'inline-block' }}>How It Works</div>
              {[
                { step: '1', title: 'Sign Up', content: 'Get started in less than a minute.' },
                { step: '2', title: 'Tell Us About You', content: 'Quick form with your services & location.' },
                { step: '3', title: 'We Build It', content: <><strong style={{ color: '#3B82F6' }}>48 hours</strong> turnaround.</> },
              ].map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: i === 2 ? 6 : 10 }}>
                  <span style={{ fontFamily: "'Instrument Serif', serif", fontSize: 22, color: '#3B82F6', fontStyle: 'italic', lineHeight: 1, flexShrink: 0, width: 18 }}>{item.step}</span>
                  <div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: '#f1f5f9' }}>{item.title}</div>
                    <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>{item.content}</div>
                  </div>
                </div>
              ))}
              {/* Bullet points under We Build It */}
              <div style={{ paddingLeft: 26, marginTop: 2 }}>
                {[
                  { label: 'Full account access', highlight: true },
                  { label: 'SEO Optimized' },
                  { label: 'Multiple pages' },
                  { label: 'Custom photos' },
                  { label: 'Chat widget, lead form, and app' },
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 3 }}>
                    <span style={{ color: '#3B82F6', fontSize: 8 }}>●</span>
                    <span style={{
                      fontSize: 10,
                      fontWeight: item.highlight ? 900 : 600,
                      letterSpacing: '0.03em',
                      color: item.highlight ? '#f1f5f9' : '#94a3b8',
                      background: item.highlight ? 'rgba(59,130,246,0.18)' : 'transparent',
                      borderRadius: item.highlight ? 4 : 0,
                      padding: item.highlight ? '1px 5px' : undefined,
                    }}>{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Pricing + CTA */}
          <div style={{ marginTop: 4 }}>
            <PricingToggle />
          </div>
          <div style={{ marginBottom: 12 }}>
            <span className="dir-price">{pricingPlan === 'monthly' ? '$20' : '$99'}</span>
            <span className="dir-price-per">{pricingPlan === 'monthly' ? '/month' : '/year'}</span>
            {pricingPlan === 'yearly' && <span className="dir-price-was">$240/yr</span>}
          </div>
          <CtaButton />

          {/* Payment icons */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 10, marginBottom: 4, flexWrap: 'wrap' as const }}>
            <span style={{ fontSize: 9, color: '#4b5563', letterSpacing: '0.05em', marginRight: 2 }}>SECURE PAYMENT</span>
            {[
              { src: 'https://cdn.jsdelivr.net/npm/payment-icons@1.0.0/min/flat/visa.svg', alt: 'Visa' },
              { src: 'https://cdn.jsdelivr.net/npm/payment-icons@1.0.0/min/flat/mastercard.svg', alt: 'Mastercard' },
              { src: 'https://cdn.jsdelivr.net/npm/payment-icons@1.0.0/min/flat/amex.svg', alt: 'Amex' },
              { src: 'https://cdn.jsdelivr.net/npm/payment-icons@1.0.0/min/flat/discover.svg', alt: 'Discover' },
              { src: 'https://cdn.simpleicons.org/applepay/white', alt: 'Apple Pay', dark: true },
            ].map((icon: any) => (
              <img key={icon.alt} src={icon.src} alt={icon.alt} style={{ height: 24, width: 'auto', borderRadius: 4, boxShadow: '0 1px 3px rgba(0,0,0,0.2)', background: icon.dark ? '#000' : undefined, padding: icon.dark ? '3px 6px' : undefined }} />
            ))}
          </div>

          <p className="dir-trust">No contracts &bull; Cancel anytime &bull; 24/7 team access</p>
        </section>

        <hr className="dir-divider" />

        {/* 2. Portfolio */}
        <section className="dir-section" style={{ paddingTop: 26, paddingBottom: 26 }}>
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <h2 className="dir-section-title">Custom Professional Websites for <em>Home Service Contractors</em></h2>
          </div>
          <div className="dir-carousel">
            <button
              className="dir-carousel-arrow"
              style={{ left: -18 }}
              onClick={() => setCarouselIndex((carouselIndex - 1 + galleryItems.length) % galleryItems.length)}
            >
              <ChevronLeft size={20} />
            </button>
            <div className="dir-carousel-frame">
              <img src={galleryItems[carouselIndex].src} alt={`${galleryItems[carouselIndex].label} sample website`} />
            </div>
            <button
              className="dir-carousel-arrow"
              style={{ right: -18 }}
              onClick={() => setCarouselIndex((carouselIndex + 1) % galleryItems.length)}
            >
              <ChevronRight size={20} />
            </button>
            <div className="dir-carousel-label">{galleryItems[carouselIndex].label}</div>
            <div className="dir-carousel-dots">
              {galleryItems.map((_, i) => (
                <button key={i} className={`dir-carousel-dot ${i === carouselIndex ? 'active' : ''}`} onClick={() => setCarouselIndex(i)} />
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ borderTop: '1px solid rgba(255,255,255,0.05)', padding: '12px 20px' }}>
          <div style={{ maxWidth: 1080, margin: '0 auto', display: 'flex', flexWrap: 'wrap' as const, alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
            <span style={{ fontWeight: 900, letterSpacing: '-0.04em', fontSize: 10, textTransform: 'uppercase' as const, opacity: 0.5 }}>AMALVERA</span>
            <span style={{ fontSize: 8, color: '#4b5563', textTransform: 'uppercase' as const, letterSpacing: '0.1em' }}>© 2024 HIGH IMPACT CREATIVE. ALL RIGHTS RESERVED.</span>
            <div style={{ display: 'flex', gap: 20 }}>
              <a href="#" style={{ fontSize: 8, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.1em', textDecoration: 'none' }}>PRIVACY</a>
              <a href="#" style={{ fontSize: 8, color: '#6b7280', textTransform: 'uppercase' as const, letterSpacing: '0.1em', textDecoration: 'none' }}>SUPPORT</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Sticky Bar */}
      <div className={`dir-sticky-bar ${showSticky ? 'visible' : ''}`}>
        <div className="dir-sticky-inner">
          <div className="dir-sticky-toggle">
            <button
              className={`dir-sticky-tab ${pricingPlan === 'monthly' ? 'active' : ''}`}
              onClick={() => setPricingPlan('monthly')}
            >Monthly &middot; $20/mo</button>
            <button
              className={`dir-sticky-tab ${pricingPlan === 'yearly' ? 'active' : ''}`}
              onClick={() => setPricingPlan('yearly')}
            >Yearly &middot; $99/yr <span className="dir-save-badge">Save 44%</span></button>
          </div>
          <button className="dir-sticky-btn" onClick={handleCheckout} disabled={isLoading}>
            {isLoading ? 'Loading...' : 'Get Started'}
            {!isLoading && <ArrowRight size={16} />}
          </button>
        </div>
      </div>
    </>
  );
};

export default DirectoryPage;
