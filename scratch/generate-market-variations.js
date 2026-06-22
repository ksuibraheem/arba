import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const OUTPUT_FILE = path.join(ROOT, 'constants', 'extendedSupplierItems.ts');
const TRAINED_DIR = path.join(ROOT, 'training_data', 'trained');

const SUPPLIERS_MAP = {
  'supplier-steel': { id: 'supplier-steel', name: { ar: 'شركة الحديد المتحد', en: 'United Steel', fr: 'Acier Uni', zh: '联合钢铁' }, tier: 'standard', priceMultiplier: 1 },
  'supplier-cement': { id: 'supplier-cement', name: { ar: 'مصانع الإسمنت الخليجية', en: 'Gulf Cement', fr: 'Ciment du Golfe', zh: '海湾水泥' }, tier: 'standard', priceMultiplier: 1 },
  'supplier-electrical': { id: 'supplier-electrical', name: { ar: 'المعدات الكهربائية المتقدمة', en: 'Advanced Electrical', fr: 'Équip Élec', zh: '先进电气设备' }, tier: 'standard', priceMultiplier: 1 },
  'supplier-plumbing': { id: 'supplier-plumbing', name: { ar: 'مؤسسة أنابيب الخليج', en: 'Gulf Pipes', fr: 'Tuyaux du Golfe', zh: '海湾管道' }, tier: 'standard', priceMultiplier: 1 },
  'supplier-rental': { id: 'supplier-rental', name: { ar: 'شركة المعدات الثقيلة للتأجير', en: 'Heavy Equipment Rental', fr: 'Location Équip Lourd', zh: '重型设备租赁公司' }, tier: 'standard', priceMultiplier: 1 },
  'sample-2': { id: 'sample-2', name: { ar: 'مؤسسة التوريد الذهبي', en: 'Golden Ingestion', fr: 'Golden Supply', zh: '黄金供应' }, tier: 'standard', priceMultiplier: 1 },
  'supplier-tools': { id: 'supplier-tools', name: { ar: 'مؤسسة العدد والأدوات المتخصصة', en: 'Specialized Tools', fr: 'Outils Spéciaux', zh: '专业工具' }, tier: 'standard', priceMultiplier: 1 }
};

// Heuristic to clean text
function cleanText(text) {
  if (!text) return '';
  return text.replace(/\r?\n|\r/g, ' ').replace(/\s+/g, ' ').trim();
}

// Arabic character check
function isArabic(text) {
  if (!text) return false;
  return /[\u0600-\u06FF]/.test(text);
}

function main() {
  console.log('🚀 Starting Commercial Catalog Generation: Target >15,000 items');

  const generatedItems = [];
  let itemCounter = 1;

  // 1. =======================================================================
  // ELECTRICAL CABLES & WIRES (mep_elec) - Target: ~3,700 items
  // =======================================================================
  const cableSizes = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240, 300];
  const cableCores = [1, 2, 3, 4, 5];
  const cableInsulations = [
    { code: 'PVC', nameAr: 'معزول PVC', nameEn: 'PVC insulated' },
    { code: 'XLPE_SWA', nameAr: 'مسلح XLPE/SWA/PVC', nameEn: 'XLPE/SWA/PVC armored' },
    { code: 'LSF', nameAr: 'خالي من الهالوجين LSF', nameEn: 'Low Smoke Fume LSF' }
  ];
  const cableBrands = [
    { id: 'cable_alfanar', nameAr: 'ألفنار', nameEn: 'Al-Fanar', mult: 1.15 },
    { id: 'cable_riyadh', nameAr: 'كابلات الرياض', nameEn: 'Riyadh Cables', mult: 1.0 },
    { id: 'cable_bahra', nameAr: 'كابلات بحرة', nameEn: 'Bahra Cables', mult: 0.98 },
    { id: 'cable_jeddah', nameAr: 'كابلات جدة', nameEn: 'Jeddah Cables', mult: 0.97 },
    { id: 'cable_saudi', nameAr: 'السويدي للكهرباء', nameEn: 'Elsewedy Cables', mult: 1.12 },
    { id: 'cable_ducab', nameAr: 'دوكاب (دبي للكابلات)', nameEn: 'Ducab', mult: 1.10 },
    { id: 'cable_imported', nameAr: 'مستورد تجاري', nameEn: 'Imported Commercial', mult: 0.85 }
  ];
  const cableColors = ['أحمر', 'أصفر', 'أزرق', 'أسود', 'أخضر/أصفر', 'بني', 'رمادي'];

  for (const size of cableSizes) {
    for (const core of cableCores) {
      for (const ins of cableInsulations) {
        for (const brand of cableBrands) {
          if (core === 1) {
            for (const color of cableColors) {
              const unit = 'لفة';
              const qty = 152.4;
              let baseRate = (size * 1.8 + core * 5.0) * (ins.code === 'XLPE_SWA' ? 2.5 : 1.0) * brand.mult * 80;
              baseRate = Math.round(baseRate * 100) / 100;
              
              const arName = `سلك نحاسي 1×${size} مم² ${ins.nameAr} - ${brand.nameAr} - لون ${color}`;
              const enName = `Copper wire 1Cx${size}mm² ${ins.nameEn} - ${brand.nameEn} - ${color} color - roll`;
              
              generatedItems.push({
                id: `EXT-EL-CAB-${itemCounter.toString().padStart(5, '0')}`,
                category: 'mep_elec',
                type: 'all',
                name: { ar: arName, en: enName, fr: enName, zh: enName },
                unit: unit,
                qty: qty,
                baseMaterial: Math.round(baseRate * 0.75 * 100) / 100,
                baseLabor: Math.round(baseRate * 0.25 * 100) / 100,
                waste: 0.05,
                suppliers: [SUPPLIERS_MAP['supplier-electrical']],
                sbc: 'SBC 401-Wire',
                soilFactor: false
              });
              itemCounter++;
            }
          } else {
            const unit = 'م.ط';
            const qty = 1;
            let baseRate = (size * 1.8 + core * 5.0) * (ins.code === 'XLPE_SWA' ? 2.5 : 1.0) * brand.mult;
            baseRate = Math.round(baseRate * 100) / 100;
            
            const arName = `كابل نحاسي ${core}×${size} مم² ${ins.nameAr} - ${brand.nameAr}`;
            const enName = `Copper cable ${core}Cx${size}mm² ${ins.nameEn} - ${brand.nameEn}`;
            
            generatedItems.push({
              id: `EXT-EL-CAB-${itemCounter.toString().padStart(5, '0')}`,
              category: 'mep_elec',
              type: 'all',
              name: { ar: arName, en: enName, fr: enName, zh: enName },
              unit: unit,
              qty: qty,
              baseMaterial: Math.round(baseRate * 0.75 * 100) / 100,
              baseLabor: Math.round(baseRate * 0.25 * 100) / 100,
              waste: 0.05,
              suppliers: [SUPPLIERS_MAP['supplier-electrical']],
              sbc: 'SBC 401-Wire',
              soilFactor: false
            });
            itemCounter++;
          }
        }
      }
    }
  }

  // 2. =======================================================================
  // PLUMBING PPR & UPVC PIPES & FITTINGS (mep_plumb) - Target: ~1,500 items
  // =======================================================================
  const pipeSizes = [20, 25, 32, 40, 50, 63, 75, 90, 110, 125, 140, 160];
  const pprBrands = [
    { id: 'plumb_ktp', nameAr: 'القبلان KTP', nameEn: 'Al-Qablan KTP', mult: 1.0 },
    { id: 'plumb_aquatherm', nameAr: 'الأنابيب الخضراء Aquatherm', nameEn: 'Aquatherm Green Pipes', mult: 1.70 },
    { id: 'plumb_nipro', nameAr: 'نيبرو', nameEn: 'Nipro', mult: 0.95 },
    { id: 'plumb_chinal', nameAr: 'تجاري صيني', nameEn: 'Chinese Commercial', mult: 0.75 }
  ];
  
  const pprPressures = [
    { code: 'PN10', nameAr: 'ضغط 10 بار', nameEn: 'PN10' },
    { code: 'PN16', nameAr: 'ضغط 16 بار', nameEn: 'PN16' },
    { code: 'PN20', nameAr: 'ضغط 20 بار', nameEn: 'PN20' },
    { code: 'PN25', nameAr: 'ضغط 25 بار', nameEn: 'PN25' }
  ];

  const upvcClasses = [
    { code: 'CLASS3', nameAr: 'كلاس 3 صرف', nameEn: 'Class 3 Drainage' },
    { code: 'CLASS4', nameAr: 'كلاس 4 صرف', nameEn: 'Class 4 Drainage' },
    { code: 'CLASS5', nameAr: 'كلاس 5 صرف', nameEn: 'Class 5 Drainage' },
    { code: 'SCH40', nameAr: 'جدول 40 صرف (Schedule 40)', nameEn: 'Schedule 40 Drainage' }
  ];

  const fittingTypes = [
    { nameAr: 'كوع 90 درجة', nameEn: 'Elbow 90 deg', priceFactor: 0.3 },
    { nameAr: 'كوع 45 درجة', nameEn: 'Elbow 45 deg', priceFactor: 0.28 },
    { nameAr: 'قسام متساوي T', nameEn: 'Equal Tee', priceFactor: 0.45 },
    { nameAr: 'قسام تقليل Reducer T', nameEn: 'Reducing Tee', priceFactor: 0.5 },
    { nameAr: 'جلبه توصيل Socket', nameEn: 'Coupler Socket', priceFactor: 0.18 },
    { nameAr: 'مسلوب Reducer', nameEn: 'Reducer Socket', priceFactor: 0.22 },
    { nameAr: 'شد وصل نبل Union', nameEn: 'Pipe Union', priceFactor: 0.8 },
    { nameAr: 'سدادة نهاية End Cap', nameEn: 'End Cap', priceFactor: 0.15 },
    { nameAr: 'محبس بوابة ذكي Gate Valve', nameEn: 'Gate Valve', priceFactor: 3.5 },
    { nameAr: 'محبس نحاسي مغلق Ball Valve', nameEn: 'Ball Valve', priceFactor: 4.2 },
    { nameAr: 'كوع سن ذكر Brass Male Elbow', nameEn: 'Brass Male Elbow', priceFactor: 1.5 },
    { nameAr: 'قسام سن أنثى Brass Female Tee', nameEn: 'Brass Female Tee', priceFactor: 1.8 }
  ];

  const upvcFittingTypes = [
    { nameAr: 'كوع 90 درجة صرف UPVC', nameEn: 'UPVC Elbow 90 deg', priceFactor: 0.25 },
    { nameAr: 'كوع 45 درجة صرف UPVC', nameEn: 'UPVC Elbow 45 deg', priceFactor: 0.22 },
    { nameAr: 'قسام متساوي T صرف UPVC', nameEn: 'UPVC Equal Tee', priceFactor: 0.38 },
    { nameAr: 'قسام Y مائل 45 درجة UPVC', nameEn: 'UPVC Wye Tee 45 deg', priceFactor: 0.45 },
    { nameAr: 'جلبه توصيل Socket صرف UPVC', nameEn: 'UPVC Coupler Socket', priceFactor: 0.15 },
    { nameAr: 'مسلوب Reducer صرف UPVC', nameEn: 'UPVC Reducer Socket', priceFactor: 0.19 },
    { nameAr: 'سدادة نهاية End Cap صرف UPVC', nameEn: 'UPVC End Cap', priceFactor: 0.12 },
    { nameAr: 'سيفون رداد روائح P-Trap UPVC', nameEn: 'UPVC P-Trap', priceFactor: 0.95 },
    { nameAr: 'رداد صرف عدم رجوع Non-Return Valve UPVC', nameEn: 'UPVC Non-Return Valve', priceFactor: 3.2 },
    { nameAr: 'فتحة تسليك Clean Out UPVC', nameEn: 'UPVC Clean Out', priceFactor: 0.4 },
    { nameAr: 'كوع ريحة S-Trap UPVC', nameEn: 'UPVC S-Trap', priceFactor: 1.1 },
    { nameAr: 'تحويلة مسلوبة Bushing UPVC', nameEn: 'UPVC Bushing Reducer', priceFactor: 0.18 }
  ];

  // PPR Pipes
  for (const size of pipeSizes) {
    for (const brand of pprBrands) {
      for (const pr of pprPressures) {
        let baseRate = (size * 0.18) * pr.code.replace('PN', '') * 0.15 * brand.mult;
        baseRate = Math.round(Math.max(baseRate, 1.5) * 100) / 100;
        
        const arName = `أنبوب PPR تغذية ${size} مم ${pr.nameAr} - ${brand.nameAr}`;
        const enName = `PPR pipe ${size}mm ${pr.nameEn} - ${brand.nameEn}`;

        generatedItems.push({
          id: `EXT-PL-PIP-${itemCounter.toString().padStart(5, '0')}`,
          category: 'mep_plumb',
          type: 'all',
          name: { ar: arName, en: enName, fr: enName, zh: enName },
          unit: 'م.ط',
          qty: 4,
          baseMaterial: Math.round(baseRate * 0.8 * 100) / 100,
          baseLabor: Math.round(baseRate * 0.2 * 100) / 100,
          waste: 0.05,
          suppliers: [SUPPLIERS_MAP['supplier-plumbing']],
          sbc: 'SBC 701-PPR',
          soilFactor: false
        });
        itemCounter++;
      }
    }
  }

  // UPVC Pipes
  for (const size of pipeSizes) {
    for (const brand of pprBrands) {
      for (const cls of upvcClasses) {
        let baseRate = (size * 0.12) * (cls.code === 'SCH40' ? 2.5 : parseFloat(cls.code.replace('CLASS', ''))) * 0.22 * brand.mult;
        baseRate = Math.round(Math.max(baseRate, 1.2) * 100) / 100;
        
        const arName = `أنبوب UPVC صرف ${size} مم ${cls.nameAr} - ${brand.nameAr}`;
        const enName = `UPVC drainage pipe ${size}mm ${cls.nameEn} - ${brand.nameEn}`;

        generatedItems.push({
          id: `EXT-PL-PIP-${itemCounter.toString().padStart(5, '0')}`,
          category: 'mep_plumb',
          type: 'all',
          name: { ar: arName, en: enName, fr: enName, zh: enName },
          unit: 'م.ط',
          qty: 6,
          baseMaterial: Math.round(baseRate * 0.8 * 100) / 100,
          baseLabor: Math.round(baseRate * 0.2 * 100) / 100,
          waste: 0.05,
          suppliers: [SUPPLIERS_MAP['supplier-plumbing']],
          sbc: 'SBC 701-UPVC',
          soilFactor: false
        });
        itemCounter++;
      }
    }
  }

  // PPR Fittings
  for (const size of pipeSizes) {
    for (const brand of pprBrands) {
      for (const fit of fittingTypes) {
        let baseRate = (size * 0.25) * fit.priceFactor * brand.mult;
        baseRate = Math.round(Math.max(baseRate, 0.8) * 100) / 100;

        const arName = `${fit.nameAr} PPR مقاس ${size} مم - ${brand.nameAr}`;
        const enName = `PPR ${fit.nameEn} ${size}mm - ${brand.nameEn}`;

        generatedItems.push({
          id: `EXT-PL-FIT-${itemCounter.toString().padStart(5, '0')}`,
          category: 'mep_plumb',
          type: 'all',
          name: { ar: arName, en: enName, fr: enName, zh: enName },
          unit: 'عدد',
          qty: 1,
          baseMaterial: Math.round(baseRate * 0.85 * 100) / 100,
          baseLabor: Math.round(baseRate * 0.15 * 100) / 100,
          waste: 0.05,
          suppliers: [SUPPLIERS_MAP['supplier-plumbing']],
          sbc: 'SBC 701-PPR',
          soilFactor: false
        });
        itemCounter++;
      }
    }
  }

  // UPVC Fittings
  for (const size of pipeSizes) {
    for (const brand of pprBrands) {
      for (const fit of upvcFittingTypes) {
        let baseRate = (size * 0.2) * fit.priceFactor * brand.mult;
        baseRate = Math.round(Math.max(baseRate, 0.6) * 100) / 100;

        const arName = `${fit.nameAr} مقاس ${size} مم - ${brand.nameAr}`;
        const enName = `${fit.nameEn} ${size}mm - ${brand.nameEn}`;

        generatedItems.push({
          id: `EXT-PL-FIT-${itemCounter.toString().padStart(5, '0')}`,
          category: 'mep_plumb',
          type: 'all',
          name: { ar: arName, en: enName, fr: enName, zh: enName },
          unit: 'عدد',
          qty: 1,
          baseMaterial: Math.round(baseRate * 0.85 * 100) / 100,
          baseLabor: Math.round(baseRate * 0.15 * 100) / 100,
          waste: 0.05,
          suppliers: [SUPPLIERS_MAP['supplier-plumbing']],
          sbc: 'SBC 701-UPVC',
          soilFactor: false
        });
        itemCounter++;
      }
    }
  }

  // 3. =======================================================================
  // FINISHES: TILES, PORCELAIN, MARBLE (architecture) - Target: ~7,600 items
  // =======================================================================
  const tileMaterials = [
    { code: 'CER', nameAr: 'سيراميك', nameEn: 'Ceramic' },
    { code: 'POR', nameAr: 'بورسلين', nameEn: 'Porcelain' },
    { code: 'MAR', nameAr: 'رخام', nameEn: 'Marble' },
    { code: 'GRA', nameAr: 'جرانيت', nameEn: 'Granite' },
    { code: 'TER', nameAr: 'ترازو', nameEn: 'Terrazzo' }
  ];
  const tileSizes = [
    { code: '3030', val: '30×30 سم', en: '30x30cm', priceMult: 0.7 },
    { code: '4040', val: '40×40 سم', en: '40x40cm', priceMult: 0.8 },
    { code: '6060', val: '60×60 سم', en: '60x60cm', priceMult: 1.0 },
    { code: '8080', val: '80×80 سم', en: '80x80cm', priceMult: 1.2 },
    { code: '6012', val: '60×120 سم', en: '60x120cm', priceMult: 1.5 },
    { code: '8016', val: '80×160 سم', en: '80x160cm', priceMult: 1.9 },
    { code: '9018', val: '90×180 سم', en: '90x180cm', priceMult: 2.2 },
    { code: '1224', val: '120×240 سم', en: '120x240cm', priceMult: 3.0 }
  ];
  const tileOrigins = [
    { code: 'SAUDI', nameAr: 'وطني (الخزف السعودي)', nameEn: 'Saudi', priceBase: 30 },
    { code: 'SPANISH', nameAr: 'إسباني نخب أول', nameEn: 'Spanish', priceBase: 110 },
    { code: 'ITALIAN', nameAr: 'إيطالي فاخر', nameEn: 'Italian', priceBase: 160 },
    { code: 'TURKISH', nameAr: 'تركي ممتاز', nameEn: 'Turkish', priceBase: 65 },
    { code: 'INDIAN', nameAr: 'هندي ممتاز', nameEn: 'Indian', priceBase: 40 },
    { code: 'CHINESE', nameAr: 'صيني تجاري', nameEn: 'Chinese', priceBase: 35 }
  ];
  const tileFinishes = [
    { code: 'POL', nameAr: 'لامع/مصقول (Polished)', nameEn: 'Polished', factor: 1.0 },
    { code: 'MATT', nameAr: 'مطفي (Matt)', nameEn: 'Matt', factor: 0.95 },
    { code: 'SATIN', nameAr: 'ستان ناعم (Satin)', nameEn: 'Satin', factor: 1.05 },
    { code: 'RUSTIC', nameAr: 'خشن مقاوم للانزلاق (Rustic)', nameEn: 'Rustic', factor: 1.1 }
  ];
  const tileColors = ['أبيض كلكتا', 'بيج كلاسيك', 'رمادي فاتح', 'أسود ماركينا', 'كريم مارفيل', 'بني دافئ', 'كلكتا ذهبي', 'رمادي داكن'];

  for (const mat of tileMaterials) {
    for (const size of tileSizes) {
      for (const orig of tileOrigins) {
        for (const fin of tileFinishes) {
          for (const color of tileColors) {
            let baseRate = orig.priceBase * size.priceMult * fin.factor;
            if (mat.code === 'MAR') baseRate *= 3.0;
            if (mat.code === 'GRA') baseRate *= 2.0;
            baseRate = Math.round(baseRate * 100) / 100;

            const arName = `بلاط ${mat.nameAr} للأرضيات والجدران مقاس ${size.val} ${fin.nameAr} - ${orig.nameAr} - لون ${color}`;
            const enName = `${orig.nameEn} ${mat.nameEn} floor/wall tiles ${size.en} ${fin.nameEn} - ${color} color`;

            generatedItems.push({
              id: `EXT-AR-TILE-${itemCounter.toString().padStart(5, '0')}`,
              category: 'architecture',
              type: 'all',
              name: { ar: arName, en: enName, fr: enName, zh: enName },
              unit: 'م2',
              qty: 1,
              baseMaterial: Math.round(baseRate * 0.7 * 100) / 100,
              baseLabor: Math.round(baseRate * 0.3 * 100) / 100,
              waste: 0.08,
              suppliers: [SUPPLIERS_MAP['sample-2']],
              sbc: 'SBC 201-Ceramic',
              soilFactor: false
            });
            itemCounter++;
          }
        }
      }
    }
  }

  // 4. =======================================================================
  // SOCKETS, SWITCHES & DEVICES (mep_elec) - Target: ~570 items
  // =======================================================================
  const deviceTypes = [
    { nameAr: 'مفتاح إنارة 1 خط', nameEn: '1-Gang Light Switch', factor: 12 },
    { nameAr: 'مفتاح إنارة 2 خط', nameEn: '2-Gang Light Switch', factor: 16 },
    { nameAr: 'مفتاح إنارة 3 خط', nameEn: '3-Gang Light Switch', factor: 20 },
    { nameAr: 'مفتاح إنارة 4 خط', nameEn: '4-Gang Light Switch', factor: 25 },
    { nameAr: 'مفتاح مكيف ثنائي القطب 45A', nameEn: '45A DP AC Switch', factor: 45 },
    { nameAr: 'مفتاح سخان ثنائي القطب 20A', nameEn: '20A DP Water Heater Switch', factor: 30 },
    { nameAr: 'أفياش ومأخذ كهرباء 13A مفرد', nameEn: '13A Single Socket Outlet', factor: 14 },
    { nameAr: 'أفياش ومأخذ كهرباء 13A مزدوج', nameEn: '13A Double Socket Outlet', factor: 24 },
    { nameAr: 'مأخذ بيانات هاتف وإنترنت RJ45 مزدوج', nameEn: 'Double RJ45 Data Outlet', factor: 35 },
    { nameAr: 'مأخذ تلفزيون ستالايت Coaxial', nameEn: 'TV Coaxial Outlet', factor: 18 },
    { nameAr: 'مفتاح ديمر للتحكم بالضوء', nameEn: 'Rotary Light Dimmer', factor: 55 },
    { nameAr: 'مخرج يو إس بي مزدوج شحن سريع Type-C', nameEn: 'Double USB Type-C Fast Charger Outlet', factor: 75 },
    { nameAr: 'مقبس إنترنت RJ45 مفرد', nameEn: 'Single RJ45 Data Outlet', factor: 22 },
    { nameAr: 'جرس باب منزلي مع مفتاح ضاغط', nameEn: 'Doorbell Push Button Switch', factor: 32 },
    { nameAr: 'مفتاح كرت الفندق 16A مع مؤشر', nameEn: '16A Hotel Key Card Switch', factor: 90 },
    { nameAr: 'مخرج سلك 45 أمبير طباخ', nameEn: '45A Cooker Outlet Connection Unit', factor: 38 }
  ];
  const devBrands = [
    { id: 'legrand', nameAr: 'لوقراند Legrand', nameEn: 'Legrand', mult: 1.3 },
    { id: 'schneider', nameAr: 'شنايدر Schneider', nameEn: 'Schneider', mult: 1.25 },
    { id: 'panasonic', nameAr: 'باناسونيك Panasonic', nameEn: 'Panasonic', mult: 1.1 },
    { id: 'alfanar', nameAr: 'ألفنار Alfanar', nameEn: 'Al-Fanar', mult: 1.0 },
    { id: 'abb', nameAr: 'إيه بي بي ABB', nameEn: 'ABB', mult: 1.4 },
    { id: 'viko', nameAr: 'فيكو Viko', nameEn: 'Viko', mult: 0.8 }
  ];
  const devLines = [
    { nameAr: 'كلاسيك أبيض', nameEn: 'Classic White', priceAdd: 0 },
    { nameAr: 'فضي معدني', nameEn: 'Metallic Silver', priceAdd: 8 },
    { nameAr: 'ذهبي فاخر', nameEn: 'Premium Gold', priceAdd: 12 },
    { nameAr: 'أسود مطفي', nameEn: 'Matte Black', priceAdd: 10 },
    { nameAr: 'رمادي تيتانيوم', nameEn: 'Titanium Grey', priceAdd: 10 },
    { nameAr: 'تأثير الخشب الطبيعي', nameEn: 'Natural Wood Effect', priceAdd: 15 }
  ];

  for (const dev of deviceTypes) {
    for (const brand of devBrands) {
      for (const line of devLines) {
        let baseRate = (dev.factor + line.priceAdd) * brand.mult;
        baseRate = Math.round(baseRate * 100) / 100;

        const arName = `${dev.nameAr} (${line.nameAr}) - ماركة ${brand.nameAr}`;
        const enName = `${brand.nameEn} ${dev.nameEn} (${line.nameEn})`;

        generatedItems.push({
          id: `EXT-EL-DEV-${itemCounter.toString().padStart(5, '0')}`,
          category: 'mep_elec',
          type: 'all',
          name: { ar: arName, en: enName, fr: enName, zh: enName },
          unit: 'عدد',
          qty: 1,
          baseMaterial: Math.round(baseRate * 0.85 * 100) / 100,
          baseLabor: Math.round(baseRate * 0.15 * 100) / 100,
          waste: 0.02,
          suppliers: [SUPPLIERS_MAP['supplier-electrical']],
          sbc: 'SBC 401-Device',
          soilFactor: false
        });
        itemCounter++;
      }
    }
  }

  // 5. =======================================================================
  // PAINTS & PRIMERS (architecture) - Target: ~570 items
  // =======================================================================
  const paintTypes = [
    { code: 'PUTTY', nameAr: 'معجون جدران أكريليك داخلي', nameEn: 'Interior Acrylic Wall Putty', unit: 'سطل 25 كجم', basePrice: 50 },
    { code: 'PRIMER', nameAr: 'طلاء أساس مائي برايمر خارجي/داخلي', nameEn: 'Water-based Primer Undercoat', unit: 'برميل 18 لتر', basePrice: 160 },
    { code: 'EMUL_MATT', nameAr: 'دهان مائي داخلي مطفي كامل', nameEn: 'Interior Matt Emulsion Paint', unit: 'برميل 18 لتر', basePrice: 240 },
    { code: 'EMUL_SILK', nameAr: 'دهان مائي داخلي ربع/نصف لمعة', nameEn: 'Interior Semi-Gloss Silk Emulsion', unit: 'برميل 18 لتر', basePrice: 280 },
    { code: 'PROFILE', nameAr: 'دهان بروفايل خارجي خشن مقاوم للطقس', nameEn: 'Weather-resistant Exterior Profile Paint', unit: 'برميل 18 لتر', basePrice: 310 },
    { code: 'EPOXY', nameAr: 'دهان إيبوكسي عازل للأرضيات والمواقف', nameEn: 'Epoxy Floor Coating for Car Parks', unit: 'طقم', basePrice: 550 }
  ];
  const paintBrands = [
    { id: 'paint_jotun', nameAr: 'جوتن Jotun', nameEn: 'Jotun', mult: 1.15 },
    { id: 'paint_jazeera', nameAr: 'دهانات الجزيرة', nameEn: 'Al-Jazeera Paints', mult: 1.05 },
    { id: 'paint_sigma', nameAr: 'سيجما Sigma', nameEn: 'Sigma', mult: 1.0 },
    { id: 'paint_hempel', nameAr: 'همبل Hempel', nameEn: 'Hempel', mult: 0.95 }
  ];
  const paintQualities = [
    { nameAr: 'درجة اقتصادية', nameEn: 'Eco Grade', factor: 0.8 },
    { nameAr: 'درجة قياسية', nameEn: 'Standard Grade', factor: 1.0 },
    { nameAr: 'درجة ممتازة حماية قصوى', nameEn: 'Premium Max Protection', factor: 1.3 }
  ];
  const paintColors = [
    { code: 'WHITE', nameAr: 'أبيض ناصع', nameEn: 'Pure White' },
    { code: 'OFFWHITE', nameAr: 'أوف وايت', nameEn: 'Off-White' },
    { code: 'VANILLA', nameAr: 'فانيلا كريم', nameEn: 'Vanilla Cream' },
    { code: 'GREY', nameAr: 'رمادي كلاسيك', nameEn: 'Classic Grey' },
    { code: 'COTTON', nameAr: 'أبيض قطني', nameEn: 'Cotton White' },
    { code: 'CASHMERE', nameAr: 'كشمير', nameEn: 'Cashmere' },
    { code: 'IVORY', nameAr: 'عاجي', nameEn: 'Ivory' },
    { code: 'PEARL', nameAr: 'لؤلؤي', nameEn: 'Pearl' }
  ];

  for (const pt of paintTypes) {
    for (const brand of paintBrands) {
      for (const qual of paintQualities) {
        for (const col of paintColors) {
          let baseRate = pt.basePrice * brand.mult * qual.factor;
          baseRate = Math.round(baseRate * 100) / 100;

          const arName = `${pt.nameAr} - ${brand.nameAr} (${qual.nameAr}) - لون ${col.nameAr}`;
          const enName = `${brand.nameEn} ${pt.nameEn} (${qual.nameEn}) - ${col.nameEn} color`;

          generatedItems.push({
            id: `EXT-AR-PNT-${itemCounter.toString().padStart(5, '0')}`,
            category: 'architecture',
            type: 'all',
            name: { ar: arName, en: enName, fr: enName, zh: enName },
            unit: pt.unit,
            qty: 1,
            baseMaterial: Math.round(baseRate * 0.9 * 100) / 100,
            baseLabor: Math.round(baseRate * 0.1 * 100) / 100,
            waste: 0.05,
            suppliers: [SUPPLIERS_MAP['sample-2']],
            sbc: 'SBC 201-Paint',
            soilFactor: false
          });
          itemCounter++;
        }
      }
    }
  }

  // 6. =======================================================================
  // BLOCKS & BRICKS (structure) - Target: ~600 items
  // =======================================================================
  const blockTypes = [
    { code: 'HOLLOW', nameAr: 'بلك أسمنتي مفرغ', nameEn: 'Hollow Concrete Block', priceBase: 1.8 },
    { code: 'SOLID', nameAr: 'بلك أسمنتي مصمت', nameEn: 'Solid Concrete Block', priceBase: 2.2 },
    { code: 'RED_CLAY', nameAr: 'بلك أحمر فخاري مفرغ', nameEn: 'Red Clay Hollow Block', priceBase: 2.5 },
    { code: 'INS_POLY', nameAr: 'بلك أسمنتي معزول بوليسترين أزرق', nameEn: 'Polystyrene Insulated Concrete Block', priceBase: 3.8 },
    { code: 'SIPOREX', nameAr: 'بلك سيبوركس خفيف عازل سيبكو', nameEn: 'Lightweight Siporex Autoclaved Block', priceBase: 7.5 }
  ];
  const blockSizes = [
    { code: '10x20x40', nameAr: '10×20×40 سم', nameEn: '10x20x40 cm', factor: 0.75 },
    { code: '15x20x40', nameAr: '15×20×40 سم', nameEn: '15x20x40 cm', factor: 0.9 },
    { code: '20x20x40', nameAr: '20×20×40 سم', nameEn: '20x20x40 cm', factor: 1.0 },
    { code: '25x20x40', nameAr: '25×20×40 سم', nameEn: '25x20x40 cm', factor: 1.25 },
    { code: '30x20x40', nameAr: '30×20×40 سم', nameEn: '30x20x40 cm', factor: 1.5 }
  ];
  const blockBrands = [
    { id: 'block_watani', nameAr: 'مصنع وطني معتمد', nameEn: 'Saudi Certified Factory', mult: 1.0 },
    { id: 'block_yamama', nameAr: 'بلك اليمامة الممتاز', nameEn: 'Al-Yamama Block', mult: 1.12 },
    { id: 'block_khayyat', nameAr: 'بلك الخياط الأحمر', nameEn: 'Al-Khayyat Red Block', mult: 1.08 },
    { id: 'block_commercial', nameAr: 'مصنع تجاري درجة ثانية', nameEn: 'Commercial Factory Grade 2', mult: 0.88 }
  ];
  const blockStrengths = [
    { code: '5MPA', nameAr: 'قوة 5 ميجا باسكال', nameEn: 'Strength 5MPa' },
    { code: '7.5MPA', nameAr: 'قوة 7.5 ميجا باسكال', nameEn: 'Strength 7.5MPa' },
    { code: '10MPA', nameAr: 'قوة 10 ميجا باسكال', nameEn: 'Strength 10MPa' }
  ];

  for (const blk of blockTypes) {
    for (const sz of blockSizes) {
      for (const brd of blockBrands) {
        for (const str of blockStrengths) {
          let baseRate = blk.priceBase * sz.factor * brd.mult;
          if (str.code === '10MPA') baseRate *= 1.15;
          if (str.code === '5MPA') baseRate *= 0.92;
          baseRate = Math.round(baseRate * 100) / 100;

          const arName = `بلك بناء جدران ${blk.nameAr} مقاس ${sz.nameAr} (${str.nameAr}) - ${brd.nameAr}`;
          const enName = `${brd.nameEn} ${sz.nameEn} ${blk.nameEn} (${str.nameEn})`;

          generatedItems.push({
            id: `EXT-ST-BLK-${itemCounter.toString().padStart(5, '0')}`,
            category: 'structure',
            type: 'all',
            name: { ar: arName, en: enName, fr: enName, zh: enName },
            unit: 'عدد',
            qty: 1,
            baseMaterial: Math.round(baseRate * 0.75 * 100) / 100,
            baseLabor: Math.round(baseRate * 0.25 * 100) / 100,
            waste: 0.05,
            suppliers: [SUPPLIERS_MAP['supplier-cement']],
            sbc: 'SBC 301-Masonry',
            soilFactor: false
          });
          itemCounter++;
        }
      }
    }
  }

  // 7. =======================================================================
  // EQUIPMENT RENTAL (site / manpower) - Target: ~250 items
  // =======================================================================
  const equipmentTypes = [
    { code: 'EXC_20', nameAr: 'بوكلين حفار 20 طن', nameEn: 'Excavator 20 Ton', baseDayPrice: 1200 },
    { code: 'EXC_HAM', nameAr: 'بوكلين دقاق تفتيت صخور 20 طن', nameEn: 'Excavator with Jackhammer 20 Ton', baseDayPrice: 1650 },
    { code: 'LDR_30', nameAr: 'شيول لودر 3 طن', nameEn: 'Wheel Loader 3 Ton', baseDayPrice: 1000 },
    { code: 'RLL_10', nameAr: 'رصاصة اهتزازية لدمك التربة 10 طن', nameEn: 'Vibratory Roller 10 Ton', baseDayPrice: 650 },
    { code: 'BOB_STD', nameAr: 'ميني لودر بوبكات', nameEn: 'Bobcat Skid Steer Loader', baseDayPrice: 450 },
    { code: 'DUMP_18', nameAr: 'قلاب نقل رمل وناتج حفر 18 م³', nameEn: 'Dump Truck 18cbm', baseDayPrice: 350 },
    { code: 'GEN_100', nameAr: 'مولد ديزل كاتم صوت 100KVA', nameEn: 'Silent Diesel Generator 100KVA', baseDayPrice: 400 },
    { code: 'GEN_500', nameAr: 'مولد ديزل كاتم صوت 500KVA', nameEn: 'Silent Diesel Generator 500KVA', baseDayPrice: 1100 },
    { code: 'CRN_50', nameAr: 'رافعة متحركة تلسكوبية 50 طن', nameEn: 'Mobile Crane 50 Ton', baseDayPrice: 2200 },
    { code: 'PMP_42', nameAr: 'مضخة خرسانة متحركة 42 متر', nameEn: 'Concrete Boom Pump 42m', baseDayPrice: 2500 },
    { code: 'LIF_12', nameAr: 'رافعة أفراد مقصية Manlift 12م', nameEn: 'Scissor Manlift 12m', baseDayPrice: 350 },
    { code: 'TNK_19', nameAr: 'وايت صهريج مياه صالح للشرب 19 م³', nameEn: 'Water Tanker Truck 19cbm', baseDayPrice: 300 },
    { code: 'TRL_25', nameAr: 'سطحة نقل معدات ومواد 25 طن', nameEn: 'Flatbed Trailer 25 Ton', baseDayPrice: 500 },
    { code: 'EXC_30', nameAr: 'بوكلين حفار كبير 30 طن', nameEn: 'Excavator 30 Ton', baseDayPrice: 1500 }
  ];
  const rentalPeriods = [
    { code: 'DAILY', nameAr: 'يومي (شامل السائق والمحروقات 8س)', nameEn: 'Daily (inc. operator & fuel)', mult: 1.0, unit: 'يوم' },
    { code: 'WEEKLY', nameAr: 'أسبوعي (شامل السائق والمحروقات 6 أيام)', nameEn: 'Weekly (inc. operator & fuel)', mult: 5.2, unit: 'أسبوع' },
    { code: 'MONTHLY', nameAr: 'شهري (شامل السائق والمحروقات 26 يوم عمل)', nameEn: 'Monthly (inc. operator & fuel)', mult: 18.3, unit: 'شهر' }
  ];
  const equipmentSpecs = [
    { nameAr: 'موديل حديث 2024-2026', nameEn: 'Recent model 2024-2026', factor: 1.0 },
    { nameAr: 'موديل اقتصادي 2018-2022', nameEn: 'Budget model 2018-2022', factor: 0.85 }
  ];
  const rentalBrands = [
    { nameAr: 'كاتربيلر CAT', nameEn: 'Caterpillar' },
    { nameAr: 'كوماتسو Komatsu', nameEn: 'Komatsu' },
    { nameAr: 'فولفو/ساني', nameEn: 'Volvo/Sany' }
  ];

  for (const eq of equipmentTypes) {
    for (const pr of rentalPeriods) {
      for (const sp of equipmentSpecs) {
        for (const brd of rentalBrands) {
          let baseRate = eq.baseDayPrice * pr.mult * sp.factor;
          if (brd.nameEn === 'Caterpillar') baseRate *= 1.05;
          if (brd.nameEn === 'Volvo/Sany') baseRate *= 0.95;
          baseRate = Math.round(baseRate * 100) / 100;

          const arName = `تأجير ${eq.nameAr} (${brd.nameAr}) - ${pr.nameAr} (${sp.nameAr})`;
          const enName = `Rental of ${eq.nameEn} (${brd.nameEn}) - ${pr.nameEn} (${sp.nameEn})`;

          generatedItems.push({
            id: `EXT-EQ-RNT-${itemCounter.toString().padStart(5, '0')}`,
            category: 'site',
            type: 'all',
            name: { ar: arName, en: enName, fr: enName, zh: enName },
            unit: pr.unit,
            qty: 1,
            baseMaterial: 0,
            baseLabor: baseRate,
            waste: 0,
            suppliers: [SUPPLIERS_MAP['supplier-rental']],
            sbc: 'SBC 303-Equip',
            soilFactor: true
          });
          itemCounter++;
        }
      }
    }
  }

  console.log(`✅ Generated ${generatedItems.length} commercial variations programmatically`);

  // 8. =======================================================================
  // MERGE WITH CLIENT EXTRACTED CUSTOM ITEMS (1,563 items)
  // =======================================================================
  let customItems = [];
  try {
    console.log('📂 Re-extracting client items from extracted_all_excel.json to merge...');
    
    const excelPath = path.join(TRAINED_DIR, 'extracted_all_excel.json');
    if (fs.existsSync(excelPath)) {
      const raw = fs.readFileSync(excelPath, 'utf8');
      const data = JSON.parse(raw);
      let customIndex = 1;
      
      for (const [sourceKey, source] of Object.entries(data.sources)) {
        for (const [sheetName, sheet] of Object.entries(source.sheets)) {
          if (!sheet.allItems) continue;
          
          const sourceShort = sourceKey.replace(/_/g, '').substring(0, 4).toUpperCase();
          const sheetShort = sheetName.replace(/[\s-_]/g, '').substring(0, 4).toUpperCase();

          for (const row of sheet.allItems) {
            const cells = row.cells;
            if (!cells || cells.length < 3) continue;

            let enDesc = '';
            let arDesc = '';
            let unit = '';
            let qty = 0;
            let price = 0;

            const stringCells = [];
            const numberCells = [];
            
            cells.forEach((c) => {
              if (c === null || c === undefined || c === '') return;
              if (typeof c === 'number') numberCells.push(c);
              else if (typeof c === 'string') {
                const cleaned = cleanText(c);
                if (cleaned.length > 0) stringCells.push(cleaned);
              }
            });

            // Extract descriptions
            let longestAr = '';
            let longestEn = '';
            
            stringCells.forEach(text => {
              if (text.length <= 4 && !isArabic(text)) return;
              if (isArabic(text)) {
                if (text.length > longestAr.length) longestAr = text;
              } else {
                if (/[a-zA-Z]/.test(text) && text.length > longestEn.length) longestEn = text;
              }
            });

            enDesc = longestEn;
            arDesc = longestAr;

            // Filter out summary/header rows
            const lowerEn = enDesc.toLowerCase();
            const lowerAr = arDesc.toLowerCase();
            const summaryKeywords = ['total', 'subtotal', 'collection', 'summary', 'scope of work', 'vat', 'tax', 'discount', 'allowance', 'grand total', 'carried to', 'إجمالي', 'مجموع', 'الخلاصة', 'ضريبة'];
            
            const isSummary = summaryKeywords.some(kw => lowerEn.includes(kw) || lowerAr.includes(kw));
            if (isSummary) continue;

            // Extract Unit
            const unitKeywords = ['م²', 'م2', 'sqm', 'م³', 'م3', 'cbm', 'م.ط', 'متر', 'meter', 'm', 'عدد', 'حبة', 'no', "no's", 'no.', 'set', 'item', 'l.s', 'مقطوعية', 'رول', 'roll', 'طقم', 'برميل', 'drum', 'طن', 'ton', 'bag', 'كيس', 'kg', 'كجم', 'pcs', 'piece'];
            
            stringCells.forEach(text => {
              const cleaned = text.toLowerCase().replace(/[\.\(\)]/g, '').trim();
              if (unitKeywords.includes(cleaned)) {
                unit = text;
              }
            });

            if (!unit) {
              const shortStrings = stringCells.filter(text => text.length > 0 && text.length <= 4);
              if (shortStrings.length > 0) unit = shortStrings[0];
            }

            // Extract Price
            const positiveNumbers = numberCells.filter(val => val > 0);
            if (positiveNumbers.length > 0) {
              price = positiveNumbers[0];
              if (positiveNumbers.length > 1) price = positiveNumbers[1];
            }

            const hasDesc = (enDesc && enDesc.length > 5) || (arDesc && arDesc.length > 5);
            const hasValidPrice = price > 0.5 && price < 150000;
            
            if (hasDesc && hasValidPrice) {
              let category = 'architecture';
              const lowerSheet = sheetName.toLowerCase();
              
              if (lowerSheet.includes('elec') || lowerSheet.includes('div-26') || lowerSheet.includes('div-27')) {
                category = 'mep_elec';
              } else if (lowerSheet.includes('plumb') || lowerSheet.includes('drain') || lowerSheet.includes('water') || lowerSheet.includes('div-10') || lowerSheet.includes('div-22')) {
                category = 'mep_plumb';
              } else if (lowerSheet.includes('hvac') || lowerSheet.includes('ac') || lowerSheet.includes('cool') || lowerSheet.includes('div-23')) {
                category = 'mep_hvac';
              } else if (lowerSheet.includes('fire') || lowerSheet.includes('safety') || lowerSheet.includes('div-21') || lowerSheet.includes('div-28')) {
                category = 'safety';
              } else if (lowerSheet.includes('insul') || lowerSheet.includes('waterproof') || lowerSheet.includes('div-7')) {
                category = 'insulation';
              } else if (lowerSheet.includes('block') || lowerSheet.includes('brick') || lowerSheet.includes('masonry') || lowerSheet.includes('div-4') || lowerSheet.includes('structure')) {
                category = 'structure';
              } else if (lowerSheet.includes('site') || lowerSheet.includes('excavation') || lowerSheet.includes('earth') || lowerSheet.includes('div-2')) {
                category = 'site';
              }

              let supplierKey = 'sample-2';
              if (category === 'mep_elec' || category === 'mep_hvac') {
                supplierKey = 'supplier-electrical';
              } else if (category === 'mep_plumb') {
                supplierKey = 'supplier-plumbing';
              } else if (category === 'structure') {
                const descLower = (enDesc + ' ' + arDesc).toLowerCase();
                if (descLower.includes('حديد') || descLower.includes('rebar') || descLower.includes('steel')) {
                  supplierKey = 'supplier-steel';
                } else {
                  supplierKey = 'supplier-cement';
                }
              } else if (category === 'site') {
                supplierKey = 'supplier-rental';
              } else if (category === 'safety') {
                supplierKey = 'supplier-tools';
              }

              const activeSupplier = SUPPLIERS_MAP[supplierKey] || SUPPLIERS_MAP['sample-2'];
              const arName = arDesc || enDesc;
              const enName = enDesc || arDesc;
              const baseMaterial = Math.round(price * 0.75 * 100) / 100;
              const baseLabor = Math.round(price * 0.25 * 100) / 100;

              customItems.push({
                id: `EXT-QS-${sourceShort}-${sheetShort}-${customIndex.toString().padStart(4, '0')}`,
                category: category,
                type: 'all',
                name: { ar: arName, en: enName, fr: enName, zh: enName },
                unit: unit || 'مقطوعية',
                qty: qty || 1,
                baseMaterial: baseMaterial,
                baseLabor: baseLabor,
                waste: 0.05,
                suppliers: [activeSupplier],
                sbc: `SBC-EXT-${category.toUpperCase()}`,
                soilFactor: category === 'site' || category === 'structure'
              });
              customIndex++;
            }
          }
        }
      }
    }
  } catch (err) {
    console.error('Error during client items re-extraction:', err.message);
  }

  // Deduplicate custom items
  const uniqueCustom = [];
  const seenCustom = new Set();
  for (const item of customItems) {
    const key = item.name.en.toLowerCase().substring(0, 150) + '|' + item.name.ar.substring(0, 150);
    if (!seenCustom.has(key)) {
      seenCustom.add(key);
      uniqueCustom.push(item);
    }
  }
  console.log(`✅ Extracted ${uniqueCustom.length} unique client items`);

  // Merge both
  const allExtendedItems = [...uniqueCustom, ...generatedItems];
  console.log(`🔥 Total Extended Items for Catalog: ${allExtendedItems.length} items`);

  // Emit final TypeScript file (compact single-line per item format to preserve memory and compile speed)
  let code = `/**\n * Extended Supplier Items Database (Comprehensive Catalog Expansion)\n * Auto-generated by generate-market-variations.js\n */\n\nimport { BaseItem } from '../types';\n\nexport const EXTENDED_SUPPLIER_ITEMS: BaseItem[] = [\n`;
  
  for (const item of allExtendedItems) {
    const supplier = item.suppliers[0];
    const supStr = `{ id: ${JSON.stringify(supplier.id)}, name: { ar: ${JSON.stringify(supplier.name.ar)}, en: ${JSON.stringify(supplier.name.en)}, fr: ${JSON.stringify(supplier.name.fr)}, zh: ${JSON.stringify(supplier.name.zh)} }, tier: ${JSON.stringify(supplier.tier)}, priceMultiplier: ${supplier.priceMultiplier} }`;
    
    code += `  { id: ${JSON.stringify(item.id)}, category: "${item.category}", type: "${item.type}", name: { ar: ${JSON.stringify(item.name.ar)}, en: ${JSON.stringify(item.name.en)}, fr: ${JSON.stringify(item.name.fr)}, zh: ${JSON.stringify(item.name.zh)} }, unit: ${JSON.stringify(item.unit)}, qty: ${item.qty}, baseMaterial: ${item.baseMaterial}, baseLabor: ${item.baseLabor}, waste: ${item.waste}, suppliers: [${supStr}], sbc: "${item.sbc}", soilFactor: ${item.soilFactor} },\n`;
  }
  
  code += `];\n`;

  fs.writeFileSync(OUTPUT_FILE, code, 'utf8');
  console.log(`🎉 COMPLETED: Extended items database updated successfully with ${allExtendedItems.length} items!`);
}

main();
