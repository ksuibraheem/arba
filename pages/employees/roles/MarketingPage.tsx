/**
 * صفحة التسويق
 * Marketing Page
 */

import React from 'react';
import { Megaphone, TrendingUp, Share2, Target, BarChart3, Globe } from 'lucide-react';
import { Employee } from '../../../services/employeeService';

interface MarketingPageProps {
    language: 'ar' | 'en';
    employee: Employee;
}

const MarketingPage: React.FC<MarketingPageProps> = ({ language, employee }) => {
    const t = (ar: string, en: string) => language === 'ar' ? ar : en;

    const quickActions = [
        { icon: <Target className="w-6 h-6" />, label: t('حملة جديدة', 'New Campaign'), color: 'from-pink-500 to-rose-500' },
        { icon: <BarChart3 className="w-6 h-6" />, label: t('التحليلات', 'Analytics'), color: 'from-blue-500 to-cyan-500' },
        { icon: <Share2 className="w-6 h-6" />, label: t('التواصل الاجتماعي', 'Social Media'), color: 'from-purple-500 to-indigo-500' },
        { icon: <Globe className="w-6 h-6" />, label: t('الإعلانات', 'Ads'), color: 'from-green-500 to-emerald-500' },
    ];

    const stats = [
        { label: t('الحملات النشطة', 'Active Campaigns'), value: '5', color: 'text-pink-400' },
        { label: t('الوصول هذا الشهر', 'Reach This Month'), value: '45K', color: 'text-blue-400' },
        { label: t('معدل التحويل', 'Conversion Rate'), value: '3.2%', color: 'text-green-400' },
        { label: t('العملاء الجدد', 'New Leads'), value: '127', color: 'text-purple-400' },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-xl p-6 border border-pink-500/30">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                        <Megaphone className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{t('مرحباً', 'Welcome')}, {employee.name}</h2>
                        <p className="text-slate-400">{t('قسم التسويق', 'Marketing Department')}</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                        <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">{t('إجراءات سريعة', 'Quick Actions')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                        <button
                            key={index}
                            className={`bg-gradient-to-br ${action.color} p-4 rounded-xl text-white hover:scale-105 transition-transform`}
                        >
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">
                                {action.icon}
                            </div>
                            <p className="font-medium">{action.label}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Performance Chart Placeholder */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">{t('أداء الحملات', 'Campaign Performance')}</h3>
                <div className="text-center py-8 text-slate-400">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('لا توجد بيانات حالياً', 'No data available')}</p>
                </div>
            </div>
        </div>
    );
};

export default MarketingPage;
