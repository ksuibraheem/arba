# Spec — نموذج بيانات المحاسبة المستهدف (الخطوة 1: إكمال البيانات)

مرجع نبني منه لاحقاً. تحليل فقط — لم يُعدَّل كود.
الأولوية: **[الآن]** = ضروري لمحاسبة كاملة وصحيحة · **[Z2]** = حقل لـ ZATCA المرحلة 2 (يُضاف للـschema الآن لتفادي ترحيل لاحق، يُملأ عند بناء المرحلة 2).

## قرارات أساسية (تمنع تكرار العمل)
1. **ملف البائع:** أعِد استخدام مجموعة `company_settings` الموجودة (فيها name/nameEn/vat/cr/address/phone/email/logo/website عبر `CompanySettings.tsx`). اربط `taxInvoiceService` بها واحذف الثابت `COMPANY_INFO`. **لا تنشئ مجموعة بائع جديدة.**
2. **نسبة الضريبة:** انقلها من ثابت 15 إلى مستند إعدادات `tax_settings` (rate افتراضي 15 + فئات S/Z/E/O + أسباب الإعفاء). أضِف `taxRate` لكل بند.
3. **نوع عنوان موحّد `Address`:** `{ buildingNo, street, district, city, postalCode, countryCode }` — يُستخدم للبائع (من company_settings) والمشتري (accounting_clients). صيغة ZATCA.
4. **كيانان صغيران جديدان:** `tax_settings` (مستند واحد)، و`fiscal_periods` (`fiscalYearId`, `accountingPeriodId`, `isClosed`).
5. **اتساق التدقيق:** `updatedAt` + `updatedBy` على **كل** الكيانات.

## الإضافات لكل كيان

**invoices**
- [الآن] `currency` (افتراضي SAR), `updatedAt`, `updatedBy`, `fiscalYearId`/`accountingPeriodId`, `relatedProjectId` (ربط بالمشروع/job costing)، `buyerVatNumber`, `buyerCrNumber`, `buyerAddress: Address`.
- [Z2] `invoiceTypeCode` (388/381/383), `supplyDate`, `paymentMeansCode`, `prepaidAmount`, `exchangeRate`.

**invoice line items (InvoiceItem)**
- [الآن] `taxRate` (نسبة البند), `taxCategory: 'S'|'Z'|'E'|'O'`.
- [Z2] `taxExemptionReasonCode`, `taxExemptionReasonText`, `lineAllowanceCharge[]`.

**accounting_clients**
- [الآن] `clientCode` (ترميز منظّم مثل CL-10025 بدل UUID), `vatNumber`, `crNumber`, `address: Address`, `createdBy`, `updatedBy`.

**ledger_entries**
- [الآن] `relatedProjectId`, `fiscalYearId`, `accountingPeriodId`, `currency`, `updatedAt`, `updatedBy`.
- [Z2] `exchangeRate`.

**journal_entries (+ JournalLine)**
- [الآن] `fiscalYearId`, `accountingPeriodId`, `currency`, `updatedBy`; على السطر: `relatedProjectId`, `taxCategory`, `taxRate`.
- [Z2] `exchangeRate`.

**purchase_invoices**
- [الآن] `supplierVatNumber`, `supplierCrNumber`, `supplierAddress: Address`, `currency`, `relatedProjectId`, `updatedBy`.
- [Z2] `invoiceTypeCode`, `supplyDate`, `paymentMeansCode`, `prepaidAmount`, `exchangeRate`.

**supplier_payments**
- [الآن] `currency`, `updatedAt`, `updatedBy`.
- [Z2] `paymentMeansCode`, `exchangeRate`.

**chart_of_accounts / invoice_versions / invoice_edit_requests**
- [الآن] `updatedAt`, `updatedBy` (اتساق). البنية الأساسية مكتملة.

**company_settings (البائع) — موجود، يُكمَّل**
- [الآن] تأكّد من: `vatNumber`, `crNumber`, `address: Address` (منظّم لا نص واحد), `logo`. (موجود نصياً — يُهيكَل العنوان).

**tax_settings (جديد)**
- [الآن] `vatRate` (15), `categories[]`, `exemptionReasons[]`.

**fiscal_periods (جديد)**
- [الآن] `fiscalYearId`, `periods[]` (id, from, to, isClosed).

## ملاحظات تحقّق (للخطوة 2)
- العنوان حالياً نص واحد في company_settings → يُهيكَل إلى `Address`.
- `clientCode` يحتاج مولّد تسلسلي (مثل المخطط INV-YYYY-XXXXX الموجود).
- تأكّد أن إضافة الحقول لا تكسر الحسابات/التقارير الحالية (اختبار بعد التطبيق).

---
**حالة الخطوة 1:** الخريطة المستهدفة مقفلة. التالي = الخطوة 2 (التأكد أن البيانات الموجودة فعلاً مترابطة/جاهزة) قبل إضافة الحقول، ثم الربط.
