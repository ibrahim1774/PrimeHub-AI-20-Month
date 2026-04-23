import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-01-27.acacia' as any,
});

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { pendingId, companyName, plan = 'monthly', source, embedded } = req.body;

        const isAus = source === 'australia';
        const isTen = source === 'ten';
        const isDirectory = source === 'directory' || isAus || isTen;

        if (!isDirectory && !pendingId) {
            return res.status(400).json({ error: 'Missing pendingId' });
        }

        // /10 is monthly-only at $10 — force plan to monthly no matter what
        const isYearly = !isTen && plan === 'yearly';
        const host = req.headers.host;
        const protocol = host?.includes('localhost') ? 'http' : 'https';
        const origin = `${protocol}://${host}`;
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];

        const productName = companyName
            ? `${companyName} - ${isYearly ? 'Annual' : 'Premium'} Subscription`
            : `PrimeHub - ${isYearly ? 'Annual' : 'Premium'} Subscription`;

        const directoryPath = isAus ? '/aus' : isTen ? '/10' : '/1';
        const successUrl = isDirectory
            ? `${origin}${directoryPath}?status=success&session_id={CHECKOUT_SESSION_ID}`
            : `${origin}/?status=success&pendingId=${pendingId}&companyName=${encodeURIComponent(companyName)}&session_id={CHECKOUT_SESSION_ID}`;

        const cancelUrl = isDirectory
            ? `${origin}${directoryPath}?status=cancelled`
            : `${origin}/?status=cancelled`;

        const currency = isAus ? 'aud' : 'usd';
        const currencyLabel = isAus ? ' AUD' : '';

        const monthlyAmountCents = isTen ? 1000 : 2000;
        const monthlyAmountDisplay = isTen ? '$10' : '$20';

        // Typed as `any` because Stripe v22 narrows ui_mode per method overload,
        // blocking conditional mutation between 'hosted' and 'embedded'.
        const params: any = {
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency,
                        product_data: {
                            name: productName,
                            description: isYearly
                                ? `PAY ONLY $99${currencyLabel}/YEAR FOR WEBSITE HOSTING TO HAVE YOUR CUSTOM SITE LIVE & ACTIVE`
                                : `PAY ONLY ${monthlyAmountDisplay}${currencyLabel}/MONTH FOR WEBSITE HOSTING TO HAVE YOUR CUSTOM SITE LIVE & ACTIVE`,
                        },
                        unit_amount: isYearly ? 9900 : monthlyAmountCents,
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
        };

        if (embedded) {
            params.ui_mode = 'embedded';
            params.redirect_on_completion = 'always';
            params.return_url = successUrl;
        } else {
            params.success_url = successUrl;
            params.cancel_url = cancelUrl;
        }

        const session = await stripe.checkout.sessions.create(params);

        return res.status(200).json(
            embedded
                ? { clientSecret: session.client_secret }
                : { url: session.url }
        );
    } catch (error: any) {
        console.error('Stripe Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
