import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-01-27.acacia' as any,
});

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { pendingId, companyName, plan = 'monthly', source } = req.body;

        const isAus = source === 'australia';
        const isDirectory = source === 'directory' || isAus;

        if (!isDirectory && !pendingId) {
            return res.status(400).json({ error: 'Missing pendingId' });
        }

        const isYearly = plan === 'yearly';
        const host = req.headers.host;
        const protocol = host?.includes('localhost') ? 'http' : 'https';
        const origin = `${protocol}://${host}`;
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];

        const productName = companyName
            ? `${companyName} - ${isYearly ? 'Annual' : 'Premium'} Subscription`
            : `PrimeHub - ${isYearly ? 'Annual' : 'Premium'} Subscription`;

        const directoryPath = isAus ? '/aus' : '/1';
        const successUrl = isDirectory
            ? `${origin}${directoryPath}?status=success&session_id={CHECKOUT_SESSION_ID}`
            : `${origin}/?status=success&pendingId=${pendingId}&companyName=${encodeURIComponent(companyName)}&session_id={CHECKOUT_SESSION_ID}`;

        const cancelUrl = isDirectory
            ? `${origin}${directoryPath}?status=cancelled`
            : `${origin}/?status=cancelled`;

        const currency = isAus ? 'aud' : 'usd';
        const currencyLabel = isAus ? ' AUD' : '';

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency,
                        product_data: {
                            name: productName,
                            description: isYearly
                                ? `PAY ONLY $99${currencyLabel}/YEAR FOR WEBSITE HOSTING TO HAVE YOUR CUSTOM SITE LIVE & ACTIVE`
                                : `PAY ONLY $20${currencyLabel}/MONTH FOR WEBSITE HOSTING TO HAVE YOUR CUSTOM SITE LIVE & ACTIVE`,
                        },
                        unit_amount: isYearly ? 9900 : 2000,
                        recurring: {
                            interval: isYearly ? 'year' : 'month',
                        },
                    },
                    quantity: 1,
                },
            ],
            mode: 'subscription',
            metadata: {
                pendingId: pendingId || '',
                companyName: companyName || '',
                plan,
                source: source || 'generator',
                clientIp: Array.isArray(clientIp) ? clientIp[0] : clientIp || '',
                userAgent: userAgent || '',
            },
            success_url: successUrl,
            cancel_url: cancelUrl,
        });

        return res.status(200).json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
