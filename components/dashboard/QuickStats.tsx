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
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {cards.map((card, i) => (
                <div
                    key={i}
                    className="group relative rounded-2xl bg-white/[0.03] backdrop-blur-md border border-white/[0.05] p-5 transition-all duration-300 hover:bg-white/[0.05] hover:border-white/[0.1] hover:shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center justify-between overflow-hidden"
                >
                    {/* Decorative Background Glow based on card.bgGlow */}
                    <div 
                        className="absolute right-0 top-1/2 -translate-y-1/2 w-32 h-32 rounded-full opacity-[0.15] blur-2xl transition-opacity group-hover:opacity-[0.25]"
                        style={{ backgroundColor: card.bgGlow }}
                    />

                    {/* Left Side: Info */}
                    <div className="relative z-10">
                        <div className="text-slate-400 text-sm font-semibold mb-2 tracking-wide group-hover:text-slate-300 transition-colors">
                            {card.title}
                        </div>
                        <div className="flex items-baseline gap-1.5">
                            <div className={`text-3xl font-black text-white tracking-tight ${isAr ? 'font-sans' : ''}`}>
                                {loading ? '—' : card.value}
                            </div>
                            {card.suffix && (
                                <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">
                                    {card.suffix}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Side: Icon Container */}
                    <div className="relative z-10 flex-shrink-0">
                        <div className="w-14 h-14 rounded-full flex items-center justify-center shadow-inner relative overflow-hidden bg-slate-800/80 border border-white/10 group-hover:scale-110 transition-transform duration-500">
                             <div 
                                className="absolute inset-0 opacity-40 group-hover:opacity-60 transition-opacity"
                                style={{ background: `linear-gradient(135deg, ${card.bgGlow} 0%, transparent 100%)` }}
                             />
                             <span className="text-2xl relative z-10 drop-shadow-md">
                                 {card.icon}
                             </span>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default QuickStats;
