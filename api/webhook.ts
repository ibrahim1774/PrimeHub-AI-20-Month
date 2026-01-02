import Stripe from 'stripe';
import { Storage } from '@google-cloud/storage';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
    apiVersion: '2025-01-27.acacia' as any,
});

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

        console.log(`[Webhook] Payment confirmed for: ${companyName} (Pending ID: ${pendingId})`);

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
