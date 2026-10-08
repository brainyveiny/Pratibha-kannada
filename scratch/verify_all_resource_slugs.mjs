import { KANNADA_RESOURCES } from '../src/data/resources.ts';

const BASE = 'http://localhost:3000';

async function verifyAllResources() {
  console.log(`Verifying all ${KANNADA_RESOURCES.length} resources in database/content store...`);
  let errors = 0;
  for (const item of KANNADA_RESOURCES) {
    const url = `${BASE}/dashboard/resource/${item.slug}`;
    try {
      const res = await fetch(url);
      if (res.status !== 200) {
        console.error(`[FAIL ${res.status}] ${item.slug} (${item.title})`);
        errors++;
      }
    } catch (e) {
      console.error(`[ERROR] ${item.slug}:`, e.message);
      errors++;
    }
  }

  if (errors === 0) {
    console.log(`All ${KANNADA_RESOURCES.length} resources successfully returned HTTP 200 OK!`);
  } else {
    console.error(`Found ${errors} errors among resources.`);
  }
}

verifyAllResources();
