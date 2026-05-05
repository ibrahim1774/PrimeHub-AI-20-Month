// Shared PayPal server helper. Not an HTTP route (leading underscore).
// Live PayPal only — no sandbox toggle.

export const PAYPAL_API = 'https://api-m.paypal.com';

const PRODUCT_NAME = 'Amalvera Website Hosting';
const PRODUCT_ID_HINT = 'AMALVERA-HOSTING';

type PlanKey = 'single-monthly' | 'single-yearly' | 'multi-monthly' | 'multi-yearly';

const PLAN_SPECS: Record<PlanKey, { name: string; description: string; amount: string; interval: 'MONTH' | 'YEAR' }> = {
    'single-monthly': { name: 'single-monthly', description: 'Amalvera Single Page — Monthly', amount: '5.00',  interval: 'MONTH' },
    'single-yearly':  { name: 'single-yearly',  description: 'Amalvera Single Page — Yearly',  amount: '36.00', interval: 'YEAR'  },
    'multi-monthly':  { name: 'multi-monthly',  description: 'Amalvera Multi-Page + SEO — Monthly', amount: '10.00', interval: 'MONTH' },
    'multi-yearly':   { name: 'multi-yearly',   description: 'Amalvera Multi-Page + SEO — Yearly',  amount: '72.00', interval: 'YEAR'  },
};

let cachedToken: { value: string; expiresAt: number } | null = null;
let cachedProductId: string | null = null;
const cachedPlanIds: Map<PlanKey, string> = new Map();

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
    // List existing products and try to match by name.
    const list = await ppFetch('/v1/catalogs/products?page_size=20');
    const found = (list.products || []).find((p: any) => p.name === PRODUCT_NAME);
    if (found) {
        cachedProductId = found.id;
        return found.id;
    }
    const created = await ppFetch('/v1/catalogs/products', {
        method: 'POST',
        headers: { 'PayPal-Request-Id': PRODUCT_ID_HINT },
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
    const list = await ppFetch(`/v1/billing/plans?product_id=${encodeURIComponent(productId)}&page_size=20`);
    const found = (list.plans || []).find((p: any) => p.name === planName && p.status === 'ACTIVE');
    return found ? found.id : null;
}

async function createPlan(productId: string, key: PlanKey): Promise<string> {
    const spec = PLAN_SPECS[key];
    const created = await ppFetch('/v1/billing/plans', {
        method: 'POST',
        body: JSON.stringify({
            product_id: productId,
            name: spec.name,
            description: spec.description,
            status: 'ACTIVE',
            billing_cycles: [
                {
                    frequency: { interval_unit: spec.interval, interval_count: 1 },
                    tenure_type: 'REGULAR',
                    sequence: 1,
                    total_cycles: 0, // infinite
                    pricing_scheme: {
                        fixed_price: { value: spec.amount, currency_code: 'USD' },
                    },
                },
            ],
            payment_preferences: {
                auto_bill_outstanding: true,
                setup_fee: { value: '0', currency_code: 'USD' },
                setup_fee_failure_action: 'CONTINUE',
                payment_failure_threshold: 3,
            },
        }),
    });
    return created.id!;
}

export async function resolvePlanId(tier: 'single' | 'multi', plan: 'monthly' | 'yearly'): Promise<string> {
    const key: PlanKey = `${tier}-${plan}` as PlanKey;
    const cached = cachedPlanIds.get(key);
    if (cached) return cached;
    const productId = await ensureProductId();
    const existing = await findExistingPlanId(productId, PLAN_SPECS[key].name);
    const id = existing || (await createPlan(productId, key));
    cachedPlanIds.set(key, id);
    return id;
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

export const PRICE_BY_KEY: Record<PlanKey, number> = {
    'single-monthly': 5,
    'single-yearly': 36,
    'multi-monthly': 10,
    'multi-yearly': 72,
};
