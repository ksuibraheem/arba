import React, { useState } from 'react';
import { CreditCard, Check, Crown, Zap, Shield, ArrowRight, ArrowLeft, Building2, Star, Clock, Users, HardDrive } from 'lucide-react';
import { SUBSCRIPTION_PLANS } from '../companyData';

interface PaymentPageProps {
    language: 'ar' | 'en';
    onNavigate: (page: string) => void;
    currentPlan?: string;
    onSelectPlan?: (planId: string) => void;
}

const PaymentPage: React.FC<PaymentPageProps> = ({ language, onNavigate, currentPlan = 'free', onSelectPlan }) => {
    const isRtl = language === 'ar';
    const Arrow = isRtl ? ArrowLeft : ArrowRight;
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | 'mada'>('card');
    const [isProcessing, setIsProcessing] = useState(false);

    const t = {
        title: { ar: 'اختر باقتك', en: 'Choose Your Plan' },
        subtitle: { ar: 'ابدأ مجاناً أو اختر الباقة المناسبة لاحتياجاتك', en: 'Start free or choose the plan that fits your needs' },
        currentPlan: { ar: 'باقتك الحالية', en: 'Current Plan' },
        selectPlan: { ar: 'اختيار الباقة', en: 'Select Plan' },
        upgradeNow: { ar: 'ترقية الآن', en: 'Upgrade Now' },
        monthlyPrice: { ar: 'شهرياً', en: '/month' },
        yearlyPrice: { ar: 'سنوياً', en: '/year' },
        features: { ar: 'المميزات:', en: 'Features:' },
        paymentMethod: { ar: 'طريقة الدفع', en: 'Payment Method' },
        creditCard: { ar: 'بطاقة ائتمان', en: 'Credit Card' },
        bankTransfer: { ar: 'تحويل بنكي', en: 'Bank Transfer' },
        mada: { ar: 'مدى', en: 'Mada' },
        confirmPayment: { ar: 'تأكيد الدفع', en: 'Confirm Payment' },
        processing: { ar: 'جاري المعالجة...', en: 'Processing...' },
        backToHome: { ar: 'العودة للرئيسية', en: 'Back to Home' },
        popular: { ar: 'الأكثر طلباً', en: 'Most Popular' },
        projects: { ar: 'مشروع', en: 'Projects' },
        storage: { ar: 'تخزين', en: 'Storage' },
        unlimited: { ar: 'غير محدود', en: 'Unlimited' }
    };

    const getLabel = (key: keyof typeof t) => t[key][language];

    const planIcons: Record<string, React.ReactNode> = {
        free: <Zap className="w-6 h-6" />,
        professional: <Crown className="w-6 h-6" />,
        enterprise: <Shield className="w-6 h-6" />
    };

    const planColors: Record<string, string> = {
        free: 'from-slate-400 to-slate-500',
        professional: 'from-emerald-400 to-teal-500',
        enterprise: 'from-purple-400 to-indigo-500'
    };

    const handleSelectPlan = (planId: string) => {
        if (planId === 'free') {
            onNavigate('dashboard');
            return;
        }
        setSelectedPlan(planId);
    };

    const handleConfirmPayment = async () => {
        if (!selectedPlan) return;
        setIsProcessing(true);

        // Simulate payment processing
        await new Promise(resolve => setTimeout(resolve, 2000));

        if (onSelectPlan) {
            onSelectPlan(selectedPlan);
        }
        setIsProcessing(false);
        onNavigate('dashboard');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <button
                        onClick={() => onNavigate('landing')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <Arrow className="w-4 h-4 rotate-180" />
                        {getLabel('backToHome')}
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">ARBA</span>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-6 py-12 max-w-6xl">
                {/* Title */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">{getLabel('title')}</h1>
                    <p className="text-xl text-slate-300">{getLabel('subtitle')}</p>
                </div>

                {/* Plans Grid */}
                {!selectedPlan ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                        {SUBSCRIPTION_PLANS.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border transition-all hover:scale-105 ${plan.id === 'professional'
                                        ? 'border-emerald-500 shadow-xl shadow-emerald-500/20'
                                        : 'border-slate-700/50'
                                    }`}
                            >
                                {plan.id === 'professional' && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full text-white text-sm font-bold flex items-center gap-1">
                                        <Star className="w-4 h-4" />
                                        {getLabel('popular')}
                                    </div>
                                )}

                                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${planColors[plan.id]} flex items-center justify-center text-white mb-6`}>
                                    {planIcons[plan.id]}
                                </div>

                                <h2 className="text-2xl font-bold text-white mb-2">{plan.name[language]}</h2>

                                <div className="flex items-baseline gap-1 mb-6">
                                    <span className="text-4xl font-bold text-white">{plan.price}</span>
                                    <span className="text-slate-400">{language === 'ar' ? 'ريال' : 'SAR'} {getLabel('monthlyPrice')}</span>
                                </div>

                                <div className="space-y-3 mb-8">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <Users className="w-4 h-4 text-emerald-400" />
                                        <span>{plan.projectsIncluded === -1 ? getLabel('unlimited') : plan.projectsIncluded} {getLabel('projects')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <HardDrive className="w-4 h-4 text-emerald-400" />
                                        <span>{plan.storageMB >= 1024 ? `${plan.storageMB / 1024}GB` : `${plan.storageMB}MB`} {getLabel('storage')}</span>
                                    </div>
                                </div>

                                <ul className="space-y-2 mb-8">
                                    {plan.features[language].slice(0, 5).map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2 text-slate-300 text-sm">
                                            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                <button
                                    onClick={() => handleSelectPlan(plan.id)}
                                    disabled={currentPlan === plan.id}
                                    className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${currentPlan === plan.id
                                            ? 'bg-slate-600 text-slate-400 cursor-not-allowed'
                                            : plan.id === 'professional'
                                                ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-400 hover:to-teal-400'
                                                : 'bg-slate-700 text-white hover:bg-slate-600'
                                        }`}
                                >
                                    {currentPlan === plan.id ? getLabel('currentPlan') : getLabel('selectPlan')}
                                    {currentPlan !== plan.id && <Arrow className="w-4 h-4" />}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* Payment Form */
                    <div className="max-w-lg mx-auto bg-slate-800/50 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50">
                        <h2 className="text-2xl font-bold text-white mb-6">{getLabel('paymentMethod')}</h2>

                        <div className="space-y-3 mb-8">
                            {(['card', 'mada', 'bank'] as const).map((method) => (
                                <button
                                    key={method}
                                    onClick={() => setPaymentMethod(method)}
                                    className={`w-full p-4 rounded-xl border transition-all flex items-center gap-4 ${paymentMethod === method
                                            ? 'border-emerald-500 bg-emerald-500/10'
                                            : 'border-slate-600 hover:border-slate-500'
                                        }`}
                                >
                                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${paymentMethod === method ? 'bg-emerald-500' : 'bg-slate-700'
                                        }`}>
                                        <CreditCard className={`w-5 h-5 ${paymentMethod === method ? 'text-white' : 'text-slate-400'}`} />
                                    </div>
                                    <span className="text-white font-medium">
                                        {method === 'card' ? getLabel('creditCard') : method === 'mada' ? getLabel('mada') : getLabel('bankTransfer')}
                                    </span>
                                    {paymentMethod === method && (
                                        <Check className="w-5 h-5 text-emerald-400 mr-auto" />
                                    )}
                                </button>
                            ))}
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setSelectedPlan(null)}
                                className="flex-1 py-3 rounded-xl border border-slate-600 text-slate-300 hover:bg-slate-700 transition-colors"
                            >
                                {getLabel('backToHome')}
                            </button>
                            <button
                                onClick={handleConfirmPayment}
                                disabled={isProcessing}
                                className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-bold hover:from-emerald-400 hover:to-teal-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isProcessing ? (
                                    <>
                                        <Clock className="w-4 h-4 animate-spin" />
                                        {getLabel('processing')}
                                    </>
                                ) : (
                                    <>
                                        {getLabel('confirmPayment')}
                                        <Arrow className="w-4 h-4" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentPage;
