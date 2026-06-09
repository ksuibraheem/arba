/**
 * ARBA V10.0 — Brain Firestore Sync Service
 * خدمة مزامنة الدماغ مع Firestore — 24/7
 *
 * تضمن أن كل بيانات الدماغ محفوظة في السحابة ولا تُفقد عند مسح الكاش.
 * 
 * الطبقات:
 * 1. Auto-sync: كل كتابة لـ localStorage → تُنسخ لـ Firestore تلقائياً
 * 2. Pull on startup: عند فتح التطبيق → يسحب آخر بيانات من Firestore
 * 3. Scheduled sync: كل 5 دقائق → يتأكد إن كل شي متزامن
 * 4. Offline buffer: لو مافيه نت → يحفظ الطلبات ويرسلها لما يرجع النت
 */

import { db } from '../firebase/config';
import {
  doc,
  setDoc,
  getDoc,
  collection,
  serverTimestamp,
  Timestamp,
  writeBatch,
} from 'firebase/firestore';
import { offlineBufferService } from './offlineBufferService';

// =================== Types ===================

export interface SyncReport {
  syncedKeys: string[];
  failedKeys: string[];
  totalSynced: number;
  totalFailed: number;
  timestamp: Date;
  direction: 'push' | 'pull' | 'both';
}

export interface BrainHealthStatus {
  lastSync: Date | null;
  syncStatus: 'healthy' | 'stale' | 'disconnected';
  pendingWrites: number;
  firestoreConnected: boolean;
  maturityScore: number;
}

interface QueuedWrite {
  key: string;
  value: string;
  timestamp: number;
  retries: number;
}

// =================== Constants ===================

/** Brain-specific localStorage keys to sync */
const BRAIN_SYNC_KEYS = [
  // Collective Brain
  'arba_collective_brain_insights',
  // Learning Feedback
  'arba_learning_data',
  'arba_learning_weights',
  // Silent Brain Tracker
  'arba_brain_sessions',
  'arba_brain_pages',
  'arba_brain_overrides',
  'arba_brain_quotes',
  'arba_brain_errors',
  'arba_brain_features',
  'arba_brain_hourly',
  'arba_brain_daily',
  'arba_brain_calc_times',
  // Brain Auto-Updates (learned prices)
  'arba_brain_auto_updates',
  // Reasoning Portal
  'arba_reasoning_nodes',
  // Commodity prices
  'arba_commodity_prices',
  'arba_commodity_history',
  'arba_commodity_alerts',
  // Brain Test Knowledge Base (error patterns)
  'arba_brain_error_patterns',
  // Project tracking
  'arba_brain_projects',
  'arba_brain_locations',
];

const SYNC_QUEUE_KEY = 'arba_brain_sync_queue';
const LAST_SYNC_KEY = 'arba_brain_last_sync';
const AUTO_SYNC_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
const MAX_RETRIES = 3;

// =================== Service ===================

class BrainFirestoreSync {
  private autoSyncTimer: ReturnType<typeof setInterval> | null = null;
  private syncQueue: QueuedWrite[] = [];
  private isSyncing = false;

  // ═══════════════════════════════════════════════════
  // Push: localStorage → Firestore
  // ═══════════════════════════════════════════════════

  /**
   * Push all brain data from localStorage to Firestore
   * يدفع كل بيانات الدماغ من المتصفح إلى السحابة
   */
  async pushAll(userId: string): Promise<SyncReport> {
    return new Promise((resolve) => {
      const doSync = async () => {
        const synced: string[] = [];
        const failed: string[] = [];
        const batch = writeBatch(db);

        for (const key of BRAIN_SYNC_KEYS) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              const docRef = doc(db, 'brain_data', userId, 'keys', key);
              batch.set(docRef, {
                key,
                value,
                updatedAt: serverTimestamp(),
                sizeBytes: new Blob([value]).size,
              }, { merge: true });
              synced.push(key);
            }
          } catch (err) {
            failed.push(key);
            this.addToQueue(key, localStorage.getItem(key) || '');
          }
        }

        try {
          await batch.commit();
        } catch (batchErr) {
          // Batch failed — move all to offline buffer
          for (const key of synced) {
            this.addToQueue(key, localStorage.getItem(key) || '');
            offlineBufferService.addToBuffer({
              collectionPath: `brain_data/${userId}/keys`,
              docId: key,
              data: { key, value: localStorage.getItem(key) || '' },
              operationType: 'update',
            });
          }
          failed.push(...synced);
          synced.length = 0;
        }

        const now = new Date();
        localStorage.setItem(LAST_SYNC_KEY, now.toISOString());

        resolve({
          syncedKeys: synced,
          failedKeys: failed,
          totalSynced: synced.length,
          totalFailed: failed.length,
          timestamp: now,
          direction: 'push',
        });
      };

      if (typeof requestIdleCallback === 'function') {
        requestIdleCallback(() => doSync());
      } else {
        setTimeout(() => doSync(), 0);
      }
    });
  }

  /**
   * Push a single key to Firestore
   */
  private async pushKey(userId: string, key: string, value: string): Promise<void> {
    const docRef = doc(db, 'brain_data', userId, 'keys', key);
    await setDoc(docRef, {
      key,
      value,
      updatedAt: serverTimestamp(),
      sizeBytes: new Blob([value]).size,
    }, { merge: true });
  }

  // ═══════════════════════════════════════════════════
  // Pull: Firestore → localStorage
  // ═══════════════════════════════════════════════════

  /**
   * Pull all brain data from Firestore to localStorage
   * يسحب كل بيانات الدماغ من السحابة إلى المتصفح
   */
  async pullAll(userId: string): Promise<SyncReport> {
    const synced: string[] = [];
    const failed: string[] = [];

    for (const key of BRAIN_SYNC_KEYS) {
      try {
        const docRef = doc(db, 'brain_data', userId, 'keys', key);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          const data = docSnap.data();
          const localValue = localStorage.getItem(key);
          const remoteValue = data.value;

          if (!localValue || localValue === '[]' || localValue === '{}') {
            localStorage.setItem(key, remoteValue);
            synced.push(key);
          } else {
            // ID-based Array Merge Strategy
            try {
              const localData = JSON.parse(localValue);
              const remoteData = JSON.parse(remoteValue);

              if (Array.isArray(localData) && Array.isArray(remoteData)) {
                // Merge arrays by ID, keeping newer entries
                const merged = new Map<string, any>();
                for (const item of remoteData) {
                  const id = item.id || item.itemId || item.key || JSON.stringify(item);
                  merged.set(id, item);
                }
                for (const item of localData) {
                  const id = item.id || item.itemId || item.key || JSON.stringify(item);
                  // Local entry overrides remote (local is fresher during active session)
                  merged.set(id, item);
                }
                localStorage.setItem(key, JSON.stringify(Array.from(merged.values())));
                synced.push(key);
              } else if (typeof localData === 'object' && typeof remoteData === 'object') {
                // Merge objects: local keys override remote keys
                const mergedObj = { ...remoteData, ...localData };
                localStorage.setItem(key, JSON.stringify(mergedObj));
                synced.push(key);
              } else {
                // Primitive or unknown — keep local (active session wins)
                synced.push(key);
              }
            } catch {
              // Parse failed — keep the bigger one as fallback
              const localSize = new Blob([localValue]).size;
              const remoteSize = new Blob([remoteValue]).size;
              if (remoteSize > localSize) {
                localStorage.setItem(key, remoteValue);
              }
              synced.push(key);
            }
          }
        }
      } catch (err) {
        console.error(`❌ Pull failed for ${key}:`, err);
        failed.push(key);
      }
    }

    return {
      syncedKeys: synced,
      failedKeys: failed,
      totalSynced: synced.length,
      totalFailed: failed.length,
      timestamp: new Date(),
      direction: 'pull',
    };
  }

  // ═══════════════════════════════════════════════════
  // Auto-Sync: Scheduled bidirectional sync
  // ═══════════════════════════════════════════════════

  /**
   * Start auto-sync every 5 minutes
   * يبدأ المزامنة التلقائية كل 5 دقائق
   */
  startAutoSync(userId: string, intervalMs: number = AUTO_SYNC_INTERVAL_MS): void {
    // Stop any existing timer
    this.stopAutoSync();

    // Initial pull on startup
    this.pullAll(userId).then(report => {
      console.log(`🧠 Brain pull: ${report.totalSynced} keys loaded from Firestore`);
    }).catch(err => {
      console.warn('🧠 Brain pull failed (offline?):', err);
    });

    // Periodic sync
    this.autoSyncTimer = setInterval(async () => {
      if (this.isSyncing) return;
      this.isSyncing = true;

      try {
        // 1. Flush any queued writes first
        await this.flushQueue(userId);

        // 2. Push current state
        const report = await this.pushAll(userId);

        if (report.totalSynced > 0) {
          console.log(`🧠 Brain sync: ${report.totalSynced} keys pushed to Firestore`);
        }

        // 3. Update health status
        await this.updateHealthStatus(userId);
      } catch (err) {
        console.warn('🧠 Auto-sync failed:', err);
      } finally {
        this.isSyncing = false;
      }
    }, intervalMs);

    console.log(`🧠 Brain auto-sync started (every ${intervalMs / 1000}s)`);
  }

  /**
   * Stop auto-sync
   */
  stopAutoSync(): void {
    if (this.autoSyncTimer) {
      clearInterval(this.autoSyncTimer);
      this.autoSyncTimer = null;
      console.log('🧠 Brain auto-sync stopped');
    }
  }

  // ═══════════════════════════════════════════════════
  // Sync on Write: Intercept localStorage writes
  // ═══════════════════════════════════════════════════

  /**
   * Queue a key for syncing (called when localStorage is written)
   * يضيف مفتاح لقائمة المزامنة عند أي كتابة
   */
  queueSync(key: string, value: string): void {
    if (!BRAIN_SYNC_KEYS.includes(key)) return;
    this.addToQueue(key, value);
  }

  // ═══════════════════════════════════════════════════
  // Offline Buffer
  // ═══════════════════════════════════════════════════

  private addToQueue(key: string, value: string): void {
    // Remove existing entry for same key
    this.syncQueue = this.syncQueue.filter(q => q.key !== key);

    this.syncQueue.push({
      key,
      value,
      timestamp: Date.now(),
      retries: 0,
    });

    // Persist queue to localStorage
    try {
      localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(this.syncQueue));
    } catch { /* storage full */ }
  }

  /**
   * Flush all queued writes to Firestore
   */
  async flushQueue(userId: string): Promise<number> {
    // Load persisted queue
    try {
      const raw = localStorage.getItem(SYNC_QUEUE_KEY);
      if (raw) {
        this.syncQueue = JSON.parse(raw);
      }
    } catch { /* corrupt data */ }

    if (this.syncQueue.length === 0) return 0;

    let flushed = 0;
    const remaining: QueuedWrite[] = [];

    for (const item of this.syncQueue) {
      try {
        await this.pushKey(userId, item.key, item.value);
        flushed++;
      } catch {
        if (item.retries < MAX_RETRIES) {
          remaining.push({ ...item, retries: item.retries + 1 });
        }
        // Drop items that exceeded max retries
      }
    }

    this.syncQueue = remaining;
    localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(remaining));

    return flushed;
  }

  // ═══════════════════════════════════════════════════
  // Health Status
  // ═══════════════════════════════════════════════════

  /**
   * Get current brain health status
   */
  getHealthStatus(): BrainHealthStatus {
    const lastSyncStr = localStorage.getItem(LAST_SYNC_KEY);
    const lastSync = lastSyncStr ? new Date(lastSyncStr) : null;

    let syncStatus: BrainHealthStatus['syncStatus'] = 'disconnected';
    if (lastSync) {
      const ageMinutes = (Date.now() - lastSync.getTime()) / (1000 * 60);
      syncStatus = ageMinutes < 10 ? 'healthy' : ageMinutes < 60 ? 'stale' : 'disconnected';
    }

    return {
      lastSync,
      syncStatus,
      pendingWrites: this.syncQueue.length,
      firestoreConnected: syncStatus !== 'disconnected',
      maturityScore: this.calculateMaturity(),
    };
  }

  /**
   * Update health status in Firestore (for Cloud Functions monitoring)
   */
  private async updateHealthStatus(userId: string): Promise<void> {
    try {
      const status = this.getHealthStatus();
      await setDoc(doc(db, 'brain_health', userId), {
        ...status,
        lastSync: serverTimestamp(),
        syncStatus: 'healthy',
        firestoreConnected: true,
        updatedAt: serverTimestamp(),
      });
    } catch { /* non-critical */ }
  }

  /**
   * Calculate brain maturity score (0-100)
   */
  private calculateMaturity(): number {
    let score = 42; // Base score

    // +8 if learning data exists
    try {
      const learning = JSON.parse(localStorage.getItem('arba_learning_data') || '[]');
      if (learning.length > 0) score += 8;
    } catch { /* */ }

    // +5 if collective brain has insights
    try {
      const insights = JSON.parse(localStorage.getItem('arba_collective_brain_insights') || '[]');
      if (insights.length > 0) score += 5;
    } catch { /* */ }

    // +5 if auto-updates exist (learned prices)
    try {
      const updates = JSON.parse(localStorage.getItem('arba_brain_auto_updates') || '{}');
      if (Object.keys(updates).length > 0) score += 5;
    } catch { /* */ }

    // +5 if synced to Firestore recently
    const lastSync = localStorage.getItem(LAST_SYNC_KEY);
    if (lastSync) {
      const ageHours = (Date.now() - new Date(lastSync).getTime()) / (1000 * 3600);
      if (ageHours < 1) score += 5;
    }

    return Math.min(100, score);
  }

  // ═══════════════════════════════════════════════════
  // Diagnostic data for brainSelfDiagnostic
  // ═══════════════════════════════════════════════════

  /**
   * Get sync statistics for diagnostic report
   */
  getSyncStats(): {
    keysWithData: number;
    totalKeys: number;
    totalSizeKB: number;
    oldestData: Date | null;
  } {
    let keysWithData = 0;
    let totalSize = 0;
    let oldest: Date | null = null;

    for (const key of BRAIN_SYNC_KEYS) {
      const value = localStorage.getItem(key);
      if (value && value !== '[]' && value !== '{}') {
        keysWithData++;
        totalSize += new Blob([value]).size;
      }
    }

    return {
      keysWithData,
      totalKeys: BRAIN_SYNC_KEYS.length,
      totalSizeKB: Math.round(totalSize / 1024),
      oldestData: oldest,
    };
  }
}

export const brainFirestoreSync = new BrainFirestoreSync();
