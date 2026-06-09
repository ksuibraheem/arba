/**
 * rebuild_mega_training.cjs
 * ─────────────────────────
 * Rebuilds brain_mega_training.json from v2.0 → v3.0
 *
 * Merges:
 *   1. Existing mega training (v2.0) as the base
 *   2. Newly ingested projects from training_data/pending/ingested_projects.json
 *   3. Pending feeds:
 *      - brain_training_feed.json
 *      - brain_v11_feed.json
 *      - extracted_boq.json
 *      - extracted_boq_v2.json
 *
 * Output: training_data/trained/brain_mega_training.json (v3.0)
 * Backup: training_data/trained/brain_mega_training_v2_backup.json
 */

const fs = require('fs');
const path = require('path');

// ── Paths ───────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..');
const TRAINED_DIR = path.join(ROOT, 'training_data', 'trained');
const PENDING_DIR = path.join(ROOT, 'training_data', 'pending');

const MEGA_PATH = path.join(TRAINED_DIR, 'brain_mega_training.json');
const BACKUP_PATH = path.join(TRAINED_DIR, 'brain_mega_training_v2_backup.json');

const INGESTED_PATH = path.join(PENDING_DIR, 'ingested_projects.json');
const FEED_PATH = path.join(PENDING_DIR, 'brain_training_feed.json');
const V11_PATH = path.join(PENDING_DIR, 'brain_v11_feed.json');
const BOQ_PATH = path.join(PENDING_DIR, 'extracted_boq.json');
const BOQ_V2_PATH = path.join(PENDING_DIR, 'extracted_boq_v2.json');

// ── Helpers ─────────────────────────────────────────────────────
function loadJSON(filePath) {
  try {
    if (!fs.existsSync(filePath)) {
      console.log(`  ⚠️  File not found: ${path.basename(filePath)} — skipping`);
      return null;
    }
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    const sizeKB = (Buffer.byteLength(raw, 'utf8') / 1024).toFixed(1);
    console.log(`  ✅ Loaded ${path.basename(filePath)} (${sizeKB} KB)`);
    return data;
  } catch (err) {
    console.log(`  ❌ Error loading ${path.basename(filePath)}: ${err.message}`);
    return null;
  }
}

function formatNum(n) {
  return n.toLocaleString('en-US');
}

function countItems(sources) {
  let total = 0;
  for (const key of Object.keys(sources)) {
    const src = sources[key];
    if (src.items && Array.isArray(src.items)) {
      total += src.items.length;
    } else if (src.itemCount) {
      total += src.itemCount;
    }
  }
  return total;
}

function sanitizeKey(name) {
  return name
    .replace(/[^\w\u0600-\u06FF\s-]/g, '')   // keep Arabic, alphanumeric, space, dash
    .replace(/\s+/g, '_')
    .replace(/-+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '')
    .substring(0, 80);
}

// ── Main ────────────────────────────────────────────────────────
function main() {
  console.log('\n🔨 Mega Training Rebuild: v2.0 → v3.0');
  console.log('═'.repeat(50));

  // ────────────────────────────────────────────────────
  // STEP 1: Load existing mega training (base)
  // ────────────────────────────────────────────────────
  console.log('\n📂 Step 1: Loading base mega training...');
  const mega = loadJSON(MEGA_PATH);
  if (!mega) {
    console.error('❌ FATAL: Cannot load existing mega training. Aborting.');
    process.exit(1);
  }

  const oldVersion = mega.version || '2.0';
  const oldSources = mega.sources || {};
  const oldSourceCount = Object.keys(oldSources).length;
  const oldItemCount = mega.totalItems || countItems(oldSources);

  console.log(`   Base: v${oldVersion} | ${oldSourceCount} sources | ${formatNum(oldItemCount)} items`);

  // Build new sources starting with all existing
  const newSources = { ...oldSources };
  const addedSources = [];

  // ────────────────────────────────────────────────────
  // STEP 2: Load ingested projects
  // ────────────────────────────────────────────────────
  console.log('\n📂 Step 2: Loading ingested projects...');
  const ingested = loadJSON(INGESTED_PATH);
  if (ingested) {
    // ingested.projects is an object keyed by project name, not an array
    const projectsObj = ingested.projects || {};
    const projectEntries = Object.entries(projectsObj);
    console.log(`   Found ${projectEntries.length} ingested project(s)`);

    for (const [projKey, proj] of projectEntries) {
      const key = sanitizeKey(projKey || proj.project || proj.name || `project_${Date.now()}`);

      // Skip if already exists
      if (newSources[key]) {
        console.log(`   ⏭️  Source "${key}" already exists — skipping`);
        continue;
      }

      // Build items from the project's sheets/items
      let items = [];
      if (proj.items && Array.isArray(proj.items)) {
        items = proj.items;
      } else if (proj.sheets && Array.isArray(proj.sheets)) {
        for (const sheet of proj.sheets) {
          if (sheet.items && Array.isArray(sheet.items)) {
            items.push(...sheet.items.map(item => ({
              ...item,
              sheet: sheet.name || sheet.sheetName || undefined
            })));
          }
        }
      } else if (proj.data && Array.isArray(proj.data)) {
        items = proj.data;
      }

      // Normalize items
      const normalizedItems = items.map(item => {
        const normalized = {};
        if (item.no || item.seq || item.code) normalized.no = item.no || item.seq || item.code || '';
        normalized.desc = item.desc || item.description || item.spec || '';
        normalized.unit = item.unit || '';
        normalized.qty = parseFloat(item.qty) || 0;
        if (item.rate || item.unitPrice || item.boqPrice) {
          normalized.unitPrice = parseFloat(item.rate || item.unitPrice || item.boqPrice) || 0;
        }
        if (item.amount || item.total) {
          normalized.amount = parseFloat(item.amount || item.total) || 0;
        }
        if (item.sheet) normalized.sheet = item.sheet;
        if (item.cat || item.category) normalized.category = item.cat || item.category || '';
        return normalized;
      }).filter(item => item.desc && item.desc.trim().length > 0);

      newSources[key] = {
        type: proj.type || proj.projectType || 'mixed',
        scope: proj.scope || 'full',
        location: proj.location || proj.region || 'saudi',
        itemCount: normalizedItems.length,
        items: normalizedItems
      };

      if (proj.totalAmount) newSources[key].totalAmount = proj.totalAmount;
      if (proj.folderName) newSources[key].folderName = proj.folderName;

      addedSources.push({ key, itemCount: normalizedItems.length });
      console.log(`   ✅ Added "${key}": ${normalizedItems.length} items`);
    }
  }

  // ────────────────────────────────────────────────────
  // STEP 3: Load pending feeds
  // ────────────────────────────────────────────────────
  console.log('\n📂 Step 3: Loading pending feeds...');

  // --- brain_training_feed.json ---
  const feed = loadJSON(FEED_PATH);
  if (feed && !newSources['tbc_fm_1226_feed']) {
    const feedItems = (feed.learnedPrices || []).map(p => ({
      desc: p.description || '',
      unit: p.unit || '',
      unitPrice: p.unitPrice || 0,
      matchedBy: p.matchedBy || '',
      source: p.source || '',
      confidence: p.confidence || 0
    })).filter(item => item.desc.trim().length > 0);

    if (feedItems.length > 0) {
      newSources['tbc_fm_1226_feed'] = {
        type: 'school_maintenance',
        scope: 'learned_prices',
        location: 'saudi',
        originalSource: feed.source || 'TBC-FM-1226',
        stats: feed.stats || {},
        itemCount: feedItems.length,
        items: feedItems
      };
      addedSources.push({ key: 'tbc_fm_1226_feed', itemCount: feedItems.length });
      console.log(`   ✅ Added "tbc_fm_1226_feed": ${feedItems.length} items`);
    }
  }

  // --- brain_v11_feed.json ---
  const v11 = loadJSON(V11_PATH);
  if (v11 && !newSources['v11_price_history']) {
    // Extract price history as training items
    const priceHistory = v11.priceHistory || {};
    const historyItems = [];

    for (const [categoryUnit, prices] of Object.entries(priceHistory)) {
      if (!Array.isArray(prices) || prices.length === 0) continue;
      const [category, unit] = categoryUnit.split('/');
      const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
      const min = Math.min(...prices);
      const max = Math.max(...prices);

      historyItems.push({
        category: category || '',
        unit: unit || '',
        avgPrice: Math.round(avg * 100) / 100,
        minPrice: min,
        maxPrice: max,
        samples: prices.length,
        rawPrices: prices
      });
    }

    // Also extract school-level info
    const schoolsSummary = (v11.schools || []).map(s => ({
      name: s.name,
      cost: s.cost,
      selling: s.selling,
      itemsWithRecipe: s.itemsWithRecipe,
      renovation: s.renovation,
      new: s.new
    }));

    if (historyItems.length > 0) {
      newSources['v11_price_history'] = {
        type: 'school_maintenance',
        scope: 'price_history',
        location: 'saudi',
        version: v11.version || 'V11',
        profitMargin: v11.profitMargin || 0.15,
        totals: v11.totals || {},
        schools: schoolsSummary,
        itemCount: historyItems.length,
        items: historyItems
      };
      addedSources.push({ key: 'v11_price_history', itemCount: historyItems.length });
      console.log(`   ✅ Added "v11_price_history": ${historyItems.length} items`);
    }
  }

  // --- extracted_boq.json ---
  const boq = loadJSON(BOQ_PATH);
  if (boq && !newSources['extracted_boq_residential']) {
    const boqItems = (Array.isArray(boq) ? boq : []).map(item => ({
      desc: item.desc || item.description || '',
      unit: item.unit || '',
      qty: parseFloat(item.qty) || 0,
      unitPrice: parseFloat(item.rate) || 0,
      amount: parseFloat(item.amount) || 0,
      sheet: item.sheet || ''
    })).filter(item => item.desc.trim().length > 0);

    if (boqItems.length > 0) {
      newSources['extracted_boq_residential'] = {
        type: 'residential',
        scope: 'full_boq',
        location: 'saudi',
        itemCount: boqItems.length,
        items: boqItems
      };
      addedSources.push({ key: 'extracted_boq_residential', itemCount: boqItems.length });
      console.log(`   ✅ Added "extracted_boq_residential": ${boqItems.length} items`);
    }
  }

  // --- extracted_boq_v2.json ---
  const boqV2 = loadJSON(BOQ_V2_PATH);
  if (boqV2 && !newSources['extracted_boq_v2_adf']) {
    const boqV2Items = (Array.isArray(boqV2) ? boqV2 : []).map(item => ({
      no: item.seq || '',
      category: item.cat || '',
      desc: item.desc || '',
      spec: item.spec || '',
      unit: item.unit || '',
      qty: parseFloat(item.qty) || 0,
      unitPrice: parseFloat(item.unitPrice) || 0
    })).filter(item => (item.desc && item.desc.trim().length > 0) || (item.spec && item.spec.trim().length > 0));

    if (boqV2Items.length > 0) {
      newSources['extracted_boq_v2_adf'] = {
        type: 'government',
        scope: 'full_boq',
        location: 'saudi',
        itemCount: boqV2Items.length,
        items: boqV2Items
      };
      addedSources.push({ key: 'extracted_boq_v2_adf', itemCount: boqV2Items.length });
      console.log(`   ✅ Added "extracted_boq_v2_adf": ${boqV2Items.length} items`);
    }
  }

  // ────────────────────────────────────────────────────
  // STEP 4: Build the new mega training
  // ────────────────────────────────────────────────────
  console.log('\n🔧 Step 4: Building v3.0 mega training...');

  const newTotalItems = countItems(newSources);
  const newSourceCount = Object.keys(newSources).length;

  const megaV3 = {
    version: '3.0',
    createdAt: new Date().toISOString(),
    previousVersion: oldVersion,
    totalSources: newSourceCount,
    totalItems: newTotalItems,
    sources: newSources
  };

  // ────────────────────────────────────────────────────
  // STEP 5: Backup old and save new
  // ────────────────────────────────────────────────────
  console.log('\n💾 Step 5: Saving files...');

  // Backup
  try {
    fs.copyFileSync(MEGA_PATH, BACKUP_PATH);
    const backupSize = (fs.statSync(BACKUP_PATH).size / 1024).toFixed(1);
    console.log(`   ✅ Backup saved: brain_mega_training_v2_backup.json (${backupSize} KB)`);
  } catch (err) {
    console.log(`   ⚠️  Backup failed: ${err.message} — continuing anyway`);
  }

  // Save new
  const output = JSON.stringify(megaV3, null, 2);
  fs.writeFileSync(MEGA_PATH, output, 'utf8');
  const newSizeKB = (Buffer.byteLength(output, 'utf8') / 1024).toFixed(1);
  console.log(`   ✅ Saved: brain_mega_training.json (${newSizeKB} KB)`);

  // ────────────────────────────────────────────────────
  // STEP 6: Print comparison report
  // ────────────────────────────────────────────────────
  const oldSizeKB = (fs.statSync(BACKUP_PATH).size / 1024).toFixed(0);

  console.log('\n');
  console.log('📊 Mega Training Rebuild Report');
  console.log('═'.repeat(60));

  // Header
  const col1 = 22, col2 = 14, col3 = 14, col4 = 14;
  console.log(
    ''.padEnd(col1) +
    'v' + oldVersion.padEnd(col2) +
    'v3.0'.padEnd(col3) +
    'Change'
  );
  console.log('─'.repeat(60));

  // Sources
  const srcChange = newSourceCount - oldSourceCount;
  const srcPct = oldSourceCount > 0 ? ((srcChange / oldSourceCount) * 100).toFixed(0) : '∞';
  console.log(
    'Total Sources:'.padEnd(col1) +
    String(oldSourceCount).padEnd(col2) +
    String(newSourceCount).padEnd(col3) +
    `+${srcChange} (+${srcPct}%)`
  );

  // Items
  const itemChange = newTotalItems - oldItemCount;
  const itemPct = oldItemCount > 0 ? ((itemChange / oldItemCount) * 100).toFixed(0) : '∞';
  console.log(
    'Total Items:'.padEnd(col1) +
    formatNum(oldItemCount).padEnd(col2) +
    formatNum(newTotalItems).padEnd(col3) +
    `+${formatNum(itemChange)} (+${itemPct}%)`
  );

  // File Size
  console.log(
    'File Size:'.padEnd(col1) +
    `${oldSizeKB} KB`.padEnd(col2) +
    `${newSizeKB} KB`.padEnd(col3) +
    `${(parseFloat(newSizeKB) - parseFloat(oldSizeKB)).toFixed(0)} KB`
  );

  // New Sources detail
  if (addedSources.length > 0) {
    console.log('\n📋 New Sources Added:');
    console.log('─'.repeat(50));
    for (const src of addedSources) {
      console.log(`  ✅ ${src.key}: ${formatNum(src.itemCount)} items`);
    }
  } else {
    console.log('\n  ⚠️  No new sources added (all feeds were either empty or already integrated)');
  }

  // Existing sources summary
  console.log('\n📚 All Sources in v3.0:');
  console.log('─'.repeat(50));
  for (const [key, src] of Object.entries(newSources)) {
    const count = src.items ? src.items.length : (src.itemCount || 0);
    const type = src.type || 'unknown';
    const isNew = addedSources.some(a => a.key === key) ? ' 🆕' : '';
    console.log(`  ${key.padEnd(35)} ${String(count).padStart(6)} items  [${type}]${isNew}`);
  }

  console.log('\n' + '═'.repeat(60));
  console.log('✅ Mega Training v3.0 rebuild complete!');
  console.log(`   📁 Output: ${MEGA_PATH}`);
  console.log(`   📁 Backup: ${BACKUP_PATH}`);
  console.log('');
}

// ── Run ─────────────────────────────────────────────────────────
try {
  main();
} catch (err) {
  console.error('\n❌ FATAL ERROR:', err.message);
  console.error(err.stack);
  process.exit(1);
}
