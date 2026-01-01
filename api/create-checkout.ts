import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-01-27.acacia' as any,
});

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { pendingId, companyName } = req.body;

        if (!pendingId) {
            return res.status(400).json({ error: 'Missing pendingId' });
        }

        const host = req.headers.host;
        const protocol = host?.includes('localhost') ? 'http' : 'https';
        const origin = `${protocol}://${host}`;

        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
                {
                    price_data: {
                        currency: 'usd',
                        product_data: {
                            name: `Website Claim: ${companyName}`,
                            description: 'Professional contractor website generation and hosting setup.',
                        },
                        unit_amount: 4900, // $49.00 - Adjust as needed
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            metadata: {
                pendingId,
                companyName,
            },
            success_url: `${origin}/?status=success&session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${origin}/?status=cancelled`,
        });

        return res.status(200).json({ url: session.url });
    } catch (error: any) {
        console.error('Stripe Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
