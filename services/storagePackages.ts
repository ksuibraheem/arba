/**
 * Storage Packages — باقات التخزين المدفوعة
 * أسعار مبنية على Firebase Storage ($0.026/GB/month) + 75% هامش ربح
 * حصري لباقة المؤسسات (Enterprise)
 */

export interface StoragePackage {
    id: string;
    name: { ar: string; en: string };
    sizeGB: number;
    firebaseCostUSD: number;    // التكلفة الحقيقية بالدولار
    priceMonthSAR: number;     // سعر البيع الشهري بالريال
    priceYearSAR: number;      // سعر البيع السنوي بالريال (خصم شهرين)
    color: string;             // لون الباقة في UI
    icon: string;              // أيقونة
    popular?: boolean;         // الأكثر طلباً
}

export const FREE_STORAGE_GB = 5; // مساحة مجانية مع باقة المؤسسات

export const STORAGE_PACKAGES: StoragePackage[] = [
    {
        id: 'storage_100',
        name: { ar: 'أساسي', en: 'Basic' },
        sizeGB: 100,
        firebaseCostUSD: 2.60,
        priceMonthSAR: 17,
        priceYearSAR: 170,
        color: 'from-emerald-500 to-teal-600',
        icon: '🟢',
    },
    {
        id: 'storage_500',
        name: { ar: 'متقدم', en: 'Advanced' },
        sizeGB: 500,
        firebaseCostUSD: 13.00,
        priceMonthSAR: 85,
        priceYearSAR: 850,
        color: 'from-blue-500 to-indigo-600',
        icon: '🔵',
        popular: true,
    },
    {
        id: 'storage_1000',
        name: { ar: 'احترافي', en: 'Professional' },
        sizeGB: 1024,
        firebaseCostUSD: 26.00,
        priceMonthSAR: 170,
        priceYearSAR: 1700,
        color: 'from-purple-500 to-violet-600',
        icon: '🟣',
    },
    {
        id: 'storage_2000',
        name: { ar: 'مؤسسي', en: 'Enterprise' },
        sizeGB: 2048,
        firebaseCostUSD: 52.00,
        priceMonthSAR: 340,
        priceYearSAR: 3400,
        color: 'from-amber-500 to-orange-600',
        icon: '🟡',
    },
];

export interface StorageUsage {
    usedBytes: number;
    totalBytes: number;
    usedGB: number;
    totalGB: number;
    percentage: number;
    remainingGB: number;
}

/**
 * Calculate storage usage for a company
 */
export function calculateStorageUsage(
    usedBytes: number,
    packageSizeGB: number = FREE_STORAGE_GB
): StorageUsage {
    const totalBytes = packageSizeGB * 1024 * 1024 * 1024;
    const usedGB = usedBytes / (1024 * 1024 * 1024);
    const percentage = totalBytes > 0 ? (usedBytes / totalBytes) * 100 : 0;
    const remainingGB = Math.max(0, packageSizeGB - usedGB);

    return {
        usedBytes,
        totalBytes,
        usedGB: Math.round(usedGB * 100) / 100,
        totalGB: packageSizeGB,
        percentage: Math.round(percentage * 10) / 10,
        remainingGB: Math.round(remainingGB * 100) / 100,
    };
}

/**
 * Format storage size for display
 */
export function formatStorageSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

/**
 * Check if upload is allowed given current usage and file size
 */
export function canUploadFile(
    currentUsedBytes: number,
    fileSizeBytes: number,
    packageSizeGB: number = FREE_STORAGE_GB
): { allowed: boolean; reason?: { ar: string; en: string } } {
    const totalBytes = packageSizeGB * 1024 * 1024 * 1024;
    const afterUpload = currentUsedBytes + fileSizeBytes;

    if (afterUpload > totalBytes) {
        const needed = formatStorageSize(afterUpload - totalBytes);
        return {
            allowed: false,
            reason: {
                ar: `المساحة غير كافية. تحتاج ${needed} إضافية. قم بترقية باقة التخزين.`,
                en: `Insufficient storage. Need ${needed} more. Upgrade your storage package.`,
            },
        };
    }

    // Warning at 90%
    if (afterUpload > totalBytes * 0.9) {
        return {
            allowed: true,
            reason: {
                ar: 'تنبيه: اقتربت من الحد الأقصى للمساحة. فكّر بترقية الباقة.',
                en: 'Warning: Approaching storage limit. Consider upgrading.',
            },
        };
    }

    return { allowed: true };
}

/**
 * Get the next upgrade package
 */
export function getNextPackage(currentSizeGB: number): StoragePackage | null {
    const sorted = [...STORAGE_PACKAGES].sort((a, b) => a.sizeGB - b.sizeGB);
    return sorted.find(p => p.sizeGB > currentSizeGB) || null;
}
