/**
 * ARBA V8.1 — Real Project Test: RE Farm BOQ
 * تشغيل الدماغ على مشروع المزرعة الحقيقي
 */

const path = require('path');
const ArbaOrchestrator = require('./arba_orchestrator.cjs');

const FILE = path.join(
    'C:\\Users\\ksuib\\Desktop\\Ibrahim AL-duaydi\\My own program',
    'التأسيس', 'الملحلة الثالثة', 'مزرعة خاصة',
    'R.E Farm-Consolidated MEP BOQ -Priced (1).xlsx'
);

(async () => {
    console.log('🎯 Testing ARBA V8.1 on REAL project: RE Farm MEP BOQ\n');
    const orchestrator = new ArbaOrchestrator('riyadh');
    await orchestrator.run(FILE);
})();
