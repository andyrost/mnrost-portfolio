// /app/api/gallery/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { list, put } from '@vercel/blob';

const MANIFEST_FILENAME = 'manifest.json';

interface ManifestItem {
  key: string;      // blob pathname (unique identifier)
  url: string;      // public blob URL
  title: string;
  order: number;
}

interface Manifest {
  items: ManifestItem[];
}

// Helper to get the manifest
async function getManifest(): Promise<Manifest> {
  try {
    const { blobs } = await list({ prefix: MANIFEST_FILENAME });
    const manifestBlob = blobs.find(b => b.pathname === MANIFEST_FILENAME);
    
    if (!manifestBlob) {
      return { items: [] };
    }
    
    const response = await fetch(manifestBlob.url, { cache: 'no-store' });
    if (!response.ok) {
      return { items: [] };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching manifest:', error);
    return { items: [] };
  }
}

// GET: List all images with manifest data
export async function GET() {
  try {
    const [{ blobs }, manifest] = await Promise.all([
      list({ prefix: 'portfolio/' }),
      getManifest()
    ]);

    // Create a map for quick lookup
    const manifestMap = new Map(
      manifest.items.map(item => [item.key, item])
    );

    // Filter to only image files and enrich with manifest data
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    const images = blobs
      .filter(blob => {
        const ext = blob.pathname.toLowerCase().slice(blob.pathname.lastIndexOf('.'));
        return imageExtensions.includes(ext);
      })
      .map(blob => {
        const manifestItem = manifestMap.get(blob.pathname);
        return {
          pathname: blob.pathname,
          url: blob.url,
          uploadedAt: blob.uploadedAt,
          size: blob.size,
          title: manifestItem?.title || blob.pathname.split('/').pop()?.replace(/\.[^.]+$/, '') || 'Untitled',
          order: manifestItem?.order ?? 999999,
        };
      })
      .sort((a, b) => a.order - b.order);

    return NextResponse.json({ images });
  } catch (error) {
    console.error('Blob API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images' },
      { status: 500 }
    );
  }
}

// POST: Upload a new image (authenticated)
export async function POST(req: NextRequest) {
  try {
    const isAuthed = req.cookies.get('admin_session')?.value === '1';
    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const title = (formData.get('title') as string) || '';

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
    }

    // Generate a unique filename
    const ext = file.name.split('.').pop() || 'jpg';
    const slug = title
      ? title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 50)
      : `image-${Date.now()}`;
    const pathname = `portfolio/${slug}-${Date.now()}.${ext}`;

    // Upload to Vercel Blob
    const blob = await put(pathname, file, {
      access: 'public',
      addRandomSuffix: false,
    });

    // Update manifest
    const manifest = await getManifest();
    const maxOrder = manifest.items.reduce((max, item) => Math.max(max, item.order), -1);
    
    manifest.items.push({
      key: blob.pathname,
      url: blob.url,
      title: title || 'Untitled',
      order: maxOrder + 1,
    });

    // Save updated manifest (overwrite existing)
    await put(MANIFEST_FILENAME, JSON.stringify(manifest, null, 2), {
      access: 'public',
      addRandomSuffix: false,
      allowOverwrite: true,
    });

    return NextResponse.json({
      success: true,
      image: {
        pathname: blob.pathname,
        url: blob.url,
        title: title || 'Untitled',
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Failed to upload image' }, { status: 500 });
  }
}
