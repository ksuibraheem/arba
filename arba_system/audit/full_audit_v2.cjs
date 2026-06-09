const xlsx = require('xlsx');

const inputPath = 'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program\\التأسيس\\item priced للتسعير.xlsx';
const workbook = xlsx.readFile(inputPath);

const allItems = [];
for (const sheetName of workbook.SheetNames) {
  const sheet = workbook.Sheets[sheetName];
  const jsonData = xlsx.utils.sheet_to_json(sheet, { header: 1 });
  for (let i = 0; i < jsonData.length; i++) {
    const row = jsonData[i];
    if (!Array.isArray(row) || row.length < 2) continue;
    const unit = String(row[0] || '').trim();
    const desc = String(row[1] || '').trim();
    if (!unit || desc.length < 5 || unit.includes('سعر') || unit.includes('معدل') || unit === 'الوحدة') continue;
    allItems.push({ sheet: sheetName, row: i, unit, desc });
  }
}

// Extended categories - COMPLETE coverage
const CATEGORIES = {
  // Earthworks
  excavation: ['حفر', 'خنادق', 'تسوية', 'excavat'],
  backfill: ['ردم', 'دك', 'تعويض', 'granual', 'fill'],
  antiTermite: ['نمل أبيض', 'نمل', 'termite'],
  dewatering: ['نزح', 'مياه أرضية', 'dewater'],
  shoring: ['دعامات', 'سند جوانب', 'shoring'],
  
  // Concrete - Arabic
  plainConcrete: ['خرسانة عادية', 'فرشات نظافة', 'فرشة نظافة', 'blinding'],
  rc_general: ['خرسانة مسلحة', 'reinforced concrete', 'rc '],
  rc_slabOnGrade: ['بلاطة أرضية', 'slab on grade', 'sog', 'بلاطات أرضية'],
  rc_footings: ['قواعد', 'footings', 'أساسات منفصلة', 'strip footing', 'footing'],
  rc_raft: ['لبشة', 'حصيرة', 'raft', 'mat foundation'],
  rc_walls: ['حوائط', 'جدران خرسانة', 'حائط الخزان', 'retaining', 'rc walls', 'concrete walls', 'parapets', 'upstands'],
  rc_columns: ['أعمدة', 'رقاب', 'columns'],
  rc_beams: ['كمرات', 'beams', 'الكمر'],
  rc_slabs: ['بلاطة مصمتة', 'بلاطات', 'slabs', 'أسقف خرسانة', 'rc slab', 'tie slab'],
  rc_stairs: ['درج', 'منحدرات', 'stairs', 'ramp'],
  rc_tanks: ['خزان', 'tank', 'pool', 'حمام سباحة'],
  rc_precast: ['مسبقة الصب', 'precast', 'pre-cast'],
  rc_screed: ['سكريد', 'screed'],
  rc_machinePad: ['machine pad'],
  
  // Concrete - English items  
  concrete_en: ['poured concrete', 'concrete', 'cast in place', 'cast-in-place', 'f\'c=', 'mpa'],
  
  // Masonry
  blockwork: ['بلك', 'بلوك', 'بناء طوب', 'مباني', 'block', 'جدار بسمك', 'masonry'],
  
  // Plastering
  internalPlaster: ['لياسة أسمنتية داخلية', 'لياسة داخلية'],
  externalPlaster: ['لياسة أسمنتية خارجية', 'لياسة خارجية'],
  ceilingPlaster: ['لياسة أسقف', 'أسقف : لياسة'],
  
  // Painting
  internalPaint: ['دهان داخلي', 'paint internal'],
  externalPaint: ['دهان خارجي', 'دهانات خارجي'],
  
  // Tiles & Flooring
  ceramicTiles: ['سيراميك', 'ceramic'],
  porcelainTiles: ['بورسلان', 'porcelain'],
  graniteFloor: ['جرانيت', 'granite'],
  graniteSkirting: ['وزرة جرانيت'],
  graniteStairs: ['قوائم ونوائم', 'نوائم من الجرانيت'],
  terrazzo: ['موزايكو', 'terrazzo'],
  vinyl: ['فينايل', 'vinyl', 'vct'],
  carpet: ['موكيت', 'carpet'],
  epoxy: ['بولي يوريثان', 'ايبوكسي', 'epoxy', 'polyurethane', 'إيبوكسي'],
  pavers: ['بلاطات أسمنتية', 'انترلوك', 'interlocking', 'paving'],
  gravel: ['حصى', 'gravel'],
  
  // Ceilings
  gypsumBoard: ['أسقف معلقة', 'ألواح جبسية', 'جبس بورد', 'gypsum board'],
  gypsumTiles: ['بلاطات جبسية', 'gypsum tiles'],
  
  // Waterproofing & Insulation
  waterproofing: ['عزل مائي', 'waterproofing', 'bitumen', 'membrane', 'غشاء العزل', 'غشاء عزل', 'بيتوميني'],
  thermalInsulation: ['عزل حراري', 'thermal', 'insulation', 'polystyrene'],
  dampProof: ['رطوبة', 'damp proof'],
  roofSystem: ['نظام تغطية الأسطح', 'تغطية الأسطح', 'roof system'],
  
  // Doors & Windows
  woodDoors: ['أبواب خشب', 'باب خشب', 'wood door'],
  steelDoors: ['أبواب حديد', 'باب حديد', 'steel door', 'fire door'],
  aluminumWindows: ['نوافذ ألمنيوم', 'شبابيك', 'aluminum window'],
  rollingShutters: ['رولينق', 'rolling shutter', 'ابواب لف'],
  
  // Metalwork
  handrails: ['درابزين', 'handrail', 'railing'],
  steelLadder: ['سلم بحاري', 'سلم حلزوني', 'سلم معدني', 'metal ladder', 'spiral stair'],
  steelStructure: ['هيكل حديد', 'steel structure'],
  accessCovers: ['أغطية', 'manholes', 'access cover'],
  pergola: ['برجولة', 'pergola'],
  trashBin: ['سلة نفايات', 'waste bin', 'trash'],
  
  // GRC / Decorative
  grc: ['grc', 'ألياف زجاجية', 'glass reinforced'],
  grcCornice: ['حليات أسقف', 'حليات جدارية', 'مقرنصات'],
  grcScreen: ['شبك حماية'],
  
  // Roads & Asphalt
  subGrade: ['sub-grade', 'طبقة القاعدة'],
  baseCourse: ['base course', 'طبقة أساس حصوية'],
  asphaltBase: ['أساس إسفلتية', 'bitumen base'],
  primeCost: ['prime coat', 'لاصقة'],
  tackCoat: ['tack coat', 'إسفلت سائل لاصق'],
  wearingCourse: ['wearing course', 'إسفلتية علوية'],
  roadMarking: ['علامات أرضية', 'ثيرموبلاستك', 'thermoplastic'],
  
  // External / Site
  carShades: ['مظلات', 'shade', 'car shade'],
  signage: ['علامات إرشادية', 'signage'],
  landscaping: ['تنسيق حدائق', 'landscaping', 'زراعة'],
  
  // MEP
  plumbing: ['سباكة', 'plumbing', 'صرف', 'تغذية مياه'],
  electrical: ['كهرباء', 'electrical', 'كابلات', 'لوحات توزيع'],
  hvac: ['تكييف', 'hvac', 'تبريد'],
  fire: ['إطفاء', 'حريق', 'fire', 'sprinkler', 'رشاشات'],
  elevator: ['مصعد', 'elevator', 'lift'],
  
  // Header/Description rows
  header: ['وصف البند', 'description', 'item', 'section', 'القسم'],
};

const covered = [];
const uncovered = [];

allItems.forEach(item => {
  const d = item.desc.toLowerCase();
  let matched = false;
  let matchedCategory = '';
  
  for (const [cat, keywords] of Object.entries(CATEGORIES)) {
    for (const kw of keywords) {
      if (d.includes(kw.toLowerCase())) {
        matched = true;
        matchedCategory = cat;
        break;
      }
    }
    if (matched) break;
  }
  
  if (matched) {
    covered.push({ ...item, category: matchedCategory });
  } else {
    uncovered.push(item);
  }
});

console.log(`=== UPDATED COVERAGE REPORT ===`);
console.log(`Total items: ${allItems.length}`);
console.log(`Covered: ${covered.length}`);
console.log(`STILL UNCOVERED: ${uncovered.length}`);
console.log(`Coverage: ${((covered.length / allItems.length) * 100).toFixed(1)}%`);

if (uncovered.length > 0) {
  console.log(`\n=== REMAINING UNCOVERED ITEMS ===`);
  uncovered.forEach((item, idx) => {
    console.log(`${idx + 1}. [${item.unit}] ${item.desc.substring(0, 150)}`);
  });
}

// Category distribution
console.log(`\n=== CATEGORY DISTRIBUTION ===`);
const catCounts = {};
covered.forEach(item => {
  catCounts[item.category] = (catCounts[item.category] || 0) + 1;
});
Object.entries(catCounts).sort((a, b) => b[1] - a[1]).forEach(([cat, count]) => {
  console.log(`  ${cat}: ${count} items`);
});
