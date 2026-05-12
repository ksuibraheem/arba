/**
 * ARBA Data Shield Service v8.0 — طبقة إخفاء البيانات الحساسة
 * 
 * SOVEREIGN v8.0 — Data Invisibility Layer
 * 
 * Purpose:
 * - Strips sensitive financial data from client-facing outputs
 * - Sanitizes export data (PDF, Excel) based on user role
 * - Prevents raw cost/profit data from being exposed in browser DevTools
 * - Provides "sanitized view" for standard users vs "full view" for managers
 * 
 * ⚠️ This is a CLIENT-SIDE guard. True security requires Cloud Functions (Phase 1.1).
 *    This layer provides defense-in-depth until server migration is complete.
 */

export type UserAccessLevel = 'client' | 'employee' | 'quality' | 'manager' | 'admin' | 'superadmin';

export interface ShieldConfig {
  accessLevel: UserAccessLevel;
  isManager: boolean;
  employeeRole?: string;
  isSuperAdmin?: boolean;
}

/**
 * Determines the access level of the current user
 */
export function resolveAccessLevel(config: {
  isManager: boolean;
  employeeRole?: string;
  userEmail?: string;
  superAdminEmail?: string;
}): UserAccessLevel {
  if (config.userEmail && config.superAdminEmail && 
      config.userEmail.toLowerCase() === config.superAdminEmail.toLowerCase()) {
    return 'superadmin';
  }
  if (config.isManager) return 'manager';
  if (config.employeeRole === 'quality') return 'quality';
  if (config.employeeRole === 'deputy') return 'manager';
  if (config.employeeRole) return 'employee';
  return 'client';
}

/**
 * Checks if user can see raw profitability data
 */
export function canViewProfitability(level: UserAccessLevel): boolean {
  return ['manager', 'quality', 'admin', 'superadmin'].includes(level);
}

/**
 * Checks if user can see Brain/AI analysis outputs
 */
export function canViewBrainInsights(level: UserAccessLevel): boolean {
  return ['manager', 'quality', 'admin', 'superadmin'].includes(level);
}

/**
 * Checks if user can access tender analysis (competitive intelligence)
 */
export function canViewTenderAnalysis(level: UserAccessLevel): boolean {
  return ['manager', 'quality', 'admin', 'superadmin'].includes(level);
}

/**
 * Checks if user can download raw pricing files (Excel with cost breakdown)
 */
export function canDownloadDetailedFiles(level: UserAccessLevel): boolean {
  return ['manager', 'quality', 'admin', 'superadmin'].includes(level);
}

/**
 * Checks if user can see the developer brain dashboard
 */
export function canViewDeveloperBrain(level: UserAccessLevel): boolean {
  return ['admin', 'superadmin'].includes(level);
}

/**
 * Sanitizes calculation result for client view (strips sensitive fields)
 * Client sees: final prices only. No cost breakdown, no margins, no supplier costs.
 */
export function sanitizeForClientView<T extends Record<string, any>>(item: T): Partial<T> {
  const sanitized = { ...item };
  
  // Remove sensitive financial fields
  const sensitiveFields = [
    'totalMaterialCost', 'totalLaborCost', 'baseMaterial', 'baseLabor',
    'profitMargin', 'overheadAmount', 'profitAmount',
    'waste', 'priceMultiplier', 'supplierCost',
    'costBreakdown', 'marginAnalysis'
  ];
  
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      delete (sanitized as any)[field];
    }
  }
  
  return sanitized;
}

/**
 * Sanitizes items array for export (PDF/Excel) based on access level
 */
export function sanitizeItemsForExport<T extends Record<string, any>>(
  items: T[],
  accessLevel: UserAccessLevel
): T[] {
  if (canViewProfitability(accessLevel)) {
    return items; // Full data for authorized users
  }
  return items.map(item => sanitizeForClientView(item) as T);
}

/**
 * Security log — tracks access to sensitive data (for audit trail)
 */
export function logSensitiveAccess(action: string, userId?: string): void {
  const entry = {
    action,
    userId: userId || 'anonymous',
    timestamp: new Date().toISOString(),
    userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'server',
  };
  
  // Store in memory for now; Phase 1.2 will push to Firestore audit_trail
  try {
    const existing = JSON.parse(localStorage.getItem('_arba_audit_log') || '[]');
    existing.push(entry);
    // Keep only last 100 entries locally
    if (existing.length > 100) existing.splice(0, existing.length - 100);
    localStorage.setItem('_arba_audit_log', JSON.stringify(existing));
  } catch {
    // Silent — audit is non-blocking
  }
}

export default {
  resolveAccessLevel,
  canViewProfitability,
  canViewBrainInsights,
  canViewTenderAnalysis,
  canDownloadDetailedFiles,
  canViewDeveloperBrain,
  sanitizeForClientView,
  sanitizeItemsForExport,
  logSensitiveAccess,
};
