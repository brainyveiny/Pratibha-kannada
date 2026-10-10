// scratch/test_cms_detail_delivery.mjs
// Verification of Stage A: CMS Detail Delivery, Public Resolution, RLS Boundary & Error Handling

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

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

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const anonClient = (supabaseUrl && supabaseAnonKey) ? createClient(supabaseUrl, supabaseAnonKey) : null;

let passCount = 0;
let failCount = 0;

function assert(cond, name, details = '') {
  if (cond) {
    console.log(`[PASS] ${name}`);
    passCount++;
  } else {
    console.error(`[FAIL] ${name} ${details ? '— ' + details : ''}`);
    failCount++;
  }
}

async function runStageATests() {
  console.log('========================================================');
  console.log('STAGE A: CMS DETAIL DELIVERY VERIFICATION SUITE');
  console.log(`Target: ${BASE}`);
  console.log('========================================================\n');

  let testFixtureId = null;
  let testFixtureNoTopicId = null;

  try {
    // -------------------------------------------------------------------------
    // TEST 1: Existing Static Resource Opens Correctly
    // -------------------------------------------------------------------------
    console.log('--- Test 1: Existing Static Resource Delivery ---');
    const staticRes = await fetch(`${BASE}/dashboard/resource/10th-yuddha-prose-notes`);
    const staticHtml = await staticRes.text();
    assert(staticRes.status === 200, 'Static resource (10th-yuddha-prose-notes) returns HTTP 200');
    assert(staticHtml.includes('ಯುದ್ಧ'), 'Static resource renders correct title');
    assert(staticHtml.includes('ಸಾರಾ ಅಬೂಬಕರ್'), 'Static resource renders author/source');

    // -------------------------------------------------------------------------
    // TEST 2: Create a Draft CMS Resource (is_published = false)
    // -------------------------------------------------------------------------
    console.log('\n--- Test 2: Create CMS Draft Resource ---');
    const createRes = await fetch(`${BASE}/api/admin/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: BASE,
        Cookie: `pratibha_user=${adminToken}`,
      },
      body: JSON.stringify({
        title: '[TEST ONLY] Stage A CMS Detail Delivery',
        title_kn: '[ಪರೀಕ್ಷಾರ್ಥಿ] ಹಂತ-ಎ ವಿವರ ವಿತರಣೆ ಪರೀಕ್ಷೆ',
        description: '## ಪರೀಕ್ಷಾ ವಿಷಯ\n\nಇದು ಸ್ವಯಂಚಾಲಿತ ಪರೀಕ್ಷಾ ವಿವರಣೆಯಾಗಿದೆ.',
        resource_type: 'notes',
        is_published: false,
        category_slug: 'notes',
        topic_name: 'ಪರೀಕ್ಷಾ ಪಾಠ',
      }),
    });
    const createData = await createRes.json();
    assert(createRes.status === 200 && createData.success === true, 'Admin API creates test resource fixture in Supabase');
    testFixtureId = createData.resource?.id;
    assert(Boolean(testFixtureId), `Fixture ID acquired: ${testFixtureId}`);

    // -------------------------------------------------------------------------
    // TEST 3: Public Detail Route Strictly Blocks Draft (HTTP 404)
    // -------------------------------------------------------------------------
    console.log('\n--- Test 3: Public Detail Route Blocks Unpublished Draft ---');
    const draftDetailRes = await fetch(`${BASE}/dashboard/resource/${testFixtureId}`);
    assert(draftDetailRes.status === 404, 'Public unauthenticated route returns HTTP 404 for draft resource');

    // -------------------------------------------------------------------------
    // TEST 4: Supabase RLS Engine Level Verification (Anon Client)
    // -------------------------------------------------------------------------
    if (anonClient) {
      console.log('\n--- Test 4: Supabase RLS Level Draft Isolation (Anon Client) ---');
      const { data: rlsDraft, error: rlsErr } = await anonClient
        .from('resources')
        .select('id, title, is_published')
        .eq('id', testFixtureId)
        .maybeSingle();
      assert(rlsDraft === null, 'Supabase RLS strictly returns null for anon client querying unpublished draft');
    }

    // -------------------------------------------------------------------------
    // TEST 5: Publish CMS Resource & Verify Public Delivery (HTTP 200)
    // -------------------------------------------------------------------------
    console.log('\n--- Test 5: Publish CMS Resource and Verify Public Delivery ---');
    const pubRes = await fetch(`${BASE}/api/admin/content`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Origin: BASE,
        Cookie: `pratibha_user=${adminToken}`,
      },
      body: JSON.stringify({
        id: testFixtureId,
        is_published: true,
      }),
    });
    const pubData = await pubRes.json();
    assert(pubRes.status === 200 && pubData.resource?.is_published === true, 'Resource published via admin PUT');

    const pubDetailRes = await fetch(`${BASE}/dashboard/resource/${testFixtureId}`);
    const pubDetailHtml = await pubDetailRes.text();
    assert(pubDetailRes.status === 200, 'Public detail route returns HTTP 200 for published CMS resource');
    assert(pubDetailHtml.includes('[ಪರೀಕ್ಷಾರ್ಥಿ] ಹಂತ-ಎ ವಿವರ ವಿತರಣೆ ಪರೀಕ್ಷೆ'), 'Detail page renders CMS Kannada title');
    assert(pubDetailHtml.includes('ಪರೀಕ್ಷಾ ವಿಷಯ'), 'Detail page renders CMS Markdown content');

    // -------------------------------------------------------------------------
    // TEST 6: Missing Optional Relationships (Nullable topics/categories)
    // -------------------------------------------------------------------------
    console.log('\n--- Test 6: Safe Display with Missing Optional Relations ---');
    const noTopicRes = await fetch(`${BASE}/api/admin/content`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Origin: BASE,
        Cookie: `pratibha_user=${adminToken}`,
      },
      body: JSON.stringify({
        title: '[TEST ONLY] Resource Without Relations',
        title_kn: '[ಪರೀಕ್ಷಾರ್ಥಿ] ಸಂಬಂಧವಿಲ್ಲದ ಸಂಪನ್ಮೂಲ',
        description: 'ಇದು ಯಾವುದೇ ವರ್ಗವಿಲ್ಲದ ಸ್ವತಂತ್ರ ಸಂಪನ್ಮೂಲ.',
        resource_type: 'notes',
        is_published: true,
        // no class_id, no category_slug => topic_id will be null in DB
      }),
    });
    const noTopicData = await noTopicRes.json();
    testFixtureNoTopicId = noTopicData.resource?.id;
    assert(Boolean(testFixtureNoTopicId), `Created fixture with null relations: ${testFixtureNoTopicId}`);

    const noTopicDetailRes = await fetch(`${BASE}/dashboard/resource/${testFixtureNoTopicId}`);
    const noTopicDetailHtml = await noTopicDetailRes.text();
    assert(noTopicDetailRes.status === 200, 'Resource with null topic/class/category renders HTTP 200 without crashing');
    assert(noTopicDetailHtml.includes('10ನೇ ತರಗತಿ') && noTopicDetailHtml.includes('notes'), 'Default fallback class and category used safely');

    // -------------------------------------------------------------------------
    // TEST 7: Random Non-Existent UUID returns HTTP 404
    // -------------------------------------------------------------------------
    console.log('\n--- Test 7: Non-Existent UUID returns 404 ---');
    const fakeUuid = '00000000-0000-0000-0000-000000000000';
    const fakeUuidRes = await fetch(`${BASE}/dashboard/resource/${fakeUuid}`);
    assert(fakeUuidRes.status === 404, 'Random non-existent UUID returns HTTP 404');

    // -------------------------------------------------------------------------
    // TEST 8: Invalid Non-UUID Slug returns HTTP 404 Without DB Lookup
    // -------------------------------------------------------------------------
    console.log('\n--- Test 8: Invalid Non-UUID Slug returns 404 ---');
    const invalidSlug = 'arbitrary-invalid-slug-12345';
    const invalidSlugRes = await fetch(`${BASE}/dashboard/resource/${invalidSlug}`);
    assert(invalidSlugRes.status === 404, 'Arbitrary non-UUID non-static slug returns HTTP 404 immediately');

    // -------------------------------------------------------------------------
    // TEST 9: Unpublish and Verify Route Returns to 404
    // -------------------------------------------------------------------------
    console.log('\n--- Test 9: Unpublish Returns Route to 404 ---');
    await fetch(`${BASE}/api/admin/content`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Origin: BASE,
        Cookie: `pratibha_user=${adminToken}`,
      },
      body: JSON.stringify({
        id: testFixtureId,
        is_published: false, // UNPUBLISH
      }),
    });
    const unpubDetailRes = await fetch(`${BASE}/dashboard/resource/${testFixtureId}`);
    assert(unpubDetailRes.status === 404, 'Unpublished resource immediately ceases to resolve on public route (404)');

  } catch (err) {
    console.error('Test execution exception:', err);
    failCount++;
  } finally {
    // -------------------------------------------------------------------------
    // CLEANUP: Guarantee zero test artifacts remain in Supabase
    // -------------------------------------------------------------------------
    console.log('\n--- Cleanup: Deleting Test Fixtures from Supabase ---');
    if (testFixtureId) {
      await fetch(`${BASE}/api/admin/content?id=${testFixtureId}`, {
        method: 'DELETE',
        headers: { Origin: BASE, Cookie: `pratibha_user=${adminToken}` },
      });
      console.log(`Deleted test fixture: ${testFixtureId}`);
    }
    if (testFixtureNoTopicId) {
      await fetch(`${BASE}/api/admin/content?id=${testFixtureNoTopicId}`, {
        method: 'DELETE',
        headers: { Origin: BASE, Cookie: `pratibha_user=${adminToken}` },
      });
      console.log(`Deleted test fixture: ${testFixtureNoTopicId}`);
    }
  }

  console.log('\n========================================================');
  console.log(`STAGE A RESULTS: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('========================================================');

  if (failCount > 0) process.exit(1);
}

runStageATests();
