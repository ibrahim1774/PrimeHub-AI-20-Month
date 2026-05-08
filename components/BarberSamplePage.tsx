import React, { useState, useCallback } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider, EmbeddedCheckout } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const SAMPLE_URL = 'https://dist-black-nine-17.vercel.app/';

type Tier = 'single' | 'multi';
type Plan = 'monthly' | 'yearly';

const PRICING: Record<Tier, Record<Plan, { display: string; sub: string }>> = {
  single: {
    monthly: { display: '$10', sub: '/month' },
    yearly:  { display: '$72', sub: '/year · save $48' },
  },
  multi: {
    monthly: { display: '$20', sub: '/month' },
    yearly:  { display: '$144', sub: '/year · save $96' },
  },
};

const BENEFITS = [
  { icon: '🎨', title: 'Fully custom', desc: 'Your branding, photos, logo, booking link — not a template.' },
  { icon: '📱', title: 'Mobile + SEO ready', desc: 'Sharp on every screen, schema markup, set up to rank.' },
  { icon: '🔧', title: 'We maintain it', desc: 'Need a change? Email us. We handle it.' },
  { icon: '🌐', title: 'Custom domain', desc: 'Your own .com or a free Vercel subdomain.' },
];

const STEPS = [
  { n: '01', title: 'Pick your plan', desc: 'Single page or multi-page · monthly or yearly.' },
  { n: '02', title: 'Send us your info', desc: 'Logo, photos, hours, booking link — we\'ll guide you.' },
  { n: '03', title: 'We build it', desc: 'Live within 48 hours. Edit anytime, we maintain it.' },
];

const BarberSamplePage: React.FC = () => {
  const [plan, setPlan] = useState<Plan>('monthly');
  const [collapsedMobile, setCollapsedMobile] = useState(true);
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startCheckout = useCallback(async (tier: Tier) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, source: 'barberFive', tier, embedded: true }),
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

  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');

.bsp-page { position: relative; width: 100vw; height: 100vh; background: #0a0a0a; font-family: 'DM Sans', system-ui, sans-serif; overflow: hidden; }
.bsp-iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; background: #000; }

/* DESKTOP STICKY CARD — mid-right */
.bsp-mobile-header { display: none; }
.bsp-card-body { display: contents; }
.bsp-card { position: fixed; top: 50%; right: 20px; transform: translateY(-50%); width: 380px; max-height: calc(100vh - 40px); overflow-y: auto; background: linear-gradient(160deg, #0f0f1a 0%, #0a0a14 50%, #0d1117 100%); border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; padding: 24px 22px 18px; color: #e2e8f0; z-index: 9990; box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,166,74,0.10); animation: bspIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards; scrollbar-width: thin; scrollbar-color: rgba(212,166,74,0.3) transparent; }
.bsp-card::-webkit-scrollbar { width: 6px; }
.bsp-card::-webkit-scrollbar-thumb { background: rgba(212,166,74,0.3); border-radius: 3px; }
@keyframes bspIn { from { opacity: 0; transform: translateY(-50%) translateX(20px); } to { opacity: 1; transform: translateY(-50%) translateX(0); } }

.bsp-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(34,197,94,0.10); border: 1px solid rgba(34,197,94,0.22); color: #22c55e; padding: 5px 12px; border-radius: 100px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px; }
.bsp-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; animation: bspPulse 2s infinite; }
@keyframes bspPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

.bsp-title { font-family: 'Instrument Serif', serif; font-size: 26px; line-height: 1.18; color: #fff; margin: 0 0 8px; }
.bsp-title em { color: #d4a64a; font-style: italic; }
.bsp-sub { font-size: 13px; line-height: 1.55; color: #94a3b8; margin: 0 0 16px; }

/* BOX CONTAINERS for benefits + steps */
.bsp-box { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px 14px 12px; margin-bottom: 14px; }
.bsp-box-title { font-size: 10px; font-weight: 800; color: #d4a64a; text-transform: uppercase; letter-spacing: 0.18em; margin: 0 0 10px; }
.bsp-box ul { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 9px; }
.bsp-box li { display: flex; gap: 10px; align-items: flex-start; line-height: 1.45; }
.bsp-bullet-icon { flex-shrink: 0; font-size: 14px; line-height: 1; padding-top: 1px; width: 22px; text-align: center; }
.bsp-bullet-num { flex-shrink: 0; font-family: 'Instrument Serif', serif; font-size: 16px; font-style: italic; color: #d4a64a; line-height: 1; padding-top: 2px; min-width: 26px; }
.bsp-bullet-body strong { display: block; font-size: 12.5px; font-weight: 600; color: #f1f5f9; margin-bottom: 1px; }
.bsp-bullet-body span { display: block; font-size: 11.5px; color: #94a3b8; line-height: 1.45; }

/* PLAN TOGGLE */
.bsp-toggle { display: flex; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 3px; margin-bottom: 12px; }
.bsp-toggle button { flex: 1; padding: 10px 10px; background: transparent; border: none; color: #94a3b8; font-family: 'DM Sans', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; border-radius: 7px; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.bsp-toggle button.active { background: rgba(212,166,74,0.15); color: #d4a64a; }
.bsp-save { background: #d4a64a; color: #0a0a0a; font-size: 9.5px; font-weight: 800; padding: 2px 6px; border-radius: 4px; letter-spacing: 0.05em; }

/* TIER ROWS */
.bsp-tiers { display: flex; flex-direction: column; gap: 10px; }
.bsp-tier { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 14px 14px; text-align: left; color: #e2e8f0; cursor: pointer; font-family: 'DM Sans', sans-serif; transition: all 0.25s; display: flex; align-items: center; justify-content: space-between; gap: 10px; width: 100%; }
.bsp-tier:hover:not(:disabled) { background: rgba(212,166,74,0.06); border-color: rgba(212,166,74,0.30); transform: translateY(-1px); }
.bsp-tier:disabled { opacity: 0.55; cursor: not-allowed; }
.bsp-tier-multi { background: linear-gradient(135deg, rgba(212,166,74,0.10), rgba(212,166,74,0.04)); border-color: rgba(212,166,74,0.30); }
.bsp-tier-multi:hover:not(:disabled) { background: linear-gradient(135deg, rgba(212,166,74,0.18), rgba(212,166,74,0.08)); }
.bsp-tier-left { display: flex; flex-direction: column; gap: 2px; }
.bsp-tier-name { font-size: 13px; font-weight: 700; color: #fff; letter-spacing: 0.01em; }
.bsp-tier-desc { font-size: 11px; color: #94a3b8; line-height: 1.45; }
.bsp-tier-right { display: flex; flex-direction: column; align-items: flex-end; gap: 1px; flex-shrink: 0; }
.bsp-tier-price { font-family: 'Instrument Serif', serif; font-size: 22px; color: #d4a64a; font-style: italic; line-height: 1; }
.bsp-tier-per { font-size: 10.5px; color: #64748b; }
.bsp-tier-wrap { position: relative; }
.bsp-recommended { position: absolute; top: -8px; right: 12px; background: #d4a64a; color: #0a0a0a; font-size: 9px; font-weight: 800; padding: 3px 8px; border-radius: 4px; letter-spacing: 0.06em; text-transform: uppercase; z-index: 1; }

.bsp-foot { margin-top: 14px; padding-top: 12px; border-top: 1px solid rgba(255,255,255,0.06); display: flex; flex-direction: column; gap: 4px; }
.bsp-foot-row { font-size: 11px; color: #64748b; display: flex; align-items: center; gap: 5px; line-height: 1.4; }
.bsp-foot-row svg { flex-shrink: 0; color: #d4a64a; }

.bsp-error { margin-top: 10px; padding: 9px 12px; background: rgba(239,68,68,0.10); border: 1px solid rgba(239,68,68,0.30); border-radius: 8px; color: #fca5a5; font-size: 11.5px; }

/* MOBILE BOTTOM BAR — BIGGER */
.bsp-mobile-bar { display: none; position: fixed; bottom: 14px; left: 14px; right: 14px; background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%); border: 1px solid rgba(212,166,74,0.35); border-radius: 18px; padding: 18px 20px; color: #e2e8f0; z-index: 9990; box-shadow: 0 22px 56px rgba(0,0,0,0.55); flex-direction: column; gap: 12px; font-family: 'DM Sans', sans-serif; }

.bsp-mobile-top { display: flex; align-items: center; gap: 10px; }
.bsp-mobile-pulse { width: 8px; height: 8px; border-radius: 50%; background: #22c55e; box-shadow: 0 0 10px rgba(34,197,94,0.6); animation: bspPulse 2s infinite; flex-shrink: 0; }
.bsp-mobile-eyebrow { font-size: 10px; font-weight: 700; color: #22c55e; letter-spacing: 0.14em; text-transform: uppercase; }

.bsp-mobile-bar-text { font-size: 16px; font-weight: 600; line-height: 1.3; color: #f1f5f9; }
.bsp-mobile-bar-text strong { color: #fff; }
.bsp-mobile-bar-text em { color: #d4a64a; font-style: normal; font-weight: 700; font-family: 'Instrument Serif', serif; font-style: italic; font-size: 1.05em; }

.bsp-mobile-bullets { display: flex; flex-direction: column; gap: 6px; padding: 8px 0 4px; }
.bsp-mobile-bullet { font-size: 12px; color: #cbd5e1; display: flex; gap: 8px; line-height: 1.35; }
.bsp-mobile-bullet-check { color: #d4a64a; flex-shrink: 0; font-weight: 700; }

.bsp-mobile-bar-btn { background: linear-gradient(135deg, #d4a64a, #e8c074); color: #0a0a0a; border: none; padding: 14px 18px; font-size: 15px; font-weight: 700; border-radius: 12px; cursor: pointer; letter-spacing: 0.02em; box-shadow: 0 6px 18px rgba(212,166,74,0.32); width: 100%; }
.bsp-mobile-bar-btn:hover { transform: translateY(-1px); }

@media (max-width: 720px) {
  .bsp-card { display: none; }
  .bsp-card.expanded {
    display: flex;
    flex-direction: column;
    position: fixed;
    inset: 0;
    top: 0; right: 0; bottom: 0; left: 0;
    transform: none;
    width: auto;
    max-height: 100vh;
    height: 100vh;
    border-radius: 0;
    border: none;
    padding: 0;
    overflow: hidden;
  }
  .bsp-card.expanded .bsp-mobile-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 14px 16px;
    background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
    border-bottom: 1px solid rgba(212,166,74,0.20);
    flex-shrink: 0;
    position: sticky;
    top: 0;
    z-index: 2;
  }
  .bsp-card.expanded .bsp-mobile-header-text {
    font-family: 'Instrument Serif', serif;
    font-size: 16px;
    color: #d4a64a;
    font-style: italic;
  }
  .bsp-card.expanded .bsp-mobile-header-close {
    width: 36px; height: 36px;
    border-radius: 8px;
    background: rgba(255,255,255,0.10);
    border: 1px solid rgba(255,255,255,0.12);
    color: #cbd5e1;
    font-size: 20px;
    cursor: pointer;
    display: flex; align-items: center; justify-content: center;
    flex-shrink: 0;
  }
  .bsp-card.expanded .bsp-card-body {
    flex: 1;
    overflow-y: auto;
    padding: 16px 18px 16px;
    -webkit-overflow-scrolling: touch;
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
  align-items: center;
  justify-content: center;
  overflow-y: auto;
  padding: 24px;
  overscroll-behavior: contain;
}
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
@media (max-width: 720px) {
  .bsp-overlay { padding: 12px; }
  .bsp-modal { max-width: 100%; }
  .bsp-modal-head-title { font-size: 15px; }
}
      `}</style>

      <div className="bsp-page">
        <iframe src={SAMPLE_URL} title="Sample Barber Shop Site" className="bsp-iframe" loading="eager" />

        <aside className={`bsp-card ${!collapsedMobile ? 'expanded' : ''}`}>
          <div className="bsp-mobile-header">
            <span className="bsp-mobile-header-text">Yours in 24 hours.</span>
            <button className="bsp-mobile-header-close" onClick={() => setCollapsedMobile(true)} aria-label="Close">×</button>
          </div>
          <div className="bsp-card-body">
          <div className="bsp-badge">
            <span className="bsp-badge-dot" />
            Sample Site &middot; Built for a Real Client
          </div>
          <h2 className="bsp-title">
            A sample barbershop site we built for a client. <em>Yours can go live in 24 hours.</em>
          </h2>
          <p className="bsp-sub">
            Custom to your branding, photos, logo, and booking link. Design &amp; content are free &mdash; you only pay hosting.
          </p>

          <div className="bsp-box">
            <h3 className="bsp-box-title">What you get</h3>
            <ul>
              {BENEFITS.map(b => (
                <li key={b.title}>
                  <span className="bsp-bullet-icon">{b.icon}</span>
                  <div className="bsp-bullet-body">
                    <strong>{b.title}</strong>
                    <span>{b.desc}</span>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="bsp-box">
            <h3 className="bsp-box-title">How it works</h3>
            <ul>
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
          </div>

          <div className="bsp-toggle" role="tablist" aria-label="Billing period">
            <button role="tab" aria-selected={plan === 'monthly'} className={plan === 'monthly' ? 'active' : ''} onClick={() => setPlan('monthly')}>Monthly</button>
            <button role="tab" aria-selected={plan === 'yearly'} className={plan === 'yearly' ? 'active' : ''} onClick={() => setPlan('yearly')}>Yearly <span className="bsp-save">Save 40%</span></button>
          </div>

          <div className="bsp-tiers">
            <div className="bsp-tier-wrap">
              <button className="bsp-tier" onClick={() => startCheckout('single')} disabled={loading}>
                <div className="bsp-tier-left">
                  <div className="bsp-tier-name">Single Page</div>
                  <div className="bsp-tier-desc">One polished page &middot; all your info, gallery, contact</div>
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
                  <div className="bsp-tier-desc">Home, About, Services, Contact &middot; SEO &middot; like this sample</div>
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
              Secure Stripe checkout &middot; cancel anytime
            </div>
            <div className="bsp-foot-row">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.2l-3.5-3.5L4 14.2 9 19.2l11-11L18.6 6.8z"/></svg>
              Live in 48 hrs &middot; custom domain supported
            </div>
          </div>

          </div>
        </aside>

        {/* MOBILE BIGGER BOTTOM BAR */}
        <div className={`bsp-mobile-bar ${collapsedMobile ? '' : 'hidden'}`}>
          <div className="bsp-mobile-top">
            <span className="bsp-mobile-pulse" />
            <span className="bsp-mobile-eyebrow">Sample Site &middot; Built for a Real Barber Client</span>
          </div>

          <div className="bsp-mobile-bar-text">
            <strong>Yours can go live in 24 hours</strong> &mdash; <em>from $10/mo</em>
          </div>

          <div className="bsp-mobile-bullets">
            <div className="bsp-mobile-bullet"><span className="bsp-mobile-bullet-check">✓</span><span>Custom branding · your photos, logo, booking link</span></div>
            <div className="bsp-mobile-bullet"><span className="bsp-mobile-bullet-check">✓</span><span>Mobile-ready · Google-SEO · live in 48 hrs</span></div>
            <div className="bsp-mobile-bullet"><span className="bsp-mobile-bullet-check">✓</span><span>We maintain it for you · cancel anytime</span></div>
          </div>

          <button className="bsp-mobile-bar-btn" onClick={() => setCollapsedMobile(false)}>
            See Pricing &amp; Get Started &rarr;
          </button>
        </div>

        {checkoutOpen && clientSecret && (
          <div className="bsp-overlay" onClick={closeCheckout}>
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
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default BarberSamplePage;
