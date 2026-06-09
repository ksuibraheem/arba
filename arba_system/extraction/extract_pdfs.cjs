const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const BASE = path.join(__dirname, '..', '..', 'جداول لتسعير (نماذج)');
const OUT = path.join(__dirname, '..', 'data', 'training');

async function extractPDF(filePath, label) {
  console.log(`\n📄 ${label}`);
  try {
    const buf = fs.readFileSync(filePath);
    const p = new PDFParse({ data: buf });
    const result = await p.getText();
    const pages = result.pages || [];
    
    const allItems = [];
    pages.forEach((page, pi) => {
      const lines = (page.text || '').split('\n').filter(l => l.trim().length > 5);
      lines.forEach((line, li) => {
        // Match BOQ pattern: number, description, unit, qty, price
        const nums = line.match(/[\d,]+\.?\d*/g);
        if (nums && nums.length >= 2 && line.length > 15) {
          allItems.push({
            page: pi + 1, line: li,
            text: line.trim().substring(0, 200),
            numbers: nums.map(n => parseFloat(n.replace(/,/g, '')))
          });
        }
      });
    });

    console.log(`  ✅ ${pages.length} صفحة | ${allItems.length} بند`);
    return { source: label, pages: pages.length, items: allItems };
  } catch (e) {
    console.log(`  ❌ ${e.message.substring(0, 100)}`);
    return null;
  }
}

async function main() {
  const results = {};

  results.sharqiya = await extractPDF(
    path.join(BASE, 'كراسة الشرقية', 'جدول كميات منافسة الامن البيئى للمنطقة الشرقية - الدمام.pdf'),
    'كراسة الشرقية (الدمام)'
  );

  results.madinah = await extractPDF(
    path.join(BASE, 'كراسة المدينة', 'جدول كميات منافسة الامن البيئى للمدينة المنورة.pdf'),
    'كراسة المدينة'
  );

  fs.writeFileSync(path.join(OUT, 'extracted_pdf_boqs.json'), JSON.stringify(results, null, 2), 'utf8');

  // Now build the MEGA training file combining everything
  console.log('\n🧠 بناء ملف التدريب الشامل...');
  
  const existing = JSON.parse(fs.readFileSync(path.join(OUT, 'extracted_all_excel.json'), 'utf8'));
  const hailPath = path.join(BASE, 'كراسة حائل', 'pricing_results.json');
  let hailData = null;
  try { hailData = JSON.parse(fs.readFileSync(hailPath, 'utf8')); } catch(e) { console.log('⚠️ حائل: ' + e.message.substring(0,50)); }
  let schoolData = null;
  const schoolPath = path.join(__dirname, '..', '..', '..', '.gemini', 'antigravity', 'knowledge', 'sow-tbc-schools-pricing', 'artifacts', 'school_maintenance_pricing.json');
  try { schoolData = JSON.parse(fs.readFileSync(schoolPath, 'utf8')); } catch(e) { console.log('⚠️ مدارس: ' + e.message.substring(0,50)); }
  const schoolBrain = JSON.parse(fs.readFileSync(path.join(OUT, 'brain_school_maintenance.json'), 'utf8'));
  const farmData = JSON.parse(fs.readFileSync(path.join(OUT, 'brain_baseline_farm.json'), 'utf8'));
  const farmAudit = JSON.parse(fs.readFileSync(path.join(OUT, 're_farm_mep_audit.json'), 'utf8'));

  const megaTraining = {
    version: '2.0',
    createdAt: new Date().toISOString(),
    totalSources: 0,
    totalItems: 0,
    sources: {}
  };

  // Farm baseline
  megaTraining.sources.farm_baseline = {
    type: 'residential_farm', scope: 'mep', location: 'saudi', 
    bua_m2: farmData.bua_m2, itemCount: Object.keys(farmData.categories).length,
    items: Object.entries(farmData.categories).map(([k, v]) => ({ category: k, ...v }))
  };

  // Farm audit (detailed items)
  megaTraining.sources.farm_audit = {
    type: 'residential_farm', scope: 'mep_detailed', location: 'saudi',
    bua_m2: farmAudit.bua, total_sar: farmAudit.total,
    itemCount: farmAudit.items.length,
    items: farmAudit.items
  };

  // School maintenance (pricing data)
  if (schoolData) {
    megaTraining.sources.school_maintenance = {
      type: 'school_maintenance', scope: 'rehabilitation', location: 'saudi',
      schoolsCount: schoolData.schoolsCount || 8,
      itemCount: (schoolData.categories || []).reduce((s, c) => s + (c.items?.length || 0), 0),
      categories: schoolData.categories || [],
      lessons: schoolBrain.pricingLessons || [],
      errorPatterns: schoolBrain.errorPatterns || [],
      benchmarks: schoolBrain.categoryBenchmarks || {}
    };
  }

  // Hail tender
  if (hailData) {
    megaTraining.sources.hail_tender = {
      type: 'government_environmental', scope: 'construction', location: 'hail',
      itemCount: Array.isArray(hailData) ? hailData.length : Object.keys(hailData).length,
      items: hailData
    };
  }

  // Excel sources
  Object.entries(existing.sources).forEach(([key, src]) => {
    megaTraining.sources[key] = {
      type: key.includes('farm') ? 'residential_farm' : 'general',
      scope: key.includes('farm') ? 'mep' : 'construction',
      location: 'saudi',
      itemCount: src.summary.totalItems,
      sheets: Object.keys(src.sheets).length,
      items: Object.entries(src.sheets).map(([name, sheet]) => ({
        sheetName: name, itemCount: sheet.itemCount,
        sampleItems: sheet.sample
      }))
    };
  });

  // PDF sources  
  if (results.sharqiya) {
    megaTraining.sources.sharqiya_tender = {
      type: 'government_environmental', scope: 'construction', location: 'dammam',
      itemCount: results.sharqiya.items.length,
      items: results.sharqiya.items
    };
  }
  if (results.madinah) {
    megaTraining.sources.madinah_tender = {
      type: 'government_environmental', scope: 'construction', location: 'madinah',
      itemCount: results.madinah.items.length,
      items: results.madinah.items
    };
  }

  // Calculate totals
  megaTraining.totalSources = Object.keys(megaTraining.sources).length;
  megaTraining.totalItems = Object.values(megaTraining.sources).reduce((sum, s) => {
    return sum + (s.itemCount || (Array.isArray(s.items) ? s.items.length : 0));
  }, 0);

  fs.writeFileSync(path.join(OUT, 'brain_mega_training.json'), JSON.stringify(megaTraining, null, 2), 'utf8');
  
  console.log(`\n✅ ملف التدريب الشامل جاهز!`);
  console.log(`📊 ${megaTraining.totalSources} مصادر | ${megaTraining.totalItems} بند`);
  Object.entries(megaTraining.sources).forEach(([k, v]) => {
    console.log(`  📂 ${k}: ${v.itemCount || v.items?.length || '?'} بند (${v.type})`);
  });
}

main().catch(console.error);
