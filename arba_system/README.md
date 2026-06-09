# ⚙️ arba_system/ — محركات وأدوات نظام أربا

> ARBA V11.3 | آخر تنظيم: 31 مايو 2026

## الهيكل

```
📂 arba_system/
├── 📁 pricing/      💰 محركات التسعير (13 سكربت)
├── 📁 audit/        🔍 أدوات التدقيق والتحليل (11 سكربت)
├── 📁 extraction/   📥 أدوات الاستخراج والتحميل (9 سكربتات)
├── 📁 export/       📤 أدوات التصدير وبناء Excel (10 سكربتات)
├── 📁 testing/      🧪 اختبارات الأداء والصحة (7 سكربتات)
├── 📁 _archive/     🗄️ ملفات قديمة محفوظة
└── 📄 (8 ملفات)     🏗️ المحركات الأساسية
```

## المحركات الأساسية (الجذر)

| الملف | الوصف |
|-------|-------|
| `arba_orchestrator.cjs` | 🎯 المنسق الرئيسي — يدير كل العمليات |
| `arba_v2_engine.js` | محرك التسعير v2 |
| `classification_rules.cjs` | قواعد تصنيف البنود (51 KB) |
| `sanitizer_engine.cjs` | محرك تنظيف البيانات |
| `rebuild_mega_training.cjs` | 🧠 إعادة بناء mega training |
| `merge_full_desc.cjs` | دمج الأوصاف الكاملة |
| `fix_adf.cjs` | إصلاحات ADF |
| `README.md` | هذا الملف |

## 💰 pricing/ — محركات التسعير

| الملف | المشروع |
|-------|---------|
| `price_farm_*.cjs` (3) | تسعير مشروع المزرعة |
| `price_tarif_*.cjs` (4) | تسعير مشاريع التعريفة |
| `price_tender_tbc.cjs` | تسعير مناقصة TBC |
| `jeddah_villas_*.cjs` (2) | تسعير فلل جدة |
| `asymmetric_pricer.cjs` | تسعير غير متماثل |
| `reprice_v3.cjs` | إعادة تسعير v3 |
| `replace_db.cjs` | استبدال قاعدة البيانات |

## 🔍 audit/ — أدوات التدقيق

| الملف | الوظيفة |
|-------|---------|
| `brain_self_audit.ts` | تدقيق ذاتي للدماغ |
| `compare_brain_vs_program.ts` | مقارنة الدماغ مع البرنامج |
| `audit_adf.cjs` | تدقيق مشروع ADF |
| `audit_farm.cjs` | تدقيق مشروع المزرعة |
| `diagnosis_v2_vs_v4.cjs` | تشخيص الفروقات |

## 📥 extraction/ — أدوات الاستخراج

| الملف | الوظيفة |
|-------|---------|
| `ingest_all_projects.cjs` | ⭐ استخراج BOQ من كل المشاريع |
| `extract_pdfs.cjs` | استخراج من PDF |
| `extract_str_package.cjs` | استخراج الحزمة الإنشائية |
| `data_sync.cjs` | مزامنة البيانات |

## 📤 export/ — أدوات التصدير

| الملف | الوظيفة |
|-------|---------|
| `generate_excel_pricing.cjs` | تصدير تسعير Excel |
| `generate_audit_excel.cjs` | تصدير تقرير تدقيق |
| `format_arba.cjs` | تنسيق مخرجات أربا |

## 🧪 testing/ — الاختبارات

| الملف | الوظيفة |
|-------|---------|
| `run_real_pricing.ts` | اختبار تسعير حقيقي |
| `run_brain_tender.ts` | اختبار مناقصة بالدماغ |
| `pricing_test.ts` | اختبار دقة التسعير |
| `stress_test.ts` | اختبار الضغط |
