/**
 * صفحة المحاسب
 * Accountant Page
 */

import React from 'react';
import { Calculator, DollarSign, FileText, TrendingUp, PieChart, Receipt } from 'lucide-react';
import { Employee } from '../../../services/employeeService';

interface AccountantPageProps {
    language: 'ar' | 'en';
    employee: Employee;
}

const AccountantPage: React.FC<AccountantPageProps> = ({ language, employee }) => {
    const t = (ar: string, en: string) => language === 'ar' ? ar : en;

    const quickActions = [
        { icon: <Receipt className="w-6 h-6" />, label: t('فاتورة جديدة', 'New Invoice'), color: 'from-blue-500 to-cyan-500' },
        { icon: <FileText className="w-6 h-6" />, label: t('التقارير المالية', 'Financial Reports'), color: 'from-green-500 to-emerald-500' },
        { icon: <DollarSign className="w-6 h-6" />, label: t('المصروفات', 'Expenses'), color: 'from-orange-500 to-red-500' },
        { icon: <PieChart className="w-6 h-6" />, label: t('الميزانية', 'Budget'), color: 'from-purple-500 to-pink-500' },
    ];

    const stats = [
        { label: t('الفواتير هذا الشهر', 'Invoices This Month'), value: '45', change: '+12%' },
        { label: t('إجمالي الإيرادات', 'Total Revenue'), value: '125,000 ر.س', change: '+8%' },
        { label: t('المصروفات', 'Expenses'), value: '45,000 ر.س', change: '-3%' },
        { label: t('صافي الربح', 'Net Profit'), value: '80,000 ر.س', change: '+15%' },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl p-6 border border-green-500/30">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                        <Calculator className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{t('مرحباً', 'Welcome')}, {employee.name}</h2>
                        <p className="text-slate-400">{t('قسم المحاسبة والمالية', 'Accounting & Finance Department')}</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                        <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <span className={`text-sm ${stat.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                            {stat.change}
                        </span>
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

            {/* Recent Transactions Placeholder */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">{t('آخر المعاملات', 'Recent Transactions')}</h3>
                <div className="text-center py-8 text-slate-400">
                    <TrendingUp className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('لا توجد معاملات حديثة', 'No recent transactions')}</p>
                </div>
            </div>
        </div>
    );
};

export default AccountantPage;
