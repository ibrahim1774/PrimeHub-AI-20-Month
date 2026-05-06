// Self-contained PayPal subscription creation endpoint.
// Helper code is inlined (rather than imported from lib/) to avoid
// any Vercel bundler edge cases with cross-directory imports.

const PAYPAL_API = 'https://api-m.paypal.com';
const PRODUCT_NAME = 'Amalvera Website Hosting';

type Region = 'us' | 'aus' | 'ten' | 'five' | 'barber' | 'localbusiness' | 'home' | 'barberFive';
type Tier = 'single' | 'multi';
type Plan = 'monthly' | 'yearly';

const VALID_REGIONS: Region[] = ['us', 'aus', 'ten', 'five', 'barber', 'localbusiness', 'home', 'barberFive'];

type Pricing = {
    planName: string;
    description: string;
    amount: string;
    currency: 'USD' | 'AUD';
    interval: 'MONTH' | 'YEAR';
    value: number;
};

function getPricing(region: Region, tier: Tier | undefined, plan: Plan): Pricing {
    const isYearly = plan === 'yearly';
    const interval: 'MONTH' | 'YEAR' = isYearly ? 'YEAR' : 'MONTH';
    const currency: 'USD' | 'AUD' = region === 'aus' ? 'AUD' : 'USD';
    let value = 0;
    let label = '';
    if (region === 'five') {
        const t = tier === 'multi' ? 'multi' : 'single';
        value = isYearly ? (t === 'multi' ? 72 : 36) : (t === 'multi' ? 10 : 5);
        label = `Amalvera /5 ${t === 'multi' ? 'Multi-Page + SEO' : 'Single Page'} ${isYearly ? 'Yearly' : 'Monthly'}`;
    } else if (region === 'barberFive') {
        const t = tier === 'multi' ? 'multi' : 'single';
        value = isYearly ? (t === 'multi' ? 144 : 72) : (t === 'multi' ? 20 : 10);
        label = `Amalvera /barber-5 ${t === 'multi' ? 'Multi-Page Barbershop + SEO' : 'Single Page Barbershop'} ${isYearly ? 'Yearly' : 'Monthly'}`;
    } else if (region === 'home') {
        const t = tier === 'single' ? 'single' : 'multi';
        value = isYearly ? 99 : (t === 'single' ? 10 : 20);
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
        value = isYearly ? 99 : 20;
        label = `Amalvera /1 ${isYearly ? 'Yearly' : 'Monthly'}`;
    }
    const tierSegment = (region === 'five' || region === 'home' || region === 'barberFive') ? `-${tier === 'multi' ? 'multi' : 'single'}` : '';
    // Include the price in the plan name so a price change automatically
    // materialises as a NEW PayPal plan instead of silently reusing the old
    // (now mispriced) one. Existing subscribers keep their original plan.
    const planName = `${region}${tierSegment}-${plan}-${value}-${currency}`;
    const description = `${label} — ${currency} ${value.toFixed(2)} per ${isYearly ? 'year' : 'month'}`;
    return { planName, description, amount: value.toFixed(2), currency, interval, value };
}

let cachedToken: { value: string; expiresAt: number } | null = null;
let cachedProductId: string | null = null;
const cachedPlanIds: Map<string, string> = new Map();

async function getAccessToken(): Promise<string> {
    if (cachedToken && Date.now() < cachedToken.expiresAt - 30_000) return cachedToken.value;
    const id = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_CLIENT_SECRET;
    if (!id || !secret) throw new Error('PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET not set');
    const basic = Buffer.from(`${id}:${secret}`).toString('base64');
    const res = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: 'POST',
        headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials',
    });
    const text = await res.text();
    let json: any = {};
    try { json = text ? JSON.parse(text) : {}; } catch {}
    if (!res.ok || !json.access_token) {
        throw new Error(`PayPal /v1/oauth2/token failed: ${res.status} ${text.slice(0, 400)}`);
    }
    cachedToken = { value: json.access_token, expiresAt: Date.now() + (json.expires_in || 3600) * 1000 };
    return cachedToken.value;
}

async function ppFetch(path: string, init: any = {}): Promise<any> {
    const token = init.token || (await getAccessToken());
    const res = await fetch(`${PAYPAL_API}${path}`, {
        ...init,
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json', ...(init.headers || {}) },
    });
    const text = await res.text();
    let json: any = {};
    try { json = text ? JSON.parse(text) : {}; } catch {}
    if (!res.ok) throw new Error(`PayPal ${path} failed: ${res.status} ${text.slice(0, 600)}`);
    return json;
}

async function ensureProductId(): Promise<string> {
    if (cachedProductId) return cachedProductId;
    let page = 1;
    while (page <= 5) {
        const list = await ppFetch(`/v1/catalogs/products?page=${page}&page_size=20`);
        const found = (list.products || []).find((p: any) => p.name === PRODUCT_NAME);
        if (found) { cachedProductId = found.id; return found.id; }
        if (!list.products || list.products.length < 20) break;
        page++;
    }
    const created = await ppFetch('/v1/catalogs/products', {
        method: 'POST',
        body: JSON.stringify({ name: PRODUCT_NAME, description: 'AI-generated website hosting subscription', type: 'SERVICE', category: 'SOFTWARE' }),
    });
    cachedProductId = created.id;
    return created.id!;
}

async function findExistingPlanId(productId: string, planName: string): Promise<string | null> {
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
            billing_cycles: [{
                frequency: { interval_unit: p.interval, interval_count: 1 },
                tenure_type: 'REGULAR',
                sequence: 1,
                total_cycles: 0,
                pricing_scheme: { fixed_price: { value: p.amount, currency_code: p.currency } },
            }],
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

async function resolvePlanId(region: Region, tier: Tier | undefined, plan: Plan): Promise<{ planId: string; pricing: Pricing }> {
    const pricing = getPricing(region, tier, plan);
    const cached = cachedPlanIds.get(pricing.planName);
    if (cached) return { planId: cached, pricing };
    const productId = await ensureProductId();
    const existing = await findExistingPlanId(productId, pricing.planName);
    const id = existing || (await createPlan(productId, pricing));
    cachedPlanIds.set(pricing.planName, id);
    return { planId: id, pricing };
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
        const { region, tier, plan } = req.body || {};
        if (!VALID_REGIONS.includes(region)) return res.status(400).json({ error: 'invalid region' });
        if (plan !== 'monthly' && plan !== 'yearly') return res.status(400).json({ error: 'invalid plan' });
        const usesTier = region === 'five' || region === 'home' || region === 'barberFive';
        if (usesTier && tier !== 'single' && tier !== 'multi') return res.status(400).json({ error: 'invalid tier' });
        const safeTier = usesTier ? (tier as Tier) : undefined;

        const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
        const userAgent = req.headers['user-agent'] || '';
        const ip = Array.isArray(clientIp) ? clientIp[0] : clientIp;

        const { planId, pricing } = await resolvePlanId(region as Region, safeTier, plan);

        const trimmedUA = String(userAgent).slice(0, 40);
        const customId = [
            `r=${region}`,
            safeTier ? `t=${safeTier}` : '',
            `p=${plan}`,
            `v=${pricing.value}`,
            `c=${pricing.currency}`,
            `ip=${ip}`,
            `ua=${trimmedUA}`,
        ].filter(Boolean).join('|').slice(0, 127);

        return res.status(200).json({ planId, customId, currency: pricing.currency, value: pricing.value });
    } catch (err: any) {
        console.error('[paypal-create-subscription]', err);
        return res.status(500).json({ error: err?.message || String(err) || 'internal error', stack: err?.stack?.slice(0, 1000) });
    }
}
