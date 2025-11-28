import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Using Cloudinary RAW resource as a simple manifest store
// public_id: manifests/portfolio.json

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Missing Cloudinary environment variables');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const MANIFEST_PUBLIC_ID = 'manifests/portfolio';

function requireAdmin(req: NextRequest): NextResponse | null {
  const isAuthed = req.cookies.get('admin_session')?.value === '1';
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

function emptyManifest() {
  return { items: [] as Array<{ key: string; title: string; order: number }> };
}

export async function GET() {
  try {
    // Try to fetch manifest; if not exists, return empty
    const res = await cloudinary.api.resources_by_ids([MANIFEST_PUBLIC_ID], { resource_type: 'raw' });
    const asset = res?.resources?.[0];
    if (!asset) {
      return NextResponse.json(emptyManifest());
    }
    const url = (asset as any).secure_url as string;
    const resp = await fetch(url, { cache: 'no-store' });
    if (!resp.ok) {
      return NextResponse.json(emptyManifest());
    }
    const data = await resp.json();
    return NextResponse.json(data || emptyManifest());
  } catch (e) {
    return NextResponse.json(emptyManifest());
  }
}

export async function PUT(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    // Basic validation
    const items = Array.isArray(body?.items) ? body.items : [];
    const normalized = items
      .filter((i: any) => i && typeof i.key === 'string')
      .map((i: any, idx: number) => ({
        key: String(i.key),
        title: typeof i.title === 'string' ? i.title : '',
        order: Number.isFinite(i.order) ? i.order : idx,
      }));

    const json = JSON.stringify({ items: normalized }, null, 2);

    // Upload/overwrite raw JSON file
    await new Promise<void>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: MANIFEST_PUBLIC_ID,
          resource_type: 'raw',
          format: 'json',
          overwrite: true,
        },
        (error) => {
          if (error) return reject(error);
          resolve();
        }
      );
      uploadStream.end(Buffer.from(json, 'utf-8'));
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Failed to update manifest', e);
    return NextResponse.json({ error: 'Failed to update manifest' }, { status: 500 });
  }
}


