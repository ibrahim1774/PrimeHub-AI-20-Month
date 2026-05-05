// Self-contained — see paypal-create-subscription.ts for the why.

const PAYPAL_API = 'https://api-m.paypal.com';

type Region = 'us' | 'aus' | 'ten' | 'five' | 'barber' | 'localbusiness' | 'home';
const VALID_REGIONS: Region[] = ['us', 'aus', 'ten', 'five', 'barber', 'localbusiness', 'home'];

function regionToPath(region: Region): string {
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

let cachedToken: { value: string; expiresAt: number } | null = null;

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
    if (!res.ok || !json.access_token) throw new Error(`PayPal /v1/oauth2/token failed: ${res.status} ${text.slice(0, 400)}`);
    cachedToken = { value: json.access_token, expiresAt: Date.now() + (json.expires_in || 3600) * 1000 };
    return cachedToken.value;
}

async function getSubscription(subscriptionId: string): Promise<any> {
    const token = await getAccessToken();
    const res = await fetch(`${PAYPAL_API}/v1/billing/subscriptions/${encodeURIComponent(subscriptionId)}`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const text = await res.text();
    let json: any = {};
    try { json = text ? JSON.parse(text) : {}; } catch {}
    if (!res.ok) throw new Error(`PayPal /v1/billing/subscriptions failed: ${res.status} ${text.slice(0, 400)}`);
    return json;
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
        const { subscriptionID, region, tier, plan } = req.body || {};
        if (!subscriptionID) return res.status(400).json({ error: 'missing subscriptionID' });
        if (!VALID_REGIONS.includes(region)) return res.status(400).json({ error: 'invalid region' });
        if (plan !== 'monthly' && plan !== 'yearly') return res.status(400).json({ error: 'invalid plan' });
        const usesTier = region === 'five' || region === 'home';
        if (usesTier && tier !== 'single' && tier !== 'multi') return res.status(400).json({ error: 'invalid tier' });

        const sub = await getSubscription(subscriptionID);
        if (!sub || (sub.status !== 'ACTIVE' && sub.status !== 'APPROVAL_PENDING' && sub.status !== 'APPROVED')) {
            return res.status(400).json({ error: `subscription not active (status=${sub?.status})` });
        }

        const host = req.headers.host;
        const protocol = host?.includes('localhost') ? 'http' : 'https';
        const origin = `${protocol}://${host}`;
        const tierQ = usesTier ? `&tier=${tier}` : '';
        const redirect = `${origin}${regionToPath(region as Region)}?status=success&session_id=${encodeURIComponent(subscriptionID)}&plan=${plan}${tierQ}&provider=paypal`;
        return res.status(200).json({ ok: true, redirect });
    } catch (err: any) {
        console.error('[paypal-capture-subscription]', err);
        return res.status(500).json({ error: err?.message || String(err) || 'internal error', stack: err?.stack?.slice(0, 1000) });
    }
}
