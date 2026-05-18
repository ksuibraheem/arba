/**
 * Subscription Panel — V10
 * لوحة إدارة الاشتراك في الداشبورد الداخلية
 * 
 * يعرض: الباقة الحالية، أشرطة الاستخدام، سجل الترقيات، وزر الترقية
 */

import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import { SUBSCRIPTION_PLANS, getLocalizedText, getPlanAnnualPrice } from '../../companyData';
import { billingService } from '../../services/billingService';
import { usageTrackingService, UsageSummary } from '../../services/usageTrackingService';
import {
    Crown, Rocket, Zap, Building2, Shield, ArrowUpRight,
    HardDrive, FolderOpen, Brain, Upload, Calendar, History,
    ChevronDown, ChevronUp, AlertTriangle
} from 'lucide-react';

interface SubscriptionPanelProps {
    userId: string;
    userPlan: string;
    language: Language;
    onUpgrade?: () => void;
}

const PLAN_ICONS: Record<string, React.ReactNode> = {
    free: <Zap className="w-6 h-6" />,
    starter: <Rocket className="w-6 h-6" />,
    professional: <Crown className="w-6 h-6" />,
    business: <Building2 className="w-6 h-6" />,
    enterprise: <Shield className="w-6 h-6" />,
};

const PLAN_COLORS: Record<string, string> = {
    free: '#64748b',
    starter: '#22c55e',
    professional: '#3b82f6',
    business: '#f59e0b',
    enterprise: '#a855f7',
};

const SubscriptionPanel: React.FC<SubscriptionPanelProps> = ({
    userId, userPlan, language, onUpgrade
}) => {
    const isAr = language === 'ar';
    const [usage, setUsage] = useState<UsageSummary | null>(null);
    const [history, setHistory] = useState<any[]>([]);
    const [showHistory, setShowHistory] = useState(false);
    const [subStatus, setSubStatus] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const plan = SUBSCRIPTION_PLANS.find(p => p.id === userPlan);
    const planColor = PLAN_COLORS[userPlan] || '#64748b';

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const [usageData, historyData, statusData] = await Promise.all([
                    usageTrackingService.getUsageSummary(userId),
                    billingService.getUpgradeHistory(userId),
                    billingService.getSubscriptionStatus(userId),
                ]);
                setUsage(usageData);
                setHistory(historyData);
                setSubStatus(statusData);
            } catch (err) {
                console.warn('SubscriptionPanel load error:', err);
            } finally {
                setLoading(false);
            }
        };
        if (userId) load();
    }, [userId, userPlan]);

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-32 rounded-2xl bg-slate-800/50 animate-pulse" />
                ))}
            </div>
        );
    }

    const getBarColor = (pct: number) => {
        if (pct >= 90) return 'bg-red-500';
        if (pct >= 70) return 'bg-amber-500';
        if (pct >= 50) return 'bg-blue-500';
        return 'bg-emerald-500';
    };

    const formatStorage = (mb: number) => {
        if (mb >= 1024) return `${(mb / 1024).toFixed(1)} GB`;
        return `${mb} MB`;
    };

    const quotaItems = usage ? [
        {
            icon: <FolderOpen className="w-4 h-4" />,
            label: isAr ? 'المشاريع النشطة' : 'Active Projects',
            used: usage.projects.used,
            limit: usage.projects.limit,
            pct: usage.projects.percentage,
            isPermanent: true,
        },
        {
            icon: <HardDrive className="w-4 h-4" />,
            label: isAr ? 'التخزين' : 'Storage',
            used: usage.storage.usedMB,
            limit: usage.storage.limitMB,
            pct: usage.storage.percentage,
            isPermanent: true,
            formatUsed: formatStorage(usage.storage.usedMB),
            formatLimit: formatStorage(usage.storage.limitMB),
        },
        {
            icon: <Brain className="w-4 h-4" />,
            label: isAr ? 'بنود AI (شهري)' : 'AI Items (monthly)',
            used: usage.aiItems.used,
            limit: usage.aiItems.limit,
            pct: usage.aiItems.percentage,
            isPermanent: false,
        },
        {
            icon: <Upload className="w-4 h-4" />,
            label: isAr ? 'رفع BOQ (شهري)' : 'BOQ Uploads (monthly)',
            used: usage.boqUploads.used,
            limit: usage.boqUploads.limit,
            pct: usage.boqUploads.percentage,
            isPermanent: false,
        },
    ].filter(q => q.limit > 0 || q.limit === -1) : [];

    return (
        <div className="space-y-6">
            {/* ═══════ Plan Card ═══════ */}
            <div
                className="relative overflow-hidden rounded-2xl border p-6"
                style={{
                    borderColor: `${planColor}30`,
                    background: `linear-gradient(135deg, ${planColor}08, ${planColor}03)`
                }}
            >
                {/* Decorative gradient */}
                <div className="absolute top-0 left-0 right-0 h-1" style={{ background: planColor }} />

                <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                        <div
                            className="w-14 h-14 rounded-2xl flex items-center justify-center"
                            style={{ background: `${planColor}15`, color: planColor }}
                        >
                            {PLAN_ICONS[userPlan] || <Zap className="w-6 h-6" />}
                        </div>
                        <div>
                            <h3 className="text-xl font-bold text-white">
                                {plan ? getLocalizedText(plan.name, language) : userPlan}
                            </h3>
                            <p className="text-sm mt-0.5" style={{ color: planColor }}>
                                {plan ? `${plan.price} ${isAr ? 'ر.س/شهر' : 'SAR/mo'}` : ''}
                            </p>
                        </div>
                    </div>

                    {userPlan !== 'enterprise' && (
                        <button
                            onClick={onUpgrade}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white transition-all hover:scale-105 shadow-lg"
                            style={{ background: `linear-gradient(135deg, ${planColor}, ${planColor}cc)` }}
                        >
                            <ArrowUpRight className="w-4 h-4" />
                            {isAr ? 'ترقية' : 'Upgrade'}
                        </button>
                    )}
                </div>

                {/* Subscription dates */}
                {subStatus && (
                    <div className="mt-4 flex items-center gap-6 text-xs text-slate-400">
                        <span className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {isAr ? 'متبقي' : 'Remaining'}: <strong className="text-white">{subStatus.daysRemaining} {isAr ? 'يوم' : 'days'}</strong>
                        </span>
                        <span>
                            {isAr ? 'الدورة' : 'Cycle'}: <strong className="text-white">
                                {subStatus.billingCycle === 'annual' ? (isAr ? 'سنوي' : 'Annual') : (isAr ? 'شهري' : 'Monthly')}
                            </strong>
                        </span>
                    </div>
                )}
            </div>

            {/* ═══════ Usage Quotas ═══════ */}
            <div className="space-y-3">
                <h4 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                    📊 {isAr ? 'استخدام الباقة' : 'Plan Usage'}
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {quotaItems.map((q, idx) => (
                        <div
                            key={idx}
                            className={`p-4 rounded-xl border transition-all ${
                                q.pct >= 90
                                    ? 'border-red-500/30 bg-red-500/5 shadow-lg shadow-red-500/10'
                                    : 'border-slate-700/50 bg-slate-800/40'
                            }`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-2 text-slate-400">
                                    {q.icon}
                                    <span className="text-xs font-medium">{q.label}</span>
                                    {q.isPermanent && (
                                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-slate-700/50 text-slate-500">
                                            {isAr ? 'دائم' : 'permanent'}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-xs font-bold ${q.pct >= 90 ? 'text-red-400' : 'text-slate-300'}`}>
                                    {q.limit === -1 ? '∞' : `${q.formatUsed || q.used}/${q.formatLimit || q.limit}`}
                                </span>
                            </div>

                            {q.limit !== -1 && (
                                <>
                                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-700 ${getBarColor(q.pct)}`}
                                            style={{ width: `${Math.min(100, q.pct)}%` }}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-1 text-right">{q.pct}%</p>
                                </>
                            )}

                            {q.limit === -1 && (
                                <p className="text-lg font-black text-emerald-400">∞ <span className="text-[10px] font-normal text-emerald-500/70">{isAr ? 'غير محدود' : 'Unlimited'}</span></p>
                            )}

                            {q.pct >= 90 && q.limit !== -1 && (
                                <div className="mt-2 flex items-center gap-1.5 text-[10px] text-red-400">
                                    <AlertTriangle className="w-3 h-3" />
                                    {isAr ? 'قريب من الحد — رقّي للمزيد' : 'Near limit — upgrade for more'}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ═══════ Upgrade History ═══════ */}
            {history.length > 0 && (
                <div className="space-y-2">
                    <button
                        onClick={() => setShowHistory(!showHistory)}
                        className="flex items-center gap-2 text-sm font-bold text-slate-300 hover:text-white transition-colors"
                    >
                        <History className="w-4 h-4" />
                        {isAr ? 'سجل تغيير الباقة' : 'Plan Change History'}
                        {showHistory ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        <span className="text-xs text-slate-500">({history.length})</span>
                    </button>

                    {showHistory && (
                        <div className="space-y-2">
                            {history.slice(0, 5).map((h, idx) => (
                                <div key={idx} className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${
                                        h.changeType === 'upgrade'
                                            ? 'bg-emerald-500/10 text-emerald-400'
                                            : 'bg-amber-500/10 text-amber-400'
                                    }`}>
                                        {h.changeType === 'upgrade' ? '⬆' : '⬇'}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-medium text-white truncate">
                                            {h.fromPlan} → {h.toPlan}
                                        </p>
                                        <p className="text-[10px] text-slate-500">
                                            {h.createdAt ? new Date(h.createdAt).toLocaleDateString(isAr ? 'ar-SA' : 'en-GB') : ''}
                                        </p>
                                    </div>
                                    <span className={`text-xs font-bold ${h.priceDifference > 0 ? 'text-emerald-400' : 'text-amber-400'}`}>
                                        {h.priceDifference > 0 ? '+' : ''}{h.newPrice} {isAr ? 'ر.س' : 'SAR'}
                                    </span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* ═══════ Plan Features ═══════ */}
            {plan && (
                <div className="p-4 rounded-xl border border-slate-700/30 bg-slate-800/20">
                    <h4 className="text-sm font-bold text-slate-300 mb-3">
                        ✨ {isAr ? 'مزايا باقتك' : 'Your Plan Features'}
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                        {(plan.features[language] || plan.features['ar'] || []).slice(0, 8).map((f: string, idx: number) => (
                            <div key={idx} className="flex items-center gap-2 text-xs text-slate-400">
                                <span className="text-emerald-400">✓</span>
                                <span>{f}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default SubscriptionPanel;
