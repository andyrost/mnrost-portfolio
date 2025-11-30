// Shared authentication utilities

const SESSION_SECRET = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;

async function sign(value: string): Promise<string> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(SESSION_SECRET || 'fallback-not-secure'),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(value));
  // Convert to base64url
  const bytes = new Uint8Array(signature);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const [expiryStr, signature] = token.split('.');
    if (!expiryStr || !signature) return false;

    const expiry = parseInt(expiryStr, 10);
    if (isNaN(expiry)) return false;

    // Check if expired
    if (expiry < Math.floor(Date.now() / 1000)) return false;

    // Verify signature
    const expectedSignature = await sign(expiryStr);
    return signature === expectedSignature;
  } catch {
    return false;
  }
}

export async function createSessionToken(): Promise<string> {
  const expiry = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; // 30 days
  const signature = await sign(String(expiry));
  return `${expiry}.${signature}`;
}

