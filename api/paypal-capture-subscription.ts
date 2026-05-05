import { getSubscription, regionToPath, type Region } from '../lib/paypal';

const VALID_REGIONS: Region[] = ['us', 'aus', 'ten', 'five', 'barber', 'localbusiness', 'home'];

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
        return res.status(500).json({ error: err.message || 'internal error' });
    }
}
