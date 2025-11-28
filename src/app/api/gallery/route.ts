// /app/api/gallery/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { v2 as cloudinary } from 'cloudinary';

// Check if environment variables are set
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('Missing Cloudinary environment variables');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function GET() {
  try {
    const [{ resources }, manifestResp] = await Promise.all([
      cloudinary.search
        .expression('folder:portfolio/*')
        .sort_by('public_id', 'desc')
        .max_results(200)
        .execute(),
      fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/admin/manifest`, { cache: 'no-store' })
    ]);

    const manifestData = manifestResp.ok ? await manifestResp.json() : { items: [] };
    const manifestMap: Record<string, { title: string; order: number }> = {};
    for (const item of manifestData.items || []) {
      manifestMap[item.key] = { title: item.title || '', order: Number.isFinite(item.order) ? item.order : 0 };
    }

    const enriched = (resources || []).map((r: any) => {
      const key = r.public_id;
      const context = r?.context || {};
      const custom = context?.custom || {};
      const fallbackTitle = r.display_name || custom.caption || context.caption || custom.title || '';
      const m = manifestMap[key];
      return {
        ...r,
        display_name: m?.title ?? fallbackTitle,
        order: m?.order ?? 0,
      };
    });

    enriched.sort((a: any, b: any) => (a.order ?? 0) - (b.order ?? 0));
    return NextResponse.json({ resources: enriched });
  } catch (error) {
    console.error('Cloudinary API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch images from Cloudinary' },
      { status: 500 }
    );
  }
}

// Signed upload signature endpoint
export async function POST(req: NextRequest) {
  try {
    const isAuthed = req.cookies.get('admin_session')?.value === '1';
    if (!isAuthed) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    // Accept arbitrary params and sign them server-side for security
    const { paramsToSign } = body || {};
    if (!paramsToSign || typeof paramsToSign !== 'object') {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
    }

    // IMPORTANT: Sign exactly the params provided by the widget
    console.log('Signing upload params (exact):', paramsToSign);
    const signature = cloudinary.utils.api_sign_request(
      paramsToSign,
      process.env.CLOUDINARY_API_SECRET as string
    );
    return NextResponse.json({ signature });
  } catch (error) {
    console.error('Failed to create signature', error);
    return NextResponse.json({ error: 'Failed to create signature' }, { status: 500 });
  }
}