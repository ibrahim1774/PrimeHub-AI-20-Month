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

// ─── Google Business Profile ────────────────────────────────

function extractPlaceIdFromUrl(url: string): string | null {
  // Try ChIJ... format from data param
  const chiMatch = url.match(/!1s(0x[a-f0-9]+:[a-f0-9]+)/i) || url.match(/(ChI[a-zA-Z0-9_-]+)/);
  if (chiMatch) return chiMatch[1];

  // Try place_id= query param
  const paramMatch = url.match(/place_id=([^&]+)/);
  if (paramMatch) return paramMatch[1];

  return null;
}

async function extractFromGoogle(
  url: string,
  companyName: string,
  serviceArea: string
): Promise<Partial<ExtractedContent>> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY || process.env.GOOGLE_SEARCH_API_KEY;
  if (!apiKey) {
    console.warn('[Extractor] No Google API key available for Places API');
    return {};
  }

  try {
    // Step 1: Resolve place ID
    let placeId = extractPlaceIdFromUrl(url);

    if (!placeId) {
      // Text Search to find the business
      const searchQuery = encodeURIComponent(`${companyName} ${serviceArea}`);
      const searchRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${searchQuery}&inputtype=textquery&fields=place_id&key=${apiKey}`,
        { signal: AbortSignal.timeout(10000) }
      );
      const searchData = await searchRes.json();
      if (searchData.candidates?.[0]?.place_id) {
        placeId = searchData.candidates[0].place_id;
      }
    }

    if (!placeId) {
      console.warn('[Extractor] Could not resolve Google place ID');
      return {};
    }

    // Step 2: Place Details
    const fields = 'name,formatted_address,editorial_summary,photos,reviews,rating,opening_hours,types';
    const detailsRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=${fields}&key=${apiKey}`,
      { signal: AbortSignal.timeout(10000) }
    );
    const detailsData = await detailsRes.json();
    const place = detailsData.result;

    if (!place) return {};

    const result: Partial<ExtractedContent> = { source: ['google'] };

    // Description
    if (place.editorial_summary?.overview) {
      result.businessDescription = place.editorial_summary.overview;
    }

    // Rating
    if (place.rating) {
      result.rating = `${place.rating}/5`;
    }

    // Hours
    if (place.opening_hours?.weekday_text) {
      result.hours = place.opening_hours.weekday_text.join(', ');
    }

    // Services from types
    if (place.types?.length) {
      result.services = place.types
        .filter((t: string) => !['point_of_interest', 'establishment', 'political', 'geocode'].includes(t))
        .map((t: string) => t.replace(/_/g, ' '));
    }

    // Reviews
    if (place.reviews?.length) {
      result.reviewSnippets = place.reviews
        .slice(0, 5)
        .filter((r: any) => r.rating >= 4 && r.text)
        .map((r: any) => {
          const text = r.text.length > 150 ? r.text.substring(0, 150) + '...' : r.text;
          return text;
        });
    }

    // Photos — download up to 6, upload to GCS
    if (place.photos?.length) {
      const photoRefs = place.photos.slice(0, 6);
      const companySlug = slugify(companyName);
      const timestamp = Date.now();

      const photoPromises = photoRefs.map(async (photo: any, i: number) => {
        const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=1200&photo_reference=${photo.photo_reference}&key=${apiKey}`;
        const buffer = await downloadImage(photoUrl);
        if (!buffer) return null;
        const gcsFilename = `extracted/${companySlug}_google_${i}_${timestamp}.jpg`;
        return uploadImageToGCS(buffer, gcsFilename);
      });

      const photoUrls = await Promise.all(photoPromises);
      result.photos = photoUrls.filter((u): u is string => u !== null);
    }

    return result;
  } catch (err) {
    console.error('[Extractor] Google extraction failed:', err);
    return {};
  }
}

// ─── Instagram ──────────────────────────────────────────────

function parseInstagramHandle(input: string): string | null {
  // Handle @handle format
  if (input.startsWith('@')) return input.slice(1);
  // Handle URL format
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
    // Fetch public profile page server-side
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
  companyName: string,
  serviceArea: string
): Promise<ExtractedContent> {
  const tasks: Promise<Partial<ExtractedContent>>[] = [];

  if (profileLinks.googleBusiness?.trim()) {
    tasks.push(extractFromGoogle(profileLinks.googleBusiness.trim(), companyName, serviceArea));
  }
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
    services: [],
    reviewSnippets: [],
  };

  for (const result of results) {
    if (result.status !== 'fulfilled') continue;
    const data = result.value;

    if (data.source) merged.source.push(...data.source);
    if (data.photos?.length) merged.photos!.push(...data.photos);
    if (data.services?.length) merged.services!.push(...data.services);
    if (data.reviewSnippets?.length) merged.reviewSnippets!.push(...data.reviewSnippets);
    if (data.businessDescription && !merged.businessDescription) {
      merged.businessDescription = data.businessDescription;
    }
    if (data.rating && !merged.rating) merged.rating = data.rating;
    if (data.hours && !merged.hours) merged.hours = data.hours;
  }

  // Limit photos to 10
  if (merged.photos!.length > 10) merged.photos = merged.photos!.slice(0, 10);

  // Clean empty arrays
  if (!merged.photos!.length) delete merged.photos;
  if (!merged.services!.length) delete merged.services;
  if (!merged.reviewSnippets!.length) delete merged.reviewSnippets;

  console.log(`[Extractor] Extraction complete. Sources: ${merged.source.join(', ')}. Photos: ${merged.photos?.length || 0}`);

  return merged;
}
