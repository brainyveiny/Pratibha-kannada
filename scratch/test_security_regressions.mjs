import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const envPath = path.resolve(__dirname, '..', '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
}

const BASE = process.env.BASE_URL || 'http://localhost:3000';
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'pk_sec_sign_kannada_2026_d3f4a8b9c1e075841209384756201948576';

function signSession(session) {
  const dataB64 = Buffer.from(JSON.stringify(session), 'utf-8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(dataB64).digest('base64url');
  return `${dataB64}.${sig}`;
}

let passedCount = 0;
let totalCount = 0;

function assert(condition, testName, details = '') {
  totalCount++;
  if (condition) {
    passedCount++;
    console.log(`[PASS] ${testName}`);
  } else {
    console.error(`[FAIL] ${testName} -> ${details}`);
  }
}

async function runRegressionSuite() {
  console.log('========================================================');
  console.log('PRATIBHA KANNADA — SECURITY REGRESSION TEST SUITE');
  console.log('Target: ' + BASE);
  console.log('========================================================\n');

  const testUserEmail = `reg_student_${Date.now()}@example.com`;
  const validPassword = 'StrongPassword@2026';

  // 0. Setup: Register a legitimate user
  const setupRes = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': BASE },
    body: JSON.stringify({
      display_name: 'ಪರೀಕ್ಷಾರ್ಥಿ ವಿದ್ಯಾರ್ಥಿ',
      email: testUserEmail,
      grade: '10',
      password: validPassword,
    }),
  });
  assert(setupRes.status === 200, 'Setup: Register legitimate student', `Status was ${setupRes.status}`);

  // Test 1: Empty password rejection
  console.log('\n--- 1. Testing Empty Password Rejection ---');
  const emptyPwdRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': BASE },
    body: JSON.stringify({
      email: testUserEmail,
      password: '',
    }),
  });
  const emptyPwdData = await emptyPwdRes.json();
  assert(
    emptyPwdRes.status === 400 && emptyPwdData.error.includes('ಪಾಸ್‌ವರ್ಡ್'),
    'Login rejects empty password with 400',
    `Status ${emptyPwdRes.status}, error: ${emptyPwdData.error}`
  );

  // Test 1b: Login UI renders specific error messages according to query param
  console.log('\n--- 1b. Testing Login UI Error Message Mapping ---');
  const missingPwdUiRes = await fetch(`${BASE}/login?error=missing_password`);
  const missingPwdUiHtml = await missingPwdUiRes.text();
  assert(
    missingPwdUiRes.status === 200 && missingPwdUiHtml.includes('Password required'),
    'Login page renders "Password required" alert for error=missing_password',
    `Status ${missingPwdUiRes.status}`
  );

  const invalidCredsUiRes = await fetch(`${BASE}/login?error=invalid_credentials`);
  const invalidCredsUiHtml = await invalidCredsUiRes.text();
  assert(
    invalidCredsUiRes.status === 200 && invalidCredsUiHtml.includes('Invalid email or password'),
    'Login page renders "Invalid email or password" alert for error=invalid_credentials',
    `Status ${invalidCredsUiRes.status}`
  );

  const adminReqUiRes = await fetch(`${BASE}/login?error=admin_required`);
  const adminReqUiHtml = await adminReqUiRes.text();
  assert(
    adminReqUiRes.status === 200 && adminReqUiHtml.includes('Admin authorization required'),
    'Login page renders "Admin authorization required" alert for error=admin_required',
    `Status ${adminReqUiRes.status}`
  );

  const unknownErrUiRes = await fetch(`${BASE}/login?error=unexpected_error_code`);
  const unknownErrUiHtml = await unknownErrUiRes.text();
  assert(
    unknownErrUiRes.status === 200 && unknownErrUiHtml.includes('Login failed'),
    'Login page safely falls back to generic alert for unknown error query code',
    `Status ${unknownErrUiRes.status}`
  );

  // Test 1c: Misleading password text removed and required attribute present
  console.log('\n--- 1c. Testing Login UI Password Field Requirement ---');
  const normalLoginUiRes = await fetch(`${BASE}/login`);
  const normalLoginUiHtml = await normalLoginUiRes.text();
  assert(
    normalLoginUiRes.status === 200 &&
      !normalLoginUiHtml.includes('ಪಾಸ್‌ವರ್ಡ್ ನೆನಪಿಲ್ಲದಿದ್ದರೂ ಇಮೇಲ್ ಮೂಲಕ ಮುಂದುವರಿಯಬಹುದು') &&
      normalLoginUiHtml.includes('name="password"') &&
      normalLoginUiHtml.includes('required'),
    'Login page removes misleading optional password text and marks password required',
    `Status ${normalLoginUiRes.status}`
  );

  // Test 2: Wrong password rejection
  console.log('\n--- 2. Testing Wrong Password Rejection ---');
  const wrongPwdRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': BASE },
    body: JSON.stringify({
      email: testUserEmail,
      password: 'DefinitelyIncorrectPassword123!',
    }),
  });
  const wrongPwdData = await wrongPwdRes.json();
  assert(
    wrongPwdRes.status === 401 && wrongPwdData.error.includes('ತಪ್ಪಾದ'),
    'Login rejects wrong password with 401',
    `Status ${wrongPwdRes.status}, error: ${wrongPwdData.error}`
  );

  // Test 3: Correct password authentication
  console.log('\n--- 3. Testing Correct Password Authentication ---');
  const correctPwdRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Origin': BASE },
    body: JSON.stringify({
      email: testUserEmail,
      password: validPassword,
    }),
  });
  const correctPwdData = await correctPwdRes.json();
  const setCookie = correctPwdRes.headers.get('set-cookie') || '';
  assert(
    correctPwdRes.status === 200 && correctPwdData.success === true && setCookie.includes('pratibha_user='),
    'Login succeeds with correct password and sets session cookie',
    `Status ${correctPwdRes.status}`
  );

  // Test 3b: Valid signed student session on dashboard
  console.log('\n--- 3b. Testing Valid Signed Student Session on Dashboard ---');
  const validStudentCookie = setCookie.split(';')[0];
  const dashStudentRes = await fetch(`${BASE}/dashboard`, {
    headers: { Cookie: validStudentCookie },
  });
  const dashStudentHtml = await dashStudentRes.text();
  assert(
    dashStudentRes.status === 200 &&
      dashStudentHtml.includes('ಪರೀಕ್ಷಾರ್ಥಿ ವಿದ್ಯಾರ್ಥಿ') &&
      dashStudentHtml.includes('ಲಾಗ್ ಔಟ್'),
    'Dashboard correctly parses signed session and renders student profile name',
    `Status ${dashStudentRes.status}`
  );

  // Test 3c: Tampered session on dashboard
  console.log('\n--- 3c. Testing Tampered Session Rejection on Dashboard ---');
  const tamperedDashToken = validStudentCookie.replace(/pratibha_user=([^;]+)/, (m, tok) => {
    const parts = tok.split('.');
    return `pratibha_user=${parts[0]}.invalid_signature`;
  });
  const tamperedDashRes = await fetch(`${BASE}/dashboard`, {
    headers: { Cookie: tamperedDashToken },
  });
  const tamperedDashHtml = await tamperedDashRes.text();
  assert(
    tamperedDashRes.status === 200 &&
      !tamperedDashHtml.includes('ಪರೀಕ್ಷಾರ್ಥಿ ವಿದ್ಯಾರ್ಥಿ') &&
      !tamperedDashHtml.includes('ಲಾಗ್ ಔಟ್') &&
      tamperedDashHtml.includes('ಲಾಗಿನ್'),
    'Dashboard rejects tampered session token and preserves logged-out view',
    `Status ${tamperedDashRes.status}`
  );

  // Test 3d: Logged-out (no cookie) request on dashboard
  console.log('\n--- 3d. Testing Logged-Out Request on Dashboard ---');
  const loggedOutDashRes = await fetch(`${BASE}/dashboard`);
  const loggedOutDashHtml = await loggedOutDashRes.text();
  assert(
    loggedOutDashRes.status === 200 &&
      !loggedOutDashHtml.includes('ಪರೀಕ್ಷಾರ್ಥಿ ವಿದ್ಯಾರ್ಥಿ') &&
      loggedOutDashHtml.includes('ಲಾಗಿನ್'),
    'Dashboard without cookies preserves default logged-out state',
    `Status ${loggedOutDashRes.status}`
  );

  // Test 4: Forged student -> admin cookie rejection
  console.log('\n--- 4. Testing Forged Student-to-Admin Cookie Rejection ---');
  // Attacker crafts raw unsigned base64 cookie with role: "admin"
  const forgedRawCookie = Buffer.from(
    JSON.stringify({ id: 'attacker', email: 'attacker@evil.com', role: 'admin' }),
    'utf-8'
  ).toString('base64');

  const forgedStudentAdminRes = await fetch(`${BASE}/api/admin/users`, {
    headers: {
      Cookie: `pratibha_user=${forgedRawCookie}`,
    },
  });
  assert(
    forgedStudentAdminRes.status === 403,
    'Unsigned forged student-to-admin cookie is strictly rejected with 403',
    `Status ${forgedStudentAdminRes.status}`
  );

  // Test 5: Forged admin cookie (tampered signature)
  console.log('\n--- 5. Testing Forged Admin Cookie (Tampered Signature) ---');
  const tamperedSession = signSession({
    id: 'usr_hacker',
    name: 'ಹ್ಯಾಕರ್',
    email: 'hacker@example.com',
    role: 'student',
    expiresAt: Date.now() + 86400000,
  });
  // Attacker modifies payload to admin but cannot sign with secret
  const tamperedTokenParts = tamperedSession.split('.');
  const modifiedPayloadB64 = Buffer.from(
    JSON.stringify({ id: 'usr_hacker', role: 'admin', expiresAt: Date.now() + 86400000 }),
    'utf-8'
  ).toString('base64url');
  const forgedTamperedToken = `${modifiedPayloadB64}.${tamperedTokenParts[1]}`;

  const forgedAdminRes = await fetch(`${BASE}/api/admin/users`, {
    headers: {
      Cookie: `pratibha_user=${forgedTamperedToken}`,
    },
  });
  assert(
    forgedAdminRes.status === 403,
    'Tampered HMAC signature cookie is rejected with 403',
    `Status ${forgedAdminRes.status}`
  );

  // Test 6: Expired session rejection
  console.log('\n--- 6. Testing Expired Session Rejection ---');
  const expiredToken = signSession({
    id: 'usr_admin',
    name: 'ನಿರ್ವಾಹಕ',
    email: 'admin@pratibhakannada.org',
    role: 'admin',
    expiresAt: Date.now() - 1000 * 60, // Expired 1 minute ago
  });
  const expiredRes = await fetch(`${BASE}/api/admin/users`, {
    headers: {
      Cookie: `pratibha_user=${expiredToken}`,
    },
  });
  assert(
    expiredRes.status === 403,
    'Cryptographically signed but EXPIRED admin session is rejected with 403',
    `Status ${expiredRes.status}`
  );

  // Test 7: Unauthorized admin API request (no credentials)
  console.log('\n--- 7. Testing Unauthorized Admin API Request ---');
  const noAuthAdminRes = await fetch(`${BASE}/api/admin/users`);
  assert(
    noAuthAdminRes.status === 403,
    'Admin API request without authentication is rejected with 403 (No Dev Bypass)',
    `Status ${noAuthAdminRes.status}`
  );

  // Test 7b: Valid configured ADMIN_SECRET is accepted
  console.log('\n--- 7b. Testing Configured ADMIN_SECRET Bearer Token Authorization ---');
  if (process.env.ADMIN_SECRET) {
    const validBearerRes = await fetch(`${BASE}/api/admin/users`, {
      headers: { Authorization: `Bearer ${process.env.ADMIN_SECRET}` },
    });
    const validBearerData = await validBearerRes.json();
    assert(
      validBearerRes.status === 200 && Array.isArray(validBearerData.users),
      'Valid configured ADMIN_SECRET bearer token is accepted with 200',
      `Status ${validBearerRes.status}`
    );
  } else {
    console.log('[SKIP] ADMIN_SECRET not configured in test environment for Test 7b');
  }

  // Test 7c: Incorrect bearer token is rejected
  console.log('\n--- 7c. Testing Incorrect Bearer Token Rejection ---');
  const incorrectBearerRes = await fetch(`${BASE}/api/admin/users`, {
    headers: { Authorization: 'Bearer invalid_wrong_admin_token_xyz999' },
  });
  assert(
    incorrectBearerRes.status === 403,
    'Incorrect bearer token is rejected with 403',
    `Status ${incorrectBearerRes.status}`
  );

  // Test 7d: Supabase service-role key rejected as bearer token
  console.log('\n--- 7d. Testing Supabase Service-Role Key Rejection as Bearer Credential ---');
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    const serviceKeyRes = await fetch(`${BASE}/api/admin/users`, {
      headers: { Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}` },
    });
    assert(
      serviceKeyRes.status === 403,
      'Supabase service-role key is rejected as a bearer token even when configured in environment (403)',
      `Status ${serviceKeyRes.status}`
    );
  }

  // Test 7e: SESSION_SECRET rejected as bearer token
  console.log('\n--- 7e. Testing SESSION_SECRET Rejection as Bearer Credential ---');
  if (process.env.SESSION_SECRET) {
    const sessionSecretRes = await fetch(`${BASE}/api/admin/users`, {
      headers: { Authorization: `Bearer ${process.env.SESSION_SECRET}` },
    });
    assert(
      sessionSecretRes.status === 403,
      'SESSION_SECRET is rejected as a bearer token (no fallback) (403)',
      `Status ${sessionSecretRes.status}`
    );
  }

  // Test 8: Unauthorized file upload request
  console.log('\n--- 8. Testing Unauthorized Upload Request ---');
  const formData = new FormData();
  formData.append('file', new Blob(['sample pdf text'], { type: 'application/pdf' }), 'sample.pdf');
  const noAuthUploadRes = await fetch(`${BASE}/api/upload`, {
    method: 'POST',
    headers: { Origin: BASE },
    body: formData,
  });
  assert(
    noAuthUploadRes.status === 403,
    'Upload API without admin authentication is rejected with 403 (No Dev Bypass)',
    `Status ${noAuthUploadRes.status}`
  );

  // Test 9: Legitimate admin request succeeds
  console.log('\n--- 9. Testing Legitimate Admin Request ---');
  const validAdminToken = signSession({
    id: 'usr_admin_1',
    name: 'ಮುಖ್ಯ ನಿರ್ವಾಹಕ',
    email: 'admin@pratibhakannada.org',
    role: 'admin',
    expiresAt: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
  });

  const validAdminRes = await fetch(`${BASE}/api/admin/users`, {
    headers: {
      Cookie: `pratibha_user=${validAdminToken}`,
    },
  });
  const validAdminData = await validAdminRes.json();
  assert(
    validAdminRes.status === 200 && Array.isArray(validAdminData.users),
    'Legitimate signed admin session succeeds with 200 and loads user list',
    `Status ${validAdminRes.status}`
  );

  // Test 9b: Unlisted email with role='admin' is rejected (ADMIN_EMAILS enforcement)
  console.log('\n--- 9b. Testing Unlisted Admin Email Rejection ---');
  const unlistedAdminToken = signSession({
    id: 'usr_fake_admin',
    name: 'ನಕಲಿ ನಿರ್ವಾಹಕ',
    email: 'unlisted_admin@example.com',
    role: 'admin',
    expiresAt: Date.now() + 1000 * 60 * 60 * 24,
  });
  const unlistedAdminRes = await fetch(`${BASE}/api/admin/users`, {
    headers: {
      Cookie: `pratibha_user=${unlistedAdminToken}`,
    },
  });
  assert(
    unlistedAdminRes.status === 403,
    'Session with role=admin but email not in ADMIN_EMAILS is strictly rejected with 403',
    `Status ${unlistedAdminRes.status}`
  );

  // Test 9c: admin_pk_ registration does NOT get admin role
  console.log('\n--- 9c. Testing admin_pk_ prefix does NOT elevate to admin ---');
  const adminPkEmail = `admin_pk_${Date.now()}@example.com`;
  const regAdminPkRes = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE },
    body: JSON.stringify({
      display_name: 'ನಕಲಿ ಅಡ್ಮಿನ್',
      email: adminPkEmail,
      grade: '10',
      password: 'StrongPassword@2026',
    }),
  });
  const regAdminPkData = await regAdminPkRes.json();
  assert(
    regAdminPkRes.status === 200 && regAdminPkData.user?.role === 'student',
    'Registration with admin_pk_ prefix is strictly assigned role: student',
    `Role was ${regAdminPkData.user?.role}`
  );

  // Test 10: Legitimate admin upload succeeds
  console.log('\n--- 10. Testing Legitimate Admin Upload ---');
  const adminUploadFormData = new FormData();
  adminUploadFormData.append('file', new Blob(['legitimate pdf content'], { type: 'application/pdf' }), 'notes.pdf');
  const validAdminUploadRes = await fetch(`${BASE}/api/upload`, {
    method: 'POST',
    headers: {
      Origin: BASE,
      Cookie: `pratibha_user=${validAdminToken}`,
    },
    body: adminUploadFormData,
  });
  assert(
    validAdminUploadRes.status === 200,
    'Legitimate admin upload succeeds with 200',
    `Status ${validAdminUploadRes.status}`
  );

  // Test 11: Password reset flow test
  console.log('\n--- 11. Testing Password Reset Flow ---');
  const resetReqRes = await fetch(`${BASE}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE },
    body: JSON.stringify({
      action: 'request',
      email: testUserEmail,
    }),
  });
  const resetReqData = await resetReqRes.json();
  assert(
    resetReqRes.status === 200 && Boolean(resetReqData.resetToken),
    'Password reset token generated successfully',
    `Status ${resetReqRes.status}`
  );

  const newPassword = 'NewlyUpdatedPassword@2026';
  const resetConfirmRes = await fetch(`${BASE}/api/auth/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE },
    body: JSON.stringify({
      action: 'confirm',
      token: resetReqData.resetToken,
      newPassword: newPassword,
    }),
  });
  assert(
    resetConfirmRes.status === 200,
    'Password reset confirmed successfully with new password',
    `Status ${resetConfirmRes.status}`
  );

  // Verify login with new password
  const newLoginRes = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE },
    body: JSON.stringify({
      email: testUserEmail,
      password: newPassword,
    }),
  });
  assert(
    newLoginRes.status === 200,
    'Login succeeds with new password after reset',
    `Status ${newLoginRes.status}`
  );

  console.log('\n========================================================');
  console.log(`REGRESSION SUITE COMPLETED: ${passedCount} / ${totalCount} PASSED`);
  console.log('========================================================');

  if (passedCount !== totalCount) {
    process.exit(1);
  }
}

runRegressionSuite().catch((err) => {
  console.error('Test execution error:', err);
  process.exit(1);
});
