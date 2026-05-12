/**
 * ARBA Sovereign Intelligence — Dual-Calendar SLA Engine
 * محرك التوقيت المزدوج — ربط تحديثات الأسعار بساعات العمل الفعلية
 * 
 * TWO CALENDARS:
 * A. Global SLA (LME): Mon-Fri (London Metal Exchange hours)
 *    → Metals: rebar, copper, aluminum, structural steel
 *    → 48 business hours update cycle
 * 
 * B. Saudi SLA: Sun-Thu (KSA business hours)
 *    → Local: concrete, blocks, sand, local labor
 *    → 48 business hours update cycle
 *    → Excludes: Fri, Sat, Eid al-Fitr, Eid al-Adha, National Day
 * 
 * ⚠️ Rule 2: Uses timezone-aware calculations for LME vs Riyadh.
 */

// ====================== TYPES ======================

export type CalendarType = 'global_lme' | 'saudi_local';

export interface BusinessHoursConfig {
  calendarType: CalendarType;
  workDays: number[];           // 0=Sun, 1=Mon, ..., 6=Sat
  startHour: number;            // Start of business day (24h)
  endHour: number;              // End of business day (24h)
  timezone: string;             // IANA timezone
  slaHours: number;             // SLA deadline in business hours
}

export interface SLAResult {
  calendarType: CalendarType;
  lastUpdateTime: Date;
  deadlineTime: Date;           // When the SLA expires
  businessHoursElapsed: number; // How many biz hours since last update
  isExpired: boolean;           // Has the SLA been breached?
  isUrgent: boolean;            // Within 6 hours of expiry
  remainingHours: number;       // Business hours until deadline
  currentlyInBusinessHours: boolean;
}

export interface PriceUpdateSchedule {
  itemId: string;
  materialCategory: string;
  calendar: CalendarType;
  slaResult: SLAResult;
  updateStrategy: 'eager' | 'lazy';
  nextCheckAt: Date;
}

// ====================== CALENDAR CONFIGS ======================

const GLOBAL_LME_CONFIG: BusinessHoursConfig = {
  calendarType: 'global_lme',
  workDays: [1, 2, 3, 4, 5],   // Mon-Fri
  startHour: 8,                  // 08:00 London time
  endHour: 18,                   // 18:00 London time
  timezone: 'Europe/London',
  slaHours: 48,                  // 48 business hours
};

const SAUDI_LOCAL_CONFIG: BusinessHoursConfig = {
  calendarType: 'saudi_local',
  workDays: [0, 1, 2, 3, 4],   // Sun-Thu
  startHour: 8,                  // 08:00 Riyadh time
  endHour: 17,                   // 17:00 Riyadh time
  timezone: 'Asia/Riyadh',
  slaHours: 48,                  // 48 business hours
};

// Saudi official holidays (Hijri-approximate dates for 2026)
const SAUDI_HOLIDAYS_2026: string[] = [
  // Eid Al-Fitr (approximate — varies by moon sighting)
  '2026-03-20', '2026-03-21', '2026-03-22', '2026-03-23', '2026-03-24',
  // Eid Al-Adha (approximate)
  '2026-05-27', '2026-05-28', '2026-05-29', '2026-05-30',
  // Saudi National Day
  '2026-09-23',
  // Founding Day
  '2026-02-22',
];

// ====================== MATERIAL → CALENDAR MAPPING ======================

const GLOBAL_MATERIALS = new Set([
  'rebar', 'steel', 'copper', 'aluminum', 'wire', 'structural_steel',
  'iron', 'metal', 'zinc', 'lead', 'nickel', 'tin',
  'حديد', 'نحاس', 'ألومنيوم', 'صلب', 'زنك', 'معادن',
]);

const LOCAL_MATERIALS = new Set([
  'concrete', 'cement', 'blocks', 'sand', 'gravel', 'ready_mix',
  'labor', 'tiles', 'paint', 'plaster', 'waterproofing',
  'خرسانة', 'أسمنت', 'بلوك', 'رمل', 'حصى', 'عمالة', 'بلاط', 'دهان',
]);

// ====================== CORE ENGINE ======================

export const dualCalendarEngine = {

  // =================== CALENDAR RESOLUTION ===================

  /**
   * تحديد أي تقويم يُستخدم لمادة معينة
   */
  resolveCalendar(materialName: string, category?: string): CalendarType {
    const lower = (materialName || '').toLowerCase();
    const catLower = (category || '').toLowerCase();
    
    for (const keyword of GLOBAL_MATERIALS) {
      if (lower.includes(keyword) || catLower.includes(keyword)) return 'global_lme';
    }
    
    // Default to Saudi local calendar
    return 'saudi_local';
  },

  /**
   * جلب إعدادات التقويم
   */
  getConfig(calendar: CalendarType): BusinessHoursConfig {
    return calendar === 'global_lme' ? GLOBAL_LME_CONFIG : SAUDI_LOCAL_CONFIG;
  },

  // =================== BUSINESS HOURS CALCULATION ===================

  /**
   * هل الوقت الحالي ضمن ساعات العمل؟
   */
  isBusinessHour(date: Date, config: BusinessHoursConfig): boolean {
    // Get day and hour in the target timezone
    const { day, hour } = this._getLocalTime(date, config.timezone);
    
    // Check if it's a work day
    if (!config.workDays.includes(day)) return false;
    
    // Check Saudi holidays
    if (config.calendarType === 'saudi_local') {
      const dateStr = date.toISOString().split('T')[0];
      if (SAUDI_HOLIDAYS_2026.includes(dateStr)) return false;
    }
    
    // Check business hours
    return hour >= config.startHour && hour < config.endHour;
  },

  /**
   * حساب عدد ساعات العمل بين تاريخين
   * هذا هو جوهر المحرك — يستبعد عطلات نهاية الأسبوع والإجازات
   */
  calculateBusinessHours(startDate: Date, endDate: Date, config: BusinessHoursConfig): number {
    let totalHours = 0;
    const current = new Date(startDate);
    const hoursPerDay = config.endHour - config.startHour;
    
    while (current < endDate) {
      const { day, hour } = this._getLocalTime(current, config.timezone);
      
      // Check if this is a business day
      if (config.workDays.includes(day)) {
        // Check holidays
        const dateStr = current.toISOString().split('T')[0];
        const isHoliday = config.calendarType === 'saudi_local' && SAUDI_HOLIDAYS_2026.includes(dateStr);
        
        if (!isHoliday) {
          // Count business hours in this day
          if (hour >= config.startHour && hour < config.endHour) {
            // We're in business hours, count remaining hours in this day or until endDate
            const dayEnd = new Date(current);
            dayEnd.setHours(config.endHour, 0, 0, 0);
            
            const effectiveEnd = endDate < dayEnd ? endDate : dayEnd;
            const hoursInDay = (effectiveEnd.getTime() - current.getTime()) / (1000 * 60 * 60);
            totalHours += Math.max(0, hoursInDay);
            
            // Jump to end of business day
            current.setTime(dayEnd.getTime());
            continue;
          } else if (hour < config.startHour) {
            // Before business hours — jump to start
            current.setHours(config.startHour, 0, 0, 0);
            continue;
          }
        }
      }
      
      // Jump to next day start
      current.setDate(current.getDate() + 1);
      current.setHours(config.startHour, 0, 0, 0);
    }
    
    return Math.round(totalHours * 10) / 10;
  },

  /**
   * حساب الوقت المتبقي حتى انتهاء SLA
   * يُضيف ساعات العمل المتبقية فقط
   */
  calculateDeadline(lastUpdateTime: Date, config: BusinessHoursConfig): Date {
    let remainingHours = config.slaHours;
    const current = new Date(lastUpdateTime);
    
    while (remainingHours > 0) {
      const { day, hour } = this._getLocalTime(current, config.timezone);
      
      if (config.workDays.includes(day)) {
        const dateStr = current.toISOString().split('T')[0];
        const isHoliday = config.calendarType === 'saudi_local' && SAUDI_HOLIDAYS_2026.includes(dateStr);
        
        if (!isHoliday && hour >= config.startHour && hour < config.endHour) {
          const hoursLeftInDay = config.endHour - hour;
          const hoursToConsume = Math.min(remainingHours, hoursLeftInDay);
          remainingHours -= hoursToConsume;
          
          if (remainingHours <= 0) {
            current.setHours(hour + hoursToConsume, 0, 0, 0);
            return current;
          }
        }
      }
      
      // Move to next business day
      current.setDate(current.getDate() + 1);
      current.setHours(config.startHour, 0, 0, 0);
    }
    
    return current;
  },

  // =================== SLA CHECK ===================

  /**
   * فحص حالة SLA لمادة محددة
   */
  checkSLA(lastUpdateTime: Date, materialName: string, category?: string): SLAResult {
    const calendar = this.resolveCalendar(materialName, category);
    const config = this.getConfig(calendar);
    const now = new Date();
    
    const businessHoursElapsed = this.calculateBusinessHours(lastUpdateTime, now, config);
    const deadline = this.calculateDeadline(lastUpdateTime, config);
    const isExpired = now >= deadline;
    const remainingHours = isExpired ? 0 : config.slaHours - businessHoursElapsed;
    
    return {
      calendarType: calendar,
      lastUpdateTime,
      deadlineTime: deadline,
      businessHoursElapsed: Math.round(businessHoursElapsed * 10) / 10,
      isExpired,
      isUrgent: remainingHours <= 6 && remainingHours > 0,
      remainingHours: Math.max(0, Math.round(remainingHours * 10) / 10),
      currentlyInBusinessHours: this.isBusinessHour(now, config),
    };
  },

  // =================== UPDATE STRATEGY ===================

  /**
   * تحديد استراتيجية التحديث: Eager (فوري) أو Lazy (كسول)
   * 
   * Eager: السلع الحساسة (HIGH volatility) التي تجاوزت 48 ساعة عمل
   *   → يتم التحديث "خلف الكواليس" قبل عرض النتيجة
   * 
   * Lazy: السلع المستقرة التي لم تتجاوز أسبوع عمل
   *   → يُعرض السعر المخزن فوراً
   */
  determineUpdateStrategy(
    materialName: string,
    lastUpdateTime: Date,
    category?: string
  ): { strategy: 'eager' | 'lazy'; reason: string } {
    const sla = this.checkSLA(lastUpdateTime, materialName, category);
    const calendar = this.resolveCalendar(materialName, category);
    
    // Eager conditions
    if (sla.isExpired) {
      return { 
        strategy: 'eager', 
        reason: calendar === 'global_lme'
          ? `المعدن تجاوز ${sla.businessHoursElapsed}h عمل عالمية — تحديث فوري`
          : `المادة تجاوزت ${sla.businessHoursElapsed}h عمل سعودية — تحديث فوري`
      };
    }
    
    if (sla.isUrgent) {
      return {
        strategy: 'eager',
        reason: `أقل من 6 ساعات عمل على انتهاء SLA — تحديث استباقي`
      };
    }
    
    // Lazy — price is still fresh
    return {
      strategy: 'lazy',
      reason: `السعر صالح — متبقي ${sla.remainingHours}h عمل`
    };
  },

  /**
   * إنشاء جدول تحديث لمجموعة من المواد
   */
  buildUpdateSchedule(items: Array<{
    itemId: string;
    materialName: string;
    category?: string;
    lastUpdated: Date;
  }>): PriceUpdateSchedule[] {
    return items.map(item => {
      const calendar = this.resolveCalendar(item.materialName, item.category);
      const sla = this.checkSLA(item.lastUpdated, item.materialName, item.category);
      const { strategy } = this.determineUpdateStrategy(item.materialName, item.lastUpdated, item.category);
      
      return {
        itemId: item.itemId,
        materialCategory: item.category || 'general',
        calendar,
        slaResult: sla,
        updateStrategy: strategy,
        nextCheckAt: sla.deadlineTime,
      };
    }).sort((a, b) => {
      // Sort by urgency: expired first, then by remaining hours
      if (a.slaResult.isExpired && !b.slaResult.isExpired) return -1;
      if (!a.slaResult.isExpired && b.slaResult.isExpired) return 1;
      return a.slaResult.remainingHours - b.slaResult.remainingHours;
    });
  },

  // =================== INTERNAL HELPERS ===================

  /** Get local time components in a specific timezone */
  _getLocalTime(date: Date, timezone: string): { day: number; hour: number; minute: number } {
    try {
      const formatter = new Intl.DateTimeFormat('en-US', {
        timeZone: timezone,
        weekday: 'short',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false,
      });
      
      const parts = formatter.formatToParts(date);
      const weekdayStr = parts.find(p => p.type === 'weekday')?.value || 'Mon';
      const hour = parseInt(parts.find(p => p.type === 'hour')?.value || '0', 10);
      const minute = parseInt(parts.find(p => p.type === 'minute')?.value || '0', 10);
      
      const dayMap: Record<string, number> = {
        'Sun': 0, 'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6,
      };
      
      return { day: dayMap[weekdayStr] ?? 1, hour, minute };
    } catch {
      // Fallback: use UTC
      return { day: date.getUTCDay(), hour: date.getUTCHours(), minute: date.getUTCMinutes() };
    }
  },

  /**
   * هل اليوم يوم عمل سعودي؟
   */
  isSaudiBusinessDay(date: Date): boolean {
    return this.isBusinessHour(
      new Date(date.setHours(12, 0, 0, 0)),
      SAUDI_LOCAL_CONFIG
    );
  },

  /**
   * هل اليوم يوم عمل عالمي (LME)؟
   */
  isGlobalBusinessDay(date: Date): boolean {
    return this.isBusinessHour(
      new Date(date.setHours(12, 0, 0, 0)),
      GLOBAL_LME_CONFIG
    );
  },
};

export default dualCalendarEngine;
