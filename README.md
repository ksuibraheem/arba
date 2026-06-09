<div align="center">

# 🏗️ ARBA — منصة التسعير الاحترافية
### Professional Construction Pricing Platform

[![Build](https://img.shields.io/badge/build-passing-brightgreen)](.) [![Brain](https://img.shields.io/badge/brain%20accuracy-100%25-blue)](.) [![Tests](https://img.shields.io/badge/tests-71%2F71%20passed-success)](.)

</div>

## 📋 نظرة عامة

منصة **أربا** هي نظام تسعير ذكي للمقاولات والإنشاءات في المملكة العربية السعودية. تستخدم محرك ذكاء اصطناعي لتحليل تكاليف البناء وإنتاج عروض أسعار دقيقة بناءً على وصفات حقيقية لكل بند.

### ✨ المميزات الرئيسية

- 🧠 **دماغ التسعير (Brain v11.3)** — دقة 100% على 41 بند اختبار، يعتمد على وصفات مواد حقيقية + أسعار سوق 2026
- 📊 **محرك BOQ** — استيراد جداول الكميات من Excel/PDF/CSV وتسعيرها تلقائياً
- 🏢 **نظام متعدد المستخدمين** — 8 أدوار (مدير، مهندس كميات، محاسب، HR، مورد، عميل...)
- 🔒 **Zero-Knowledge Architecture** — حتى المشرف لا يستطيع الوصول لبيانات التسعير الخاصة
- 💳 **نظام اشتراكات** — 5 مستويات (مجاني → مبتدئ → احترافي → أعمال → مؤسسي)
- 🌐 **ثنائي اللغة** — عربي/إنجليزي مع دعم RTL كامل
- 📐 **محرر مخططات** — رسم وتعديل المخططات المعمارية داخل المنصة
- 🤖 **تكامل Gemini AI** — تحقق ذكي من الأسعار عبر Google Gemini

## 🚀 التشغيل المحلي

```bash
# تثبيت التبعيات
npm install

# إعداد المتغيرات
cp .env.example .env.local
# أضف مفاتيح Firebase + Gemini + Tap Payments

# تشغيل في وضع التطوير
npm run dev

# بناء للإنتاج
npm run build
```

## 🏗️ بنية المشروع

```
pro-pricing-platform/
├── App.tsx                     # التطبيق الرئيسي + التوجيه
├── components/                 # 55+ مكون React
│   ├── BlueprintEditor.tsx     # محرر المخططات
│   ├── UniversalImporter.tsx   # استيراد BOQ
│   ├── PriceQuote.tsx          # عروض الأسعار PDF
│   ├── ItemTable.tsx           # جدول البنود
│   ├── charts/                 # رسوم بيانية
│   ├── zones/                  # مناطق العمل (A/B)
│   ├── dashboard/              # لوحات التحكم
│   └── connect/                # التواصل الداخلي
├── services/                   # 91 خدمة
│   ├── itemCostAnalyzer.ts     # 🧠 الدماغ الرئيسي
│   ├── cognitiveCalculations.ts# حسابات BOQ الهندسية
│   ├── boqEngine.ts            # محرك الكميات
│   └── ...
├── pages/                      # 30+ صفحة
│   ├── admin/                  # لوحة الإدارة
│   ├── employees/roles/        # صفحات الأدوار
│   ├── owner/                  # لوحة المالك
│   └── supplier/               # لوحة الموردين
├── src/engines/                # 9 محركات ذكية
├── firebase/                   # Firebase Auth + Config
├── training_data/              # بيانات تدريب (~6MB)
└── tests/                      # اختبارات الدماغ + الاشتراكات
```

## 🧠 محرك التسعير

### كيف يعمل الدماغ؟

1. **يستقبل** وصف البند + الوحدة
2. **يبحث** عن وصفة مطابقة (50+ وصفة مخزنة)
3. **يحسب** تكلفة المواد × أسعار السوق 2026
4. **يضيف** تكاليف العمالة + المعدات + الهدر
5. **يطبّق** Smart Overhead Capping + Smart Profit Capping
6. **يتحقق** من المعقولية عبر Benchmark Map

```typescript
// مثال الاستخدام
const analyzer = new ItemCostAnalyzer();
const result = analyzer.analyze({
  description: 'توريد وصب خرسانة مسلحة C30',
  unit: 'م3',
  workScope: 'new',
  profitMargin: 0.15
});
// result.sellingPrice → ~1,244 ريال/م3
```

## 🔒 الأمان

- **Firestore Rules**: Owner-based access control لكل المجموعات
- **Immutable Audit Trails**: سجلات لا تُعدّل ولا تُحذف
- **Budget Guardian**: حماية من إساءة استخدام AI API
- **Default Deny**: أي مجموعة غير معرّفة = محظورة

## 🧪 الاختبارات

```bash
# اختبار دقة الدماغ (41 بند)
npx tsx tests/brain-accuracy-test.ts

# اختبار الاشتراكات (30 اختبار)
npx tsx tests/subscription.test.ts

# اختبار الميزات (40+ assertion)
npx tsx tests/brain-v85.test.ts
```

## 📦 التقنيات

| التقنية | الاستخدام |
|---------|-----------|
| React + TypeScript | الواجهة الأمامية |
| Vite | أداة البناء |
| Firebase | Auth + Firestore + Hosting |
| Tailwind CSS | التنسيق |
| Google Gemini | تحقق ذكي من الأسعار |
| Tap Payments | بوابة الدفع (السعودية) |
| html2canvas + jsPDF | تصدير PDF |

## 🚀 النشر

```bash
# بناء + نشر على Firebase
npm run build
firebase deploy --only hosting
```

---

<div align="center">
  <b>صُنع بـ ❤️ في المملكة العربية السعودية</b><br>
  <sub>© 2026 ARBA Systems</sub>
</div>
