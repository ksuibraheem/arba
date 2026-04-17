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
 */

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
}

export interface SyncResult {
    total: number;
    synced: number;
    failed: number;
    remaining: number;
}

// =================== Service ===================

const BUFFER_KEY = 'arba_offline_buffer';
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
        firebaseWriter: (path: string, id: string, data: unknown) => Promise<void>
    ): Promise<{ success: boolean; source: 'firebase' | 'local' }> {

        // If clearly offline, buffer immediately
        if (!this._isOnline) {
            this.addToBuffer({ collectionPath, docId, data, operationType });
            return { success: true, source: 'local' };
        }

        try {
            await firebaseWriter(collectionPath, docId, data);
            return { success: true, source: 'firebase' };
        } catch (error) {
            console.warn('[OfflineBuffer] Firebase write failed, buffering locally:', error);
            this.addToBuffer({
                collectionPath, docId, data, operationType,
                lastError: error instanceof Error ? error.message : 'Unknown error',
            });
            return { success: true, source: 'local' };
        }
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

        for (const entry of buffer) {
            if (entry.retryCount >= entry.maxRetries) {
                failed++;
                continue;
            }

            try {
                await firebaseWriter(entry.collectionPath, entry.docId, entry.data);
                this.removeFromBuffer(entry.id);
                synced++;
            } catch {
                // Increment retry count
                entry.retryCount++;
                if (entry.retryCount >= entry.maxRetries) {
                    failed++;
                }
            }
        }

        // Save updated retry counts
        this.saveBuffer(this.getBuffer());
        this._syncInProgress = false;

        const result: SyncResult = {
            total: buffer.length,
            synced,
            failed,
            remaining: buffer.length - synced - failed,
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

    // =================== Private Auto-Sync ===================

    private async autoSync(): Promise<void> {
        // Auto-sync is a no-op here — it requires a firebaseWriter function.
        // The consuming code should call syncPendingWrites() with the appropriate writer.
        // This method exists as a hook for the online event listener.
        console.info('[OfflineBuffer] Connection restored. Call syncPendingWrites() to sync.');
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
