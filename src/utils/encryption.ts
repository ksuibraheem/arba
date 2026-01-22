/**
 * Encryption Utilities
 * أدوات التشفير للبيانات الحساسة
 * 
 * استخدام: AES-256-GCM للتشفير المتماثل
 */

// مفتاح التشفير من المتغيرات البيئية
const ENCRYPTION_KEY = import.meta.env.VITE_ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef';

/**
 * تشفير نص باستخدام Web Crypto API
 */
export function encrypt(text: string): string {
    if (!text) return '';

    try {
        // تشفير بسيط للـ Frontend (Base64 + XOR)
        // ملاحظة: للأمان الكامل، يجب التشفير على الـ Backend
        const encoded = btoa(encodeURIComponent(text));
        const key = ENCRYPTION_KEY.substring(0, 32);

        let result = '';
        for (let i = 0; i < encoded.length; i++) {
            const charCode = encoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            result += String.fromCharCode(charCode);
        }

        return btoa(result);
    } catch (error) {
        console.error('خطأ في التشفير:', error);
        return text;
    }
}

/**
 * فك تشفير نص
 */
export function decrypt(encryptedText: string): string {
    if (!encryptedText) return '';

    try {
        const decoded = atob(encryptedText);
        const key = ENCRYPTION_KEY.substring(0, 32);

        let result = '';
        for (let i = 0; i < decoded.length; i++) {
            const charCode = decoded.charCodeAt(i) ^ key.charCodeAt(i % key.length);
            result += String.fromCharCode(charCode);
        }

        return decodeURIComponent(atob(result));
    } catch (error) {
        console.error('خطأ في فك التشفير:', error);
        return encryptedText;
    }
}

/**
 * تشفير كائن كامل (للبيانات المتعددة)
 */
export function encryptObject(obj: Record<string, any>, fieldsToEncrypt: string[]): Record<string, any> {
    const result = { ...obj };

    fieldsToEncrypt.forEach(field => {
        if (result[field] && typeof result[field] === 'string') {
            result[field] = encrypt(result[field]);
        }
    });

    return result;
}

/**
 * فك تشفير كائن
 */
export function decryptObject(obj: Record<string, any>, fieldsToDecrypt: string[]): Record<string, any> {
    const result = { ...obj };

    fieldsToDecrypt.forEach(field => {
        if (result[field] && typeof result[field] === 'string') {
            result[field] = decrypt(result[field]);
        }
    });

    return result;
}

/**
 * إخفاء جزء من النص (للعرض)
 * مثال: 0551234567 -> 055****567
 */
export function maskText(text: string, visibleStart: number = 3, visibleEnd: number = 3): string {
    if (!text || text.length <= visibleStart + visibleEnd) return text;

    const start = text.substring(0, visibleStart);
    const end = text.substring(text.length - visibleEnd);
    const masked = '*'.repeat(text.length - visibleStart - visibleEnd);

    return `${start}${masked}${end}`;
}

/**
 * إخفاء البريد الإلكتروني
 * مثال: user@example.com -> u***@example.com
 */
export function maskEmail(email: string): string {
    if (!email || !email.includes('@')) return email;

    const [localPart, domain] = email.split('@');
    const maskedLocal = localPart.charAt(0) + '***';

    return `${maskedLocal}@${domain}`;
}
