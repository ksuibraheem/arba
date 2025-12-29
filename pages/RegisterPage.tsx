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
    Phone,
    Building,
    Check,
    Users,
    Truck,
    FileText
} from 'lucide-react';
import { COMPANY_INFO, SUBSCRIPTION_PLANS, PAGE_TRANSLATIONS } from '../companyData';

interface RegisterPageProps {
    language: 'ar' | 'en';
    onNavigate: (page: string) => void;
    onRegister: (userData: RegisterData) => void;
}

export type UserType = 'individual' | 'company' | 'supplier';

export interface RegisterData {
    userType: UserType;
    name: string;
    email: string;
    phone: string;
    company: string;
    commercialRegister?: string;
    businessType?: string;
    password: string;
    plan: string;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ language, onNavigate, onRegister }) => {
    const [userType, setUserType] = useState<UserType>('individual');
    const [formData, setFormData] = useState<RegisterData>({
        userType: 'individual',
        name: '',
        email: '',
        phone: '',
        company: '',
        commercialRegister: '',
        businessType: '',
        password: '',
        plan: 'free'
    });
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [agreeTerms, setAgreeTerms] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const userTypes = [
        { id: 'individual' as UserType, icon: User, label: { ar: 'أفراد', en: 'Individual' } },
        { id: 'company' as UserType, icon: Building, label: { ar: 'شركة', en: 'Company' } },
        { id: 'supplier' as UserType, icon: Truck, label: { ar: 'مورد', en: 'Supplier' } }
    ];

    const handleUserTypeChange = (type: UserType) => {
        setUserType(type);
        setFormData(prev => ({ ...prev, userType: type }));
    };

    const t = (key: string) => PAGE_TRANSLATIONS[key]?.[language] || key;
    const isRtl = language === 'ar';
    const Arrow = isRtl ? ArrowRight : ArrowLeft;

    const handleChange = (field: keyof RegisterData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Validation
        if (!formData.name || !formData.email || !formData.password) {
            setError(language === 'ar' ? 'يرجى ملء جميع الحقول المطلوبة' : 'Please fill all required fields');
            return;
        }

        if (formData.password !== confirmPassword) {
            setError(language === 'ar' ? 'كلمات المرور غير متطابقة' : 'Passwords do not match');
            return;
        }

        // Validate commercial register for companies and suppliers
        if ((userType === 'company' || userType === 'supplier') && formData.commercialRegister) {
            if (!formData.commercialRegister.startsWith('7')) {
                setError(language === 'ar' ? 'رقم السجل التجاري يجب أن يبدأ بالرقم 7' : 'Commercial register must start with 7');
                return;
            }
            if (!/^\d{10}$/.test(formData.commercialRegister)) {
                setError(language === 'ar' ? 'رقم السجل التجاري يجب أن يكون 10 أرقام' : 'Commercial register must be 10 digits');
                return;
            }
        }

        if (!agreeTerms) {
            setError(language === 'ar' ? 'يرجى الموافقة على الشروط والأحكام' : 'Please agree to the terms and conditions');
            return;
        }

        setLoading(true);

        // Simulate registration
        setTimeout(() => {
            onRegister(formData);
            setLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-6" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-br from-emerald-500/10 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-tr from-teal-500/10 to-transparent rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-2xl">
                {/* Back Button */}
                <button
                    onClick={() => onNavigate('landing')}
                    className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
                >
                    <Arrow className="w-5 h-5" />
                    <span>{language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</span>
                </button>

                {/* Register Card */}
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl">
                    {/* Logo */}
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-emerald-500/25">
                            <Calculator className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">{t('register_title')}</h1>
                        <p className="text-slate-400">{COMPANY_INFO.systemName[language]}</p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/50 text-red-400 px-4 py-3 rounded-xl mb-6 text-sm text-center">
                            {error}
                        </div>
                    )}

                    {/* Register Form */}
                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* User Type Selector */}
                        <div className="mb-6">
                            <label className="block text-slate-300 text-sm font-medium mb-3">
                                {language === 'ar' ? 'نوع الحساب' : 'Account Type'}
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {userTypes.map((type) => {
                                    const Icon = type.icon;
                                    return (
                                        <button
                                            key={type.id}
                                            type="button"
                                            onClick={() => handleUserTypeChange(type.id)}
                                            className={`relative p-4 rounded-xl border transition-all flex flex-col items-center gap-2 ${userType === type.id
                                                ? 'bg-emerald-500/20 border-emerald-500 text-white'
                                                : 'bg-slate-700/30 border-slate-600 text-slate-400 hover:border-slate-500'
                                                }`}
                                        >
                                            <Icon className="w-6 h-6" />
                                            <span className="font-medium text-sm">{type.label[language]}</span>
                                            {userType === type.id && (
                                                <Check className="absolute top-2 end-2 w-4 h-4 text-emerald-400" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-5">
                            {/* Name Field */}
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2">
                                    {userType === 'individual'
                                        ? (language === 'ar' ? 'الاسم الكامل' : 'Full Name')
                                        : userType === 'company'
                                            ? (language === 'ar' ? 'اسم المسؤول' : 'Contact Person')
                                            : (language === 'ar' ? 'اسم المسؤول' : 'Contact Person')
                                    } <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <User className="absolute top-1/2 -translate-y-1/2 start-4 w-5 h-5 text-slate-500" />
                                    <input
                                        type="text"
                                        value={formData.name}
                                        onChange={(e) => handleChange('name', e.target.value)}
                                        placeholder={language === 'ar' ? 'الاسم الكامل' : 'Full Name'}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 ps-12 pe-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                        autoComplete="name"
                                        required
                                        id="register-name"
                                        name="name"
                                    />
                                </div>
                            </div>

                            {/* Email Field */}
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2">
                                    {t('register_email')} <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <Mail className="absolute top-1/2 -translate-y-1/2 start-4 w-5 h-5 text-slate-500" />
                                    <input
                                        type="email"
                                        value={formData.email}
                                        onChange={(e) => handleChange('email', e.target.value)}
                                        placeholder={language === 'ar' ? 'البريد الإلكتروني' : 'Email Address'}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 ps-12 pe-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                        autoComplete="email"
                                        required
                                        id="register-email"
                                        name="email"
                                    />
                                </div>
                            </div>

                            {/* Phone Field */}
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2">
                                    {t('register_phone')}
                                </label>
                                <div className="relative">
                                    <Phone className="absolute top-1/2 -translate-y-1/2 start-4 w-5 h-5 text-slate-500" />
                                    <input
                                        type="tel"
                                        value={formData.phone}
                                        onChange={(e) => handleChange('phone', e.target.value)}
                                        placeholder={language === 'ar' ? 'رقم الجوال' : 'Phone Number'}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 ps-12 pe-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                        autoComplete="tel"
                                        id="register-phone"
                                        name="phone"
                                    />
                                </div>
                            </div>

                            {/* Company Field - Required for company and supplier */}
                            {(userType === 'company' || userType === 'supplier') && (
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2">
                                        {userType === 'company'
                                            ? (language === 'ar' ? 'اسم الشركة' : 'Company Name')
                                            : (language === 'ar' ? 'اسم المنشأة' : 'Business Name')
                                        } <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <Building className="absolute top-1/2 -translate-y-1/2 start-4 w-5 h-5 text-slate-500" />
                                        <input
                                            type="text"
                                            value={formData.company}
                                            onChange={(e) => handleChange('company', e.target.value)}
                                            placeholder={language === 'ar' ? 'اسم الشركة' : 'Company Name'}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 ps-12 pe-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                            autoComplete="organization"
                                            required
                                            id="register-company"
                                            name="company"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Commercial Register - For companies only */}
                            {userType === 'company' && (
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2">
                                        {language === 'ar' ? 'رقم السجل التجاري' : 'Commercial Register No.'} <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <FileText className="absolute top-1/2 -translate-y-1/2 start-4 w-5 h-5 text-slate-500" />
                                        <input
                                            type="text"
                                            value={formData.commercialRegister || ''}
                                            onChange={(e) => handleChange('commercialRegister', e.target.value)}
                                            placeholder={language === 'ar' ? 'رقم السجل التجاري' : 'Commercial Register Number'}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 ps-12 pe-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                            required
                                            id="register-commercial"
                                            name="commercialRegister"
                                        />
                                    </div>
                                </div>
                            )}

                            {/* Business Type - For suppliers only */}
                            {userType === 'supplier' && (
                                <div>
                                    <label className="block text-slate-300 text-sm font-medium mb-2">
                                        {language === 'ar' ? 'نوع النشاط' : 'Business Type'} <span className="text-red-400">*</span>
                                    </label>
                                    <div className="relative">
                                        <Truck className="absolute top-1/2 -translate-y-1/2 start-4 w-5 h-5 text-slate-500" />
                                        <select
                                            value={formData.businessType || ''}
                                            onChange={(e) => handleChange('businessType', e.target.value)}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 ps-12 pe-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all appearance-none"
                                            required
                                            id="register-business-type"
                                            name="businessType"
                                        >
                                            <option value="">{language === 'ar' ? 'اختر نوع النشاط' : 'Select Business Type'}</option>
                                            <option value="construction">{language === 'ar' ? 'مواد بناء' : 'Construction Materials'}</option>
                                            <option value="electrical">{language === 'ar' ? 'كهرباء' : 'Electrical'}</option>
                                            <option value="plumbing">{language === 'ar' ? 'سباكة' : 'Plumbing'}</option>
                                            <option value="finishing">{language === 'ar' ? 'تشطيبات' : 'Finishing'}</option>
                                            <option value="general">{language === 'ar' ? 'توريدات عامة' : 'General Supplies'}</option>
                                        </select>
                                    </div>
                                </div>
                            )}

                            {/* Password Field */}
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2">
                                    {t('register_password')} <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute top-1/2 -translate-y-1/2 start-4 w-5 h-5 text-slate-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={formData.password}
                                        onChange={(e) => handleChange('password', e.target.value)}
                                        placeholder={language === 'ar' ? 'كلمة المرور' : 'Password'}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 ps-12 pe-12 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                        autoComplete="new-password"
                                        required
                                        id="register-password"
                                        name="password"
                                        minLength={6}
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

                            {/* Confirm Password Field */}
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-2">
                                    {t('register_confirm_password')} <span className="text-red-400">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute top-1/2 -translate-y-1/2 start-4 w-5 h-5 text-slate-500" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder={language === 'ar' ? 'تأكيد كلمة المرور' : 'Confirm Password'}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 ps-12 pe-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Subscription Plan - Only for individuals and companies */}
                        {userType !== 'supplier' ? (
                            <div>
                                <label className="block text-slate-300 text-sm font-medium mb-3">
                                    {t('register_plan')}
                                </label>
                                <div className={`grid grid-cols-2 gap-3`}>
                                    {SUBSCRIPTION_PLANS
                                        .filter(plan => {
                                            if (userType === 'individual') {
                                                // أفراد: المجانية + الاحترافية فقط
                                                return plan.id !== 'enterprise';
                                            } else {
                                                // شركات: المجانية + المنشآت فقط (بدون الاحترافية)
                                                return plan.id !== 'professional';
                                            }
                                        })
                                        .map((plan) => (
                                            <button
                                                key={plan.id}
                                                type="button"
                                                onClick={() => handleChange('plan', plan.id)}
                                                className={`relative p-4 rounded-xl border transition-all ${formData.plan === plan.id
                                                    ? 'bg-emerald-500/10 border-emerald-500 text-white'
                                                    : 'bg-slate-700/30 border-slate-600 text-slate-400 hover:border-slate-500'
                                                    }`}
                                            >
                                                {plan.popular && (
                                                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-emerald-500 text-white text-xs rounded-full">
                                                        {t('popular')}
                                                    </span>
                                                )}
                                                <div className="font-bold">{plan.name[language]}</div>
                                                <div className="text-sm mt-1">
                                                    {plan.price} {t('sar')}
                                                </div>
                                                {formData.plan === plan.id && (
                                                    <Check className="absolute top-2 end-2 w-4 h-4 text-emerald-400" />
                                                )}
                                            </button>
                                        ))}
                                </div>
                            </div>
                        ) : (
                            /* Supplier Info - No subscription needed */
                            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl p-4">
                                <div className="flex items-center gap-3 mb-2">
                                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                        <Truck className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <div>
                                        <div className="font-bold text-white">
                                            {language === 'ar' ? 'حساب مورد مجاني' : 'Free Supplier Account'}
                                        </div>
                                        <div className="text-sm text-emerald-300">
                                            {language === 'ar' ? 'بدون رسوم اشتراك' : 'No subscription fees'}
                                        </div>
                                    </div>
                                </div>
                                <ul className="text-sm text-slate-300 space-y-1 mt-3">
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-400" />
                                        {language === 'ar' ? 'عرض منتجاتك وأسعارك للعملاء' : 'Display your products and prices to customers'}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-400" />
                                        {language === 'ar' ? 'استقبال طلبات عروض الأسعار' : 'Receive quote requests'}
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <Check className="w-4 h-4 text-emerald-400" />
                                        {language === 'ar' ? 'لوحة تحكم خاصة بالموردين' : 'Dedicated supplier dashboard'}
                                    </li>
                                </ul>
                            </div>
                        )}

                        {/* Terms Agreement */}
                        <label className="flex items-center gap-3 text-slate-400 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={agreeTerms}
                                onChange={(e) => setAgreeTerms(e.target.checked)}
                                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-emerald-500 focus:ring-emerald-500 focus:ring-offset-0"
                            />
                            <span className="text-sm">{t('register_terms')}</span>
                        </label>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-bold text-lg transition-all shadow-lg shadow-emerald-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <span className="flex items-center justify-center gap-2">
                                    <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                                    </svg>
                                    <span>{language === 'ar' ? 'جاري إنشاء الحساب...' : 'Creating account...'}</span>
                                </span>
                            ) : (
                                t('register_submit')
                            )}
                        </button>
                    </form>

                    {/* Login Link */}
                    <div className="mt-6 text-center text-slate-400">
                        <span>{t('register_have_account')} </span>
                        <button
                            onClick={() => onNavigate('login')}
                            className="text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
                        >
                            {t('register_login')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
