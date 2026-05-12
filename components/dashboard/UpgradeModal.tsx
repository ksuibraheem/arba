/**
 * Upgrade Modal — V2
 * مودال الترقية الذكي
 * 
 * يظهر عند محاولة استخدام ميزة غير متاحة في الباقة الحالية
 * مع عرض الباقة المطلوبة وزر ترقية مباشر
 */

import React from 'react';
import { Language } from '../../types';
import { GateResult } from '../../services/featureGateService';
import { SUBSCRIPTION_PLANS, getLocalizedText, getPlanAnnualPrice } from '../../companyData';
import { Lock, Zap, ArrowRight, ArrowLeft, X, Crown, Rocket, Building2, Shield } from 'lucide-react';

interface UpgradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onUpgrade: () => void;
    gateResult: GateResult;
    language: Language;
}

const PLAN_ICONS: Record<string, React.ReactNode> = {
    starter: <Rocket className="w-8 h-8" />,
    professional: <Crown className="w-8 h-8" />,
    business: <Building2 className="w-8 h-8" />,
    enterprise: <Shield className="w-8 h-8" />,
};

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose, onUpgrade, gateResult, language }) => {
    if (!isOpen) return null;

    const isAr = language === 'ar';
    const Arrow = isAr ? ArrowLeft : ArrowRight;
    const targetPlan = SUBSCRIPTION_PLANS.find(p => p.id === gateResult.upgradeTarget);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal */}
            <div
                className="relative w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 shadow-2xl overflow-hidden"
                style={{ backdropFilter: 'blur(20px)' }}
                onClick={e => e.stopPropagation()}
                dir={isAr ? 'rtl' : 'ltr'}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-all z-10"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header gradient */}
                <div className="h-2" style={{ background: targetPlan ? `linear-gradient(90deg, ${targetPlan.color}, ${targetPlan.color}88)` : 'linear-gradient(90deg, #3b82f6, #8b5cf6)' }} />

                <div className="p-6 text-center">
                    {/* Lock icon */}
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                        <Lock className="w-8 h-8 text-amber-400" />
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-white mb-2">
                        {isAr ? 'هذه الميزة تتطلب ترقية' : 'Upgrade Required'}
                    </h3>

                    {/* Reason */}
                    <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                        {isAr ? gateResult.reason?.ar : gateResult.reason?.en}
                    </p>

                    {/* Usage bar (if applicable) */}
                    {gateResult.currentUsed !== undefined && gateResult.limit !== undefined && gateResult.limit > 0 && (
                        <div className="mb-6 px-4">
                            <div className="flex justify-between text-xs text-slate-400 mb-1.5">
                                <span>{isAr ? 'الاستخدام الحالي' : 'Current Usage'}</span>
                                <span className="font-bold text-white">{gateResult.currentUsed} / {gateResult.limit}</span>
                            </div>
                            <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-red-500 to-red-400 rounded-full"
                                    style={{ width: `${Math.min(100, (gateResult.currentUsed / gateResult.limit) * 100)}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Target plan card */}
                    {targetPlan && (
                        <div className="p-4 rounded-xl border mb-6"
                            style={{ borderColor: `${targetPlan.color}40`, backgroundColor: `${targetPlan.color}08` }}>
                            <div className="flex items-center gap-3 mb-2">
                                <div style={{ color: targetPlan.color }}>
                                    {PLAN_ICONS[targetPlan.id] || <Zap className="w-8 h-8" />}
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-bold">{getLocalizedText(targetPlan.name, language)}</p>
                                    <p className="text-sm" style={{ color: targetPlan.color }}>
                                        {targetPlan.price} {isAr ? 'ر.س/شهر' : 'SAR/mo'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* CTA Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-all"
                        >
                            {isAr ? 'لاحقاً' : 'Maybe Later'}
                        </button>
                        <button
                            onClick={() => { onUpgrade(); onClose(); }}
                            className="flex-1 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg transition-all hover:scale-[1.02]"
                            style={{ background: targetPlan ? `linear-gradient(135deg, ${targetPlan.color}, ${targetPlan.color}cc)` : 'linear-gradient(135deg, #3b82f6, #8b5cf6)' }}
                        >
                            <Zap className="w-4 h-4" />
                            {isAr ? 'ترقية الآن' : 'Upgrade Now'}
                            <Arrow className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UpgradeModal;
