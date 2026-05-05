import React, { useEffect, useRef, useState } from 'react';

type Tier = 'single' | 'multi';
type Plan = 'monthly' | 'yearly';

type Props = {
    open: boolean;
    ctx: { tier: Tier; plan: Plan } | null;
    onClose: () => void;
};

declare global {
    interface Window {
        paypal?: any;
        __paypalSdkPromise?: Promise<void>;
    }
}

function clearChildren(el: HTMLElement) {
    while (el.firstChild) el.removeChild(el.firstChild);
}

async function loadPayPalSdk(): Promise<void> {
    if (window.paypal) return;
    if (window.__paypalSdkPromise) return window.__paypalSdkPromise;
    window.__paypalSdkPromise = (async () => {
        const r = await fetch('/api/paypal-config');
        if (!r.ok) throw new Error('Failed to load PayPal config');
        const { clientId } = await r.json();
        await new Promise<void>((resolve, reject) => {
            const s = document.createElement('script');
            const params = new URLSearchParams({
                'client-id': clientId,
                vault: 'true',
                intent: 'subscription',
                components: 'buttons,funding-eligibility',
                'enable-funding': 'card',
                currency: 'USD',
            });
            s.src = `https://www.paypal.com/sdk/js?${params.toString()}`;
            s.dataset.sdkIntegrationSource = 'button-factory';
            s.async = true;
            s.onload = () => resolve();
            s.onerror = () => reject(new Error('PayPal SDK failed to load'));
            document.head.appendChild(s);
        });
    })();
    return window.__paypalSdkPromise;
}

const PayPalSubscribeModal: React.FC<Props> = ({ open, ctx, onClose }) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!open || !ctx) return;
        let cancelled = false;
        let buttonsInstance: any = null;
        setError(null);
        setLoading(true);

        (async () => {
            try {
                await loadPayPalSdk();
                if (cancelled || !containerRef.current) return;
                clearChildren(containerRef.current);
                buttonsInstance = window.paypal.Buttons({
                    style: { layout: 'vertical', shape: 'rect', color: 'gold', label: 'subscribe' },
                    createSubscription: async (_data: any, actions: any) => {
                        const r = await fetch('/api/paypal-create-subscription', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ tier: ctx.tier, plan: ctx.plan }),
                        });
                        const j = await r.json();
                        if (!r.ok) throw new Error(j.error || 'Failed to create subscription');
                        return actions.subscription.create({
                            plan_id: j.planId,
                            custom_id: j.customId,
                        });
                    },
                    onApprove: async (data: any) => {
                        try {
                            const r = await fetch('/api/paypal-capture-subscription', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    subscriptionID: data.subscriptionID,
                                    tier: ctx.tier,
                                    plan: ctx.plan,
                                }),
                            });
                            const j = await r.json();
                            if (!r.ok || !j.redirect) {
                                setError(j.error || 'Could not confirm subscription');
                                return;
                            }
                            window.location.href = j.redirect;
                        } catch (e: any) {
                            setError(e?.message || 'Could not confirm subscription');
                        }
                    },
                    onError: (err: any) => {
                        console.error('[PayPal Buttons error]', err);
                        setError('Something went wrong. Please try again.');
                    },
                    onCancel: () => {
                        // user cancelled inside PayPal popup
                    },
                });
                await buttonsInstance.render(containerRef.current);
            } catch (e: any) {
                if (!cancelled) setError(e?.message || 'Failed to load PayPal');
            } finally {
                if (!cancelled) setLoading(false);
            }
        })();

        return () => {
            cancelled = true;
            try { buttonsInstance?.close?.(); } catch {}
            if (containerRef.current) clearChildren(containerRef.current);
        };
    }, [open, ctx?.tier, ctx?.plan]);

    if (!open || !ctx) return null;

    const price = ctx.tier === 'single'
        ? (ctx.plan === 'yearly' ? '$36/yr' : '$5/mo')
        : (ctx.plan === 'yearly' ? '$72/yr' : '$10/mo');
    const label = ctx.tier === 'single' ? 'Single Page' : 'Multi-Page + SEO';

    return (
        <div className="mv-checkout-backdrop" onClick={onClose} role="dialog" aria-modal="true">
            <div
                className="mv-checkout-modal"
                onClick={(e) => e.stopPropagation()}
                style={{ maxWidth: 480, padding: '24px 20px' }}
            >
                <button className="mv-checkout-close" onClick={onClose} aria-label="Close">✕</button>
                <h3 style={{ margin: '0 0 4px', fontSize: 20, fontWeight: 700 }}>
                    Subscribe with PayPal
                </h3>
                <p style={{ margin: '0 0 16px', fontSize: 14, color: '#555' }}>
                    {label} — <strong>{price}</strong>
                    <br />
                    <span style={{ fontSize: 12, color: '#777' }}>
                        Pay with PayPal, debit, or credit card. No PayPal account required.
                    </span>
                </p>
                {loading && <div style={{ padding: 12, textAlign: 'center', color: '#555' }}>Loading PayPal…</div>}
                <div ref={containerRef} id="paypal-button-container" />
                {error && (
                    <div style={{ marginTop: 12, padding: 10, background: '#fff3f3', color: '#a00', borderRadius: 6, fontSize: 13 }}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PayPalSubscribeModal;
