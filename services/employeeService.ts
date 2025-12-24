/**
 * نظام إدارة الموظفين
 * Employee Management System
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

// بيانات الموظف
export interface Employee {
    id: string;
    employeeNumber: string;  // رقم الموظف
    name: string;
    email: string;
    phone?: string;
    role: EmployeeRole;
    password: string;
    isActive: boolean;
    createdAt: Date;
    lastLogin?: Date;
    passwordChangedAt?: Date;
}

// بيانات المدير الثابتة
export const MANAGER_CREDENTIALS = {
    employeeNumber: '436103592',
    password: '14902423',
    name: 'المدير العام',
    role: 'manager' as EmployeeRole
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

// أيقونات الأدوار (اسم الأيقونة من lucide-react)
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

// خدمة إدارة الموظفين
class EmployeeService {
    private storageKey = 'arba_employees';

    // الحصول على جميع الموظفين
    getEmployees(): Employee[] {
        const data = localStorage.getItem(this.storageKey);
        return data ? JSON.parse(data) : [];
    }

    // إضافة موظف جديد
    addEmployee(employee: Omit<Employee, 'id' | 'createdAt' | 'isActive'>): Employee {
        const employees = this.getEmployees();

        // التحقق من عدم تكرار رقم الموظف
        if (employees.some(e => e.employeeNumber === employee.employeeNumber)) {
            throw new Error('رقم الموظف موجود مسبقاً');
        }

        const newEmployee: Employee = {
            ...employee,
            id: crypto.randomUUID(),
            isActive: true,
            createdAt: new Date()
        };

        employees.push(newEmployee);
        localStorage.setItem(this.storageKey, JSON.stringify(employees));

        return newEmployee;
    }

    // تحديث بيانات موظف
    updateEmployee(id: string, updates: Partial<Employee>): Employee | null {
        const employees = this.getEmployees();
        const index = employees.findIndex(e => e.id === id);

        if (index === -1) return null;

        employees[index] = { ...employees[index], ...updates };
        localStorage.setItem(this.storageKey, JSON.stringify(employees));

        return employees[index];
    }

    // حذف موظف
    deleteEmployee(id: string): boolean {
        const employees = this.getEmployees();
        const filtered = employees.filter(e => e.id !== id);

        if (filtered.length === employees.length) return false;

        localStorage.setItem(this.storageKey, JSON.stringify(filtered));
        return true;
    }

    // تسجيل دخول موظف
    login(employeeNumber: string, password: string): { success: boolean; employee?: Employee | typeof MANAGER_CREDENTIALS; error?: string } {
        // التحقق من المدير أولاً
        if (employeeNumber === MANAGER_CREDENTIALS.employeeNumber) {
            if (password === MANAGER_CREDENTIALS.password) {
                return {
                    success: true,
                    employee: MANAGER_CREDENTIALS
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

    // إعادة تعيين كلمة المرور (من قبل المدير)
    resetPassword(employeeId: string, newPassword: string): boolean {
        const result = this.updateEmployee(employeeId, {
            password: newPassword,
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
}

export const employeeService = new EmployeeService();
export default employeeService;
