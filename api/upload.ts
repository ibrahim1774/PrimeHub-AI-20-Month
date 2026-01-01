import { Storage } from '@google-cloud/storage';

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb', // Support large base64 images
    },
  },
};

export default async function handler(req: Request | any, res: Response | any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image, filename } = req.body;

    if (!image || !filename) {
      return res.status(400).json({ error: 'Missing image or filename' });
    }

    // 1. Initialize Storage
    const credentialsJson = process.env.GCS_CREDENTIALS;
    const bucketName = process.env.GCS_BUCKET_NAME;

    if (!credentialsJson || !bucketName) {
      throw new Error('Server misconfiguration: Missing GCS credentials or bucket name');
    }

    // Handle potential escaped newlines in private key if passed as string
    let credentials;
    try {
      credentials = JSON.parse(credentialsJson);
    } catch (e) {
      console.error("Failed to parse GCS_CREDENTIALS JSON", e);
      return res.status(500).json({ error: 'Invalid server credentials format' });
    }

    const storage = new Storage({
      projectId: credentials.project_id,
      credentials,
    });

    const bucket = storage.bucket(bucketName);
    const file = bucket.file(filename);

    // 2. Prepare Buffer (strip base64 prefix if present)
    const base64Data = image.replace(/^data:image\/\w+;base64,/, "");
    const buffer = Buffer.from(base64Data, 'base64');

    // 3. Upload
    let contentType = 'image/png';
    if (filename.endsWith('.json')) contentType = 'application/json';
    if (filename.endsWith('.html')) contentType = 'text/html';

    await file.save(buffer, {
      metadata: {
        contentType,
        cacheControl: 'public, max-age=31536000',
      },
    });

    // 4. Make Public (if bucket not uniform public) is tricky with Service Accounts.
    // Usually best to set bucket to public read, or use signed URLs. 
    // User implying public hosting: "intended location where it's the stripe link" ?? No, "location where its the stripe link" might mean payment?
    // User said: "send the images to Google Cloud Console... replace with the images... so the generated site... claims..."
    // We will assume the bucket objects are public readable.

    // We can try to make it public explicitly:
    try {
      await file.makePublic();
    } catch (e) {
      console.warn("Could not make file public (might be bucket policy restrictions):", e);
    }

    const publicUrl = `https://storage.googleapis.com/${bucketName}/${filename}`;

    return res.status(200).json({ url: publicUrl });
  } catch (error: any) {
    console.error('Upload Error:', error);
    return res.status(500).json({ error: error.message });
  }
}
