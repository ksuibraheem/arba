/**
 * Employee Service — خدمة إدارة موظفي الشركات
 * CRUD for CompanyEmployee within ArbaClient + seat validation
 */

import { db } from '../firebase/config';
import { doc, updateDoc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import {
    ArbaClient, CompanyEmployee, EmployeePermission,
    SubscriptionPlan, PLAN_EMPLOYEE_LIMITS, EXTRA_SEAT_PRICE_SAR,
    generateId,
} from './projectTypes';

const CLIENTS_COL = 'clients';

// =================== SEAT VALIDATION ===================

export function canAddEmployee(
    currentEmployees: CompanyEmployee[],
    plan: SubscriptionPlan
): { allowed: boolean; reason?: { ar: string; en: string }; extraCost?: number } {
    const limits = PLAN_EMPLOYEE_LIMITS[plan];
    const activeCount = currentEmployees.filter(e => e.isActive).length;

    if (plan === 'free') {
        return {
            allowed: false,
            reason: {
                ar: 'الباقة المجانية لا تدعم إضافة موظفين. يرجى الترقية للباقة الأساسية.',
                en: 'Free plan does not support employees. Please upgrade to Basic.',
            },
        };
    }

    if (activeCount < limits.maxEmployees) {
        return { allowed: true };
    }

    return {
        allowed: true,
        extraCost: EXTRA_SEAT_PRICE_SAR,
        reason: {
            ar: `تجاوزت حد الباقة (${limits.maxEmployees} مستخدمين). كل موظف إضافي بـ ${EXTRA_SEAT_PRICE_SAR} ر.س/شهر`,
            en: `Exceeded plan limit (${limits.maxEmployees} users). Each extra seat costs ${EXTRA_SEAT_PRICE_SAR} SAR/month`,
        },
    };
}

export function getSeatsInfo(client: ArbaClient, plan: SubscriptionPlan) {
    const limits = PLAN_EMPLOYEE_LIMITS[plan];
    const activeCount = (client.employees || []).filter(e => e.isActive).length;
    const freeSeats = limits.maxEmployees;
    const extraSeats = Math.max(0, activeCount - freeSeats);
    const extraCost = extraSeats * EXTRA_SEAT_PRICE_SAR;
    return { activeCount, freeSeats, extraSeats, extraCost, maxFree: freeSeats };
}

// =================== PASSWORD HASHING ===================

async function hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// =================== CRUD ===================

export async function addEmployee(
    clientId: string,
    currentEmployees: CompanyEmployee[],
    data: { name: string; username: string; password: string; permissions: EmployeePermission[] }
): Promise<CompanyEmployee[]> {
    if (currentEmployees.some(e => e.username.toLowerCase() === data.username.toLowerCase())) {
        throw new Error('USERNAME_EXISTS');
    }

    const passwordHash = await hashPassword(data.password);

    const newEmp: CompanyEmployee = {
        id: generateId(),
        name: data.name,
        username: data.username,
        passwordHash,
        permissions: data.permissions,
        isActive: true,
        createdAt: new Date(),
    };

    const updatedEmployees = [...currentEmployees, newEmp];

    await updateDoc(doc(db, CLIENTS_COL, clientId), {
        employees: updatedEmployees,
        updatedAt: serverTimestamp(),
    });

    return updatedEmployees;
}

export async function updateEmployee(
    clientId: string,
    currentEmployees: CompanyEmployee[],
    empId: string,
    updates: Partial<Pick<CompanyEmployee, 'name' | 'permissions' | 'isActive'>> & { newPassword?: string }
): Promise<CompanyEmployee[]> {
    const idx = currentEmployees.findIndex(e => e.id === empId);
    if (idx < 0) throw new Error('EMPLOYEE_NOT_FOUND');

    const updated = { ...currentEmployees[idx] };
    if (updates.name !== undefined) updated.name = updates.name;
    if (updates.permissions !== undefined) updated.permissions = updates.permissions;
    if (updates.isActive !== undefined) updated.isActive = updates.isActive;
    if (updates.newPassword) {
        updated.passwordHash = await hashPassword(updates.newPassword);
    }

    const updatedEmployees = [...currentEmployees];
    updatedEmployees[idx] = updated;

    await updateDoc(doc(db, CLIENTS_COL, clientId), {
        employees: updatedEmployees,
        updatedAt: serverTimestamp(),
    });

    return updatedEmployees;
}

export async function removeEmployee(
    clientId: string,
    currentEmployees: CompanyEmployee[],
    empId: string
): Promise<CompanyEmployee[]> {
    const updatedEmployees = currentEmployees.filter(e => e.id !== empId);

    await updateDoc(doc(db, CLIENTS_COL, clientId), {
        employees: updatedEmployees,
        updatedAt: serverTimestamp(),
    });

    return updatedEmployees;
}

export async function validateEmployeeLogin(
    employees: CompanyEmployee[],
    username: string,
    password: string
): Promise<CompanyEmployee | null> {
    const passwordHash = await hashPassword(password);
    const emp = employees.find(
        e => e.username.toLowerCase() === username.toLowerCase()
            && e.passwordHash === passwordHash
            && e.isActive
    );
    return emp || null;
}

// ========================================================================================
// LEGACY: Internal Arba Employee Management (localStorage-based)
// Used by App.tsx, ManagerDashboard.tsx, EmployeeDashboard.tsx
// ========================================================================================

export type EmployeeRole = 'manager' | 'deputy' | 'accountant' | 'hr' | 'developer' | 'support' | 'marketing' | 'quality' | 'quantity_surveyor';

export interface Employee {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: EmployeeRole;
    employeeNumber: string;
    password: string;
    isActive: boolean;
    createdAt?: string;
    emergencyContact?: string;
    salary?: SalaryStructure;
    contract?: ContractInfo;
    certificates?: Certificate[];
    experiences?: Experience[];
    notes?: Note[];
    warnings?: Warning[];
}


export const ROLE_TRANSLATIONS: Record<EmployeeRole, { ar: string; en: string }> = {
    manager: { ar: 'المدير العام', en: 'General Manager' },
    deputy: { ar: 'نائب المدير', en: 'Deputy Manager' },
    accountant: { ar: 'محاسب', en: 'Accountant' },
    hr: { ar: 'موارد بشرية', en: 'Human Resources' },
    developer: { ar: 'مطور', en: 'Developer' },
    support: { ar: 'دعم فني', en: 'Technical Support' },
    marketing: { ar: 'تسويق', en: 'Marketing' },
    quality: { ar: 'ضبط جودة', en: 'Quality Assurance' },
    quantity_surveyor: { ar: 'مهندس كميات', en: 'Quantity Surveyor' },
};

export const ROLE_COLORS: Record<EmployeeRole, string> = {
    manager: 'from-amber-500 to-yellow-600',
    deputy: 'from-purple-500 to-indigo-600',
    accountant: 'from-emerald-500 to-teal-600',
    hr: 'from-blue-500 to-cyan-600',
    developer: 'from-violet-500 to-purple-600',
    support: 'from-orange-500 to-red-600',
    marketing: 'from-pink-500 to-rose-600',
    quality: 'from-lime-500 to-green-600',
    quantity_surveyor: 'from-sky-500 to-blue-600',
};

// Manager credentials — stored in localStorage + Firestore for persistence
const DEFAULT_MANAGER_CREDENTIALS = {
    name: 'المدير العام',
    employeeNumber: '2201187',
    password: 'Aa0591529339',
};

const FIRESTORE_EMPLOYEES_DOC = 'arba_config/employees_data';
const FIRESTORE_MANAGER_DOC = 'arba_config/manager_credentials';

export const MANAGER_CREDENTIALS = (() => {
    try {
        const stored = localStorage.getItem('arba_manager_credentials');
        if (stored) return { ...DEFAULT_MANAGER_CREDENTIALS, ...JSON.parse(stored) };
    } catch { /* ignore */ }
    return { ...DEFAULT_MANAGER_CREDENTIALS };
})();

export function getManagerCredentials() {
    try {
        const stored = localStorage.getItem('arba_manager_credentials');
        if (stored) return { ...DEFAULT_MANAGER_CREDENTIALS, ...JSON.parse(stored) };
    } catch { /* ignore */ }
    return { ...DEFAULT_MANAGER_CREDENTIALS };
}

export function updateManagerCredentials(updates: Partial<typeof DEFAULT_MANAGER_CREDENTIALS>) {
    const current = getManagerCredentials();
    const updated = { ...current, ...updates };
    localStorage.setItem('arba_manager_credentials', JSON.stringify(updated));
    // Update the live object
    Object.assign(MANAGER_CREDENTIALS, updated);
    // Sync to Firestore (fire-and-forget)
    syncManagerCredentialsToFirestore(updated).catch(console.error);
    return updated;
}

// =================== FIRESTORE SYNC ===================

/**
 * مزامنة بيانات المدير مع Firestore (ما بعد التحديث)
 */
async function syncManagerCredentialsToFirestore(creds: typeof DEFAULT_MANAGER_CREDENTIALS) {
    try {
        await setDoc(doc(db, FIRESTORE_MANAGER_DOC.split('/')[0], FIRESTORE_MANAGER_DOC.split('/')[1]), {
            ...creds,
            updatedAt: serverTimestamp(),
        }, { merge: true });
        console.log('✅ Manager credentials synced to Firestore');
    } catch (error) {
        console.warn('⚠️ Failed to sync manager credentials to Firestore:', error);
    }
}

/**
 * جلب بيانات المدير من Firestore (عند أول تحميل)
 */
export async function loadManagerCredentialsFromFirestore(): Promise<typeof DEFAULT_MANAGER_CREDENTIALS> {
    try {
        const docSnap = await getDoc(doc(db, FIRESTORE_MANAGER_DOC.split('/')[0], FIRESTORE_MANAGER_DOC.split('/')[1]));
        if (docSnap.exists()) {
            const data = docSnap.data();
            const merged = { ...DEFAULT_MANAGER_CREDENTIALS, ...data };
            localStorage.setItem('arba_manager_credentials', JSON.stringify(merged));
            Object.assign(MANAGER_CREDENTIALS, merged);
            console.log('✅ Manager credentials loaded from Firestore');
            return merged as typeof DEFAULT_MANAGER_CREDENTIALS;
        }
    } catch (error) {
        console.warn('⚠️ Failed to load manager credentials from Firestore, using local:', error);
    }
    return getManagerCredentials();
}

/**
 * حفظ الموظفين في Firestore (fire-and-forget)
 */
async function syncEmployeesToFirestore(employees: Employee[]) {
    try {
        await setDoc(doc(db, FIRESTORE_EMPLOYEES_DOC.split('/')[0], FIRESTORE_EMPLOYEES_DOC.split('/')[1]), {
            employees: employees,
            count: employees.length,
            updatedAt: serverTimestamp(),
        });
        console.log(`✅ ${employees.length} employees synced to Firestore`);
    } catch (error) {
        console.warn('⚠️ Failed to sync employees to Firestore:', error);
    }
}

/**
 * جلب الموظفين من Firestore (عند أول تحميل فقط)
 * يحدّث localStorage ويرجع القائمة
 */
export async function loadEmployeesFromFirestore(): Promise<Employee[]> {
    try {
        const docSnap = await getDoc(doc(db, FIRESTORE_EMPLOYEES_DOC.split('/')[0], FIRESTORE_EMPLOYEES_DOC.split('/')[1]));
        if (docSnap.exists()) {
            const data = docSnap.data();
            const employees: Employee[] = data.employees || [];
            // Always sync Firestore → localStorage (even if empty)
            localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
            console.log(`✅ ${employees.length} employees loaded from Firestore`);
            return employees;
        } else {
            console.log('ℹ️ No employees document in Firestore yet');
            // If no doc in Firestore but we have local data, push local → Firestore
            const localEmployees = getStoredEmployees();
            if (localEmployees.length > 0) {
                console.log(`⬆️ Pushing ${localEmployees.length} local employees to Firestore`);
                await syncEmployeesToFirestore(localEmployees);
            }
            return localEmployees;
        }
    } catch (error) {
        console.warn('⚠️ Failed to load employees from Firestore, using local:', error);
    }
    // Fallback to localStorage
    return getStoredEmployees();
}

// localStorage-based employee CRUD (with Firestore sync)
const EMPLOYEES_KEY = 'arba_employees';

function getStoredEmployees(): Employee[] {
    try {
        const data = localStorage.getItem(EMPLOYEES_KEY);
        return data ? JSON.parse(data) : [];
    } catch { return []; }
}

function saveEmployees(employees: Employee[]) {
    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
    // Sync to Firestore (fire-and-forget — won't block UI)
    syncEmployeesToFirestore(employees).catch(console.error);
}

export const employeeService = {
    getEmployees(): Employee[] {
        return getStoredEmployees();
    },

    addEmployee(data: Omit<Employee, 'id' | 'isActive' | 'createdAt'> & { id?: string; isActive?: boolean }): Employee {
        const employees = getStoredEmployees();
        if (employees.some(e => e.employeeNumber === data.employeeNumber)) {
            throw new Error('رقم الموظف مستخدم مسبقاً');
        }
        const newEmp: Employee = {
            id: data.id || `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            name: data.name,
            email: data.email,
            phone: data.phone,
            role: data.role,
            employeeNumber: data.employeeNumber,
            password: data.password,
            isActive: data.isActive ?? true,
            createdAt: new Date().toISOString(),
        };
        employees.push(newEmp);
        saveEmployees(employees);
        return newEmp;
    },

    deleteEmployee(id: string) {
        const employees = getStoredEmployees().filter(e => e.id !== id);
        saveEmployees(employees);
    },

    generateEmployeeNumber(): string {
        return Math.floor(1000000 + Math.random() * 9000000).toString();
    },

    generatePassword(): string {
        const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789';
        let password = '';
        for (let i = 0; i < 8; i++) {
            password += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return password;
    },

    login(employeeNumberOrEmail: string, password: string): { success: boolean; employee?: Employee | { role: 'manager'; name: string; employeeNumber: string }; error?: string } {
        // Check manager credentials first
        const mgr = getManagerCredentials();
        if (employeeNumberOrEmail === mgr.employeeNumber && password === mgr.password) {
            return { success: true, employee: { role: 'manager', name: mgr.name, employeeNumber: mgr.employeeNumber } };
        }
        // Check regular employees
        const employees = getStoredEmployees();
        const emp = employees.find(
            e => (e.employeeNumber === employeeNumberOrEmail || e.email === employeeNumberOrEmail)
                && e.password === password && e.isActive
        );
        if (emp) return { success: true, employee: emp };
        return { success: false, error: 'رقم الموظف أو كلمة المرور غير صحيحة' };
    },

    /**
     * تسجيل دخول الموظف مع تحميل البيانات من Firestore أولاً
     * يضمن العمل من أي جهاز
     */
    async loginAsync(employeeNumberOrEmail: string, password: string): Promise<{ success: boolean; employee?: Employee | { role: 'manager'; name: string; employeeNumber: string }; error?: string }> {
        // 1) تحميل بيانات المدير والموظفين من Firestore
        try {
            await loadManagerCredentialsFromFirestore();
            await loadEmployeesFromFirestore();
        } catch (err) {
            console.warn('⚠️ Firestore load failed during loginAsync, using local data:', err);
        }
        // 2) استخدام دالة تسجيل الدخول العادية (localStorage مُحدَّث الآن)
        return this.login(employeeNumberOrEmail, password);
    },

    initializeSampleData() {
        const employees = getStoredEmployees();
        if (employees.length > 0) return; // Already initialized
        const sampleEmployees: Employee[] = [
            { id: 'emp_1', name: 'أحمد محمد', email: 'ahmed@arba-sys.com', phone: '0501234567', role: 'accountant', employeeNumber: '3301001', password: 'Acc@2025', isActive: true, createdAt: '2025-01-15', emergencyContact: '', salary: { ...DEFAULT_SALARY }, contract: { ...DEFAULT_CONTRACT }, certificates: [], experiences: [], notes: [], warnings: [] },
            { id: 'emp_2', name: 'سارة العلي', email: 'sara@arba-sys.com', phone: '0509876543', role: 'hr', employeeNumber: '3301002', password: 'Hr@2025', isActive: true, createdAt: '2025-02-01', emergencyContact: '', salary: { ...DEFAULT_SALARY }, contract: { ...DEFAULT_CONTRACT }, certificates: [], experiences: [], notes: [], warnings: [] },
            { id: 'emp_3', name: 'خالد الحربي', email: 'khaled@arba-sys.com', phone: '0551112233', role: 'developer', employeeNumber: '3301003', password: 'Dev@2025', isActive: true, createdAt: '2025-03-10', emergencyContact: '', salary: { ...DEFAULT_SALARY }, contract: { ...DEFAULT_CONTRACT }, certificates: [], experiences: [], notes: [], warnings: [] },
            { id: 'emp_4', name: 'نورة السبيعي', email: 'noura@arba-sys.com', phone: '0554445566', role: 'support', employeeNumber: '3301004', password: 'Sup@2025', isActive: true, createdAt: '2025-04-05', emergencyContact: '', salary: { ...DEFAULT_SALARY }, contract: { ...DEFAULT_CONTRACT }, certificates: [], experiences: [], notes: [], warnings: [] },
            { id: 'emp_5', name: 'فهد القحطاني', email: 'fahad@arba-sys.com', phone: '0557778899', role: 'quantity_surveyor', employeeNumber: '3301005', password: 'Qs@2025', isActive: true, createdAt: '2025-05-20', emergencyContact: '', salary: { ...DEFAULT_SALARY }, contract: { ...DEFAULT_CONTRACT }, certificates: [], experiences: [], notes: [], warnings: [] },
        ];
        saveEmployees(sampleEmployees);
    },

    // === Extended Methods ===

    updateEmployee(id: string, data: Partial<Employee>): void {
        const employees = getStoredEmployees();
        const index = employees.findIndex(e => e.id === id);
        if (index !== -1) {
            employees[index] = { ...employees[index], ...data };
            saveEmployees(employees);
        }
    },

    changePassword(employeeNumber: string, oldPassword: string, newPassword: string): { success: boolean; error?: string } {
        // Check manager credentials
        const mgr = getManagerCredentials();
        if (employeeNumber === mgr.employeeNumber) {
            if (oldPassword !== mgr.password) {
                return { success: false, error: 'كلمة المرور الحالية غير صحيحة' };
            }
            updateManagerCredentials({ password: newPassword });
            return { success: true };
        }
        // Check regular employees
        const employees = getStoredEmployees();
        const emp = employees.find(e => e.employeeNumber === employeeNumber);
        if (!emp) return { success: false, error: 'الموظف غير موجود' };
        if (emp.password !== oldPassword) {
            return { success: false, error: 'كلمة المرور الحالية غير صحيحة' };
        }
        emp.password = newPassword;
        saveEmployees(employees);
        return { success: true };
    },

    getEmployeeById(id: string): Employee | undefined {
        return getStoredEmployees().find(e => e.id === id);
    },

    addWarning(employeeId: string, warning: { type: WarningType; reason: string; issuedBy: string }): Warning | null {
        const employees = getStoredEmployees();
        const emp = employees.find(e => e.id === employeeId);
        if (!emp) return null;
        const newWarning: Warning = {
            id: crypto.randomUUID(),
            type: warning.type,
            reason: warning.reason,
            issuedBy: warning.issuedBy,
            date: new Date().toISOString(),
        };
        emp.warnings = [...(emp.warnings || []), newWarning];
        saveEmployees(employees);
        return newWarning;
    },

    getStatistics() {
        const employees = getStoredEmployees();
        return {
            total: employees.length,
            active: employees.filter(e => e.isActive).length,
            totalSalaries: employees.reduce((sum, e) => sum + calculateTotalSalary(e.salary), 0),
            warningsCount: employees.reduce((sum, e) => sum + (e.warnings?.length || 0), 0),
        };
    },

    // Attendance Methods
    initializeTodayAttendance(): void {
        const today = new Date().toISOString().split('T')[0];
        const key = `arba_attendance_${today}`;
        if (!localStorage.getItem(key)) {
            const employees = getStoredEmployees();
            const records: AttendanceRecord[] = employees.map(emp => ({
                id: crypto.randomUUID(),
                employeeId: emp.id,
                employeeNumber: emp.employeeNumber,
                employeeName: emp.name,
                date: today,
                status: 'present' as const,
                clockIn: new Date(new Date().setHours(8, 0, 0)).toISOString(),
                clockOut: undefined,
                totalWorkMinutes: 0,
                totalBreakMinutes: 0,
                breaks: [],
                tasks: [],
            }));
            localStorage.setItem(key, JSON.stringify(records));
        }
    },

    getAttendanceByDate(date: string): AttendanceRecord[] {
        const key = `arba_attendance_${date}`;
        try {
            return JSON.parse(localStorage.getItem(key) || '[]');
        } catch { return []; }
    },

    getWeeklyStats() {
        return {
            totalWorkHours: 160,
            averageAttendanceRate: 92,
            lateCount: 3,
            absentCount: 1,
            topPerformers: [
                { employeeId: 'emp_1', name: 'أحمد محمد', workHours: 42 },
                { employeeId: 'emp_5', name: 'فهد القحطاني', workHours: 40 },
            ],
            lowPerformers: [
                { employeeId: 'emp_4', name: 'نورة السبيعي', workHours: 32 },
            ],
        };
    },

    getAttendanceAlerts(): { severity: 'info' | 'warning' | 'critical'; message: { ar: string; en: string }; employeeName: string }[] {
        return [];
    },

    getMonthlyReport(employeeId: string, year: number, month: number) {
        const emp = getStoredEmployees().find(e => e.id === employeeId);
        if (!emp) return null;
        return {
            employeeName: emp.name,
            month,
            year,
            presentDays: 22,
            lateDays: 2,
            absentDays: 1,
            totalWorkHours: 176,
            averageWorkHoursPerDay: 8,
            attendanceRate: 88,
            punctualityRate: 91,
        };
    },
};

// ========================
// Additional Types
// ========================

export interface Certificate {
    id: string;
    name: string;
    issuer: string;
    issueDate: string;
    expiryDate?: string;
}

export interface Experience {
    id: string;
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    description?: string;
}

export interface SalaryStructure {
    basic: number;
    housing: number;
    transportation: number;
    food: number;
    other: number;
}

export interface ContractInfo {
    type: 'full_time' | 'part_time' | 'contract' | 'probation';
    startDate: string;
    endDate?: string;
    renewalDate?: string;
}

export interface Note {
    id: string;
    content: string;
    date: string;
    createdBy: string;
}

export type WarningType = 'verbal' | 'written' | 'final' | 'termination';

export interface Warning {
    id: string;
    type: WarningType;
    reason: string;
    issuedBy: string;
    date: string;
}

export interface AttendanceRecord {
    id: string;
    employeeId: string;
    employeeNumber: string;
    employeeName: string;
    date: string;
    status: 'present' | 'late' | 'absent' | 'early_leave' | 'on_leave';
    clockIn?: string;
    clockOut?: string;
    totalWorkMinutes: number;
    totalBreakMinutes: number;
    breaks: BreakRecord[];
    tasks: TaskSummary[];
}

export interface BreakRecord {
    id: string;
    type: 'prayer' | 'lunch' | 'personal' | 'other';
    startTime: string;
    endTime?: string;
    durationMinutes: number;
}

export interface TaskSummary {
    id: string;
    title: string;
    status: 'pending' | 'in_progress' | 'completed';
    startTime?: string;
    endTime?: string;
}

// ========================
// Additional Constants
// ========================

export const DEFAULT_SALARY: SalaryStructure = {
    basic: 5000,
    housing: 1250,
    transportation: 500,
    food: 300,
    other: 0,
};

export const DEFAULT_CONTRACT: ContractInfo = {
    type: 'full_time',
    startDate: new Date().toISOString().split('T')[0],
};

export const CONTRACT_TRANSLATIONS: Record<ContractInfo['type'], { ar: string; en: string }> = {
    full_time: { ar: 'دوام كامل', en: 'Full Time' },
    part_time: { ar: 'دوام جزئي', en: 'Part Time' },
    contract: { ar: 'عقد مؤقت', en: 'Contract' },
    probation: { ar: 'فترة تجربة', en: 'Probation' },
};

export const WARNING_TRANSLATIONS: Record<WarningType, { ar: string; en: string }> = {
    verbal: { ar: 'إنذار شفهي', en: 'Verbal Warning' },
    written: { ar: 'إنذار كتابي', en: 'Written Warning' },
    final: { ar: 'إنذار نهائي', en: 'Final Warning' },
    termination: { ar: 'فصل', en: 'Termination' },
};

export const ATTENDANCE_STATUS_TRANSLATIONS: Record<AttendanceRecord['status'], { ar: string; en: string }> = {
    present: { ar: 'حاضر', en: 'Present' },
    late: { ar: 'متأخر', en: 'Late' },
    absent: { ar: 'غائب', en: 'Absent' },
    early_leave: { ar: 'انصراف مبكر', en: 'Early Leave' },
    on_leave: { ar: 'إجازة', en: 'On Leave' },
};

export const BREAK_TYPE_TRANSLATIONS: Record<BreakRecord['type'], { ar: string; en: string }> = {
    prayer: { ar: 'صلاة', en: 'Prayer' },
    lunch: { ar: 'غداء', en: 'Lunch' },
    personal: { ar: 'شخصي', en: 'Personal' },
    other: { ar: 'أخرى', en: 'Other' },
};

// ========================
// Utility Functions
// ========================

export function calculateTotalSalary(salary?: SalaryStructure): number {
    if (!salary) return 0;
    return (salary.basic || 0) + (salary.housing || 0) + (salary.transportation || 0) + (salary.food || 0) + (salary.other || 0);
}

// ========================
// Super Admin Functions
// ========================

export const SUPER_ADMIN_EMPLOYEE_NUMBER = '3300001';

export function isSuperAdmin(employeeNumber: string): boolean {
    return employeeNumber === SUPER_ADMIN_EMPLOYEE_NUMBER;
}

export function hasFullPermissions(employeeNumber: string): boolean {
    return isSuperAdmin(employeeNumber);
}

export function shouldHideActivityStats(employeeNumber: string): boolean {
    return !isSuperAdmin(employeeNumber);
}

export function isExcludedFromActivityTracking(employeeNumber: string): boolean {
    return isSuperAdmin(employeeNumber);
}
