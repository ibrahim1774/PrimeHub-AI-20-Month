import React, { useState, useEffect } from 'react';
import BarberSamplePreview from './BarberSamplePreview';

const STICKY_TEXT =
  "This is a sample/demo site. Your final website can be fully customized and deployed within 24 hours, and we handle all edits for you.";

// Steps shown alongside the percentage on the loading screen.
// Each step's threshold is the percent at which it becomes 'current'.
const LOAD_STEPS: { at: number; label: string }[] = [
  { at: 0,  label: 'Pulling your business details' },
  { at: 25, label: 'Building hero and nav' },
  { at: 55, label: 'Composing services and gallery' },
  { at: 80, label: 'Polishing copy and contact info' },
  { at: 95, label: 'Finalizing your preview' },
];

const BarberGeneratorPage: React.FC = () => {
  const [phase, setPhase] = useState<'form' | 'loading' | 'preview'>('form');
  const [shop, setShop] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [sampleUrl, setSampleUrl] = useState('/api/sample-proxy');
  const [progress, setProgress] = useState(0);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanShop = shop.trim();
    const cleanPhone = phone.trim();
    const cleanCity = city.trim();
    if (!cleanShop || !cleanPhone) return;
    const params = new URLSearchParams({ shop: cleanShop, phone: cleanPhone });
    if (cleanCity) params.set('city', cleanCity);
    setSampleUrl(`/api/sample-proxy?${params.toString()}`);
    setProgress(0);
    setPhase('loading');
  };

  // Loading phase: tick progress 0→100 over ~3.5s, then transition
  // to the preview. The iframe loads under the hood while the bar
  // animates so it feels real, not faux.
  useEffect(() => {
    if (phase !== 'loading') return;
    const DURATION_MS = 3500;
    const start = performance.now();
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION_MS);
      // Ease-out: starts fast, slows near the end (feels like work)
      const eased = 1 - Math.pow(1 - t, 1.6);
      setProgress(Math.round(eased * 100));
      if (t < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setPhase('preview');
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [phase]);

  if (phase === 'preview') {
    return (
      <BarberSamplePreview
        sampleUrl={sampleUrl}
        source="barberGenerator"
        ctaLabel="See pricing"
        mobileBarText={STICKY_TEXT}
        mobileBarEyebrow=""
        showIntroBanner={false}
        autoScroll={false}
      />
    );
  }

  if (phase === 'loading') {
    const currentStep = [...LOAD_STEPS].reverse().find(s => progress >= s.at) ?? LOAD_STEPS[0];
    return (
      <>
        <style>{`
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@400;500;600;700&display=swap');

.bgp-load-shell {
  min-height: 100vh;
  background:
    radial-gradient(80% 60% at 50% 0%, rgba(212,166,74,0.10), transparent 70%),
    radial-gradient(60% 50% at 50% 100%, rgba(212,166,74,0.05), transparent 70%),
    #050403;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  font-family: 'DM Sans', system-ui, sans-serif;
  color: #e9e1cf;
}
.bgp-load-card {
  width: 100%;
  max-width: 460px;
  background: radial-gradient(120% 120% at 0% 0%, #14110b 0%, #0a0907 60%, #050403 100%);
  border: 1px solid rgba(212,166,74,0.22);
  border-radius: 22px;
  padding: 36px 32px 32px;
  box-shadow: 0 40px 90px rgba(0,0,0,0.65), 0 0 0 1px rgba(212,166,74,0.06);
  text-align: center;
}
.bgp-load-eyebrow {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #d4a64a;
  margin: 0 0 14px;
}
.bgp-load-title {
  font-family: 'Cormorant Garamond', serif;
  font-weight: 500;
  font-size: 26px;
  line-height: 1.2;
  color: #f5ecd7;
  margin: 0 0 6px;
}
.bgp-load-title em { color: #d4a64a; font-style: italic; font-weight: 500; }
.bgp-load-shop {
  font-family: 'DM Sans', sans-serif;
  font-size: 12px;
  color: #a39880;
  margin: 0 0 26px;
  letter-spacing: 0.04em;
}
.bgp-load-percent {
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-weight: 500;
  font-size: 64px;
  color: #d4a64a;
  line-height: 1;
  margin: 0 0 14px;
}
.bgp-load-track {
  height: 6px;
  background: rgba(212,166,74,0.10);
  border-radius: 999px;
  overflow: hidden;
  margin: 0 0 18px;
  border: 1px solid rgba(212,166,74,0.16);
}
.bgp-load-fill {
  height: 100%;
  background: linear-gradient(90deg, #d4a64a, #e8c074);
  border-radius: 999px;
  transition: width 0.12s linear;
  box-shadow: 0 0 14px rgba(212,166,74,0.45);
}
.bgp-load-step {
  font-size: 11.5px;
  color: #a39880;
  letter-spacing: 0.06em;
  margin: 0 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}
.bgp-load-step::before {
  content: '';
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #d4a64a;
  box-shadow: 0 0 10px rgba(212,166,74,0.7);
  animation: bgpDot 1.2s ease-in-out infinite;
}
@keyframes bgpDot {
  0%, 100% { opacity: 0.45; transform: scale(1); }
  50%      { opacity: 1;    transform: scale(1.25); }
}
.bgp-load-foot {
  font-size: 10.5px;
  color: #5d5645;
  letter-spacing: 0.10em;
  text-transform: uppercase;
}
@media (max-width: 480px) {
  .bgp-load-card { padding: 28px 22px 24px; border-radius: 18px; }
  .bgp-load-title { font-size: 22px; }
  .bgp-load-percent { font-size: 52px; }
}
        `}</style>

        <div className="bgp-load-shell">
          <div className="bgp-load-card" role="status" aria-live="polite">
            <div className="bgp-load-eyebrow">Generating your site</div>
            <h2 className="bgp-load-title">
              Building <em>{shop || 'your barbershop'}</em>
            </h2>
            <p className="bgp-load-shop">{city ? `${city} · ` : ''}{phone}</p>

            <div className="bgp-load-percent">{progress}%</div>

            <div className="bgp-load-track" aria-hidden="true">
              <div className="bgp-load-fill" style={{ width: `${progress}%` }} />
            </div>

            <div className="bgp-load-step">{currentStep.label}</div>
            <div className="bgp-load-foot">Hold tight &middot; almost there</div>
          </div>

          {/* Preload the iframe HTML in the background so it's hot
              by the time the loading bar finishes. */}
          <iframe
            src={sampleUrl}
            title="Preloading"
            style={{ position: 'fixed', width: 1, height: 1, opacity: 0, pointerEvents: 'none', border: 0 }}
            sandbox="allow-same-origin allow-scripts"
            referrerPolicy="no-referrer"
            aria-hidden="true"
            tabIndex={-1}
          />
        </div>
      </>
    );
  }

  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600;1,700&family=Newsreader:ital,wght@0,400;0,500;0,600;0,700;1,400;1,500;1,600&family=Inter:wght@400;500;600;700&display=swap');

.bgp-shell {
  min-height: 100vh;
  position: relative;
  isolation: isolate;
  background:
    radial-gradient(70% 50% at 50% 0%, rgba(212,166,74,0.14), transparent 70%),
    radial-gradient(60% 50% at 50% 100%, rgba(212,166,74,0.06), transparent 70%),
    radial-gradient(40% 35% at 80% 50%, rgba(212,166,74,0.04), transparent 70%),
    #050403;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px 18px;
  font-family: 'Inter', system-ui, sans-serif;
  color: #e9e1cf;
}
/* Subtle vertical hairline behind the card for editorial feel */
.bgp-shell::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, transparent 0, rgba(212,166,74,0.04) 50%, transparent 100%);
  -webkit-mask-image: linear-gradient(90deg, transparent 49.5%, #000 49.8%, #000 50.2%, transparent 50.5%);
          mask-image: linear-gradient(90deg, transparent 49.5%, #000 49.8%, #000 50.2%, transparent 50.5%);
  z-index: -1;
  opacity: 0.55;
}

.bgp-card {
  width: 100%;
  max-width: 420px;
  background:
    radial-gradient(140% 100% at 0% 0%, rgba(212,166,74,0.06), transparent 50%),
    linear-gradient(180deg, #14110b 0%, #0a0907 65%, #050403 100%);
  border: 1px solid rgba(212,166,74,0.24);
  border-radius: 4px;
  padding: 28px 30px 24px;
  box-shadow:
    0 50px 110px rgba(0,0,0,0.7),
    0 0 0 1px rgba(212,166,74,0.06),
    inset 0 1px 0 rgba(255,255,255,0.04);
  position: relative;
}
/* Hairline gold corner ticks — bookish/luxe touch */
.bgp-card::before, .bgp-card::after {
  content: '';
  position: absolute;
  width: 22px;
  height: 22px;
  border: 1px solid rgba(212,166,74,0.55);
  pointer-events: none;
}
.bgp-card::before { top: 8px; left: 8px; border-right: 0; border-bottom: 0; }
.bgp-card::after  { bottom: 8px; right: 8px; border-left: 0; border-top: 0; }

/* Brand mark — gold-ringed disc with razor+comb monogram */
.bgp-logo-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  margin: 0 0 14px;
}
.bgp-logo {
  width: 52px;
  height: 52px;
  border-radius: 999px;
  background:
    radial-gradient(60% 60% at 50% 35%, rgba(212,166,74,0.35), transparent 70%),
    radial-gradient(120% 120% at 0% 0%, #14110b 0%, #0a0907 60%, #050403 100%);
  border: 1px solid rgba(212,166,74,0.50);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow:
    0 16px 40px rgba(212,166,74,0.25),
    inset 0 1px 0 rgba(255,255,255,0.06),
    0 0 0 4px rgba(212,166,74,0.06);
  position: relative;
}
.bgp-logo svg { width: 26px; height: 26px; color: #d4a64a; }
.bgp-logo-name {
  font-family: 'Cormorant Garamond', 'Newsreader', serif;
  font-style: italic;
  font-weight: 500;
  font-size: 11.5px;
  letter-spacing: 0.30em;
  color: #d4a64a;
  text-transform: uppercase;
  padding-left: 0.30em;
}

.bgp-eyebrow {
  font-family: 'Inter', sans-serif;
  font-size: 9px;
  font-weight: 600;
  letter-spacing: 0.36em;
  text-transform: uppercase;
  color: #d4a64a;
  margin: 0 0 10px;
  display: flex;
  align-items: center;
  gap: 12px;
  text-align: center;
  justify-content: center;
  padding-left: 0.40em;
}
.bgp-eyebrow::before, .bgp-eyebrow::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, transparent, rgba(212,166,74,0.55), transparent);
}

.bgp-title {
  font-family: 'Cormorant Garamond', 'Newsreader', serif;
  font-weight: 500;
  font-size: 28px;
  line-height: 1.08;
  letter-spacing: -0.010em;
  color: #f5ecd7;
  margin: 0 0 8px;
  text-align: center;
}
.bgp-title em {
  color: #d4a64a;
  font-style: italic;
  font-weight: 500;
}
.bgp-sub {
  font-family: 'Newsreader', 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 12.5px;
  line-height: 1.5;
  color: #a39880;
  margin: 0 0 18px;
  text-align: center;
  letter-spacing: 0.005em;
}

.bgp-field { display: block; margin-bottom: 12px; }
.bgp-field label {
  display: block;
  font-family: 'Inter', sans-serif;
  font-size: 8.5px;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  color: #d4a64a;
  margin-bottom: 5px;
  padding-left: 0.28em;
}
.bgp-field input {
  width: 100%;
  background: transparent;
  border: 0;
  border-bottom: 1px solid rgba(212,166,74,0.30);
  border-radius: 0;
  padding: 5px 2px 7px;
  color: #f5ecd7;
  font-family: 'Cormorant Garamond', 'Newsreader', serif;
  font-size: 16px;
  font-weight: 500;
  letter-spacing: 0.005em;
  transition: border-color 0.25s, color 0.25s;
}
.bgp-field input::placeholder {
  color: #5d5645;
  font-style: italic;
}
.bgp-field input:focus {
  outline: none;
  border-bottom-color: #d4a64a;
}

.bgp-rule { height: 1px; background: linear-gradient(to right, transparent, rgba(212,166,74,0.30), transparent); margin: 14px 0 12px; }

.bgp-note {
  font-family: 'Newsreader', 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: 11.5px;
  color: #847b66;
  line-height: 1.5;
  margin: 0 0 14px;
  text-align: center;
  letter-spacing: 0.005em;
}
.bgp-note strong { font-style: normal; font-weight: 600; }

.bgp-submit {
  width: 100%;
  background: linear-gradient(180deg, #e8c074 0%, #d4a64a 100%);
  color: #0a0907;
  border: 1px solid #d4a64a;
  padding: 12px 18px;
  border-radius: 2px;
  font-family: 'Cormorant Garamond', 'Newsreader', serif;
  font-style: italic;
  font-weight: 600;
  font-size: 15px;
  letter-spacing: 0.05em;
  cursor: pointer;
  transition: transform 0.15s, box-shadow 0.25s, background 0.25s;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 14px 32px rgba(212,166,74,0.26), inset 0 1px 0 rgba(255,255,255,0.30);
  position: relative;
}
.bgp-submit:hover {
  transform: translateY(-1px);
  box-shadow: 0 20px 40px rgba(212,166,74,0.40), inset 0 1px 0 rgba(255,255,255,0.40);
  background: linear-gradient(180deg, #f0cd84 0%, #dab156 100%);
}
.bgp-submit:disabled { opacity: 0.50; cursor: not-allowed; transform: none; box-shadow: none; }

.bgp-foot {
  margin-top: 10px;
  font-family: 'Inter', sans-serif;
  font-size: 8.5px;
  color: #5d5645;
  text-align: center;
  letter-spacing: 0.28em;
  text-transform: uppercase;
  padding-left: 0.28em;
}

@media (max-width: 480px) {
  .bgp-card { padding: 24px 22px 20px; }
  .bgp-title { font-size: 24px; }
  .bgp-sub { font-size: 12px; }
  .bgp-field input { font-size: 15px; }
}
      `}</style>

      <div className="bgp-shell">
        <form className="bgp-card" onSubmit={onSubmit}>
          <div className="bgp-logo-wrap">
            <div className="bgp-logo" aria-hidden="true">
              <svg viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                {/* Barber-pole-ish stylized monogram: razor + comb */}
                <path
                  d="M6 4 L26 24 M9 4 L4 9 M28 27 L23 22"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M22 4 L22 12 M25 4 L25 12 M28 4 L28 12 M19 12 L31 12"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="bgp-logo-name">Amalvera &middot; Barbershops</div>
          </div>

          <div className="bgp-eyebrow">Barber site generator</div>
          <h1 className="bgp-title">
            See your barbershop site <em>in seconds.</em>
          </h1>
          <p className="bgp-sub">
            Shop name, phone, and city &mdash; we'll render your sample.
          </p>

          <div className="bgp-field">
            <label htmlFor="bgp-shop">Barbershop name</label>
            <input
              id="bgp-shop"
              type="text"
              required
              maxLength={80}
              autoComplete="organization"
              placeholder="e.g. Sharp Cuts Co."
              value={shop}
              onChange={(e) => setShop(e.target.value)}
            />
          </div>

          <div className="bgp-field">
            <label htmlFor="bgp-phone">Phone number</label>
            <input
              id="bgp-phone"
              type="tel"
              required
              maxLength={40}
              autoComplete="tel"
              placeholder="e.g. (555) 010-9090"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <div className="bgp-field">
            <label htmlFor="bgp-city">Location (city)</label>
            <input
              id="bgp-city"
              type="text"
              maxLength={60}
              autoComplete="address-level2"
              placeholder="e.g. Austin, TX"
              value={city}
              onChange={(e) => setCity(e.target.value)}
            />
          </div>

          <div className="bgp-rule" />

          <p className="bgp-note">
            Fully customized and live within 24 hours.
          </p>

          <button
            type="submit"
            className="bgp-submit"
            disabled={!shop.trim() || !phone.trim()}
          >
            Generate My Barbershop Site
          </button>

          <div className="bgp-foot">No signup &middot; instant preview</div>
        </form>
      </div>
    </>
  );
};

export default BarberGeneratorPage;
