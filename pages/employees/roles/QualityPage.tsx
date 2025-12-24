/**
 * صفحة الجودة
 * Quality Page
 */

import React from 'react';
import { CheckCircle, ClipboardCheck, AlertTriangle, TrendingUp, FileSearch, Award } from 'lucide-react';
import { Employee } from '../../../services/employeeService';

interface QualityPageProps {
    language: 'ar' | 'en';
    employee: Employee;
}

const QualityPage: React.FC<QualityPageProps> = ({ language, employee }) => {
    const t = (ar: string, en: string) => language === 'ar' ? ar : en;

    const quickActions = [
        { icon: <ClipboardCheck className="w-6 h-6" />, label: t('فحص جديد', 'New Inspection'), color: 'from-teal-500 to-green-500' },
        { icon: <FileSearch className="w-6 h-6" />, label: t('التدقيق', 'Audit'), color: 'from-blue-500 to-cyan-500' },
        { icon: <AlertTriangle className="w-6 h-6" />, label: t('التقارير', 'Reports'), color: 'from-orange-500 to-red-500' },
        { icon: <Award className="w-6 h-6" />, label: t('الشهادات', 'Certificates'), color: 'from-purple-500 to-pink-500' },
    ];

    const stats = [
        { label: t('الفحوصات هذا الشهر', 'Inspections This Month'), value: '34', color: 'text-teal-400' },
        { label: t('معدل الجودة', 'Quality Rate'), value: '98.5%', color: 'text-green-400' },
        { label: t('المشاكل المكتشفة', 'Issues Found'), value: '3', color: 'text-orange-400' },
        { label: t('تم الحل', 'Resolved'), value: '2', color: 'text-blue-400' },
    ];

    const recentInspections = [
        { id: 'QC-001', item: t('منتج A', 'Product A'), result: 'passed', date: '2025-12-24' },
        { id: 'QC-002', item: t('منتج B', 'Product B'), result: 'passed', date: '2025-12-23' },
        { id: 'QC-003', item: t('منتج C', 'Product C'), result: 'failed', date: '2025-12-22' },
    ];

    const resultColors = {
        passed: 'bg-green-500/20 text-green-400',
        failed: 'bg-red-500/20 text-red-400',
        pending: 'bg-yellow-500/20 text-yellow-400'
    };

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-teal-500/20 to-green-500/20 rounded-xl p-6 border border-teal-500/30">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-green-600 flex items-center justify-center">
                        <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{t('مرحباً', 'Welcome')}, {employee.name}</h2>
                        <p className="text-slate-400">{t('قسم الجودة', 'Quality Department')}</p>
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

            {/* Recent Inspections */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">{t('آخر الفحوصات', 'Recent Inspections')}</h3>
                <div className="space-y-3">
                    {recentInspections.map((inspection) => (
                        <div key={inspection.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-slate-500 font-mono">{inspection.id}</span>
                                <span className="text-white">{inspection.item}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-slate-500 text-sm">{inspection.date}</span>
                                <span className={`px-2 py-1 rounded-full text-xs ${resultColors[inspection.result as keyof typeof resultColors]}`}>
                                    {inspection.result === 'passed' ? t('ناجح', 'Passed') : t('فاشل', 'Failed')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default QualityPage;
