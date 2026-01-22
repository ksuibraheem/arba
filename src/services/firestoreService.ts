/**
 * Firestore Database Service
 * خدمة قاعدة البيانات Firestore
 */

import {
    doc,
    setDoc,
    getDoc,
    updateDoc,
    collection,
    query,
    where,
    getDocs,
    Timestamp,
    serverTimestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { encrypt, decrypt } from '../utils/encryption';

// =================== أنواع البيانات ===================

export interface UserData {
    uid: string;
    email: string;
    name: string;
    phone?: string;
    userType: 'individual' | 'company' | 'supplier';
    plan: 'free' | 'professional';
    status: 'pending' | 'verified' | 'approved' | 'suspended';
    emailVerified: boolean;
    createdAt: Timestamp;
    updatedAt: Timestamp;
}

export interface CompanyData {
    userId: string;
    companyName: string;
    commercialRegister: string; // مُشفّر
    businessType?: string;
    crVerified: boolean;
    crVerifiedBy?: string;
    crVerifiedAt?: Timestamp;
}

export interface SubscriptionData {
    userId: string;
    plan: 'free' | 'professional';
    amount: number;
    currency: string;
    status: 'active' | 'expired' | 'cancelled' | 'pending';
    paymentId?: string;
    startsAt: Timestamp;
    expiresAt: Timestamp;
}

export interface PaymentData {
    userId: string;
    gateway: 'moyasar' | 'tap' | 'pending';
    gatewayTransactionId?: string;
    amount: number;
    currency: string;
    status: 'pending' | 'completed' | 'failed' | 'refunded';
    createdAt: Timestamp;
}

// =================== خدمات المستخدمين ===================

/**
 * حفظ بيانات المستخدم في Firestore
 */
export async function createUserData(
    uid: string,
    data: Omit<UserData, 'uid' | 'createdAt' | 'updatedAt'>
): Promise<boolean> {
    try {
        const userData: any = {
            uid,
            email: data.email,
            name: data.name,
            userType: data.userType,
            plan: data.plan,
            status: data.status,
            emailVerified: data.emailVerified,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        };

        // تشفير رقم الجوال إذا وُجد
        if (data.phone) {
            userData.phone = encrypt(data.phone);
        }

        await setDoc(doc(db, 'users', uid), userData);
        console.log('✅ تم حفظ بيانات المستخدم');
        return true;
    } catch (error) {
        console.error('❌ خطأ في حفظ بيانات المستخدم:', error);
        return false;
    }
}

/**
 * قراءة بيانات المستخدم
 */
export async function getUserData(uid: string): Promise<UserData | null> {
    try {
        const docRef = doc(db, 'users', uid);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            const data = docSnap.data() as UserData;

            // فك تشفير رقم الجوال
            if (data.phone) {
                data.phone = decrypt(data.phone);
            }

            return data;
        }

        return null;
    } catch (error) {
        console.error('❌ خطأ في قراءة بيانات المستخدم:', error);
        return null;
    }
}

/**
 * تحديث بيانات المستخدم
 */
export async function updateUserData(
    uid: string,
    updates: Partial<UserData>
): Promise<boolean> {
    try {
        const docRef = doc(db, 'users', uid);

        // تشفير رقم الجوال إذا تم تحديثه
        if (updates.phone) {
            updates.phone = encrypt(updates.phone);
        }

        await updateDoc(docRef, {
            ...updates,
            updatedAt: serverTimestamp()
        });

        console.log('✅ تم تحديث بيانات المستخدم');
        return true;
    } catch (error) {
        console.error('❌ خطأ في تحديث بيانات المستخدم:', error);
        return false;
    }
}

/**
 * تحديث حالة التحقق من البريد
 */
export async function updateEmailVerificationStatus(uid: string): Promise<boolean> {
    return updateUserData(uid, { emailVerified: true, status: 'verified' });
}

// =================== خدمات الشركات ===================

/**
 * إنشاء بيانات الشركة
 */
export async function createCompanyData(data: CompanyData): Promise<string | null> {
    try {
        const companyRef = doc(collection(db, 'companies'));

        await setDoc(companyRef, {
            userId: data.userId,
            companyName: data.companyName,
            commercialRegister: encrypt(data.commercialRegister), // تشفير السجل التجاري
            businessType: data.businessType || null,
            crVerified: false,
            crVerifiedBy: null,
            crVerifiedAt: null,
            createdAt: serverTimestamp()
        });

        console.log('✅ تم حفظ بيانات الشركة');
        return companyRef.id;
    } catch (error) {
        console.error('❌ خطأ في حفظ بيانات الشركة:', error);
        return null;
    }
}

/**
 * قراءة بيانات الشركة بواسطة معرف المستخدم
 */
export async function getCompanyByUserId(userId: string): Promise<CompanyData | null> {
    try {
        const q = query(collection(db, 'companies'), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            const data = querySnapshot.docs[0].data() as CompanyData;
            data.commercialRegister = decrypt(data.commercialRegister);
            return data;
        }

        return null;
    } catch (error) {
        console.error('❌ خطأ في قراءة بيانات الشركة:', error);
        return null;
    }
}

// =================== خدمات الاشتراكات ===================

/**
 * إنشاء اشتراك جديد
 */
export async function createSubscription(data: Omit<SubscriptionData, 'startsAt'>): Promise<string | null> {
    try {
        const subRef = doc(collection(db, 'subscriptions'));

        await setDoc(subRef, {
            ...data,
            startsAt: serverTimestamp(),
            createdAt: serverTimestamp()
        });

        console.log('✅ تم إنشاء الاشتراك');
        return subRef.id;
    } catch (error) {
        console.error('❌ خطأ في إنشاء الاشتراك:', error);
        return null;
    }
}

/**
 * قراءة اشتراك المستخدم النشط
 */
export async function getActiveSubscription(userId: string): Promise<SubscriptionData | null> {
    try {
        const q = query(
            collection(db, 'subscriptions'),
            where('userId', '==', userId),
            where('status', '==', 'active')
        );
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            return querySnapshot.docs[0].data() as SubscriptionData;
        }

        return null;
    } catch (error) {
        console.error('❌ خطأ في قراءة الاشتراك:', error);
        return null;
    }
}

// =================== خدمات المدفوعات ===================

/**
 * إنشاء سجل دفع (سيُستخدم لاحقاً مع بوابة الدفع)
 */
export async function createPaymentRecord(data: Omit<PaymentData, 'createdAt'>): Promise<string | null> {
    try {
        const paymentRef = doc(collection(db, 'payments'));

        await setDoc(paymentRef, {
            ...data,
            createdAt: serverTimestamp()
        });

        console.log('✅ تم إنشاء سجل الدفع');
        return paymentRef.id;
    } catch (error) {
        console.error('❌ خطأ في إنشاء سجل الدفع:', error);
        return null;
    }
}

/**
 * تحديث حالة الدفع
 */
export async function updatePaymentStatus(
    paymentId: string,
    status: PaymentData['status'],
    gatewayTransactionId?: string
): Promise<boolean> {
    try {
        const docRef = doc(db, 'payments', paymentId);

        await updateDoc(docRef, {
            status,
            gatewayTransactionId: gatewayTransactionId || null,
            updatedAt: serverTimestamp()
        });

        console.log('✅ تم تحديث حالة الدفع');
        return true;
    } catch (error) {
        console.error('❌ خطأ في تحديث حالة الدفع:', error);
        return false;
    }
}
