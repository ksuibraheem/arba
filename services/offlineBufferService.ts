/**
 * ARBA Cognitive Engine v4.1 — Offline Buffer Service
 * خدمة التخزين المؤقت — مقاومة الأخطاء
 * 
 * Error Resilience Layer
 * - Buffers failed Firebase writes to localStorage/IndexedDB
 * - Auto-syncs when connection is restored (online event)
 * - Supports multi-layered cognitive state (complex nested objects)
 * 
 * PATTERN: Extends the existing storeLocalFallback() in auditLogService.ts (L160)
 * 
 * M1.3: Added enqueue() / flush() / pendingCount for batch-write retry pattern
 */

import { firestoreDataService } from './firestoreDataService';

// =================== Types ===================

export interface BufferedWrite {
    id: string;
    collectionPath: string;
    docId: string;
    data: unknown;
    operationType: 'create' | 'update' | 'delete';
    timestamp: number;
    retryCount: number;
    maxRetries: number;
    lastError?: string;
    /**
     * Field names to (re)stamp with Firestore serverTimestamp() at write/replay
     * time. The FieldValue sentinel is NOT JSON-serializable, so we never store
     * it in localStorage; we record field names and rebuild the sentinel right
     * before the actual Firestore write.
     */
    serverTimestampFields?: string[];
}

export interface SyncResult {
    total: number;
    synced: number;
    failed: number;
    remaining: number;
}

// M1.3: Batch-write pending queue item
interface PendingBatchWrite {
  id: string;
  collection: string;
  items: { id: string; data: Record<string, any> }[];
  timestamp: string;
  retryCount: number;
}

// =================== Service ===================

const BUFFER_KEY = 'arba_offline_buffer';
const BATCH_BUFFER_KEY = 'arba_offline_batch_buffer';
const MAX_BUFFER_SIZE = 200;
const MAX_RETRIES = 5;

class OfflineBufferService {
    private _isOnline: boolean = navigator.onLine;
    private _syncInProgress: boolean = false;
    private _listeners: Array<(result: SyncResult) => void> = [];

    constructor() {
        // Listen for connectivity changes
        if (typeof window !== 'undefined') {
            window.addEventListener('online', () => {
                this._isOnline = true;
                this.autoSync();
            });
            window.addEventListener('offline', () => {
                this._isOnline = false;
            });
        }
    }

    // =================== Buffer Operations ===================

    /**
     * Add a failed write to the offline buffer.
     * Call this when a Firebase write fails.
     */
    addToBuffer(entry: Omit<BufferedWrite, 'id' | 'timestamp' | 'retryCount' | 'maxRetries'>): void {
        const buffer = this.getBuffer();

        const newEntry: BufferedWrite = {
            ...entry,
            id: `buf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            timestamp: Date.now(),
            retryCount: 0,
            maxRetries: MAX_RETRIES,
        };

        buffer.push(newEntry);

        // Trim if too large (FIFO)
        if (buffer.length > MAX_BUFFER_SIZE) {
            buffer.splice(0, buffer.length - MAX_BUFFER_SIZE);
        }

        this.saveBuffer(buffer);
    }

    /**
     * Remove a successfully synced entry from the buffer
     */
    removeFromBuffer(entryId: string): void {
        const buffer = this.getBuffer().filter(e => e.id !== entryId);
        this.saveBuffer(buffer);
    }

    /**
     * Get all pending writes
     */
    getPendingWrites(): BufferedWrite[] {
        return this.getBuffer().filter(e => e.retryCount < e.maxRetries);
    }

    /**
     * Get buffer stats
     */
    getBufferStats(): { total: number; pending: number; failed: number } {
        const buffer = this.getBuffer();
        return {
            total: buffer.length,
            pending: buffer.filter(e => e.retryCount < e.maxRetries).length,
            failed: buffer.filter(e => e.retryCount >= e.maxRetries).length,
        };
    }

    // =================== Safe Write (Try Firebase → Fallback to Buffer) ===================

    /**
     * Attempt to write to Firebase. If it fails, buffer locally.
     * Returns the source of the successful write.
     */
    async safeWrite(
        collectionPath: string,
        docId: string,
        data: unknown,
        operationType: 'create' | 'update',
        firebaseWriter: (path: string, id: string, data: unknown) => Promise<void>,
        serverTimestampFields: string[] = []
    ): Promise<{ success: boolean; source: 'firebase' | 'local'; buffered?: boolean }> {

        // `data` MUST be plain/JSON-serializable (no serverTimestamp() sentinels).
        // Timestamp fields are named in serverTimestampFields and stamped at write time.

        // If clearly offline, buffer immediately
        if (!this._isOnline) {
            this.addToBuffer({ collectionPath, docId, data, operationType, serverTimestampFields });
            return { success: true, source: 'local' };
        }

        try {
            const payload = await this.applyServerTimestamps(data, serverTimestampFields);
            await firebaseWriter(collectionPath, docId, payload);
            return { success: true, source: 'firebase' };
        } catch (error) {
            console.warn('[OfflineBuffer] Firebase write failed, buffering locally:', error);
            try {
                this.addToBuffer({
                    collectionPath, docId, data, operationType, serverTimestampFields,
                    lastError: error instanceof Error ? error.message : 'Unknown error',
                });
                return { success: true, source: 'local' as const, buffered: true };
            } catch (bufferError) {
                console.error('[OfflineBuffer] Both Firebase and buffer failed:', bufferError);
                return { success: false, source: 'local' as const, buffered: false };
            }
        }
    }

    /**
     * Rebuild a write payload, replacing each named field with a fresh
     * serverTimestamp(). Async so firebase is only imported when writing.
     */
    private async applyServerTimestamps(data: unknown, fields?: string[]): Promise<unknown> {
        if (!fields || fields.length === 0 || typeof data !== 'object' || data === null) {
            return data;
        }
        const { serverTimestamp } = await import('firebase/firestore');
        const out: Record<string, unknown> = { ...(data as Record<string, unknown>) };
        for (const field of fields) {
            out[field] = serverTimestamp();
        }
        return out;
    }

    // =================== Auto-Sync ===================

    /**
     * Attempt to sync all pending writes to Firebase.
     * Called automatically when the connection is restored.
     */
    async syncPendingWrites(
        firebaseWriter: (path: string, id: string, data: unknown) => Promise<void>
    ): Promise<SyncResult> {
        if (this._syncInProgress) {
            return { total: 0, synced: 0, failed: 0, remaining: 0 };
        }

        this._syncInProgress = true;
        const buffer = this.getBuffer();
        let synced = 0;
        let failed = 0;

        // Rebuild the buffer from the entries that were NOT successfully synced.
        // (The previous version re-saved the whole array at the end, which
        // resurrected already-synced entries so the buffer never emptied.)
        const remaining: BufferedWrite[] = [];
        for (const entry of buffer) {
            if (entry.retryCount >= entry.maxRetries) {
                failed++;
                remaining.push(entry); // keep maxed-out entries (do not silently lose data)
                continue;
            }

            try {
                const payload = await this.applyServerTimestamps(entry.data, entry.serverTimestampFields);
                await firebaseWriter(entry.collectionPath, entry.docId, payload);
                synced++; // success -> drop from buffer
            } catch {
                entry.retryCount++;
                if (entry.retryCount >= entry.maxRetries) {
                    failed++;
                }
                remaining.push(entry); // keep for a later retry
            }
        }

        this.saveBuffer(remaining);
        this._syncInProgress = false;

        const result: SyncResult = {
            total: buffer.length,
            synced,
            failed,
            remaining: remaining.length,
        };

        // Notify listeners
        this._listeners.forEach(cb => cb(result));
        return result;
    }

    // =================== Event Listeners ===================

    /**
     * Register a callback for sync completion events
     */
    onSyncComplete(callback: (result: SyncResult) => void): () => void {
        this._listeners.push(callback);
        return () => {
            this._listeners = this._listeners.filter(cb => cb !== callback);
        };
    }

    /**
     * Check if there are pending writes
     */
    hasPendingWrites(): boolean {
        return this.getPendingWrites().length > 0;
    }

    get isOnline(): boolean {
        return this._isOnline;
    }

    // =================== M1.3: Batch-Write Retry Queue ===================

    /**
     * Enqueue a failed batchWrite for later retry.
     * Used by accounting/supplier save methods to replace silent fire-and-forget.
     */
    async enqueue(collection: string, items: { id: string; data: Record<string, any> }[]): Promise<void> {
        const pending = this.getBatchPending();
        pending.push({
            id: crypto.randomUUID(),
            collection,
            items,
            timestamp: new Date().toISOString(),
            retryCount: 0
        });
        this.saveBatchPending(pending);
        console.log(`📦 [OfflineBuffer] Queued ${items.length} items for ${collection}`);
    }

    /**
     * Flush all queued batch writes, retrying up to 5 times per entry.
     */
    async flush(): Promise<{ flushed: number; failed: number }> {
        const pending = this.getBatchPending();
        if (pending.length === 0) return { flushed: 0, failed: 0 };

        let flushed = 0;
        let failed = 0;
        const remaining: PendingBatchWrite[] = [];

        for (const write of pending) {
            try {
                await firestoreDataService.batchWrite(write.collection, write.items);
                flushed++;
            } catch {
                write.retryCount++;
                if (write.retryCount < 5) {
                    remaining.push(write);
                }
                failed++;
            }
        }

        this.saveBatchPending(remaining);
        console.log(`🔄 [OfflineBuffer] Flush complete: ${flushed} ok, ${failed} failed, ${remaining.length} remaining`);
        return { flushed, failed };
    }

    get pendingCount(): number {
        return this.getBatchPending().length;
    }

    private getBatchPending(): PendingBatchWrite[] {
        try { return JSON.parse(localStorage.getItem(BATCH_BUFFER_KEY) || '[]'); } catch { return []; }
    }

    private saveBatchPending(pending: PendingBatchWrite[]): void {
        localStorage.setItem(BATCH_BUFFER_KEY, JSON.stringify(pending));
    }

    // =================== Private Auto-Sync ===================

    private async autoSync(): Promise<void> {
        console.info('[OfflineBuffer] Connection restored — auto-flushing buffer...');
        // Flush batch writes first
        try {
            const batchResult = await this.flush();
            if (batchResult.flushed > 0) {
                console.info(`[OfflineBuffer] Auto-flushed ${batchResult.flushed} batch writes`);
            }
        } catch (err) {
            console.warn('[OfflineBuffer] Batch auto-flush failed:', err);
        }
        // Use the default Firestore writer for single-doc writes
        try {
            const { doc, setDoc } = await import('firebase/firestore');
            const { db } = await import('../firebase/config');
            const writer = async (collPath: string, docId: string, data: unknown) => {
                const docRef = doc(db, collPath, docId);
                await setDoc(docRef, data as Record<string, unknown>, { merge: true });
            };
            const result = await this.syncPendingWrites(writer);
            console.info(`[OfflineBuffer] Auto-flushed: ${result.synced} synced, ${result.failed} failed`);
        } catch (err) {
            console.warn('[OfflineBuffer] Auto-flush failed:', err);
        }
    }

    // =================== Persistence ===================

    private getBuffer(): BufferedWrite[] {
        try { return JSON.parse(localStorage.getItem(BUFFER_KEY) || '[]'); } catch { return []; }
    }

    private saveBuffer(buffer: BufferedWrite[]): void {
        localStorage.setItem(BUFFER_KEY, JSON.stringify(buffer));
    }
}

export const offlineBufferService = new OfflineBufferService();
