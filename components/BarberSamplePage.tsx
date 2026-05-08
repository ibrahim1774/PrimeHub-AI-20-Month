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
        body: JSON.stringify({
          plan,
          source: 'barberFive',
          tier,
          embedded: true,
        }),
      });
      const data = await res.json();
      if (!res.ok || !data.clientSecret) {
        throw new Error(data?.error || 'Checkout failed to start');
      }
      setClientSecret(data.clientSecret);
      setCheckoutOpen(true);
    } catch (err: any) {
      setError(err?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [plan]);

  const closeCheckout = () => {
    setCheckoutOpen(false);
    setClientSecret(null);
  };

  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');

.bsp-page { position: relative; width: 100vw; height: 100vh; background: #0a0a0a; font-family: 'DM Sans', system-ui, sans-serif; overflow: hidden; }
.bsp-iframe { position: absolute; inset: 0; width: 100%; height: 100%; border: 0; background: #000; }

.bsp-card { position: fixed; top: 50%; right: 20px; transform: translateY(-50%); width: 360px; max-height: calc(100vh - 40px); overflow-y: auto; background: linear-gradient(160deg, #0f0f1a 0%, #0a0a14 50%, #0d1117 100%); border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; padding: 22px 22px 18px; color: #e2e8f0; z-index: 9990; box-shadow: 0 30px 80px rgba(0,0,0,0.6), 0 0 0 1px rgba(212,166,74,0.10); animation: bspIn 0.5s cubic-bezier(0.16,1,0.3,1) forwards; }
@keyframes bspIn { from { opacity: 0; transform: translateY(-50%) translateX(20px); } to { opacity: 1; transform: translateY(-50%) translateX(0); } }

.bsp-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(34,197,94,0.10); border: 1px solid rgba(34,197,94,0.22); color: #22c55e; padding: 5px 12px; border-radius: 100px; font-size: 10.5px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 12px; }
.bsp-badge-dot { width: 6px; height: 6px; border-radius: 50%; background: #22c55e; animation: bspPulse 2s infinite; }
@keyframes bspPulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }

.bsp-title { font-family: 'Instrument Serif', serif; font-size: 24px; line-height: 1.18; color: #fff; margin: 0 0 8px; }
.bsp-title em { color: #d4a64a; font-style: italic; }
.bsp-sub { font-size: 13px; line-height: 1.55; color: #94a3b8; margin: 0 0 16px; }

.bsp-toggle { display: flex; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.08); border-radius: 10px; padding: 3px; margin-bottom: 14px; }
.bsp-toggle button { flex: 1; padding: 9px 10px; background: transparent; border: none; color: #94a3b8; font-family: 'DM Sans', sans-serif; font-size: 12.5px; font-weight: 600; cursor: pointer; border-radius: 7px; transition: all 0.2s; display: inline-flex; align-items: center; justify-content: center; gap: 6px; }
.bsp-toggle button.active { background: rgba(212,166,74,0.15); color: #d4a64a; }
.bsp-save { background: #d4a64a; color: #0a0a0a; font-size: 9.5px; font-weight: 800; padding: 2px 6px; border-radius: 4px; letter-spacing: 0.05em; }

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

.bsp-mobile-bar { display: none; position: fixed; bottom: 12px; left: 12px; right: 12px; background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%); border: 1px solid rgba(212,166,74,0.30); border-radius: 14px; padding: 13px 16px; color: #e2e8f0; z-index: 9990; box-shadow: 0 18px 48px rgba(0,0,0,0.5); align-items: center; justify-content: space-between; gap: 10px; font-family: 'DM Sans', sans-serif; }
.bsp-mobile-bar-text { flex: 1; font-size: 12px; line-height: 1.35; }
.bsp-mobile-bar-text strong { color: #fff; }
.bsp-mobile-bar-text em { color: #d4a64a; font-style: normal; font-weight: 700; }
.bsp-mobile-bar-btn { background: #d4a64a; color: #0a0a0a; border: none; padding: 10px 14px; font-size: 12px; font-weight: 700; border-radius: 8px; cursor: pointer; letter-spacing: 0.02em; }

@media (max-width: 720px) {
  .bsp-card { display: none; }
  .bsp-card.expanded { display: block; position: fixed; inset: 12px; top: auto; bottom: 12px; transform: none; width: auto; right: 12px; left: 12px; max-height: calc(100vh - 24px); }
  .bsp-mobile-bar { display: flex; }
  .bsp-mobile-bar.hidden { display: none; }
}

.bsp-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.72); backdrop-filter: blur(8px); z-index: 9998; animation: bspFade 0.25s ease forwards; }
@keyframes bspFade { from { opacity: 0; } to { opacity: 1; } }

.bsp-modal { position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 94vw; max-width: 540px; max-height: calc(100vh - 32px); z-index: 9999; background: #0a0a0a; border: 1px solid rgba(255,255,255,0.08); border-radius: 18px; overflow: hidden; box-shadow: 0 30px 80px rgba(0,0,0,0.7); display: flex; flex-direction: column; }
.bsp-modal-head { padding: 16px 20px; border-bottom: 1px solid rgba(255,255,255,0.06); display: flex; align-items: center; justify-content: space-between; color: #e2e8f0; font-family: 'DM Sans', sans-serif; }
.bsp-modal-head-title { font-family: 'Instrument Serif', serif; font-size: 20px; color: #fff; margin: 0; }
.bsp-modal-head-title em { color: #d4a64a; font-style: italic; }
.bsp-modal-close { width: 36px; height: 36px; border-radius: 8px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.10); color: #cbd5e1; font-size: 18px; cursor: pointer; display: flex; align-items: center; justify-content: center; }
.bsp-modal-close:hover { background: rgba(255,255,255,0.16); color: #fff; }
.bsp-modal-body { padding: 0; background: #fff; overflow-y: auto; flex: 1; }

@media (max-width: 720px) {
  .bsp-modal { width: 96vw; max-height: calc(100vh - 16px); }
  .bsp-modal-head-title { font-size: 16px; }
}
      `}</style>

      <div className="bsp-page">
        <iframe
          src={SAMPLE_URL}
          title="Sample Barber Shop Site"
          className="bsp-iframe"
          loading="eager"
        />

        <aside className={`bsp-card ${!collapsedMobile ? 'expanded' : ''}`}>
          <div className="bsp-badge">
            <span className="bsp-badge-dot" />
            Live Sample &middot; Euphoria Barbershop
          </div>
          <h2 className="bsp-title">
            We built this site for a real barber. <em>We can build yours.</em>
          </h2>
          <p className="bsp-sub">
            Custom to your branding, your photos, your logo, your booking link, your business info.
            Design &amp; content are free &mdash; you only pay hosting to keep it live.
          </p>

          <div className="bsp-toggle" role="tablist" aria-label="Billing period">
            <button
              role="tab"
              aria-selected={plan === 'monthly'}
              className={plan === 'monthly' ? 'active' : ''}
              onClick={() => setPlan('monthly')}
            >Monthly</button>
            <button
              role="tab"
              aria-selected={plan === 'yearly'}
              className={plan === 'yearly' ? 'active' : ''}
              onClick={() => setPlan('yearly')}
            >Yearly <span className="bsp-save">Save 40%</span></button>
          </div>

          <div className="bsp-tiers">
            <div className="bsp-tier-wrap">
              <button
                className="bsp-tier"
                onClick={() => startCheckout('single')}
                disabled={loading}
                aria-label="Single Page plan"
              >
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
              <button
                className="bsp-tier bsp-tier-multi"
                onClick={() => startCheckout('multi')}
                disabled={loading}
                aria-label="Multi-Page plan"
              >
                <div className="bsp-tier-left">
                  <div className="bsp-tier-name">Multi-Page + SEO</div>
                  <div className="bsp-tier-desc">Home, About, Services, Contact &middot; SEO-optimized &middot; like this sample</div>
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
              Live on Vercel &middot; custom domain supported
            </div>
            <div className="bsp-foot-row">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M12 1l3.09 6.26L22 8.27l-5 4.87 1.18 6.88L12 16.77l-6.18 3.25L7 13.14 2 8.27l6.91-1.01z"/></svg>
              Editable anytime &middot; we maintain it for you
            </div>
          </div>

          {!collapsedMobile && (
            <button
              onClick={() => setCollapsedMobile(true)}
              style={{
                marginTop: 12,
                width: '100%',
                padding: '10px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid rgba(255,255,255,0.10)',
                borderRadius: 8,
                color: '#cbd5e1',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Hide
            </button>
          )}
        </aside>

        <div className={`bsp-mobile-bar ${collapsedMobile ? '' : 'hidden'}`}>
          <div className="bsp-mobile-bar-text">
            <strong>Like this?</strong> We&apos;ll build yours <em>from $10/mo</em>
          </div>
          <button className="bsp-mobile-bar-btn" onClick={() => setCollapsedMobile(false)}>
            See Pricing &rarr;
          </button>
        </div>

        {checkoutOpen && clientSecret && (
          <>
            <div className="bsp-overlay" onClick={closeCheckout} />
            <div className="bsp-modal" role="dialog" aria-modal="true" aria-labelledby="bsp-checkout-title">
              <div className="bsp-modal-head">
                <h3 id="bsp-checkout-title" className="bsp-modal-head-title">
                  Secure <em>checkout.</em>
                </h3>
                <button className="bsp-modal-close" onClick={closeCheckout} aria-label="Close checkout">&times;</button>
              </div>
              <div className="bsp-modal-body">
                <EmbeddedCheckoutProvider stripe={stripePromise} options={{ clientSecret }}>
                  <EmbeddedCheckout />
                </EmbeddedCheckoutProvider>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default BarberSamplePage;
