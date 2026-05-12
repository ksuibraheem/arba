/**
 * ARBA Brain Summary Card — ملخص الدماغ الذكي (للمدير وموظف الجودة فقط)
 * يعرض ملخص تحليلات الدماغ الصامت — لا يظهر للمستخدمين العاديين
 * 
 * يعتمد على: silentBrainTracker (بيانات محلية)
 */

import React, { useState, useEffect } from 'react';
import { Brain, Activity, TrendingUp, AlertTriangle, Clock, BarChart3, Users, FileText, RefreshCw, ChevronDown, ChevronUp, Zap, Shield } from 'lucide-react';
import { silentBrainTracker, BrainAnalytics } from '../services/silentBrainTracker';
import { blueprintIntelligence } from '../services/blueprintIntelligence';
import { Language } from '../types';

interface BrainSummaryCardProps {
    language: Language;
    onNavigateToDeveloperBrain?: () => void;
}

const BrainSummaryCard: React.FC<BrainSummaryCardProps> = ({ language, onNavigateToDeveloperBrain }) => {
    const [analytics, setAnalytics] = useState<BrainAnalytics | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);
    const isRTL = language === 'ar';
    const t = (ar: string, en: string) => { const map: Record<string, string> = { ar, en, fr: en, zh: en }; return map[language] || en; };

    const refreshData = () => {
        setAnalytics(silentBrainTracker.getAnalytics());
    };

    useEffect(() => {
        refreshData();
        const interval = setInterval(refreshData, 30000);
        return () => clearInterval(interval);
    }, []);

    if (!analytics) return null;

    const healthScore = Math.min(100, Math.max(0, 
        100 - (analytics.errorCount * 5) + (analytics.totalSessions > 0 ? 20 : 0) + (analytics.averageCalcTimeMs < 500 ? 20 : 0)
    ));
    const healthColor = healthScore >= 80 ? 'text-emerald-400' : healthScore >= 50 ? 'text-amber-400' : 'text-red-400';
    const healthBg = healthScore >= 80 ? 'from-emerald-500/20 to-teal-500/10' : healthScore >= 50 ? 'from-amber-500/20 to-orange-500/10' : 'from-red-500/20 to-rose-500/10';
    const healthBorder = healthScore >= 80 ? 'border-emerald-500/30' : healthScore >= 50 ? 'border-amber-500/30' : 'border-red-500/30';

    // Most active hour
    const peakHour = analytics.hourlyActivity.indexOf(Math.max(...analytics.hourlyActivity));
    const peakHourLabel = `${peakHour}:00 - ${peakHour + 1}:00`;

    return (
        <div className={`rounded-2xl border ${healthBorder} bg-gradient-to-r ${healthBg} backdrop-blur-sm overflow-hidden transition-all duration-300`}>
            {/* Header */}
            <div
                className="flex items-center justify-between px-5 py-4 cursor-pointer hover:bg-white/5 transition-colors"
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/20">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${healthScore >= 80 ? 'bg-emerald-400' : healthScore >= 50 ? 'bg-amber-400' : 'bg-red-400'} border-2 border-slate-900 animate-pulse`} />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-white flex items-center gap-2">
                            {t('🧠 تحليلات الدماغ الذكي', '🧠 Smart Brain Analytics')}
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                                {t('سري', 'CONFIDENTIAL')}
                            </span>
                        </h3>
                        <p className="text-xs text-white/50 mt-0.5">
                            {t('مراقبة صامتة — لا تظهر للمستخدمين', 'Silent monitoring — hidden from users')}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`text-sm font-bold ${healthColor}`}>
                        {healthScore}%
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); refreshData(); }}
                        className="p-1.5 hover:bg-white/10 rounded-lg transition-colors text-white/40 hover:text-white/80"
                    >
                        <RefreshCw className="w-3.5 h-3.5" />
                    </button>
                    {isExpanded ? <ChevronUp className="w-4 h-4 text-white/40" /> : <ChevronDown className="w-4 h-4 text-white/40" />}
                </div>
            </div>

            {/* Quick Stats Row (always visible) */}
            <div className="px-5 pb-3 flex gap-3 overflow-x-auto">
                <MiniStat icon={<Users className="w-3.5 h-3.5" />} label={t('جلسات اليوم', 'Today')} value={analytics.sessionsToday.toString()} color="text-blue-400" />
                <MiniStat icon={<Activity className="w-3.5 h-3.5" />} label={t('إجمالي', 'Total')} value={analytics.totalSessions.toString()} color="text-emerald-400" />
                <MiniStat icon={<Clock className="w-3.5 h-3.5" />} label={t('متوسط الجلسة', 'Avg Session')} value={`${analytics.averageSessionMinutes}m`} color="text-cyan-400" />
                <MiniStat icon={<FileText className="w-3.5 h-3.5" />} label={t('عروض أسعار', 'Quotes')} value={analytics.totalQuotesPrinted.toString()} color="text-purple-400" />
                <MiniStat icon={<AlertTriangle className="w-3.5 h-3.5" />} label={t('أخطاء', 'Errors')} value={analytics.errorCount.toString()} color={analytics.errorCount > 0 ? "text-red-400" : "text-emerald-400"} />
                <MiniStat icon={<Zap className="w-3.5 h-3.5" />} label={t('سرعة الحساب', 'Calc Speed')} value={`${analytics.averageCalcTimeMs}ms`} color={analytics.averageCalcTimeMs < 500 ? "text-emerald-400" : "text-amber-400"} />
            </div>

            {/* Expanded Details */}
            {isExpanded && (
                <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
                    {/* Usage Patterns */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {/* Top Pages */}
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                            <h4 className="text-xs font-bold text-white/60 mb-2 flex items-center gap-1.5">
                                <BarChart3 className="w-3 h-3" />
                                {t('الصفحات الأكثر زيارة', 'Top Pages')}
                            </h4>
                            <div className="space-y-1.5">
                                {analytics.topPages.slice(0, 5).map((p, i) => (
                                    <div key={i} className="flex justify-between text-xs">
                                        <span className="text-white/70 truncate">{p.page}</span>
                                        <span className="text-emerald-400 font-medium">{p.visits}</span>
                                    </div>
                                ))}
                                {analytics.topPages.length === 0 && (
                                    <p className="text-xs text-white/30">{t('لا توجد بيانات', 'No data')}</p>
                                )}
                            </div>
                        </div>

                        {/* Project Types */}
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                            <h4 className="text-xs font-bold text-white/60 mb-2 flex items-center gap-1.5">
                                <TrendingUp className="w-3 h-3" />
                                {t('أنواع المشاريع', 'Project Types')}
                            </h4>
                            <div className="space-y-1.5">
                                {Object.entries(analytics.projectTypeCounts).slice(0, 5).map(([type, count], i) => (
                                    <div key={i} className="flex justify-between text-xs">
                                        <span className="text-white/70">{type}</span>
                                        <span className="text-blue-400 font-medium">{count}</span>
                                    </div>
                                ))}
                                {Object.keys(analytics.projectTypeCounts).length === 0 && (
                                    <p className="text-xs text-white/30">{t('لا توجد بيانات', 'No data')}</p>
                                )}
                            </div>
                        </div>

                        {/* Pricing Behavior */}
                        <div className="p-3 rounded-xl bg-white/5 border border-white/10">
                            <h4 className="text-xs font-bold text-white/60 mb-2 flex items-center gap-1.5">
                                <Shield className="w-3 h-3" />
                                {t('سلوك التسعير', 'Pricing Behavior')}
                            </h4>
                            <div className="space-y-1.5">
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/70">{t('تعديلات يدوية', 'Manual Overrides')}</span>
                                    <span className="text-amber-400 font-medium">{analytics.totalManualOverrides}</span>
                                </div>
                                <div className="flex justify-between text-xs">
                                    <span className="text-white/70">{t('وقت الذروة', 'Peak Hour')}</span>
                                    <span className="text-cyan-400 font-medium">{peakHourLabel}</span>
                                </div>
                                {analytics.mostOverriddenItems.slice(0, 3).map((item, i) => (
                                    <div key={i} className="flex justify-between text-xs">
                                        <span className="text-white/50 truncate">{item.itemName}</span>
                                        <span className="text-orange-400">{item.count}x</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Recent Errors */}
                    {analytics.recentErrors.length > 0 && (
                        <div className="p-3 rounded-xl bg-red-500/5 border border-red-500/15">
                            <h4 className="text-xs font-bold text-red-300 mb-2 flex items-center gap-1.5">
                                <AlertTriangle className="w-3 h-3" />
                                {t('آخر الأخطاء', 'Recent Errors')} ({analytics.errorCount})
                            </h4>
                            <div className="space-y-1">
                                {analytics.recentErrors.slice(0, 3).map((err, i) => (
                                    <div key={i} className="text-xs text-red-200/60 truncate">
                                        <span className="text-red-300/40">{new Date(err.timestamp).toLocaleTimeString()}</span>
                                        {' '}{err.message}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Blueprint Intelligence Training */}
                    <div className="p-3 rounded-xl bg-violet-500/5 border border-violet-500/15">
                        <h4 className="text-xs font-bold text-violet-300 mb-2 flex items-center gap-1.5">
                            <Brain className="w-3 h-3" />
                            {t('دقة التدريب — 25 نموذج', 'Training Accuracy — 25 Templates')}
                        </h4>
                        <div className="space-y-1">
                            {(() => {
                                try {
                                    const summary = blueprintIntelligence.getTrainingSummary();
                                    const validation = blueprintIntelligence.validateAccuracy();
                                    const avgAccuracy = validation.length > 0 ? Math.round(validation.reduce((s, v) => s + v.accuracy, 0) / validation.length) : 0;
                                    return (
                                        <>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-white/70">{t('نماذج التدريب', 'Training Templates')}</span>
                                                <span className="text-violet-400 font-bold">{summary.totalPatterns}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-white/70">{t('أنواع المشاريع', 'Project Types')}</span>
                                                <span className="text-violet-400 font-bold">{summary.projectTypes}</span>
                                            </div>
                                            <div className="flex justify-between text-xs">
                                                <span className="text-white/70">{t('دقة التنبؤ', 'Prediction Accuracy')}</span>
                                                <span className={`font-bold ${avgAccuracy >= 80 ? 'text-emerald-400' : avgAccuracy >= 60 ? 'text-amber-400' : 'text-red-400'}`}>{avgAccuracy}%</span>
                                            </div>
                                            <div className="mt-2 h-2 rounded-full bg-white/5 overflow-hidden">
                                                <div className={`h-full rounded-full transition-all duration-500 ${avgAccuracy >= 80 ? 'bg-emerald-500' : avgAccuracy >= 60 ? 'bg-amber-500' : 'bg-red-500'}`} style={{ width: `${avgAccuracy}%` }} />
                                            </div>
                                        </>
                                    );
                                } catch { return <p className="text-xs text-white/30">{t('جاري التحميل...', 'Loading...')}</p>; }
                            })()}
                        </div>
                    </div>

                    {/* Developer Brain Link */}
                    {onNavigateToDeveloperBrain && (
                        <button
                            onClick={onNavigateToDeveloperBrain}
                            className="w-full py-2.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-300 text-sm font-medium hover:bg-purple-500/20 transition-colors flex items-center justify-center gap-2"
                        >
                            <Brain className="w-4 h-4" />
                            {t('فتح لوحة الدماغ التفصيلية', 'Open Detailed Brain Dashboard')}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

const MiniStat = ({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: string; color: string }) => (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 flex-shrink-0">
        <span className={color}>{icon}</span>
        <div>
            <div className={`text-xs font-bold ${color}`}>{value}</div>
            <div className="text-[9px] text-white/30 whitespace-nowrap">{label}</div>
        </div>
    </div>
);

export default BrainSummaryCard;
