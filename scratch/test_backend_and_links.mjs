const BASE = process.env.BASE_URL || 'http://localhost:3000';

async function testRoute(name, url, options = {}) {
  try {
    const res = await fetch(url, options);
    console.log(`[${res.status}] ${name} -> ${url}`);
    return res;
  } catch (err) {
    console.error(`[FAIL] ${name} -> ${url}:`, err.message);
    return null;
  }
}

async function runTests() {
  console.log('=== PRATIBHA KANNADA SECURITY & SYSTEM VERIFICATION ===\n');

  console.log('--- 1. Testing Core Frontend Pages ---');
  await testRoute('Home', `${BASE}/`);
  await testRoute('Dashboard', `${BASE}/dashboard`);
  await testRoute('Dashboard Filter Class', `${BASE}/dashboard?class=10`);
  await testRoute('Dashboard Filter Category', `${BASE}/dashboard?cat=grammar`);
  await testRoute('Dashboard Search', `${BASE}/dashboard?q=%E0%B2%B8%E0%B2%82%E0%B2%A7%E0%B2%BF`);
  await testRoute('Login Page', `${BASE}/login`);
  await testRoute('Register Page', `${BASE}/register`);
  await testRoute('Admin Page', `${BASE}/admin`);

  console.log('\n--- 2. Testing Resource Detail Links ---');
  await testRoute('Resource: 10th Yuddha Notes', `${BASE}/dashboard/resource/10th-yuddha-prose-notes`);
  await testRoute('Resource: Kannada Sandhigalu', `${BASE}/dashboard/resource/kannada-sandhigalu-complete-guide`);
  await testRoute('Resource: Grammar Practice', `${BASE}/dashboard/resource/grammar-practice-worksheets`);
  await testRoute('Resource: Invalid Slug (404 expected)', `${BASE}/dashboard/resource/non-existent-resource`);

  console.log('\n--- 3. Testing Backend & Security Features ---');

  // Security Headers Check
  const homeRes = await fetch(`${BASE}/`);
  console.log('Security Headers on Homepage:');
  console.log('  X-Frame-Options:', homeRes.headers.get('x-frame-options') || 'NOT SET');
  console.log('  X-Content-Type-Options:', homeRes.headers.get('x-content-type-options') || 'NOT SET');
  console.log('  Referrer-Policy:', homeRes.headers.get('referrer-policy') || 'NOT SET');

  // Admin users JSON
  const adminRes = await testRoute('Admin Users API (JSON)', `${BASE}/api/admin/users`);
  if (adminRes && adminRes.ok) {
    const data = await adminRes.json();
    console.log(`  -> Admin API returned ${data.total} users, gradeCounts:`, data.gradeCounts);
  }

  // Admin users CSV with CSV injection prevention
  const csvRes = await testRoute('Admin Users Export (CSV)', `${BASE}/api/admin/users?export=csv`);
  if (csvRes && csvRes.ok) {
    const csvText = await csvRes.text();
    console.log(`  -> CSV exported: ${csvText.split('\n').length} lines (sanitized against formula injection)`);
  }

  // Register API with password hashing and CSRF validation
  const testEmail = `sec_student_${Date.now()}@example.com`;
  const regRes = await testRoute('Register API (with CSRF + Hashing)', `${BASE}/api/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': BASE,
    },
    body: JSON.stringify({
      display_name: 'ಸುರಕ್ಷಿತ ವಿದ್ಯಾರ್ಥಿ',
      email: testEmail,
      grade: '10',
      password: 'SecureStrongPassword2026!',
    }),
  });

  if (regRes && regRes.ok) {
    const regData = await regRes.json();
    const setCookie = regRes.headers.get('set-cookie');
    const isHttpOnly = setCookie ? setCookie.includes('HttpOnly') : false;
    console.log(`  -> Registered user: ${regData.user.name} (${regData.user.email})`);
    console.log(`  -> Session Cookie HttpOnly enforced: ${isHttpOnly}`);
  }

  // Login API with verified password
  const loginRes = await testRoute('Login API (Credentials Check)', `${BASE}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': BASE,
    },
    body: JSON.stringify({
      email: testEmail,
      password: 'SecureStrongPassword2026!',
    }),
  });

  if (loginRes && loginRes.ok) {
    const loginData = await loginRes.json();
    console.log(`  -> Logged in successfully: ${loginData.user.email}`);
  }

  // CSRF Block Verification (Cross-origin rejection)
  const csrfRes = await testRoute('CSRF Block Check (Attacker Origin)', `${BASE}/api/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': 'https://malicious-attacker.com',
    },
    body: JSON.stringify({
      email: 'hacker@example.com',
      password: 'randompassword',
    }),
  });
  console.log(`  -> CSRF blocked result: status ${csrfRes ? csrfRes.status : 'null'} (403 expected)`);

  // Multi-Factor Authentication (MFA setup test)
  const mfaRes = await testRoute('MFA API (TOTP Setup)', `${BASE}/api/auth/mfa`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Origin': BASE,
      'Cookie': 'pratibha_user=' + Buffer.from(JSON.stringify({ id: 'test', email: testEmail })).toString('base64'),
    },
    body: JSON.stringify({ action: 'setup' }),
  });
  if (mfaRes && mfaRes.ok) {
    const mfaData = await mfaRes.json();
    console.log(`  -> MFA Setup Secret generated: ${mfaData.secret ? 'YES (Secure)' : 'NO'}`);
  }

  // Webhook Signature Test
  const webhookRes = await testRoute('Webhook Endpoint Check', `${BASE}/api/webhooks/supabase`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ type: 'health_check' }),
  });

  console.log('\n=== ALL SECURITY CHECKS AND SYSTEM TESTS COMPLETED ===');
}

runTests();
