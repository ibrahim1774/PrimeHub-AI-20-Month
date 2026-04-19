import { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const galleryItems = [
  { src: '/gallery/home-services.png', label: 'Home Services' },
  { src: '/gallery/landscaping.png', label: 'Landscaping' },
  { src: '/gallery/roofing.png', label: 'Roofing' },
  { src: '/gallery/barbershop.png', label: 'Barbershop' },
];

const roman = ['I', 'II', 'III', 'IV', 'V'];

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
          color: #c9a96e; font-size: 10px; letter-spacing: 0.5em;
          text-transform: uppercase; font-weight: 500;
          margin-bottom: 22px;
        }
        .mv-eyebrow-bar {
          width: 32px; height: 1px; background: #c9a96e;
        }

        /* Hero */
        .mv-hero {
          text-align: center;
          padding: 56px 0 48px;
        }
        .mv-hero-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 66px;
          line-height: 1.08;
          color: #e8dcc4;
          max-width: 820px;
          margin: 0 auto 22px;
          letter-spacing: 0.005em;
        }
        .mv-hero-title em {
          color: #c9a96e;
          font-style: italic;
          font-weight: 300;
        }
        .mv-hero-sub {
          font-family: 'Cormorant Garamond', serif;
          font-size: 20px;
          line-height: 1.5;
          color: #c8bca2;
          font-weight: 300;
          font-style: italic;
          max-width: 620px;
          margin: 0 auto;
        }

        /* Crest divider */
        .mv-crest {
          display: flex; align-items: center; justify-content: center;
          gap: 14px;
          margin: 22px auto;
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
          grid-template-columns: 220px 1fr;
          gap: 42px;
          align-items: start;
          max-width: 720px;
          margin: 36px auto 0;
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
          margin: 40px auto 20px;
          padding: 28px 28px 24px;
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
          font-size: 9px; letter-spacing: 0.5em; text-transform: uppercase;
          color: #c9a96e; text-align: center; margin-bottom: 12px;
          font-weight: 500;
        }
        .mv-toggle {
          display: flex;
          border: 1px solid rgba(201,169,110,0.3);
          margin: 0 auto 22px;
          max-width: 320px;
          background: rgba(0,0,0,0.35);
        }
        .mv-toggle-compact { max-width: 280px; margin: 0; }
        .mv-toggle-tab {
          flex: 1; padding: 10px 14px;
          border: none; background: transparent;
          font-family: 'Inter', sans-serif;
          font-size: 10px; font-weight: 500;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: #8a8072;
          cursor: pointer;
          transition: all 0.25s ease;
          display: inline-flex; align-items: center; justify-content: center; gap: 8px;
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
          font-size: 68px; letter-spacing: 0.01em;
          color: #c9a96e;
        }
        .mv-price-big .mv-per {
          font-size: 14px; color: #8a8072;
          letter-spacing: 0.4em; text-transform: uppercase;
          margin-left: 10px;
          font-family: 'Inter', sans-serif;
          font-weight: 400;
        }
        .mv-price-was {
          text-align: center;
          margin-top: 6px;
          font-size: 10px; letter-spacing: 0.3em;
          color: #8a8072; text-transform: uppercase;
          font-family: 'JetBrains Mono', monospace;
        }
        .mv-price-was s { opacity: 0.6; }

        /* CTA */
        .mv-cta {
          display: inline-block;
          padding: 6px;
          border: 1px solid rgba(201,169,110,0.55);
          background: transparent;
          cursor: pointer;
          transition: border-color 0.25s ease, background 0.25s ease, transform 0.15s ease;
          color: inherit;
          font-family: inherit;
        }
        .mv-cta-inner {
          display: inline-flex; align-items: center; justify-content: center;
          padding: 14px 42px;
          border: 1px solid rgba(201,169,110,0.55);
          color: #c9a96e;
          font-size: 11px;
          font-weight: 500;
          letter-spacing: 0.5em;
          text-transform: uppercase;
          font-family: 'Inter', sans-serif;
          min-width: 240px;
        }
        .mv-cta-lg .mv-cta-inner { padding: 16px 54px; min-width: 300px; }
        .mv-cta:hover {
          border-color: #c9a96e;
          background: rgba(201,169,110,0.06);
        }
        .mv-cta:hover .mv-cta-inner {
          border-color: #d4af37;
          color: #d4af37;
        }
        .mv-cta:active { transform: translateY(1px); }
        .mv-cta:disabled {
          opacity: 0.5; cursor: not-allowed; transform: none;
        }
        .mv-cta-wrap {
          text-align: center;
          margin-top: 10px;
        }

        /* Payment icons */
        .mv-pay {
          display: flex; align-items: center; justify-content: center;
          gap: 10px;
          margin-top: 22px;
          flex-wrap: wrap;
        }
        .mv-pay-label {
          font-size: 8px; letter-spacing: 0.4em; text-transform: uppercase;
          color: #8a8072; font-family: 'JetBrains Mono', monospace;
        }
        .mv-pay img {
          height: 22px; width: auto;
          opacity: 0.8; filter: grayscale(20%);
          transition: opacity 0.2s ease, filter 0.2s ease;
        }
        .mv-pay img:hover { opacity: 1; filter: none; }
        .mv-pay-dark {
          background: #000;
          padding: 3px 6px;
        }

        .mv-trust {
          margin-top: 18px;
          font-size: 9px; letter-spacing: 0.4em;
          text-transform: uppercase; color: #8a8072;
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
        }

        /* Portfolio */
        .mv-portfolio { padding: 32px 0 36px; }
        .mv-portfolio-title {
          text-align: center;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-style: italic;
          font-size: 30px;
          color: #e8dcc4;
          line-height: 1.15;
          margin: 0 0 6px;
        }
        .mv-portfolio-title em {
          color: #c9a96e; font-style: italic;
        }
        .mv-portfolio-sub {
          text-align: center;
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; letter-spacing: 0.4em; text-transform: uppercase;
          color: #8a8072;
          margin-bottom: 20px;
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
          padding: 12px 22px;
          transform: translateY(110%);
          transition: transform 0.35s ease;
        }
        .mv-sticky.visible { transform: translateY(0); }
        .mv-sticky-inner {
          max-width: 1100px; margin: 0 auto;
          display: flex; align-items: center; justify-content: space-between;
          gap: 14px;
        }
        .mv-sticky-left {
          display: flex; align-items: center; gap: 18px;
          flex-wrap: wrap;
        }
        .mv-sticky-price {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          color: #c9a96e;
          font-size: 22px;
          line-height: 1;
          white-space: nowrap;
        }
        .mv-sticky-price .mv-sticky-per {
          font-family: 'JetBrains Mono', monospace;
          font-size: 9px; color: #8a8072;
          letter-spacing: 0.3em; text-transform: uppercase;
          font-style: normal;
          margin-left: 8px;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .mv-hero-title { font-size: 46px; }
          .mv-hero-sub { font-size: 16px; }
          .mv-commission-row {
            grid-template-columns: 1fr;
            gap: 28px;
            max-width: 360px;
          }
          .mv-portfolio-title { font-size: 32px; }
          .mv-carousel-arrow { width: 34px; height: 34px; }
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
          .mv-hero { padding: 32px 0 28px; }
          .mv-hero-title { font-size: 36px; }
          .mv-hero-sub { font-size: 14px; }
          .mv-eyebrow { font-size: 9px; letter-spacing: 0.35em; }
          .mv-crest { font-size: 9px; letter-spacing: 0.35em; }
          .mv-price-card { padding: 22px 18px 20px; }
          .mv-price-big .mv-num { font-size: 54px; }
          .mv-cta-inner { padding: 13px 28px; min-width: 200px; letter-spacing: 0.35em; font-size: 10px; }
          .mv-cta-lg .mv-cta-inner { padding: 14px 32px; min-width: 220px; }
          .mv-portfolio-title { font-size: 28px; }
          .mv-sticky { padding: 10px 14px; }
          .mv-sticky-inner { flex-direction: column; align-items: stretch; gap: 10px; }
          .mv-sticky-left { justify-content: center; }
          .mv-toggle-compact { max-width: none; width: 100%; }
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
        <section ref={heroRef} className="mv-shell mv-hero">
          <div className="mv-eyebrow">
            <span className="mv-eyebrow-bar" />
            <span>◊ Step 1 ◊ Hello</span>
            <span className="mv-eyebrow-bar" />
          </div>
          <h1 className="mv-hero-title">
            A website that helps you <em>win</em><br />
            more jobs.
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

          {/* Price card */}
          <div className="mv-price-card">
            <div className="mv-price-eyebrow">◊ The Price ◊</div>
            <PricingToggle />
            <div className="mv-price-big">
              <span className="mv-num">{pricingPlan === 'monthly' ? '$20' : '$99'}</span>
              <span className="mv-per">per {pricingPlan === 'monthly' ? 'month' : 'year'}</span>
            </div>
            {pricingPlan === 'yearly' && (
              <div className="mv-price-was"><s>$240 / yr</s> &nbsp; Save 44%</div>
            )}
            <div className="mv-cta-wrap">
              <CtaButton />
            </div>

            <div className="mv-pay">
              <span className="mv-pay-label">Secure Payment</span>
              {[
                { src: 'https://cdn.jsdelivr.net/npm/payment-icons@1.0.0/min/flat/visa.svg', alt: 'Visa' },
                { src: 'https://cdn.jsdelivr.net/npm/payment-icons@1.0.0/min/flat/mastercard.svg', alt: 'Mastercard' },
                { src: 'https://cdn.jsdelivr.net/npm/payment-icons@1.0.0/min/flat/amex.svg', alt: 'Amex' },
                { src: 'https://cdn.jsdelivr.net/npm/payment-icons@1.0.0/min/flat/discover.svg', alt: 'Discover' },
                { src: 'https://cdn.simpleicons.org/applepay/white', alt: 'Apple Pay', dark: true },
              ].map((icon: any) => (
                <img
                  key={icon.alt}
                  src={icon.src}
                  alt={icon.alt}
                  className={icon.dark ? 'mv-pay-dark' : ''}
                />
              ))}
            </div>
          </div>

          <div className="mv-trust">No contracts &nbsp; ◊ &nbsp; Cancel anytime &nbsp; ◊ &nbsp; 24/7 Help</div>
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
          <div className="mv-carousel">
            <button
              className="mv-carousel-arrow"
              style={{ left: -20 }}
              onClick={() => setCarouselIndex((carouselIndex - 1 + galleryItems.length) % galleryItems.length)}
              aria-label="Previous piece"
            >
              <ChevronLeft size={18} />
            </button>
            <div className="mv-carousel-frame">
              <img src={galleryItems[carouselIndex].src} alt={`${galleryItems[carouselIndex].label} commission`} />
            </div>
            <button
              className="mv-carousel-arrow"
              style={{ right: -20 }}
              onClick={() => setCarouselIndex((carouselIndex + 1) % galleryItems.length)}
              aria-label="Next piece"
            >
              <ChevronRight size={18} />
            </button>
          </div>
          <div className="mv-carousel-caption">
            <div className="mv-carousel-no">Site {carouselIndex + 1} of {galleryItems.length}</div>
            <div className="mv-carousel-label">{galleryItems[carouselIndex].label}</div>
          </div>
          <div className="mv-carousel-dots">
            {galleryItems.map((_, i) => (
              <button
                key={i}
                className={`mv-carousel-dot ${i === carouselIndex ? 'active' : ''}`}
                onClick={() => setCarouselIndex(i)}
                aria-label={`Go to piece ${i + 1}`}
              />
            ))}
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
            <span className="mv-footer-meta">© 2024 · All rights reserved</span>
            <div className="mv-footer-links">
              <a href="#" className="mv-footer-link">Privacy</a>
              <a href="#" className="mv-footer-link">Help</a>
            </div>
          </div>
        </footer>
      </div>

      {/* Sticky */}
      <div className={`mv-sticky ${showSticky ? 'visible' : ''}`}>
        <div className="mv-sticky-inner">
          <div className="mv-sticky-left">
            <PricingToggle compact />
            <span className="mv-sticky-price">
              {pricingPlan === 'monthly' ? '$20' : '$99'}
              <span className="mv-sticky-per">/ {pricingPlan === 'monthly' ? 'mo' : 'yr'}</span>
            </span>
          </div>
          <CtaButton large={false} />
        </div>
      </div>
    </>
  );
};

export default DirectoryPage;
