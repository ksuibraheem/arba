/**
 * صفحة نائب المدير
 * Deputy Manager Page
 */

import React from 'react';
import { UserCog, Users, BarChart3, FileText, Settings, Shield } from 'lucide-react';
import { Employee } from '../../../services/employeeService';

interface DeputyPageProps {
    language: 'ar' | 'en';
    employee: Employee;
}

const DeputyPage: React.FC<DeputyPageProps> = ({ language, employee }) => {
    const t = (ar: string, en: string) => language === 'ar' ? ar : en;

    const quickActions = [
        { icon: <Users className="w-6 h-6" />, label: t('إدارة الفرق', 'Team Management'), color: 'from-purple-500 to-indigo-500' },
        { icon: <BarChart3 className="w-6 h-6" />, label: t('التقارير', 'Reports'), color: 'from-blue-500 to-cyan-500' },
        { icon: <FileText className="w-6 h-6" />, label: t('الموافقات', 'Approvals'), color: 'from-green-500 to-emerald-500' },
        { icon: <Shield className="w-6 h-6" />, label: t('الصلاحيات', 'Permissions'), color: 'from-orange-500 to-red-500' },
    ];

    const stats = [
        { label: t('الموظفين تحت الإدارة', 'Employees Managed'), value: '45', color: 'text-purple-400' },
        { label: t('المهام المعلقة', 'Pending Tasks'), value: '12', color: 'text-orange-400' },
        { label: t('طلبات الموافقة', 'Pending Approvals'), value: '7', color: 'text-blue-400' },
        { label: t('الأقسام', 'Departments'), value: '6', color: 'text-green-400' },
    ];

    const pendingApprovals = [
        { type: t('إجازة', 'Leave'), from: t('أحمد محمد', 'Ahmed Mohamed'), date: '2025-12-24' },
        { type: t('مصروفات', 'Expense'), from: t('سارة علي', 'Sara Ali'), date: '2025-12-23' },
        { type: t('توظيف', 'Hiring'), from: t('الموارد البشرية', 'HR'), date: '2025-12-22' },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl p-6 border border-purple-500/30">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                        <UserCog className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{t('مرحباً', 'Welcome')}, {employee.name}</h2>
                        <p className="text-slate-400">{t('نائب المدير العام', 'Deputy General Manager')}</p>
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

            {/* Pending Approvals */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">{t('طلبات بانتظار الموافقة', 'Pending Approvals')}</h3>
                <div className="space-y-3">
                    {pendingApprovals.map((approval, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                            <div>
                                <span className="text-white font-medium">{approval.type}</span>
                                <span className="text-slate-500 mx-2">-</span>
                                <span className="text-slate-400">{approval.from}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-slate-500 text-sm">{approval.date}</span>
                                <button className="px-3 py-1 bg-green-500/20 text-green-400 rounded hover:bg-green-500/30">
                                    {t('موافقة', 'Approve')}
                                </button>
                                <button className="px-3 py-1 bg-red-500/20 text-red-400 rounded hover:bg-red-500/30">
                                    {t('رفض', 'Reject')}
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default DeputyPage;
