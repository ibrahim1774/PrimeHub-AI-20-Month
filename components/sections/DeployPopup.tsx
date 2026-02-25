import { useState, useEffect } from "react";

interface DeployPopupProps {
  onClaim: () => void;
  isClaiming: boolean;
}

const DeployPopup: React.FC<DeployPopupProps> = ({ onClaim, isClaiming }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showBanner, setShowBanner] = useState(true);
  const [activeStep, setActiveStep] = useState<number | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 500);
    return () => clearTimeout(timer);
  }, []);

  const steps = [
    {
      num: "01",
      title: "You're Viewing a Sample",
      desc: "This generated site is a proof of concept — a preview showing how professional and modern your business can look online.",
      icon: "👁️",
    },
    {
      num: "02",
      title: "5–10 Fully Custom Pages",
      desc: "Services, About, Gallery, Contact, Testimonials, and more — every page built and tailored specifically to your business.",
      icon: "🏗️",
    },
    {
      num: "03",
      title: "Lead Forms · Live Chat · Business App",
      desc: "A built-in lead capture form so you never miss a customer, a live chat widget for instant visitor communication, and a dedicated app to manage it all.",
      icon: "⚡",
    },
    {
      num: "04",
      title: "Full Account Access — Edit Anything",
      desc: "Swap images, change text, update pages — anytime you want. It's your site, your account, total control.",
      icon: "🔑",
    },
  ];

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
          padding: 10px 24px;
          border-radius: 8px;
          font-family: 'DM Sans', sans-serif;
          font-size: 13px;
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

        .dply-btn-close-banner {
          background: none;
          border: none;
          color: rgba(255, 255, 255, 0.3);
          cursor: pointer;
          font-size: 18px;
          padding: 4px;
          line-height: 1;
          transition: color 0.2s;
        }
        .dply-btn-close-banner:hover {
          color: rgba(255, 255, 255, 0.7);
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
          padding: 32px 32px 0;
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
          margin-bottom: 16px;
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
          font-size: 32px;
          color: #fff;
          line-height: 1.2;
          margin: 0 0 8px;
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

        .dply-modal-steps {
          padding: 24px 32px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .dply-step-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 14px 16px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.25s ease;
          border: 1px solid transparent;
        }
        .dply-step-item:hover,
        .dply-step-item.active {
          background: rgba(255, 255, 255, 0.03);
          border-color: rgba(255, 255, 255, 0.06);
        }

        .dply-step-num {
          font-size: 11px;
          font-weight: 700;
          color: #22c55e;
          letter-spacing: 0.05em;
          padding-top: 2px;
          flex-shrink: 0;
          opacity: 0.6;
        }
        .dply-step-item:hover .dply-step-num,
        .dply-step-item.active .dply-step-num {
          opacity: 1;
        }

        .dply-step-content h4 {
          margin: 0 0 4px;
          font-size: 14px;
          font-weight: 600;
          color: #e2e8f0;
        }

        .dply-step-content p {
          margin: 0;
          font-size: 13px;
          color: #64748b;
          line-height: 1.5;
          transition: color 0.2s;
        }
        .dply-step-item:hover .dply-step-content p,
        .dply-step-item.active .dply-step-content p {
          color: #94a3b8;
        }

        .dply-modal-footer {
          padding: 0 32px 28px;
          display: flex;
          flex-direction: column;
          gap: 12px;
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
            flex: 1;
          }
          .deploy-modal {
            bottom: 12px;
          }
          .dply-modal-card {
            max-height: calc(100vh - 24px);
          }
          .dply-modal-header { padding: 24px 20px 0; }
          .dply-modal-steps { padding: 16px 20px; gap: 2px; }
          .dply-step-item { padding: 10px 12px; }
          .dply-modal-footer { padding: 0 20px 24px; }
          .dply-modal-title { font-size: 24px; }
          .dply-modal-subtitle { font-size: 13px; }
          .dply-footer-price { font-size: 30px; }
        }
      `}</style>

      {/* BOTTOM BANNER (default state) */}
      {showBanner && !isExpanded && isVisible && (
        <div className="deploy-banner">
          <div className="dply-banner-inner">
            <div className="dply-banner-left">
              <div className="dply-banner-pulse" />
              <div className="dply-banner-text">
                <strong>This is a sample site.</strong> Your real site will be fully custom with 5-10 pages, lead forms, live chat, full account access & more —{" "}
                <span className="dply-banner-price">just $20/mo</span>
              </div>
            </div>
            <div className="dply-banner-actions">
              <button className="dply-btn-how" onClick={() => { setIsExpanded(true); setShowBanner(false); }}>
                How It Works
              </button>
              <button
                className="dply-btn-deploy"
                onClick={onClaim}
                disabled={isClaiming}
              >
                {isClaiming ? "Launching..." : "Deploy My Real Site \u2014 $20/mo \u2192"}
              </button>
              <button className="dply-btn-close-banner" onClick={() => setShowBanner(false)}>✕</button>
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
                  5-10 Custom Pages. Lead Forms.<br />
                  Live Chat. A Business App.<br />
                  <em>All yours for $20/mo.</em>
                </h2>
                <p className="dply-modal-subtitle">
                  What you see here is a sample — a proof of concept. When you deploy, we build the real thing with full account access so you can edit text, swap images, and update anything, anytime.
                </p>
                <button className="dply-modal-close" onClick={() => { setIsExpanded(false); setShowBanner(true); }}>✕</button>
              </div>

              <div className="dply-modal-steps">
                {steps.map((step, i) => (
                  <div
                    key={step.num}
                    className={`dply-step-item ${activeStep === i ? "active" : ""}`}
                    onMouseEnter={() => setActiveStep(i)}
                    onMouseLeave={() => setActiveStep(null)}
                  >
                    <span className="dply-step-num">{step.num}</span>
                    <div className="dply-step-content">
                      <h4>{step.icon} {step.title}</h4>
                      <p>{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="dply-modal-footer">
                <div className="dply-footer-price-row">
                  <span className="dply-footer-price">$20</span>
                  <span className="dply-footer-per">/month — hosting only</span>
                </div>
                <p style={{ color: '#64748b', fontSize: '12px', textAlign: 'center', margin: 0, lineHeight: 1.5 }}>
                  No setup fees. No hidden charges. No contracts. You pay for web hosting — we handle building and deploying everything.
                </p>
                <button
                  className="dply-btn-deploy-big"
                  onClick={onClaim}
                  disabled={isClaiming}
                >
                  {isClaiming ? "Launching..." : "Deploy My Real Site \u2014 $20/mo \u2192"}
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
