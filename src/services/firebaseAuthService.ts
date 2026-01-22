/**
 * Firebase Authentication Service
 * خدمة المصادقة عبر Firebase
 */

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged,
    User
} from 'firebase/auth';
import { auth } from '../config/firebase';

// =================== تسجيل مستخدم جديد ===================

export interface RegisterData {
    email: string;
    password: string;
    name: string;
    phone?: string;
    userType: 'individual' | 'company' | 'supplier';
    plan: 'free' | 'professional';
    companyName?: string;
    commercialRegister?: string;
}

export interface AuthResult {
    success: boolean;
    user?: User;
    error?: string;
}

/**
 * تسجيل مستخدم جديد مع إرسال رابط التحقق
 */
export async function registerWithEmail(data: RegisterData): Promise<AuthResult> {
    try {
        // إنشاء حساب في Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            data.email,
            data.password
        );

        // إرسال رابط التحقق من البريد
        await sendEmailVerification(userCredential.user);

        console.log('✅ تم إنشاء الحساب وإرسال رابط التحقق');

        return {
            success: true,
            user: userCredential.user
        };
    } catch (error: any) {
        console.error('❌ خطأ في التسجيل:', error);

        let errorMessage = 'حدث خطأ أثناء التسجيل';

        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'البريد الإلكتروني مستخدم مسبقاً';
                break;
            case 'auth/invalid-email':
                errorMessage = 'البريد الإلكتروني غير صالح';
                break;
            case 'auth/weak-password':
                errorMessage = 'كلمة المرور ضعيفة جداً (يجب أن تكون 6 أحرف على الأقل)';
                break;
        }

        return {
            success: false,
            error: errorMessage
        };
    }
}

// =================== تسجيل الدخول ===================

/**
 * تسجيل الدخول بالبريد وكلمة المرور
 */
export async function loginWithEmail(email: string, password: string): Promise<AuthResult> {
    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);

        // التحقق من تأكيد البريد
        if (!userCredential.user.emailVerified) {
            return {
                success: false,
                error: 'يرجى تأكيد بريدك الإلكتروني أولاً'
            };
        }

        console.log('✅ تم تسجيل الدخول بنجاح');

        return {
            success: true,
            user: userCredential.user
        };
    } catch (error: any) {
        console.error('❌ خطأ في تسجيل الدخول:', error);

        let errorMessage = 'خطأ في تسجيل الدخول';

        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'لا يوجد حساب بهذا البريد';
                break;
            case 'auth/wrong-password':
                errorMessage = 'كلمة المرور غير صحيحة';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'تم تجاوز عدد المحاولات، حاول لاحقاً';
                break;
            case 'auth/invalid-credential':
                errorMessage = 'بيانات الدخول غير صحيحة';
                break;
        }

        return {
            success: false,
            error: errorMessage
        };
    }
}

// =================== تسجيل الخروج ===================

export async function logout(): Promise<void> {
    try {
        await signOut(auth);
        console.log('✅ تم تسجيل الخروج');
    } catch (error) {
        console.error('❌ خطأ في تسجيل الخروج:', error);
    }
}

// =================== إعادة تعيين كلمة المرور ===================

export async function resetPassword(email: string): Promise<AuthResult> {
    try {
        await sendPasswordResetEmail(auth, email);
        console.log('✅ تم إرسال رابط إعادة تعيين كلمة المرور');

        return {
            success: true
        };
    } catch (error: any) {
        console.error('❌ خطأ في إرسال رابط الاستعادة:', error);

        let errorMessage = 'حدث خطأ';

        if (error.code === 'auth/user-not-found') {
            errorMessage = 'لا يوجد حساب بهذا البريد';
        }

        return {
            success: false,
            error: errorMessage
        };
    }
}

// =================== إعادة إرسال رابط التحقق ===================

export async function resendVerificationEmail(): Promise<AuthResult> {
    try {
        const user = auth.currentUser;

        if (!user) {
            return {
                success: false,
                error: 'لا يوجد مستخدم مسجل الدخول'
            };
        }

        await sendEmailVerification(user);
        console.log('✅ تم إعادة إرسال رابط التحقق');

        return { success: true };
    } catch (error) {
        console.error('❌ خطأ في إرسال رابط التحقق:', error);
        return {
            success: false,
            error: 'حدث خطأ في إرسال الرابط'
        };
    }
}

// =================== مراقبة حالة المصادقة ===================

export function onAuthChange(callback: (user: User | null) => void): () => void {
    return onAuthStateChanged(auth, callback);
}

// =================== الحصول على المستخدم الحالي ===================

export function getCurrentUser(): User | null {
    return auth.currentUser;
}

// =================== التحقق من تسجيل الدخول ===================

export function isLoggedIn(): boolean {
    return auth.currentUser !== null;
}

// =================== التحقق من تأكيد البريد ===================

export function isEmailVerified(): boolean {
    return auth.currentUser?.emailVerified || false;
}
