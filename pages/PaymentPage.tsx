import React, { useState } from 'react';
import { CreditCard, Building2, ArrowLeft, ArrowRight, Check, Shield, Crown, Zap, Star, Clock, Users, HardDrive, Smartphone, AlertCircle, ExternalLink, Upload, FileText } from 'lucide-react';
import { COMPANY_INFO, SUBSCRIPTION_PLANS, PAGE_TRANSLATIONS } from '../companyData';
import { initiateElectronicPayment, submitBankTransfer, PLAN_PRICES, PAYMENT_MESSAGES } from '../src/services/paymentService';
import { registrationService } from '../services/registrationService';
import ArbaLogo from '../components/ArbaLogo';


interface PaymentPageProps {
    language: 'ar' | 'en';
    onNavigate: (page: string) => void;
    currentPlan?: string;
    onSelectPlan?: (planId: string) => void;
    userId?: string;
    userEmail?: string;
    userName?: string;
    registrationRequestId?: string;
}

const BANK_ACCOUNT_INFO = {
    bankName: { ar: 'بنك الراجحي', en: 'Al Rajhi Bank' },
    accountName: { ar: 'مؤسسة اربا المطور', en: 'Arba Developer Est.' },
    iban: 'SA4680000216608016630501',
    accountNumber: '216000010006086630501'
};

const PaymentPage: React.FC<PaymentPageProps> = ({
    language,
    onNavigate,
    currentPlan = 'free',
    onSelectPlan,
    userId = '',
    userEmail = '',
    userName = '',
    registrationRequestId
}) => {
    const isRtl = language === 'ar';
    const Arrow = isRtl ? ArrowLeft : ArrowRight;
    const t = (key: string) => PAGE_TRANSLATIONS[key]?.[language] || key;

    // State
    const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<'card' | 'bank' | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState<'electronic' | 'bank' | null>(null);
    const [receiptFile, setReceiptFile] = useState<string | null>(null);
    const [receiptFileName, setReceiptFileName] = useState('');

    // Dynamic price based on selected plan
    const selectedPlanPrice = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan)?.price || 0;

    const planIcons: Record<string, React.ReactNode> = {
        free: <Zap className="w-6 h-6" />,
        professional: <Crown className="w-6 h-6" />,
        enterprise: <Shield className="w-6 h-6" />
    };

    const planColors: Record<string, string> = {
        free: 'from-slate-400 to-slate-500',
        professional: 'from-green-500 to-lime-500',
        enterprise: 'from-purple-400 to-indigo-500'
    };

    // Plan selection
    const handleSelectPlan = (planId: string) => {
        if (planId === 'free') {
            onNavigate('dashboard');
            return;
        }
        setSelectedPlan(planId);
        setPaymentMethod(null);
        setError('');
    };

    // File upload handler
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 5 * 1024 * 1024) {
            setError(language === 'ar' ? 'حجم الملف يجب أن يكون أقل من 5 ميجابايت' : 'File must be under 5MB');
            return;
        }
        if (!file.type.startsWith('image/') && file.type !== 'application/pdf') {
            setError(language === 'ar' ? 'يرجى رفع صورة أو PDF' : 'Please upload an image or PDF');
            return;
        }
        const reader = new FileReader();
        reader.onloadend = () => {
            setReceiptFile(reader.result as string);
            setReceiptFileName(file.name);
            setError('');
        };
        reader.readAsDataURL(file);
    };

    // Electronic payment (Tap)
    const handleElectronicPayment = async () => {
        if (!selectedPlan) return;
        setIsProcessing(true);
        setError('');

        try {
            const result = await initiateElectronicPayment({
                userId,
                userEmail,
                userName,
                amount: selectedPlanPrice,
                plan: 'professional',
                gateway: 'tap'
            });

            if (result.success && result.paymentUrl) {
                // Redirect to Tap payment page
                window.location.href = result.paymentUrl;
            } else {
                setError(result.error || PAYMENT_MESSAGES.payment_failed[language]);
                setIsProcessing(false);
            }
        } catch (err) {
            setError(PAYMENT_MESSAGES.payment_failed[language]);
            setIsProcessing(false);
        }
    };

    // Bank transfer
    const handleBankTransfer = async () => {
        if (!selectedPlan || !receiptFile) {
            setError(language === 'ar' ? 'يرجى رفع إيصال الدفع' : 'Please upload payment receipt');
            return;
        }
        setIsProcessing(true);
        setError('');

        try {
            const result = await submitBankTransfer({
                userId,
                userEmail,
                userName,
                amount: selectedPlanPrice,
                plan: 'professional',
                gateway: 'bank_transfer',
                receiptFile,
                receiptFileName
            });

            if (result.success) {
                // Update registration request status if applicable
                if (registrationRequestId) {
                    registrationService.uploadPaymentReceipt(registrationRequestId, receiptFile, receiptFileName);
                }
                setSuccess('bank');
                setTimeout(() => onNavigate('under-review'), 3000);
            } else {
                setError(result.error || PAYMENT_MESSAGES.payment_failed[language]);
            }
        } catch (err) {
            setError(PAYMENT_MESSAGES.payment_failed[language]);
        } finally {
            setIsProcessing(false);
        }
    };

    // ═══════ Success Screen ═══════
    if (success) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#070914] via-[#0E132B] to-[#0A1020] flex items-center justify-center p-6" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="bg-white rounded-3xl p-8 shadow-2xl max-w-md w-full text-center">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${success === 'electronic' ? 'bg-green-100' : 'bg-amber-100'}`}>
                        {success === 'electronic'
                            ? <Check className="w-10 h-10 text-green-500" />
                            : <Clock className="w-10 h-10 text-amber-500" />
                        }
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-4">
                        {success === 'electronic'
                            ? PAYMENT_MESSAGES.electronic_success[language]
                            : PAYMENT_MESSAGES.bank_submitted[language]
                        }
                    </h2>
                    <p className="text-slate-500">
                        {language === 'ar' ? 'جاري التحويل...' : 'Redirecting...'}
                    </p>
                </div>
            </div>
        );
    }

    const selectedPlanData = SUBSCRIPTION_PLANS.find(p => p.id === selectedPlan);
    const amount = selectedPlanData?.price || 0;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#070914] via-[#0E132B] to-[#0A1020]" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="bg-[#070A18]/90 backdrop-blur-xl border-b border-[#2B2D6E]/40 sticky top-0 z-50 shadow-lg shadow-[#000000]/20">
                <div className="container mx-auto px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center">
                    <button
                        onClick={() => selectedPlan ? setSelectedPlan(null) : onNavigate('landing')}
                        className="flex items-center gap-1.5 sm:gap-2 text-sm sm:text-base text-slate-400 hover:text-white transition-colors"
                    >
                        <Arrow className="w-4 h-4 rotate-180" />
                        <span className="hidden sm:inline">{selectedPlan ? (language === 'ar' ? 'رجوع للباقات' : 'Back to plans') : t('payment_back_to_home')}</span>
                        <span className="sm:hidden">{language === 'ar' ? 'رجوع' : 'Back'}</span>
                    </button>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <ArbaLogo size={36} animated />
                        <span className="text-lg sm:text-xl font-bold text-white">{COMPANY_INFO.systemName[language]}</span>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-12 max-w-6xl">
                {/* Title */}
                <div className="text-center mb-6 sm:mb-12">
                    <h1 className="text-2xl sm:text-4xl font-bold text-white mb-2 sm:mb-4">{t('payment_title')}</h1>
                    <p className="text-base sm:text-xl text-slate-300">{t('payment_subtitle')}</p>
                </div>

                {/* ═══════ Step 1: Plan Selection ═══════ */}
                {!selectedPlan ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-8 mb-8 sm:mb-12">
                        {SUBSCRIPTION_PLANS.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative bg-[#0E132B]/60 backdrop-blur-sm rounded-2xl sm:rounded-3xl p-5 sm:p-8 border transition-all md:hover:scale-105 ${plan.id === 'professional'
                                    ? 'border-green-500 shadow-2xl shadow-green-500/10 ring-1 ring-green-500/30'
                                    : 'border-[#2B2D6E]/40 hover:border-[#2B2D6E]/70'
                                    }`}
                            >
                                {plan.id === 'professional' && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-green-500 to-lime-500 rounded-full text-white text-sm font-bold flex items-center gap-1 shadow-lg shadow-green-500/20">
                                        <Star className="w-4 h-4" />
                                        {t('popular')}
                                    </div>
                                )}
                                <div className={`w-10 h-10 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-gradient-to-br ${planColors[plan.id]} flex items-center justify-center text-white mb-4 sm:mb-6`}>
                                    {planIcons[plan.id]}
                                </div>
                                <h2 className="text-xl sm:text-2xl font-bold text-white mb-1 sm:mb-2">{plan.name[language]}</h2>
                                <div className="flex items-baseline gap-1 mb-4 sm:mb-6">
                                    <span className="text-3xl sm:text-4xl font-bold text-white">{plan.price}</span>
                                    <span className="text-sm sm:text-base text-slate-400">{language === 'ar' ? 'ريال' : 'SAR'} {t('payment_monthly_price')}</span>
                                </div>
                                <div className="space-y-2 sm:space-y-3 mb-4 sm:mb-8">
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <Users className="w-4 h-4 text-green-400" />
                                        <span>{plan.projectsIncluded === -1 ? t('unlimited') : plan.projectsIncluded} {t('payment_projects')}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-slate-300">
                                        <HardDrive className="w-4 h-4 text-green-400" />
                                        <span>{plan.storageMB >= 1024 ? `${plan.storageMB / 1024}GB` : `${plan.storageMB}MB`} {t('payment_storage')}</span>
                                    </div>
                                </div>
                                <ul className="space-y-1.5 sm:space-y-2 mb-4 sm:mb-8">
                                    {plan.features[language].slice(0, 5).map((feature, index) => (
                                        <li key={index} className="flex items-center gap-2 text-slate-300 text-sm">
                                            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>
                                <button
                                    onClick={() => handleSelectPlan(plan.id)}
                                    disabled={currentPlan === plan.id}
                                    className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${currentPlan === plan.id
                                        ? 'bg-slate-600/50 text-slate-400 cursor-not-allowed'
                                        : plan.id === 'professional'
                                            ? 'bg-gradient-to-r from-green-500 to-lime-500 text-white hover:from-green-400 hover:to-lime-400 shadow-lg shadow-green-500/20'
                                            : 'bg-[#2B2D6E]/80 text-white hover:bg-[#34378A]'
                                        }`}
                                >
                                    {currentPlan === plan.id ? t('payment_current_plan') : t('payment_select_plan')}
                                    {currentPlan !== plan.id && <Arrow className="w-4 h-4" />}
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    /* ═══════ Step 2: Payment Method ═══════ */
                    <div className="max-w-2xl mx-auto px-1">
                        {/* Amount Display */}
                        <div className="bg-[#0B0F24]/80 border border-green-500/40 rounded-xl sm:rounded-2xl p-4 sm:p-6 mb-6 sm:mb-8 text-center ring-1 ring-green-500/10 shadow-lg shadow-green-500/5">
                            <p className="text-green-400 text-sm mb-1">
                                {language === 'ar' ? 'المبلغ المطلوب' : 'Amount Due'}
                            </p>
                            <p className="text-3xl sm:text-4xl font-bold text-white">
                                {amount.toLocaleString()} <span className="text-lg text-green-400">{language === 'ar' ? 'ر.س' : 'SAR'}</span>
                            </p>
                            <p className="text-green-300/70 text-sm mt-1">
                                {language === 'ar'
                                    ? `اشتراك سنوي — ${selectedPlanData?.name[language] || 'الباقة الاحترافية'}`
                                    : `Annual — ${selectedPlanData?.name[language] || 'Professional Plan'}`
                                }
                            </p>
                        </div>

                        {/* Two Payment Options */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
                            {/* Option 1: Electronic (Tap) */}
                            <button
                                onClick={() => { setPaymentMethod('card'); setError(''); }}
                                className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all text-right ${paymentMethod === 'card'
                                    ? 'border-green-500 bg-[#0E132B] shadow-lg shadow-green-500/10'
                                    : 'border-[#2B2D6E]/40 bg-[#0B0F24]/60 hover:border-[#2B2D6E]/70'
                                    }`}
                            >
                                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                                    <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center ${paymentMethod === 'card' ? 'bg-green-500' : 'bg-[#131A3B]'}`}>
                                        <CreditCard className={`w-7 h-7 ${paymentMethod === 'card' ? 'text-white' : 'text-slate-400'}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">
                                            {language === 'ar' ? 'بطاقة بنكية' : 'Bank Card'}
                                        </h3>
                                        <p className="text-green-400 text-sm font-medium">
                                            {language === 'ar' ? '⚡ تفعيل فوري' : '⚡ Instant activation'}
                                        </p>
                                    </div>
                                    {paymentMethod === 'card' && <Check className="w-6 h-6 text-green-400 mr-auto" />}
                                </div>
                                <p className="text-slate-400 text-sm">
                                    {language === 'ar'
                                        ? 'فيزا، ماستركارد، مدى، Apple Pay وغيرها — دفع آمن عبر Tap'
                                        : 'Visa, Mastercard, Mada, Apple Pay & more — secure via Tap'}
                                </p>
                            </button>

                            {/* Option 2: Bank Transfer */}
                            <button
                                onClick={() => { setPaymentMethod('bank'); setError(''); }}
                                className={`p-4 sm:p-6 rounded-xl sm:rounded-2xl border-2 transition-all text-right ${paymentMethod === 'bank'
                                    ? 'border-amber-500 bg-[#0E132B] shadow-lg shadow-amber-500/10'
                                    : 'border-[#2B2D6E]/40 bg-[#0B0F24]/60 hover:border-[#2B2D6E]/70'
                                    }`}
                            >
                                <div className="flex items-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                                    <div className={`w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl flex items-center justify-center ${paymentMethod === 'bank' ? 'bg-amber-500' : 'bg-[#131A3B]'}`}>
                                        <Building2 className={`w-7 h-7 ${paymentMethod === 'bank' ? 'text-white' : 'text-slate-400'}`} />
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-white">
                                            {language === 'ar' ? 'تحويل بنكي' : 'Bank Transfer'}
                                        </h3>
                                        <p className="text-amber-400 text-sm font-medium">
                                            {language === 'ar' ? '🏦 يحتاج تأكيد المحاسب' : '🏦 Requires accountant approval'}
                                        </p>
                                    </div>
                                    {paymentMethod === 'bank' && <Check className="w-6 h-6 text-amber-400 mr-auto" />}
                                </div>
                                <p className="text-slate-400 text-sm">
                                    {language === 'ar'
                                        ? 'حوّل المبلغ ثم ارفع إيصال الدفع — يُراجع من المحاسب'
                                        : 'Transfer the amount then upload receipt — reviewed by accountant'}
                                </p>
                            </button>
                        </div>

                        {/* Bank Transfer Details */}
                        {paymentMethod === 'bank' && (
                            <div className="bg-[#0B0F24]/60 rounded-2xl p-6 border border-[#2B2D6E]/40 mb-8 space-y-6">
                                {/* Bank Info */}
                                <div className="bg-[#131A3B]/50 border border-[#2B2D6E]/50 rounded-xl p-4">
                                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                        <Building2 className="w-5 h-5 text-blue-400" />
                                        {language === 'ar' ? 'معلومات الحساب البنكي' : 'Bank Account Details'}
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between"><span className="text-slate-400">{language === 'ar' ? 'البنك:' : 'Bank:'}</span><span className="font-medium text-white">{BANK_ACCOUNT_INFO.bankName[language]}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-400">{language === 'ar' ? 'اسم الحساب:' : 'Account:'}</span><span className="font-medium text-white">{BANK_ACCOUNT_INFO.accountName[language]}</span></div>
                                        <div className="flex justify-between"><span className="text-slate-400">{language === 'ar' ? 'الآيبان:' : 'IBAN:'}</span><span className="font-medium text-white font-mono text-xs" dir="ltr">{BANK_ACCOUNT_INFO.iban}</span></div>
                                    </div>
                                </div>
                                {/* Upload Receipt */}
                                <div>
                                    <h4 className="text-white font-semibold mb-3 flex items-center gap-2">
                                        <Upload className="w-5 h-5 text-green-400" />
                                        {language === 'ar' ? 'رفع إيصال الدفع' : 'Upload Payment Receipt'}
                                    </h4>
                                    <label className={`block border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${receiptFile
                                        ? 'border-green-500 bg-[#0E132B]'
                                        : 'border-[#2B2D6E]/50 hover:border-green-400 bg-[#131A3B]/30'
                                        }`}>
                                        <input type="file" accept="image/*,.pdf" onChange={handleFileUpload} className="hidden" />
                                        {receiptFile ? (
                                            <div className="text-green-400">
                                                <FileText className="w-10 h-10 mx-auto mb-2" />
                                                <p className="font-medium">{receiptFileName}</p>
                                                <p className="text-sm text-green-300/70">{language === 'ar' ? 'اضغط لتغيير الملف' : 'Click to change'}</p>
                                            </div>
                                        ) : (
                                            <div className="text-slate-400">
                                                <Upload className="w-10 h-10 mx-auto mb-2" />
                                                <p className="font-medium">{language === 'ar' ? 'اضغط لرفع الإيصال' : 'Click to upload'}</p>
                                                <p className="text-sm">{language === 'ar' ? 'صورة أو PDF (حد أقصى 5MB)' : 'Image or PDF (max 5MB)'}</p>
                                            </div>
                                        )}
                                    </label>
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 flex items-center gap-3">
                                <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                                <p className="text-red-300">{error}</p>
                            </div>
                        )}

                        {/* Confirm Button */}
                        {paymentMethod && (
                            <button
                                onClick={paymentMethod === 'card' ? handleElectronicPayment : handleBankTransfer}
                                disabled={isProcessing || (paymentMethod === 'bank' && !receiptFile)}
                                className="w-full py-4 bg-gradient-to-r from-green-500 to-lime-500 text-white rounded-xl font-bold hover:from-green-400 hover:to-lime-400 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 text-lg shadow-lg shadow-green-500/20 text-slate-900"
                            >
                                {isProcessing ? (
                                    <>
                                        <Clock className="w-5 h-5 animate-spin" />
                                        {language === 'ar' ? 'جاري المعالجة...' : 'Processing...'}
                                    </>
                                ) : paymentMethod === 'card' ? (
                                    <>
                                        <ExternalLink className="w-5 h-5" />
                                        {language === 'ar' ? 'ادفع الآن عبر Tap' : 'Pay Now via Tap'}
                                    </>
                                ) : (
                                    <>
                                        <Upload className="w-5 h-5" />
                                        {language === 'ar' ? 'إرسال الإيصال للمراجعة' : 'Submit Receipt for Review'}
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default PaymentPage;
