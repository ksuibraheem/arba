import React, { useState, useRef } from 'react';
import { Phone, Lock, ArrowLeft, ArrowRight, KeyRound, Check, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { PAGE_TRANSLATIONS } from '../companyData';
import { registrationService } from '../services/registrationService';

interface PasswordResetPageProps {
    language: 'ar' | 'en';
    onNavigate: (page: string) => void;
}

type ResetStep = 'phone' | 'code' | 'newPassword' | 'complete';

const PasswordResetPage: React.FC<PasswordResetPageProps> = ({ language, onNavigate }) => {
    const isRtl = language === 'ar';
    const Arrow = isRtl ? ArrowLeft : ArrowRight;

    const [step, setStep] = useState<ResetStep>('phone');
    const [phone, setPhone] = useState('');
    const [code, setCode] = useState(['', '', '', '']);
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [resendTimer, setResendTimer] = useState(0);
    const [generatedCode, setGeneratedCode] = useState(''); // For testing display

    const codeInputRefs = useRef<(HTMLInputElement | null)[]>([]);

    const t = (key: string) => PAGE_TRANSLATIONS[key]?.[language] || key;

    // Handle code input
    const handleCodeChange = (index: number, value: string) => {
        if (value.length > 1) value = value[0];
        if (!/^\d*$/.test(value)) return;

        const newCode = [...code];
        newCode[index] = value;
        setCode(newCode);
        setError('');

        if (value && index < 3) {
            codeInputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
        if (e.key === 'Backspace' && !code[index] && index > 0) {
            codeInputRefs.current[index - 1]?.focus();
        }
    };

    // Send verification code
    const handleSendCode = async () => {
        if (!phone) {
            setError(language === 'ar' ? 'يرجى إدخال رقم الجوال' : 'Please enter your phone number');
            return;
        }

        // Validate international phone format
        const phoneRegex = /^\+\d{10,15}$/;
        const cleanPhone = phone.replace(/\s/g, '');

        if (!phoneRegex.test(cleanPhone)) {
            setError(language === 'ar'
                ? 'يرجى إدخال رقم جوال صحيح بصيغة دولية (مثال: +966501234567)'
                : 'Please enter a valid international phone number (e.g., +966501234567)');
            return;
        }

        setIsLoading(true);
        setError('');

        // Simulate sending code
        await new Promise(resolve => setTimeout(resolve, 1500));

        // Generate a 4-digit code
        const newCode = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedCode(newCode);

        console.log(`📱 [SMS] Password Reset Code to: ${cleanPhone} | Code: ${newCode}`);

        setStep('code');
        setResendTimer(60);
        setIsLoading(false);

        // Start countdown
        const timer = setInterval(() => {
            setResendTimer(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    // Verify the code
    const handleVerifyCode = async () => {
        const fullCode = code.join('');

        if (fullCode.length !== 4) {
            setError(language === 'ar' ? 'يرجى إدخال الرمز المكون من 4 أرقام' : 'Please enter the 4-digit code');
            return;
        }

        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 1000));

        // For testing: accept any code or the generated one
        if (fullCode === generatedCode || generatedCode === '') {
            setStep('newPassword');
        } else {
            setError(language === 'ar' ? 'الرمز غير صحيح' : 'Invalid code');
        }

        setIsLoading(false);
    };

    // Reset password
    const handleResetPassword = async () => {
        if (newPassword.length < 6) {
            setError(language === 'ar' ? 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' : 'Password must be at least 6 characters');
            return;
        }

        if (newPassword !== confirmPassword) {
            setError(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
            return;
        }

        setIsLoading(true);

        // تحديث كلمة المرور فعلياً في خدمة التسجيل
        const result = registrationService.updatePasswordByPhone(phone, newPassword);

        if (!result.success) {
            setError(result.error || (language === 'ar' ? 'حدث خطأ أثناء تحديث كلمة المرور' : 'Error updating password'));
            setIsLoading(false);
            return;
        }

        // Password updated successfully
        setStep('complete');
        setIsLoading(false);

        // Redirect to login after 3 seconds
        setTimeout(() => {
            onNavigate('login');
        }, 3000);
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
                    {step === 'complete' ? (
                        /* Success State */
                        <div className="text-center">
                            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Check className="w-10 h-10 text-emerald-500" />
                            </div>
                            <h2 className="text-2xl font-bold text-slate-800 mb-2">
                                {language === 'ar' ? 'تم تغيير كلمة المرور' : 'Password Changed'}
                            </h2>
                            <p className="text-slate-500 mb-8">
                                {language === 'ar' ? 'يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة' : 'You can now login with your new password'}
                            </p>
                            <div className="flex items-center justify-center gap-2 text-slate-400">
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                <span>{language === 'ar' ? 'جاري التحويل...' : 'Redirecting...'}</span>
                            </div>
                        </div>
                    ) : step === 'phone' ? (
                        /* Phone Input Step */
                        <>
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center">
                                    <Phone className="w-8 h-8 text-blue-500" />
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-slate-800 text-center mb-2">
                                {language === 'ar' ? 'أدخل رقم الجوال' : 'Enter Your Phone'}
                            </h2>
                            <p className="text-slate-500 text-center mb-6">
                                {language === 'ar'
                                    ? 'سيتم إرسال رمز التحقق إلى رقم جوالك'
                                    : 'We will send a verification code to your phone'}
                            </p>

                            <div className="mb-6">
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+966501234567"
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-lg text-center focus:border-emerald-500 focus:outline-none transition-all"
                                    dir="ltr"
                                />
                                <p className="text-xs text-slate-400 text-center mt-2">
                                    {language === 'ar' ? 'أدخل الرقم بصيغة دولية' : 'Enter in international format'}
                                </p>
                            </div>

                            {error && (
                                <p className="text-red-500 text-center text-sm mb-4">{error}</p>
                            )}

                            <button
                                onClick={handleSendCode}
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
                                        {language === 'ar' ? 'إرسال رمز التحقق' : 'Send Verification Code'}
                                        <Arrow className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </>
                    ) : step === 'code' ? (
                        /* Code Verification Step */
                        <>
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
                                    <KeyRound className="w-8 h-8 text-green-500" />
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-slate-800 text-center mb-2">
                                {language === 'ar' ? 'أدخل رمز التحقق' : 'Enter Verification Code'}
                            </h2>
                            <p className="text-slate-500 text-center mb-6">
                                {language === 'ar' ? 'أدخل الرمز المرسل إلى' : 'Enter the code sent to'}
                                <br />
                                <span className="font-medium text-slate-700" dir="ltr">{phone}</span>
                            </p>

                            {/* Test Code Display */}
                            {generatedCode && (
                                <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-4 text-center">
                                    <p className="text-xs text-emerald-600 mb-1">
                                        {language === 'ar' ? '🧪 للتجربة - الرمز هو:' : '🧪 For testing - Code is:'}
                                    </p>
                                    <p className="text-2xl font-bold text-emerald-700 tracking-widest" dir="ltr">
                                        {generatedCode}
                                    </p>
                                </div>
                            )}

                            {/* Code Inputs */}
                            <div className="flex gap-4 justify-center mb-6" dir="ltr">
                                {code.map((digit, index) => (
                                    <input
                                        key={index}
                                        ref={el => codeInputRefs.current[index] = el}
                                        type="text"
                                        inputMode="numeric"
                                        maxLength={1}
                                        value={digit}
                                        onChange={(e) => handleCodeChange(index, e.target.value)}
                                        onKeyDown={(e) => handleKeyDown(index, e)}
                                        className={`w-14 h-16 text-center text-3xl font-bold rounded-xl border-2 transition-all outline-none ${digit
                                            ? 'border-emerald-500 bg-emerald-50 text-emerald-700'
                                            : 'border-slate-200 bg-white text-slate-800 focus:border-emerald-500'
                                            }`}
                                    />
                                ))}
                            </div>

                            {error && (
                                <p className="text-red-500 text-center text-sm mb-4">{error}</p>
                            )}

                            {/* Resend Timer */}
                            <div className="text-center mb-4">
                                {resendTimer > 0 ? (
                                    <p className="text-slate-400 text-sm">
                                        {language === 'ar' ? 'إعادة الإرسال بعد' : 'Resend in'} {resendTimer} {language === 'ar' ? 'ثانية' : 's'}
                                    </p>
                                ) : (
                                    <button
                                        onClick={handleSendCode}
                                        className="text-emerald-600 hover:underline text-sm font-medium"
                                    >
                                        {language === 'ar' ? 'إعادة إرسال الرمز' : 'Resend Code'}
                                    </button>
                                )}
                            </div>

                            <button
                                onClick={handleVerifyCode}
                                disabled={isLoading}
                                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-400 hover:to-teal-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        {language === 'ar' ? 'جاري التحقق...' : 'Verifying...'}
                                    </>
                                ) : (
                                    <>
                                        {language === 'ar' ? 'تحقق' : 'Verify'}
                                        <Arrow className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </>
                    ) : (
                        /* New Password Step */
                        <>
                            <div className="flex justify-center mb-6">
                                <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center">
                                    <Lock className="w-8 h-8 text-purple-500" />
                                </div>
                            </div>

                            <h2 className="text-xl font-bold text-slate-800 text-center mb-2">
                                {language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                            </h2>
                            <p className="text-slate-500 text-center mb-6">
                                {language === 'ar' ? 'أدخل كلمة المرور الجديدة' : 'Enter your new password'}
                            </p>

                            <div className="space-y-4 mb-6">
                                {/* New Password */}
                                <div className="relative">
                                    <Lock className="absolute top-1/2 -translate-y-1/2 start-4 w-5 h-5 text-slate-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder={language === 'ar' ? 'كلمة المرور الجديدة' : 'New Password'}
                                        className="w-full px-12 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
                                        minLength={6}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute top-1/2 -translate-y-1/2 end-4 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>

                                {/* Confirm Password */}
                                <div className="relative">
                                    <Lock className="absolute top-1/2 -translate-y-1/2 start-4 w-5 h-5 text-slate-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder={language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                                        className="w-full px-12 py-3 border-2 border-slate-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-all"
                                    />
                                </div>
                            </div>

                            {error && (
                                <p className="text-red-500 text-center text-sm mb-4">{error}</p>
                            )}

                            <button
                                onClick={handleResetPassword}
                                disabled={isLoading}
                                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold hover:from-emerald-400 hover:to-teal-400 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                        {language === 'ar' ? 'جاري الحفظ...' : 'Saving...'}
                                    </>
                                ) : (
                                    <>
                                        {language === 'ar' ? 'حفظ كلمة المرور' : 'Save Password'}
                                        <Check className="w-5 h-5" />
                                    </>
                                )}
                            </button>
                        </>
                    )}
                </div>

                {/* Back to Login */}
                {step !== 'complete' && (
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
