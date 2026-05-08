import React, { useState } from 'react';
import BarberSamplePreview from './BarberSamplePreview';

const NOTICE =
  'This is a sample/demo site. Your final website can be fully customized and deployed within 24 hours, and we handle all edits for you.';

const BarberGeneratorPage: React.FC = () => {
  const [phase, setPhase] = useState<'form' | 'preview'>('form');
  const [shop, setShop] = useState('');
  const [phone, setPhone] = useState('');
  const [sampleUrl, setSampleUrl] = useState('/api/sample-proxy');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanShop = shop.trim();
    const cleanPhone = phone.trim();
    if (!cleanShop || !cleanPhone) return;
    const params = new URLSearchParams({ shop: cleanShop, phone: cleanPhone });
    setSampleUrl(`/api/sample-proxy?${params.toString()}`);
    setPhase('preview');
  };

  if (phase === 'preview') {
    return (
      <BarberSamplePreview
        sampleUrl={sampleUrl}
        source="barberGenerator"
        ctaLabel="Deploy My Site"
        topNotice={NOTICE}
        showIntroBanner={false}
        autoScroll={false}
      />
    );
  }

  return (
    <>
      <style>{`
@import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=DM+Sans:wght@400;500;600;700&family=Instrument+Serif:ital@0;1&display=swap');

.bgp-shell {
  min-height: 100vh;
  background:
    radial-gradient(80% 60% at 50% 0%, rgba(212,166,74,0.08), transparent 70%),
    radial-gradient(60% 50% at 50% 100%, rgba(212,166,74,0.05), transparent 70%),
    #050403;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;
  font-family: 'DM Sans', system-ui, sans-serif;
  color: #e9e1cf;
}
.bgp-card {
  width: 100%;
  max-width: 480px;
  background: radial-gradient(120% 120% at 0% 0%, #14110b 0%, #0a0907 60%, #050403 100%);
  border: 1px solid rgba(212,166,74,0.22);
  border-radius: 22px;
  padding: 36px 32px 30px;
  box-shadow: 0 40px 90px rgba(0,0,0,0.65), 0 0 0 1px rgba(212,166,74,0.06);
}
.bgp-eyebrow {
  font-size: 10px;
  font-weight: 600;
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: #d4a64a;
  margin: 0 0 14px;
  display: flex;
  align-items: center;
  gap: 10px;
}
.bgp-eyebrow::after {
  content: '';
  flex: 1;
  height: 1px;
  background: linear-gradient(to right, rgba(212,166,74,0.45), transparent);
}
.bgp-title {
  font-family: 'Cormorant Garamond', 'Instrument Serif', serif;
  font-weight: 500;
  font-size: 30px;
  line-height: 1.15;
  letter-spacing: -0.005em;
  color: #f5ecd7;
  margin: 0 0 12px;
}
.bgp-title em { color: #d4a64a; font-style: italic; font-weight: 500; }
.bgp-sub {
  font-size: 13px;
  line-height: 1.55;
  color: #a39880;
  margin: 0 0 24px;
}
.bgp-field { display: block; margin-bottom: 14px; }
.bgp-field label {
  display: block;
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: #d4a64a;
  margin-bottom: 7px;
}
.bgp-field input {
  width: 100%;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(212,166,74,0.20);
  border-radius: 10px;
  padding: 12px 14px;
  color: #f5ecd7;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px;
  transition: border-color 0.2s, background 0.2s;
}
.bgp-field input::placeholder { color: #5d5645; }
.bgp-field input:focus {
  outline: none;
  border-color: rgba(212,166,74,0.55);
  background: rgba(212,166,74,0.04);
}
.bgp-rule { height: 1px; background: linear-gradient(to right, transparent, rgba(212,166,74,0.30), transparent); margin: 18px 0 16px; }
.bgp-note {
  font-size: 11px;
  color: #847b66;
  line-height: 1.5;
  margin: 0 0 18px;
  letter-spacing: 0.005em;
}
.bgp-submit {
  width: 100%;
  background: #d4a64a;
  color: #0a0907;
  border: 1px solid #d4a64a;
  padding: 14px 20px;
  border-radius: 999px;
  font-family: 'DM Sans', sans-serif;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
  touch-action: manipulation;
  -webkit-tap-highlight-color: transparent;
  box-shadow: 0 14px 36px rgba(212,166,74,0.20);
}
.bgp-submit:hover { background: #e8c074; transform: translateY(-1px); box-shadow: 0 20px 44px rgba(212,166,74,0.30); }
.bgp-submit:disabled { opacity: 0.55; cursor: not-allowed; transform: none; box-shadow: none; }
.bgp-foot {
  margin-top: 16px;
  font-size: 10.5px;
  color: #5d5645;
  text-align: center;
  letter-spacing: 0.04em;
}
@media (max-width: 480px) {
  .bgp-card { padding: 28px 22px 24px; border-radius: 18px; }
  .bgp-title { font-size: 26px; }
}
      `}</style>

      <div className="bgp-shell">
        <form className="bgp-card" onSubmit={onSubmit}>
          <div className="bgp-eyebrow">Barber site generator</div>
          <h1 className="bgp-title">
            See your barbershop site <em>in 30 seconds.</em>
          </h1>
          <p className="bgp-sub">
            Enter your shop name and phone — we'll instantly render a sample
            site with your business on it. No signup, no wait.
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

          <div className="bgp-rule" />

          <p className="bgp-note">
            We'll generate a personalized barbershop site preview using the
            same template you can deploy as your own. After previewing,
            tap <strong style={{ color: '#d4a64a' }}>Deploy My Site</strong> to
            launch — fully customized and live within 24 hours.
          </p>

          <button
            type="submit"
            className="bgp-submit"
            disabled={!shop.trim() || !phone.trim()}
          >
            Generate my site
          </button>

          <div className="bgp-foot">No signup &middot; instant preview</div>
        </form>
      </div>
    </>
  );
};

export default BarberGeneratorPage;
