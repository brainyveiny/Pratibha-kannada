import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { KANNADA_RESOURCES } from '../src/data/resources.ts';
import { KANNADA_EDUCATIONAL_GLOSSARY, getGlossaryReviewSummary } from '../src/data/kannadaGlossary.ts';
import { auditCatalog, auditKannadaText } from '../src/lib/kannadaAudit.ts';

const isRemote = process.argv.includes('--remote') || process.argv.includes('--supabase');

// Load environment variables safely for remote auditing if requested
if (isRemote) {
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
}

console.log('================================================================');
console.log(' PRATIBHA KANNADA — LANGUAGE QUALITY & ORTHOGRAPHY AUDIT ENGINE');
console.log('================================================================\n');

const glossarySummary = getGlossaryReviewSummary();
console.log(`[Glossary] Loaded ${glossarySummary.total} educational terminology entries (${glossarySummary.verified} verified, ${glossarySummary.reviewed} reviewed).`);

let resourcesToAudit = KANNADA_RESOURCES;
let auditTargetLabel = `Static Catalog (${KANNADA_RESOURCES.length} production items)`;

if (isRemote) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const keyType = process.env.SUPABASE_SERVICE_ROLE_KEY ? 'service_role' : 'anon';

  if (!supabaseUrl || !supabaseKey) {
    console.log('\n[NOTICE] [Remote Audit]');
    console.log('   Remote audit mode requested (--remote), but Supabase credentials are not configured in environment or .env.local.');
    console.log('   Required: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY.');
    console.log('   Falling back safely to local static catalog.\n');
  } else {
    try {
      const { createClient } = await import('@supabase/supabase-js');
      // Read-only client with session persistence disabled
      const supabase = createClient(supabaseUrl, supabaseKey, {
        auth: { persistSession: false, autoRefreshToken: false },
      });

      console.log(`[Remote] Connecting to Supabase (${keyType} key, read-only mode)...`);
      const { data: dbResources, error } = await supabase
        .from('resources')
        .select(`
          id,
          title,
          title_kn,
          description,
          resource_type,
          is_published,
          topics (
            name
          )
        `);

      if (error) {
        console.error(`[Remote Error] Failed to query resources: ${error.message}`);
        console.log('Falling back to static catalog.\n');
      } else if (dbResources && dbResources.length > 0) {
        resourcesToAudit = dbResources.map((db) => ({
          id: db.id,
          slug: db.id,
          title: db.title_kn || db.title || '',
          classGrade: 'all',
          category: 'notes',
          topic: db.topics?.name || 'ಸಾಮಾನ್ಯ',
          summary: db.description || db.title || '',
          content: db.description || db.title || '',
          tags: [db.resource_type || 'notes'],
        }));
        auditTargetLabel = `Supabase Remote Database (${resourcesToAudit.length} dynamic items [read-only])`;
      } else {
        console.log('[Remote] Database connected successfully, but no records were found in public.resources.');
        auditTargetLabel = `Supabase Remote Database (0 dynamic items found)`;
        resourcesToAudit = [];
      }
    } catch (err) {
      console.error(`[Remote Error] Failed to initialize Supabase client: ${err.message}`);
      console.log('Falling back to static catalog.\n');
    }
  }
}

console.log(`[Catalog]  Target: ${auditTargetLabel}\n`);

const results = auditCatalog(resourcesToAudit);

console.log(`[REPORT] Audit Summary:`);
console.log(`- Total Resources Audited:     ${results.totalResources}`);
console.log(`- Total Fields Inspected:      ${results.totalFieldsAudited}`);
console.log(`- Clean Resources (No issues):  ${results.cleanCount}`);
console.log(`- Potential Issues Found:      ${results.totalIssuesFound}`);
console.log('----------------------------------------------------------------\n');

if (results.reportsWithIssues.length === 0) {
  console.log('[PASS] All audited educational resources meet canonical Kannada orthographic standards!');
} else {
  console.log('Findings breakdown:');
  for (const report of results.reportsWithIssues) {
    console.log(`\n• Resource [${report.resourceId}] — Field: ${report.field}`);
    for (const finding of report.findings) {
      console.log(`  - Severity:    [${finding.severity}]`);
      console.log(`  - Source:      "${finding.sourceText}"`);
      console.log(`  - Suggestion:  "${finding.suggestedCorrection}"`);
      console.log(`  - Reason:      ${finding.reason}`);
      console.log(`  - Reference:   ${finding.reference}`);
      console.log(`  - Confidence:  ${(finding.confidence * 100).toFixed(0)}%`);
    }
  }
}

console.log('\n================================================================');
console.log(` End of Audit Report. ${isRemote ? 'Remote read-only audit complete.' : 'Local catalog audit complete.'} No database records or source files were altered.`);
console.log('================================================================\n');

