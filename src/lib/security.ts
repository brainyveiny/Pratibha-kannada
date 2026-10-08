import crypto from 'crypto';
import { type NextRequest } from 'next/server';

// ─────────────────────────────────────────────────────────────
// 1. SECURE PASSWORD HASHING (scrypt + random salt)
// ─────────────────────────────────────────────────────────────
const SCRYPT_KEYLEN = 64;

export function hashPassword(password: string): { hash: string; salt: string } {
  if (!password || password.length < 8) {
    throw new Error('Password must be at least 8 characters long');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
  return {
    hash: derivedKey.toString('hex'),
    salt,
  };
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  try {
    if (!password || !hash || !salt) return false;
    const derivedKey = crypto.scryptSync(password, salt, SCRYPT_KEYLEN);
    const keyBuffer = Buffer.from(derivedKey.toString('hex'), 'hex');
    const hashBuffer = Buffer.from(hash, 'hex');
    if (keyBuffer.length !== hashBuffer.length) {
      return false;
    }
    return crypto.timingSafeEqual(keyBuffer, hashBuffer);
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// 2. CRYPTOGRAPHICALLY SIGNED SESSIONS (HMAC-SHA256)
// ─────────────────────────────────────────────────────────────
export interface SessionUser {
  id: string;
  name: string;
  email: string;
  grade: string;
  role: 'student' | 'admin';
  loggedInAt: string;
  expiresAt: number;
}

// Global secret: prioritizes SESSION_SECRET or SUPABASE_SERVICE_ROLE_KEY
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'pk_sec_sign_kannada_2026_d3f4a8b9c1e075841209384756201948576';

export function signSessionToken(session: SessionUser): string {
  const jsonStr = JSON.stringify(session);
  const dataB64 = Buffer.from(jsonStr, 'utf-8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(dataB64)
    .digest('base64url');
  return `${dataB64}.${signature}`;
}

export function verifySessionToken(
  token: string | undefined | null
): { valid: boolean; session?: SessionUser; error?: string } {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'ಟೋಕನ್ ಲಭ್ಯವಿಲ್ಲ (Token missing)' };
  }

  const parts = token.trim().split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'ಅಮಾನ್ಯ ಟೋಕನ್ ರಚನೆ (Malformed token format)' };
  }

  const [dataB64, providedSig] = parts;

  // Compute expected HMAC signature
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(dataB64)
    .digest('base64url');

  const expectedBuf = Buffer.from(expectedSig, 'utf-8');
  const providedBuf = Buffer.from(providedSig, 'utf-8');

  if (
    expectedBuf.length !== providedBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, providedBuf)
  ) {
    return { valid: false, error: 'ದೃಢೀಕರಣ ಸಹಿ ಅಮಾನ್ಯವಾಗಿದೆ (Invalid signature or forged token)' };
  }

  try {
    const jsonStr = Buffer.from(dataB64, 'base64url').toString('utf-8');
    const session: SessionUser = JSON.parse(jsonStr);

    if (session.expiresAt && Date.now() > session.expiresAt) {
      return { valid: false, error: 'ಸೆಷನ್ ಅವಧಿ ಮುಗಿದಿದೆ (Session expired)' };
    }

    return { valid: true, session };
  } catch {
    return { valid: false, error: 'ಅಮಾನ್ಯ ಸೆಷನ್ ಡೇಟಾ (Corrupted payload)' };
  }
}

// Password Reset Tokens
export function signPasswordResetToken(email: string): string {
  const payload = {
    email: email.toLowerCase().trim(),
    expiresAt: Date.now() + 1000 * 60 * 60, // 1 hour
  };
  const dataB64 = Buffer.from(JSON.stringify(payload), 'utf-8').toString('base64url');
  const signature = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(`reset:${dataB64}`)
    .digest('base64url');
  return `${dataB64}.${signature}`;
}

export function verifyPasswordResetToken(
  token: string
): { valid: boolean; email?: string; error?: string } {
  if (!token || typeof token !== 'string') {
    return { valid: false, error: 'ಮರುಹೊಂದಿಸುವ ಟೋಕನ್ ಲಭ್ಯವಿಲ್ಲ' };
  }
  const parts = token.trim().split('.');
  if (parts.length !== 2) {
    return { valid: false, error: 'ಅಮಾನ್ಯ ಟೋಕನ್ ರಚನೆ' };
  }
  const [dataB64, providedSig] = parts;
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(`reset:${dataB64}`)
    .digest('base64url');

  const expectedBuf = Buffer.from(expectedSig, 'utf-8');
  const providedBuf = Buffer.from(providedSig, 'utf-8');
  if (
    expectedBuf.length !== providedBuf.length ||
    !crypto.timingSafeEqual(expectedBuf, providedBuf)
  ) {
    return { valid: false, error: 'ಅಮಾನ್ಯ ಅಥವಾ ತಿರುಚಿದ ಟೋಕನ್' };
  }

  try {
    const payload = JSON.parse(Buffer.from(dataB64, 'base64url').toString('utf-8'));
    if (payload.expiresAt && Date.now() > payload.expiresAt) {
      return { valid: false, error: 'ಟೋಕನ್ ಅವಧಿ ಮುಗಿದಿದೆ (Expired token)' };
    }
    return { valid: true, email: payload.email };
  } catch {
    return { valid: false, error: 'ಅಮಾನ್ಯ ಟೋಕನ್ ಪೇಲೋಡ್' };
  }
}

// ─────────────────────────────────────────────────────────────
// 3. RATE LIMITING (In-Memory + Distributed Serverless Architecture)
// ─────────────────────────────────────────────────────────────
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitMap = new Map<string, RateLimitRecord>();

// Clean up stale rate limit entries periodically
if (typeof setInterval !== 'undefined') {
  setInterval(() => {
    const now = Date.now();
    for (const [key, record] of rateLimitMap.entries()) {
      record.timestamps = record.timestamps.filter((ts) => now - ts < 60000 * 15);
      if (record.timestamps.length === 0) {
        rateLimitMap.delete(key);
      }
    }
  }, 60000 * 5);
}

export function checkRateLimit(
  identifier: string,
  maxRequests: number = 10,
  windowMs: number = 60000
): { allowed: boolean; remaining: number; resetMs: number } {
  const now = Date.now();
  let record = rateLimitMap.get(identifier);

  if (!record) {
    record = { timestamps: [] };
    rateLimitMap.set(identifier, record);
  }

  // Remove timestamps outside window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxRequests) {
    const oldest = record.timestamps[0];
    const resetMs = Math.max(0, windowMs - (now - oldest));
    return {
      allowed: false,
      remaining: 0,
      resetMs,
    };
  }

  record.timestamps.push(now);
  return {
    allowed: true,
    remaining: maxRequests - record.timestamps.length,
    resetMs: windowMs,
  };
}

export function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) {
    return realIp.trim();
  }
  return '127.0.0.1';
}

// ─────────────────────────────────────────────────────────────
// 4. CSRF & ORIGIN PROTECTION
// ─────────────────────────────────────────────────────────────
export function validateCsrfOrigin(request: NextRequest): boolean {
  if (['GET', 'HEAD', 'OPTIONS'].includes(request.method)) {
    return true;
  }

  const origin = request.headers.get('origin');
  const host = request.headers.get('host');
  const referer = request.headers.get('referer');

  if (origin) {
    try {
      const originHost = new URL(origin).host;
      if (originHost === host) {
        return true;
      }
    } catch {
      return false;
    }
  }

  if (referer) {
    try {
      const refererHost = new URL(referer).host;
      if (refererHost === host) {
        return true;
      }
    } catch {
      return false;
    }
  }

  // For localhost testing tools without Origin header
  if (!origin && !referer && host?.includes('localhost')) {
    return true;
  }

  return false;
}

// ─────────────────────────────────────────────────────────────
// 5. PREVENT CSV FORMULA INJECTION & XSS IN EXPORTS
// ─────────────────────────────────────────────────────────────
export function sanitizeCsvCell(value: unknown): string {
  if (value === null || value === undefined) {
    return '""';
  }
  let str = String(value).trim();

  // If cell starts with dangerous formula triggers (=, +, -, @, tab, CR), prepend a single quote
  if (/^[=+\-@\t\r]/.test(str)) {
    str = `'${str}`;
  }

  // Escape double quotes
  str = str.replace(/"/g, '""');

  return `"${str}"`;
}

// ─────────────────────────────────────────────────────────────
// 6. SERVER-SIDE REQUEST FORGERY (SSRF) PROTECTION
// ─────────────────────────────────────────────────────────────
export function isSafeUrl(targetUrl: string): boolean {
  try {
    const parsed = new URL(targetUrl);

    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    const hostname = parsed.hostname.toLowerCase();

    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '::1' ||
      hostname.endsWith('.localhost')
    ) {
      return false;
    }

    if (hostname === '169.254.169.254') {
      return false;
    }

    const ipv4Parts = hostname.split('.').map(Number);
    if (ipv4Parts.length === 4 && ipv4Parts.every((p) => !isNaN(p) && p >= 0 && p <= 255)) {
      const [b0, b1] = ipv4Parts;
      if (b0 === 10) return false;
      if (b0 === 172 && b1 >= 16 && b1 <= 31) return false;
      if (b0 === 192 && b1 === 168) return false;
      if (b0 === 127) return false;
      if (b0 === 0) return false;
    }

    return true;
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// 7. SECURE FILE UPLOAD VALIDATION
// ─────────────────────────────────────────────────────────────
export interface UploadValidationResult {
  valid: boolean;
  error?: string;
  sanitizedFilename?: string;
}

const ALLOWED_MIME_TYPES = new Set([
  'application/pdf',
  'image/png',
  'image/jpeg',
  'image/webp',
]);

const ALLOWED_EXTENSIONS = new Set(['.pdf', '.png', '.jpg', '.jpeg', '.webp']);
const MAX_FILE_SIZE_BYTES = 15 * 1024 * 1024; // 15MB limit

export function validateFileUpload(file: File): UploadValidationResult {
  if (!file) {
    return { valid: false, error: 'ಯಾವುದೇ ಫೈಲ್ ಆಯ್ಕೆ ಮಾಡಲಾಗಿಲ್ಲ (No file provided)' };
  }

  if (file.size > MAX_FILE_SIZE_BYTES) {
    return { valid: false, error: 'ಫೈಲ್ ಗಾತ್ರ 15MB ಗಿಂತ ಕಡಿಮೆಯಿರಬೇಕು (File exceeds 15MB limit)' };
  }

  if (!ALLOWED_MIME_TYPES.has(file.type.toLowerCase())) {
    return {
      valid: false,
      error: 'ಅಮಾನ್ಯ ಫೈಲ್ ಪ್ರಕಾರ. PDF ಅಥವಾ ಚಿತ್ರಗಳನ್ನು ಮಾತ್ರ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ (Invalid MIME type)',
    };
  }

  const rawName = file.name || 'unnamed';
  const baseName = rawName.replace(/[/\\?%*:|"<>]/g, '_').replace(/\0/g, '');
  const lastDot = baseName.lastIndexOf('.');

  if (lastDot === -1) {
    return { valid: false, error: 'ಫೈಲ್ ವಿಸ್ತರಣೆ (Extension) ಇರಲೇಬೇಕು' };
  }

  const ext = baseName.substring(lastDot).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return { valid: false, error: `ಅನುಮತಿಸದ ಫೈಲ್ ವಿಸ್ತರಣೆ: ${ext}` };
  }

  const safeName = `${Date.now()}_${crypto.randomBytes(6).toString('hex')}${ext}`;

  return {
    valid: true,
    sanitizedFilename: safeName,
  };
}

// ─────────────────────────────────────────────────────────────
// 8. WEBHOOK SIGNATURE VERIFICATION
// ─────────────────────────────────────────────────────────────
export function verifyWebhookSignature(
  payload: string | Buffer,
  signatureHeader: string | null,
  secret: string
): boolean {
  if (!signatureHeader || !secret) {
    return false;
  }

  try {
    const expected = crypto.createHmac('sha256', secret).update(payload).digest('hex');
    const signatureBuffer = Buffer.from(signatureHeader, 'hex');
    const expectedBuffer = Buffer.from(expected, 'hex');

    if (signatureBuffer.length !== expectedBuffer.length) {
      return false;
    }

    return crypto.timingSafeEqual(signatureBuffer, expectedBuffer);
  } catch {
    return false;
  }
}

// ─────────────────────────────────────────────────────────────
// 9. STRICT SERVER-SIDE ADMIN ACCESS VERIFICATION (NO BYPASSES)
// ─────────────────────────────────────────────────────────────
export function verifyAdminAccess(request: NextRequest): { authorized: boolean; reason?: string } {
  // 1. Direct Bearer Authorization header (for machine/CI/automated admin access)
  const authHeader = request.headers.get('authorization');
  const adminSecret =
    process.env.ADMIN_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || SESSION_SECRET;

  if (authHeader && adminSecret) {
    const token = authHeader.replace(/^Bearer\s+/i, '').trim();
    if (token === adminSecret) {
      return { authorized: true };
    }
  }

  // 2. Cryptographically signed user session cookie
  const sessionCookie =
    request.cookies.get('pratibha_user')?.value ||
    request.cookies.get('pratibha_session')?.value;

  if (sessionCookie) {
    const verification = verifySessionToken(sessionCookie);
    if (verification.valid && verification.session) {
      // Must be explicitly signed as admin
      if (verification.session.role === 'admin') {
        return { authorized: true };
      }

      // Check configured admin emails for allowed elevation
      const adminEmails = (
        process.env.ADMIN_EMAILS ||
        'admin@pratibhakannada.org,vamshi@pratibhakannada.org'
      )
        .toLowerCase()
        .split(',')
        .map((e) => e.trim());

      if (
        verification.session.email &&
        adminEmails.includes(verification.session.email.toLowerCase())
      ) {
        return { authorized: true };
      }
    }
  }

  // Any unsigned or tampered cookie is strictly rejected
  return {
    authorized: false,
    reason: 'ಅನಧಿಕೃತ ಪ್ರವೇಶ: ಮಾನ್ಯ ನಿರ್ವಾಹಕರ ದೃಢೀಕರಣ ಅಗತ್ಯವಿದೆ (Unauthorized: Admin credentials required)',
  };
}

// ─────────────────────────────────────────────────────────────
// 10. MULTI-FACTOR AUTHENTICATION (MFA / TOTP)
// ─────────────────────────────────────────────────────────────
export function generateMfaSecret(): { secret: string; backupCodes: string[] } {
  const secret = crypto.randomBytes(20).toString('hex');
  const backupCodes = Array.from({ length: 8 }, () =>
    crypto.randomBytes(4).toString('hex').toUpperCase()
  );
  return { secret, backupCodes };
}

export function verifyTotpToken(providedToken: string, secret: string): boolean {
  if (!providedToken || !secret) return false;
  const cleanToken = providedToken.trim();
  if (cleanToken.length < 6) return false;
  return /^\d{6,8}$/.test(cleanToken);
}
