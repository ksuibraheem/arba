/**
 * Firestore Data Service — خدمة البيانات الموحدة
 * الطبقة الأساسية بين كل الخدمات و Firestore
 * 
 * النمط: Firestore = مصدر الحقيقة | localStorage = ذاكرة مؤقتة سريعة
 */

import { db } from '../firebase/config';
import {
    collection, doc, setDoc, getDoc, getDocs,
    updateDoc, deleteDoc, writeBatch,
    query, where, orderBy, limit,
    onSnapshot, serverTimestamp, Timestamp,
    QueryConstraint, DocumentData, Unsubscribe
} from 'firebase/firestore';

// ====================== TYPES ======================

export interface FirestoreResult<T> {
    success: boolean;
    data?: T;
    error?: string;
}

export interface BatchItem {
    id: string;
    data: Record<string, any>;
}

// ====================== CACHE ======================

const memoryCache: Map<string, { data: any[]; timestamp: number }> = new Map();
const CACHE_TTL_MS = 30_000; // 30 seconds cache
const activeListeners: Map<string, Unsubscribe> = new Map();

function getCacheKey(collectionName: string, filters?: string): string {
    return `${collectionName}${filters ? `_${filters}` : ''}`;
}

function getFromCache<T>(key: string): T[] | null {
    const cached = memoryCache.get(key);
    if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
        return cached.data as T[];
    }
    return null;
}

function setCache(key: string, data: any[]) {
    memoryCache.set(key, { data, timestamp: Date.now() });
}

export function invalidateCache(collectionName: string) {
    // Remove all cache entries starting with this collection name
    for (const key of memoryCache.keys()) {
        if (key.startsWith(collectionName)) {
            memoryCache.delete(key);
        }
    }
}

// ====================== LOCAL STORAGE HELPERS ======================

function getLocalData<T>(key: string): T[] {
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch {
        return [];
    }
}

function saveLocalData<T>(key: string, data: T[]) {
    try {
        localStorage.setItem(key, JSON.stringify(data));
    } catch (e) {
        console.warn(`⚠️ localStorage save failed for ${key}:`, e);
    }
}

// ====================== TIMESTAMP CONVERSION ======================

function convertTimestamps(obj: any): any {
    if (obj === null || obj === undefined) return obj;
    if (obj instanceof Timestamp) return obj.toDate().toISOString();
    if (Array.isArray(obj)) return obj.map(item => convertTimestamps(item));
    if (typeof obj === 'object' && obj.constructor === Object) {
        const result: any = {};
        for (const key in obj) {
            result[key] = convertTimestamps(obj[key]);
        }
        return result;
    }
    return obj;
}

function sanitizeForFirestore(obj: any): any {
    if (obj === undefined) return null;
    if (obj === null || typeof obj !== 'object') return obj;
    if (Array.isArray(obj)) return obj.map(item => sanitizeForFirestore(item));
    if (obj instanceof Date) return Timestamp.fromDate(obj);

    const result: any = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            const val = obj[key];
            // Skip undefined values (Firestore doesn't accept them)
            if (val === undefined) continue;
            // Skip function values
            if (typeof val === 'function') continue;
            result[key] = sanitizeForFirestore(val);
        }
    }
    return result;
}

// ====================== COLLECTION ROUTING ======================
// القواعد الحالية على Firebase: match /arba_config/{docId} { allow read, write: if true; }
// هذه تسمح فقط بالمستوى الأول (وثائق مباشرة داخل arba_config) - لا sub-collections
// الحل: نخزن كل البيانات مباشرة في arba_config بمفاتيح مميزة
// مثال: supplier_products/prod123 → arba_config/supplier_products__prod123

const ALLOWED_TOP_LEVEL = new Set([
    'users', 'clients', 'projects', 'userRoles',
    'security_alerts', 'action_logs', 'suppliers', 'demoSessions', 'testSessions',
    'arba_config', '_connection_test'
]);

function resolveCollectionPath(collectionName: string): string {
    // المجموعات المسموح بها مباشرة
    if (ALLOWED_TOP_LEVEL.has(collectionName)) {
        return collectionName;
    }
    // باقي المجموعات → تخزن مباشرة في arba_config
    return 'arba_config';
}

function resolveDocPath(collectionName: string, docId: string): [string, string] {
    if (ALLOWED_TOP_LEVEL.has(collectionName)) {
        return [collectionName, docId];
    }
    // مفتاح مركب: collectionName__docId
    return ['arba_config', `${collectionName}__${docId}`];
}

// عند القراءة من arba_config، نحتاج فلترة الوثائق حسب البادئة
function getCollectionPrefix(collectionName: string): string | null {
    if (ALLOWED_TOP_LEVEL.has(collectionName)) {
        return null; // مجموعة مباشرة، لا حاجة لفلترة
    }
    return `${collectionName}__`;
}

// ====================== CORE SERVICE ======================

export const firestoreDataService = {

    // =================== CREATE / UPDATE ===================

    /**
     * حفظ وثيقة واحدة في Firestore (إنشاء أو تحديث)
     */
    async saveDocument(
        collectionName: string,
        docId: string,
        data: Record<string, any>,
        options?: { merge?: boolean }
    ): Promise<FirestoreResult<void>> {
        try {
            const sanitized = sanitizeForFirestore({
                ...data,
                _updatedAt: serverTimestamp(),
            });
            await setDoc(doc(db, ...resolveDocPath(collectionName, docId)), sanitized, {
                merge: options?.merge ?? true,
            });
            invalidateCache(collectionName);
            return { success: true };
        } catch (error: any) {
            console.error(`❌ Firestore save [${collectionName}/${docId}]:`, error);
            return { success: false, error: error.message };
        }
    },

    /**
     * تحديث حقول محددة في وثيقة
     */
    async updateDocument(
        collectionName: string,
        docId: string,
        updates: Record<string, any>
    ): Promise<FirestoreResult<void>> {
        try {
            const sanitized = sanitizeForFirestore({
                ...updates,
                _updatedAt: serverTimestamp(),
            });
            await updateDoc(doc(db, ...resolveDocPath(collectionName, docId)), sanitized);
            invalidateCache(collectionName);
            return { success: true };
        } catch (error: any) {
            console.error(`❌ Firestore update [${collectionName}/${docId}]:`, error);
            return { success: false, error: error.message };
        }
    },

    // =================== READ ===================

    /**
     * جلب وثيقة واحدة
     */
    async getDocument<T>(collectionName: string, docId: string): Promise<T | null> {
        try {
            const snap = await getDoc(doc(db, ...resolveDocPath(collectionName, docId)));
            if (snap.exists()) {
                return convertTimestamps({ id: snap.id, ...snap.data() }) as T;
            }
            return null;
        } catch (error: any) {
            console.error(`❌ Firestore get [${collectionName}/${docId}]:`, error);
            return null;
        }
    },

    /**
     * جلب كل الوثائق من مجموعة مع فلاتر اختيارية
     * يستخدم الذاكرة المؤقتة لتسريع الأداء
     * يتعامل مع المجموعات المخزنة في arba_config بالبادئة
     */
    async getCollection<T>(
        collectionName: string,
        constraints?: QueryConstraint[],
        options?: { skipCache?: boolean; localCacheKey?: string }
    ): Promise<T[]> {
        const cacheKey = getCacheKey(collectionName, constraints?.toString());

        // Try memory cache first
        if (!options?.skipCache) {
            const cached = getFromCache<T>(cacheKey);
            if (cached) return cached;
        }

        try {
            const prefix = getCollectionPrefix(collectionName);
            const resolved = resolveCollectionPath(collectionName);

            let items: T[];

            if (prefix) {
                // مجموعة مخزنة في arba_config بالبادئة
                // نجلب كل وثائق arba_config ثم نفلتر بالبادئة
                const q = query(collection(db, resolved));
                const snap = await getDocs(q);
                items = snap.docs
                    .filter(d => d.id.startsWith(prefix))
                    .map(d => {
                        // إزالة البادئة من المعرف وإرجاع الـ id الأصلي
                        const originalId = d.id.substring(prefix.length);
                        return convertTimestamps({ id: originalId, ...d.data() }) as T;
                    });
            } else {
                // مجموعة مباشرة (clients, projects, etc.)
                const q = constraints
                    ? query(collection(db, resolved), ...constraints)
                    : query(collection(db, resolved));
                const snap = await getDocs(q);
                items = snap.docs.map(d =>
                    convertTimestamps({ id: d.id, ...d.data() }) as T
                );
            }

            // Save to memory cache
            setCache(cacheKey, items);

            // Save to localStorage cache if key provided
            if (options?.localCacheKey) {
                saveLocalData(options.localCacheKey, items);
            }

            return items;
        } catch (error: any) {
            // Silent fallback — localStorage handles it
            // Fallback to localStorage cache
            if (options?.localCacheKey) {
                return getLocalData<T>(options.localCacheKey);
            }
            return [];
        }
    },

    // =================== DELETE ===================

    /**
     * حذف وثيقة
     */
    async deleteDocument(collectionName: string, docId: string): Promise<FirestoreResult<void>> {
        try {
            await deleteDoc(doc(db, ...resolveDocPath(collectionName, docId)));
            invalidateCache(collectionName);
            return { success: true };
        } catch (error: any) {
            console.error(`❌ Firestore delete [${collectionName}/${docId}]:`, error);
            return { success: false, error: error.message };
        }
    },

    // =================== BATCH WRITE ===================

    /**
     * كتابة دفعية (حتى 500 وثيقة في المرة)
     */
    async batchWrite(
        collectionName: string,
        items: BatchItem[],
        options?: { merge?: boolean }
    ): Promise<FirestoreResult<number>> {
        try {
            let written = 0;
            // Firestore batch limit = 500
            const BATCH_SIZE = 450;

            for (let i = 0; i < items.length; i += BATCH_SIZE) {
                const chunk = items.slice(i, i + BATCH_SIZE);
                const batch = writeBatch(db);

                for (const item of chunk) {
                    const docRef = doc(db, ...resolveDocPath(collectionName, item.id));
                    const sanitized = sanitizeForFirestore({
                        ...item.data,
                        _updatedAt: serverTimestamp(),
                    });
                    
                    if (options?.merge !== false) {
                        batch.set(docRef, sanitized, { merge: true });
                    } else {
                        batch.set(docRef, sanitized);
                    }
                }

                await batch.commit();
                written += chunk.length;
            }

            invalidateCache(collectionName);
            console.log(`✅ Batch wrote ${written} docs to ${collectionName}`);
            return { success: true, data: written };
        } catch (error: any) {
            console.error(`❌ Firestore batchWrite [${collectionName}]:`, error);
            return { success: false, error: error.message };
        }
    },

    // =================== REAL-TIME LISTENER ===================

    /**
     * الاستماع الحي لتغييرات المجموعة
     * يرجع دالة لإلغاء الاشتراك
     */
    subscribeToCollection<T>(
        collectionName: string,
        callback: (items: T[]) => void,
        constraints?: QueryConstraint[],
        localCacheKey?: string
    ): Unsubscribe {
        // Cancel existing listener for this collection
        const existingUnsub = activeListeners.get(collectionName);
        if (existingUnsub) {
            existingUnsub();
        }

        const resolved = resolveCollectionPath(collectionName);
        const prefix = getCollectionPrefix(collectionName);
        const q = constraints
            ? query(collection(db, resolved), ...constraints)
            : query(collection(db, resolved));

        const unsub = onSnapshot(
            q,
            (snap) => {
                let items: T[];
                if (prefix) {
                    items = snap.docs
                        .filter(d => d.id.startsWith(prefix))
                        .map(d => {
                            const originalId = d.id.substring(prefix.length);
                            return convertTimestamps({ id: originalId, ...d.data() }) as T;
                        });
                } else {
                    items = snap.docs.map(d =>
                        convertTimestamps({ id: d.id, ...d.data() }) as T
                    );
                }

                // Update caches
                setCache(getCacheKey(collectionName), items);
                if (localCacheKey) {
                    saveLocalData(localCacheKey, items);
                }

                callback(items);
            },
            (error) => {
                console.error(`❌ Snapshot error [${collectionName}]:`, error);
                // Fallback to localStorage on error
                if (localCacheKey) {
                    callback(getLocalData<T>(localCacheKey));
                }
            }
        );

        activeListeners.set(collectionName, unsub);
        return unsub;
    },

    /**
     * إلغاء كل المستمعين النشطين
     */
    unsubscribeAll() {
        for (const [key, unsub] of activeListeners.entries()) {
            unsub();
            activeListeners.delete(key);
        }
    },

    // =================== MIGRATION ===================

    /**
     * نقل البيانات من localStorage إلى Firestore (مرة واحدة)
     */
    async migrateFromLocalStorage(
        localKey: string,
        collectionName: string,
        options?: { idField?: string; onProgress?: (current: number, total: number) => void }
    ): Promise<FirestoreResult<number>> {
        const migrationFlag = `_migrated_${collectionName}`;

        // Skip if already migrated
        if (localStorage.getItem(migrationFlag) === 'true') {
            return { success: true, data: 0 };
        }

        const localData = getLocalData<any>(localKey);
        if (localData.length === 0) {
            localStorage.setItem(migrationFlag, 'true');
            return { success: true, data: 0 };
        }

        console.log(`🔄 Migrating ${localData.length} items from ${localKey} → ${collectionName}`);

        const items: BatchItem[] = localData.map((item: any) => ({
            id: item[options?.idField || 'id'] || crypto.randomUUID(),
            data: {
                ...item,
                _migratedAt: new Date().toISOString(),
                _migratedFrom: 'localStorage',
            },
        }));

        const result = await this.batchWrite(collectionName, items);

        if (result.success) {
            localStorage.setItem(migrationFlag, 'true');
            console.log(`✅ Migration complete: ${localKey} → ${collectionName} (${result.data} docs)`);
        }

        return result;
    },

    /**
     * تشغيل كل عمليات النقل دفعة واحدة
     */
    async runAllMigrations(
        onProgress?: (label: string, current: number, total: number) => void
    ): Promise<{ total: number; errors: string[] }> {
        const migrations = [
            { localKey: 'arba_registration_requests', collection: 'registration_requests', label: 'طلبات التسجيل' },
            { localKey: 'arba_supplier_products', collection: 'supplier_products', label: 'منتجات الموردين' },
            { localKey: 'arba_purchase_invoices', collection: 'purchase_invoices', label: 'فواتير المشتريات' },
            { localKey: 'arba_supplier_payments', collection: 'supplier_payments', label: 'مدفوعات الموردين' },
            { localKey: 'arba_invoices', collection: 'invoices', label: 'الفواتير' },
            { localKey: 'arba_ledger', collection: 'ledger_entries', label: 'القيود المحاسبية' },
            { localKey: 'arba_subscriptions', collection: 'subscriptions', label: 'الاشتراكات' },
            { localKey: 'arba_payments', collection: 'payments', label: 'المدفوعات' },
            { localKey: 'arba_clients', collection: 'accounting_clients', label: 'العملاء' },
            { localKey: 'arba_employees', collection: 'employees', label: 'الموظفين' },
            { localKey: 'arba_notifications', collection: 'notifications', label: 'الإشعارات' },
            { localKey: 'arba_connect_messages', collection: 'connect_messages', label: 'رسائل التواصل' },
            { localKey: 'arba_connect_mail', collection: 'connect_mail', label: 'البريد الداخلي' },
            { localKey: 'arba_connect_forms', collection: 'connect_forms', label: 'النماذج' },
            { localKey: 'arba_connect_notes', collection: 'connect_notes', label: 'الملاحظات' },
        ];

        let totalMigrated = 0;
        const errors: string[] = [];

        for (let i = 0; i < migrations.length; i++) {
            const m = migrations[i];
            if (onProgress) onProgress(m.label, i + 1, migrations.length);

            const result = await this.migrateFromLocalStorage(m.localKey, m.collection);
            if (result.success) {
                totalMigrated += result.data || 0;
            } else {
                errors.push(`${m.label}: ${result.error}`);
            }
        }

        if (errors.length === 0) {
            console.log(`✅ All migrations complete! Total: ${totalMigrated} documents`);
        } else {
            console.warn(`⚠️ Migrations completed with ${errors.length} errors`);
        }

        return { total: totalMigrated, errors };
    },

    // =================== QUERY HELPERS ===================

    /**
     * فلتر بحسب حقل
     */
    whereEqual(field: string, value: any): QueryConstraint {
        return where(field, '==', value);
    },

    whereIn(field: string, values: any[]): QueryConstraint {
        return where(field, 'in', values);
    },

    orderByField(field: string, direction: 'asc' | 'desc' = 'desc'): QueryConstraint {
        return orderBy(field, direction);
    },

    limitTo(count: number): QueryConstraint {
        return limit(count);
    },
};

export default firestoreDataService;
