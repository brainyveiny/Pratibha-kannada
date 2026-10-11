import { NextResponse, type NextRequest } from 'next/server';
import { recordUserLogin } from '@/lib/userStore';
import {
  checkRateLimit,
  getClientIp,
  validateCsrfOrigin,
  signSessionToken,
  type SessionUser,
} from '@/lib/security';

export async function POST(request: NextRequest) {
  // 1. CSRF Protection
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json(
      { error: 'CSRF ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ (Invalid request origin)' },
      { status: 403 }
    );
  }

  // 2. Rate Limiting (Brute-Force Protection)
  const clientIp = getClientIp(request);
  const rateCheck = checkRateLimit(`login_${clientIp}`, 10, 60000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'ಹೆಚ್ಚು ಲಾಗಿನ್ ಪ್ರಯತ್ನಗಳು. ದಯವಿಟ್ಟು 1 ನಿಮಿಷದ ನಂತರ ಪ್ರಯತ್ನಿಸಿ (Too many attempts. Please wait.)' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateCheck.resetMs / 1000)),
        },
      }
    );
  }

  let email = '';
  let password = '';
  let isJson = false;

  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    isJson = true;
    try {
      const body = await request.json();
      email = typeof body.email === 'string' ? body.email.trim() : '';
      password = typeof body.password === 'string' ? body.password : '';
    } catch {
      return NextResponse.json({ error: 'ಅಮಾನ್ಯ ವಿನಂತಿ (Invalid request body)' }, { status: 400 });
    }
  } else {
    try {
      const formData = await request.formData();
      email = ((formData.get('email') as string) || '').trim();
      password = (formData.get('password') as string) || '';
    } catch {
      return NextResponse.redirect(new URL('/login?error=invalid_payload', request.url));
    }
  }

  // Strict email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    if (isJson) {
      return NextResponse.json({ error: 'ಮಾನ್ಯವಾದ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ' }, { status: 400 });
    }
    return NextResponse.redirect(new URL('/login?error=invalid_email', request.url));
  }

  // Enforce password presence: empty password strictly denied
  if (!password || password.trim().length === 0) {
    if (isJson) {
      return NextResponse.json({ error: 'ಪಾಸ್‌ವರ್ಡ್ ನಮೂದಿಸಿ (Password required)' }, { status: 400 });
    }
    return NextResponse.redirect(new URL('/login?error=missing_password', request.url));
  }

  // Verify credentials securely (hash comparison)
  const user = recordUserLogin(email, password);
  if (!user) {
    if (isJson) {
      return NextResponse.json(
        { error: 'ತಪ್ಪಾದ ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್ (Invalid email or password)' },
        { status: 401 }
      );
    }
    return NextResponse.redirect(new URL('/login?error=invalid_credentials', request.url));
  }

  // Supabase Auth verification if configured
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();
      await supabase.auth.signInWithPassword({
        email,
        password,
      });
    } catch {
      // Supabase background attempt
    }
  }

  // Validate whether authenticated user matches server-configured ADMIN_EMAILS
  const adminEmailsConfig = (process.env.ADMIN_EMAILS || '').trim();
  const adminEmails = adminEmailsConfig
    ? adminEmailsConfig.toLowerCase().split(',').map((e) => e.trim()).filter(Boolean)
    : [];
  const isAdmin = Boolean(user.email && adminEmails.includes(user.email.toLowerCase()));

  // Create cryptographically signed session token
  const sessionData: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    grade: user.grade,
    role: isAdmin ? 'admin' : 'student',
    loggedInAt: new Date().toISOString(),
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
  };

  const signedToken = signSessionToken(sessionData);

  const responseUser = { ...user, role: isAdmin ? 'admin' : 'student' };
  const response = isJson
    ? NextResponse.json({ success: true, user: responseUser })
    : NextResponse.redirect(new URL(isAdmin ? '/admin' : '/dashboard', request.url), 303);

  // Set cryptographically signed HTTP-Only session cookies
  const cookieOptions = {
    path: '/',
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 30, // 30 days
  };

  response.cookies.set('pratibha_user', signedToken, cookieOptions);
  response.cookies.set('pratibha_session', signedToken, cookieOptions);

  return response;
}
