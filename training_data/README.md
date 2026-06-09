# 🧠 ملفات التدريب (Training Data)

هذا المجلد يحتوي على جميع بيانات التدريب الخاصة بنظام أربا الذكي.

## 📂 الهيكل

### 📁 `trained/` - ملفات تم التدريب عليها ✅
ملفات JSON تم استخدامها فعلياً في تدريب النظام:

| الملف | الوصف |
|-------|-------|
| `brain_mega_training.json` | ملف التدريب الضخم (496 KB) |
| `brain_adf_arar.json` | تدريب صندوق التنمية الزراعية عرعر |
| `brain_baseline_farm.json` | تدريب مزرعة أساسية |
| `brain_school_maintenance.json` | تدريب صيانة مدارس |
| `brain_str_package_25970.json` | تدريب حزمة إنشائية |
| `extracted_all_excel.json` | بيانات مستخرجة من إكسل (1.5 MB) |
| `extracted_pdf_boqs.json` | BOQ مستخرج من PDF |
| `re_farm_mep_audit.json` | مراجعة MEP مزرعة |

### 📁 `pending/` - ملفات لم يتم التدريب عليها بعد ⏳
ملفات مستخرجة وجاهزة للتدريب:

#### مستخرجات الاشتراطات البلدية
| الملف | الوصف |
|-------|-------|
| `residential_requirements.txt` | اشتراطات المباني السكنية |
| `private_educational_buildings.txt` | اشتراطات المباني التعليمية الخاصة |
| `healthcare_requirements.txt` | اشتراطات المنشآت الصحية |
| `bakeries_sweets_requirements.txt` | اشتراطات المخابز والحلويات |
| `commercial_products_labs.txt` | اشتراطات مختبرات المنتجات التجارية |
| `equipment_testing_labs.txt` | اشتراطات مختبرات اختبار المعدات |
| `general_materials_labs.txt` | اشتراطات مختبرات المواد العامة |
| `aviation_schools.txt` | اشتراطات مدارس الطيران |
| `telecom_towers.txt` | اشتراطات أبراج الاتصالات |
| `ev_charging.txt` | اشتراطات محطات شحن السيارات الكهربائية |
| `commercial_shops_allowance.txt` | اشتراطات المحلات التجارية |

#### مستخرجات BOQ وملفات PDF
| الملف | الوصف |
|-------|-------|
| `extracted_boq.json` | BOQ مستخرج |
| `extracted_boq_v2.json` | BOQ مستخرج v2 |
| `extracted_raw_full_pdf.txt` | نص PDF كامل مستخرج (1.5 MB) |
| `extracted_jeddah_heights.txt` | مستخرج جدة هايتس |
| `str_package_raw_text.txt` | نص حزمة إنشائية خام |
| `sbc_guide_text.txt` | دليل كود البناء السعودي (626 KB) |

#### ملفات التدريب الجاهزة
| الملف | الوصف |
|-------|-------|
| `brain_training_feed.json` | تغذية تدريب الذكاء |
| `brain_v11_feed.json` | تغذية تدريب v11 |
| `extraction_mapping.txt` | خريطة الاستخراج |
| `boq_v2_all.txt` | جميع بنود BOQ v2 |

#### 📁 `book_extract/` - مستخرجات الكتب
نصوص مستخرجة من كتب مرجعية في التسعير والبناء.
