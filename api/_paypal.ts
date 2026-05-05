// Shared PayPal server helper. Not an HTTP route (leading underscore).
// Live PayPal only — no sandbox toggle.

export const PAYPAL_API = 'https://api-m.paypal.com';

const PRODUCT_NAME = 'Amalvera Website Hosting';

export type Region =
    | 'us' | 'aus' | 'ten' | 'five' | 'barber' | 'localbusiness' | 'home';
export type Tier = 'single' | 'multi';
export type Plan = 'monthly' | 'yearly';

export type Pricing = {
    planName: string;        // unique name per (region, tier, plan)
    description: string;
    amount: string;          // string like '5.00'
    currency: 'USD' | 'AUD';
    interval: 'MONTH' | 'YEAR';
    value: number;           // numeric for analytics
};

// Mirrors api/create-checkout.ts pricing exactly.
export function getPricing(region: Region, tier: Tier | undefined, plan: Plan): Pricing {
    const isYearly = plan === 'yearly';
    const interval: 'MONTH' | 'YEAR' = isYearly ? 'YEAR' : 'MONTH';
    const currency: 'USD' | 'AUD' = region === 'aus' ? 'AUD' : 'USD';

    let value = 0;
    let label = '';

    if (region === 'five') {
        const t = tier === 'multi' ? 'multi' : 'single';
        value = isYearly
            ? (t === 'multi' ? 72 : 36)
            : (t === 'multi' ? 10 : 5);
        label = `Amalvera /5 ${t === 'multi' ? 'Multi-Page + SEO' : 'Single Page'} ${isYearly ? 'Yearly' : 'Monthly'}`;
    } else if (region === 'home') {
        const t = tier === 'single' ? 'single' : 'multi';
        value = isYearly ? 99 : (t === 'single' ? 30 : 50);
        label = `Amalvera /home ${t === 'single' ? 'Single Page' : 'Multi-Service'} ${isYearly ? 'Yearly' : 'Monthly'}`;
    } else if (region === 'ten' || region === 'barber') {
        value = isYearly ? 49 : 10;
        label = `Amalvera /${region} ${isYearly ? 'Yearly' : 'Monthly'}`;
    } else if (region === 'localbusiness') {
        value = isYearly ? 135 : 20;
        label = `Amalvera /local-business ${isYearly ? 'Yearly' : 'Monthly'}`;
    } else if (region === 'aus') {
        value = isYearly ? 99 : 20;
        label = `Amalvera /aus ${isYearly ? 'Yearly' : 'Monthly'}`;
    } else {
        // 'us'
        value = isYearly ? 99 : 20;
        label = `Amalvera /1 ${isYearly ? 'Yearly' : 'Monthly'}`;
    }

    const tierSegment = (region === 'five' || region === 'home')
        ? `-${tier === 'multi' ? 'multi' : 'single'}`
        : '';
    const planName = `${region}${tierSegment}-${plan}-${currency}`;
    const description = `${label} — ${currency} ${value.toFixed(2)} per ${isYearly ? 'year' : 'month'}`;

    return {
        planName,
        description,
        amount: value.toFixed(2),
        currency,
        interval,
        value,
    };
}

let cachedToken: { value: string; expiresAt: number } | null = null;
let cachedProductId: string | null = null;
const cachedPlanIds: Map<string, string> = new Map(); // key = planName

export async function getAccessToken(): Promise<string> {
    if (cachedToken && Date.now() < cachedToken.expiresAt - 30_000) return cachedToken.value;
    const id = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_CLIENT_SECRET;
    if (!id || !secret) throw new Error('PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET not set');
    const basic = Buffer.from(`${id}:${secret}`).toString('base64');
    const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: 'POST',
        headers: {
            Authorization: `Basic ${basic}`,
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: 'grant_type=client_credentials',
    });
    const json: any = await res.json();
    if (!res.ok || !json.access_token) {
        throw new Error(`PayPal auth failed: ${res.status} ${JSON.stringify(json)}`);
    }
    cachedToken = { value: json.access_token, expiresAt: Date.now() + (json.expires_in || 3600) * 1000 };
    return cachedToken.value;
}

async function ppFetch(path: string, init: RequestInit & { token?: string } = {}): Promise<any> {
    const token = init.token || (await getAccessToken());
    const res = await fetch(`${PAYPAL_API}${path}`, {
        ...init,
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...(init.headers || {}),
        },
    });
    const text = await res.text();
    const json = text ? JSON.parse(text) : {};
    if (!res.ok) throw new Error(`PayPal ${path} failed: ${res.status} ${text}`);
    return json;
}

async function ensureProductId(): Promise<string> {
    if (cachedProductId) return cachedProductId;
    // Page through up to 100 products looking for our product by name.
    let page = 1;
    while (page <= 5) {
        const list = await ppFetch(`/v1/catalogs/products?page=${page}&page_size=20`);
        const found = (list.products || []).find((p: any) => p.name === PRODUCT_NAME);
        if (found) {
            cachedProductId = found.id;
            return found.id;
        }
        if (!list.products || list.products.length < 20) break;
        page++;
    }
    const created = await ppFetch('/v1/catalogs/products', {
        method: 'POST',
        body: JSON.stringify({
            name: PRODUCT_NAME,
            description: 'AI-generated website hosting subscription',
            type: 'SERVICE',
            category: 'SOFTWARE',
        }),
    });
    cachedProductId = created.id;
    return created.id!;
}

async function findExistingPlanId(productId: string, planName: string): Promise<string | null> {
    // Page through plans for our product.
    let page = 1;
    while (page <= 5) {
        const list = await ppFetch(`/v1/billing/plans?product_id=${encodeURIComponent(productId)}&page=${page}&page_size=20`);
        const found = (list.plans || []).find((p: any) => p.name === planName && p.status === 'ACTIVE');
        if (found) return found.id;
        if (!list.plans || list.plans.length < 20) return null;
        page++;
    }
    return null;
}

async function createPlan(productId: string, p: Pricing): Promise<string> {
    const created = await ppFetch('/v1/billing/plans', {
        method: 'POST',
        body: JSON.stringify({
            product_id: productId,
            name: p.planName,
            description: p.description.slice(0, 127),
            status: 'ACTIVE',
            billing_cycles: [
                {
                    frequency: { interval_unit: p.interval, interval_count: 1 },
                    tenure_type: 'REGULAR',
                    sequence: 1,
                    total_cycles: 0, // infinite
                    pricing_scheme: {
                        fixed_price: { value: p.amount, currency_code: p.currency },
                    },
                },
            ],
            payment_preferences: {
                auto_bill_outstanding: true,
                setup_fee: { value: '0', currency_code: p.currency },
                setup_fee_failure_action: 'CONTINUE',
                payment_failure_threshold: 3,
            },
        }),
    });
    return created.id!;
}

export async function resolvePlanId(region: Region, tier: Tier | undefined, plan: Plan): Promise<{ planId: string; pricing: Pricing }> {
    const pricing = getPricing(region, tier, plan);
    const cached = cachedPlanIds.get(pricing.planName);
    if (cached) return { planId: cached, pricing };
    const productId = await ensureProductId();
    const existing = await findExistingPlanId(productId, pricing.planName);
    const id = existing || (await createPlan(productId, pricing));
    cachedPlanIds.set(pricing.planName, id);
    return { planId: id, pricing };
}

export async function getSubscription(subscriptionId: string): Promise<any> {
    return ppFetch(`/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`);
}

export async function verifyWebhookSignature(headers: Record<string, any>, rawBodyJsonString: string): Promise<boolean> {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!webhookId) {
        console.warn('[paypal] PAYPAL_WEBHOOK_ID not set; skipping signature verification');
        return false;
    }
    const body = {
        auth_algo: headers['paypal-auth-algo'],
        cert_url: headers['paypal-cert-url'],
        transmission_id: headers['paypal-transmission-id'],
        transmission_sig: headers['paypal-transmission-sig'],
        transmission_time: headers['paypal-transmission-time'],
        webhook_id: webhookId,
        webhook_event: JSON.parse(rawBodyJsonString),
    };
    try {
        const json = await ppFetch('/v1/notifications/verify-webhook-signature', {
            method: 'POST',
            body: JSON.stringify(body),
        });
        return json.verification_status === 'SUCCESS';
    } catch (e) {
        console.error('[paypal] verifyWebhookSignature error', e);
        return false;
    }
}

// Map the directory path used in the success URL.
export function regionToPath(region: Region): string {
    switch (region) {
        case 'us': return '/1';
        case 'aus': return '/aus';
        case 'ten': return '/10';
        case 'five': return '/5';
        case 'barber': return '/barber';
        case 'localbusiness': return '/local-business';
        case 'home': return '/';
    }
}
