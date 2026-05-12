import React, { useState, useEffect, useCallback } from 'react';
import { Language } from '../types';
import { Mail, ArrowRight, ArrowLeft, Check, RefreshCw, Shield, ExternalLink } from 'lucide-react';
import { PAGE_TRANSLATIONS } from '../companyData';
import { resendVerificationEmail, checkEmailVerified } from '../firebase/authService';

interface VerificationPageProps {
    language: Language;
    onNavigate: (page: string) => void;
    email?: string;
    phone?: string;
    registrationRequestId?: string;
    onVerificationComplete?: (nextStep: string) => void;
}

const VerificationPage: React.FC<VerificationPageProps> = ({
    language,
    onNavigate,
    email = '',
    phone,
    registrationRequestId,
    onVerificationComplete
}) => {
    const isRtl = language === 'ar';
    const Arrow = isRtl ? ArrowLeft : ArrowRight;

    const [isVerified, setIsVerified] = useState(false);
    const [isChecking, setIsChecking] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    const t = (key: string, fallback?: string) => PAGE_TRANSLATIONS[key]?.[language] || fallback || key;

    // Resend cooldown timer
    useEffect(() => {
        if (resendCooldown > 0) {
            const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [resendCooldown]);

    // Auto-polling: check verification status every 5 seconds
    useEffect(() => {
        if (isVerified) return;

        const pollInterval = setInterval(async () => {
            try {
                const verified = await checkEmailVerified();
                if (verified) {
                    setIsVerified(true);
                    clearInterval(pollInterval);
                    // Auto-redirect after 2 seconds
                    setTimeout(() => {
                        if (onVerificationComplete) {
                            onVerificationComplete('dashboard');
                        } else {
                            onNavigate('dashboard');
                        }
                    }, 2000);
                }
            } catch {
                // Silently fail — will retry on next poll
            }
        }, 5000);

        return () => clearInterval(pollInterval);
    }, [isVerified, onVerificationComplete, onNavigate]);

    // Manual check verification status
    const handleCheckStatus = useCallback(async () => {
        setIsChecking(true);
        setError('');
        setSuccessMessage('');

        try {
            const verified = await checkEmailVerified();
            if (verified) {
                setIsVerified(true);
                setTimeout(() => {
                    if (onVerificationComplete) {
                        onVerificationComplete('dashboard');
                    } else {
                        onNavigate('dashboard');
                    }
                }, 2000);
            } else {
                setError(
                    language === 'ar'
                        ? 'لم يتم التحقق بعد. يرجى الضغط على الرابط المرسل إلى بريدك الإلكتروني.'
                        : 'Not verified yet. Please click the link sent to your email.'
                );
            }
        } catch {
            setError(
                language === 'ar'
                    ? 'حدث خطأ أثناء التحقق. يرجى المحاولة مرة أخرى.'
                    : 'Error checking status. Please try again.'
            );
        } finally {
            setIsChecking(false);
        }
    }, [language, onVerificationComplete, onNavigate]);

    // Resend verification email
    const handleResend = useCallback(async () => {
        if (resendCooldown > 0) return;

        setIsResending(true);
        setError('');
        setSuccessMessage('');

        try {
            const result = await resendVerificationEmail();
            if (result.success) {
                setSuccessMessage(
                    language === 'ar'
                        ? 'تم إعادة إرسال رابط التحقق بنجاح ✅'
                        : 'Verification link resent successfully ✅'
                );
                setResendCooldown(60);
            } else {
                setError(result.error || (t('حدث خطأ', 'An error occurred')));
            }
        } catch {
            setError(
                language === 'ar'
                    ? 'تعذر إرسال الرابط. يرجى المحاولة لاحقاً.'
                    : 'Failed to send link. Please try later.'
            );
        } finally {
            setIsResending(false);
        }
    }, [language, resendCooldown]);

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#070914] via-[#0E132B] to-[#0A1020] flex items-center justify-center p-6" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-lime-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl shadow-green-500/20">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">{t('verification_title')}</h1>
                </div>

                {/* Verification Card */}
                <div className="bg-white rounded-3xl p-8 shadow-2xl">
                    {isVerified ? (
                        /* ✅ Verified State */
                        <div className="text-center">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-10 h-10 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                {t('تم التحقق بنجاح!', 'Email Verified!')}
                            </h2>
                            <p className="text-slate-500 mb-8">
                                {language === 'ar'
                                    ? 'تم تفعيل حسابك في أربا بنجاح. جاري التحويل...'
                                    : 'Your Arba account has been activated. Redirecting...'}
                            </p>
                            <div className="flex items-center justify-center gap-2 text-slate-400">
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                <span>{t('جاري التحويل...', 'Redirecting...')}</span>
                            </div>
                        </div>
                    ) : (
                        /* 📧 Check Your Email State */
                        <>
                            {/* Email Icon */}
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center">
                                    <Mail className="w-10 h-10 text-blue-500" />
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-xl font-bold text-slate-800 text-center mb-2">
                                {t('تفقّد بريدك الإلكتروني', 'Check Your Email')}
                            </h2>

                            {/* Message */}
                            <p className="text-slate-500 text-center mb-2">
                                {language === 'ar'
                                    ? 'أرسلنا رابط تحقق إلى بريدك الإلكتروني. اضغط عليه لتفعيل حسابك في أربا.'
                                    : 'We sent a verification link to your email. Click it to activate your Arba account.'}
                            </p>

                            {/* Email Address */}
                            {email && (
                                <div className="text-center mb-6">
                                    <span className="inline-block px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium text-slate-700" dir="ltr">
                                        {email}
                                    </span>
                                </div>
                            )}

                            {/* Auto-polling indicator */}
                            <div className="flex items-center justify-center gap-2 mb-6 px-4 py-3 bg-green-50 rounded-xl">
                                <RefreshCw className="w-4 h-4 text-green-600 animate-spin" />
                                <span className="text-sm text-green-700">
                                    {language === 'ar'
                                        ? 'نتحقق تلقائياً... اضغط على الرابط في بريدك'
                                        : 'Auto-checking... Click the link in your email'}
                                </span>
                            </div>

                            {/* Success Message */}
                            {successMessage && (
                                <p className="text-green-600 text-center text-sm mb-4 px-4 py-2 bg-green-50 rounded-lg">
                                    {successMessage}
                                </p>
                            )}

                            {/* Error Message */}
                            {error && (
                                <p className="text-red-500 text-center text-sm mb-4 px-4 py-2 bg-red-50 rounded-lg">
                                    {error}
                                </p>
                            )}

                            {/* Check Status Button */}
                            <button
                                onClick={handleCheckStatus}
                                disabled={isChecking}
                                className="w-full py-3 bg-gradient-to-r from-green-500 to-lime-500 text-white rounded-xl font-bold hover:from-green-400 hover:to-lime-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-3 shadow-lg shadow-green-500/20"
                            >
                                {isChecking ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        {t('جاري التحقق...', 'Checking...')}
                                    </>
                                ) : (
                                    <>
                                        <Check className="w-5 h-5" />
                                        {t('تحقق من حالة التفعيل', 'Check Verification Status')}
                                    </>
                                )}
                            </button>

                            {/* Resend Button */}
                            <button
                                onClick={handleResend}
                                disabled={isResending || resendCooldown > 0}
                                className="w-full py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:border-green-500 hover:text-green-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isResending ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        {t('جاري الإرسال...', 'Sending...')}
                                    </>
                                ) : resendCooldown > 0 ? (
                                    <span className="text-slate-400">
                                        {language === 'ar' ? `إعادة الإرسال بعد ${resendCooldown} ثانية` : `Resend in ${resendCooldown}s`}
                                    </span>
                                ) : (
                                    <>
                                        <Mail className="w-4 h-4" />
                                        {t('إعادة إرسال رابط التحقق', 'Resend Verification Link')}
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>

                {/* Fallback: Go to Login */}
                {!isVerified && (
                    <button
                        onClick={() => onNavigate('login')}
                        className="w-full mt-6 text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                        <ExternalLink className="w-4 h-4" />
                        {t('الانتقال لصفحة تسجيل الدخول', 'Go to Login Page')}
                    </button>
                )}
            </div>
        </div>
    );
};

export default VerificationPage;
