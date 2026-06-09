const xlsx = require('xlsx');

const INPUT = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\التأسيس\\item priced للتسعير.xlsx';
const OUTPUT = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\التأسيس\\Arba_Smart_Priced_v9.1.xlsx';

// ========== CONCRETE BREAKDOWN TABLE (SAR/m³) ==========
const RC_BREAKDOWN = {
  blinding:  { concrete: 250, steel: 0,   formwork: 0,   pump: 30, labor: 50,  consumables: 0,  total: 330 },
  sog:       { concrete: 265, steel: 288, formwork: 0,   pump: 40, labor: 100, consumables: 15, total: 708 },
  footing:   { concrete: 265, steel: 320, formwork: 75,  pump: 40, labor: 120, consumables: 18, total: 838 },
  raft:      { concrete: 265, steel: 358, formwork: 45,  pump: 40, labor: 100, consumables: 15, total: 823 },
  column:    { concrete: 265, steel: 736, formwork: 125, pump: 45, labor: 180, consumables: 24, total: 1375 },
  beam:      { concrete: 265, steel: 576, formwork: 125, pump: 45, labor: 150, consumables: 20, total: 1181 },
  slab:      { concrete: 265, steel: 384, formwork: 100, pump: 45, labor: 130, consumables: 18, total: 942 },
  wall:      { concrete: 265, steel: 448, formwork: 100, pump: 45, labor: 200, consumables: 22, total: 1080 },
  stair:     { concrete: 265, steel: 640, formwork: 75,  pump: 45, labor: 150, consumables: 20, total: 1195 },
  tank:      { concrete: 280, steel: 480, formwork: 110, pump: 45, labor: 220, consumables: 25, total: 1160 },
  precast:   { concrete: 300, steel: 400, formwork: 0,   pump: 0,  labor: 80,  consumables: 10, total: 790 },
  screed:    { concrete: 180, steel: 0,   formwork: 0,   pump: 20, labor: 60,  consumables: 5,  total: 265 },
  neck:      { concrete: 265, steel: 736, formwork: 125, pump: 45, labor: 200, consumables: 24, total: 1395 },
  machinePad:{ concrete: 265, steel: 288, formwork: 50,  pump: 40, labor: 100, consumables: 15, total: 758 },
};

// ========== NON-CONCRETE RATES (SAR) ==========
const RATES = {
  excavation: 20, backfill: 30, antiTermite: 5,
  block_100: 38, block_150: 44, block_200: 55, block_ext: 65,
  plaster_int: 25, plaster_ext: 30, plaster_ceiling: 35,
  paint_int: 35, paint_ext: 55,
  ceramic: 85, porcelain: 120, granite: 220, granite_skirting: 90,
  granite_stair: 130, terrazzo: 60, vinyl: 80, vinyl_skirting: 20,
  carpet: 110, epoxy: 55, pavers: 55, gravel: 25,
  gypsum_board: 75, gypsum_tiles: 55,
  waterproof: 28, bitumen_liquid: 12, roof_system: 120,
  wood_door: 800, steel_door: 1200, alum_window: 350, rolling_shutter: 650,
  handrail: 500, steel_ladder: 3500, spiral_stair: 15000,
  pergola: 350, trash_bin: 800,
  grc_panel: 450, grc_cornice: 250, grc_screen: 300,
  sub_grade: 18, base_course: 25, asphalt_base: 30,
  prime_coat: 8, tack_coat: 6, wearing: 40,
  road_marking: 45, shade: 150, signage: 2500,
};

// ========== EQUIPMENT RULES ==========
const EQUIP = {
  scaffold_int:  { ar: 'سقالة داخلية', cost_m2: 10 },
  scaffold_ext:  { ar: 'سقالة خارجية', cost_m2: 30 },
  manlift:       { ar: 'مانليفت / رافعة سلة', cost_m2: 20 },
  crane:         { ar: 'رافعة برجية', cost_m3: 25 },
  pump:          { ar: 'مضخة خرسانة', cost_m3: 45 },
  asphalt_equip: { ar: 'فرادة + رصاصة إسفلت', cost_m2: 5 },
};

// ========== CLASSIFICATION ENGINE ==========
function classify(desc, unit) {
  const d = desc.toLowerCase();
  const u = unit.toLowerCase();
  
  // --- Earthworks ---
  if (d.includes('حفر') || d.includes('excavat')) return { cat: 'excavation', group: 'earth' };
  if (d.includes('ردم') || d.includes('دك') || d.includes('fill') || d.includes('تعويض')) return { cat: 'backfill', group: 'earth' };
  if (d.includes('نمل') || d.includes('termite')) return { cat: 'antiTermite', group: 'earth' };

  // --- Concrete ---
  if (d.includes('فرشات نظافة') || d.includes('فرشة نظافة') || (d.includes('خرسانة عادية') && !d.includes('مسلحة')))
    return { cat: 'blinding', group: 'concrete' };
  if (d.includes('بلاطة أرضية') || d.includes('slab on grade') || d.includes('sog'))
    return { cat: 'sog', group: 'concrete' };
  if (d.includes('قواعد') || d.includes('أساسات منفصلة') || d.includes('strip footing') || d.includes('isolated footing'))
    return { cat: 'footing', group: 'concrete' };
  if (d.includes('لبشة') || d.includes('حصيرة') || d.includes('raft') || d.includes('mat foundation'))
    return { cat: 'raft', group: 'concrete' };
  if (d.includes('أعمدة') || d.includes('columns'))
    return { cat: 'column', group: 'concrete' };
  if (d.includes('رقاب') || d.includes('رقابي'))
    return { cat: 'neck', group: 'concrete' };
  if (d.includes('كمرات') || d.includes('الكمر') || d.includes('beams'))
    return { cat: 'beam', group: 'concrete' };
  if (d.includes('درج') || d.includes('منحدرات') || d.includes('stairs') || d.includes('ramp'))
    return { cat: 'stair', group: 'concrete' };
  if (d.includes('خزان') || d.includes('tank') || d.includes('pool'))
    return { cat: 'tank', group: 'concrete' };
  if (d.includes('سكريد') || d.includes('screed'))
    return { cat: 'screed', group: 'concrete' };
  if (d.includes('مسبقة الصب') || d.includes('precast'))
    return { cat: 'precast', group: 'concrete' };
  if (d.includes('machine pad'))
    return { cat: 'machinePad', group: 'concrete' };
  if (d.includes('حوائط') || d.includes('جدران خرسانة') || d.includes('حائط') || d.includes('rc walls') || d.includes('concrete walls') || d.includes('parapets') || d.includes('upstands'))
    return { cat: 'wall', group: 'concrete' };
  if (d.includes('بلاطة مصمتة') || d.includes('بلاطات') || d.includes('rc slab') || d.includes('tie slab') || d.includes('flat slab'))
    return { cat: 'slab', group: 'concrete' };
  // English: Blinding / Plain concrete
  if (d.includes('blinding') || d.includes('pc footings') || d.includes('pc for hardscape') || d.includes('plain concrete'))
    return { cat: 'blinding', group: 'concrete' };
  // English: RC Walls / Retaining / Parapets
  if (d.includes('rc walls') || d.includes('retaining wall') || d.includes('rc parapets') || d.includes('upstands wall'))
    return { cat: 'wall', group: 'concrete' };
  // English: RC Slab (various thicknesses)
  if (d.includes('rc slab') || d.includes('flat slabs') || d.includes('basement roof slab'))
    return { cat: 'slab', group: 'concrete' };
  // English: RC Footings
  if (d.includes('rc footings') || d.includes('rc strip footing'))
    return { cat: 'footing', group: 'concrete' };
  // English: Poured concrete / generic concrete / MPa
  if (d.includes('poured concrete'))
    return { cat: 'slab', group: 'concrete' };
  if (d.includes('cast in place') || d.includes('cast-in-place'))
    return { cat: 'slab', group: 'concrete' };
  if ((d.includes('mpa') && d.includes('concrete')) || (d.includes('mpa') && d.includes('reinforced')))
    return { cat: 'slab', group: 'concrete' };
  // English: Section headers for concrete
  if (d.includes('section 03') || (d.includes('concrete') && d.includes('cont')))
    return { cat: 'slab', group: 'concrete' };
  // English: standalone "Concrete" description
  if (/^\s*concrete\s*$/i.test(d) || d === 'concrete')
    return { cat: 'slab', group: 'concrete' };
  // GRP panels
  if (d.includes('glass reinforced plastic') || d.includes('grp'))
    return { cat: 'grc_panel', group: 'grc', equip: 'scaffold_ext' };
  // Arabic generic RC catch-all
  if (d.includes('خرسانة مسلحة') || d.includes('reinforced concrete'))
    return { cat: 'slab', group: 'concrete' };
  // Generic "concrete" or "mpa" anywhere in description
  if (d.includes('concrete') || d.includes('mpa'))
    return { cat: 'slab', group: 'concrete' };



  // --- Masonry ---
  if (d.includes('جدار بسمك') || d.includes('بلك') || d.includes('بلوك') || d.includes('block') || d.includes('masonry')) {
    if (d.includes('100')) return { cat: 'block_100', group: 'masonry' };
    if (d.includes('150')) return { cat: 'block_150', group: 'masonry' };
    return { cat: 'block_200', group: 'masonry' };
  }

  // --- Plastering ---
  if (d.includes('لياسة') || d.includes('plaster')) {
    if (d.includes('خارجية')) return { cat: 'plaster_ext', group: 'plaster' };
    if (d.includes('أسقف') || d.includes('ceiling')) return { cat: 'plaster_ceiling', group: 'plaster', equip: 'scaffold_int' };
    return { cat: 'plaster_int', group: 'plaster' };
  }

  // --- Paint ---
  if (d.includes('دهان') || d.includes('paint')) {
    if (d.includes('خارجي') || d.includes('external')) return { cat: 'paint_ext', group: 'paint', equip: 'manlift' };
    return { cat: 'paint_int', group: 'paint' };
  }

  // --- Flooring ---
  if (d.includes('إيبوكسي') || d.includes('ايبوكسي') || d.includes('epoxy') || d.includes('بولي يوريثان') || d.includes('polyurethane'))
    return { cat: 'epoxy', group: 'flooring' };
  if (d.includes('موكيت') || d.includes('carpet')) return { cat: 'carpet', group: 'flooring' };
  if (d.includes('فينايل') || d.includes('vinyl') || d.includes('vct')) {
    if (d.includes('وزرة')) return { cat: 'vinyl_skirting', group: 'flooring' };
    return { cat: 'vinyl', group: 'flooring' };
  }
  if (d.includes('بورسلان') || d.includes('porcelain')) return { cat: 'porcelain', group: 'flooring' };
  if (d.includes('موزايكو') || d.includes('terrazzo')) return { cat: 'terrazzo', group: 'flooring' };
  if (d.includes('جرانيت') || d.includes('granite')) {
    if (d.includes('وزرة')) return { cat: 'granite_skirting', group: 'flooring' };
    if (d.includes('قوائم') || d.includes('نوائم') || d.includes('منحدر')) return { cat: 'granite_stair', group: 'flooring' };
    return { cat: 'granite', group: 'flooring' };
  }
  if (d.includes('سيراميك') || d.includes('ceramic')) return { cat: 'ceramic', group: 'flooring' };
  if (d.includes('بلاطات أسمنتية') || d.includes('انترلوك') || d.includes('paving')) return { cat: 'pavers', group: 'flooring' };
  if (d.includes('حصى') || d.includes('gravel')) return { cat: 'gravel', group: 'flooring' };

  // --- Ceilings ---
  if (d.includes('أسقف معلقة') || d.includes('ألواح جبسية') || d.includes('gypsum board'))
    return { cat: 'gypsum_board', group: 'ceiling', equip: 'scaffold_int' };
  if (d.includes('بلاطات جبسية') || d.includes('gypsum tiles'))
    return { cat: 'gypsum_tiles', group: 'ceiling', equip: 'scaffold_int' };

  // --- Waterproofing ---
  if (d.includes('غشاء العزل') || d.includes('غشاء عزل') || d.includes('membrane') || d.includes('عزل مائي'))
    return { cat: 'waterproof', group: 'waterproofing' };
  if (d.includes('بيتوميني') || d.includes('bitumen')) return { cat: 'bitumen_liquid', group: 'waterproofing' };
  if (d.includes('نظام تغطية الأسطح') || d.includes('roof system')) return { cat: 'roof_system', group: 'waterproofing' };

  // --- Doors & Windows ---
  if (d.includes('رولينق') || d.includes('rolling')) return { cat: 'rolling_shutter', group: 'doors' };
  if (d.includes('أبواب') || d.includes('door')) return { cat: 'wood_door', group: 'doors' };
  if (d.includes('نوافذ') || d.includes('window') || d.includes('شبابيك')) return { cat: 'alum_window', group: 'doors' };

  // --- Metalwork ---
  if (d.includes('درابزين') || d.includes('handrail') || d.includes('railing')) return { cat: 'handrail', group: 'metal' };
  if (d.includes('سلم حلزوني') || d.includes('spiral')) return { cat: 'spiral_stair', group: 'metal' };
  if (d.includes('سلم بحاري') || d.includes('سلم معدني') || d.includes('ladder')) return { cat: 'steel_ladder', group: 'metal' };
  if (d.includes('برجولة') || d.includes('pergola')) return { cat: 'pergola', group: 'metal' };
  if (d.includes('سلة نفايات') || d.includes('trash') || d.includes('waste bin')) return { cat: 'trash_bin', group: 'metal' };

  // --- GRC ---
  if (d.includes('حليات') || d.includes('مقرنصات') || d.includes('نجمة')) return { cat: 'grc_cornice', group: 'grc', equip: 'scaffold_ext' };
  if (d.includes('شبك حماية')) return { cat: 'grc_screen', group: 'grc', equip: 'scaffold_ext' };
  if (d.includes('grc') || d.includes('ألياف زجاجية')) return { cat: 'grc_panel', group: 'grc', equip: 'scaffold_ext' };

  // --- Roads ---
  if (d.includes('sub-grade') || d.includes('طبقة القاعدة')) return { cat: 'sub_grade', group: 'roads' };
  if (d.includes('base course') || d.includes('طبقة أساس حصوية')) return { cat: 'base_course', group: 'roads' };
  if (d.includes('أساس إسفلتية') || d.includes('bitumen base')) return { cat: 'asphalt_base', group: 'roads', equip: 'asphalt_equip' };
  if (d.includes('prime coat') || d.includes('لاصقة')) return { cat: 'prime_coat', group: 'roads' };
  if (d.includes('tack coat')) return { cat: 'tack_coat', group: 'roads' };
  if (d.includes('wearing') || d.includes('إسفلتية علوية')) return { cat: 'wearing', group: 'roads', equip: 'asphalt_equip' };
  if (d.includes('علامات أرضية') || d.includes('thermoplastic') || d.includes('ثيرموبلاستك')) return { cat: 'road_marking', group: 'roads' };

  // --- External ---
  if (d.includes('مظلات') || d.includes('shade')) return { cat: 'shade', group: 'external' };
  if (d.includes('علامات إرشادية') || d.includes('signage')) return { cat: 'signage', group: 'external' };
  // --- Final catch-all: strip non-ASCII and re-check ---
  const clean = d.replace(/[^\x20-\x7E\u0600-\u06FF]/g, ' ').replace(/\s+/g, ' ').trim();
  if (clean.includes('rc slab') || clean.includes('slab size')) return { cat: 'slab', group: 'concrete' };
  if (clean.includes('rc walls') || clean.includes('rc wall')) return { cat: 'wall', group: 'concrete' };
  if (clean.includes('poured concrete')) return { cat: 'slab', group: 'concrete' };

  return { cat: 'unknown', group: 'unknown' };
}

// ========== SCOPE DETECTION ==========
function detectScope(desc) {
  const d = desc.toLowerCase();
  if (d.includes('توريد فقط') || d.includes('بدون تركيب') || d.includes('supply only'))
    return { scope: 'توريد فقط', includes: ['مواد خام'], excludes: ['مصنعية', 'معدات'] };
  if (d.includes('مصنعية فقط') || d.includes('تركيب فقط') || d.includes('labor only'))
    return { scope: 'مصنعية فقط', includes: ['أجور عمالة'], excludes: ['مواد'] };
  if (d.includes('بما في ذلك الشدات وحديد التسليح') || d.includes('rate including') || d.includes('steel ratio'))
    return { scope: 'توريد وتنفيذ (شامل)', includes: ['خرسانة','حديد','شدة','صب','عمالة'], excludes: [] };
  if (d.includes('توريد وتركيب') || d.includes('توريد وتنفيذ') || d.includes('supply and install'))
    return { scope: 'توريد وتنفيذ', includes: ['مواد','مصنعية'], excludes: [] };
  if (d.includes('مصبوبة في الموقع'))
    return { scope: 'توريد وتنفيذ', includes: ['خرسانة','صب','عمالة'], excludes: [] };
  return { scope: 'توريد وتنفيذ', includes: ['مواد','مصنعية'], excludes: [] };
}

// ========== CONTEXT INTELLIGENCE ENGINE (v9.1) ==========
// الدماغ الآن يفهم السياق — يفرق بين البند الفعلي والطلب والعنوان والملاحظة
function analyzeRowType(desc, unit, hasPrice) {
  const d = desc.trim();
  const dl = d.toLowerCase();

  // 1. عنوان مشروع (Project Title)
  if (dl.includes('مشروع إنشاء') || dl.includes('مشروع تنفيذ') || dl.includes('مشروع بناء'))
    return { type: 'project_title', reason: 'عنوان مشروع — ليس بنداً تسعيرياً' };

  // 2. رأس جدول (Table Header)
  if (dl === 'وصف البند' || dl === 'description' || dl === 'item description' ||
      unit === 'وحدة القياس' || unit === 'Unit')
    return { type: 'table_header', reason: 'رأس جدول — ليس بنداً' };

  // 3. طلب عام / تعليمات (General Instruction/Request)
  //    الأنماط: "يجب إنجاز جميع بنود...", "الواردة في هذا القسم شاملاً..."
  const isInstruction = (
    (dl.includes('يجب إنجاز') || dl.includes('يجب تنفيذ') || dl.includes('يجب أن')) &&
    (dl.includes('شاملاً') || dl.includes('الواردة في') || dl.includes('بنود الأعمال'))
  );
  if (isInstruction && !hasPrice)
    return { type: 'general_instruction', reason: 'طلب/تعليمات عامة — ليس بنداً تسعيرياً' };
  if (isInstruction && hasPrice)
    return { type: 'general_instruction', reason: 'تعليمات عامة مع سعر مرجعي — يُستبعد من التسعير' };

  // 4. عنوان قسم نظيف (Section Header - pure)
  //    الأنماط: "1.1 SUBSTRUCTURE", "Frame", "القسم الرابع - أعمال..."
  const isSectionNumber = /^(\d+\.?\d*)\s+[A-Z]/.test(d); // "1.1 SUBSTRUCTURE"
  const isArabicSection = /^القسم\s/.test(d);
  if ((isSectionNumber || isArabicSection) && !hasPrice && !unit)
    return { type: 'section_header', reason: 'عنوان قسم — ليس بنداً تسعيرياً' };

  // 5. عنوان قسم مدمج مع بند (Mixed Header + Item)
  //    مثال: "القسم الثاني - أعمال الموقع الحفر في تربة..."
  //    أو: "القسم الربع - البناء أعمال البناء لغرفة المضخات..."
  if (isArabicSection && hasPrice) {
    // Try to extract the actual item from after the section name
    // Strip "القسم ... - " or "القسم ... :" prefix
    const cleanedDesc = d
      .replace(/^القسم\s+\S+\s*[-–:]\s*/i, '')  // Remove "القسم الثاني - "
      .replace(/^أعمال\s+\S+\s*[-–:]\s*/i, '')    // Remove "أعمال الموقع: " if leftover
      .trim();
    if (cleanedDesc.length > 15) {
      return { type: 'mixed_header_item', reason: 'عنوان قسم مع بند — تم استخراج البند', cleanedDesc };
    }
    return { type: 'section_header', reason: 'عنوان قسم — ليس بنداً تسعيرياً' };
  }

  // 6. عنوان فرعي إنجليزي (Sub-header like "Frame", "Concrete", single word)
  if (d.split(' ').length <= 2 && !hasPrice && /^[A-Z]/.test(d))
    return { type: 'section_header', reason: 'عنوان فرعي — ليس بنداً تسعيرياً' };

  // 7. حرف ترقيم بدون وحدة (Letter header like "A.", "B.")
  if (/^[A-Za-z]\.\s*$/.test(unit) && !hasPrice)
    return { type: 'section_header', reason: 'ترقيم أبجدي — ليس بنداً تسعيرياً' };

  // 8. نص طويل بدون وحدة قياس حقيقية — ملاحظة تقنية
  const validUnits = ['م3', 'م2', 'م.ط', 'م ط', 'عدد', 'طن', 'كجم', 'لتر', 'مجموعة', 'بوليصة', 'شهر', 'زيارة', 'طقم', 'مقطوعية', 'لفة', 'نقطة',
    'm3', 'm2', 'lm', 'nr', 'ton', 'kg', 'set', 'ls', 'no', 'ea', 'pcs', 'l.s', 'l.m'];
  const unitLower = (unit || '').toLowerCase().replace(/\s/g, '');
  const hasValidUnit = validUnits.some(vu => unitLower === vu || unitLower.includes(vu));
  if (!hasValidUnit && desc.length > 100 && !hasPrice)
    return { type: 'general_instruction', reason: 'نص وصفي طويل بدون وحدة — ملاحظة تقنية' };

  // Default: بند فعلي ✅
  return { type: 'actual_item', reason: 'بند تسعيري فعلي' };
}

// ========== MAIN PROCESSING ==========
const workbook = xlsx.readFile(INPUT);
const auditedData = [];
let processedCount = 0;
let skippedRows = [];

for (const sheetName of workbook.SheetNames) {
  const sheet = workbook.Sheets[sheetName];
  const rows = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    if (!Array.isArray(row) || row.length < 2) continue;
    const unit = String(row[0] || '').trim();
    let desc = String(row[1] || '').trim();
    if (!unit || desc.length < 5 || unit.includes('سعر') || unit.includes('معدل') || unit === 'الوحدة') continue;
    if (desc === 'وصف البند' || desc === 'Description') continue;

    // Get original rate
    let origRate = 0;
    for (let c = 5; c <= 10; c++) {
      if (typeof row[c] === 'number' && row[c] > 0) { origRate = row[c]; break; }
    }
    if (!origRate && typeof row[8] === 'number') origRate = row[8];

    // === v9.1 Context Intelligence ===
    const rowType = analyzeRowType(desc, unit, origRate > 0);

    if (rowType.type === 'project_title' || rowType.type === 'table_header') {
      // Skip silently
      continue;
    }

    if (rowType.type === 'section_header' || rowType.type === 'general_instruction') {
      // Log as skipped but include in output with clear label
      skippedRows.push({ desc: desc.substring(0, 80), reason: rowType.reason });
      processedCount++;
      auditedData.push({
        '#': processedCount,
        'الوحدة': unit || '—',
        'وصف البند': desc.substring(0, 200),
        'التصنيف': '📋 ' + rowType.type,
        'نوع السطر': rowType.reason,
        'نوع البند': '—',
        'يشمل': '—',
        'لا يشمل': '—',
        'السعر القديم': origRate || 0,
        'سعر أربا المعتمد': 0,
        'تفصيل السعر': '⛔ ليس بنداً — ' + rowType.reason,
        'المعدات المطلوبة': '—',
        'تكلفة المعدات': 0,
        'حالة السعر': '🚫 مُستبعد (ليس بنداً)',
      });
      continue;
    }

    // Mixed: extract actual item from header
    if (rowType.type === 'mixed_header_item' && rowType.cleanedDesc) {
      desc = rowType.cleanedDesc;
    }

    // === Normal item processing ===
    const cls = classify(desc, unit);
    const scope = detectScope(desc);
    let arbaRate = 0;
    let breakdown = '';
    let equipName = '';
    let equipCost = 0;

    if (cls.group === 'concrete' && RC_BREAKDOWN[cls.cat]) {
      const b = RC_BREAKDOWN[cls.cat];
      arbaRate = b.total;
      breakdown = `خرسانة ${b.concrete} + حديد ${b.steel} + شدة ${b.formwork} + صب ${b.pump} + عمالة ${b.labor} + مستهلكات ${b.consumables} = ${b.total}`;
      
      // Add scope info
      if (scope.scope.includes('شامل') && b.steel > 0) {
        scope.includes = ['خرسانة C30', `حديد ${Math.round(b.steel/3.2)} كجم/م³`, 'شدة خشبية', 'صب ومضخة', 'عمالة'];
      }
    } else if (RATES[cls.cat]) {
      arbaRate = RATES[cls.cat];
    }

    // Equipment detection
    if (cls.equip && EQUIP[cls.equip]) {
      const eq = EQUIP[cls.equip];
      equipName = eq.ar;
      equipCost = eq.cost_m2 || eq.cost_m3 || 0;
      if (equipCost > 0 && arbaRate > 0) {
        arbaRate += equipCost;
        breakdown = breakdown ? `${breakdown} + ${equipName} ${equipCost}` : `سعر أساسي ${arbaRate - equipCost} + ${equipName} ${equipCost}`;
      }
    }

    // Status
    let status = '';
    if (arbaRate > 0 && origRate > 0) {
      const diff = Math.abs(origRate - arbaRate) / arbaRate;
      if (diff <= 0.15) status = 'سعر عادل ✅';
      else if (origRate < arbaRate) status = 'سعر منخفض (مخاطرة) ⚠️';
      else status = 'سعر مبالغ فيه 📈';
    } else if (origRate === 0 && arbaRate > 0) {
      status = 'تم التسعير من أربا 🆕';
    } else if (arbaRate === 0) {
      status = 'يحتاج تسعير يدوي ❓';
      arbaRate = origRate || 0;
    }

    processedCount++;
    auditedData.push({
      '#': processedCount,
      'الوحدة': unit,
      'وصف البند': desc.substring(0, 200),
      'التصنيف': cls.cat,
      'نوع السطر': '✅ بند فعلي',
      'نوع البند': scope.scope,
      'يشمل': scope.includes.join('، '),
      'لا يشمل': scope.excludes.join('، ') || '—',
      'السعر القديم': origRate || 0,
      'سعر أربا المعتمد': arbaRate,
      'تفصيل السعر': breakdown || '—',
      'المعدات المطلوبة': equipName || '—',
      'تكلفة المعدات': equipCost || 0,
      'حالة السعر': status,
    });
  }
}

// Write Excel
const outWb = xlsx.utils.book_new();
const outSheet = xlsx.utils.json_to_sheet(auditedData);
outSheet['!cols'] = [
  { wch: 5 }, { wch: 8 }, { wch: 80 }, { wch: 15 }, { wch: 30 },
  { wch: 25 }, { wch: 40 }, { wch: 20 }, { wch: 15 }, { wch: 18 },
  { wch: 80 }, { wch: 25 }, { wch: 15 }, { wch: 25 },
];
xlsx.utils.book_append_sheet(outWb, outSheet, 'Arba_Smart_v3');
xlsx.writeFile(outWb, OUTPUT);

const actualItems = auditedData.filter(i => i['نوع السطر'] === '✅ بند فعلي');
const excludedItems = auditedData.filter(i => i['نوع السطر'] !== '✅ بند فعلي');
const covered = actualItems.filter(i => i['التصنيف'] !== 'unknown').length;

console.log(`✅ Processed ${processedCount} rows total.`);
console.log(`   📦 بنود فعلية: ${actualItems.length}`);
console.log(`   🚫 سطور مستبعدة (عناوين/طلبات/ملاحظات): ${excludedItems.length}`);
console.log(`📊 Coverage: ${covered}/${actualItems.length} = ${((covered/actualItems.length)*100).toFixed(1)}%`);
console.log(`📁 Saved to: ${OUTPUT}`);

if (skippedRows.length > 0) {
  console.log(`\n--- السطور المستبعدة ---`);
  skippedRows.forEach(s => console.log(`  ⛔ ${s.reason}: "${s.desc}"`));
}
