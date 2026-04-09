/**
 * خدمة المصادقة - Auth Service
 * تدير تسجيل المستخدمين وتسجيل الدخول
 * 🔥 Synced with Firestore
 */

import { firestoreDataService } from './firestoreDataService';

export interface StoredUser {
    id: string;
    userType: 'individual' | 'company' | 'supplier' | 'employee';
    name: string;
    email: string;
    phone?: string;
    company?: string;
    commercialRegister?: string;
    businessType?: string;
    password: string; // In production, this should be hashed
    plan: string;
    usedProjects: number;
    usedStorageMB: number;
    companyLogo?: string;
    createdAt: string;
}

export interface AuthResult {
    success: boolean;
    user?: StoredUser;
    error?: string;
    errorType?: 'user_not_found' | 'wrong_password' | 'email_exists' | 'validation_error';
}

const USERS_STORAGE_KEY = 'arba_users';
const CURRENT_USER_KEY = 'arba_current_user';

let _usersLoadedFromFirestore = false;

/**
 * تحميل المستخدمين من Firestore (مرة واحدة)
 */
async function loadUsersFromFirestore(): Promise<void> {
    if (_usersLoadedFromFirestore) return;
    try {
        const items = await firestoreDataService.getCollection(
            'auth_users', undefined, { localCacheKey: USERS_STORAGE_KEY }
        );
        if (items.length > 0) {
            // Merge: keep local users that aren't in Firestore
            const localUsers = getAllUsersLocal();
            const firestoreIds = new Set(items.map((i: any) => i.id));
            const merged = [...items as StoredUser[]];
            for (const lu of localUsers) {
                if (!firestoreIds.has(lu.id)) merged.push(lu);
            }
            localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(merged));
            console.log(`✅ ${items.length} users loaded from Firestore`);
        }
        _usersLoadedFromFirestore = true;
    } catch {
        _usersLoadedFromFirestore = true;
    }
}

// Auto-load on import
loadUsersFromFirestore().catch(() => {});

/**
 * الحصول على المستخدمين من localStorage (بدون تحميل Firestore)
 */
const getAllUsersLocal = (): StoredUser[] => {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    if (!usersJson) return [];
    try { return JSON.parse(usersJson); } catch { return []; }
};

/**
 * الحصول على جميع المستخدمين المسجلين
 */
export const getAllUsers = (): StoredUser[] => {
    return getAllUsersLocal();
};

/**
 * حفظ قائمة المستخدمين
 */
const saveUsers = (users: StoredUser[]): void => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
    // 🔥 Fire-and-forget sync to Firestore
    const items = users.map(u => ({ id: u.id, data: { ...u } }));
    firestoreDataService.batchWrite('auth_users', items).catch(() => {});
};

/**
 * البحث عن مستخدم بالبريد الإلكتروني
 */
export const findUserByEmail = (email: string): StoredUser | undefined => {
    const users = getAllUsers();
    return users.find(u => u.email.toLowerCase() === email.toLowerCase());
};

/**
 * البحث عن مستخدم برقم الجوال (للموردين)
 */
export const findUserByPhone = (phone: string): StoredUser | undefined => {
    const users = getAllUsers();
    return users.find(u => u.phone === phone);
};

/**
 * تسجيل مستخدم جديد
 */
export const registerUser = (userData: {
    userType: 'individual' | 'company' | 'supplier';
    name: string;
    email: string;
    phone?: string;
    company?: string;
    commercialRegister?: string;
    businessType?: string;
    password: string;
    plan: string;
}): AuthResult => {
    // التحقق من البيانات
    if (!userData.email || !userData.password || !userData.name) {
        return {
            success: false,
            error: 'يرجى ملء جميع الحقول المطلوبة',
            errorType: 'validation_error'
        };
    }

    // التحقق من عدم تكرار البريد
    const existingUser = findUserByEmail(userData.email);
    if (existingUser) {
        return {
            success: false,
            error: 'البريد الإلكتروني مسجل مسبقاً',
            errorType: 'email_exists'
        };
    }

    // إنشاء المستخدم الجديد
    const newUser: StoredUser = {
        id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        userType: userData.userType,
        name: userData.name,
        email: userData.email,
        phone: userData.phone,
        company: userData.company,
        commercialRegister: userData.commercialRegister,
        businessType: userData.businessType,
        password: userData.password, // In production: hash this!
        plan: userData.plan,
        usedProjects: 0,
        usedStorageMB: 0,
        createdAt: new Date().toISOString()
    };

    // حفظ المستخدم
    const users = getAllUsers();
    users.push(newUser);
    saveUsers(users);

    // تعيين المستخدم الحالي
    setCurrentUser(newUser);

    return { success: true, user: newUser };
};

/**
 * تسجيل الدخول
 */
export const loginUser = (
    identifier: string, // email, phone, or employee ID
    password: string,
    userType: 'individual' | 'company' | 'supplier' | 'employee' = 'individual'
): AuthResult => {
    // البحث عن المستخدم
    let user: StoredUser | undefined;

    if (userType === 'supplier') {
        user = findUserByPhone(identifier);
    } else if (userType === 'employee') {
        // تسجيل دخول الموظفين — يتم عبر Firebase Auth
        user = findUserByEmail(identifier);
        if (!user) {
            return {
                success: false,
                error: 'بيانات الدخول غير صحيحة. يرجى استخدام البريد الإلكتروني المسجل.',
                errorType: 'user_not_found'
            };
        }
    } else {
        user = findUserByEmail(identifier);
    }

    // التحقق من وجود المستخدم
    if (!user) {
        return {
            success: false,
            error: userType === 'supplier'
                ? 'رقم الجوال غير مسجل'
                : 'البريد الإلكتروني غير مسجل',
            errorType: 'user_not_found'
        };
    }

    // التحقق من كلمة المرور
    if (user.password !== password) {
        return {
            success: false,
            error: 'كلمة المرور غير صحيحة',
            errorType: 'wrong_password'
        };
    }

    // تعيين المستخدم الحالي
    setCurrentUser(user);

    return { success: true, user };
};

/**
 * تعيين المستخدم الحالي
 */
export const setCurrentUser = (user: StoredUser): void => {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
};

/**
 * الحصول على المستخدم الحالي
 */
export const getCurrentUser = (): StoredUser | null => {
    const userJson = localStorage.getItem(CURRENT_USER_KEY);
    if (!userJson) return null;
    try {
        return JSON.parse(userJson);
    } catch {
        return null;
    }
};

/**
 * تسجيل الخروج
 */
export const logoutUser = (): void => {
    localStorage.removeItem(CURRENT_USER_KEY);
};

/**
 * تحديث بيانات المستخدم
 */
export const updateUser = (userId: string, updates: Partial<StoredUser>): AuthResult => {
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.id === userId);

    if (userIndex === -1) {
        return {
            success: false,
            error: 'المستخدم غير موجود',
            errorType: 'user_not_found'
        };
    }

    // تحديث البيانات
    users[userIndex] = { ...users[userIndex], ...updates };
    saveUsers(users);

    // تحديث المستخدم الحالي إذا كان هو نفسه
    const currentUser = getCurrentUser();
    if (currentUser?.id === userId) {
        setCurrentUser(users[userIndex]);
    }

    return { success: true, user: users[userIndex] };
};

/**
 * تسجيل دخول مع تحميل من Firestore أولاً
 */
export const loginUserAsync = async (
    identifier: string,
    password: string,
    userType: 'individual' | 'company' | 'supplier' | 'employee' = 'individual'
): Promise<AuthResult> => {
    // Load users from Firestore first
    await loadUsersFromFirestore().catch(() => {});
    return loginUser(identifier, password, userType);
};

/**
 * استعادة كلمة المرور (تغيير مباشر)
 */
export const resetPassword = async (
    email: string,
    newPassword: string
): Promise<AuthResult> => {
    // Load latest from Firestore
    await loadUsersFromFirestore().catch(() => {});
    
    const users = getAllUsers();
    const userIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (userIndex === -1) {
        return {
            success: false,
            error: 'البريد الإلكتروني غير مسجل',
            errorType: 'user_not_found'
        };
    }
    
    users[userIndex].password = newPassword;
    saveUsers(users);
    
    return { success: true, user: users[userIndex] };
};

export default {
    registerUser,
    loginUser,
    loginUserAsync,
    logoutUser,
    getCurrentUser,
    getAllUsers,
    findUserByEmail,
    findUserByPhone,
    updateUser,
    resetPassword
};
