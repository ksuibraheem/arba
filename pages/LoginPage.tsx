import React, { useState } from 'react';
import {
    Calculator,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowLeft,
    ArrowRight,
    User,
    Building2,
    Truck,
    Shield,
    Phone,
    Briefcase
} from 'lucide-react';
import { COMPANY_INFO, PAGE_TRANSLATIONS } from '../companyData';

interface LoginPageProps {
    language: 'ar' | 'en';
    onNavigate: (page: string) => void;
    onLogin: (email: string, password: string, userType?: string) => void;
    loginError?: string;
}

type UserType = 'individual' | 'company' | 'supplier' | 'employee';

const LoginPage: React.FC<LoginPageProps> = ({ language, onNavigate, onLogin, loginError }) => {
    const [userType, setUserType] = useState<UserType>('individual');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const t = (key: string) => PAGE_TRANSLATIONS[key]?.[language] || key;
    const isRtl = language === 'ar';
    const Arrow = isRtl ? ArrowRight : ArrowLeft;

    const userTypes: { id: UserType; label: { ar: string; en: string }; icon: React.ElementType; color: string }[] = [
        { id: 'individual', label: { ar: 'أفراد', en: 'Individual' }, icon: User, color: 'from-blue-500 to-blue-600' },
        { id: 'company', label: { ar: 'شركات', en: 'Company' }, icon: Building2, color: 'from-emerald-500 to-teal-500' },
        { id: 'supplier', label: { ar: 'موردين', en: 'Supplier' }, icon: Truck, color: 'from-amber-500 to-orange-500' },
        { id: 'employee', label: { ar: 'موظفين آربا', en: 'ARBA Staff' }, icon: Shield, color: 'from-purple-500 to-indigo-500' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Validate based on user type
        let isValid = true;
        if (userType === 'employee') {
            if (!employeeId || !password) {
                setError(language === 'ar' ? 'يرجى إدخال رقم الموظف وكلمة المرور' : 'Please enter employee ID and password');
                isValid = false;
            }
        } else if (userType === 'supplier') {
            if (!phone || !password) {
                setError(language === 'ar' ? 'يرجى إدخال رقم الجوال وكلمة المرور' : 'Please enter phone and password');
                isValid = false;
            }
        } else {
            if (!email || !password) {
                setError(language === 'ar' ? 'يرجى إدخال البريد وكلمة المرور' : 'Please enter email and password');
                isValid = false;
            }
        }

        if (!isValid) {
            setLoading(false);
            return;
        }

        // Simulate login
        setTimeout(() => {
            const loginIdentifier = userType === 'employee' ? employeeId : (userType === 'supplier' ? phone : email);
            onLogin(loginIdentifier, password, userType);
            setLoading(false);
        }, 1000);
    };

    const getTypeConfig = () => {
        switch (userType) {
            case 'employee':
                return {
                    title: { ar: 'دخول الموظفين', en: 'Staff Login' },
                    subtitle: { ar: 'مخصص لموظفي آربا فقط', en: 'For ARBA employees only' },
                    idLabel: { ar: 'رقم الموظف', en: 'Employee ID' },
                    idPlaceholder: { ar: 'أدخل رقم الموظف', en: 'Enter employee ID' },
                    idIcon: Briefcase
                };
            case 'supplier':
                return {
                    title: { ar: 'دخول الموردين', en: 'Supplier Login' },
                    subtitle: { ar: 'لموردي مواد البناء', en: 'For construction material suppliers' },
                    idLabel: { ar: 'رقم الجوال', en: 'Phone Number' },
                    idPlaceholder: { ar: 'أدخل رقم الجوال', en: 'Enter phone number' },
                    idIcon: Phone
                };
            case 'company':
                return {
                    title: { ar: 'دخول الشركات', en: 'Company Login' },
                    subtitle: { ar: 'للمقاولين وشركات البناء', en: 'For contractors & construction companies' },
                    idLabel: { ar: 'البريد الإلكتروني', en: 'Email' },
                    idPlaceholder: { ar: 'أدخل بريد الشركة', en: 'Enter company email' },
                    idIcon: Mail
                };
            default:
                return {
                    title: { ar: 'تسجيل الدخول', en: 'Login' },
                    subtitle: { ar: 'للأفراد والمستخدمين', en: 'For individuals & users' },
                    idLabel: { ar: 'البريد الإلكتروني', en: 'Email' },
                    idPlaceholder: { ar: 'أدخل بريدك الإلكتروني', en: 'Enter your email' },
                    idIcon: Mail
                };
        }
    };

    const config = getTypeConfig();
    const selectedType = userTypes.find(u => u.id === userType)!;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-teal-500/10 to-transparent rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-lg">
                {/* Back Button */}
                <button
                    onClick={() => onNavigate('landing')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
                >
                    <Arrow className="w-5 h-5" />
                    <span>{language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</span>
                </button>

                {/* Login Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl">
                    {/* User Type Tabs */}
                    <div className="grid grid-cols-4 gap-2 mb-8">
                        {userTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => {
                                    setUserType(type.id);
                                    setError('');
                                }}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${userType === type.id
                                    ? `bg-gradient-to-br ${type.color} text-white shadow-lg`
                                    : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white'
                                    }`}
                            >
                                <type.icon className="w-5 h-5" />
                                <span className="text-[10px] font-medium">{type.label[language]}</span>
                            </button>
                        ))}
                    </div>

                    {/* Dynamic Header */}
                    <div className="text-center mb-6">
                        <div className={`w-14 h-14 bg-gradient-to-br ${selectedType.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                            <selectedType.icon className="w-7 h-7 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-1">{config.title[language]}</h1>
                        <p className="text-slate-400 text-sm">{config.subtitle[language]}</p>
                    </div>

                    {/* Error Message */}
                    {(error || loginError) && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm text-center">
                            {error || loginError}
                        </div>
                    )}

                    {/* Login Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Dynamic ID Field */}
                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">
                                {config.idLabel[language]}
                            </label>
                            <div className="relative">
                                <config.idIcon className="absolute top-1/2 -translate-y-1/2 start-4 w-5 h-5 text-slate-500" />
                                {userType === 'employee' ? (
                                    <input
                                        type="text"
                                        value={employeeId}
                                        onChange={(e) => setEmployeeId(e.target.value)}
                                        placeholder={config.idPlaceholder[language]}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 ps-12 pe-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500 transition-all"
                                        autoComplete="username"
                                        required
                                        id="login-id"
                                        name="id"
                                    />
                                ) : userType === 'supplier' ? (
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        placeholder={config.idPlaceholder[language]}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 ps-12 pe-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                                        autoComplete="tel"
                                        required
                                        id="login-phone"
                                        name="phone"
                                        dir="ltr"
                                    />
                                ) : (
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={config.idPlaceholder[language]}
                                        className={`w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 ps-12 pe-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all`}
                                        autoComplete="email"
                                        required
                                        id="login-email"
                                        name="email"
                                    />
                                )}
                            </div>
                        </div>

                        {/* Password Field */}
                        <div>
                            <label className="block text-slate-300 text-sm font-medium mb-2">
                                {t('login_password')}
                            </label>
                            <div className="relative">
                                <Lock className="absolute top-1/2 -translate-y-1/2 start-4 w-5 h-5 text-slate-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder={language === 'ar' ? 'أدخل كلمة المرور' : 'Enter your password'}
                                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 ps-12 pe-12 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                    autoComplete="current-password"
                                    required
                                    id="login-password"
                                    name="password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute top-1/2 -translate-y-1/2 end-4 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {/* Remember Me & Forgot Password */}
                        <div className="flex items-center justify-between text-sm">
                            <label className="flex items-center gap-2 text-slate-400 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={rememberMe}
                                    onChange={(e) => setRememberMe(e.target.checked)}
                                    className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                                />
                                <span>{t('login_remember')}</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => onNavigate('password-reset')}
                                className="text-emerald-400 hover:text-emerald-300 transition-colors"
                            >
                                {t('login_forgot')}
                            </button>
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className={`w-full py-3 bg-gradient-to-r ${selectedType.color} hover:opacity-90 text-white rounded-xl font-bold transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>{language === 'ar' ? 'جاري الدخول...' : 'Logging in...'}</span>
                                </span>
                            ) : (
                                t('login_submit')
                            )}
                        </button>
                    </form>

                    {/* Register Link - Only for individuals and companies */}
                    {(userType === 'individual' || userType === 'company') && (
                        <div className="mt-8 text-center text-slate-400">
                            <span>{t('login_no_account')} </span>
                            <button
                                onClick={() => onNavigate('register')}
                                className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                            >
                                {t('login_create_account')}
                            </button>
                        </div>
                    )}

                    {/* Supplier Registration Link */}
                    {userType === 'supplier' && (
                        <div className="mt-8 text-center text-slate-400">
                            <span>{language === 'ar' ? 'تريد أن تصبح مورداً؟' : 'Want to become a supplier?'} </span>
                            <button
                                onClick={() => onNavigate('register')}
                                className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                            >
                                {language === 'ar' ? 'سجل كمورد' : 'Register as Supplier'}
                            </button>
                        </div>
                    )}

                    {/* Employee Help */}
                    {userType === 'employee' && (
                        <div className="mt-8 text-center">
                            <p className="text-slate-500 text-sm">
                                {language === 'ar' ? 'للمساعدة تواصل مع قسم الموارد البشرية' : 'For help, contact HR department'}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-slate-500 text-sm mt-8">
                    © 2025 {COMPANY_INFO.companyName[language]} - {COMPANY_INFO.systemName[language]}. {language === 'ar' ? 'جميع الحقوق محفوظة' : 'All rights reserved'}
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
