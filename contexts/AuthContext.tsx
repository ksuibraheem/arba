/**
 * AuthContext — Firebase + Local Auth State Management
 * سياق المصادقة — إدارة حالة المستخدم مركزياً
 * 
 * Extracted from App.tsx to provide auth state globally
 * without prop-drilling through the component tree.
 */

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { useRole } from './RoleContext';
import { onAuthChange, getUserData, UserData } from '../firebase/authService';
import { getCurrentUser, StoredUser } from '../services/authService';
import { initializeFirestoreData } from '../services/firestoreInitializer';

// Toggle Firebase mode
const USE_FIREBASE = true;
const SUPER_ADMIN_EMAIL = import.meta.env.VITE_SUPER_ADMIN_EMAIL || '';

// ====================== Types ======================

export interface AuthUser {
    uid?: string;
    name: string;
    email: string;
    company?: string;
    companyLogo?: string;
    plan: string;
    usedProjects: number;
    usedStorageMB: number;
    userType?: 'individual' | 'company' | 'supplier' | 'employee';
}

interface AuthContextType {
    user: AuthUser | null;
    setUser: React.Dispatch<React.SetStateAction<AuthUser | null>>;
    isLoading: boolean;
    language: 'ar' | 'en';
    setLanguage: React.Dispatch<React.SetStateAction<'ar' | 'en'>>;
    adminAccessGranted: boolean;
    setAdminAccessGranted: React.Dispatch<React.SetStateAction<boolean>>;
    isDemoMode: boolean;
    setIsDemoMode: React.Dispatch<React.SetStateAction<boolean>>;
    showSplash: boolean;
    setShowSplash: React.Dispatch<React.SetStateAction<boolean>>;
    currentEmployee: any;
    setCurrentEmployee: React.Dispatch<React.SetStateAction<any>>;
    isManager: boolean;
    setIsManager: React.Dispatch<React.SetStateAction<boolean>>;
    loginError: string;
    setLoginError: React.Dispatch<React.SetStateAction<string>>;
    loginSuccess: string;
    setLoginSuccess: React.Dispatch<React.SetStateAction<string>>;
    handleLogout: () => void;
}

// ====================== Context ======================

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

// ====================== Provider ======================

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { setRoleData, clearRole } = useRole();

    // Initialize user from localStorage cache for instant display
    const [user, setUser] = useState<AuthUser | null>(() => {
        try {
            const cachedUser = localStorage.getItem('arba_cached_user');
            if (cachedUser) return JSON.parse(cachedUser);
        } catch { /* ignore */ }
        return null;
    });

    const [isLoading, setIsLoading] = useState(true);
    const [language, setLanguage] = useState<'ar' | 'en'>('ar');
    const [adminAccessGranted, setAdminAccessGranted] = useState(false);
    const [isDemoMode, setIsDemoMode] = useState(false);
    const [showSplash, setShowSplash] = useState(false);
    const [currentEmployee, setCurrentEmployee] = useState<any>(null);
    const [isManager, setIsManager] = useState(false);
    const [loginError, setLoginError] = useState<string>('');
    const [loginSuccess, setLoginSuccess] = useState<string>(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('emailVerified') === 'true') {
            return '✅ تم تأكيد بريدك الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول.';
        }
        if (params.get('passwordReset') === 'true') {
            return '✅ تم تغيير كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة.';
        }
        return '';
    });

    // Refs for avoiding stale closures
    const isManagerRef = useRef(isManager);
    const currentEmployeeRef = useRef(currentEmployee);
    useEffect(() => { isManagerRef.current = isManager; }, [isManager]);
    useEffect(() => { currentEmployeeRef.current = currentEmployee; }, [currentEmployee]);

    // Firebase auth state listener
    useEffect(() => {
        if (USE_FIREBASE) {
            const unsubscribe = onAuthChange(async (firebaseUser) => {
                if (firebaseUser) {
                    const userData = await getUserData(firebaseUser.uid);
                    if (userData) {
                        const verifiedUser: AuthUser = {
                            uid: firebaseUser.uid,
                            name: userData.name,
                            email: userData.email,
                            company: userData.company,
                            companyLogo: userData.companyLogo,
                            plan: userData.plan,
                            usedProjects: userData.usedProjects,
                            usedStorageMB: userData.usedStorageMB,
                            userType: userData.userType
                        };

                        // Super Admin auto-grant
                        if (userData.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
                            verifiedUser.plan = 'enterprise';
                            setAdminAccessGranted(true);
                        }

                        setUser(verifiedUser);
                        localStorage.setItem('arba_cached_user', JSON.stringify(verifiedUser));
                        setRoleData(firebaseUser.uid, userData.name || '', userData.email || '').catch(console.error);
                    }
                } else {
                    // Guard: don't clear session for locally-authenticated managers/employees
                    if (isManagerRef.current || currentEmployeeRef.current) {
                        setIsLoading(false);
                        return;
                    }
                    setUser(null);
                    localStorage.removeItem('arba_cached_user');
                    clearRole();
                }
                setIsLoading(false);
            });
            return () => unsubscribe();
        } else {
            const currentUser = getCurrentUser();
            if (currentUser) {
                setUser({
                    name: currentUser.name,
                    email: currentUser.email,
                    company: currentUser.company,
                    companyLogo: currentUser.companyLogo,
                    plan: currentUser.plan,
                    usedProjects: currentUser.usedProjects,
                    usedStorageMB: currentUser.usedStorageMB
                });
                setRoleData(currentUser.id || 'local', currentUser.name || '', currentUser.email || '').catch(console.error);
            } else {
                clearRole();
            }
            setIsLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Initialize Firestore data layer
    useEffect(() => {
        initializeFirestoreData().catch(console.error);
    }, []);

    const handleLogout = useCallback(() => {
        setUser(null);
        setAdminAccessGranted(false);
        setCurrentEmployee(null);
        setIsManager(false);
        setIsDemoMode(false);
        localStorage.removeItem('arba_cached_user');
        clearRole();
    }, [clearRole]);

    const value: AuthContextType = {
        user,
        setUser,
        isLoading,
        language,
        setLanguage,
        adminAccessGranted,
        setAdminAccessGranted,
        isDemoMode,
        setIsDemoMode,
        showSplash,
        setShowSplash,
        currentEmployee,
        setCurrentEmployee,
        isManager,
        setIsManager,
        loginError,
        setLoginError,
        loginSuccess,
        setLoginSuccess,
        handleLogout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export default AuthContext;
