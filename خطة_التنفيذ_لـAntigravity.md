# خطة تنفيذ ARBA — للتنفيذ بواسطة Antigravity + الوكلاء

> ## ENGLISH PROMPT (paste this to Antigravity)
> ```
> ROLE: Lead implementer for ARBA Pricing Platform. Execute the plan below
> using 4 parallel sub-agents (Security, Backend, Frontend, QA).
>
> HARD RULES (save tokens):
> - No preamble, no praise, no long reports. One line per task on completion.
> - Don't explain code unless asked. Small, focused diffs only.
> - Report test results as numbers only (e.g. "23/23 ✓").
> - Touch ONLY the files named in each task. Ask before any delete/destructive cmd.
> - One git branch per task. Do NOT run any code until I say "go".
>
> ORDER:
> - P-pre FIRST: stabilize git (remove stale .git/index.lock, commit/stash the
>   161 uncommitted files, confirm clean status). Nothing else starts until done.
> - Then P0 (security rules), P1 (merge sync engine), P3 (hot-update/crash) in
>   parallel. P2 (UI binding) waits for P1. P4 (tests) waits for all. P5 last.
>
> CRITICAL CHECKS:
> - P0: also fix calculations write (any-engineer hole, L97-101) + usageTracking
>   (L648-653). Inline role check is a stopgap; real fix = Custom Claims/Cloud Fn.
> - P2: capture project updatedAt on open and pass baseUpdatedAt to
>   updateProjectChecked — otherwise conflict detection is dead code.
> - P3: ErrorBoundary cannot read pricing state — wire crash snapshot to
>   draftAutosaveService (single overwritten key), don't build a parallel backup.
>
> ACCEPTANCE: sync.test.ts 23/23, npm run build clean, Firestore rules tests green.
> Start with P-pre and wait for my "go" before each subsequent phase.
> ```

---

## قواعد إلزامية (وفّر التوكنز)
- لا مقدمات، لا مديح، لا تقارير طويلة. سطر واحد لكل مهمة عند الإنجاز.
- لا تشرح الكود إلا عند الطلب. diffs صغيرة ومركّزة فقط.
- شغّل الاختبارات وأبلِغ النتيجة رقمياً فقط (مثال: `12/12 ✓`).
- لا تلمس أي ملف خارج الملفات المذكورة في المهمة دون إذن.
- اسأل قبل أي حذف/أمر تدميري. كل مهمة على فرع git منفصل.
- نفّذ بعد P-pre مباشرة: P0 و P1 و P3 متوازية (3 وكلاء)؛ P2 ينتظر P1؛ P4 ينتظر الكل؛ P5 أخيراً.

## توزيع الوكلاء
- **Security Agent** → P0
- **Backend Agent** → P1
- **Frontend Agent** → P2, P3
- **QA Agent** → P4 (يكتب اختبارات P0 بالتوازي مع تنفيذها) + P5

---

## P-pre — تثبيت حالة git (إلزامي قبل أي شيء)
الوضع الحالي: فرع `main` فيه **161 ملف غير مُلتزم** + ملف `.git/index.lock` عالق.
1. أغلِق أي محرر/IDE يمسك المستودع، ثم احذف `.git/index.lock` إن بقي.
2. `git add -A && git commit -m "snapshot before sync/security work"` (أو `git stash` إن رغبت).
3. تأكّد `git status` نظيف قبل إنشاء أي فرع.
**القبول:** `git status` نظيف، والتفريع يعمل.

---

## P0 — إصلاح أمني عاجل (Security Agent)
**الفرع:** `fix/p0-security-rules`
**المشكلة:** أي مستخدم يقدر يسجّل حسابه كـ admin عبر إنشاء وثيقة دوره.

### [MODIFY] `firestore.rules`
1. **L63-69 `/userRoles/{uid}`** — مسكّن فوري: امنع تعيين admin/superadmin ذاتياً:
   ```
   allow create: if isAuth() && request.auth.uid == uid
     && request.resource.data.role != 'admin'
     && request.resource.data.role != 'superadmin';
   ```
   ⚠️ هذا مسكّن فقط — المستخدم يبقى يقدر يعيّن `qs_engineer` لنفسه.
   **الإصلاح المتين المطلوب:** انقل تعيين الأدوار كلياً إلى **Custom Claims / Cloud Function** موثوقة، واجعل القاعدة تقرأ الدور من الـ claim لا من وثيقة يكتبها العميل.
2. **L97-101 `/projects/{projectId}/calculations/{calcId}`** — `allow write` حالياً يسمح لأي `isEngineer()` بالكتابة في **أي** مشروع. احصره في owner/assigned/admin فقط.
3. **L112 `/priceHistory/{historyId}`** — `allow create` يقتصر على owner/assigned/admin (بدل `isAuth()` العام).
4. **L180 `/payments/{paymentId}`** — `allow create` للمالك فقط: `request.auth.uid == request.resource.data.userId`.
5. **L648-653 `/usageTracking/{userId}`** — (موجود مؤكداً) احصر التحديث الذاتي للحصة بالمالك، أو انقله لجهة موثوقة لمنع تضخيم الحصة.

**القبول:** اختبار `@firebase/rules-unit-testing` يثبت: مستخدم عادي لا يصير admin، ولا يكتب calculations/priceHistory/payments في نطاق غيره.

---

## P1 — دمج محرك المزامنة الجاهز (Backend Agent)
**الفرع:** `feat/p1-sync-merge`
المصدر جاهز ومختبَر في `_sync_isolated/` (مسارات الاستيراد فيه مطابقة لمكان `services/`، فالنسخ يعمل مباشرة).
1. [MODIFY] `services/offlineBufferService.ts` ← استبدال كامل بـ `_sync_isolated/services/offlineBufferService.ts` (يضيف `serverTimestampFields` + إصلاح بق الطابور اللانهائي).
2. [MODIFY] `services/projectService.ts` ← استبدال كامل بـ `_sync_isolated/services/projectService.ts` (offline + `updateProjectChecked`).
3. [NEW] `services/draftAutosaveService.ts` ← نسخ من `_sync_isolated/` بدون تعديل.

**القبول:** اختبار `_sync_isolated/tests/sync.test.ts` = `23/23 ✓` + `npm run build` ينجح.

---

## P2 — ربط الواجهة بالمزامنة (Frontend Agent) — يعتمد على P1
**الفرع:** `feat/p2-ui-sync-binding`
الملفات: `App.tsx`, `components/zones/EmployeeWorkspace.tsx`, مكوّن التسعير.
1. **Autosave:** `draftAutosaveService.start(() => liveState, { draftId })` عند فتح التسعير، `stop()` عند الخروج، `markCloudSaved()` بعد "حفظ المشروع". (حدّد متغيّر حالة التسعير الفعلي ونقطة الحفظ في `handleSetupConfirm`/`onOpenPricing`).
2. **استرجاع:** عند الإقلاع `restore()` → لو `hasUnsyncedDraft()` اعرض اقتراح استرجاع.
3. **كشف التعارض (إلزامي وإلا الميزة ميتة):** خزّن `updatedAt` للمشروع لحظة فتحه (كـ millis)، ومرّره عند الحفظ:
   `updateProjectChecked(id, updates, { baseUpdatedAt })`.
4. **رسائل UX:** `status==='buffered'` → "حُفظ محلياً وسيُرفع تلقائياً عند رجوع الشبكة"؛ `status==='conflict'` → تنبيه بوجود نسخة أحدث (اعرض `serverData`).

**القبول:** DevTools → Offline → الحفظ لا يفشل + رسالة محلية؛ الرجوع → الطابور يُفرَّغ؛ تعديل متزامن من جلستين → يظهر تنبيه تعارض.

---

## P3 — التحديث الساخن + الانهيار (Frontend Agent) — مستقل
**الفرع:** `feat/p3-hot-update-crash`
1. [NEW] `public/version.json` → `{ "version": "10.4.1", "buildDate": "2026-06-22" }`.
2. [NEW] `services/versionChecker.ts` → يقرأ `/version.json` عند الإقلاع، يقارنه بالنسخة المخزّنة محلياً، وعند إصدار جديد **يُحدّث مرة واحدة فقط** (يخزّن النسخة المرئية لتفادي حلقة reload).
   - قبل `location.reload()`: **أعِد استخدام مسودة `draftAutosaveService`** للنسخة الاحتياطية — لا تبنِ نظام نسخ ثانٍ موازٍ.
3. [MODIFY] `components/ErrorBoundary.tsx` → قبل أي `reload()` احفظ لقطة.
   - ⚠️ `ErrorBoundary` (class) **لا يصل لحالة التسعير**؛ لا تحاول التقاط React state. استدعِ `draftAutosaveService.tick(true)` أو اقرأ مفتاح الـ autosave مباشرة.
   - استخدم **مفتاحاً واحداً يُكتب فوقه** (لا `..._{timestamp}` متجدد يملأ localStorage).

**القبول:** نشر إصدار جديد لا يفقد المسودة (مرة واحدة بلا حلقة)؛ انهيار يترك لقطة قابلة للاسترجاع.

---

## P4 — حزمة الاختبارات (QA Agent)
**الفرع:** `test/p4-qa-tests`
- Unit tests لقواعد Firestore عبر `@firebase/rules-unit-testing` (تغطّي بنود P0 الخمسة).
- محاكاة DevTools offline + إعادة تشغيل الطابور (Replay) لـ P1/P2.
**القبول:** كل الاختبارات خضراء في CI.

---

## P5 — تنظيف (QA Agent)
**الفرع:** `chore/p5-cleanup`
- احذف `_sync_isolated/` بالكامل بعد دمج P1 (بما فيه `_dist/`, `_run*/`, `tests/*.mjs`, `tests/*.mts`).
- انقل `arba_system/_archive` خارج بيئة العمل (تنظيم فقط، لا أداء).

---

## التحقق النهائي
- آلي: `sync.test.ts` 23/23 · `npm run build` نظيف · Firestore rules tests خضراء.
- يدوي: Offline→حفظ→رسالة محلية · إعادة اتصال→تفريغ الطابور · تغيير version.json→تحديث مرة واحدة مع نسخة احتياطية · انهيار مصطنع→لقطة واحدة في localStorage · محاولة self-assign admin→مرفوضة.

> لا تنفيذ لأي كود قبل أمر صريح. ابدأ دائماً بـ P-pre.
