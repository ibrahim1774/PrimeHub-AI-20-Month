import { resolvePlanId } from './_paypal';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
    try {
        const { tier, plan } = req.body || {};
        if (tier !== 'single' && tier !== 'multi') return res.status(400).json({ error: 'invalid tier' });
        if (plan !== 'monthly' && plan !== 'yearly') return res.status(400).json({ error: 'invalid plan' });

        const clientIp = req.headers['x-forwarded-for'] || req.socket?.remoteAddress || '';
        const userAgent = req.headers['user-agent'] || '';
        const ip = Array.isArray(clientIp) ? clientIp[0] : clientIp;

        const planId = await resolvePlanId(tier, plan);
        // PayPal custom_id has a 127-char limit. Keep IP + truncated UA.
        const trimmedUA = String(userAgent).slice(0, 60);
        const customId = `tier=${tier}|plan=${plan}|source=five|ip=${ip}|ua=${trimmedUA}`.slice(0, 127);

        return res.status(200).json({ planId, customId });
    } catch (err: any) {
        console.error('[paypal-create-subscription]', err);
        return res.status(500).json({ error: err.message || 'internal error' });
    }
}
