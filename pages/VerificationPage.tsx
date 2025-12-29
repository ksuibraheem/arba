import React, { useState, useEffect, useRef } from 'react';
import { Mail, Phone, ArrowRight, ArrowLeft, Check, RefreshCw, Shield, Clock } from 'lucide-react';
import { PAGE_TRANSLATIONS } from '../companyData';
import { registrationService } from '../services/registrationService';

interface VerificationPageProps {
    language: 'ar' | 'en';
    onNavigate: (page: string) => void;
    email?: string;
    phone?: string;
    registrationRequestId?: string;
    onVerificationComplete?: (nextStep: string) => void;
}

const VerificationPage: React.FC<VerificationPageProps> = ({
    language,
    onNavigate,
    email = 'user@example.com',
    phone = '+966501234567',
    registrationRequestId,
    onVerificationComplete
}) => {
    const isRtl = language === 'ar';
    const Arrow = isRtl ? ArrowLeft : ArrowRight;

    const [step, setStep] = useState<'email' | 'phone' | 'complete'>('email');
    // Changed to 4-digit codes
    const [emailCode, setEmailCode] = useState(['', '', '', '']);
    const [phoneCode, setPhoneCode] = useState(['', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(60);
    const [canResend, setCanResend] = useState(false);
    const [codeExpiryTimer, setCodeExpiryTimer] = useState(300); // 5 minutes in seconds

    const emailInputRefs = useRef<(HTMLInputElement | null)[]>([]);
    const phoneInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const t = (key: string) => PAGE_TRANSLATIONS[key]?.[language] || key;

    // Resend timer
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    // Code expiry timer (5 minutes)
    useEffect(() => {
        if (codeExpiryTimer > 0) {
            const timer = setTimeout(() => setCodeExpiryTimer(codeExpiryTimer - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [codeExpiryTimer]);

    const formatExpiryTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleCodeChange = (
        index: number,
        value: string,
        codeArray: string[],
        setCodeArray: React.Dispatch<React.SetStateAction<string[]>>,
        refs: React.MutableRefObject<(HTMLInputElement | null)[]>
    ) => {
        if (value.length > 1) value = value[0];
        if (!/^\d*$/.test(value)) return;

        const newCode = [...codeArray];
        newCode[index] = value;
        setCodeArray(newCode);
        setError('');

        // Auto-focus next input (now max index is 3 for 4-digit)
        if (value && index < 3) {
            refs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (
        index: number,
        e: React.KeyboardEvent,
        codeArray: string[],
        setCodeArray: React.Dispatch<React.SetStateAction<string[]>>,
        refs: React.MutableRefObject<(HTMLInputElement | null)[]>
    ) => {
        if (e.key === 'Backspace' && !codeArray[index] && index > 0) {
            refs.current[index - 1]?.focus();
        }
    };

    const handleVerify = async (type: 'email' | 'phone') => {
        const code = type === 'email' ? emailCode : phoneCode;
        const fullCode = code.join('');

        // Check for 4-digit code
        if (fullCode.length !== 4) {
            setError(language === 'ar' ? 'يرجى إدخال الرمز المكون من 4 أرقام' : 'Please enter the 4-digit code');
            return;
        }

        // Check if code expired
        if (codeExpiryTimer === 0) {
            setError(language === 'ar' ? 'انتهت صلاحية الرمز. يرجى طلب رمز جديد.' : 'Code expired. Please request a new one.');
            return;
        }

        setIsLoading(true);
        setError('');

        // Use registration service if we have a request ID
        if (registrationRequestId) {
            if (type === 'email') {
                const result = registrationService.verifyEmailCode(registrationRequestId, fullCode);
                if (result.success) {
                    setStep('phone');
                    setResendTimer(60);
                    setCanResend(false);
                    setCodeExpiryTimer(300); // Reset timer for phone code
                } else {
                    setError(result.error || (language === 'ar' ? 'الرمز غير صحيح' : 'Invalid code'));
                }
            } else {
                const result = registrationService.verifyPhoneCode(registrationRequestId, fullCode);
                if (result.success) {
                    setStep('complete');
                    if (onVerificationComplete && result.nextStep) {
                        setTimeout(() => {
                            onVerificationComplete(result.nextStep!);
                        }, 2000);
                    }
                } else {
                    setError(result.error || (language === 'ar' ? 'الرمز غير صحيح' : 'Invalid code'));
                }
            }
        } else {
            // Demo mode - accept any 4-digit code
            await new Promise(resolve => setTimeout(resolve, 1500));
            if (type === 'email') {
                setStep('phone');
                setResendTimer(60);
                setCanResend(false);
                setCodeExpiryTimer(300);
            } else {
                setStep('complete');
                if (onVerificationComplete) {
                    setTimeout(() => {
                        onVerificationComplete('dashboard');
                    }, 2000);
                }
            }
        }

        setIsLoading(false);
    };

    const handleResend = async () => {
        if (!canResend) return;

        setIsLoading(true);

        if (registrationRequestId) {
            if (step === 'email') {
                registrationService.resendEmailCode(registrationRequestId);
            } else {
                registrationService.resendPhoneCode(registrationRequestId);
            }
        }

        await new Promise(resolve => setTimeout(resolve, 1000));
        setResendTimer(60);
        setCanResend(false);
        setCodeExpiryTimer(300); // Reset expiry timer
        setIsLoading(false);
    };

    const renderCodeInputs = (
        codeArray: string[],
        setCodeArray: React.Dispatch<React.SetStateAction<string[]>>,
        refs: React.MutableRefObject<(HTMLInputElement | null)[]>
    ) => (
        <div className="flex gap-4 justify-center" dir="ltr">
            {codeArray.map((digit, index) => (
                <input
                    key={index}
                    ref={el => refs.current[index] = el}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleCodeChange(index, e.target.value, codeArray, setCodeArray, refs)}
                    onKeyDown={(e) => handleKeyDown(index, e, codeArray, setCodeArray, refs)}
                    className={`w-14 h-16 text-center text-3xl font-bold rounded-xl border-2 transition-all outline-none ${digit
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                        : 'border-slate-200 bg-white text-slate-800 focus:border-emerald-500'
                        }`}
                />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-6" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="w-full max-w-md">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-xl">
                        <Shield className="w-8 h-8 text-white" />
                    </div>
                    <h1 className="text-2xl font-bold text-white">{t('verification_title')}</h1>
                </div>

                {/* Verification Card */}
                <div className="bg-white rounded-3xl p-8 shadow-2xl">
                    {step === 'complete' ? (
                        /* Complete State */
                        <div className="text-center">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">{t('verification_complete')}</h2>
                            <p className="text-slate-500 mb-8">{t('verification_complete_message')}</p>
                            <div className="flex items-center justify-center gap-2 text-slate-400">
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                <span>{language === 'ar' ? 'جاري التحويل...' : 'Redirecting...'}</span>
                            </div>
                        </div>
                    ) : (
                        /* Verification Steps */
                        <>
                            {/* Progress Indicator */}
                            <div className="flex items-center justify-center gap-2 mb-8">
                                <div className={`w-3 h-3 rounded-full ${step === 'email' ? 'bg-emerald-500' : 'bg-emerald-500'}`} />
                                <div className={`w-12 h-1 rounded ${step === 'phone' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                                <div className={`w-3 h-3 rounded-full ${step === 'phone' ? 'bg-emerald-500' : 'bg-slate-200'}`} />
                            </div>

                            {/* Step Icon */}
                            <div className="flex justify-center mb-6">
                                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${step === 'email' ? 'bg-blue-100' : 'bg-green-100'
                                    }`}>
                                    {step === 'email' ? (
                                        <Mail className="w-8 h-8 text-blue-500" />
                                    ) : (
                                        <Phone className="w-8 h-8 text-green-500" />
                                    )}
                                </div>
                            </div>

                            {/* Title */}
                            <h2 className="text-xl font-bold text-slate-800 text-center mb-2">
                                {step === 'email' ? t('verification_email_title') : t('verification_phone_title')}
                            </h2>
                            <p className="text-slate-500 text-center mb-4">
                                {language === 'ar' ? 'أدخل الرمز المكون من 4 أرقام المرسل إلى' : 'Enter the 4-digit code sent to'}
                                <br />
                                <span className="font-medium text-slate-700" dir="ltr">
                                    {step === 'email' ? email : phone}
                                </span>
                            </p>

                            {/* Code Expiry Warning */}
                            <div className={`text-center mb-4 px-4 py-2 rounded-lg ${codeExpiryTimer <= 60 ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'
                                }`}>
                                <div className="flex items-center justify-center gap-2">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm font-medium">
                                        {language === 'ar' ? 'صلاحية الرمز:' : 'Code expires in:'} {formatExpiryTime(codeExpiryTimer)}
                                    </span>
                                </div>
                            </div>

                            {/* Code Inputs - Now 4 digits */}
                            <div className="mb-6">
                                {step === 'email'
                                    ? renderCodeInputs(emailCode, setEmailCode, emailInputRefs)
                                    : renderCodeInputs(phoneCode, setPhoneCode, phoneInputRefs)
                                }
                            </div>

                            {/* Error */}
                            {error && (
                                <p className="text-red-500 text-center text-sm mb-4">{error}</p>
                            )}

                            {/* Resend Timer */}
                            <div className="text-center mb-6">
                                {canResend ? (
                                    <button
                                        onClick={handleResend}
                                        disabled={isLoading}
                                        className="text-emerald-600 font-medium flex items-center gap-2 mx-auto hover:underline disabled:opacity-50"
                                    >
                                        <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                        {t('verification_resend')}
                                    </button>
                                ) : (
                                    <p className="text-slate-400 flex items-center justify-center gap-2">
                                        <Clock className="w-4 h-4" />
                                        {t('verification_resend_in')} {resendTimer} {t('verification_seconds')}
                                    </p>
                                )}
                            </div>

                            {/* Verify Button */}
                            <button
                                onClick={() => handleVerify(step)}
                                disabled={isLoading || codeExpiryTimer === 0}
                                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-400 hover:to-teal-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        {t('verification_verifying')}
                                    </>
                                ) : (
                                    <>
                                        {t('verification_verify')}
                                        <Arrow className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>

                {/* Back to Home */}
                <button
                    onClick={() => onNavigate('landing')}
                    className="w-full mt-6 text-slate-400 hover:text-white transition-colors flex items-center justify-center gap-2"
                >
                    <Arrow className="w-4 h-4 rotate-180" />
                    {t('verification_back_to_home')}
                </button>
            </div>
        </div>
    );
};

export default VerificationPage;
