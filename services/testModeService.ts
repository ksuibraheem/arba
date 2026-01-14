/**
 * نظام وضع الاختبار - Test Mode Service
 * يمكّن المدير والموظفين المفوضين من اختبار الباقات كما يراها العملاء
 */

// صلاحيات وضع الاختبار
export interface TestModePermission {
    canTestCompanyPackages: boolean;     // اختبار باقات الشركات
    canTestIndividualPackages: boolean;  // اختبار باقات الأفراد
    canTestSupplierPackages: boolean;    // اختبار باقات الموردين
    grantedBy: string;                   // رقم الموظف الذي منح الصلاحية
    grantedAt: string;                   // تاريخ المنح ISO
}

// أنواع الباقات المتاحة
export type PackagePlan = 'free' | 'professional' | 'pro' | 'network';
export type TestUserType = 'individual' | 'company' | 'supplier';

// جلسة الاختبار الحالية
export interface TestSession {
    testerEmployee: {
        employeeNumber: string;
        name: string;
    };
    testingPackage: {
        plan: PackagePlan;
        userType: TestUserType;
    };
    startedAt: string;
}

// ترجمات وضع الاختبار
export const TEST_MODE_TRANSLATIONS = {
    canTestCompanyPackages: { ar: 'اختبار باقات الشركات', en: 'Test Company Packages' },
    canTestIndividualPackages: { ar: 'اختبار باقات الأفراد', en: 'Test Individual Packages' },
    canTestSupplierPackages: { ar: 'اختبار باقات الموردين', en: 'Test Supplier Packages' },
    testModeTitle: { ar: 'وضع الاختبار', en: 'Test Mode' },
    startTest: { ar: 'بدء الاختبار', en: 'Start Test' },
    endTest: { ar: 'إنهاء الاختبار', en: 'End Test' },
    testingAs: { ar: 'جاري اختبار باقة', en: 'Testing Package' },
    testModeActive: { ar: 'وضع الاختبار نشط', en: 'Test Mode Active' },
    grantPermission: { ar: 'منح الصلاحية', en: 'Grant Permission' },
    revokePermission: { ar: 'سحب الصلاحية', en: 'Revoke Permission' },
    noPermission: { ar: 'لا تملك صلاحية الاختبار', en: 'No test permission' },
};

// ترجمات الباقات
export const PACKAGE_TRANSLATIONS: Record<PackagePlan, { ar: string; en: string }> = {
    free: { ar: 'مجاني', en: 'Free' },
    professional: { ar: 'محترفين', en: 'Professional' },
    pro: { ar: 'برو', en: 'Pro' },
    network: { ar: 'شبكة', en: 'Network' }
};

// ترجمات نوع المستخدم
export const TEST_USER_TYPE_TRANSLATIONS: Record<TestUserType, { ar: string; en: string }> = {
    individual: { ar: 'أفراد', en: 'Individual' },
    company: { ar: 'شركات', en: 'Company' },
    supplier: { ar: 'موردين', en: 'Supplier' }
};

// مفاتيح التخزين
const TEST_PERMISSIONS_KEY = 'arba_test_mode_permissions';
const CURRENT_TEST_SESSION_KEY = 'arba_current_test_session';

// رقم المدير العام - لديه كافة الصلاحيات تلقائياً
const SUPER_ADMIN_EMPLOYEE_NUMBER = '2201187';

/**
 * التحقق إذا كان الموظف هو المدير العام
 */
export const isSuperAdmin = (employeeNumber: string): boolean => {
    return employeeNumber === SUPER_ADMIN_EMPLOYEE_NUMBER;
};

/**
 * الحصول على صلاحيات الاختبار لجميع الموظفين
 */
export const getAllTestPermissions = (): Record<string, TestModePermission> => {
    const data = localStorage.getItem(TEST_PERMISSIONS_KEY);
    return data ? JSON.parse(data) : {};
};

/**
 * حفظ صلاحيات الاختبار
 */
const saveTestPermissions = (permissions: Record<string, TestModePermission>): void => {
    localStorage.setItem(TEST_PERMISSIONS_KEY, JSON.stringify(permissions));
};

/**
 * الحصول على صلاحيات الاختبار لموظف معين
 */
export const getEmployeeTestPermissions = (employeeNumber: string): TestModePermission | null => {
    // المدير العام لديه كافة الصلاحيات تلقائياً
    if (isSuperAdmin(employeeNumber)) {
        return {
            canTestCompanyPackages: true,
            canTestIndividualPackages: true,
            canTestSupplierPackages: true,
            grantedBy: 'system',
            grantedAt: new Date().toISOString()
        };
    }

    const permissions = getAllTestPermissions();
    return permissions[employeeNumber] || null;
};

/**
 * تعيين صلاحيات الاختبار لموظف
 * فقط المدير العام يستطيع منح الصلاحيات
 */
export const setEmployeeTestPermissions = (
    targetEmployeeNumber: string,
    permissions: Partial<TestModePermission>,
    grantedByEmployeeNumber: string
): boolean => {
    // فقط المدير العام يستطيع منح الصلاحيات
    if (!isSuperAdmin(grantedByEmployeeNumber)) {
        return false;
    }

    // لا يمكن تغيير صلاحيات المدير العام
    if (isSuperAdmin(targetEmployeeNumber)) {
        return false;
    }

    const allPermissions = getAllTestPermissions();
    const currentPermissions = allPermissions[targetEmployeeNumber] || {
        canTestCompanyPackages: false,
        canTestIndividualPackages: false,
        canTestSupplierPackages: false,
        grantedBy: '',
        grantedAt: ''
    };

    allPermissions[targetEmployeeNumber] = {
        ...currentPermissions,
        ...permissions,
        grantedBy: grantedByEmployeeNumber,
        grantedAt: new Date().toISOString()
    };

    saveTestPermissions(allPermissions);
    return true;
};

/**
 * سحب كافة صلاحيات الاختبار من موظف
 */
export const revokeAllTestPermissions = (
    targetEmployeeNumber: string,
    revokedByEmployeeNumber: string
): boolean => {
    if (!isSuperAdmin(revokedByEmployeeNumber)) {
        return false;
    }

    if (isSuperAdmin(targetEmployeeNumber)) {
        return false;
    }

    const allPermissions = getAllTestPermissions();
    delete allPermissions[targetEmployeeNumber];
    saveTestPermissions(allPermissions);
    return true;
};

/**
 * التحقق إذا كان الموظف يستطيع اختبار نوع معين
 */
export const canEmployeeTest = (
    employeeNumber: string,
    userType: TestUserType
): boolean => {
    const permissions = getEmployeeTestPermissions(employeeNumber);
    if (!permissions) return false;

    switch (userType) {
        case 'company':
            return permissions.canTestCompanyPackages;
        case 'individual':
            return permissions.canTestIndividualPackages;
        case 'supplier':
            return permissions.canTestSupplierPackages;
        default:
            return false;
    }
};

/**
 * التحقق إذا كان الموظف لديه أي صلاحية اختبار
 */
export const hasAnyTestPermission = (employeeNumber: string): boolean => {
    const permissions = getEmployeeTestPermissions(employeeNumber);
    if (!permissions) return false;

    return permissions.canTestCompanyPackages ||
        permissions.canTestIndividualPackages ||
        permissions.canTestSupplierPackages;
};

/**
 * بدء جلسة الاختبار
 */
export const startTestMode = (
    employeeNumber: string,
    employeeName: string,
    plan: PackagePlan,
    userType: TestUserType
): TestSession | null => {
    // التحقق من الصلاحية
    if (!canEmployeeTest(employeeNumber, userType)) {
        return null;
    }

    const session: TestSession = {
        testerEmployee: {
            employeeNumber,
            name: employeeName
        },
        testingPackage: {
            plan,
            userType
        },
        startedAt: new Date().toISOString()
    };

    localStorage.setItem(CURRENT_TEST_SESSION_KEY, JSON.stringify(session));
    return session;
};

/**
 * إنهاء جلسة الاختبار
 */
export const endTestMode = (): void => {
    localStorage.removeItem(CURRENT_TEST_SESSION_KEY);
};

/**
 * الحصول على جلسة الاختبار الحالية
 */
export const getCurrentTestSession = (): TestSession | null => {
    const data = localStorage.getItem(CURRENT_TEST_SESSION_KEY);
    return data ? JSON.parse(data) : null;
};

/**
 * التحقق إذا كان وضع الاختبار نشطاً
 */
export const isInTestMode = (): boolean => {
    return getCurrentTestSession() !== null;
};

/**
 * الحصول على قائمة الباقات المتاحة للاختبار
 */
export const getAvailablePackagesForTest = (): { plan: PackagePlan; userType: TestUserType }[] => {
    return [
        // باقات الأفراد: مجاني + محترفين
        { plan: 'free', userType: 'individual' },
        { plan: 'professional', userType: 'individual' },
        // باقات الشركات: مجاني + برو
        { plan: 'free', userType: 'company' },
        { plan: 'pro', userType: 'company' },
        // باقات الموردين: شبكة واحدة فقط
        { plan: 'network', userType: 'supplier' },
    ];
};

export default {
    isSuperAdmin,
    getAllTestPermissions,
    getEmployeeTestPermissions,
    setEmployeeTestPermissions,
    revokeAllTestPermissions,
    canEmployeeTest,
    hasAnyTestPermission,
    startTestMode,
    endTestMode,
    getCurrentTestSession,
    isInTestMode,
    getAvailablePackagesForTest,
    TEST_MODE_TRANSLATIONS,
    PACKAGE_TRANSLATIONS,
    TEST_USER_TYPE_TRANSLATIONS
};
