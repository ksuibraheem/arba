/**
 * لوحة تحكم الموظفين
 * Employee Dashboard - displays role-specific content
 */

import React, { useState } from 'react';
import {
    LogOut, Home, Settings, Key, Eye, EyeOff, Check, X,
    Calculator, Code, Headphones, Megaphone, CheckCircle,
    UserCog, Users, Crown, Mail, Bell, User
} from 'lucide-react';
import {
    Employee, EmployeeRole, employeeService,
    ROLE_TRANSLATIONS, ROLE_COLORS
} from '../../services/employeeService';

// Import role pages
import AccountantPage from './roles/AccountantPage';
import HRPage from './roles/HRPage';
import DeveloperPage from './roles/DeveloperPage';
import SupportPage from './roles/SupportPage';
import MarketingPage from './roles/MarketingPage';
import DeputyPage from './roles/DeputyPage';
import QualityPage from './roles/QualityPage';

interface EmployeeDashboardProps {
    language: 'ar' | 'en';
    employee: Employee;
    onLogout: () => void;
    onNavigate: (page: string) => void;
}

const EmployeeDashboard: React.FC<EmployeeDashboardProps> = ({
    language,
    employee,
    onLogout,
    onNavigate
}) => {
    const isRtl = language === 'ar';
    const [activeTab, setActiveTab] = useState<'work' | 'profile' | 'settings'>('work');
    const [showChangePassword, setShowChangePassword] = useState(false);
    const [passwordForm, setPasswordForm] = useState({
        oldPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [passwordError, setPasswordError] = useState('');
    const [passwordSuccess, setPasswordSuccess] = useState('');
    const [showOldPassword, setShowOldPassword] = useState(false);
    const [showNewPassword, setShowNewPassword] = useState(false);

    const t = (ar: string, en: string) => language === 'ar' ? ar : en;

    const roleIcons: Record<EmployeeRole, React.ReactNode> = {
        manager: <Crown className="w-6 h-6" />,
        deputy: <UserCog className="w-6 h-6" />,
        accountant: <Calculator className="w-6 h-6" />,
        hr: <Users className="w-6 h-6" />,
        developer: <Code className="w-6 h-6" />,
        support: <Headphones className="w-6 h-6" />,
        marketing: <Megaphone className="w-6 h-6" />,
        quality: <CheckCircle className="w-6 h-6" />
    };

    // تغيير كلمة المرور
    const handleChangePassword = (e: React.FormEvent) => {
        e.preventDefault();
        setPasswordError('');
        setPasswordSuccess('');

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordError(t('كلمات المرور غير متطابقة', 'Passwords do not match'));
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setPasswordError(t('كلمة المرور يجب أن تكون 6 أحرف على الأقل', 'Password must be at least 6 characters'));
            return;
        }

        const result = employeeService.changePassword(
            employee.employeeNumber,
            passwordForm.oldPassword,
            passwordForm.newPassword
        );

        if (result.success) {
            setPasswordSuccess(t('تم تغيير كلمة المرور بنجاح', 'Password changed successfully'));
            setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
            setShowChangePassword(false);
        } else {
            setPasswordError(result.error || t('حدث خطأ', 'An error occurred'));
        }
    };

    // عرض صفحة الدور المناسبة
    const renderRolePage = () => {
        const roleProps = { language, employee };

        switch (employee.role) {
            case 'accountant':
                return <AccountantPage {...roleProps} />;
            case 'hr':
                return <HRPage {...roleProps} />;
            case 'developer':
                return <DeveloperPage {...roleProps} />;
            case 'support':
                return <SupportPage {...roleProps} />;
            case 'marketing':
                return <MarketingPage {...roleProps} />;
            case 'deputy':
                return <DeputyPage {...roleProps} />;
            case 'quality':
                return <QualityPage {...roleProps} />;
            default:
                return (
                    <div className="text-center py-12">
                        <p className="text-slate-400">{t('صفحة غير موجودة', 'Page not found')}</p>
                    </div>
                );
        }
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900`} dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ROLE_COLORS[employee.role]} flex items-center justify-center text-white`}>
                            {roleIcons[employee.role]}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">{employee.name}</h1>
                            <p className="text-slate-400 text-sm">{ROLE_TRANSLATIONS[employee.role][language]}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => onNavigate('landing')}
                            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-700/50 rounded-lg transition-all"
                            title={t('الصفحة الرئيسية', 'Home')}
                        >
                            <Home className="w-5 h-5" />
                        </button>
                        <button
                            className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-slate-700/50 rounded-lg transition-all relative"
                            title={t('الإشعارات', 'Notifications')}
                        >
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                        </button>
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 text-red-400 hover:bg-red-500/30 rounded-lg transition-all"
                        >
                            <LogOut className="w-4 h-4" />
                            <span>{t('خروج', 'Logout')}</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Tabs */}
                <div className="flex gap-2 mb-8 bg-slate-800/50 p-2 rounded-xl w-fit">
                    {[
                        { id: 'work', label: t('العمل', 'Work'), icon: roleIcons[employee.role] },
                        { id: 'profile', label: t('الملف الشخصي', 'Profile'), icon: <User className="w-4 h-4" /> },
                        { id: 'settings', label: t('الإعدادات', 'Settings'), icon: <Settings className="w-4 h-4" /> }
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${activeTab === tab.id
                                    ? 'bg-emerald-500 text-white'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
                                }`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Work Tab - Role-specific content */}
                {activeTab === 'work' && renderRolePage()}

                {/* Profile Tab */}
                {activeTab === 'profile' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                            <div className="flex items-center gap-4 mb-6">
                                <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${ROLE_COLORS[employee.role]} flex items-center justify-center text-white`}>
                                    {roleIcons[employee.role]}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">{employee.name}</h2>
                                    <p className="text-slate-400">{ROLE_TRANSLATIONS[employee.role][language]}</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="bg-slate-700/30 rounded-lg p-4">
                                    <p className="text-slate-500 text-sm">{t('رقم الموظف', 'Employee #')}</p>
                                    <p className="text-white font-mono text-lg">{employee.employeeNumber}</p>
                                </div>
                                <div className="bg-slate-700/30 rounded-lg p-4">
                                    <p className="text-slate-500 text-sm">{t('البريد الإلكتروني', 'Email')}</p>
                                    <p className="text-white">{employee.email}</p>
                                </div>
                                <div className="bg-slate-700/30 rounded-lg p-4">
                                    <p className="text-slate-500 text-sm">{t('الهاتف', 'Phone')}</p>
                                    <p className="text-white">{employee.phone || t('غير محدد', 'Not set')}</p>
                                </div>
                                <div className="bg-slate-700/30 rounded-lg p-4">
                                    <p className="text-slate-500 text-sm">{t('الحالة', 'Status')}</p>
                                    <span className={`px-2 py-1 rounded-full text-xs ${employee.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                        {employee.isActive ? t('نشط', 'Active') : t('غير نشط', 'Inactive')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="max-w-2xl mx-auto space-y-6">
                        {/* Change Password */}
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                    <Key className="w-5 h-5 text-emerald-400" />
                                    {t('تغيير الرقم السري', 'Change Password')}
                                </h3>
                                <button
                                    onClick={() => setShowChangePassword(!showChangePassword)}
                                    className="text-emerald-400 hover:text-emerald-300 text-sm"
                                >
                                    {showChangePassword ? t('إلغاء', 'Cancel') : t('تغيير', 'Change')}
                                </button>
                            </div>

                            {showChangePassword && (
                                <form onSubmit={handleChangePassword} className="space-y-4">
                                    {passwordError && (
                                        <div className="p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm">
                                            {passwordError}
                                        </div>
                                    )}
                                    {passwordSuccess && (
                                        <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-400 text-sm">
                                            {passwordSuccess}
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-slate-400 mb-2">{t('الرقم السري الحالي', 'Current Password')}</label>
                                        <div className="relative">
                                            <input
                                                type={showOldPassword ? 'text' : 'password'}
                                                value={passwordForm.oldPassword}
                                                onChange={(e) => setPasswordForm(prev => ({ ...prev, oldPassword: e.target.value }))}
                                                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowOldPassword(!showOldPassword)}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            >
                                                {showOldPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-slate-400 mb-2">{t('الرقم السري الجديد', 'New Password')}</label>
                                        <div className="relative">
                                            <input
                                                type={showNewPassword ? 'text' : 'password'}
                                                value={passwordForm.newPassword}
                                                onChange={(e) => setPasswordForm(prev => ({ ...prev, newPassword: e.target.value }))}
                                                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowNewPassword(!showNewPassword)}
                                                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                                            >
                                                {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-slate-400 mb-2">{t('تأكيد الرقم السري', 'Confirm Password')}</label>
                                        <input
                                            type="password"
                                            value={passwordForm.confirmPassword}
                                            onChange={(e) => setPasswordForm(prev => ({ ...prev, confirmPassword: e.target.value }))}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-emerald-500 text-white font-medium rounded-lg hover:bg-emerald-600 transition-colors"
                                    >
                                        {t('حفظ التغييرات', 'Save Changes')}
                                    </button>
                                </form>
                            )}
                        </div>

                        {/* Email Notifications */}
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2 mb-4">
                                <Mail className="w-5 h-5 text-emerald-400" />
                                {t('إشعارات البريد', 'Email Notifications')}
                            </h3>
                            <div className="space-y-3">
                                <label className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg cursor-pointer">
                                    <span className="text-slate-300">{t('إشعار عند تسجيل الدخول', 'Login notifications')}</span>
                                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-500" />
                                </label>
                                <label className="flex items-center justify-between p-3 bg-slate-700/30 rounded-lg cursor-pointer">
                                    <span className="text-slate-300">{t('إشعار تغيير كلمة المرور', 'Password change alerts')}</span>
                                    <input type="checkbox" defaultChecked className="w-5 h-5 accent-emerald-500" />
                                </label>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EmployeeDashboard;
