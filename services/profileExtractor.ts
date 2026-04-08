import { ProfileLinks, ExtractedContent } from '../types';
import { Storage } from '@google-cloud/storage';

// ─── Helpers ────────────────────────────────────────────────

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

async function uploadImageToGCS(imageBuffer: Buffer, filename: string): Promise<string> {
  const credentialsJson = process.env.GCS_CREDENTIALS;
  const bucketName = process.env.GCS_BUCKET_NAME;
  if (!credentialsJson || !bucketName) throw new Error('Missing GCS config');

  const credentials = JSON.parse(credentialsJson);
  const storage = new Storage({ projectId: credentials.project_id, credentials });
  const bucket = storage.bucket(bucketName);
  const file = bucket.file(filename);

  await file.save(imageBuffer, {
    metadata: { contentType: 'image/jpeg', cacheControl: 'public, max-age=31536000' },
  });
  try { await file.makePublic(); } catch (_) {}

  return `https://storage.googleapis.com/${bucketName}/${filename}`;
}

async function downloadImage(url: string): Promise<Buffer | null> {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) return null;
    const arrayBuffer = await res.arrayBuffer();
    return Buffer.from(arrayBuffer);
  } catch {
    return null;
  }
}

// ─── Instagram ──────────────────────────────────────────────

function parseInstagramHandle(input: string): string | null {
  if (input.startsWith('@')) return input.slice(1);
  const match = input.match(/instagram\.com\/([a-zA-Z0-9_.]+)/);
  return match ? match[1] : input.trim();
}

async function extractFromInstagram(
  input: string,
  companyName: string
): Promise<Partial<ExtractedContent>> {
  const handle = parseInstagramHandle(input);
  if (!handle) return {};

  try {
    const res = await fetch(`https://www.instagram.com/${handle}/`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.warn(`[Extractor] Instagram returned ${res.status} for @${handle}`);
      return {};
    }

    const html = await res.text();
    const result: Partial<ExtractedContent> = { source: ['instagram'] };

    // Extract from Open Graph meta tags
    const descMatch = html.match(/<meta\s+(?:property|name)="og:description"\s+content="([^"]+)"/i)
      || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="og:description"/i);
    if (descMatch) {
      result.businessDescription = descMatch[1].replace(/&amp;/g, '&').replace(/&#x27;/g, "'");
    }

    const imgMatch = html.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/i)
      || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="og:image"/i);
    if (imgMatch) {
      const buffer = await downloadImage(imgMatch[1]);
      if (buffer) {
        const companySlug = slugify(companyName);
        const gcsUrl = await uploadImageToGCS(buffer, `extracted/${companySlug}_instagram_profile_${Date.now()}.jpg`);
        result.photos = [gcsUrl];
      }
    }

    return result;
  } catch (err) {
    console.error('[Extractor] Instagram extraction failed:', err);
    return {};
  }
}

// ─── Facebook ───────────────────────────────────────────────

async function extractFromFacebook(
  url: string,
  companyName: string
): Promise<Partial<ExtractedContent>> {
  try {
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) {
      console.warn(`[Extractor] Facebook returned ${res.status}`);
      return {};
    }

    const html = await res.text();
    const result: Partial<ExtractedContent> = { source: ['facebook'] };

    // Extract from Open Graph meta tags
    const descMatch = html.match(/<meta\s+(?:property|name)="og:description"\s+content="([^"]+)"/i)
      || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="og:description"/i);
    if (descMatch) {
      result.businessDescription = descMatch[1].replace(/&amp;/g, '&').replace(/&#x27;/g, "'");
    }

    const imgMatch = html.match(/<meta\s+(?:property|name)="og:image"\s+content="([^"]+)"/i)
      || html.match(/<meta\s+content="([^"]+)"\s+(?:property|name)="og:image"/i);
    if (imgMatch) {
      const buffer = await downloadImage(imgMatch[1]);
      if (buffer) {
        const companySlug = slugify(companyName);
        const gcsUrl = await uploadImageToGCS(buffer, `extracted/${companySlug}_facebook_cover_${Date.now()}.jpg`);
        result.photos = [gcsUrl];
      }
    }

    return result;
  } catch (err) {
    console.error('[Extractor] Facebook extraction failed:', err);
    return {};
  }
}

// ─── Main Orchestrator ──────────────────────────────────────

export async function extractFromProfiles(
  profileLinks: ProfileLinks,
  companyName: string
): Promise<ExtractedContent> {
  const tasks: Promise<Partial<ExtractedContent>>[] = [];

  if (profileLinks.instagram?.trim()) {
    tasks.push(extractFromInstagram(profileLinks.instagram.trim(), companyName));
  }
  if (profileLinks.facebook?.trim()) {
    tasks.push(extractFromFacebook(profileLinks.facebook.trim(), companyName));
  }

  const results = await Promise.allSettled(tasks);

  // Merge all successful results
  const merged: ExtractedContent = {
    source: [],
    photos: [],
  };

  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    const data = result.value;

    if (data.source) merged.source.push(...data.source);
    if (data.photos?.length) merged.photos!.push(...data.photos);
    if (data.businessDescription && !merged.businessDescription) {
      merged.businessDescription = data.businessDescription;
    }
  }

  // Clean empty arrays
  if (!merged.photos!.length) delete merged.photos;

  console.log(`[Extractor] Extraction complete. Sources: ${merged.source.join(', ')}. Photos: ${merged.photos?.length || 0}`);

  return merged;
}
