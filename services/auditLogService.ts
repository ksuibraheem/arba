/**
 * Audit Log Service — خدمة سجل المراجعة
 * 
 * Firestore sub-collection: projects/{id}/priceHistory
 * Logs every price/thickness/margin modification for version control.
 * 
 * 🏰 THE FORTRESS — Immutable Audit Trail
 */

import { Timestamp } from 'firebase/firestore';

// =================== TYPES ===================

export type AuditAction =
    | 'price_manual_override'
    | 'price_supplier_update'
    | 'price_api_update'
    | 'price_benchmark_update'
    | 'thickness_change'
    | 'margin_change'
    | 'wastage_change'
    | 'quantity_override'
    | 'supplier_change'
    | 'certification_issued'
    | 'certification_verified';

export interface PriceHistoryEntry {
    id: string;
    projectId: string;
    itemId: string;
    action: AuditAction;
    
    // What changed
    field: string;
    previousValue: number | string | null;
    newValue: number | string;
    
    // Context
    source: 'manual' | 'supplier_link' | 'api' | 'arba_benchmark';
    reason?: string;
    
    // Who & When
    userId: string;
    userName: string;
    timestamp: Timestamp | Date;
    
    // Integrity
    engineVersion: string;
    signatureHash?: string;
}

export interface AuditSummary {
    totalChanges: number;
    lastModified: Date | null;
    lastModifiedBy: string | null;
    changesByAction: Record<AuditAction, number>;
}

// =================== SERVICE ===================

const USE_FIREBASE = true; // Will use Firestore in production

/**
 * Log a price modification to the audit trail
 */
export async function logPriceChange(entry: Omit<PriceHistoryEntry, 'id' | 'timestamp' | 'engineVersion'>): Promise<string> {
    const id = crypto.randomUUID ? crypto.randomUUID() : `audit_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    
    const fullEntry: PriceHistoryEntry = {
        ...entry,
        id,
        timestamp: new Date(),
        engineVersion: 'arba-engine-v2',
    };

    if (USE_FIREBASE) {
        try {
            // Dynamic import to avoid bundling Firebase in non-Firebase builds
            const { doc, setDoc, collection } = await import('firebase/firestore');
            const { db } = await import('../firebase/config');
            
            const historyRef = doc(
                collection(db, 'projects', entry.projectId, 'priceHistory'),
                id
            );
            
            await setDoc(historyRef, fullEntry);
        } catch (err) {
            console.error('[AuditLog] Failed to log to Firestore:', err);
            // Fallback: store in localStorage for later sync
            storeLocalFallback(fullEntry);
        }
    } else {
        // Local-only mode: store in localStorage
        storeLocalFallback(fullEntry);
    }

    return id;
}

/**
 * Get price history for a specific project item
 */
export async function getItemHistory(projectId: string, itemId: string): Promise<PriceHistoryEntry[]> {
    if (USE_FIREBASE) {
        try {
            const { collection, query, where, orderBy, getDocs } = await import('firebase/firestore');
            const { db } = await import('../firebase/config');
            
            const historyRef = collection(db, 'projects', projectId, 'priceHistory');
            const q = query(
                historyRef,
                where('itemId', '==', itemId),
                orderBy('timestamp', 'desc')
            );
            
            const snapshot = await getDocs(q);
            return snapshot.docs.map(doc => doc.data() as PriceHistoryEntry);
        } catch (err) {
            console.error('[AuditLog] Failed to fetch from Firestore:', err);
            return getLocalFallback(projectId, itemId);
        }
    }
    
    return getLocalFallback(projectId, itemId);
}

/**
 * Get audit summary for a project
 */
export async function getProjectAuditSummary(projectId: string): Promise<AuditSummary> {
    if (USE_FIREBASE) {
        try {
            const { collection, orderBy: orderByFn, getDocs, query } = await import('firebase/firestore');
            const { db } = await import('../firebase/config');
            
            const historyRef = collection(db, 'projects', projectId, 'priceHistory');
            const q = query(historyRef, orderByFn('timestamp', 'desc'));
            const snapshot = await getDocs(q);
            
            const entries = snapshot.docs.map(doc => doc.data() as PriceHistoryEntry);
            return buildSummary(entries);
        } catch (err) {
            console.error('[AuditLog] Failed to build summary:', err);
        }
    }

    return {
        totalChanges: 0,
        lastModified: null,
        lastModifiedBy: null,
        changesByAction: {} as Record<AuditAction, number>,
    };
}

// =================== LOCAL FALLBACK ===================

const LOCAL_AUDIT_KEY = 'arba_audit_log';

function storeLocalFallback(entry: PriceHistoryEntry): void {
    try {
        const existing = JSON.parse(localStorage.getItem(LOCAL_AUDIT_KEY) || '[]');
        existing.push(entry);
        // Keep only last 500 entries locally
        if (existing.length > 500) existing.splice(0, existing.length - 500);
        localStorage.setItem(LOCAL_AUDIT_KEY, JSON.stringify(existing));
    } catch {
        // Silently fail
    }
}

function getLocalFallback(projectId: string, itemId: string): PriceHistoryEntry[] {
    try {
        const all: PriceHistoryEntry[] = JSON.parse(localStorage.getItem(LOCAL_AUDIT_KEY) || '[]');
        return all.filter(e => e.projectId === projectId && e.itemId === itemId);
    } catch {
        return [];
    }
}

function buildSummary(entries: PriceHistoryEntry[]): AuditSummary {
    const changesByAction: Record<string, number> = {};
    
    for (const entry of entries) {
        changesByAction[entry.action] = (changesByAction[entry.action] || 0) + 1;
    }

    return {
        totalChanges: entries.length,
        lastModified: entries.length > 0 ? new Date(entries[0].timestamp as any) : null,
        lastModifiedBy: entries.length > 0 ? entries[0].userName : null,
        changesByAction: changesByAction as Record<AuditAction, number>,
    };
}
