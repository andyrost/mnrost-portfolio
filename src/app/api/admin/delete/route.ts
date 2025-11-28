import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Missing Cloudinary environment variables');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function unauthorized() {
  return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
}

export async function POST(req: NextRequest) {
  const isAuthed = req.cookies.get('admin_session')?.value === '1';
  if (!isAuthed) return unauthorized();
  try {
    const { publicId } = await req.json();
    if (!publicId || typeof publicId !== 'string') {
      return NextResponse.json({ error: 'publicId required' }, { status: 400 });
    }

    await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });

    // Update manifest: remove item
    const manResp = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/manifest`, { cache: 'no-store' });
    const manifest = manResp.ok ? await manResp.json() : { items: [] };
    const items = Array.isArray(manifest.items) ? manifest.items : [];
    const nextItems = items.filter((i: any) => i.key !== publicId);

    const saveRes = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/manifest`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ items: nextItems })
    });
    if (!saveRes.ok) {
      throw new Error('Failed to save manifest');
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 });
  }
}





