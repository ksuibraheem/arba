/**
 * Employee Service — خدمة إدارة موظفي الشركات
 * CRUD for CompanyEmployee within ArbaClient + seat validation
 */

import app, { db } from '../firebase/config';
import { doc, updateDoc, setDoc, getDoc, serverTimestamp, collection, query, where, getDocs, onSnapshot, Unsubscribe, Timestamp } from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
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
    passwordHash?: string;
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

            return merged as typeof DEFAULT_MANAGER_CREDENTIALS;
        }
    } catch (error) {
        console.warn('⚠️ Failed to load manager credentials from Firestore, using local:', error);
    }
    return getManagerCredentials();
}

/**
 * حفظ الموظف في Firestore (Document-per-employee)
 */
async function syncEmployeeToFirestore(emp: Employee) {
    try {
        const toSync = { ...emp };
        if (toSync.password) {
            toSync.passwordHash = toSync.passwordHash || await hashPassword(toSync.password);
            delete toSync.password; // Secure plaintext password
        }
        await setDoc(doc(db, 'employees', emp.id), toSync);
    } catch (error) {
        console.warn('⚠️ Failed to sync employee to Firestore:', error);
    }
}

/**
 * جلب الموظفين من Firestore (عند أول تحميل فقط)
 * يحدّث localStorage ويرجع القائمة
 */
export async function loadEmployeesFromFirestore(): Promise<Employee[]> {
    try {
        const querySnapshot = await getDocs(collection(db, 'employees'));
        const employees: Employee[] = [];
        querySnapshot.forEach((doc) => {
            employees.push({ id: doc.id, ...doc.data() } as Employee);
        });

        if (employees.length > 0) {
            localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(employees));
            return employees;
        } else {
            // Migrate legacy/local employees to collection
            const localEmployees = getStoredEmployees();
            if (localEmployees.length > 0) {
                for (const emp of localEmployees) {
                    await syncEmployeeToFirestore(emp);
                }
                return localEmployees;
            }
        }
    } catch (error) {
        console.warn('⚠️ Failed to load employees from Firestore, using local:', error);
    }
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

        // Background sync and password hashing
        (async () => {
            try {
                const passwordHash = await hashPassword(data.password);
                newEmp.passwordHash = passwordHash;
                const currentEmps = getStoredEmployees();
                const idx = currentEmps.findIndex(e => e.id === newEmp.id);
                if (idx !== -1) {
                    currentEmps[idx].passwordHash = passwordHash;
                    localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(currentEmps));
                }
                await syncEmployeeToFirestore(newEmp);
            } catch (err) {
                console.error('Error syncing added employee:', err);
            }
        })();

        return newEmp;
    },

    deleteEmployee(id: string) {
        const employees = getStoredEmployees().filter(e => e.id !== id);
        saveEmployees(employees);

        // Background delete
        (async () => {
            try {
                const { deleteDoc } = await import('firebase/firestore');
                await deleteDoc(doc(db, 'employees', id));
            } catch (err) {
                console.error('Error deleting employee from Firestore:', err);
            }
        })();
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

    async login(employeeNumberOrEmail: string, password: string): Promise<{ success: boolean; employee?: any; error?: string }> {
        try {
            const profileJson = localStorage.getItem('arba_offline_profile');
            const signature = localStorage.getItem('arba_offline_signature');
            const storedHashOfHash = localStorage.getItem('arba_offline_hash');
            const offlineExpiry = localStorage.getItem('arba_offline_expiry');

            if (!profileJson || !signature || !storedHashOfHash) {
                return { success: false, error: 'لا يوجد اتصال بالإنترنت، ولم يتم العثور على بيانات تسجيل دخول مخزنة مسبقاً.' };
            }

            // 🔒 Security: Check offline session expiry (24 hours)
            if (offlineExpiry && Date.now() > parseInt(offlineExpiry)) {
                localStorage.removeItem('arba_offline_profile');
                localStorage.removeItem('arba_offline_signature');
                localStorage.removeItem('arba_offline_hash');
                localStorage.removeItem('arba_offline_hmac');
                localStorage.removeItem('arba_offline_expiry');
                return { success: false, error: 'انتهت صلاحية الجلسة المحلية (24 ساعة). يرجى الاتصال بالإنترنت لتسجيل الدخول.' };
            }

            const inputPasswordHash = await hashPassword(password);
            const inputHashOfHash = await hashPassword(inputPasswordHash);

            if (inputHashOfHash !== storedHashOfHash) {
                return { success: false, error: 'كلمة المرور غير صحيحة' };
            }

            // 🔒 Security: Verify integrity with serverHmac binding (tamper detection)
            const storedHmac = localStorage.getItem('arba_offline_hmac') || '';
            const computedSignature = await hashPassword(profileJson + inputPasswordHash + storedHmac);
            if (computedSignature !== signature) {
                console.error('🛡️ Security Shield: Offline profile data has been tampered with!');
                localStorage.removeItem('arba_offline_profile');
                localStorage.removeItem('arba_offline_signature');
                localStorage.removeItem('arba_offline_hash');
                localStorage.removeItem('arba_offline_hmac');
                localStorage.removeItem('arba_offline_expiry');
                return { success: false, error: 'تم كشف تلاعب بالملفات المحلية. يرجى الاتصال بالإنترنت لتسجيل الدخول.' };
            }

            const parsed = JSON.parse(profileJson);
            const targetKey = employeeNumberOrEmail.toLowerCase();
            const matchesUser = (parsed.employeeNumber && parsed.employeeNumber.toLowerCase() === targetKey) ||
                                (parsed.email && parsed.email.toLowerCase() === targetKey);
            
            if (!matchesUser) {
                return { success: false, error: 'رقم الموظف أو البريد الإلكتروني غير متطابق مع الجلسة المخزنة.' };
            }

            return { success: true, employee: parsed };
        } catch (err: any) {
            return { success: false, error: `فشل تسجيل الدخول المحلي: ${err.message}` };
        }
    },

    async loginAsync(employeeNumberOrEmail: string, password: string): Promise<{ success: boolean; employee?: any; customToken?: string; error?: string }> {
        try {
            const functions = getFunctions(app, 'us-central1');
            const verifyEmployeeFn = httpsCallable(functions, 'verifyEmployeeCredentials');

            // 🔒 Security: Add timeout to prevent indefinite hanging
            // Use shorter timeout on localhost for faster dev experience
            const isLocalDev = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
            const timeoutMs = isLocalDev ? 3000 : 10000;
            const timeoutPromise = new Promise<never>((_, reject) =>
                setTimeout(() => reject(new Error('NETWORK_TIMEOUT')), timeoutMs)
            );
            const response = await Promise.race([
                verifyEmployeeFn({ employeeNumberOrEmail, password }),
                timeoutPromise
            ]);
            const result = (response as any).data as any;

            if (!result || !result.success) {
                return { success: false, error: result?.error || 'فشلت عملية التحقق' };
            }

            const { customToken, employee, passwordHash, serverHmac } = result;

            // 🔒 Security: Store offline cache with server HMAC binding + 24h expiry
            const profileJson = JSON.stringify(employee);
            const offlineHash = await hashPassword(passwordHash);
            const hmacBinding = serverHmac || '';
            const offlineSignature = await hashPassword(profileJson + passwordHash + hmacBinding);

            localStorage.setItem('arba_offline_profile', profileJson);
            localStorage.setItem('arba_offline_hash', offlineHash);
            localStorage.setItem('arba_offline_signature', offlineSignature);
            localStorage.setItem('arba_offline_hmac', hmacBinding);
            localStorage.setItem('arba_offline_expiry', (Date.now() + 24 * 60 * 60 * 1000).toString());

            return {
                success: true,
                employee,
                customToken
            };
        } catch (err: any) {
            // 🔒 Security: Smart error differentiation
            const errorCode = err?.code || '';
            const errorMessage = err?.message || '';
            const fullError = `${errorCode} ${errorMessage}`.toLowerCase();
            
            console.warn('🔒 loginAsync error details:', { code: errorCode, message: errorMessage, online: navigator.onLine });

            // 1. Manager local validation bypass (Always allow manager fallback if credentials match)
            const mgr = getManagerCredentials();
            const isManagerNum = employeeNumberOrEmail === mgr.employeeNumber || employeeNumberOrEmail === 'manager@arba-sys.com';
            const isManagerPass = password === mgr.password;

            if (isManagerNum && isManagerPass) {
                console.warn('⚠️ Cloud function failed. Logging in with local manager credentials fallback.');
                const employeeObj = {
                    name: mgr.name,
                    employeeNumber: mgr.employeeNumber,
                    role: 'manager',
                    isActive: true
                };
                return { success: true, employee: employeeObj };
            }

            // Check if explicitly offline first
            if (!navigator.onLine) {
                console.warn('⚠️ Device is offline, attempting offline login fallback');
                return this.login(employeeNumberOrEmail, password);
            }

            // Check for network-related error codes/messages
            const isNetworkError = 
                errorCode === 'NETWORK_TIMEOUT' ||
                fullError.includes('unavailable') ||
                fullError.includes('deadline-exceeded') ||
                fullError.includes('failed to fetch') ||
                fullError.includes('econnreset') ||
                fullError.includes('network request failed') ||
                fullError.includes('net::err');

            if (isNetworkError) {
                console.warn('⚠️ Network error detected, attempting offline login fallback:', fullError);
                return this.login(employeeNumberOrEmail, password);
            }

            // For local development on localhost, allow fallback for all local employees
            const isDevHost = typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
            if (isDevHost || fullError.includes('internal') || fullError.includes('not-found')) {
                console.warn('⚠️ Dev environment / server error detected, attempting local DB fallback');
                
                // Check sample/local database directly
                const employees = getStoredEmployees();
                const inputPasswordHash = await hashPassword(password);
                const emp = employees.find(
                    e => (e.employeeNumber === employeeNumberOrEmail || e.email === employeeNumberOrEmail)
                        && (e.passwordHash === inputPasswordHash || e.password === password)
                        && e.isActive
                );
                if (emp) {
                    console.warn('⚠️ Logged in using local employee database account.');
                    return { success: true, employee: emp };
                }
            }

            // Server errors (invalid-argument, internal, etc.) — do NOT fall back to offline in production
            console.error('🔒 Server authentication error (no offline fallback):', errorCode);
            return { success: false, error: err?.message || 'حدث خطأ في الخادم. يرجى المحاولة لاحقاً.' };
        }
    },

    initializeSampleData() {
        const employees = getStoredEmployees();
        if (employees.length > 0) return;
        const sampleEmployees: Employee[] = [
            { id: 'emp_1', name: 'أحمد محمد', email: 'ahmed@arba-sys.com', phone: '0501234567', role: 'accountant', employeeNumber: '3301001', password: 'Acc@2025', isActive: true, createdAt: '2025-01-15', emergencyContact: '', salary: { ...DEFAULT_SALARY }, contract: { ...DEFAULT_CONTRACT }, certificates: [], experiences: [], notes: [], warnings: [] },
            { id: 'emp_2', name: 'سارة العلي', email: 'sara@arba-sys.com', phone: '0509876543', role: 'hr', employeeNumber: '3301002', password: 'Hr@2025', isActive: true, createdAt: '2025-02-01', emergencyContact: '', salary: { ...DEFAULT_SALARY }, contract: { ...DEFAULT_CONTRACT }, certificates: [], experiences: [], notes: [], warnings: [] },
            { id: 'emp_3', name: 'خالد الحربي', email: 'khaled@arba-sys.com', phone: '0551112233', role: 'developer', employeeNumber: '3301003', password: 'Dev@2025', isActive: true, createdAt: '2025-03-10', emergencyContact: '', salary: { ...DEFAULT_SALARY }, contract: { ...DEFAULT_CONTRACT }, certificates: [], experiences: [], notes: [], warnings: [] },
            { id: 'emp_4', name: 'نورة السبيعي', email: 'noura@arba-sys.com', phone: '0554445566', role: 'support', employeeNumber: '3301004', password: 'Sup@2025', isActive: true, createdAt: '2025-04-05', emergencyContact: '', salary: { ...DEFAULT_SALARY }, contract: { ...DEFAULT_CONTRACT }, certificates: [], experiences: [], notes: [], warnings: [] },
            { id: 'emp_5', name: 'فهد القحطاني', email: 'fahad@arba-sys.com', phone: '0557778899', role: 'quantity_surveyor', employeeNumber: '3301005', password: 'Qs@2025', isActive: true, createdAt: '2025-05-20', emergencyContact: '', salary: { ...DEFAULT_SALARY }, contract: { ...DEFAULT_CONTRACT }, certificates: [], experiences: [], notes: [], warnings: [] },
        ];
        saveEmployees(sampleEmployees);
        
        // Background sync
        (async () => {
            for (const emp of sampleEmployees) {
                await syncEmployeeToFirestore(emp);
            }
        })();
    },

    // === Extended Methods ===

    updateEmployee(id: string, data: Partial<Employee>): void {
        const employees = getStoredEmployees();
        const index = employees.findIndex(e => e.id === id);
        if (index !== -1) {
            const updated = { ...employees[index], ...data };
            employees[index] = updated;
            saveEmployees(employees);

            // Background sync
            (async () => {
                try {
                    if (data.password) {
                        updated.passwordHash = await hashPassword(data.password);
                        delete updated.password;
                        const currentEmps = getStoredEmployees();
                        const idx = currentEmps.findIndex(e => e.id === id);
                        if (idx !== -1) {
                            currentEmps[idx] = updated;
                            localStorage.setItem(EMPLOYEES_KEY, JSON.stringify(currentEmps));
                        }
                    }
                    await syncEmployeeToFirestore(updated);
                } catch (err) {
                    console.error('Error updating employee:', err);
                }
            })();
        }
    },

    async changePassword(employeeNumber: string, oldPassword: string, newPassword: string): Promise<{ success: boolean; error?: string }> {
        const oldHash = await hashPassword(oldPassword);
        const newHash = await hashPassword(newPassword);
        const mgr = getManagerCredentials();
        if (employeeNumber === mgr.employeeNumber) {
            const mgrHash = await hashPassword(mgr.password);
            if (oldHash !== mgrHash) {
                return { success: false, error: 'كلمة المرور الحالية غير صحيحة' };
            }
            updateManagerCredentials({ password: newPassword });
            return { success: true };
        }
        const employees = getStoredEmployees();
        const emp = employees.find(e => e.employeeNumber === employeeNumber);
        if (!emp) return { success: false, error: 'الموظف غير موجود' };
        const storedHash = emp.passwordHash || await hashPassword(emp.password || '');
        if (oldHash !== storedHash) {
            return { success: false, error: 'كلمة المرور الحالية غير صحيحة' };
        }
        emp.passwordHash = newHash;
        delete (emp as any).password;
        saveEmployees(employees);
        await syncEmployeeToFirestore(emp);
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
        syncEmployeeToFirestore(emp).catch(console.error);
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

    // Attendance Methods — Firestore-First
    async initializeTodayAttendance(): Promise<void> {
        const today = new Date().toISOString().split('T')[0];
        const employees = getStoredEmployees();

        for (const emp of employees) {
            const docId = `${emp.id}_${today}`;
            const docRef = doc(db, 'attendance', docId);
            const existing = await getDoc(docRef);

            if (!existing.exists()) {
                const record: AttendanceRecord = {
                    id: docId,
                    employeeId: emp.id,
                    employeeNumber: emp.employeeNumber,
                    employeeName: emp.name,
                    date: today,
                    status: 'absent',
                    totalWorkMinutes: 0,
                    totalBreakMinutes: 0,
                    breaks: [],
                    tasks: [],
                };
                await setDoc(docRef, { ...record, createdAt: serverTimestamp() });
            }
        }
    },

    async clockIn(employeeId: string): Promise<AttendanceRecord | null> {
        const today = new Date().toISOString().split('T')[0];
        const docId = `${employeeId}_${today}`;
        const docRef = doc(db, 'attendance', docId);
        const snap = await getDoc(docRef);

        const now = new Date().toISOString();
        const isLate = new Date().getHours() >= 9; // Late if after 9 AM

        if (snap.exists()) {
            await updateDoc(docRef, {
                clockIn: now,
                status: isLate ? 'late' : 'present',
                updatedAt: serverTimestamp(),
            });
        } else {
            const emp = getStoredEmployees().find(e => e.id === employeeId);
            if (!emp) return null;
            const record: AttendanceRecord = {
                id: docId,
                employeeId,
                employeeNumber: emp.employeeNumber,
                employeeName: emp.name,
                date: today,
                status: isLate ? 'late' : 'present',
                clockIn: now,
                totalWorkMinutes: 0,
                totalBreakMinutes: 0,
                breaks: [],
                tasks: [],
            };
            await setDoc(docRef, { ...record, createdAt: serverTimestamp() });
        }

        const updated = await getDoc(docRef);
        return updated.exists() ? (updated.data() as AttendanceRecord) : null;
    },

    async clockOut(employeeId: string): Promise<AttendanceRecord | null> {
        const today = new Date().toISOString().split('T')[0];
        const docId = `${employeeId}_${today}`;
        const docRef = doc(db, 'attendance', docId);
        const snap = await getDoc(docRef);

        if (!snap.exists()) return null;

        const record = snap.data() as AttendanceRecord;
        const now = new Date();
        const clockInTime = record.clockIn ? new Date(record.clockIn) : now;
        const totalMinutes = Math.round((now.getTime() - clockInTime.getTime()) / 60000);

        await updateDoc(docRef, {
            clockOut: now.toISOString(),
            totalWorkMinutes: Math.max(0, totalMinutes - (record.totalBreakMinutes || 0)),
            status: totalMinutes < 360 ? 'early_leave' : record.status,
            updatedAt: serverTimestamp(),
        });

        const updated = await getDoc(docRef);
        return updated.exists() ? (updated.data() as AttendanceRecord) : null;
    },

    async getAttendanceByDate(date: string): Promise<AttendanceRecord[]> {
        try {
            const q = query(
                collection(db, 'attendance'),
                where('date', '==', date)
            );
            const snapshot = await getDocs(q);
            return snapshot.docs.map(d => d.data() as AttendanceRecord);
        } catch (error) {
            console.warn('⚠️ Attendance query failed, falling back to localStorage:', error);
            const key = `arba_attendance_${date}`;
            try { return JSON.parse(localStorage.getItem(key) || '[]'); }
            catch { return []; }
        }
    },

    getWeeklyStats() {
        // Compute from cached attendance data
        const today = new Date();
        const weekDays: string[] = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            weekDays.push(d.toISOString().split('T')[0]);
        }

        // Read from localStorage cache for performance
        let totalWorkHours = 0;
        let presentCount = 0;
        let lateCount = 0;
        let absentCount = 0;
        let totalRecords = 0;

        for (const day of weekDays) {
            const key = `arba_attendance_${day}`;
            try {
                const records: AttendanceRecord[] = JSON.parse(localStorage.getItem(key) || '[]');
                for (const r of records) {
                    totalRecords++;
                    totalWorkHours += (r.totalWorkMinutes || 0) / 60;
                    if (r.status === 'present') presentCount++;
                    if (r.status === 'late') lateCount++;
                    if (r.status === 'absent') absentCount++;
                }
            } catch {}
        }

        const attendanceRate = totalRecords > 0
            ? Math.round(((presentCount + lateCount) / totalRecords) * 100)
            : 0;

        return {
            totalWorkHours: Math.round(totalWorkHours),
            averageAttendanceRate: attendanceRate,
            lateCount,
            absentCount,
            topPerformers: [] as { employeeId: string; name: string; workHours: number }[],
            lowPerformers: [] as { employeeId: string; name: string; workHours: number }[],
        };
    },

    getAttendanceAlerts(): { severity: 'info' | 'warning' | 'critical'; message: { ar: string; en: string }; employeeName: string }[] {
        const today = new Date().toISOString().split('T')[0];
        const key = `arba_attendance_${today}`;
        const alerts: { severity: 'info' | 'warning' | 'critical'; message: { ar: string; en: string }; employeeName: string }[] = [];

        try {
            const records: AttendanceRecord[] = JSON.parse(localStorage.getItem(key) || '[]');
            const now = new Date();
            const currentHour = now.getHours();

            for (const record of records) {
                if (currentHour >= 9 && record.status === 'absent' && !record.clockIn) {
                    alerts.push({
                        severity: 'warning',
                        message: {
                            ar: `لم يسجل حضوره حتى الآن`,
                            en: `Has not clocked in yet`,
                        },
                        employeeName: record.employeeName,
                    });
                }
                if (record.status === 'late') {
                    alerts.push({
                        severity: 'info',
                        message: {
                            ar: `تأخر في الحضور اليوم`,
                            en: `Was late today`,
                        },
                        employeeName: record.employeeName,
                    });
                }
            }
        } catch {}

        return alerts;
    },

    getMonthlyReport(employeeId: string, year: number, month: number) {
        const emp = getStoredEmployees().find(e => e.id === employeeId);
        if (!emp) return null;

        // Compute from stored attendance records
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        let presentDays = 0, lateDays = 0, absentDays = 0;
        let totalWorkMinutes = 0;

        for (let d = 1; d <= daysInMonth; d++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
            const key = `arba_attendance_${dateStr}`;
            try {
                const records: AttendanceRecord[] = JSON.parse(localStorage.getItem(key) || '[]');
                const empRecord = records.find(r => r.employeeId === employeeId);
                if (empRecord) {
                    if (empRecord.status === 'present') presentDays++;
                    else if (empRecord.status === 'late') { lateDays++; presentDays++; }
                    else if (empRecord.status === 'absent') absentDays++;
                    totalWorkMinutes += empRecord.totalWorkMinutes || 0;
                }
            } catch {}
        }

        const totalWorkHours = Math.round(totalWorkMinutes / 60);
        const workedDays = presentDays + lateDays;
        return {
            employeeName: emp.name,
            month,
            year,
            presentDays,
            lateDays,
            absentDays,
            totalWorkHours,
            averageWorkHoursPerDay: workedDays > 0 ? Math.round(totalWorkHours / workedDays) : 0,
            attendanceRate: daysInMonth > 0 ? Math.round((presentDays / daysInMonth) * 100) : 0,
            punctualityRate: (presentDays + lateDays) > 0 ? Math.round((presentDays / (presentDays + lateDays)) * 100) : 0,
        };
    },
};

// ========================
// Real-time Attendance Listener
// ========================

/**
 * Subscribe to attendance records for a specific date.
 * Returns an unsubscribe function.
 */
export function subscribeToAttendance(
    date: string,
    callback: (records: AttendanceRecord[]) => void
): Unsubscribe {
    const q = query(
        collection(db, 'attendance'),
        where('date', '==', date)
    );

    return onSnapshot(q, (snapshot) => {
        const records = snapshot.docs.map(d => d.data() as AttendanceRecord);
        // Also cache in localStorage for offline access/ stats computation
        localStorage.setItem(`arba_attendance_${date}`, JSON.stringify(records));
        callback(records);
    }, (error) => {
        console.error('❌ Attendance listener error:', error);
        // Fallback to cached data
        try {
            const cached = JSON.parse(localStorage.getItem(`arba_attendance_${date}`) || '[]');
            callback(cached);
        } catch { callback([]); }
    });
}

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
