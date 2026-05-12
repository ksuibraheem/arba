import React, { useState } from 'react';
import { Language } from '../types';
import {
    Zap, Rocket, Crown, Building2, Shield,
    Check, X, ChevronDown, ChevronUp, ArrowRight, ArrowLeft,
    Sparkles, MessageCircle, Phone, Mail, Users, Database,
    Brain, BarChart3, FileText, Globe, Lock
} from 'lucide-react';
import { SUBSCRIPTION_PLANS, PAGE_TRANSLATIONS, getPlanAnnualPrice, getLocalizedText, getLocalizedArray } from '../companyData';

interface PricingPageProps {
    language: Language;
    onNavigate: (page: string) => void;
    currentPlan?: string;
    onSelectPlan?: (planId: string) => void;
}

const PLAN_ICONS: Record<string, React.ReactNode> = {
    free: <Zap className="w-7 h-7" />,
    starter: <Rocket className="w-7 h-7" />,
    professional: <Crown className="w-7 h-7" />,
    business: <Building2 className="w-7 h-7" />,
    enterprise: <Shield className="w-7 h-7" />
};

const FAQ_ITEMS = [
    {
        q: { ar: 'هل يمكنني تغيير باقتي في أي وقت؟', en: 'Can I change my plan anytime?', fr: 'Puis-je changer de plan à tout moment?', zh: '我可以随时更改计划吗？' },
        a: { ar: 'نعم! يمكنك الترقية في أي وقت وسيتم حساب المبلغ نسبياً. التخفيض يسري بداية الدورة التالية.', en: 'Yes! You can upgrade anytime with prorated billing. Downgrades take effect at the next billing cycle.', fr: 'Oui! Mise à niveau à tout moment avec facturation au prorata. Les rétrogradations prennent effet au cycle suivant.', zh: '是的！您可以随时升级，按比例计费。降级将在下一个计费周期生效。' }
    },
    {
        q: { ar: 'ما هي الإضافات (Micro-transactions)؟', en: 'What are add-ons (Micro-transactions)?', fr: "Que sont les suppléments?", zh: '什么是附加功能？' },
        a: { ar: 'إذا تجاوزت حد باقتك (مثلاً 5 مشاريع)، يمكنك شراء إضافات بسعر الوحدة دون الحاجة للترقية.', en: 'If you exceed your plan limits (e.g. 5 projects), you can purchase individual add-ons without upgrading.', fr: 'Si vous dépassez les limites de votre plan, vous pouvez acheter des suppléments individuels.', zh: '如果超出计划限制，您可以购买单独的附加功能而无需升级。' }
    },
    {
        q: { ar: 'هل تشمل الأسعار ضريبة القيمة المضافة؟', en: 'Do prices include VAT?', fr: 'Les prix incluent-ils la TVA?', zh: '价格是否包含增值税？' },
        a: { ar: 'الأسعار المعروضة لا تشمل ضريبة القيمة المضافة 15%. تُضاف الضريبة عند الدفع.', en: 'Displayed prices exclude 15% VAT. Tax is added at checkout.', fr: 'Les prix affichés sont hors TVA 15%. La taxe est ajoutée au paiement.', zh: '显示的价格不包含15%增值税。税费在结账时添加。' }
    },
    {
        q: { ar: 'كيف يعمل الخصم السنوي؟', en: 'How does annual billing work?', fr: "Comment fonctionne la facturation annuelle?", zh: '年度计费如何运作？' },
        a: { ar: 'ادفع مقدماً لمدة سنة واحصل على خصم 20%. مثلاً: الاحترافية 399 × 12 = 4,788 → 3,830 ر.س فقط (وفّر 958 ر.س!)', en: 'Pay upfront for a year and get 20% off. E.g. Professional: 399×12 = 4,788 → 3,830 SAR (save 958!)', fr: "Payez d'avance pour un an et obtenez 20% de réduction.", zh: '预付一年可享20%折扣。' }
    }
];

const PricingPage: React.FC<PricingPageProps> = ({ language, onNavigate, currentPlan = 'free', onSelectPlan }) => {
    const isRtl = language === 'ar';
    const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const [showComparison, setShowComparison] = useState(false);

    const t = (key: string) => PAGE_TRANSLATIONS[key]?.[language] || key;
    const Arrow = isRtl ? ArrowLeft : ArrowRight;

    const getPrice = (planId: string) => {
        const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
        if (!plan) return 0;
        if (billingCycle === 'annual' && plan.annualDiscount > 0) {
            return Math.round(plan.price * (1 - plan.annualDiscount));
        }
        return plan.price;
    };

    const getSaved = (planId: string) => {
        const plan = SUBSCRIPTION_PLANS.find(p => p.id === planId);
        if (!plan || plan.annualDiscount === 0) return 0;
        return Math.round(plan.price * plan.annualDiscount * 12);
    };

    const handleSelectPlan = (planId: string) => {
        if (onSelectPlan) onSelectPlan(planId);
        if (planId === 'free') {
            onNavigate('register');
        } else {
            onNavigate('payment');
        }
    };

    return (
        <div className="min-h-screen" style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }} dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="max-w-7xl mx-auto px-4 pt-8 pb-4">
                <button onClick={() => onNavigate('landing')} className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8">
                    {isRtl ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
                    <span>{t('payment_back_to_home')}</span>
                </button>

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-4" style={{ fontFamily: "'Inter', sans-serif" }}>
                        {t('pricing_title')}
                    </h1>
                    <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                        {t('pricing_subtitle')}
                    </p>

                    {/* Billing Toggle */}
                    <div className="flex items-center justify-center gap-4 mt-8">
                        <span className={`text-sm font-medium ${billingCycle === 'monthly' ? 'text-white' : 'text-slate-500'}`}>
                            {t('billing_monthly')}
                        </span>
                        <button
                            onClick={() => setBillingCycle(b => b === 'monthly' ? 'annual' : 'monthly')}
                            className="relative w-16 h-8 rounded-full transition-all duration-300"
                            style={{ background: billingCycle === 'annual' ? 'linear-gradient(90deg, #22c55e, #16a34a)' : '#475569' }}
                        >
                            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full shadow-lg transition-all duration-300 ${billingCycle === 'annual' ? (isRtl ? 'left-1' : 'right-1') : (isRtl ? 'right-1' : 'left-1')}`} />
                        </button>
                        <span className={`text-sm font-medium ${billingCycle === 'annual' ? 'text-white' : 'text-slate-500'}`}>
                            {t('billing_annual')}
                        </span>
                        {billingCycle === 'annual' && (
                            <span className="px-3 py-1 bg-green-500/20 text-green-400 text-xs font-bold rounded-full animate-pulse">
                                {t('billing_save')} 20%
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Pricing Cards */}
            <div className="max-w-7xl mx-auto px-4 pb-16">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    {SUBSCRIPTION_PLANS.map((plan) => {
                        const isCurrentPlan = plan.id === currentPlan;
                        const isPopular = plan.popular;
                        const price = getPrice(plan.id);
                        const saved = getSaved(plan.id);
                        const features = getLocalizedArray(plan.features, language);
                        const badge = plan.badge ? getLocalizedText(plan.badge, language) : null;

                        return (
                            <div
                                key={plan.id}
                                className={`relative rounded-2xl border transition-all duration-500 hover:scale-[1.02] ${
                                    isPopular
                                        ? 'border-blue-500/50 bg-slate-800/80 shadow-xl shadow-blue-500/10 lg:scale-105 lg:z-10'
                                        : 'border-slate-700/50 bg-slate-800/50'
                                }`}
                                style={{ backdropFilter: 'blur(20px)' }}
                            >
                                {/* Badge */}
                                {badge && (
                                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-xs font-bold text-white whitespace-nowrap"
                                        style={{ background: `linear-gradient(90deg, ${plan.color}, ${plan.color}dd)` }}>
                                        {badge}
                                    </div>
                                )}

                                <div className="p-6">
                                    {/* Icon + Name */}
                                    <div className="flex items-center gap-3 mb-4">
                                        <div className="p-2 rounded-xl" style={{ background: `${plan.color}20`, color: plan.color }}>
                                            {PLAN_ICONS[plan.id] || <Zap className="w-7 h-7" />}
                                        </div>
                                        <h3 className="text-lg font-bold text-white">
                                            {getLocalizedText(plan.name, language)}
                                        </h3>
                                    </div>

                                    {/* Price */}
                                    <div className="mb-6">
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black text-white">{price}</span>
                                            {price > 0 && (
                                                <span className="text-sm text-slate-400">{t('billing_per_month')}</span>
                                            )}
                                        </div>
                                        {billingCycle === 'annual' && saved > 0 && (
                                            <p className="text-xs text-green-400 mt-1">
                                                {t('billing_save')} {saved.toLocaleString()} {language === 'ar' ? 'ر.س/سنة' : 'SAR/year'}
                                            </p>
                                        )}
                                        {billingCycle === 'annual' && plan.price > 0 && (
                                            <p className="text-xs text-slate-500 mt-0.5">{t('billing_billed_annually')}</p>
                                        )}
                                    </div>

                                    {/* CTA Button */}
                                    <button
                                        onClick={() => !isCurrentPlan && handleSelectPlan(plan.id)}
                                        disabled={isCurrentPlan}
                                        className={`w-full py-3 rounded-xl font-bold text-sm transition-all duration-300 mb-6 ${
                                            isCurrentPlan
                                                ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                                                : isPopular
                                                    ? 'text-white shadow-lg hover:shadow-xl hover:scale-[1.02]'
                                                    : 'bg-slate-700 hover:bg-slate-600 text-white'
                                        }`}
                                        style={!isCurrentPlan && isPopular ? { background: `linear-gradient(135deg, ${plan.color}, ${plan.color}cc)` } : undefined}
                                    >
                                        {isCurrentPlan ? t('payment_current_plan') : (plan.price === 0 ? t('pricing_start_free') : t('payment_select_plan'))}
                                    </button>

                                    {/* Features */}
                                    <ul className="space-y-2.5">
                                        {features.map((feature, i) => (
                                            <li key={i} className="flex items-start gap-2 text-sm text-slate-300">
                                                <Check className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: plan.color }} />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Compare Button */}
                <div className="text-center mt-12">
                    <button
                        onClick={() => setShowComparison(!showComparison)}
                        className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl border border-slate-600 transition-all duration-300 inline-flex items-center gap-2"
                    >
                        {showComparison ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        {t('pricing_compare')}
                    </button>
                </div>

                {/* Comparison Table */}
                {showComparison && (
                    <div className="mt-8 overflow-x-auto rounded-2xl border border-slate-700/50 bg-slate-800/50" style={{ backdropFilter: 'blur(20px)' }}>
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-slate-700">
                                    <th className="p-4 text-left text-slate-400 font-medium sticky left-0 bg-slate-800 min-w-[180px]">
                                        {language === 'ar' ? 'الميزة' : 'Feature'}
                                    </th>
                                    {SUBSCRIPTION_PLANS.map(plan => (
                                        <th key={plan.id} className="p-4 text-center min-w-[120px]" style={{ color: plan.color }}>
                                            {getLocalizedText(plan.name, language)}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {[
                                    { label: { ar: 'المشاريع/شهر', en: 'Projects/mo' }, values: SUBSCRIPTION_PLANS.map(p => p.projectsIncluded === -1 ? '∞' : p.projectsIncluded.toString()) },
                                    { label: { ar: 'التخزين', en: 'Storage' }, values: SUBSCRIPTION_PLANS.map(p => p.storageMB >= 1024 ? `${p.storageMB / 1024} GB` : `${p.storageMB} MB`) },
                                    { label: { ar: 'AI بنود/شهر', en: 'AI items/mo' }, values: SUBSCRIPTION_PLANS.map(p => p.aiBudgetItems === -1 ? '∞' : p.aiBudgetItems === 0 ? '—' : p.aiBudgetItems.toLocaleString()) },
                                    { label: { ar: 'BOQ رفع/شهر', en: 'BOQ uploads/mo' }, values: SUBSCRIPTION_PLANS.map(p => p.boqUploads === -1 ? '∞' : p.boqUploads === 0 ? '—' : p.boqUploads.toString()) },
                                    { label: { ar: 'الموظفين', en: 'Employees' }, values: SUBSCRIPTION_PLANS.map(p => p.employeesIncluded === 0 ? '—' : `+${p.employeesIncluded}`) },
                                    { label: { ar: 'API', en: 'API Access' }, values: SUBSCRIPTION_PLANS.map(p => p.apiAccess ? (p.apiCallsIncluded === -1 ? '∞' : `${p.apiCallsIncluded.toLocaleString()}/mo`) : '—') },
                                    { label: { ar: 'تقارير مناقصات', en: 'Tender Reports' }, values: SUBSCRIPTION_PLANS.map(p => p.tenderReports === -1 ? '∞' : p.tenderReports === 0 ? '—' : `${p.tenderReports}/mo`) },
                                    { label: { ar: 'White-label', en: 'White-label' }, values: SUBSCRIPTION_PLANS.map(p => p.whiteLabel) },
                                    { label: { ar: 'مدير حساب', en: 'Account Manager' }, values: SUBSCRIPTION_PLANS.map(p => p.dedicatedManager) },
                                ].map((row, idx) => (
                                    <tr key={idx} className="border-b border-slate-700/50 hover:bg-slate-700/20">
                                        <td className="p-4 text-slate-300 font-medium sticky left-0 bg-slate-800/90">
                                            {getLocalizedText(row.label, language)}
                                        </td>
                                        {row.values.map((val, i) => (
                                            <td key={i} className="p-4 text-center text-white">
                                                {typeof val === 'boolean' ? (
                                                    val ? <Check className="w-5 h-5 mx-auto text-green-400" /> : <X className="w-5 h-5 mx-auto text-slate-600" />
                                                ) : (
                                                    <span className={val === '—' ? 'text-slate-600' : val === '∞' ? 'text-green-400 font-bold' : ''}>{val}</span>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* FAQ */}
                <div className="mt-20 max-w-3xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center mb-8">{t('pricing_faq')}</h2>
                    <div className="space-y-3">
                        {FAQ_ITEMS.map((item, idx) => (
                            <div key={idx} className="rounded-xl border border-slate-700/50 bg-slate-800/50 overflow-hidden">
                                <button
                                    onClick={() => setExpandedFaq(expandedFaq === idx ? null : idx)}
                                    className="w-full p-5 flex items-center justify-between text-left"
                                >
                                    <span className="text-white font-medium">{getLocalizedText(item.q, language)}</span>
                                    {expandedFaq === idx ? <ChevronUp className="w-5 h-5 text-slate-400" /> : <ChevronDown className="w-5 h-5 text-slate-400" />}
                                </button>
                                {expandedFaq === idx && (
                                    <div className="px-5 pb-5 text-slate-400 text-sm leading-relaxed border-t border-slate-700/50 pt-3">
                                        {getLocalizedText(item.a, language)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Enterprise CTA */}
                <div className="mt-16 text-center">
                    <div className="inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-500/10 to-violet-500/10 border border-purple-500/30">
                        <Shield className="w-6 h-6 text-purple-400" />
                        <span className="text-white font-medium">{language === 'ar' ? 'تحتاج حل مخصص لمنشأتك؟' : 'Need a custom enterprise solution?'}</span>
                        <button className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold text-sm transition-all">
                            {t('pricing_contact_sales')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PricingPage;
