import { NextResponse, type NextRequest } from 'next/server';
import { recordUserRegistration } from '@/lib/userStore';
import { isSupportedGrade } from '@/data/classes';
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

  // 2. Rate Limiting (Registration Flood Protection)
  const clientIp = getClientIp(request);
  const rateCheck = checkRateLimit(`register_${clientIp}`, 5, 60000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'ಹೆಚ್ಚು ನೋಂದಣಿ ಪ್ರಯತ್ನಗಳು. ದಯವಿಟ್ಟು 1 ನಿಮಿಷದ ನಂತರ ಪ್ರಯತ್ನಿಸಿ' },
      {
        status: 429,
        headers: {
          'Retry-After': String(Math.ceil(rateCheck.resetMs / 1000)),
        },
      }
    );
  }

  let name = '';
  let email = '';
  let password = '';
  let grade = '';
  let isJson = false;

  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    isJson = true;
    try {
      const body = await request.json();
      name = typeof body.display_name === 'string' ? body.display_name.trim() : (body.name || '').trim();
      email = typeof body.email === 'string' ? body.email.trim() : '';
      password = typeof body.password === 'string' ? body.password : '';
      grade = typeof body.grade === 'string' ? body.grade.trim() : '';
    } catch {
      return NextResponse.json({ error: 'ಅಮಾನ್ಯ ವಿನಂತಿ (Invalid request body)' }, { status: 400 });
    }
  } else {
    try {
      const formData = await request.formData();
      name = ((formData.get('display_name') as string) || (formData.get('name') as string) || '').trim();
      email = ((formData.get('email') as string) || '').trim();
      password = (formData.get('password') as string) || '';
      grade = ((formData.get('grade') as string) || '').trim();
    } catch {
      return NextResponse.redirect(new URL('/register?error=invalid_payload', request.url));
    }
  }

  // Strict email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email || !emailRegex.test(email)) {
    if (isJson) {
      return NextResponse.json({ error: 'ಮಾನ್ಯವಾದ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ' }, { status: 400 });
    }
    return NextResponse.redirect(new URL('/register?error=invalid_email', request.url));
  }

  // Sanitize name against HTML/script injection
  const sanitizedName = name.replace(/<[^>]*>?/gm, '').slice(0, 100);

  // Password validation: minimum 8 characters
  if (!password || password.length < 8) {
    if (isJson) {
      return NextResponse.json(
        { error: 'ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳಿರಬೇಕು (Password must be at least 8 characters)' },
        { status: 400 }
      );
    }
    return NextResponse.redirect(new URL('/register?error=password_too_short', request.url));
  }

  // Validate supported academic class (only 8, 9, 10, puc-1, puc-2, or legacy puc are permitted)
  const normalizedGrade = (grade || '10').trim().toLowerCase();
  if (normalizedGrade && !isSupportedGrade(normalizedGrade)) {
    if (isJson) {
      return NextResponse.json(
        { error: 'ಆಯ್ಕೆಮಾಡಿದ ತರಗತಿ ಬೆಂಬಲಿತವಾಗಿಲ್ಲ. 8, 9, 10 ಹಾಗೂ ಪಿಯುಸಿ ಮಾತ್ರ ಲಭ್ಯ (Supported classes: 8, 9, 10, 1st & 2nd PUC)' },
        { status: 400 }
      );
    }
    return NextResponse.redirect(new URL('/register?error=unsupported_grade', request.url));
  }

  // Record student in secure user store with scrypt password hash
  const regResult = recordUserRegistration(sanitizedName, email, normalizedGrade, password);
  if (!regResult.success || !regResult.user) {
    if (isJson) {
      return NextResponse.json({ error: regResult.error || 'ನೋಂದಣಿ ವಿಫಲವಾಗಿದೆ' }, { status: 409 });
    }
    return NextResponse.redirect(new URL('/register?error=user_exists', request.url));
  }

  const user = regResult.user;

  // Supabase signup attempt if configured
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && password) {
    try {
      const { createClient } = await import('@/lib/supabase/server');
      const supabase = await createClient();
      await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            display_name: sanitizedName,
            grade,
          },
        },
      });
    } catch {
      // background signup
    }
  }

  // Create signed session token
  const sessionData: SessionUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    grade: user.grade,
    role: (user.role as 'student' | 'admin') || 'student',
    loggedInAt: new Date().toISOString(),
    expiresAt: Date.now() + 1000 * 60 * 60 * 24 * 30, // 30 days
  };

  const signedToken = signSessionToken(sessionData);

  const response = isJson
    ? NextResponse.json({ success: true, user })
    : NextResponse.redirect(new URL('/dashboard?welcome=1', request.url), 303);

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
