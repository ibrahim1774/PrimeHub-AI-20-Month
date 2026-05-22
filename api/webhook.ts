import Stripe from 'stripe';
import { Storage } from '@google-cloud/storage';
import crypto from 'crypto';
// Inlined PayPal helpers (kept self-contained per file to avoid Vercel
// bundler edge cases that previously caused FUNCTION_INVOCATION_FAILED).
const PAYPAL_API = 'https://api-m.paypal.com';
type Region = 'us' | 'aus' | 'ten' | 'five' | 'barber' | 'localbusiness' | 'home' | 'barberFive';
const PAYPAL_VALID_REGIONS = new Set(['us', 'aus', 'ten', 'five', 'barber', 'localbusiness', 'home', 'barberFive']);

function regionToPath(region: Region): string {
    switch (region) {
        case 'us': return '/1';
        case 'aus': return '/aus';
        case 'ten': return '/10';
        case 'five': return '/5';
        case 'barber': return '/barber';
        case 'localbusiness': return '/local-business';
        case 'home': return '/';
        case 'barberFive': return '/barber-5';
    }
}

let _paypalToken: { value: string; expiresAt: number } | null = null;
async function getPayPalAccessToken(): Promise<string> {
    if (_paypalToken && Date.now() < _paypalToken.expiresAt - 30_000) return _paypalToken.value;
    const id = process.env.PAYPAL_CLIENT_ID;
    const secret = process.env.PAYPAL_CLIENT_SECRET;
    if (!id || !secret) throw new Error('PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET not set');
    const basic = Buffer.from(`${id}:${secret}`).toString('base64');
    const r = await fetch(`${PAYPAL_API}/v1/oauth2/token`, {
        method: 'POST',
        headers: { Authorization: `Basic ${basic}`, 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=client_credentials',
    });
    const j: any = await r.json();
    if (!r.ok || !j.access_token) throw new Error(`PayPal auth failed: ${r.status}`);
    _paypalToken = { value: j.access_token, expiresAt: Date.now() + (j.expires_in || 3600) * 1000 };
    return _paypalToken.value;
}

async function verifyWebhookSignature(headers: Record<string, any>, rawBodyJsonString: string): Promise<boolean> {
    const webhookId = process.env.PAYPAL_WEBHOOK_ID;
    if (!webhookId) {
        console.warn('[paypal] PAYPAL_WEBHOOK_ID not set; skipping signature verification');
        return false;
    }
    try {
        const token = await getPayPalAccessToken();
        const body = {
            auth_algo: headers['paypal-auth-algo'],
            cert_url: headers['paypal-cert-url'],
            transmission_id: headers['paypal-transmission-id'],
            transmission_sig: headers['paypal-transmission-sig'],
            transmission_time: headers['paypal-transmission-time'],
            webhook_id: webhookId,
            webhook_event: JSON.parse(rawBodyJsonString),
        };
        const r = await fetch(`${PAYPAL_API}/v1/notifications/verify-webhook-signature`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
        });
        const j: any = await r.json();
        return j.verification_status === 'SUCCESS';
    } catch (e) {
        console.error('[paypal] verifyWebhookSignature error', e);
        return false;
    }
}

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-01-27.acacia' as any,
});

const FB_PIXEL_ID = process.env.FB_PIXEL_ID || '26490568997297314';
const FB_ACCESS_TOKEN = process.env.FB_ACCESS_TOKEN;

// TikTok Pixel ID is public (already in the browser snippet) so it's
// safe as a default. The access token MUST live in env vars.
const TIKTOK_PIXEL_ID = process.env.TIKTOK_PIXEL_ID || 'D81SNARC77UATASKVG10';
const TIKTOK_ACCESS_TOKEN = process.env.TIKTOK_ACCESS_TOKEN;
const TIKTOK_TEST_EVENT_CODE = process.env.TIKTOK_TEST_EVENT_CODE; // optional

// TikTok Events API (v1.3). Mirrors sendFBConversionsEvent above.
// Browser pixel fires 'Purchase' with the same event_id, so
// TikTok dedupes the two automatically.
async function sendTikTokConversionsEvent(pixelId: string, accessToken: string, data: any) {
    try {
        const sha256 = (text?: string) => {
            if (!text) return undefined;
            return crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex');
        };
        const body: any = {
            event_source: 'web',
            event_source_id: pixelId,
            ...(TIKTOK_TEST_EVENT_CODE ? { test_event_code: TIKTOK_TEST_EVENT_CODE } : {}),
            data: [
                {
                    event: 'Purchase',
                    event_time: Math.floor(Date.now() / 1000),
                    event_id: data.eventId,
                    user: {
                        email: sha256(data.email),
                        ip: data.clientIp,
                        user_agent: data.userAgent,
                    },
                    properties: {
                        currency: (data.currency || 'USD').toUpperCase(),
                        value: data.value,
                    },
                    page: {
                        url: data.eventSourceUrl,
                    },
                },
            ],
        };
        const response = await fetch('https://business-api.tiktok.com/open_api/v1.3/event/track/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Access-Token': accessToken,
            },
            body: JSON.stringify(body),
        });
        const result = await response.json();
        console.log('[TikTok CAPI Result]', result);
        return result;
    } catch (error) {
        console.error('[TikTok CAPI Error]', error);
    }
}

async function sendFBConversionsEvent(pixelId: string, accessToken: string, data: any) {
    try {
        const hash = (text: string) => {
            if (!text) return undefined;
            return crypto.createHash('sha256').update(text.trim().toLowerCase()).digest('hex');
        };

        const eventData = {
            data: [
                {
                    event_name: 'Purchase',
                    event_time: Math.floor(Date.now() / 1000),
                    event_id: data.eventId,
                    event_source_url: data.eventSourceUrl,
                    action_source: 'website',
                    user_data: {
                        em: data.email ? [hash(data.email)] : undefined,
                        client_ip_address: data.clientIp,
                        client_user_agent: data.userAgent,
                    },
                    custom_data: {
                        currency: (data.currency || 'USD').toUpperCase(),
                        value: data.value,
                    },
                },
            ],
        };

        const response = await fetch(`https://graph.facebook.com/v18.0/${pixelId}/events?access_token=${accessToken}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(eventData),
        });

        const result = await response.json();
        console.log('[FB CAPI Result]', result);
        return result;
    } catch (error) {
        console.error('[FB CAPI Error]', error);
    }
}

export const config = {
    api: {
        bodyParser: false,
    },
};

const buffer = async (readable: any) => {
    const chunks = [];
    for await (const chunk of readable) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    return Buffer.concat(chunks);
};

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).send('Method Not Allowed');
    }

    const sig = req.headers['stripe-signature'];
    const buf = await buffer(req);

    // Branch by signature header — PayPal uses paypal-transmission-id, Stripe uses stripe-signature.
    if (!sig && req.headers['paypal-transmission-id']) {
        return handlePayPalWebhook(req, res, buf);
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(buf, sig, process.env.STRIPE_WEBHOOK_SECRET as string);
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    if (event.type === 'checkout.session.completed') {
        const session = event.data.object as Stripe.Checkout.Session;
        const pendingId = session.metadata?.pendingId;
        const companyName = session.metadata?.companyName || 'site';
        const clientIp = session.metadata?.clientIp;
        const userAgent = session.metadata?.userAgent;
        const email = session.customer_details?.email;
        const value = (session.amount_total || 0) / 100;

        console.log(`[Webhook] Payment confirmed for: ${companyName} (Pending ID: ${pendingId})`);

        // Trigger Facebook CAPI Purchase Event (dedup via eventId = purchase_<stripe session id>)
        if (FB_ACCESS_TOKEN) {
            const source = session.metadata?.source;
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
            const isDirectory = source === 'directory' || isAus || isTen || isFive || isBarberFive || isBarberFiveMonth || isBarberTrial || isBarberSample || isBarberGenerator || isBarber19 || isBarber19Hosting || isBarberNine || isBarberTwentyNine || isLocalbusinessNine || isLocalbusinessNineSpanish || isBarberFiveNine || isLocalbusinessVoice || isNineteen || isBarber || isLocalBusiness || isHome || isDenmark || isLocalbusiness29;
            const origin = req.headers?.origin || 'https://www.amalvera.com';
            const directoryPath = isAus ? '/aus'
                : isTen ? '/10'
                : isFive ? '/5'
                : isLocalbusinessVoice ? '/localbusiness-voice'
                : isBarberFiveNine ? '/barber-5-9'
                : isLocalbusinessNineSpanish ? '/localbusiness-9-spanish'
                : isLocalbusinessNine ? '/localbusiness-9'
                : isBarberTwentyNine ? '/barber-29'
                : isBarberNine ? '/barber-9'
                : isBarberGenerator ? '/barber-generator'
                : isBarberSample ? '/barber-sample'
                : isBarberTrial ? '/barber-trial'
                : isBarber19Hosting ? '/barber-19-hosting'
                : isBarber19 ? '/barber-19'
                : isBarberFiveMonth ? '/barber-5-month'
                : isBarberFive ? '/barber-5'
                : isNineteen ? '/19'
                : isBarber ? '/barber'
                : isLocalBusiness ? '/local-business'
                : isHome ? '/'
                : isDenmark ? '/denmark'
                : isLocalbusiness29 ? '/localbusiness-29'
                : '/1';
            const eventSourceUrl = isDirectory
                ? `${origin}${directoryPath}?status=success&session_id=${session.id}`
                : `${origin}/?status=success&pendingId=${pendingId}&session_id=${session.id}`;
            sendFBConversionsEvent(FB_PIXEL_ID, FB_ACCESS_TOKEN, {
                email,
                clientIp,
                userAgent,
                value,
                currency: session.currency || 'usd',
                eventId: `purchase_${session.id}`,
                eventSourceUrl,
            });
        } else {
            console.warn('[Webhook] FB_ACCESS_TOKEN not set; skipping CAPI event');
        }

        // Trigger TikTok CAPI Purchase Event in parallel. Reuses the
        // same event_id ('purchase_<stripe session id>') as the FB
        // CAPI + TikTok pixel call so TikTok can dedupe browser ↔ server.
        if (TIKTOK_ACCESS_TOKEN) {
            const source = session.metadata?.source;
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
            const isDirectory = source === 'directory' || isAus || isTen || isFive || isBarberFive || isBarberFiveMonth || isBarberTrial || isBarberSample || isBarberGenerator || isBarber19 || isBarber19Hosting || isBarberNine || isBarberTwentyNine || isLocalbusinessNine || isLocalbusinessNineSpanish || isBarberFiveNine || isLocalbusinessVoice || isNineteen || isBarber || isLocalBusiness || isHome || isDenmark || isLocalbusiness29;
            const origin = req.headers?.origin || 'https://www.amalvera.com';
            const directoryPath = isAus ? '/aus'
                : isTen ? '/10'
                : isFive ? '/5'
                : isLocalbusinessVoice ? '/localbusiness-voice'
                : isBarberFiveNine ? '/barber-5-9'
                : isLocalbusinessNineSpanish ? '/localbusiness-9-spanish'
                : isLocalbusinessNine ? '/localbusiness-9'
                : isBarberTwentyNine ? '/barber-29'
                : isBarberNine ? '/barber-9'
                : isBarberGenerator ? '/barber-generator'
                : isBarberSample ? '/barber-sample'
                : isBarberTrial ? '/barber-trial'
                : isBarber19Hosting ? '/barber-19-hosting'
                : isBarber19 ? '/barber-19'
                : isBarberFiveMonth ? '/barber-5-month'
                : isBarberFive ? '/barber-5'
                : isNineteen ? '/19'
                : isBarber ? '/barber'
                : isLocalBusiness ? '/local-business'
                : isHome ? '/'
                : isDenmark ? '/denmark'
                : isLocalbusiness29 ? '/localbusiness-29'
                : '/1';
            const eventSourceUrl = isDirectory
                ? `${origin}${directoryPath}?status=success&session_id=${session.id}`
                : `${origin}/?status=success&pendingId=${pendingId}&session_id=${session.id}`;
            sendTikTokConversionsEvent(TIKTOK_PIXEL_ID, TIKTOK_ACCESS_TOKEN, {
                email,
                clientIp,
                userAgent,
                value,
                currency: session.currency || 'usd',
                eventId: `purchase_${session.id}`,
                eventSourceUrl,
            });
        } else {
            console.warn('[Webhook] TIKTOK_ACCESS_TOKEN not set; skipping TikTok CAPI');
        }


        if (pendingId) {
            try {
                // 1. Fetch HTML from GCS
                console.log(`[Webhook] Fetching HTML from GCS: pending/html/${pendingId}.html`);
                const credentialsJson = process.env.GCS_CREDENTIALS;
                const bucketName = process.env.GCS_BUCKET_NAME;

                if (!credentialsJson || !bucketName) {
                    throw new Error('GCS_CREDENTIALS or GCS_BUCKET_NAME missing in environment');
                }

                const credentials = JSON.parse(credentialsJson);
                const storage = new Storage({
                    projectId: credentials.project_id,
                    credentials,
                });
                const bucket = storage.bucket(bucketName);
                const file = bucket.file(`pending/html/${pendingId}.html`);

                const [htmlBuffer] = await file.download();
                const html = htmlBuffer.toString();
                console.log(`[Webhook] Successfully downloaded HTML (${html.length} bytes)`);

                // 2. Deploy to Vercel
                const teamId = process.env.VERCEL_TEAM_ID;
                const token = process.env.VERCEL_TOKEN;

                console.log(`[Webhook] Initiating Vercel Deployment for team: ${teamId || 'N/A'}`);

                // Helper to create a valid Vercel project name (slug)
                const slugify = (text: string) => {
                    return text
                        .toString()
                        .toLowerCase()
                        .trim()
                        .replace(/\s+/g, '-')
                        .replace(/[^\w-]+/g, '')
                        .replace(/--+/g, '-')
                        .replace(/^-+/, '')
                        .replace(/-+$/, '');
                };

                const uniqueProjectName = `${slugify(companyName)}-${Math.random().toString(36).substring(2, 6)}`;
                console.log(`[Webhook] Target Project: ${uniqueProjectName}`);

                const payload = {
                    name: uniqueProjectName,
                    files: [{ file: 'index.html', data: html }],
                    projectSettings: { framework: null },
                    target: 'production',
                };

                const deployRes = await fetch(`https://api.vercel.com/v13/deployments?teamId=${teamId}`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(payload),
                });

                const deployData = await deployRes.json();

                if (!deployRes.ok) {
                    console.error(`[Webhook] Vercel Deploy Error Detail:`, JSON.stringify(deployData));
                    throw new Error(`Vercel API Error: ${deployData.error?.message || 'Unknown error'}`);
                }

                // 3. Fetch the final public domain from Vercel
                let publicDomainUrl = `${uniqueProjectName}.vercel.app`;
                try {
                    const domainRes = await fetch(`https://api.vercel.com/v9/projects/${uniqueProjectName}/domains?teamId=${teamId || ''}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (domainRes.ok) {
                        const domainData = await domainRes.json();
                        if (domainData && domainData.domains && domainData.domains.length > 0) {
                            const primary = domainData.domains.find((d: any) => d.main) || domainData.domains[0];
                            publicDomainUrl = primary.name;
                        }
                    }
                } catch (e) {
                    console.error('Error fetching Vercel domain in webhook:', e);
                }

                console.log(`[Webhook] SUCCESS! Deployed at: https://${publicDomainUrl}`);

                // Optional: Cleanup the pending HTML file
                // await file.delete();

            } catch (deployErr: any) {
                console.error(`[Webhook] CRITICAL ERROR: ${deployErr.message}`);
            }
        } else {
            console.error(`[Webhook] ERROR: No pendingId found in session metadata.`);
        }
    }

    res.json({ received: true });
}

function parseCustomId(s: string | undefined): Record<string, string> {
    const out: Record<string, string> = {};
    if (!s) return out;
    for (const part of s.split('|')) {
        const eq = part.indexOf('=');
        if (eq > 0) out[part.slice(0, eq)] = part.slice(eq + 1);
    }
    return out;
}

async function handlePayPalWebhook(req: any, res: any, buf: Buffer) {
    const rawBody = buf.toString('utf8');
    let event: any;
    try {
        event = JSON.parse(rawBody);
    } catch (e) {
        return res.status(400).send('invalid json');
    }

    const ok = await verifyWebhookSignature(req.headers, rawBody);
    if (!ok) {
        console.error('[PayPal Webhook] signature verification failed');
        return res.status(400).send('signature verification failed');
    }

    const type = event.event_type;
    console.log(`[PayPal Webhook] received ${type} (id=${event.id})`);

    if (type === 'BILLING.SUBSCRIPTION.ACTIVATED') {
        const resource = event.resource || {};
        const subscriptionId = resource.id;
        const customId: string = resource.custom_id || '';
        const meta = parseCustomId(customId);
        const region = (PAYPAL_VALID_REGIONS.has(meta.r) ? meta.r : 'five') as Region;
        const usesTier = region === 'five' || region === 'home' || region === 'barberFive';
        const tier = usesTier ? ((meta.t === 'multi' ? 'multi' : 'single') as 'single' | 'multi') : undefined;
        const plan = (meta.p === 'yearly' ? 'yearly' : 'monthly') as 'monthly' | 'yearly';
        const value = Number(meta.v) || 0;
        const currency = (meta.c === 'AUD' ? 'AUD' : 'USD') as 'USD' | 'AUD';
        const email = resource.subscriber?.email_address;
        const clientIp = meta.ip;
        const userAgent = meta.ua;
        const origin = req.headers?.origin || 'https://www.amalvera.com';
        const tierQ = usesTier ? `&tier=${tier}` : '';
        const eventSourceUrl = `${origin}${regionToPath(region)}?status=success&session_id=${subscriptionId}&plan=${plan}${tierQ}&provider=paypal`;

        if (FB_ACCESS_TOKEN) {
            sendFBConversionsEvent(FB_PIXEL_ID, FB_ACCESS_TOKEN, {
                email,
                clientIp,
                userAgent,
                value,
                currency,
                eventId: `purchase_${subscriptionId}`,
                eventSourceUrl,
            });
        } else {
            console.warn('[PayPal Webhook] FB_ACCESS_TOKEN not set; skipping CAPI event');
        }
    } else if (type === 'BILLING.SUBSCRIPTION.CANCELLED' || type === 'BILLING.SUBSCRIPTION.PAYMENT.FAILED') {
        console.log(`[PayPal Webhook] ${type} for subscription ${event.resource?.id}`);
    }

    return res.json({ received: true });
}
