/**
 * Firestore Initializer — تهيئة Firestore عند بدء التطبيق
 * 
 * يُستدعى مرة واحدة عند تحميل التطبيق:
 * 1. ينقل البيانات من localStorage إلى Firestore (مرة واحدة)
 * 2. يحمّل البيانات من Firestore إلى localStorage (للتشغيل السريع)
 * 3. يُفعّل المستمعين الحيين (real-time listeners)
 */

import { firestoreDataService } from './firestoreDataService';
import { registrationService } from './registrationService';

// Track initialization state
let isInitialized = false;
let isInitializing = false;

/**
 * تهيئة Firestore — يُستدعى مرة واحدة عند بدء التطبيق
 */
export async function initializeFirestoreData(
    onProgress?: (step: string, current: number, total: number) => void
): Promise<{ success: boolean; migratedCount: number; errors: string[] }> {
    if (isInitialized || isInitializing) {
        return { success: true, migratedCount: 0, errors: [] };
    }

    isInitializing = true;
    const errors: string[] = [];
    let migratedCount = 0;

    try {
        // الخطوة 1: نقل البيانات من localStorage إلى Firestore (أول مرة فقط)
        if (onProgress) onProgress('نقل البيانات', 1, 3);

        const migrationResult = await firestoreDataService.runAllMigrations(
            (label, current, total) => {
                if (onProgress) onProgress(`نقل: ${label}`, current, total);
            }
        );
        migratedCount = migrationResult.total;
        errors.push(...migrationResult.errors);

        // الخطوة 2: تحميل البيانات الأساسية من Firestore
        if (onProgress) onProgress('تحميل البيانات', 2, 3);

        // تحميل طلبات التسجيل (أهم بيانات)
        await registrationService.loadFromFirestore().catch(err => {
            console.warn('⚠️ Registration load failed:', err);
            errors.push(`Registration: ${err.message}`);
        });

        // تحميل باقي البيانات في الخلفية (لا نحجز التحميل)
        loadBackgroundData().catch(console.error);

        // الخطوة 3: جاهز
        if (onProgress) onProgress('جاهز', 3, 3);

        isInitialized = true;
        isInitializing = false;
        return { success: errors.length === 0, migratedCount, errors };

    } catch (error: any) {
        console.error('❌ Firestore initialization failed:', error);
        isInitializing = false;
        errors.push(error.message);
        return { success: false, migratedCount, errors };
    }
}

/**
 * تحميل البيانات في الخلفية (لا تحجز واجهة المستخدم)
 */
async function loadBackgroundData(): Promise<void> {
    const collections = [
        { collection: 'supplier_products', localKey: 'arba_supplier_products' },
        { collection: 'purchase_invoices', localKey: 'arba_purchase_invoices' },
        { collection: 'supplier_payments', localKey: 'arba_supplier_payments' },
        { collection: 'invoices', localKey: 'arba_invoices' },
        { collection: 'ledger_entries', localKey: 'arba_ledger' },
        { collection: 'subscriptions', localKey: 'arba_subscriptions' },
        { collection: 'payments', localKey: 'arba_payments' },
        { collection: 'accounting_clients', localKey: 'arba_clients' },
        { collection: 'connect_messages', localKey: 'arba_connect_messages' },
        { collection: 'connect_mail', localKey: 'arba_connect_mail' },
        { collection: 'connect_forms', localKey: 'arba_connect_forms' },
        { collection: 'connect_notes', localKey: 'arba_connect_notes' },
        // New synced collections
        { collection: 'support_tickets', localKey: 'arba_support_tickets' },
        { collection: 'notifications', localKey: 'arba_notifications' },
        { collection: 'invoice_edit_requests', localKey: 'arba_invoice_edit_requests' },
        { collection: 'invoice_versions', localKey: 'arba_invoice_versions' },
        { collection: 'discount_requests', localKey: 'arba_discount_requests' },
        { collection: 'auth_users', localKey: 'arba_users' },
        { collection: 'supplier_reviews', localKey: 'arba_supplier_reviews' },
        { collection: 'chart_of_accounts', localKey: 'arba_chart_of_accounts' },
        { collection: 'journal_entries', localKey: 'arba_journal_entries' },
    ];

    for (const { collection, localKey } of collections) {
        try {
            const items = await firestoreDataService.getCollection(
                collection,
                undefined,
                { localCacheKey: localKey }
            );
            if (items.length > 0) {
            }
        } catch {
            // Silent fallback to localStorage — no console noise
        }
    }
}

/**
 * إعادة تهيئة (للاختبار أو إعادة المزامنة)
 */
export function resetFirestoreInit(): void {
    isInitialized = false;
    isInitializing = false;
}

export function isFirestoreReady(): boolean {
    return isInitialized;
}
