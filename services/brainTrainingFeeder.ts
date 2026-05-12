/**
 * 🧠 ARBA Brain — Training Data Feeder
 * يحول بيانات BOQ المراجَعة إلى تنسيق يفهمه learningFeedbackService
 * 
 * البنية: مشروع → فئات → بنود → أسعار مرجعية
 */

import { learningFeedbackService } from './learningFeedbackService';
import * as fs from 'fs';
import * as path from 'path';

// =================== TYPE DEFINITIONS ===================
export interface TrainingProject {
  projectName: string;
  projectType: string;      // residential_farm, tower, mall, etc.
  bua_m2: number;
  location: string;
  year: number;
  items: TrainingItem[];
}

export interface TrainingItem {
  no: string;
  desc: string;
  unit: string;
  qty: number;
  boqPrice: number;        // سعر الوحدة من BOQ
  marketAvg: number;       // متوسط السوق
  status: string;          // 🟢 متوازن / 🟠 أعلى / etc.
  category?: string;       // تصنيف آربا
  arbaItemId?: string;     // ربط بقاعدة بيانات آربا
}

// =================== CATEGORY MAPPING ===================
const DESC_TO_ARBA_CATEGORY: Record<string, { category: string; arbaId: string }> = {
  // ─── English MEP Keywords (original) ───
  'MDB': { category: 'mep_elec', arbaId: '19.01' },
  'SMDB': { category: 'mep_elec', arbaId: '09.08' },
  'DP ': { category: 'mep_elec', arbaId: '09.09' },
  'switch': { category: 'mep_elec', arbaId: '09.03' },
  'socket': { category: 'mep_elec', arbaId: '09.04' },
  'TYPE-L': { category: 'mep_elec', arbaId: '09.05' },
  'LED STRIP': { category: 'mep_elec', arbaId: '09.05' },
  'Cable Tray': { category: 'mep_elec', arbaId: '09.15' },
  'mm Thickness': { category: 'mep_elec', arbaId: '09.15' },
  'FACP': { category: 'fire', arbaId: '15.07' },
  'detector': { category: 'fire', arbaId: '15.01' },
  'sounder': { category: 'fire', arbaId: '15.01' },
  'camera': { category: 'elv', arbaId: '18.03' },
  'camara': { category: 'elv', arbaId: '18.03' },
  'NVR': { category: 'elv', arbaId: '18.03' },
  'speaker': { category: 'elv', arbaId: '18.06' },
  'Public address': { category: 'elv', arbaId: '18.06' },
  'RJ 45': { category: 'elv', arbaId: '18.01' },
  'Fiber': { category: 'elv', arbaId: '18.01' },
  'earth': { category: 'mep_elec', arbaId: '09.06' },
  'Lavator': { category: 'mep_plumb', arbaId: '08.07' },
  'Water Closet': { category: 'mep_plumb', arbaId: '08.07' },
  'Sink': { category: 'mep_plumb', arbaId: '08.07' },
  'Shower': { category: 'mep_plumb', arbaId: '08.07' },
  'PPR': { category: 'mep_plumb', arbaId: '08.01' },
  'mm dia': { category: 'mep_plumb', arbaId: '08.01' },
  'Pump': { category: 'mep_plumb', arbaId: '08.03' },
  'AIR DUCT': { category: 'mep_hvac', arbaId: '10.09' },
  'EF-': { category: 'mep_hvac', arbaId: '10.01' },
  'FAF-': { category: 'mep_hvac', arbaId: '10.01' },
  'VRV': { category: 'mep_hvac', arbaId: '10.11' },
  'Diffuser': { category: 'mep_hvac', arbaId: '10.10' },
  'SLD': { category: 'mep_hvac', arbaId: '10.10' },
  'RLD': { category: 'mep_hvac', arbaId: '10.10' },

  // ─── Arabic Keywords: أعمال ترابية وحفر ───
  'حفر': { category: 'excavation', arbaId: '01.02' },
  'ردم': { category: 'excavation', arbaId: '02.01' },
  'تسوية': { category: 'excavation', arbaId: '01.01' },
  'تنظيف الموقع': { category: 'excavation', arbaId: '01.01' },
  'إزالة': { category: 'excavation', arbaId: '01.01' },
  'نقل مخلفات': { category: 'excavation', arbaId: '01.06' },
  'ترحيل': { category: 'excavation', arbaId: '01.06' },

  // ─── Arabic Keywords: أعمال خرسانية ───
  'خرسانة': { category: 'substructure', arbaId: '03.01' },
  'خرسانه': { category: 'substructure', arbaId: '03.01' },
  'صبة': { category: 'substructure', arbaId: '03.01' },
  'قواعد': { category: 'substructure', arbaId: '03.02' },
  'ميدة': { category: 'substructure', arbaId: '03.03' },
  'رقاب': { category: 'substructure', arbaId: '03.04' },
  'أعمدة': { category: 'superstructure', arbaId: '04.01' },
  'اعمدة': { category: 'superstructure', arbaId: '04.01' },
  'سقف': { category: 'superstructure', arbaId: '04.03' },
  'بلاطة': { category: 'superstructure', arbaId: '04.03' },
  'كمرة': { category: 'superstructure', arbaId: '04.02' },
  'درج': { category: 'superstructure', arbaId: '04.04' },

  // ─── Arabic Keywords: حديد تسليح ───
  'حديد': { category: 'substructure', arbaId: '03.05' },
  'تسليح': { category: 'substructure', arbaId: '03.05' },
  'شدة': { category: 'substructure', arbaId: '03.06' },
  'شدة خشبية': { category: 'substructure', arbaId: '03.06' },

  // ─── Arabic Keywords: أعمال مباني وبلوك ───
  'بلوك': { category: 'masonry', arbaId: '05.04' },
  'بلك': { category: 'masonry', arbaId: '05.04' },
  'مباني': { category: 'masonry', arbaId: '05.04' },
  'طابوق': { category: 'masonry', arbaId: '05.04' },

  // ─── Arabic Keywords: لياسة ───
  'لياسة': { category: 'masonry', arbaId: '07.01' },
  'لياسه': { category: 'masonry', arbaId: '07.01' },
  'طرطشة': { category: 'masonry', arbaId: '07.01' },

  // ─── Arabic Keywords: بلاط وأرضيات ───
  'بلاط': { category: 'finishes', arbaId: '11.03' },
  'سيراميك': { category: 'finishes', arbaId: '11.03' },
  'بورسلين': { category: 'finishes', arbaId: '11.03' },
  'رخام': { category: 'finishes', arbaId: '11.04' },
  'جرانيت': { category: 'finishes', arbaId: '11.04' },
  'أرضيات': { category: 'finishes', arbaId: '11.03' },

  // ─── Arabic Keywords: دهانات ───
  'دهان': { category: 'finishes', arbaId: '13.01' },
  'دهانات': { category: 'finishes', arbaId: '13.01' },
  'طلاء': { category: 'finishes', arbaId: '13.01' },
  'جبس': { category: 'finishes', arbaId: '12.01' },
  'جبسم بورد': { category: 'finishes', arbaId: '12.01' },

  // ─── Arabic Keywords: عزل ───
  'عزل': { category: 'insulation', arbaId: '06.01' },
  'عزل مائي': { category: 'waterproofing', arbaId: '06.04' },
  'عزل حراري': { category: 'insulation', arbaId: '06.01' },
  'ميمبرين': { category: 'waterproofing', arbaId: '06.04' },
  'بيتومين': { category: 'waterproofing', arbaId: '06.04' },

  // ─── Arabic Keywords: كهرباء ───
  'كهرباء': { category: 'mep_elec', arbaId: '09.03' },
  'كيبل': { category: 'mep_elec', arbaId: '09.03' },
  'لوحة توزيع': { category: 'mep_elec', arbaId: '09.02' },
  'إنارة': { category: 'mep_elec', arbaId: '09.05' },
  'اناره': { category: 'mep_elec', arbaId: '09.05' },
  'محول': { category: 'mep_elec', arbaId: '09.16' },
  'مولد': { category: 'mep_elec', arbaId: '19.04' },

  // ─── Arabic Keywords: سباكة ───
  'سباكة': { category: 'mep_plumb', arbaId: '08.01' },
  'مواسير': { category: 'mep_plumb', arbaId: '08.01' },
  'صرف': { category: 'mep_plumb', arbaId: '08.02' },
  'بيارة': { category: 'mep_plumb', arbaId: '08.02' },
  'خزان': { category: 'mep_plumb', arbaId: '08.03' },
  'مضخة': { category: 'mep_plumb', arbaId: '08.03' },
  'سخان': { category: 'mep_plumb', arbaId: '08.06' },
  'حنفية': { category: 'mep_plumb', arbaId: '08.07' },
  'مغسلة': { category: 'mep_plumb', arbaId: '08.07' },
  'كرسي افرنجي': { category: 'mep_plumb', arbaId: '08.07' },

  // ─── Arabic Keywords: تكييف ───
  'تكييف': { category: 'mep_hvac', arbaId: '10.01' },
  'سبلت': { category: 'mep_hvac', arbaId: '10.01' },
  'مكيف': { category: 'mep_hvac', arbaId: '10.01' },
  'دكت': { category: 'mep_hvac', arbaId: '10.09' },

  // ─── Arabic Keywords: حريق وسلامة ───
  'حريق': { category: 'fire', arbaId: '15.01' },
  'إنذار': { category: 'fire', arbaId: '15.07' },
  'طفاية': { category: 'fire', arbaId: '15.01' },
  'رشاش': { category: 'fire', arbaId: '15.05' },

  // ─── Arabic Keywords: مظلات وأسوار ───
  'مظلة': { category: 'architecture', arbaId: '16.01' },
  'مظلات': { category: 'architecture', arbaId: '16.01' },
  'سور': { category: 'architecture', arbaId: '16.02' },
  'أسوار': { category: 'architecture', arbaId: '16.02' },
  'بوابة': { category: 'architecture', arbaId: '16.03' },
  'سواتر': { category: 'architecture', arbaId: '16.01' },

  // ─── Arabic Keywords: أبواب ونوافذ ───
  'باب': { category: 'doors_windows', arbaId: '14.02' },
  'أبواب': { category: 'doors_windows', arbaId: '14.02' },
  'نافذة': { category: 'doors_windows', arbaId: '14.01' },
  'شبابيك': { category: 'doors_windows', arbaId: '14.01' },
  'ألمنيوم': { category: 'doors_windows', arbaId: '14.01' },

  // ─── Arabic Keywords: مصاعد ───
  'مصعد': { category: 'mep_elec', arbaId: '17.01' },
  'مصاعد': { category: 'mep_elec', arbaId: '17.01' },

  // ─── Arabic Keywords: تنسيق موقع ───
  'زراعة': { category: 'landscaping', arbaId: '20.01' },
  'تشجير': { category: 'landscaping', arbaId: '20.01' },
  'إنترلوك': { category: 'landscaping', arbaId: '20.02' },
  'ملعب': { category: 'landscaping', arbaId: '20.03' },
  'حديقة': { category: 'landscaping', arbaId: '20.01' },
};

// =================== PROJECT TYPE DETECTION ===================
function detectProjectType(data: any): string {
  const name = (data.project || data.projectName || data.source || '').toLowerCase();
  if (name.includes('school') || name.includes('مدرس')) return 'school';
  if (name.includes('farm') || name.includes('مزرع')) return 'residential_farm';
  if (name.includes('tower') || name.includes('برج')) return 'tower';
  if (name.includes('villa') || name.includes('فيل')) return 'villa';
  if (name.includes('mosque') || name.includes('مسجد')) return 'mosque';
  if (name.includes('hospital') || name.includes('مستشف')) return 'hospital';
  if (name.includes('mall') || name.includes('مول')) return 'mall';
  if (name.includes('بيئ') || name.includes('أمن')) return 'government';
  if (data.projectType) return data.projectType;
  return 'general';
}

// =================== BRAIN FEEDER ===================

/**
 * يقرأ ملف التدريب ويحوله لبنية TrainingProject
 */
export function loadTrainingData(filePath: string): TrainingProject | null {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);
    
    // Map items to include arba categories
    const items: TrainingItem[] = (data.items || []).map((item: any) => {
      let mapped = { category: 'other', arbaId: '' };
      const desc = (item.desc || item.description || '').toString();
      for (const [keyword, cat] of Object.entries(DESC_TO_ARBA_CATEGORY)) {
        if (desc.includes(keyword)) {
          mapped = cat;
          break;
        }
      }
      return {
        ...item,
        category: mapped.category,
        arbaItemId: mapped.arbaId,
      };
    });

    return {
      projectName: data.project || data.projectName || 'Unknown',
      projectType: detectProjectType(data),
      bua_m2: data.bua || data.bua_m2 || 0,
      location: data.location || 'Saudi Arabia',
      year: data.year || 2026,
      items,
    };
  } catch (e) {
    console.error('❌ Error loading training data:', e);
    return null;
  }
}

/**
 * يغذي الدماغ بالبيانات — كل بند يتعلم منه:
 * 1. سعر الوحدة المرجعي لكل فئة
 * 2. الكمية المتوقعة لكل م² مبنى
 * 3. نسبة التوزيع بين الفئات
 */
export function feedBrain(project: TrainingProject): {
  fed: number;
  skipped: number;
  priceBaselines: Record<string, { avg: number; min: number; max: number; samples: number }>;
  qtyPerM2: Record<string, number>;
} {
  const priceBaselines: Record<string, { total: number; min: number; max: number; count: number }> = {};
  const categoryTotals: Record<string, number> = {};
  let fed = 0;
  let skipped = 0;

  for (const item of project.items) {
    if (!item.boqPrice || item.boqPrice <= 0) {
      skipped++;
      continue;
    }

    const catKey = item.arbaItemId || item.category || 'unknown';
    
    // Accumulate price data
    if (!priceBaselines[catKey]) {
      priceBaselines[catKey] = { total: 0, min: Infinity, max: 0, count: 0 };
    }
    priceBaselines[catKey].total += item.boqPrice;
    priceBaselines[catKey].min = Math.min(priceBaselines[catKey].min, item.boqPrice);
    priceBaselines[catKey].max = Math.max(priceBaselines[catKey].max, item.boqPrice);
    priceBaselines[catKey].count++;

    // Accumulate category cost
    const totalCost = item.boqPrice * item.qty;
    categoryTotals[item.category || 'other'] = (categoryTotals[item.category || 'other'] || 0) + totalCost;
    
    // Feed to learning service
    try {
      (learningFeedbackService as any).recordPriceData?.({
        itemId: catKey,
        projectType: project.projectType,
        unitPrice: item.boqPrice,
        qty: item.qty,
        bua: project.bua_m2,
        year: project.year,
      });
    } catch {
      // learningFeedbackService might not have recordPriceData yet
    }

    fed++;
  }

  // Calculate averages
  const avgBaselines: Record<string, { avg: number; min: number; max: number; samples: number }> = {};
  for (const [key, data] of Object.entries(priceBaselines)) {
    avgBaselines[key] = {
      avg: Math.round(data.total / data.count),
      min: data.min === Infinity ? 0 : Math.round(data.min),
      max: Math.round(data.max),
      samples: data.count,
    };
  }

  // Calculate qty per m2 by category
  const qtyPerM2: Record<string, number> = {};
  for (const [cat, total] of Object.entries(categoryTotals)) {
    qtyPerM2[cat] = Math.round((total / project.bua_m2) * 100) / 100;
  }

  return { fed, skipped, priceBaselines: avgBaselines, qtyPerM2 };
}

/**
 * يشغل تغذية الدماغ ويطبع النتائج
 */
export function runTraining(dataPath: string): void {
  console.log('🧠 ARBA Brain — Training Mode');
  console.log('='.repeat(60));
  
  const project = loadTrainingData(dataPath);
  if (!project) {
    console.error('❌ فشل تحميل البيانات');
    return;
  }

  console.log(`📂 المشروع: ${project.projectName}`);
  console.log(`📐 المساحة: ${project.bua_m2.toLocaleString()} م²`);
  console.log(`📦 البنود: ${project.items.length}`);
  console.log('');

  const result = feedBrain(project);

  console.log(`✅ تم تغذية: ${result.fed} بند`);
  console.log(`⏭️ تم تخطي: ${result.skipped} بند (بدون سعر)`);
  console.log('');

  console.log('📊 الأسعار المرجعية المستخلصة:');
  for (const [key, data] of Object.entries(result.priceBaselines)) {
    console.log(`  ${key.padEnd(8)} avg=${data.avg.toLocaleString()} | min=${data.min.toLocaleString()} | max=${data.max.toLocaleString()} | samples=${data.samples}`);
  }

  console.log('\n💰 تكلفة لكل م² حسب الفئة:');
  for (const [cat, costPerM2] of Object.entries(result.qtyPerM2)) {
    console.log(`  ${cat.padEnd(15)} ${costPerM2.toLocaleString()} ر.س/م²`);
  }
}
