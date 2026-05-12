/**
 * ARBA Sovereign Intelligence — Proactive Sweep Engine
 * محرك المسح الذكي الاستباقي — يراقب أسعار الموردين ويحدّث تلقائياً
 * 
 * STRATEGIES:
 * 1. The 5-Day Sweep (SupplierAuditCycle):
 *    - عينة عشوائية من كل مورد خلال 5 أيام عمل
 *    - إذا تغير > 5% في العينة → DeepSync للمورد كاملاً
 * 
 * 2. Eager Loading (للسلع الحساسة):
 *    - عند بحث المستخدم عن "حديد" → فحص فوري خلف الكواليس
 *    - إذا تجاوزت الفجوة 48 ساعة عمل → تحديث قبل عرض النتيجة
 * 
 * 3. Lazy Loading (للسلع المستقرة):
 *    - يُعرض السعر المخزن فوراً
 *    - التحديث يحصل في الخلفية إذا تجاوز أسبوع عمل
 * 
 * ⚠️ Rule 3: يُحدّث Confidence_Index داخلياً ليستخدمه الدماغ
 */

import { internalMetadataService, type InternalMetadata, type VolatilityClass } from './internalMetadataService';
import { dualCalendarEngine } from './dualCalendarEngine';
import { firestoreDataService } from './firestoreDataService';
import { temporalAuditService } from './temporalAuditService';

// ====================== TYPES ======================

export interface SweepResult {
  supplierId: string;
  supplierName: string;
  sampledItems: number;
  changedItems: number;
  maxChangePercent: number;
  needsDeepSync: boolean;
  sweepDuration_ms: number;
  timestamp: string;
}

export interface SupplierAuditCycle {
  cycleId: string;
  startDate: string;
  endDate: string;           // start + 5 business days
  suppliersToAudit: string[];
  completedSuppliers: string[];
  results: SweepResult[];
  status: 'running' | 'completed' | 'partial';
}

export interface EagerCheckResult {
  itemId: string;
  wasStale: boolean;
  updatedPrice: number | null;
  previousPrice: number;
  changePercent: number;
  source: 'cache' | 'fresh_check';
  latencyMs: number;
}

// ====================== STORAGE ======================

const SWEEP_HISTORY_KEY = '_arba_sweep_history';
const ACTIVE_CYCLE_KEY = '_arba_active_audit_cycle';
const DEEP_SYNC_THRESHOLD = 5; // % change triggers deep sync
const SAMPLE_SIZE_PERCENT = 20; // % of items to sample per supplier

// ====================== CORE ENGINE ======================

export const proactiveSweepEngine = {

  // =================== 5-DAY AUDIT CYCLE ===================

  /**
   * بدء دورة تدقيق جديدة (5 أيام عمل)
   * يتم اختيار عينة عشوائية من كل مورد
   */
  startAuditCycle(supplierIds: string[]): SupplierAuditCycle {
    const now = new Date();
    
    // Calculate end date: 5 Saudi business days from now
    let endDate = new Date(now);
    let businessDays = 0;
    while (businessDays < 5) {
      endDate.setDate(endDate.getDate() + 1);
      if (dualCalendarEngine.isSaudiBusinessDay(new Date(endDate))) {
        businessDays++;
      }
    }

    const cycle: SupplierAuditCycle = {
      cycleId: `cycle_${Date.now()}`,
      startDate: now.toISOString(),
      endDate: endDate.toISOString(),
      suppliersToAudit: supplierIds,
      completedSuppliers: [],
      results: [],
      status: 'running',
    };

    try {
      localStorage.setItem(ACTIVE_CYCLE_KEY, JSON.stringify(cycle));
    } catch { /* silent */ }

    return cycle;
  },

  /**
   * مسح عينة عشوائية من مورد واحد
   */
  async sweepSupplier(
    supplierId: string,
    supplierName: string,
    supplierProducts: Array<{ id: string; name: string; price: number; category?: string }>
  ): Promise<SweepResult> {
    const startTime = performance.now();
    
    // Select random sample
    const sampleSize = Math.max(1, Math.ceil(supplierProducts.length * SAMPLE_SIZE_PERCENT / 100));
    const shuffled = [...supplierProducts].sort(() => Math.random() - 0.5);
    const sample = shuffled.slice(0, sampleSize);
    
    let changedItems = 0;
    let maxChange = 0;

    for (const product of sample) {
      const metadata = internalMetadataService.getMetadata(product.id);
      
      if (metadata) {
        // Compare stored price with current
        const storedPrice = metadata._supplier_match.best_price;
        if (storedPrice > 0 && product.price > 0) {
          const change = Math.abs((product.price - storedPrice) / storedPrice * 100);
          if (change > 2) { // More than 2% change counts
            changedItems++;
            maxChange = Math.max(maxChange, change);
          }
        }
      }

      // Update internal metadata with fresh stamp
      internalMetadataService.stampMetadata({
        itemId: product.id,
        materialName: product.name,
        category: product.category,
        currentPrice: product.price,
        previousPrice: metadata?._supplier_match.best_price,
        supplierId,
        supplierPrice: product.price,
      });
    }

    const needsDeepSync = maxChange >= DEEP_SYNC_THRESHOLD;
    const duration = performance.now() - startTime;

    const result: SweepResult = {
      supplierId,
      supplierName,
      sampledItems: sample.length,
      changedItems,
      maxChangePercent: Math.round(maxChange * 100) / 100,
      needsDeepSync,
      sweepDuration_ms: Math.round(duration),
      timestamp: new Date().toISOString(),
    };

    // Record in temporal audit
    temporalAuditService.recordAudit({
      userId: 'system_sweep',
      action: needsDeepSync ? 'supplier_deep_sync_triggered' : 'supplier_sweep_ok',
      resourceType: 'supplier',
      resourceId: supplierId,
      after: {
        sampled: sample.length,
        changed: changedItems,
        maxChange: maxChange.toFixed(2) + '%',
      },
    });

    // Update active cycle
    this._updateActiveCycle(supplierId, result);

    return result;
  },

  /**
   * إجراء DeepSync لمورد كامل (عند اكتشاف تغيير > 5%)
   */
  async deepSyncSupplier(
    supplierId: string,
    allProducts: Array<{ id: string; name: string; price: number; category?: string }>
  ): Promise<{ synced: number; updated: number }> {
    let updated = 0;

    for (const product of allProducts) {
      const metadata = internalMetadataService.getMetadata(product.id);
      const previousPrice = metadata?._supplier_match.best_price || 0;

      // Full stamp with fresh data
      internalMetadataService.stampMetadata({
        itemId: product.id,
        materialName: product.name,
        category: product.category,
        currentPrice: product.price,
        previousPrice,
        supplierId,
        supplierPrice: product.price,
        sourceReliability: 0.9, // Deep sync = high reliability
      });

      // Track price change if significant
      if (previousPrice > 0) {
        const change = Math.abs((product.price - previousPrice) / previousPrice * 100);
        if (change > 1) {
          updated++;
          temporalAuditService.recordPriceChange({
            itemId: product.id,
            itemName: product.name,
            newPrice: product.price,
            previousPrice,
            source: 'supplier',
            projectType: product.category,
          });
        }
      }
    }

    return { synced: allProducts.length, updated };
  },

  // =================== EAGER / LAZY LOADING ===================

  /**
   * Eager Check: فحص فوري عند بحث المستخدم عن سلعة حساسة
   * إذا تجاوزت الفجوة 48 ساعة عمل → تحديث قبل العرض
   */
  eagerCheck(
    itemId: string,
    materialName: string,
    currentCachedPrice: number,
    category?: string
  ): EagerCheckResult {
    const startTime = performance.now();
    const metadata = internalMetadataService.getMetadata(itemId);
    
    if (!metadata) {
      // No metadata — stamp fresh and return cached price
      internalMetadataService.stampMetadata({
        itemId,
        materialName,
        category,
        currentPrice: currentCachedPrice,
      });
      
      return {
        itemId,
        wasStale: false,
        updatedPrice: null,
        previousPrice: currentCachedPrice,
        changePercent: 0,
        source: 'cache',
        latencyMs: Math.round(performance.now() - startTime),
      };
    }

    // Check if SLA is expired
    const lastVerified = new Date(metadata._internal_status.last_verified_at);
    const strategy = dualCalendarEngine.determineUpdateStrategy(materialName, lastVerified, category);
    
    if (strategy.strategy === 'eager') {
      // SLA expired — would need to fetch fresh price from supplier API
      // For now, mark as needing update and return cached with warning
      internalMetadataService.stampMetadata({
        itemId,
        materialName,
        category,
        currentPrice: currentCachedPrice,
        sourceReliability: 0.5, // Low reliability — stale price
      });

      return {
        itemId,
        wasStale: true,
        updatedPrice: null, // Would be set by actual API call
        previousPrice: currentCachedPrice,
        changePercent: metadata._internal_status.last_price_change_percent,
        source: 'cache',
        latencyMs: Math.round(performance.now() - startTime),
      };
    }

    // Lazy — price is still fresh
    return {
      itemId,
      wasStale: false,
      updatedPrice: null,
      previousPrice: currentCachedPrice,
      changePercent: 0,
      source: 'cache',
      latencyMs: Math.round(performance.now() - startTime),
    };
  },

  /**
   * Batch eager check for multiple items (e.g., when user searches "حديد")
   */
  batchEagerCheck(
    items: Array<{ id: string; name: string; price: number; category?: string }>
  ): EagerCheckResult[] {
    return items.map(item => 
      this.eagerCheck(item.id, item.name, item.price, item.category)
    );
  },

  // =================== SWEEP STATISTICS ===================

  /**
   * جلب إحصائيات المسح الأخيرة
   */
  getSweepHistory(limit = 20): SweepResult[] {
    try {
      const raw = localStorage.getItem(SWEEP_HISTORY_KEY);
      if (!raw) return [];
      const history: SweepResult[] = JSON.parse(raw);
      return history.slice(-limit);
    } catch { return []; }
  },

  /**
   * جلب الدورة النشطة
   */
  getActiveCycle(): SupplierAuditCycle | null {
    try {
      const raw = localStorage.getItem(ACTIVE_CYCLE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },

  /**
   * ملخص صحة النظام
   */
  getSystemHealthSummary(): {
    totalItems: number;
    staleItems: number;
    needsSweepItems: number;
    avgConfidence: number;
    activeCycle: SupplierAuditCycle | null;
    lastSweep: SweepResult | null;
    volatilityBreakdown: Record<VolatilityClass, number>;
  } {
    const itemsNeedingSweep = internalMetadataService.getItemsNeedingSweep();
    const systemConfidence = internalMetadataService.getSystemConfidence();
    const volatileItems = internalMetadataService.getVolatileItems();
    const history = this.getSweepHistory(1);
    
    return {
      totalItems: itemsNeedingSweep.length,
      staleItems: systemConfidence.staleCount,
      needsSweepItems: itemsNeedingSweep.length,
      avgConfidence: systemConfidence.overall,
      activeCycle: this.getActiveCycle(),
      lastSweep: history.length > 0 ? history[history.length - 1] : null,
      volatilityBreakdown: {
        HIGH: volatileItems.length,
        MEDIUM: 0, // Would need full scan
        LOW: 0,
        STABLE: 0,
      },
    };
  },

  // =================== INTERNAL ===================

  /** Update the active audit cycle with a sweep result */
  _updateActiveCycle(supplierId: string, result: SweepResult): void {
    try {
      const cycle = this.getActiveCycle();
      if (!cycle || cycle.status === 'completed') return;

      cycle.completedSuppliers.push(supplierId);
      cycle.results.push(result);

      // Check if cycle is complete
      if (cycle.completedSuppliers.length >= cycle.suppliersToAudit.length) {
        cycle.status = 'completed';
      }

      localStorage.setItem(ACTIVE_CYCLE_KEY, JSON.stringify(cycle));

      // Save to history
      const history = this.getSweepHistory(100);
      history.push(result);
      localStorage.setItem(SWEEP_HISTORY_KEY, JSON.stringify(history.slice(-100)));
    } catch { /* silent */ }
  },
};

export default proactiveSweepEngine;
