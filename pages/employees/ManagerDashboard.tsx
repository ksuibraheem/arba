/**
 * لوحة تحكم المدير
 * Manager Dashboard
 */

import React, { useState, useEffect } from 'react';
import {
    Crown, Users, UserPlus, Settings, LogOut, Home,
    Calculator, Code, Headphones, Megaphone, CheckCircle,
    UserCog, Edit, Trash2, Key, Mail, Phone, Eye, EyeOff,
    Copy, Check, AlertCircle, X, Search, Filter
} from 'lucide-react';
import {
    Employee, EmployeeRole, employeeService,
    ROLE_TRANSLATIONS, ROLE_COLORS, MANAGER_CREDENTIALS
} from '../../services/employeeService';

interface ManagerDashboardProps {
    language: 'ar' | 'en';
    onLogout: () => void;
    onNavigate: (page: string) => void;
}

const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ language, onLogout, onNavigate }) => {
    const isRtl = language === 'ar';
    const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'add' | 'settings'>('overview');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<EmployeeRole | 'all'>('all');
    const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);

    // حالة نموذج إضافة موظف
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'accountant' as EmployeeRole,
        employeeNumber: '',
        password: ''
    });
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');

    // تحميل الموظفين
    useEffect(() => {
        setEmployees(employeeService.getEmployees());
    }, []);

    // توليد بيانات عشوائية
    const generateCredentials = () => {
        setNewEmployee(prev => ({
            ...prev,
            employeeNumber: employeeService.generateEmployeeNumber(),
            password: employeeService.generatePassword()
        }));
    };

    // إضافة موظف
    const handleAddEmployee = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        if (!newEmployee.name || !newEmployee.email || !newEmployee.employeeNumber || !newEmployee.password) {
            setFormError(language === 'ar' ? 'جميع الحقول مطلوبة' : 'All fields are required');
            return;
        }

        try {
            employeeService.addEmployee(newEmployee);
            setEmployees(employeeService.getEmployees());
            setFormSuccess(language === 'ar' ? 'تم إضافة الموظف بنجاح' : 'Employee added successfully');
            setNewEmployee({
                name: '',
                email: '',
                phone: '',
                role: 'accountant',
                employeeNumber: '',
                password: ''
            });
        } catch (error: any) {
            setFormError(error.message);
        }
    };

    // حذف موظف
    const handleDeleteEmployee = (id: string) => {
        if (confirm(language === 'ar' ? 'هل أنت متأكد من حذف هذا الموظف؟' : 'Are you sure you want to delete this employee?')) {
            employeeService.deleteEmployee(id);
            setEmployees(employeeService.getEmployees());
        }
    };

    // نسخ للحافظة
    const copyToClipboard = (text: string, id: string) => {
        navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 2000);
    };

    // تصفية الموظفين
    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            emp.employeeNumber.includes(searchTerm) ||
            emp.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = filterRole === 'all' || emp.role === filterRole;
        return matchesSearch && matchesRole;
    });

    // الإحصائيات
    const stats = {
        total: employees.length,
        active: employees.filter(e => e.isActive).length,
        byRole: Object.keys(ROLE_TRANSLATIONS).reduce((acc, role) => {
            acc[role as EmployeeRole] = employees.filter(e => e.role === role).length;
            return acc;
        }, {} as Record<EmployeeRole, number>)
    };

    const t = (ar: string, en: string) => language === 'ar' ? ar : en;

    const roleIcons: Record<EmployeeRole, React.ReactNode> = {
        manager: <Crown className="w-5 h-5" />,
        deputy: <UserCog className="w-5 h-5" />,
        accountant: <Calculator className="w-5 h-5" />,
        hr: <Users className="w-5 h-5" />,
        developer: <Code className="w-5 h-5" />,
        support: <Headphones className="w-5 h-5" />,
        marketing: <Megaphone className="w-5 h-5" />,
        quality: <CheckCircle className="w-5 h-5" />
    };

    return (
        <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900`} dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center">
                            <Crown className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-white">{t('لوحة تحكم المدير', 'Manager Dashboard')}</h1>
                            <p className="text-slate-400 text-sm">{MANAGER_CREDENTIALS.name}</p>
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
                        { id: 'overview', label: t('نظرة عامة', 'Overview'), icon: <Home className="w-4 h-4" /> },
                        { id: 'employees', label: t('الموظفين', 'Employees'), icon: <Users className="w-4 h-4" /> },
                        { id: 'add', label: t('إضافة موظف', 'Add Employee'), icon: <UserPlus className="w-4 h-4" /> },
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

                {/* Overview Tab */}
                {activeTab === 'overview' && (
                    <div className="space-y-6">
                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                                        <Users className="w-6 h-6 text-emerald-400" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-white">{stats.total}</p>
                                        <p className="text-slate-400 text-sm">{t('إجمالي الموظفين', 'Total Employees')}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-green-500/20 flex items-center justify-center">
                                        <CheckCircle className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div>
                                        <p className="text-3xl font-bold text-white">{stats.active}</p>
                                        <p className="text-slate-400 text-sm">{t('موظف نشط', 'Active')}</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Roles Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {(Object.keys(ROLE_TRANSLATIONS) as EmployeeRole[]).filter(r => r !== 'manager').map(role => (
                                <div
                                    key={role}
                                    className={`bg-gradient-to-br ${ROLE_COLORS[role]} rounded-xl p-4 cursor-pointer hover:scale-105 transition-transform`}
                                    onClick={() => {
                                        // إذا كان الدور هو الموارد البشرية أو المحاسب، اذهب لصفحة البرنامج الخاص بها
                                        if (role === 'hr') {
                                            onNavigate('hr');
                                        } else if (role === 'accountant') {
                                            onNavigate('accountant');
                                        } else {
                                            setFilterRole(role);
                                            setActiveTab('employees');
                                        }
                                    }}
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-lg bg-white/20 flex items-center justify-center text-white">
                                            {roleIcons[role]}
                                        </div>
                                        <div>
                                            <p className="text-2xl font-bold text-white">{stats.byRole[role] || 0}</p>
                                            <p className="text-white/80 text-sm">{ROLE_TRANSLATIONS[role][language]}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Employees Tab */}
                {activeTab === 'employees' && (
                    <div className="space-y-6">
                        {/* Search & Filter */}
                        <div className="flex flex-col md:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                <input
                                    type="text"
                                    placeholder={t('بحث بالاسم أو رقم الموظف...', 'Search by name or employee number...')}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 pr-10 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                                />
                            </div>
                            <select
                                value={filterRole}
                                onChange={(e) => setFilterRole(e.target.value as EmployeeRole | 'all')}
                                className="bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500/50"
                            >
                                <option value="all">{t('جميع الأدوار', 'All Roles')}</option>
                                {(Object.keys(ROLE_TRANSLATIONS) as EmployeeRole[]).filter(r => r !== 'manager').map(role => (
                                    <option key={role} value={role}>{ROLE_TRANSLATIONS[role][language]}</option>
                                ))}
                            </select>
                        </div>

                        {/* Employees List */}
                        {filteredEmployees.length === 0 ? (
                            <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                                <p className="text-slate-400">{t('لا يوجد موظفين', 'No employees found')}</p>
                                <button
                                    onClick={() => setActiveTab('add')}
                                    className="mt-4 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors"
                                >
                                    {t('إضافة موظف جديد', 'Add New Employee')}
                                </button>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {filteredEmployees.map(emp => (
                                    <div
                                        key={emp.id}
                                        className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50 hover:border-emerald-500/30 transition-all"
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${ROLE_COLORS[emp.role]} flex items-center justify-center text-white`}>
                                                    {roleIcons[emp.role]}
                                                </div>
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white">{emp.name}</h3>
                                                    <p className="text-slate-400 text-sm">{ROLE_TRANSLATIONS[emp.role][language]}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => handleDeleteEmployee(emp.id)}
                                                    className="p-2 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                                                    title={t('حذف', 'Delete')}
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                            <div>
                                                <p className="text-slate-500">{t('رقم الموظف', 'Employee #')}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-white font-mono">{emp.employeeNumber}</p>
                                                    <button
                                                        onClick={() => copyToClipboard(emp.employeeNumber, `num-${emp.id}`)}
                                                        className="p-1 hover:bg-slate-700 rounded"
                                                    >
                                                        {copiedId === `num-${emp.id}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">{t('الرقم السري', 'Password')}</p>
                                                <div className="flex items-center gap-2">
                                                    <p className="text-white font-mono">
                                                        {showPassword[emp.id] ? emp.password : '••••••••'}
                                                    </p>
                                                    <button
                                                        onClick={() => setShowPassword(prev => ({ ...prev, [emp.id]: !prev[emp.id] }))}
                                                        className="p-1 hover:bg-slate-700 rounded"
                                                    >
                                                        {showPassword[emp.id] ? <EyeOff className="w-3 h-3 text-slate-400" /> : <Eye className="w-3 h-3 text-slate-400" />}
                                                    </button>
                                                    <button
                                                        onClick={() => copyToClipboard(emp.password, `pass-${emp.id}`)}
                                                        className="p-1 hover:bg-slate-700 rounded"
                                                    >
                                                        {copiedId === `pass-${emp.id}` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
                                                    </button>
                                                </div>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">{t('البريد', 'Email')}</p>
                                                <p className="text-white">{emp.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-slate-500">{t('الحالة', 'Status')}</p>
                                                <span className={`px-2 py-1 rounded-full text-xs ${emp.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                                    {emp.isActive ? t('نشط', 'Active') : t('غير نشط', 'Inactive')}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Add Employee Tab */}
                {activeTab === 'add' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <UserPlus className="w-6 h-6 text-emerald-400" />
                                {t('إضافة موظف جديد', 'Add New Employee')}
                            </h2>

                            {formError && (
                                <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400">
                                    <AlertCircle className="w-5 h-5" />
                                    {formError}
                                </div>
                            )}

                            {formSuccess && (
                                <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2 text-green-400">
                                    <CheckCircle className="w-5 h-5" />
                                    {formSuccess}
                                </div>
                            )}

                            <form onSubmit={handleAddEmployee} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-slate-400 mb-2">{t('اسم الموظف', 'Employee Name')} *</label>
                                        <input
                                            type="text"
                                            value={newEmployee.name}
                                            onChange={(e) => setNewEmployee(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                            placeholder={t('أدخل اسم الموظف', 'Enter employee name')}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 mb-2">{t('البريد الإلكتروني', 'Email')} *</label>
                                        <input
                                            type="email"
                                            value={newEmployee.email}
                                            onChange={(e) => setNewEmployee(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                            placeholder="email@example.com"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-slate-400 mb-2">{t('الهاتف', 'Phone')}</label>
                                        <input
                                            type="tel"
                                            value={newEmployee.phone}
                                            onChange={(e) => setNewEmployee(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                            placeholder="05XXXXXXXX"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 mb-2">{t('الدور الوظيفي', 'Role')} *</label>
                                        <select
                                            value={newEmployee.role}
                                            onChange={(e) => setNewEmployee(prev => ({ ...prev, role: e.target.value as EmployeeRole }))}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500"
                                        >
                                            {(Object.keys(ROLE_TRANSLATIONS) as EmployeeRole[]).filter(r => r !== 'manager').map(role => (
                                                <option key={role} value={role}>{ROLE_TRANSLATIONS[role][language]}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="border-t border-slate-700 pt-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-white font-medium">{t('بيانات الدخول', 'Login Credentials')}</h3>
                                        <button
                                            type="button"
                                            onClick={generateCredentials}
                                            className="text-emerald-400 hover:text-emerald-300 text-sm flex items-center gap-1"
                                        >
                                            <Key className="w-4 h-4" />
                                            {t('توليد تلقائي', 'Auto Generate')}
                                        </button>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-slate-400 mb-2">{t('رقم الموظف', 'Employee Number')} *</label>
                                            <input
                                                type="text"
                                                value={newEmployee.employeeNumber}
                                                onChange={(e) => setNewEmployee(prev => ({ ...prev, employeeNumber: e.target.value }))}
                                                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-emerald-500"
                                                placeholder="XXXXXXXXX"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-400 mb-2">{t('الرقم السري', 'Password')} *</label>
                                            <input
                                                type="text"
                                                value={newEmployee.password}
                                                onChange={(e) => setNewEmployee(prev => ({ ...prev, password: e.target.value }))}
                                                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-emerald-500"
                                                placeholder="XXXXXXXX"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-medium rounded-lg hover:from-emerald-600 hover:to-teal-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <UserPlus className="w-5 h-5" />
                                        {t('إضافة الموظف', 'Add Employee')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Settings className="w-6 h-6 text-emerald-400" />
                                {t('الإعدادات', 'Settings')}
                            </h2>
                            <div className="space-y-4">
                                <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                                    <h3 className="text-amber-400 font-medium mb-2">{t('بيانات المدير', 'Manager Credentials')}</h3>
                                    <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div>
                                            <p className="text-slate-500">{t('رقم الموظف', 'Employee #')}</p>
                                            <p className="text-white font-mono">{MANAGER_CREDENTIALS.employeeNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-slate-500">{t('الرقم السري', 'Password')}</p>
                                            <p className="text-white font-mono">••••••••</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ManagerDashboard;
