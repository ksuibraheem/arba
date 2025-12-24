/**
 * صفحة الموارد البشرية
 * Human Resources Page
 */

import React from 'react';
import { Users, UserPlus, Calendar, FileText, Award, Clock } from 'lucide-react';
import { Employee } from '../../../services/employeeService';

interface HRPageProps {
    language: 'ar' | 'en';
    employee: Employee;
}

const HRPage: React.FC<HRPageProps> = ({ language, employee }) => {
    const t = (ar: string, en: string) => language === 'ar' ? ar : en;

    const quickActions = [
        { icon: <UserPlus className="w-6 h-6" />, label: t('طلب توظيف', 'Hiring Request'), color: 'from-blue-500 to-cyan-500' },
        { icon: <Calendar className="w-6 h-6" />, label: t('الحضور والانصراف', 'Attendance'), color: 'from-green-500 to-emerald-500' },
        { icon: <FileText className="w-6 h-6" />, label: t('طلبات الإجازة', 'Leave Requests'), color: 'from-orange-500 to-red-500' },
        { icon: <Award className="w-6 h-6" />, label: t('تقييم الأداء', 'Performance'), color: 'from-purple-500 to-pink-500' },
    ];

    const stats = [
        { label: t('إجمالي الموظفين', 'Total Employees'), value: '156', change: '+5' },
        { label: t('طلبات التوظيف', 'Job Applications'), value: '23', change: '+8' },
        { label: t('طلبات الإجازة', 'Leave Requests'), value: '7', change: '-2' },
        { label: t('الغياب اليوم', 'Absent Today'), value: '3', change: '0' },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl p-6 border border-blue-500/30">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                        <Users className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{t('مرحباً', 'Welcome')}, {employee.name}</h2>
                        <p className="text-slate-400">{t('قسم الموارد البشرية', 'Human Resources Department')}</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                        <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                        <p className="text-2xl font-bold text-white">{stat.value}</p>
                        <span className={`text-sm ${stat.change.startsWith('+') ? 'text-green-400' : stat.change === '0' ? 'text-slate-400' : 'text-red-400'}`}>
                            {stat.change !== '0' && stat.change}
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

            {/* Recent Activity */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">{t('طلبات بانتظار الموافقة', 'Pending Requests')}</h3>
                <div className="text-center py-8 text-slate-400">
                    <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p>{t('لا توجد طلبات معلقة', 'No pending requests')}</p>
                </div>
            </div>
        </div>
    );
};

export default HRPage;
