import { Language } from '../../types';
/**
 * Security Alerts Component — سجل التنبيهات الأمنية
 * Audit log for OCR/RegEx blocks, purges, and access alerts
 */

import React, { useState } from 'react';
import { SecurityAlert, AlertType, AlertSeverity } from '../../services/projectTypes';

interface SecurityAlertsProps {
    alerts: SecurityAlert[];
    language: Language;
    loading?: boolean;
    onResolve: (alertId: string) => void;
}

const TYPE_CONFIG: Record<AlertType, { icon: string; label: { ar: string; en: string } }> = {
    ocr_block: { icon: '🖼️', label: { ar: 'حظر OCR', en: 'OCR Block' } },
    regex_block: { icon: '🔍', label: { ar: 'حظر RegEx', en: 'RegEx Block' } },
    purge_complete: { icon: '🧹', label: { ar: 'تطهير مكتمل', en: 'Purge Complete' } },
    unauthorized_access: { icon: '🚨', label: { ar: 'وصول غير مصرح', en: 'Unauthorized Access' } },
    suspicious_export: { icon: '⚠️', label: { ar: 'تصدير مشبوه', en: 'Suspicious Export' } },
};

const SEVERITY_CONFIG: Record<AlertSeverity, { color: string; bg: string }> = {
    info: { color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30' },
    warning: { color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/30' },
    critical: { color: 'text-red-400', bg: 'bg-red-400/10 border-red-400/30' },
};

const SecurityAlerts: React.FC<SecurityAlertsProps> = ({ alerts, language, loading, onResolve }) => {
    const isAr = language === 'ar';
    const [filter, setFilter] = useState<'all' | 'unresolved' | 'resolved'>('all');

    const filtered = alerts.filter(a => {
        if (filter === 'unresolved') return !a.resolved;
        if (filter === 'resolved') return a.resolved;
        return true;
    });

    const formatDate = (d: any) => {
        if (!d) return '—';
        const date = d.toDate ? d.toDate() : new Date(d);
        return date.toLocaleDateString(isAr ? 'ar-SA' : 'en-GB') + ' ' + date.toLocaleTimeString(isAr ? 'ar-SA' : 'en-GB', { hour: '2-digit', minute: '2-digit' });
    };

    const unresolvedCount = alerts.filter(a => !a.resolved).length;

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">
                        {isAr ? '🔒 التنبيهات الأمنية' : '🔒 Security Alerts'}
                    </h2>
                    {unresolvedCount > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 text-xs font-bold border border-red-500/30">
                            {unresolvedCount} {isAr ? 'غير محلول' : 'unresolved'}
                        </span>
                    )}
                </div>

                {/* Filter */}
                <div className="flex gap-1.5">
                    {(['all', 'unresolved', 'resolved'] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === f
                                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                    : 'bg-slate-800/40 text-slate-400 border border-slate-700 hover:border-slate-500'
                                }`}
                        >
                            {f === 'all' ? (isAr ? 'الكل' : 'All') :
                                f === 'unresolved' ? (isAr ? 'غير محلول' : 'Unresolved') :
                                    (isAr ? 'محلول' : 'Resolved')}
                        </button>
                    ))}
                </div>
            </div>

            {/* Alerts List */}
            {loading ? (
                <div className="space-y-2">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="rounded-xl bg-slate-800/40 border border-slate-700 p-4 animate-pulse h-20" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                    <div className="text-5xl mb-4">✅</div>
                    <p>{isAr ? 'لا توجد تنبيهات أمنية' : 'No security alerts'}</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(alert => {
                        const typeConf = TYPE_CONFIG[alert.type];
                        const sevConf = SEVERITY_CONFIG[alert.severity];

                        return (
                            <div
                                key={alert.id}
                                className={`rounded-xl border p-4 transition-all ${alert.resolved
                                        ? 'bg-slate-800/20 border-slate-700/40 opacity-60'
                                        : `bg-slate-800/50 ${sevConf.bg}`
                                    }`}
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex items-start gap-3 flex-1">
                                        {/* Icon */}
                                        <span className="text-xl flex-shrink-0 mt-0.5">{typeConf.icon}</span>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`text-sm font-bold ${sevConf.color}`}>
                                                    {typeConf.label[language]}
                                                </span>
                                                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase border ${sevConf.bg} ${sevConf.color}`}>
                                                    {alert.severity}
                                                </span>
                                                {alert.resolved && (
                                                    <span className="px-1.5 py-0.5 rounded text-[9px] bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                                                        ✓ {isAr ? 'محلول' : 'Resolved'}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-slate-300 text-sm">{alert.description}</p>
                                            <div className="flex items-center gap-4 mt-2 text-xs text-slate-500">
                                                <span>🕐 {formatDate(alert.createdAt)}</span>
                                                {alert.projectName && <span>📁 {alert.projectName}</span>}
                                                {alert.userName && <span>👤 {alert.userName}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Resolve button */}
                                    {!alert.resolved && (
                                        <button
                                            onClick={() => onResolve(alert.id)}
                                            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 text-xs font-medium border border-emerald-500/30 flex-shrink-0"
                                        >
                                            {isAr ? 'حل' : 'Resolve'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default SecurityAlerts;
