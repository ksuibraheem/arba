/**
 * خدمة تخزين بيانات الموردين
 * Supplier Storage Service - Manages supplier data persistence
 */

import { SupplierEmployee, SupplierServicesCatalog, createDefaultServicesCatalog } from './supplierManagementService';

// =================== مفاتيح التخزين ===================
const SUPPLIER_DATA_KEY = 'arba_supplier_data';
const SUPPLIER_EMPLOYEES_KEY = 'arba_supplier_employees';
const SUPPLIER_SERVICES_KEY = 'arba_supplier_services';

// =================== أنواع البيانات ===================

export interface SupplierStorageData {
    supplierId: string;
    employees: SupplierEmployee[];
    services: SupplierServicesCatalog;
    lastUpdated: string;
}

// =================== دوال التخزين العامة ===================

/**
 * الحصول على جميع بيانات الموردين المخزنة
 */
const getAllSuppliersData = (): Record<string, SupplierStorageData> => {
    try {
        const data = localStorage.getItem(SUPPLIER_DATA_KEY);
        return data ? JSON.parse(data) : {};
    } catch (error) {
        console.error('خطأ في قراءة بيانات الموردين:', error);
        return {};
    }
};

/**
 * حفظ جميع بيانات الموردين
 */
const saveAllSuppliersData = (data: Record<string, SupplierStorageData>): void => {
    try {
        localStorage.setItem(SUPPLIER_DATA_KEY, JSON.stringify(data));
    } catch (error) {
        console.error('خطأ في حفظ بيانات الموردين:', error);
    }
};

/**
 * الحصول على بيانات مورد معين
 */
export const getSupplierData = (supplierId: string): SupplierStorageData | null => {
    const allData = getAllSuppliersData();
    return allData[supplierId] || null;
};

/**
 * إنشاء بيانات مورد جديد
 */
export const initializeSupplierData = (supplierId: string): SupplierStorageData => {
    const newData: SupplierStorageData = {
        supplierId,
        employees: [],
        services: createDefaultServicesCatalog(),
        lastUpdated: new Date().toISOString()
    };

    const allData = getAllSuppliersData();
    allData[supplierId] = newData;
    saveAllSuppliersData(allData);

    console.log('✅ تم إنشاء بيانات المورد:', supplierId);
    return newData;
};

// =================== إدارة الموظفين ===================

/**
 * الحصول على موظفي مورد معين
 */
export const getSupplierEmployees = (supplierId: string): SupplierEmployee[] => {
    const data = getSupplierData(supplierId);
    return data?.employees || [];
};

/**
 * حفظ موظفي مورد
 */
export const saveSupplierEmployees = (supplierId: string, employees: SupplierEmployee[]): void => {
    const allData = getAllSuppliersData();

    if (!allData[supplierId]) {
        allData[supplierId] = initializeSupplierData(supplierId);
    }

    allData[supplierId].employees = employees;
    allData[supplierId].lastUpdated = new Date().toISOString();
    saveAllSuppliersData(allData);

    console.log(`✅ تم حفظ ${employees.length} موظف للمورد:`, supplierId);
};

/**
 * إضافة موظف جديد
 */
export const addSupplierEmployee = (supplierId: string, employee: SupplierEmployee): SupplierEmployee => {
    const employees = getSupplierEmployees(supplierId);

    // التأكد من عدم تكرار البريد الإلكتروني
    const existingEmail = employees.find(e => e.email.toLowerCase() === employee.email.toLowerCase());
    if (existingEmail) {
        throw new Error('البريد الإلكتروني مسجل مسبقاً');
    }

    const newEmployee: SupplierEmployee = {
        ...employee,
        id: `emp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        createdAt: new Date().toISOString(),
        status: 'pending'
    };

    employees.push(newEmployee);
    saveSupplierEmployees(supplierId, employees);

    console.log('✅ تم إضافة موظف:', newEmployee.name);
    return newEmployee;
};

/**
 * تحديث بيانات موظف
 */
export const updateSupplierEmployee = (
    supplierId: string,
    employeeId: string,
    updates: Partial<SupplierEmployee>
): SupplierEmployee | null => {
    const employees = getSupplierEmployees(supplierId);
    const index = employees.findIndex(e => e.id === employeeId);

    if (index === -1) {
        console.error('الموظف غير موجود:', employeeId);
        return null;
    }

    employees[index] = { ...employees[index], ...updates };
    saveSupplierEmployees(supplierId, employees);

    console.log('✅ تم تحديث الموظف:', employees[index].name);
    return employees[index];
};

/**
 * حذف موظف
 */
export const deleteSupplierEmployee = (supplierId: string, employeeId: string): boolean => {
    const employees = getSupplierEmployees(supplierId);
    const filteredEmployees = employees.filter(e => e.id !== employeeId);

    if (filteredEmployees.length === employees.length) {
        console.error('الموظف غير موجود:', employeeId);
        return false;
    }

    saveSupplierEmployees(supplierId, filteredEmployees);
    console.log('✅ تم حذف الموظف');
    return true;
};

/**
 * البحث عن موظف بالبريد
 */
export const findEmployeeByEmail = (supplierId: string, email: string): SupplierEmployee | null => {
    const employees = getSupplierEmployees(supplierId);
    return employees.find(e => e.email.toLowerCase() === email.toLowerCase()) || null;
};

// =================== إدارة الخدمات ===================

/**
 * الحصول على كتالوج خدمات المورد
 */
export const getSupplierServices = (supplierId: string): SupplierServicesCatalog => {
    const data = getSupplierData(supplierId);
    return data?.services || createDefaultServicesCatalog();
};

/**
 * حفظ كتالوج خدمات المورد
 */
export const saveSupplierServices = (supplierId: string, services: SupplierServicesCatalog): void => {
    const allData = getAllSuppliersData();

    if (!allData[supplierId]) {
        allData[supplierId] = initializeSupplierData(supplierId);
    }

    allData[supplierId].services = services;
    allData[supplierId].lastUpdated = new Date().toISOString();
    saveAllSuppliersData(allData);

    console.log('✅ تم حفظ خدمات المورد:', supplierId);
};

// =================== إحصائيات ===================

/**
 * الحصول على إحصائيات المورد
 */
export const getSupplierStats = (supplierId: string): {
    totalEmployees: number;
    activeEmployees: number;
    pendingEmployees: number;
    enabledServices: number;
    totalServices: number;
} => {
    const employees = getSupplierEmployees(supplierId);
    const services = getSupplierServices(supplierId);

    // حساب الخدمات المفعلة
    let enabledServices = 0;
    let totalServices = 0;

    Object.values(services).forEach(categoryServices => {
        if (Array.isArray(categoryServices)) {
            totalServices += categoryServices.length;
            enabledServices += categoryServices.filter((s: any) => s.enabled).length;
        }
    });

    return {
        totalEmployees: employees.length,
        activeEmployees: employees.filter(e => e.status === 'active').length,
        pendingEmployees: employees.filter(e => e.status === 'pending').length,
        enabledServices,
        totalServices
    };
};

// =================== تصدير الخدمة ===================

export default {
    // بيانات المورد
    getSupplierData,
    initializeSupplierData,

    // الموظفين
    getSupplierEmployees,
    saveSupplierEmployees,
    addSupplierEmployee,
    updateSupplierEmployee,
    deleteSupplierEmployee,
    findEmployeeByEmail,

    // الخدمات
    getSupplierServices,
    saveSupplierServices,

    // الإحصائيات
    getSupplierStats
};
