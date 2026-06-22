# إصلاحات المزامنة وحفظ البيانات — نسخة معزولة

نُفِّذت في `_sync_isolated/` **دون لمس ملفاتك الأصلية**. راجِعها ثم انقلها لمكانها عند الموافقة.

## الملفات (الديليفري)

| ملف | الحالة | ماذا تغيّر |
|---|---|---|
| `services/offlineBufferService.ts` | معدّل | دعم `serverTimestampFields` (يحل مشكلة أن `serverTimestamp()` لا يقبل التسلسل في JSON) + **إصلاح بق قائم**: كان الطابور لا يُفرَّغ بعد المزامنة الناجحة. |
| `services/projectService.ts` | معدّل | `createProject`/`updateProject`/عروض الأسعار صارت عبر `safeWrite` (مقاومة أوفلاين) + دالة `updateProjectChecked` لحل التعارض عبر `updatedAt`. |
| `services/draftAutosaveService.ts` | جديد | حفظ تلقائي صامت كل 10 ثوانٍ في `localStorage` فقط (فاتورة Firestore صفرية) + استرجاع + علم `cloudSaved`. |
| `tests/sync.test.ts` | جديد | 23 اختباراً (أوفلاين، إعادة الإرسال، التسلسل، التعارض، الحفظ التلقائي) — كلها ناجحة. |

## أهم نقطتين هندسيتين

1. **`serverTimestamp()` لا يُخزَّن في الطابور.** الـ sentinel غير قابل للتسلسل في JSON؛ نخزّن أسماء الحقول فقط ونعيد بناء الطابع الزمني لحظة الكتابة/إعادة الإرسال. (التوجيه المباشر الذي اقترحه تقرير Antigravity كان سيُدخل بقاً صامتاً هنا.)

2. **حل التعارض (لا Last-Write-Wins):** `updateProjectChecked(id, updates, { baseUpdatedAt })` — لو نسخة السيرفر أحدث، تُرجِع `{ status: 'conflict', serverData }` بدل المسح الأعمى، فتقدر الواجهة تنبّه المستخدم.

## بق قديم اكتُشف وأُصلح

في `syncPendingWrites` الأصلية، السطر الأخير `this.saveBuffer(buffer)` كان يعيد كتابة المصفوفة كاملة بعد الحلقة، فيُحيي العناصر التي تمت مزامنتها للتو → **الطابور لا يُفرَّغ أبداً** ويعيد إرسال نفس الكتابات. أُصلح بإعادة بناء الطابور من العناصر غير المُتزامِنة فقط.

## كيف تشغّل الاختبار

```bash
OUT=_sync_isolated/_run
./node_modules/.bin/tsc --module commonjs --target es2022 --moduleResolution node \
  --esModuleInterop --skipLibCheck --noEmitOnError false --outDir $OUT \
  _sync_isolated/services/offlineBufferService.ts \
  _sync_isolated/services/draftAutosaveService.ts \
  _sync_isolated/tests/sync.test.ts
echo '{"type":"commonjs"}' > $OUT/package.json
node $OUT/tests/sync.test.js
```

## خطوات الدمج (عند الموافقة)

1. انسخ `services/offlineBufferService.ts` و`services/projectService.ts` و`services/draftAutosaveService.ts` فوق نظائرها في `services/`.
2. احذف مجلد `_sync_isolated/` بالكامل (ومعه الملفات المؤقتة: `_dist/`, `_run*/`, `tests/sync.test.mjs`, `tests/sync.test.mts` — هذي بقايا بناء، تجاهلها/احذفها).

## ما زال مطلوباً (ربط الواجهة — لم يُنفَّذ بعد، لتفادي تعديل App.tsx عالي الخطورة)

- استدعاء `draftAutosaveService.start(() => liveState, { draftId })` عند فتح بيئة التسعير، و`markCloudSaved()` بعد "حفظ المشروع"، و`restore()` عند الإقلاع لاقتراح استرجاع مسودة غير مرفوعة.
- رسالة طمأنة عند الحفظ أوفلاين (`res.status === 'buffered'`) وتنبيه عند `'conflict'`.
- (منفصل عن المزامنة) Version Checker ولقطة الحالة في `ErrorBoundary` — بنود الخطة الأخرى.
