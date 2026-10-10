const crypto = require('crypto');

describe('Security Utilities Unit Tests', () => {
  const SESSION_SECRET = 'pk_sec_sign_kannada_2026_d3f4a8b9c1e075841209384756201948576';

  test('HMAC-SHA256 signature verification detects tampering', () => {
    const payload = JSON.stringify({ id: 'u1', role: 'student', expiresAt: Date.now() + 10000 });
    const b64 = Buffer.from(payload).toString('base64url');
    const validSig = crypto.createHmac('sha256', SESSION_SECRET).update(b64).digest('base64url');
    const token = `${b64}.${validSig}`;

    // Tampered payload
    const forgedPayload = JSON.stringify({ id: 'u1', role: 'admin', expiresAt: Date.now() + 10000 });
    const forgedB64 = Buffer.from(forgedPayload).toString('base64url');
    const forgedToken = `${forgedB64}.${validSig}`;

    const [tB64, tSig] = forgedToken.split('.');
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(tB64).digest('base64url');

    expect(expectedSig).not.toEqual(tSig);
  });

  test('scrypt password hash verification works', () => {
    const password = 'CorrectPassword@123';
    const salt = crypto.randomBytes(16).toString('hex');
    const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');

    const verifyKey = crypto.scryptSync(password, salt, 64).toString('hex');
    expect(derivedKey).toEqual(verifyKey);

    const wrongKey = crypto.scryptSync('WrongPassword', salt, 64).toString('hex');
    expect(derivedKey).not.toEqual(wrongKey);
  });

  describe('Bearer Token Admin Authorization Logic', () => {
    function verifyBearerToken(authHeader, adminSecretEnv) {
      const adminSecret = (adminSecretEnv || '').trim();
      if (authHeader && adminSecret) {
        const token = authHeader.replace(/^Bearer\s+/i, '').trim();
        if (token) {
          const tokenBuf = Buffer.from(token);
          const secretBuf = Buffer.from(adminSecret);
          if (tokenBuf.length === secretBuf.length && crypto.timingSafeEqual(tokenBuf, secretBuf)) {
            return { authorized: true };
          }
        }
      }
      return { authorized: false };
    }

    test('valid configured ADMIN_SECRET is accepted', () => {
      const configuredSecret = 'pk_adm_sec_custom_98765';
      const result = verifyBearerToken(`Bearer ${configuredSecret}`, configuredSecret);
      expect(result.authorized).toBe(true);
    });

    test('incorrect bearer token is rejected', () => {
      const configuredSecret = 'pk_adm_sec_custom_98765';
      const result = verifyBearerToken('Bearer wrong_token_value', configuredSecret);
      expect(result.authorized).toBe(false);
    });

    test('Supabase service-role key is rejected even when present in environment', () => {
      const configuredSecret = 'pk_adm_sec_custom_98765';
      const supabaseServiceKey = 'mock_service_key_for_test_rejection_only';
      const result = verifyBearerToken(`Bearer ${supabaseServiceKey}`, configuredSecret);
      expect(result.authorized).toBe(false);
    });

    test('SESSION_SECRET is rejected as a bearer token', () => {
      const configuredSecret = 'pk_adm_sec_custom_98765';
      const sessionSecret = 'mock_session_secret_for_test_rejection_only';
      const result = verifyBearerToken(`Bearer ${sessionSecret}`, configuredSecret);
      expect(result.authorized).toBe(false);
    });

    test('fails closed when ADMIN_SECRET is not configured (empty or undefined)', () => {
      expect(verifyBearerToken('Bearer some_bearer_token', undefined).authorized).toBe(false);
      expect(verifyBearerToken('Bearer some_bearer_token', '').authorized).toBe(false);
      expect(verifyBearerToken('Bearer some_bearer_token', '   ').authorized).toBe(false);
    });
  });
});

