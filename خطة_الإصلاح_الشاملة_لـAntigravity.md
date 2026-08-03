# خطة الإصلاح الشاملة الموجّهة — ARBA (متعددة الوكلاء، أقل توكن)

المرجع: `خريطة_الثغرات_النهائية_وخطة_الإصلاح.md` (مقفلة، مؤكدة 100%). **لا تُعد التحقق — نفّذ مباشرة.**

## قواعد التوكن (إلزامية لكل وكيل)
- لا مقدمات/سرد/"سأقوم بـ". سطر واحد لكل مهمة عند الإنجاز. نتائج الاختبار = أرقام فقط (`N/N ✓`).
- لا تُعِد قراءة ملف معروف، ولا تطبع ملفاً كاملاً، ولا تشرح الكود إلا عند الطلب.
- اجمع كل تعديلات الملف في diff واحد. لا تبنِ بعد كل تعديل صغير — ابنِ مرة واحدة في نهاية المهمة.
- استعمل البنية الجاهزة: `offlineBufferService`، حزمة إيموليتر الاختبار، JDK المثبّت في `.jdk/`.
- اسأل **فقط** عند بوابة المرحلة (بعد خضرة الاختبار): سؤال واحد قصير "أدمج؟".
- كل مرحلة على فرع git مستقل من `main`. لا دمج قبل اختبار أخضر.

## توزيع الوكلاء
Security→P0,P1 · Backend→P2 · Frontend→نقل الأسرار+الواجهة في P0/P1 · QA→اختبارات كل مرحلة + P4.
**التوازي:** P0 ثم (P1) ثم (P2 ∥ P3) ثم P4.

---

## P0 — الطوارئ (أسرار + بيانات مالية عامة) 🚨
**فرع:** `fix/p0-emergency`
1. **الأسرار (C1):** أزل `VITE_TAP_SECRET_KEY` و`VITE_ADMIN_SECRET_KEY` ومفتاح Gemini من العميل. السر للدفع → Cloud Function فقط؛ تحقّق الأدمن → خادم؛ Gemini → استدعاء عبر Function. **دوّر كل المفاتيح** (محروقة في الحزمة + git history).
2. **arba_config (C2):** عدّل قراءة `arba_config` لتشترط `isAuth()` + ملكية. وانقل `chart_of_accounts`/`journal_entries`/`invoice_versions` من `arba_config` إلى مجموعات مستقلة محمية بقواعدها (عدّل `firestoreDataService` ALLOWED_TOP_LEVEL).
**القبول:** اختبار إيموليتر: قراءة غير مُصادَقة لبيانات `arba_config` المالية = مرفوضة. `grep -r "VITE_.*SECRET" dist/` = لا نتائج. build أخضر. **انشر القواعد فور الدمج.**

## P1 — التحصين الأمني (قواعد + حصة + أدوار) 
**فرع:** `fix/p1-hardening`
1. **القواعد (C5/H5/H7):** أعد كتابة `firestore.rules` — تثبيت ملكية + فحص دور على **كل** `create/update`. احصر `quotes` بأصحاب المشروع. أصلح `registration_requests` (`if true`). ثبّت `ownerId==auth.uid` في projects/clients/suppliers.
2. **الحصة (C3/C4):** انقل العدّادات وفرض الحدود إلى Cloud Function؛ امنع المستخدم من تعديل حقول الحصة في `users`؛ انقل ميزانية الذكاء للخادم.
3. **العزل (C6):** شفّر `stateSnapshot` من جهة العميل أو انقله لمجموعة فرعية محجوبة عن SuperAdmin.
4. **الأدوار (C7):** Custom Claims (إزالة كتابة العميل لـ `userRoles`).
5. **الدوال (H1):** أضف فحص دور داخل الدوال الـCallable الثماني.
**القبول:** اختبارات إيموليتر سلوكية تثبت: self-assign دور=مرفوض، كتابة عبر النطاقات=مرفوضة، حقول الحصة غير قابلة لتعديل العميل، الدوال ترفض الأدوار غير المخوّلة. أرقام فقط.

## P2 — سلامة البيانات
**فرع:** `fix/p2-integrity`
1. **H3:** حوّل ربط العرض + ترقية الاشتراك + شراء التخزين إلى `writeBatch`/`runTransaction`.
2. **H4:** استبدل fire-and-forget (`authService`, `accountingService`) بطابور `offlineBufferService`.
3. **H2:** وحّد مسار `quotes` (subcollection) وأصلح `projectService` (`QUOTES_COL`).
**القبول:** اختبار: فشل منتصف العملية = لا كتابة جزئية؛ حفظ العرض ينجح فعلياً.

## P3 — التطهير (بالتوازي مع P2)
**فرع:** `chore/p3-cleanup`
- احذف الـ15 ملفاً ميتاً + النسخ المكررة في `src/` (قائمة Part 4). أزل الاعتماديات الزائدة (`exceljs`, `tesseract.js` من الواجهة...).
- أصلح أخطاء الأنواع الـ5 (أهمها `blueprintIntelligence.ts:512`) ثبّت `@types/react`، فعّل `strict` تدريجياً.
- احذف المجموعات غير المستخدمة من القواعد (`testSessions`, `internal_metadata`, `sweep_history`, `calculations`...).
**القبول:** build أخضر، `knip` نظيف، أخطاء `tsc --strict` = 0.

## P4 — تغطية الاختبارات
**فرع:** `test/p4-coverage`
- اختبارات حقيقية: billing، payments، RFQ commission، importer، pricing — تستورد الكود الفعلي (لا mocks مكررة كما في `subscription.test.ts`).
- اربط كل الاختبارات (sync + rules + الجديدة) بـ CI.
**القبول:** كل الاختبارات خضراء في CI.

---

## ملاحظة النشر
بعد P0 وP1: `firebase deploy --only firestore:rules,functions` + نشر البناء. (إن كان الإنتاج حيّاً، انشر P0 فوراً لأن الثغرات مكشوفة الآن).

---

## ENGLISH MASTER PROMPT (paste once to Antigravity)
```
EXECUTE the fix plan in خطة_الإصلاح_الشاملة_لـAntigravity.md with 4 parallel
sub-agents. The vuln map is LOCKED — do NOT re-audit, go straight to fixes.

TOKEN RULES (strict): no preamble/narration/"I will". One line per task done.
Test results = numbers only. Never re-read a known file or print a whole file.
Batch all edits per file into one diff; build once per task, not per edit. Reuse
existing infra (offlineBufferService, the emulator test harness, .jdk/). Ask only
at a phase gate (after green tests): one short "merge?".

ORDER (one branch per phase, behavioral-test gate before merge, wait for my "go"
between phases): P0 emergency (secrets+arba_config) -> P1 hardening (rules+quota+
roles+fn role-checks) -> P2 integrity (transactions+queue+quotes path) ∥ P3 cleanup
(dead files+deps+type bugs+strict) -> P4 test coverage.

Each phase: implement -> add emulator/unit tests proving the fix -> report numbers
-> ask to merge. After P0 and P1, output the exact deploy commands. No code changes
beyond the files named per task.

Start with P0 only. Report status in <=5 lines.
```
