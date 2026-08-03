# أسئلة الفحص الشامل لـ Antigravity — مقسّمة على 6 أجزاء (تحليل فقط)

**طريقة العمل:** نفّذ جزءاً واحداً في كل مرة، وأرجِع تقريره، ثم انتقل للتالي. التقسيم يضمن عمقاً لكل نقطة بدل تقرير سطحي واحد.
**قواعد ثابتة لكل جزء:** تحليل فقط — لا تعديل كود. جداول مرتّبة بالخطورة، أدلة `file:line`، أرقام لا إنشاء. لا تنتقل لجزء قبل تسليم تقرير الحالي.

---

## الجزء 1 — مراجعة قواعد Firestore الأمنية (الأعمق والأهم)
**النطاق:** `firestore.rules` فقط — كل الـ50 مجموعة، قاعدة بقاعدة.
- لكل مجموعة وفرعية: حلّل `read/create/update/delete` منفصلة → هل فيها فحص ملكية/دور/تحقق حقول؟ صنّف 🔴/🟠/🟡 مع السبب.
- تأكيد محدد: V3 (كل `create/update: if isAuth()` بلا فحص ملكية)، V4 (`projects` create لا يثبّت `ownerId==auth.uid`)، V5 (`stateSnapshot` يقرأه SuperAdmin).
- ابحث عن أنماط خفية: `if true`، استدعاءات `get()` مكلفة/قابلة للالتفاف، قواعد `read` تكشف حقولاً حساسة، تعارض قواعد مكرّرة لنفس المسار.
- **المخرج:** مصفوفة مخاطر كاملة (مجموعة × عملية × فحص؟ × خطورة) + أعلى 10 ثغرات.

```
PART 1 — firestore.rules deep security audit ONLY. No code changes. Evidence as
line numbers. For ALL ~50 collections+subcollections, analyze read/create/update/
delete separately: is there an ownership/role/field check? Rank 🔴/🟠/🟡 with reason.
Confirm: every "create/update: if isAuth()" with no ownership check; projects create
not pinning ownerId==auth.uid; stateSnapshot readable by SuperAdmin. Flag "if true",
costly/bypassable get() lookups, read rules exposing sensitive fields, duplicate
conflicting rules on the same path. Output: full risk matrix + top 10 holes. Report only.
```

## الجزء 2 — الحصص والأدوار والأسرار (تكامل المصادقة)
**النطاق:** `usageTrackingService.ts`, `budgetGuardian.ts`, `rbacService.ts`, `authService.ts`, ملفات `.env*`.
- V1 الحصة: تتبّع **كل** مسار يكتب عدّاداً (الذكاء/التخزين/التوكن) → أين يُخزَّن ومن يفرضه؟ هل المستخدم يقدر يكتبه مباشرة؟ PoC نظري.
- V2 الأدوار: مسار تعيين الدور كامل — هل يُفرض من الخادم أم يكتبه العميل؟ ماذا يخوّل كل دور؟
- المنطق الموثوق من العميل: أي فحص سعر/حصة/صلاحية يتم في المتصفح ويجب أن يكون في Cloud Function.
- الأسرار: مفاتيح خاصة/service-account/توكنات في كود العميل أو الحزمة (`dist/`)؟ (إعداد Firebase العام طبيعي).
- **المخرج:** جدول "العدّاد/الدور/الفحص → مكان التخزين → من يقدر يعدّله → الخطورة".

```
PART 2 — quota/role/secret integrity ONLY. No changes. Files: usageTrackingService.ts,
budgetGuardian.ts, rbacService.ts, authService.ts, .env*. Trace EVERY write path for
usage/quota/token counters: where stored, who enforces, can the user write it directly
(theoretical PoC)? Full role-assignment path: server-enforced or client-written? what
each role grants. List client-side price/quota/permission checks that must move to a
Cloud Function. Scan client code + dist/ for private keys/service-accounts/tokens
(public Firebase config is fine). Output table: counter/role/check -> store -> who can
edit -> severity. Report only.
```

## الجزء 3 — تدقيق Cloud Functions الخلفية
**النطاق:** `functions/src/` + مستدعياتها في العميل.
- لكل دالة `onCall`: من يستدعيها في العميل؟ ما الوسائط؟ وهل تتحقق الدالة نفسها من المصادقة/الصلاحية داخلياً (لا تثق بالعميل)؟
- لكل `onSchedule`/`onRequest`: هل منشورة فعلاً؟ ماذا تفعل؟ صلاحياتها؟
- أكّد `certifyProjectPrice` بلا مستدعٍ؛ وابحث عن دوال أخرى ميتة أو مكشوفة بلا حماية.
- **المخرج:** جدول (الدالة × النوع × المستدعي × فحص داخلي للصلاحية؟ × الحالة).

```
PART 3 — Cloud Functions audit ONLY. No changes. Files: functions/src/ + client callers.
For each onCall: client caller? arguments? does the function itself verify auth/role
internally (not trusting client)? For each onSchedule/onRequest: deployed? what it does?
permissions? Confirm certifyProjectPrice has no caller; find other dead or unprotected
functions. Output table: function x type x caller x internal-authz-check? x status. Report only.
```

## الجزء 4 — الكود الميت والاعتماديات
**النطاق:** المشروع كامل.
- شغّل **knip** (وإن تعذّر ts-prune) + **depcheck**. راعِ `import()` الديناميكي و`React.lazy()` والمراجع النصّية ونقاط الدخول في `index.html`/`vite.config.ts`.
- قارن النتيجة بقائمة "11 ملف ميت" في التقرير — أيّها صحيح، أيّها خطأ (حي فعلاً)، وما الذي فات التقرير.
- اعتماديات `package.json` غير المستخدمة + المستوردة وغير المثبّتة.
- **المخرج:** قائمة ميتة موثوقة + جدول فروقات عن التقرير + اعتماديات زائدة.

```
PART 4 — dead code & deps ONLY. No changes. Run knip (fallback ts-prune) + depcheck on
the whole project. Account for dynamic import(), React.lazy(), string refs, entry points
in index.html/vite.config.ts. Compare to the report's "11 dead files": which are correct,
which are wrong (actually alive), what the report missed. List unused deps + used-but-
unlisted deps. Output: authoritative dead list + diff table + dependency issues. Report only.
```

## الجزء 5 — خريطة تدفّق المجموعات (Data Flow)
**النطاق:** كل مجموعات Firestore.
- لكل مجموعة: مواقع القراءة الفعلية ومواقع الكتابة الفعلية (`collection(`/`doc(`/`setDoc`/`onSnapshot`...).
- صنّف: حية / للقراءة فقط / للكتابة فقط (بيانات يتيمة لا تُقرأ) / غير مستخدمة.
- صحّح ادعاء التقرير "usageTracking ميتة" (الخدمة حية لكن تخزينها في `users`).
- **المخرج:** جدول (مجموعة × قراءة من × كتابة من × التصنيف).

```
PART 5 — collection data-flow map ONLY. No changes. For each Firestore collection list
actual read sites and write sites (collection(/doc(/setDoc/onSnapshot...). Classify:
alive / read-only / write-only (orphan data never read) / unused. Correct the report's
"usageTracking is dead" claim (service is alive but stores counters in users/). Output
table: collection x read-by x written-by x classification. Report only.
```

## الجزء 6 — سلامة البيانات وصحة الأنواع والاختبارات
**النطاق:** المشروع كامل.
- الكتابات المتعددة غير الذرية (مثل `linkQuoteToProject` يكتب وثيقتين بلا transaction) والعمليات الحساسة بلا إعادة محاولة/تراجع.
- `npx tsc --noEmit` على المشروع كامل → عدد الأخطاء وقائمتها (أخطاء أنواع كامنة لا يكشفها `vite build`).
- المسارات الحرجة بلا اختبار: الفوترة، المدفوعات، عمولة RFQ، المستورد، التسعير.
- **المخرج:** قائمة مخاطر السلامة + عدد/قائمة أخطاء الأنواع + فجوات التغطية.

```
PART 6 — data integrity, types, tests ONLY. No changes. Find non-atomic multi-writes
(e.g. linkQuoteToProject writes two docs without a transaction) and sensitive ops lacking
retry/rollback. Run npx tsc --noEmit on the whole project: error count + list (latent type
errors vite build misses). Identify critical untested paths: billing, payments, RFQ
commission, importer, pricing. Output: integrity risks + type-error list + coverage gaps.
Report only.
```

---

## بعد الأجزاء الستة
ألصق لي تقرير كل جزء فور صدوره — أراجعه مقابل الكود، ندمج الستة مع خريطتي (V1–V5)، ونطلّع **الخريطة النهائية الكاملة للثغرات والمشاكل**. بعدها فقط نرتّب خطة الإصلاح بالأولويات.
