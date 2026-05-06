import React, { useEffect, useRef, useState } from 'react';

export type PayPalRegion = 'us' | 'aus' | 'ten' | 'five' | 'barber' | 'localbusiness' | 'home' | 'barberFive';
type Tier = 'single' | 'multi';
type Plan = 'monthly' | 'yearly';

export type PayPalCtx = {
    region: PayPalRegion;
    tier?: Tier;          // required for 'five' and 'home'
    plan: Plan;
    label: string;        // e.g. "Single Page", "$10/mo plan"
    priceText: string;    // e.g. "$5/mo", "$72/yr", "$99/yr AUD"
};

type Props = {
    open: boolean;
    ctx: PayPalCtx | null;
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

async function loadPayPalSdk(currency: string): Promise<void> {
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
                // 'card' = guest debit/credit card; 'venmo' = Venmo button for US iOS/Android.
                // PayPal One-Touch (login-skip for repeat users) is on by default.
                'enable-funding': 'card,venmo',
                currency,
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

        const currency = ctx.region === 'aus' ? 'AUD' : 'USD';

        (async () => {
            try {
                // Pre-flight: resolve plan-id on the server before showing PayPal buttons.
                // This surfaces backend/env errors (missing keys, sandbox-vs-live mismatch,
                // PayPal API rejections) directly to the user instead of hiding them
                // behind a generic "Something went wrong" from the SDK's onError.
                const preflight = await fetch('/api/paypal-create-subscription', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ region: ctx.region, tier: ctx.tier, plan: ctx.plan }),
                });
                const rawText = await preflight.text();
                let preJson: any = {};
                try { preJson = rawText ? JSON.parse(rawText) : {}; } catch { /* non-JSON response */ }
                if (!preflight.ok) {
                    const detail = preJson.error
                        ? preJson.error
                        : (rawText ? rawText.slice(0, 600) : preflight.statusText);
                    if (!cancelled) setError(`Setup error (HTTP ${preflight.status}): ${detail}`);
                    return;
                }
                const planId: string = preJson.planId;
                const customId: string = preJson.customId;

                await loadPayPalSdk(currency);
                if (cancelled || !containerRef.current) return;
                clearChildren(containerRef.current);
                buttonsInstance = window.paypal.Buttons({
                    style: { layout: 'vertical', shape: 'rect', color: 'gold', label: 'subscribe' },
                    createSubscription: async (_data: any, actions: any) => {
                        try {
                            return await actions.subscription.create({
                                plan_id: planId,
                                custom_id: customId,
                                application_context: {
                                    // Skip the shipping/address collection step in the
                                    // PayPal popup — it's a hosting subscription, no
                                    // physical delivery, faster to checkout.
                                    shipping_preference: 'NO_SHIPPING',
                                    user_action: 'SUBSCRIBE_NOW',
                                },
                            });
                        } catch (e: any) {
                            const msg = e?.message || 'PayPal could not create the subscription. The plan may not be ACTIVE in PayPal yet.';
                            setError(msg);
                            throw e;
                        }
                    },
                    onApprove: async (data: any) => {
                        try {
                            const r = await fetch('/api/paypal-capture-subscription', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    subscriptionID: data.subscriptionID,
                                    region: ctx.region,
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
                        // Show the real PayPal SDK error verbatim — invaluable for debugging
                        // (e.g. "RESOURCE_NOT_FOUND" for a wrong plan_id, "INVALID_REQUEST" for
                        // a sandbox plan used with live keys, etc.)
                        const msg = (err && (err.message || err.toString && err.toString())) || 'Something went wrong with PayPal.';
                        setError(String(msg));
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
    }, [open, ctx?.region, ctx?.tier, ctx?.plan]);

    if (!open || !ctx) return null;

    return (
        <div className="mv-checkout-backdrop" onClick={onClose} role="dialog" aria-modal="true" style={{ zIndex: 99999 }}>
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
                    {ctx.label} — <strong>{ctx.priceText}</strong>
                    <br />
                    <span style={{ fontSize: 12, color: '#777' }}>
                        Pay with PayPal, debit, or credit card.
                    </span>
                </p>
                {loading && <div style={{ padding: 12, textAlign: 'center', color: '#555' }}>Loading PayPal…</div>}
                <div ref={containerRef} id="paypal-button-container" />
                {error && (
                    <div style={{ marginTop: 12, padding: 10, background: '#fff3f3', color: '#a00', borderRadius: 6, fontSize: 12, maxHeight: 220, overflow: 'auto', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', lineHeight: 1.4 }}>
                        {error}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PayPalSubscribeModal;
