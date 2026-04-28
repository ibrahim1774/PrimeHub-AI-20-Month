import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const galleryItems = [
  { src: '/gallery/home-services.jpg', label: 'Home Services' },
  { src: '/gallery/landscaping.jpg', label: 'Landscaping' },
  { src: '/gallery/roofing.jpg', label: 'Roofing' },
  { src: '/gallery/cleaning.jpg', label: 'Cleaning' },
  { src: '/gallery/barbershop.jpg', label: 'Barbershop' },
];

const roman = ['I', 'II', 'III', 'IV', 'V'];

type Region = 'us' | 'aus' | 'ten' | 'five' | 'nineteen' | 'barber';

const REGIONS: Record<Region, {
  source: string;
  currency: string;
  currencySymbol: string;
  monthlyAmount: number;
  yearlyAmount: number;
  yearlyWas: number;
  ribbonEstYear: string;
  ribbonLocation: string;
  phoneHref: string;
  phoneLabel: string;
  phoneNumber: string;
  heroTaglineRegion: string;
  businessNoun: string;
  bookMoreNoun: string;
}> = {
  us: {
    source: 'directory',
    currency: 'USD',
    currencySymbol: '$',
    monthlyAmount: 20,
    yearlyAmount: 99,
    yearlyWas: 240,
    ribbonEstYear: 'Since 2026',
    ribbonLocation: 'Austin · TX',
    phoneHref: 'tel:+18302549274',
    phoneLabel: 'Tap to Call · 24/7 Help',
    phoneNumber: '(830) 254-9274',
    heroTaglineRegion: 'home service contractors',
    businessNoun: 'home service business',
    bookMoreNoun: 'jobs',
  },
  aus: {
    source: 'australia',
    currency: 'AUD',
    currencySymbol: '$',
    monthlyAmount: 20,
    yearlyAmount: 99,
    yearlyWas: 240,
    ribbonEstYear: 'Since 2026',
    ribbonLocation: 'Australia Wide',
    phoneHref: 'tel:+18302549274',
    phoneLabel: 'Tap to Call · 24/7 Help',
    phoneNumber: '(830) 254-9274',
    heroTaglineRegion: 'Australian home service contractors',
    businessNoun: 'home service business',
    bookMoreNoun: 'jobs',
  },
  ten: {
    source: 'ten',
    currency: 'USD',
    currencySymbol: '$',
    monthlyAmount: 10,
    yearlyAmount: 49,
    yearlyWas: 120,
    ribbonEstYear: 'Since 2026',
    ribbonLocation: 'Austin · TX',
    phoneHref: 'tel:+18302549274',
    phoneLabel: 'Tap to Call · 24/7 Help',
    phoneNumber: '(830) 254-9274',
    heroTaglineRegion: 'home service contractor',
    businessNoun: 'home service business',
    bookMoreNoun: 'jobs',
  },
  five: {
    source: 'five',
    currency: 'USD',
    currencySymbol: '$',
    monthlyAmount: 5,
    yearlyAmount: 49,
    yearlyWas: 60,
    ribbonEstYear: 'Since 2026',
    ribbonLocation: 'Austin · TX',
    phoneHref: 'tel:+18302549274',
    phoneLabel: 'Tap to Call · 24/7 Help',
    phoneNumber: '(830) 254-9274',
    heroTaglineRegion: 'home service contractors',
    businessNoun: 'home service business',
    bookMoreNoun: 'jobs',
  },
  nineteen: {
    source: 'nineteen',
    currency: 'USD',
    currencySymbol: '$',
    monthlyAmount: 19,
    yearlyAmount: 19,
    yearlyWas: 19,
    ribbonEstYear: 'Since 2026',
    ribbonLocation: 'Austin · TX',
    phoneHref: 'tel:+18302549274',
    phoneLabel: 'Tap to Call · 24/7 Help',
    phoneNumber: '(830) 254-9274',
    heroTaglineRegion: 'home service contractors',
    businessNoun: 'home service business',
    bookMoreNoun: 'jobs',
  },
  barber: {
    source: 'barber',
    currency: 'USD',
    currencySymbol: '$',
    monthlyAmount: 10,
    yearlyAmount: 49,
    yearlyWas: 120,
    ribbonEstYear: 'Since 2026',
    ribbonLocation: 'Austin · TX',
    phoneHref: 'tel:+18302549274',
    phoneLabel: 'Tap to Call · 24/7 Help',
    phoneNumber: '(830) 254-9274',
    heroTaglineRegion: 'barbers',
    businessNoun: 'barbershop',
    bookMoreNoun: 'clients',
  },
};

const DirectoryPage: React.FC<{ region?: Region }> = ({ region = 'us' }) => {
  const cfg = REGIONS[region];
  const [pricingPlan, setPricingPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [isLoading, setIsLoading] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const closeCheckout = () => {
    setModalOpen(false);
    setClientSecret(null);
  };

  useEffect(() => {
    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted) setIsLoading(false);
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  useEffect(() => {
    if (!modalOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') closeCheckout(); };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
    };
  }, [modalOpen]);

  const handleCheckout = async () => {
    setIsLoading(true);

    // Fire Meta Pixel InitiateCheckout event when user starts checkout
    if (typeof window !== 'undefined' && (window as any).fbq) {
      const value = pricingPlan === 'yearly' ? cfg.yearlyAmount : cfg.monthlyAmount;
      const eventID = `ic_${pricingPlan}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      (window as any).fbq('track', 'InitiateCheckout', {
        value,
        currency: cfg.currency,
        content_name: pricingPlan === 'yearly' ? 'Yearly Plan' : 'Monthly Plan',
        content_category: 'subscription',
      }, { eventID });
    }

    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: pricingPlan, source: cfg.source, embedded: true }),
      });
      const data = await res.json();
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setModalOpen(true);
      } else if (data.url) {
        // Fallback to hosted checkout if embedded unavailable
        window.location.href = data.url;
      }
    } catch (err) {
      console.error('Checkout error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const CtaButton = ({ large = true }: { large?: boolean }) => (
    <button className={`mv-cta ${large ? 'mv-cta-lg' : ''}`} onClick={handleCheckout} disabled={isLoading}>
      <span className="mv-cta-inner">
        {isLoading ? 'Loading…' : (region === 'ten' || region === 'five' || region === 'barber') ? 'Get Access to Your Website System' : 'Get Started'}
        {!isLoading && <span aria-hidden="true" style={{ marginLeft: 10, letterSpacing: 0 }}>▸</span>}
      </span>
    </button>
  );

  const barberGallery: Array<
    | { kind: 'video'; mediaId: string; aspect: string; label: string }
    | { kind: 'image'; src: string; label: string }
  > = [
    { kind: 'video', mediaId: 'dp2jzg06lf', aspect: '0.509915014164306', label: 'Sample Site' },
    { kind: 'video', mediaId: 'va1232reyg', aspect: '0.5373134328358209', label: 'Sample Site' },
    { kind: 'image', src: '/gallery/barbershop.jpg', label: 'Barbershop' },
    { kind: 'image', src: '/gallery/barber-1.jpg', label: 'Barbershop' },
    { kind: 'image', src: '/gallery/barber-2.jpg', label: 'Barbershop' },
  ];

  const PortfolioSection = () => {
    const isBarber = region === 'barber';
    if (isBarber) {
      const videos = barberGallery.filter((x): x is Extract<typeof barberGallery[number], { kind: 'video' }> => x.kind === 'video');
      const images = barberGallery.filter((x): x is Extract<typeof barberGallery[number], { kind: 'image' }> => x.kind === 'image');
      return (
        <section className="mv-shell mv-portfolio mv-portfolio-barber">
          <h2 className="mv-portfolio-title mv-portfolio-title-barber">
            Websites for <em>Barbers</em>
          </h2>
          <div className="mv-barber-row">
            {videos.map((item, i) => (
              <div key={`v-${i}`} className="mv-gallery-card mv-barber-col mv-barber-col-video">
                <div className="mv-gallery-thumb mv-gallery-thumb-portrait">
                  <wistia-player
                    media-id={item.mediaId}
                    aspect={item.aspect}
                    autoplay="true"
                    muted="true"
                    {...({
                      loop: 'true',
                      'playbar': 'false',
                      'play-button': 'false',
                      'small-play-button': 'false',
                      'fullscreen-button': 'false',
                      'volume-control': 'false',
                      'settings-control': 'false',
                      'playback-rate-control': 'false',
                      'controls-visible-on-load': 'false',
                      'big-play-button': 'false',
                      'silent-auto-play': 'true',
                      'end-video-behavior': 'loop',
                      'resumable': 'false',
                      'player-color': 'c9a96e',
                    } as any)}
                  ></wistia-player>
                </div>
              </div>
            ))}
            <div className="mv-barber-col mv-barber-col-images">
              {images.map((item, i) => (
                <div key={`i-${i}`} className="mv-barber-img-card">
                  <img
                    src={item.src}
                    alt={`${item.label} sample website`}
                    width={1200}
                    height={900}
                    loading="lazy"
                    decoding="async"
                    {...({ fetchpriority: 'low' } as any)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      );
    }
    return (
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
    );
  };

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
        Yearly <span className="mv-save">{(region === 'ten' || region === 'five' || region === 'barber') ? '40% Off' : 'Save 44%'}</span>
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

        /* Centered video + horizontal How It Works + horizontal What You Get */
        .mv-hero-video {
          max-width: 220px;
          margin: 14px auto 22px;
        }
        .mv-how {
          max-width: 720px;
          margin: 0 auto 18px;
          text-align: center;
        }
        .mv-how-eyebrow {
          font-size: 10px; letter-spacing: 0.45em; text-transform: uppercase;
          color: #c9a96e; font-weight: 500;
          margin-bottom: 14px;
        }
        .mv-how-row {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        .mv-how-card {
          position: relative;
          padding: 14px 12px 12px;
          border: 1px solid rgba(201,169,110,0.25);
          background: rgba(201,169,110,0.03);
          text-align: left;
        }
        .mv-how-num {
          display: block;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic; font-weight: 300;
          font-size: 26px; color: #c9a96e; line-height: 1;
          margin-bottom: 6px;
        }
        .mv-how-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px; color: #e8dcc4;
          font-weight: 400; line-height: 1.2;
          margin-bottom: 3px;
        }
        .mv-how-body {
          font-size: 11px; color: #8a8072; line-height: 1.5;
          font-family: 'Inter', sans-serif;
        }
        .mv-incl-row {
          max-width: 720px; margin: 0 auto;
          text-align: center;
          border-top: 1px solid rgba(201,169,110,0.18);
          padding: 14px 0 4px;
        }
        .mv-incl-list-row {
          display: flex; flex-wrap: wrap;
          justify-content: center;
          gap: 6px 18px;
          list-style: none; padding: 0; margin: 0;
        }
        .mv-incl-list-row .mv-incl-item {
          padding: 2px 0;
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
          font-size: 14px; color: #c8bca2;
          letter-spacing: 0.04em;
          font-family: 'Inter', sans-serif;
          font-weight: 700;
        }
        .mv-incl-item.is-key {
          color: #e8dcc4; font-weight: 800;
        }
        .mv-incl-item.is-key .mv-incl-dot { background: #d4af37; }
        .mv-incl-dot {
          width: 5px; height: 5px;
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

        /* /10 How It Works — 2 steps instead of 3 */
        .mv-how-row-two { grid-template-columns: repeat(2, 1fr) !important; max-width: 560px; margin: 0 auto; }

        /* /10 hero title — match portfolio title size */
        .mv-hero-title-ten {
          font-size: 22px !important;
          font-style: italic;
          line-height: 1.2 !important;
          max-width: 620px !important;
          margin: 0 auto 14px !important;
        }

        /* /10 video sections (Templates + Edit) */
        .mv-ten-video { padding: 6px 0 22px; text-align: center; }
        .mv-ten-video-hero { padding: 4px 0 14px; }
        .mv-ten-video-eyebrow {
          font-size: 10px; letter-spacing: 0.45em; text-transform: uppercase;
          color: #c9a96e; font-weight: 500;
          margin-bottom: 10px;
        }
        .mv-ten-video-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-style: italic;
          font-size: 24px;
          color: #e8dcc4;
          line-height: 1.2;
          margin: 0 auto 14px;
          max-width: 640px;
        }
        .mv-ten-video-title em { color: #c9a96e; font-style: italic; }
        .mv-ten-video-frame {
          max-width: 640px;
          margin: 0 auto;
          padding: 8px;
          position: relative;
        }
        .mv-ten-video-frame::before,
        .mv-ten-video-frame::after {
          content: '';
          position: absolute;
          pointer-events: none;
        }
        .mv-ten-video-frame::before {
          inset: 0;
          border: 1px solid rgba(201,169,110,0.45);
        }
        .mv-ten-video-frame::after {
          inset: 4px;
          border: 1px solid rgba(201,169,110,0.2);
        }
        .mv-ten-video-player {
          position: relative;
          z-index: 1;
          overflow: hidden;
          background: #0f0e0c;
          box-shadow: inset 0 0 50px rgba(0,0,0,0.5);
        }
        .mv-ten-video-player wistia-player {
          display: block;
          width: 100%;
          filter: saturate(95%) contrast(97%);
        }
        .mv-ten-video-player::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 60%, rgba(10,10,10,0.4) 100%);
          pointer-events: none;
          z-index: 3;
        }

        /* Walkthrough */
        .mv-walkthrough { padding: 4px 0 22px; text-align: center; }
        .mv-walkthrough-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-style: italic;
          font-size: 24px;
          color: #e8dcc4;
          line-height: 1.2;
          margin: 0 0 4px;
        }
        .mv-walkthrough-title em { color: #c9a96e; font-style: italic; }
        .mv-walkthrough-sub {
          font-family: 'JetBrains Mono', monospace;
          font-size: 8px; letter-spacing: 0.35em; text-transform: uppercase;
          color: #8a8072;
          margin-bottom: 14px;
        }
        .mv-walkthrough-frame {
          max-width: 760px;
          margin: 0 auto;
          padding: 9px;
          position: relative;
        }
        .mv-walkthrough-frame::before,
        .mv-walkthrough-frame::after {
          content: '';
          position: absolute;
          pointer-events: none;
        }
        .mv-walkthrough-frame::before {
          inset: 0;
          border: 1px solid rgba(201,169,110,0.45);
        }
        .mv-walkthrough-frame::after {
          inset: 5px;
          border: 1px solid rgba(201,169,110,0.2);
        }
        .mv-walkthrough-player {
          position: relative;
          z-index: 1;
          overflow: hidden;
          background: #0f0e0c;
          box-shadow: inset 0 0 60px rgba(0,0,0,0.55);
        }
        .mv-walkthrough-player wistia-player {
          display: block;
          width: 100%;
          filter: saturate(95%) contrast(97%);
        }
        /* Hide any Wistia branding that slips through */
        .mv-walkthrough-player [class*="w-bottom-bar"],
        .mv-walkthrough-player [class*="w-big-play-button"],
        .mv-walkthrough-player [class*="w-vulcan"],
        .mv-walkthrough-player [class*="w-branding"] {
          display: none !important;
          opacity: 0 !important;
          pointer-events: none !important;
        }
        /* Soft vignette to blend video edges into page */
        .mv-walkthrough-player::after {
          content: '';
          position: absolute;
          inset: 0;
          background: radial-gradient(ellipse at center, transparent 55%, rgba(10,10,10,0.45) 100%);
          pointer-events: none;
          z-index: 3;
        }

        /* FAQ */
        .mv-faq { padding: 22px 0 26px; }
        .mv-faq-title {
          text-align: center;
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-style: italic;
          font-size: 32px;
          color: #e8dcc4;
          line-height: 1.15;
          margin: 0 0 18px;
        }
        .mv-faq-title em { color: #c9a96e; font-style: italic; }
        .mv-faq-list {
          max-width: 720px;
          margin: 0 auto;
          border-top: 1px solid rgba(201,169,110,0.18);
        }
        .mv-faq-item {
          border-bottom: 1px solid rgba(201,169,110,0.18);
        }
        .mv-faq-item summary { list-style: none; }
        .mv-faq-item summary::-webkit-details-marker { display: none; }
        .mv-faq-q {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          padding: 14px 6px;
          cursor: pointer;
          font-family: 'Cormorant Garamond', serif;
          font-size: 19px;
          font-weight: 400;
          color: #e8dcc4;
          transition: color 0.2s ease;
        }
        .mv-faq-q:hover { color: #d4af37; }
        .mv-faq-icon {
          color: #c9a96e;
          font-size: 14px;
          line-height: 1;
          transition: transform 0.35s ease;
          flex-shrink: 0;
        }
        .mv-faq-item[open] .mv-faq-icon {
          transform: rotate(45deg);
          color: #d4af37;
        }
        .mv-faq-a {
          padding: 0 6px 16px;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          line-height: 1.65;
          color: #c8bca2;
          max-width: 640px;
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
        .mv-gallery-card-video { width: 280px; }
        .mv-gallery-thumb-portrait { aspect-ratio: 9/16; }
        .mv-gallery-thumb-portrait wistia-player {
          display: block; width: 100%; height: 100%;
        }
        /* /barber compact gallery — 3 equal columns: video, video, image-stack */
        .mv-portfolio-barber { padding: 10px 0 14px; }
        .mv-portfolio-title-barber { font-size: 22px; margin: 0 0 10px; }
        .mv-barber-row {
          display: flex; justify-content: center; align-items: stretch;
          gap: 10px;
          max-width: 640px;
          margin: 0 auto;
          padding: 0 12px;
        }
        .mv-barber-col {
          flex: 1 1 0;
          min-width: 0;
          padding: 6px;
        }
        .mv-barber-col-video { aspect-ratio: 9/16; }
        .mv-barber-col-video .mv-gallery-thumb-portrait {
          width: 100%; height: 100%;
        }
        .mv-barber-col-images {
          display: flex; flex-direction: column;
          gap: 6px;
          aspect-ratio: 9/16;
        }
        .mv-barber-img-card {
          flex: 1 1 0;
          min-height: 0;
          overflow: hidden;
          background: #0f0e0c;
          position: relative;
          border: 1px solid rgba(201,169,110,0.45);
        }
        .mv-barber-img-card::after {
          content: '';
          position: absolute; inset: 3px;
          border: 1px solid rgba(201,169,110,0.2);
          pointer-events: none;
        }
        .mv-barber-img-card img {
          width: 100%; height: 100%;
          object-fit: cover; object-position: center top;
          display: block;
          filter: sepia(10%) saturate(92%) contrast(96%);
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

        /* Embedded checkout modal */
        @keyframes mvFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes mvScrollBob {
          0%, 100% { transform: translate(-50%, 0); opacity: 0.85; }
          50% { transform: translate(-50%, 6px); opacity: 1; }
        }
        .mv-checkout-backdrop {
          position: fixed; inset: 0;
          background: rgba(10,10,10,0.82);
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
          z-index: 9999;
          display: flex; align-items: center; justify-content: center;
          padding: 20px;
          animation: mvFadeIn 0.2s ease;
        }
        .mv-checkout-modal {
          position: relative;
          width: 100%;
          max-width: 440px;
          max-height: calc(100vh - 40px);
          background: #141210;
          border: 1px solid rgba(201,169,110,0.45);
          box-shadow: 0 20px 60px rgba(0,0,0,0.6), 0 0 0 5px rgba(201,169,110,0.08);
          padding: 8px;
          overflow: hidden;
          display: flex; flex-direction: column;
        }
        .mv-checkout-modal::after {
          content: '';
          position: absolute; inset: 4px;
          border: 1px solid rgba(201,169,110,0.18);
          pointer-events: none;
        }
        .mv-checkout-close {
          position: absolute; top: 8px; right: 8px;
          width: 28px; height: 28px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(201,169,110,0.25);
          color: #c9a96e;
          font-size: 13px;
          cursor: pointer; z-index: 3;
          transition: border-color 0.2s ease, color 0.2s ease;
        }
        .mv-checkout-close:hover { border-color: #c9a96e; color: #d4af37; }
        .mv-checkout-frame-inner {
          flex: 1; overflow-y: auto;
          position: relative;
        }
        /* Bottom fade + pulsing scroll chevron hint */
        .mv-checkout-modal::before {
          content: '';
          position: absolute;
          left: 8px; right: 8px; bottom: 8px;
          height: 56px;
          background: linear-gradient(180deg, rgba(20,18,16,0) 0%, rgba(20,18,16,0.9) 70%, #141210 100%);
          pointer-events: none;
          z-index: 2;
        }
        .mv-checkout-hint {
          position: absolute;
          left: 50%; bottom: 10px;
          transform: translateX(-50%);
          display: inline-flex; align-items: center; gap: 6px;
          padding: 4px 10px;
          background: rgba(10,10,10,0.85);
          border: 1px solid rgba(201,169,110,0.35);
          color: #c9a96e;
          font-family: 'Inter', sans-serif;
          font-size: 9px;
          font-weight: 700;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          pointer-events: none;
          z-index: 3;
          animation: mvScrollBob 1.6s ease-in-out infinite;
        }
        .mv-checkout-hint svg { width: 10px; height: 10px; }

        /* Sticky bar */
        .mv-sticky {
          position: fixed; bottom: 0; left: 0; right: 0;
          z-index: 100;
          background: #0a0a0a;
          border-top: 1px solid rgba(201,169,110,0.35);
          padding: 6px 16px 8px;
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
        .mv-sticky-notoggle .mv-sticky-inner {
          grid-template-columns: auto 1fr;
        }
        .mv-sticky-notoggle .mv-sticky-inner > :last-child { justify-self: end; }
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
        .mv-sticky-price .mv-sticky-trial {
          display: block;
          font-family: 'JetBrains Mono', monospace;
          font-size: 8px; color: #8a8072;
          letter-spacing: 0.18em; text-transform: uppercase;
          margin-top: 2px;
          font-style: normal;
          font-weight: 500;
          text-shadow: none;
        }
        @keyframes mvGuaranteeGlow {
          0%, 100% { text-shadow: 0 0 0 rgba(212,175,55,0); opacity: 0.85; }
          50% { text-shadow: 0 0 14px rgba(212,175,55,0.55); opacity: 1; }
        }
        .mv-guarantee {
          max-width: 1100px;
          margin: 6px auto 0;
          padding: 4px 12px;
          text-align: center;
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: #c9a96e;
          animation: mvGuaranteeGlow 2.6s ease-in-out infinite;
        }
        .mv-guarantee strong {
          color: #e8dcc4;
          font-weight: 900;
          letter-spacing: 0.14em;
        }
        .mv-sticky-price .mv-sticky-cur {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px; color: #c9a96e;
          letter-spacing: 0.28em; text-transform: uppercase;
          font-style: normal;
          font-weight: 600;
          margin-left: 6px;
          text-shadow: none;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .mv-hero-title { font-size: 26px; }
          .mv-walkthrough-title { font-size: 20px; }
          .mv-walkthrough-frame { padding: 7px; }
          .mv-ten-video-title { font-size: 18px; }
          .mv-ten-video-frame { padding: 6px; }
          .mv-ten-video-eyebrow { font-size: 9px; letter-spacing: 0.35em; }
          .mv-hero-sub { font-size: 14px; }
          .mv-how-row { gap: 12px; }
          .mv-how-card { padding: 12px 10px; }
          .mv-how-title { font-size: 15px; }
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
          .mv-hero-video { max-width: 200px; margin: 10px auto 16px; }
          .mv-how { margin-bottom: 14px; }
          .mv-how-eyebrow { margin-bottom: 10px; font-size: 9px; letter-spacing: 0.35em; }
          .mv-how-row { grid-template-columns: repeat(3, 1fr); gap: 6px; }
          .mv-how-card { padding: 8px 6px; }
          .mv-how-num { font-size: 18px; margin-bottom: 3px; }
          .mv-how-title { font-size: 12px; line-height: 1.2; }
          .mv-how-body { font-size: 9px; line-height: 1.35; }
          .mv-incl-list-row { flex-direction: row; flex-wrap: wrap; gap: 4px 12px; justify-content: center; }
          .mv-incl-row { padding: 10px 0 2px; }
          .mv-incl-label { font-size: 11px; letter-spacing: 0.35em; margin-bottom: 8px; font-weight: 800; color: #c9a96e; }
          .mv-incl-list-row .mv-incl-item { font-size: 13px; letter-spacing: 0.02em; }
          .mv-eyebrow { font-size: 9px; letter-spacing: 0.35em; }
          .mv-crest { font-size: 9px; letter-spacing: 0.35em; }
          .mv-price-card { padding: 22px 18px 20px; }
          .mv-price-big .mv-num { font-size: 54px; }
          .mv-cta-inner { padding: 13px 28px; min-width: 200px; letter-spacing: 0.35em; font-size: 10px; }
          .mv-cta-lg .mv-cta-inner { padding: 14px 32px; min-width: 220px; }
          .mv-portfolio-title { font-size: 28px; }
          .mv-faq-title { font-size: 24px; margin-bottom: 12px; }
          .mv-faq-q { font-size: 16px; padding: 12px 4px; }
          .mv-faq-a { font-size: 12px; padding: 0 4px 14px; }
          .mv-checkout-backdrop { padding: 10px; }
          .mv-checkout-modal { padding: 6px; max-height: calc(100vh - 20px); max-width: 360px; }
          .mv-checkout-hint { font-size: 8px; letter-spacing: 0.22em; padding: 3px 8px; }
          .mv-sticky { padding: 6px 12px 8px; }
          .mv-guarantee { font-size: 11px; font-weight: 800; letter-spacing: 0.14em; padding: 3px 10px; margin-top: 4px; }
          .mv-guarantee strong { letter-spacing: 0.1em; }
          .mv-sticky-price .mv-sticky-trial { font-size: 7px; letter-spacing: 0.14em; }
          .mv-sticky-inner {
            grid-template-columns: auto 1fr;
            grid-template-areas: "price toggle" "cta cta";
            gap: 8px 10px;
          }
          .mv-sticky-inner > :nth-child(1) { grid-area: price; justify-self: start; }
          .mv-sticky-inner > :nth-child(2) { grid-area: toggle; justify-self: end; }
          .mv-sticky-inner > :nth-child(3) { grid-area: cta; justify-self: stretch; }
          .mv-sticky-notoggle .mv-sticky-inner {
            grid-template-columns: 1fr;
            grid-template-areas: "price" "cta";
          }
          .mv-sticky-notoggle .mv-sticky-inner > :nth-child(1) { justify-self: center; }
          .mv-sticky-notoggle .mv-sticky-inner > :nth-child(2) { grid-area: cta; justify-self: stretch; }
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
          {cfg.ribbonEstYear}
          <span className="mv-ribbon-diamond">◊</span>
          {cfg.ribbonLocation}
        </div>

        {/* Header */}
        <header className="mv-header">
          <div>
            <div className="mv-wordmark">Amalvera</div>
            <span className="mv-wordmark-sub">We Build Websites</span>
          </div>
        </header>

        {/* Hero */}
        <section className="mv-shell mv-hero">
          <div className="mv-eyebrow">
            <span className="mv-eyebrow-bar" />
            <span>◊ Step 1 ◊ Hello</span>
            <span className="mv-eyebrow-bar" />
          </div>
          <h1 className={`mv-hero-title ${(region === 'ten' || region === 'five' || region === 'barber') ? 'mv-hero-title-ten' : ''}`}>
            {(region === 'ten' || region === 'five' || region === 'barber') ? (
              <>
                A custom website for {cfg.heroTaglineRegion} that can help you <em>book more {cfg.bookMoreNoun}</em>
              </>
            ) : region === 'nineteen' ? (
              <>
                <em>Custom website design</em> that helps home service contractors win more jobs.
              </>
            ) : (
              <>
                A website that can help<br />
                <em>{cfg.heroTaglineRegion}</em> win more jobs.
              </>
            )}
          </h1>
          {(region !== 'ten' && region !== 'five' && region !== 'barber') && (
            <p className="mv-hero-sub">
              We build websites for home service pros. You tell us about your business. We do the rest. Ready in 48 hours.
            </p>
          )}

          {/* Video — centered (hidden on /10) */}
          {(region !== 'ten' && region !== 'five' && region !== 'barber') && (
            <div className="mv-hero-video">
              <div className="mv-video-hint">Tap to Unmute</div>
              <div className="mv-frame">
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <wistia-player media-id="p4uzw25p63" aspect="0.5625" autoplay="true" muted="false"></wistia-player>
                </div>
              </div>
            </div>
          )}

          {/* Video A (Templates) — /10 and /5 only (not /barber) */}
          {(region === 'ten' || region === 'five') && (
            <div className="mv-ten-video mv-ten-video-hero">
              <div className="mv-ten-video-eyebrow">◊ Templates ◊</div>
              <h2 className="mv-ten-video-title">
                1000+ prebuilt templates — choose one that fits your <em>style</em>
              </h2>
              <div className="mv-ten-video-frame">
                <div className="mv-ten-video-player">
                  <wistia-player
                    media-id="7uh6rore8l"
                    aspect="1.8045112781954886"
                    autoplay="true"
                    muted="true"
                    {...({
                      loop: 'true',
                      'playbar': 'false',
                      'play-button': 'false',
                      'small-play-button': 'false',
                      'fullscreen-button': 'false',
                      'volume-control': 'false',
                      'settings-control': 'false',
                      'playback-rate-control': 'false',
                      'controls-visible-on-load': 'false',
                      'big-play-button': 'false',
                      'silent-auto-play': 'true',
                      'end-video-behavior': 'loop',
                      'resumable': 'false',
                      'player-color': 'c9a96e',
                    } as any)}
                  ></wistia-player>
                </div>
              </div>
            </div>
          )}

          {/* Showcase between hero title and How It Works on /10 */}
          {(region === 'ten' || region === 'five' || region === 'barber') && <PortfolioSection />}

          {/* How It Works — horizontal 3-up */}
          <div className="mv-how">
            <div className="mv-how-eyebrow">◊ How It Works ◊</div>
            <div className={`mv-how-row ${(region === 'ten' || region === 'five') ? 'mv-how-row-two' : ''}`}>
              {(region === 'barber'
                ? [
                    { title: 'Sign Up', body: 'Sign up for the hosting plan — the custom design is on us.' },
                    { title: 'Tell Us About Your Shop', body: 'Share a bit about your barbershop, your style, and any photos you want featured.' },
                    { title: 'We Deliver', body: 'Your site is ready in about 48 hours.' },
                  ]
                : (region === 'ten' || region === 'five')
                ? [
                    { title: 'Sign Up', body: 'Takes under a minute.' },
                    { title: 'Get Access', body: 'Within 24 hours you get access to the website system for your custom business.' },
                  ]
                : [
                    { title: 'Sign Up', body: 'Pick monthly or yearly. Takes under a minute.' },
                    { title: 'Tell Us About You', body: 'Share your job, your area, your style.' },
                    { title: 'We Build It', body: 'Your website is ready in 48 hours.' },
                  ]
              ).map((item, i) => (
                <div className="mv-how-card" key={i}>
                  <span className="mv-how-num">{roman[i]}.</span>
                  <div className="mv-how-title">{item.title}</div>
                  <div className="mv-how-body">{item.body}</div>
                </div>
              ))}
            </div>
          </div>

          {/* What You Get — horizontal (hidden on /10) */}
          {(region !== 'ten' && region !== 'five' && region !== 'barber') && (
            <div className="mv-incl mv-incl-row">
              <div className="mv-incl-label">◊ What You Get</div>
              <ul className="mv-incl-list mv-incl-list-row">
                <li className="mv-incl-item is-key">
                  <span className="mv-incl-dot" /> Full Account Access
                </li>
                <li className="mv-incl-item">
                  <span className="mv-incl-dot" /> SEO ready
                </li>
                <li className="mv-incl-item">
                  <span className="mv-incl-dot" /> Custom photos
                </li>
                <li className="mv-incl-item">
                  <span className="mv-incl-dot" /> Chat widget & lead form
                </li>
              </ul>
            </div>
          )}

        </section>

        {/* Walkthrough — hidden on /10 */}
        {(region !== 'ten' && region !== 'five' && region !== 'barber') && (
          <>
            <div className="mv-shell">
              <div className="mv-crest">
                <span className="mv-crest-line" />
                <span>◊ Step 2 ◊ The Walkthrough</span>
                <span className="mv-crest-line" />
              </div>
            </div>

            <section className="mv-shell mv-walkthrough">
              <h2 className="mv-walkthrough-title">
                A quick tour of your <em>account</em>
              </h2>
              <div className="mv-walkthrough-sub">Everything you'll see after you sign up</div>
              <div className="mv-walkthrough-frame">
                <div className="mv-walkthrough-player">
                  <wistia-player
                    media-id="eq8u22i00x"
                    aspect="1.7391304347826086"
                    autoplay="true"
                    muted="true"
                    {...({
                      loop: 'true',
                      'playbar': 'false',
                      'play-button': 'false',
                      'small-play-button': 'false',
                      'fullscreen-button': 'false',
                      'volume-control': 'false',
                      'settings-control': 'false',
                      'playback-rate-control': 'false',
                      'controls-visible-on-load': 'false',
                      'big-play-button': 'false',
                      'silent-auto-play': 'true',
                      'end-video-behavior': 'loop',
                      'resumable': 'false',
                      'player-color': 'c9a96e',
                    } as any)}
                  ></wistia-player>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Crest + Portfolio — only on /1 and /aus (moved to top on /10) */}
        {(region !== 'ten' && region !== 'five' && region !== 'barber') && (
          <>
            <div className="mv-shell">
              <div className="mv-crest">
                <span className="mv-crest-line" />
                <span>◊ Step 3 ◊ Our Work</span>
                <span className="mv-crest-line" />
              </div>
            </div>
            <PortfolioSection />
          </>
        )}

        {/* Video B (Editing demo) — /10 and /5 only (not /barber) */}
        {(region === 'ten' || region === 'five') && (
          <>
            <div className="mv-shell">
              <div className="mv-crest">
                <span className="mv-crest-line" />
                <span>◊ Edit With Ease ◊</span>
                <span className="mv-crest-line" />
              </div>
            </div>
            <section className="mv-shell mv-ten-video">
              <h2 className="mv-ten-video-title">
                Edit — replace any image or text <em>super easy</em>, beginner-friendly
              </h2>
              <div className="mv-ten-video-frame">
                <div className="mv-ten-video-player">
                  <wistia-player
                    media-id="tigopelval"
                    aspect="1.8045112781954886"
                    autoplay="true"
                    muted="true"
                    {...({
                      loop: 'true',
                      'playbar': 'false',
                      'play-button': 'false',
                      'small-play-button': 'false',
                      'fullscreen-button': 'false',
                      'volume-control': 'false',
                      'settings-control': 'false',
                      'playback-rate-control': 'false',
                      'controls-visible-on-load': 'false',
                      'big-play-button': 'false',
                      'silent-auto-play': 'true',
                      'end-video-behavior': 'loop',
                      'resumable': 'false',
                      'player-color': 'c9a96e',
                    } as any)}
                  ></wistia-player>
                </div>
              </div>
            </section>
          </>
        )}

        {/* Crest — FAQ */}
        <div className="mv-shell">
          <div className="mv-crest">
            <span className="mv-crest-line" />
            <span>◊ Step 4 ◊ Questions</span>
            <span className="mv-crest-line" />
          </div>
        </div>

        {/* FAQ */}
        <section className="mv-shell mv-faq">
          <h2 className="mv-faq-title">
            Frequently <em>asked</em>
          </h2>
          <div className="mv-faq-list">
            {(region === 'barber' ? [
              {
                q: 'What do I get with the website?',
                a: `A custom, professional website built for your ${cfg.businessNoun}.`,
              },
              {
                q: 'What is the $10/month for?',
                a: `The $10/month covers website hosting so your site stays live online. We don't charge for the design. If you need any kind of edits on the website, just let us know and we can make the changes to your site.`,
              },
              {
                q: 'What support do I get?',
                a: 'You can contact us by email or SMS if you need help.',
              },
              {
                q: 'How long does it take to get access to the website?',
                a: 'You get access to the website in about 48 hours.',
              },
            ] : (region === 'ten' || region === 'five') ? [
              {
                q: 'What do I get with the website?',
                a: `A custom, professional website built for your ${cfg.businessNoun}.`,
              },
              {
                q: 'What is the $10/month for?',
                a: `The $10/month covers website hosting so your site stays live online. We don't charge for the design. You can edit the images and text — you get full login access to your website.`,
              },
              {
                q: 'What support do I get?',
                a: 'You can contact us anytime by email or phone if you need help.',
              },
              {
                q: 'How long does it take to get access to the website system?',
                a: 'You get access to the website system within 24 hours.',
              },
            ] : region === 'nineteen' ? [
              {
                q: 'What do I get with the website?',
                a: 'A modern, professional website with multiple pages, SEO, a lead form, a chat widget, and a system to help manage leads and customers.',
              },
              {
                q: 'What support do I get?',
                a: 'You can contact us anytime by email or phone if you need help.',
              },
              {
                q: 'How fast is the website delivered?',
                a: 'Your website is usually ready in about 48 hours.',
              },
            ] : [
              {
                q: 'What do I get with the website?',
                a: 'A modern, professional website with multiple pages, SEO, a lead form, a chat widget, and a system to help manage leads and customers.',
              },
              {
                q: `What is the ${cfg.currencySymbol}${cfg.monthlyAmount}/month for?`,
                a: `The ${cfg.currencySymbol}${cfg.monthlyAmount}/month covers website hosting so your site stays live online. We don't charge for the design. You can edit the images and text — you get full login access to your website.`,
              },
              {
                q: 'What support do I get?',
                a: 'You can contact us anytime by email or phone if you need help.',
              },
              {
                q: 'How fast is the website delivered?',
                a: 'Your website is usually ready in about 48 hours.',
              },
            ]).map((item, i) => (
              <details className="mv-faq-item" key={i} open={i === 0}>
                <summary className="mv-faq-q">
                  <span>{item.q}</span>
                  <span className="mv-faq-icon" aria-hidden="true">◊</span>
                </summary>
                <div className="mv-faq-a">{item.a}</div>
              </details>
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
            <span className="mv-footer-meta">© 2026 · All rights reserved</span>
          </div>
        </footer>
      </div>

      {/* Sticky */}
      <div className={`mv-sticky visible ${region === 'nineteen' ? 'mv-sticky-notoggle' : ''}`}>
        <div className="mv-sticky-inner">
          <span className="mv-sticky-price">
            {cfg.currencySymbol}{pricingPlan === 'monthly' ? cfg.monthlyAmount : cfg.yearlyAmount}
            {region === 'aus' && <span className="mv-sticky-cur"> AUD</span>}
            {region !== 'nineteen' && <span className="mv-sticky-per">{`/ ${pricingPlan === 'monthly' ? 'mo' : 'yr'}`}</span>}
          </span>
          {region !== 'nineteen' && <PricingToggle compact />}
          <CtaButton large={false} />
        </div>
        <div className="mv-guarantee">
          Backed by a <strong>14-day, 100% money-back guarantee</strong>
        </div>
      </div>

      {/* Embedded checkout modal */}
      {modalOpen && clientSecret && (
        <div className="mv-checkout-backdrop" onClick={closeCheckout} role="dialog" aria-modal="true">
          <div className="mv-checkout-modal" onClick={(e) => e.stopPropagation()}>
            <button className="mv-checkout-close" onClick={closeCheckout} aria-label="Close checkout">✕</button>
            <div className="mv-checkout-frame-inner">
              <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                <EmbeddedCheckout />
              </EmbeddedCheckoutProvider>
            </div>
            <div className="mv-checkout-hint" aria-hidden="true">
              Scroll
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"/></svg>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DirectoryPage;
