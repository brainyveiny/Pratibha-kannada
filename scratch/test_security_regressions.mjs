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
