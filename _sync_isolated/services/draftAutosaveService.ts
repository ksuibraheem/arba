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

const AUTOSAVE_KEY = 'arba_draft_autosave';
const DEFAULT_INTERVAL_MS = 10_000; // 10 ثوانٍ

export interface DraftEnvelope<T = unknown> {
    /** معرّف المشروع/المسودة (لو متوفر) */
    draftId?: string;
    /** وقت الحفظ المحلي (ms) */
    savedAt: number;
    /** هل رُفعت للسحابة بعد هذا الحفظ؟ */
    cloudSaved: boolean;
    /** الحمولة الفعلية (AppState / حالة التسعير) */
    state: T;
}

type Getter<T> = () => T | null | undefined;

class DraftAutosaveService {
    private timer: ReturnType<typeof setInterval> | null = null;
    private getState: Getter<unknown> | null = null;
    private intervalMs = DEFAULT_INTERVAL_MS;
    private draftId: string | undefined;
    private lastFingerprint = '';
    private boundFlush = () => this.tick(true);

    /**
     * بدء الحفظ التلقائي. مرّر دالة ترجّع الحالة الحالية للتسعير.
     */
    start<T>(getState: Getter<T>, opts: { intervalMs?: number; draftId?: string } = {}): void {
        this.stop();
        this.getState = getState as Getter<unknown>;
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

    private onVisibility = () => {
        if (typeof document !== 'undefined' && document.visibilityState === 'hidden') {
            this.tick(true);
        }
    };

    /** إيقاف الحفظ التلقائي وإزالة المستمعين. */
    stop(): void {
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
    tick(force = false): boolean {
        if (!this.getState) return false;
        let state: unknown;
        try {
            state = this.getState();
        } catch {
            return false;
        }
        if (state == null) return false;

        let serialized: string;
        try {
            serialized = JSON.stringify(state);
        } catch {
            return false; // حالة غير قابلة للتسلسل — لا نحفظ بصمت بيانات فاسدة
        }

        if (!force && serialized === this.lastFingerprint) {
            return false; // لا تغيير منذ آخر حفظ
        }

        const envelope: DraftEnvelope = {
            draftId: this.draftId,
            savedAt: Date.now(),
            cloudSaved: false,
            state,
        };

        try {
            this.setRaw(JSON.stringify(envelope));
            this.lastFingerprint = serialized;
            return true;
        } catch {
            // localStorage ممتلئ أو غير متاح — نتجاهل بصمت (الحفظ احتياطي)
            return false;
        }
    }

    /** استرجاع آخر مسودة محفوظة محلياً (أو null). */
    restore<T = unknown>(): DraftEnvelope<T> | null {
        const raw = this.getRaw();
        if (!raw) return null;
        try {
            return JSON.parse(raw) as DraftEnvelope<T>;
        } catch {
            return null;
        }
    }

    /** هل توجد مسودة محلية لم تُرفع للسحابة بعد؟ */
    hasUnsyncedDraft(): boolean {
        const env = this.restore();
        return !!env && env.cloudSaved === false;
    }

    /**
     * تُستدعى بعد نجاح "حفظ المشروع" في السحابة، لتعليم المسودة كمرفوعة
     * (فلا يقترح التطبيق استرجاعها لاحقاً بلا داعٍ).
     */
    markCloudSaved(): void {
        const env = this.restore();
        if (env) {
            env.cloudSaved = true;
            try { this.setRaw(JSON.stringify(env)); } catch { /* ignore */ }
        }
    }

    /** مسح المسودة المحلية (مثلاً بعد استرجاعها أو التخلي عنها). */
    clear(): void {
        try { this.removeRaw(); } catch { /* ignore */ }
        this.lastFingerprint = '';
    }

    // ============ طبقة تخزين قابلة للاستبدال في الاختبارات ============
    private setRaw(value: string): void { localStorage.setItem(AUTOSAVE_KEY, value); }
    private getRaw(): string | null { return localStorage.getItem(AUTOSAVE_KEY); }
    private removeRaw(): void { localStorage.removeItem(AUTOSAVE_KEY); }
}

export const draftAutosaveService = new DraftAutosaveService();
export const AUTOSAVE_STORAGE_KEY = AUTOSAVE_KEY;
