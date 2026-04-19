import { useState, useEffect } from 'react';

const galleryItems = [
  { src: '/gallery/home-services.jpg', label: 'Home Services' },
  { src: '/gallery/landscaping.jpg', label: 'Landscaping' },
  { src: '/gallery/roofing.jpg', label: 'Roofing' },
  { src: '/gallery/cleaning.jpg', label: 'Cleaning' },
  { src: '/gallery/barbershop.jpg', label: 'Barbershop' },
];

const roman = ['I', 'II', 'III', 'IV', 'V'];

const DirectoryPage = () => {
  const [pricingPlan, setPricingPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setIsLoading(false);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  const handleCheckout = async () => {
    setIsLoading(true);

    // Fire Meta Pixel InitiateCheckout event when user starts checkout
    if (typeof window !== 'undefined' && (window as any).fbq) {
      const value = pricingPlan === 'yearly' ? 99 : 20;
      const eventID = `ic_${pricingPlan}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      (window as any).fbq('track', 'InitiateCheckout', {
        value,
        currency: 'USD',
        content_name: pricingPlan === 'yearly' ? 'Yearly Plan' : 'Monthly Plan',
        content_category: 'subscription',
      }, { eventID });
    }

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

  const CtaButton = ({ large = true }: { large?: boolean }) => (
    <button className={`mv-cta ${large ? 'mv-cta-lg' : ''}`} onClick={handleCheckout} disabled={isLoading}>
      <span className="mv-cta-inner">
        {isLoading ? 'Loading…' : 'Get Started'}
        {!isLoading && <span aria-hidden="true" style={{ marginLeft: 10, letterSpacing: 0 }}>▸</span>}
      </span>
    </button>
  );

  const PricingToggle = ({ compact = false }: { compact?: boolean }) => (
    <div className={`mv-toggle ${compact ? 'mv-toggle-compact' : ''}`}>
      <button
        className={`mv-toggle-tab ${pricingPlan === 'monthly' ? 'active' : ''}`}
        onClick={() => setPricingPlan('monthly')}
      >
        Monthly
      </button>
      <button
        className={`mv-toggle-tab ${pricingPlan === 'yearly' ? 'active' : ''}`}
        onClick={() => setPricingPlan('yearly')}
      >
        Yearly <span className="mv-save">Save 44%</span>
      </button>
    </div>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Inter:wght@300;400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap');

        .mv-page {
          min-height: 100vh;
          background:
            radial-gradient(ellipse 900px 600px at 50% -10%, rgba(201,169,110,0.06), transparent 60%),
            radial-gradient(ellipse 800px 600px at 110% 110%, rgba(201,169,110,0.06), transparent 60%),
            #0a0a0a;
          color: #e8dcc4;
          font-family: 'Inter', sans-serif;
          padding-bottom: 86px;
          position: relative;
          overflow-x: hidden;
        }

        /* Top ribbon */
        .mv-ribbon {
          background: linear-gradient(180deg, #c9a96e 0%, #b8975c 100%);
          color: #0a0a0a;
          text-align: center;
          padding: 5px 16px;
          font-size: 9px;
          font-weight: 600;
          letter-spacing: 0.34em;
          text-transform: uppercase;
          font-family: 'Inter', sans-serif;
        }
        .mv-ribbon-diamond { margin: 0 8px; opacity: 0.65; }

        /* Header */
        .mv-header {
          max-width: 1200px; margin: 0 auto;
          padding: 10px 22px;
          display: flex; align-items: center; justify-content: space-between; gap: 14px;
          border-bottom: 1px solid rgba(201,169,110,0.12);
        }
        .mv-wordmark {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 400;
          font-style: italic;
          color: #c9a96e;
          letter-spacing: 0.04em;
          line-height: 1;
        }
        .mv-wordmark-sub {
          display: block;
          font-family: 'Inter', sans-serif;
          font-style: normal;
          font-size: 7px;
          color: #8a8072;
          letter-spacing: 0.4em;
          text-transform: uppercase;
          margin-top: 2px;
          font-weight: 500;
        }
        .mv-call {
          text-decoration: none;
          display: inline-flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 1px;
          padding: 5px 10px;
          border: 1px solid rgba(201,169,110,0.35);
          position: relative;
          background: transparent;
          transition: border-color 0.25s ease, background 0.25s ease;
        }
        .mv-call::before {
          content: '';
          position: absolute; inset: 2px;
          border: 1px solid rgba(201,169,110,0.2);
          pointer-events: none;
        }
        .mv-call:hover {
          border-color: rgba(201,169,110,0.7);
          background: rgba(201,169,110,0.04);
        }
        .mv-call-label {
          font-size: 7px; letter-spacing: 0.3em; text-transform: uppercase;
          color: #c9a96e; font-weight: 500;
        }
        .mv-call-number {
          font-family: 'Cormorant Garamond', serif;
          font-size: 14px; color: #e8dcc4; letter-spacing: 0.02em;
          font-weight: 400;
          line-height: 1.1;
        }

        /* Containers */
        .mv-shell { max-width: 1100px; margin: 0 auto; padding: 0 28px; }

        /* Eyebrow */
        .mv-eyebrow {
          display: inline-flex; align-items: center; gap: 12px;
          color: #c9a96e; font-size: 10px; letter-spacing: 0.4em;
          text-transform: uppercase; font-weight: 500;
          margin-bottom: 12px;
        }
        .mv-eyebrow-bar {
          width: 32px; height: 1px; background: #c9a96e;
        }

        /* Hero */
        .mv-hero {
          text-align: center;
          padding: 22px 0 20px;
        }
        .mv-hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 32px;
          line-height: 1.15;
          color: #e8dcc4;
          max-width: 560px;
          margin: 0 auto 10px;
          letter-spacing: 0.005em;
        }
        .mv-hero-title em {
          color: #c9a96e;
          font-style: italic;
          font-weight: 300;
        }
        .mv-hero-sub {
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          line-height: 1.5;
          color: #c8bca2;
          font-weight: 300;
          font-style: italic;
          max-width: 500px;
          margin: 0 auto;
        }

        /* Crest divider */
        .mv-crest {
          display: flex; align-items: center; justify-content: center;
          gap: 14px;
          margin: 14px auto;
          max-width: 680px;
          color: #c9a96e;
          font-size: 9px; letter-spacing: 0.45em; text-transform: uppercase; font-weight: 500;
        }
        .mv-crest-line {
          flex: 1; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,169,110,0.35), transparent);
        }
        .mv-diamond { color: #c9a96e; }

        /* Commission row: video + steps */
        .mv-commission-row {
          display: grid;
          grid-template-columns: 1.15fr 1fr;
          gap: 24px;
          align-items: start;
          max-width: 720px;
          margin: 14px auto 0;
        }
        .mv-frame {
          position: relative;
          padding: 8px;
          background: rgba(201,169,110,0.04);
        }
        .mv-frame::before,
        .mv-frame::after {
          content: '';
          position: absolute;
          pointer-events: none;
        }
        .mv-frame::before {
          inset: 0;
          border: 1px solid rgba(201,169,110,0.45);
        }
        .mv-frame::after {
          inset: 5px;
          border: 1px solid rgba(201,169,110,0.18);
        }
        .mv-video-hint {
          display: inline-flex; align-items: center; gap: 6px;
          font-size: 9px; letter-spacing: 0.4em; text-transform: uppercase;
          color: #c9a96e; font-weight: 500;
          margin-bottom: 10px;
          padding: 3px 0;
        }
        .mv-video-hint::before,
        .mv-video-hint::after {
          content: '';
          display: inline-block; width: 16px; height: 1px;
          background: #c9a96e;
        }

        .mv-steps { text-align: left; padding-top: 4px; }
        .mv-step-eyebrow {
          font-size: 9px; letter-spacing: 0.5em; text-transform: uppercase;
          color: #8a8072; margin-bottom: 14px;
        }
        .mv-step {
          display: grid;
          grid-template-columns: 32px 1fr;
          gap: 12px;
          padding: 10px 0;
          border-bottom: 1px solid rgba(201,169,110,0.12);
        }
        .mv-step:last-child { border-bottom: none; }
        .mv-step-num {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 22px;
          color: #c9a96e;
          line-height: 1.2;
        }
        .mv-step-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px; color: #e8dcc4;
          font-weight: 400; line-height: 1.2;
          margin-bottom: 2px;
        }
        .mv-step-body {
          font-size: 11px; color: #8a8072; line-height: 1.5;
          font-family: 'Inter', sans-serif;
        }

        .mv-incl {
          margin-top: 16px;
          padding: 14px 0 4px;
          border-top: 1px solid rgba(201,169,110,0.18);
        }
        .mv-incl-label {
          font-size: 9px; letter-spacing: 0.4em; text-transform: uppercase;
          color: #8a8072; margin-bottom: 8px;
        }
        .mv-incl-list { list-style: none; padding: 0; margin: 0; }
        .mv-incl-item {
          display: flex; align-items: center; gap: 10px;
          padding: 3px 0;
          font-size: 11px; color: #c8bca2;
          letter-spacing: 0.04em;
          font-family: 'Inter', sans-serif;
        }
        .mv-incl-item.is-key {
          color: #e8dcc4; font-weight: 600;
        }
        .mv-incl-item.is-key .mv-incl-dot { background: #d4af37; }
        .mv-incl-dot {
          width: 4px; height: 4px;
          background: #c9a96e; border-radius: 50%;
          flex-shrink: 0;
        }

        /* Price card */
        .mv-price-card {
          max-width: 520px;
          margin: 20px auto 12px;
          padding: 16px 18px 14px;
          position: relative;
          background: #141210;
        }
        .mv-price-card::before,
        .mv-price-card::after {
          content: '';
          position: absolute; pointer-events: none;
        }
        .mv-price-card::before {
          inset: 0; border: 1px solid rgba(201,169,110,0.4);
        }
        .mv-price-card::after {
          inset: 6px; border: 1px solid rgba(201,169,110,0.18);
        }
        .mv-price-eyebrow {
          font-size: 9px; letter-spacing: 0.45em; text-transform: uppercase;
          color: #c9a96e; text-align: center; margin-bottom: 8px;
          font-weight: 500;
        }
        .mv-toggle {
          display: flex;
          border: 1px solid rgba(201,169,110,0.3);
          margin: 0 auto 12px;
          max-width: 230px;
          background: rgba(0,0,0,0.35);
        }
        .mv-toggle-compact { max-width: 230px; margin: 0; }
        .mv-toggle-tab {
          flex: 1; padding: 6px 10px;
          border: none; background: transparent;
          font-family: 'Inter', sans-serif;
          font-size: 9px; font-weight: 500;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #8a8072;
          cursor: pointer;
          transition: all 0.25s ease;
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
        }
        .mv-toggle-tab.active {
          background: rgba(201,169,110,0.12);
          color: #c9a96e;
        }
        .mv-save {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8px; letter-spacing: 0.1em;
          color: #d4af37; font-weight: 400;
          text-transform: uppercase;
        }
        .mv-price-big {
          text-align: center;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          color: #e8dcc4;
          line-height: 1;
        }
        .mv-price-big .mv-num {
          font-size: 44px; letter-spacing: 0.01em;
          color: #c9a96e;
        }
        .mv-price-big .mv-per {
          font-size: 11px; color: #8a8072;
          letter-spacing: 0.3em; text-transform: uppercase;
          margin-left: 8px;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
        }
        .mv-price-was {
          text-align: center;
          margin-top: 4px;
          font-size: 9px; letter-spacing: 0.3em;
          color: #8a8072; text-transform: uppercase;
          font-family: 'JetBrains Mono', monospace;
        }
        .mv-price-was s { opacity: 0.6; }

        /* CTA */
        @keyframes mvCtaGlow {
          0%, 100% { box-shadow: 0 0 14px rgba(212,175,55,0.35), 0 0 0 1px rgba(212,175,55,0.45); }
          50% { box-shadow: 0 0 22px rgba(212,175,55,0.6), 0 0 0 2px rgba(212,175,55,0.65); }
        }
        .mv-cta {
          display: inline-block;
          padding: 3px;
          border: 1px solid rgba(212,175,55,0.5);
          background: transparent;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.25s ease;
          color: inherit;
          font-family: inherit;
          animation: mvCtaGlow 2.4s ease-in-out infinite;
        }
        .mv-cta-inner {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 10px 26px;
          background: linear-gradient(180deg, #e0bf5a 0%, #c9a96e 60%, #b89556 100%);
          color: #0a0a0a;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          font-family: 'Inter', sans-serif;
          min-width: 170px;
          text-shadow: 0 1px 0 rgba(255,255,255,0.15);
        }
        .mv-cta-lg .mv-cta-inner { padding: 11px 32px; min-width: 200px; font-size: 12px; }
        .mv-cta:hover {
          transform: translateY(-1px);
        }
        .mv-cta:hover .mv-cta-inner {
          background: linear-gradient(180deg, #ebcc6a 0%, #d4af37 60%, #c29a47 100%);
          color: #000;
        }
        .mv-cta:active { transform: translateY(1px); }
        .mv-cta:disabled {
          opacity: 0.55; cursor: not-allowed; animation: none;
        }
        .mv-cta-wrap {
          text-align: center;
          margin-top: 6px;
        }

        /* Payment icons */
        .mv-pay {
          display: flex; align-items: center; justify-content: center;
          gap: 10px;
          margin-top: 14px;
          flex-wrap: wrap;
        }
        .mv-pay-label {
          font-size: 8px; letter-spacing: 0.4em; text-transform: uppercase;
          color: #8a8072; font-family: 'JetBrains Mono', monospace;
        }
        .mv-pay img {
          height: 18px; width: auto;
          opacity: 0.8; filter: grayscale(20%);
          transition: opacity 0.2s ease, filter 0.2s ease;
        }
        .mv-pay img:hover { opacity: 1; filter: none; }
        .mv-pay-dark {
          background: #000;
          padding: 3px 6px;
        }

        .mv-trust {
          margin-top: 12px;
          font-size: 8px; letter-spacing: 0.4em;
          text-transform: uppercase; color: #8a8072;
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
        }

        /* Portfolio */
        .mv-portfolio { padding: 14px 0 20px; }
        .mv-portfolio-title {
          text-align: center;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-style: italic;
          font-size: 22px;
          color: #e8dcc4;
          line-height: 1.15;
          margin: 0 0 4px;
        }
        .mv-portfolio-title em {
          color: #c9a96e; font-style: italic;
        }
        .mv-portfolio-sub {
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 8px; letter-spacing: 0.35em; text-transform: uppercase;
          color: #8a8072;
          margin-bottom: 12px;
        }

        /* Gallery — horizontal scroller */
        .mv-gallery-wrap {
          margin: 0 -28px;
          padding: 2px 28px 12px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }
        .mv-gallery-wrap::-webkit-scrollbar { height: 6px; }
        .mv-gallery-wrap::-webkit-scrollbar-track { background: rgba(201,169,110,0.06); }
        .mv-gallery-wrap::-webkit-scrollbar-thumb {
          background: rgba(201,169,110,0.4); border-radius: 3px;
        }
        .mv-gallery {
          display: flex;
          gap: 18px;
          padding: 4px 0;
        }
        .mv-gallery-card {
          position: relative;
          flex: 0 0 auto;
          width: 420px;
          padding: 9px;
          background: transparent;
          cursor: default;
          scroll-snap-align: center;
        }
        .mv-gallery-card::before,
        .mv-gallery-card::after {
          content: '';
          position: absolute; pointer-events: none;
        }
        .mv-gallery-card::before {
          inset: 0;
          border: 1px solid rgba(201,169,110,0.45);
        }
        .mv-gallery-card::after {
          inset: 5px;
          border: 1px solid rgba(201,169,110,0.2);
        }
        .mv-gallery-thumb {
          position: relative; z-index: 1;
          overflow: hidden;
          background: #0f0e0c;
          aspect-ratio: 4/3;
        }
        .mv-gallery-thumb img {
          width: 100%; height: 100%;
          object-fit: cover; object-position: center top;
          display: block;
          filter: sepia(10%) saturate(92%) contrast(96%);
          transition: filter 0.35s ease, transform 0.6s ease;
        }
        .mv-gallery-card:hover .mv-gallery-thumb img {
          filter: none;
          transform: scale(1.03);
        }
        .mv-gallery-label {
          position: relative; z-index: 1;
          text-align: center;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 18px;
          color: #c9a96e;
          padding-top: 10px;
        }
        .mv-carousel {
          position: relative;
          max-width: 420px;
          margin: 0 auto;
          padding: 8px;
        }
        .mv-carousel::before {
          content: '';
          position: absolute; inset: 0;
          border: 1px solid rgba(201,169,110,0.4);
          pointer-events: none;
        }
        .mv-carousel::after {
          content: '';
          position: absolute; inset: 6px;
          border: 1px solid rgba(201,169,110,0.18);
          pointer-events: none;
        }
        .mv-carousel-frame {
          overflow: hidden;
          background: #0f0e0c;
          position: relative;
          z-index: 1;
        }
        .mv-carousel-frame img {
          width: 100%; aspect-ratio: 4/3;
          object-fit: cover; object-position: center top;
          display: block;
          filter: sepia(12%) saturate(90%) contrast(95%);
        }
        .mv-carousel-arrow {
          position: absolute; top: 50%;
          transform: translateY(-50%);
          width: 32px; height: 32px;
          background: #0a0a0a;
          border: 1px solid rgba(201,169,110,0.4);
          color: #c9a96e;
          display: flex; align-items: center; justify-content: center;
          cursor: pointer; z-index: 3;
          transition: all 0.25s ease;
          padding: 0;
        }
        .mv-carousel-arrow:hover {
          border-color: #c9a96e; color: #d4af37;
        }
        .mv-carousel-caption {
          text-align: center;
          margin-top: 12px;
        }
        .mv-carousel-no {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8px; letter-spacing: 0.35em;
          color: #8a8072; text-transform: uppercase;
          margin-bottom: 4px;
        }
        .mv-carousel-label {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px; color: #c9a96e;
          font-style: italic; font-weight: 400;
        }
        .mv-carousel-dots {
          display: flex; justify-content: center; gap: 8px;
          margin-top: 10px;
        }
        .mv-carousel-dot {
          width: 8px; height: 8px; padding: 0;
          background: transparent;
          border: 1px solid rgba(201,169,110,0.4);
          cursor: pointer;
          transform: rotate(45deg);
          transition: all 0.25s ease;
        }
        .mv-carousel-dot.active {
          background: #c9a96e;
          border-color: #c9a96e;
        }

        /* Footer */
        .mv-footer {
          border-top: 1px solid rgba(201,169,110,0.18);
          padding: 22px 28px 24px;
          margin-top: 20px;
        }
        .mv-footer-inner {
          max-width: 1100px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
        }
        .mv-footer-mark {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-size: 14px;
          color: #c9a96e;
          letter-spacing: 0.05em;
        }
        .mv-footer-meta {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8px; letter-spacing: 0.3em; text-transform: uppercase;
          color: #8a8072;
        }
        .mv-footer-links { display: flex; gap: 22px; }
        .mv-footer-link {
          font-family: 'Inter', sans-serif;
          font-size: 9px; letter-spacing: 0.35em; text-transform: uppercase;
          color: #8a8072; text-decoration: none; font-weight: 500;
          transition: color 0.2s ease;
        }
        .mv-footer-link:hover { color: #c9a96e; }

        /* Sticky bar */
        .mv-sticky {
          position: fixed; bottom: 0; left: 0; right: 0;
          z-index: 100;
          background: #0a0a0a;
          border-top: 1px solid rgba(201,169,110,0.35);
          padding: 7px 16px;
          transform: translateY(110%);
          transition: transform 0.35s ease;
        }
        .mv-sticky.visible { transform: translateY(0); }
        .mv-sticky-inner {
          max-width: 1100px; margin: 0 auto;
          display: grid;
          grid-template-columns: 1fr auto 1fr;
          align-items: center;
          gap: 14px;
        }
        .mv-sticky-inner > :first-child { justify-self: start; }
        .mv-sticky-inner > :last-child { justify-self: end; }
        .mv-sticky-inner > :nth-child(2) { justify-self: center; }
        .mv-sticky-left {
          display: flex; align-items: center; gap: 14px;
          flex-wrap: wrap;
        }
        .mv-sticky-price {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 400;
          color: #d4af37;
          font-size: 38px;
          line-height: 1;
          white-space: nowrap;
          text-shadow: 0 0 18px rgba(212,175,55,0.35);
        }
        .mv-sticky-price .mv-sticky-per {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; color: #c9a96e;
          letter-spacing: 0.3em; text-transform: uppercase;
          font-style: normal;
          font-weight: 500;
          margin-left: 8px;
          text-shadow: none;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .mv-hero-title { font-size: 26px; }
          .mv-hero-sub { font-size: 14px; }
          .mv-commission-row {
            grid-template-columns: 1fr 1fr;
            gap: 16px;
            max-width: 500px;
          }
          .mv-portfolio-title { font-size: 20px; }
          .mv-gallery-card { width: 300px; padding: 7px; }
          .mv-gallery-label { font-size: 15px; padding-top: 8px; }
          .mv-gallery-wrap { margin: 0 -18px; padding: 2px 18px 10px; }
          .mv-gallery { gap: 14px; }
        }
        @media (max-width: 640px) {
          .mv-ribbon { font-size: 7px; letter-spacing: 0.26em; padding: 4px 10px; }
          .mv-ribbon-diamond { margin: 0 5px; }
          .mv-header { padding: 8px 14px; gap: 10px; }
          .mv-wordmark { font-size: 15px; }
          .mv-wordmark-sub { font-size: 6px; letter-spacing: 0.3em; }
          .mv-call { padding: 4px 8px; }
          .mv-call-label { font-size: 6px; letter-spacing: 0.25em; }
          .mv-call-number { font-size: 12px; }
          .mv-shell { padding: 0 18px; }
          .mv-hero { padding: 16px 0 14px; }
          .mv-hero-title { font-size: 22px; }
          .mv-hero-sub { font-size: 13px; }
          .mv-commission-row {
            grid-template-columns: 1fr;
            gap: 14px;
            max-width: 320px;
          }
          .mv-commission-row > *:first-child { max-width: 220px; margin: 0 auto; }
          .mv-eyebrow { font-size: 9px; letter-spacing: 0.35em; }
          .mv-crest { font-size: 9px; letter-spacing: 0.35em; }
          .mv-price-card { padding: 22px 18px 20px; }
          .mv-price-big .mv-num { font-size: 54px; }
          .mv-cta-inner { padding: 13px 28px; min-width: 200px; letter-spacing: 0.35em; font-size: 10px; }
          .mv-cta-lg .mv-cta-inner { padding: 14px 32px; min-width: 220px; }
          .mv-portfolio-title { font-size: 28px; }
          .mv-sticky { padding: 6px 12px; }
          .mv-sticky-inner {
            grid-template-columns: auto 1fr;
            grid-template-areas: "price toggle" "cta cta";
            gap: 8px 10px;
          }
          .mv-sticky-inner > :nth-child(1) { grid-area: price; justify-self: start; }
          .mv-sticky-inner > :nth-child(2) { grid-area: toggle; justify-self: end; }
          .mv-sticky-inner > :nth-child(3) { grid-area: cta; justify-self: stretch; }
          .mv-sticky-price { font-size: 28px; }
          .mv-toggle-compact { max-width: 170px; width: auto; }
          .mv-sticky .mv-cta { width: 100%; }
          .mv-sticky .mv-cta-inner { width: 100%; }
        }
      `}</style>

      <div className="mv-page">
        {/* Top ribbon */}
        <div className="mv-ribbon">
          Amalvera
          <span className="mv-ribbon-diamond">◊</span>
          Since 2020
          <span className="mv-ribbon-diamond">◊</span>
          Austin · TX
        </div>

        {/* Header */}
        <header className="mv-header">
          <div>
            <div className="mv-wordmark">Amalvera</div>
            <span className="mv-wordmark-sub">We Build Websites</span>
          </div>
          <a href="tel:+18302549274" className="mv-call" aria-label="Tap to call our 24/7 help line">
            <span className="mv-call-label">Tap to Call · 24/7 Help</span>
            <span className="mv-call-number">(830) 254-9274</span>
          </a>
        </header>

        {/* Hero */}
        <section className="mv-shell mv-hero">
          <div className="mv-eyebrow">
            <span className="mv-eyebrow-bar" />
            <span>◊ Step 1 ◊ Hello</span>
            <span className="mv-eyebrow-bar" />
          </div>
          <h1 className="mv-hero-title">
            A website that can help<br />
            <em>home service contractors</em> win more jobs.
          </h1>
          <p className="mv-hero-sub">
            We build websites for home service pros. You tell us about your
            business. We do the rest. Ready in 48 hours.
          </p>

          {/* Commission row: video + steps */}
          <div className="mv-commission-row">
            <div>
              <div className="mv-video-hint">Tap to Unmute</div>
              <div className="mv-frame">
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <wistia-player media-id="p4uzw25p63" aspect="0.5625" autoplay="true" muted="false"></wistia-player>
                </div>
              </div>
            </div>
            <div className="mv-steps">
              <div className="mv-step-eyebrow">◊ How It Works</div>
              {[
                { title: 'Sign Up', body: 'Pick monthly or yearly. Takes under a minute.' },
                { title: 'Tell Us About You', body: 'Share your job, your area, your style.' },
                { title: 'We Build It', body: 'Your website is ready in 48 hours.' },
              ].map((item, i) => (
                <div className="mv-step" key={i}>
                  <span className="mv-step-num">{roman[i]}.</span>
                  <div>
                    <div className="mv-step-title">{item.title}</div>
                    <div className="mv-step-body">{item.body}</div>
                  </div>
                </div>
              ))}
              <div className="mv-incl">
                <div className="mv-incl-label">◊ What You Get</div>
                <ul className="mv-incl-list">
                  <li className="mv-incl-item is-key">
                    <span className="mv-incl-dot" /> Full Account Access
                  </li>
                  <li className="mv-incl-item">
                    <span className="mv-incl-dot" /> SEO ready (so people find you on Google)
                  </li>
                  <li className="mv-incl-item">
                    <span className="mv-incl-dot" /> Multiple pages
                  </li>
                  <li className="mv-incl-item">
                    <span className="mv-incl-dot" /> Custom photos
                  </li>
                  <li className="mv-incl-item">
                    <span className="mv-incl-dot" /> Chat widget, lead form, and app
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </section>

        {/* Crest divider */}
        <div className="mv-shell">
          <div className="mv-crest">
            <span className="mv-crest-line" />
            <span>◊ Step 2 ◊ Our Work</span>
            <span className="mv-crest-line" />
          </div>
        </div>

        {/* Portfolio */}
        <section className="mv-shell mv-portfolio">
          <h2 className="mv-portfolio-title">
            Sample websites for <em>home service contractors</em>
          </h2>
          <div className="mv-portfolio-sub">A few of our favorites</div>
          <div className="mv-gallery-wrap">
          <div className="mv-gallery">
            {galleryItems.map((item, i) => (
              <div key={item.src} className="mv-gallery-card">
                <div className="mv-gallery-thumb">
                  <img
                    src={item.src}
                    alt={`${item.label} sample website`}
                    width={1200}
                    height={900}
                    loading={i === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    {...({ fetchpriority: i === 0 ? 'high' : 'low' } as any)}
                    onError={(e) => {
                      const img = e.currentTarget;
                      if (!img.dataset.fallback) {
                        img.dataset.fallback = '1';
                        img.src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 4 3"><rect width="4" height="3" fill="%23141210"/><rect x="0.4" y="1.1" width="3.2" height="0.15" fill="%23c9a96e" opacity="0.5"/><rect x="0.6" y="1.4" width="2.8" height="0.1" fill="%23c9a96e" opacity="0.3"/></svg>';
                      }
                    }}
                  />
                </div>
                <div className="mv-gallery-label">{item.label}</div>
              </div>
            ))}
          </div>
          </div>
        </section>

        {/* Crest closing */}
        <div className="mv-shell">
          <div className="mv-crest">
            <span className="mv-crest-line" />
            <span>◊ That's It ◊</span>
            <span className="mv-crest-line" />
          </div>
        </div>

        {/* Footer */}
        <footer className="mv-footer">
          <div className="mv-footer-inner">
            <span className="mv-footer-mark">Amalvera</span>
            <span className="mv-footer-meta">© 2026 · All rights reserved</span>
          </div>
        </footer>
      </div>

      {/* Sticky */}
      <div className="mv-sticky visible">
        <div className="mv-sticky-inner">
          <span className="mv-sticky-price">
            {pricingPlan === 'monthly' ? '$20' : '$99'}
            <span className="mv-sticky-per">/ {pricingPlan === 'monthly' ? 'mo' : 'yr'}</span>
          </span>
          <PricingToggle compact />
          <CtaButton large={false} />
        </div>
      </div>
    </>
  );
};

export default DirectoryPage;
