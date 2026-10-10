// scratch/test_admin_cms.mjs
// Verification of Pratibha Kannada Admin CMS API (CRUD, Draft vs Published, RLS, and Student Dashboard)

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

const adminToken = signSession({
  id: 'admin_test_1',
  name: 'ಮುಖ್ಯ ನಿರ್ವಾಹಕ',
  email: 'admin@pratibhakannada.org',
  role: 'admin',
  expiresAt: Date.now() + 86400000,
});

const studentToken = signSession({
  id: 'student_test_1',
  name: 'ಸಾಮಾನ್ಯ ವಿದ್ಯಾರ್ಥಿ',
  email: 'student@example.com',
  role: 'student',
  expiresAt: Date.now() + 86400000,
});

let passCount = 0;
let failCount = 0;

function assert(cond, name, details = '') {
  if (cond) {
    console.log(`[PASS] ${name}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${name} -> ${details}`);
    failCount++;
  }
}

async function runCmsSuite() {
  console.log('========================================================');
  console.log('PRATIBHA KANNADA — ADMIN CMS TEST SUITE');
  console.log('Target: ' + BASE);
  console.log('========================================================\n');

  // 1. Unauthenticated access blocked
  console.log('--- 1. Testing Security RBAC on Admin CMS API ---');
  const unauthRes = await fetch(`${BASE}/api/admin/content`);
  assert(unauthRes.status === 403, 'Unauthenticated request to CMS API rejected with 403');

  const studentRes = await fetch(`${BASE}/api/admin/content`, {
    headers: { Cookie: `pratibha_user=${studentToken}` },
  });
  assert(studentRes.status === 403, 'Normal student session rejected from CMS API with 403');

  // 2. Legitimate Admin access succeeds
  console.log('\n--- 2. Testing Legitimate Admin GET /api/admin/content ---');
  const adminGetRes = await fetch(`${BASE}/api/admin/content`, {
    headers: { Cookie: `pratibha_user=${adminToken}` },
  });
  assert(adminGetRes.status === 200, 'Admin session successfully accesses CMS API');

  const adminGetData = await adminGetRes.json();
  assert(
    adminGetData.success === true && Array.isArray(adminGetData.classes) && adminGetData.classes.length > 0,
    `Admin CMS loads class hierarchy (found ${adminGetData.classes?.length} classes)`
  );

  const testClassId = adminGetData.classes[0]?.id;

  // 3. Create Resource as DRAFT
  console.log('\n--- 3. Testing Create Resource as DRAFT ---');
  const testTitle = `CMS Test Note ${Date.now()}`;
  const createRes = await fetch(`${BASE}/api/admin/content`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Origin: BASE,
      Cookie: `pratibha_user=${adminToken}`,
    },
    body: JSON.stringify({
      title: testTitle,
      title_kn: 'ಪರೀಕ್ಷಾರ್ಥಿ ನೋಟ್ಸ್ ೨೦೨೬',
      description: 'CMS ಪರೀಕ್ಷೆಗಾಗಿ ರಚಿಸಲಾದ ಕರಡು ಸಂಪನ್ಮೂಲ',
      resource_type: 'notes',
      class_id: testClassId,
      category_slug: 'notes',
      is_published: false, // DRAFT!
    }),
  });

  const createData = await createRes.json();
  assert(
    createRes.status === 200 && createData.success === true && createData.resource?.is_published === false,
    'Resource created cleanly as DRAFT (is_published = false)'
  );

  const createdId = createData.resource?.id;

  // 4. Verify Draft does NOT appear on student dashboard
  console.log('\n--- 4. Verify DRAFT is Hidden on Student Dashboard ---');
  const dashRes = await fetch(`${BASE}/dashboard`);
  const dashHtml = await dashRes.text();
  assert(!dashHtml.includes(testTitle), 'Draft resource is strictly HIDDEN from student dashboard');

  // 5. Publish the Draft via PUT
  console.log('\n--- 5. Testing Publish Toggle via PUT ---');
  const publishRes = await fetch(`${BASE}/api/admin/content`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Origin: BASE,
      Cookie: `pratibha_user=${adminToken}`,
    },
    body: JSON.stringify({
      id: createdId,
      is_published: true, // PUBLISH!
    }),
  });

  const publishData = await publishRes.json();
  assert(
    publishRes.status === 200 && publishData.success === true && publishData.resource?.is_published === true,
    'Resource updated cleanly to PUBLISHED (is_published = true)'
  );

  // 6. Verify Published Resource now appears on student dashboard
  console.log('\n--- 6. Verify PUBLISHED Resource Appears on Student Dashboard ---');
  const pubDashRes = await fetch(`${BASE}/dashboard`);
  const pubDashHtml = await pubDashRes.text();
  assert(pubDashHtml.includes('ಪರೀಕ್ಷಾರ್ಥಿ ನೋಟ್ಸ್ ೨೦೨೬'), 'Published resource is visible on student dashboard');

  // 7. Clean up: Delete test resource
  console.log('\n--- 7. Cleanup: Delete Test Resource ---');
  const delRes = await fetch(`${BASE}/api/admin/content?id=${createdId}`, {
    method: 'DELETE',
    headers: {
      Origin: BASE,
      Cookie: `pratibha_user=${adminToken}`,
    },
  });

  const delData = await delRes.json();
  assert(delRes.status === 200 && delData.success === true, 'Test resource deleted cleanly from Supabase');

  console.log('\n========================================================');
  console.log(`CMS TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('========================================================');

  if (failCount > 0) process.exit(1);
}

runCmsSuite().catch((err) => {
  console.error('Fatal CMS test error:', err);
  process.exit(1);
});
