/**
 * Firebase Authentication Service
 * خدمة المصادقة باستخدام Firebase
 */

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    updateProfile,
    User as FirebaseUser
} from 'firebase/auth';
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
        // إنشاء حساب في Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
            auth,
            userData.email,
            userData.password
        );

        const firebaseUser = userCredential.user;

        // تحديث اسم المستخدم
        await updateProfile(firebaseUser, {
            displayName: userData.name
        });

        // حفظ بيانات المستخدم في Firestore
        const userDoc = {
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

        await setDoc(doc(db, 'users', firebaseUser.uid), userDoc);

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
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
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
