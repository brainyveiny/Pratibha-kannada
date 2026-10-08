import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { verifySessionTokenAsync } from '@/lib/session';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. CSRF Origin validation for state-modifying requests on /api routes
  if (pathname.startsWith('/api/') && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
    const origin = request.headers.get('origin');
    const host = request.headers.get('host');
    if (origin) {
      try {
        const originHost = new URL(origin).host;
        if (originHost !== host) {
          return NextResponse.json(
            { error: 'CSRF ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ (Forbidden cross-origin mutation)' },
            { status: 403 }
          );
        }
      } catch {
        return NextResponse.json({ error: 'ಅಮಾನ್ಯ ವಿನಂತಿ Origin' }, { status: 400 });
      }
    }
  }

  // 2. Strict server-side permission check for /admin UI (No bypasses)
  if (pathname === '/admin') {
    const sessionCookie =
      request.cookies.get('pratibha_user')?.value ||
      request.cookies.get('pratibha_session')?.value;

    let isAuthorized = false;

    if (sessionCookie) {
      const verification = await verifySessionTokenAsync(sessionCookie);
      if (verification.valid && verification.session) {
        if (verification.session.role === 'admin') {
          isAuthorized = true;
        } else {
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
            isAuthorized = true;
          }
        }
      }
    }

    if (!isAuthorized) {
      const loginUrl = new URL('/login?error=admin_required', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // 3. Supabase session update (if configured)
  const response = await updateSession(request);

  // 4. Ensure security headers on every response
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'SAMEORIGIN');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files, images and icons
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
