// Returns the public PayPal client ID so the frontend can load the SDK
// without duplicating the env var as a VITE_* build-time constant.

export default async function handler(req: any, res: any) {
    if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });
    const clientId = process.env.PAYPAL_CLIENT_ID;
    if (!clientId) return res.status(500).json({ error: 'PAYPAL_CLIENT_ID not configured' });
    res.setHeader('Cache-Control', 'public, max-age=300');
    return res.status(200).json({ clientId });
}
