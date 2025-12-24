/**
 * صفحة المبرمج
 * Developer Page
 */

import React from 'react';
import { Code, GitBranch, Bug, Rocket, Terminal, Database } from 'lucide-react';
import { Employee } from '../../../services/employeeService';

interface DeveloperPageProps {
    language: 'ar' | 'en';
    employee: Employee;
}

const DeveloperPage: React.FC<DeveloperPageProps> = ({ language, employee }) => {
    const t = (ar: string, en: string) => language === 'ar' ? ar : en;

    const quickActions = [
        { icon: <GitBranch className="w-6 h-6" />, label: t('المستودعات', 'Repositories'), color: 'from-gray-500 to-slate-600' },
        { icon: <Bug className="w-6 h-6" />, label: t('الأخطاء', 'Bugs'), color: 'from-red-500 to-orange-500' },
        { icon: <Rocket className="w-6 h-6" />, label: t('النشر', 'Deploy'), color: 'from-blue-500 to-purple-500' },
        { icon: <Database className="w-6 h-6" />, label: t('قاعدة البيانات', 'Database'), color: 'from-green-500 to-teal-500' },
    ];

    const stats = [
        { label: t('المهام المفتوحة', 'Open Tasks'), value: '12', color: 'text-blue-400' },
        { label: t('الأخطاء', 'Bugs'), value: '3', color: 'text-red-400' },
        { label: t('عمليات النشر', 'Deployments'), value: '28', color: 'text-green-400' },
        { label: t('الالتزامات هذا الأسبوع', 'Commits This Week'), value: '47', color: 'text-purple-400' },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-slate-500/20 to-gray-500/20 rounded-xl p-6 border border-slate-500/30">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center">
                        <Code className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{t('مرحباً', 'Welcome')}, {employee.name}</h2>
                        <p className="text-slate-400">{t('قسم التطوير والبرمجة', 'Development Department')}</p>
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

            {/* Terminal Placeholder */}
            <div className="bg-slate-900 rounded-xl p-6 border border-slate-700/50 font-mono">
                <div className="flex items-center gap-2 mb-4">
                    <div className="w-3 h-3 rounded-full bg-red-500"></div>
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <div className="w-3 h-3 rounded-full bg-green-500"></div>
                    <span className="text-slate-500 text-sm mr-4">Terminal</span>
                </div>
                <div className="text-green-400 text-sm">
                    <p>$ npm run dev</p>
                    <p className="text-slate-500">Starting development server...</p>
                    <p className="text-emerald-400">✓ Ready on http://localhost:3000</p>
                </div>
            </div>
        </div>
    );
};

export default DeveloperPage;
