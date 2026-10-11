import { cookies } from 'next/headers';
import { verifySessionToken } from '@/lib/security';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  grade?: string;
  role: 'student' | 'admin';
}

export interface AuthContext {
  isAuthenticated: boolean;
  isAdmin: boolean;
  user: AuthUser | null;
}

/**
 * Server-side helper to resolve the current authenticated user and determine
 * whether they have administrator privileges based strictly on server-validated
 * session cookies and ADMIN_EMAILS environment configuration.
 */
export async function getAuthContext(): Promise<AuthContext> {
  const cookieStore = await cookies();
  const token =
    cookieStore.get('pratibha_user')?.value ||
    cookieStore.get('pratibha_session')?.value;

  if (!token) {
    return { isAuthenticated: false, isAdmin: false, user: null };
  }

  const verification = verifySessionToken(token);
  if (!verification.valid || !verification.session) {
    return { isAuthenticated: false, isAdmin: false, user: null };
  }

  const adminEmailsConfig = (process.env.ADMIN_EMAILS || '').trim();
  const adminEmails = adminEmailsConfig
    ? adminEmailsConfig
        .toLowerCase()
        .split(',')
        .map((e) => e.trim())
        .filter(Boolean)
    : [];

  const isAdmin = Boolean(
    verification.session.email &&
      adminEmails.length > 0 &&
      adminEmails.includes(verification.session.email.toLowerCase())
  );

  return {
    isAuthenticated: true,
    isAdmin,
    user: {
      id: verification.session.id,
      name: verification.session.name,
      email: verification.session.email,
      grade: verification.session.grade,
      role: isAdmin ? 'admin' : 'student',
    },
  };
}
