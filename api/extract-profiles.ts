import { extractFromProfiles } from '../services/profileExtractor';

export const config = {
  api: {
    bodyParser: { sizeLimit: '2mb' },
  },
  maxDuration: 30,
};

export default async function handler(req: Request | any, res: Response | any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { profileLinks, companyName } = req.body;

    if (!profileLinks || (!profileLinks.instagram && !profileLinks.facebook)) {
      return res.status(400).json({ error: 'No profile links provided' });
    }

    const extracted = await extractFromProfiles(
      profileLinks,
      companyName || ''
    );

    return res.status(200).json(extracted);
  } catch (error: any) {
    console.error('[Extract API] Error:', error);
    return res.status(500).json({ error: error.message || 'Extraction failed' });
  }
}
