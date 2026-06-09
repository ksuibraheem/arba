const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

const PDF_PATH = path.join(__dirname, '..', '..', 'جداول لتسعير (نماذج)',
  'STR PACKAGE 25970 (29.04.2026)', 'PDF', 'S-001,S-002,S-003 - GENERAL NOTES.pdf');
const OUT = path.join(__dirname, '..', 'data', 'training');

async function main() {
  console.log('📄 استخراج STR PACKAGE 25970...\n');
  
  const buf = fs.readFileSync(PDF_PATH);
  const p = new PDFParse({ data: buf });
  const result = await p.getText();
  const pages = result.pages || [];
  
  console.log(`📊 ${pages.length} صفحات\n`);
  
  // Collect all text
  let fullText = '';
  const structuralData = {
    source: 'STR PACKAGE 25970 (29.04.2026)',
    type: 'structural_package',
    scope: 'structural_design',
    extractedAt: new Date().toISOString(),
    pages: pages.length,
    drawings: [
      'S-001,S-002,S-003 - GENERAL NOTES',
      'S-101 to S-105 - COLUMN PLANS',
      'S-106 - FOUNDATION FLOOR PLAN',
      'S-107 - GROUND FLOOR PLAN',
      'S-108 - FIRST FLOOR PLAN',
      'S-109 - SECOND FLOOR PLAN',
      'S-110 - ROOF FLOOR PLAN',
      'S-111 - UPPER ROOF FLOOR PLAN',
      'S-201 - COLUMNS SCHEDULE',
      'S-202, S-203 - SCHEDULES',
      'S-301-302 - SECTIONS'
    ],
    floors: ['Foundation', 'Ground', 'First', 'Second', 'Roof', 'Upper Roof'],
    generalNotes: [],
    concreteSpecs: [],
    steelSpecs: [],
    dimensions: [],
    numbers: [],
    rawSections: []
  };

  pages.forEach((page, pi) => {
    const text = page.text || '';
    fullText += text + '\n';
    
    const lines = text.split('\n').filter(l => l.trim().length > 3);
    
    lines.forEach(line => {
      const l = line.trim();
      
      // Concrete specs
      if (/f['\u2019]?c|MPa|N\/mm|concrete|grade|C\d{2}/i.test(l)) {
        structuralData.concreteSpecs.push(l.substring(0, 200));
      }
      
      // Steel/rebar specs
      if (/rebar|steel|fy|grade\s*60|ASTM|ø|dia|Ф|stirrup/i.test(l)) {
        structuralData.steelSpecs.push(l.substring(0, 200));
      }
      
      // Dimensions and measurements
      if (/\d+\s*[xX×]\s*\d+|\d+\s*mm|\d+\s*cm/i.test(l)) {
        structuralData.dimensions.push(l.substring(0, 200));
      }
      
      // General structural notes
      if (/cover|clear|lap|splice|hook|anchor|development|bond|spacing|SBC/i.test(l)) {
        structuralData.generalNotes.push(l.substring(0, 200));
      }
      
      // Extract numbers (measurements, loads, etc)
      const nums = l.match(/[\d.]+/g);
      if (nums && nums.length >= 2 && l.length > 10) {
        structuralData.numbers.push({ text: l.substring(0, 150), nums: nums.slice(0, 8) });
      }
    });
    
    // Store raw section
    if (text.trim().length > 50) {
      structuralData.rawSections.push({
        page: pi + 1,
        textLength: text.length,
        preview: text.substring(0, 500)
      });
    }
  });

  // Print findings
  console.log(`📐 مواصفات الخرسانة: ${structuralData.concreteSpecs.length} بند`);
  structuralData.concreteSpecs.slice(0, 10).forEach(s => console.log(`   ${s}`));
  
  console.log(`\n🔩 مواصفات الحديد: ${structuralData.steelSpecs.length} بند`);
  structuralData.steelSpecs.slice(0, 10).forEach(s => console.log(`   ${s}`));
  
  console.log(`\n📏 أبعاد: ${structuralData.dimensions.length} بند`);
  structuralData.dimensions.slice(0, 10).forEach(s => console.log(`   ${s}`));
  
  console.log(`\n📝 ملاحظات إنشائية: ${structuralData.generalNotes.length} بند`);
  structuralData.generalNotes.slice(0, 10).forEach(s => console.log(`   ${s}`));

  console.log(`\n🔢 بيانات رقمية: ${structuralData.numbers.length}`);

  // Save extracted data
  fs.writeFileSync(
    path.join(OUT, 'brain_str_package_25970.json'),
    JSON.stringify(structuralData, null, 2), 'utf8'
  );
  
  // Also save raw text for reference
  fs.writeFileSync(
    path.join(OUT, 'str_package_raw_text.txt'),
    fullText, 'utf8'
  );

  console.log(`\n✅ تم الحفظ في brain_str_package_25970.json`);
  console.log(`📄 النص الكامل: str_package_raw_text.txt (${fullText.length} حرف)`);
  
  // Now update mega training
  console.log('\n🧠 تحديث ملف التدريب الشامل...');
  const megaPath = path.join(OUT, 'brain_mega_training.json');
  const mega = JSON.parse(fs.readFileSync(megaPath, 'utf8'));
  
  mega.sources.str_package_25970 = {
    type: 'structural_package',
    scope: 'structural_design',
    location: 'saudi',
    floors: structuralData.floors.length,
    drawings: structuralData.drawings.length,
    itemCount: structuralData.concreteSpecs.length + structuralData.steelSpecs.length + structuralData.dimensions.length + structuralData.generalNotes.length,
    concreteSpecs: structuralData.concreteSpecs,
    steelSpecs: structuralData.steelSpecs,
    generalNotes: structuralData.generalNotes,
    dimensions: structuralData.dimensions.slice(0, 50)
  };
  
  mega.totalSources = Object.keys(mega.sources).length;
  mega.totalItems = Object.values(mega.sources).reduce((s, v) => 
    s + (v.itemCount || (Array.isArray(v.items) ? v.items.length : 0)), 0);
  
  fs.writeFileSync(megaPath, JSON.stringify(mega, null, 2), 'utf8');
  console.log(`✅ الدماغ الآن: ${mega.totalSources} مصادر | ${mega.totalItems} بند`);
}

main().catch(e => console.error('❌', e.message));
