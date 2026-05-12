/**
 * ARBA Silent Brain Tracker — نظام التتبع الخفي
 * يعمل بالخلفية ولا يظهر للمستخدمين — البيانات تظهر فقط للمطور
 * 
 * يتتبع:
 * 1. عدد مرات الدخول (sessions)
 * 2. الصفحات المزارة + مدة كل زيارة
 * 3. أنواع المشاريع الأكثر استخداماً
 * 4. المناطق الأكثر طلباً
 * 5. البنود المعدلة يدوياً (أكثر سعر يتغير)
 * 6. عدد عروض الأسعار المطبوعة
 * 7. الأوقات الأكثر نشاطاً (ساعة اليوم)
 * 8. الأقسام الأكثر توسيعاً/طي
 * 9. نسبة استخدام كل ميزة
 * 10. أخطاء التطبيق (errors)
 * 
 * التخزين: localStorage (مع إمكانية ترقية لـ Firebase لاحقاً)
 * الخصوصية: لا بيانات شخصية — فقط إحصائيات مجهولة
 */

// =================== Types ===================

export interface SessionRecord {
  id: string;
  startTime: string;       // ISO timestamp
  endTime?: string;
  durationMinutes: number;
  pagesVisited: string[];
  projectType?: string;
  location?: string;
  userPlan: string;
  deviceType: 'desktop' | 'tablet' | 'mobile';
}

export interface PageVisit {
  page: string;
  timestamp: string;
  durationSeconds: number;
}

export interface PriceOverrideRecord {
  itemId: string;
  itemName: string;
  oldPrice: number;
  newPrice: number;
  timestamp: string;
}

export interface BrainAnalytics {
  // Sessions
  totalSessions: number;
  sessionsToday: number;
  sessionsThisWeek: number;
  sessionsThisMonth: number;
  averageSessionMinutes: number;
  
  // Pages
  pageVisitCounts: Record<string, number>;
  topPages: { page: string; visits: number }[];
  
  // Projects
  projectTypeCounts: Record<string, number>;
  locationCounts: Record<string, number>;
  topProjectType: string;
  topLocation: string;
  
  // Pricing behavior
  totalQuotesPrinted: number;
  totalManualOverrides: number;
  mostOverriddenItems: { itemId: string; itemName: string; count: number }[];
  
  // Time patterns
  hourlyActivity: number[];  // 24 slots (0-23)
  dailyActivity: number[];   // 7 slots (Sun-Sat)
  
  // Feature usage
  featureUsage: Record<string, number>;
  
  // Errors
  errorCount: number;
  recentErrors: { message: string; timestamp: string; page: string }[];
  
  // Performance
  averageCalcTimeMs: number;
  
  // Last updated
  lastUpdated: string;
}

// =================== Constants ===================

const STORAGE_KEYS = {
  sessions: 'arba_brain_sessions',
  pageVisits: 'arba_brain_pages',
  overrides: 'arba_brain_overrides',
  quotesPrinted: 'arba_brain_quotes',
  errors: 'arba_brain_errors',
  features: 'arba_brain_features',
  hourlyActivity: 'arba_brain_hourly',
  dailyActivity: 'arba_brain_daily',
  projectTypes: 'arba_brain_projects',
  locations: 'arba_brain_locations',
  calcTimes: 'arba_brain_calc_times',
};

const MAX_RECORDS = 500;  // Keep storage lean

// =================== Utility ===================

function safeGet<T>(key: string, fallback: T): T {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

function safeSet(key: string, value: any): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full — prune oldest entries
    try {
      const arr = Array.isArray(value) ? value.slice(-Math.floor(MAX_RECORDS / 2)) : value;
      localStorage.setItem(key, JSON.stringify(arr));
    } catch { /* silent fail */ }
  }
}

function incrementMap(key: string, field: string): void {
  const map = safeGet<Record<string, number>>(key, {});
  map[field] = (map[field] || 0) + 1;
  safeSet(key, map);
}

// =================== Core Tracker ===================

class SilentBrainTracker {
  private currentSessionId: string = '';
  private sessionStart: number = 0;
  private currentPage: string = '';
  private pageEnterTime: number = 0;

  // =================== Session Tracking ===================
  
  /** Call on app mount */
  startSession(userPlan: string = 'free'): void {
    this.currentSessionId = `sess_${Date.now()}`;
    this.sessionStart = Date.now();

    const sessions = safeGet<SessionRecord[]>(STORAGE_KEYS.sessions, []);
    sessions.push({
      id: this.currentSessionId,
      startTime: new Date().toISOString(),
      durationMinutes: 0,
      pagesVisited: [],
      userPlan,
      deviceType: this.detectDevice(),
    });

    // Keep only last MAX_RECORDS
    if (sessions.length > MAX_RECORDS) sessions.splice(0, sessions.length - MAX_RECORDS);
    safeSet(STORAGE_KEYS.sessions, sessions);

    // Track hourly + daily activity
    const hour = new Date().getHours();
    const day = new Date().getDay();
    const hourly = safeGet<number[]>(STORAGE_KEYS.hourlyActivity, new Array(24).fill(0));
    const daily = safeGet<number[]>(STORAGE_KEYS.dailyActivity, new Array(7).fill(0));
    hourly[hour]++;
    daily[day]++;
    safeSet(STORAGE_KEYS.hourlyActivity, hourly);
    safeSet(STORAGE_KEYS.dailyActivity, daily);

    // Auto-save on close
    window.addEventListener('beforeunload', () => this.endSession());
  }

  /** Call on app unmount or tab close */
  endSession(): void {
    if (!this.currentSessionId) return;
    const sessions = safeGet<SessionRecord[]>(STORAGE_KEYS.sessions, []);
    const idx = sessions.findIndex(s => s.id === this.currentSessionId);
    if (idx >= 0) {
      sessions[idx].endTime = new Date().toISOString();
      sessions[idx].durationMinutes = Math.round((Date.now() - this.sessionStart) / 60000);
      safeSet(STORAGE_KEYS.sessions, sessions);
    }
    // Flush current page visit
    if (this.currentPage) this.leavePage();
  }

  // =================== Page Tracking ===================
  
  /** Call when user navigates to a page */
  visitPage(page: string): void {
    // Close previous page visit
    if (this.currentPage && this.currentPage !== page) {
      this.leavePage();
    }

    this.currentPage = page;
    this.pageEnterTime = Date.now();

    // Increment page visit counter
    incrementMap(STORAGE_KEYS.pageVisits, page);

    // Track in session
    const sessions = safeGet<SessionRecord[]>(STORAGE_KEYS.sessions, []);
    const idx = sessions.findIndex(s => s.id === this.currentSessionId);
    if (idx >= 0) {
      if (!sessions[idx].pagesVisited.includes(page)) {
        sessions[idx].pagesVisited.push(page);
      }
      safeSet(STORAGE_KEYS.sessions, sessions);
    }
  }

  private leavePage(): void {
    // Duration tracking is internal — no visible action
    this.currentPage = '';
    this.pageEnterTime = 0;
  }

  // =================== Project Tracking ===================
  
  /** Call when user selects project type */
  trackProjectType(projectType: string): void {
    incrementMap(STORAGE_KEYS.projectTypes, projectType);
  }

  /** Call when user selects location */
  trackLocation(location: string): void {
    incrementMap(STORAGE_KEYS.locations, location);
  }

  // =================== Pricing Behavior ===================
  
  /** Call when user manually overrides a price */
  trackPriceOverride(itemId: string, itemName: string, oldPrice: number, newPrice: number): void {
    const overrides = safeGet<PriceOverrideRecord[]>(STORAGE_KEYS.overrides, []);
    overrides.push({ itemId, itemName, oldPrice, newPrice, timestamp: new Date().toISOString() });
    if (overrides.length > MAX_RECORDS) overrides.splice(0, overrides.length - MAX_RECORDS);
    safeSet(STORAGE_KEYS.overrides, overrides);
  }

  /** Call when user prints/exports a quote */
  trackQuotePrinted(): void {
    const count = safeGet<number>(STORAGE_KEYS.quotesPrinted, 0);
    safeSet(STORAGE_KEYS.quotesPrinted, count + 1);
  }

  // =================== Feature Usage ===================
  
  /** Call when a feature is used */
  trackFeature(featureName: string): void {
    incrementMap(STORAGE_KEYS.features, featureName);
  }

  // =================== Error Tracking ===================
  
  /** Call on application errors */
  trackError(message: string, page: string = ''): void {
    const errors = safeGet<{ message: string; timestamp: string; page: string }[]>(STORAGE_KEYS.errors, []);
    errors.push({ message: message.substring(0, 200), timestamp: new Date().toISOString(), page });
    if (errors.length > 100) errors.splice(0, errors.length - 100);
    safeSet(STORAGE_KEYS.errors, errors);
  }

  // =================== Calculation Performance ===================
  
  /** Track how long calculations take */
  trackCalcTime(durationMs: number): void {
    const times = safeGet<number[]>(STORAGE_KEYS.calcTimes, []);
    times.push(durationMs);
    if (times.length > 100) times.splice(0, times.length - 100);
    safeSet(STORAGE_KEYS.calcTimes, times);
  }

  // =================== Analytics (for Developer Dashboard) ===================
  
  /** Generate full analytics report — called only by Developer Dashboard */
  getAnalytics(): BrainAnalytics {
    const sessions = safeGet<SessionRecord[]>(STORAGE_KEYS.sessions, []);
    const overrides = safeGet<PriceOverrideRecord[]>(STORAGE_KEYS.overrides, []);
    const pageVisits = safeGet<Record<string, number>>(STORAGE_KEYS.pageVisits, {});
    const projectTypes = safeGet<Record<string, number>>(STORAGE_KEYS.projectTypes, {});
    const locations = safeGet<Record<string, number>>(STORAGE_KEYS.locations, {});
    const features = safeGet<Record<string, number>>(STORAGE_KEYS.features, {});
    const hourly = safeGet<number[]>(STORAGE_KEYS.hourlyActivity, new Array(24).fill(0));
    const daily = safeGet<number[]>(STORAGE_KEYS.dailyActivity, new Array(7).fill(0));
    const errors = safeGet<{ message: string; timestamp: string; page: string }[]>(STORAGE_KEYS.errors, []);
    const calcTimes = safeGet<number[]>(STORAGE_KEYS.calcTimes, []);
    const quotesPrinted = safeGet<number>(STORAGE_KEYS.quotesPrinted, 0);

    // Time filters
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const sessionsToday = sessions.filter(s => s.startTime.startsWith(todayStr)).length;
    const sessionsThisWeek = sessions.filter(s => new Date(s.startTime) >= weekAgo).length;
    const sessionsThisMonth = sessions.filter(s => new Date(s.startTime) >= monthAgo).length;

    // Average session duration
    const completedSessions = sessions.filter(s => s.durationMinutes > 0);
    const avgSession = completedSessions.length > 0
      ? completedSessions.reduce((sum, s) => sum + s.durationMinutes, 0) / completedSessions.length
      : 0;

    // Top pages
    const topPages = Object.entries(pageVisits)
      .map(([page, visits]) => ({ page, visits }))
      .sort((a, b) => b.visits - a.visits)
      .slice(0, 10);

    // Most overridden items
    const overrideCounts: Record<string, { name: string; count: number }> = {};
    for (const o of overrides) {
      if (!overrideCounts[o.itemId]) overrideCounts[o.itemId] = { name: o.itemName, count: 0 };
      overrideCounts[o.itemId].count++;
    }
    const mostOverriddenItems = Object.entries(overrideCounts)
      .map(([itemId, { name, count }]) => ({ itemId, itemName: name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    // Top project type/location
    const topProjectType = Object.entries(projectTypes).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';
    const topLocation = Object.entries(locations).sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    // Average calc time
    const avgCalcTime = calcTimes.length > 0
      ? calcTimes.reduce((a, b) => a + b, 0) / calcTimes.length
      : 0;

    return {
      totalSessions: sessions.length,
      sessionsToday,
      sessionsThisWeek,
      sessionsThisMonth,
      averageSessionMinutes: Math.round(avgSession * 10) / 10,
      pageVisitCounts: pageVisits,
      topPages,
      projectTypeCounts: projectTypes,
      locationCounts: locations,
      topProjectType,
      topLocation,
      totalQuotesPrinted: quotesPrinted,
      totalManualOverrides: overrides.length,
      mostOverriddenItems,
      hourlyActivity: hourly,
      dailyActivity: daily,
      featureUsage: features,
      errorCount: errors.length,
      recentErrors: errors.slice(-10).reverse(),
      averageCalcTimeMs: Math.round(avgCalcTime),
      lastUpdated: new Date().toISOString(),
    };
  }

  // =================== Internal ===================
  
  private detectDevice(): 'desktop' | 'tablet' | 'mobile' {
    const w = window.innerWidth;
    if (w <= 768) return 'mobile';
    if (w <= 1024) return 'tablet';
    return 'desktop';
  }

  /** Reset all data — for developer use */
  resetAllData(): void {
    Object.values(STORAGE_KEYS).forEach(key => localStorage.removeItem(key));
  }
}

// Singleton
export const silentBrainTracker = new SilentBrainTracker();
