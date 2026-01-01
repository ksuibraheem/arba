/**
 * نظام إدارة الموظفين الشامل
 * Comprehensive Employee Management System
 */

// أنواع أدوار الموظفين
export type EmployeeRole =
    | 'manager'      // المدير
    | 'deputy'       // نائب المدير
    | 'accountant'   // المحاسب
    | 'hr'           // الموارد البشرية
    | 'developer'    // المبرمج
    | 'support'      // الدعم الفني
    | 'marketing'    // التسويق
    | 'quality';     // الجودة

// نوع العقد
export type ContractType = 'permanent' | 'temporary' | 'contract' | 'parttime';

// نوع الإنذار
export type WarningType = 'verbal' | 'written' | 'final';

// الشهادة
export interface Certificate {
    id: string;
    name: string;           // اسم الشهادة
    issuer: string;         // الجهة المانحة
    issueDate: string;      // تاريخ الإصدار
    expiryDate?: string;    // تاريخ الانتهاء
    attachmentUrl?: string; // رابط المرفق
}

// الخبرة العملية
export interface Experience {
    id: string;
    company: string;        // اسم الشركة
    position: string;       // المسمى الوظيفي
    startDate: string;      // تاريخ البداية
    endDate?: string;       // تاريخ النهاية
    description?: string;   // وصف المهام
    isCurrent?: boolean;    // وظيفة حالية
}

// هيكل الراتب
export interface SalaryStructure {
    basic: number;          // الراتب الأساسي
    housing: number;        // بدل السكن
    transportation: number; // بدل النقل
    food: number;           // بدل الطعام
    phone: number;          // بدل الهاتف
    other: number;          // بدلات أخرى
    benefits: string[];     // المزايا الإضافية
}

// بيانات العقد
export interface ContractInfo {
    type: ContractType;     // نوع العقد
    startDate: string;      // تاريخ بداية العقد
    endDate?: string;       // تاريخ نهاية العقد
    noticePeriod: number;   // فترة الإشعار (بالأيام)
    probationEnd?: string;  // نهاية فترة التجربة
}

// الملاحظة
export interface Note {
    id: string;
    date: string;
    content: string;
    addedBy: string;
    category?: 'general' | 'performance' | 'attendance' | 'other';
}

// الإنذار
export interface Warning {
    id: string;
    date: string;
    type: WarningType;
    reason: string;
    issuedBy: string;
    acknowledged?: boolean;
    acknowledgedDate?: string;
}

// فترة الاستراحة
export interface BreakRecord {
    id: string;
    startTime: string;      // وقت بدء الاستراحة
    endTime?: string;       // وقت نهاية الاستراحة
    duration?: number;      // المدة بالدقائق
    type: 'prayer' | 'lunch' | 'personal' | 'other'; // نوع الاستراحة
}

// ملخص المهمة
export interface TaskSummary {
    id: string;
    title: string;          // عنوان المهمة
    description?: string;   // وصف المهمة
    status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
    startTime?: string;     // وقت البدء
    endTime?: string;       // وقت الانتهاء
    priority: 'low' | 'medium' | 'high';
}

// سجل الحضور اليومي
export interface AttendanceRecord {
    id: string;
    employeeId: string;
    employeeNumber: string;
    employeeName: string;
    date: string;           // تاريخ اليوم YYYY-MM-DD
    clockIn?: string;       // وقت تسجيل الدخول
    clockOut?: string;      // وقت تسجيل الخروج
    breaks: BreakRecord[];  // فترات الاستراحة
    tasks: TaskSummary[];   // المهام اليومية
    totalWorkMinutes?: number;    // إجمالي دقائق العمل
    totalBreakMinutes?: number;   // إجمالي دقائق الاستراحة
    status: 'present' | 'absent' | 'late' | 'early_leave' | 'on_leave';
    notes?: string;         // ملاحظات
}

// ترجمات حالة الحضور
export const ATTENDANCE_STATUS_TRANSLATIONS: Record<AttendanceRecord['status'], { ar: string; en: string }> = {
    present: { ar: 'حاضر', en: 'Present' },
    absent: { ar: 'غائب', en: 'Absent' },
    late: { ar: 'متأخر', en: 'Late' },
    early_leave: { ar: 'خروج مبكر', en: 'Early Leave' },
    on_leave: { ar: 'إجازة', en: 'On Leave' }
};

// ترجمات نوع الاستراحة
export const BREAK_TYPE_TRANSLATIONS: Record<BreakRecord['type'], { ar: string; en: string }> = {
    prayer: { ar: 'صلاة', en: 'Prayer' },
    lunch: { ar: 'غداء', en: 'Lunch' },
    personal: { ar: 'شخصي', en: 'Personal' },
    other: { ar: 'أخرى', en: 'Other' }
};

// بيانات الموظف الشاملة
export interface Employee {
    id: string;
    employeeNumber: string;     // رقم الموظف

    // البيانات الشخصية
    name: string;
    email: string;
    phone: string;              // رقم الجوال
    emergencyContact: string;   // رقم الطوارئ
    nationalId?: string;        // رقم الهوية
    birthDate?: string;         // تاريخ الميلاد
    nationality?: string;       // الجنسية
    address?: string;           // العنوان

    // بيانات الوظيفة
    role: EmployeeRole;
    department?: string;        // القسم
    jobTitle?: string;          // المسمى الوظيفي
    professionalClass?: string; // التصنيف المهني

    // المؤهلات والخبرات
    certificates: Certificate[];
    experiences: Experience[];
    skills?: string[];          // المهارات

    // الراتب والمزايا
    salary: SalaryStructure;

    // العقد
    contract: ContractInfo;

    // الملاحظات والإنذارات
    notes: Note[];
    warnings: Warning[];

    // بيانات النظام
    password: string;
    isActive: boolean;
    createdAt: Date;
    lastLogin?: Date;
    passwordChangedAt?: Date;
    profileImage?: string;      // صورة الموظف
}

// بيانات المدير الافتراضية
const DEFAULT_MANAGER_CREDENTIALS = {
    employeeNumber: '2201187',
    password: 'Aa0591529339',
    name: 'المدير العام',
    role: 'manager' as EmployeeRole,
    email: 'manager@arba.sa',
    phone: '0500000000'
};

// مفتاح تخزين بيانات المدير
const MANAGER_STORAGE_KEY = 'arba_manager_credentials';

// الحصول على بيانات المدير من التخزين المحلي
export const getManagerCredentials = (): typeof DEFAULT_MANAGER_CREDENTIALS => {
    const stored = localStorage.getItem(MANAGER_STORAGE_KEY);
    if (stored) {
        try {
            return { ...DEFAULT_MANAGER_CREDENTIALS, ...JSON.parse(stored) };
        } catch {
            return DEFAULT_MANAGER_CREDENTIALS;
        }
    }
    return DEFAULT_MANAGER_CREDENTIALS;
};

// تحديث بيانات المدير
export const updateManagerCredentials = (updates: Partial<typeof DEFAULT_MANAGER_CREDENTIALS>): typeof DEFAULT_MANAGER_CREDENTIALS => {
    const current = getManagerCredentials();
    const updated = { ...current, ...updates };
    localStorage.setItem(MANAGER_STORAGE_KEY, JSON.stringify(updated));
    return updated;
};

// للتوافق مع الكود القديم - يعمل كـ getter ديناميكي
export const MANAGER_CREDENTIALS = getManagerCredentials();

// ====================== Super Admin (المدير العام) ======================

// رقم المدير العام - يمتلك كافة الصلاحيات
export const SUPER_ADMIN_EMPLOYEE_NUMBER = '2201187';

/**
 * التحقق إذا كان الموظف هو المدير العام (Super Admin)
 * @param employeeNumber رقم الموظف
 * @returns true إذا كان المدير العام
 */
export const isSuperAdmin = (employeeNumber: string | undefined): boolean => {
    return employeeNumber === SUPER_ADMIN_EMPLOYEE_NUMBER;
};

/**
 * التحقق إذا كان يجب استثناء الموظف من تتبع النشاط
 * المدير العام مستثنى من نظام heartbeat وتتبع النشاط
 * @param employeeNumber رقم الموظف
 * @returns true إذا كان يجب استثناءه
 */
export const isExcludedFromActivityTracking = (employeeNumber: string | undefined): boolean => {
    return isSuperAdmin(employeeNumber);
};

/**
 * التحقق إذا كان الموظف لديه صلاحيات كاملة
 * المدير العام يمكنه الوصول لجميع التبويبات والبيانات
 * @param employeeNumber رقم الموظف
 * @returns true إذا كان لديه صلاحيات كاملة
 */
export const hasFullPermissions = (employeeNumber: string | undefined): boolean => {
    return isSuperAdmin(employeeNumber);
};

/**
 * التحقق إذا كان يجب إخفاء إحصائيات الحضور والإنتاجية
 * @param employeeNumber رقم الموظف
 * @returns true إذا كان يجب إخفاء الإحصائيات
 */
export const shouldHideActivityStats = (employeeNumber: string | undefined): boolean => {
    return isSuperAdmin(employeeNumber);
};

// ترجمات الأدوار
export const ROLE_TRANSLATIONS: Record<EmployeeRole, { ar: string; en: string }> = {
    manager: { ar: 'المدير', en: 'Manager' },
    deputy: { ar: 'نائب المدير', en: 'Deputy Manager' },
    accountant: { ar: 'المحاسب', en: 'Accountant' },
    hr: { ar: 'الموارد البشرية', en: 'Human Resources' },
    developer: { ar: 'المبرمج', en: 'Developer' },
    support: { ar: 'الدعم الفني', en: 'Technical Support' },
    marketing: { ar: 'التسويق', en: 'Marketing' },
    quality: { ar: 'الجودة', en: 'Quality' }
};

// ترجمات نوع العقد
export const CONTRACT_TRANSLATIONS: Record<ContractType, { ar: string; en: string }> = {
    permanent: { ar: 'دائم', en: 'Permanent' },
    temporary: { ar: 'مؤقت', en: 'Temporary' },
    contract: { ar: 'تعاقد', en: 'Contract' },
    parttime: { ar: 'دوام جزئي', en: 'Part-time' }
};

// ترجمات نوع الإنذار
export const WARNING_TRANSLATIONS: Record<WarningType, { ar: string; en: string }> = {
    verbal: { ar: 'شفهي', en: 'Verbal' },
    written: { ar: 'كتابي', en: 'Written' },
    final: { ar: 'نهائي', en: 'Final' }
};

// أيقونات الأدوار
export const ROLE_ICONS: Record<EmployeeRole, string> = {
    manager: 'Crown',
    deputy: 'UserCog',
    accountant: 'Calculator',
    hr: 'Users',
    developer: 'Code',
    support: 'Headphones',
    marketing: 'Megaphone',
    quality: 'CheckCircle'
};

// ألوان الأدوار
export const ROLE_COLORS: Record<EmployeeRole, string> = {
    manager: 'from-amber-500 to-yellow-600',
    deputy: 'from-purple-500 to-indigo-600',
    accountant: 'from-green-500 to-emerald-600',
    hr: 'from-blue-500 to-cyan-600',
    developer: 'from-slate-500 to-gray-600',
    support: 'from-orange-500 to-red-600',
    marketing: 'from-pink-500 to-rose-600',
    quality: 'from-teal-500 to-green-600'
};

// القيم الافتراضية للراتب
export const DEFAULT_SALARY: SalaryStructure = {
    basic: 0,
    housing: 0,
    transportation: 0,
    food: 0,
    phone: 0,
    other: 0,
    benefits: []
};

// القيم الافتراضية للعقد
export const DEFAULT_CONTRACT: ContractInfo = {
    type: 'permanent',
    startDate: new Date().toISOString().split('T')[0],
    noticePeriod: 30
};

// حساب إجمالي الراتب
export const calculateTotalSalary = (salary: SalaryStructure): number => {
    return salary.basic + salary.housing + salary.transportation + salary.food + salary.phone + salary.other;
};

// بيانات موظفين تجريبية
export const SAMPLE_EMPLOYEES: Partial<Employee>[] = [
    {
        employeeNumber: '412345678',
        name: 'أحمد محمد العلي',
        email: 'ahmed@arba.sa',
        phone: '0501234567',
        emergencyContact: '0559876543',
        role: 'hr',
        jobTitle: 'مسؤول موارد بشرية',
        nationalId: '1098765432',
        salary: { basic: 8000, housing: 2000, transportation: 500, food: 300, phone: 200, other: 0, benefits: ['تأمين طبي', 'تأمين سيارة'] },
        contract: { type: 'permanent', startDate: '2023-01-15', noticePeriod: 60 },
        certificates: [
            { id: '1', name: 'بكالوريوس إدارة أعمال', issuer: 'جامعة الملك سعود', issueDate: '2018-06-15' },
            { id: '2', name: 'شهادة PHR', issuer: 'HRCI', issueDate: '2022-03-20', expiryDate: '2025-03-20' }
        ],
        experiences: [
            { id: '1', company: 'شركة سابك', position: 'أخصائي موارد بشرية', startDate: '2018-08-01', endDate: '2022-12-31' }
        ],
        notes: [],
        warnings: []
    },
    {
        employeeNumber: '423456789',
        name: 'فاطمة عبدالله السعود',
        email: 'fatima@arba.sa',
        phone: '0512345678',
        emergencyContact: '0558765432',
        role: 'accountant',
        jobTitle: 'محاسب أول',
        nationalId: '1087654321',
        salary: { basic: 10000, housing: 2500, transportation: 500, food: 300, phone: 200, other: 500, benefits: ['تأمين طبي'] },
        contract: { type: 'permanent', startDate: '2022-06-01', noticePeriod: 60 },
        certificates: [
            { id: '1', name: 'بكالوريوس محاسبة', issuer: 'جامعة الملك فهد', issueDate: '2017-06-15' },
            { id: '2', name: 'زمالة SOCPA', issuer: 'الهيئة السعودية للمحاسبين', issueDate: '2021-09-10' }
        ],
        experiences: [
            { id: '1', company: 'شركة أرامكو', position: 'محاسب', startDate: '2017-09-01', endDate: '2022-05-31' }
        ],
        notes: [],
        warnings: []
    },
    {
        employeeNumber: '434567890',
        name: 'خالد سعد الدوسري',
        email: 'khaled@arba.sa',
        phone: '0523456789',
        emergencyContact: '0557654321',
        role: 'developer',
        jobTitle: 'مطور برمجيات',
        nationalId: '1076543210',
        salary: { basic: 12000, housing: 3000, transportation: 500, food: 300, phone: 300, other: 0, benefits: ['تأمين طبي', 'لابتوب'] },
        contract: { type: 'permanent', startDate: '2023-03-01', noticePeriod: 30 },
        certificates: [
            { id: '1', name: 'بكالوريوس علوم حاسب', issuer: 'جامعة الملك عبدالعزيز', issueDate: '2019-06-15' }
        ],
        experiences: [
            { id: '1', company: 'شركة STC', position: 'مبرمج', startDate: '2019-08-01', endDate: '2023-02-28' }
        ],
        notes: [],
        warnings: []
    }
];

// خدمة إدارة الموظفين
class EmployeeService {
    private storageKey = 'arba_employees';

    // تهيئة البيانات التجريبية
    // كلمة المرور الافتراضية = رقم الهوية الوطنية
    initializeSampleData(): void {
        const existing = this.getEmployees();
        if (existing.length === 0) {
            SAMPLE_EMPLOYEES.forEach(emp => {
                try {
                    this.addEmployee({
                        ...emp as any,
                        password: emp.nationalId // استخدام رقم الهوية ككلمة مرور
                    });
                } catch (e) {
                    // تجاهل الأخطاء
                }
            });
        }
    }

    // الحصول على جميع الموظفين
    getEmployees(): Employee[] {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    // الحصول على موظف بالمعرف
    getEmployeeById(id: string): Employee | null {
        const employees = this.getEmployees();
        return employees.find(e => e.id === id) || null;
    }

    // الحصول على موظف برقم الموظف
    getEmployeeByNumber(employeeNumber: string): Employee | null {
        const employees = this.getEmployees();
        return employees.find(e => e.employeeNumber === employeeNumber) || null;
    }

    // إضافة موظف جديد
    // كلمة المرور الافتراضية = رقم الهوية الوطنية
    addEmployee(employee: Omit<Employee, 'id' | 'createdAt' | 'isActive'>): Employee {
        const employees = this.getEmployees();

        // التحقق من عدم تكرار رقم الموظف
        if (employees.some(e => e.employeeNumber === employee.employeeNumber)) {
            throw new Error('رقم الموظف موجود مسبقاً');
        }

        // التحقق من وجود رقم الهوية (مطلوب لكلمة المرور الافتراضية)
        if (!employee.nationalId || employee.nationalId.trim() === '') {
            throw new Error('رقم الهوية الوطنية مطلوب');
        }

        // كلمة المرور الافتراضية = رقم الهوية الوطنية
        const defaultPassword = employee.nationalId;

        const newEmployee: Employee = {
            ...employee,
            id: crypto.randomUUID(),
            isActive: true,
            createdAt: new Date(),
            password: employee.password || defaultPassword, // استخدام رقم الهوية كافتراضي
            certificates: employee.certificates || [],
            experiences: employee.experiences || [],
            notes: employee.notes || [],
            warnings: employee.warnings || [],
            salary: employee.salary || DEFAULT_SALARY,
            contract: employee.contract || DEFAULT_CONTRACT
        };

        employees.push(newEmployee);
        localStorage.setItem(this.storageKey, JSON.stringify(employees));

        // إنشاء سجل حضور للموظف الجديد لليوم الحالي
        this.createAttendanceForEmployee(newEmployee);

        return newEmployee;
    }

    // تحديث بيانات موظف
    // الموظف لا يمكنه تغيير رقم الموظف - فقط المدير العام يستطيع
    updateEmployee(id: string, updates: Partial<Employee>, updatedByEmployeeNumber?: string): Employee | null {
        const employees = this.getEmployees();
        const index = employees.findIndex(e => e.id === id);

        if (index === -1) return null;

        // منع تغيير رقم الموظف إلا من قبل المدير العام
        if (updates.employeeNumber && updates.employeeNumber !== employees[index].employeeNumber) {
            if (!isSuperAdmin(updatedByEmployeeNumber)) {
                throw new Error('لا يمكن تغيير رقم الموظف');
            }
        }

        employees[index] = { ...employees[index], ...updates };
        localStorage.setItem(this.storageKey, JSON.stringify(employees));

        // تحديث سجلات الحضور إذا تغير الاسم أو رقم الموظف
        if (updates.name || updates.employeeNumber) {
            this.updateAttendanceEmployeeInfo(id, {
                employeeName: employees[index].name,
                employeeNumber: employees[index].employeeNumber
            });
        }

        return employees[index];
    }

    // تحديث معلومات الموظف في سجلات الحضور
    private updateAttendanceEmployeeInfo(employeeId: string, info: { employeeName: string; employeeNumber: string }): void {
        let records = this.getAttendanceRecords();
        let updated = false;

        records = records.map(r => {
            if (r.employeeId === employeeId) {
                updated = true;
                return { ...r, employeeName: info.employeeName, employeeNumber: info.employeeNumber };
            }
            return r;
        });

        if (updated) {
            this.saveAttendanceRecords(records);
        }
    }

    // حذف موظف
    deleteEmployee(id: string): boolean {
        const employees = this.getEmployees();
        const filtered = employees.filter(e => e.id !== id);

        if (filtered.length === employees.length) return false;

        localStorage.setItem(this.storageKey, JSON.stringify(filtered));
        return true;
    }

    // إضافة شهادة لموظف
    addCertificate(employeeId: string, certificate: Omit<Certificate, 'id'>): Certificate | null {
        const employee = this.getEmployeeById(employeeId);
        if (!employee) return null;

        const newCert: Certificate = {
            ...certificate,
            id: crypto.randomUUID()
        };

        const updated = this.updateEmployee(employeeId, {
            certificates: [...employee.certificates, newCert]
        });

        return updated ? newCert : null;
    }

    // حذف شهادة
    deleteCertificate(employeeId: string, certificateId: string): boolean {
        const employee = this.getEmployeeById(employeeId);
        if (!employee) return false;

        const updated = this.updateEmployee(employeeId, {
            certificates: employee.certificates.filter(c => c.id !== certificateId)
        });

        return updated !== null;
    }

    // إضافة خبرة لموظف
    addExperience(employeeId: string, experience: Omit<Experience, 'id'>): Experience | null {
        const employee = this.getEmployeeById(employeeId);
        if (!employee) return null;

        const newExp: Experience = {
            ...experience,
            id: crypto.randomUUID()
        };

        const updated = this.updateEmployee(employeeId, {
            experiences: [...employee.experiences, newExp]
        });

        return updated ? newExp : null;
    }

    // حذف خبرة
    deleteExperience(employeeId: string, experienceId: string): boolean {
        const employee = this.getEmployeeById(employeeId);
        if (!employee) return false;

        const updated = this.updateEmployee(employeeId, {
            experiences: employee.experiences.filter(e => e.id !== experienceId)
        });

        return updated !== null;
    }

    // إضافة ملاحظة
    addNote(employeeId: string, note: Omit<Note, 'id' | 'date'>): Note | null {
        const employee = this.getEmployeeById(employeeId);
        if (!employee) return null;

        const newNote: Note = {
            ...note,
            id: crypto.randomUUID(),
            date: new Date().toISOString()
        };

        const updated = this.updateEmployee(employeeId, {
            notes: [...employee.notes, newNote]
        });

        return updated ? newNote : null;
    }

    // إضافة إنذار
    addWarning(employeeId: string, warning: Omit<Warning, 'id' | 'date'>): Warning | null {
        const employee = this.getEmployeeById(employeeId);
        if (!employee) return null;

        const newWarning: Warning = {
            ...warning,
            id: crypto.randomUUID(),
            date: new Date().toISOString()
        };

        const updated = this.updateEmployee(employeeId, {
            warnings: [...employee.warnings, newWarning]
        });

        return updated ? newWarning : null;
    }

    // تسجيل دخول موظف
    login(employeeNumber: string, password: string): { success: boolean; employee?: Employee | ReturnType<typeof getManagerCredentials>; error?: string } {
        // تهيئة البيانات التجريبية إذا لم تكن موجودة
        this.initializeSampleData();

        // التحقق من المدير أولاً
        const managerCreds = getManagerCredentials();
        if (employeeNumber === managerCreds.employeeNumber) {
            if (password === managerCreds.password) {
                return {
                    success: true,
                    employee: managerCreds
                };
            }
            return { success: false, error: 'الرقم السري غير صحيح' };
        }

        // التحقق من الموظفين
        const employees = this.getEmployees();
        const employee = employees.find(e => e.employeeNumber === employeeNumber);

        if (!employee) {
            return { success: false, error: 'رقم الموظف غير موجود' };
        }

        if (!employee.isActive) {
            return { success: false, error: 'حساب الموظف غير مفعل' };
        }

        if (employee.password !== password) {
            return { success: false, error: 'الرقم السري غير صحيح' };
        }

        // تحديث آخر تسجيل دخول
        this.updateEmployee(employee.id, { lastLogin: new Date() });

        return { success: true, employee };
    }

    // تغيير كلمة المرور
    changePassword(employeeNumber: string, oldPassword: string, newPassword: string): { success: boolean; error?: string } {
        const employees = this.getEmployees();
        const employee = employees.find(e => e.employeeNumber === employeeNumber);

        if (!employee) {
            return { success: false, error: 'الموظف غير موجود' };
        }

        if (employee.password !== oldPassword) {
            return { success: false, error: 'الرقم السري الحالي غير صحيح' };
        }

        this.updateEmployee(employee.id, {
            password: newPassword,
            passwordChangedAt: new Date()
        });

        return { success: true };
    }

    // إعادة تعيين كلمة المرور
    // إذا لم يتم تحديد كلمة مرور جديدة، يتم استخدام رقم الهوية
    resetPassword(employeeId: string, newPassword?: string): boolean {
        const employee = this.getEmployeeById(employeeId);
        if (!employee) return false;

        // استخدام رقم الهوية كافتراضي إذا لم يتم تحديد كلمة مرور
        const passwordToSet = newPassword || employee.nationalId || '';

        if (!passwordToSet) {
            return false; // لا يمكن إعادة التعيين بدون رقم هوية
        }

        const result = this.updateEmployee(employeeId, {
            password: passwordToSet,
            passwordChangedAt: new Date()
        });
        return result !== null;
    }

    // توليد رقم موظف عشوائي
    generateEmployeeNumber(): string {
        const prefix = '4';
        const randomDigits = Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
        return prefix + randomDigits;
    }

    // توليد كلمة مرور عشوائية
    generatePassword(): string {
        return Math.floor(Math.random() * 100000000).toString().padStart(8, '0');
    }

    // البحث في الموظفين
    searchEmployees(query: string): Employee[] {
        const employees = this.getEmployees();
        const lowerQuery = query.toLowerCase();
        return employees.filter(e =>
            e.name.toLowerCase().includes(lowerQuery) ||
            e.employeeNumber.includes(query) ||
            e.email.toLowerCase().includes(lowerQuery) ||
            e.phone?.includes(query)
        );
    }

    // فلترة حسب الدور
    filterByRole(role: EmployeeRole): Employee[] {
        return this.getEmployees().filter(e => e.role === role);
    }

    // إحصائيات الموظفين
    getStatistics(): {
        total: number;
        active: number;
        inactive: number;
        byRole: Record<EmployeeRole, number>;
        totalSalaries: number;
        warningsCount: number;
    } {
        const employees = this.getEmployees();
        const byRole: Record<EmployeeRole, number> = {
            manager: 0, deputy: 0, accountant: 0, hr: 0,
            developer: 0, support: 0, marketing: 0, quality: 0
        };

        let totalSalaries = 0;
        let warningsCount = 0;

        employees.forEach(e => {
            byRole[e.role]++;
            totalSalaries += calculateTotalSalary(e.salary);
            warningsCount += e.warnings.length;
        });

        return {
            total: employees.length,
            active: employees.filter(e => e.isActive).length,
            inactive: employees.filter(e => !e.isActive).length,
            byRole,
            totalSalaries,
            warningsCount
        };
    }

    // ====================== نظام الحضور والانصراف ======================

    private attendanceStorageKey = 'arba_attendance';

    // الحصول على جميع سجلات الحضور
    getAttendanceRecords(): AttendanceRecord[] {
        const data = localStorage.getItem(this.attendanceStorageKey);
        return data ? JSON.parse(data) : [];
    }

    // حفظ سجلات الحضور
    private saveAttendanceRecords(records: AttendanceRecord[]): void {
        localStorage.setItem(this.attendanceStorageKey, JSON.stringify(records));
    }

    // الحصول على سجلات حضور يوم معين
    getAttendanceByDate(date: string): AttendanceRecord[] {
        return this.getAttendanceRecords().filter(r => r.date === date);
    }

    // الحصول على سجل حضور موظف لليوم
    getTodayAttendance(employeeId: string): AttendanceRecord | null {
        const today = new Date().toISOString().split('T')[0];
        const records = this.getAttendanceRecords();
        return records.find(r => r.employeeId === employeeId && r.date === today) || null;
    }

    // إنشاء سجل حضور لموظف معين (يُستخدم عند إضافة موظف جديد)
    createAttendanceForEmployee(employee: Employee): AttendanceRecord {
        const today = new Date().toISOString().split('T')[0];
        let records = this.getAttendanceRecords();

        // التحقق من عدم وجود سجل مسبق
        const existingRecord = records.find(r => r.employeeId === employee.id && r.date === today);
        if (existingRecord) {
            return existingRecord;
        }

        const newRecord: AttendanceRecord = {
            id: crypto.randomUUID(),
            employeeId: employee.id,
            employeeNumber: employee.employeeNumber,
            employeeName: employee.name,
            date: today,
            breaks: [],
            tasks: [],
            status: 'absent'
        };

        records.push(newRecord);
        this.saveAttendanceRecords(records);
        return newRecord;
    }

    // تسجيل دخول الموظف
    clockIn(employeeId: string): AttendanceRecord | null {
        const employee = this.getEmployeeById(employeeId);
        if (!employee) return null;

        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toISOString();

        // التحقق من عدم وجود تسجيل دخول سابق لليوم
        let records = this.getAttendanceRecords();
        let existingRecord = records.find(r => r.employeeId === employeeId && r.date === today);

        if (existingRecord && existingRecord.clockIn) {
            // تحديث وقت الدخول إذا كان موجود
            return existingRecord;
        }

        // تحديد حالة الحضور (متأخر إذا بعد 9 صباحاً)
        const currentHour = new Date().getHours();
        const status: AttendanceRecord['status'] = currentHour >= 9 ? 'late' : 'present';

        if (existingRecord) {
            // تحديث السجل الموجود
            existingRecord.clockIn = now;
            existingRecord.status = status;
        } else {
            // إنشاء سجل جديد
            existingRecord = {
                id: crypto.randomUUID(),
                employeeId: employee.id,
                employeeNumber: employee.employeeNumber,
                employeeName: employee.name,
                date: today,
                clockIn: now,
                breaks: [],
                tasks: [],
                status
            };
            records.push(existingRecord);
        }

        this.saveAttendanceRecords(records);
        return existingRecord;
    }

    // تسجيل خروج الموظف
    clockOut(employeeId: string): AttendanceRecord | null {
        const today = new Date().toISOString().split('T')[0];
        const now = new Date().toISOString();

        let records = this.getAttendanceRecords();
        const recordIndex = records.findIndex(r => r.employeeId === employeeId && r.date === today);

        if (recordIndex === -1) return null;

        const record = records[recordIndex];
        record.clockOut = now;

        // حساب إجمالي ساعات العمل
        if (record.clockIn) {
            const clockInTime = new Date(record.clockIn).getTime();
            const clockOutTime = new Date(now).getTime();
            record.totalWorkMinutes = Math.round((clockOutTime - clockInTime) / 60000);

            // طرح وقت الاستراحات
            const totalBreakMinutes = record.breaks.reduce((sum, b) => sum + (b.duration || 0), 0);
            record.totalWorkMinutes -= totalBreakMinutes;
            record.totalBreakMinutes = totalBreakMinutes;
        }

        // تحديد إذا كان خروج مبكر (قبل 5 مساءً)
        const currentHour = new Date().getHours();
        if (currentHour < 17 && record.status === 'present') {
            record.status = 'early_leave';
        }

        records[recordIndex] = record;
        this.saveAttendanceRecords(records);
        return record;
    }

    // بدء استراحة
    startBreak(employeeId: string, type: BreakRecord['type'] = 'other'): BreakRecord | null {
        const today = new Date().toISOString().split('T')[0];
        let records = this.getAttendanceRecords();
        const recordIndex = records.findIndex(r => r.employeeId === employeeId && r.date === today);

        if (recordIndex === -1) return null;

        const newBreak: BreakRecord = {
            id: crypto.randomUUID(),
            startTime: new Date().toISOString(),
            type
        };

        records[recordIndex].breaks.push(newBreak);
        this.saveAttendanceRecords(records);
        return newBreak;
    }

    // إنهاء استراحة
    endBreak(employeeId: string, breakId: string): BreakRecord | null {
        const today = new Date().toISOString().split('T')[0];
        let records = this.getAttendanceRecords();
        const recordIndex = records.findIndex(r => r.employeeId === employeeId && r.date === today);

        if (recordIndex === -1) return null;

        const breakIndex = records[recordIndex].breaks.findIndex(b => b.id === breakId);
        if (breakIndex === -1) return null;

        const breakRecord = records[recordIndex].breaks[breakIndex];
        breakRecord.endTime = new Date().toISOString();

        // حساب مدة الاستراحة بالدقائق
        const startTime = new Date(breakRecord.startTime).getTime();
        const endTime = new Date(breakRecord.endTime).getTime();
        breakRecord.duration = Math.round((endTime - startTime) / 60000);

        records[recordIndex].breaks[breakIndex] = breakRecord;
        this.saveAttendanceRecords(records);
        return breakRecord;
    }

    // إضافة مهمة
    addTask(employeeId: string, task: Omit<TaskSummary, 'id'>): TaskSummary | null {
        const today = new Date().toISOString().split('T')[0];
        let records = this.getAttendanceRecords();
        const recordIndex = records.findIndex(r => r.employeeId === employeeId && r.date === today);

        if (recordIndex === -1) return null;

        const newTask: TaskSummary = {
            ...task,
            id: crypto.randomUUID()
        };

        records[recordIndex].tasks.push(newTask);
        this.saveAttendanceRecords(records);
        return newTask;
    }

    // تحديث مهمة
    updateTask(employeeId: string, taskId: string, updates: Partial<TaskSummary>): TaskSummary | null {
        const today = new Date().toISOString().split('T')[0];
        let records = this.getAttendanceRecords();
        const recordIndex = records.findIndex(r => r.employeeId === employeeId && r.date === today);

        if (recordIndex === -1) return null;

        const taskIndex = records[recordIndex].tasks.findIndex(t => t.id === taskId);
        if (taskIndex === -1) return null;

        records[recordIndex].tasks[taskIndex] = {
            ...records[recordIndex].tasks[taskIndex],
            ...updates
        };

        this.saveAttendanceRecords(records);
        return records[recordIndex].tasks[taskIndex];
    }

    // إحصائيات الحضور لفترة معينة
    getAttendanceStats(startDate: string, endDate: string): {
        totalDays: number;
        presentDays: number;
        lateDays: number;
        absentDays: number;
        averageWorkHours: number;
        averageBreakMinutes: number;
    } {
        const records = this.getAttendanceRecords().filter(r =>
            r.date >= startDate && r.date <= endDate
        );

        const presentRecords = records.filter(r => r.status === 'present' || r.status === 'late');
        const totalWorkMinutes = presentRecords.reduce((sum, r) => sum + (r.totalWorkMinutes || 0), 0);
        const totalBreakMinutes = presentRecords.reduce((sum, r) => sum + (r.totalBreakMinutes || 0), 0);

        return {
            totalDays: records.length,
            presentDays: records.filter(r => r.status === 'present').length,
            lateDays: records.filter(r => r.status === 'late').length,
            absentDays: records.filter(r => r.status === 'absent').length,
            averageWorkHours: presentRecords.length > 0 ? (totalWorkMinutes / presentRecords.length) / 60 : 0,
            averageBreakMinutes: presentRecords.length > 0 ? totalBreakMinutes / presentRecords.length : 0
        };
    }

    // تهيئة حضور اليوم لجميع الموظفين (يُستدعى تلقائياً)
    initializeTodayAttendance(): void {
        const today = new Date().toISOString().split('T')[0];
        const employees = this.getEmployees();
        let records = this.getAttendanceRecords();

        employees.forEach(emp => {
            const exists = records.some(r => r.employeeId === emp.id && r.date === today);
            if (!exists) {
                records.push({
                    id: crypto.randomUUID(),
                    employeeId: emp.id,
                    employeeNumber: emp.employeeNumber,
                    employeeName: emp.name,
                    date: today,
                    breaks: [],
                    tasks: [],
                    status: 'absent'
                });
            }
        });

        this.saveAttendanceRecords(records);
    }
}

export const employeeService = new EmployeeService();
export default employeeService;

