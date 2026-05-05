import { resolvePlanId, type Region } from '../lib/paypal';

const VALID_REGIONS: Region[] = ['us', 'aus', 'ten', 'five', 'barber', 'localbusiness', 'home'];

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
        const { region, tier, plan } = req.body || {};
        if (!VALID_REGIONS.includes(region)) return res.status(400).json({ error: 'invalid region' });
        if (plan !== 'monthly' && plan !== 'yearly') return res.status(400).json({ error: 'invalid plan' });
        const usesTier = region === 'five' || region === 'home';
        if (usesTier && tier !== 'single' && tier !== 'multi') return res.status(400).json({ error: 'invalid tier' });
        const safeTier = usesTier ? (tier as 'single' | 'multi') : undefined;

        const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
        const userAgent = req.headers['user-agent'] || '';
        const ip = Array.isArray(clientIp) ? clientIp[0] : clientIp;

        const { planId, pricing } = await resolvePlanId(region as Region, safeTier, plan);

        // PayPal custom_id has a 127-char limit. Pack region/tier/plan/value/currency + ip + UA.
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
        return res.status(500).json({ error: err.message || 'internal error' });
    }
}
