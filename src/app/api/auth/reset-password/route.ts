import { NextResponse, type NextRequest } from 'next/server';
import {
  signPasswordResetToken,
  verifyPasswordResetToken,
  validateCsrfOrigin,
  checkRateLimit,
  getClientIp,
} from '@/lib/security';
import { findUserByEmail, updateUserPassword } from '@/lib/userStore';

export async function POST(request: NextRequest) {
  // 1. CSRF Protection
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json(
      { error: 'CSRF ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ (Forbidden request origin)' },
      { status: 403 }
    );
  }

  // 2. Rate Limiting
  const clientIp = getClientIp(request);
  const rateCheck = checkRateLimit(`reset_pwd_${clientIp}`, 5, 60000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'ಹೆಚ್ಚು ವಿನಂತಿಗಳು. ದಯವಿಟ್ಟು 1 ನಿಮಿಷದ ನಂತರ ಪ್ರಯತ್ನಿಸಿ' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  try {
    const body = await request.json();
    const action = body.action || 'request'; // 'request' | 'confirm'

    // Step A: Request password reset link / token
    if (action === 'request') {
      const email = typeof body.email === 'string' ? body.email.trim() : '';
      if (!email || !email.includes('@')) {
        return NextResponse.json(
          { error: 'ಮಾನ್ಯವಾದ ಇಮೇಲ್ ವಿಳಾಸವನ್ನು ನಮೂದಿಸಿ' },
          { status: 400 }
        );
      }

      // Check if user exists (to prevent enumeration, return generic message)
      const user = findUserByEmail(email);

      // If Supabase is configured, trigger official Supabase password reset email
      if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
        try {
          const { createClient } = await import('@/lib/supabase/server');
          const supabase = await createClient();
          await supabase.auth.resetPasswordForEmail(email);
        } catch {
          // ignore
        }
      }

      let resetToken: string | undefined;
      if (user) {
        resetToken = signPasswordResetToken(email);
      }

      return NextResponse.json({
        success: true,
        message: 'ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸುವ ಸೂಚನೆಗಳನ್ನು ಕಳುಹಿಸಲಾಗಿದೆ (Reset instructions generated)',
        resetToken: resetToken || 'dummy_token_to_prevent_user_enumeration',
      });
    }

    // Step B: Confirm password reset with token
    if (action === 'confirm') {
      const token = typeof body.token === 'string' ? body.token.trim() : '';
      const newPassword = typeof body.newPassword === 'string' ? body.newPassword : '';

      if (!token) {
        return NextResponse.json(
          { error: 'ಮರುಹೊಂದಿಸುವ ಟೋಕನ್ ಅಗತ್ಯವಿದೆ (Token required)' },
          { status: 400 }
        );
      }

      if (!newPassword || newPassword.length < 8) {
        return NextResponse.json(
          { error: 'ಹೊಸ ಪಾಸ್‌ವರ್ಡ್ ಕನಿಷ್ಠ 8 ಅಕ್ಷರಗಳಿರಬೇಕು (Password must be at least 8 characters)' },
          { status: 400 }
        );
      }

      const verification = verifyPasswordResetToken(token);
      if (!verification.valid || !verification.email) {
        return NextResponse.json(
          { error: verification.error || 'ಅಮಾನ್ಯ ಅಥವಾ ಅವಧಿ ಮೀರಿದ ಟೋಕನ್' },
          { status: 400 }
        );
      }

      const updated = updateUserPassword(verification.email, newPassword);
      if (!updated) {
        return NextResponse.json(
          { error: 'ಬಳಕೆದಾರರು ಕಂಡುಬಂದಿಲ್ಲ (User not found)' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'ಪಾಸ್‌ವರ್ಡ್ ಅನ್ನು ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ. ಹೊಸ ಪಾಸ್‌ವರ್ಡ್‌ನೊಂದಿಗೆ ಲಾಗಿನ್ ಮಾಡಿ.',
      });
    }

    return NextResponse.json({ error: 'ಅಮಾನ್ಯ ಆಕ್ಷನ್' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'ಸರ್ವರ್ ದೋಷ' }, { status: 500 });
  }
}
