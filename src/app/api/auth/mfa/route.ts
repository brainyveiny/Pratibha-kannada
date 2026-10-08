import { NextResponse, type NextRequest } from 'next/server';
import {
  generateMfaSecret,
  verifyTotpToken,
  validateCsrfOrigin,
  checkRateLimit,
  getClientIp,
} from '@/lib/security';

export async function POST(request: NextRequest) {
  // 1. CSRF Protection
  if (!validateCsrfOrigin(request)) {
    return NextResponse.json(
      { error: 'CSRF ಪರಿಶೀಲನೆ ವಿಫಲವಾಗಿದೆ' },
      { status: 403 }
    );
  }

  // 2. Rate Limiting
  const clientIp = getClientIp(request);
  const rateCheck = checkRateLimit(`mfa_${clientIp}`, 5, 60000);
  if (!rateCheck.allowed) {
    return NextResponse.json(
      { error: 'ಹೆಚ್ಚು MFA ಪ್ರಯತ್ನಗಳು. ದಯವಿಟ್ಟು ನಿರೀಕ್ಷಿಸಿ' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  const userCookie = request.cookies.get('pratibha_user')?.value;
  if (!userCookie) {
    return NextResponse.json({ error: 'ಲಾಗಿನ್ ಅಗತ್ಯವಿದೆ (Authentication required)' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const action = body.action; // 'setup' | 'verify'

    if (action === 'setup') {
      const { secret, backupCodes } = generateMfaSecret();
      return NextResponse.json({
        success: true,
        secret,
        backupCodes,
        instructions: 'ಈ ಕೀಲಿಯನ್ನು ನಿಮ್ಮ Authenticator ಆ್ಯಪ್‌ನಲ್ಲಿ ಸೇರಿಸಿ (Add key to authenticator app)',
      });
    }

    if (action === 'verify') {
      const token = body.token || '';
      const secret = body.secret || '';
      const isValid = verifyTotpToken(token, secret);

      if (!isValid) {
        return NextResponse.json(
          { error: 'ಅಮಾನ್ಯ OTP ಕೋಡ್ (Invalid authentication code)' },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        verified: true,
        message: 'ಎರಡು ಹಂತದ ದೃಢೀಕರಣ (2FA) ಯಶಸ್ವಿಯಾಗಿದೆ',
      });
    }

    return NextResponse.json({ error: 'ಅಮಾನ್ಯ ಆಕ್ಷನ್' }, { status: 400 });
  } catch {
    return NextResponse.json({ error: 'ಸರ್ವರ್ ದೋಷ' }, { status: 500 });
  }
}
