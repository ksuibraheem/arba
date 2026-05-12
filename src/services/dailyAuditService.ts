/**
 * ARBA V8.2 — Daily Audit Service (M6)
 * خدمة المراجعة اليومية — 20% عينات عشوائية
 * 
 * يختار 20% عشوائي من آخر مشروع مُسعّر
 * يقارن مع أحدث أسعار الـ benchmark
 * ينتج تقرير مراجعة مع توصيات
 */

import { BENCHMARK_RATES } from '../engines/benchmarkData';

export interface AuditItem {
  seq: number;
  description: string;
  ruleId: string | null;
  currentRate: number;
  benchmarkRate: number;
  deviation: number;       // percentage
  priority: 'high' | 'medium' | 'low';
  recommendation: string;
}

export interface AuditReport {
  id: string;
  projectName: string;
  auditDate: string;
  totalItems: number;
  sampledItems: number;
  sampleRate: number;      // 20%
  items: AuditItem[];
  summary: {
    highPriority: number;
    mediumPriority: number;
    lowPriority: number;
    avgDeviation: number;
    overpriced: number;
    underpriced: number;
    accurate: number;
  };
}

const STORAGE_KEY = 'arba_audit_reports';
const SAMPLE_RATE = 0.20; // 20%

class DailyAuditService {
  /**
   * Run audit on a set of processed items
   */
  runAudit(
    projectName: string,
    items: Array<{
      seq: number;
      description: string;
      ruleId: string | null;
      costRate: number;
    }>
  ): AuditReport {
    // Select random 20% sample
    const sampleSize = Math.max(1, Math.ceil(items.length * SAMPLE_RATE));
    const shuffled = [...items].sort(() => Math.random() - 0.5);
    const sample = shuffled.slice(0, sampleSize);

    const auditItems: AuditItem[] = sample.map(item => {
      const benchmarkEntry = item.ruleId ? BENCHMARK_RATES[item.ruleId] : null;
      const benchmarkRate = benchmarkEntry?.rate || 0;
      
      let deviation = 0;
      if (benchmarkRate > 0 && item.costRate > 0) {
        deviation = ((item.costRate - benchmarkRate) / benchmarkRate) * 100;
      }

      let priority: 'high' | 'medium' | 'low' = 'low';
      let recommendation = '✅ السعر ضمن النطاق المقبول';

      if (Math.abs(deviation) > 50) {
        priority = 'high';
        recommendation = deviation > 0
          ? `🔴 السعر أعلى ${deviation.toFixed(0)}% من المرجعي — يحتاج مراجعة عاجلة`
          : `🔴 السعر أقل ${Math.abs(deviation).toFixed(0)}% من المرجعي — تحقق من الجودة`;
      } else if (Math.abs(deviation) > 20) {
        priority = 'medium';
        recommendation = deviation > 0
          ? `🟡 السعر أعلى ${deviation.toFixed(0)}% — راجع مع الموردين`
          : `🟡 السعر أقل ${Math.abs(deviation).toFixed(0)}% — تحقق من الشمولية`;
      }

      return {
        seq: item.seq,
        description: item.description,
        ruleId: item.ruleId,
        currentRate: item.costRate,
        benchmarkRate,
        deviation,
        priority,
        recommendation,
      };
    });

    // Calculate summary
    const highPriority = auditItems.filter(i => i.priority === 'high').length;
    const mediumPriority = auditItems.filter(i => i.priority === 'medium').length;
    const lowPriority = auditItems.filter(i => i.priority === 'low').length;
    
    const deviations = auditItems.filter(i => i.benchmarkRate > 0).map(i => Math.abs(i.deviation));
    const avgDeviation = deviations.length > 0
      ? deviations.reduce((s, d) => s + d, 0) / deviations.length
      : 0;

    const report: AuditReport = {
      id: Date.now().toString(36) + Math.random().toString(36).substr(2, 4),
      projectName,
      auditDate: new Date().toISOString(),
      totalItems: items.length,
      sampledItems: sampleSize,
      sampleRate: SAMPLE_RATE * 100,
      items: auditItems.sort((a, b) => {
        const priorityOrder = { high: 0, medium: 1, low: 2 };
        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }),
      summary: {
        highPriority,
        mediumPriority,
        lowPriority,
        avgDeviation: Math.round(avgDeviation),
        overpriced: auditItems.filter(i => i.deviation > 20).length,
        underpriced: auditItems.filter(i => i.deviation < -20).length,
        accurate: auditItems.filter(i => Math.abs(i.deviation) <= 20).length,
      },
    };

    // Save report
    this.saveReport(report);
    return report;
  }

  /**
   * Save audit report
   */
  private saveReport(report: AuditReport): void {
    const reports = this.getAllReports();
    reports.unshift(report);
    if (reports.length > 30) reports.splice(30);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
  }

  /**
   * Get all saved reports
   */
  getAllReports(): AuditReport[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Get latest report
   */
  getLatest(): AuditReport | null {
    const reports = this.getAllReports();
    return reports.length > 0 ? reports[0] : null;
  }

  /**
   * Clear all reports
   */
  clearAll(): void {
    localStorage.removeItem(STORAGE_KEY);
  }
}

export const dailyAuditService = new DailyAuditService();
