/**
 * ARBA Brain Insights Bar — شريط تنبيهات الدماغ الذكي
 * يظهر فوق جدول البنود ويعرض:
 * 1. الجملة الذهبية (Golden Sentence)
 * 2. تنبيهات الندرة والانحرافات
 * 3. ملخص الجدول الزمني
 * 
 * يستدعي: goldenOutputService + scheduleEstimator
 */

import React, { useState, useMemo } from 'react';
import { InsightReport } from '../services/goldenOutputService';
import { ScheduleEstimate } from '../services/scheduleEstimator';
import { Language } from '../types';

interface BrainInsightsBarProps {
  insightReport: InsightReport | null;
  scheduleEstimate: ScheduleEstimate | null;
  language: Language;
}

const BrainInsightsBar: React.FC<BrainInsightsBarProps> = ({
  insightReport,
  scheduleEstimate,
  language,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [activeTab, setActiveTab] = useState<'golden' | 'alerts' | 'schedule' | 'financial'>('golden');
  const isRTL = language === 'ar';

  if (!insightReport) return null;

  const hasAlerts = insightReport.hasScarcity || insightReport.hasDeviations || insightReport.hasSeasonalAdjustment;
  const criticalCount = insightReport.criticalDeviations;
  const warningCount = insightReport.deviationAlerts.filter(d => d.severity === 'warning').length;
  const scarcityCount = insightReport.scarcityAlerts.length;
  const totalAlerts = criticalCount + warningCount + scarcityCount + (insightReport.hasSeasonalAdjustment ? 1 : 0);

  const statusColor = criticalCount > 0
    ? 'from-red-500/20 to-red-600/10 border-red-500/30'
    : warningCount > 0
    ? 'from-amber-500/20 to-amber-600/10 border-amber-500/30'
    : 'from-emerald-500/20 to-emerald-600/10 border-emerald-500/30';

  const statusIcon = criticalCount > 0 ? '🚨' : warningCount > 0 ? '⚠️' : '✅';

  return (
    <div className={`mb-4 rounded-xl border bg-gradient-to-r ${statusColor} backdrop-blur-sm overflow-hidden transition-all duration-300`}>
      {/* Header Bar */}
      <div
        className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-white/5 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center gap-3">
          <div className="text-2xl animate-pulse">🧠</div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white/90">
                {isRTL ? 'دماغ أربا الذكي' : 'Arba Smart Brain'}
              </span>
              {totalAlerts > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-white/20 text-white">
                  {totalAlerts} {isRTL ? 'تنبيه' : 'alerts'}
                </span>
              )}
              {criticalCount > 0 && (
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-red-500/80 text-white animate-pulse">
                  {criticalCount} {isRTL ? 'حرج' : 'critical'}
                </span>
              )}
            </div>
            {!isExpanded && (
              <p className="text-xs text-white/60 mt-0.5 max-w-2xl truncate">
                {insightReport.goldenSentence[language]}
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {scheduleEstimate && (
            <span className="px-3 py-1 text-xs rounded-full bg-blue-500/20 text-blue-300 border border-blue-500/30">
              ⏱️ {scheduleEstimate.totalDurationMonths} {isRTL ? 'شهر' : 'months'}
            </span>
          )}
          <span className="text-white/60 text-lg">{isExpanded ? '▲' : '▼'}</span>
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="px-4 pb-4">
          {/* Tabs */}
          <div className="flex gap-1 mb-3 border-b border-white/10 pb-2">
            {[
              { id: 'golden' as const, label: isRTL ? '📊 التحليل العام' : '📊 Analysis', show: true },
              { id: 'financial' as const, label: isRTL ? '💰 التحليل المالي' : '💰 Financial', show: true },
              { id: 'alerts' as const, label: isRTL ? `⚡ التنبيهات (${totalAlerts})` : `⚡ Alerts (${totalAlerts})`, show: hasAlerts },
              { id: 'schedule' as const, label: isRTL ? '⏱️ الجدول الزمني' : '⏱️ Schedule', show: !!scheduleEstimate },
            ].filter(t => t.show).map(tab => (
              <button
                key={tab.id}
                onClick={(e) => { e.stopPropagation(); setActiveTab(tab.id); }}
                className={`px-3 py-1.5 text-xs rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-white/20 text-white font-bold'
                    : 'text-white/50 hover:text-white/80 hover:bg-white/10'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'golden' && (
            <div className="space-y-2">
              <p className="text-sm text-white/90 leading-relaxed">
                {insightReport.goldenSentence[language]}
              </p>
              {insightReport.baselineComparison?.hasBaseline && insightReport.baselineComparison.costComparison && (
                <div className="flex gap-3 mt-2">
                  <div className="flex-1 p-2 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-xs text-white/50">{isRTL ? 'سعر المتر الحالي' : 'Current ₡/m²'}</div>
                    <div className="text-lg font-bold text-white">
                      {insightReport.baselineComparison.costComparison.currentCostPerSqm.toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}
                    </div>
                  </div>
                  <div className="flex-1 p-2 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-xs text-white/50">{isRTL ? 'متوسط السوق' : 'Market Avg'}</div>
                    <div className="text-lg font-bold text-white">
                      {insightReport.baselineComparison.costComparison.baselineCostPerSqm.toLocaleString()} {isRTL ? 'ر.س' : 'SAR'}
                    </div>
                  </div>
                  <div className="flex-1 p-2 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-xs text-white/50">{isRTL ? 'الفرق' : 'Diff'}</div>
                    <div className={`text-lg font-bold ${
                      insightReport.baselineComparison.costComparison.status === 'above' ? 'text-red-400' :
                      insightReport.baselineComparison.costComparison.status === 'below' ? 'text-green-400' : 'text-white'
                    }`}>
                      {insightReport.baselineComparison.costComparison.differencePercent > 0 ? '+' : ''}
                      {insightReport.baselineComparison.costComparison.differencePercent}%
                    </div>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-1 mt-1">
                <div className="text-xs text-white/40">
                  {isRTL ? 'ثقة:' : 'Confidence:'} {Math.round(insightReport.confidence * 100)}%
                </div>
                <div className="flex-1 h-1 rounded-full bg-white/10">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400 transition-all"
                    style={{ width: `${insightReport.confidence * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="space-y-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg">
              <h3 className="text-sm font-bold text-emerald-300 mb-2">
                {isRTL ? 'تحليل الربحية الذكي' : 'Smart Profitability Analysis'}
              </h3>
              <p className="text-sm text-white/90 leading-relaxed whitespace-pre-line">
                {insightReport.financialAnalysisText[language]}
              </p>
            </div>
          )}

          {activeTab === 'alerts' && (
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {insightReport.scarcityAlerts.map((alert, i) => (
                <div key={`sc-${i}`} className="flex items-start gap-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <span className="text-base mt-0.5">⚠️</span>
                  <div>
                    <div className="text-xs font-bold text-red-300">
                      {isRTL ? 'ندرة مواد' : 'Material Scarcity'}
                    </div>
                    <div className="text-xs text-white/70">{alert.explanation?.[language] || alert.materialCategory}</div>
                  </div>
                </div>
              ))}
              {insightReport.deviationAlerts.map((alert, i) => (
                <div
                  key={`dev-${i}`}
                  className={`flex items-start gap-2 p-2 rounded-lg border ${
                    alert.severity === 'critical'
                      ? 'bg-red-500/10 border-red-500/20'
                      : alert.severity === 'warning'
                      ? 'bg-amber-500/10 border-amber-500/20'
                      : 'bg-blue-500/10 border-blue-500/20'
                  }`}
                >
                  <span className="text-base mt-0.5">
                    {alert.severity === 'critical' ? '🚨' : alert.severity === 'warning' ? '⚠️' : 'ℹ️'}
                  </span>
                  <div>
                    <div className={`text-xs font-bold ${
                      alert.severity === 'critical' ? 'text-red-300' :
                      alert.severity === 'warning' ? 'text-amber-300' : 'text-blue-300'
                    }`}>
                      {alert.itemName} — {alert.field === 'price'
                        ? (isRTL ? 'انحراف سعري' : 'Price deviation')
                        : (isRTL ? 'انحراف كمية' : 'Qty deviation')}
                    </div>
                    <div className="text-xs text-white/70">{alert.explanation[language]}</div>
                  </div>
                </div>
              ))}
              {insightReport.hasSeasonalAdjustment && (
                <div className="flex items-start gap-2 p-2 rounded-lg bg-orange-500/10 border border-orange-500/20">
                  <span className="text-base mt-0.5">
                    {insightReport.seasonalAdjustment.season === 'summer' ? '🌡️' : '❄️'}
                  </span>
                  <div>
                    <div className="text-xs font-bold text-orange-300">
                      {isRTL ? 'تعديل موسمي' : 'Seasonal Adjustment'}
                    </div>
                    <div className="text-xs text-white/70">
                      {isRTL
                        ? `إضافة ${insightReport.seasonalAdjustment.concreteTotalExtraCost} ر.س/م³ — إنتاجية ${Math.round(insightReport.seasonalAdjustment.laborProductivityFactor * 100)}%`
                        : `+${insightReport.seasonalAdjustment.concreteTotalExtraCost} SAR/m³ — Productivity ${Math.round(insightReport.seasonalAdjustment.laborProductivityFactor * 100)}%`}
                    </div>
                  </div>
                </div>
              )}
              {insightReport.isRemoteLocation && (
                <div className="flex items-start gap-2 p-2 rounded-lg bg-purple-500/10 border border-purple-500/20">
                  <span className="text-base mt-0.5">📍</span>
                  <div>
                    <div className="text-xs font-bold text-purple-300">
                      {isRTL ? 'موقع بعيد' : 'Remote Location'}
                    </div>
                    <div className="text-xs text-white/70">
                      {isRTL
                        ? `${insightReport.distanceFactor.distanceKm} كم — نقل +${insightReport.distanceFactor.shippingCostPerTon} ر.س/طن`
                        : `${insightReport.distanceFactor.distanceKm}km — Shipping +${insightReport.distanceFactor.shippingCostPerTon} SAR/ton`}
                    </div>
                  </div>
                </div>
              )}
              {totalAlerts === 0 && (
                <div className="text-center py-4 text-white/50 text-sm">
                  ✅ {isRTL ? 'لا توجد تنبيهات — كل شيء طبيعي' : 'No alerts — everything looks normal'}
                </div>
              )}
            </div>
          )}

          {activeTab === 'schedule' && scheduleEstimate && (
            <div className="space-y-3">
              {/* Duration Summary */}
              <div className="flex gap-2">
                <div className="flex-1 p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                  <div className="text-2xl font-bold text-cyan-400">{scheduleEstimate.totalDurationMonths}</div>
                  <div className="text-xs text-white/50">{isRTL ? 'شهر' : 'months'}</div>
                </div>
                <div className="flex-1 p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                  <div className="text-2xl font-bold text-white">{scheduleEstimate.totalDurationDays}</div>
                  <div className="text-xs text-white/50">{isRTL ? 'يوم عمل' : 'work days'}</div>
                </div>
                <div className="flex-1 p-3 rounded-lg bg-white/5 border border-white/10 text-center">
                  <div className="text-2xl font-bold text-amber-400">{scheduleEstimate.activities.length}</div>
                  <div className="text-xs text-white/50">{isRTL ? 'نشاط' : 'activities'}</div>
                </div>
              </div>

              {/* Phase Breakdown */}
              <div className="space-y-1">
                {[
                  { label: isRTL ? 'أعمال الموقع' : 'Site Work', days: scheduleEstimate.summary.siteWorkDays, color: 'bg-amber-500' },
                  { label: isRTL ? 'الهيكل' : 'Structure', days: scheduleEstimate.summary.structureDays, color: 'bg-blue-500' },
                  { label: isRTL ? 'البناء' : 'Masonry', days: scheduleEstimate.summary.masonryDays, color: 'bg-orange-500' },
                  { label: isRTL ? 'التشطيبات' : 'Finishes', days: scheduleEstimate.summary.finishesDays, color: 'bg-purple-500' },
                  { label: isRTL ? 'MEP' : 'MEP', days: scheduleEstimate.summary.mepDays, color: 'bg-green-500' },
                  { label: isRTL ? 'أعمال خارجية' : 'External', days: scheduleEstimate.summary.externalDays, color: 'bg-cyan-500' },
                ].filter(p => p.days > 0).map((phase, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="text-xs text-white/60 w-24 text-right">{phase.label}</span>
                    <div className="flex-1 h-4 rounded-full bg-white/5 overflow-hidden">
                      <div
                        className={`h-full ${phase.color} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.min(100, (phase.days / scheduleEstimate.totalDurationDays) * 100)}%` }}
                      />
                    </div>
                    <span className="text-xs text-white/60 w-12">{phase.days} {isRTL ? 'يوم' : 'd'}</span>
                  </div>
                ))}
              </div>

              {/* Critical Path */}
              {scheduleEstimate.criticalPath.length > 0 && (
                <div className="p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <div className="text-xs font-bold text-red-300 mb-1">
                    🔴 {isRTL ? 'المسار الحرج' : 'Critical Path'} ({scheduleEstimate.criticalPath.length} {isRTL ? 'نشاط' : 'activities'})
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {scheduleEstimate.criticalPath.slice(0, 8).map((actId, i) => {
                      const act = scheduleEstimate.activities.find(a => a.id === actId);
                      return (
                        <span key={i} className="px-2 py-0.5 text-xs rounded bg-red-500/20 text-red-200">
                          {act ? (isRTL ? act.nameAr : act.nameEn) : actId}
                        </span>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BrainInsightsBar;
