import React from 'react';
import { Language } from '../types';
import { Clock, Mail, CreditCard, FileText, ArrowLeft, ArrowRight, CheckCircle, Upload, RefreshCw, AlertCircle, Building2, Shield } from 'lucide-react';
import { registrationService, RegistrationRequest, REGISTRATION_STATUS_TRANSLATIONS, PAYMENT_STATUS_TRANSLATIONS, USER_TYPE_TRANSLATIONS } from '../services/registrationService';

interface UnderReviewPageProps {
    language: Language;
    onNavigate: (page: string) => void;
    registrationRequestId?: string;
    onUploadReceipt?: () => void;
}

const UnderReviewPage: React.FC<UnderReviewPageProps> = ({
    language,
    onNavigate,
    registrationRequestId,
    onUploadReceipt
}) => {
    const t = (ar: string, en: string) => { const map: Record<string, string> = { ar, en, fr: en, zh: en }; return map[language] || en; };
    const isRtl = language === 'ar';
    const Arrow = isRtl ? ArrowLeft : ArrowRight;

    const [request, setRequest] = React.useState<RegistrationRequest | null>(null);
    const [loading, setLoading] = React.useState(true);

    React.useEffect(() => {
        if (registrationRequestId) {
            const req = registrationService.getRequestById(registrationRequestId);
            setRequest(req);
        }
        setLoading(false);
    }, [registrationRequestId]);

    // Get status info based on request status
    const getStatusInfo = () => {
        if (!request) {
            return {
                icon: <Clock className="w-12 h-12 text-yellow-500" />,
                title: t('طلبك تحت الدراسة', 'Your Request is Under Review'),
                message: t('يتم مراجعة طلب التسجيل الخاص بك من قبل فريق الدعم. سيتم إبلاغكم بتفعيل الحساب في أقرب وقت ممكن.', 'Your registration request is being reviewed by our support team. You will be notified once your account is activated.'),
                color: 'yellow'
            };
        }

        switch (request.status) {
            case 'pending_payment':
                // الموردين مجاناً - لا نظهر لهم صفحة الدفع
                if (request.userType === 'supplier') {
                    return {
                        icon: <Clock className="w-12 h-12 text-yellow-500" />,
                        title: t('طلبك تحت المراجعة', 'Under Review'),
                        message: t('طلبك تحت الدراسة من قبل فريق الدعم. سيتم إبلاغكم بتفعيل الحساب في أقرب وقت ممكن.', 'Your request is being reviewed by our support team. You will be notified once approved.'),
                        color: 'yellow'
                    };
                }
                return {
                    icon: <CreditCard className="w-12 h-12 text-blue-500" />,
                    title: t('بانتظار الدفع', 'Awaiting Payment'),
                    message: t('يرجى إتمام عملية الدفع لإكمال تسجيلك.', 'Please complete the payment to finalize your registration.'),
                    color: 'blue',
                    showPaymentOptions: true
                };
            case 'payment_under_review':
                return {
                    icon: <FileText className="w-12 h-12 text-orange-500" />,
                    title: t('الدفع تحت المراجعة', 'Payment Under Review'),
                    message: t('تم استلام إيصال الدفع وهو الآن تحت المراجعة. سيتم إبلاغكم بالنتيجة قريباً.', 'Your payment receipt has been received and is under review. You will be notified soon.'),
                    color: 'orange'
                };
            case 'pending_approval':
                return {
                    icon: <Clock className="w-12 h-12 text-yellow-500" />,
                    title: t('بانتظار الموافقة', 'Pending Approval'),
                    message: t('طلبك تحت الدراسة من قبل فريق الدعم. سيتم إبلاغكم بتفعيل الحساب في أقرب وقت ممكن.', 'Your request is being reviewed by our support team. You will be notified once approved.'),
                    color: 'yellow'
                };
            case 'pending_cr_verification':
                return {
                    icon: <Shield className="w-12 h-12 text-orange-500" />,
                    title: t('بانتظار تأكيد السجل التجاري', 'Commercial Register Verification'),
                    message: t('يتم التحقق من صحة السجل التجاري الخاص بك من قبل فريق الدعم. سيتم إبلاغكم بالنتيجة قريباً.', 'Your commercial register is being verified by our support team. You will be notified soon.'),
                    color: 'orange'
                };
            case 'approved':
                return {
                    icon: <CheckCircle className="w-12 h-12 text-green-500" />,
                    title: t('تم تفعيل حسابك!', 'Account Activated!'),
                    message: t('تهانينا! تم الموافقة على طلبك وتفعيل حسابك. يمكنك الآن تسجيل الدخول.', 'Congratulations! Your account has been approved and activated. You can now log in.'),
                    color: 'green',
                    showLoginButton: true
                };
            case 'rejected':
                return {
                    icon: <AlertCircle className="w-12 h-12 text-red-500" />,
                    title: t('تم رفض الطلب', 'Request Rejected'),
                    message: request.rejectionReason || (t('تم رفض طلب التسجيل.', 'Your registration request has been rejected.')),
                    color: 'red'
                };
            default:
                return {
                    icon: <Clock className="w-12 h-12 text-yellow-500" />,
                    title: t('جاري المعالجة', 'Processing'),
                    message: t('يرجى الانتظار...', 'Please wait...'),
                    color: 'yellow'
                };
        }
    };

    const statusInfo = getStatusInfo();

    const getColorClasses = (color: string) => {
        switch (color) {
            case 'green':
                return {
                    bg: 'bg-green-50',
                    border: 'border-green-200',
                    iconBg: 'bg-green-100'
                };
            case 'red':
                return {
                    bg: 'bg-red-50',
                    border: 'border-red-200',
                    iconBg: 'bg-red-100'
                };
            case 'blue':
                return {
                    bg: 'bg-blue-50',
                    border: 'border-blue-200',
                    iconBg: 'bg-blue-100'
                };
            case 'orange':
                return {
                    bg: 'bg-orange-50',
                    border: 'border-orange-200',
                    iconBg: 'bg-orange-100'
                };
            default:
                return {
                    bg: 'bg-yellow-50',
                    border: 'border-yellow-200',
                    iconBg: 'bg-yellow-100'
                };
        }
    };

    const colors = getColorClasses(statusInfo.color);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-[#070914] via-[#0E132B] to-[#0A1020] flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-white animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#070914] via-[#0E132B] to-[#0A1020] flex items-center justify-center p-6" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="w-full max-w-lg">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-lime-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-green-500/20">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">
                        {t('نظام أربا للتسعير', 'ARBA Pricing System')}
                    </h1>
                </div>

                {/* Status Card */}
                <div className={`${colors.bg} ${colors.border} border rounded-3xl p-8 shadow-2xl`}>
                    {/* Icon */}
                    <div className={`w-24 h-24 ${colors.iconBg} rounded-full flex items-center justify-center mx-auto mb-6`}>
                        {statusInfo.icon}
                    </div>

                    {/* Title */}
                    <h2 className="text-2xl font-bold text-slate-800 text-center mb-4">
                        {statusInfo.title}
                    </h2>

                    {/* Message */}
                    <p className="text-slate-600 text-center mb-6 leading-relaxed">
                        {statusInfo.message}
                    </p>

                    {/* Request Details */}
                    {request && (
                        <div className="bg-white/50 rounded-xl p-4 mb-6 space-y-2">
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">{t('نوع الحساب:', 'Account Type:')}</span>
                                <span className="font-medium text-slate-700">
                                    {USER_TYPE_TRANSLATIONS[request.userType][language]}
                                </span>
                            </div>
                            {(request.userType === 'company' || request.userType === 'supplier') && (
                                <>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">{t('اسم الشركة:', 'Company:')}</span>
                                        <span className="font-medium text-slate-700">{request.companyName}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">{t('السجل التجاري:', 'CR:')}</span>
                                        <span className="font-medium text-slate-700 font-mono" dir="ltr">{request.commercialRegister}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">{t('حالة السجل:', 'CR Status:')}</span>
                                        <span className={`font-medium ${request.crVerified ? 'text-green-600' : 'text-orange-600'}`}>
                                            {request.crVerified
                                                ? (t('مؤكد', 'Verified'))
                                                : (t('بانتظار التحقق', 'Pending'))}
                                        </span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">{t('الباقة:', 'Plan:')}</span>
                                <span className="font-medium text-slate-700">
                                    {request.plan === 'free'
                                        ? (t('مجانية', 'Free'))
                                        : (t('احترافية', 'Professional'))
                                    }
                                </span>
                            </div>
                            {request.plan !== 'free' && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{t('حالة الدفع:', 'Payment Status:')}</span>
                                    <span className="font-medium text-slate-700">
                                        {PAYMENT_STATUS_TRANSLATIONS[request.paymentStatus][language]}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">{t('تاريخ الطلب:', 'Request Date:')}</span>
                                <span className="font-medium text-slate-700" dir="ltr">
                                    {new Date(request.createdAt).toLocaleDateString(t('ar-SA', 'en-US'))}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Payment Options (for pending payment) */}
                    {(statusInfo as any).showPaymentOptions && request && (
                        <div className="space-y-3 mb-6">
                            <p className="text-sm text-slate-600 text-center mb-4">
                                {t('المبلغ المطلوب:', 'Amount Due:')}{' '}
                                <span className="font-bold text-green-600">{request.amount} {t('ر.س', 'SAR')}</span>
                            </p>
                            <button
                                onClick={() => onNavigate('payment-upload')}
                                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:from-blue-400 hover:to-cyan-400 transition-all flex items-center justify-center gap-2"
                            >
                                <Upload className="w-5 h-5" />
                                {t('رفع إيصال الدفع (تحويل بنكي)', 'Upload Payment Receipt (Bank Transfer)')}
                            </button>
                        </div>
                    )}

                    {/* Login Button (for approved) */}
                    {(statusInfo as any).showLoginButton && (
                        <button
                            onClick={() => onNavigate('login')}
                            className="w-full py-3 bg-gradient-to-r from-green-500 to-lime-500 text-white rounded-xl font-bold hover:from-green-400 hover:to-lime-400 transition-all flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
                        >
                            {t('تسجيل الدخول', 'Login')}
                            <Arrow className="w-5 h-5" />
                        </button>
                    )}

                    {/* Email Notification Info */}
                    <div className="flex items-center justify-center gap-2 text-slate-500 text-sm mt-6">
                        <Mail className="w-4 h-4" />
                        <span>
                            {t('سيتم إرسال إشعار لبريدك الإلكتروني عند تحديث حالة الطلب', 'You will receive an email notification when your request status is updated')}
                        </span>
                    </div>
                </div>

                {/* Back to Home */}
                <button
                    onClick={() => onNavigate('landing')}
                    className="w-full mt-6 text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                    <Arrow className="w-4 h-4 rotate-180" />
                    {t('العودة للرئيسية', 'Back to Home')}
                </button>
            </div>
        </div>
    );
};

export default UnderReviewPage;
