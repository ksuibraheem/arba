# 📂 training_data/pending — بيانات قيد المعالجة

> ARBA V11.3 | آخر تنظيم: 31 مايو 2026

## الهيكل

```
📂 pending/
├── 📁 regulations/    📋 اشتراطات فنية ومعايير SBC (11 ملف)
├── 📁 raw_extracts/   📄 بيانات خام مستخرجة (13 ملف)
├── 📁 reports/        📊 تقارير ومراجع (2 ملف)
├── ingested_projects.json   ⭐ 18 مشروع مستخرج (3.7 MB)
├── unpriced_items.json      ⏳ بنود بدون تسعير (25 KB)
└── README.md
```

## 📋 regulations/ — الاشتراطات الفنية

| الملف | المحتوى | الحجم |
|-------|---------|-------|
| `sbc_guide_text.txt` | كود البناء السعودي (SBC) | 612 KB |
| `residential_requirements.txt` | اشتراطات المباني السكنية | 89 KB |
| `healthcare_requirements.txt` | اشتراطات المنشآت الصحية | 59 KB |
| `bakeries_sweets_requirements.txt` | اشتراطات المخابز والحلويات | 122 KB |
| `private_educational_buildings.txt` | اشتراطات المباني التعليمية | 60 KB |
| `commercial_products_labs.txt` | مختبرات المنتجات التجارية | 48 KB |
| `equipment_testing_labs.txt` | مختبرات فحص المعدات | 48 KB |
| `general_materials_labs.txt` | مختبرات المواد العامة | 47 KB |
| `aviation_schools.txt` | مدارس الطيران | 43 KB |
| `telecom_towers.txt` | أبراج الاتصالات | 33 KB |
| `ev_charging.txt` | شواحن السيارات الكهربائية | 14 KB |

## 📄 raw_extracts/ — بيانات خام

| الملف | الوصف |
|-------|-------|
| `extracted_raw_full_pdf.txt` | نص كامل مستخرج من PDF (1.5 MB) |
| `extracted_jeddah_heights.txt` | مشروع أبراج جدة |
| `str_package_raw_text.txt` | حزمة إنشائية خام |
| `boq_v2_all.txt` | جدول كميات v2 |
| `book_extract/` | مستخرجات كتب (8 ملفات) |
