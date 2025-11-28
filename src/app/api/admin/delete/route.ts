import { NextRequest, NextResponse } from 'next/server';
import { del, list, put } from '@vercel/blob';

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

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

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
  } catch {
    return { items: [] };
  }
}

export async function POST(req: NextRequest) {
  const isAuthed = req.cookies.get('admin_session')?.value === '1';
  if (!isAuthed) return unauthorized();

  try {
    const { pathname } = await req.json();
    
    if (!pathname || typeof pathname !== 'string') {
      return NextResponse.json({ error: 'pathname required' }, { status: 400 });
    }

    // Delete the blob
    await del(pathname);

    // Update manifest: remove the deleted item
    const manifest = await getManifest();
    const nextItems = manifest.items.filter(item => item.key !== pathname);

    // Re-normalize order values
    const normalized = nextItems.map((item, idx) => ({
      ...item,
      order: idx,
    }));

    // Save updated manifest
    await put(MANIFEST_FILENAME, JSON.stringify({ items: normalized }, null, 2), {
      access: 'public',
      addRandomSuffix: false,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Failed to delete:', error);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}
