import React, { useState } from 'react';
import {
    Users,
    Plus,
    Edit3,
    Trash2,
    Check,
    X,
    Mail,
    Phone,
    Shield,
    ChevronDown,
    ChevronUp,
    UserPlus,
    Eye,
    EyeOff,
    Send,
    Clock,
    AlertCircle
} from 'lucide-react';
import {
    SupplierEmployee,
    EmployeeRole,
    EmployeePermission,
    ROLE_PERMISSIONS,
    EMPLOYEE_ROLE_TRANSLATIONS,
    PERMISSION_TRANSLATIONS
} from '../services/supplierManagementService';

interface SupplierEmployeeManagerProps {
    language: 'ar' | 'en';
    employees: SupplierEmployee[];
    onUpdate: (employees: SupplierEmployee[]) => void;
    readOnly?: boolean;
}

const SupplierEmployeeManager: React.FC<SupplierEmployeeManagerProps> = ({
    language,
    employees,
    onUpdate,
    readOnly = false
}) => {
    const isRtl = language === 'ar';
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingEmployee, setEditingEmployee] = useState<SupplierEmployee | null>(null);
    const [showPermissions, setShowPermissions] = useState<string | null>(null);

    const [formData, setFormData] = useState<Partial<SupplierEmployee>>({
        name: '',
        email: '',
        phone: '',
        jobTitle: '',
        role: 'view_only',
        permissions: [],
        receiveOrderNotifications: true,
        receivePriceConfirmNotifications: true,
        receiveWeeklyReports: false
    });

    const t = {
        employees: { ar: 'موظفي الشركة', en: 'Company Employees' },
        addEmployee: { ar: 'إضافة موظف', en: 'Add Employee' },
        editEmployee: { ar: 'تعديل موظف', en: 'Edit Employee' },
        name: { ar: 'الاسم الكامل', en: 'Full Name' },
        email: { ar: 'البريد الإلكتروني', en: 'Email' },
        phone: { ar: 'رقم الجوال', en: 'Phone' },
        jobTitle: { ar: 'المسمى الوظيفي', en: 'Job Title' },
        role: { ar: 'الصلاحية', en: 'Role' },
        permissions: { ar: 'الصلاحيات', en: 'Permissions' },
        status: { ar: 'الحالة', en: 'Status' },
        actions: { ar: 'إجراءات', en: 'Actions' },
        save: { ar: 'حفظ', en: 'Save' },
        cancel: { ar: 'إلغاء', en: 'Cancel' },
        delete: { ar: 'حذف', en: 'Delete' },
        active: { ar: 'نشط', en: 'Active' },
        inactive: { ar: 'غير نشط', en: 'Inactive' },
        pending: { ar: 'بانتظار التفعيل', en: 'Pending Activation' },
        sendInvite: { ar: 'إرسال دعوة', en: 'Send Invite' },
        resendInvite: { ar: 'إعادة الدعوة', en: 'Resend Invite' },
        customPermissions: { ar: 'صلاحيات مخصصة', en: 'Custom Permissions' },
        selectRole: { ar: 'اختر مستوى الصلاحية', en: 'Select Permission Level' },
        notifications: { ar: 'الإشعارات', en: 'Notifications' },
        orderNotifications: { ar: 'إشعارات الطلبات الجديدة', en: 'New Order Notifications' },
        priceConfirmNotifications: { ar: 'إشعارات طلبات تأكيد السعر', en: 'Price Confirm Notifications' },
        weeklyReports: { ar: 'التقارير الأسبوعية', en: 'Weekly Reports' },
        // Permission Groups
        productPermissions: { ar: 'إدارة المنتجات', en: 'Product Management' },
        orderPermissions: { ar: 'الطلبات والمبيعات', en: 'Orders & Sales' },
        financePermissions: { ar: 'المالية والتقارير', en: 'Finance & Reports' },
        settingsPermissions: { ar: 'الإعدادات', en: 'Settings' },
        lastLogin: { ar: 'آخر دخول', en: 'Last Login' },
        never: { ar: 'لم يسجل دخول', en: 'Never' },
        inviteSent: { ar: 'أرسلت الدعوة', en: 'Invite Sent' }
    };

    const getLabel = (key: keyof typeof t) => t[key][language];

    const permissionGroups = {
        productPermissions: ['view_products', 'add_products', 'edit_products', 'delete_products', 'edit_prices'] as EmployeePermission[],
        orderPermissions: ['view_orders', 'respond_orders', 'confirm_prices', 'issue_invoices'] as EmployeePermission[],
        financePermissions: ['view_reports', 'view_payments', 'download_invoices'] as EmployeePermission[],
        settingsPermissions: ['edit_company', 'manage_employees', 'edit_terms'] as EmployeePermission[]
    };

    const handleRoleChange = (role: EmployeeRole) => {
        if (role === 'custom') {
            setFormData({ ...formData, role, permissions: [] });
        } else {
            setFormData({ ...formData, role, permissions: ROLE_PERMISSIONS[role] });
        }
    };

    const togglePermission = (permission: EmployeePermission) => {
        const currentPermissions = formData.permissions || [];
        if (currentPermissions.includes(permission)) {
            setFormData({
                ...formData,
                role: 'custom',
                permissions: currentPermissions.filter(p => p !== permission)
            });
        } else {
            setFormData({
                ...formData,
                role: 'custom',
                permissions: [...currentPermissions, permission]
            });
        }
    };

    const handleSave = () => {
        if (!formData.name || !formData.email) return;

        if (editingEmployee) {
            onUpdate(employees.map(e =>
                e.id === editingEmployee.id
                    ? { ...e, ...formData } as SupplierEmployee
                    : e
            ));
        } else {
            const newEmployee: SupplierEmployee = {
                id: `emp_${Date.now()}`,
                name: formData.name!,
                email: formData.email!,
                phone: formData.phone,
                jobTitle: formData.jobTitle,
                role: formData.role!,
                permissions: formData.permissions!,
                status: 'pending',
                createdAt: new Date().toISOString(),
                invitedAt: new Date().toISOString(),
                receiveOrderNotifications: formData.receiveOrderNotifications!,
                receivePriceConfirmNotifications: formData.receivePriceConfirmNotifications!,
                receiveWeeklyReports: formData.receiveWeeklyReports!
            };
            onUpdate([...employees, newEmployee]);
        }

        setShowAddModal(false);
        setEditingEmployee(null);
        resetForm();
    };

    const handleDelete = (id: string) => {
        onUpdate(employees.filter(e => e.id !== id));
    };

    const resetForm = () => {
        setFormData({
            name: '',
            email: '',
            phone: '',
            jobTitle: '',
            role: 'view_only',
            permissions: ROLE_PERMISSIONS.view_only,
            receiveOrderNotifications: true,
            receivePriceConfirmNotifications: true,
            receiveWeeklyReports: false
        });
    };

    const openEditModal = (employee: SupplierEmployee) => {
        setEditingEmployee(employee);
        setFormData({
            name: employee.name,
            email: employee.email,
            phone: employee.phone,
            jobTitle: employee.jobTitle,
            role: employee.role,
            permissions: employee.permissions,
            receiveOrderNotifications: employee.receiveOrderNotifications,
            receivePriceConfirmNotifications: employee.receivePriceConfirmNotifications,
            receiveWeeklyReports: employee.receiveWeeklyReports
        });
        setShowAddModal(true);
    };

    const getStatusColor = (status: SupplierEmployee['status']) => {
        switch (status) {
            case 'active': return 'bg-emerald-500/10 text-emerald-400';
            case 'inactive': return 'bg-slate-500/10 text-slate-400';
            case 'pending': return 'bg-amber-500/10 text-amber-400';
        }
    };

    const getRoleIcon = (role: EmployeeRole) => {
        switch (role) {
            case 'admin': return '👨‍💼';
            case 'products': return '📦';
            case 'orders': return '💬';
            case 'reports': return '📊';
            case 'view_only': return '👁️';
            case 'custom': return '⚙️';
        }
    };

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-400" />
                    {getLabel('employees')}
                </h3>
                {!readOnly && (
                    <button
                        onClick={() => { resetForm(); setShowAddModal(true); }}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl transition-colors"
                    >
                        <UserPlus className="w-4 h-4" />
                        {getLabel('addEmployee')}
                    </button>
                )}
            </div>

            {/* Employees Table */}
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden">
                {employees.length === 0 ? (
                    <div className="p-8 text-center text-slate-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{language === 'ar' ? 'لا يوجد موظفين مضافين' : 'No employees added'}</p>
                        {!readOnly && (
                            <button
                                onClick={() => setShowAddModal(true)}
                                className="mt-4 px-4 py-2 bg-blue-500/20 text-blue-400 rounded-lg hover:bg-blue-500/30 transition-colors"
                            >
                                {getLabel('addEmployee')}
                            </button>
                        )}
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-700/30">
                                    <th className="px-4 py-3 text-start text-sm text-slate-400">{getLabel('name')}</th>
                                    <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('role')}</th>
                                    <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('status')}</th>
                                    <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('lastLogin')}</th>
                                    {!readOnly && (
                                        <th className="px-4 py-3 text-center text-sm text-slate-400">{getLabel('actions')}</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {employees.map((employee) => (
                                    <React.Fragment key={employee.id}>
                                        <tr className="border-t border-slate-700/50 hover:bg-slate-700/20">
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold">
                                                        {employee.name.charAt(0)}
                                                    </div>
                                                    <div>
                                                        <div className="text-white font-medium">{employee.name}</div>
                                                        <div className="text-slate-400 text-sm flex items-center gap-1">
                                                            <Mail className="w-3 h-3" />
                                                            {employee.email}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <button
                                                    onClick={() => setShowPermissions(showPermissions === employee.id ? null : employee.id)}
                                                    className="inline-flex items-center gap-2 px-3 py-1 bg-slate-700/50 text-white rounded-lg text-sm hover:bg-slate-700 transition-colors"
                                                >
                                                    <span>{getRoleIcon(employee.role)}</span>
                                                    {EMPLOYEE_ROLE_TRANSLATIONS[employee.role][language]}
                                                    <ChevronDown className={`w-3 h-3 transition-transform ${showPermissions === employee.id ? 'rotate-180' : ''}`} />
                                                </button>
                                            </td>
                                            <td className="px-4 py-3 text-center">
                                                <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${getStatusColor(employee.status)}`}>
                                                    {employee.status === 'active' && <Check className="w-3 h-3" />}
                                                    {employee.status === 'pending' && <Clock className="w-3 h-3" />}
                                                    {getLabel(employee.status)}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-center text-slate-400 text-sm">
                                                {employee.lastLogin
                                                    ? new Date(employee.lastLogin).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')
                                                    : getLabel('never')
                                                }
                                            </td>
                                            {!readOnly && (
                                                <td className="px-4 py-3 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        {employee.status === 'pending' && (
                                                            <button className="p-1.5 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors" title={getLabel('resendInvite')}>
                                                                <Send className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                        <button
                                                            onClick={() => openEditModal(employee)}
                                                            className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                                                        >
                                                            <Edit3 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(employee.id)}
                                                            className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-slate-700/50 rounded-lg transition-colors"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </tr>
                                        {/* Permissions Dropdown */}
                                        {showPermissions === employee.id && (
                                            <tr>
                                                <td colSpan={5} className="px-4 py-3 bg-slate-700/20">
                                                    <div className="flex flex-wrap gap-2">
                                                        {employee.permissions.map((perm) => (
                                                            <span key={perm} className="px-2 py-1 bg-blue-500/10 text-blue-400 rounded text-xs">
                                                                {PERMISSION_TRANSLATIONS[perm][language]}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </td>
                                            </tr>
                                        )}
                                    </React.Fragment>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Permission Levels Reference */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                <h4 className="text-white font-bold mb-3">{language === 'ar' ? 'مستويات الصلاحيات' : 'Permission Levels'}</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2">
                    {Object.entries(EMPLOYEE_ROLE_TRANSLATIONS).map(([role, labels]) => (
                        <div key={role} className="p-3 bg-slate-700/30 rounded-lg text-center">
                            <div className="text-2xl mb-1">{getRoleIcon(role as EmployeeRole)}</div>
                            <div className="text-white text-sm font-medium">{labels[language]}</div>
                            <div className="text-slate-400 text-xs mt-1">
                                {ROLE_PERMISSIONS[role as EmployeeRole].length} {language === 'ar' ? 'صلاحية' : 'perms'}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Add/Edit Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-700">
                        <div className="p-4 border-b border-slate-700 flex items-center justify-between sticky top-0 bg-slate-800">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-blue-400" />
                                {editingEmployee ? getLabel('editEmployee') : getLabel('addEmployee')}
                            </h3>
                            <button onClick={() => { setShowAddModal(false); setEditingEmployee(null); }} className="text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* Basic Info */}
                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-2">{getLabel('name')} *</label>
                                        <input
                                            type="text"
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-2">{getLabel('email')} *</label>
                                        <input
                                            type="email"
                                            value={formData.email}
                                            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-2">{getLabel('phone')}</label>
                                        <input
                                            type="tel"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-slate-400 text-sm mb-2">{getLabel('jobTitle')}</label>
                                        <input
                                            type="text"
                                            value={formData.jobTitle}
                                            onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-2 px-3 text-white focus:outline-none focus:border-blue-500"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Role Selection */}
                            <div>
                                <label className="block text-slate-400 text-sm mb-2">{getLabel('selectRole')}</label>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                                    {Object.entries(EMPLOYEE_ROLE_TRANSLATIONS).map(([role, labels]) => (
                                        <button
                                            key={role}
                                            onClick={() => handleRoleChange(role as EmployeeRole)}
                                            className={`p-3 rounded-xl border transition-all ${formData.role === role
                                                ? 'bg-blue-500/20 border-blue-500 text-blue-400'
                                                : 'bg-slate-700/30 border-slate-600 text-slate-300 hover:border-slate-500'
                                                }`}
                                        >
                                            <div className="text-xl mb-1">{getRoleIcon(role as EmployeeRole)}</div>
                                            <div className="text-sm font-medium">{labels[language]}</div>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Custom Permissions */}
                            {formData.role === 'custom' && (
                                <div className="space-y-4">
                                    <h4 className="text-white font-medium flex items-center gap-2">
                                        <Shield className="w-4 h-4 text-blue-400" />
                                        {getLabel('customPermissions')}
                                    </h4>

                                    {Object.entries(permissionGroups).map(([groupKey, permissions]) => (
                                        <div key={groupKey} className="bg-slate-700/30 rounded-xl p-4">
                                            <h5 className="text-slate-300 font-medium mb-3">{getLabel(groupKey as keyof typeof t)}</h5>
                                            <div className="grid grid-cols-2 gap-2">
                                                {permissions.map((perm) => (
                                                    <label key={perm} className="flex items-center gap-2 cursor-pointer">
                                                        <input
                                                            type="checkbox"
                                                            checked={formData.permissions?.includes(perm)}
                                                            onChange={() => togglePermission(perm)}
                                                            className="w-4 h-4 rounded border-slate-600 bg-slate-700/50 text-blue-500"
                                                        />
                                                        <span className="text-slate-300 text-sm">{PERMISSION_TRANSLATIONS[perm][language]}</span>
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {/* Notifications */}
                            <div className="space-y-3">
                                <h4 className="text-white font-medium">{getLabel('notifications')}</h4>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.receiveOrderNotifications}
                                        onChange={(e) => setFormData({ ...formData, receiveOrderNotifications: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-700/50 text-blue-500"
                                    />
                                    <span className="text-slate-300">{getLabel('orderNotifications')}</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.receivePriceConfirmNotifications}
                                        onChange={(e) => setFormData({ ...formData, receivePriceConfirmNotifications: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-700/50 text-blue-500"
                                    />
                                    <span className="text-slate-300">{getLabel('priceConfirmNotifications')}</span>
                                </label>
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={formData.receiveWeeklyReports}
                                        onChange={(e) => setFormData({ ...formData, receiveWeeklyReports: e.target.checked })}
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-700/50 text-blue-500"
                                    />
                                    <span className="text-slate-300">{getLabel('weeklyReports')}</span>
                                </label>
                            </div>

                            {/* Email Invite Note */}
                            {!editingEmployee && (
                                <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4 flex items-start gap-3">
                                    <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
                                    <div>
                                        <p className="text-blue-400 font-medium">{getLabel('sendInvite')}</p>
                                        <p className="text-slate-400 text-sm mt-1">
                                            {language === 'ar'
                                                ? 'سيتم إرسال دعوة بالبريد الإلكتروني للموظف لتفعيل حسابه'
                                                : 'An email invite will be sent to the employee to activate their account'
                                            }
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-slate-700 flex justify-end gap-3 sticky bottom-0 bg-slate-800">
                            <button
                                onClick={() => { setShowAddModal(false); setEditingEmployee(null); }}
                                className="px-4 py-2 text-slate-400 hover:text-white transition-colors"
                            >
                                {getLabel('cancel')}
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={!formData.name || !formData.email}
                                className="px-4 py-2 bg-blue-500 hover:bg-blue-400 text-white rounded-xl transition-colors disabled:opacity-50 flex items-center gap-2"
                            >
                                <Check className="w-4 h-4" />
                                {getLabel('save')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SupplierEmployeeManager;
