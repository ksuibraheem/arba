import React, { useState } from 'react';
import { Mail, ArrowLeft, ArrowRight, KeyRound, Check, RefreshCw } from 'lucide-react';
import { PAGE_TRANSLATIONS } from '../companyData';
import { resetPasswordWithFirebase } from '../firebase/authService';

interface PasswordResetPageProps {
    language: 'ar' | 'en';
    onNavigate: (page: string) => void;
}

const PasswordResetPage: React.FC<PasswordResetPageProps> = ({ language, onNavigate }) => {
    const isRtl = language === 'ar';
    const Arrow = isRtl ? ArrowLeft : ArrowRight;

    const [step, setStep] = useState<'email' | 'sent'>('email');
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // Send password reset link via email
    const handleSendResetLink = async () => {
        if (!email) {
            setError(language === 'ar' ? 'يرجى إدخال البريد الإلكتروني' : 'Please enter your email');
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError(language === 'ar' ? 'يرجى إدخال بريد إلكتروني صحيح' : 'Please enter a valid email');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            const result = await resetPasswordWithFirebase(email);
            if (result.success) {
                setStep('sent');
            } else {
                setError(result.error || (language === 'ar' ? 'حدث خطأ' : 'An error occurred'));
            }
        } catch (err) {
            setError(language === 'ar' ? 'حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.' : 'An unexpected error occurred. Please try later.');
        } finally {
            setIsLoading(false);
        }
    };

    // Resend the reset link
    const handleResend = async () => {
        setIsLoading(true);
        setError('');
        try {
            const result = await resetPasswordWithFirebase(email);
            if (!result.success) {
                setError(result.error || '');
            }
        } catch {
            // Silently fail
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-6" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <KeyRound className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">
                        {language === 'ar' ? 'استعادة كلمة المرور' : 'Reset Password'}
                    </h1>
                </div>

                {/* Card */}
                <div className="bg-white rounded-3xl p-8 shadow-2xl">
                    {step === 'sent' ? (
                        /* ✅ Link Sent State */
                        <div className="text-center">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                {language === 'ar' ? 'تم الإرسال!' : 'Link Sent!'}
                            </h2>
                            <p className="text-slate-500 mb-4">
                                {language === 'ar'
                                    ? 'تم إرسال رابط استعادة كلمة المرور إلى بريدك الإلكتروني. افتح الرابط لإعادة تعيين كلمة المرور.'
                                    : 'A password reset link has been sent to your email. Open the link to reset your password.'}
                            </p>
                            <div className="mb-6">
                                <span className="inline-block px-4 py-2 bg-slate-100 rounded-xl text-sm font-medium text-slate-700" dir="ltr">
                                    {email}
                                </span>
                            </div>

                            {/* Resend Button */}
                            <button
                                onClick={handleResend}
                                disabled={isLoading}
                                className="w-full py-3 border-2 border-slate-200 text-slate-700 rounded-xl font-medium hover:border-emerald-500 hover:text-emerald-600 transition-all disabled:opacity-50 flex items-center justify-center gap-2 mb-3"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                        {language === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
                                    </>
                                ) : (
                                    <>
                                        <Mail className="w-4 h-4" />
                                        {language === 'ar' ? 'إعادة إرسال الرابط' : 'Resend Link'}
                                    </>
                                )}
                            </button>

                            {/* Go to Login */}
                            <button
                                onClick={() => onNavigate('login')}
                                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-400 hover:to-teal-400 transition-all flex items-center justify-center gap-2"
                            >
                                {language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                                <Arrow className="w-5 h-5" />
                            </button>
                        </div>
                    ) : (
                        /* 📧 Email Input Step */
                        <>
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                                    <Mail className="w-8 h-8 text-blue-500" />
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-slate-800 text-center mb-2">
                                {language === 'ar' ? 'أدخل بريدك الإلكتروني' : 'Enter Your Email'}
                            </h2>
                            <p className="text-slate-500 text-center mb-6">
                                {language === 'ar'
                                    ? 'سنرسل رابط استعادة كلمة المرور إلى بريدك الإلكتروني'
                                    : 'We will send a password reset link to your email'}
                            </p>

                            <div className="mb-6">
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => { setEmail(e.target.value); setError(''); }}
                                    placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email address'}
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-lg focus:border-emerald-500 focus:outline-none transition-all"
                                    dir="ltr"
                                />
                            </div>

                            {error && (
                                <p className="text-red-500 text-center text-sm mb-4 px-4 py-2 bg-red-50 rounded-lg">{error}</p>
                            )}

                            <button
                                onClick={handleSendResetLink}
                                disabled={isLoading}
                                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-400 hover:to-teal-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        {language === 'ar' ? 'جاري الإرسال...' : 'Sending...'}
                                    </>
                                ) : (
                                    <>
                                        {language === 'ar' ? 'إرسال رابط الاستعادة' : 'Send Reset Link'}
                                        <Arrow className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>

                {/* Back to Login */}
                {step === 'email' && (
                    <button
                        onClick={() => onNavigate('login')}
                        className="w-full mt-6 text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                    >
                        <Arrow className="w-4 h-4 rotate-180" />
                        {language === 'ar' ? 'العودة لتسجيل الدخول' : 'Back to Login'}
                    </button>
                )}
            </div>
        </div>
    );
};

export default PasswordResetPage;
