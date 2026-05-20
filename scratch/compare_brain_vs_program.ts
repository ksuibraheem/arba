/**
 * مقارنة شاملة: وصفات الدماغ vs بيانات البرنامج
 * يستخرج كل بند بكامل تفاصيله (مورد، سعر، وحدة) ويقارن المصادر
 */
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('xlsx');
import * as path from 'path';

const store: any = {};
(global as any).localStorage = {
  getItem: (k: string) => store[k] || null,
  setItem: (k: string, v: string) => { store[k] = v; },
  removeItem: (k: string) => { delete store[k]; },
  clear: () => { Object.keys(store).forEach(k => delete store[k]); }
};

import { firestoreDataService } from '../services/firestoreDataService';
firestoreDataService.batchWrite = async () => ({ success: true, data: 0 });
firestoreDataService.getCollection = async () => [];

import { MATERIAL_PRICES } from '../data/marketPricesToday';
import { itemCostAnalyzer } from '../services/itemCostAnalyzer';

async function compare() {
  console.log('🔍 بدء المقارنة الشاملة...\n');

  // ═══════════════════════════════════════════
  // 1. استخراج وصفات الدماغ (ITEM_RECIPES)
  // ═══════════════════════════════════════════
  // نستخرجها عبر تحليل بنود معروفة
  const recipeKeys = [
    'خرسانة مسلحة', 'خرسانة عادية', 'بلوك 20', 'طوب مصمت', 'لياسة',
    'دهان بلاستيك', 'سيراميك', 'بورسلان', 'رخام', 'بلاط انترلوك',
    'بلاط تيرازو', 'شبابيك الومنيوم', 'وحدة إنارة led', 'مخرج قوى',
    'مفتاح إنارة', 'حفر', 'ردم', 'عزل مائي', 'عزل حراري',
    'مظلة', 'باب خشب', 'باب حديد', 'درابزين حديد', 'تكييف سبليت',
    'لوحة توزيع', 'كابل نحاس', 'دهان زيتي', 'بويا جدران', 'جبس بورد',
    'مرحاض عربي', 'مرحاض افرنجى', 'كابينة اطفاء', 'طفايه حريق',
    'محبس برونز', 'مروحة سحب', 'غطاء غرفة', 'براد مياه', 'جرجور',
    'hdpe', 'مواسير حديد مجلفن', 'مواسير ppr', 'u.p.v.c', 'upvc',
    'حديد مجلفن', 'مخرج بيانات', 'طوب المصمت', 'قاطع خارجي',
    'معجون', 'درج رخام', 'جلسات خارجية', 'مظلات حديد',
    'بلاط خرساني', 'كابل أرضي', 'مصعد',
  ];

  const brainRecipes: any[] = [];
  for (const key of recipeKeys) {
    const result = itemCostAnalyzer.analyze(`توريد وتركيب ${key}`, 'م2', 0.15, 'riyadh');
    if (result.materials.length > 0 && result.materials[0].name !== 'مواد (تقدير)') {
      brainRecipes.push({
        recipeName: key,
        category: result.category,
        materialsCount: result.materials.length,
        laborCount: result.labor.length,
        materials: result.materials,
        labor: result.labor,
        equipmentCost: result.equipmentCost,
        wasteFactor: result.wasteFactor,
        totalCost: result.totalCost,
        sellingPrice: result.sellingPrice,
      });
    }
  }
  console.log(`📦 وصفات الدماغ (ITEM_RECIPES): ${brainRecipes.length} وصفة\n`);

  // ═══════════════════════════════════════════
  // 2. بيانات أسعار السوق (marketPricesToday)
  // ═══════════════════════════════════════════
  console.log(`📊 أسعار السوق (marketPricesToday): ${MATERIAL_PRICES.length} مادة\n`);

  // ═══════════════════════════════════════════
  // 3. بناء جدول المقارنة التفصيلي
  // ═══════════════════════════════════════════
  const wb = XLSX.utils.book_new();

  // شيت 1: وصفات الدماغ بكامل التفاصيل
  const recipeRows: any[][] = [
    ['📦 وصفات الدماغ (Brain Recipes) — التفصيل الكامل'],
    [''],
    ['الوصفة', 'التصنيف', 'اسم المادة', 'الكمية/وحدة', 'وحدة المادة', 'سعر الوحدة', 'المصدر', 'الإجمالي', 'الحرفة', 'الساعات', 'سعر الساعة', 'تكلفة العمالة', 'المعدات', 'الهدر%', 'تكلفة الوحدة', 'سعر البيع'],
  ];

  for (const recipe of brainRecipes) {
    const maxRows = Math.max(recipe.materials.length, recipe.labor.length, 1);
    for (let i = 0; i < maxRows; i++) {
      const mat = recipe.materials[i];
      const lab = recipe.labor[i];
      recipeRows.push([
        i === 0 ? recipe.recipeName : '',
        i === 0 ? recipe.category : '',
        mat?.name || '',
        mat?.qty || '',
        mat?.unit || '',
        mat?.unitPrice || '',
        mat?.source || '',
        mat?.total || '',
        lab?.trade || '',
        lab?.hours || '',
        lab?.ratePerHour || '',
        lab?.total || '',
        i === 0 ? recipe.equipmentCost : '',
        i === 0 ? (recipe.wasteFactor * 100).toFixed(1) + '%' : '',
        i === 0 ? recipe.totalCost : '',
        i === 0 ? recipe.sellingPrice : '',
      ]);
    }
    recipeRows.push([]); // سطر فاصل
  }

  const ws1 = XLSX.utils.aoa_to_sheet(recipeRows);
  ws1['!cols'] = [
    { wch: 22 }, { wch: 14 }, { wch: 28 }, { wch: 8 }, { wch: 8 },
    { wch: 10 }, { wch: 14 }, { wch: 10 }, { wch: 12 }, { wch: 6 },
    { wch: 8 }, { wch: 10 }, { wch: 8 }, { wch: 6 }, { wch: 10 }, { wch: 10 },
  ];
  XLSX.utils.book_append_sheet(wb, ws1, 'وصفات الدماغ');

  // شيت 2: أسعار السوق الكاملة
  const marketRows: any[][] = [
    ['📊 أسعار السوق اليومية (marketPricesToday) — التفصيل الكامل'],
    [''],
    ['الكود', 'الاسم (عربي)', 'الاسم (إنجليزي)', 'الوحدة', 'السعر', 'التصنيف', 'الماركة', 'آخر تحديث'],
  ];

  for (const mat of MATERIAL_PRICES) {
    marketRows.push([
      mat.id, mat.nameAr, mat.nameEn, mat.unit, mat.price, mat.category, mat.brand || '-', mat.lastUpdated,
    ]);
  }

  const ws2 = XLSX.utils.aoa_to_sheet(marketRows);
  ws2['!cols'] = [
    { wch: 20 }, { wch: 30 }, { wch: 28 }, { wch: 8 }, { wch: 8 },
    { wch: 14 }, { wch: 16 }, { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(wb, ws2, 'أسعار السوق');

  // شيت 3: المقارنة — مواد الوصفات vs أسعار السوق
  const compareRows: any[][] = [
    ['🔗 المقارنة: مواد الوصفات مقابل أسعار السوق'],
    [''],
    ['المادة في الوصفة', 'سعر الوصفة', 'المصدر', 'أقرب مادة في السوق', 'سعر السوق', 'الوحدة', 'الفرق%', 'الحالة'],
  ];

  const allBrainMaterials = new Map<string, { price: number; source: string }>();
  for (const recipe of brainRecipes) {
    for (const mat of recipe.materials) {
      if (!allBrainMaterials.has(mat.name)) {
        allBrainMaterials.set(mat.name, { price: mat.unitPrice, source: mat.source });
      }
    }
  }

  for (const [matName, brainData] of allBrainMaterials) {
    const marketMatch = MATERIAL_PRICES.find(m =>
      matName.includes(m.nameAr) || m.nameAr.includes(matName) ||
      matName.toLowerCase().includes(m.nameEn.toLowerCase())
    );

    if (marketMatch) {
      const diff = Math.round(((brainData.price - marketMatch.price) / marketMatch.price) * 100);
      compareRows.push([
        matName, brainData.price, brainData.source,
        marketMatch.nameAr, marketMatch.price, marketMatch.unit,
        diff + '%',
        Math.abs(diff) < 15 ? '✅ متطابق' : Math.abs(diff) < 40 ? '⚠️ فرق طفيف' : '❌ فرق كبير',
      ]);
    } else {
      compareRows.push([
        matName, brainData.price, brainData.source,
        '— لا يوجد —', '-', '-', '-', '🔍 غير موجود في السوق',
      ]);
    }
  }

  const ws3 = XLSX.utils.aoa_to_sheet(compareRows);
  ws3['!cols'] = [
    { wch: 28 }, { wch: 10 }, { wch: 16 }, { wch: 28 }, { wch: 10 },
    { wch: 8 }, { wch: 8 }, { wch: 18 },
  ];
  XLSX.utils.book_append_sheet(wb, ws3, 'المقارنة');

  // شيت 4: مواد السوق غير المستخدمة في الوصفات
  const unusedRows: any[][] = [
    ['⚠️ مواد موجودة في أسعار السوق ولكن غير مستخدمة في أي وصفة'],
    [''],
    ['الكود', 'الاسم', 'الوحدة', 'السعر', 'التصنيف', 'التوصية'],
  ];

  const brainMatNames = [...allBrainMaterials.keys()].map(n => n.toLowerCase());
  for (const mat of MATERIAL_PRICES) {
    const isUsed = brainMatNames.some(n =>
      n.includes(mat.nameAr.toLowerCase()) || mat.nameAr.toLowerCase().includes(n) ||
      n.includes(mat.nameEn.toLowerCase())
    );
    if (!isUsed) {
      unusedRows.push([
        mat.id, mat.nameAr, mat.unit, mat.price, mat.category,
        'يمكن ربطها بوصفة جديدة أو إضافتها كمادة بديلة',
      ]);
    }
  }

  const ws4 = XLSX.utils.aoa_to_sheet(unusedRows);
  ws4['!cols'] = [{ wch: 20 }, { wch: 30 }, { wch: 8 }, { wch: 8 }, { wch: 14 }, { wch: 40 }];
  XLSX.utils.book_append_sheet(wb, ws4, 'مواد غير مستخدمة');

  // إحصائيات
  const matched = [...allBrainMaterials.keys()].filter(matName =>
    MATERIAL_PRICES.some(m => matName.includes(m.nameAr) || m.nameAr.includes(matName))
  ).length;
  const unmatched = allBrainMaterials.size - matched;
  const unusedMarket = unusedRows.length - 3;

  console.log('═'.repeat(55));
  console.log('📊 نتائج المقارنة الشاملة');
  console.log('═'.repeat(55));
  console.log(`   🧠 وصفات الدماغ: ${brainRecipes.length} وصفة`);
  console.log(`   🧱 مواد فريدة في الوصفات: ${allBrainMaterials.size} مادة`);
  console.log(`   📊 مواد في أسعار السوق: ${MATERIAL_PRICES.length} مادة`);
  console.log(`   ✅ مواد متطابقة (وصفة ↔ سوق): ${matched}`);
  console.log(`   🔍 مواد في الوصفات بدون مقابل في السوق: ${unmatched}`);
  console.log(`   ⚠️ مواد في السوق غير مستخدمة في أي وصفة: ${unusedMarket}`);
  console.log('═'.repeat(55));

  const outPath = path.join(process.cwd(), 'scratch', 'brain_vs_program_comparison.xlsx');
  XLSX.writeFile(wb, outPath);
  console.log(`\n✅ تم حفظ ملف المقارنة الشاملة: ${path.basename(outPath)}`);

  process.exit(0);
}

compare().catch(e => { console.error(e); process.exit(1); });
