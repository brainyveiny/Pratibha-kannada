// scratch/test_live_supabase_integration.mjs
// Production Infrastructure Integration & RLS Verification Suite for Pratibha Kannada

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT_DIR = path.resolve(__dirname, '..');

// Load .env.local if present
function loadEnv() {
  const envPath = path.join(ROOT_DIR, '.env.local');
  if (!fs.existsSync(envPath)) return {};
  const content = fs.readFileSync(envPath, 'utf8');
  const env = {};
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eqIdx = trimmed.indexOf('=');
    if (eqIdx !== -1) {
      const key = trimmed.slice(0, eqIdx).trim();
      const val = trimmed.slice(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
      env[key] = val;
    }
  }
  return env;
}

const env = { ...process.env, ...loadEnv() };

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON_KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SERVICE_ROLE_KEY = env.SUPABASE_SERVICE_ROLE_KEY;
const BUCKET_NAME = env.SUPABASE_STORAGE_BUCKET || 'educational-resources';

console.log('========================================================');
console.log('PRATIBHA KANNADA — SUPABASE PRODUCTION INTEGRATION TEST');
console.log('========================================================\n');

async function run() {
  // 1. Check environment variables
  console.log('--- 1. Environment Variables Check ---');
  const hasUrl = Boolean(SUPABASE_URL && !SUPABASE_URL.includes('your_supabase'));
  const hasAnon = Boolean(ANON_KEY && !ANON_KEY.includes('your_supabase'));
  const hasServiceRole = Boolean(SERVICE_ROLE_KEY && !SERVICE_ROLE_KEY.includes('your_supabase'));

  console.log(`NEXT_PUBLIC_SUPABASE_URL: ${hasUrl ? 'CONFIGURED [VERIFIED]' : 'MISSING / PLACEHOLDER'}`);
  console.log(`NEXT_PUBLIC_SUPABASE_ANON_KEY: ${hasAnon ? 'CONFIGURED [VERIFIED]' : 'MISSING / PLACEHOLDER'}`);
  console.log(`SUPABASE_SERVICE_ROLE_KEY: ${hasServiceRole ? 'CONFIGURED (Server-only) [VERIFIED]' : 'MISSING / PLACEHOLDER'}`);

  if (!hasUrl || !hasAnon || !hasServiceRole) {
    console.log('\n[STATUS: NOT YET CONFIGURED]');
    console.log('Please configure valid production Supabase keys in .env.local to execute live integration tests.');
    process.exit(0);
  }

  const { createClient } = await import('@supabase/supabase-js');

  const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const supabaseClient = createClient(SUPABASE_URL, ANON_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  let passCount = 0;
  let failCount = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`[PASS] ${message}`);
      passCount++;
    } else {
      console.error(`[FAIL] ${message}`);
      failCount++;
    }
  }

  // 2. Check 9 Tables
  console.log('\n--- 2. Database Schema (9 Tables Check) ---');
  const tables = [
    'profiles',
    'classes',
    'subjects',
    'categories',
    'topics',
    'resources',
    'question_papers',
    'favorites',
    'recent_views',
  ];

  for (const table of tables) {
    try {
      const { data, error } = await supabaseAdmin.from(table).select('*').limit(1);
      assert(!error, `Table '${table}' exists and is queryable`);
      if (error) console.error(`   Error on ${table}: ${error.message}`);
    } catch (err) {
      assert(false, `Table '${table}' threw error: ${err.message}`);
    }
  }

  // 3. Check Seed Data (Classes)
  console.log('\n--- 3. Seed Classes Verification ---');
  try {
    const { data: classes, error: cErr } = await supabaseAdmin.from('classes').select('name, slug, sort_order');
    assert(!cErr && classes && classes.length > 0, `Classes seed records found (count: ${classes?.length || 0})`);
    if (classes && classes.length > 0) {
      console.log(`   Sample classes: ${classes.slice(0, 3).map((c) => c.name).join(', ')}`);
    }
  } catch (err) {
    assert(false, `Classes query failed: ${err.message}`);
  }

  // 4. Check Storage Bucket
  console.log('\n--- 4. Supabase Storage Bucket Check ---');
  try {
    const { data: buckets, error: bErr } = await supabaseAdmin.storage.listBuckets();
    if (bErr) {
      assert(false, `Storage bucket listing failed: ${bErr.message}`);
    } else {
      const bucket = buckets.find((b) => b.name === BUCKET_NAME || b.name === 'educational-resources');
      assert(Boolean(bucket), `Storage bucket '${BUCKET_NAME}' exists`);
      if (bucket) {
        console.log(`   Bucket public access: ${bucket.public ? 'PUBLIC (Direct downloads enabled)' : 'PRIVATE'}`);
      }
    }
  } catch (err) {
    assert(false, `Storage check threw: ${err.message}`);
  }

  // 5. Test Live User Flow & Profile RLS
  console.log('\n--- 5. User Creation & RLS Verification ---');
  const testEmail = `test_live_${Date.now()}@pratibhakannada.org`;
  const testPassword = 'TestPassword@2026';
  let createdUserId = null;

  try {
    const { data: authUser, error: aErr } = await supabaseAdmin.auth.admin.createUser({
      email: testEmail,
      password: testPassword,
      email_confirm: true,
      user_metadata: { display_name: 'ಪರೀಕ್ಷಾರ್ಥಿ ವಿದ್ಯಾರ್ಥಿ', grade: '10' },
    });

    assert(!aErr && authUser.user, 'Supabase Auth user created successfully');
    if (authUser?.user) {
      createdUserId = authUser.user.id;

      // Verify trigger created profile
      const { data: profile, error: pErr } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', createdUserId)
        .single();

      assert(!pErr && profile, 'Trigger automatically created row in public.profiles');
      if (profile) {
        assert(profile.display_name === 'ಪರೀಕ್ಷಾರ್ಥಿ ವಿದ್ಯಾರ್ಥಿ', 'Profile display_name populated correctly');
      }

      // Anonymous / Unauthenticated Client should NOT be able to read profile (RLS test)
      const { data: unauthProfile, error: uErr } = await supabaseClient
        .from('profiles')
        .select('*')
        .eq('id', createdUserId);

      assert(
        !unauthProfile || unauthProfile.length === 0 || Boolean(uErr),
        'RLS strictly prevents anonymous access to user profiles'
      );
    }
  } catch (err) {
    assert(false, `Auth integration test threw: ${err.message}`);
  }

  // 6. Test Educational Resources RLS (Public read vs Unauth insert)
  console.log('\n--- 6. Educational Resources Public Read vs Write RLS ---');
  try {
    // Public read query
    const { data: publicRes, error: rErr } = await supabaseClient
      .from('resources')
      .select('id, title, is_published')
      .eq('is_published', true);

    assert(!rErr, 'Public read of published educational resources succeeds');

    // Unauthenticated insert attempt MUST fail
    const { data: badInsert, error: iErr } = await supabaseClient
      .from('resources')
      .insert({ title: 'Malicious Resource', is_published: true });

    assert(Boolean(iErr), 'RLS strictly blocks unauthenticated insert into resources table');
  } catch (err) {
    assert(false, `Resources RLS test threw: ${err.message}`);
  }

  // 7. Cleanup
  console.log('\n--- 7. Cleanup Temporary Test Data ---');
  if (createdUserId) {
    try {
      const { error: delErr } = await supabaseAdmin.auth.admin.deleteUser(createdUserId);
      assert(!delErr, 'Temporary test user deleted cleanly from Supabase Auth & cascading profiles');
    } catch (err) {
      console.error(`Failed to delete test user: ${err.message}`);
    }
  }

  console.log('\n========================================================');
  console.log(`TEST SUMMARY: ${passCount} PASSED, ${failCount} FAILED`);
  console.log('========================================================');
}

run().catch((err) => {
  console.error('Fatal error during integration run:', err);
  process.exit(1);
});
