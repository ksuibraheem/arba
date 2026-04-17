/**
 * Firebase Sync Service
 * خدمة مزامنة البيانات مع Firebase Firestore
 */

import { db } from '../firebase/config';
import {
    collection,
    doc,
    setDoc,
    getDoc,
    getDocs,
    writeBatch,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';

// ====================== Types ======================

export interface SyncResult {
    success: boolean;
    message: string;
    syncedCount?: number;
    failedCount?: number;
    errors?: string[];
}

export interface ConnectionStatus {
    connected: boolean;
    projectId: string;
    timestamp: Date;
    error?: string;
}

// Data mapping configuration
const DATA_MAPPINGS = [
    // الموظفين والتسجيل
    { localKey: 'arba_employees', collection: 'employees', label: 'الموظفين' },
    { localKey: 'arba_registration_requests', collection: 'registration_requests', label: 'طلبات التسجيل' },
    { localKey: 'arba_attendance', collection: 'attendance', label: 'سجلات الحضور' },
    { localKey: 'arba_notifications', collection: 'notifications', label: 'الإشعارات' },
    // المحاسبة
    { localKey: 'arba_invoices', collection: 'invoices', label: 'الفواتير' },
    { localKey: 'arba_payments', collection: 'payments', label: 'المدفوعات' },
    { localKey: 'arba_ledger', collection: 'ledger_entries', label: 'القيود المحاسبية' },
    { localKey: 'arba_subscriptions', collection: 'subscriptions', label: 'الاشتراكات' },
    { localKey: 'arba_clients', collection: 'accounting_clients', label: 'العملاء' },
    // الموردين
    { localKey: 'arba_supplier_products', collection: 'supplier_products', label: 'منتجات الموردين' },
    { localKey: 'arba_purchase_invoices', collection: 'purchase_invoices', label: 'فواتير المشتريات' },
    { localKey: 'arba_supplier_payments', collection: 'supplier_payments', label: 'مدفوعات الموردين' },
    // التواصل
    { localKey: 'arba_connect_messages', collection: 'connect_messages', label: 'رسائل التواصل' },
    { localKey: 'arba_connect_mail', collection: 'connect_mail', label: 'البريد الداخلي' },
    { localKey: 'arba_connect_forms', collection: 'connect_forms', label: 'النماذج' },
    { localKey: 'arba_connect_notes', collection: 'connect_notes', label: 'الملاحظات' },
];

// ====================== Firebase Service ======================

class FirebaseService {

    /**
     * Test connection to Firebase
     * اختبار الاتصال بـ Firebase
     */
    async testConnection(): Promise<ConnectionStatus> {
        try {
            const testDocRef = doc(db, '_connection_test', 'ping');

            // Write test document
            await setDoc(testDocRef, {
                timestamp: serverTimestamp(),
                message: 'Connection test from Arba Platform'
            });

            // Read it back
            const docSnap = await getDoc(testDocRef);

            if (docSnap.exists()) {
                return {
                    connected: true,
                    projectId: 'arba-d6baf',
                    timestamp: new Date()
                };
            } else {
                throw new Error('Could not verify write');
            }
        } catch (error: any) {
            console.error('Firebase connection test failed:', error);
            return {
                connected: false,
                projectId: 'arba-d6baf',
                timestamp: new Date(),
                error: error.message || 'Unknown error'
            };
        }
    }

    /**
     * Sync all local data to Firebase
     * مزامنة جميع البيانات المحلية مع Firebase
     */
    async syncAllData(
        onProgress?: (current: number, total: number, label: string) => void
    ): Promise<SyncResult> {
        const errors: string[] = [];
        let totalSynced = 0;
        let totalFailed = 0;

        for (let i = 0; i < DATA_MAPPINGS.length; i++) {
            const mapping = DATA_MAPPINGS[i];

            if (onProgress) {
                onProgress(i + 1, DATA_MAPPINGS.length, mapping.label);
            }

            try {
                const result = await this.syncCollection(mapping.localKey, mapping.collection);
                totalSynced += result.syncedCount || 0;
                totalFailed += result.failedCount || 0;

                if (result.errors) {
                    errors.push(...result.errors);
                }
            } catch (error: any) {
                errors.push(`${mapping.label}: ${error.message}`);
                totalFailed++;
            }
        }

        return {
            success: errors.length === 0,
            message: errors.length === 0
                ? `تم مزامنة ${totalSynced} سجل بنجاح`
                : `تم مزامنة ${totalSynced} سجل مع ${totalFailed} أخطاء`,
            syncedCount: totalSynced,
            failedCount: totalFailed,
            errors: errors.length > 0 ? errors : undefined
        };
    }

    /**
     * Sync a specific collection from localStorage to Firestore
     * مزامنة مجموعة محددة من التخزين المحلي إلى Firestore
     */
    async syncCollection(localKey: string, collectionName: string): Promise<SyncResult> {
        try {
            const localData = localStorage.getItem(localKey);

            if (!localData) {
                return {
                    success: true,
                    message: 'No local data to sync',
                    syncedCount: 0
                };
            }

            const items = JSON.parse(localData);

            if (!Array.isArray(items) || items.length === 0) {
                return {
                    success: true,
                    message: 'Empty collection',
                    syncedCount: 0
                };
            }

            // 🔥 Use firestoreDataService for routing through arba_config
            const { firestoreDataService } = await import('./firestoreDataService');
            const batchItems = items.map((item: any) => ({
                id: item.id || crypto.randomUUID(),
                data: { ...item, _syncedFrom: 'local' }
            }));
            const result = await firestoreDataService.batchWrite(collectionName, batchItems);
            if (result.success) {
            }
            return {
                success: result.success,
                message: `Synced ${result.data || 0} items`,
                syncedCount: result.data || 0
            };
        } catch (error: any) {
            console.error(`Error syncing ${collectionName}:`, error);
            return {
                success: false,
                message: error.message,
                syncedCount: 0,
                failedCount: 1,
                errors: [error.message]
            };
        }
    }

    /**
     * Import data from Firebase to localStorage
     * استيراد البيانات من Firebase إلى التخزين المحلي
     */
    async importFromFirebase(collectionName: string, localKey: string): Promise<SyncResult> {
        try {
            const querySnapshot = await getDocs(collection(db, collectionName));
            const items: any[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                // Convert Firestore Timestamps to ISO strings
                const cleanData = this.convertTimestamps(data);
                items.push({ id: doc.id, ...cleanData });
            });

            localStorage.setItem(localKey, JSON.stringify(items));
            return {
                success: true,
                message: `Imported ${items.length} items`,
                syncedCount: items.length
            };
        } catch (error: any) {
            console.error(`Error importing ${collectionName}:`, error);
            return {
                success: false,
                message: error.message,
                errors: [error.message]
            };
        }
    }

    /**
     * Convert Firestore Timestamps to ISO strings
     */
    private convertTimestamps(obj: any): any {
        if (obj === null || obj === undefined) return obj;

        if (obj instanceof Timestamp) {
            return obj.toDate().toISOString();
        }

        if (Array.isArray(obj)) {
            return obj.map(item => this.convertTimestamps(item));
        }

        if (typeof obj === 'object') {
            const result: any = {};
            for (const key in obj) {
                result[key] = this.convertTimestamps(obj[key]);
            }
            return result;
        }

        return obj;
    }

    /**
     * Get data mappings for UI
     */
    getDataMappings() {
        return DATA_MAPPINGS;
    }
}

export const firebaseService = new FirebaseService();
export default firebaseService;
