import React, { useState, useEffect } from 'react';
import ArbaLogo from '../components/ArbaLogo';
import {
    Calculator,
    Mail,
    Lock,
    Eye,
    EyeOff,
    ArrowLeft,
    ArrowRight,
    User,
    Users,
    Building2,
    Truck,
    Shield,
    Phone,
    Briefcase,
    HardHat
} from 'lucide-react';
import { COMPANY_INFO, PAGE_TRANSLATIONS, getLocalizedText } from '../companyData';
import { Language } from '../types';
import { projectSupplierService, ProjectMember } from '../services/projectSupplierService';

interface LoginPageProps {
    language: Language;
    onNavigate: (page: string) => void;
    onLogin: (email: string, password: string, userType?: string) => void;
    onTeamLogin?: (member: ProjectMember) => void;
    loginError?: string;
    loginSuccess?: string;
    initialUserType?: UserType;
}

type UserType = 'individual' | 'company' | 'supplier' | 'employee' | 'team_member';

const LoginPage: React.FC<LoginPageProps> = ({ language, onNavigate, onLogin, onTeamLogin, loginError, loginSuccess, initialUserType }) => {
    const [userType, setUserType] = useState<UserType>(initialUserType || 'individual');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [phone, setPhone] = useState('');
    const [employeeId, setEmployeeId] = useState('');
    const [teamPhone, setTeamPhone] = useState('');
    const [teamPassword, setTeamPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    // Init sample data for team members
    useEffect(() => { projectSupplierService.initSampleData(); }, []);

    const t = (key: string) => PAGE_TRANSLATIONS[key]?.[language] || PAGE_TRANSLATIONS[key]?.['en'] || key;
    const tl = (obj: Record<string, string> | undefined) => getLocalizedText(obj, language);
    const isRtl = language === 'ar';
    const isCjk = language === 'zh';
    const Arrow = isRtl ? ArrowRight : ArrowLeft;

    const userTypes: { id: UserType; label: Record<string, string>; icon: React.ElementType; color: string }[] = [
        { id: 'individual', label: { ar: 'أفراد', en: 'Individual', fr: 'Individu', zh: '个人' }, icon: User, color: 'from-blue-500 to-blue-600' },
        { id: 'company', label: { ar: 'شركات', en: 'Company', fr: 'Entreprise', zh: '公司' }, icon: Building2, color: 'from-green-500 to-lime-500' },
        { id: 'supplier', label: { ar: 'موردين', en: 'Supplier', fr: 'Fournisseur', zh: '供应商' }, icon: Truck, color: 'from-amber-500 to-orange-500' },
        { id: 'team_member', label: { ar: 'فريق المشروع', en: 'Project Team', fr: 'Équipe Projet', zh: '项目团队' }, icon: HardHat, color: 'from-emerald-500 to-teal-500' }
    ];

    // All types including hidden employee for config lookup
    const allTypeConfigs: { id: UserType; label: Record<string, string>; icon: React.ElementType; color: string }[] = [
        ...userTypes,
        { id: 'employee', label: { ar: 'موظفين آربا', en: 'ARBA Staff', fr: 'Personnel ARBA', zh: 'ARBA员工' }, icon: Shield, color: 'from-purple-500 to-indigo-500' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        // Team member auth — separate flow
        if (userType === 'team_member') {
            const cleanPhone = teamPhone.trim();
            if (!cleanPhone || cleanPhone.length < 10) {
                setError(t('login_enter_phone'));
                setLoading(false); return;
            }
            if (!teamPassword) {
                setError(t('login_enter_password'));
                setLoading(false); return;
            }
            try {
                const result = await projectSupplierService.authenticateTeamMember(cleanPhone, teamPassword);
                if (result.success && result.member && onTeamLogin) {
                    sessionStorage.setItem('arba_team_session', JSON.stringify({
                        memberId: result.member.id, phone: cleanPhone,
                        projectId: result.member.projectId, loginAt: new Date().toISOString(),
                    }));
                    onTeamLogin(result.member);
                } else {
                    setError(result.error || t('login_invalid_credentials'));
                }
            } catch { setError(t('login_error_retry')); }
            finally { setLoading(false); }
            return;
        }

        // Standard login types
        let isValid = true;
        if (userType === 'employee') {
            if (!employeeId || !password) {
                setError(t('login_enter_employee_id'));
                isValid = false;
            }
        } else if (userType === 'supplier') {
            if (!phone || !password) {
                setError(t('login_enter_phone'));
                isValid = false;
            }
        } else {
            if (!email || !password) {
                setError(t('login_enter_email'));
                isValid = false;
            }
        }

        if (!isValid) {
            setLoading(false);
            return;
        }

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
                    title: { ar: 'دخول الموظفين', en: 'Staff Login', fr: 'Connexion Employé', zh: '员工登录' },
                    subtitle: { ar: 'مخصص لموظفي آربا فقط', en: 'For ARBA employees only', fr: 'Réservé aux employés ARBA', zh: '仅限ARBA员工' },
                    idLabel: { ar: 'رقم الموظف', en: 'Employee ID', fr: 'ID Employé', zh: '员工编号' },
                    idPlaceholder: { ar: 'أدخل رقم الموظف', en: 'Enter employee ID', fr: 'Entrez l\'ID employé', zh: '请输入员工编号' },
                    idIcon: Briefcase
                };
            case 'supplier':
                return {
                    title: { ar: 'دخول الموردين', en: 'Supplier Login', fr: 'Connexion Fournisseur', zh: '供应商登录' },
                    subtitle: { ar: 'لموردي مواد البناء', en: 'For construction material suppliers', fr: 'Pour les fournisseurs de matériaux', zh: '建筑材料供应商' },
                    idLabel: { ar: 'رقم الجوال', en: 'Phone Number', fr: 'Numéro de Téléphone', zh: '电话号码' },
                    idPlaceholder: { ar: 'أدخل رقم الجوال', en: 'Enter phone number', fr: 'Entrez le numéro', zh: '请输入电话号码' },
                    idIcon: Phone
                };
            case 'company':
                return {
                    title: { ar: 'دخول الشركات', en: 'Company Login', fr: 'Connexion Entreprise', zh: '公司登录' },
                    subtitle: { ar: 'للمقاولين وشركات البناء', en: 'For contractors & construction companies', fr: 'Pour les entrepreneurs et sociétés', zh: '承包商和建筑公司' },
                    idLabel: { ar: 'البريد الإلكتروني', en: 'Email', fr: 'E-mail', zh: '电子邮箱' },
                    idPlaceholder: { ar: 'أدخل بريد الشركة', en: 'Enter company email', fr: 'Entrez l\'e-mail', zh: '请输入公司邮箱' },
                    idIcon: Mail
                };
            case 'team_member':
                return {
                    title: { ar: 'دخول فريق المشروع', en: 'Project Team Login', fr: 'Connexion Équipe Projet', zh: '项目团队登录' },
                    subtitle: { ar: 'لأعضاء فريق المشروع فقط', en: 'For project team members only', fr: 'Réservé aux membres de l\'\u00e9quipe', zh: '仅限项目团队成员' },
                    idLabel: { ar: 'رقم الجوال', en: 'Phone Number', fr: 'Numéro de Téléphone', zh: '电话号码' },
                    idPlaceholder: { ar: '05xxxxxxxx', en: '05xxxxxxxx', fr: '05xxxxxxxx', zh: '05xxxxxxxx' },
                    idIcon: Phone
                };
            default:
                return {
                    title: { ar: 'تسجيل الدخول', en: 'Login', fr: 'Connexion', zh: '登录' },
                    subtitle: { ar: 'للأفراد والمستخدمين', en: 'For individuals & users', fr: 'Pour les individus et utilisateurs', zh: '个人用户' },
                    idLabel: { ar: 'البريد الإلكتروني', en: 'Email', fr: 'E-mail', zh: '电子邮箱' },
                    idPlaceholder: { ar: 'أدخل بريدك الإلكتروني', en: 'Enter your email', fr: 'Entrez votre e-mail', zh: '请输入您的邮箱' },
                    idIcon: Mail
                };
        }
    };

    const config = getTypeConfig();
    const selectedType = allTypeConfigs.find(u => u.id === userType)!;

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#070914] via-[#0E132B] to-[#050711] flex items-center justify-center p-6" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Background Pattern */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-br from-green-500/10 to-transparent rounded-full blur-3xl"></div>
                <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-indigo-500/10 to-transparent rounded-full blur-3xl"></div>
            </div>

            <div className="relative w-full max-w-lg">
                {/* Back Button */}
                <button
                    onClick={() => onNavigate('landing')}
                    className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors bg-[#080B1A]/40 px-6 py-2 rounded-lg border border-[#2B2D6E]/30 mb-8"
                >
                    <Arrow className="w-5 h-5" />
                    <span>{t('nav_back_home')}</span>
                </button>

                {/* Login Card */}
                <div className="bg-[#0B0F24]/80 backdrop-blur-xl rounded-3xl border border-[#2B2D6E]/40 p-8 shadow-2xl shadow-[#000000]/40">
                    <div className="flex justify-center mb-8">
                        <div className="w-20 h-20 rounded-2xl flex items-center justify-center bg-[#131A3B]/60 border border-[#2B2D6E]/50 shadow-lg shadow-green-500/10">
                            <ArbaLogo size={60} animated />
                        </div>
                    </div>

                    {/* User Type Tabs - hidden when employee mode is active */}
                    {userType !== 'employee' && <div className="grid grid-cols-4 gap-1.5 mb-8">
                        {userTypes.map((type) => (
                            <button
                                key={type.id}
                                onClick={() => {
                                    setUserType(type.id);
                                    setError('');
                                }}
                                className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all ${userType === type.id
                                    ? `bg-gradient-to-br ${type.color} text-white shadow-lg shadow-[#2B2D6E]/20`
                                    : 'bg-[#19224D]/40 text-slate-400 hover:bg-[#19224D]/70 hover:text-white border border-transparent hover:border-[#2B2D6E]/40'
                                    }`}
                            >
                                <type.icon className="w-5 h-5" />
                                <span className={`${isCjk ? 'text-[11px]' : 'text-[10px]'} font-medium`}>{tl(type.label)}</span>
                            </button>
                        ))}
                    </div>}

                    {/* Dynamic Header */}
                    <div className="text-center mb-6">
                        <div className={`w-14 h-14 bg-gradient-to-br ${selectedType.color} rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg`}>
                            <selectedType.icon className="w-7 h-7 text-white" />
                        </div>
                        <h1 className={`${isCjk ? 'text-xl' : 'text-2xl'} font-bold text-white mb-1`}>{tl(config.title)}</h1>
                        <p className="text-slate-400 text-sm">{tl(config.subtitle)}</p>
                    </div>

                    {/* Success Message */}
                    {loginSuccess && (
                        <div className="bg-green-500/10 border border-green-500/50 text-green-400 px-4 py-3 rounded-xl mb-6 text-sm text-center">
                            {loginSuccess}
                        </div>
                    )}

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
                                {tl(config.idLabel)}
                            </label>
                            <div className="relative">
                                <config.idIcon className="absolute top-1/2 -translate-y-1/2 start-4 w-5 h-5 text-slate-500" />
                                {userType === 'employee' ? (
                                    <input
                                        type="text"
                                        value={employeeId}
                                        onChange={(e) => setEmployeeId(e.target.value)}
                                        placeholder={tl(config.idPlaceholder)}
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
                                        placeholder={tl(config.idPlaceholder)}
                                        className="w-full bg-[#080B1A]/60 border border-[#2B2D6E]/50 rounded-xl py-3 ps-12 pe-4 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all shadow-inner"
                                        autoComplete="tel"
                                        required
                                        id="login-phone"
                                        name="phone"
                                        dir="ltr"
                                    />
                                ) : userType === 'team_member' ? (
                                    <input
                                        type="tel"
                                        value={teamPhone}
                                        onChange={(e) => setTeamPhone(e.target.value)}
                                        placeholder={tl(config.idPlaceholder)}
                                        className="w-full bg-[#080B1A]/60 border border-[#2B2D6E]/50 rounded-xl py-3 ps-12 pe-4 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all shadow-inner"
                                        autoComplete="tel"
                                        required
                                        id="login-team-phone"
                                        name="team-phone"
                                        dir="ltr"
                                    />
                                ) : (
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder={tl(config.idPlaceholder)}
                                        className={`w-full bg-[#080B1A]/60 border border-[#2B2D6E]/50 rounded-xl py-3 ps-12 pe-4 text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all shadow-inner`}
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
                                {userType === 'team_member' ? t('login_password') : t('login_password')}
                            </label>
                            <div className="relative">
                                <Lock className="absolute top-1/2 -translate-y-1/2 start-4 w-5 h-5 text-slate-500" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={userType === 'team_member' ? teamPassword : password}
                                    onChange={(e) => userType === 'team_member' ? setTeamPassword(e.target.value) : setPassword(e.target.value)}
                                    placeholder={t('login_enter_password')}
                                    className="w-full bg-[#080B1A]/60 border border-[#2B2D6E]/50 rounded-xl py-3 ps-12 pe-12 text-white placeholder-slate-500 focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 transition-all shadow-inner"
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
                                    className="w-4 h-4 rounded border-[#2B2D6E]/50 bg-[#080B1A] text-green-500 focus:ring-green-500 focus:ring-offset-0"
                                />
                                <span>{t('login_remember')}</span>
                            </label>
                            <button
                                type="button"
                                onClick={() => onNavigate('password-reset')}
                                className="text-green-400 hover:text-green-300 transition-colors"
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
                                    <span>{t('login_loading')}</span>
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
                                className="text-green-400 hover:text-green-300 font-medium transition-colors"
                            >
                                {t('login_create_account')}
                            </button>
                        </div>
                    )}

                    {/* Supplier Registration Link */}
                    {userType === 'supplier' && (
                        <div className="mt-8 text-center text-slate-400">
                            <span>{t('login_supplier_prompt')} </span>
                            <button
                                onClick={() => onNavigate('register')}
                                className="text-amber-400 hover:text-amber-300 font-medium transition-colors"
                            >
                                {t('login_supplier_register')}
                            </button>
                        </div>
                    )}

                    {/* Employee Help */}
                    {userType === 'employee' && (
                        <div className="mt-8 text-center">
                            <p className="text-slate-500 text-sm">
                                {t('login_employee_help')}
                            </p>
                        </div>
                    )}

                    {/* Team Member Help */}
                    {userType === 'team_member' && (
                        <div className="mt-8 text-center">
                            <p className="text-slate-500 text-sm">
                                {t('login_team_help')}
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <p className="text-center text-slate-500 text-sm mt-4">
                    © 2025 {tl(COMPANY_INFO.companyName)} - {tl(COMPANY_INFO.systemName)}. {t('footer_rights')}
                </p>
            </div>
        </div>
    );
};

export default LoginPage;
