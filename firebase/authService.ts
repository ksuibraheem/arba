/**
 * Firebase Authentication Service
 * خدمة المصادقة باستخدام Firebase
 */

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    signOut,
    onAuthStateChanged,
    updateProfile,
    User as FirebaseUser
} from 'firebase/auth';

/**
 * Timeout wrapper — يمنع تعليق الواجهة
 * Races a promise against a timer. If the promise doesn't resolve
 * within `ms` milliseconds, it rejects with a descriptive error.
 */
function withTimeout<T>(promise: Promise<T>, ms: number, errorMsg: string): Promise<T> {
    return Promise.race([
        promise,
        new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error(errorMsg)), ms)
        ),
    ]);
}
import {
    doc,
    setDoc,
    getDoc,
    collection,
    serverTimestamp,
    Timestamp
} from 'firebase/firestore';
import { auth, db } from './config';

// نوع بيانات المستخدم
export interface UserData {
    uid: string;
    userType: 'individual' | 'company' | 'supplier' | 'employee';
    name: string;
    email: string;
    phone?: string;
    company?: string;
    commercialRegister?: string;
    businessType?: string;
    plan: string;
    usedProjects: number;
    usedStorageMB: number;
    companyLogo?: string;
    createdAt: Date | Timestamp;
}

export interface AuthResult {
    success: boolean;
    user?: UserData;
    error?: string;
    errorCode?: string;
}

/**
 * تسجيل مستخدم جديد
 */
export const registerWithFirebase = async (userData: {
    userType: 'individual' | 'company' | 'supplier';
    name: string;
    email: string;
    phone?: string;
    company?: string;
    commercialRegister?: string;
    businessType?: string;
    password: string;
    plan: string;
}): Promise<AuthResult> => {
    try {
        // إنشاء حساب في Firebase Auth (مع حماية من التعليق)
        const userCredential = await withTimeout(
            createUserWithEmailAndPassword(auth, userData.email, userData.password),
            10000,
            'انتهت مهلة إنشاء الحساب. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.'
        );

        const firebaseUser = userCredential.user;

        // تحديث اسم المستخدم
        await withTimeout(
            updateProfile(firebaseUser, { displayName: userData.name }),
            10000,
            'انتهت مهلة تحديث بيانات الحساب. يرجى المحاولة مرة أخرى.'
        );

        // إرسال رابط التحقق من البريد الإلكتروني
        await withTimeout(
            sendEmailVerification(firebaseUser),
            10000,
            'تعذر إرسال رابط التحقق من البريد الإلكتروني. يرجى المحاولة لاحقاً.'
        );

        // حفظ بيانات المستخدم في Firestore
        const userDoc = {
            uid: firebaseUser.uid,
            userType: userData.userType,
            name: userData.name,
            email: userData.email,
            phone: userData.phone || '',
            company: userData.company || '',
            commercialRegister: userData.commercialRegister || '',
            businessType: userData.businessType || '',
            plan: userData.plan,
            usedProjects: 0,
            usedStorageMB: 0,
            createdAt: serverTimestamp()
        };

        await withTimeout(
            setDoc(doc(db, 'users', firebaseUser.uid), userDoc),
            10000,
            'انتهت مهلة حفظ بيانات المستخدم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.'
        );

        return {
            success: true,
            user: {
                uid: firebaseUser.uid,
                userType: userData.userType,
                name: userData.name,
                email: userData.email,
                phone: userData.phone || '',
                company: userData.company || '',
                commercialRegister: userData.commercialRegister || '',
                businessType: userData.businessType || '',
                plan: userData.plan,
                usedProjects: 0,
                usedStorageMB: 0,
                createdAt: new Date()
            }
        };
    } catch (error: any) {
        console.error('Registration error:', error);

        // Handle timeout errors
        if (error.message && !error.code) {
            return {
                success: false,
                error: error.message,
                errorCode: 'timeout'
            };
        }

        let errorMessage = 'حدث خطأ أثناء التسجيل';

        switch (error.code) {
            case 'auth/email-already-in-use':
                errorMessage = 'البريد الإلكتروني مستخدم مسبقاً';
                break;
            case 'auth/weak-password':
                errorMessage = 'كلمة المرور ضعيفة - يجب أن تكون 6 أحرف على الأقل';
                break;
            case 'auth/invalid-email':
                errorMessage = 'البريد الإلكتروني غير صالح';
                break;
        }

        return {
            success: false,
            error: errorMessage,
            errorCode: error.code
        };
    }
};

/**
 * تسجيل الدخول
 */
export const loginWithFirebase = async (
    email: string,
    password: string
): Promise<AuthResult> => {
    try {
        const userCredential = await withTimeout(
            signInWithEmailAndPassword(auth, email, password),
            10000,
            'انتهت مهلة تسجيل الدخول. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.'
        );
        const firebaseUser = userCredential.user;

        // جلب بيانات المستخدم من Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data() as Omit<UserData, 'uid'>;
            return {
                success: true,
                user: {
                    ...userData,
                    uid: firebaseUser.uid,
                    createdAt: (userData.createdAt as Timestamp)?.toDate?.() || new Date()
                }
            };
        } else {
            // المستخدم موجود في Auth لكن ليس في Firestore
            return {
                success: true,
                user: {
                    uid: firebaseUser.uid,
                    userType: 'individual',
                    name: firebaseUser.displayName || 'مستخدم',
                    email: firebaseUser.email || email,
                    plan: 'free',
                    usedProjects: 0,
                    usedStorageMB: 0,
                    createdAt: new Date()
                }
            };
        }
    } catch (error: any) {
        console.error('Login error:', error);

        // Handle timeout errors
        if (error.message && !error.code) {
            return {
                success: false,
                error: error.message,
                errorCode: 'timeout'
            };
        }

        let errorMessage = 'حدث خطأ أثناء تسجيل الدخول';

        switch (error.code) {
            case 'auth/user-not-found':
                errorMessage = 'البريد الإلكتروني غير مسجل';
                break;
            case 'auth/wrong-password':
                errorMessage = 'كلمة المرور غير صحيحة';
                break;
            case 'auth/invalid-email':
                errorMessage = 'البريد الإلكتروني غير صالح';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'محاولات كثيرة - حاول لاحقاً';
                break;
            case 'auth/invalid-credential':
                errorMessage = 'بيانات الدخول غير صحيحة';
                break;
        }

        return {
            success: false,
            error: errorMessage,
            errorCode: error.code
        };
    }
};

/**
 * تسجيل الخروج
 */
export const logoutFromFirebase = async (): Promise<void> => {
    await signOut(auth);
};

/**
 * الحصول على المستخدم الحالي
 */
export const getCurrentFirebaseUser = (): FirebaseUser | null => {
    return auth.currentUser;
};

/**
 * مراقبة حالة المصادقة
 */
export const onAuthChange = (callback: (user: FirebaseUser | null) => void) => {
    return onAuthStateChanged(auth, callback);
};

/**
 * جلب بيانات المستخدم من Firestore
 */
export const getUserData = async (uid: string): Promise<UserData | null> => {
    try {
        const userDocRef = doc(db, 'users', uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const data = userDocSnap.data();
            return {
                ...data,
                uid,
                createdAt: (data.createdAt as Timestamp)?.toDate?.() || new Date()
            } as UserData;
        }
        return null;
    } catch (error) {
        console.error('Error fetching user data:', error);
        return null;
    }
};

export default {
    registerWithFirebase,
    loginWithFirebase,
    logoutFromFirebase,
    getCurrentFirebaseUser,
    onAuthChange,
    getUserData
};
