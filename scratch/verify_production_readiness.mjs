import crypto from 'crypto';

const BASE = process.env.BASE_URL || 'http://localhost:3001';
const SESSION_SECRET =
  process.env.SESSION_SECRET ||
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  'pk_sec_sign_kannada_2026_d3f4a8b9c1e075841209384756201948576';

function signSession(session) {
  const dataB64 = Buffer.from(JSON.stringify(session), 'utf-8').toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(dataB64).digest('base64url');
  return `${dataB64}.${sig}`;
}

const results = [];

function record(category, testName, passed, details = '') {
  results.push({ category, testName, passed, details });
  const tag = passed ? '[PASS]' : '[FAIL]';
  console.log(`${tag} [${category}] ${testName} ${details ? '(' + details + ')' : ''}`);
}

async function runVerification() {
  console.log('===============================================================');
  console.log('PRATIBHA KANNADA — PRODUCTION READINESS DEEP VERIFICATION');
  console.log('Target: ' + BASE);
  console.log('===============================================================\n');

  const testEmail = `verify_std_${Date.now()}@example.com`;
  const validPassword = 'VerifiedPass@2026';

  // ─────────────────────────────────────────────────────────────
  // 1. SESSION SECURITY (All 10 Attack/Verification Scenarios)
  // ─────────────────────────────────────────────────────────────
  console.log('>>> 1. SESSION SECURITY (10 CASES) <<<');

  // Case 1: Valid student session
  const studentToken = signSession({
    id: 'usr_student_test',
    name: 'ವಿದ್ಯಾರ್ಥಿ',
    email: testEmail,
    grade: '10',
    role: 'student',
    loggedInAt: new Date().toISOString(),
    expiresAt: Date.now() + 1000 * 60 * 60 * 24,
  });
  // Student accesses non-admin page / API
  const studentReq = await fetch(`${BASE}/dashboard`, {
    headers: { Cookie: `pratibha_user=${studentToken}` },
  });
  record('Session', '1. Valid student session accesses dashboard', studentReq.status === 200, `Status: ${studentReq.status}`);

  // Case 2: Valid admin session
  const adminToken = signSession({
    id: 'usr_admin_test',
    name: 'ನಿರ್ವಾಹಕ',
    email: 'admin@pratibhakannada.org',
    grade: '10',
    role: 'admin',
    loggedInAt: new Date().toISOString(),
    expiresAt: Date.now() + 1000 * 60 * 60 * 24,
  });
  const adminReq = await fetch(`${BASE}/api/admin/users`, {
    headers: { Cookie: `pratibha_user=${adminToken}` },
  });
  record('Session', '2. Valid admin session accesses admin API', adminReq.status === 200, `Status: ${adminReq.status}`);

  // Case 3: Modified role (student token with role changed to admin without resign)
  const studentParts = studentToken.split('.');
  const tamperedRolePayload = Buffer.from(
    JSON.stringify({
      id: 'usr_student_test',
      email: testEmail,
      role: 'admin', // Tampered!
      expiresAt: Date.now() + 1000 * 60 * 60 * 24,
    }),
    'utf-8'
  ).toString('base64url');
  const modifiedRoleToken = `${tamperedRolePayload}.${studentParts[1]}`;
  const modRoleReq = await fetch(`${BASE}/api/admin/users`, {
    headers: { Cookie: `pratibha_user=${modifiedRoleToken}` },
  });
  record('Session', '3. Modified role in session is rejected with 403', modRoleReq.status === 403, `Status: ${modRoleReq.status}`);

  // Case 4: Modified email
  const tamperedEmailPayload = Buffer.from(
    JSON.stringify({
      id: 'usr_admin_test',
      email: 'admin@pratibhakannada.org', // Tampered email in student token
      role: 'student',
      expiresAt: Date.now() + 1000 * 60 * 60 * 24,
    }),
    'utf-8'
  ).toString('base64url');
  const modifiedEmailToken = `${tamperedEmailPayload}.${studentParts[1]}`;
  const modEmailReq = await fetch(`${BASE}/api/admin/users`, {
    headers: { Cookie: `pratibha_user=${modifiedEmailToken}` },
  });
  record('Session', '4. Modified email with mismatched signature is rejected with 403', modEmailReq.status === 403, `Status: ${modEmailReq.status}`);

  // Case 5: Modified expiry
  const tamperedExpiryPayload = Buffer.from(
    JSON.stringify({
      id: 'usr_admin_test',
      role: 'admin',
      expiresAt: 9999999999999, // Prolonged
    }),
    'utf-8'
  ).toString('base64url');
  const modifiedExpiryToken = `${tamperedExpiryPayload}.${studentParts[1]}`;
  const modExpiryReq = await fetch(`${BASE}/api/admin/users`, {
    headers: { Cookie: `pratibha_user=${modifiedExpiryToken}` },
  });
  record('Session', '5. Modified expiry in token is rejected with 403', modExpiryReq.status === 403, `Status: ${modExpiryReq.status}`);

  // Case 6: Modified payload (arbitrary character flip in payload)
  const flippedPayload = studentParts[0].slice(0, -2) + 'aa';
  const modifiedPayloadToken = `${flippedPayload}.${studentParts[1]}`;
  const modPayloadReq = await fetch(`${BASE}/api/admin/users`, {
    headers: { Cookie: `pratibha_user=${modifiedPayloadToken}` },
  });
  record('Session', '6. Corrupted/modified payload is rejected with 403', modPayloadReq.status === 403, `Status: ${modPayloadReq.status}`);

  // Case 7: Invalid signature (garbage signature appended)
  const invalidSigToken = `${studentParts[0]}.invalid_signature_xyz123`;
  const invalidSigReq = await fetch(`${BASE}/api/admin/users`, {
    headers: { Cookie: `pratibha_user=${invalidSigToken}` },
  });
  record('Session', '7. Invalid signature is rejected with 403', invalidSigReq.status === 403, `Status: ${invalidSigReq.status}`);

  // Case 8: Missing signature (no period or signature part)
  const missingSigToken = studentParts[0];
  const missingSigReq = await fetch(`${BASE}/api/admin/users`, {
    headers: { Cookie: `pratibha_user=${missingSigToken}` },
  });
  record('Session', '8. Missing signature is rejected with 403', missingSigReq.status === 403, `Status: ${missingSigReq.status}`);

  // Case 9: Expired session (valid signature, but expired timestamp)
  const expiredToken = signSession({
    id: 'usr_admin_expired',
    email: 'admin@pratibhakannada.org',
    role: 'admin',
    expiresAt: Date.now() - 10000, // 10 seconds in the past
  });
  const expiredReq = await fetch(`${BASE}/api/admin/users`, {
    headers: { Cookie: `pratibha_user=${expiredToken}` },
  });
  record('Session', '9. Expired session is rejected with 403', expiredReq.status === 403, `Status: ${expiredReq.status}`);

  // Case 10: Completely fabricated cookie (e.g. legacy unsigned base64 or random string)
  const fabricatedCookie = Buffer.from('{"role":"admin","id":"hacker"}').toString('base64');
  const fabReq = await fetch(`${BASE}/api/admin/users`, {
    headers: { Cookie: `pratibha_user=${fabricatedCookie}` },
  });
  record('Session', '10. Completely fabricated unsigned cookie is rejected with 403', fabReq.status === 403, `Status: ${fabReq.status}`);

  // ─────────────────────────────────────────────────────────────
  // 2. PASSWORD AUTHENTICATION VERIFICATION
  // ─────────────────────────────────────────────────────────────
  console.log('\n>>> 2. PASSWORD AUTHENTICATION VERIFICATION <<<');

  // Register the test user first
  const regOk = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE },
    body: JSON.stringify({
      display_name: 'ಪರೀಕ್ಷಾರ್ಥಿ',
      email: testEmail,
      grade: '10',
      password: validPassword,
    }),
  });
  record('Auth', 'Registration succeeds with valid password', regOk.status === 200, `Status: ${regOk.status}`);

  // A. Empty password
  const emptyPwdReq = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE },
    body: JSON.stringify({ email: testEmail, password: '' }),
  });
  record('Auth', 'Empty password cannot authenticate (rejected with 400)', emptyPwdReq.status === 400, `Status: ${emptyPwdReq.status}`);

  // B. Whitespace password
  const wsPwdReq = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE },
    body: JSON.stringify({ email: testEmail, password: '     ' }),
  });
  record('Auth', 'Whitespace password cannot authenticate (rejected with 400)', wsPwdReq.status === 400, `Status: ${wsPwdReq.status}`);

  // C. Wrong password
  const wrongPwdReq = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE },
    body: JSON.stringify({ email: testEmail, password: 'CompletelyWrongPassword!' }),
  });
  record('Auth', 'Wrong password cannot authenticate (rejected with 401)', wrongPwdReq.status === 401, `Status: ${wrongPwdReq.status}`);

  // D. Correct password
  const correctPwdReq = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE },
    body: JSON.stringify({ email: testEmail, password: validPassword }),
  });
  record('Auth', 'Correct password authenticates (status 200)', correctPwdReq.status === 200, `Status: ${correctPwdReq.status}`);

  // E. Nonexistent email
  const nonexistentReq = await fetch(`${BASE}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE },
    body: JSON.stringify({ email: 'nonexistent_account_99@example.com', password: 'SomePassword123' }),
  });
  record('Auth', 'Nonexistent email cannot login (rejected with 401)', nonexistentReq.status === 401, `Status: ${nonexistentReq.status}`);

  // F. Duplicate registration
  const dupRegReq = await fetch(`${BASE}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: BASE },
    body: JSON.stringify({
      display_name: 'ಹೊಸ ಹೆಸರು',
      email: testEmail,
      grade: '9',
      password: 'AnotherPassword@2026',
    }),
  });
  record('Auth', 'Duplicate email registration cannot overwrite (rejected with 409)', dupRegReq.status === 409, `Status: ${dupRegReq.status}`);

  // ─────────────────────────────────────────────────────────────
  // 3. ADMIN AUTHORIZATION
  // ─────────────────────────────────────────────────────────────
  console.log('\n>>> 3. ADMIN AUTHORIZATION <<<');

  // Normal user accesses admin API
  const studentAdminReq = await fetch(`${BASE}/api/admin/users`, {
    headers: { Cookie: `pratibha_user=${studentToken}` },
  });
  record('Admin', 'Student session cannot access /api/admin/users (403)', studentAdminReq.status === 403, `Status: ${studentAdminReq.status}`);

  // Unauthenticated accesses admin API
  const unauthAdminReq = await fetch(`${BASE}/api/admin/users`);
  record('Admin', 'Unauthenticated request cannot access /api/admin/users (403)', unauthAdminReq.status === 403, `Status: ${unauthAdminReq.status}`);

  // Unauthenticated accesses /admin page (should redirect to login)
  const unauthAdminPage = await fetch(`${BASE}/admin`, { redirect: 'manual' });
  const isRedirect = [302, 307, 308].includes(unauthAdminPage.status) || unauthAdminPage.headers.get('location')?.includes('/login');
  record('Admin', 'Unauthenticated request to /admin redirects to login', isRedirect, `Status: ${unauthAdminPage.status}`);

  // Legitimate admin accesses /api/admin/users
  const legitAdminReq = await fetch(`${BASE}/api/admin/users`, {
    headers: { Cookie: `pratibha_user=${adminToken}` },
  });
  record('Admin', 'Legitimate admin accesses /api/admin/users (200)', legitAdminReq.status === 200, `Status: ${legitAdminReq.status}`);

  // Bearer token admin access
  const bearerReq = await fetch(`${BASE}/api/admin/users`, {
    headers: { Authorization: `Bearer ${SESSION_SECRET}` },
  });
  record('Admin', 'Legitimate Bearer token accesses /api/admin/users (200)', bearerReq.status === 200, `Status: ${bearerReq.status}`);

  console.log('\n===============================================================');
  const allPassed = results.every(r => r.passed);
  console.log(`TOTAL TESTS: ${results.length} | PASSED: ${results.filter(r => r.passed).length} | FAILED: ${results.filter(r => !r.passed).length}`);
  console.log('===============================================================');

  if (!allPassed) process.exit(1);
}

runVerification().catch(err => {
  console.error('Execution error:', err);
  process.exit(1);
});
