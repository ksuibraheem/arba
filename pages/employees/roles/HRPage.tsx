/**
 * صفحة الموارد البشرية الشاملة
 * Comprehensive Human Resources Page
 */

import React, { useState, useEffect } from 'react';
import {
    Users, UserPlus, Search, Edit2, Trash2, Eye, X, Save,
    Phone, Mail, AlertTriangle, Award, Briefcase, DollarSign,
    FileText, Calendar, Clock, ChevronDown, ChevronUp, Plus,
    Download, Filter, UserCheck, UserX, Building, GraduationCap
} from 'lucide-react';
import {
    Employee, EmployeeRole, Certificate, Experience, SalaryStructure,
    ContractInfo, Note, Warning, WarningType, AttendanceRecord, BreakRecord, TaskSummary,
    employeeService, ROLE_TRANSLATIONS, ROLE_COLORS, CONTRACT_TRANSLATIONS,
    WARNING_TRANSLATIONS, DEFAULT_SALARY, DEFAULT_CONTRACT, calculateTotalSalary,
    ATTENDANCE_STATUS_TRANSLATIONS, BREAK_TYPE_TRANSLATIONS,
    isSuperAdmin, hasFullPermissions, shouldHideActivityStats, isExcludedFromActivityTracking,
    SUPER_ADMIN_EMPLOYEE_NUMBER
} from '../../../services/employeeService';

interface HRPageProps {
    language: 'ar' | 'en';
    employee: Employee;
}

type ViewMode = 'list' | 'add' | 'edit' | 'view' | 'attendance';
type TabType = 'info' | 'certificates' | 'experience' | 'salary' | 'contract' | 'warnings';

const HRPage: React.FC<HRPageProps> = ({ language, employee }) => {
    const t = (ar: string, en: string) => language === 'ar' ? ar : en;
    const dir = language === 'ar' ? 'rtl' : 'ltr';

    // التحقق من صلاحيات المدير العام (Super Admin)
    const currentEmployeeNumber = (employee as any)?.employeeNumber || SUPER_ADMIN_EMPLOYEE_NUMBER;
    const isSuperAdminUser = isSuperAdmin(currentEmployeeNumber);
    const hasFullAccess = hasFullPermissions(currentEmployeeNumber);
    const hideActivityStats = shouldHideActivityStats(currentEmployeeNumber);
    const excludeFromTracking = isExcludedFromActivityTracking(currentEmployeeNumber);

    // States
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterRole, setFilterRole] = useState<EmployeeRole | 'all'>('all');
    const [viewMode, setViewMode] = useState<ViewMode>('list');
    const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
    const [activeTab, setActiveTab] = useState<TabType>('info');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // Form states
    const [formData, setFormData] = useState<Partial<Employee>>({});

    // Attendance states
    const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
    const [attendanceDate, setAttendanceDate] = useState(new Date().toISOString().split('T')[0]);

    // حالة انتحال الصفة (المدير يعمل نيابة عن الموظف)
    const [impersonationInfo, setImpersonationInfo] = useState<{
        employeeId: string;
        employeeNumber: string;
        employeeName: string;
        employeeRole: string;
        impersonatedBy: string;
        impersonatorName: string;
        startedAt: string;
    } | null>(null);

    // التحقق من وجود انتحال صفة عند تحميل الصفحة
    useEffect(() => {
        const impersonationData = localStorage.getItem('arba_impersonating_employee');
        if (impersonationData) {
            try {
                const data = JSON.parse(impersonationData);
                if (data.employeeRole === 'hr') {
                    setImpersonationInfo(data);
                }
            } catch (e) {
                // تجاهل الخطأ
            }
        }
    }, []);

    // إنهاء انتحال الصفة
    const endImpersonation = () => {
        localStorage.removeItem('arba_impersonating_employee');
        setImpersonationInfo(null);
        // العودة لصفحة المدير
        window.history.back();
    };

    // Load employees
    useEffect(() => {
        employeeService.initializeSampleData();
        employeeService.initializeTodayAttendance();
        loadEmployees();
        loadAttendance();
    }, []);

    const loadEmployees = () => {
        setEmployees(employeeService.getEmployees());
    };

    const loadAttendance = () => {
        setAttendanceRecords(employeeService.getAttendanceByDate(attendanceDate));
    };

    // Reload attendance when date changes
    useEffect(() => {
        loadAttendance();
    }, [attendanceDate]);

    // Filter employees
    const filteredEmployees = employees.filter(emp => {
        const matchesSearch = emp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            emp.employeeNumber.includes(searchQuery) ||
            emp.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesRole = filterRole === 'all' || emp.role === filterRole;
        return matchesSearch && matchesRole;
    });

    // Stats
    const stats = employeeService.getStatistics();

    // Handle add employee
    const handleAddEmployee = () => {
        setFormData({
            employeeNumber: employeeService.generateEmployeeNumber(),
            password: employeeService.generatePassword(),
            name: '',
            email: '',
            phone: '',
            emergencyContact: '',
            role: 'developer',
            salary: { ...DEFAULT_SALARY },
            contract: { ...DEFAULT_CONTRACT },
            certificates: [],
            experiences: [],
            notes: [],
            warnings: []
        });
        setViewMode('add');
        setActiveTab('info');
    };

    // Handle edit
    const handleEdit = (emp: Employee) => {
        setSelectedEmployee(emp);
        setFormData({ ...emp });
        setViewMode('edit');
        setActiveTab('info');
    };

    // Handle view
    const handleView = (emp: Employee) => {
        setSelectedEmployee(emp);
        setViewMode('view');
        setActiveTab('info');
    };

    // Handle save
    const handleSave = () => {
        try {
            if (viewMode === 'add') {
                employeeService.addEmployee(formData as any);
                showNotification('success', t('تم إضافة الموظف بنجاح', 'Employee added successfully'));
            } else if (viewMode === 'edit' && selectedEmployee) {
                employeeService.updateEmployee(selectedEmployee.id, formData);
                showNotification('success', t('تم تحديث البيانات بنجاح', 'Data updated successfully'));
            }
            loadEmployees();
            setViewMode('list');
        } catch (error: any) {
            showNotification('error', error.message);
        }
    };

    // Handle delete
    const handleDelete = () => {
        if (selectedEmployee) {
            employeeService.deleteEmployee(selectedEmployee.id);
            showNotification('success', t('تم حذف الموظف', 'Employee deleted'));
            loadEmployees();
            setViewMode('list');
            setShowDeleteConfirm(false);
        }
    };

    // Show notification
    const showNotification = (type: 'success' | 'error', message: string) => {
        setNotification({ type, message });
        setTimeout(() => setNotification(null), 3000);
    };

    // Add certificate
    const handleAddCertificate = () => {
        const certs = formData.certificates || [];
        setFormData({
            ...formData,
            certificates: [...certs, { id: crypto.randomUUID(), name: '', issuer: '', issueDate: '' }]
        });
    };

    // Remove certificate
    const handleRemoveCertificate = (id: string) => {
        setFormData({
            ...formData,
            certificates: (formData.certificates || []).filter(c => c.id !== id)
        });
    };

    // Add experience
    const handleAddExperience = () => {
        const exps = formData.experiences || [];
        setFormData({
            ...formData,
            experiences: [...exps, { id: crypto.randomUUID(), company: '', position: '', startDate: '' }]
        });
    };

    // Remove experience
    const handleRemoveExperience = (id: string) => {
        setFormData({
            ...formData,
            experiences: (formData.experiences || []).filter(e => e.id !== id)
        });
    };

    // Add warning
    const handleAddWarning = () => {
        if (!selectedEmployee) return;
        const warning = employeeService.addWarning(selectedEmployee.id, {
            type: 'verbal',
            reason: '',
            issuedBy: employee.name
        });
        if (warning) {
            loadEmployees();
            setSelectedEmployee(employeeService.getEmployeeById(selectedEmployee.id));
        }
    };

    // Format time
    const formatTime = (isoString?: string) => {
        if (!isoString) return '--:--';
        return new Date(isoString).toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    };

    // Format duration
    const formatDuration = (minutes?: number) => {
        if (!minutes || minutes <= 0) return '--';
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}س ${mins}د` : `${mins}د`;
    };

    // Get status color
    const getStatusColor = (status: AttendanceRecord['status']) => {
        switch (status) {
            case 'present': return 'bg-green-500/20 text-green-400';
            case 'late': return 'bg-yellow-500/20 text-yellow-400';
            case 'absent': return 'bg-red-500/20 text-red-400';
            case 'early_leave': return 'bg-orange-500/20 text-orange-400';
            case 'on_leave': return 'bg-blue-500/20 text-blue-400';
            default: return 'bg-slate-500/20 text-slate-400';
        }
    };

    // Render attendance page
    const renderAttendance = () => {
        const presentCount = attendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length;
        const absentCount = attendanceRecords.filter(r => r.status === 'absent').length;
        const lateCount = attendanceRecords.filter(r => r.status === 'late').length;

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => setViewMode('list')}
                            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400"
                        >
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <Clock className="w-6 h-6 text-cyan-400" />
                            {t('الحضور والانصراف', 'Attendance')}
                        </h2>
                    </div>
                    <div className="flex items-center gap-3">
                        <input
                            type="date"
                            value={attendanceDate}
                            onChange={(e) => setAttendanceDate(e.target.value)}
                            className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white"
                        />
                    </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4">
                    <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
                        <div className="flex items-center gap-3">
                            <UserCheck className="w-8 h-8 text-green-400" />
                            <div>
                                <p className="text-2xl font-bold text-white">{presentCount}</p>
                                <p className="text-slate-400 text-sm">{t('حاضر', 'Present')}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-xl p-4 border border-red-500/30">
                        <div className="flex items-center gap-3">
                            <UserX className="w-8 h-8 text-red-400" />
                            <div>
                                <p className="text-2xl font-bold text-white">{absentCount}</p>
                                <p className="text-slate-400 text-sm">{t('غائب', 'Absent')}</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-br from-yellow-500/20 to-amber-500/20 rounded-xl p-4 border border-yellow-500/30">
                        <div className="flex items-center gap-3">
                            <Clock className="w-8 h-8 text-yellow-400" />
                            <div>
                                <p className="text-2xl font-bold text-white">{lateCount}</p>
                                <p className="text-slate-400 text-sm">{t('متأخر', 'Late')}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Attendance Table */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-slate-700/50">
                                <tr>
                                    <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">{t('الموظف', 'Employee')}</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-300">{t('الحالة', 'Status')}</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-300">{t('تسجيل الدخول', 'Clock In')}</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-300">{t('تسجيل الخروج', 'Clock Out')}</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-300">{t('ساعات العمل', 'Work Hours')}</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-300">{t('الاستراحات', 'Breaks')}</th>
                                    <th className="px-4 py-3 text-center text-sm font-medium text-slate-300">{t('المهام', 'Tasks')}</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-700/50">
                                {attendanceRecords.map((record) => (
                                    <tr key={record.id} className="hover:bg-slate-700/30 transition">
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold">
                                                    {record.employeeName.charAt(0)}
                                                </div>
                                                <div>
                                                    <p className="text-white font-medium">{record.employeeName}</p>
                                                    <p className="text-slate-400 text-sm">{record.employeeNumber}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(record.status)}`}>
                                                {ATTENDANCE_STATUS_TRANSLATIONS[record.status][language]}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`font-mono ${record.clockIn ? 'text-green-400' : 'text-slate-500'}`}>
                                                {formatTime(record.clockIn)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className={`font-mono ${record.clockOut ? 'text-red-400' : 'text-slate-500'}`}>
                                                {formatTime(record.clockOut)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            <span className="text-cyan-400 font-medium">
                                                {formatDuration(record.totalWorkMinutes)}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {record.breaks.length > 0 ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-orange-400 font-medium">
                                                        {formatDuration(record.totalBreakMinutes)}
                                                    </span>
                                                    <span className="text-slate-500 text-xs">
                                                        ({record.breaks.length} {t('مرة', 'times')})
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-500">--</span>
                                            )}
                                        </td>
                                        <td className="px-4 py-3 text-center">
                                            {record.tasks.length > 0 ? (
                                                <div className="flex flex-col items-center gap-1">
                                                    <span className="text-purple-400 font-medium">
                                                        {record.tasks.filter(t => t.status === 'completed').length}/{record.tasks.length}
                                                    </span>
                                                    <span className="text-slate-500 text-xs">
                                                        {t('مهمة', 'tasks')}
                                                    </span>
                                                </div>
                                            ) : (
                                                <span className="text-slate-500">--</span>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {attendanceRecords.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            <Clock className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>{t('لا توجد سجلات حضور لهذا اليوم', 'No attendance records for this day')}</p>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Render stats cards
    const renderStats = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-blue-500/20 to-cyan-500/20 rounded-xl p-4 border border-blue-500/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-blue-500/30 flex items-center justify-center">
                        <Users className="w-5 h-5 text-blue-400" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">{t('إجمالي الموظفين', 'Total Employees')}</p>
                        <p className="text-2xl font-bold text-white">{stats.total}</p>
                    </div>
                </div>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/30 flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">{t('نشط', 'Active')}</p>
                        <p className="text-2xl font-bold text-white">{stats.active}</p>
                    </div>
                </div>
            </div>
            <div className="bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl p-4 border border-orange-500/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-orange-500/30 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-orange-400" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">{t('إجمالي الرواتب', 'Total Salaries')}</p>
                        <p className="text-2xl font-bold text-white">{stats.totalSalaries.toLocaleString()}</p>
                    </div>
                </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
                        <AlertTriangle className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">{t('الإنذارات', 'Warnings')}</p>
                        <p className="text-2xl font-bold text-white">{stats.warningsCount}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    // لوحة الرقابة للمدير العام
    const renderSuperAdminPanel = () => (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-gradient-to-br from-amber-500/20 to-yellow-500/20 rounded-xl p-4 border border-amber-500/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/30 flex items-center justify-center">
                        <Users className="w-5 h-5 text-amber-400" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">{t('إجمالي الموظفين', 'Total Employees')}</p>
                        <p className="text-2xl font-bold text-white">{stats.total}</p>
                    </div>
                </div>
            </div>
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl p-4 border border-green-500/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-green-500/30 flex items-center justify-center">
                        <UserCheck className="w-5 h-5 text-green-400" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">{t('حاضرون اليوم', 'Present Today')}</p>
                        <p className="text-2xl font-bold text-white">{attendanceRecords.filter(r => r.status === 'present' || r.status === 'late').length}</p>
                    </div>
                </div>
            </div>
            <div className="bg-gradient-to-br from-red-500/20 to-rose-500/20 rounded-xl p-4 border border-red-500/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-red-500/30 flex items-center justify-center">
                        <UserX className="w-5 h-5 text-red-400" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">{t('غائبون', 'Absent')}</p>
                        <p className="text-2xl font-bold text-white">{attendanceRecords.filter(r => r.status === 'absent').length}</p>
                    </div>
                </div>
            </div>
            <div className="bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl p-4 border border-purple-500/30">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-purple-500/30 flex items-center justify-center">
                        <DollarSign className="w-5 h-5 text-purple-400" />
                    </div>
                    <div>
                        <p className="text-slate-400 text-sm">{t('إجمالي الرواتب', 'Total Salaries')}</p>
                        <p className="text-2xl font-bold text-white">{stats.totalSalaries.toLocaleString()}</p>
                    </div>
                </div>
            </div>
        </div>
    );

    // Render employee list
    const renderEmployeeList = () => (
        <div className="space-y-4">
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                    <Search className="absolute top-3 right-3 w-5 h-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder={t('بحث بالاسم أو رقم الموظف...', 'Search by name or employee number...')}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 pr-10 text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                    />
                </div>
                <select
                    value={filterRole}
                    onChange={(e) => setFilterRole(e.target.value as any)}
                    className="bg-slate-800/50 border border-slate-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-blue-500"
                >
                    <option value="all">{t('جميع الأدوار', 'All Roles')}</option>
                    {Object.entries(ROLE_TRANSLATIONS).map(([role, trans]) => (
                        <option key={role} value={role}>{language === 'ar' ? trans.ar : trans.en}</option>
                    ))}
                </select>
                <button
                    onClick={handleAddEmployee}
                    className="bg-gradient-to-r from-blue-500 to-cyan-600 px-4 py-2 rounded-lg text-white flex items-center gap-2 hover:opacity-90 transition"
                >
                    <UserPlus className="w-5 h-5" />
                    {t('إضافة موظف', 'Add Employee')}
                </button>
                <button
                    onClick={() => setViewMode('attendance')}
                    className="bg-gradient-to-r from-cyan-500 to-teal-600 px-4 py-2 rounded-lg text-white flex items-center gap-2 hover:opacity-90 transition"
                >
                    <Clock className="w-5 h-5" />
                    {t('الحضور والانصراف', 'Attendance')}
                </button>
            </div>

            {/* Employee Table */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-slate-700/50">
                            <tr>
                                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">{t('الموظف', 'Employee')}</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">{t('الدور', 'Role')}</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">{t('الجوال', 'Phone')}</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">{t('الراتب', 'Salary')}</th>
                                <th className="px-4 py-3 text-right text-sm font-medium text-slate-300">{t('الحالة', 'Status')}</th>
                                <th className="px-4 py-3 text-center text-sm font-medium text-slate-300">{t('إجراءات', 'Actions')}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-700/50">
                            {filteredEmployees.map((emp) => (
                                <tr key={emp.id} className="hover:bg-slate-700/30 transition">
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${ROLE_COLORS[emp.role]} flex items-center justify-center text-white font-bold`}>
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <p className="text-white font-medium">{emp.name}</p>
                                                <p className="text-slate-400 text-sm">{emp.employeeNumber}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs bg-gradient-to-r ${ROLE_COLORS[emp.role]} text-white`}>
                                            {language === 'ar' ? ROLE_TRANSLATIONS[emp.role].ar : ROLE_TRANSLATIONS[emp.role].en}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 text-slate-300">{emp.phone}</td>
                                    <td className="px-4 py-3 text-slate-300">{calculateTotalSalary(emp.salary).toLocaleString()} {t('ر.س', 'SAR')}</td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 rounded-full text-xs ${emp.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                                            {emp.isActive ? t('نشط', 'Active') : t('غير نشط', 'Inactive')}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center justify-center gap-2">
                                            <button onClick={() => handleView(emp)} className="p-2 hover:bg-slate-700 rounded-lg text-blue-400" title={t('عرض', 'View')}>
                                                <Eye className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => handleEdit(emp)} className="p-2 hover:bg-slate-700 rounded-lg text-yellow-400" title={t('تعديل', 'Edit')}>
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button onClick={() => { setSelectedEmployee(emp); setShowDeleteConfirm(true); }} className="p-2 hover:bg-slate-700 rounded-lg text-red-400" title={t('حذف', 'Delete')}>
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {filteredEmployees.length === 0 && (
                    <div className="text-center py-12 text-slate-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>{t('لا يوجد موظفين', 'No employees found')}</p>
                    </div>
                )}
            </div>
        </div>
    );

    // Render tabs
    const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
        { id: 'info', label: t('البيانات الشخصية', 'Personal Info'), icon: <Users className="w-4 h-4" /> },
        { id: 'certificates', label: t('الشهادات', 'Certificates'), icon: <GraduationCap className="w-4 h-4" /> },
        { id: 'experience', label: t('الخبرات', 'Experience'), icon: <Briefcase className="w-4 h-4" /> },
        { id: 'salary', label: t('الراتب', 'Salary'), icon: <DollarSign className="w-4 h-4" /> },
        { id: 'contract', label: t('العقد', 'Contract'), icon: <FileText className="w-4 h-4" /> },
        { id: 'warnings', label: t('الإنذارات', 'Warnings'), icon: <AlertTriangle className="w-4 h-4" /> },
    ];

    // Render form
    const renderForm = () => {
        const isViewOnly = viewMode === 'view';
        const data = isViewOnly ? selectedEmployee : formData;

        return (
            <div className="space-y-6">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => setViewMode('list')} className="p-2 hover:bg-slate-700 rounded-lg text-slate-400">
                            <X className="w-5 h-5" />
                        </button>
                        <h2 className="text-xl font-bold text-white">
                            {viewMode === 'add' ? t('إضافة موظف جديد', 'Add New Employee') :
                                viewMode === 'edit' ? t('تعديل بيانات الموظف', 'Edit Employee') :
                                    t('بيانات الموظف', 'Employee Details')}
                        </h2>
                    </div>
                    {!isViewOnly && (
                        <button onClick={handleSave} className="bg-gradient-to-r from-green-500 to-emerald-600 px-4 py-2 rounded-lg text-white flex items-center gap-2">
                            <Save className="w-5 h-5" />
                            {t('حفظ', 'Save')}
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-2 overflow-x-auto pb-2">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition ${activeTab === tab.id
                                ? 'bg-blue-500 text-white'
                                : 'bg-slate-800/50 text-slate-400 hover:bg-slate-700'
                                }`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>

                {/* Tab Content */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-6 border border-slate-700/50">
                    {activeTab === 'info' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-400 text-sm mb-1">{t('رقم الموظف', 'Employee Number')}</label>
                                <input
                                    type="text"
                                    value={data?.employeeNumber || ''}
                                    readOnly
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-slate-400"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-1">{t('الاسم الكامل', 'Full Name')} *</label>
                                <input
                                    type="text"
                                    value={data?.name || ''}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    disabled={isViewOnly}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white disabled:text-slate-400"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-1">{t('البريد الإلكتروني', 'Email')} *</label>
                                <input
                                    type="email"
                                    value={data?.email || ''}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    disabled={isViewOnly}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white disabled:text-slate-400"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-1">{t('رقم الجوال', 'Phone')} *</label>
                                <input
                                    type="tel"
                                    value={data?.phone || ''}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    disabled={isViewOnly}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white disabled:text-slate-400"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-1">{t('رقم الطوارئ', 'Emergency Contact')} *</label>
                                <input
                                    type="tel"
                                    value={data?.emergencyContact || ''}
                                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                                    disabled={isViewOnly}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white disabled:text-slate-400"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-1">{t('رقم الهوية', 'National ID')}</label>
                                <input
                                    type="text"
                                    value={data?.nationalId || ''}
                                    onChange={(e) => setFormData({ ...formData, nationalId: e.target.value })}
                                    disabled={isViewOnly}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white disabled:text-slate-400"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-1">{t('الدور الوظيفي', 'Role')} *</label>
                                <select
                                    value={data?.role || 'developer'}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value as EmployeeRole })}
                                    disabled={isViewOnly}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white disabled:text-slate-400"
                                >
                                    {Object.entries(ROLE_TRANSLATIONS).map(([role, trans]) => (
                                        <option key={role} value={role}>{language === 'ar' ? trans.ar : trans.en}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-1">{t('المسمى الوظيفي', 'Job Title')}</label>
                                <input
                                    type="text"
                                    value={data?.jobTitle || ''}
                                    onChange={(e) => setFormData({ ...formData, jobTitle: e.target.value })}
                                    disabled={isViewOnly}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white disabled:text-slate-400"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-1">{t('التصنيف المهني', 'Professional Class')}</label>
                                <input
                                    type="text"
                                    value={data?.professionalClass || ''}
                                    onChange={(e) => setFormData({ ...formData, professionalClass: e.target.value })}
                                    disabled={isViewOnly}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white disabled:text-slate-400"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'certificates' && (
                        <div className="space-y-4">
                            {!isViewOnly && (
                                <button onClick={handleAddCertificate} className="flex items-center gap-2 text-blue-400 hover:text-blue-300">
                                    <Plus className="w-4 h-4" />
                                    {t('إضافة شهادة', 'Add Certificate')}
                                </button>
                            )}
                            {(data?.certificates || []).length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>{t('لا توجد شهادات', 'No certificates')}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {(data?.certificates || []).map((cert, idx) => (
                                        <div key={cert.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="text-white font-medium">{t('شهادة', 'Certificate')} #{idx + 1}</h4>
                                                {!isViewOnly && (
                                                    <button onClick={() => handleRemoveCertificate(cert.id)} className="text-red-400 hover:text-red-300">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-slate-400 text-xs mb-1">{t('اسم الشهادة', 'Certificate Name')}</label>
                                                    <input
                                                        type="text"
                                                        value={cert.name}
                                                        onChange={(e) => {
                                                            const certs = [...(formData.certificates || [])];
                                                            certs[idx] = { ...certs[idx], name: e.target.value };
                                                            setFormData({ ...formData, certificates: certs });
                                                        }}
                                                        disabled={isViewOnly}
                                                        className="w-full bg-slate-800/50 border border-slate-600 rounded px-3 py-1.5 text-white text-sm disabled:text-slate-400"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-slate-400 text-xs mb-1">{t('الجهة المانحة', 'Issuer')}</label>
                                                    <input
                                                        type="text"
                                                        value={cert.issuer}
                                                        onChange={(e) => {
                                                            const certs = [...(formData.certificates || [])];
                                                            certs[idx] = { ...certs[idx], issuer: e.target.value };
                                                            setFormData({ ...formData, certificates: certs });
                                                        }}
                                                        disabled={isViewOnly}
                                                        className="w-full bg-slate-800/50 border border-slate-600 rounded px-3 py-1.5 text-white text-sm disabled:text-slate-400"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-slate-400 text-xs mb-1">{t('تاريخ الإصدار', 'Issue Date')}</label>
                                                    <input
                                                        type="date"
                                                        value={cert.issueDate}
                                                        onChange={(e) => {
                                                            const certs = [...(formData.certificates || [])];
                                                            certs[idx] = { ...certs[idx], issueDate: e.target.value };
                                                            setFormData({ ...formData, certificates: certs });
                                                        }}
                                                        disabled={isViewOnly}
                                                        className="w-full bg-slate-800/50 border border-slate-600 rounded px-3 py-1.5 text-white text-sm disabled:text-slate-400"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-slate-400 text-xs mb-1">{t('تاريخ الانتهاء', 'Expiry Date')}</label>
                                                    <input
                                                        type="date"
                                                        value={cert.expiryDate || ''}
                                                        onChange={(e) => {
                                                            const certs = [...(formData.certificates || [])];
                                                            certs[idx] = { ...certs[idx], expiryDate: e.target.value };
                                                            setFormData({ ...formData, certificates: certs });
                                                        }}
                                                        disabled={isViewOnly}
                                                        className="w-full bg-slate-800/50 border border-slate-600 rounded px-3 py-1.5 text-white text-sm disabled:text-slate-400"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'experience' && (
                        <div className="space-y-4">
                            {!isViewOnly && (
                                <button onClick={handleAddExperience} className="flex items-center gap-2 text-blue-400 hover:text-blue-300">
                                    <Plus className="w-4 h-4" />
                                    {t('إضافة خبرة', 'Add Experience')}
                                </button>
                            )}
                            {(data?.experiences || []).length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <Briefcase className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>{t('لا توجد خبرات', 'No experience')}</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {(data?.experiences || []).map((exp, idx) => (
                                        <div key={exp.id} className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
                                            <div className="flex justify-between items-start mb-3">
                                                <h4 className="text-white font-medium">{t('خبرة', 'Experience')} #{idx + 1}</h4>
                                                {!isViewOnly && (
                                                    <button onClick={() => handleRemoveExperience(exp.id)} className="text-red-400 hover:text-red-300">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                                <div>
                                                    <label className="block text-slate-400 text-xs mb-1">{t('اسم الشركة', 'Company')}</label>
                                                    <input
                                                        type="text"
                                                        value={exp.company}
                                                        onChange={(e) => {
                                                            const exps = [...(formData.experiences || [])];
                                                            exps[idx] = { ...exps[idx], company: e.target.value };
                                                            setFormData({ ...formData, experiences: exps });
                                                        }}
                                                        disabled={isViewOnly}
                                                        className="w-full bg-slate-800/50 border border-slate-600 rounded px-3 py-1.5 text-white text-sm disabled:text-slate-400"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-slate-400 text-xs mb-1">{t('المسمى الوظيفي', 'Position')}</label>
                                                    <input
                                                        type="text"
                                                        value={exp.position}
                                                        onChange={(e) => {
                                                            const exps = [...(formData.experiences || [])];
                                                            exps[idx] = { ...exps[idx], position: e.target.value };
                                                            setFormData({ ...formData, experiences: exps });
                                                        }}
                                                        disabled={isViewOnly}
                                                        className="w-full bg-slate-800/50 border border-slate-600 rounded px-3 py-1.5 text-white text-sm disabled:text-slate-400"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-slate-400 text-xs mb-1">{t('تاريخ البداية', 'Start Date')}</label>
                                                    <input
                                                        type="date"
                                                        value={exp.startDate}
                                                        onChange={(e) => {
                                                            const exps = [...(formData.experiences || [])];
                                                            exps[idx] = { ...exps[idx], startDate: e.target.value };
                                                            setFormData({ ...formData, experiences: exps });
                                                        }}
                                                        disabled={isViewOnly}
                                                        className="w-full bg-slate-800/50 border border-slate-600 rounded px-3 py-1.5 text-white text-sm disabled:text-slate-400"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-slate-400 text-xs mb-1">{t('تاريخ النهاية', 'End Date')}</label>
                                                    <input
                                                        type="date"
                                                        value={exp.endDate || ''}
                                                        onChange={(e) => {
                                                            const exps = [...(formData.experiences || [])];
                                                            exps[idx] = { ...exps[idx], endDate: e.target.value };
                                                            setFormData({ ...formData, experiences: exps });
                                                        }}
                                                        disabled={isViewOnly}
                                                        className="w-full bg-slate-800/50 border border-slate-600 rounded px-3 py-1.5 text-white text-sm disabled:text-slate-400"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {activeTab === 'salary' && (
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1">{t('الراتب الأساسي', 'Basic Salary')}</label>
                                    <input
                                        type="number"
                                        value={data?.salary?.basic || 0}
                                        onChange={(e) => setFormData({ ...formData, salary: { ...(formData.salary || DEFAULT_SALARY), basic: Number(e.target.value) } })}
                                        disabled={isViewOnly}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white disabled:text-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1">{t('بدل السكن', 'Housing')}</label>
                                    <input
                                        type="number"
                                        value={data?.salary?.housing || 0}
                                        onChange={(e) => setFormData({ ...formData, salary: { ...(formData.salary || DEFAULT_SALARY), housing: Number(e.target.value) } })}
                                        disabled={isViewOnly}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white disabled:text-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1">{t('بدل النقل', 'Transportation')}</label>
                                    <input
                                        type="number"
                                        value={data?.salary?.transportation || 0}
                                        onChange={(e) => setFormData({ ...formData, salary: { ...(formData.salary || DEFAULT_SALARY), transportation: Number(e.target.value) } })}
                                        disabled={isViewOnly}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white disabled:text-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1">{t('بدل الطعام', 'Food')}</label>
                                    <input
                                        type="number"
                                        value={data?.salary?.food || 0}
                                        onChange={(e) => setFormData({ ...formData, salary: { ...(formData.salary || DEFAULT_SALARY), food: Number(e.target.value) } })}
                                        disabled={isViewOnly}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white disabled:text-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1">{t('بدل الهاتف', 'Phone')}</label>
                                    <input
                                        type="number"
                                        value={data?.salary?.phone || 0}
                                        onChange={(e) => setFormData({ ...formData, salary: { ...(formData.salary || DEFAULT_SALARY), phone: Number(e.target.value) } })}
                                        disabled={isViewOnly}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white disabled:text-slate-400"
                                    />
                                </div>
                                <div>
                                    <label className="block text-slate-400 text-sm mb-1">{t('بدلات أخرى', 'Other')}</label>
                                    <input
                                        type="number"
                                        value={data?.salary?.other || 0}
                                        onChange={(e) => setFormData({ ...formData, salary: { ...(formData.salary || DEFAULT_SALARY), other: Number(e.target.value) } })}
                                        disabled={isViewOnly}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white disabled:text-slate-400"
                                    />
                                </div>
                            </div>
                            <div className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-lg p-4 border border-green-500/30">
                                <div className="flex justify-between items-center">
                                    <span className="text-slate-300">{t('إجمالي الراتب', 'Total Salary')}</span>
                                    <span className="text-2xl font-bold text-green-400">
                                        {calculateTotalSalary(data?.salary || DEFAULT_SALARY).toLocaleString()} {t('ر.س', 'SAR')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'contract' && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-400 text-sm mb-1">{t('نوع العقد', 'Contract Type')}</label>
                                <select
                                    value={data?.contract?.type || 'permanent'}
                                    onChange={(e) => setFormData({ ...formData, contract: { ...(formData.contract || DEFAULT_CONTRACT), type: e.target.value as any } })}
                                    disabled={isViewOnly}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white disabled:text-slate-400"
                                >
                                    {Object.entries(CONTRACT_TRANSLATIONS).map(([type, trans]) => (
                                        <option key={type} value={type}>{language === 'ar' ? trans.ar : trans.en}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-1">{t('تاريخ بداية العقد', 'Contract Start')}</label>
                                <input
                                    type="date"
                                    value={data?.contract?.startDate || ''}
                                    onChange={(e) => setFormData({ ...formData, contract: { ...(formData.contract || DEFAULT_CONTRACT), startDate: e.target.value } })}
                                    disabled={isViewOnly}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white disabled:text-slate-400"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-1">{t('تاريخ نهاية العقد', 'Contract End')}</label>
                                <input
                                    type="date"
                                    value={data?.contract?.endDate || ''}
                                    onChange={(e) => setFormData({ ...formData, contract: { ...(formData.contract || DEFAULT_CONTRACT), endDate: e.target.value } })}
                                    disabled={isViewOnly}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white disabled:text-slate-400"
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 text-sm mb-1">{t('فترة الإشعار (أيام)', 'Notice Period (days)')}</label>
                                <input
                                    type="number"
                                    value={data?.contract?.noticePeriod || 30}
                                    onChange={(e) => setFormData({ ...formData, contract: { ...(formData.contract || DEFAULT_CONTRACT), noticePeriod: Number(e.target.value) } })}
                                    disabled={isViewOnly}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-2 text-white disabled:text-slate-400"
                                />
                            </div>
                        </div>
                    )}

                    {activeTab === 'warnings' && (
                        <div className="space-y-4">
                            {(data?.warnings || []).length === 0 ? (
                                <div className="text-center py-8 text-slate-400">
                                    <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                    <p>{t('لا توجد إنذارات', 'No warnings')}</p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {(data?.warnings || []).map((warning) => (
                                        <div key={warning.id} className={`rounded-lg p-4 border ${warning.type === 'final' ? 'bg-red-500/20 border-red-500/30' :
                                            warning.type === 'written' ? 'bg-orange-500/20 border-orange-500/30' :
                                                'bg-yellow-500/20 border-yellow-500/30'
                                            }`}>
                                            <div className="flex justify-between items-start">
                                                <div>
                                                    <span className={`px-2 py-1 rounded text-xs ${warning.type === 'final' ? 'bg-red-500 text-white' :
                                                        warning.type === 'written' ? 'bg-orange-500 text-white' :
                                                            'bg-yellow-500 text-black'
                                                        }`}>
                                                        {language === 'ar' ? WARNING_TRANSLATIONS[warning.type].ar : WARNING_TRANSLATIONS[warning.type].en}
                                                    </span>
                                                    <p className="text-white mt-2">{warning.reason || t('بدون سبب محدد', 'No reason specified')}</p>
                                                    <p className="text-slate-400 text-sm mt-1">{t('صادر بواسطة:', 'Issued by:')} {warning.issuedBy}</p>
                                                </div>
                                                <span className="text-slate-400 text-sm">{new Date(warning.date).toLocaleDateString('ar-SA')}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div className="space-y-6" dir={dir}>
            {/* Notification */}
            {notification && (
                <div className={`fixed top-4 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-lg shadow-lg z-50 ${notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
                    } text-white`}>
                    {notification.message}
                </div>
            )}

            {/* شريط انتحال الصفة - عندما يعمل المدير نيابة عن موظف الموارد البشرية */}
            {impersonationInfo && (
                <div className="fixed top-0 left-0 right-0 z-40 bg-gradient-to-r from-purple-600 to-indigo-600 text-white py-3 px-4 flex items-center justify-between shadow-lg">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <span className="font-bold text-lg">
                                    {t('🔐 وضع العمل نيابة عن موظف', '🔐 Working on Behalf of Employee')}
                                </span>
                            </div>
                            <p className="text-white/80 text-sm">
                                {t(
                                    `${impersonationInfo.impersonatorName} يعمل نيابة عن ${impersonationInfo.employeeName}`,
                                    `${impersonationInfo.impersonatorName} working as ${impersonationInfo.employeeName}`
                                )}
                                <span className="mx-2">•</span>
                                <span className="text-white/70">
                                    {t('جميع التعديلات ستُسجل باسم المدير', 'All changes will be logged under manager')}
                                </span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={endImpersonation}
                        className="px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors flex items-center gap-2"
                    >
                        <X className="w-4 h-4" />
                        {t('إنهاء والعودة', 'End & Return')}
                    </button>
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-slate-800 rounded-xl p-6 max-w-md w-full mx-4 border border-slate-700">
                        <h3 className="text-xl font-bold text-white mb-4">{t('تأكيد الحذف', 'Confirm Delete')}</h3>
                        <p className="text-slate-300 mb-6">{t('هل أنت متأكد من حذف هذا الموظف؟', 'Are you sure you want to delete this employee?')}</p>
                        <div className="flex gap-3">
                            <button onClick={() => setShowDeleteConfirm(false)} className="flex-1 bg-slate-700 text-white py-2 rounded-lg hover:bg-slate-600">
                                {t('إلغاء', 'Cancel')}
                            </button>
                            <button onClick={handleDelete} className="flex-1 bg-red-500 text-white py-2 rounded-lg hover:bg-red-600">
                                {t('حذف', 'Delete')}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Welcome */}
            <div className={`bg-gradient-to-r ${isSuperAdminUser ? 'from-amber-500/20 to-yellow-500/20 border-amber-500/30' : 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'} rounded-xl p-6 border`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${isSuperAdminUser ? 'from-amber-500 to-yellow-600' : 'from-blue-500 to-cyan-600'} flex items-center justify-center`}>
                            <Users className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                {t('إدارة الموارد البشرية', 'Human Resources Management')}
                                {isSuperAdminUser && (
                                    <span className="bg-gradient-to-r from-amber-500 to-yellow-600 text-white text-xs px-3 py-1 rounded-full font-medium">
                                        {t('المدير العام', 'Super Admin')}
                                    </span>
                                )}
                            </h2>
                            <p className="text-slate-400">
                                {isSuperAdminUser
                                    ? t('لوحة الإدارة والرقابة الشاملة', 'Full Administration & Oversight Panel')
                                    : t('إدارة شاملة لبيانات الموظفين', 'Comprehensive employee data management')
                                }
                            </p>
                        </div>
                    </div>
                    {isSuperAdminUser && (
                        <div className="hidden md:flex items-center gap-2 text-amber-400 text-sm">
                            <AlertTriangle className="w-4 h-4" />
                            {t('مستثنى من التتبع', 'Excluded from tracking')}
                        </div>
                    )}
                </div>
            </div>

            {/* Stats - لوحة المدير العام أو الإحصائيات العادية */}
            {viewMode === 'list' && isSuperAdminUser && renderSuperAdminPanel()}
            {viewMode === 'list' && !isSuperAdminUser && renderStats()}

            {/* Main Content */}
            {viewMode === 'list' && renderEmployeeList()}
            {viewMode === 'attendance' && renderAttendance()}
            {(viewMode === 'add' || viewMode === 'edit' || viewMode === 'view') && renderForm()}
        </div>
    );
};

export default HRPage;
