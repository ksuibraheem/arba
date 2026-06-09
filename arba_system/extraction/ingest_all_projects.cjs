/**
 * ============================================================
 *  ingest_all_projects.cjs  –  Comprehensive BOQ Extractor v3
 * ============================================================
 *  Reads every Excel file across the المشاريع folder tree,
 *  extracts BOQ items (description, unit, qty), and writes a
 *  consolidated JSON to training_data/pending/ingested_projects.json
 *
 *  Usage:  node arba_system/ingest_all_projects.cjs
 * ============================================================
 */

'use strict';

const XLSX = require('xlsx');
const path = require('path');
const fs   = require('fs');

// ── Paths ──────────────────────────────────────────────────
const PROJECTS_BASE = path.join(__dirname, '..', '..', 'المشاريع');
const OUTPUT_DIR    = path.join(__dirname, '..', 'training_data', 'pending');
const OUTPUT_FILE   = path.join(OUTPUT_DIR, 'ingested_projects.json');

// ── File manifest ──────────────────────────────────────────
const FILES = [
  // AL SHAFA - 5 villas
  { file: path.join(PROJECTS_BASE, '00- AL SHAFA - STRUCUTRAL WORK PACKAGE - VILLAS', '01-villa A', 'Alshafa- Villa A-STR-BOQ.xlsx'), project: 'AL_SHAFA_Villa_A', type: 'structural', region: 'saudi' },
  { file: path.join(PROJECTS_BASE, '00- AL SHAFA - STRUCUTRAL WORK PACKAGE - VILLAS', '02-villa B', 'Alshafa- Villa B-STR-BOQ.xlsx'), project: 'AL_SHAFA_Villa_B', type: 'structural', region: 'saudi' },
  { file: path.join(PROJECTS_BASE, '00- AL SHAFA - STRUCUTRAL WORK PACKAGE - VILLAS', '03-villa C', 'Alshafa- Villa C-STR-BOQ.xlsx'), project: 'AL_SHAFA_Villa_C', type: 'structural', region: 'saudi' },
  { file: path.join(PROJECTS_BASE, '00- AL SHAFA - STRUCUTRAL WORK PACKAGE - VILLAS', '04-villa C-attached', '04-AL SHAFA - BOQ - VILLA TYPE - C ATTACHED.xlsx'), project: 'AL_SHAFA_Villa_C_Attached', type: 'structural', region: 'saudi' },
  { file: path.join(PROJECTS_BASE, '00- AL SHAFA - STRUCUTRAL WORK PACKAGE - VILLAS', '05-villa VIP', 'Alshafa- Villa VIP-STR-BOQ.xlsx'), project: 'AL_SHAFA_Villa_VIP', type: 'structural', region: 'saudi' },

  // Asir charity - 3 BOQs
  { file: path.join(PROJECTS_BASE, '2 مشروع مقر الجمعية والأندية التربوية للأيتام - جمعية آباء لرعاية الايتام بعسير', 'BOQ _ ARCH _ 01 _ ADMI (1) 1.xlsx'), project: 'Asir_Charity_ARCH', type: 'architectural', region: 'asir' },
  { file: path.join(PROJECTS_BASE, '2 مشروع مقر الجمعية والأندية التربوية للأيتام - جمعية آباء لرعاية الايتام بعسير', 'BOQ - LEFT SIDE (1) 1.xlsx'), project: 'Asir_Charity_LEFT', type: 'construction', region: 'asir' },
  { file: path.join(PROJECTS_BASE, '2 مشروع مقر الجمعية والأندية التربوية للأيتام - جمعية آباء لرعاية الايتام بعسير', 'ELEC _ BOQ_LEFT SIDE (1) 1.xlsx'), project: 'Asir_Charity_ELEC', type: 'electrical', region: 'asir' },

  // Dhahran office
  { file: path.join(PROJECTS_BASE, '40- منافسة أعمال المقاولات وتجهيز المكتب الفرعي في المنطقة الشرقية- الظهران', '40- منافسة أعمال المقاولات وتجهيز المكتب الفرعي في المنطقة الشرقية- الظهران', '40- منافسة أعمال المقاولات وتجهيز المكتب الفرعي في المنطقة الشرقية- الظهران', '_مبني الشرقية -طرح.xlsx'), project: 'Dhahran_Office', type: 'office_fitout', region: 'dammam' },

  // TBC Supplier - multiple pricing files
  { file: path.join(PROJECTS_BASE, 'TBC-FM-1226_SUPPLIER', 'Pricing Sheet 25.xlsx'), project: 'TBC_FM_Pricing_Sheet', type: 'fm_supplier', region: 'riyadh' },
  { file: path.join(PROJECTS_BASE, 'TBC-FM-1226_SUPPLIER', 'Tender_Final_Pricing_Riyadh.xlsx'), project: 'TBC_FM_Final_Pricing', type: 'fm_tender', region: 'riyadh' },
  { file: path.join(PROJECTS_BASE, 'TBC-FM-1226_SUPPLIER', 'tender_real_pricing.xlsx'), project: 'TBC_FM_Real_Pricing', type: 'fm_tender', region: 'riyadh' },
  { file: path.join(PROJECTS_BASE, 'TBC-FM-1226_SUPPLIER', 'tender_real_pricing - المعتمد بعد المراجعة بدون الضريبة.xlsx'), project: 'TBC_FM_Approved_Pricing', type: 'fm_tender', region: 'riyadh' },

  // Villa BOQ tables
  { file: path.join(PROJECTS_BASE, 'جداول الكميات', 'مقايسة اعمال الفيلا كامله بعد التعديل.xlsx'), project: 'Villa_BOQ_Final', type: 'residential_villa', region: 'saudi' },
  { file: path.join(PROJECTS_BASE, 'جداول الكميات', 'مقايسة اعمال الفيلا كامله.xlsx'), project: 'Villa_BOQ_Original', type: 'residential_villa', region: 'saudi' },
  { file: path.join(PROJECTS_BASE, 'جداول الكميات', 'اعمال الفيلا (1).xlsx'), project: 'Villa_BOQ_Summary', type: 'residential_villa', region: 'saudi' },

  // annex-1-boq
  { file: path.join(PROJECTS_BASE, 'annex-1-boq.xlsx'), project: 'Annex_1_BOQ', type: 'unknown', region: 'saudi' },

  // tender_real_pricing in root
  { file: path.join(PROJECTS_BASE, 'tender_real_pricing.xlsx'), project: 'Tender_Real_Root', type: 'tender', region: 'saudi' },
];

// ── Column-detection keywords ──────────────────────────────
// Each category maps to an array of possible header patterns.
// We normalise headers to lowercase trimmed before matching.

const HEADER_PATTERNS = {
  no: [
    'no', 'no.', 'item', 'item no', 'item no.', 'sn', 's.n', 's/n', 's.no',
    '#', 'م', 'م.', 'رقم', 'رقم البند', 'مسلسل', 'serial', 'sl', 'sl.',
    'ref', 'ref.', 'code', 'الرقم',
  ],
  description: [
    'description', 'desc', 'desc.', 'item description', 'description of work',
    'work description', 'scope of work', 'details', 'specification',
    'الوصف', 'وصف', 'البند', 'بند', 'وصف البند', 'وصف الأعمال', 'وصف العمل',
    'التوصيف', 'اسم البند', 'المواصفات', 'نوع العمل', 'تفاصيل',
    'الأعمال', 'اعمال', 'بيان الأعمال', 'بيان', 'المادة',
    'name', 'item name', 'material', 'particulars',
  ],
  unit: [
    'unit', 'uom', 'u.o.m', 'unit of measure', 'units',
    'الوحدة', 'وحدة', 'وحدة القياس', 'الوحده',
  ],
  qty: [
    'qty', 'qty.', 'quantity', 'quantities', 'qnty', 'q.ty',
    'الكمية', 'كمية', 'الكميه', 'كميه', 'الكميات',
    'amount', // sometimes used for qty
  ],
  rate: [
    'rate', 'unit rate', 'unit price', 'price', 'u/p', 'u.p',
    'سعر', 'السعر', 'سعر الوحدة', 'سعر الوحده', 'معدل',
    'سعر الافراد', 'الافراد',
  ],
  total: [
    'total', 'total price', 'total amount', 'amount', 'sub total',
    'المبلغ', 'الإجمالي', 'الاجمالي', 'إجمالي', 'اجمالي',
    'المجموع', 'الإجمالى', 'الاجمالى', 'إجمالى', 'اجمالى',
    'المبلغ الاجمالي', 'المبلغ الإجمالي',
  ],
};

// ── Helpers ─────────────────────────────────────────────────

/**
 * Normalise a cell value to a plain string for header matching.
 */
function norm(v) {
  if (v == null) return '';
  return String(v).trim().replace(/[\r\n]+/g, ' ').toLowerCase();
}

/**
 * Clean and return a trimmed string from a cell value.
 */
function cleanStr(v) {
  if (v == null) return '';
  return String(v).trim().replace(/[\r\n]+/g, ' ');
}

/**
 * Attempt to parse a number. Returns null if not numeric.
 */
function parseNum(v) {
  if (v == null) return null;
  if (typeof v === 'number') return v;
  const s = String(v).trim().replace(/,/g, '').replace(/٫/g, '.');
  // Replace Arabic/Farsi numerals
  const mapped = s.replace(/[٠-٩]/g, d => '٠١٢٣٤٥٦٧٨٩'.indexOf(d));
  const n = Number(mapped);
  return isNaN(n) ? null : n;
}

/**
 * Check if a cell value looks like a known unit (to help with unit-less detection).
 */
const KNOWN_UNITS = new Set([
  'm', 'm2', 'm3', 'mm', 'cm', 'kg', 'ton', 'nr', 'no', 'nos', 'ls', 'l.s',
  'l.s.', 'lot', 'set', 'pcs', 'pc', 'ea', 'each', 'pair', 'roll', 'bag',
  'lm', 'rm', 'sqm', 'cum', 'sm', 'item', 'job', 'trip',
  'م', 'م2', 'م3', 'م.ط', 'م.م', 'كجم', 'طن', 'عدد', 'مقطوعية', 'مقطوعيه',
  'حبة', 'لفة', 'كيس', 'مجموعة', 'رحلة', 'وحدة', 'متر', 'متر طولي',
  'متر مربع', 'متر مكعب',
]);

function looksLikeUnit(v) {
  if (v == null) return false;
  const s = norm(v);
  if (KNOWN_UNITS.has(s)) return true;
  // Also accept things like m², m³
  if (/^m[²³]$/.test(s)) return true;
  return false;
}

/**
 * Detect which column index corresponds to which field.
 * Scans rows 0..maxScan looking for header patterns.
 */
function detectColumns(sheet) {
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  const maxScan = Math.min(range.e.r, 25); // scan first 25 rows for headers
  const colCount = range.e.c + 1;

  let bestHeaderRow = -1;
  let bestMapping = null;
  let bestScore = 0;

  for (let r = range.s.r; r <= maxScan; r++) {
    const mapping = {};
    let score = 0;

    for (let c = range.s.c; c < range.s.c + colCount; c++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      if (!cell) continue;
      const val = norm(cell.v);
      if (!val) continue;

      // Check each category
      for (const [field, patterns] of Object.entries(HEADER_PATTERNS)) {
        if (mapping[field] !== undefined) continue; // already found
        for (const pat of patterns) {
          if (val === pat || val.includes(pat)) {
            mapping[field] = c;
            score++;
            break;
          }
        }
      }
    }

    // We need at least description + (unit or qty) to consider this a header row
    if (mapping.description !== undefined && (mapping.unit !== undefined || mapping.qty !== undefined)) {
      if (score > bestScore) {
        bestScore = score;
        bestMapping = mapping;
        bestHeaderRow = r;
      }
    }
  }

  return { headerRow: bestHeaderRow, mapping: bestMapping };
}

/**
 * Fallback: try to detect columns by data pattern analysis
 * when no header row is found.
 */
function detectColumnsByData(sheet) {
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  const rowCount = Math.min(range.e.r + 1, 100);
  const colCount = range.e.c + 1;

  // Analyse each column: count text cells, numeric cells, unit-like cells
  const colStats = [];
  for (let c = range.s.c; c < range.s.c + colCount; c++) {
    let textCount = 0, numCount = 0, unitCount = 0, maxTextLen = 0;
    for (let r = range.s.r; r < range.s.r + rowCount; r++) {
      const cell = sheet[XLSX.utils.encode_cell({ r, c })];
      if (!cell) continue;
      const v = cell.v;
      if (typeof v === 'number') { numCount++; continue; }
      const s = cleanStr(v);
      if (!s) continue;
      if (looksLikeUnit(s)) { unitCount++; continue; }
      if (parseNum(s) !== null) { numCount++; continue; }
      textCount++;
      if (s.length > maxTextLen) maxTextLen = s.length;
    }
    colStats.push({ c, textCount, numCount, unitCount, maxTextLen });
  }

  const mapping = {};

  // Unit column: highest unit count
  const unitCol = colStats.filter(s => s.unitCount > 2).sort((a, b) => b.unitCount - a.unitCount)[0];
  if (unitCol) mapping.unit = unitCol.c;

  // Description column: longest text with most text cells
  const descCol = colStats.filter(s => s.textCount > 2 && s.maxTextLen > 15 && s.c !== mapping.unit)
    .sort((a, b) => (b.textCount * b.maxTextLen) - (a.textCount * a.maxTextLen))[0];
  if (descCol) mapping.description = descCol.c;

  // Qty column: numeric column near unit column (if available), otherwise first numeric col
  const numericCols = colStats.filter(s => s.numCount > 2 && s.c !== mapping.description && s.c !== mapping.unit);
  if (mapping.unit !== undefined && numericCols.length > 0) {
    // Prefer the numeric column closest to the unit column (often adjacent)
    numericCols.sort((a, b) => Math.abs(a.c - mapping.unit) - Math.abs(b.c - mapping.unit));
    mapping.qty = numericCols[0].c;
    // Rate/total: other numeric columns
    if (numericCols.length > 1) mapping.rate = numericCols[1].c;
    if (numericCols.length > 2) mapping.total = numericCols[2].c;
  } else if (numericCols.length > 0) {
    mapping.qty = numericCols[0].c;
    if (numericCols.length > 1) mapping.rate = numericCols[1].c;
    if (numericCols.length > 2) mapping.total = numericCols[2].c;
  }

  // No column: first small-number column (if any)
  const noCandidates = numericCols.filter(s => s.c !== mapping.qty && s.c !== mapping.rate && s.c !== mapping.total);
  if (noCandidates.length > 0) mapping.no = noCandidates[0].c;

  return mapping.description !== undefined ? { headerRow: -1, mapping } : null;
}

/**
 * Extract BOQ items from a single sheet.
 */
function extractItems(sheet, mapping, headerRow) {
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1');
  const startRow = headerRow >= 0 ? headerRow + 1 : range.s.r;
  const items = [];

  for (let r = startRow; r <= range.e.r; r++) {
    const getVal = (field) => {
      if (mapping[field] === undefined) return null;
      const cell = sheet[XLSX.utils.encode_cell({ r, c: mapping[field] })];
      return cell ? cell.v : null;
    };

    const desc = cleanStr(getVal('description'));
    const unit = cleanStr(getVal('unit'));
    const qty  = parseNum(getVal('qty'));

    // Skip rows without meaningful description
    if (!desc || desc.length < 2) continue;

    // Skip rows that look like section headers (no unit AND no qty)
    // But keep items that have at least a unit or qty
    const hasUnit = unit && unit.length > 0;
    const hasQty  = qty !== null && qty !== 0;

    // If it's a very short desc with no unit or qty, skip (likely a header/section label)
    if (!hasUnit && !hasQty && desc.length < 20) continue;

    // Skip rows where "description" is actually another header row
    const descLower = norm(desc);
    const isHeader = HEADER_PATTERNS.description.some(p => descLower === p) ||
                     HEADER_PATTERNS.unit.some(p => descLower === p);
    if (isHeader) continue;

    // Build the item
    const item = {
      no: cleanStr(getVal('no')) || String(items.length + 1),
      description: desc,
      unit: unit || null,
      qty: hasQty ? qty : null,
      originalPrice: parseNum(getVal('rate')),
      originalTotal: parseNum(getVal('total')),
    };

    items.push(item);
  }

  return items;
}

/**
 * Process a single Excel file and return project data.
 */
function processFile(entry) {
  const { file, project, type, region } = entry;
  const filename = path.basename(file);

  if (!fs.existsSync(file)) {
    console.warn(`  ⚠ MISSING: ${filename}`);
    return {
      project, type, region, file: filename,
      error: 'File not found',
      sheets: [],
      summary: { totalItems: 0, totalSheets: 0 },
    };
  }

  let wb;
  try {
    wb = XLSX.readFile(file, { type: 'file', cellDates: true, cellNF: true });
  } catch (err) {
    console.warn(`  ⚠ READ ERROR: ${filename} – ${err.message}`);
    return {
      project, type, region, file: filename,
      error: `Read error: ${err.message}`,
      sheets: [],
      summary: { totalItems: 0, totalSheets: 0 },
    };
  }

  const sheets = [];
  let projectTotalItems = 0;

  for (const sheetName of wb.SheetNames) {
    const ws = wb.Sheets[sheetName];
    if (!ws || !ws['!ref']) continue;

    // Try header-based detection first
    let detected = detectColumns(ws);

    // Fallback to data-based detection
    if (!detected || !detected.mapping) {
      detected = detectColumnsByData(ws);
    }

    if (!detected || !detected.mapping || detected.mapping.description === undefined) {
      // Could not detect columns - skip this sheet
      continue;
    }

    const items = extractItems(ws, detected.mapping, detected.headerRow);

    if (items.length === 0) continue;

    sheets.push({
      name: sheetName,
      itemCount: items.length,
      items,
    });

    projectTotalItems += items.length;
  }

  return {
    project, type, region, file: filename,
    sheets,
    summary: { totalItems: projectTotalItems, totalSheets: sheets.length },
  };
}

// ── Main ────────────────────────────────────────────────────

function main() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║        BOQ Ingestion Engine v3.0 – All Projects            ║');
  console.log('╚══════════════════════════════════════════════════════════════╝');
  console.log();
  console.log(`Projects base : ${PROJECTS_BASE}`);
  console.log(`Output file   : ${OUTPUT_FILE}`);
  console.log(`Files to scan : ${FILES.length}`);
  console.log();

  const projects = {};
  let totalItems = 0;
  let totalProjects = 0;
  const summaryRows = [];

  for (const entry of FILES) {
    const label = entry.project;
    process.stdout.write(`  → Processing ${label} ... `);

    const result = processFile(entry);
    projects[label] = result;

    if (result.summary.totalItems > 0) {
      totalProjects++;
    }
    totalItems += result.summary.totalItems;

    const status = result.error
      ? `❌ ${result.error}`
      : `✅ ${result.summary.totalItems} items from ${result.summary.totalSheets} sheet(s)`;
    console.log(status);

    summaryRows.push({
      project: label,
      type: entry.type,
      region: entry.region,
      sheets: result.summary.totalSheets,
      items: result.summary.totalItems,
      status: result.error ? 'ERROR' : 'OK',
    });
  }

  // Build output JSON
  const output = {
    version: '3.0',
    extractedAt: new Date().toISOString(),
    totalProjects,
    totalItems,
    projects,
  };

  // Ensure output dir exists
  if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(output, null, 2), 'utf8');

  // ── Summary table ──────────────────────────────────────
  console.log();
  console.log('═══════════════════════════════════════════════════════════════');
  console.log('                      EXTRACTION SUMMARY');
  console.log('═══════════════════════════════════════════════════════════════');

  // Table header
  const pad = (s, n) => String(s).padEnd(n);
  const padR = (s, n) => String(s).padStart(n);
  console.log(
    pad('Project', 32) +
    pad('Type', 18) +
    pad('Region', 10) +
    padR('Sheets', 8) +
    padR('Items', 8) +
    '  Status'
  );
  console.log('─'.repeat(85));

  for (const row of summaryRows) {
    console.log(
      pad(row.project, 32) +
      pad(row.type, 18) +
      pad(row.region, 10) +
      padR(row.sheets, 8) +
      padR(row.items, 8) +
      '  ' + row.status
    );
  }

  console.log('─'.repeat(85));
  console.log(
    pad('TOTAL', 32) +
    pad('', 18) +
    pad('', 10) +
    padR(summaryRows.reduce((s, r) => s + r.sheets, 0), 8) +
    padR(totalItems, 8) +
    '  ' + totalProjects + ' projects with data'
  );
  console.log();
  console.log(`✅ Output written to: ${OUTPUT_FILE}`);
  console.log(`   File size: ${(fs.statSync(OUTPUT_FILE).size / 1024).toFixed(1)} KB`);
  console.log();
}

main();
