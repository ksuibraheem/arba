"use strict";
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
exports.offlineBufferService = void 0;
// =================== Service ===================
const BUFFER_KEY = 'arba_offline_buffer';
const MAX_BUFFER_SIZE = 200;
const MAX_RETRIES = 5;
class OfflineBufferService {
    _isOnline = navigator.onLine;
    _syncInProgress = false;
    _listeners = [];
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
    addToBuffer(entry) {
        const buffer = this.getBuffer();
        const newEntry = {
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
    removeFromBuffer(entryId) {
        const buffer = this.getBuffer().filter(e => e.id !== entryId);
        this.saveBuffer(buffer);
    }
    /**
     * Get all pending writes
     */
    getPendingWrites() {
        return this.getBuffer().filter(e => e.retryCount < e.maxRetries);
    }
    /**
     * Get buffer stats
     */
    getBufferStats() {
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
    async safeWrite(collectionPath, docId, data, operationType, firebaseWriter, serverTimestampFields = []) {
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
        }
        catch (error) {
            console.warn('[OfflineBuffer] Firebase write failed, buffering locally:', error);
            try {
                this.addToBuffer({
                    collectionPath, docId, data, operationType, serverTimestampFields,
                    lastError: error instanceof Error ? error.message : 'Unknown error',
                });
                return { success: true, source: 'local', buffered: true };
            }
            catch (bufferError) {
                console.error('[OfflineBuffer] Both Firebase and buffer failed:', bufferError);
                return { success: false, source: 'local', buffered: false };
            }
        }
    }
    /**
     * Rebuild a write payload, replacing each named field with a fresh
     * serverTimestamp(). Async so firebase is only imported when writing.
     */
    async applyServerTimestamps(data, fields) {
        if (!fields || fields.length === 0 || typeof data !== 'object' || data === null) {
            return data;
        }
        const { serverTimestamp } = await Promise.resolve().then(() => __importStar(require('firebase/firestore')));
        const out = { ...data };
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
    async syncPendingWrites(firebaseWriter) {
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
        const remaining = [];
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
            }
            catch {
                entry.retryCount++;
                if (entry.retryCount >= entry.maxRetries) {
                    failed++;
                }
                remaining.push(entry); // keep for a later retry
            }
        }
        this.saveBuffer(remaining);
        this._syncInProgress = false;
        const result = {
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
    onSyncComplete(callback) {
        this._listeners.push(callback);
        return () => {
            this._listeners = this._listeners.filter(cb => cb !== callback);
        };
    }
    /**
     * Check if there are pending writes
     */
    hasPendingWrites() {
        return this.getPendingWrites().length > 0;
    }
    get isOnline() {
        return this._isOnline;
    }
    // =================== Private Auto-Sync ===================
    async autoSync() {
        console.info('[OfflineBuffer] Connection restored — auto-flushing buffer...');
        // Use the default Firestore writer
        try {
            const { doc, setDoc } = await Promise.resolve().then(() => __importStar(require('firebase/firestore')));
            const { db } = await Promise.resolve().then(() => __importStar(require('../firebase/config')));
            const writer = async (collPath, docId, data) => {
                const docRef = doc(db, collPath, docId);
                await setDoc(docRef, data, { merge: true });
            };
            const result = await this.syncPendingWrites(writer);
            console.info(`[OfflineBuffer] Auto-flushed: ${result.synced} synced, ${result.failed} failed`);
        }
        catch (err) {
            console.warn('[OfflineBuffer] Auto-flush failed:', err);
        }
    }
    // =================== Persistence ===================
    getBuffer() {
        try {
            return JSON.parse(localStorage.getItem(BUFFER_KEY) || '[]');
        }
        catch {
            return [];
        }
    }
    saveBuffer(buffer) {
        localStorage.setItem(BUFFER_KEY, JSON.stringify(buffer));
    }
}
exports.offlineBufferService = new OfflineBufferService();
