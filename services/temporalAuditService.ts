/**
 * ARBA Temporal Audit Service v8.0 — سجل الحقيقة الزمني
 * 
 * SOVEREIGN v8.0 — Phase 1.2: Temporal Intelligence
 * 
 * Tracks:
 * - Price changes over time (price_time_series)
 * - User actions and consumption (usage_metering)
 * - Immutable audit trail for compliance
 * 
 * ⚠️ Currently stores in localStorage + memory.
 *    Phase 1.1 (Cloud Functions) will migrate to Firestore with server timestamps.
 */

import { firestoreDataService } from './firestoreDataService';

// ====================== TYPES ======================

export interface PriceTimeEntry {
  id: string;
  itemId: string;
  itemName: string;
  price: number;
  previousPrice?: number;
  changePercent?: number;
  source: 'user' | 'supplier' | 'brain' | 'market' | 'import';
  userId?: string;
  projectId?: string;
  projectType?: string;
  timestamp: string; // ISO string
}

export interface UsageMeterEntry {
  id: string;
  userId: string;
  action: string;
  tokensUsed: number;
  functionName: string;
  details?: string;
  timestamp: string;
}

export interface AuditTrailEntry {
  id: string;
  userId: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  before?: any;
  after?: any;
  ip?: string;
  timestamp: string;
}

// ====================== STORAGE ======================

const PRICE_SERIES_KEY = '_arba_price_time_series';
const USAGE_METER_KEY = '_arba_usage_metering';
const AUDIT_TRAIL_KEY = '_arba_audit_trail';
const MAX_LOCAL_ENTRIES = 500;

function getLocalEntries<T>(key: string): T[] {
  try {
    return JSON.parse(localStorage.getItem(key) || '[]');
  } catch { return []; }
}

function saveLocalEntries<T>(key: string, entries: T[]): void {
  try {
    // Cap local entries
    const capped = entries.slice(-MAX_LOCAL_ENTRIES);
    localStorage.setItem(key, JSON.stringify(capped));
  } catch { /* silent */ }
}

// ====================== SERVICE ======================

export const temporalAuditService = {
  
  // =================== PRICE TIME SERIES ===================
  
  /**
   * Record a price change event
   */
  recordPriceChange(params: {
    itemId: string;
    itemName: string;
    newPrice: number;
    previousPrice?: number;
    source: PriceTimeEntry['source'];
    userId?: string;
    projectId?: string;
    projectType?: string;
  }): void {
    const entry: PriceTimeEntry = {
      id: `pts_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      itemId: params.itemId,
      itemName: params.itemName,
      price: params.newPrice,
      previousPrice: params.previousPrice,
      changePercent: params.previousPrice && params.previousPrice > 0
        ? ((params.newPrice - params.previousPrice) / params.previousPrice) * 100
        : undefined,
      source: params.source,
      userId: params.userId,
      projectId: params.projectId,
      projectType: params.projectType,
      timestamp: new Date().toISOString(),
    };
    
    const entries = getLocalEntries<PriceTimeEntry>(PRICE_SERIES_KEY);
    entries.push(entry);
    saveLocalEntries(PRICE_SERIES_KEY, entries);
    
    // Async push to Firestore (non-blocking)
    firestoreDataService.saveDocument('price_time_series', entry.id, entry)
      .catch(() => { /* silent — will sync later */ });
  },
  
  /**
   * Get price history for a specific item
   */
  getPriceHistory(itemId: string, limit = 50): PriceTimeEntry[] {
    const entries = getLocalEntries<PriceTimeEntry>(PRICE_SERIES_KEY);
    return entries
      .filter(e => e.itemId === itemId)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  },
  
  /**
   * Get all price changes in a date range
   */
  getPriceChangesByDate(startDate: Date, endDate: Date): PriceTimeEntry[] {
    const entries = getLocalEntries<PriceTimeEntry>(PRICE_SERIES_KEY);
    return entries.filter(e => {
      const t = new Date(e.timestamp);
      return t >= startDate && t <= endDate;
    });
  },
  
  // =================== USAGE METERING ===================
  
  /**
   * Record API/feature usage (for token tracking)
   */
  recordUsage(params: {
    userId: string;
    action: string;
    tokensUsed: number;
    functionName: string;
    details?: string;
  }): void {
    const entry: UsageMeterEntry = {
      id: `um_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...params,
      timestamp: new Date().toISOString(),
    };
    
    const entries = getLocalEntries<UsageMeterEntry>(USAGE_METER_KEY);
    entries.push(entry);
    saveLocalEntries(USAGE_METER_KEY, entries);
    
    // Async push to Firestore
    firestoreDataService.saveDocument('usage_metering', entry.id, entry)
      .catch(() => {});
  },
  
  /**
   * Get total tokens used by a user today
   */
  getTodayUsage(userId: string): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const entries = getLocalEntries<UsageMeterEntry>(USAGE_METER_KEY);
    return entries
      .filter(e => e.userId === userId && new Date(e.timestamp) >= today)
      .reduce((sum, e) => sum + e.tokensUsed, 0);
  },
  
  // =================== AUDIT TRAIL ===================
  
  /**
   * Record an immutable audit event
   */
  recordAudit(params: {
    userId: string;
    action: string;
    resourceType: string;
    resourceId?: string;
    before?: any;
    after?: any;
  }): void {
    const entry: AuditTrailEntry = {
      id: `at_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      ...params,
      timestamp: new Date().toISOString(),
    };
    
    const entries = getLocalEntries<AuditTrailEntry>(AUDIT_TRAIL_KEY);
    entries.push(entry);
    saveLocalEntries(AUDIT_TRAIL_KEY, entries);
    
    // Async push to Firestore
    firestoreDataService.saveDocument('audit_trail', entry.id, entry)
      .catch(() => {});
  },
  
  /**
   * Get audit trail for a specific resource
   */
  getAuditTrail(resourceType: string, resourceId?: string, limit = 100): AuditTrailEntry[] {
    const entries = getLocalEntries<AuditTrailEntry>(AUDIT_TRAIL_KEY);
    return entries
      .filter(e => e.resourceType === resourceType && (!resourceId || e.resourceId === resourceId))
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, limit);
  },
};

export default temporalAuditService;
