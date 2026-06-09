import { itemCostAnalyzer } from '../services/itemCostAnalyzer';

async function runStressTest() {
  console.log('🚀 بدء اختبار الضغط المكثف على محرك التسعير...');
  
  let passed = 0;
  let failed = 0;
  let nanErrors = 0;

  const testCases = [
    // حالات طبيعية
    { desc: 'توريد وتركيب خرسانة جاهزة C30', unit: 'م3', location: 'riyadh', expected: 'normal' },
    { desc: 'دهان داخلي جوتن', unit: 'م2', location: 'northern_borders', expected: 'normal' },
    
    // حالات حافة (Edge Cases)
    { desc: 'بند غريب جداً لا يوجد له وصفة', unit: 'مقطوعية', location: 'jeddah', expected: 'fallback' },
    { desc: '', unit: '', location: '', expected: 'empty' },
    { desc: 'خرسانة', unit: 'طن', location: 'unknown_city', expected: 'default_location' },
    { desc: 'ترميم وتكسير بلاط', unit: 'م2', location: undefined, expected: 'renovation_no_loc' },
    { desc: 'حديد تسليح 12مم', unit: 'كجم', location: 'dammam', expected: 'commodity' },
    { desc: 'توريد وتركيب أسمنت مقاوم', unit: 'كيس', location: 'makkah', expected: 'commodity2' },
    
    // إدخالات خبيثة (Malicious/Extreme)
    { desc: '!@#$%^&*()_+', unit: '123', location: '123', expected: 'garbage' },
    { desc: 'خرسانة'.repeat(100), unit: 'م3', location: 'riyadh', expected: 'large_string' },
    { desc: 'حفر', unit: 'م3', location: 'northern_borders', expected: 'missing_recipe_test' }
  ];

  for (let i = 0; i < 1000; i++) { // اختبار 1000 دورة
    const tc = testCases[i % testCases.length];
    
    try {
      const result = itemCostAnalyzer.analyze(tc.desc, tc.unit, 0.15, tc.location);
      
      // فحص الـ NaN
      if (
        isNaN(result.totalCost) || 
        isNaN(result.sellingPrice) || 
        isNaN(result.materials.reduce((acc, m) => acc + m.total, 0))
      ) {
        nanErrors++;
        console.error(`❌ خطأ NaN في: ${tc.desc}`);
      } else {
        passed++;
      }
    } catch (e: any) {
      failed++;
      console.error(`💥 انهيار برمجي (Crash) في: ${tc.desc}`, e.message);
    }
  }

  console.log('============================================');
  console.log(`📊 إجمالي الاختبارات: 1000`);
  console.log(`✅ نجاح: ${passed}`);
  console.log(`❌ فشل (Crash): ${failed}`);
  console.log(`⚠️ أخطاء رياضية (NaN): ${nanErrors}`);
  
  if (failed === 0 && nanErrors === 0) {
    console.log('🏆 النظام اجتاز اختبار الضغط بنجاح تام! لا توجد انهيارات أو أرقام وهمية.');
  } else {
    console.log('⚠️ النظام فشل في اختبار الضغط، راجع الأخطاء.');
  }
}

runStressTest();
