/**
 * Firebase Authentication Service
 * خدمة المصادقة باستخدام Firebase
 */

import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    sendEmailVerification,
    sendPasswordResetEmail,
    signOut,
    onAuthStateChanged,
    updateProfile,
    applyActionCode,
    User as FirebaseUser,
    ActionCodeSettings
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

/**
 * إعدادات روابط الإجراء — Action Code Settings
 * يُعاد توجيه المستخدم لهذه الروابط بعد الضغط على الرابط في الإيميل
 */
const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://arba-sys.com';

const VERIFY_EMAIL_SETTINGS: ActionCodeSettings = {
    url: `${BASE_URL}/?emailVerified=true`,
    handleCodeInApp: false,
};

const RESET_PASSWORD_SETTINGS: ActionCodeSettings = {
    url: `${BASE_URL}/?passwordReset=true`,
    handleCodeInApp: false,
};

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

    // ── V2: Usage Tracking Fields ──
    usedAIItems?: number;           // عدد بنود AI المستخدمة هذا الشهر
    usedBOQUploads?: number;        // عدد BOQ المرفوعة هذا الشهر
    usedEmployees?: number;         // عدد الموظفين الحاليين
    usedAPICalls?: number;          // عدد API calls هذا الشهر
    usedTenderReports?: number;     // عدد تقارير المناقصات هذا الشهر

    // ── V2: Billing Fields ──
    billingCycle?: 'monthly' | 'annual';   // دورة الفوترة
    subscriptionStart?: string;            // تاريخ بداية الاشتراك (ISO)
    subscriptionEnd?: string;              // تاريخ نهاية الاشتراك (ISO)
    lastUsageReset?: string;               // آخر تصفير شهري (ISO)
    stripeCustomerId?: string;             // معرف عميل Stripe/Tap
}

export interface AuthResult {
    success: boolean;
    user?: UserData;
    error?: string;
    errorCode?: string;
    emailVerificationSent?: boolean;
}

/**
 * تسجيل مستخدم جديد — Atomic Registration
 * 🛡️ إذا فشلت كتابة Firestore، يتم حذف حساب Auth تلقائياً (Rollback)
 * هذا يمنع مشكلة "Phantom Users" — مستخدم في Auth بدون بيانات في Firestore
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
    let firebaseUser: any = null; // Track for rollback

    try {
        // ═══════════════════════════════════════════════════════
        // STEP 1: Create Auth user (CRITICAL — rollback if later steps fail)
        // ═══════════════════════════════════════════════════════
        const userCredential = await withTimeout(
            createUserWithEmailAndPassword(auth, userData.email, userData.password),
            10000,
            'انتهت مهلة إنشاء الحساب. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.'
        );
        firebaseUser = userCredential.user;

        // ═══════════════════════════════════════════════════════
        // STEP 2: Write user document to Firestore (CRITICAL — MUST succeed)
        // ═══════════════════════════════════════════════════════
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
            // V2: Usage tracking fields
            usedAIItems: 0,
            usedBOQUploads: 0,
            usedEmployees: 0,
            usedAPICalls: 0,
            usedTenderReports: 0,
            // V2: Billing fields
            billingCycle: 'monthly',
            subscriptionStart: new Date().toISOString(),
            lastUsageReset: new Date().toISOString(),
            createdAt: serverTimestamp()
        };

        await withTimeout(
            setDoc(doc(db, 'users', firebaseUser.uid), userDoc),
            10000,
            'انتهت مهلة حفظ بيانات المستخدم. يرجى التحقق من اتصال الإنترنت والمحاولة مرة أخرى.'
        );

        // ═══════════════════════════════════════════════════════
        // STEP 3: Write userRoles document (CRITICAL — RBAC depends on this)
        // ═══════════════════════════════════════════════════════
        await withTimeout(
            setDoc(doc(db, 'userRoles', firebaseUser.uid), {
                role: 'user',
                userType: userData.userType,
                plan: userData.plan,
                createdAt: serverTimestamp()
            }),
            10000,
            'انتهت مهلة حفظ صلاحيات المستخدم.'
        );

        // ═══════════════════════════════════════════════════════
        // STEP 4: Non-critical operations (won't trigger rollback)
        // ═══════════════════════════════════════════════════════
        
        // Update display name (optional — won't rollback on failure)
        try {
            await withTimeout(
                updateProfile(firebaseUser, { displayName: userData.name }),
                5000,
                'تعذر تحديث اسم المستخدم.'
            );
        } catch (profileError) {
            console.warn('⚠️ تعذر تحديث اسم المستخدم (غير حرج):', profileError);
        }

        // Send email verification (optional — won't rollback on failure)
        let emailVerificationSent = false;
        try {
            await withTimeout(
                sendEmailVerification(firebaseUser, VERIFY_EMAIL_SETTINGS),
                5000,
                'تعذر إرسال رابط التحقق من البريد الإلكتروني.'
            );
            emailVerificationSent = true;
        } catch (verifyError) {
            console.warn('⚠️ تم إنشاء الحساب لكن تعذر إرسال رابط التحقق:', verifyError);
        }

        return {
            success: true,
            emailVerificationSent,
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
        console.error('❌ Registration error:', error);

        // ═══════════════════════════════════════════════════════
        // ROLLBACK: Delete Auth user if Firestore write failed
        // This prevents "Phantom Users" (Auth exists, Firestore missing)
        // ═══════════════════════════════════════════════════════
        if (firebaseUser) {
            try {
                await firebaseUser.delete();
            } catch (deleteError) {
                console.error('⚠️ Rollback failed — manual cleanup needed for:', userData.email, deleteError);
            }
        }

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
            // Super Admin: override plan to enterprise
            const isSuperAdmin = (userData.email || email).toLowerCase() === (import.meta.env.VITE_SUPER_ADMIN_EMAIL || '').toLowerCase();
            return {
                success: true,
                user: {
                    ...userData,
                    uid: firebaseUser.uid,
                    plan: isSuperAdmin ? 'enterprise' : userData.plan,
                    createdAt: (userData.createdAt as Timestamp)?.toDate?.() || new Date()
                }
            };
        } else {
            // المستخدم موجود في Auth لكن ليس في Firestore
            const isSuperAdmin = (firebaseUser.email || email).toLowerCase() === (import.meta.env.VITE_SUPER_ADMIN_EMAIL || '').toLowerCase();
            return {
                success: true,
                user: {
                    uid: firebaseUser.uid,
                    userType: 'individual',
                    name: firebaseUser.displayName || 'مستخدم',
                    email: firebaseUser.email || email,
                    plan: isSuperAdmin ? 'enterprise' : 'free',
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
                errorMessage = 'البريد الإلكتروني غير مسجل. تأكد من صحة البريد أو قم بإنشاء حساب جديد.';
                break;
            case 'auth/wrong-password':
                errorMessage = 'كلمة المرور غير صحيحة. تأكد من كلمة المرور أو استخدم "نسيت كلمة المرور".';
                break;
            case 'auth/invalid-email':
                errorMessage = 'البريد الإلكتروني غير صالح. يرجى إدخال بريد إلكتروني صحيح.';
                break;
            case 'auth/too-many-requests':
                errorMessage = 'تم حظر الدخول مؤقتاً بسبب محاولات كثيرة. حاول مرة أخرى بعد عدة دقائق.';
                break;
            case 'auth/invalid-credential':
                errorMessage = 'البريد الإلكتروني أو كلمة المرور غير صحيحة. يرجى التحقق والمحاولة مرة أخرى.';
                break;
            case 'auth/user-disabled':
                errorMessage = 'تم تعطيل هذا الحساب. يرجى التواصل مع الدعم الفني.';
                break;
            case 'auth/network-request-failed':
                errorMessage = 'فشل الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.';
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
 * إعادة تعيين كلمة المرور عبر البريد الإلكتروني
 */
export const resetPasswordWithFirebase = async (email: string): Promise<AuthResult> => {
    try {
        await withTimeout(
            sendPasswordResetEmail(auth, email, RESET_PASSWORD_SETTINGS),
            10000,
            'تعذر إرسال رابط إعادة تعيين كلمة المرور. يرجى المحاولة لاحقاً.'
        );
        return { success: true };
    } catch (error: any) {
        console.error('Password reset error:', error);
        
        // If user not found in Firebase Auth, try local auth service
        if (error.code === 'auth/user-not-found') {
            try {
                const { findUserByEmail, resetPassword } = await import('../services/authService');
                const localUser = findUserByEmail(email);
                if (localUser) {
                    const tempPassword = Math.random().toString(36).slice(-8) + 'A1!';
                    await resetPassword(email, tempPassword);
                    return {
                        success: true,
                        error: `تم إعادة تعيين كلمة المرور مؤقتاً إلى: ${tempPassword}`
                    };
                }
            } catch (localErr) {
                console.warn('Local auth fallback failed:', localErr);
            }
        }
        
        let errorMessage = 'حدث خطأ أثناء إرسال رابط الاستعادة';
        if (error.code === 'auth/user-not-found') {
            errorMessage = 'البريد الإلكتروني غير مسجل';
        } else if (error.code === 'auth/invalid-email') {
            errorMessage = 'البريد الإلكتروني غير صالح';
        } else if (error.message && !error.code) {
            errorMessage = error.message;
        }
        return { success: false, error: errorMessage, errorCode: error.code || 'timeout' };
    }
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
 * إعادة إرسال رابط التحقق من البريد الإلكتروني
 */
export const resendVerificationEmail = async (): Promise<AuthResult> => {
    try {
        const user = auth.currentUser;
        if (!user) {
            return { success: false, error: 'لا يوجد مستخدم مسجل الدخول' };
        }
        if (user.emailVerified) {
            return { success: true }; // Already verified
        }
        await withTimeout(
            sendEmailVerification(user, VERIFY_EMAIL_SETTINGS),
            10000,
            'تعذر إرسال رابط التحقق. يرجى المحاولة لاحقاً.'
        );
        return { success: true };
    } catch (error: any) {
        console.error('Resend verification error:', error);
        return {
            success: false,
            error: error.message || 'حدث خطأ في إرسال رابط التحقق',
            errorCode: error.code || 'unknown'
        };
    }
};

/**
 * التحقق من حالة تأكيد البريد (يُعيد تحميل بيانات المستخدم من Firebase)
 */
export const checkEmailVerified = async (): Promise<boolean> => {
    try {
        const user = auth.currentUser;
        if (!user) return false;
        // Force refresh the auth token to get latest emailVerified status
        await user.getIdToken(true);
        await user.reload();
        return user.emailVerified;
    } catch (error) {
        console.error('Check email verified error:', error);
        return false;
    }
};

/**
 * معالجة عودة المستخدم من رابط التحقق — يطبّق الـ Action Code مباشرة
 */
export const handleVerificationReturn = async (oobCode: string): Promise<AuthResult> => {
    try {
        await applyActionCode(auth, oobCode);
        // Reload user to reflect new emailVerified status
        if (auth.currentUser) {
            await auth.currentUser.reload();
        }
        return { success: true };
    } catch (error: any) {
        console.error('Apply action code error:', error);
        return {
            success: false,
            error: error.message || 'حدث خطأ في تفعيل البريد',
            errorCode: error.code || 'unknown'
        };
    }
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
    resetPasswordWithFirebase,
    resendVerificationEmail,
    checkEmailVerified,
    handleVerificationReturn,
    getCurrentFirebaseUser,
    onAuthChange,
    getUserData
};
