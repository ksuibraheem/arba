/**
 * خدمة المصادقة - Auth Service
 * تدير تسجيل المستخدمين وتسجيل الدخول
 */

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

/**
 * الحصول على جميع المستخدمين المسجلين
 */
export const getAllUsers = (): StoredUser[] => {
    const usersJson = localStorage.getItem(USERS_STORAGE_KEY);
    if (!usersJson) return [];
    try {
        return JSON.parse(usersJson);
    } catch {
        return [];
    }
};

/**
 * حفظ قائمة المستخدمين
 */
const saveUsers = (users: StoredUser[]): void => {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
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
        // الموظفين - للعرض التجريبي فقط
        if (identifier === 'admin' && password === 'admin123') {
            const employeeUser: StoredUser = {
                id: 'employee_admin',
                userType: 'employee',
                name: 'مدير النظام',
                email: 'admin@arba-sys.com',
                password: password,
                plan: 'enterprise',
                usedProjects: 0,
                usedStorageMB: 0,
                createdAt: new Date().toISOString()
            };
            setCurrentUser(employeeUser);
            return { success: true, user: employeeUser };
        }
        return {
            success: false,
            error: 'رقم الموظف أو كلمة المرور غير صحيحة',
            errorType: 'wrong_password'
        };
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

export default {
    registerUser,
    loginUser,
    logoutUser,
    getCurrentUser,
    getAllUsers,
    findUserByEmail,
    findUserByPhone,
    updateUser
};
