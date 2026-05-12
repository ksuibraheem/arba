/**
 * Usage Nudge Banner — V2
 * بانر تنبيهات الاستخدام الذكي
 * 
 * يعرض تحذيرات عند اقتراب المستخدم من حدود باقته
 * مع زر ترقية مباشر
 */

import React, { useEffect, useState } from 'react';
import { Language } from '../../types';
import { usageTrackingService, UsageAlert, UsageSummary } from '../../services/usageTrackingService';
import { AlertTriangle, TrendingUp, Zap, X, ArrowRight, ArrowLeft } from 'lucide-react';

interface UsageNudgeBannerProps {
    userId: string;
    planId: string;
    language: Language;
    onUpgrade?: () => void;
}

const UsageNudgeBanner: React.FC<UsageNudgeBannerProps> = ({ userId, planId, language, onUpgrade }) => {
    const [alerts, setAlerts] = useState<UsageAlert[]>([]);
    const [dismissed, setDismissed] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(true);
    const isAr = language === 'ar';
    const Arrow = isAr ? ArrowLeft : ArrowRight;

    useEffect(() => {
        const loadAlerts = async () => {
            setLoading(true);
            try {
                // Check and reset monthly usage if needed
                await usageTrackingService.checkAndResetIfNeeded(userId);

                const summary = await usageTrackingService.getUsageSummary(userId);
                if (summary && summary.alerts.length > 0) {
                    setAlerts(summary.alerts);
                }
            } catch (error) {
                console.warn('Usage alerts load failed:', error);
            } finally {
                setLoading(false);
            }
        };

        if (userId && planId !== 'enterprise') {
            loadAlerts();
        } else {
            setLoading(false);
        }
    }, [userId, planId]);

    const visibleAlerts = alerts.filter(a => !dismissed.has(a.feature));

    if (loading || visibleAlerts.length === 0) return null;

    return (
        <div className="space-y-2 mb-4">
            {visibleAlerts.map((alert) => (
                <div
                    key={alert.feature}
                    className={`flex items-center justify-between px-4 py-3 rounded-xl border backdrop-blur-sm transition-all duration-300 ${
                        alert.level === 'critical'
                            ? 'bg-red-500/10 border-red-500/30 text-red-300'
                            : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
                    }`}
                >
                    <div className="flex items-center gap-3 min-w-0">
                        {alert.level === 'critical' ? (
                            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                        ) : (
                            <TrendingUp className="w-5 h-5 flex-shrink-0" />
                        )}
                        <span className="text-sm font-medium truncate">
                            {isAr ? alert.messageAr : alert.messageEn}
                        </span>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                        {alert.upgradeTarget && onUpgrade && (
                            <button
                                onClick={onUpgrade}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all ${
                                    alert.level === 'critical'
                                        ? 'bg-red-500 hover:bg-red-400 text-white'
                                        : 'bg-amber-500 hover:bg-amber-400 text-slate-900'
                                }`}
                            >
                                <Zap className="w-3.5 h-3.5" />
                                {isAr ? 'ترقّ' : 'Upgrade'}
                                <Arrow className="w-3 h-3" />
                            </button>
                        )}
                        <button
                            onClick={() => setDismissed(prev => new Set(prev).add(alert.feature))}
                            className="p-1 rounded-lg hover:bg-white/10 transition-all"
                        >
                            <X className="w-4 h-4 opacity-50 hover:opacity-100" />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default UsageNudgeBanner;
