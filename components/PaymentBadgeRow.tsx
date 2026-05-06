import React from 'react';

// Minimal transparent payment-acceptance strip. No backgrounds, no
// per-icon chips — the marks inherit `currentColor` so they pick up the
// surrounding text color and blend cleanly into either a light or dark
// theme. MasterCard keeps its iconic two-circle treatment (instantly
// recognizable on any background).

const Wordmark: React.FC<{ text: string; italic?: boolean }> = ({ text, italic }) => (
    <span
        style={{
            fontFamily: 'Arial Black, Arial, sans-serif',
            fontWeight: 900,
            fontSize: 12,
            letterSpacing: '0.04em',
            fontStyle: italic ? 'italic' : 'normal',
            color: 'currentColor',
            opacity: 0.85,
            lineHeight: 1,
        }}
    >
        {text}
    </span>
);

const PayPalMark: React.FC = () => (
    <span
        style={{
            fontFamily: 'Arial, Helvetica, sans-serif',
            fontWeight: 900,
            fontSize: 13,
            letterSpacing: '-0.01em',
            color: 'currentColor',
            opacity: 0.9,
            lineHeight: 1,
        }}
    >
        Pay<span style={{ fontStyle: 'italic' }}>Pal</span>
    </span>
);

const MastercardMark: React.FC = () => (
    <svg height="16" viewBox="0 0 38 24" xmlns="http://www.w3.org/2000/svg" aria-label="Mastercard" style={{ display: 'block', opacity: 0.95 }}>
        <circle cx="15" cy="12" r="7" fill="#EB001B"/>
        <circle cx="23" cy="12" r="7" fill="#F79E1B"/>
        <path fill="#FF5F00" d="M19 7.13a7 7 0 0 1 0 9.74 7 7 0 0 1 0-9.74z"/>
    </svg>
);

const Dot: React.FC = () => (
    <span aria-hidden="true" style={{ opacity: 0.25, fontSize: 9, color: 'currentColor' }}>•</span>
);

const PaymentBadgeRow: React.FC = () => {
    return (
        <div
            style={{
                display: 'flex',
                flexWrap: 'nowrap',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                margin: '12px 0 6px',
                color: 'inherit',
                overflowX: 'auto',
                WebkitOverflowScrolling: 'touch',
                fontSize: 11,
                lineHeight: 1,
            }}
        >
            <span
                style={{
                    fontSize: 10,
                    letterSpacing: '0.16em',
                    textTransform: 'uppercase',
                    fontWeight: 700,
                    opacity: 0.55,
                    color: 'currentColor',
                    flex: '0 0 auto',
                    marginRight: 2,
                }}
            >
                We accept
            </span>
            <span style={{ flex: '0 0 auto' }}><PayPalMark /></span>
            <Dot />
            <span style={{ flex: '0 0 auto' }}><Wordmark text="VISA" italic /></span>
            <Dot />
            <span style={{ flex: '0 0 auto', display: 'inline-flex', alignItems: 'center' }}><MastercardMark /></span>
            <Dot />
            <span style={{ flex: '0 0 auto' }}><Wordmark text="AMEX" /></span>
            <Dot />
            <span style={{ flex: '0 0 auto' }}><Wordmark text="DISCOVER" /></span>
        </div>
    );
};

export default PaymentBadgeRow;
