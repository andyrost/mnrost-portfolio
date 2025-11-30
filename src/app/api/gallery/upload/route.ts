// /app/api/gallery/upload/route.ts
// Handles client-side upload token generation for direct-to-blob uploads
import { NextRequest, NextResponse } from 'next/server';
import { handleUpload, type HandleUploadBody } from '@vercel/blob/client';
import { put } from '@vercel/blob';
import { verifySessionToken } from '@/app/lib/auth';

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

// Helper to get the manifest
async function getManifest(): Promise<Manifest> {
  try {
    const { list } = await import('@vercel/blob');
    const { blobs } = await list({ prefix: MANIFEST_FILENAME });
    const manifestBlob = blobs.find(b => b.pathname === MANIFEST_FILENAME);
    
    if (!manifestBlob) {
      return { items: [] };
    }
    
    const cacheBustUrl = `${manifestBlob.url}?_=${Date.now()}`;
    const response = await fetch(cacheBustUrl, { 
      cache: 'no-store',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
      }
    });
    if (!response.ok) {
      return { items: [] };
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching manifest:', error);
    return { items: [] };
  }
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async (pathname, clientPayload) => {
        // Authenticate user before allowing upload
        const token = request.cookies.get('admin_session')?.value;
        const isAuthed = token ? await verifySessionToken(token) : false;
        
        if (!isAuthed) {
          throw new Error('Unauthorized');
        }

        // Parse the client payload to get the title
        let title = 'Untitled';
        if (clientPayload) {
          try {
            const parsed = JSON.parse(clientPayload);
            title = parsed.title || 'Untitled';
          } catch {
            // Ignore parse errors
          }
        }

        return {
          allowedContentTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          maximumSizeInBytes: 50 * 1024 * 1024, // 50MB max
          tokenPayload: JSON.stringify({ title }), // Pass title to onUploadCompleted
        };
      },
      onUploadCompleted: async ({ blob, tokenPayload }) => {
        // Update the manifest with the new image
        try {
          let title = 'Untitled';
          if (tokenPayload) {
            try {
              const parsed = JSON.parse(tokenPayload);
              title = parsed.title || 'Untitled';
            } catch {
              // Ignore parse errors
            }
          }
          
          const manifest = await getManifest();
          const maxOrder = manifest.items.reduce((max, item) => Math.max(max, item.order), -1);
          
          manifest.items.push({
            key: blob.pathname,
            url: blob.url,
            title,
            order: maxOrder + 1,
          });

          await put(MANIFEST_FILENAME, JSON.stringify(manifest, null, 2), {
            access: 'public',
            addRandomSuffix: false,
            allowOverwrite: true,
          });
        } catch (error) {
          console.error('Error updating manifest:', error);
          // Don't throw - the upload succeeded, just manifest update failed
        }
      },
    });

    return NextResponse.json(jsonResponse);
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Upload failed' },
      { status: 400 }
    );
  }
}

