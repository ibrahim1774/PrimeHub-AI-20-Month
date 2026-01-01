
export const config = {
    api: {
        bodyParser: {
            sizeLimit: '4mb', // HTML content might be large
        },
    },
};

export default async function handler(req: any, res: any) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { html, companyName, subdomain } = req.body;

        if (!html || !companyName) {
            return res.status(400).json({ error: 'Missing html content or company name' });
        }

        const teamId = process.env.VERCEL_TEAM_ID;
        const token = process.env.VERCEL_TOKEN;
        // const projectName = process.env.PROJECT_NAME || 'primehub-sites'; 
        // User provided PROJECT_NAME: primehub-sites. We should probably deploy to THIS project or specific project?
        // "deploy within my Vercel" 
        // If we want a SEPARATE deployment for each user, we create a deployment under the 'primehub-sites' project.

        const projectName = process.env.PROJECT_NAME || 'primehub-sites';

        if (!teamId || !token) {
            throw new Error("Missing Vercel credentials (VERCEL_TOKEN / VERCEL_TEAM_ID)");
        }

        // Sanitize filename
        const safeName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '-');
        const deploymentName = `site-${safeName}`;

        // Construct Vercel Deployment Payload
        // See: https://vercel.com/docs/rest-api/endpoints/deployments#create-a-new-deployment
        const payload = {
            name: projectName, // MUST match the project name in Vercel to inherit settings/domain
            files: [
                {
                    file: 'index.html',
                    data: html,
                },
            ],
            projectSettings: {
                framework: null, // Static site
            },
            target: 'production', // or 'preview'
            meta: {
                company: companyName,
                generatedBy: 'PrimeHub-AI',
            },
        };

        const response = await fetch(`https://api.vercel.com/v13/deployments?teamId=${teamId}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Vercel API Error:', errorText);
            throw new Error(`Vercel Deployment Failed: ${errorText}`);
        }

        const data = await response.json();
        return res.status(200).json(data);

    } catch (error: any) {
        console.error('Deploy Error:', error);
        return res.status(500).json({ error: error.message });
    }
}
