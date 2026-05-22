import Stripe from 'stripe';
import crypto from 'crypto';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-01-27.acacia' as any,
});

// Server-side InitiateCheckout firing for Meta + TikTok CAPI. Uses
// the same event_id as the browser pixel call so each platform
// dedupes browser ↔ server. Fire-and-forget — never blocks the
// Stripe session response.
const FB_PIXEL_ID = process.env.FB_PIXEL_ID || '26490568997297314';
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;
const TIKTOK_PIXEL_ID = process.env.TIKTOK_PIXEL_ID || 'D81SNARC77UATASKVG10';
const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN;
const TIKTOK_TEST_EVENT_CODE = process.env.TIKTOK_TEST_EVENT_CODE;

async function fireFbInitiateCheckoutCAPI(opts: { eventId: string; value: number; currency: string; clientIp?: string; userAgent?: string; eventSourceUrl?: string; contentName?: string; }) {
    if (!FB_ACCESS_TOKEN) return;
    try {
        const body = {
            data: [{
                event_name: 'InitiateCheckout',
                event_time: Math.floor(Date.now() / 1000),
                event_id: opts.eventId,
                event_source_url: opts.eventSourceUrl,
                action_source: 'website',
                user_data: {
                    client_ip_address: opts.clientIp,
                    client_user_agent: opts.userAgent,
                },
                custom_data: {
                    currency: (opts.currency || 'USD').toUpperCase(),
                    value: opts.value,
                    ...(opts.contentName ? { content_name: opts.contentName, content_category: 'subscription' } : {}),
                },
            }],
        };
        await fetch(`https://graph.facebook.com/v18.0/${FB_PIXEL_ID}/events?access_token=${FB_ACCESS_TOKEN}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
    } catch (e) {
        console.error('[FB CAPI InitiateCheckout]', e);
    }
}

async function fireTikTokInitiateCheckoutCAPI(opts: { eventId: string; value: number; currency: string; clientIp?: string; userAgent?: string; eventSourceUrl?: string; contentName?: string; }) {
    if (!TIKTOK_ACCESS_TOKEN) return;
    try {
        const body: any = {
            event_source: 'web',
            event_source_id: TIKTOK_PIXEL_ID,
            ...(TIKTOK_TEST_EVENT_CODE ? { test_event_code: TIKTOK_TEST_EVENT_CODE } : {}),
            data: [{
                event: 'InitiateCheckout',
                event_time: Math.floor(Date.now() / 1000),
                event_id: opts.eventId,
                user: {
                    ip: opts.clientIp,
                    user_agent: opts.userAgent,
                },
                properties: {
                    currency: (opts.currency || 'USD').toUpperCase(),
                    value: opts.value,
                    ...(opts.contentName ? { content_name: opts.contentName } : {}),
                },
                page: { url: opts.eventSourceUrl },
            }],
        };
        await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Access-Token': TIKTOK_ACCESS_TOKEN },
            body: JSON.stringify(body),
        });
    } catch (e) {
        console.error('[TikTok CAPI InitiateCheckout]', e);
    }
}

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const {
            pendingId, companyName, plan = 'monthly', source, embedded, tier,
            // Browser pixel passes these through so server CAPI can dedupe.
            initiateCheckoutEventId,
            initiateCheckoutValue,
            initiateCheckoutCurrency,
            initiateCheckoutContentName,
        } = req.body;
        // suppress unused-var lint until we wire it (kept for future use).
        void crypto;

        const isAus = source === 'australia';
        const isTen = source === 'ten';
        const isFive = source === 'five';
        const isBarberFive = source === 'barberFive';
        const isBarberFiveMonth = source === 'barberFiveMonth';
        const isBarberTrial = source === 'barberTrial';
        const isBarberSample = source === 'barberSample';
        const isBarberGenerator = source === 'barberGenerator';
        const isBarber19 = source === 'barber19';
        const isBarber19Hosting = source === 'barber19Hosting';
        const isBarberNine = source === 'barberNine';
        const isBarberTwentyNine = source === 'barberTwentyNine';
        const isLocalbusinessNine = source === 'localbusinessNine';
        const isLocalbusinessNineSpanish = source === 'localbusinessNineSpanish';
        const isBarberFiveNine = source === 'barberFiveNine';
        const isLocalbusinessVoice = source === 'localbusinessVoice';
        const isNineteen = source === 'nineteen';
        const isBarber = source === 'barber';
        const isLocalBusiness = source === 'localbusiness';
        const isHome = source === 'home';
        const isDenmark = source === 'denmark';
        const isLocalbusiness29 = source === 'localbusiness29';
        const isLocalbusiness9 = source === 'localbusiness9';
        const isDirectory = source === 'directory' || isAus || isTen || isFive || isBarberFive || isBarberFiveMonth || isBarberTrial || isBarberSample || isBarberGenerator || isBarber19 || isBarber19Hosting || isBarberNine || isBarberTwentyNine || isLocalbusinessNine || isLocalbusinessNineSpanish || isBarberFiveNine || isLocalbusinessVoice || isNineteen || isBarber || isLocalBusiness || isHome || isDenmark || isLocalbusiness29 || isLocalbusiness9;

        if (!isDirectory && !pendingId) {
            return res.status(400).json({ error: 'Missing pendingId' });
        }

        const homeTier: 'single' | 'multi' = isHome ? (tier === 'single' ? 'single' : 'multi') : 'multi';
        const denmarkTier: 'single' | 'multi' = isDenmark ? (tier === 'single' ? 'single' : 'multi') : 'multi';
        const localbusiness29Tier: 'single' | 'multi' = isLocalbusiness29 ? (tier === 'multi' ? 'multi' : 'single') : 'single';
        const localbusiness9Tier: 'single' | 'multi' = isLocalbusiness9 ? (tier === 'multi' ? 'multi' : 'single') : 'single';
        const fiveTier: 'single' | 'multi' = isFive ? (tier === 'multi' ? 'multi' : 'single') : 'single';
        const barberFiveTier: 'single' | 'multi' = isBarberFive ? (tier === 'multi' ? 'multi' : 'single') : 'single';
        const barberFiveMonthTier: 'single' | 'multi' = isBarberFiveMonth ? (tier === 'multi' ? 'multi' : 'single') : 'single';
        const barberTrialTier: 'single' | 'multi' = isBarberTrial ? (tier === 'multi' ? 'multi' : 'single') : 'single';
        const barberSampleTier: 'single' | 'multi' = isBarberSample ? (tier === 'multi' ? 'multi' : 'single') : 'single';
        const barberGeneratorTier: 'single' | 'multi' = isBarberGenerator ? (tier === 'multi' ? 'multi' : 'single') : 'single';
        const barber19Tier: 'single' | 'multi' = isBarber19 ? (tier === 'multi' ? 'multi' : 'single') : 'single';
        const barberNineTier: 'single' | 'multi' = isBarberNine ? (tier === 'multi' ? 'multi' : 'single') : 'single';
        const barberTwentyNineTier: 'single' | 'multi' = isBarberTwentyNine ? (tier === 'multi' ? 'multi' : 'single') : 'single';
        const localbusinessNineTier: 'single' | 'multi' = isLocalbusinessNine ? (tier === 'multi' ? 'multi' : 'single') : 'single';
        const localbusinessNineSpanishTier: 'single' | 'multi' = isLocalbusinessNineSpanish ? (tier === 'multi' ? 'multi' : 'single') : 'single';
        const barberFiveNineTier: 'single' | 'multi' = 'single';
        const localbusinessVoiceTier: 'single' | 'multi' = 'single';

        // /19 + /barber-19 + /barber-29 + /localbusiness-29 are one-time payments, no subscription, no yearly variant
        const isOneTime = isNineteen || isBarber19 || isBarberTwentyNine || isLocalbusiness29;
        const isYearly = !isOneTime && plan === 'yearly';
        const yearlyAmountCents = isLocalbusinessVoice ? 2900 : isBarberFiveNine ? 5000 : isLocalbusinessNineSpanish ? (localbusinessNineSpanishTier === 'multi' ? 13700 : 6500) : isLocalbusinessNine ? (localbusinessNineTier === 'multi' ? 13700 : 6500) : isBarberNine ? (barberNineTier === 'multi' ? 6500 : 3600) : isBarber19Hosting ? 3600 : isBarberGenerator ? (barberGeneratorTier === 'multi' ? 14400 : 7200) : isBarberSample ? (barberSampleTier === 'multi' ? 7200 : 3600) : isBarberTrial ? (barberTrialTier === 'multi' ? 14400 : 7200) : isBarberFiveMonth ? (barberFiveMonthTier === 'multi' ? 7200 : 3600) : isBarberFive ? (barberFiveTier === 'multi' ? 7200 : 3600) : isFive ? (fiveTier === 'multi' ? 7200 : 3600) : isTen || isBarber ? 4900 : isLocalBusiness ? 13500 : 9900;
        const host = req.headers.host;
        const protocol = host?.includes('localhost') ? 'http' : 'https';
        const origin = `${protocol}://${host}`;
        const clientIp = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        const productName = isBarber
            ? 'Amalvera - Barbershop Website Build'
            : isBarberTwentyNine
                ? (barberTwentyNineTier === 'multi'
                    ? 'Amalvera - Custom Modern Barbershop Website Design — Multi-Page (One-Time)'
                    : 'Amalvera - Custom Modern Barbershop Website Design — Single Page (One-Time)')
            : isLocalbusiness29
                ? (localbusiness29Tier === 'multi'
                    ? 'Amalvera - Custom Local Business Website Design + Edits — Multi-Page'
                    : 'Amalvera - Custom Local Business Website Design + Edits — Single Page')
            : isLocalbusiness9
                ? (localbusiness9Tier === 'multi'
                    ? 'Amalvera - Custom Local Business Website Design + Edits — Multi-Page'
                    : 'Amalvera - Custom Local Business Website Design + Edits — Single Page')
            : isBarber19
                ? (barber19Tier === 'multi'
                    ? 'Amalvera - Custom Barbershop Website Design — Multi-Page (One-Time)'
                    : 'Amalvera - Custom Barbershop Website Design — Single Page (One-Time)')
                : isBarber19Hosting
                ? 'Amalvera - Barbershop Website Hosting'
                : isLocalBusiness
                ? 'Amalvera - Local Business Website Build'
                : isHome
                ? (homeTier === 'single' ? 'Amalvera - Single Page Website' : 'Amalvera - Multi-Service Website')
                : isDenmark
                ? (denmarkTier === 'single' ? 'Amalvera - Skræddersyet hjemmeside (Én side)' : 'Amalvera - Skræddersyet hjemmeside (Flere ydelser)')
                : isBarberTrial
                ? (barberTrialTier === 'single' ? 'Amalvera - Barbershop Website (Single Page) — 1-Day Trial' : 'Amalvera - Barbershop Website (Multi-Page + SEO) — 1-Day Trial')
                : isBarberGenerator
                ? (barberGeneratorTier === 'single' ? 'Amalvera - Barbershop Website (Single Page)' : 'Amalvera - Barbershop Website (Multi-Page + SEO)')
                : isBarberSample
                ? (barberSampleTier === 'single' ? 'Amalvera - Barbershop Website (Single Page)' : 'Amalvera - Barbershop Website (Multi-Page + SEO)')
                : isLocalbusinessNine
                ? (localbusinessNineTier === 'multi'
                    ? 'Amalvera - Custom Local Business Site (Multi-Page) — Design + Hosting + Edits'
                    : 'Amalvera - Custom Local Business Site (Single Page) — Design + Hosting + Edits')
                : isBarberFiveNine
                ? 'Amalvera - Custom Barbershop Site (Mini) — Design + Hosting'
                : isLocalbusinessVoice
                ? 'Amalvera - AI Voice Agent for Local Business — 1-Day Free Trial, then $29/mo base + usage minutes'
                : isLocalbusinessNineSpanish
                ? (localbusinessNineSpanishTier === 'multi'
                    ? 'Amalvera - Sitio Personalizado (Múltiples Páginas) — Diseño + Alojamiento + Ediciones'
                    : 'Amalvera - Sitio Personalizado (Una Página) — Diseño + Alojamiento + Ediciones')
                : isBarberNine
                ? 'Amalvera - Custom Barbershop Site (Multiple Pages + SEO Optimized) — Design + Hosting + Edits'
                : isBarberFiveMonth
                ? (barberFiveMonthTier === 'single' ? 'Amalvera - Barbershop Website (Single Page)' : 'Amalvera - Barbershop Website (Multi-Page + SEO)')
                : isBarberFive
                ? (barberFiveTier === 'single' ? 'Amalvera - Barbershop Website (Single Page)' : 'Amalvera - Barbershop Website (Multi-Page + SEO)')
                : isFive
                ? (fiveTier === 'single' ? 'Amalvera - AI Website (Single Page)' : 'Amalvera - AI Website (Multi-Page + SEO)')
                : companyName
                ? `${companyName} - ${isNineteen ? 'Custom Website Design' : isYearly ? 'Annual' : 'Premium'} ${isNineteen ? '' : 'Subscription'}`.trim()
                : `PrimeHub - ${isNineteen ? 'Custom Website Design' : isYearly ? 'Annual' : 'Premium'} ${isNineteen ? '' : 'Subscription'}`.trim();

        const directoryPath = isAus ? '/aus' : isTen ? '/10' : isFive ? '/5' : isLocalbusinessVoice ? '/localbusiness-voice' : isBarberFiveNine ? '/barber-5-9' : isLocalbusinessNineSpanish ? '/localbusiness-9-spanish' : isLocalbusinessNine ? '/localbusiness-9' : isBarberTwentyNine ? '/barber-29' : isDenmark ? '/denmark' : isLocalbusiness29 ? '/localbusiness-29' : isLocalbusiness9 ? '/localbusiness-9-monthly' : isBarberNine ? '/barber-9' : isBarberGenerator ? '/barber-generator' : isBarberSample ? '/barber-sample' : isBarberTrial ? '/barber-trial' : isBarber19Hosting ? '/barber-19-hosting' : isBarber19 ? '/barber-19' : isBarberFiveMonth ? '/barber-5-month' : isBarberFive ? '/barber-5' : isNineteen ? '/19' : isBarber ? '/barber' : isLocalBusiness ? '/local-business' : isHome ? '/' : '/1';
        const successUrl = isDirectory
            ? `${origin}${directoryPath}?status=success&session_id={CHECKOUT_SESSION_ID}&plan=${plan}${isHome ? `&tier=${homeTier}` : isDenmark ? `&tier=${denmarkTier}` : isLocalbusiness29 ? `&tier=${localbusiness29Tier}` : isLocalbusiness9 ? `&tier=${localbusiness9Tier}` : isFive ? `&tier=${fiveTier}` : isBarberGenerator ? `&tier=${barberGeneratorTier}` : isBarberSample ? `&tier=${barberSampleTier}` : isBarberTrial ? `&tier=${barberTrialTier}` : isBarberFiveMonth ? `&tier=${barberFiveMonthTier}` : isBarberFive ? `&tier=${barberFiveTier}` : isBarber19 ? `&tier=${barber19Tier}` : isBarberTwentyNine ? `&tier=${barberTwentyNineTier}` : isBarberNine ? `&tier=${barberNineTier}` : isLocalbusinessNine ? `&tier=${localbusinessNineTier}` : isLocalbusinessNineSpanish ? `&tier=${localbusinessNineSpanishTier}` : isBarberFiveNine ? `&tier=${barberFiveNineTier}` : isLocalbusinessVoice ? `&tier=${localbusinessVoiceTier}` : ''}`
            : `${origin}/generator?status=success&pendingId=${pendingId}&companyName=${encodeURIComponent(companyName)}&session_id={CHECKOUT_SESSION_ID}`;

        const cancelUrl = isDirectory
            ? `${origin}${directoryPath}?status=cancelled`
            : `${origin}/generator?status=cancelled`;

        const currency = isAus ? 'aud' : isDenmark ? 'dkk' : 'usd';
        const currencyLabel = isAus ? ' AUD' : '';

        const monthlyAmountCents = isLocalbusinessVoice ? 2900 : isBarberFiveNine ? 700 : isLocalbusinessNineSpanish ? (localbusinessNineSpanishTier === 'multi' ? 1900 : 900) : isLocalbusinessNine ? (localbusinessNineTier === 'multi' ? 1900 : 900) : isBarberNine ? (barberNineTier === 'multi' ? 900 : 500) : isBarber19Hosting ? 500 : isBarberGenerator ? (barberGeneratorTier === 'multi' ? 2000 : 1000) : isBarberSample ? (barberSampleTier === 'multi' ? 1000 : 500) : isBarberTrial ? (barberTrialTier === 'multi' ? 2000 : 1000) : isBarberFiveMonth ? (barberFiveMonthTier === 'multi' ? 1000 : 500) : isBarberFive ? (barberFiveTier === 'multi' ? 1000 : 500) : isTen || isBarber ? 1000 : isFive ? (fiveTier === 'multi' ? 1000 : 500) : isNineteen ? 1900 : isHome ? (homeTier === 'single' ? 2000 : 5000) : isDenmark ? (denmarkTier === 'single' ? 14900 : 34900) : isLocalbusiness9 ? (localbusiness9Tier === 'single' ? 900 : 1900) : 2000;
        const monthlyAmountDisplay = isLocalbusinessVoice ? '$29' : isBarberFiveNine ? '$7' : isLocalbusinessNineSpanish ? (localbusinessNineSpanishTier === 'multi' ? '$19' : '$9') : isLocalbusinessNine ? (localbusinessNineTier === 'multi' ? '$19' : '$9') : isBarberNine ? (barberNineTier === 'multi' ? '$9' : '$5') : isBarber19Hosting ? '$5' : isBarberGenerator ? (barberGeneratorTier === 'multi' ? '$20' : '$10') : isBarberSample ? (barberSampleTier === 'multi' ? '$10' : '$5') : isBarberTrial ? (barberTrialTier === 'multi' ? '$20' : '$10') : isBarberFiveMonth ? (barberFiveMonthTier === 'multi' ? '$10' : '$5') : isBarberFive ? (barberFiveTier === 'multi' ? '$10' : '$5') : isTen || isBarber ? '$10' : isFive ? (fiveTier === 'multi' ? '$10' : '$5') : isNineteen ? '$19' : isHome ? (homeTier === 'single' ? '$20' : '$50') : isDenmark ? (denmarkTier === 'single' ? '149 kr.' : '349 kr.') : isLocalbusiness9 ? (localbusiness9Tier === 'single' ? '$9' : '$19') : '$20';
        const yearlyAmountDisplay = isLocalbusinessVoice ? '$29' : isBarberFiveNine ? '$50' : isLocalbusinessNineSpanish ? (localbusinessNineSpanishTier === 'multi' ? '$137' : '$65') : isLocalbusinessNine ? (localbusinessNineTier === 'multi' ? '$137' : '$65') : isBarberNine ? (barberNineTier === 'multi' ? '$65' : '$36') : isBarber19Hosting ? '$36' : isBarberGenerator ? (barberGeneratorTier === 'multi' ? '$144' : '$72') : isBarberSample ? (barberSampleTier === 'multi' ? '$72' : '$36') : isBarberTrial ? (barberTrialTier === 'multi' ? '$144' : '$72') : isBarberFiveMonth ? (barberFiveMonthTier === 'multi' ? '$72' : '$36') : isBarberFive ? (barberFiveTier === 'multi' ? '$72' : '$36') : isFive ? (fiveTier === 'multi' ? '$72' : '$36') : isTen || isBarber ? '$49' : isLocalBusiness ? '$135' : '$99';

        // Description differs for one-time fees vs subscription pages
        const description = isLocalbusiness29
            ? (localbusiness29Tier === 'multi'
                ? `$49${currencyLabel} for a multi-page custom local business website design, with edits included.`
                : `$29${currencyLabel} for a single-page custom local business website design, with edits included.`)
            : isBarberTwentyNine
            ? (barberTwentyNineTier === 'multi'
                ? `$29${currencyLabel} one-time multi-page (5–15 pages) custom barbershop website design.`
                : `$19${currencyLabel} one-time single-page custom barbershop website design.`)
            : isBarber19
            ? (barber19Tier === 'multi'
                ? `$39${currencyLabel} one-time multi-page custom barbershop website design.`
                : `$19${currencyLabel} one-time custom barbershop website design.`)
            : isNineteen
                ? `$19${currencyLabel} for a custom website design.`
                : isLocalbusinessVoice
                    ? `1-DAY FREE TRIAL — then $29${currencyLabel}/MONTH base for your custom AI voice agent. Additional usage charges based on minutes used apply monthly and are billed separately.`
                    : isDenmark
                        ? `Betal kun ${monthlyAmountDisplay}/måned for hosting, så din skræddersyede hjemmeside er live og aktiv.`
                    : isLocalbusiness9
                        ? `${monthlyAmountDisplay}/month for a ${localbusiness9Tier === 'multi' ? 'multi-page' : 'single-page'} custom local business website design, with edits included.`
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
                        unit_amount: isBarberTwentyNine ? (barberTwentyNineTier === 'multi' ? 2900 : 1900) : isLocalbusiness29 ? (localbusiness29Tier === 'multi' ? 4900 : 2900) : isBarber19 ? (barber19Tier === 'multi' ? 3900 : 1900) : isNineteen ? 1900 : isYearly ? yearlyAmountCents : monthlyAmountCents,
                        // recurring only for subscription mode
                        ...(isOneTime ? {} : { recurring: { interval: isYearly ? 'year' : 'month' } }),
                    },
                    quantity: 1,
                },
            ],
            mode: isOneTime ? 'payment' : 'subscription',
            ...(isBarberTrial || isLocalbusinessVoice ? { subscription_data: { trial_period_days: 1 } } : {}),
            metadata: {
                pendingId: pendingId || '',
                companyName: companyName || '',
                plan: isOneTime ? 'one-time' : plan,
                source: source || 'generator',
                ...(isHome ? { tier: homeTier } : isDenmark ? { tier: denmarkTier } : isLocalbusiness29 ? { tier: localbusiness29Tier } : isLocalbusiness9 ? { tier: localbusiness9Tier } : isFive ? { tier: fiveTier } : isBarberGenerator ? { tier: barberGeneratorTier } : isBarberSample ? { tier: barberSampleTier } : isBarberTrial ? { tier: barberTrialTier } : isBarberFiveMonth ? { tier: barberFiveMonthTier } : isBarberFive ? { tier: barberFiveTier } : isBarberTwentyNine ? { tier: barberTwentyNineTier } : isBarberNine ? { tier: barberNineTier } : isLocalbusinessNine ? { tier: localbusinessNineTier } : isLocalbusinessNineSpanish ? { tier: localbusinessNineSpanishTier } : isBarberFiveNine ? { tier: barberFiveNineTier } : isLocalbusinessVoice ? { tier: localbusinessVoiceTier } : {}),
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

        // Fire-and-forget CAPI InitiateCheckout (Meta + TikTok) using
        // the same event_id the browser pixel used. We don't await —
        // visitor should never wait on third-party tracking.
        if (initiateCheckoutEventId && typeof initiateCheckoutValue === 'number') {
            const eventSourceUrl = `${origin}${directoryPath}`;
            const ipForCapi = Array.isArray(clientIp) ? clientIp[0] : (clientIp || '');
            fireFbInitiateCheckoutCAPI({
                eventId: initiateCheckoutEventId,
                value: initiateCheckoutValue,
                currency: (initiateCheckoutCurrency || 'USD'),
                clientIp: ipForCapi,
                userAgent: userAgent || '',
                eventSourceUrl,
                contentName: initiateCheckoutContentName,
            });
            fireTikTokInitiateCheckoutCAPI({
                eventId: initiateCheckoutEventId,
                value: initiateCheckoutValue,
                currency: (initiateCheckoutCurrency || 'USD'),
                clientIp: ipForCapi,
                userAgent: userAgent || '',
                eventSourceUrl,
                contentName: initiateCheckoutContentName,
            });
        }

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
