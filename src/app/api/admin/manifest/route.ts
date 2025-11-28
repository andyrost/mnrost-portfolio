import { NextRequest, NextResponse } from 'next/server';
import { list, put } from '@vercel/blob';

const MANIFEST_FILENAME = 'manifest.json';

interface ManifestItem {
  key: string;
  url: string;
  title: string;
  order: number;
}

interface Manifest {
  items: ManifestItem[];
}

function requireAdmin(req: NextRequest): NextResponse | null {
  const isAuthed = req.cookies.get('admin_session')?.value === '1';
  if (!isAuthed) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

// GET: Fetch manifest (public for gallery display)
export async function GET() {
  try {
    const { blobs } = await list({ prefix: MANIFEST_FILENAME });
    const manifestBlob = blobs.find(b => b.pathname === MANIFEST_FILENAME);

    if (!manifestBlob) {
      return NextResponse.json({ items: [] });
    }

    const response = await fetch(manifestBlob.url, { cache: 'no-store' });
    if (!response.ok) {
      return NextResponse.json({ items: [] });
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Failed to fetch manifest:', error);
    return NextResponse.json({ items: [] });
  }
}

// PUT: Update manifest (authenticated)
export async function PUT(req: NextRequest) {
  const unauthorized = requireAdmin(req);
  if (unauthorized) return unauthorized;

  try {
    const body = await req.json();
    const items = Array.isArray(body?.items) ? body.items : [];
    
    // Normalize and validate items
    const normalized: ManifestItem[] = items
      .filter((i: any) => i && typeof i.key === 'string')
      .map((i: any, idx: number) => ({
        key: String(i.key),
        url: String(i.url || ''),
        title: typeof i.title === 'string' ? i.title : '',
        order: Number.isFinite(i.order) ? i.order : idx,
      }));

    const manifest: Manifest = { items: normalized };

    // Upload/overwrite manifest
    await put(MANIFEST_FILENAME, JSON.stringify(manifest, null, 2), {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to update manifest:', error);
    return NextResponse.json({ error: 'Failed to update manifest' }, { status: 500 });
  }
}
