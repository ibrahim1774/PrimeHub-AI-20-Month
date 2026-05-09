import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-01-27.acacia' as any,
});

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { pendingId, companyName, plan = 'monthly', source, embedded, tier } = req.body;

        const isAus = source === 'australia';
        const isTen = source === 'ten';
        const isFive = source === 'five';
        const isBarberFive = source === 'barberFive';
        const isBarberFiveMonth = source === 'barberFiveMonth';
        const isBarberTrial = source === 'barberTrial';
        const isBarberSample = source === 'barberSample';
        const isBarberGenerator = source === 'barberGenerator';
        const isNineteen = source === 'nineteen';
        const isBarber = source === 'barber';
        const isLocalBusiness = source === 'localbusiness';
        const isHome = source === 'home';
        const isDirectory = source === 'directory' || isAus || isTen || isFive || isBarberFive || isBarberFiveMonth || isBarberTrial || isBarberSample || isBarberGenerator || isNineteen || isBarber || isLocalBusiness || isHome;

        if (!isDirectory && !pendingId) {
            return res.status(400).json({ error: 'Missing pendingId' });
        }

        const homeTier: 'single' | 'multi' = isHome ? (tier === 'single' ? 'single' : 'multi') : 'multi';
        const fiveTier: 'single' | 'multi' = isFive ? (tier === 'multi' ? 'multi' : 'single') : 'single';
        const barberFiveTier: 'single' | 'multi' = isBarberFive ? (tier === 'multi' ? 'multi' : 'single') : 'single';
        const barberFiveMonthTier: 'single' | 'multi' = isBarberFiveMonth ? (tier === 'multi' ? 'multi' : 'single') : 'single';
        const barberTrialTier: 'single' | 'multi' = isBarberTrial ? (tier === 'multi' ? 'multi' : 'single') : 'single';
        const barberSampleTier: 'single' | 'multi' = isBarberSample ? (tier === 'multi' ? 'multi' : 'single') : 'single';
        const barberGeneratorTier: 'single' | 'multi' = isBarberGenerator ? (tier === 'multi' ? 'multi' : 'single') : 'single';

        // /19 is a one-time payment, no subscription, no yearly variant
        const isYearly = !isNineteen && plan === 'yearly';
        const yearlyAmountCents = isBarberGenerator ? (barberGeneratorTier === 'multi' ? 7200 : 3600) : isBarberSample ? (barberSampleTier === 'multi' ? 7200 : 3600) : isBarberTrial ? (barberTrialTier === 'multi' ? 14400 : 7200) : isBarberFiveMonth ? (barberFiveMonthTier === 'multi' ? 7200 : 3600) : isBarberFive ? (barberFiveTier === 'multi' ? 7200 : 3600) : isFive ? (fiveTier === 'multi' ? 7200 : 3600) : isTen || isBarber ? 4900 : isLocalBusiness ? 13500 : 9900;
        const host = req.headers.host;
        const protocol = host?.includes('localhost') ? 'http' : 'https';
        const origin = `${protocol}://${host}`;
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        const productName = isBarber
            ? 'Amalvera - Barbershop Website Build'
            : isLocalBusiness
                ? 'Amalvera - Local Business Website Build'
                : isHome
                ? (homeTier === 'single' ? 'Amalvera - Single Page Website' : 'Amalvera - Multi-Service Website')
                : isBarberTrial
                ? (barberTrialTier === 'single' ? 'Amalvera - Barbershop Website (Single Page) — 1-Day Trial' : 'Amalvera - Barbershop Website (Multi-Page + SEO) — 1-Day Trial')
                : isBarberGenerator
                ? (barberGeneratorTier === 'single' ? 'Amalvera - Barbershop Website (Single Page)' : 'Amalvera - Barbershop Website (Multi-Page + SEO)')
                : isBarberSample
                ? (barberSampleTier === 'single' ? 'Amalvera - Barbershop Website (Single Page)' : 'Amalvera - Barbershop Website (Multi-Page + SEO)')
                : isBarberFiveMonth
                ? (barberFiveMonthTier === 'single' ? 'Amalvera - Barbershop Website (Single Page)' : 'Amalvera - Barbershop Website (Multi-Page + SEO)')
                : isBarberFive
                ? (barberFiveTier === 'single' ? 'Amalvera - Barbershop Website (Single Page)' : 'Amalvera - Barbershop Website (Multi-Page + SEO)')
                : isFive
                ? (fiveTier === 'single' ? 'Amalvera - AI Website (Single Page)' : 'Amalvera - AI Website (Multi-Page + SEO)')
                : companyName
                ? `${companyName} - ${isNineteen ? 'Custom Website Design' : isYearly ? 'Annual' : 'Premium'} ${isNineteen ? '' : 'Subscription'}`.trim()
                : `PrimeHub - ${isNineteen ? 'Custom Website Design' : isYearly ? 'Annual' : 'Premium'} ${isNineteen ? '' : 'Subscription'}`.trim();

        const directoryPath = isAus ? '/aus' : isTen ? '/10' : isFive ? '/5' : isBarberGenerator ? '/barber-generator' : isBarberSample ? '/barber-sample' : isBarberTrial ? '/barber-trial' : isBarberFiveMonth ? '/barber-5-month' : isBarberFive ? '/barber-5' : isNineteen ? '/19' : isBarber ? '/barber' : isLocalBusiness ? '/local-business' : isHome ? '/' : '/1';
        const successUrl = isDirectory
            ? `${origin}${directoryPath}?status=success&session_id={CHECKOUT_SESSION_ID}&plan=${plan}${isHome ? `&tier=${homeTier}` : isFive ? `&tier=${fiveTier}` : isBarberGenerator ? `&tier=${barberGeneratorTier}` : isBarberSample ? `&tier=${barberSampleTier}` : isBarberTrial ? `&tier=${barberTrialTier}` : isBarberFiveMonth ? `&tier=${barberFiveMonthTier}` : isBarberFive ? `&tier=${barberFiveTier}` : ''}`
            : `${origin}/generator?status=success&pendingId=${pendingId}&companyName=${encodeURIComponent(companyName)}&session_id={CHECKOUT_SESSION_ID}`;

        const cancelUrl = isDirectory
            ? `${origin}${directoryPath}?status=cancelled`
            : `${origin}/generator?status=cancelled`;

        const currency = isAus ? 'aud' : 'usd';
        const currencyLabel = isAus ? ' AUD' : '';

        const monthlyAmountCents = isBarberGenerator ? (barberGeneratorTier === 'multi' ? 1000 : 500) : isBarberSample ? (barberSampleTier === 'multi' ? 1000 : 500) : isBarberTrial ? (barberTrialTier === 'multi' ? 2000 : 1000) : isBarberFiveMonth ? (barberFiveMonthTier === 'multi' ? 1000 : 500) : isBarberFive ? (barberFiveTier === 'multi' ? 1000 : 500) : isTen || isBarber ? 1000 : isFive ? (fiveTier === 'multi' ? 1000 : 500) : isNineteen ? 1900 : isHome ? (homeTier === 'single' ? 2000 : 5000) : 2000;
        const monthlyAmountDisplay = isBarberGenerator ? (barberGeneratorTier === 'multi' ? '$10' : '$5') : isBarberSample ? (barberSampleTier === 'multi' ? '$10' : '$5') : isBarberTrial ? (barberTrialTier === 'multi' ? '$20' : '$10') : isBarberFiveMonth ? (barberFiveMonthTier === 'multi' ? '$10' : '$5') : isBarberFive ? (barberFiveTier === 'multi' ? '$10' : '$5') : isTen || isBarber ? '$10' : isFive ? (fiveTier === 'multi' ? '$10' : '$5') : isNineteen ? '$19' : isHome ? (homeTier === 'single' ? '$20' : '$50') : '$20';
        const yearlyAmountDisplay = isBarberGenerator ? (barberGeneratorTier === 'multi' ? '$72' : '$36') : isBarberSample ? (barberSampleTier === 'multi' ? '$72' : '$36') : isBarberTrial ? (barberTrialTier === 'multi' ? '$144' : '$72') : isBarberFiveMonth ? (barberFiveMonthTier === 'multi' ? '$72' : '$36') : isBarberFive ? (barberFiveTier === 'multi' ? '$72' : '$36') : isFive ? (fiveTier === 'multi' ? '$72' : '$36') : isTen || isBarber ? '$49' : isLocalBusiness ? '$135' : '$99';

        // Description differs for one-time /19 vs subscription pages
        const description = isNineteen
            ? `$19${currencyLabel} for a custom website design.`
            : isYearly
                ? `PAY ONLY ${yearlyAmountDisplay}${currencyLabel}/YEAR FOR WEBSITE HOSTING TO HAVE YOUR CUSTOM SITE LIVE & ACTIVE`
                : `PAY ONLY ${monthlyAmountDisplay}${currencyLabel}/MONTH FOR WEBSITE HOSTING TO HAVE YOUR CUSTOM SITE LIVE & ACTIVE`;

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
                            description,
                        },
                        unit_amount: isNineteen ? 1900 : isYearly ? yearlyAmountCents : monthlyAmountCents,
                        // recurring only for subscription mode
                        ...(isNineteen ? {} : { recurring: { interval: isYearly ? 'year' : 'month' } }),
                    },
                    quantity: 1,
                },
            ],
            mode: isNineteen ? 'payment' : 'subscription',
            ...(isBarberTrial ? { subscription_data: { trial_period_days: 1 } } : {}),
            metadata: {
                pendingId: pendingId || '',
                companyName: companyName || '',
                plan: isNineteen ? 'one-time' : plan,
                source: source || 'generator',
                ...(isHome ? { tier: homeTier } : isFive ? { tier: fiveTier } : isBarberGenerator ? { tier: barberGeneratorTier } : isBarberSample ? { tier: barberSampleTier } : isBarberTrial ? { tier: barberTrialTier } : isBarberFiveMonth ? { tier: barberFiveMonthTier } : isBarberFive ? { tier: barberFiveTier } : {}),
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
