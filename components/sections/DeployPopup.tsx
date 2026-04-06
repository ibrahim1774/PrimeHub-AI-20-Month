import { useState, useEffect } from "react";

interface DeployPopupProps {
  onClaim: (plan: 'monthly' | 'yearly') => void;
  isClaiming: boolean;
}

const DeployPopup: React.FC<DeployPopupProps> = ({ onClaim, isClaiming }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [pricingPlan, setPricingPlan] = useState<'monthly' | 'yearly'>('monthly');


  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  if (!showBanner && !isExpanded) return null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700&family=Instrument+Serif:ital@0;1&display=swap');

        .deploy-overlay {
          position: fixed;
          inset: 0;
          background: rgba(0, 0, 0, 0.6);
          backdrop-filter: blur(8px);
          z-index: 9998;
          opacity: 0;
          animation: dplyFadeIn 0.3s ease forwards;
        }

        .deploy-banner {
          position: fixed;
          bottom: 0;
          left: 0;
          right: 0;
          z-index: 9999;
          font-family: 'DM Sans', sans-serif;
          transform: translateY(100%);
          animation: dplySlideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          animation-delay: 0.1s;
        }

        .dply-banner-inner {
          background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
          border-top: 1px solid rgba(255, 255, 255, 0.08);
          padding: 16px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .dply-banner-left {
          display: flex;
          align-items: center;
          gap: 16px;
          flex: 1;
          min-width: 280px;
        }

        .dply-banner-pulse {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: #22c55e;
          box-shadow: 0 0 12px rgba(34, 197, 94, 0.5);
          animation: dplyPulse 2s ease-in-out infinite;
          flex-shrink: 0;
        }

        .dply-banner-text {
          color: #e2e8f0;
          font-size: 14px;
          line-height: 1.5;
        }

        .dply-banner-text strong {
          color: #fff;
          font-weight: 600;
        }

        .dply-banner-price {
          font-family: 'Instrument Serif', serif;
          font-size: 22px;
          color: #22c55e;
          font-style: italic;
          white-space: nowrap;
        }

        .dply-banner-actions {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-shrink: 0;
        }

        .dply-btn-how {
          padding: 12px 28px;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          background: rgba(255, 255, 255, 0.08);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: #f1f5f9;
          white-space: nowrap;
        }
        .dply-btn-how:hover {
          background: rgba(255, 255, 255, 0.15);
          border-color: rgba(255, 255, 255, 0.3);
        }

        .dply-btn-deploy {
          padding: 12px 28px;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 14px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border: none;
          color: #fff;
          letter-spacing: 0.02em;
          box-shadow: 0 2px 12px rgba(34, 197, 94, 0.3);
        }
        .dply-btn-deploy:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 20px rgba(34, 197, 94, 0.45);
        }
        .dply-btn-deploy:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        .dply-banner-toggle {
          display: flex;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 8px;
          padding: 2px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .dply-banner-tab {
          padding: 8px 14px;
          border-radius: 6px;
          font-family: 'DM Sans', sans-serif;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          background: transparent;
          border: none;
          color: #94a3b8;
          white-space: nowrap;
        }
        .dply-banner-tab.active {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }
        .dply-banner-tab:hover:not(.active) {
          color: #e2e8f0;
        }
        .dply-banner-discount {
          font-size: 12px;
          color: #22c55e;
          font-weight: 600;
          white-space: nowrap;
        }
        .dply-banner-discount s {
          color: #64748b;
          font-weight: 400;
        }

        /* Expanded Modal */
        .deploy-modal {
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%) translateY(20px);
          z-index: 9999;
          width: 94%;
          max-width: 640px;
          font-family: 'DM Sans', sans-serif;
          opacity: 0;
          animation: dplyModalIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        .dply-modal-card {
          background: linear-gradient(160deg, #0f0f1a 0%, #0a0a14 50%, #0d1117 100%);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 20px;
          overflow-y: auto;
          max-height: calc(100vh - 48px);
          box-shadow: 0 25px 80px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(255, 255, 255, 0.03);
        }

        .dply-modal-header {
          padding: 20px 24px 0;
          position: relative;
        }

        .dply-modal-badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(34, 197, 94, 0.1);
          border: 1px solid rgba(34, 197, 94, 0.2);
          border-radius: 100px;
          padding: 6px 14px;
          font-size: 11px;
          font-weight: 600;
          color: #22c55e;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 6px;
        }

        .dply-modal-badge-dot {
          width: 6px;
          height: 6px;
          background: #22c55e;
          border-radius: 50%;
          animation: dplyPulse 2s infinite;
        }

        .dply-modal-title {
          font-family: 'Instrument Serif', serif;
          font-size: 28px;
          color: #fff;
          line-height: 1.2;
          margin: 0 0 4px;
        }

        .dply-modal-title em {
          color: #22c55e;
          font-style: italic;
        }

        .dply-modal-subtitle {
          color: #94a3b8;
          font-size: 15px;
          line-height: 1.6;
          margin: 0;
        }

        .dply-modal-close {
          position: absolute;
          top: 24px;
          right: 24px;
          background: rgba(255, 255, 255, 0.12);
          border: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 10px;
          width: 42px;
          height: 42px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #cbd5e1;
          cursor: pointer;
          font-size: 20px;
          transition: all 0.2s;
        }
        .dply-modal-close:hover {
          background: rgba(255, 255, 255, 0.2);
          color: #fff;
        }

        .dply-modal-footer {
          padding: 0 24px 20px;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .dply-footer-price-row {
          display: flex;
          align-items: baseline;
          justify-content: center;
          gap: 8px;
          padding: 16px;
          background: rgba(34, 197, 94, 0.04);
          border: 1px solid rgba(34, 197, 94, 0.1);
          border-radius: 12px;
        }

        .dply-footer-price {
          font-family: 'Instrument Serif', serif;
          font-size: 36px;
          color: #22c55e;
          font-style: italic;
          line-height: 1;
        }

        .dply-footer-per {
          color: #64748b;
          font-size: 14px;
        }

        .dply-footer-perks {
          display: flex;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
          padding: 0 0 4px;
        }

        .dply-perk {
          display: flex;
          align-items: center;
          gap: 5px;
          font-size: 11px;
          color: #64748b;
          letter-spacing: 0.02em;
        }

        .dply-perk-check {
          color: #22c55e;
          font-size: 12px;
        }

        .dply-btn-deploy-big {
          width: 100%;
          padding: 16px;
          border-radius: 12px;
          font-family: 'DM Sans', sans-serif;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.25s ease;
          background: linear-gradient(135deg, #22c55e, #16a34a);
          border: none;
          color: #fff;
          letter-spacing: 0.02em;
          box-shadow: 0 4px 20px rgba(34, 197, 94, 0.3);
        }
        .dply-btn-deploy-big:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(34, 197, 94, 0.45);
        }
        .dply-btn-deploy-big:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none;
        }

        /* Benefits Section */
        .dply-benefits-section {
          padding: 0 24px 10px;
        }
        .dply-benefits-title {
          font-size: 11px;
          font-weight: 700;
          color: #94a3b8;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          margin: 0 0 8px;
        }
        .dply-benefits-list {
          display: flex;
          flex-wrap: wrap;
          gap: 6px;
        }
        .dply-benefit-item {
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          gap: 4px;
          padding: 8px 10px;
          background: rgba(34, 197, 94, 0.04);
          border: 1px solid rgba(34, 197, 94, 0.08);
          border-radius: 8px;
          flex: 1;
          min-width: 140px;
        }
        .dply-benefit-row {
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .dply-benefit-icon {
          font-size: 14px;
          flex-shrink: 0;
        }
        .dply-benefit-item strong {
          color: #e2e8f0;
          font-size: 11px;
          font-weight: 600;
        }
        .dply-benefit-desc {
          color: #94a3b8;
          font-size: 10px;
          font-weight: 400;
          margin: 0;
          padding-left: 20px;
        }

        /* Pricing Toggle */
        .dply-pricing-toggle-row {
          display: flex;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          padding: 3px;
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        .dply-pricing-tab {
          flex: 1;
          padding: 10px 16px;
          border: none;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          background: transparent;
          color: #94a3b8;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .dply-pricing-tab.active {
          background: rgba(34, 197, 94, 0.15);
          color: #22c55e;
        }
        .dply-pricing-save-badge {
          background: #22c55e;
          color: #000;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
          text-transform: uppercase;
          letter-spacing: 0.03em;
        }
        .dply-pricing-was {
          color: #64748b;
          font-size: 13px;
          text-decoration: line-through;
        }

        @keyframes dplySlideUp {
          to { transform: translateY(0); }
        }
        @keyframes dplyFadeIn {
          to { opacity: 1; }
        }
        @keyframes dplyModalIn {
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes dplyPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }

        @media (max-width: 600px) {
          .dply-banner-inner {
            padding: 14px 16px;
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
          .dply-banner-actions {
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
          }
          .dply-btn-how {
            width: 100%;
            text-align: center;
            order: -1;
            padding: 14px 28px;
            font-size: 15px;
          }
          .dply-btn-deploy {
            width: 100%;
            text-align: center;
          }
          .dply-banner-toggle {
            width: 100%;
            justify-content: center;
          }
          .dply-banner-tab {
            flex: 1;
            text-align: center;
          }
          .deploy-modal {
            bottom: 12px;
          }
          .dply-modal-card {
            max-height: calc(100vh - 24px);
          }
          .dply-modal-header { padding: 16px 16px 0; }
          .dply-benefits-section { padding: 0 16px 8px; }
          .dply-modal-footer { padding: 0 16px 16px; }
          .dply-modal-title { font-size: 22px; }
          .dply-modal-subtitle { font-size: 12px; }
          .dply-footer-price { font-size: 28px; }
        }
      `}</style>

      {/* BOTTOM BANNER (default state) */}
      {showBanner && !isExpanded && isVisible && (
        <div className="deploy-banner">
          <div className="dply-banner-inner">
            <div className="dply-banner-left">
              <div className="dply-banner-pulse" />
              <div className="dply-banner-text">
                <strong>This is a sample site.</strong> Design & content are free — you only pay for hosting to keep it live.
              </div>
            </div>
            <div className="dply-banner-actions">
              <button className="dply-btn-how" onClick={() => { setIsExpanded(true); setShowBanner(false); }}>
                How It Works
              </button>
              <div className="dply-banner-toggle">
                <button
                  className={`dply-banner-tab ${pricingPlan === 'monthly' ? 'active' : ''}`}
                  onClick={() => setPricingPlan('monthly')}
                >
                  Monthly
                </button>
                <button
                  className={`dply-banner-tab ${pricingPlan === 'yearly' ? 'active' : ''}`}
                  onClick={() => setPricingPlan('yearly')}
                >
                  Yearly <span className="dply-pricing-save-badge">Save 59%</span>
                </button>
              </div>
              {pricingPlan === 'yearly' && (
                <span className="dply-banner-discount">$99/yr <s>$240/yr</s></span>
              )}
              <button
                className="dply-btn-deploy"
                onClick={() => onClaim(pricingPlan)}
                disabled={isClaiming}
              >
                {isClaiming ? "Launching..." : pricingPlan === 'yearly'
                  ? "Build My Website \u2014 $99/yr \u2192"
                  : "Build My Website \u2014 $20/mo \u2192"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXPANDED MODAL */}
      {isExpanded && (
        <>
          <div className="deploy-overlay" onClick={() => { setIsExpanded(false); setShowBanner(true); }} />
          <div className="deploy-modal">
            <div className="dply-modal-card">
              <div className="dply-modal-header">
                <div className="dply-modal-badge">
                  <span className="dply-modal-badge-dot" />
                  Sample Site Preview
                </div>
                <h2 className="dply-modal-title">
                  Your Custom Site. Edit Anytime.<br />
                  <em>All yours for $20/mo.</em>
                </h2>
                <p className="dply-modal-subtitle">
                  This is just a preview. Once you publish, we build your real multi-page, SEO-optimized site — fully custom, fully yours to edit, with complete account access. Design & content are free, you only pay for hosting to keep it live.
                </p>
                <button className="dply-modal-close" onClick={() => { setIsExpanded(false); setShowBanner(true); }}>✕</button>
              </div>

              <div className="dply-benefits-section">
                <h3 className="dply-benefits-title">Why You Need a Website</h3>
                <div className="dply-benefits-list">
                  <div className="dply-benefit-item">
                    <div className="dply-benefit-row">
                      <span className="dply-benefit-icon">📍</span>
                      <strong>Rank higher on Google</strong>
                    </div>
                    <span className="dply-benefit-desc">A website linked to your Google Business Profile helps you rank higher in search.</span>
                  </div>
                  <div className="dply-benefit-item">
                    <div className="dply-benefit-row">
                      <span className="dply-benefit-icon">💼</span>
                      <strong>Look more professional</strong>
                    </div>
                    <span className="dply-benefit-desc">A polished site can help build trust with customers before they even call.</span>
                  </div>
                  <div className="dply-benefit-item">
                    <div className="dply-benefit-row">
                      <span className="dply-benefit-icon">🏆</span>
                      <strong>Show off your work</strong>
                    </div>
                    <span className="dply-benefit-desc">Display your services and photos all in one place.</span>
                  </div>
                </div>
              </div>

              <div className="dply-modal-footer">
                <div className="dply-pricing-toggle-row">
                  <button
                    className={`dply-pricing-tab ${pricingPlan === 'monthly' ? 'active' : ''}`}
                    onClick={() => setPricingPlan('monthly')}
                  >
                    Monthly
                  </button>
                  <button
                    className={`dply-pricing-tab ${pricingPlan === 'yearly' ? 'active' : ''}`}
                    onClick={() => setPricingPlan('yearly')}
                  >
                    Yearly
                    <span className="dply-pricing-save-badge">Save 59%</span>
                  </button>
                </div>

                <div className="dply-footer-price-row">
                  {pricingPlan === 'monthly' ? (
                    <>
                      <span className="dply-footer-price">$20</span>
                      <span className="dply-footer-per">/month</span>
                    </>
                  ) : (
                    <>
                      <span className="dply-footer-price">$99</span>
                      <span className="dply-footer-per">/year</span>
                      <span className="dply-pricing-was">$240/yr</span>
                    </>
                  )}
                </div>
                <button
                  className="dply-btn-deploy-big"
                  onClick={() => onClaim(pricingPlan)}
                  disabled={isClaiming}
                >
                  {isClaiming ? "Launching..." : pricingPlan === 'yearly'
                    ? "Build My Website \u2014 $99/yr \u2192"
                    : "Build My Website \u2014 $20/mo \u2192"}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default DeployPopup;
