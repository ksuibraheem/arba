/**
 * Usage Quota Bar — V2
 * أشرطة استهلاك الباقة البصرية
 * 
 * يعرض تقدم الاستخدام لكل ميزة (مشاريع، AI، BOQ، تخزين)
 * مع ألوان ديناميكية حسب النسبة
 */

import React, { useEffect, useState } from 'react';
import { Language } from '../../types';
import { usageTrackingService, UsageSummary } from '../../services/usageTrackingService';
import { FolderOpen, Brain, Upload, HardDrive, Users, Globe, FileText } from 'lucide-react';

interface UsageQuotaBarProps {
    userId: string;
    planId: string;
    language: Language;
}

interface QuotaItem {
    icon: React.ReactNode;
    label: { ar: string; en: string };
    used: number;
    limit: number;
    percentage: number;
}

const UsageQuotaBar: React.FC<UsageQuotaBarProps> = ({ userId, planId, language }) => {
    const [summary, setSummary] = useState<UsageSummary | null>(null);
    const [loading, setLoading] = useState(true);
    const isAr = language === 'ar';

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            try {
                const data = await usageTrackingService.getUsageSummary(userId);
                setSummary(data);
            } catch (error) {
                console.warn('Usage quota load failed:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userId) load();
    }, [userId, planId]);

    if (loading) {
        return (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-20 rounded-xl bg-slate-800/50 animate-pulse" />
                ))}
            </div>
        );
    }

    if (!summary) return null;

    const quotas: QuotaItem[] = [
        {
            icon: <FolderOpen className="w-4 h-4" />,
            label: { ar: 'المشاريع', en: 'Projects' },
            used: summary.projects.used,
            limit: summary.projects.limit,
            percentage: summary.projects.percentage,
        },
        {
            icon: <Brain className="w-4 h-4" />,
            label: { ar: 'بنود AI', en: 'AI Items' },
            used: summary.aiItems.used,
            limit: summary.aiItems.limit,
            percentage: summary.aiItems.percentage,
        },
        {
            icon: <Upload className="w-4 h-4" />,
            label: { ar: 'رفع BOQ', en: 'BOQ Uploads' },
            used: summary.boqUploads.used,
            limit: summary.boqUploads.limit,
            percentage: summary.boqUploads.percentage,
        },
        {
            icon: <HardDrive className="w-4 h-4" />,
            label: { ar: 'التخزين', en: 'Storage' },
            used: summary.storage.usedMB,
            limit: summary.storage.limitMB,
            percentage: summary.storage.percentage,
        },
    ];

    // Filter out items with 0 limit (not available) and -1 limit (unlimited)
    const visibleQuotas = quotas.filter(q => q.limit > 0);

    // Add unlimited items as badges
    const unlimitedQuotas = quotas.filter(q => q.limit === -1);

    const getBarColor = (pct: number) => {
        if (pct >= 90) return 'bg-red-500';
        if (pct >= 70) return 'bg-amber-500';
        if (pct >= 50) return 'bg-blue-500';
        return 'bg-emerald-500';
    };

    const getGlowColor = (pct: number) => {
        if (pct >= 90) return 'shadow-red-500/30';
        if (pct >= 70) return 'shadow-amber-500/30';
        return '';
    };

    const formatLimit = (q: QuotaItem) => {
        if (q.limit === -1) return '∞';
        if (q.label.en === 'Storage') {
            if (q.limit >= 1024) return `${(q.limit / 1024).toFixed(0)} GB`;
            return `${q.limit} MB`;
        }
        return q.limit.toLocaleString();
    };

    const formatUsed = (q: QuotaItem) => {
        if (q.label.en === 'Storage') {
            if (q.used >= 1024) return `${(q.used / 1024).toFixed(1)} GB`;
            return `${q.used.toFixed(0)} MB`;
        }
        return q.used.toLocaleString();
    };

    return (
        <div className="space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {visibleQuotas.map((q, idx) => (
                    <div
                        key={idx}
                        className={`p-3 rounded-xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-sm transition-all hover:bg-slate-800/60 ${getGlowColor(q.percentage) ? `shadow-lg ${getGlowColor(q.percentage)}` : ''}`}
                    >
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2 text-slate-400">
                                {q.icon}
                                <span className="text-xs font-medium">{isAr ? q.label.ar : q.label.en}</span>
                            </div>
                            <span className={`text-xs font-bold ${q.percentage >= 90 ? 'text-red-400' : q.percentage >= 70 ? 'text-amber-400' : 'text-slate-300'}`}>
                                {formatUsed(q)}/{formatLimit(q)}
                            </span>
                        </div>

                        {/* Progress bar */}
                        <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                            <div
                                className={`h-full rounded-full transition-all duration-700 ease-out ${getBarColor(q.percentage)}`}
                                style={{ width: `${Math.min(100, q.percentage)}%` }}
                            />
                        </div>

                        <p className="text-[10px] text-slate-500 mt-1 text-right">
                            {q.percentage}%
                        </p>
                    </div>
                ))}

                {/* Unlimited badges */}
                {unlimitedQuotas.map((q, idx) => (
                    <div
                        key={`unlimited-${idx}`}
                        className="p-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 backdrop-blur-sm"
                    >
                        <div className="flex items-center gap-2 text-emerald-400 mb-2">
                            {q.icon}
                            <span className="text-xs font-medium">{isAr ? q.label.ar : q.label.en}</span>
                        </div>
                        <p className="text-lg font-black text-emerald-400">∞</p>
                        <p className="text-[10px] text-emerald-500/70">{isAr ? 'غير محدود' : 'Unlimited'}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UsageQuotaBar;
