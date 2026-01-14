/**
 * لوحة تحكم المدير
 * Manager Dashboard
 */

import React, { useState, useEffect } from 'react';
import {
    Crown, Users, UserPlus, Settings, LogOut, Home, LogIn,
    Calculator, Code, Headphones, Megaphone, CheckCircle,
    UserCog, Edit, Trash2, Key, Mail, Phone, Eye, EyeOff, Save,
    Copy, Check, AlertCircle, AlertTriangle, X, Search, Filter, Cloud, FileText, Clock,
    Play, ClipboardCheck
} from 'lucide-react';
import {
    Employee, EmployeeRole, employeeService,
    ROLE_TRANSLATIONS, ROLE_COLORS, MANAGER_CREDENTIALS, getManagerCredentials, updateManagerCredentials
} from '../../services/employeeService';
import { invoiceEditRequestService, InvoiceEditRequest, EDIT_REQUEST_STATUS_TRANSLATIONS } from '../../services/invoiceEditRequestService';
import { registrationService, RegistrationRequest, USER_TYPE_TRANSLATIONS, REGISTRATION_STATUS_TRANSLATIONS } from '../../services/registrationService';
import {
    getAllTestPermissions,
    setEmployeeTestPermissions,
    hasAnyTestPermission,
    startTestMode,
    endTestMode,
    getCurrentTestSession,
    isInTestMode,
    getAvailablePackagesForTest,
    TEST_MODE_TRANSLATIONS,
    PACKAGE_TRANSLATIONS,
    TEST_USER_TYPE_TRANSLATIONS,
    isSuperAdmin,
    TestModePermission,
    TestSession,
    PackagePlan,
    TestUserType
} from '../../services/testModeService';

interface ManagerDashboardProps {
    language: 'ar' | 'en';
    onLogout: () => void;
    onNavigate: (page: string) => void;
    onStartTestMode?: (plan: string, userType: string) => void;
}

// ================= Manager Settings Tab Component =================
interface ManagerSettingsTabProps {
    language: 'ar' | 'en';
    t: (ar: string, en: string) => string;
    onNavigate: (page: string) => void;
}

const ManagerSettingsTab: React.FC<ManagerSettingsTabProps> = ({ language, t, onNavigate }) => {
    const [managerCreds, setManagerCreds] = useState(getManagerCredentials());
    const [isEditing, setIsEditing] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [editForm, setEditForm] = useState({
        employeeNumber: managerCreds.employeeNumber,
        password: managerCreds.password
    });
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [saveError, setSaveError] = useState('');

    const handleSave = () => {
        setSaveError('');
        setSaveSuccess(false);

        // Validation
        if (!editForm.employeeNumber || editForm.employeeNumber.length < 6) {
            setSaveError(t('رقم الموظف يجب أن يكون 6 أرقام على الأقل', 'Employee number must be at least 6 digits'));
            return;
        }
        if (!editForm.password || editForm.password.length < 6) {
            setSaveError(t('الرقم السري يجب أن يكون 6 أرقام على الأقل', 'Password must be at least 6 characters'));
            return;
        }

        // Update credentials
        const updated = updateManagerCredentials({
            employeeNumber: editForm.employeeNumber,
            password: editForm.password
        });
        setManagerCreds(updated);
        setIsEditing(false);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 3000);
    };

    const handleCancel = () => {
        setEditForm({
            employeeNumber: managerCreds.employeeNumber,
            password: managerCreds.password
        });
        setIsEditing(false);
        setSaveError('');
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                    <Settings className="w-6 h-6 text-emerald-400" />
                    {t('الإعدادات', 'Settings')}
                </h2>
                <div className="space-y-4">
                    {/* Manager Credentials Section */}
                    <div className="p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-amber-400 font-medium flex items-center gap-2">
                                <Crown className="w-5 h-5" />
                                {t('بيانات المدير', 'Manager Credentials')}
                            </h3>
                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-1 text-amber-400 hover:text-amber-300 text-sm px-3 py-1 bg-amber-500/20 rounded-lg transition-colors"
                                >
                                    <Edit className="w-4 h-4" />
                                    {t('تعديل', 'Edit')}
                                </button>
                            )}
                        </div>

                        {saveSuccess && (
                            <div className="mb-4 p-3 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center gap-2 text-green-400">
                                <CheckCircle className="w-5 h-5" />
                                {t('تم حفظ التغييرات بنجاح', 'Changes saved successfully')}
                            </div>
                        )}

                        {saveError && (
                            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center gap-2 text-red-400">
                                <AlertCircle className="w-5 h-5" />
                                {saveError}
                            </div>
                        )}

                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-slate-400 mb-2 text-sm">
                                        {t('رقم الموظف', 'Employee Number')}
                                    </label>
                                    <input
                                        type="text"
                                        value={editForm.employeeNumber}
                                        onChange={(e) => setEditForm(prev => ({ ...prev, employeeNumber: e.target.value }))}
                                        className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-amber-500"
                                        placeholder="XXXXXXXX"
                                        dir="ltr"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 mb-2 text-sm">
                                        {t('الرقم السري الجديد', 'New Password')}
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showPassword ? 'text' : 'password'}
                                            value={editForm.password}
                                            onChange={(e) => setEditForm(prev => ({ ...prev, password: e.target.value }))}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-amber-500 pe-10"
                                            placeholder="••••••••"
                                            dir="ltr"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                                        >
                                            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                                <div className="flex gap-3 pt-2">
                                    <button
                                        onClick={handleSave}
                                        className="flex-1 py-2 bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-medium rounded-lg hover:from-amber-600 hover:to-yellow-700 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Key className="w-4 h-4" />
                                        {t('حفظ التغييرات', 'Save Changes')}
                                    </button>
                                    <button
                                        onClick={handleCancel}
                                        className="px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                                    >
                                        {t('إلغاء', 'Cancel')}
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div>
                                    <p className="text-slate-500">{t('رقم الموظف', 'Employee #')}</p>
                                    <p className="text-white font-mono text-lg">{managerCreds.employeeNumber}</p>
                                </div>
                                <div>
                                    <p className="text-slate-500">{t('الرقم السري', 'Password')}</p>
                                    <div className="flex items-center gap-2">
                                        <p className="text-white font-mono text-lg">
                                            {showPassword ? managerCreds.password : '••••••••'}
                                        </p>
                                        <button
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Cloud Sync Button */}
                    <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
                        <h3 className="text-blue-400 font-medium mb-2">{t('مزامنة السحابة', 'Cloud Sync')}</h3>
                        <p className="text-slate-400 text-sm mb-4">
                            {t('تصدير البيانات إلى Firebase للنسخ الاحتياطي', 'Export data to Firebase for backup')}
                        </p>
                        <button
                            onClick={() => onNavigate('cloud-sync')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                        >
                            <Cloud className="w-5 h-5" />
                            {t('فتح مزامنة السحابة', 'Open Cloud Sync')}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ================= Main Manager Dashboard Component =================
const ManagerDashboard: React.FC<ManagerDashboardProps> = ({ language, onLogout, onNavigate, onStartTestMode }) => {
    const isRtl = language === 'ar';
    const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'add' | 'accounts' | 'edit_requests' | 'test_mode' | 'settings'>('overview');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [editRequests, setEditRequests] = useState<InvoiceEditRequest[]>([]);
    const [accounts, setAccounts] = useState<RegistrationRequest[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<EmployeeRole | 'all'>('all');
    const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [accountsFilter, setAccountsFilter] = useState<'all' | 'active' | 'suspended'>('all');

    // حالة نافذة الحظر/التنبيه
    const [showSuspendModal, setShowSuspendModal] = useState(false);
    const [selectedAccount, setSelectedAccount] = useState<RegistrationRequest | null>(null);
    const [suspendForm, setSuspendForm] = useState({
        actionType: 'suspend' as 'suspend' | 'warning',
        suspensionType: 'permanent' as 'permanent' | 'week' | 'custom',
        customDays: 7,
        reason: ''
    });

    // حالة تعديل الموظف
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedEmployeeForEdit, setSelectedEmployeeForEdit] = useState<Employee | null>(null);

    // حالة نموذج إضافة موظف
    const [newEmployee, setNewEmployee] = useState({
        name: '',
        email: '',
        phone: '',
        role: 'accountant' as EmployeeRole,
        employeeNumber: '',
        password: ''
    });

    // حالة نموذج تعديل الموظف
    const [editEmployee, setEditEmployee] = useState({
        id: '',
        name: '',
        email: '',
        phone: '',
        role: 'accountant' as EmployeeRole,
        employeeNumber: '',
        password: '',
        isActive: true
    });

    // تحديث بيانات نموذج التعديل عند اختيار موظف
    useEffect(() => {
        if (selectedEmployeeForEdit) {
            setEditEmployee({
                id: selectedEmployeeForEdit.id,
                name: selectedEmployeeForEdit.name,
                email: selectedEmployeeForEdit.email,
                phone: selectedEmployeeForEdit.phone,
                role: selectedEmployeeForEdit.role,
                employeeNumber: selectedEmployeeForEdit.employeeNumber,
                password: selectedEmployeeForEdit.password,
                isActive: selectedEmployeeForEdit.isActive
            });
        }
    }, [selectedEmployeeForEdit]);

    // تحديث موظف
    const handleUpdateEmployee = (e: React.FormEvent) => {
        e.preventDefault();

        try {
            // هنا نفترض وجود دالة updateEmployee في الخدمة، إن لم توجد سنستخدم addEmployee كبديل مؤقت أو نحدث القائمة مباشرة
            // لكن بما أننا نستخدم localStorage، يمكننا تحديث القائمة مباشرة
            const updatedEmployees = employees.map(emp =>
                emp.id === editEmployee.id ? { ...emp, ...editEmployee } : emp
            );

            // حفظ في LocalStorage (محاكاة لخدمة التحديث)
            localStorage.setItem('arba_employees', JSON.stringify(updatedEmployees));
            setEmployees(updatedEmployees);

            setShowEditModal(false);
            setFormSuccess(language === 'ar' ? 'تم تحديث البيانات بنجاح' : 'Employee updated successfully');
            setTimeout(() => setFormSuccess(''), 3000);
        } catch (error) {
            setFormError(language === 'ar' ? 'حدث خطأ أثناء التحديث' : 'Error updating employee');
        }
    };
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');


    // تحميل الموظفين وطلبات التعديل والحسابات
    useEffect(() => {
        // تهيئة البيانات التجريبية إذا لم تكن موجودة
        employeeService.initializeSampleData();
        setEmployees(employeeService.getEmployees());
        setEditRequests(invoiceEditRequestService.getPendingRequests());
        setAccounts(registrationService.getAllApprovedAccounts());
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
        quality: <CheckCircle className="w-5 h-5" />,
        quantity_surveyor: <ClipboardCheck className="w-5 h-5" />
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
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
                        { id: 'accounts', label: t('إدارة الحسابات', 'Accounts'), icon: <UserCog className="w-4 h-4" />, badge: accounts.filter(a => a.isSuspended).length },
                        { id: 'edit_requests', label: t('طلبات التعديل', 'Edit Requests'), icon: <FileText className="w-4 h-4" />, badge: editRequests.length },
                        { id: 'test_mode', label: t('اختبار الباقات', 'Test Packages'), icon: <Play className="w-4 h-4" /> },
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
                            {(tab as any).badge > 0 && (
                                <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">{(tab as any).badge}</span>
                            )}
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
                                        // فتح صفحة الدور الخاصة إذا كانت موجودة
                                        if (role === 'hr') {
                                            onNavigate('hr');
                                        } else if (role === 'accountant') {
                                            onNavigate('accountant');
                                        } else if (role === 'support') {
                                            onNavigate('support');
                                        } else if (role === 'developer') {
                                            onNavigate('developer');
                                        } else if (role === 'marketing') {
                                            onNavigate('marketing');
                                        } else if (role === 'quality') {
                                            onNavigate('quality');
                                        } else if (role === 'deputy') {
                                            onNavigate('deputy');
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
                                                {/* زر تعيين/تعديل الموظف */}
                                                <button
                                                    onClick={() => {
                                                        setSelectedEmployeeForEdit(emp);
                                                        setShowEditModal(true);
                                                    }}
                                                    className="p-2 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors"
                                                    title={t('تعيين / تعديل', 'Assign / Edit')}
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                {/* زر الدخول كموظف */}
                                                <button
                                                    onClick={() => {
                                                        // حفظ أن المدير يعمل نيابة عن الموظف
                                                        localStorage.setItem('arba_impersonating_employee', JSON.stringify({
                                                            employeeId: emp.id,
                                                            employeeNumber: emp.employeeNumber,
                                                            employeeName: emp.name,
                                                            employeeRole: emp.role,
                                                            impersonatedBy: '2201187',
                                                            impersonatorName: t('المدير العام', 'General Manager'),
                                                            startedAt: new Date().toISOString()
                                                        }));
                                                        // التنقل لصفحة الموظف
                                                        onNavigate(emp.role === 'quantity_surveyor' ? 'quantity_surveyor' : emp.role);
                                                    }}
                                                    className="p-2 text-emerald-400 hover:bg-emerald-500/20 rounded-lg transition-colors"
                                                    title={t('الدخول كموظف', 'Work as Employee')}
                                                >
                                                    <LogIn className="w-4 h-4" />
                                                </button>
                                                {/* زر الحذف */}
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
                                                        onClick={() => copyToClipboard(emp.employeeNumber, `num - ${emp.id} `)}
                                                        className="p-1 hover:bg-slate-700 rounded"
                                                    >
                                                        {copiedId === `num - ${emp.id} ` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
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
                                                        onClick={() => copyToClipboard(emp.password, `pass - ${emp.id} `)}
                                                        className="p-1 hover:bg-slate-700 rounded"
                                                    >
                                                        {copiedId === `pass - ${emp.id} ` ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3 text-slate-400" />}
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

                {/* Accounts Management Tab */}
                {activeTab === 'accounts' && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl font-bold text-white flex items-center gap-2">
                                <UserCog className="w-6 h-6 text-purple-400" />
                                {t('إدارة الحسابات', 'Account Management')}
                            </h2>
                            <div className="flex gap-2">
                                {(['all', 'active', 'suspended'] as const).map(filter => (
                                    <button
                                        key={filter}
                                        onClick={() => setAccountsFilter(filter)}
                                        className={`px-3 py-1 rounded-lg text-sm transition-colors ${accountsFilter === filter
                                            ? filter === 'suspended' ? 'bg-red-500 text-white' : 'bg-emerald-500 text-white'
                                            : 'bg-slate-700/50 text-slate-400 hover:text-white'
                                            }`}
                                    >
                                        {filter === 'all' ? t('الكل', 'All') :
                                            filter === 'active' ? t('نشط', 'Active') : t('محظور', 'Suspended')}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {accounts.filter(acc => {
                            if (accountsFilter === 'all') return true;
                            if (accountsFilter === 'suspended') return acc.isSuspended;
                            return !acc.isSuspended;
                        }).length === 0 ? (
                            <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                <Users className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                                <p className="text-slate-400">{t('لا توجد حسابات', 'No accounts found')}</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {accounts.filter(acc => {
                                    if (accountsFilter === 'all') return true;
                                    if (accountsFilter === 'suspended') return acc.isSuspended;
                                    return !acc.isSuspended;
                                }).map(account => {
                                    // حساب مدة الاستخدام
                                    const registerDate = new Date(account.createdAt);
                                    const now = new Date();
                                    const diffTime = Math.abs(now.getTime() - registerDate.getTime());
                                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                                    const usageDuration = diffDays < 30 ? `${diffDays} ${t('يوم', 'days')} ` :
                                        diffDays < 365 ? `${Math.floor(diffDays / 30)} ${t('شهر', 'months')} ` :
                                            `${Math.floor(diffDays / 365)} ${t('سنة', 'years')} `;

                                    return (
                                        <div
                                            key={account.id}
                                            className={`bg-slate-800/50 backdrop-blur-sm rounded-xl p-5 border transition-all ${account.isSuspended
                                                ? 'border-red-500/50 bg-red-500/5'
                                                : 'border-slate-700/50 hover:border-emerald-500/30'
                                                }`}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${account.isSuspended
                                                        ? 'bg-red-500/20 text-red-400'
                                                        : 'bg-emerald-500/20 text-emerald-400'
                                                        }`}>
                                                        {account.userType === 'company' ? <Cloud className="w-7 h-7" /> :
                                                            account.userType === 'supplier' ? <Cloud className="w-7 h-7" /> :
                                                                <Users className="w-7 h-7" />}
                                                    </div>
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                                                            {account.name}
                                                            {account.isSuspended && (
                                                                <span className="px-2 py-0.5 bg-red-500/20 text-red-400 text-xs rounded-full">
                                                                    {account.suspensionType === 'permanent' ? t('محظور دائماً', 'Permanently Suspended') :
                                                                        `${t('محظور', 'Suspended')} - ${account.suspensionDays} ${t('يوم', 'days')} `}
                                                                </span>
                                                            )}
                                                            {account.warnings && account.warnings.length > 0 && !account.isSuspended && (
                                                                <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-400 text-xs rounded-full">
                                                                    {account.warnings.length} {t('تنبيه', 'warnings')}
                                                                </span>
                                                            )}
                                                        </h3>
                                                        <p className="text-slate-400 text-sm">
                                                            {USER_TYPE_TRANSLATIONS[account.userType][language]}
                                                            {account.companyName && ` - ${account.companyName} `}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-2">
                                                    {account.isSuspended ? (
                                                        <button
                                                            onClick={() => {
                                                                registrationService.unsuspendAccount(account.id, 'manager');
                                                                setAccounts(registrationService.getAllApprovedAccounts());
                                                            }}
                                                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center gap-2"
                                                        >
                                                            <Check className="w-4 h-4" />
                                                            {t('إلغاء الحظر', 'Unsuspend')}
                                                        </button>
                                                    ) : (
                                                        <>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedAccount(account);
                                                                    setSuspendForm({ ...suspendForm, actionType: 'warning', reason: '' });
                                                                    setShowSuspendModal(true);
                                                                }}
                                                                className="px-3 py-2 bg-yellow-500/20 text-yellow-400 rounded-lg hover:bg-yellow-500/30 transition-colors flex items-center gap-2"
                                                            >
                                                                <AlertTriangle className="w-4 h-4" />
                                                                {t('تنبيه', 'Warn')}
                                                            </button>
                                                            <button
                                                                onClick={() => {
                                                                    setSelectedAccount(account);
                                                                    setSuspendForm({ ...suspendForm, actionType: 'suspend', reason: '' });
                                                                    setShowSuspendModal(true);
                                                                }}
                                                                className="px-3 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center gap-2"
                                                            >
                                                                <X className="w-4 h-4" />
                                                                {t('حظر', 'Suspend')}
                                                            </button>
                                                        </>
                                                    )}
                                                </div>
                                            </div>

                                            {/* بيانات الحساب التفصيلية */}
                                            <div className="mt-4 grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                                                <div>
                                                    <p className="text-slate-500">{t('البريد الإلكتروني', 'Email')}</p>
                                                    <p className="text-white break-all">{account.email}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500">{t('رقم الجوال', 'Phone')}</p>
                                                    <p className="text-white font-mono" dir="ltr">{account.phone}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500">{t('الخطة', 'Plan')}</p>
                                                    <span className={`px-2 py-1 rounded-full text-xs ${account.plan === 'professional'
                                                        ? 'bg-amber-500/20 text-amber-400'
                                                        : 'bg-slate-500/20 text-slate-400'
                                                        }`}>
                                                        {account.plan === 'professional' ? t('احترافي', 'Professional') : t('مجاني', 'Free')}
                                                    </span>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500">{t('تاريخ التسجيل', 'Registered')}</p>
                                                    <p className="text-white">{new Date(account.createdAt).toLocaleDateString('ar-SA')}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500">{t('مدة الاستخدام', 'Usage Duration')}</p>
                                                    <p className="text-emerald-400 font-bold">{usageDuration}</p>
                                                </div>
                                            </div>

                                            {/* بيانات الشركة الإضافية */}
                                            {(account.userType === 'company' || account.userType === 'supplier') && (
                                                <div className="mt-4 pt-4 border-t border-slate-700/50 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                                    {account.companyName && (
                                                        <div>
                                                            <p className="text-slate-500">{t('اسم الشركة', 'Company Name')}</p>
                                                            <p className="text-white">{account.companyName}</p>
                                                        </div>
                                                    )}
                                                    {account.commercialRegister && (
                                                        <div>
                                                            <p className="text-slate-500">{t('السجل التجاري', 'CR Number')}</p>
                                                            <p className="text-white font-mono">{account.commercialRegister}</p>
                                                        </div>
                                                    )}
                                                    {account.activityType && (
                                                        <div>
                                                            <p className="text-slate-500">{t('نوع النشاط', 'Activity Type')}</p>
                                                            <p className="text-white">{account.activityType}</p>
                                                        </div>
                                                    )}
                                                    <div>
                                                        <p className="text-slate-500">{t('عدد الطباعات', 'Print Jobs')}</p>
                                                        <p className="text-blue-400 font-bold">{Math.floor(Math.random() * 50) + 1}</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* معلومات الحظر */}
                                            {account.isSuspended && account.suspensionReason && (
                                                <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
                                                    <p className="text-red-400 text-sm">
                                                        <strong>{t('سبب الحظر:', 'Suspension Reason:')}</strong> {account.suspensionReason}
                                                    </p>
                                                    <div className="flex gap-4 mt-2 text-xs text-red-400/70">
                                                        <span>{t('تاريخ الحظر:', 'Suspended on:')} {account.suspendedAt && new Date(account.suspendedAt).toLocaleDateString('ar-SA')}</span>
                                                        {account.suspensionEndDate && (
                                                            <span>{t('ينتهي في:', 'Ends on:')} {new Date(account.suspensionEndDate).toLocaleDateString('ar-SA')}</span>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* التنبيهات السابقة */}
                                            {account.warnings && account.warnings.length > 0 && (
                                                <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                                                    <p className="text-yellow-400 text-sm font-semibold mb-2">{t('التنبيهات السابقة:', 'Previous Warnings:')}</p>
                                                    <div className="space-y-1">
                                                        {account.warnings.slice(-3).map(warning => (
                                                            <div key={warning.id} className="text-yellow-400/80 text-xs flex justify-between">
                                                                <span>{warning.message}</span>
                                                                <span>{new Date(warning.sentAt).toLocaleDateString('ar-SA')}</span>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}

                {/* Suspension/Warning Modal */}
                {showSuspendModal && selectedAccount && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
                        <div className="bg-slate-800 rounded-2xl p-6 max-w-lg w-full mx-4 border border-slate-700">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    {suspendForm.actionType === 'suspend' ? (
                                        <><X className="w-6 h-6 text-red-400" /> {t('حظر الحساب', 'Suspend Account')}</>
                                    ) : (
                                        <><AlertTriangle className="w-6 h-6 text-yellow-400" /> {t('إرسال تنبيه', 'Send Warning')}</>
                                    )}
                                </h3>
                                <button onClick={() => setShowSuspendModal(false)} className="text-slate-400 hover:text-white">
                                    <X className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="mb-4 p-3 bg-slate-700/50 rounded-lg">
                                <p className="text-white font-semibold">{selectedAccount.name}</p>
                                <p className="text-slate-400 text-sm">{selectedAccount.email}</p>
                            </div>

                            {/* نوع الإجراء */}
                            <div className="mb-4">
                                <label className="block text-slate-400 text-sm mb-2">{t('نوع الإجراء', 'Action Type')}</label>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setSuspendForm({ ...suspendForm, actionType: 'warning' })}
                                        className={`flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-2 ${suspendForm.actionType === 'warning'
                                            ? 'bg-yellow-500 text-white'
                                            : 'bg-slate-700 text-slate-400'
                                            }`}
                                    >
                                        <AlertTriangle className="w-4 h-4" />
                                        {t('تنبيه فقط', 'Warning Only')}
                                    </button>
                                    <button
                                        onClick={() => setSuspendForm({ ...suspendForm, actionType: 'suspend' })}
                                        className={`flex-1 py-2 rounded-lg text-sm flex items-center justify-center gap-2 ${suspendForm.actionType === 'suspend'
                                            ? 'bg-red-500 text-white'
                                            : 'bg-slate-700 text-slate-400'
                                            }`}
                                    >
                                        <X className="w-4 h-4" />
                                        {t('حظر', 'Suspend')}
                                    </button>
                                </div>
                            </div>

                            {/* مدة الحظر (فقط إذا كان الإجراء حظر) */}
                            {suspendForm.actionType === 'suspend' && (
                                <div className="mb-4">
                                    <label className="block text-slate-400 text-sm mb-2">{t('مدة الحظر', 'Suspension Duration')}</label>
                                    <div className="grid grid-cols-3 gap-2">
                                        <button
                                            onClick={() => setSuspendForm({ ...suspendForm, suspensionType: 'week' })}
                                            className={`py-2 rounded-lg text-sm ${suspendForm.suspensionType === 'week'
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-slate-700 text-slate-400'
                                                }`}
                                        >
                                            {t('أسبوع', 'Week')}
                                        </button>
                                        <button
                                            onClick={() => setSuspendForm({ ...suspendForm, suspensionType: 'custom' })}
                                            className={`py-2 rounded-lg text-sm ${suspendForm.suspensionType === 'custom'
                                                ? 'bg-purple-500 text-white'
                                                : 'bg-slate-700 text-slate-400'
                                                }`}
                                        >
                                            {t('عدد أيام', 'Custom Days')}
                                        </button>
                                        <button
                                            onClick={() => setSuspendForm({ ...suspendForm, suspensionType: 'permanent' })}
                                            className={`py-2 rounded-lg text-sm ${suspendForm.suspensionType === 'permanent'
                                                ? 'bg-red-600 text-white'
                                                : 'bg-slate-700 text-slate-400'
                                                }`}
                                        >
                                            {t('دائم', 'Permanent')}
                                        </button>
                                    </div>

                                    {suspendForm.suspensionType === 'custom' && (
                                        <div className="mt-3">
                                            <input
                                                type="number"
                                                value={suspendForm.customDays}
                                                onChange={(e) => setSuspendForm({ ...suspendForm, customDays: parseInt(e.target.value) || 1 })}
                                                min="1"
                                                max="365"
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-2 text-white"
                                                placeholder={t('عدد الأيام', 'Number of days')}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* السبب/الرسالة */}
                            <div className="mb-6">
                                <label className="block text-slate-400 text-sm mb-2">
                                    {suspendForm.actionType === 'suspend' ? t('سبب الحظر', 'Suspension Reason') : t('رسالة التنبيه', 'Warning Message')} *
                                </label>
                                <textarea
                                    value={suspendForm.reason}
                                    onChange={(e) => setSuspendForm({ ...suspendForm, reason: e.target.value })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg px-4 py-3 text-white resize-none"
                                    rows={3}
                                    placeholder={suspendForm.actionType === 'suspend'
                                        ? t('أدخل سبب الحظر...', 'Enter suspension reason...')
                                        : t('أدخل رسالة التنبيه...', 'Enter warning message...')
                                    }
                                />
                            </div>

                            {/* الأزرار */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowSuspendModal(false)}
                                    className="flex-1 py-3 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600"
                                >
                                    {t('إلغاء', 'Cancel')}
                                </button>
                                <button
                                    onClick={() => {
                                        if (!suspendForm.reason.trim()) {
                                            alert(t('يرجى إدخال السبب', 'Please enter a reason'));
                                            return;
                                        }

                                        if (suspendForm.actionType === 'warning') {
                                            registrationService.sendWarning(selectedAccount.id, suspendForm.reason, 'manager');
                                        } else {
                                            registrationService.suspendAccount(
                                                selectedAccount.id,
                                                suspendForm.reason,
                                                'manager',
                                                suspendForm.suspensionType,
                                                suspendForm.suspensionType === 'custom' ? suspendForm.customDays : undefined
                                            );
                                        }

                                        setAccounts(registrationService.getAllApprovedAccounts());
                                        setShowSuspendModal(false);
                                        setSuspendForm({ actionType: 'suspend', suspensionType: 'permanent', customDays: 7, reason: '' });
                                    }}
                                    disabled={!suspendForm.reason.trim()}
                                    className={`flex-1 py-3 rounded-lg font-medium disabled:opacity-50 ${suspendForm.actionType === 'suspend'
                                        ? 'bg-red-500 text-white hover:bg-red-600'
                                        : 'bg-yellow-500 text-white hover:bg-yellow-600'
                                        }`}
                                >
                                    {suspendForm.actionType === 'suspend' ? t('تنفيذ الحظر', 'Suspend Account') : t('إرسال التنبيه', 'Send Warning')}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Test Mode Tab */}
                {activeTab === 'test_mode' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Play className="w-6 h-6 text-emerald-400" />
                            {t('اختبار الباقات', 'Test Packages')}
                        </h2>
                        <p className="text-slate-400">
                            {t('اختبر البرنامج كما يراه العملاء للتأكد من صحة عمله', 'Test the software as customers see it to verify it works correctly')}
                        </p>

                        {/* Available Packages Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {(['individual', 'company', 'supplier'] as TestUserType[]).map(userType => (
                                <div key={userType} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                                    <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                        {userType === 'individual' && <Users className="w-5 h-5 text-blue-400" />}
                                        {userType === 'company' && <Cloud className="w-5 h-5 text-emerald-400" />}
                                        {userType === 'supplier' && <UserCog className="w-5 h-5 text-amber-400" />}
                                        {TEST_USER_TYPE_TRANSLATIONS[userType][language]}
                                    </h3>

                                    <div className="space-y-2">
                                        {/* عرض الباقات حسب نوع المستخدم */}
                                        {userType === 'individual' && (
                                            <>
                                                {(['free', 'professional'] as PackagePlan[]).map(plan => (
                                                    <button
                                                        key={`${userType}-${plan}`}
                                                        onClick={() => {
                                                            startTestMode('2201187', t('المدير العام', 'General Manager'), plan, userType);
                                                            if (onStartTestMode) {
                                                                onStartTestMode(plan, userType);
                                                            }
                                                        }}
                                                        className="w-full py-2 px-4 bg-slate-700/50 hover:bg-emerald-500/20 border border-slate-600 hover:border-emerald-500/50 rounded-lg text-slate-300 hover:text-white transition-all flex items-center justify-between"
                                                    >
                                                        <span>{PACKAGE_TRANSLATIONS[plan][language]}</span>
                                                        <Play className="w-4 h-4" />
                                                    </button>
                                                ))}
                                            </>
                                        )}
                                        {userType === 'company' && (
                                            <>
                                                {(['free', 'pro'] as PackagePlan[]).map(plan => (
                                                    <button
                                                        key={`${userType}-${plan}`}
                                                        onClick={() => {
                                                            startTestMode('2201187', t('المدير العام', 'General Manager'), plan, userType);
                                                            if (onStartTestMode) {
                                                                onStartTestMode(plan, userType);
                                                            }
                                                        }}
                                                        className="w-full py-2 px-4 bg-slate-700/50 hover:bg-emerald-500/20 border border-slate-600 hover:border-emerald-500/50 rounded-lg text-slate-300 hover:text-white transition-all flex items-center justify-between"
                                                    >
                                                        <span>{PACKAGE_TRANSLATIONS[plan][language]}</span>
                                                        <Play className="w-4 h-4" />
                                                    </button>
                                                ))}
                                            </>
                                        )}
                                        {userType === 'supplier' && (
                                            <button
                                                onClick={() => {
                                                    startTestMode('2201187', t('المدير العام', 'General Manager'), 'network', userType);
                                                    if (onStartTestMode) {
                                                        onStartTestMode('network', userType);
                                                    }
                                                }}
                                                className="w-full py-2 px-4 bg-slate-700/50 hover:bg-emerald-500/20 border border-slate-600 hover:border-emerald-500/50 rounded-lg text-slate-300 hover:text-white transition-all flex items-center justify-between"
                                            >
                                                <span>{PACKAGE_TRANSLATIONS['network'][language]}</span>
                                                <Play className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Employee Permissions Section */}
                        <div className="mt-8">
                            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                                <Key className="w-5 h-5 text-amber-400" />
                                {t('صلاحيات الاختبار للموظفين', 'Employee Test Permissions')}
                            </h3>
                            <p className="text-slate-400 text-sm mb-4">
                                {t('منح أو سحب صلاحيات الاختبار من الموظفين', 'Grant or revoke test permissions from employees')}
                            </p>

                            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
                                <table className="w-full">
                                    <thead className="bg-slate-700/50">
                                        <tr>
                                            <th className="text-start p-4 text-slate-300 font-medium">{t('الموظف', 'Employee')}</th>
                                            <th className="text-center p-4 text-slate-300 font-medium">{t('أفراد', 'Individuals')}</th>
                                            <th className="text-center p-4 text-slate-300 font-medium">{t('شركات', 'Companies')}</th>
                                            <th className="text-center p-4 text-slate-300 font-medium">{t('موردين', 'Suppliers')}</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {employees.map(emp => {
                                            const permissions = getAllTestPermissions()[emp.employeeNumber];
                                            return (
                                                <tr key={emp.id} className="border-t border-slate-700/50 hover:bg-slate-700/30">
                                                    <td className="p-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${ROLE_COLORS[emp.role]} flex items-center justify-center text-white`}>
                                                                {roleIcons[emp.role]}
                                                            </div>
                                                            <div>
                                                                <p className="text-white font-medium">{emp.name}</p>
                                                                <p className="text-slate-400 text-sm">{ROLE_TRANSLATIONS[emp.role][language]}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {(['individual', 'company', 'supplier'] as TestUserType[]).map(userType => {
                                                        const permKey = userType === 'individual' ? 'canTestIndividualPackages'
                                                            : userType === 'company' ? 'canTestCompanyPackages'
                                                                : 'canTestSupplierPackages';
                                                        const hasPermission = permissions?.[permKey] || false;

                                                        return (
                                                            <td key={userType} className="p-4 text-center">
                                                                <button
                                                                    onClick={() => {
                                                                        setEmployeeTestPermissions(
                                                                            emp.employeeNumber,
                                                                            { [permKey]: !hasPermission },
                                                                            '2201187' // Manager's employee number
                                                                        );
                                                                        // Trigger re-render
                                                                        setEmployees([...employees]);
                                                                    }}
                                                                    className={`w-10 h-6 rounded-full transition-all ${hasPermission
                                                                        ? 'bg-emerald-500'
                                                                        : 'bg-slate-600'
                                                                        }`}
                                                                >
                                                                    <div className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${hasPermission
                                                                        ? language === 'ar' ? '-translate-x-4' : 'translate-x-4'
                                                                        : language === 'ar' ? 'translate-x-0' : 'translate-x-0.5'
                                                                        }`} />
                                                                </button>
                                                            </td>
                                                        );
                                                    })}
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}

                {/* Edit Requests Tab */}
                {activeTab === 'edit_requests' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <FileText className="w-6 h-6 text-amber-400" />
                            {t('طلبات تعديل الفواتير', 'Invoice Edit Requests')}
                        </h2>

                        {editRequests.length === 0 ? (
                            <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                                <p className="text-slate-400">{t('لا توجد طلبات تعديل معلقة', 'No pending edit requests')}</p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {editRequests.map(request => (
                                    <div key={request.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-amber-500/30">
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-white">{t('فاتورة رقم', 'Invoice #')} {request.invoiceNumber}</h3>
                                                <p className="text-slate-400 text-sm mt-1">
                                                    {t('طلب بواسطة:', 'Requested by:')} <span className="text-white">{request.requestedByName}</span>
                                                </p>
                                                <p className="text-slate-400 text-sm">
                                                    {t('التاريخ:', 'Date:')} {new Date(request.requestDate).toLocaleDateString('ar-SA')}
                                                </p>
                                            </div>
                                            <span className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-full text-sm">
                                                {t('قيد الانتظار', 'Pending')}
                                            </span>
                                        </div>

                                        <div className="mt-4 p-3 bg-slate-700/30 rounded-lg">
                                            <p className="text-slate-300 text-sm">
                                                <strong>{t('سبب الطلب:', 'Reason:')}</strong> {request.requestReason}
                                            </p>
                                        </div>

                                        <div className="mt-4 flex gap-3">
                                            <button
                                                onClick={() => {
                                                    invoiceEditRequestService.approveRequest(
                                                        request.id,
                                                        'manager',
                                                        t('المدير العام', 'General Manager')
                                                    );
                                                    setEditRequests(invoiceEditRequestService.getPendingRequests());
                                                    alert(t('تمت الموافقة على الطلب - صلاحية 3 أيام', 'Request approved - 3 days validity'));
                                                }}
                                                className="flex-1 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <Check className="w-4 h-4" />
                                                {t('موافقة', 'Approve')}
                                            </button>
                                            <button
                                                onClick={() => {
                                                    const reason = prompt(t('سبب الرفض:', 'Rejection reason:'));
                                                    if (reason) {
                                                        invoiceEditRequestService.rejectRequest(
                                                            request.id,
                                                            'manager',
                                                            t('المدير العام', 'General Manager'),
                                                            reason
                                                        );
                                                        setEditRequests(invoiceEditRequestService.getPendingRequests());
                                                        alert(t('تم رفض الطلب', 'Request rejected'));
                                                    }
                                                }}
                                                className="flex-1 py-2 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-colors flex items-center justify-center gap-2"
                                            >
                                                <X className="w-4 h-4" />
                                                {t('رفض', 'Reject')}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                    <ManagerSettingsTab
                        language={language}
                        t={t}
                        onNavigate={onNavigate}
                    />
                )}
            </div>

            {/* Edit Employee Modal */}
            {showEditModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-xl max-w-2xl w-full border border-slate-700 max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Edit className="w-6 h-6 text-blue-400" />
                                    {t('تعديل بيانات الموظف', 'Edit Employee Data')}
                                </h3>
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="p-2 hover:bg-slate-700 rounded-lg text-slate-400"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <form onSubmit={handleUpdateEmployee} className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-slate-400 mb-2">{t('اسم الموظف', 'Employee Name')} *</label>
                                        <input
                                            type="text"
                                            value={editEmployee.name}
                                            onChange={(e) => setEditEmployee(prev => ({ ...prev, name: e.target.value }))}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 mb-2">{t('البريد الإلكتروني', 'Email')} *</label>
                                        <input
                                            type="email"
                                            value={editEmployee.email}
                                            onChange={(e) => setEditEmployee(prev => ({ ...prev, email: e.target.value }))}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-slate-400 mb-2">{t('الهاتف', 'Phone')}</label>
                                        <input
                                            type="tel"
                                            value={editEmployee.phone}
                                            onChange={(e) => setEditEmployee(prev => ({ ...prev, phone: e.target.value }))}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 mb-2">{t('الدور الوظيفي', 'Role')} *</label>
                                        <select
                                            value={editEmployee.role}
                                            onChange={(e) => setEditEmployee(prev => ({ ...prev, role: e.target.value as EmployeeRole }))}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500"
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
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-slate-400 mb-2">{t('رقم الموظف', 'Employee Number')}</label>
                                            <input
                                                type="text"
                                                value={editEmployee.employeeNumber}
                                                readOnly
                                                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-slate-400 font-mono"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-slate-400 mb-2">{t('الرقم السري', 'Password')}</label>
                                            <input
                                                type="text"
                                                value={editEmployee.password}
                                                onChange={(e) => setEditEmployee(prev => ({ ...prev, password: e.target.value }))}
                                                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-3 text-white font-mono focus:outline-none focus:border-blue-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={editEmployee.isActive}
                                            onChange={(e) => setEditEmployee(prev => ({ ...prev, isActive: e.target.checked }))}
                                            className="w-5 h-5 rounded border-slate-600 text-blue-500 focus:ring-blue-500/50 bg-slate-700"
                                        />
                                        <span className="text-slate-300">{t('حساب نشط', 'Active Account')}</span>
                                    </label>
                                </div>

                                <div className="pt-4 flex gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowEditModal(false)}
                                        className="flex-1 py-3 bg-slate-700 text-white font-medium rounded-lg hover:bg-slate-600 transition-all"
                                    >
                                        {t('إلغاء', 'Cancel')}
                                    </button>
                                    <button
                                        type="submit"
                                        className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-medium rounded-lg hover:from-blue-600 hover:to-indigo-600 transition-all flex items-center justify-center gap-2"
                                    >
                                        <Save className="w-5 h-5" />
                                        {t('حفظ التغييرات', 'Save Changes')}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ManagerDashboard;
