import React from 'react';
import { Clock, Mail, CreditCard, FileText, ArrowLeft, ArrowRight, CheckCircle, Upload, RefreshCw, AlertCircle, Building2, Shield } from 'lucide-react';
import { registrationService, RegistrationRequest, REGISTRATION_STATUS_TRANSLATIONS, PAYMENT_STATUS_TRANSLATIONS, USER_TYPE_TRANSLATIONS } from '../services/registrationService';

interface UnderReviewPageProps {
    language: 'ar' | 'en';
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
                title: language === 'ar' ? 'طلبك تحت الدراسة' : 'Your Request is Under Review',
                message: language === 'ar'
                    ? 'يتم مراجعة طلب التسجيل الخاص بك من قبل فريق الدعم. سيتم إبلاغكم بتفعيل الحساب في أقرب وقت ممكن.'
                    : 'Your registration request is being reviewed by our support team. You will be notified once your account is activated.',
                color: 'yellow'
            };
        }

        switch (request.status) {
            case 'pending_payment':
                // الموردين مجاناً - لا نظهر لهم صفحة الدفع
                if (request.userType === 'supplier') {
                    return {
                        icon: <Clock className="w-12 h-12 text-yellow-500" />,
                        title: language === 'ar' ? 'طلبك تحت المراجعة' : 'Under Review',
                        message: language === 'ar'
                            ? 'طلبك تحت الدراسة من قبل فريق الدعم. سيتم إبلاغكم بتفعيل الحساب في أقرب وقت ممكن.'
                            : 'Your request is being reviewed by our support team. You will be notified once approved.',
                        color: 'yellow'
                    };
                }
                return {
                    icon: <CreditCard className="w-12 h-12 text-blue-500" />,
                    title: language === 'ar' ? 'بانتظار الدفع' : 'Awaiting Payment',
                    message: language === 'ar'
                        ? 'يرجى إتمام عملية الدفع لإكمال تسجيلك.'
                        : 'Please complete the payment to finalize your registration.',
                    color: 'blue',
                    showPaymentOptions: true
                };
            case 'payment_under_review':
                return {
                    icon: <FileText className="w-12 h-12 text-orange-500" />,
                    title: language === 'ar' ? 'الدفع تحت المراجعة' : 'Payment Under Review',
                    message: language === 'ar'
                        ? 'تم استلام إيصال الدفع وهو الآن تحت المراجعة. سيتم إبلاغكم بالنتيجة قريباً.'
                        : 'Your payment receipt has been received and is under review. You will be notified soon.',
                    color: 'orange'
                };
            case 'pending_approval':
                return {
                    icon: <Clock className="w-12 h-12 text-yellow-500" />,
                    title: language === 'ar' ? 'بانتظار الموافقة' : 'Pending Approval',
                    message: language === 'ar'
                        ? 'طلبك تحت الدراسة من قبل فريق الدعم. سيتم إبلاغكم بتفعيل الحساب في أقرب وقت ممكن.'
                        : 'Your request is being reviewed by our support team. You will be notified once approved.',
                    color: 'yellow'
                };
            case 'pending_cr_verification':
                return {
                    icon: <Shield className="w-12 h-12 text-orange-500" />,
                    title: language === 'ar' ? 'بانتظار تأكيد السجل التجاري' : 'Commercial Register Verification',
                    message: language === 'ar'
                        ? 'يتم التحقق من صحة السجل التجاري الخاص بك من قبل فريق الدعم. سيتم إبلاغكم بالنتيجة قريباً.'
                        : 'Your commercial register is being verified by our support team. You will be notified soon.',
                    color: 'orange'
                };
            case 'approved':
                return {
                    icon: <CheckCircle className="w-12 h-12 text-green-500" />,
                    title: language === 'ar' ? 'تم تفعيل حسابك!' : 'Account Activated!',
                    message: language === 'ar'
                        ? 'تهانينا! تم الموافقة على طلبك وتفعيل حسابك. يمكنك الآن تسجيل الدخول.'
                        : 'Congratulations! Your account has been approved and activated. You can now log in.',
                    color: 'green',
                    showLoginButton: true
                };
            case 'rejected':
                return {
                    icon: <AlertCircle className="w-12 h-12 text-red-500" />,
                    title: language === 'ar' ? 'تم رفض الطلب' : 'Request Rejected',
                    message: request.rejectionReason || (language === 'ar' ? 'تم رفض طلب التسجيل.' : 'Your registration request has been rejected.'),
                    color: 'red'
                };
            default:
                return {
                    icon: <Clock className="w-12 h-12 text-yellow-500" />,
                    title: language === 'ar' ? 'جاري المعالجة' : 'Processing',
                    message: language === 'ar' ? 'يرجى الانتظار...' : 'Please wait...',
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
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-white animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-6" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="w-full max-w-lg">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <Building2 className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">
                        {language === 'ar' ? 'نظام أربا للتسعير' : 'ARBA Pricing System'}
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
                                <span className="text-slate-500">{language === 'ar' ? 'نوع الحساب:' : 'Account Type:'}</span>
                                <span className="font-medium text-slate-700">
                                    {USER_TYPE_TRANSLATIONS[request.userType][language]}
                                </span>
                            </div>
                            {(request.userType === 'company' || request.userType === 'supplier') && (
                                <>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">{language === 'ar' ? 'اسم الشركة:' : 'Company:'}</span>
                                        <span className="font-medium text-slate-700">{request.companyName}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">{language === 'ar' ? 'السجل التجاري:' : 'CR:'}</span>
                                        <span className="font-medium text-slate-700 font-mono" dir="ltr">{request.commercialRegister}</span>
                                    </div>
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">{language === 'ar' ? 'حالة السجل:' : 'CR Status:'}</span>
                                        <span className={`font-medium ${request.crVerified ? 'text-green-600' : 'text-orange-600'}`}>
                                            {request.crVerified
                                                ? (language === 'ar' ? 'مؤكد' : 'Verified')
                                                : (language === 'ar' ? 'بانتظار التحقق' : 'Pending')}
                                        </span>
                                    </div>
                                </>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">{language === 'ar' ? 'الباقة:' : 'Plan:'}</span>
                                <span className="font-medium text-slate-700">
                                    {request.plan === 'free'
                                        ? (language === 'ar' ? 'مجانية' : 'Free')
                                        : (language === 'ar' ? 'احترافية' : 'Professional')
                                    }
                                </span>
                            </div>
                            {request.plan !== 'free' && (
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">{language === 'ar' ? 'حالة الدفع:' : 'Payment Status:'}</span>
                                    <span className="font-medium text-slate-700">
                                        {PAYMENT_STATUS_TRANSLATIONS[request.paymentStatus][language]}
                                    </span>
                                </div>
                            )}
                            <div className="flex justify-between text-sm">
                                <span className="text-slate-500">{language === 'ar' ? 'تاريخ الطلب:' : 'Request Date:'}</span>
                                <span className="font-medium text-slate-700" dir="ltr">
                                    {new Date(request.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                </span>
                            </div>
                        </div>
                    )}

                    {/* Payment Options (for pending payment) */}
                    {(statusInfo as any).showPaymentOptions && request && (
                        <div className="space-y-3 mb-6">
                            <p className="text-sm text-slate-600 text-center mb-4">
                                {language === 'ar' ? 'المبلغ المطلوب:' : 'Amount Due:'}{' '}
                                <span className="font-bold text-emerald-600">{request.amount} {language === 'ar' ? 'ر.س' : 'SAR'}</span>
                            </p>
                            <button
                                onClick={() => onNavigate('payment-upload')}
                                className="w-full py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-xl font-bold hover:from-blue-400 hover:to-cyan-400 transition-all flex items-center justify-center gap-2"
                            >
                                <Upload className="w-5 h-5" />
                                {language === 'ar' ? 'رفع إيصال الدفع (تحويل بنكي)' : 'Upload Payment Receipt (Bank Transfer)'}
                            </button>
                        </div>
                    )}

                    {/* Login Button (for approved) */}
                    {(statusInfo as any).showLoginButton && (
                        <button
                            onClick={() => onNavigate('login')}
                            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center justify-center gap-2"
                        >
                            {language === 'ar' ? 'تسجيل الدخول' : 'Login'}
                            <Arrow className="w-5 h-5" />
                        </button>
                    )}

                    {/* Email Notification Info */}
                    <div className="flex items-center justify-center gap-2 text-slate-500 text-sm mt-6">
                        <Mail className="w-4 h-4" />
                        <span>
                            {language === 'ar'
                                ? 'سيتم إرسال إشعار لبريدك الإلكتروني عند تحديث حالة الطلب'
                                : 'You will receive an email notification when your request status is updated'
                            }
                        </span>
                    </div>
                </div>

                {/* Back to Home */}
                <button
                    onClick={() => onNavigate('landing')}
                    className="w-full mt-6 text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                    <Arrow className="w-4 h-4 rotate-180" />
                    {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
                </button>
            </div>
        </div>
    );
};

export default UnderReviewPage;
