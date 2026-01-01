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

        if (pendingId) {
            console.log(`Processing payment for site: ${pendingId}`);

            try {
                // 1. Fetch HTML from GCS
                const credentials = JSON.parse(process.env.GCS_CREDENTIALS as string);
                const storage = new Storage({
                    projectId: credentials.project_id,
                    credentials,
                });
                const bucket = storage.bucket(process.env.GCS_BUCKET_NAME as string);
                const file = bucket.file(`pending/html/${pendingId}.html`);

                const [htmlBuffer] = await file.download();
                const html = htmlBuffer.toString();

                // 2. Deploy to Vercel
                const teamId = process.env.VERCEL_TEAM_ID;
                const token = process.env.VERCEL_TOKEN;
                const projectName = process.env.PROJECT_NAME || 'primehub-sites';

                const payload = {
                    name: projectName,
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

                if (!deployRes.ok) {
                    throw new Error(`Vercel Deploy Error: ${await deployRes.text()}`);
                }

                console.log(`Successfully deployed site for ${companyName}`);

                // Optional: Cleanup the pending HTML file
                // await file.delete();

            } catch (deployErr: any) {
                console.error(`Deployment failed after payment: ${deployErr.message}`);
                // We might want to notify the admin here
            }
        }
    }

    res.json({ received: true });
}
