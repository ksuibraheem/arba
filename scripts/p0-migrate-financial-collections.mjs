/**
 * P0 Migration: arba_config compound keys → dedicated top-level collections
 * 
 * Copies documents matching pattern:
 *   arba_config/chart_of_accounts__{id} → chart_of_accounts/{id}
 *   arba_config/journal_entries__{id}   → journal_entries/{id}
 *   arba_config/invoice_versions__{id}  → invoice_versions/{id}
 * 
 * Usage:
 *   node --experimental-modules scripts/p0-migrate-financial-collections.mjs
 * 
 * Safe: read-only on arba_config, additive on target collections.
 * Idempotent: overwrites target docs if re-run.
 */

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize with default credentials (set GOOGLE_APPLICATION_CREDENTIALS or use emulator)
const USE_EMULATOR = process.env.FIRESTORE_EMULATOR_HOST;

if (!USE_EMULATOR) {
  initializeApp({ projectId: 'arba-d6baf' });
} else {
  initializeApp({ projectId: 'arba-d6baf' });
  console.log(`🔧 Using emulator: ${process.env.FIRESTORE_EMULATOR_HOST}`);
}

const db = getFirestore();

const PREFIXES = ['chart_of_accounts', 'journal_entries', 'invoice_versions'];

async function migrate() {
  // 1. Read all arba_config docs
  const snap = await db.collection('arba_config').get();
  console.log(`📦 arba_config has ${snap.size} total documents`);

  const toCopy = new Map(); // prefix → [{id, data}]
  for (const prefix of PREFIXES) toCopy.set(prefix, []);

  for (const doc of snap.docs) {
    for (const prefix of PREFIXES) {
      if (doc.id.startsWith(`${prefix}__`)) {
        const newId = doc.id.slice(prefix.length + 2); // strip "prefix__"
        toCopy.get(prefix).push({ id: newId, data: doc.data() });
      }
    }
  }

  // 2. Report what was found
  let totalFound = 0;
  for (const prefix of PREFIXES) {
    const items = toCopy.get(prefix);
    totalFound += items.length;
    console.log(`  ${prefix}: ${items.length} docs`);
  }

  if (totalFound === 0) {
    console.log('\\n✅ No financial data found in arba_config. Collections are empty in prod.');
    console.log('   Migration not needed — routing change is safe.');
    return;
  }

  // 3. Copy to dedicated collections in batches of 500
  console.log(`\\n🚀 Migrating ${totalFound} documents...`);
  
  for (const prefix of PREFIXES) {
    const items = toCopy.get(prefix);
    if (items.length === 0) continue;

    let batch = db.batch();
    let batchCount = 0;

    for (const { id, data } of items) {
      const ref = db.collection(prefix).doc(id);
      batch.set(ref, data, { merge: true });
      batchCount++;

      if (batchCount >= 500) {
        await batch.commit();
        console.log(`  ✓ ${prefix}: committed ${batchCount} docs`);
        batch = db.batch();
        batchCount = 0;
      }
    }

    if (batchCount > 0) {
      await batch.commit();
      console.log(`  ✓ ${prefix}: committed ${batchCount} docs`);
    }
  }

  console.log(`\\n✅ Migration complete. ${totalFound} docs copied.`);
  console.log('   Original arba_config docs left intact (safe rollback).');
}

migrate().catch(err => {
  console.error('❌ Migration failed:', err);
  process.exit(1);
});
