/**
 * Quick Stats Component — بطاقات الإحصائيات السريعة
 * Dashboard summary cards for Arba SaaS
 */

import React from 'react';
import { DashboardStats } from '../../services/projectTypes';

interface QuickStatsProps {
    stats: DashboardStats;
    language: 'ar' | 'en';
    loading?: boolean;
}

const QuickStats: React.FC<QuickStatsProps> = ({ stats, language, loading }) => {
    const isAr = language === 'ar';

    const cards = [
        {
            title: isAr ? 'إجمالي القيمة التقديرية' : 'Total Estimated Value',
            value: stats.totalEstimatedValue.toLocaleString('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
            }),
            suffix: isAr ? 'ر.س' : 'SAR',
            icon: '💰',
            gradient: 'from-emerald-500 to-teal-600',
            bgGlow: 'rgba(16,185,129,0.15)',
        },
        {
            title: isAr ? 'المشاريع النشطة' : 'Active Projects',
            value: String(stats.activeProjects),
            suffix: isAr ? `من ${stats.totalProjects}` : `of ${stats.totalProjects}`,
            icon: '📁',
            gradient: 'from-blue-500 to-indigo-600',
            bgGlow: 'rgba(59,130,246,0.15)',
        },
        {
            title: isAr ? 'عمليات التطهير الأمني' : 'Security Purges',
            value: String(stats.securityPurges),
            suffix: isAr ? 'عملية' : 'operations',
            icon: '🛡️',
            gradient: 'from-amber-500 to-orange-600',
            bgGlow: 'rgba(245,158,11,0.15)',
        },
        {
            title: isAr ? 'العملاء' : 'Clients',
            value: String(stats.totalClients),
            suffix: isAr ? 'عميل' : 'clients',
            icon: '👥',
            gradient: 'from-purple-500 to-pink-600',
            bgGlow: 'rgba(168,85,247,0.15)',
        },
    ];

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {cards.map((card, i) => (
                <div
                    key={i}
                    className="relative overflow-hidden rounded-2xl border border-white/10 p-5 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl"
                    style={{
                        background: `linear-gradient(135deg, ${card.bgGlow} 0%, rgba(15,23,42,0.95) 100%)`,
                        backdropFilter: 'blur(12px)',
                    }}
                >
                    {/* Loading shimmer */}
                    {loading && (
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse" />
                    )}

                    {/* Icon */}
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-2xl">{card.icon}</span>
                        <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${card.gradient} animate-pulse`} />
                    </div>

                    {/* Value */}
                    <div className={`text-3xl font-bold text-white mb-1 ${isAr ? 'font-sans' : ''}`}>
                        {loading ? '—' : card.value}
                    </div>

                    {/* Suffix */}
                    <div className="text-xs text-slate-400">
                        {card.suffix}
                    </div>

                    {/* Title */}
                    <div className="text-sm text-slate-300 mt-2 font-medium">
                        {card.title}
                    </div>

                    {/* Decorative gradient bar */}
                    <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} opacity-60`} />
                </div>
            ))}
        </div>
    );
};

export default QuickStats;
