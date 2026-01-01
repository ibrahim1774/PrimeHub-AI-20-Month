import { Storage } from '@google-cloud/storage';

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { pendingId, companyName } = req.body;

        if (!pendingId || !companyName) {
            return res.status(400).json({ error: 'Missing pendingId or companyName' });
        }

        // 1. Fetch HTML from GCS
        const credentials = JSON.parse(process.env.GCS_CREDENTIALS || '{}');
        if (!credentials.project_id) {
            throw new Error('GCS_CREDENTIALS not configured');
        }

        const storage = new Storage({
            projectId: credentials.project_id,
            credentials,
        });
        const bucket = storage.bucket(process.env.GCS_BUCKET_NAME || '');
        const file = bucket.file(`pending/html/${pendingId}.html`);

        const [htmlBuffer] = await file.download();
        const html = htmlBuffer.toString();

        // 2. Deploy to Vercel
        const teamId = process.env.VERCEL_TEAM_ID;
        const token = process.env.VERCEL_TOKEN;

        if (!token) {
            throw new Error('VERCEL_TOKEN not configured');
        }

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

        const payload = {
            name: uniqueProjectName,
            files: [{ file: 'index.html', data: html }],
            projectSettings: { framework: null },
            target: 'production',
        };

        const deployRes = await fetch(`https://api.vercel.com/v13/deployments?teamId=${teamId || ''}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const deployData = await deployRes.json();

        if (!deployRes.ok) {
            console.error('Vercel Deploy Error:', JSON.stringify(deployData));
            throw new Error(`Vercel API Error: ${deployData.error?.message || 'Unknown error'}`);
        }

        return res.status(200).json({
            url: deployData.url,
            projectName: uniqueProjectName
        });

    } catch (error: any) {
        console.error('Deploy Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
