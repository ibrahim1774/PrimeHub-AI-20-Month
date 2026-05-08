import React, { useState, useCallback, useEffect, useRef } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const SAMPLE_URL = 'https://dist-black-nine-17.vercel.app/';

type Tier = 'single' | 'multi';
type Plan = 'monthly' | 'yearly';

const PRICING: Record<Tier, Record<Plan, { display: string; sub: string }>> = {
  single: {
    monthly: { display: '$5',  sub: '/month' },
    yearly:  { display: '$36', sub: '/year · save $24' },
  },
  multi: {
    monthly: { display: '$10', sub: '/month' },
    yearly:  { display: '$72', sub: '/year · save $48' },
  },
};

const BENEFITS = [
  { title: 'Fully custom',              desc: 'Your branding, photos, logo, booking link — not a template.' },
  { title: 'We maintain it',            desc: 'Need a change? Email us. We handle it.' },
  { title: 'Delivered within 24 hours', desc: 'From your info to a live site in a single day.' },
];

const STEPS = [
  { n: '01', title: 'Choose your plan',            desc: 'Single page or multi-page.' },
  { n: '02', title: 'Tell us about your business', desc: 'Send your Google Business profile or Facebook page.' },
  { n: '03', title: 'We deliver',                  desc: 'Your site is built and delivered within 24 hours.' },
];

const BarberSamplePage: React.FC = () => {
  const [plan, setPlan] = useState<Plan>('monthly');
  const [collapsedMobile, setCollapsedMobile] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [introVisible, setIntroVisible] = useState(true);

  const startCheckout = useCallback(async (tier: Tier) => {
    setLoading(true);
    setError(null);

    // Fire Meta Pixel InitiateCheckout (browser-side, dedups w/ CAPI on session id later)
    if (typeof window !== 'undefined' && (window as any).fbq) {
      const monthlyValue = tier === 'multi' ? 10 : 5;
      const yearlyValue  = tier === 'multi' ? 72 : 36;
      const value = plan === 'yearly' ? yearlyValue : monthlyValue;
      const eventID = `ic_barberSample_${tier}_${plan}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
      (window as any).fbq('track', 'InitiateCheckout', {
        value,
        currency: 'USD',
        content_name: tier === 'multi' ? 'Multi-Page + SEO' : 'Single Page',
        content_category: 'subscription',
      }, { eventID });
    }

    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, source: 'barberSample', tier, embedded: true }),
      });
      const data = await res.json();
      if (!res.ok || !data.clientSecret) throw new Error(data?.error || 'Checkout failed to start');
      setClientSecret(data.clientSecret);
      setCheckoutOpen(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [plan]);

  const closeCheckout = () => { setCheckoutOpen(false); setClientSecret(null); };

  // Stripe-modal scroll-hint chip
  const overlayRef = useRef<HTMLDivElement | null>(null);
  const [scrollHintVisible, setScrollHintVisible] = useState(false);

  // When the Stripe modal opens, watch overlay scroll. Show the chip
  // only when there's content below the fold; hide it once the user
  // has scrolled past ~80% so they aren't prompted at the bottom.
  useEffect(() => {
    if (!checkoutOpen) { setScrollHintVisible(false); return; }
    const el = overlayRef.current;
    if (!el) return;
    const update = () => {
      const canScroll = el.scrollHeight - el.clientHeight > 24;
      const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
      const past80 = el.scrollTop / Math.max(1, el.scrollHeight - el.clientHeight) > 0.8;
      setScrollHintVisible(canScroll && !atBottom && !past80);
    };
    // Stripe checkout takes a beat to render its full height; poll a few times
    const ids = [setTimeout(update, 50), setTimeout(update, 400), setTimeout(update, 1200)];
    el.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    return () => {
      ids.forEach(clearTimeout);
      el.removeEventListener('scroll', update);
      window.removeEventListener('resize', update);
    };
  }, [checkoutOpen]);

  const scrollOverlayDown = () => {
    const el = overlayRef.current;
    if (!el) return;
    el.scrollTo({ top: el.scrollHeight, behavior: 'smooth' });
  };

  // Intro banner: auto-dismiss after 5s OR as soon as the iframe takes
  // focus (cross-origin iframe scroll/click steals window focus on the
  // parent — that's our 'visitor engaged' signal).
  useEffect(() => {
    if (!introVisible) return;
    const dismiss = () => setIntroVisible(false);
    const timeoutId = window.setTimeout(dismiss, 10000);
    window.addEventListener('blur', dismiss);
    return () => {
      window.clearTimeout(timeoutId);
      window.removeEventListener('blur', dismiss);
    };
  }, [introVisible]);

  // Lock body scroll + close-on-Escape while the mobile pricing modal is open
  useEffect(() => {
    const isMobileModalOpen = !collapsedMobile;
    if (!isMobileModalOpen && !checkoutOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (checkoutOpen) closeCheckout();
      else if (isMobileModalOpen) setCollapsedMobile(true);
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [collapsedMobile, checkoutOpen]);

  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');

/* The iframe fills the viewport and scrolls natively (its own scroll
   context). The sandbox attribute on <iframe> prevents the sample from
   escaping to the parent, opening popups, or submitting forms. */
.bsp-page { position: relative; width: 100vw; height: 100vh; background: #0a0907; font-family: 'DM Sans', system-ui, sans-serif; overflow: hidden; }
/* Visually compress the embedded sample by ~12% (87.5% scale).
   transform-origin top-left + 1/scale on width/height keeps the
   scaled iframe filling the viewport exactly. */
.bsp-iframe {
  position: absolute;
  top: 0; left: 0;
  width: 114.29%;       /* 100% / 0.875 */
  height: 114.29%;
  border: 0;
  background: #000;
  transform: scale(0.875);
  transform-origin: top left;
}
@media (min-width: 1100px) {
  .bsp-iframe { width: 117.65%; height: 117.65%; transform: scale(0.85); }
}
.bsp-iframe-vignette { position: absolute; top: 0; bottom: 0; right: 0; width: 460px; pointer-events: none; background: linear-gradient(270deg, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.30) 50%, rgba(0,0,0,0) 100%); z-index: 2; }
@media (max-width: 720px) { .bsp-iframe-vignette { display: none; } }

/* DESKTOP STICKY CARD — premium dark + warm gold */
.bsp-mobile-header { display: none; }
.bsp-card-body { display: contents; }
.bsp-card { position: fixed; top: 50%; right: 20px; transform: translateY(-50%); width: 380px; max-height: calc(100vh - 40px); overflow-y: auto; background: radial-gradient(120% 120% at 0% 0%, #14110b 0%, #0a0907 60%, #050403 100%); border: 1px solid rgba(212,166,74,0.18); border-radius: 16px; padding: 26px 30px 22px; color: #e9e1cf; z-index: 9990; box-shadow: 0 40px 90px rgba(0,0,0,0.65), 0 0 0 1px rgba(212,166,74,0.05), inset 0 1px 0 rgba(255,255,255,0.04); animation: bspIn 0.55s cubic-bezier(0.16,1,0.3,1) forwards; scrollbar-width: thin; scrollbar-color: rgba(212,166,74,0.25) transparent; font-family: 'DM Sans', sans-serif; }
.bsp-card::-webkit-scrollbar { width: 5px; }
.bsp-card::-webkit-scrollbar-thumb { background: rgba(212,166,74,0.22); border-radius: 3px; }
@keyframes bspIn { from { opacity: 0; transform: translateY(-50%) translateX(16px); } to { opacity: 1; transform: translateY(-50%) translateX(0); } }

/* Refined gold ribbon — replaces the SaaS green pulsing badge */
.bsp-badge { display: flex; align-items: center; gap: 10px; color: #d4a64a; font-family: 'DM Sans', sans-serif; font-size: 9.5px; font-weight: 600; letter-spacing: 0.22em; text-transform: uppercase; margin: 0 0 14px; }
.bsp-badge::before, .bsp-badge::after { content: ''; flex: 1; height: 1px; background: linear-gradient(to right, transparent, rgba(212,166,74,0.45), transparent); }
.bsp-badge-dot { display: none; }

.bsp-title { font-family: 'Cormorant Garamond', 'Instrument Serif', serif; font-weight: 500; font-size: 19px; line-height: 1.18; letter-spacing: -0.005em; color: #f5ecd7; margin: 0 0 8px; }
.bsp-title em { color: #d4a64a; font-style: italic; font-weight: 500; }
.bsp-sub { font-family: 'DM Sans', sans-serif; font-size: 11.5px; line-height: 1.5; color: #a39880; margin: 0 0 10px; }
.bsp-rule { height: 1px; background: linear-gradient(to right, transparent, rgba(212,166,74,0.30), transparent); margin: 12px 0; }

/* List blocks — refined typography on dark, no boxy containers */
.bsp-list-eyebrow { font-family: 'DM Sans', sans-serif; font-size: 9px; font-weight: 700; color: #d4a64a; letter-spacing: 0.22em; text-transform: uppercase; margin: 0 0 9px; }
.bsp-list { display: flex; flex-direction: column; gap: 9px; margin: 0 0 4px; padding: 0; list-style: none; }
.bsp-list li { display: flex; gap: 11px; align-items: flex-start; line-height: 1.4; }
.bsp-bullet-rule { flex-shrink: 0; width: 16px; height: 1px; background: #d4a64a; opacity: 0.85; margin-top: 7px; }
.bsp-bullet-num { flex-shrink: 0; font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 500; font-size: 16px; color: #d4a64a; line-height: 1; min-width: 22px; padding-top: 1px; }
.bsp-bullet-body strong { display: block; font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; color: #f5ecd7; margin-bottom: 1px; letter-spacing: 0.005em; }
.bsp-bullet-body span { display: block; font-family: 'DM Sans', sans-serif; font-size: 10px; color: #a39880; line-height: 1.45; }

/* PLAN TOGGLE — refined underlined pair */
.bsp-toggle { display: inline-flex; gap: 0; margin-bottom: 12px; border-bottom: 1px solid rgba(212,166,74,0.18); align-self: flex-start; }
.bsp-toggle button { padding: 8px 14px; background: transparent; border: none; color: #847b66; font-family: 'DM Sans', sans-serif; font-size: 10px; font-weight: 600; cursor: pointer; transition: color 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 8px; letter-spacing: 0.16em; text-transform: uppercase; position: relative; }
.bsp-toggle button.active { color: #d4a64a; }
.bsp-toggle button.active::after { content: ''; position: absolute; left: 12%; right: 12%; bottom: -1px; height: 1px; background: #d4a64a; }
.bsp-save { background: transparent; color: #d4a64a; font-size: 9px; font-weight: 700; border: 1px solid rgba(212,166,74,0.45); padding: 2px 7px; border-radius: 999px; letter-spacing: 0.10em; text-transform: uppercase; }

/* TIER ROWS — premium serif name + italic gold price */
.bsp-tiers { display: flex; flex-direction: column; gap: 10px; }
.bsp-tier { background: linear-gradient(180deg, rgba(255,255,255,0.025), rgba(255,255,255,0.01)); border: 1px solid rgba(212,166,74,0.16); border-radius: 12px; padding: 13px 15px; text-align: left; color: #e9e1cf; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.25s ease; display: flex; align-items: center; justify-content: space-between; gap: 12px; width: 100%; }
.bsp-tier:hover:not(:disabled) { border-color: rgba(212,166,74,0.45); background: linear-gradient(180deg, rgba(212,166,74,0.06), rgba(212,166,74,0.015)); transform: translateY(-1px); }
.bsp-tier:disabled { opacity: 0.55; cursor: not-allowed; }
.bsp-tier-multi { background: linear-gradient(180deg, rgba(212,166,74,0.10), rgba(212,166,74,0.03)); border-color: rgba(212,166,74,0.40); box-shadow: 0 8px 24px rgba(212,166,74,0.10); }
.bsp-tier-multi:hover:not(:disabled) { background: linear-gradient(180deg, rgba(212,166,74,0.16), rgba(212,166,74,0.05)); }
.bsp-tier-left { display: flex; flex-direction: column; gap: 3px; }
.bsp-tier-name { font-family: 'Cormorant Garamond', serif; font-weight: 500; font-size: 14px; color: #f5ecd7; letter-spacing: 0; }
.bsp-tier-desc { font-family: 'DM Sans', sans-serif; font-size: 10px; color: #a39880; line-height: 1.4; }
.bsp-tier-right { display: flex; flex-direction: column; align-items: flex-end; gap: 0; flex-shrink: 0; }
.bsp-tier-price { font-family: 'Cormorant Garamond', serif; font-style: italic; font-weight: 500; font-size: 20px; color: #d4a64a; line-height: 1; }
.bsp-tier-per { font-family: 'DM Sans', sans-serif; font-size: 9.5px; color: #847b66; letter-spacing: 0.04em; margin-top: 3px; }
.bsp-tier-wrap { position: relative; }
.bsp-recommended { position: absolute; top: -7px; right: 14px; background: #d4a64a; color: #0a0907; font-family: 'DM Sans', sans-serif; font-size: 8.5px; font-weight: 700; padding: 3px 9px; border-radius: 999px; letter-spacing: 0.18em; text-transform: uppercase; z-index: 1; }

.bsp-foot { margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(212,166,74,0.14); display: flex; flex-direction: column; gap: 5px; }
.bsp-foot-row { font-family: 'DM Sans', sans-serif; font-size: 10.5px; color: #847b66; display: flex; align-items: center; gap: 7px; line-height: 1.4; letter-spacing: 0.02em; }
.bsp-foot-row svg { flex-shrink: 0; color: #d4a64a; }

.bsp-error { margin-top: 10px; padding: 9px 12px; background: rgba(239,68,68,0.10); border: 1px solid rgba(239,68,68,0.30); border-radius: 8px; color: #fca5a5; font-size: 11.5px; }

/* MOBILE BOTTOM BAR — premium dark + gold */
.bsp-mobile-bar { display: none; position: fixed; bottom: 16px; left: 14px; right: 14px; background: radial-gradient(120% 120% at 0% 0%, #14110b 0%, #0a0907 70%); border: 1px solid rgba(212,166,74,0.32); border-radius: 18px; padding: 18px 20px; color: #e9e1cf; z-index: 9990; box-shadow: 0 28px 64px rgba(0,0,0,0.65), inset 0 1px 0 rgba(255,255,255,0.04); flex-direction: column; gap: 14px; font-family: 'DM Sans', sans-serif; }

.bsp-mobile-top { display: flex; align-items: center; gap: 10px; }
.bsp-mobile-pulse { display: none; }
.bsp-mobile-eyebrow { font-family: 'DM Sans', sans-serif; font-size: 11px; font-weight: 600; color: #d4a64a; letter-spacing: 0.22em; text-transform: uppercase; flex: 1; display: flex; align-items: center; gap: 10px; }
.bsp-mobile-eyebrow::after { content: ''; flex: 1; height: 1px; background: linear-gradient(to right, rgba(212,166,74,0.45), transparent); }

.bsp-mobile-bar-text { font-family: 'Cormorant Garamond', serif; font-weight: 500; font-size: 23px; line-height: 1.18; color: #f5ecd7; letter-spacing: -0.005em; }
.bsp-mobile-bar-text strong { font-weight: 500; color: #f5ecd7; }
.bsp-mobile-bar-text em { color: #d4a64a; font-style: italic; font-weight: 500; }

.bsp-mobile-bullets { display: none; }

.bsp-mobile-bar-btn { background: transparent; color: #d4a64a; border: 1px solid #d4a64a; padding: 14px 20px; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; border-radius: 999px; cursor: pointer; letter-spacing: 0.18em; text-transform: uppercase; width: 100%; transition: background 0.2s, color 0.2s; }
.bsp-mobile-bar-btn:hover, .bsp-mobile-bar-btn:active { background: #d4a64a; color: #0a0907; }

/* INTRO BANNER — wayfinding moment shown for the first ~5s before
   the sticky CTA is revealed. Same premium dark + gold treatment. */
.bsp-intro {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 9989;
  width: calc(100vw - 48px);
  max-width: 340px;
  padding: 16px 20px 14px;
  text-align: center;
  background: radial-gradient(120% 120% at 0% 0%, #14110b 0%, #0a0907 60%, #050403 100%);
  border: 1px solid rgba(212,166,74,0.30);
  border-radius: 14px;
  color: #e9e1cf;
  cursor: pointer;
  box-shadow: 0 30px 70px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,166,74,0.06);
  font-family: 'DM Sans', sans-serif;
  animation: bspIntroIn 0.4s cubic-bezier(0.16,1,0.3,1) forwards;
  /* iOS: kill the 300ms tap-delay + tap-highlight so the touch event
     completes immediately and the iframe behind starts receiving
     touches on the very next swipe. */
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  -webkit-user-select: none;
  user-select: none;
}
.bsp-intro-eyebrow { font-size: 9px; font-weight: 600; color: #d4a64a; letter-spacing: 0.20em; text-transform: uppercase; margin: 0 0 7px; }
.bsp-intro-title { font-family: 'Cormorant Garamond', serif; font-weight: 500; font-size: 17px; line-height: 1.2; color: #f5ecd7; margin: 0 0 10px; }
.bsp-intro-title em { color: #d4a64a; font-style: italic; font-weight: 500; }
.bsp-intro-chev { width: 24px; height: 24px; margin: 0 auto; border-radius: 999px; border: 1px solid rgba(212,166,74,0.45); display: flex; align-items: center; justify-content: center; color: #d4a64a; animation: bspIntroBounce 1.6s ease-in-out infinite; }
.bsp-intro-chev svg { width: 12px; height: 12px; }
@keyframes bspIntroIn { from { opacity: 0; transform: translate(-50%, calc(-50% + 12px)); } to { opacity: 1; transform: translate(-50%, -50%); } }
@keyframes bspIntroBounce { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(4px); } }

/* While the intro is visible, hold back the sticky CTA so visitors
   focus on the wayfinding moment first. */
.bsp-page.has-intro .bsp-card,
.bsp-page.has-intro .bsp-mobile-bar { display: none !important; }

@media (max-width: 720px) {
  .bsp-card { display: none; }

  /* Mobile expanded = centered modal with its own backdrop */
  .bsp-card-backdrop {
    display: none;
    position: fixed; inset: 0;
    background: rgba(0,0,0,0.78);
    -webkit-backdrop-filter: blur(6px);
    backdrop-filter: blur(6px);
    z-index: 9989;
    animation: bspFade 0.22s ease forwards;
  }
  .bsp-card-backdrop.is-open { display: block; }

  .bsp-card.expanded {
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 50%;
    left: 50%;
    right: auto;
    bottom: auto;
    transform: translate(-50%, -50%);
    width: calc(100vw - 24px);
    max-width: 420px;
    height: auto;
    max-height: min(86dvh, 86vh);
    border-radius: 18px;
    border: 1px solid rgba(212,166,74,0.25);
    padding: 0;
    overflow: hidden;
    box-shadow: 0 30px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,166,74,0.10);
    z-index: 9991;
    animation: bspModalIn 0.28s cubic-bezier(0.16,1,0.3,1) forwards;
  }
  @keyframes bspModalIn {
    from { opacity: 0; transform: translate(-50%, calc(-50% + 16px)); }
    to   { opacity: 1; transform: translate(-50%, -50%); }
  }
  .bsp-card.expanded .bsp-mobile-header {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    padding: 6px 10px 0;
    background: transparent;
    border-bottom: 0;
    flex-shrink: 0;
  }
  .bsp-card.expanded .bsp-mobile-header-close {
    width: 30px; height: 30px;
    border-radius: 999px;
    background: rgba(212,166,74,0.10);
    border: 1px solid rgba(212,166,74,0.30);
    color: #d4a64a;
    font-size: 17px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .bsp-card.expanded .bsp-card-body {
    flex: 1 1 auto;
    overflow-y: auto;
    padding: 6px 26px 24px;
    -webkit-overflow-scrolling: touch;
    overscroll-behavior: contain;
  }
  .bsp-mobile-bar { display: flex; }
  .bsp-mobile-bar.hidden { display: none; }
}

/* STRIPE MODAL */
.bsp-overlay {
  position: fixed; inset: 0;
  background: rgba(0,0,0,0.72);
  backdrop-filter: blur(8px);
  z-index: 9998;
  animation: bspFade 0.25s ease forwards;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  overflow-y: scroll;          /* always show track */
  padding: 24px;
  overscroll-behavior: contain;
  scrollbar-width: thin;       /* Firefox */
  scrollbar-color: #d4a64a rgba(255,255,255,0.08);
}
.bsp-overlay::-webkit-scrollbar { width: 10px; }
.bsp-overlay::-webkit-scrollbar-track { background: rgba(255,255,255,0.06); border-radius: 999px; }
.bsp-overlay::-webkit-scrollbar-thumb { background: #d4a64a; border-radius: 999px; border: 2px solid transparent; background-clip: content-box; }
.bsp-overlay::-webkit-scrollbar-thumb:hover { background: #e8c074; background-clip: content-box; }
@keyframes bspFade { from { opacity: 0; } to { opacity: 1; } }
.bsp-modal {
  position: relative;
  width: 100%;
  max-width: 520px;
  background: #0a0a0a;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 18px;
  box-shadow: 0 30px 80px rgba(0,0,0,0.7);
  display: flex;
  flex-direction: column;
  margin: auto;
}
.bsp-modal-head {
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255,255,255,0.06);
  display: flex;
  align-items: center;
  justify-content: space-between;
  color: #e2e8f0;
  font-family: 'DM Sans', sans-serif;
  flex-shrink: 0;
  position: sticky;
  top: 0;
  background: #0a0a0a;
  border-radius: 18px 18px 0 0;
  z-index: 1;
}
.bsp-modal-head-title { font-family: 'Instrument Serif', serif; font-size: 18px; color: #fff; margin: 0; }
.bsp-modal-head-title em { color: #d4a64a; font-style: italic; }
.bsp-modal-close { width: 34px; height: 34px; border-radius: 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.10); color: #cbd5e1; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
.bsp-modal-close:hover { background: rgba(255,255,255,0.16); color: #fff; }
.bsp-modal-body {
  padding: 0;
  background: #fff;
  overflow: visible;
  border-radius: 0 0 18px 18px;
}

/* Sticky 'scroll for more' chip — sits over the bottom of the
   Stripe checkout so visitors know to keep going to fill out the
   payment form. Click jumps the overlay scroll all the way down. */
.bsp-scroll-hint {
  position: sticky;
  bottom: 14px;
  margin: -52px auto 14px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 16px;
  background: #0a0907;
  color: #d4a64a;
  border: 1px solid rgba(212,166,74,0.45);
  border-radius: 999px;
  font-family: 'DM Sans', sans-serif;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.16em;
  text-transform: uppercase;
  cursor: pointer;
  z-index: 5;
  box-shadow: 0 14px 32px rgba(0,0,0,0.45), 0 0 0 1px rgba(212,166,74,0.10);
  animation: bspScrollBounce 1.6s ease-in-out infinite;
  transition: opacity 0.3s ease, transform 0.3s ease;
}
.bsp-scroll-hint:hover { background: #14110b; }
.bsp-scroll-hint svg { width: 12px; height: 12px; }
.bsp-scroll-hint.is-hidden { opacity: 0; transform: translateY(8px); pointer-events: none; }
@keyframes bspScrollBounce {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(4px); }
}

@media (max-width: 720px) {
  .bsp-overlay { padding: 12px; }
  .bsp-modal { max-width: 100%; }
  .bsp-modal-head-title { font-size: 15px; }
  .bsp-scroll-hint { font-size: 10.5px; padding: 8px 14px; }
}
      `}</style>

      <div className={`bsp-page${introVisible ? ' has-intro' : ''}`}>
        <iframe
          src={SAMPLE_URL}
          title="Sample Barber Shop Site"
          className="bsp-iframe"
          loading="eager"
          sandbox="allow-same-origin allow-scripts"
          referrerPolicy="no-referrer"
        />
        <div className="bsp-iframe-vignette" aria-hidden="true" />

        {introVisible && (
          <div
            className="bsp-intro"
            role="dialog"
            aria-label="Welcome to the sample"
            onPointerDown={() => setIntroVisible(false)}
          >
            <div className="bsp-intro-eyebrow">A sample &middot; built for a client</div>
            <h2 className="bsp-intro-title">
              A sample barbershop site <em>built for a client.</em>
            </h2>
            <div className="bsp-intro-chev" aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>
        )}

        <div
          className={`bsp-card-backdrop ${!collapsedMobile ? 'is-open' : ''}`}
          onClick={() => setCollapsedMobile(true)}
          aria-hidden="true"
        />

        <aside className={`bsp-card ${!collapsedMobile ? 'expanded' : ''}`}>
          <div className="bsp-mobile-header">
            <button className="bsp-mobile-header-close" onClick={() => setCollapsedMobile(true)} aria-label="Close">&times;</button>
          </div>
          <div className="bsp-card-body">
          <h2 className="bsp-title">
            <em>Yours can be done in 24 hours.</em>
          </h2>
          <p className="bsp-sub">
            Your photos, your logo, your booking link. Design is on us &mdash; you only cover hosting.
          </p>

          <div className="bsp-rule" />

          <h3 className="bsp-list-eyebrow">What you get</h3>
          <ul className="bsp-list">
            {BENEFITS.map(b => (
              <li key={b.title}>
                <span className="bsp-bullet-rule" />
                <div className="bsp-bullet-body">
                  <strong>{b.title}</strong>
                  <span>{b.desc}</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="bsp-rule" />

          <h3 className="bsp-list-eyebrow">How it works</h3>
          <ul className="bsp-list">
            {STEPS.map(s => (
              <li key={s.n}>
                <span className="bsp-bullet-num">{s.n}</span>
                <div className="bsp-bullet-body">
                  <strong>{s.title}</strong>
                  <span>{s.desc}</span>
                </div>
              </li>
            ))}
          </ul>

          <div className="bsp-rule" />

          {/* Pricing as the final decision point */}
          <div className="bsp-toggle" role="tablist" aria-label="Billing period">
            <button role="tab" aria-selected={plan === 'monthly'} className={plan === 'monthly' ? 'active' : ''} onClick={() => setPlan('monthly')}>Monthly</button>
            <button role="tab" aria-selected={plan === 'yearly'} className={plan === 'yearly' ? 'active' : ''} onClick={() => setPlan('yearly')}>Yearly <span className="bsp-save">Save 40%</span></button>
          </div>

          <div className="bsp-tiers">
            <div className="bsp-tier-wrap">
              <button className="bsp-tier" onClick={() => startCheckout('single')} disabled={loading}>
                <div className="bsp-tier-left">
                  <div className="bsp-tier-name">Single Page</div>
                  <div className="bsp-tier-desc">One page &middot; info, gallery, contact</div>
                </div>
                <div className="bsp-tier-right">
                  <span className="bsp-tier-price">{PRICING.single[plan].display}</span>
                  <span className="bsp-tier-per">{PRICING.single[plan].sub}</span>
                </div>
              </button>
            </div>
            <div className="bsp-tier-wrap">
              <span className="bsp-recommended">Recommended</span>
              <button className="bsp-tier bsp-tier-multi" onClick={() => startCheckout('multi')} disabled={loading}>
                <div className="bsp-tier-left">
                  <div className="bsp-tier-name">Multi-Page + SEO</div>
                  <div className="bsp-tier-desc">Like this sample &middot; Home, Services, Contact</div>
                </div>
                <div className="bsp-tier-right">
                  <span className="bsp-tier-price">{PRICING.multi[plan].display}</span>
                  <span className="bsp-tier-per">{PRICING.multi[plan].sub}</span>
                </div>
              </button>
            </div>
          </div>

          {error && <div className="bsp-error">{error}</div>}

          <div className="bsp-foot">
            <div className="bsp-foot-row">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2L4 6v6c0 5 3.5 9.5 8 10 4.5-.5 8-5 8-10V6l-8-4z"/></svg>
              Secure Stripe &middot; cancel anytime
            </div>
          </div>

          </div>
        </aside>

        {/* MOBILE BOTTOM RIBBON — premium */}
        <div className={`bsp-mobile-bar ${collapsedMobile ? '' : 'hidden'}`}>
          <div className="bsp-mobile-top">
            <span className="bsp-mobile-eyebrow">A sample &middot; built for a client</span>
          </div>

          <div className="bsp-mobile-bar-text">
            This is a sample barber site design for our client &mdash; <em>yours can be done within 24 hours.</em>
          </div>

          <button className="bsp-mobile-bar-btn" onClick={() => setCollapsedMobile(false)}>
            See pricing
          </button>
        </div>

        {checkoutOpen && clientSecret && (
          <div className="bsp-overlay" ref={overlayRef} onClick={closeCheckout}>
            <div className="bsp-modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
              <div className="bsp-modal-head">
                <h3 className="bsp-modal-head-title">Secure <em>checkout.</em></h3>
                <button className="bsp-modal-close" onClick={closeCheckout} aria-label="Close">&times;</button>
              </div>
              <div className="bsp-modal-body">
                <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
              <button
                type="button"
                className={`bsp-scroll-hint ${scrollHintVisible ? '' : 'is-hidden'}`}
                onClick={(e) => { e.stopPropagation(); scrollOverlayDown(); }}
                aria-label="Scroll to see the rest of the form"
              >
                Scroll for more
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BarberSamplePage;
