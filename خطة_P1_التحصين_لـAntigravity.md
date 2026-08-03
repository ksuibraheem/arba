# P1 — التحصين الأمني (مقسّم على 5 خطوات، أقل توكن)

المرجع: الخريطة النهائية (مقفلة). **لا تُعد التحقق.** كل خطوة = فرع مستقل + اختبار إيموليتر أخضر + سؤال "أدمج؟". نفّذ خطوة واحدة في كل مرة.
**قرار مثبّت:** المحاسبة يستخدمها admin **و** موظف محاسب (دور منفصل) → ادعم الدورين عبر Custom Claims في P1.2.

## قواعد التوكن (لكل خطوة)
لا سرد. سطر واحد لكل مهمة. نتائج الاختبار أرقام فقط. diff واحد لكل ملف. لا إعادة قراءة/طباعة ملفات. استعمل `.jdk/` وحزمة الإيموليتر الجاهزة.

---

### P1.1 — تثبيت الملكية ومنع التزوير (قواعد فقط — أكبر مكسب)
فرع `fix/p1.1-rules-ownership`.
- على **كل** `create/update` في الـ25 مجموعة ذات `if isAuth()`: أضف فحص ملكية/هوية على الحقل المناسب (مثل `request.resource.data.userId == request.auth.uid` للفواتير/القيود/المدفوعات؛ `senderId == auth.uid` للرسائل؛ `employeeId == auth.uid` للحضور؛ ...).
- ثبّت `request.resource.data.ownerId == request.auth.uid` عند إنشاء projects/clients/suppliers/external_suppliers/external_prices.
- احصر `quotes` بأصحاب المشروع (لا أي مهندس).
- أصلح `registration_requests` create (`if true`) — قيّده بأدنى حد منطقي.
**اختبار:** لكل مجموعة معدّلة: مستخدم غير صاحب يُرفض، الصاحب يُقبل. أرقام فقط.

### P1.2 — Custom Claims للأدوار (C7) + استعادة وصول المحاسب
فرع `fix/p1.2-custom-claims`.
- نقل تعيين الأدوار إلى Cloud Function/trigger يضبط custom claims (admin/superadmin/qs_engineer). أزل كتابة العميل لـ `userRoles`.
- مسار الموظف المحاسب: عند نجاح `verifyEmployeeCredentials` اصدر custom token يحمل claim `accountant` (و`manager` عند اللزوم).
- حدّث `getUserRole()`/الدوال المساعدة في القواعد لتقرأ الدور من `request.auth.token` (claim) بدل `get(userRoles)`.
- **حدّث قواعد المجموعات المالية الثلاث:** `isAdmin() || isAccountant()` (استعادة وصول المحاسب الذي أُجّل في P0).
**اختبار:** self-assign دور = مستحيل؛ المحاسب (claim) يقرأ/يكتب المالية؛ مستخدم عادي يُرفض؛ admin يُقبل.

### P1.3 — تأمين الحصة (C3/C4)
فرع `fix/p1.3-quota`.
- انقل زيادة العدّادات وفحص الحدود إلى Cloud Function (`trackUsage`) تقرأ الباقة من الخادم قبل التنفيذ.
- امنع المستخدم من تعديل حقول الحصة في `users` (إما رفض تعديل تلك الحقول في القاعدة، أو انقلها لمستند يكتبه الخادم فقط).
- انقل ميزانية الذكاء (`budgetGuardian`) للخادم — لا اعتماد على localStorage.
**اختبار:** محاولة العميل تصفير/تضخيم الحصة = مرفوضة.

### P1.4 — فحص الدور داخل الدوال Callable (H1)
فرع `fix/p1.4-fn-authz`.
- أضف فحص دور داخل الدوال الثماني التي تتحقق من `request.auth` فقط (المستورد/الأسعار/`createTapCharge`...).
**اختبار:** دور غير مخوّل يُرفض داخل الدالة.

### P1.5 — عزل stateSnapshot عن SuperAdmin (C6)
فرع `fix/p1.5-statesnapshot`.
- انقل `stateSnapshot` من وثيقة المشروع إلى مجموعة فرعية محجوبة عن SuperAdmin (نمط `calculations` مع `!isSuperAdmin()`)، أو شفّره من جهة العميل.
- عدّل `projectService` للقراءة/الكتابة من المكان الجديد. **تحقّق أولاً إن كانت مشاريع الإنتاج تحوي stateSnapshot فعلي → ترحيل لمرة واحدة إن لزم.**
**اختبار:** SuperAdmin يُرفض قراءة snapshot؛ الصاحب/المساعد يُقبل.

---

## ENGLISH MASTER PROMPT (paste once; start P1.1 only)
```
EXECUTE P1 from خطة_P1_التحصين_لـAntigravity.md, 5 sub-steps, one branch each,
emulator-test gate before merge, wait for "go" between steps. Map is LOCKED — no
re-audit. TOKEN RULES: no narration, one line per task, test results = numbers only,
one diff per file, never re-read/print whole files, reuse .jdk/ + emulator harness.

Decision: accounting is used by BOTH admin AND a separate accountant employee — in
P1.2 support both via Custom Claims (admin || accountant) and restore accountant
access to the 3 financial collections.

P1.1 (rules ownership/anti-forgery): on every "if isAuth()" create/update across the
~25 collections add an ownership/identity field check; pin ownerId==auth.uid on
projects/clients/suppliers/external_*; restrict quotes to project stakeholders; fix
registration_requests "if true". Add emulator tests: non-owner DENIED, owner ALLOWED
per collection.

Do P1.1 ONLY now. Report numbers, then ask to merge. For P1.5 check if prod projects
contain real stateSnapshot before any migration.
```
