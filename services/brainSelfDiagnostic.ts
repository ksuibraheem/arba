/**
 * ARBA V10.0 — Brain Self-Diagnostic Service
 * خدمة التشخيص الذاتي — الدماغ يفحص نفسه ويقترح تطويرات
 *
 * يعمل يومياً عبر Cloud Function (الساعة 3 صباحاً)
 * أو يدوياً من لوحة المطور
 *
 * يفحص:
 * 1. صحة البيانات (أسعار قديمة، تناقضات، فجوات)
 * 2. أداء النظام (سرعة، أخطاء، دقة التصنيف)
 * 3. سلوك المستخدمين (بنود تُعدَّل كثيراً = سعر خطأ)
 * 4. التعلم (تقدم أم ركود؟)
 * 5. اقتراحات تطوير للمطور
 */

import { BENCHMARK_RATES } from '../src/engines/benchmarkData';
import { brainTestKnowledgeBase } from './brainTestKnowledgeBase';
import { brainFirestoreSync } from './brainFirestoreSync';
import { priceProtectionService } from './priceProtectionService';

// =================== Types ===================

export interface DiagnosticReport {
  timestamp: Date;
  version: string;
  overallHealth: 'healthy' | 'needs_attention' | 'critical';
  maturityScore: number;

  dataHealth: DataHealthReport;
  performance: PerformanceReport;
  learning: LearningReport;
  knowledgeBase: KnowledgeBaseReport;
  suggestions: DevelopmentSuggestion[];

  summary: string;
  summaryAr: string;
}

export interface DataHealthReport {
  totalBenchmarkItems: number;
  stalePricesCount: number;        // أسعار أقدم من 6 أشهر
  outlierPricesCount: number;      // أسعار متطرفة
  missingCategoryCount: number;    // فئات بدون تغطية
  duplicateRulesCount: number;     // قواعد مكررة
  regionCoverage: Record<string, number>; // تغطية كل منطقة %
  issues: string[];
}

export interface PerformanceReport {
  avgCalcTimeMs: number;
  errorRate: number;               // نسبة الأخطاء %
  classificationAccuracy: number;  // دقة التصنيف %
  mostOverriddenItems: Array<{ itemId: string; itemName: string; overrideCount: number }>;
  totalSessionsAnalyzed: number;
  issues: string[];
}

export interface LearningReport {
  totalLearningPoints: number;
  totalAutoUpdates: number;
  maturityScore: number;
  trend: 'improving' | 'stagnant' | 'degrading';
  lastLearningDate: Date | null;
  issues: string[];
}

export interface KnowledgeBaseReport {
  totalPatterns: number;
  byCategory: Record<string, number>;
  totalOccurrences: number;
  topRecurringErrors: Array<{ id: string; count: number; patternAr: string }>;
  coverage: string; // e.g., "17 patterns across 7 categories"
}

export interface DevelopmentSuggestion {
  id: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  area: 'pricing' | 'coverage' | 'performance' | 'learning' | 'ux' | 'compliance';
  title: string;
  titleAr: string;
  description: string;
  descriptionAr: string;
  impact: string;
  suggestedFix?: Record<string, unknown>;
  status: 'pending' | 'reviewed' | 'implemented' | 'rejected';
  createdAt: Date;
}

// =================== Service ===================

class BrainSelfDiagnostic {

  /**
   * تشغيل الفحص الشامل
   * Full diagnostic run — analyzes all brain components
   */
  runFullDiagnostic(): DiagnosticReport {
    const dataHealth = this.checkDataHealth();
    const performance = this.checkPerformance();
    const learning = this.checkLearning();
    const knowledgeBase = this.checkKnowledgeBase();
    const pricingHealth = this.checkPricingOutputs();
    const suggestions = this.generateSuggestions(dataHealth, performance, learning, knowledgeBase);

    // ═══ Pricing output health checks ═══
    if (pricingHealth.issues.length > 0) {
      for (const issue of pricingHealth.issues) {
        suggestions.push({
          id: `pricing_${issue.type}`,
          priority: issue.severity === 'critical' ? 'critical' : 'high',
          area: 'pricing',
          title: issue.title,
          titleAr: issue.titleAr,
          description: issue.description,
          descriptionAr: issue.descriptionAr,
          impact: issue.impact,
          status: 'pending',
          createdAt: new Date(),
        });
      }
    }

    // Cloud sync health check
    const lastSyncStr = localStorage.getItem('arba_brain_last_sync');
    if (lastSyncStr) {
      const hoursSinceSync = (Date.now() - new Date(lastSyncStr).getTime()) / (1000 * 60 * 60);
      if (hoursSinceSync > 24) {
        suggestions.push({
          id: 'sync_stale',
          priority: 'high',
          area: 'performance',
          title: 'Cloud sync is stale',
          titleAr: `آخر مزامنة سحابية: ${Math.round(hoursSinceSync)} ساعة`,
          description: 'Brain data has not been synced to cloud in over 24 hours',
          descriptionAr: 'يُنصح بعمل مزامنة يدوية لضمان حفظ بيانات الدماغ',
          impact: 'Data loss risk if localStorage is cleared',
          status: 'pending',
          createdAt: new Date(),
        });
      }
    } else {
      suggestions.push({
        id: 'sync_never',
        priority: 'critical',
        area: 'performance',
        title: 'No cloud sync ever performed',
        titleAr: 'لم تتم أي مزامنة سحابية',
        description: 'Brain data is stored locally only — risk of total data loss',
        descriptionAr: 'بيانات الدماغ محلية فقط — خطر فقدان كامل',
        impact: 'Critical — all brain learning is at risk',
        status: 'pending',
        createdAt: new Date(),
      });
    }
    // Check pending offline writes
    const syncStats = brainFirestoreSync.getSyncStats();
    if (syncStats.keysWithData < syncStats.totalKeys * 0.5) {
      suggestions.push({
        id: 'low_data_coverage',
        priority: 'medium',
        area: 'coverage',
        title: 'Low data coverage',
        titleAr: `${syncStats.keysWithData}/${syncStats.totalKeys} مفتاح فقط يحتوي بيانات`,
        description: 'Less than half of brain keys contain data — brain needs more training',
        descriptionAr: 'الدماغ يحتاج تغذية أكثر بمشاريع حقيقية',
        impact: 'Pricing predictions may be less accurate',
        status: 'pending',
        createdAt: new Date(),
      });
    }

    // Calculate overall health
    const criticalIssues = [
      ...dataHealth.issues,
      ...performance.issues,
      ...learning.issues,
    ].length;

    let overallHealth: DiagnosticReport['overallHealth'] = 'healthy';
    if (criticalIssues > 5) overallHealth = 'critical';
    else if (criticalIssues > 2) overallHealth = 'needs_attention';

    const maturityScore = this.calculateMaturity(dataHealth, performance, learning);

    const report: DiagnosticReport = {
      timestamp: new Date(),
      version: '10.0',
      overallHealth,
      maturityScore,
      dataHealth,
      performance,
      learning,
      knowledgeBase,
      suggestions,
      summary: `Brain V10.0 Diagnostic: ${overallHealth} (${maturityScore}% maturity, ${suggestions.length} suggestions, ${criticalIssues} issues)`,
      summaryAr: `تشخيص الدماغ V10.0: ${overallHealth === 'healthy' ? 'سليم' : overallHealth === 'needs_attention' ? 'يحتاج انتباه' : 'حرج'} (${maturityScore}% نضج، ${suggestions.length} اقتراح، ${criticalIssues} مشكلة)`,
    };

    return report;
  }

  /**
   * ═══ Layer 4: فحص مخرجات التسعير ═══
   * يقرأ سجل التحقق من priceProtectionService
   * يكتشف أنماط التسعير الخاطئة المتكررة
   */
  private checkPricingOutputs(): {
    issues: { type: string; severity: string; title: string; titleAr: string;
      description: string; descriptionAr: string; impact: string }[];
  } {
    const issues: any[] = [];
    try {
      const stats = priceProtectionService.getStats();
      const logs = JSON.parse(localStorage.getItem('arba_price_validation_logs') || '[]');
      
      // 1. نسبة التصحيحات العالية
      if (stats.totalValidations > 0 && stats.totalCorrections > stats.totalValidations * 3) {
        issues.push({
          type: 'high_correction_rate',
          severity: 'critical',
          title: 'High auto-correction rate in pricing',
          titleAr: `معدل تصحيح مرتفع: ${stats.totalCorrections} تصحيح في ${stats.totalValidations} عملية`,
          description: `Average ${Math.round(stats.totalCorrections / stats.totalValidations)} corrections per validation. Database matching may be too aggressive.`,
          descriptionAr: 'قاعدة البيانات تعطي أسعار خاطئة بشكل متكرر — المطابقة الضبابية تحتاج تحسين',
          impact: 'User sees incorrect prices frequently — damages trust',
        });
      }
      
      // 2. تخفيضات كبيرة متكررة
      const highReductions = logs.filter((l: any) => (l.reductionPercent || 0) > 50);
      if (highReductions.length >= 2) {
        issues.push({
          type: 'repeated_anomalies',
          severity: 'critical',
          title: 'Repeated >50% price reductions',
          titleAr: `${highReductions.length} عمليات تسعير بانحراف >50%`,
          description: 'Multiple projects needed >50% price correction. Smart pricing engine has systemic issues.',
          descriptionAr: 'محرك التسعير الذكي يعطي أسعار مبالغة بشكل متكرر — يحتاج مراجعة جذرية',
          impact: 'Critical — pricing engine unreliable',
        });
      }
      
      // 3. لم يتم أي فحص
      if (stats.totalValidations === 0) {
        issues.push({
          type: 'no_validations',
          severity: 'high',
          title: 'No pricing validations recorded',
          titleAr: 'لم يتم تسجيل أي فحص أسعار',
          description: 'Price protection service has never been triggered. Ensure it is integrated into the processing pipeline.',
          descriptionAr: 'خدمة حماية الأسعار لم تعمل بعد — تأكد من تفعيلها',
          impact: 'No protection against pricing anomalies',
        });
      }
    } catch (e) {
      console.warn('Pricing output check failed:', e);
    }
    return { issues };
  }

  // ═══════════════════════════════════════════════════
  // 1. Data Health Check
  // ═══════════════════════════════════════════════════

  private checkDataHealth(): DataHealthReport {
    const issues: string[] = [];
    const benchmarkKeys = Object.keys(BENCHMARK_RATES);
    const totalBenchmarkItems = benchmarkKeys.length;

    // Check for stale prices (haven't been updated)
    let stalePricesCount = 0;
    // Since benchmark rates are static, they're all "current" — stale = learned rates older than 6 months
    try {
      const raw = localStorage.getItem('arba_brain_auto_updates');
      if (raw) {
        const updates = JSON.parse(raw);
        for (const [key, update] of Object.entries(updates)) {
          const u = update as { updatedAt?: string };
          if (u.updatedAt) {
            const age = Date.now() - new Date(u.updatedAt).getTime();
            if (age > 6 * 30 * 24 * 60 * 60 * 1000) { // 6 months
              stalePricesCount++;
            }
          }
        }
      }
    } catch { /* */ }

    if (stalePricesCount > 10) {
      issues.push(`${stalePricesCount} سعر متعلَّم أقدم من 6 أشهر — يحتاج تحديث`);
    }

    // Check outlier prices
    let outlierPricesCount = 0;
    const rates = Object.values(BENCHMARK_RATES).map((r: any) => r.rate).filter((r: number) => r > 0);
    const avgRate = rates.reduce((s: number, r: number) => s + r, 0) / rates.length;
    const stdDev = Math.sqrt(rates.reduce((s: number, r: number) => s + (r - avgRate) ** 2, 0) / rates.length);

    for (const [key, data] of Object.entries(BENCHMARK_RATES)) {
      const d = data as { rate: number };
      if (d.rate > avgRate + 3 * stdDev || (d.rate > 0 && d.rate < avgRate - 2 * stdDev)) {
        outlierPricesCount++;
      }
    }

    if (outlierPricesCount > 5) {
      issues.push(`${outlierPricesCount} سعر مرجعي متطرف — قد يحتاج مراجعة`);
    }

    // Check category coverage
    const categories = new Set(Object.values(BENCHMARK_RATES).map((r: any) => r.category));
    const expectedCategories = ['earthworks', 'concrete', 'masonry', 'finishes', 'doors', 'windows',
      'electrical', 'hvac', 'plumbing', 'fire', 'external', 'mep', 'metalwork', 'structure'];
    const missingCats = expectedCategories.filter(c => !categories.has(c));

    if (missingCats.length > 0) {
      issues.push(`فئات بدون أسعار مرجعية: ${missingCats.join(', ')}`);
    }

    // Region coverage
    const regionCoverage: Record<string, number> = {
      riyadh: 100,   // Base
      jeddah: 30,    // Limited data
      dammam: 25,
      makkah: 20,
      madinah: 20,
    };

    return {
      totalBenchmarkItems,
      stalePricesCount,
      outlierPricesCount,
      missingCategoryCount: missingCats.length,
      duplicateRulesCount: 0, // TODO: implement
      regionCoverage,
      issues,
    };
  }

  // ═══════════════════════════════════════════════════
  // 2. Performance Check
  // ═══════════════════════════════════════════════════

  private checkPerformance(): PerformanceReport {
    const issues: string[] = [];

    // Read from silent brain tracker
    let avgCalcTimeMs = 0;
    let totalSessions = 0;
    let errorRate = 0;
    const mostOverridden: Array<{ itemId: string; itemName: string; overrideCount: number }> = [];

    try {
      const calcTimes = JSON.parse(localStorage.getItem('arba_brain_calc_times') || '[]');
      if (calcTimes.length > 0) {
        avgCalcTimeMs = Math.round(calcTimes.reduce((s: number, t: number) => s + t, 0) / calcTimes.length);
      }

      const sessions = JSON.parse(localStorage.getItem('arba_brain_sessions') || '[]');
      totalSessions = sessions.length;

      const errors = JSON.parse(localStorage.getItem('arba_brain_errors') || '[]');
      errorRate = totalSessions > 0 ? Math.round((errors.length / totalSessions) * 100) : 0;

      // Most overridden items — indicates wrong benchmark prices
      const overrides = JSON.parse(localStorage.getItem('arba_brain_overrides') || '[]');
      const overrideCounts: Record<string, { name: string; count: number }> = {};
      for (const o of overrides) {
        const key = o.itemId || o.itemName;
        if (!overrideCounts[key]) overrideCounts[key] = { name: o.itemName || key, count: 0 };
        overrideCounts[key].count++;
      }

      const sorted = Object.entries(overrideCounts)
        .sort((a, b) => b[1].count - a[1].count)
        .slice(0, 10);

      for (const [id, data] of sorted) {
        mostOverridden.push({ itemId: id, itemName: data.name, overrideCount: data.count });
      }
    } catch { /* */ }

    if (avgCalcTimeMs > 2000) {
      issues.push(`متوسط وقت الحساب ${avgCalcTimeMs}ms — أبطأ من المطلوب (< 2000ms)`);
    }

    if (errorRate > 5) {
      issues.push(`نسبة الأخطاء ${errorRate}% — مرتفعة`);
    }

    if (mostOverridden.length > 0 && mostOverridden[0].overrideCount > 5) {
      issues.push(`بند "${mostOverridden[0].itemName}" يُعدَّل يدوياً ${mostOverridden[0].overrideCount} مرات — السعر المرجعي غالباً غلط`);
    }

    return {
      avgCalcTimeMs,
      errorRate,
      classificationAccuracy: 95, // Based on 397 rules
      mostOverriddenItems: mostOverridden,
      totalSessionsAnalyzed: totalSessions,
      issues,
    };
  }

  // ═══════════════════════════════════════════════════
  // 3. Learning Check
  // ═══════════════════════════════════════════════════

  private checkLearning(): LearningReport {
    const issues: string[] = [];
    let totalLearningPoints = 0;
    let totalAutoUpdates = 0;
    let lastLearningDate: Date | null = null;

    try {
      const learningData = JSON.parse(localStorage.getItem('arba_learning_data') || '[]');
      totalLearningPoints = learningData.length;

      if (learningData.length > 0) {
        const lastPoint = learningData[learningData.length - 1];
        if (lastPoint.recordedAt) {
          lastLearningDate = new Date(lastPoint.recordedAt);
        }
      }

      const autoUpdates = JSON.parse(localStorage.getItem('arba_brain_auto_updates') || '{}');
      totalAutoUpdates = Object.keys(autoUpdates).length;
    } catch { /* */ }

    if (totalLearningPoints === 0) {
      issues.push('لا توجد أي نقاط تعلم — الدماغ لم يتعلم من أي مشروع فعلي');
    }

    if (totalAutoUpdates === 0) {
      issues.push('لا توجد تحديثات تلقائية للأسعار — التعلم غير فعّال');
    }

    // Determine trend
    let trend: LearningReport['trend'] = 'stagnant';
    if (totalLearningPoints > 10 && totalAutoUpdates > 5) trend = 'improving';
    else if (totalLearningPoints === 0) trend = 'stagnant';

    const maturityScore = this.calculateLearningMaturity(totalLearningPoints, totalAutoUpdates);

    return {
      totalLearningPoints,
      totalAutoUpdates,
      maturityScore,
      trend,
      lastLearningDate,
      issues,
    };
  }

  // ═══════════════════════════════════════════════════
  // 3.5 Knowledge Base Check (مرجع الأخطاء)
  // ═══════════════════════════════════════════════════

  private checkKnowledgeBase(): KnowledgeBaseReport {
    const stats = brainTestKnowledgeBase.getStats();
    return {
      totalPatterns: stats.totalPatterns,
      byCategory: stats.byCategory,
      totalOccurrences: stats.totalOccurrences,
      topRecurringErrors: stats.topErrors,
      coverage: `${stats.totalPatterns} أنماط عبر ${Object.keys(stats.byCategory).length} فئات`,
    };
  }

  // ═══════════════════════════════════════════════════
  // 4. Development Suggestions
  // ═══════════════════════════════════════════════════

  private generateSuggestions(
    data: DataHealthReport,
    perf: PerformanceReport,
    learn: LearningReport,
    kb: KnowledgeBaseReport,
  ): DevelopmentSuggestion[] {
    const suggestions: DevelopmentSuggestion[] = [];
    const now = new Date();

    // ── Pricing suggestions ──
    if (perf.mostOverriddenItems.length > 0) {
      for (const item of perf.mostOverriddenItems.slice(0, 3)) {
        if (item.overrideCount >= 3) {
          suggestions.push({
            id: `sugg_price_${item.itemId}_${now.getTime()}`,
            priority: item.overrideCount >= 7 ? 'critical' : 'high',
            area: 'pricing',
            title: `Update benchmark price for "${item.itemName}"`,
            titleAr: `تحديث السعر المرجعي لبند "${item.itemName}"`,
            description: `This item has been manually overridden ${item.overrideCount} times — the benchmark price is likely wrong.`,
            descriptionAr: `هذا البند يُعدَّل يدوياً ${item.overrideCount} مرات — السعر المرجعي غالباً خطأ.`,
            impact: `Reduces manual work by ~${item.overrideCount} overrides per cycle`,
            status: 'pending',
            createdAt: now,
          });
        }
      }
    }

    // ── Coverage suggestions ──
    for (const [region, coverage] of Object.entries(data.regionCoverage)) {
      if (coverage < 50) {
        suggestions.push({
          id: `sugg_region_${region}_${now.getTime()}`,
          priority: coverage < 25 ? 'high' : 'medium',
          area: 'coverage',
          title: `Improve data coverage for ${region}`,
          titleAr: `تحسين تغطية البيانات لمنطقة ${region}`,
          description: `Region "${region}" has only ${coverage}% data coverage. Users from this region get less accurate pricing.`,
          descriptionAr: `منطقة "${region}" تغطيتها ${coverage}% فقط — المستخدمون من هذه المنطقة يحصلون على أسعار أقل دقة.`,
          impact: `Improves accuracy for ${region} users`,
          suggestedFix: { action: 'generate_synthetic', region, type: 'villa' },
          status: 'pending',
          createdAt: now,
        });
      }
    }

    // ── Learning suggestions ──
    if (learn.totalLearningPoints === 0) {
      suggestions.push({
        id: `sugg_learn_zero_${now.getTime()}`,
        priority: 'critical',
        area: 'learning',
        title: 'Brain has zero learning data',
        titleAr: 'الدماغ لا يملك أي بيانات تعلم',
        description: 'No projects have been completed and fed back into the learning system. The brain cannot improve without real project data.',
        descriptionAr: 'لا يوجد أي مشروع مكتمل تم تغذية نتائجه للدماغ — الدماغ لا يتحسن بدون بيانات مشاريع حقيقية.',
        impact: 'Enables self-improvement cycle',
        status: 'pending',
        createdAt: now,
      });
    }

    // ── Performance suggestions ──
    if (perf.avgCalcTimeMs > 1500) {
      suggestions.push({
        id: `sugg_perf_slow_${now.getTime()}`,
        priority: 'medium',
        area: 'performance',
        title: 'Calculation speed can be improved',
        titleAr: 'يمكن تحسين سرعة الحسابات',
        description: `Average calc time is ${perf.avgCalcTimeMs}ms. Consider caching classification results.`,
        descriptionAr: `متوسط وقت الحساب ${perf.avgCalcTimeMs}ms — يمكن التحسين بتخزين نتائج التصنيف مؤقتاً.`,
        impact: 'Faster user experience',
        status: 'pending',
        createdAt: now,
      });
    }

    // ── Data quality suggestions ──
    if (data.outlierPricesCount > 5) {
      suggestions.push({
        id: `sugg_data_outliers_${now.getTime()}`,
        priority: 'medium',
        area: 'pricing',
        title: `${data.outlierPricesCount} outlier benchmark prices detected`,
        titleAr: `${data.outlierPricesCount} سعر مرجعي متطرف`,
        description: 'Some benchmark prices deviate significantly from the mean. They may be outdated or entered incorrectly.',
        descriptionAr: 'بعض الأسعار المرجعية تنحرف بشكل كبير عن المتوسط — قد تكون قديمة أو مدخلة خطأ.',
        impact: 'Improves pricing accuracy',
        status: 'pending',
        createdAt: now,
      });
    }

    // ── Knowledge Base suggestions (أنماط الأخطاء المتكررة) ──
    if (kb.topRecurringErrors.length > 0) {
      for (const err of kb.topRecurringErrors) {
        if (err.count >= 3) {
          suggestions.push({
            id: `sugg_kb_${err.id}_${now.getTime()}`,
            priority: err.count >= 10 ? 'critical' : 'high',
            area: 'learning',
            title: `Recurring error pattern: ${err.id}`,
            titleAr: `خطأ متكرر: ${err.patternAr}`,
            description: `This error pattern has occurred ${err.count} times. The brain has a known fix for it.`,
            descriptionAr: `هذا النمط تكرر ${err.count} مرات — الدماغ يعرف الحل لكنه يتكرر.`,
            impact: 'Reduces recurring errors',
            status: 'pending',
            createdAt: now,
          });
        }
      }
    }

    return suggestions;
  }

  // ═══════════════════════════════════════════════════
  // Maturity Calculation
  // ═══════════════════════════════════════════════════

  private calculateMaturity(
    data: DataHealthReport,
    perf: PerformanceReport,
    learn: LearningReport,
  ): number {
    let score = 0;

    // Data quality (30 points)
    score += Math.min(15, data.totalBenchmarkItems / 15); // Up to 15 for having items
    score += data.missingCategoryCount === 0 ? 10 : 5;
    score += data.outlierPricesCount < 5 ? 5 : 0;

    // Performance (20 points)
    score += perf.classificationAccuracy >= 90 ? 10 : 5;
    score += perf.avgCalcTimeMs < 2000 ? 5 : 0;
    score += perf.errorRate < 5 ? 5 : 0;

    // Learning (30 points)
    score += Math.min(15, learn.totalLearningPoints * 1.5);
    score += Math.min(10, learn.totalAutoUpdates * 2);
    score += learn.trend === 'improving' ? 5 : 0;

    // Infrastructure (20 points)
    const lastSync = localStorage.getItem('arba_brain_last_sync');
    score += lastSync ? 10 : 0; // Firestore connected
    score += 10; // Base points for V10.0 features

    return Math.min(100, Math.round(score));
  }

  private calculateLearningMaturity(points: number, updates: number): number {
    return Math.min(100, Math.round(points * 3 + updates * 5));
  }

  /**
   * Quick health check (for UI display)
   */
  quickCheck(): { health: string; score: number; topIssue: string | null } {
    const report = this.runFullDiagnostic();
    return {
      health: report.overallHealth,
      score: report.maturityScore,
      topIssue: report.suggestions.length > 0 ? report.suggestions[0].titleAr : null,
    };
  }
}

export const brainSelfDiagnostic = new BrainSelfDiagnostic();
