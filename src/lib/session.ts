export interface SessionUser {
  id: string;
  name: string;
  email: string;
  grade: string;
  role: 'student' | 'admin';
  loggedInAt: string;
  expiresAt: number;
}

const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'pk_sec_sign_kannada_2026_d3f4a8b9c1e075841209384756201948576';

function base64UrlEncode(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'utf-8').toString('base64url');
  }
  return btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64UrlDecode(str: string): string {
  if (typeof Buffer !== 'undefined') {
    return Buffer.from(str, 'base64url').toString('utf-8');
  }
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return atob(base64);
}

async function getHmacKey(secret: string): Promise<CryptoKey> {
  const enc = new TextEncoder();
  return await crypto.subtle.importKey(
    'raw',
    enc.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify']
  );
}

// Universal Web-Crypto HMAC (compatible with both Node.js and Edge Runtime)
export async function signSessionTokenAsync(session: SessionUser): Promise<string> {
  const jsonStr = JSON.stringify(session);
  const dataB64 = base64UrlEncode(jsonStr);
  const key = await getHmacKey(SESSION_SECRET);
  const enc = new TextEncoder();
  const signatureBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(dataB64));

  const sigB64 =
    typeof Buffer !== 'undefined'
      ? Buffer.from(signatureBuffer).toString('base64url')
      : base64UrlEncode(String.fromCharCode(...new Uint8Array(signatureBuffer)));

  return `${dataB64}.${sigB64}`;
}

export async function verifySessionTokenAsync(
  token: string | undefined | null
): Promise<{ valid: boolean; session?: SessionUser; error?: string }> {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'ಟೋಕನ್ ಲಭ್ಯವಿಲ್ಲ' };
  }

  const parts = token.trim().split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'ಅಮಾನ್ಯ ಟೋಕನ್ ರಚನೆ' };
  }

  const [dataB64, providedSig] = parts;

  try {
    const key = await getHmacKey(SESSION_SECRET);
    const enc = new TextEncoder();
    const expectedSigBuffer = await crypto.subtle.sign('HMAC', key, enc.encode(dataB64));

    const expectedSig =
      typeof Buffer !== 'undefined'
        ? Buffer.from(expectedSigBuffer).toString('base64url')
        : base64UrlEncode(String.fromCharCode(...new Uint8Array(expectedSigBuffer)));

    if (expectedSig !== providedSig) {
      return { valid: false, error: 'ದೃಢೀಕರಣ ಸಹಿ ಅಮಾನ್ಯವಾಗಿದೆ' };
    }

    const jsonStr = base64UrlDecode(dataB64);
    const session: SessionUser = JSON.parse(jsonStr);

    if (session.expiresAt && Date.now() > session.expiresAt) {
      return { valid: false, error: 'ಸೆಷನ್ ಅವಧಿ ಮುಗಿದಿದೆ' };
    }

    return { valid: true, session };
  } catch {
    return { valid: false, error: 'ಸೆಷನ್ ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ' };
  }
}
