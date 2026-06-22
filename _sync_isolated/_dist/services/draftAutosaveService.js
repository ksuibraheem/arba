"use strict";
/**
 * ARBA — Draft Autosave Service
 * خدمة الحفظ التلقائي الصامت للمسودة الجارية
 *
 * الغرض: حماية التسعير الجاري (React State) من الضياع عند انقطاع النت،
 * تحديث ساخن، انهيار، أو إغلاق التبويب — **دون أي كتابة إلى Firestore**،
 * فتبقى فاتورة السحابة صفرية. الحفظ السحابي يبقى عند "حفظ المشروع" فقط.
 *
 * التصميم:
 * - حفظ صامت كل 10 ثوانٍ في localStorage (قابل للضبط).
 * - يحفظ فقط لو تغيّرت المسودة فعلاً (مقارنة بصمة) لتفادي كتابات لا لزوم لها.
 * - يحفظ أيضاً عند pagehide/visibilitychange (إغلاق/تبديل التبويب).
 * - يخزّن JSON واضح (بدون أي تشفير شكلي بلا قيمة).
 * - restore() يرجّع آخر مسودة لو كانت أحدث من آخر حفظ سحابي.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.AUTOSAVE_STORAGE_KEY = exports.draftAutosaveService = void 0;
const AUTOSAVE_KEY = 'arba_draft_autosave';
const DEFAULT_INTERVAL_MS = 10_000; // 10 ثوانٍ
class DraftAutosaveService {
    timer = null;
    getState = null;
    intervalMs = DEFAULT_INTERVAL_MS;
    draftId;
    lastFingerprint = '';
    boundFlush = () => this.tick(true);
    /**
     * بدء الحفظ التلقائي. مرّر دالة ترجّع الحالة الحالية للتسعير.
     */
    start(getState, opts = {}) {
        this.stop();
        this.getState = getState;
        this.intervalMs = opts.intervalMs ?? DEFAULT_INTERVAL_MS;
        this.draftId = opts.draftId;
        this.timer = setInterval(() => this.tick(false), this.intervalMs);
        // حفظ فوري عند إغلاق/إخفاء التبويب (آخر فرصة قبل فقد الـ State)
        if (typeof window !== 'undefined') {
            window.addEventListener('pagehide', this.boundFlush);
            window.addEventListener('beforeunload', this.boundFlush);
            document.addEventListener('visibilitychange', this.onVisibility);
        }
    }
    onVisibility = () => {
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
            this.tick(true);
        }
    };
    /** إيقاف الحفظ التلقائي وإزالة المستمعين. */
    stop() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        if (typeof window !== 'undefined') {
            window.removeEventListener('pagehide', this.boundFlush);
            window.removeEventListener('beforeunload', this.boundFlush);
            document.removeEventListener('visibilitychange', this.onVisibility);
        }
        this.getState = null;
    }
    /**
     * دورة حفظ واحدة. force=true يتجاوز فحص التغيير (يُستخدم عند الإغلاق).
     * عام (public) عشان يُختبر مباشرة.
     */
    tick(force = false) {
        if (!this.getState)
            return false;
        let state;
        try {
            state = this.getState();
        }
        catch {
            return false;
        }
        if (state == null)
            return false;
        let serialized;
        try {
            serialized = JSON.stringify(state);
        }
        catch {
            return false; // حالة غير قابلة للتسلسل — لا نحفظ بصمت بيانات فاسدة
        }
        if (!force && serialized === this.lastFingerprint) {
            return false; // لا تغيير منذ آخر حفظ
        }
        const envelope = {
            draftId: this.draftId,
            savedAt: Date.now(),
            cloudSaved: false,
            state,
        };
        try {
            this.setRaw(JSON.stringify(envelope));
            this.lastFingerprint = serialized;
            return true;
        }
        catch {
            // localStorage ممتلئ أو غير متاح — نتجاهل بصمت (الحفظ احتياطي)
            return false;
        }
    }
    /** استرجاع آخر مسودة محفوظة محلياً (أو null). */
    restore() {
        const raw = this.getRaw();
        if (!raw)
            return null;
        try {
            return JSON.parse(raw);
        }
        catch {
            return null;
        }
    }
    /** هل توجد مسودة محلية لم تُرفع للسحابة بعد؟ */
    hasUnsyncedDraft() {
        const env = this.restore();
        return !!env && env.cloudSaved === false;
    }
    /**
     * تُستدعى بعد نجاح "حفظ المشروع" في السحابة، لتعليم المسودة كمرفوعة
     * (فلا يقترح التطبيق استرجاعها لاحقاً بلا داعٍ).
     */
    markCloudSaved() {
        const env = this.restore();
        if (env) {
            env.cloudSaved = true;
            try {
                this.setRaw(JSON.stringify(env));
            }
            catch { /* ignore */ }
        }
    }
    /** مسح المسودة المحلية (مثلاً بعد استرجاعها أو التخلي عنها). */
    clear() {
        try {
            this.removeRaw();
        }
        catch { /* ignore */ }
        this.lastFingerprint = '';
    }
    // ============ طبقة تخزين قابلة للاستبدال في الاختبارات ============
    setRaw(value) { localStorage.setItem(AUTOSAVE_KEY, value); }
    getRaw() { return localStorage.getItem(AUTOSAVE_KEY); }
    removeRaw() { localStorage.removeItem(AUTOSAVE_KEY); }
}
exports.draftAutosaveService = new DraftAutosaveService();
exports.AUTOSAVE_STORAGE_KEY = AUTOSAVE_KEY;
