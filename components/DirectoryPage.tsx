import React, { useState, useEffect } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';
import PayPalSubscribeModal, { type PayPalCtx } from './PayPalSubscribeModal';
import PaymentBadgeRow, { TierPaymentBadge } from './PaymentBadgeRow';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const galleryItems = [
  { src: '/gallery/home-services.jpg', label: 'Home Services' },
  { src: '/gallery/landscaping.jpg', label: 'Landscaping' },
  { src: '/gallery/roofing.jpg', label: 'Roofing' },
  { src: '/gallery/cleaning.jpg', label: 'Cleaning' },
  { src: '/gallery/barbershop.jpg', label: 'Barbershop' },
];

const roman = ['I', 'II', 'III', 'IV', 'V'];

type Region = 'us' | 'aus' | 'ten' | 'five' | 'nineteen' | 'barber' | 'localbusiness' | 'freewebsite' | 'freewebsite49' | 'home' | 'barberleads' | 'barberFive';

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
  localbusiness: {
    source: 'localbusiness',
    currency: 'USD',
    currencySymbol: '$',
    monthlyAmount: 20,
    yearlyAmount: 135,
    yearlyWas: 240,
    ribbonEstYear: 'Since 2026',
    ribbonLocation: 'Austin · TX',
    phoneHref: 'tel:+18302549274',
    phoneLabel: 'Tap to Call · 24/7 Help',
    phoneNumber: '(830) 254-9274',
    heroTaglineRegion: 'local businesses',
    businessNoun: 'local business',
    bookMoreNoun: 'clients',
  },
  freewebsite: {
    source: 'freewebsite',
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
  freewebsite49: {
    source: 'freewebsite49',
    currency: 'USD',
    currencySymbol: '$',
    monthlyAmount: 49,
    yearlyAmount: 99,
    yearlyWas: 588,
    ribbonEstYear: 'Since 2026',
    ribbonLocation: 'Austin · TX',
    phoneHref: 'tel:+18302549274',
    phoneLabel: 'Tap to Call · 24/7 Help',
    phoneNumber: '(830) 254-9274',
    heroTaglineRegion: 'home service contractors',
    businessNoun: 'home service business',
    bookMoreNoun: 'jobs',
  },
  home: {
    source: 'home',
    currency: 'USD',
    currencySymbol: '$',
    monthlyAmount: 10,
    yearlyAmount: 99,
    yearlyWas: 120,
    ribbonEstYear: 'Since 2026',
    ribbonLocation: 'Austin · TX',
    phoneHref: 'tel:+18302549274',
    phoneLabel: 'Tap to Call · 24/7 Help',
    phoneNumber: '(830) 254-9274',
    heroTaglineRegion: 'your business',
    businessNoun: 'business',
    bookMoreNoun: 'clients',
  },
  barberleads: {
    source: 'barberleads',
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
    heroTaglineRegion: 'barbers',
    businessNoun: 'barbershop',
    bookMoreNoun: 'clients',
  },
  barberFive: {
    source: 'barberFive',
    currency: 'USD',
    currencySymbol: '$',
    monthlyAmount: 10,
    yearlyAmount: 72,
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
  const [paypalOpen, setPaypalOpen] = useState(false);
  const [paypalCtx, setPaypalCtx] = useState<PayPalCtx | null>(null);
  const [showFiveSticky, setShowFiveSticky] = useState(false);

  // Reveal the /5 + /barber-5 sticky CTA only after the hero is scrolled past.
  useEffect(() => {
    if (region !== 'five' && region !== 'barberFive') return;
    const heroEl = document.querySelector('.mv-f-hero');
    if (!heroEl) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShowFiveSticky(!entry.isIntersecting),
      { threshold: 0, rootMargin: '0px 0px -40% 0px' }
    );
    obs.observe(heroEl);
    return () => obs.disconnect();
  }, [region]);

  const openPaypal = (ctx: PayPalCtx) => {
    if (typeof window !== 'undefined' && (window as any).fbq) {
      const value = Number(ctx.priceText.replace(/[^0-9.]/g, ''));
      (window as any).fbq('track', 'InitiateCheckout', {
        value,
        currency: ctx.region === 'aus' ? 'AUD' : 'USD',
        content_name: ctx.label,
        content_category: 'subscription',
      }, { eventID: `ic_paypal_${ctx.region}_${ctx.tier || 'na'}_${ctx.plan}_${Date.now()}` });
    }
    setPaypalCtx(ctx);
    setPaypalOpen(true);
  };
  const [activeHomeTier, setActiveHomeTier] = useState<'single' | 'multi'>('multi');

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

  const fallbackToHosted = async () => {
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: pricingPlan, source: cfg.source, embedded: false, ...((region === 'home' || region === 'five') ? { tier: activeHomeTier } : {}) }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        console.error('Fallback hosted URL missing:', data);
        setIsLoading(false);
        setModalOpen(false);
        setClientSecret(null);
      }
    } catch (err) {
      console.error('Hosted fallback fetch failed:', err);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!modalOpen || !clientSecret) return;
    const STRIPE_IFRAME_SELECTOR =
      'iframe[name^="embedded-checkout"], iframe[src*="checkout.stripe.com"], iframe[src*="js.stripe.com"]';
    const timer = window.setTimeout(() => {
      const stripeIframe = document.querySelector(STRIPE_IFRAME_SELECTOR) as HTMLIFrameElement | null;
      const failed = !stripeIframe || stripeIframe.getBoundingClientRect().height < 40;
      if (failed) {
        console.warn('Embedded Stripe checkout did not render in 8s; falling back to hosted checkout');
        fallbackToHosted();
      }
    }, 8000);
    return () => window.clearTimeout(timer);
  }, [modalOpen, clientSecret]);

  useEffect(() => {
    if ((region !== 'freewebsite' && region !== 'freewebsite49' && region !== 'barberleads')) return;
    const SRC = 'https://link.msgsndr.com/js/form_embed.js';
    if (document.querySelector(`script[src="${SRC}"]`)) return;
    const s = document.createElement('script');
    s.src = SRC;
    s.async = true;
    document.body.appendChild(s);
  }, [region]);

  // Fire Meta Pixel "Lead" event when the LeadConnector iframe form is submitted
  useEffect(() => {
    if (region !== 'freewebsite' && region !== 'freewebsite49' && region !== 'barberleads') return;
    let fired = false;
    const onMessage = (event: MessageEvent) => {
      if (fired) return;
      const origin = event.origin || '';
      const fromGHL =
        origin.includes('msgsndr.com') ||
        origin.includes('leadconnectorhq.com') ||
        origin.includes('gohighlevel.com');
      if (!fromGHL) return;
      const data = event.data;
      const dataStr = typeof data === 'string' ? data : (() => {
        try { return JSON.stringify(data); } catch { return ''; }
      })();
      const looksLikeSubmit = /form[_-]?submit|formSubmissionId|formSubmitted|lead[_-]?captur/i.test(dataStr || '');
      if (!looksLikeSubmit) return;
      fired = true;
      if (typeof window !== 'undefined' && (window as any).fbq) {
        const eventID = `lead_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
        (window as any).fbq('track', 'Lead', {
          content_name: region === 'freewebsite49' ? 'FreeWebsite49 Form' : 'FreeWebsite Form',
          content_category: 'lead_capture',
          value: cfg.monthlyAmount,
          currency: cfg.currency,
        }, { eventID });
        console.log('[Pixel] Lead fired for', region, 'eventID:', eventID);
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, [region, cfg.monthlyAmount, cfg.currency]);

  useEffect(() => {
    if (region !== 'home' && region !== 'five' && region !== 'barberFive') return;
    const elements = document.querySelectorAll('.mv-anim-fade, .mv-h-anim');
    if (!elements.length) return;
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          (entry.target as HTMLElement).classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    elements.forEach((el, i) => {
      (el as HTMLElement).style.transitionDelay = `${(i % 4) * 60}ms`;
      observer.observe(el);
    });
    return () => observer.disconnect();
  }, [region]);

  const handleCheckout = async (tierOverride?: 'single' | 'multi', planOverride?: 'monthly' | 'yearly') => {
    setIsLoading(true);

    const usesTier = region === 'home' || region === 'five';
    const effectiveTier: 'single' | 'multi' = tierOverride ?? activeHomeTier;
    if (usesTier) setActiveHomeTier(effectiveTier);
    const effectivePlan = planOverride ?? pricingPlan;
    const homeMonthly = effectiveTier === 'single' ? 10 : 20;
    const fiveMonthly = effectiveTier === 'single' ? 5 : 10;
    const fiveYearly = effectiveTier === 'single' ? 36 : 72;

    // Fire Meta Pixel InitiateCheckout event when user starts checkout
    if (typeof window !== 'undefined' && (window as any).fbq) {
      const value = region === 'home'
        ? homeMonthly
        : region === 'five'
          ? (effectivePlan === 'yearly' ? fiveYearly : fiveMonthly)
          : (effectivePlan === 'yearly' ? cfg.yearlyAmount : cfg.monthlyAmount);
      const eventID = `ic_${usesTier ? effectiveTier + '_' : ''}${effectivePlan}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      (window as any).fbq('track', 'InitiateCheckout', {
        value,
        currency: cfg.currency,
        content_name: usesTier
          ? (effectiveTier === 'single' ? 'Single Page Website' : 'Multi-Page Website')
          : (effectivePlan === 'yearly' ? 'Yearly Plan' : 'Monthly Plan'),
        content_category: 'subscription',
      }, { eventID });
    }

    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: effectivePlan, source: cfg.source, embedded: true, ...(usesTier ? { tier: effectiveTier } : {}) }),
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

  // Subscription regions where PayPal is the primary payment path. /19 is a
  // one-time payment (Stripe-only), and freewebsite/* + barberleads have no
  // checkout (they scroll to a lead form), so they're excluded here.
  const supportsPayPal = (r: string) =>
    r === 'us' || r === 'aus' || r === 'ten' || r === 'five' || r === 'barber' || r === 'localbusiness' || r === 'home' || r === 'barberFive';

  const computePaypalCtx = (r: any, t: 'single' | 'multi' | undefined, p: 'monthly' | 'yearly'): PayPalCtx => {
    if (r === 'barberFive') {
      const tier = t === 'multi' ? 'multi' : 'single';
      const yearly = p === 'yearly';
      return {
        region: 'barberFive', tier, plan: p,
        label: tier === 'multi' ? 'Multi-Page Barbershop Site + SEO' : 'Single Page Barbershop Site',
        priceText: tier === 'multi' ? (yearly ? '$144/yr' : '$20/mo') : (yearly ? '$72/yr' : '$10/mo'),
      };
    }
    if (r === 'five') {
      const tier = t === 'multi' ? 'multi' : 'single';
      const yearly = p === 'yearly';
      return {
        region: 'five', tier, plan: p,
        label: tier === 'multi' ? 'Multi-Page + SEO' : 'Single Page Website',
        priceText: tier === 'multi' ? (yearly ? '$72/yr' : '$10/mo') : (yearly ? '$36/yr' : '$5/mo'),
      };
    }
    if (r === 'home') {
      const tier = t === 'single' ? 'single' : 'multi';
      return {
        region: 'home', tier, plan: 'monthly',
        label: tier === 'single' ? 'Single Page Website' : 'Multi-Service Website',
        priceText: tier === 'single' ? '$10/mo' : '$20/mo',
      };
    }
    const yearly = p === 'yearly';
    if (r === 'ten' || r === 'barber') return { region: r, plan: p, label: 'Website Subscription', priceText: yearly ? '$49/yr' : '$10/mo' };
    if (r === 'localbusiness') return { region: r, plan: p, label: 'Local Business Website', priceText: yearly ? '$135/yr' : '$20/mo' };
    if (r === 'aus') return { region: r, plan: p, label: 'Website Subscription', priceText: yearly ? '$99/yr AUD' : '$20/mo AUD' };
    return { region: 'us', plan: p, label: 'Website Subscription', priceText: yearly ? '$99/yr' : '$20/mo' };
  };

  // Single entry point used by every CTA button across regions.
  const mainCheckout = () => {
    if (supportsPayPal(region)) {
      openPaypal(computePaypalCtx(region, activeHomeTier, pricingPlan));
    } else {
      handleCheckout();
    }
  };

  const scrollToFreeWebsiteForm = () => {
    const el = typeof document !== 'undefined' ? document.getElementById('fw-form') : null;
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const CtaButton = ({ large = true }: { large?: boolean }) => (
    <button
      className={`mv-cta ${large ? 'mv-cta-lg' : ''}`}
      onClick={(region === 'freewebsite' || region === 'freewebsite49' || region === 'barberleads') ? scrollToFreeWebsiteForm : mainCheckout}
      disabled={(region !== 'freewebsite' && region !== 'freewebsite49' && region !== 'barberleads') && isLoading}
    >
      <span className="mv-cta-inner">
        {(region === 'freewebsite' || region === 'freewebsite49' || region === 'barberleads') ? 'Get My Free Website' : isLoading ? 'Loading…' : region === 'barber' ? 'Get Your Barbershop Website Built' : region === 'localbusiness' ? 'Get Your Local Business Website Built' : region === 'home' ? 'Get Your Website Built — From $10/Month' : (region === 'ten' || region === 'five') ? 'Get Access to Your Website System' : 'Get Started'}
        {((region === 'freewebsite' || region === 'freewebsite49' || region === 'barberleads') || !isLoading) && <span aria-hidden="true" style={{ marginLeft: 10, letterSpacing: 0 }}>▸</span>}
      </span>
    </button>
  );

  const barberGallery: Array<
    | { kind: 'video'; mediaId: string; aspect: string; label: string }
    | { kind: 'image'; src: string; label: string }
  > = [
    { kind: 'video', mediaId: 'zeucv84sfn', aspect: '0.5056179775280899', label: 'Sample Site' },
    { kind: 'video', mediaId: 'dp2jzg06lf', aspect: '0.509915014164306', label: 'Sample Site' },
    { kind: 'video', mediaId: 'va1232reyg', aspect: '0.5373134328358209', label: 'Sample Site' },
    { kind: 'video', mediaId: 'ra875to7uc', aspect: '0.5397301349325337', label: 'Sample Site' },
    { kind: 'image', src: '/gallery/barbershop.jpg', label: 'Barbershop' },
    { kind: 'image', src: '/gallery/barber-1.jpg', label: 'Barbershop' },
    { kind: 'image', src: '/gallery/barber-2.jpg', label: 'Barbershop' },
  ];

  const freewebsite49Gallery: Array<{ kind: 'video'; mediaId: string; aspect: string; label: string }> = [
    { kind: 'video', mediaId: 'ra875to7uc', aspect: '0.5397301349325337', label: 'Sample Site' },
    { kind: 'video', mediaId: '798tf6y60c', aspect: '0.547112462006079',  label: 'Sample Site' },
    { kind: 'video', mediaId: '8t4kzvzuno', aspect: '0.5429864253393665', label: 'Sample Site' },
    { kind: 'video', mediaId: 'qi2zmppcou', aspect: '0.5263157894736842', label: 'Sample Site' },
    { kind: 'video', mediaId: 'ogc6ertxsl', aspect: '0.569620253164557',  label: 'Sample Site' },
  ];

  const PortfolioSection = () => {
    const isCompact = region === 'barber' || region === 'freewebsite49' || region === 'freewebsite' || region === 'home' || region === 'barberleads';
    if (isCompact) {
      const useFreeGallery = region === 'freewebsite49' || region === 'freewebsite' || region === 'home';
      const data = useFreeGallery ? freewebsite49Gallery : barberGallery;
      const videos = data.filter((x): x is { kind: 'video'; mediaId: string; aspect: string; label: string } => x.kind === 'video');
      const images = (useFreeGallery ? [] : barberGallery).filter((x): x is { kind: 'image'; src: string; label: string } => x.kind === 'image');
      const titleEm = useFreeGallery ? (region === 'home' ? 'Every Business' : 'Local Businesses') : 'Barbers';
      return (
        <section className="mv-shell mv-portfolio mv-portfolio-barber">
          <h2 className="mv-portfolio-title mv-portfolio-title-barber">
            Websites for <em>{titleEm}</em>
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
                      'controls-visible-on-load': 'true',
                      'big-play-button': 'true',
                      'silent-auto-play': 'true',
                      'playsinline': 'true',
                      'preload': 'auto',
                      'end-video-behavior': 'loop',
                      'resumable': 'false',
                      'player-color': 'c9a96e',
                    } as any)}
                  ></wistia-player>
                </div>
              </div>
            ))}
            {images.length > 0 && (
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
            )}
          </div>
        </section>
      );
    }
    return (
      <section className="mv-shell mv-portfolio">
        <h2 className="mv-portfolio-title">
          Sample websites for <em>{region === 'localbusiness' ? 'local businesses' : 'home service contractors'}</em>
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
        Yearly <span className="mv-save">{(region === 'ten' || region === 'five' || region === 'barber' || (region === 'freewebsite' || region === 'freewebsite49' || region === 'barberleads')) ? '40% Off' : 'Save 44%'}</span>
      </button>
    </div>
  );

  if (region === 'five' || region === 'barberFive') {
    const isBarberFive = region === 'barberFive';
    const barberFiveGallery = [
      { mediaId: 'zeucv84sfn', aspect: '0.5056179775280899' },
      { mediaId: 'dp2jzg06lf', aspect: '0.509915014164306' },
      { mediaId: 'va1232reyg', aspect: '0.5373134328358209' },
      { mediaId: 'ra875to7uc', aspect: '0.5397301349325337' },
    ];
    const fiveExamples = isBarberFive ? barberFiveGallery : freewebsite49Gallery;
    const fiveTier: 'single' | 'multi' = activeHomeTier;
    const fiveIsYearly = pricingPlan === 'yearly';
    const singleMonthly = isBarberFive ? 10 : 5;
    const singleYearly = isBarberFive ? 72 : 36;
    const multiMonthly = isBarberFive ? 20 : 10;
    const multiYearly = isBarberFive ? 144 : 72;
    const heroEyebrow = isBarberFive ? `Custom barbershop sites · From $${singleMonthly}/mo` : `Custom websites · From $5/mo`;
    const heroTitleEm = isBarberFive ? 'barbershops.' : 'local businesses.';
    const examplesEyebrow = isBarberFive ? 'Real sites · Real barbershops' : 'Real sites · Real local businesses';
    const playerColor = isBarberFive ? 'c9a96e' : '0d0d0d';
    const ppRegion: 'five' | 'barberFive' = isBarberFive ? 'barberFive' : 'five';
    const singleLabel = isBarberFive ? 'Single Page Barbershop Site' : 'Single Page Website';
    const multiLabel = isBarberFive ? 'Multi-Page Barbershop Site + SEO' : 'Multi-Page + SEO';
    const singleTierName = isBarberFive ? '1-page site, custom for your barbershop' : '1-page site, custom to your business';
    const multiTierName = isBarberFive ? 'Multi-page barbershop site with SEO' : 'Multi-page site with SEO';
    const singleBullets = isBarberFive
      ? ['One custom page, built for your barbershop', 'Your real photos + barbershop info', 'Hosting + edits included', 'Cancel anytime · no contracts']
      : ['One custom page, built for your business', 'Your real photos + business info', 'Hosting + edits included', 'Cancel anytime · no contracts'];
    const multiBullets = isBarberFive
      ? ['Multiple pages — services, about, contact', 'Built-in SEO best-practices baked in', 'Hosting + edits included', 'Cancel anytime · no contracts']
      : ['Multiple pages — service, about, contact', 'Built-in SEO best-practices baked in', 'Hosting + edits included', 'Cancel anytime · no contracts'];
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@1,300;1,400&display=swap');
          .mv-f-page {
            min-height: 100vh;
            background: #ffffff;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            color: #0d0d0d;
            -webkit-font-smoothing: antialiased;
            padding: 6px 14px 100px;
          }
          .mv-f-nav { display:flex; align-items:center; justify-content:flex-start; max-width:1180px; margin:0 auto 6px; padding:6px 6px; }
          .mv-f-logo { font-weight:900; font-size:20px; letter-spacing:-0.02em; }
          .mv-f-stack { display:flex; flex-direction:column; gap:14px; max-width:1180px; margin:0 auto; }
          .mv-f-card { position:relative; border-radius:22px; padding:18px 18px; overflow:hidden; opacity:0; transform:translateY(18px); transition:opacity .7s cubic-bezier(.22,1,.36,1), transform .7s cubic-bezier(.22,1,.36,1); }
          .mv-f-card.is-visible { opacity:1; transform:translateY(0); }
          .mv-f-hero { background:#f5efe4; }
          .mv-f-examples { background:#dde7d4; }
          .mv-f-how { background:#e6dff0; }
          .mv-f-pricing { background:#f0e4b8; }
          .mv-f-faq { background:#fdf8f0; }
          .mv-f-final { background:#fbdfd0; text-align:center; }
          .mv-f-eyebrow { font-size:10px; font-weight:700; letter-spacing:.14em; text-transform:uppercase; color:#0d0d0d; opacity:.55; margin-bottom:8px; }
          .mv-f-title { font-weight:800; font-size:28px; line-height:1.1; letter-spacing:-.025em; margin:0 0 8px; max-width:680px; }
          .mv-f-title em { font-family:'Cormorant Garamond', serif; font-style:italic; font-weight:400; }
          .mv-f-sub { font-size:15px; line-height:1.5; color:#2a2a2a; margin:0 0 12px; max-width:580px; }
          .mv-f-pill { display:inline-flex; align-items:center; gap:8px; background:#0d0d0d; color:#fff; border:0; cursor:pointer; padding:14px 22px; border-radius:999px; font-weight:600; font-size:15px; transition:background .2s ease, transform .2s ease; }
          .mv-f-pill:hover:not(:disabled) { background:#1f63ff; transform:translateY(-2px); }
          .mv-f-pill svg { width:14px; height:14px; }
          .mv-f-quick { display:grid; grid-template-columns:1fr 1fr; gap:10px; margin:14px 0 18px; max-width:560px; }
          .mv-f-quickitem { background:#fff; border-radius:14px; padding:12px 14px; font-size:13px; line-height:1.4; box-shadow:0 6px 18px rgba(0,0,0,.04); }
          .mv-f-quickitem b { display:block; font-size:14px; margin-bottom:2px; }
          .mv-f-promise { display:inline-flex; align-items:center; justify-content:center; gap:6px; margin:8px auto 0; padding:8px 16px; background:#ffffff; color:#0d0d0d; border-radius:999px; font-weight:800; font-size:12px; line-height:1.2; max-width:280px; box-shadow:0 6px 16px rgba(0,0,0,.10), 0 0 0 1px rgba(0,0,0,.06); }
          .mv-f-promise strong { background:transparent; color:inherit; padding:0; font-weight:800; letter-spacing:.01em; }
          .mv-f-promise-body { font-weight:600; font-size:13px; line-height:1.5; color:#3a3a3a; background:rgba(255,255,255,.85); border-radius:14px; padding:14px 18px; max-width:600px; margin:-6px 0 14px; }
          .mv-f-promise-body em { font-family:'Cormorant Garamond', serif; font-style:italic; font-weight:400; }
          .mv-f-gallery-wrap { position:relative; }
          .mv-f-gallery { display:flex; gap:10px; overflow-x:auto; scroll-snap-type:x mandatory; padding:4px; margin:6px -4px 0; scroll-behavior:smooth; }
          .mv-f-gallery::-webkit-scrollbar { height:5px; }
          .mv-f-gallery::-webkit-scrollbar-thumb { background:rgba(0,0,0,.15); border-radius:999px; }
          .mv-f-gallery-arrow { position:absolute; top:50%; transform:translateY(-50%); width:42px; height:42px; border-radius:999px; background:rgba(255,255,255,.96); color:#0d0d0d; border:0; cursor:pointer; display:inline-flex; align-items:center; justify-content:center; box-shadow:0 8px 22px rgba(0,0,0,.18), 0 0 0 1px rgba(0,0,0,.06); z-index:5; transition:transform .2s ease, background .2s ease; }
          .mv-f-gallery-arrow:hover { transform:translateY(-50%) scale(1.06); background:#fff; }
          .mv-f-gallery-arrow:active { transform:translateY(-50%) scale(0.96); }
          .mv-f-gallery-arrow svg { width:18px; height:18px; }
          .mv-f-gallery-arrow-prev { left:-4px; }
          .mv-f-gallery-arrow-next { right:-4px; }
          .mv-f-gallery-hint { display:flex; align-items:center; justify-content:center; gap:6px; margin-top:8px; font-size:11px; letter-spacing:.14em; text-transform:uppercase; font-weight:700; color:#0d0d0d; opacity:.55; animation:mvSwipeHint 1.8s ease-in-out infinite; }
          .mv-f-gallery-hint svg { width:14px; height:14px; }
          @keyframes mvSwipeHint { 0%,100% { transform:translateX(0); opacity:.55; } 50% { transform:translateX(6px); opacity:.85; } }
          .mv-f-gcard { flex:0 0 auto; width:130px; aspect-ratio:9/16; background:#0d0d0d; border-radius:14px; overflow:hidden; scroll-snap-align:center; box-shadow:0 8px 18px rgba(0,0,0,.10); }
          .mv-f-gallery-compact .mv-f-gcard { width:96px; border-radius:10px; }
          .mv-f-gallery-compact .mv-f-gallery-arrow { width:30px; height:30px; }
          .mv-f-gallery-compact .mv-f-gallery-arrow svg { width:14px; height:14px; }
          .mv-f-gcard wistia-player { width:100%; height:100%; display:block; }
          .mv-f-steps { display:grid; grid-template-columns:1fr; gap:8px; margin-top:6px; }
          .mv-f-step { background:rgba(255,255,255,.7); border-radius:12px; padding:12px 14px; }
          .mv-f-step-num { font-family:'Cormorant Garamond', serif; font-style:italic; font-size:20px; color:#4a3a6a; line-height:1; }
          .mv-f-step-h { font-weight:800; font-size:14px; margin:2px 0 2px; }
          .mv-f-step-b { font-size:12px; color:#3a3a3a; line-height:1.45; }
          .mv-f-toggle { display:inline-flex; gap:4px; background:rgba(255,255,255,.65); padding:3px; border-radius:999px; margin:0 0 10px; }
          .mv-f-toggle button { background:transparent; border:0; padding:6px 14px; border-radius:999px; font-weight:600; font-size:12px; cursor:pointer; color:#0d0d0d; transition:background .2s ease; }
          .mv-f-toggle button.active { background:#0d0d0d; color:#fff; }
          .mv-f-toggle .mv-f-save { display:inline-block; font-size:9px; padding:2px 5px; border-radius:999px; background:#d4914a; color:#fff; margin-left:5px; letter-spacing:.04em; font-weight:700; }
          .mv-f-tiers { display:flex; flex-direction:column; gap:10px; margin-top:4px; }
          .mv-f-tier { background:#fff; border-radius:16px; padding:14px 16px; text-align:left; cursor:pointer; border:0; width:100%; transition:transform .25s ease, box-shadow .25s ease; box-shadow:0 8px 22px rgba(0,0,0,.05); display:flex; flex-direction:column; gap:8px; font-family:inherit; color:inherit; }
          .mv-f-tier:hover:not(:disabled) { transform:translateY(-3px); box-shadow:0 18px 40px rgba(0,0,0,.10); }
          .mv-f-tier-multi { background:#0d0d0d; color:#fff; }
          .mv-f-tier-head { display:flex; justify-content:space-between; align-items:baseline; gap:8px; }
          .mv-f-tier-name { font-weight:800; font-size:13px; letter-spacing:-.01em; }
          .mv-f-tier-multi .mv-f-tier-name { color:#fff; }
          .mv-f-tier-price { font-weight:800; font-size:24px; letter-spacing:-.025em; line-height:1; }
          .mv-f-tier-price small { font-size:11px; font-weight:600; opacity:.6; margin-left:2px; }
          .mv-f-tier-strike { font-size:11px; opacity:.55; text-decoration:line-through; margin-left:5px; font-weight:500; }
          .mv-f-tier-list { list-style:none; padding:0; margin:0; font-size:12px; line-height:1.5; }
          .mv-f-tier-multi .mv-f-tier-list { color:rgba(255,255,255,.85); }
          .mv-f-tier-list li::before { content:'— '; color:#d4914a; font-weight:700; }
          .mv-f-tier-cta { display:inline-flex; align-items:center; justify-content:center; gap:6px; align-self:stretch; font-weight:800; font-size:14px; letter-spacing:.04em; text-transform:uppercase; color:#fff; background:#0d0d0d; padding:12px 18px; border-radius:999px; margin-top:8px; box-shadow:0 8px 20px rgba(13,13,13,.20); transition:transform .2s ease, box-shadow .2s ease, background .2s ease; }
          .mv-f-tier:hover:not(:disabled) .mv-f-tier-cta { transform:translateY(-2px); box-shadow:0 16px 32px rgba(13,13,13,.30); background:#1f63ff; }
          .mv-f-tier-multi .mv-f-tier-cta { color:#0d0d0d; background:#ffd54a; box-shadow:0 10px 24px rgba(255,213,74,.35); }
          .mv-f-tier-multi:hover:not(:disabled) .mv-f-tier-cta { background:#ffe27d; box-shadow:0 16px 32px rgba(255,213,74,.45); }
          .mv-f-tier-compact { padding:12px 14px; }
          .mv-f-tier-compact .mv-f-tier-price { font-size:22px; }
          .mv-f-faq-list { width:100%; }
          .mv-f-faq-item { background:#fff; border-radius:14px; margin-bottom:8px; overflow:hidden; }
          .mv-f-faq-summary { list-style:none; cursor:pointer; padding:14px 18px; display:flex; justify-content:space-between; align-items:center; font-weight:700; font-size:14px; }
          .mv-f-faq-summary::-webkit-details-marker { display:none; }
          .mv-f-faq-icon { font-size:20px; transition:transform .25s ease; }
          .mv-f-faq-item[open] .mv-f-faq-icon { transform:rotate(45deg); }
          .mv-f-faq-a { padding:0 18px 14px; font-size:13px; color:#3a3a3a; line-height:1.6; }
          .mv-f-footer { text-align:center; font-size:12px; color:#999; margin-top:18px; padding:12px; }
          .mv-f-sticky { position:fixed; left:12px; right:12px; bottom:12px; z-index:90; background:rgba(13,13,13,.96); backdrop-filter:blur(8px); -webkit-backdrop-filter:blur(8px); color:#fff; border-radius:999px; padding:10px 10px 10px 20px; display:flex; align-items:center; justify-content:space-between; gap:12px; max-width:1080px; margin:0 auto; box-shadow:0 12px 32px rgba(0,0,0,.20); transform:translateY(140%); opacity:0; pointer-events:none; transition:transform .35s cubic-bezier(.22,1,.36,1), opacity .35s ease; }
          .mv-f-sticky.is-visible { transform:translateY(0); opacity:1; pointer-events:auto; }
          .mv-f-sticky-text { font-size:13px; font-weight:600; }
          .mv-f-sticky .mv-f-pill { padding:10px 18px; font-size:13px; }
          @keyframes mvFadeIn { from { opacity:0 } to { opacity:1 } }
          .mv-checkout-backdrop { position:fixed; inset:0; background:rgba(10,10,10,.82); backdrop-filter:blur(4px); -webkit-backdrop-filter:blur(4px); z-index:9999; display:flex; align-items:center; justify-content:center; padding:20px; animation:mvFadeIn .2s ease; }
          .mv-checkout-modal { position:relative; width:100%; max-width:440px; max-height:calc(100vh - 40px); background:#fff; border-radius:18px; box-shadow:0 20px 60px rgba(0,0,0,.45); padding:8px; overflow:hidden; display:flex; flex-direction:column; }
          .mv-checkout-close { position:absolute; top:8px; right:8px; width:30px; height:30px; border-radius:999px; background:#0d0d0d; border:0; color:#fff; font-size:13px; cursor:pointer; z-index:3; }
          .mv-checkout-close:hover { background:#1f63ff; }
          .mv-checkout-frame-inner { flex:1; overflow-y:auto; border-radius:12px; }
          .mv-checkout-fallback-link { display:block; margin:8px auto 4px; padding:6px 10px; background:transparent; border:0; cursor:pointer; font-size:11px; letter-spacing:.12em; text-transform:uppercase; color:#777; font-weight:600; text-align:center; }
          .mv-checkout-fallback-link:hover { color:#0d0d0d; }
          @media (min-width: 760px) {
            .mv-f-card { padding:36px 32px; }
            .mv-f-title { font-size:38px; }
            .mv-f-steps { grid-template-columns:repeat(3, 1fr); gap:10px; }
            .mv-f-tiers { flex-direction:row; align-items:stretch; }
            .mv-f-tier { flex:1; }
          }
          @media (min-width: 1024px) {
            .mv-f-title { font-size:44px; }
            .mv-f-hero .mv-f-title { font-size:50px; }
          }

          ${isBarberFive ? `
            /* Black + gold barber theme */
            .mv-f-page-barber { background:#0a0a0a !important; color:#f5f0e0 !important; }
            .mv-f-page-barber .mv-f-logo { color:#c9a96e; }
            .mv-f-page-barber .mv-f-pill { background:#c9a96e; color:#0a0a0a; }
            .mv-f-page-barber .mv-f-pill:hover:not(:disabled) { background:#d8b67a; color:#0a0a0a; }
            .mv-f-page-barber .mv-f-hero { background:#141414; color:#f5f0e0; box-shadow:inset 0 0 0 1px rgba(201,169,110,.18); }
            .mv-f-page-barber .mv-f-how { background:#0f0f0f; color:#f5f0e0; box-shadow:inset 0 0 0 1px rgba(201,169,110,.12); }
            .mv-f-page-barber .mv-f-pricing { background:#141414; color:#f5f0e0; box-shadow:inset 0 0 0 1px rgba(201,169,110,.22); }
            .mv-f-page-barber .mv-f-faq { background:#0f0f0f; color:#f5f0e0; box-shadow:inset 0 0 0 1px rgba(201,169,110,.12); }
            .mv-f-page-barber .mv-f-final { background:#0a0a0a; color:#f5f0e0; box-shadow:inset 0 0 0 1px rgba(201,169,110,.18); }
            .mv-f-page-barber .mv-f-eyebrow { color:#c9a96e; opacity:.95; }
            .mv-f-page-barber .mv-f-title { color:#f5f0e0; }
            .mv-f-page-barber .mv-f-title em { color:#c9a96e; }
            .mv-f-page-barber .mv-f-sub { color:#cfc8b8; }
            .mv-f-page-barber .mv-f-promise { background:#ffffff; color:#0a0a0a; box-shadow:0 8px 20px rgba(0,0,0,.5), 0 0 0 1px rgba(201,169,110,.4); }
            .mv-f-page-barber .mv-f-promise strong { background:transparent; color:inherit; }
            .mv-f-page-barber .mv-f-promise-body { background:rgba(245,240,224,.06); color:#cfc8b8; }
            .mv-f-page-barber .mv-f-step { background:rgba(201,169,110,.07); color:#f5f0e0; box-shadow:inset 0 0 0 1px rgba(201,169,110,.18); }
            .mv-f-page-barber .mv-f-step-num { color:#c9a96e; }
            .mv-f-page-barber .mv-f-step-h { color:#f5f0e0; }
            .mv-f-page-barber .mv-f-step-b { color:#cfc8b8; }
            .mv-f-page-barber .mv-f-toggle { background:rgba(201,169,110,.10); }
            .mv-f-page-barber .mv-f-toggle button { color:#f5f0e0; }
            .mv-f-page-barber .mv-f-toggle button.active { background:#c9a96e; color:#0a0a0a; }
            .mv-f-page-barber .mv-f-toggle .mv-f-save { background:#0a0a0a; color:#c9a96e; }
            .mv-f-page-barber .mv-f-tier { background:#1c1c1c; color:#f5f0e0; box-shadow:0 12px 28px rgba(0,0,0,.45), inset 0 0 0 1px rgba(201,169,110,.22); }
            .mv-f-page-barber .mv-f-tier:hover:not(:disabled) { box-shadow:0 18px 40px rgba(0,0,0,.55), inset 0 0 0 1px rgba(201,169,110,.45); }
            .mv-f-page-barber .mv-f-tier-multi { background:#c9a96e; color:#0a0a0a; box-shadow:0 12px 28px rgba(201,169,110,.30); }
            .mv-f-page-barber .mv-f-tier-multi .mv-f-tier-name { color:#0a0a0a; }
            .mv-f-page-barber .mv-f-tier-multi .mv-f-tier-list { color:rgba(10,10,10,.85); }
            .mv-f-page-barber .mv-f-tier-multi .mv-f-tier-list li::before { color:#0a0a0a; }
            .mv-f-page-barber .mv-f-tier-list li::before { color:#c9a96e; }
            .mv-f-page-barber .mv-f-tier-cta { color:#0a0a0a; background:#c9a96e; box-shadow:0 10px 24px rgba(201,169,110,.35); }
            .mv-f-page-barber .mv-f-tier:hover:not(:disabled) .mv-f-tier-cta { background:#d8b67a; box-shadow:0 16px 32px rgba(201,169,110,.45); }
            .mv-f-page-barber .mv-f-tier-multi .mv-f-tier-cta { color:#c9a96e; background:#0a0a0a; box-shadow:0 10px 24px rgba(0,0,0,.45); }
            .mv-f-page-barber .mv-f-tier-multi:hover:not(:disabled) .mv-f-tier-cta { background:#1f1f1f; color:#f5f0e0; }
            .mv-f-page-barber .mv-f-faq-item { background:#1c1c1c; color:#f5f0e0; box-shadow:inset 0 0 0 1px rgba(201,169,110,.18); }
            .mv-f-page-barber .mv-f-faq-summary { color:#f5f0e0; }
            .mv-f-page-barber .mv-f-faq-a { color:#cfc8b8; }
            .mv-f-page-barber .mv-f-footer { color:#7a7367; }
            .mv-f-page-barber .mv-f-sticky { background:rgba(201,169,110,.97); color:#0a0a0a; }
            .mv-f-page-barber .mv-f-sticky .mv-f-sticky-text { color:#0a0a0a; }
            .mv-f-page-barber .mv-f-sticky .mv-f-pill { background:#0a0a0a; color:#c9a96e; }
            .mv-f-page-barber .mv-f-sticky .mv-f-pill:hover:not(:disabled) { background:#1f1f1f; color:#f5f0e0; }
            .mv-f-page-barber .mv-f-gallery-arrow { background:#c9a96e; color:#0a0a0a; box-shadow:0 8px 22px rgba(0,0,0,.55), 0 0 0 1px rgba(201,169,110,.5); }
            .mv-f-page-barber .mv-f-gallery-arrow:hover { background:#d8b67a; }
            .mv-f-page-barber .mv-f-gallery-hint { color:#c9a96e; opacity:.85; }
          ` : ''}
        `}</style>
        <div className={`mv-f-page${isBarberFive ? ' mv-f-page-barber' : ''}`}>
          <nav className="mv-f-nav">
            <span className="mv-f-logo">amalvera</span>
          </nav>

          <div className="mv-f-stack">
            {/* Hero — compact, with embedded examples gallery */}
            <section className="mv-f-card mv-f-hero mv-h-anim">
              <div className="mv-f-eyebrow">{heroEyebrow}</div>
              <h1 className="mv-f-title">{isBarberFive ? 'Custom websites for ' : 'Custom websites for '}<em>{heroTitleEm}</em></h1>
              <p className="mv-f-sub">We build it. We host it. We deliver it in 24 hours. That's it.</p>

              <div className="mv-f-eyebrow" style={{ marginTop: 6 }}>{examplesEyebrow}</div>
              <div className="mv-f-gallery-wrap">
                <button
                  type="button"
                  className="mv-f-gallery-arrow mv-f-gallery-arrow-prev"
                  aria-label="Previous example"
                  onClick={(e) => {
                    const row = e.currentTarget.parentElement?.querySelector('.mv-f-gallery') as HTMLElement | null;
                    row?.scrollBy({ left: -200, behavior: 'smooth' });
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 6 9 12 15 18"/></svg>
                </button>
                <button
                  type="button"
                  className="mv-f-gallery-arrow mv-f-gallery-arrow-next"
                  aria-label="Next example"
                  onClick={(e) => {
                    const row = e.currentTarget.parentElement?.querySelector('.mv-f-gallery') as HTMLElement | null;
                    row?.scrollBy({ left: 200, behavior: 'smooth' });
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>
                </button>
                <div className="mv-f-gallery">
                {fiveExamples.map((item, i) => (
                  <div key={i} className="mv-f-gcard">
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
                        'controls-visible-on-load': 'true',
                        'big-play-button': 'true',
                        'silent-auto-play': 'true',
                        'playsinline': 'true',
                        'preload': 'auto',
                        'end-video-behavior': 'loop',
                        'resumable': 'false',
                        'player-color': playerColor,
                      } as any)}
                    ></wistia-player>
                  </div>
                ))}
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginTop: 12 }}>
                <div className="mv-f-promise"><strong>We deliver within 24 hours</strong></div>
                <button
                  className="mv-f-pill"
                  style={{ width: '100%', maxWidth: 240, justifyContent: 'center', padding: '14px 20px', fontSize: 16, fontWeight: 800 }}
                  onClick={() => { const el = document.getElementById('mv-f-pricing'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }}
                  disabled={isLoading}
                >
                  See pricing
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={{ width: 16, height: 16 }}><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
                <PaymentBadgeRow />
              </div>
            </section>

            {/* How it works */}
            <section className="mv-f-card mv-f-how mv-h-anim">
              <div className="mv-f-eyebrow">How it works</div>
              <h2 className="mv-f-title">Three simple steps.</h2>
              <p className="mv-f-sub">All we need is one link. We handle the rest.</p>
              <div className="mv-f-steps">
                <div className="mv-f-step"><span className="mv-f-step-num">i.</span><div className="mv-f-step-h">Send us your link or info</div><div className="mv-f-step-b">A Google Business Profile, Facebook, or Instagram link — or just your business info and a few photos. That's all we need.</div></div>
                <div className="mv-f-step"><span className="mv-f-step-num">ii.</span><div className="mv-f-step-h">We build your site</div><div className="mv-f-step-b">Our team uses AI to build a custom site for your business — with nice-looking backgrounds and your real info.</div></div>
                <div className="mv-f-step"><span className="mv-f-step-num">iii.</span><div className="mv-f-step-h">Live in 24 hours</div><div className="mv-f-step-b">Up and running within 24 hours. We host it too — you just cover the monthly cost.</div></div>
              </div>
            </section>

            {/* Pricing */}
            <section id="mv-f-pricing" className="mv-f-card mv-f-pricing mv-h-anim">
              <div className="mv-f-eyebrow">Pricing</div>
              <h2 className="mv-f-title">Pick your plan.</h2>
              <p className="mv-f-sub">Pay monthly, or save 40% by paying yearly.</p>
              <div className="mv-f-toggle" role="tablist" aria-label="Billing plan">
                <button type="button" className={pricingPlan === 'monthly' ? 'active' : ''} onClick={() => setPricingPlan('monthly')}>Monthly</button>
                <button type="button" className={pricingPlan === 'yearly' ? 'active' : ''} onClick={() => setPricingPlan('yearly')}>Yearly<span className="mv-f-save">40% off</span></button>
              </div>

              <div className="mv-f-gallery-wrap mv-f-gallery-compact" style={{ marginBottom: 10 }}>
                <button
                  type="button"
                  className="mv-f-gallery-arrow mv-f-gallery-arrow-prev"
                  aria-label="Previous example"
                  onClick={(e) => {
                    const row = e.currentTarget.parentElement?.querySelector('.mv-f-gallery') as HTMLElement | null;
                    row?.scrollBy({ left: -160, behavior: 'smooth' });
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 6 9 12 15 18"/></svg>
                </button>
                <button
                  type="button"
                  className="mv-f-gallery-arrow mv-f-gallery-arrow-next"
                  aria-label="Next example"
                  onClick={(e) => {
                    const row = e.currentTarget.parentElement?.querySelector('.mv-f-gallery') as HTMLElement | null;
                    row?.scrollBy({ left: 160, behavior: 'smooth' });
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>
                </button>
                <div className="mv-f-gallery">
                  {fiveExamples.map((item, i) => (
                    <div key={`p-${i}`} className="mv-f-gcard">
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
                          'playsinline': 'true',
                          'preload': 'auto',
                          'end-video-behavior': 'loop',
                          'resumable': 'false',
                          'player-color': playerColor,
                        } as any)}
                      ></wistia-player>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 12 }}>
                <div className="mv-f-promise"><strong>We deliver within 24 hours</strong></div>
              </div>

              <div className="mv-f-tiers">
                <button type="button" className="mv-f-tier mv-f-tier-compact" onClick={() => openPaypal({ region: ppRegion, tier: 'single', plan: pricingPlan, label: singleLabel, priceText: fiveIsYearly ? `$${singleYearly}/yr` : `$${singleMonthly}/mo` })} disabled={isLoading}>
                  <div className="mv-f-tier-head">
                    <div className="mv-f-tier-name">{singleTierName}</div>
                    <div className="mv-f-tier-price">
                      ${fiveIsYearly ? singleYearly : singleMonthly}<small>/{fiveIsYearly ? 'yr' : 'mo'}</small>
                      {fiveIsYearly && <span className="mv-f-tier-strike">${singleMonthly * 12}</span>}
                    </div>
                  </div>
                  <ul className="mv-f-tier-list">
                    {singleBullets.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                  <span className="mv-f-tier-cta">Start →</span>
                  <PaymentBadgeRow />
                </button>
                <button type="button" className="mv-f-tier mv-f-tier-multi" onClick={() => openPaypal({ region: ppRegion, tier: 'multi', plan: pricingPlan, label: multiLabel, priceText: fiveIsYearly ? `$${multiYearly}/yr` : `$${multiMonthly}/mo` })} disabled={isLoading}>
                  <div className="mv-f-tier-head">
                    <div className="mv-f-tier-name">{multiTierName}</div>
                    <div className="mv-f-tier-price">
                      ${fiveIsYearly ? multiYearly : multiMonthly}<small>/{fiveIsYearly ? 'yr' : 'mo'}</small>
                      {fiveIsYearly && <span className="mv-f-tier-strike">${multiMonthly * 12}</span>}
                    </div>
                  </div>
                  <ul className="mv-f-tier-list">
                    {multiBullets.map((b, i) => <li key={i}>{b}</li>)}
                  </ul>
                  <span className="mv-f-tier-cta">Start →</span>
                  <PaymentBadgeRow />
                </button>
              </div>

              <p style={{ margin: '14px auto 0', fontSize: 12, color: '#666', textAlign: 'center', maxWidth: 380, lineHeight: 1.5 }}>
                Secure checkout powered by <strong style={{ color: '#003087' }}>PayPal</strong>. Pay with PayPal balance or with any major debit/credit card.
              </p>
            </section>

            {/* FAQ */}
            <section className="mv-f-card mv-f-faq mv-h-anim">
              <div className="mv-f-eyebrow">Questions</div>
              <h2 className="mv-f-title">Common <em>questions.</em></h2>
              <div className="mv-f-faq-list">
                <details className="mv-f-faq-item" open>
                  <summary className="mv-f-faq-summary">What do I have to send you?<span className="mv-f-faq-icon">+</span></summary>
                  <div className="mv-f-faq-a">Send us a link — your Google Business Profile, Facebook, or Instagram page. If you don't have those, just send a few photos and your business info, and we'll build a custom site from that.</div>
                </details>
                <details className="mv-f-faq-item">
                  <summary className="mv-f-faq-summary">Is it really custom?<span className="mv-f-faq-icon">+</span></summary>
                  <div className="mv-f-faq-a">Yes. Our team uses AI to build a custom site for your business with nice-looking backgrounds, your real photos, and your business info. Every site is one of a kind.</div>
                </details>
                <details className="mv-f-faq-item">
                  <summary className="mv-f-faq-summary">Can I make edits to the site?<span className="mv-f-faq-icon">+</span></summary>
                  <div className="mv-f-faq-a">Yes. Any time you want changes — copy, photos, layout — just message us and we'll make the edits for you. It's all included in the monthly cost.</div>
                </details>
                <details className="mv-f-faq-item">
                  <summary className="mv-f-faq-summary">How fast is it live?<span className="mv-f-faq-icon">+</span></summary>
                  <div className="mv-f-faq-a">Within 24 hours of you sending us your link or info.</div>
                </details>
              </div>
            </section>

          </div>

          <div className="mv-f-footer">© {new Date().getFullYear()} Amalvera · Austin, TX</div>

          <div className={`mv-f-sticky${showFiveSticky ? ' is-visible' : ''}`}>
            <span className="mv-f-sticky-text">We build it · host it · deliver in 24 hours</span>
            <button className="mv-f-pill" onClick={() => { const el = document.getElementById('mv-f-pricing'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} disabled={isLoading}>
              See pricing
            </button>
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
              <button type="button" className="mv-checkout-fallback-link" onClick={fallbackToHosted}>
                Having trouble? Open checkout directly →
              </button>
            </div>
          </div>
        )}

        <PayPalSubscribeModal
          open={paypalOpen}
          ctx={paypalCtx}
          onClose={() => setPaypalOpen(false)}
        />
      </>
    );
  }

  if (region === 'home') {
    const homeVideos = freewebsite49Gallery;
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Cormorant+Garamond:ital,wght@1,300;1,400&display=swap');
          .mv-h-page {
            min-height: 100vh;
            background: #ffffff;
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
            color: #0d0d0d;
            -webkit-font-smoothing: antialiased;
            padding: 16px 14px 100px;
          }
          .mv-h-nav {
            display: flex; align-items: center; justify-content: space-between;
            max-width: 1280px; margin: 0 auto 16px;
            padding: 14px 8px;
          }
          .mv-h-logo {
            font-family: 'Inter', sans-serif;
            font-weight: 900;
            font-size: 22px;
            letter-spacing: -0.02em;
            color: #0d0d0d;
          }
          .mv-h-nav-cta {
            background: #0d0d0d; color: #fff;
            border: 0; cursor: pointer;
            padding: 12px 24px;
            border-radius: 999px;
            font-family: 'Inter', sans-serif;
            font-weight: 600; font-size: 14px;
            transition: background 0.2s ease, transform 0.2s ease;
          }
          .mv-h-nav-cta:hover { background: #1f63ff; transform: translateY(-1px); }
          .mv-h-stack {
            display: flex; flex-direction: column;
            gap: 14px;
            max-width: 1280px;
            margin: 0 auto;
          }
          .mv-h-card {
            position: relative;
            border-radius: 28px;
            padding: 56px 40px;
            overflow: hidden;
            display: flex; flex-direction: column;
            min-height: 480px;
            opacity: 0;
            transform: translateY(20px);
            transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
          }
          .mv-h-card.is-visible { opacity: 1; transform: translateY(0); }
          .mv-h-eyebrow {
            font-size: 12px; font-weight: 600;
            letter-spacing: 0.08em; text-transform: uppercase;
            color: #0d0d0d; opacity: 0.55;
            margin-bottom: 18px;
          }
          .mv-h-title {
            font-family: 'Inter', sans-serif;
            font-weight: 800;
            font-size: 44px;
            line-height: 1.05;
            letter-spacing: -0.025em;
            color: #0d0d0d;
            margin: 0 0 18px;
            max-width: 720px;
          }
          .mv-h-title em {
            font-family: 'Cormorant Garamond', serif;
            font-style: italic;
            font-weight: 400;
            letter-spacing: -0.01em;
          }
          .mv-h-sub {
            font-size: 17px; line-height: 1.5;
            color: #2a2a2a;
            max-width: 540px;
            margin: 0 0 28px;
            font-weight: 400;
          }
          .mv-h-pill {
            align-self: flex-start;
            background: #0d0d0d; color: #fff;
            border: 0; cursor: pointer;
            padding: 18px 32px;
            border-radius: 999px;
            font-family: 'Inter', sans-serif;
            font-weight: 600; font-size: 16px;
            transition: background 0.2s ease, transform 0.2s ease;
            display: inline-flex; align-items: center; gap: 8px;
          }
          .mv-h-pill:hover:not(:disabled) { background: #1f63ff; transform: translateY(-2px); }
          .mv-h-pill:disabled { opacity: 0.6; cursor: wait; }
          .mv-h-pill svg { width: 14px; height: 14px; }
          /* Section colors */
          .mv-h-hero { background: #f5efe4; min-height: 560px; }
          .mv-h-gallery { background: #dde7d4; }
          .mv-h-pillars { background: #f0e8db; }
          .mv-h-pricing { background: #f0e4b8; }
          .mv-h-how { background: #e6dff0; }
          .mv-h-faq { background: #fdf8f0; }
          .mv-h-final { background: #fbdfd0; min-height: 380px; align-items: center; justify-content: center; text-align: center; }
          .mv-h-final .mv-h-title, .mv-h-final .mv-h-sub { margin-left: auto; margin-right: auto; max-width: 600px; }
          .mv-h-final .mv-h-pill { align-self: center; }
          /* Visual area */
          .mv-h-visual {
            margin-top: auto;
            position: relative;
            width: 100%;
            display: flex; align-items: center; justify-content: center;
            padding-top: 32px;
          }
          /* Trust card visual: stylized browser mockup */
          .mv-h-mockup {
            width: 100%; max-width: 460px;
            background: #fff; border-radius: 14px;
            overflow: hidden;
            box-shadow: 0 24px 48px rgba(0,0,0,0.10), 0 0 0 1px rgba(0,0,0,0.05);
            transition: transform 0.5s ease;
          }
          .mv-h-card:hover .mv-h-mockup { transform: translateY(-4px) rotate(-0.5deg); }
          .mv-h-mockup-bar {
            height: 30px; background: #f5f5f5;
            display: flex; align-items: center; gap: 6px;
            padding: 0 12px;
          }
          .mv-h-mockup-bar span { width: 9px; height: 9px; border-radius: 50%; }
          .mv-h-mockup-bar span:nth-child(1) { background: #fb6261; }
          .mv-h-mockup-bar span:nth-child(2) { background: #fdbc40; }
          .mv-h-mockup-bar span:nth-child(3) { background: #34c84a; }
          .mv-h-mockup-body { padding: 28px 24px 36px; }
          .mv-h-mockup-h { font-size: 22px; font-weight: 800; letter-spacing: -0.02em; margin-bottom: 8px; color: #0d0d0d; }
          .mv-h-mockup-p { font-size: 12px; color: #6b6b6b; margin-bottom: 16px; line-height: 1.5; }
          .mv-h-mockup-cta { display: inline-block; background: #d4914a; color: #fff; padding: 10px 18px; border-radius: 999px; font-size: 12px; font-weight: 600; }
          /* Speed card visual: clock-style ring */
          .mv-h-clock {
            width: 220px; height: 220px;
            position: relative;
          }
          .mv-h-clock svg { width: 100%; height: 100%; }
          /* Gallery card */
          .mv-h-gallery .mv-h-visual { padding-top: 24px; }
          .mv-h-gallery-wrap {
            position: relative;
            width: 100%;
          }
          .mv-h-gallery-arrow {
            position: absolute;
            top: 50%;
            transform: translateY(-50%);
            z-index: 4;
            width: 44px; height: 44px;
            border-radius: 999px;
            background: #0d0d0d;
            color: #fff;
            border: 0;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
            box-shadow: 0 8px 18px rgba(0,0,0,0.18);
            transition: background 0.2s ease, transform 0.2s ease;
          }
          .mv-h-gallery-arrow svg { width: 18px; height: 18px; }
          .mv-h-gallery-arrow:hover { background: #1f63ff; }
          .mv-h-gallery-arrow:active { transform: translateY(-50%) scale(0.94); }
          .mv-h-gallery-arrow-prev { left: -8px; }
          .mv-h-gallery-arrow-next { right: -8px; }
          @media (min-width: 900px) {
            .mv-h-gallery-arrow-prev { left: -22px; }
            .mv-h-gallery-arrow-next { right: -22px; }
          }
          .mv-h-gallery-row {
            display: flex; gap: 12px;
            overflow-x: auto;
            scroll-snap-type: x mandatory;
            -webkit-overflow-scrolling: touch;
            padding: 4px 4px 12px;
            margin: 0 -4px;
            width: 100%;
          }
          .mv-h-gallery-row::-webkit-scrollbar { height: 5px; }
          .mv-h-gallery-row::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.15); border-radius: 999px; }
          .mv-h-gallery-card {
            flex: 0 0 auto;
            width: 200px;
            scroll-snap-align: center;
            border-radius: 18px;
            overflow: hidden;
            background: #0d0d0d;
            aspect-ratio: 9/16;
            box-shadow: 0 8px 18px rgba(0,0,0,0.10);
            transition: transform 0.3s ease;
          }
          .mv-h-gallery-card:hover { transform: translateY(-4px); }
          .mv-h-gallery-card wistia-player { width: 100%; height: 100%; display: block; }
          /* Pillar grid (combined Trust / Speed / SEO) */
          .mv-h-pillar-grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 18px;
            margin-top: 12px;
            width: 100%;
          }
          .mv-h-pillar {
            background: rgba(255,255,255,0.7);
            border-radius: 18px;
            padding: 26px 22px;
            transition: transform 0.3s ease, background 0.3s ease;
          }
          .mv-h-pillar:hover {
            background: rgba(255,255,255,0.95);
            transform: translateY(-3px);
          }
          .mv-h-pillar-icon {
            width: 36px; height: 36px;
            display: block;
            margin-bottom: 14px;
          }
          .mv-h-pillar-h {
            font-weight: 800; font-size: 17px;
            color: #0d0d0d; margin-bottom: 6px;
            letter-spacing: -0.01em;
          }
          .mv-h-pillar-b {
            font-size: 14px; color: #3a3a3a; line-height: 1.55;
          }
          @media (max-width: 720px) {
            .mv-h-pillar-grid { grid-template-columns: 1fr; gap: 12px; }
            .mv-h-pillar { padding: 22px 20px; }
          }
          /* Pricing card visual: receipt */
          .mv-h-receipt {
            background: #fff;
            border-radius: 14px;
            padding: 22px 24px;
            max-width: 360px;
            width: 100%;
            box-shadow: 0 24px 48px rgba(0,0,0,0.08);
            font-family: 'Inter', sans-serif;
          }
          .mv-h-receipt-row {
            display: flex; justify-content: space-between; align-items: baseline;
            padding: 10px 0;
            border-bottom: 1px dashed rgba(0,0,0,0.12);
            font-size: 14px;
          }
          .mv-h-receipt-row:last-of-type { border-bottom: 0; padding-top: 14px; font-weight: 800; font-size: 16px; }
          .mv-h-receipt-label { color: #2a2a2a; }
          .mv-h-receipt-val { color: #0d0d0d; font-weight: 600; }
          .mv-h-receipt-strike { text-decoration: line-through; color: #999; margin-right: 6px; font-weight: 400; }
          /* Two-tier pricing */
          .mv-h-pricing-section { flex-direction: column !important; align-items: stretch !important; }
          .mv-h-pricing-head { text-align: center; max-width: 720px; margin: 0 auto 28px; }
          .mv-h-pricing-head .mv-h-title, .mv-h-pricing-head .mv-h-sub { margin-left: auto; margin-right: auto; }
          .mv-h-tier-row {
            display: flex;
            flex-direction: column;
            align-items: stretch;
            gap: 14px;
            width: 100%;
            max-width: 920px;
            margin: 0 auto;
          }
          .mv-h-tier {
            background: #fff;
            border-radius: 22px;
            padding: 28px 26px 30px;
            box-shadow: 0 16px 40px rgba(0,0,0,0.06);
            display: flex; flex-direction: column;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            flex: 1;
          }
          .mv-h-tier:hover { transform: translateY(-3px); box-shadow: 0 22px 48px rgba(0,0,0,0.10); }
          .mv-h-tier-feat { background: #0d0d0d; color: #fff; }
          .mv-h-tier-feat .mv-h-tier-eyebrow { color: rgba(255,255,255,0.7); }
          .mv-h-tier-feat .mv-h-tier-price { color: #fff; }
          .mv-h-tier-feat .mv-h-tier-list { color: rgba(255,255,255,0.85); }
          .mv-h-tier-feat .mv-h-pill { background: #fff; color: #0d0d0d; }
          .mv-h-tier-feat .mv-h-pill:hover:not(:disabled) { background: #1f63ff; color: #fff; }
          .mv-h-tier-eyebrow {
            font-size: 11px; font-weight: 700;
            letter-spacing: 0.14em; text-transform: uppercase;
            color: #6a6a6a;
            margin-bottom: 12px;
          }
          .mv-h-tier-price {
            font-family: 'Inter', sans-serif;
            font-weight: 800;
            font-size: 52px;
            line-height: 1;
            letter-spacing: -0.03em;
            color: #0d0d0d;
            margin-bottom: 18px;
          }
          .mv-h-tier-price span {
            font-size: 16px; font-weight: 600;
            letter-spacing: 0; opacity: 0.55;
            margin-left: 4px;
          }
          .mv-h-tier-list {
            list-style: none; padding: 0; margin: 0 0 22px;
            font-size: 14px; line-height: 1.6; color: #2a2a2a;
          }
          .mv-h-tier-list li { padding: 4px 0; }
          .mv-h-tier-list li::before { content: '— '; color: #d4914a; font-weight: 700; }
          .mv-h-tier .mv-h-pill { align-self: stretch; justify-content: center; }
          .mv-h-or {
            text-align: center;
            font-family: 'Cormorant Garamond', serif;
            font-style: italic;
            font-weight: 400;
            font-size: 22px;
            color: #6a6a6a;
            padding: 4px 0;
          }
          @media (min-width: 760px) {
            .mv-h-tier-row { flex-direction: row; align-items: stretch; gap: 18px; }
            .mv-h-or { padding: 0; align-self: center; }
          }
          /* How It Works steps */
          .mv-h-steps {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 16px;
            width: 100%;
            margin-top: auto;
          }
          .mv-h-step {
            background: rgba(255,255,255,0.65);
            border-radius: 16px;
            padding: 22px 20px;
          }
          .mv-h-step-num {
            font-family: 'Cormorant Garamond', serif;
            font-style: italic;
            font-weight: 400;
            font-size: 28px;
            color: #4a3a6a;
            line-height: 1;
            margin-bottom: 8px;
            display: block;
          }
          .mv-h-step-h {
            font-weight: 800; font-size: 16px;
            color: #0d0d0d; margin-bottom: 4px;
            letter-spacing: -0.01em;
          }
          .mv-h-step-b {
            font-size: 13px; color: #4a3a6a; line-height: 1.5;
          }
          /* FAQ accordion */
          .mv-h-faq-list { width: 100%; max-width: 720px; margin: 0 auto; }
          .mv-h-faq-item {
            background: #fff;
            border-radius: 16px;
            margin-bottom: 8px;
            overflow: hidden;
            transition: box-shadow 0.2s ease;
          }
          .mv-h-faq-item:hover { box-shadow: 0 4px 14px rgba(0,0,0,0.05); }
          .mv-h-faq-summary {
            list-style: none; cursor: pointer;
            padding: 18px 22px;
            display: flex; justify-content: space-between; align-items: center;
            font-weight: 600; font-size: 16px; color: #0d0d0d;
            letter-spacing: -0.01em;
          }
          .mv-h-faq-summary::-webkit-details-marker { display: none; }
          .mv-h-faq-icon {
            font-size: 22px; line-height: 1; color: #0d0d0d;
            transition: transform 0.25s ease;
          }
          .mv-h-faq-item[open] .mv-h-faq-icon { transform: rotate(45deg); }
          .mv-h-faq-a {
            padding: 0 22px 18px;
            font-size: 14px; color: #4a4a4a; line-height: 1.6;
          }
          /* Footer */
          .mv-h-footer {
            text-align: center;
            font-size: 12px; color: #999;
            margin-top: 24px;
            padding: 12px;
          }
          .mv-h-footer a { color: #999; text-decoration: underline; }
          /* Sticky bottom CTA bar */
          .mv-h-sticky {
            position: fixed; left: 12px; right: 12px; bottom: 12px;
            z-index: 90;
            background: rgba(13,13,13,0.96);
            backdrop-filter: blur(8px);
            -webkit-backdrop-filter: blur(8px);
            color: #fff;
            border-radius: 999px;
            padding: 10px 10px 10px 22px;
            display: flex; align-items: center; justify-content: space-between;
            gap: 12px;
            max-width: 1100px; margin: 0 auto;
            box-shadow: 0 12px 32px rgba(0,0,0,0.20);
          }
          .mv-h-sticky-text {
            font-size: 14px; font-weight: 600;
            letter-spacing: -0.01em;
          }
          .mv-h-sticky .mv-h-pill { padding: 12px 22px; font-size: 14px; align-self: auto; }

          /* Embedded Stripe modal — same as other pages */
          @keyframes mvFadeIn { from { opacity: 0; } to { opacity: 1; } }
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
            background: #ffffff;
            border-radius: 18px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.45);
            padding: 8px;
            overflow: hidden;
            display: flex; flex-direction: column;
          }
          .mv-checkout-close {
            position: absolute; top: 8px; right: 8px;
            width: 30px; height: 30px;
            border-radius: 999px;
            background: #0d0d0d;
            border: 0;
            color: #fff;
            font-size: 13px;
            cursor: pointer; z-index: 3;
            transition: background 0.2s ease;
          }
          .mv-checkout-close:hover { background: #1f63ff; }
          .mv-checkout-fallback-link {
            display: block;
            margin: 8px auto 4px;
            padding: 8px 10px;
            background: transparent;
            border: 0;
            cursor: pointer;
            font-family: 'Inter', sans-serif;
            font-size: 11px;
            letter-spacing: 0.12em;
            text-transform: uppercase;
            color: #777;
            font-weight: 600;
            text-align: center;
            transition: color 0.2s ease;
          }
          .mv-checkout-fallback-link:hover { color: #0d0d0d; }
          .mv-checkout-frame-inner {
            flex: 1; overflow-y: auto;
            border-radius: 12px;
          }
          @media (max-width: 640px) {
            .mv-checkout-backdrop { padding: 10px; }
            .mv-checkout-modal { padding: 6px; max-height: calc(100vh - 20px); max-width: 360px; }
          }
          /* Desktop tweaks */
          @media (min-width: 900px) {
            .mv-h-page { padding: 22px 22px 110px; }
            .mv-h-card {
              padding: 80px 72px;
              flex-direction: row;
              align-items: center;
              gap: 48px;
              min-height: 540px;
            }
            .mv-h-card-text { flex: 1; }
            .mv-h-visual { flex: 1; margin-top: 0; padding-top: 0; max-width: 540px; }
            .mv-h-title { font-size: 64px; }
            .mv-h-final { flex-direction: column; }
            .mv-h-hero .mv-h-title { font-size: 72px; max-width: 800px; }
            .mv-h-steps { gap: 22px; }
            .mv-h-network { width: 360px; height: 240px; }
            .mv-h-clock { width: 280px; height: 280px; }
          }
          @media (max-width: 480px) {
            .mv-h-card { padding: 44px 26px; min-height: 0; }
            .mv-h-hero { min-height: 460px; }
            .mv-h-title { font-size: 36px; }
            .mv-h-hero .mv-h-title { font-size: 44px; }
            .mv-h-sub { font-size: 15px; }
            .mv-h-pill { padding: 16px 24px; font-size: 14px; }
            .mv-h-steps { grid-template-columns: 1fr; }
            .mv-h-gallery-card { width: 160px; }
          }
        `}</style>
        <div className="mv-h-page">
          <nav className="mv-h-nav">
            <span className="mv-h-logo">amalvera</span>
            <button className="mv-h-nav-cta" onClick={() => { const el = document.getElementById('mv-h-pricing'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} disabled={isLoading}>
              Get Started
            </button>
          </nav>

          <div className="mv-h-stack">
            {/* Hero */}
            <section className="mv-h-card mv-h-hero mv-h-anim">
              <div className="mv-h-card-text">
                <div className="mv-h-eyebrow">Local business websites · 48 hours</div>
                <h1 className="mv-h-title">Custom websites for <em>local businesses.</em></h1>
                <p className="mv-h-sub">Designed and built in about 48 hours. <strong>From $10/month</strong> — covers hosting and ongoing edits.</p>
                <button className="mv-h-pill" onClick={() => { const el = document.getElementById('mv-h-pricing'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} disabled={isLoading}>
                  See pricing
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                </button>
              </div>
            </section>

            {/* Gallery */}
            <section className="mv-h-card mv-h-gallery mv-h-anim">
              <div className="mv-h-card-text">
                <div className="mv-h-eyebrow">Gallery</div>
                <h2 className="mv-h-title">Real builds. <em>Real local businesses.</em></h2>
                <p className="mv-h-sub">Each one custom. Tap a preview to watch the walkthrough.</p>
              </div>
              <div className="mv-h-visual">
                <div className="mv-h-gallery-wrap">
                  <button
                    type="button"
                    className="mv-h-gallery-arrow mv-h-gallery-arrow-prev"
                    aria-label="Previous"
                    onClick={(e) => {
                      const row = e.currentTarget.parentElement?.querySelector('.mv-h-gallery-row') as HTMLElement | null;
                      row?.scrollBy({ left: -220, behavior: 'smooth' });
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="15 6 9 12 15 18"/></svg>
                  </button>
                  <button
                    type="button"
                    className="mv-h-gallery-arrow mv-h-gallery-arrow-next"
                    aria-label="Next"
                    onClick={(e) => {
                      const row = e.currentTarget.parentElement?.querySelector('.mv-h-gallery-row') as HTMLElement | null;
                      row?.scrollBy({ left: 220, behavior: 'smooth' });
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><polyline points="9 6 15 12 9 18"/></svg>
                  </button>
                <div className="mv-h-gallery-row">
                  {homeVideos.map((item, i) => (
                    <div key={i} className="mv-h-gallery-card">
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
                          'controls-visible-on-load': 'true',
                          'big-play-button': 'true',
                          'silent-auto-play': 'true',
                          'playsinline': 'true',
                          'preload': 'auto',
                          'end-video-behavior': 'loop',
                          'resumable': 'false',
                          'player-color': '0d0d0d',
                        } as any)}
                      ></wistia-player>
                    </div>
                  ))}
                </div>
                </div>
                <PaymentBadgeRow />
              </div>
            </section>

            {/* Trust + Speed + SEO combined */}
            <section className="mv-h-card mv-h-pillars mv-h-anim">
              <div className="mv-h-card-text" style={{ width: '100%' }}>
                <div className="mv-h-eyebrow">What you get</div>
                <h2 className="mv-h-title">Built to <em>help local businesses</em> grow.</h2>
                <div className="mv-h-pillar-grid">
                  <div className="mv-h-pillar">
                    <svg className="mv-h-pillar-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="24" cy="24" r="20" stroke="#0d0d0d" strokeWidth="2"/>
                      <path d="M14 24l7 7 14-15" stroke="#d4914a" strokeWidth="3.5"/>
                    </svg>
                    <div className="mv-h-pillar-h">Trustworthy design</div>
                    <div className="mv-h-pillar-b">A polished site can help customers take your local business seriously before the first call.</div>
                  </div>
                  <div className="mv-h-pillar">
                    <svg className="mv-h-pillar-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="24" cy="24" r="20" stroke="#0d0d0d" strokeWidth="2"/>
                      <path d="M24 13v11l8 5" stroke="#0d8060" strokeWidth="3"/>
                    </svg>
                    <div className="mv-h-pillar-h">Live in ~48 hours</div>
                    <div className="mv-h-pillar-b">Share a bit about your business and we can have it online in about two days.</div>
                  </div>
                  <div className="mv-h-pillar">
                    <svg className="mv-h-pillar-icon" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="24" cy="24" r="6" fill="#1f63ff" stroke="none"/>
                      <circle cx="8" cy="10" r="3" fill="#0d0d0d" stroke="none"/>
                      <circle cx="40" cy="10" r="3" fill="#0d0d0d" stroke="none"/>
                      <circle cx="8" cy="38" r="3" fill="#0d0d0d" stroke="none"/>
                      <circle cx="40" cy="38" r="3" fill="#0d0d0d" stroke="none"/>
                      <line x1="24" y1="24" x2="8" y2="10" stroke="#0d0d0d" strokeWidth="1.5" opacity="0.5"/>
                      <line x1="24" y1="24" x2="40" y2="10" stroke="#0d0d0d" strokeWidth="1.5" opacity="0.5"/>
                      <line x1="24" y1="24" x2="8" y2="38" stroke="#0d0d0d" strokeWidth="1.5" opacity="0.5"/>
                      <line x1="24" y1="24" x2="40" y2="38" stroke="#0d0d0d" strokeWidth="1.5" opacity="0.5"/>
                    </svg>
                    <div className="mv-h-pillar-h">SEO optimized</div>
                    <div className="mv-h-pillar-b">Clean code, schema markup, and fast loading — modern SEO best-practices baked in.</div>
                  </div>
                </div>
              </div>
            </section>

            {/* Pricing */}
            <section id="mv-h-pricing" className="mv-h-card mv-h-pricing mv-h-anim mv-h-pricing-section">
              <div className="mv-h-pricing-head">
                <div className="mv-h-eyebrow">Pricing</div>
                <h2 className="mv-h-title">Pick the site that fits <em>your business.</em></h2>
                <p className="mv-h-sub">$0 design fee either way. Pay monthly — covers hosting and ongoing edits.</p>
              </div>
              <PaymentBadgeRow />
              <div className="mv-h-tier-row">
                <div className="mv-h-tier">
                  <div className="mv-h-tier-eyebrow">Single page</div>
                  <div className="mv-h-tier-price">$10<span>/mo</span></div>
                  <ul className="mv-h-tier-list">
                    <li>One-page custom site</li>
                    <li>Mobile-responsive · SEO basics</li>
                    <li>Live in ~48 hours</li>
                    <li>Hosting + edits included</li>
                  </ul>
                  <button className="mv-h-pill" onClick={() => openPaypal(computePaypalCtx('home', 'single', 'monthly'))} disabled={isLoading}>
                    Start — $10/mo
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </button>
                </div>
                <div className="mv-h-or">or</div>
                <div className="mv-h-tier mv-h-tier-feat">
                  <div className="mv-h-tier-eyebrow">Multi-service</div>
                  <div className="mv-h-tier-price">$20<span>/mo</span></div>
                  <ul className="mv-h-tier-list">
                    <li>Multiple service pages</li>
                    <li>Service-area + city pages</li>
                    <li>Deeper SEO setup</li>
                    <li>Hosting + edits included</li>
                  </ul>
                  <button className="mv-h-pill" onClick={() => openPaypal(computePaypalCtx('home', 'multi', 'monthly'))} disabled={isLoading}>
                    Start — $20/mo
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </button>
                </div>
              </div>
            </section>

            {/* How It Works */}
            <section className="mv-h-card mv-h-how mv-h-anim">
              <div className="mv-h-card-text">
                <div className="mv-h-eyebrow">How it works</div>
                <h2 className="mv-h-title">Three steps to <em>live.</em></h2>
                <p className="mv-h-sub">Sign up. Tell us a bit about your business. Your site can be live in about 48 hours.</p>
              </div>
              <div className="mv-h-visual">
                <div className="mv-h-steps">
                  <div className="mv-h-step"><span className="mv-h-step-num">i.</span><div className="mv-h-step-h">Sign up</div><div className="mv-h-step-b">Quick form. Takes about 60 seconds. The custom design is on us.</div></div>
                  <div className="mv-h-step"><span className="mv-h-step-num">ii.</span><div className="mv-h-step-h">Tell us about your work</div><div className="mv-h-step-b">Your business, service area, photos you want featured.</div></div>
                  <div className="mv-h-step"><span className="mv-h-step-num">iii.</span><div className="mv-h-step-h">We deliver</div><div className="mv-h-step-b">Your site can be live in about 48 hours.</div></div>
                </div>
              </div>
            </section>

            {/* FAQ */}
            <section className="mv-h-card mv-h-faq mv-h-anim">
              <div className="mv-h-card-text" style={{ width: '100%' }}>
                <div className="mv-h-eyebrow">Questions</div>
                <h2 className="mv-h-title">Common <em>questions.</em></h2>
                <div className="mv-h-faq-list">
                  <details className="mv-h-faq-item" open>
                    <summary className="mv-h-faq-summary">What do I get with the website?<span className="mv-h-faq-icon">+</span></summary>
                    <div className="mv-h-faq-a">A custom, professional website for your business — pages, contact forms, mobile-responsive design, and modern SEO best-practices baked in.</div>
                  </details>
                  <details className="mv-h-faq-item">
                    <summary className="mv-h-faq-summary">What's the difference between $10 and $20?<span className="mv-h-faq-icon">+</span></summary>
                    <div className="mv-h-faq-a">$10/mo gets you a single-page custom site — perfect for a focused business with one main offer. $20/mo gets you a multi-service site with separate pages for each service and service area, plus deeper SEO setup.</div>
                  </details>
                  <details className="mv-h-faq-item">
                    <summary className="mv-h-faq-summary">What is the monthly fee for?<span className="mv-h-faq-icon">+</span></summary>
                    <div className="mv-h-faq-a">Hosting — keeping your site live online — plus any edits you need along the way. The design itself is on us.</div>
                  </details>
                  <details className="mv-h-faq-item">
                    <summary className="mv-h-faq-summary">What support do I get?<span className="mv-h-faq-icon">+</span></summary>
                    <div className="mv-h-faq-a">Email or SMS, anytime. Real humans on the other end.</div>
                  </details>
                  <details className="mv-h-faq-item">
                    <summary className="mv-h-faq-summary">How fast is the website delivered?<span className="mv-h-faq-icon">+</span></summary>
                    <div className="mv-h-faq-a">Usually about 48 hours from sign-up to live URL.</div>
                  </details>
                </div>
              </div>
            </section>

            {/* Final CTA */}
            <section className="mv-h-card mv-h-final mv-h-anim">
              <div className="mv-h-eyebrow">Ready when you are</div>
              <h2 className="mv-h-title">Your local business site, live in <em>about 48 hours.</em></h2>
              <p className="mv-h-sub">$0 design fee. From $10/month — covers hosting and edits.</p>
              <button className="mv-h-pill" onClick={() => { const el = document.getElementById('mv-h-pricing'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} disabled={isLoading}>
                See pricing
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </button>
            </section>
          </div>

          <div className="mv-h-footer">
            © {new Date().getFullYear()} Amalvera · Austin, TX
          </div>

          <div className="mv-h-sticky">
            <span className="mv-h-sticky-text">$0 design fee · from $10/mo</span>
            <button className="mv-h-pill" onClick={() => { const el = document.getElementById('mv-h-pricing'); if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' }); }} disabled={isLoading}>
              See pricing
            </button>
          </div>
        </div>

        {/* Embedded checkout modal — same as other regions */}
        {modalOpen && clientSecret && (
          <div className="mv-checkout-backdrop" onClick={closeCheckout} role="dialog" aria-modal="true">
            <div className="mv-checkout-modal" onClick={(e) => e.stopPropagation()}>
              <button className="mv-checkout-close" onClick={closeCheckout} aria-label="Close checkout">✕</button>
              <div className="mv-checkout-frame-inner">
                <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
              <button type="button" className="mv-checkout-fallback-link" onClick={fallbackToHosted}>
                Having trouble? Open checkout directly →
              </button>
            </div>
          </div>
        )}

        <PayPalSubscribeModal
          open={paypalOpen}
          ctx={paypalCtx}
          onClose={() => setPaypalOpen(false)}
        />
      </>
    );
  }

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
        .mv-hero-sub-barber {
          font-family: 'Inter', sans-serif;
          font-style: normal;
          font-weight: 400;
          font-size: 13px;
          letter-spacing: 0.04em;
          color: #c8bca2;
          max-width: 540px;
          margin: 8px auto 14px;
          text-align: center;
        }
        .mv-hero-sub-barber strong { color: #c9a96e; font-weight: 700; }
        .mv-fw-seo-note { margin-top: -4px; font-size: 12px; color: #a89e8a; }

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
        /* /freewebsite — highlighted pay-later callout */
        @keyframes mvFwHighlightGlow {
          0%, 100% { box-shadow: 0 0 0 1px rgba(201,169,110,0.55), 0 0 0 rgba(212,175,55,0); }
          50% { box-shadow: 0 0 0 1px rgba(212,175,55,0.85), 0 0 22px rgba(212,175,55,0.45); }
        }
        .mv-fw-highlight {
          display: inline-block;
          margin: 14px auto 4px;
          padding: 10px 18px;
          background: linear-gradient(180deg, rgba(201,169,110,0.18) 0%, rgba(201,169,110,0.08) 100%);
          border: 1px solid rgba(201,169,110,0.55);
          border-radius: 4px;
          font-family: 'Inter', sans-serif;
          font-size: 14px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          color: #f5e7c4;
          animation: mvFwHighlightGlow 2.6s ease-in-out infinite;
        }
        .mv-fw-highlight strong {
          color: #d4af37;
          font-weight: 800;
          text-shadow: 0 0 10px rgba(212,175,55,0.45);
        }
        @media (max-width: 640px) {
          .mv-fw-highlight { font-size: 12px; padding: 9px 14px; letter-spacing: 0.04em; }
        }

        /* /freewebsite — inline LeadConnector form */
        .mv-fw-form-wrap {
          max-width: 340px;
          margin: 12px auto 14px;
          text-align: center;
        }
        .mv-fw-form-eyebrow {
          font-size: 10px; letter-spacing: 0.45em; text-transform: uppercase;
          color: #c9a96e; font-weight: 500;
          margin-bottom: 10px;
        }
        .mv-fw-form-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 24px;
          line-height: 1.2;
          color: #e8dcc4;
          margin: 0 0 6px;
        }
        .mv-fw-form-sub {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          line-height: 1.55;
          color: #c8bca2;
          margin: 0 auto 14px;
          max-width: 480px;
        }
        .mv-fw-form-frame { padding: 6px; }
        .mv-fw-form-frame iframe { display: block; border-radius: 3px; }
        .mv-sticky-price-free {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 400;
          color: #d4af37;
          font-size: 32px;
          letter-spacing: 0.04em;
          line-height: 1;
          text-shadow: 0 0 18px rgba(212,175,55,0.35);
        }
        @media (max-width: 640px) {
          .mv-fw-form-wrap { margin: 14px auto 18px; }
          .mv-fw-form-title { font-size: 20px; }
          .mv-fw-form-sub { font-size: 11px; }
          .mv-sticky-price-free { font-size: 24px; }
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

        /* /home — feature sections (Why / Grows / Rank) */
        .mv-feature {
          padding: 36px 0 30px;
          text-align: center;
          position: relative;
        }
        .mv-feature::before {
          content: '';
          position: absolute; top: 0; left: 50%;
          transform: translateX(-50%);
          width: 80px; height: 1px;
          background: linear-gradient(90deg, transparent, rgba(201,169,110,0.6), transparent);
        }
        .mv-feature-eyebrow {
          font-family: 'Inter', sans-serif;
          font-size: 10px;
          letter-spacing: 0.45em;
          text-transform: uppercase;
          color: #c9a96e;
          font-weight: 500;
          margin-bottom: 14px;
        }
        .mv-feature-title {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 300;
          font-size: 34px;
          color: #e8dcc4;
          line-height: 1.18;
          margin: 0 auto 12px;
          max-width: 760px;
        }
        .mv-feature-title em { color: #c9a96e; font-style: italic; }
        .mv-feature-sub {
          font-family: 'Inter', sans-serif;
          font-size: 13px;
          line-height: 1.6;
          color: #a89e8a;
          max-width: 620px;
          margin: 0 auto 28px;
          padding: 0 16px;
        }
        .mv-feature-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 18px;
          max-width: 1100px;
          margin: 0 auto;
          padding: 0 18px;
        }
        .mv-feature-card {
          position: relative;
          padding: 22px 18px 20px;
          border: 1px solid rgba(201,169,110,0.22);
          background: linear-gradient(180deg, rgba(201,169,110,0.04) 0%, rgba(201,169,110,0.01) 100%);
          text-align: left;
          transition: border-color 0.4s ease, transform 0.4s ease, background 0.4s ease;
        }
        .mv-feature-card::after {
          content: '';
          position: absolute; inset: 4px;
          border: 1px solid rgba(201,169,110,0.12);
          pointer-events: none;
          transition: border-color 0.4s ease;
        }
        .mv-feature-card:hover {
          border-color: rgba(201,169,110,0.55);
          transform: translateY(-2px);
          background: linear-gradient(180deg, rgba(201,169,110,0.07) 0%, rgba(201,169,110,0.02) 100%);
        }
        .mv-feature-card:hover::after {
          border-color: rgba(201,169,110,0.3);
        }
        .mv-feature-num {
          display: block;
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 28px;
          color: #c9a96e;
          line-height: 1;
          margin-bottom: 8px;
        }
        .mv-feature-stat-num {
          font-family: 'Cormorant Garamond', serif;
          font-style: italic;
          font-weight: 300;
          font-size: 38px;
          color: #d4af37;
          line-height: 1;
          margin-bottom: 10px;
          letter-spacing: -0.01em;
        }
        .mv-feature-h {
          font-family: 'Cormorant Garamond', serif;
          font-weight: 400;
          font-size: 18px;
          color: #e8dcc4;
          line-height: 1.25;
          margin-bottom: 6px;
        }
        .mv-feature-b {
          font-family: 'Inter', sans-serif;
          font-size: 12px;
          line-height: 1.6;
          color: #8a8072;
        }
        .mv-feature-glyph {
          width: 36px; height: 36px;
          color: #c9a96e;
          display: block;
          margin-bottom: 10px;
          transition: color 0.4s ease, transform 0.4s ease;
        }
        .mv-feature-card:hover .mv-feature-glyph {
          color: #d4af37;
          transform: scale(1.06) rotate(-2deg);
        }
        /* fade-in on scroll for /home */
        .mv-anim-fade {
          opacity: 0;
          transform: translateY(18px);
          transition: opacity 0.7s cubic-bezier(0.22, 1, 0.36, 1), transform 0.7s cubic-bezier(0.22, 1, 0.36, 1);
        }
        .mv-anim-fade.is-visible {
          opacity: 1;
          transform: translateY(0);
        }
        @media (max-width: 768px) {
          .mv-feature-grid { grid-template-columns: 1fr; gap: 12px; max-width: 480px; }
          .mv-feature-title { font-size: 26px; padding: 0 18px; }
          .mv-feature-sub { font-size: 12px; }
          .mv-feature { padding: 26px 0 20px; }
          .mv-feature-stat-num { font-size: 32px; }
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
        .mv-portfolio-title-barber { font-size: 29px; margin: 0 0 14px; }
        .mv-barber-row {
          display: flex; justify-content: center; align-items: stretch;
          gap: 14px;
          max-width: 970px;
          margin: 0 auto;
          padding: 0 18px;
          overflow-x: auto;
          scroll-snap-type: x mandatory;
          -webkit-overflow-scrolling: touch;
        }
        .mv-barber-row::-webkit-scrollbar { height: 6px; }
        .mv-barber-row::-webkit-scrollbar-track { background: rgba(201,169,110,0.06); }
        .mv-barber-row::-webkit-scrollbar-thumb { background: rgba(201,169,110,0.35); }
        .mv-barber-col {
          flex: 1 1 0;
          min-width: 252px;
          flex-shrink: 0;
          padding: 6px;
          scroll-snap-align: center;
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
          object-fit: cover; object-position: center;
          background: #0f0e0c;
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
        .mv-checkout-fallback-link {
          display: block;
          margin: 8px auto 4px;
          padding: 6px 10px;
          background: transparent;
          border: 0;
          cursor: pointer;
          font-family: 'Inter', sans-serif;
          font-size: 11px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: #8a8072;
          text-align: center;
          transition: color 0.2s ease;
        }
        .mv-checkout-fallback-link:hover { color: #c9a96e; }
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
          <h1 className={`mv-hero-title ${(region === 'ten' || region === 'five' || region === 'barber' || region === 'localbusiness' || region === 'home' || (region === 'freewebsite' || region === 'freewebsite49' || region === 'barberleads')) ? 'mv-hero-title-ten' : ''}`}>
            {region === 'barberleads' ? (
              <>
                A <em>free custom website design</em> for your barbershop — you only pay if you love it
              </>
            ) : (region === 'freewebsite' || region === 'freewebsite49') ? (
              <>
                A <em>free custom website design</em> for your business — you only pay if you love it
              </>
            ) : (region === 'ten' || region === 'five' || region === 'barber' || region === 'localbusiness' || region === 'home') ? (
              <>
                A custom website for {cfg.heroTaglineRegion} that can help you <em>book more {cfg.bookMoreNoun}</em>
              </>
            ) : region === 'nineteen' ? (
              <>
                <em>Custom website design</em> that helps local businesses win more jobs.
              </>
            ) : (
              <>
                A website that can help<br />
                <em>{cfg.heroTaglineRegion}</em> win more jobs.
              </>
            )}
          </h1>
          {(region !== 'ten' && region !== 'five' && region !== 'barber' && region !== 'localbusiness' && region !== 'home' && (region !== 'freewebsite' && region !== 'freewebsite49' && region !== 'barberleads')) && (
            <p className="mv-hero-sub">
              We build websites for home service pros. You tell us about your business. We do the rest. Ready in 48 hours.
            </p>
          )}
          {region === 'barber' && (
            <p className="mv-hero-sub mv-hero-sub-barber">
              <strong>$0 design fee</strong> — $10/mo only covers hosting. No catch — we're earning your trust.
            </p>
          )}
          {region === 'home' && (
            <p className="mv-hero-sub mv-hero-sub-barber">
              <strong>$0 design fee</strong> — from $10/month covers hosting. Premium custom design, built and ready in 48 hours.
            </p>
          )}
          {(region === 'freewebsite' || region === 'freewebsite49' || region === 'barberleads') && (
            <div className="mv-fw-highlight">
              <strong>We design your site first — if you love it, you just cover a small monthly hosting fee. That's it.</strong>
            </div>
          )}

          {/* Video — centered (hidden on /10) */}
          {(region !== 'ten' && region !== 'five' && region !== 'barber' && region !== 'localbusiness' && region !== 'home' && (region !== 'freewebsite' && region !== 'freewebsite49' && region !== 'barberleads')) && (
            <div className="mv-hero-video">
              <div className="mv-video-hint">Tap to Unmute</div>
              <div className="mv-frame">
                <div style={{ position: 'relative', zIndex: 1 }}>
                  <wistia-player media-id="p4uzw25p63" aspect="0.5625" autoplay="true" muted="false"></wistia-player>
                </div>
              </div>
            </div>
          )}

          {/* LeadConnector form — /freewebsite only */}
          {(region === 'freewebsite' || region === 'freewebsite49' || region === 'barberleads') && (
            <div id="fw-form" className="mv-fw-form-wrap">
              <div className="mv-fw-form-eyebrow">◊ Get Started — Free ◊</div>
              <h2 className="mv-fw-form-title">{region === 'barberleads' ? 'Tell us about your barbershop' : 'Tell us about your business'}</h2>
              <p className="mv-fw-form-sub">
                We'll design + build your {region === 'barberleads' ? 'barbershop' : ''} site for free. Only pay if you love it.
              </p>
              <div className="mv-frame mv-fw-form-frame">
                {region === 'freewebsite49' ? (
                  <iframe
                    src="https://api.leadconnectorhq.com/widget/form/iriuVtHlYuVYj23aIUy2"
                    style={{ width: '100%', height: 360, border: 'none', borderRadius: 3, display: 'block', background: '#fff' }}
                    id="inline-iriuVtHlYuVYj23aIUy2"
                    data-layout='{"id":"INLINE"}'
                    data-trigger-type="alwaysShow"
                    data-trigger-value=""
                    data-activation-type="alwaysActivated"
                    data-activation-value=""
                    data-deactivation-type="neverDeactivate"
                    data-deactivation-value=""
                    data-form-name="Contractors - $49"
                    data-height="360"
                    data-layout-iframe-id="inline-iriuVtHlYuVYj23aIUy2"
                    data-form-id="iriuVtHlYuVYj23aIUy2"
                    title="Contractors - $49"
                  />
                ) : region === 'barberleads' ? (
                  <iframe
                    src="https://api.leadconnectorhq.com/widget/form/eWkkKWwoxGJK2CvpWUxX"
                    style={{ width: '100%', height: 420, border: 'none', borderRadius: 3, display: 'block', background: '#fff' }}
                    id="inline-eWkkKWwoxGJK2CvpWUxX"
                    data-layout='{"id":"INLINE"}'
                    data-trigger-type="alwaysShow"
                    data-trigger-value=""
                    data-activation-type="alwaysActivated"
                    data-activation-value=""
                    data-deactivation-type="neverDeactivate"
                    data-deactivation-value=""
                    data-form-name="Barber - $20"
                    data-height="420"
                    data-layout-iframe-id="inline-eWkkKWwoxGJK2CvpWUxX"
                    data-form-id="eWkkKWwoxGJK2CvpWUxX"
                    title="Barber - $20"
                  />
                ) : (
                  <iframe
                    src="https://api.leadconnectorhq.com/widget/form/LRbgZwbTGaM6WyesqAjV"
                    style={{ width: '100%', height: 360, border: 'none', borderRadius: 3, display: 'block', background: '#fff' }}
                    id="inline-LRbgZwbTGaM6WyesqAjV"
                    data-layout='{"id":"INLINE"}'
                    data-trigger-type="alwaysShow"
                    data-trigger-value=""
                    data-activation-type="alwaysActivated"
                    data-activation-value=""
                    data-deactivation-type="neverDeactivate"
                    data-deactivation-value=""
                    data-form-name="Contractors"
                    data-height="360"
                    data-layout-iframe-id="inline-LRbgZwbTGaM6WyesqAjV"
                    data-form-id="LRbgZwbTGaM6WyesqAjV"
                    title="Contractors"
                  />
                )}
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
                      'playsinline': 'true',
                      'preload': 'auto',
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
          {(region === 'ten' || region === 'five' || region === 'barber' || region === 'localbusiness' || region === 'home' || (region === 'freewebsite' || region === 'freewebsite49' || region === 'barberleads')) && <PortfolioSection />}

          {/* Payment trust badges — PayPal + major card brands */}
          {supportsPayPal(region) && region !== 'home' && region !== 'five' && (
            <section className="mv-shell" style={{ marginTop: 0, marginBottom: 0 }}>
              <PaymentBadgeRow />
            </section>
          )}

          {/* /home — Why a Website */}
          {region === 'home' && (
            <section className="mv-shell mv-feature mv-feature-why">
              <div className="mv-feature-eyebrow mv-anim-fade">◊ Why a Website ◊</div>
              <h2 className="mv-feature-title mv-anim-fade">
                Every business needs <em>a presence online.</em>
              </h2>
              <p className="mv-feature-sub mv-anim-fade">
                Without one, you're invisible to most customers. With one, you're trusted, discoverable, and open 24 hours a day.
              </p>
              <div className="mv-feature-grid">
                <div className="mv-feature-card mv-anim-fade">
                  <span className="mv-feature-num">I.</span>
                  <div className="mv-feature-h">Trust you instantly</div>
                  <div className="mv-feature-b">A polished website tells every prospect you're a real, professional business — before they even contact you.</div>
                </div>
                <div className="mv-feature-card mv-anim-fade">
                  <span className="mv-feature-num">II.</span>
                  <div className="mv-feature-h">Open 24 hours a day</div>
                  <div className="mv-feature-b">Customers find you, learn about you, and book you at 2am. Your storefront stays live while you sleep.</div>
                </div>
                <div className="mv-feature-card mv-anim-fade">
                  <span className="mv-feature-num">III.</span>
                  <div className="mv-feature-h">Convert visitors</div>
                  <div className="mv-feature-b">Built-in lead forms and chat widgets turn passive visitors into paying customers — every visit becomes an opportunity.</div>
                </div>
              </div>
            </section>
          )}

          {/* How It Works — horizontal 3-up (hidden on /freewebsite) */}
          {(region !== 'freewebsite' && region !== 'freewebsite49' && region !== 'barberleads') && (
          <div className="mv-how">
            <div className="mv-how-eyebrow">◊ How It Works ◊</div>
            <div className={`mv-how-row ${(region === 'ten' || region === 'five') ? 'mv-how-row-two' : ''}`}>
              {(region === 'barber'
                ? [
                    { title: 'Sign Up', body: 'Sign up for the hosting plan — the custom design is on us.' },
                    { title: 'Tell Us About Your Shop', body: 'Share a bit about your barbershop, your style, and any photos you want featured.' },
                    { title: 'We Deliver', body: 'Your site is ready in about 48 hours.' },
                  ]
                : region === 'home'
                ? [
                    { title: 'Sign Up', body: 'Sign up for the hosting plan — the custom design is on us.' },
                    { title: 'Tell Us About Your Business', body: 'Share what you do, your style, and any photos you want featured.' },
                    { title: 'We Deliver', body: 'Your site is ready in about 48 hours.' },
                  ]
                : region === 'localbusiness'
                ? [
                    { title: 'Sign Up', body: 'Sign up for the hosting plan — the custom design is on us.' },
                    { title: 'Tell Us About Your Business', body: 'Share what you do, your style, and any photos you want featured.' },
                    { title: 'We Deliver', body: 'Your site is ready in about 48 hours.' },
                  ]
                : (region === 'freewebsite' || region === 'freewebsite49' || region === 'barberleads')
                ? [
                    { title: 'Tell Us About Your Business', body: 'Share what you do, your style, and any photos you want featured.' },
                    { title: 'We Design + Build It Free', body: 'Your custom site is ready in about 48 hours — at no upfront cost.' },
                    { title: 'Pay Only If You Love It', body: `${cfg.currencySymbol}${cfg.monthlyAmount}/month after delivery. If you don’t love it, you owe nothing.` },
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
          )}

          {/* What You Get — horizontal (hidden on /10) */}
          {(region !== 'ten' && region !== 'five' && region !== 'barber' && region !== 'localbusiness' && region !== 'home' && (region !== 'freewebsite' && region !== 'freewebsite49' && region !== 'barberleads')) && (
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
        {(region !== 'ten' && region !== 'five' && region !== 'barber' && region !== 'localbusiness' && region !== 'home' && (region !== 'freewebsite' && region !== 'freewebsite49' && region !== 'barberleads')) && (
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
                      'playsinline': 'true',
                      'preload': 'auto',
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
        {(region !== 'ten' && region !== 'five' && region !== 'barber' && region !== 'localbusiness' && region !== 'home' && (region !== 'freewebsite' && region !== 'freewebsite49' && region !== 'barberleads')) && (
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
                      'playsinline': 'true',
                      'preload': 'auto',
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

        {/* /home — Grows Your Business */}
        {region === 'home' && (
          <section className="mv-shell mv-feature mv-feature-grow">
            <div className="mv-feature-eyebrow mv-anim-fade">◊ Grows Your Business ◊</div>
            <h2 className="mv-feature-title mv-anim-fade">
              More <em>leads.</em> Better <em>margins.</em>
            </h2>
            <p className="mv-feature-sub mv-anim-fade">
              Businesses with a polished, well-built website book more appointments, charge more for their services, and capture leads while they're off the clock.
            </p>
            <div className="mv-feature-grid">
              <div className="mv-feature-card mv-anim-fade mv-feature-stat">
                <div className="mv-feature-stat-num">+185%</div>
                <div className="mv-feature-h">More inbound leads</div>
                <div className="mv-feature-b">that businesses see when they invest in a polished online presence versus relying on word-of-mouth alone.</div>
              </div>
              <div className="mv-feature-card mv-anim-fade mv-feature-stat">
                <div className="mv-feature-stat-num">3.2×</div>
                <div className="mv-feature-h">Higher pricing power</div>
                <div className="mv-feature-b">customers pay more to a business with a polished, modern online presence.</div>
              </div>
              <div className="mv-feature-card mv-anim-fade mv-feature-stat">
                <div className="mv-feature-stat-num">24/7</div>
                <div className="mv-feature-h">Bookings while you sleep</div>
                <div className="mv-feature-b">every form submission lands in your inbox and your phone — found waiting for you the next morning.</div>
              </div>
            </div>
          </section>
        )}

        {/* /home — Engineered for discoverability */}
        {region === 'home' && (
          <section className="mv-shell mv-feature mv-feature-rank">
            <div className="mv-feature-eyebrow mv-anim-fade">◊ Built to Be Found ◊</div>
            <h2 className="mv-feature-title mv-anim-fade">
              Engineered for <em>discoverability.</em>
            </h2>
            <p className="mv-feature-sub mv-anim-fade">
              Every site we ship is fast, semantic, schema-marked, and structured with modern SEO best-practices — so search engines understand exactly what you do and where you serve.
            </p>
            <div className="mv-feature-grid">
              <div className="mv-feature-card mv-anim-fade">
                <svg className="mv-feature-glyph" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="24" cy="24" r="18"/>
                  <path d="M6 24h36M24 6c5 6 5 30 0 36M24 6c-5 6-5 30 0 36"/>
                </svg>
                <div className="mv-feature-h">SEO foundation</div>
                <div className="mv-feature-b">Clean semantic HTML, perfect Lighthouse scores, fast loading. Google's algorithm rewards every one of these.</div>
              </div>
              <div className="mv-feature-card mv-anim-fade">
                <svg className="mv-feature-glyph" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <circle cx="10" cy="10" r="3"/>
                  <circle cx="38" cy="10" r="3"/>
                  <circle cx="24" cy="38" r="3"/>
                  <circle cx="24" cy="24" r="3"/>
                  <path d="M10 10L24 24M38 10L24 24M24 38L24 24"/>
                </svg>
                <div className="mv-feature-h">Interlinked pages</div>
                <div className="mv-feature-b">Add service pages or area pages — we interlink them so Google sees authority and ranks you for more searches.</div>
              </div>
              <div className="mv-feature-card mv-anim-fade">
                <svg className="mv-feature-glyph" viewBox="0 0 48 48" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M24 4c-7 0-13 6-13 13 0 9 13 27 13 27s13-18 13-27c0-7-6-13-13-13z"/>
                  <circle cx="24" cy="17" r="5"/>
                </svg>
                <div className="mv-feature-h">Local schema</div>
                <div className="mv-feature-b">JSON-LD markup tells Google your business name, hours, services, areas. You appear in Maps and local "near me" results.</div>
              </div>
            </div>
          </section>
        )}

        {/* Crest — FAQ (hidden on /freewebsite) */}
        {(region !== 'freewebsite' && region !== 'freewebsite49' && region !== 'barberleads') && (
        <div className="mv-shell">
          <div className="mv-crest">
            <span className="mv-crest-line" />
            <span>◊ Step 4 ◊ Questions</span>
            <span className="mv-crest-line" />
          </div>
        </div>
        )}

        {/* FAQ (hidden on /freewebsite) */}
        {(region !== 'freewebsite' && region !== 'freewebsite49' && region !== 'barberleads') && (
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
            ] : region === 'home' ? [
              {
                q: 'What do I get with the website?',
                a: `A custom, professional website built for your ${cfg.businessNoun}.`,
              },
              {
                q: 'What is the $20/month for?',
                a: `The $20/month covers website hosting so your site stays live online. We don't charge for the design. If you need any kind of edits on the website, just let us know and we can make the changes to your site.`,
              },
              {
                q: 'What support do I get?',
                a: 'You can contact us by email or SMS if you need help.',
              },
              {
                q: 'How long does it take to get access to the website?',
                a: 'You get access to the website in about 48 hours.',
              },
            ] : region === 'localbusiness' ? [
              {
                q: 'What do I get with the website?',
                a: `A custom, professional website built for your ${cfg.businessNoun}.`,
              },
              {
                q: 'What is the $20/month for?',
                a: `The $20/month covers website hosting so your site stays live online. We don't charge for the design. If you need any kind of edits on the website, just let us know and we can make the changes to your site.`,
              },
              {
                q: 'What support do I get?',
                a: 'You can contact us by email or SMS if you need help.',
              },
              {
                q: 'How long does it take to get access to the website?',
                a: 'You get access to the website in about 48 hours.',
              },
            ] : (region === 'freewebsite' || region === 'freewebsite49' || region === 'barberleads') ? [
              {
                q: "What's the catch?",
                a: "There isn't one. We design and build your custom website for free. You only pay if you love it — no upfront cost, no obligation.",
              },
              {
                q: 'When do I pay?',
                a: `Only after we deliver your site, and only if you decide to keep it. The ${cfg.currencySymbol}${cfg.monthlyAmount}/month covers hosting and ongoing edits.`,
              },
              {
                q: "What if I don't like it?",
                a: 'You owe nothing. Walk away — no charge, no hassle.',
              },
              {
                q: 'How long does it take?',
                a: 'Your custom website is usually ready in about 48 hours after you submit the form.',
              },
              {
                q: 'What support do I get?',
                a: 'You can contact us anytime by email or phone if you need help or want edits to your site.',
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
        )}

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
      {(region === 'freewebsite' || region === 'freewebsite49' || region === 'barberleads') ? null : (
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
      )}

      {/* Embedded checkout modal */}
      {(region !== 'freewebsite' && region !== 'freewebsite49' && region !== 'barberleads') && modalOpen && clientSecret && (
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
            <button
              type="button"
              className="mv-checkout-fallback-link"
              onClick={fallbackToHosted}
            >
              Having trouble? Open checkout directly →
            </button>
          </div>
        </div>
      )}

      <PayPalSubscribeModal
        open={paypalOpen}
        ctx={paypalCtx}
        onClose={() => setPaypalOpen(false)}
      />
    </>
  );
};

export default DirectoryPage;
