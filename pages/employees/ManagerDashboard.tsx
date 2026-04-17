/**
 * لوحة تحكم المدير
 * Manager Dashboard
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Crown, Users, UserPlus, Settings, LogOut, Home, LogIn,
    Calculator, Code, Headphones, Megaphone, CheckCircle,
    UserCog, Edit, Trash2, Key, Mail, Phone, Eye, EyeOff, Save,
    Copy, Check, AlertCircle, AlertTriangle, X, Search, Filter, Cloud, FileText, Clock,
    Play, ClipboardCheck, TrendingUp, Shield, Activity, BarChart3, ArrowUpRight, Sparkles,
    Bell, BellRing
} from 'lucide-react';
import {
    Employee, EmployeeRole, employeeService,
    ROLE_TRANSLATIONS, ROLE_COLORS, MANAGER_CREDENTIALS, getManagerCredentials, updateManagerCredentials,
    loadEmployeesFromFirestore, loadManagerCredentialsFromFirestore
} from '../../services/employeeService';
import { invoiceEditRequestService, InvoiceEditRequest, EDIT_REQUEST_STATUS_TRANSLATIONS } from '../../services/invoiceEditRequestService';
import { registrationService, RegistrationRequest, USER_TYPE_TRANSLATIONS, REGISTRATION_STATUS_TRANSLATIONS } from '../../services/registrationService';
import { supportTicketService, SupportTicket, Attachment } from '../../services/supportTicketService';
import { notificationService, AppNotification, NOTIFICATION_TYPE_TRANSLATIONS } from '../../services/notificationService';
import { Language } from '../../types';
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
    language: Language;
    onLogout: () => void;
    onNavigate: (page: string) => void;
    onStartTestMode?: (plan: string, userType: string) => void;
}

// ================= Manager Settings Tab Component =================
interface ManagerSettingsTabProps {
    language: Language;
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
    const [activeTab, setActiveTab] = useState<'overview' | 'employees' | 'add' | 'accounts' | 'edit_requests' | 'support_tickets' | 'test_mode' | 'settings'>('overview');
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [editRequests, setEditRequests] = useState<InvoiceEditRequest[]>([]);
    const [accounts, setAccounts] = useState<RegistrationRequest[]>([]);
    const [supportTickets, setSupportTickets] = useState<SupportTicket[]>([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterRole, setFilterRole] = useState<EmployeeRole | 'all'>('all');
    const [showPassword, setShowPassword] = useState<Record<string, boolean>>({});
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [accountsFilter, setAccountsFilter] = useState<'all' | 'active' | 'suspended'>('all');

    // Support tickets state
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [ticketReply, setTicketReply] = useState('');

    // Notification state
    const [notifications, setNotifications] = useState<AppNotification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifications, setShowNotifications] = useState(false);

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
            // Use employeeService.updateEmployee to persist properly (localStorage + Firestore)
            employeeService.updateEmployee(editEmployee.id, editEmployee);
            setEmployees(employeeService.getEmployees());

            setShowEditModal(false);
            setFormSuccess(t('تم تحديث البيانات بنجاح', 'Employee updated successfully'));
            setTimeout(() => setFormSuccess(''), 3000);
        } catch (error) {
            setFormError(t('حدث خطأ أثناء التحديث', 'Error updating employee'));
        }
    };
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');


    const loadData = async () => {
        // Load employees from Firestore first, then fallback to localStorage
        const firestoreEmployees = await loadEmployeesFromFirestore();
        setEmployees(firestoreEmployees);
        setEditRequests(invoiceEditRequestService.getRequests());
        setAccounts(registrationService.getRequests());
        setSupportTickets(supportTicketService.getTicketsByRoute('admin'));
        // Also load manager credentials from Firestore
        await loadManagerCredentialsFromFirestore();
    };

    // تحميل الموظفين وطلبات التعديل والحسابات
    useEffect(() => {
        loadData();
    }, []);

    // Notification polling (every 15 seconds)
    const loadNotifications = useCallback(() => {
        const notifs = notificationService.getNotifications('manager');
        setNotifications(notifs);
        setUnreadCount(notificationService.getUnreadCount('manager'));
    }, []);

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 15000);
        return () => clearInterval(interval);
    }, [loadNotifications]);

    // توليد بيانات عشوائية
    const handleGenerateDemoData = () => {
        loadData();
    };

    const handleTicketReply = () => {
        if (!selectedTicket || !ticketReply.trim()) return;

        const updatedTicket = supportTicketService.addResponse(selectedTicket.id, {
            responderId: 'manager',
            responderName: t('المدير العام', 'General Manager'),
            responderRole: 'admin',
            message: ticketReply.trim(),
            isInternal: false
        });

        if (updatedTicket) {
            setTicketReply('');
            setSelectedTicket(updatedTicket);
            loadData(); // To refresh tickets list
        }
    };

    const handleCloseTicket = (ticketId: string) => {
        supportTicketService.updateStatus(ticketId, 'closed');
        setSelectedTicket(null);
        loadData();
    };
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
            setFormError(t('جميع الحقول مطلوبة', 'All fields are required'));
            return;
        }

        try {
            employeeService.addEmployee(newEmployee);
            setEmployees(employeeService.getEmployees());
            setFormSuccess(t('تم إضافة الموظف بنجاح', 'Employee added successfully'));
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
        if (confirm(t('هل أنت متأكد من حذف هذا الموظف؟', 'Are you sure you want to delete this employee?'))) {
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

    const t = (ar: string, en: string) => { const map: Record<string, string> = { ar, en, fr: en, zh: en }; return map[language] || en; };

    const roleIcons: Record<EmployeeRole, React.ReactNode> = {
        manager: <Crown className="w-6 h-6" />,
        deputy: <UserCog className="w-6 h-6" />,
        accountant: <Calculator className="w-6 h-6" />,
        hr: <Users className="w-6 h-6" />,
        developer: <Code className="w-6 h-6" />,
        support: <Headphones className="w-6 h-6" />,
        marketing: <Megaphone className="w-6 h-6" />,
        quality: <CheckCircle className="w-6 h-6" />,
        quantity_surveyor: <ClipboardCheck className="w-6 h-6" />
    };

    // Premium glow colors for each role (used for accent stripe & icon glow)
    const roleGlowColors: Record<EmployeeRole, { glow: string; border: string; text: string; bg: string }> = {
        manager: { glow: 'shadow-amber-500/40', border: 'border-amber-500/30', text: 'text-amber-400', bg: 'bg-amber-500/15' },
        deputy: { glow: 'shadow-purple-500/40', border: 'border-purple-500/30', text: 'text-purple-400', bg: 'bg-purple-500/15' },
        accountant: { glow: 'shadow-emerald-500/40', border: 'border-emerald-500/30', text: 'text-emerald-400', bg: 'bg-emerald-500/15' },
        hr: { glow: 'shadow-blue-500/40', border: 'border-blue-500/30', text: 'text-blue-400', bg: 'bg-blue-500/15' },
        developer: { glow: 'shadow-violet-500/40', border: 'border-violet-500/30', text: 'text-violet-400', bg: 'bg-violet-500/15' },
        support: { glow: 'shadow-orange-500/40', border: 'border-orange-500/30', text: 'text-orange-400', bg: 'bg-orange-500/15' },
        marketing: { glow: 'shadow-pink-500/40', border: 'border-pink-500/30', text: 'text-pink-400', bg: 'bg-pink-500/15' },
        quality: { glow: 'shadow-lime-500/40', border: 'border-lime-500/30', text: 'text-lime-400', bg: 'bg-lime-500/15' },
        quantity_surveyor: { glow: 'shadow-sky-500/40', border: 'border-sky-500/30', text: 'text-sky-400', bg: 'bg-sky-500/15' },
    };

    return (
        <div className="min-h-screen bg-[#0a0e1a]" dir={isRtl ? 'rtl' : 'ltr'}
             style={{ background: 'linear-gradient(135deg, #0a0e1a 0%, #111827 40%, #0f172a 70%, #0a0e1a 100%)' }}>
            {/* ============ PREMIUM HEADER ============ */}
            <header className="sticky top-0 z-50" style={{
                background: 'rgba(15, 23, 42, 0.75)',
                backdropFilter: 'blur(20px) saturate(180%)',
                WebkitBackdropFilter: 'blur(20px) saturate(180%)',
                borderBottom: '1px solid rgba(148, 163, 184, 0.08)'
            }}>
                <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {/* Premium Crown Badge */}
                        <div className="relative">
                            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
                                 style={{ background: 'linear-gradient(135deg, #f59e0b 0%, #d97706 50%, #b45309 100%)', boxShadow: '0 0 24px rgba(245, 158, 11, 0.3)' }}>
                                <Crown className="w-6 h-6 text-white" />
                            </div>
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#0f172a] flex items-center justify-center">
                                <Sparkles className="w-2.5 h-2.5 text-white" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-white tracking-tight">{t('لوحة تحكم المدير', 'Manager Dashboard')}</h1>
                            <p className="text-slate-500 text-xs font-medium">{MANAGER_CREDENTIALS.name} • {t('مدير عام', 'General Manager')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {/* Notification Bell */}
                        <div className="relative">
                            <button
                                onClick={() => { setShowNotifications(!showNotifications); loadNotifications(); }}
                                className={`relative p-2.5 rounded-xl transition-all duration-300 ${
                                    unreadCount > 0 ? 'text-amber-400 hover:bg-amber-500/10' : 'text-slate-500 hover:text-slate-300 hover:bg-slate-700/30'
                                }`}
                                title={t('الإشعارات', 'Notifications')}
                            >
                                {unreadCount > 0 ? <BellRing className="w-5 h-5" /> : <Bell className="w-5 h-5" />}
                                {unreadCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold text-white rounded-full px-1"
                                          style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 0 8px rgba(239,68,68,0.5)' }}>
                                        {unreadCount > 9 ? '9+' : unreadCount}
                                    </span>
                                )}
                            </button>

                            {/* Notifications Dropdown */}
                            {showNotifications && (
                                <div className="absolute top-full mt-2 w-96 max-h-96 overflow-y-auto rounded-2xl z-[100]"
                                     style={{
                                         background: 'rgba(15, 23, 42, 0.95)',
                                         backdropFilter: 'blur(20px)',
                                         border: '1px solid rgba(148, 163, 184, 0.12)',
                                         boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                                         [isRtl ? 'left' : 'right']: 0
                                     }}>
                                    <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
                                        <h3 className="text-white font-semibold text-sm">{t('الإشعارات', 'Notifications')}</h3>
                                        <div className="flex items-center gap-2">
                                            {unreadCount > 0 && (
                                                <button
                                                    onClick={() => { notificationService.markAllAsRead('manager'); loadNotifications(); }}
                                                    className="text-xs text-emerald-400 hover:text-emerald-300 transition-colors"
                                                >
                                                    {t('تحديد الكل كمقروء', 'Mark all read')}
                                                </button>
                                            )}
                                            <button onClick={() => setShowNotifications(false)} className="text-slate-500 hover:text-white">
                                                <X className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                    {notifications.length === 0 ? (
                                        <div className="p-8 text-center">
                                            <Bell className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                                            <p className="text-slate-500 text-sm">{t('لا توجد إشعارات', 'No notifications')}</p>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-slate-700/30">
                                            {notifications.slice(0, 15).map(notif => (
                                                <div
                                                    key={notif.id}
                                                    onClick={() => { notificationService.markAsRead(notif.id); loadNotifications(); }}
                                                    className={`p-3 cursor-pointer transition-colors duration-200 ${
                                                        !notif.isRead ? 'bg-emerald-500/5 hover:bg-emerald-500/10' : 'hover:bg-slate-800/50'
                                                    }`}
                                                >
                                                    <div className="flex items-start gap-3">
                                                        <div className={`mt-0.5 w-2 h-2 rounded-full flex-shrink-0 ${!notif.isRead ? 'bg-emerald-400' : 'bg-transparent'}`} />
                                                        <div className="flex-1 min-w-0">
                                                            <p className={`text-sm font-medium truncate ${!notif.isRead ? 'text-white' : 'text-slate-400'}`}>
                                                                {notif.title}
                                                            </p>
                                                            <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{notif.message}</p>
                                                            <p className="text-[10px] text-slate-600 mt-1">
                                                                {new Date(notif.createdAt).toLocaleString('ar-SA', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' })}
                                                            </p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                        <button
                            onClick={() => onNavigate('landing')}
                            className="p-2.5 text-slate-500 hover:text-emerald-400 rounded-xl transition-all duration-300 hover:bg-emerald-500/10"
                            title={t('الصفحة الرئيسية', 'Home')}
                        >
                            <Home className="w-5 h-5" />
                        </button>
                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-300 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 border border-transparent hover:border-red-500/20"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="text-sm font-medium">{t('خروج', 'Logout')}</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-7xl mx-auto px-6 py-6">
                {/* ============ PREMIUM TABS NAVIGATION ============ */}
                <div className="mb-8 overflow-x-auto scrollbar-hide">
                    <div className="inline-flex gap-1 p-1.5 rounded-2xl" style={{
                        background: 'rgba(30, 41, 59, 0.5)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(148, 163, 184, 0.08)'
                    }}>
                        {[
                            { id: 'overview', label: t('نظرة عامة', 'Overview'), icon: <BarChart3 className="w-4 h-4" /> },
                            { id: 'employees', label: t('الموظفين', 'Employees'), icon: <Users className="w-4 h-4" /> },
                            { id: 'add', label: t('إضافة موظف', 'Add'), icon: <UserPlus className="w-4 h-4" /> },
                            { id: 'accounts', label: t('الحسابات', 'Accounts'), icon: <UserCog className="w-4 h-4" />, badge: accounts.filter(a => a.isSuspended).length },
                            { id: 'edit_requests', label: t('الطلبات', 'Requests'), icon: <FileText className="w-4 h-4" />, badge: editRequests.length },
                            { id: 'support_tickets', label: t('الدعم', 'Support'), icon: <Headphones className="w-4 h-4" />, badge: supportTickets.filter(r => r.status === 'open' || r.status === 'waiting_response').length },
                            { id: 'test_mode', label: t('الاختبار', 'Test'), icon: <Play className="w-4 h-4" /> },
                            { id: 'settings', label: t('الإعدادات', 'Settings'), icon: <Settings className="w-4 h-4" /> }
                        ].map(tab => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-300 whitespace-nowrap ${
                                    activeTab === tab.id
                                        ? 'text-white'
                                        : 'text-slate-500 hover:text-slate-300'
                                }`}
                                style={activeTab === tab.id ? {
                                    background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.2) 0%, rgba(6, 182, 212, 0.15) 100%)',
                                    boxShadow: '0 0 20px rgba(16, 185, 129, 0.15), inset 0 1px 0 rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(16, 185, 129, 0.25)'
                                } : { border: '1px solid transparent' }}
                            >
                                {tab.icon}
                                <span>{tab.label}</span>
                                {(tab as any).badge > 0 && (
                                    <span className="min-w-[18px] h-[18px] flex items-center justify-center text-[10px] font-bold rounded-full px-1"
                                          style={{ background: 'linear-gradient(135deg, #ef4444, #dc2626)', boxShadow: '0 0 8px rgba(239, 68, 68, 0.4)' }}>
                                        {(tab as any).badge}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ============ OVERVIEW TAB - PREMIUM ============ */}
                {activeTab === 'overview' && (
                    <div className="space-y-8">
                        {/* ---- Top Stats Row ---- */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                            {/* Total Employees */}
                            <div className="group relative rounded-2xl p-5 transition-all duration-500 hover:-translate-y-1 cursor-default" style={{
                                background: 'rgba(30, 41, 59, 0.4)',
                                backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(148, 163, 184, 0.08)',
                                boxShadow: '0 4px 24px rgba(0,0,0,0.2)'
                            }}>
                                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{boxShadow: '0 0 40px rgba(16, 185, 129, 0.1)'}} />
                                <div className="relative flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wider">{t('إجمالي الموظفين', 'Total Employees')}</p>
                                        <p className="text-4xl font-black text-white tracking-tight">{stats.total}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(16, 185, 129, 0.12)' }}>
                                        <Users className="w-6 h-6 text-emerald-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Active */}
                            <div className="group relative rounded-2xl p-5 transition-all duration-500 hover:-translate-y-1 cursor-default" style={{
                                background: 'rgba(30, 41, 59, 0.4)',
                                backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(148, 163, 184, 0.08)',
                                boxShadow: '0 4px 24px rgba(0,0,0,0.2)'
                            }}>
                                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{boxShadow: '0 0 40px rgba(34, 197, 94, 0.1)'}} />
                                <div className="relative flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wider">{t('نشط', 'Active')}</p>
                                        <p className="text-4xl font-black text-white tracking-tight">{stats.active}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(34, 197, 94, 0.12)' }}>
                                        <Activity className="w-6 h-6 text-green-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Open Support Tickets */}
                            <div className="group relative rounded-2xl p-5 transition-all duration-500 hover:-translate-y-1 cursor-pointer"
                                 onClick={() => setActiveTab('support_tickets')}
                                 style={{
                                background: 'rgba(30, 41, 59, 0.4)',
                                backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(148, 163, 184, 0.08)',
                                boxShadow: '0 4px 24px rgba(0,0,0,0.2)'
                            }}>
                                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{boxShadow: '0 0 40px rgba(249, 115, 22, 0.1)'}} />
                                <div className="relative flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wider">{t('تذاكر مفتوحة', 'Open Tickets')}</p>
                                        <p className="text-4xl font-black text-white tracking-tight">{supportTickets.filter(r => r.status === 'open' || r.status === 'waiting_response').length}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(249, 115, 22, 0.12)' }}>
                                        <Headphones className="w-6 h-6 text-orange-400" />
                                    </div>
                                </div>
                            </div>

                            {/* Edit Requests */}
                            <div className="group relative rounded-2xl p-5 transition-all duration-500 hover:-translate-y-1 cursor-pointer"
                                 onClick={() => setActiveTab('edit_requests')}
                                 style={{
                                background: 'rgba(30, 41, 59, 0.4)',
                                backdropFilter: 'blur(16px)',
                                border: '1px solid rgba(148, 163, 184, 0.08)',
                                boxShadow: '0 4px 24px rgba(0,0,0,0.2)'
                            }}>
                                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{boxShadow: '0 0 40px rgba(139, 92, 246, 0.1)'}} />
                                <div className="relative flex items-center justify-between">
                                    <div>
                                        <p className="text-slate-500 text-xs font-medium mb-1 uppercase tracking-wider">{t('طلبات التعديل', 'Edit Requests')}</p>
                                        <p className="text-4xl font-black text-white tracking-tight">{editRequests.length}</p>
                                    </div>
                                    <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ background: 'rgba(139, 92, 246, 0.12)' }}>
                                        <FileText className="w-6 h-6 text-violet-400" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* ---- Section Title ---- */}
                        <div className="flex items-center gap-3">
                            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.15), transparent)' }} />
                            <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-widest">{t('الأقسام', 'Departments')}</h2>
                            <div className="h-px flex-1" style={{ background: 'linear-gradient(90deg, transparent, rgba(148, 163, 184, 0.15), transparent)' }} />
                        </div>

                        {/* ---- Department Roles Grid ---- */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {(Object.keys(ROLE_TRANSLATIONS) as EmployeeRole[]).filter(r => r !== 'manager').map(role => {
                                const colors = roleGlowColors[role];
                                return (
                                    <div
                                        key={role}
                                        className={`group relative rounded-2xl p-5 cursor-pointer transition-all duration-500 hover:-translate-y-1.5 overflow-hidden`}
                                        style={{
                                            background: 'rgba(30, 41, 59, 0.35)',
                                            backdropFilter: 'blur(16px)',
                                            border: '1px solid rgba(148, 163, 184, 0.08)',
                                            boxShadow: '0 4px 24px rgba(0,0,0,0.15)'
                                        }}
                                        onClick={() => {
                                            if (role === 'hr') onNavigate('hr');
                                            else if (role === 'accountant') onNavigate('accountant');
                                            else if (role === 'support') onNavigate('support');
                                            else if (role === 'developer') onNavigate('developer');
                                            else if (role === 'marketing') onNavigate('marketing');
                                            else if (role === 'quality') onNavigate('quality');
                                            else if (role === 'deputy') onNavigate('deputy');
                                            else { setFilterRole(role); setActiveTab('employees'); }
                                        }}
                                    >
                                        {/* Glow accent stripe */}
                                        <div className={`absolute ${isRtl ? 'right-0' : 'left-0'} top-0 bottom-0 w-1 rounded-full transition-all duration-500 opacity-50 group-hover:opacity-100`}
                                             style={{ background: `var(--stripe-color-${role})` }} />
                                        <style>{`
                                            :root {
                                                --stripe-color-deputy: #a855f7;
                                                --stripe-color-accountant: #10b981;
                                                --stripe-color-hr: #3b82f6;
                                                --stripe-color-developer: #8b5cf6;
                                                --stripe-color-support: #f97316;
                                                --stripe-color-marketing: #ec4899;
                                                --stripe-color-quality: #84cc16;
                                                --stripe-color-quantity_surveyor: #0ea5e9;
                                            }
                                        `}</style>

                                        {/* Hover glow background */}
                                        <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                                             style={{ background: `radial-gradient(circle at ${isRtl ? '90%' : '10%'} 30%, var(--stripe-color-${role})15, transparent 60%)` }} />

                                        <div className="relative flex items-center gap-4">
                                            {/* Icon with glow */}
                                            <div className={`w-12 h-12 rounded-2xl ${colors.bg} flex items-center justify-center ${colors.text} transition-all duration-500 group-hover:scale-110`}
                                                 style={{ boxShadow: 'none' }}>
                                                {roleIcons[role]}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-3xl font-black text-white tracking-tight">{stats.byRole[role] || 0}</p>
                                                <p className="text-slate-500 text-sm font-medium truncate group-hover:text-slate-300 transition-colors duration-300">{ROLE_TRANSLATIONS[role][language]}</p>
                                            </div>
                                            <ArrowUpRight className="w-4 h-4 text-slate-600 opacity-0 group-hover:opacity-100 transition-all duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                                        </div>
                                    </div>
                                );
                            })}
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
                                                                        ? t('-translate-x-4', 'translate-x-4')
                                                                        : t('translate-x-0', 'translate-x-0.5')
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

                {/* Support Tickets Tab */}
                {activeTab === 'support_tickets' && (
                    <div className="space-y-6">
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Headphones className="w-6 h-6 text-purple-400" />
                            {t('تذاكر الدعم الموجهة للإدارة', 'Support Tickets Escalated To Admin')}
                        </h2>

                        {!selectedTicket ? (
                            supportTickets.length === 0 ? (
                                <div className="text-center py-12 bg-slate-800/50 rounded-xl border border-slate-700/50">
                                    <CheckCircle className="w-12 h-12 text-green-400 mx-auto mb-3" />
                                    <p className="text-slate-400">{t('لا توجد تذاكر دعم معلقة', 'No pending support tickets')}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {supportTickets.map(ticket => (
                                        <div key={ticket.id} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-purple-500/30">
                                            <div className="flex items-start justify-between">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-white">
                                                        {ticket.ticketNumber} - {ticket.subject}
                                                    </h3>
                                                    <p className="text-slate-400 text-sm mt-1">
                                                        {t('بواسطة:', 'By:')} <span className="text-white">{ticket.userName}</span>
                                                    </p>
                                                    <p className="text-slate-400 text-sm">
                                                        {t('التاريخ:', 'Date:')} {ticket.createdAt ? new Date(ticket.createdAt).toLocaleDateString('ar-SA') : t('غير متوفر', 'N/A')}
                                                    </p>
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className={`px-3 py-1 rounded-full text-sm ${ticket.status === 'open' ? 'bg-amber-500/20 text-amber-400' :
                                                            ticket.status === 'in_progress' ? 'bg-blue-500/20 text-blue-400' :
                                                                ticket.status === 'waiting_response' ? 'bg-orange-500/20 text-orange-400' :
                                                                    'bg-green-500/20 text-green-400'
                                                        }`}>
                                                        {ticket.status}
                                                    </span>
                                                    <button
                                                        onClick={() => setSelectedTicket(ticket)}
                                                        className="px-4 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg hover:bg-purple-500/30 transition-colors text-sm"
                                                    >
                                                        {t('عرض التفاصيل', 'View Details')}
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )
                        ) : (
                            <div className="space-y-6">
                                <button
                                    onClick={() => setSelectedTicket(null)}
                                    className="px-4 py-2 bg-slate-800 text-slate-300 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    {t('رجوع للقائمة', 'Back to list')}
                                </button>
                                
                                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700">
                                    <h3 className="text-xl font-bold text-white mb-2">{selectedTicket.ticketNumber} - {selectedTicket.subject}</h3>
                                    <div className="p-4 bg-slate-900/50 rounded-lg border border-slate-700/50 mb-6">
                                        <p className="text-slate-300 whitespace-pre-wrap">{selectedTicket.description}</p>
                                        
                                        {selectedTicket.attachments && selectedTicket.attachments.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-slate-700/50">
                                                <h4 className="text-sm font-semibold text-slate-400 mb-2">{t('المرفقات', 'Attachments')}:</h4>
                                                <div className="flex flex-wrap gap-2">
                                                    {selectedTicket.attachments.map((att, i) => (
                                                        <a
                                                            key={i}
                                                            href={att.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="px-3 py-1.5 bg-slate-800 border border-slate-600 rounded-lg text-sm text-blue-400 hover:text-blue-300 flex items-center gap-2"
                                                        >
                                                            {att.type === 'image' ? <Eye className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                                                            {att.name}
                                                        </a>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    
                                    <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                                        {(selectedTicket.responses || []).map(res => (
                                            <div key={res.id} className={`p-4 rounded-xl ${res.responderRole === 'user' ? 'bg-slate-700/50 ml-8' : 'bg-purple-900/20 border border-purple-500/20 mr-8'}`}>
                                                <div className="flex justify-between items-start mb-2">
                                                    <span className={`font-semibold text-sm ${res.responderRole === 'user' ? 'text-white' : 'text-purple-400'}`}>
                                                        {res.responderName}
                                                        {res.responderRole !== 'user' && ` (${t('الإدارة', 'Admin')})`}
                                                    </span>
                                                    <span className="text-xs text-slate-500">{res.createdAt ? new Date(res.createdAt).toLocaleString('ar-SA') : ''}</span>
                                                </div>
                                                <p className="text-slate-300 text-sm whitespace-pre-wrap">{res.message}</p>
                                            </div>
                                        ))}
                                    </div>
                                    
                                    {selectedTicket.status !== 'closed' && (
                                        <div className="space-y-4 pt-4 border-t border-slate-700">
                                            <textarea
                                                value={ticketReply}
                                                onChange={(e) => setTicketReply(e.target.value)}
                                                placeholder={t('اكتب ردك هنا...', 'Write your reply here...')}
                                                className="w-full h-32 bg-slate-900 border border-slate-600 rounded-xl p-4 text-white placeholder-slate-500 focus:border-purple-500 focus:outline-none resize-none"
                                            />
                                            <div className="flex gap-3 justify-end">
                                                <button
                                                    onClick={() => handleCloseTicket(selectedTicket.id)}
                                                    className="px-6 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
                                                >
                                                    {t('إغلاق التذكرة', 'Close Ticket')}
                                                </button>
                                                <button
                                                    onClick={handleTicketReply}
                                                    disabled={!ticketReply.trim()}
                                                    className="px-6 py-2 bg-gradient-to-r from-purple-500 to-purple-600 text-white font-medium rounded-lg hover:from-purple-600 hover:to-purple-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {t('إرسال الرد', 'Send Reply')}
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
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
