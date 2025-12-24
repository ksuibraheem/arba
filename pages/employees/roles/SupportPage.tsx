/**
 * صفحة الدعم الفني
 * Technical Support Page
 */

import React from 'react';
import { Headphones, MessageSquare, Phone, Mail, Clock, CheckCircle } from 'lucide-react';
import { Employee } from '../../../services/employeeService';

interface SupportPageProps {
    language: 'ar' | 'en';
    employee: Employee;
}

const SupportPage: React.FC<SupportPageProps> = ({ language, employee }) => {
    const t = (ar: string, en: string) => language === 'ar' ? ar : en;

    const quickActions = [
        { icon: <MessageSquare className="w-6 h-6" />, label: t('التذاكر', 'Tickets'), color: 'from-blue-500 to-cyan-500' },
        { icon: <Phone className="w-6 h-6" />, label: t('المكالمات', 'Calls'), color: 'from-green-500 to-emerald-500' },
        { icon: <Mail className="w-6 h-6" />, label: t('الرسائل', 'Messages'), color: 'from-orange-500 to-red-500' },
        { icon: <CheckCircle className="w-6 h-6" />, label: t('المحلولة', 'Resolved'), color: 'from-purple-500 to-pink-500' },
    ];

    const stats = [
        { label: t('التذاكر المفتوحة', 'Open Tickets'), value: '15', color: 'text-orange-400' },
        { label: t('تم حلها اليوم', 'Resolved Today'), value: '8', color: 'text-green-400' },
        { label: t('متوسط وقت الاستجابة', 'Avg Response'), value: '12 د', color: 'text-blue-400' },
        { label: t('رضا العملاء', 'Satisfaction'), value: '94%', color: 'text-emerald-400' },
    ];

    const recentTickets = [
        { id: '#1234', title: t('مشكلة في تسجيل الدخول', 'Login issue'), status: 'open', priority: 'high' },
        { id: '#1233', title: t('استفسار عن الأسعار', 'Price inquiry'), status: 'pending', priority: 'medium' },
        { id: '#1232', title: t('طلب مساعدة', 'Help request'), status: 'resolved', priority: 'low' },
    ];

    const statusColors = {
        open: 'bg-red-500/20 text-red-400',
        pending: 'bg-yellow-500/20 text-yellow-400',
        resolved: 'bg-green-500/20 text-green-400'
    };

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-500/30">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                        <Headphones className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{t('مرحباً', 'Welcome')}, {employee.name}</h2>
                        <p className="text-slate-400">{t('قسم الدعم الفني', 'Technical Support Department')}</p>
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

            {/* Recent Tickets */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h3 className="text-lg font-semibold text-white mb-4">{t('آخر التذاكر', 'Recent Tickets')}</h3>
                <div className="space-y-3">
                    {recentTickets.map((ticket) => (
                        <div key={ticket.id} className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg">
                            <div className="flex items-center gap-3">
                                <span className="text-slate-500 font-mono">{ticket.id}</span>
                                <span className="text-white">{ticket.title}</span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs ${statusColors[ticket.status as keyof typeof statusColors]}`}>
                                {ticket.status}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default SupportPage;
