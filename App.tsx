import React, { useState, useMemo, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";
import Sidebar from './components/Sidebar';
import StatsGrid from './components/StatsGrid';
import CostBreakdownChart from './components/charts/CostBreakdownChart';
import CategoryBarChart from './components/charts/CategoryBarChart';
import PriceBenchmark from './components/charts/PriceBenchmark';
import ItemTable from './components/ItemTable';
import BlueprintEditor from './components/BlueprintEditor';
import InteriorEditor from './components/InteriorEditor';
import AreaBreakdownDisplay from './components/AreaBreakdown';
import ItemProfitabilityChart from './components/charts/ItemProfitabilityChart';
import PriceQuote from './components/PriceQuote';
import UniversalImporter from './components/UniversalImporter';
import SaaSDashboard from './components/dashboard/SaaSDashboard';
import EmployeeWorkspace from './components/zones/EmployeeWorkspace';
import ClientPortal from './components/zones/ClientPortal';
import ZoneGuard from './components/zones/ZoneGuard';
import SecurityRedirect from './components/zones/SecurityRedirect';
import PrivatePortal from './components/zones/PrivatePortal';
import { RoleProvider, useRole } from './contexts/RoleContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import { ArbaProject, ROLE_ZONE } from './services/projectTypes';
import { Language } from './types';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage, { RegisterData } from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import CompanyPage from './pages/CompanyPage';
import PaymentPage from './pages/PaymentPage';
import PricingPage from './pages/PricingPage';
import VerificationPage from './pages/VerificationPage';
import UnderReviewPage from './pages/UnderReviewPage';
import PaymentUploadPage from './pages/PaymentUploadPage';
import { registrationService } from './services/registrationService';
import { supplierService } from './services/supplierService';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManagerDashboard from './pages/employees/ManagerDashboard';
import EmployeeDashboard from './pages/employees/EmployeeDashboard';
import { employeeService, Employee, MANAGER_CREDENTIALS, getManagerCredentials, loadEmployeesFromFirestore, loadManagerCredentialsFromFirestore } from './services/employeeService';
import HRPage from './pages/employees/roles/HRPage';
import AccountantPage from './pages/employees/roles/AccountantPage';
import PasswordResetPage from './pages/PasswordResetPage';
import SupportCenterPage from './pages/SupportCenterPage';
import CloudSyncPage from './pages/CloudSyncPage';
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import QuantitySurveyorPage from './pages/employees/roles/QuantitySurveyorPage';
import SupportPage from './pages/employees/roles/SupportPage';
import SupplierCatalog from './pages/SupplierCatalog';
import SuppliersManagementPage from './pages/admin/SuppliersManagementPage';
import TeamLoginPage from './pages/TeamLoginPage';
import TeamDashboard from './pages/TeamDashboard';
import { ProjectMember } from './services/projectSupplierService';
import { AppState, CalculatedItem, ProjectType, CustomParams, BlueprintConfig, SurfaceLocation, RoomFinishes, BaseItem } from './types';
import { INITIAL_OVERHEAD, PROJECT_DEFAULTS, PROJECT_TITLES, TRANSLATIONS, DELIVERY_SCOPE_SECTIONS, SECTION_DEFINITIONS, DELIVERY_SCOPE_OPTIONS } from './constants';
import { calculateProjectCosts } from './utils/calculations';
import { generateInsightReport, InsightReport } from './services/goldenOutputService';
import { estimateSchedule, ScheduleEstimate } from './services/scheduleEstimator';
import { FULL_ITEMS_DATABASE } from './constants';
import BrainInsightsBar from './components/BrainInsightsBar';
import { silentBrainTracker } from './services/silentBrainTracker';
import { temporalAuditService } from './services/temporalAuditService';
import { budgetGuardian } from './services/budgetGuardian';
import { collectiveBrainService } from './services/collectiveBrainService';
import { initializeBrain } from './services/brainDataLoader';
import { internalMetadataService } from './services/internalMetadataService';
import { proactiveSweepEngine } from './services/proactiveSweepEngine';
import DeveloperBrainDashboard from './pages/admin/DeveloperBrainDashboard';
import { Download, Calendar, User, Briefcase, Hash, LogOut, Calculator, Lock, Crown, AlertTriangle, HardDrive, FolderOpen, Upload, Image, Zap } from 'lucide-react';
import { COMPANY_INFO, SUBSCRIPTION_PLANS, encryptSupplierName, getStorageInfo, getRemainingProjects, FREE_PLAN_RESTRICTIONS, PAGE_TRANSLATIONS, getLocalizedText } from './companyData';
// Local auth service (fallback)
import { registerUser, loginUser, logoutUser, getCurrentUser, StoredUser } from './services/authService';
// Firebase auth service
import { registerWithFirebase, loginWithFirebase, logoutFromFirebase, onAuthChange, getUserData, UserData } from './firebase/authService';
import { isInTestMode, getCurrentTestSession, endTestMode } from './services/testModeService';
import { initializeFirestoreData } from './services/firestoreInitializer';
import SplashScreen from './components/SplashScreen';

// Toggle Firebase mode - set to true to use Firebase
const USE_FIREBASE = true;

type PageRoute = 'landing' | 'login' | 'register' | 'about' | 'company' | 'payment' | 'pricing' | 'verification' | 'under-review' | 'payment-upload' | 'admin' | 'dashboard' | 'pricing-calc' | 'client-portal' | 'private' | 'security-403' | 'admin-login' | 'manager' | 'employee' | 'hr' | 'accountant' | 'password-reset' | 'cloud-sync' | 'support-center' | 'support' | 'developer' | 'developer-brain' | 'marketing' | 'quality' | 'deputy' | 'supplier' | 'quantity_surveyor' | 'supplier-catalog' | 'admin-suppliers' | 'demo' | 'team-login' | 'team-dashboard' | 'employee-login' | 'boq-engine';

// مفتاح الوصول السري للوحة المدير — يُقرأ من .env
const ADMIN_SECRET_KEY = import.meta.env.VITE_ADMIN_SECRET_KEY || '';

// Super Admin — full access bypass (from .env)
const SUPER_ADMIN_EMAIL = import.meta.env.VITE_SUPER_ADMIN_EMAIL || '';

interface AuthUser {
    uid?: string; // معرف المستخدم الفريد
    name: string;
    email: string;
    company?: string;
    companyLogo?: string; // Base64 logo
    plan: string;
    usedProjects: number;
    usedStorageMB: number;
    userType?: 'individual' | 'company' | 'supplier' | 'employee';
}

const App: React.FC = () => {
    // Role Context Hook Setup
    const { setRoleData, clearRole } = useRole();

    // Auth & Routing State — detect verification/reset returns from URL synchronously
    const [currentPage, setCurrentPage] = useState<PageRoute>(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('emailVerified') === 'true' || params.get('passwordReset') === 'true') {
            return 'login';
        }
        return 'landing';
    });

    // Role Caching: Initialize user from localStorage if available
    const [user, setUser] = useState<AuthUser | null>(() => {
        try {
            const cachedUser = localStorage.getItem('arba_cached_user');
            if (cachedUser) {
                return JSON.parse(cachedUser);
            }
        } catch (e) {
            console.error('Failed to parse cached user', e);
        }
        return null;
    });

    const [language, setLanguage] = useState<Language>('ar');
    const t = (key: string) => PAGE_TRANSLATIONS[key]?.[language] || PAGE_TRANSLATIONS[key]?.['en'] || key;
    const tl = (obj: Record<string, string> | undefined) => getLocalizedText(obj, language);
    const isRtl = language === 'ar';
    const isCjk = language === 'zh';

    // Update <html> direction and language attributes dynamically
    useEffect(() => {
        const html = document.documentElement;
        html.setAttribute('dir', isRtl ? 'rtl' : 'ltr');
        html.setAttribute('lang', language);
        // Adjust body font for CJK
        document.body.style.fontFamily = isCjk
            ? "'Noto Sans SC', 'Inter', 'PingFang SC', sans-serif"
            : isRtl
            ? "'Tajawal', 'Inter', sans-serif"
            : "'Inter', 'Tajawal', sans-serif";
    }, [language, isRtl, isCjk]);

    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeFeature, setUpgradeFeature] = useState('');
    const [showPriceQuote, setShowPriceQuote] = useState(false);
    const [showUniversalImporter, setShowUniversalImporter] = useState(false);
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
    const [adminAccessGranted, setAdminAccessGranted] = useState(false);
    const [adminKeyInput, setAdminKeyInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    // Splash screen state - shows only on first login for full data restoration
    const [showSplash, setShowSplash] = useState(false);
    // Employee state
    const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
    const [isManager, setIsManager] = useState(false);
    // Registration flow state
    const [registrationRequestId, setRegistrationRequestId] = useState<string | null>(null);
    const [pendingRegistrationEmail, setPendingRegistrationEmail] = useState<string>('');
    const [pendingRegistrationPhone, setPendingRegistrationPhone] = useState<string>('');
    // Demo mode state
    const [isDemoMode, setIsDemoMode] = useState(false);
    // Active project from SaaS Dashboard
    const [activeProject, setActiveProject] = useState<ArbaProject | null>(null);
    const [redirectUrl, setRedirectUrl] = useState<string | null>(null);
    // Team member state (Project Team Access)
    const [teamMember, setTeamMember] = useState<ProjectMember | null>(null);

    // Sidebar collapse state
    const [isSidebarOpen, setIsSidebarOpen] = useState(() => typeof window !== 'undefined' ? window.innerWidth >= 1024 : true);
    // Demo/Test banner visibility states
    const [showDemoBanner, setShowDemoBanner] = useState(true);
    const [showTestBanner, setShowTestBanner] = useState(true);

    // Ref to track currentPage without triggering useEffect re-runs
    const currentPageRef = useRef(currentPage);
    useEffect(() => { 
        currentPageRef.current = currentPage; 
        silentBrainTracker.visitPage(currentPage);
    }, [currentPage]);

    // Initialize silent brain tracker
    useEffect(() => {
        const plan = user?.plan || 'free';
        silentBrainTracker.startSession(plan);
        return () => {
            silentBrainTracker.endSession();
        };
    }, []);

    // Ref to track manager/employee state for onAuthChange guard
    const isManagerRef = useRef(isManager);
    const currentEmployeeRef = useRef(currentEmployee);
    useEffect(() => { isManagerRef.current = isManager; }, [isManager]);
    useEffect(() => { currentEmployeeRef.current = currentEmployee; }, [currentEmployee]);

    // Initial check for 'redirectTo' parameter handling Identity Guard Firebase links
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const redirectTo = params.get('redirectTo');
        if (redirectTo) {
            setRedirectUrl(redirectTo);
        }

        // ── Handle Firebase email action links (verification, password reset) ──
        const mode = params.get('mode');
        const oobCode = params.get('oobCode');
        if (mode && oobCode) {
            (async () => {
                try {
                    if (mode === 'verifyEmail') {
                        const { handleVerificationReturn } = await import('./firebase/authService');
                        const result = await handleVerificationReturn(oobCode);
                        if (result.success) {
                            setLoginSuccess('✅ تم تأكيد بريدك الإلكتروني بنجاح! يمكنك الآن تسجيل الدخول.');
                            // Clean URL and redirect to login
                            window.history.replaceState({}, document.title, window.location.pathname);
                            setCurrentPage('login');
                        }
                    }
                    // mode === 'resetPassword' is handled by Firebase's built-in page
                } catch (error) {
                    console.error('Error processing email action:', error);
                }
            })();
        }

        // ── Handle return from Firebase verification/reset pages ──
        const emailVerified = params.get('emailVerified');
        const passwordReset = params.get('passwordReset');
        if (emailVerified === 'true' || passwordReset === 'true') {
            // State already set synchronously in useState initializers above
            // Just clean the URL
            window.history.replaceState({}, document.title, window.location.pathname);
        }

        // ── Handle Tap Payments callback (after redirect from payment page) ──
        const tapId = params.get('tap_id');
        const arbaPid = params.get('arba_pid');
        if (tapId && arbaPid) {
            (async () => {
                try {
                    const { verifyTapPayment, activateSubscription, PLAN_PRICES, PAYMENT_MESSAGES } = await import('./src/services/paymentService');
                    const { getUserData } = await import('./firebase/authService');
                    const result = await verifyTapPayment(tapId, arbaPid, PLAN_PRICES.professional);

                    // Clean URL
                    window.history.replaceState({}, document.title, window.location.pathname);

                    if (result.success) {
                        // Get user ID from current auth state
                        const { getAuth } = await import('firebase/auth');
                        const auth = getAuth();
                        const currentUser = auth.currentUser;

                        if (currentUser) {
                            // Auto-activate subscription for electronic payment
                            await activateSubscription(currentUser.uid, 'professional', arbaPid);

                            // Update user plan in state
                            setUser(prev => prev ? { ...prev, plan: 'professional' } : prev);
                            alert(PAYMENT_MESSAGES.electronic_success[language]);
                            setCurrentPage('pricing-calc');
                        }
                    } else {
                        const msg = result.status === 'amount_mismatch'
                            ? PAYMENT_MESSAGES.amount_mismatch[language]
                            : PAYMENT_MESSAGES.payment_failed[language];
                        alert(msg);
                        setCurrentPage('payment');
                    }
                } catch (error) {
                    console.error('Error processing Tap callback:', error);
                    setCurrentPage('payment');
                }
            })();
        }
    }, []);

    // Check for existing session on mount
    useEffect(() => {
        if (USE_FIREBASE) {
            // Show cached user instantly while Firestore loads
            const cached = localStorage.getItem('arba_cached_user');
            if (cached) {
                try { setUser(JSON.parse(cached)); } catch { /* ignore */ }
            }

            // Firebase auth state listener — runs ONCE on mount
            const unsubscribe = onAuthChange(async (firebaseUser) => {
                if (firebaseUser) {
                    const userData = await getUserData(firebaseUser.uid);
                    if (userData) {
                        const verifiedUser = {
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
                        setUser(verifiedUser);
                        localStorage.setItem('arba_cached_user', JSON.stringify(verifiedUser));

                        // Super Admin auto-grant
                        if (userData.email?.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
                            verifiedUser.plan = 'enterprise';
                            setUser(verifiedUser);
                            setAdminAccessGranted(true);
                        }
                        setRoleData(firebaseUser.uid, userData.name || '', userData.email || '').catch(console.error);

                        // ── REDIRECT LOGIC for Deep Links / Route Protection ──
                        if (redirectUrl) {
                            if (redirectUrl.startsWith('/private')) {
                                setCurrentPage('private');
                            } else if (redirectUrl.startsWith('/portal')) {
                                setCurrentPage('client-portal');
                            } else {
                                setCurrentPage('dashboard');
                            }
                            setRedirectUrl(null);
                        } else {
                            // Default Login Routing based on userType (use ref to avoid re-subscription)
                            const page = currentPageRef.current;
                            if (page === 'login') {
                                // ── شاشة السبلاش: تظهر أول مرة فقط لكل مستخدم ──
                                const splashKey = `arba_splash_shown_${firebaseUser.uid}`;
                                const splashAlreadyShown = localStorage.getItem(splashKey);
                                if (!splashAlreadyShown) {
                                    setShowSplash(true);
                                    localStorage.setItem(splashKey, 'true');
                                }

                                if (userData.userType === 'supplier') {
                                    setCurrentPage('supplier');
                                } else if (userData.userType === 'individual') {
                                    setCurrentPage('pricing-calc');
                                } else if (userData.userType === 'company') {
                                    setCurrentPage('pricing-calc');
                                } else {
                                    setCurrentPage('dashboard');
                                }
                            }
                        }
                    }
                } else {
                    // ── GUARD: لا تمسح الجلسة إذا المستخدم مدير أو موظف (تسجيل دخولهم محلي) ──
                    if (isManagerRef.current || currentEmployeeRef.current) {
                        // Manager/employee logged in locally — don't clear session
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
            // Local auth
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
    }, []); // ← Empty deps: subscribe ONCE on mount, use refs for latest values

    // Load Dynamic Supplier Data & Initialize Firestore
    useEffect(() => {
        const loadSupplierData = () => {
            const suppliers = supplierService.getSuppliers();
            const products = supplierService.getProducts();
            setState(prev => ({
                ...prev,
                registeredSuppliers: suppliers,
                supplierProducts: products
            }));
        };

        loadSupplierData();

        // 🔥 Initialize Firestore data layer (one-time migration + load)
        initializeFirestoreData().then(result => {
            if (result.migratedCount > 0) {
            }
            // Reload supplier data after Firestore sync
            loadSupplierData();
        }).catch(console.error);

        // Refresh when page changes or returns to dashboard
        if (currentPage === 'dashboard') {
            loadSupplierData();
        }
    }, [currentPage]);

    // Pricing Dashboard State
    const [state, setState] = useState<AppState>({
        language: 'ar',
        viewMode: 'pricing',
        projectType: 'villa',
        location: 'riyadh',
        soilType: 'sandy',

        executionMethod: 'in_house',
        globalPriceAdjustment: 0,

        metadata: {
            clientName: '',
            clientPhone: '',
            clientEmail: '',
            clientIdNumber: '',
            projectName: 'مشروع جديد',
            projectAddress: '',
            deedNumber: '',
            plotNumber: '',
            planNumber: '',
            buildingPermitNumber: '',
            tenderNumber: '',
            quotationNumber: '',
            quotationDate: new Date().toISOString().split('T')[0],
            quotationValidityDays: 30,
            scopeOfWork: 'turnkey',
            companyName: '',
            companyLicense: '',
            companyClassification: '3',
            companyPhone: '',
            companyEmail: '',
            vatNumber: '',
            preparedBy: '',
            confirmationCode: '',
            vatPercentage: 15,
            paymentTerms: 'دفعات حسب الإنجاز',
            pricingDate: new Date().toISOString().split('T')[0],
            executionStartDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            projectDurationMonths: 12,
            warrantyYearsStructure: 10,
            warrantyYearsFinish: 2,
            warrantyYearsMEP: 5,
        },

        pricingStrategy: 'fixed_margin',
        profitMargin: 15,
        targetROI: 20,
        totalInvestment: 1000000,
        fixedOverhead: INITIAL_OVERHEAD,

        landArea: 300,
        buildArea: 450,
        floors: 2,

        // SBC Technical Defaults
        sbcOccupancyGroup: 'R-3',
        constructionType: 'VB',
        foundationType: 'isolated_footings',
        structuralSystem: 'frame',
        seismicZone: '1',
        windSpeed: 130,
        buildingRatio: 60,
        fireRating: 1,
        concreteGrade: 'C30',
        steelGrade: 'Grade 60',
        exposureCategory: 'normal',
        hasBasement: false,
        parkingType: 'surface',
        hasElevator: false,
        elevatorCount: 0,
        insulationType: 'eps',

        rooms: PROJECT_DEFAULTS['villa'].rooms,
        facades: PROJECT_DEFAULTS['villa'].facades,
        team: PROJECT_DEFAULTS['villa'].team,
        blueprint: PROJECT_DEFAULTS['villa'].blueprint,
        interiorFinishes: [],
        customItems: [],

        itemOverrides: {},

        registeredSuppliers: [],
        supplierProducts: [],

        deliveryScope: 'turnkey',
        enabledSections: ['00','01','02','03','04','05','06','07','08','09','10','11','12','13','14','15','16','17'],
    });

    const tt = (key: string) => TRANSLATIONS[key]?.[state.language] || PAGE_TRANSLATIONS[key]?.[language] || key;

    // Get current plan details
    const currentPlan = SUBSCRIPTION_PLANS.find(p => p.id === user?.plan) || SUBSCRIPTION_PLANS[0];
    const isFreePlan = user?.plan === 'free';
    const remainingProjects = user ? getRemainingProjects(user.plan, user.usedProjects) : 0;
    const storageInfo = user ? getStorageInfo(user.plan, user.usedStorageMB) : { total: 0, used: 0, remaining: 0, percentage: 0 };

    // Check if feature is restricted
    const checkFeatureAccess = (feature: string): boolean => {
        if (!isFreePlan) return true;
        return false;
    };

    const showUpgradePrompt = (feature: string) => {
        setUpgradeFeature(feature);
        setShowUpgradeModal(true);
    };

    // Navigation Handler
    const handleNavigate = (page: string) => {
        if (page === 'dashboard' && !user && !isDemoMode) {
            setCurrentPage('login');
            return;
        }
        // Handle demo mode — only access the pricing calculator
        if (page === 'demo') {
            setIsDemoMode(true);
            setUser({
                name: language === 'ar' ? 'زائر تجريبي' : 'Demo Visitor',
                email: 'demo@arba-sys.com',
                company: language === 'ar' ? 'شركة تجريبية' : 'Demo Company',
                plan: 'free',
                usedProjects: 0,
                usedStorageMB: 0
            });
            setCurrentPage('pricing-calc');
            return;
        }
        setCurrentPage(page as PageRoute);
    };

    // Exit demo mode
    const handleExitDemoMode = () => {
        setIsDemoMode(false);
        setUser(null);
        setCurrentPage('landing');
    };

    // Auth Handlers
    const handleLogin = async (email: string, password: string, userType?: string) => {
        setLoginError('');

        // موظفين - تحقق خاص
        if (userType === 'employee') {
            // استخدام loginAsync — يحمّل البيانات من Firestore أولاً ثم يتحقق
            const result = await employeeService.loginAsync(email, password);

            if (result.success && result.employee) {
                // جلب بيانات المدير المحدّثة بعد التحميل من Firestore
                const mgr = getManagerCredentials();
                // التحقق إذا كان المدير
                if ('role' in result.employee && result.employee.role === 'manager') {
                    // المدير
                    setIsManager(true);
                    setCurrentEmployee(null);
                    setUser({
                        name: mgr.name,
                        email: 'manager@arba-sys.com',
                        plan: 'enterprise',
                        usedProjects: 0,
                        usedStorageMB: 0
                    });
                    setRoleData('manager', mgr.name, 'manager@arba-sys.com').catch(console.error);
                    setCurrentPage('manager');
                } else if ('employeeNumber' in result.employee && result.employee.employeeNumber === mgr.employeeNumber) {
                    // المدير (من بيانات الدخول الثابتة)
                    setIsManager(true);
                    setCurrentEmployee(null);
                    setUser({
                        name: mgr.name,
                        email: 'manager@arba-sys.com',
                        plan: 'enterprise',
                        usedProjects: 0,
                        usedStorageMB: 0
                    });
                    setRoleData('manager', mgr.name, 'manager@arba-sys.com').catch(console.error);
                    setCurrentPage('manager');
                } else {
                    // موظف عادي
                    const emp = result.employee as Employee;
                    setIsManager(false);
                    setCurrentEmployee(emp);
                    setUser({
                        name: emp.name,
                        email: emp.email,
                        plan: 'enterprise',
                        usedProjects: 0,
                        usedStorageMB: 0
                    });
                    setRoleData(emp.id || emp.employeeNumber, emp.name, emp.email).catch(console.error);
                    setCurrentPage('employee');
                }
                return;
            } else {
                setLoginError(result.error || 'رقم الموظف أو كلمة المرور غير صحيحة');
                return;
            }
        }

        // Check for approved registration requests (for company/supplier users)
        if (userType === 'company' || userType === 'supplier') {
            // للموردين: البحث برقم الجوال، للشركات: البحث بالإيميل
            const registrationRequest = userType === 'supplier'
                ? registrationService.getRequestByPhone(email) // email هنا هو رقم الجوال للموردين
                : registrationService.getRequestByEmail(email);
            if (registrationRequest && registrationRequest.password === password) {
                // First check if commercial register is verified
                if (!registrationRequest.crVerified) {
                    // CR not verified - redirect to under review page
                    setRegistrationRequestId(registrationRequest.id);
                    setPendingRegistrationEmail(registrationRequest.email);
                    setPendingRegistrationPhone(registrationRequest.phone);
                    setCurrentPage('under-review');
                    return;
                }

                // CR is verified - check status for next step
                if (registrationRequest.status === 'approved') {
                    // Check if account is suspended
                    if (registrationRequest.isSuspended) {
                        setLoginError(language === 'ar'
                            ? `حسابك محظور: ${registrationRequest.suspensionReason || 'للاستفسار تواصل مع الدعم'}`
                            : `Your account is suspended: ${registrationRequest.suspensionReason || 'Contact support for more info'}`);
                        return;
                    }
                    // Login successful with approved registration
                    setUser({
                        name: registrationRequest.name,
                        email: registrationRequest.email,
                        company: registrationRequest.companyName,
                        plan: registrationRequest.plan,
                        usedProjects: 0,
                        usedStorageMB: 0
                    });
                    // الموردين: لوحة تحكم خاصة، الشركات: dashboard
                    setCurrentPage(userType === 'supplier' ? 'supplier' : 'dashboard');
                    return;
                } else if (registrationRequest.status === 'pending_payment') {
                    // الموردين مجاناً - لا يحتاجون دفع، تحويلهم لصفحة المراجعة
                    if (userType === 'supplier') {
                        setRegistrationRequestId(registrationRequest.id);
                        setPendingRegistrationEmail(registrationRequest.email);
                        setPendingRegistrationPhone(registrationRequest.phone);
                        setCurrentPage('under-review');
                        return;
                    }
                    // CR verified but payment pending - redirect to payment page (companies only)
                    setRegistrationRequestId(registrationRequest.id);
                    setPendingRegistrationEmail(registrationRequest.email);
                    setPendingRegistrationPhone(registrationRequest.phone);
                    setCurrentPage('payment-upload');
                    return;
                } else if (
                    registrationRequest.status === 'pending_approval' ||
                    registrationRequest.status === 'payment_under_review'
                ) {
                    // CR verified but still under review
                    setRegistrationRequestId(registrationRequest.id);
                    setPendingRegistrationEmail(registrationRequest.email);
                    setPendingRegistrationPhone(registrationRequest.phone);
                    setCurrentPage('under-review');
                    return;
                } else if (registrationRequest.status === 'rejected') {
                    setLoginError('تم رفض طلب التسجيل. يرجى التواصل مع الدعم الفني.');
                    return;
                }
            }
        }

        if (USE_FIREBASE) {
            // Firebase login
            const result = await loginWithFirebase(email, password);
            if (!result.success) {
                // If Firebase fails, check approved registrations as fallback
                const approvedRequest = registrationService.getRequestByEmail(email);
                if (approvedRequest && approvedRequest.status === 'approved' && approvedRequest.password === password) {
                    setUser({
                        name: approvedRequest.name,
                        email: approvedRequest.email,
                        company: approvedRequest.companyName,
                        plan: approvedRequest.plan,
                        usedProjects: 0,
                        usedStorageMB: 0
                    });
                    setCurrentPage('dashboard');
                    return;
                }
                setLoginError(result.error || 'حدث خطأ أثناء تسجيل الدخول');
                return;
            }
            // User state will be updated by onAuthChange listener
            // Super Admin: auto-grant full access
            if (email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase()) {
                setAdminAccessGranted(true);
            }
            setCurrentPage('dashboard');
        } else {
            // Local login
            const result = loginUser(
                email,
                password,
                userType as 'individual' | 'company' | 'supplier' | 'employee'
            );

            if (!result.success) {
                setLoginError(result.error || 'حدث خطأ أثناء تسجيل الدخول');
                return;
            }

            if (result.user) {
                setUser({
                    name: result.user.name,
                    email: result.user.email,
                    company: result.user.company,
                    companyLogo: result.user.companyLogo,
                    plan: result.user.plan,
                    usedProjects: result.user.usedProjects,
                    usedStorageMB: result.user.usedStorageMB
                });
                setRoleData(result.user.id || 'local', result.user.name || '', result.user.email || '').catch(console.error);
                setCurrentPage('dashboard');
            }
        }
    };

    const handleRegister = async (data: RegisterData) => {
        // ── All user types: create Firebase account first ──
        if (USE_FIREBASE) {
            try {
                const result = await registerWithFirebase({
                    userType: data.userType,
                    name: data.name,
                    email: data.email,
                    phone: data.phone,
                    company: data.company,
                    commercialRegister: data.commercialRegister,
                    businessType: data.businessType,
                    password: data.password,
                    plan: data.userType === 'supplier' ? 'free' : ((data.plan === 'free' || data.plan === 'professional') ? data.plan : 'free')
                });

                if (!result.success) {
                    // Handle email-already-in-use: check if unverified, resend verification
                    if (result.errorCode === 'auth/email-already-in-use') {
                        try {
                            const loginResult = await loginWithFirebase(data.email, data.password);
                            if (loginResult.success) {
                                const { checkEmailVerified, resendVerificationEmail } = await import('./firebase/authService');
                                const isVerified = await checkEmailVerified();
                                if (!isVerified) {
                                    await resendVerificationEmail();
                                    setPendingRegistrationEmail(data.email);
                                    setCurrentPage('verification');
                                    return;
                                } else {
                                    // Already verified
                                    if (data.userType === 'company' || data.userType === 'supplier') {
                                        // Continue to CR review flow
                                        const crResult = registrationService.createCompanyRegistrationRequest({
                                            userType: data.userType,
                                            name: data.name,
                                            email: data.email,
                                            phone: data.phone || '',
                                            password: data.password,
                                            companyName: data.company || '',
                                            commercialRegister: data.commercialRegister || '',
                                            businessType: data.businessType,
                                            plan: data.userType === 'supplier' ? 'free' : ((data.plan === 'free' || data.plan === 'professional') ? data.plan : 'professional')
                                        });
                                        if (crResult.request) {
                                            setRegistrationRequestId(crResult.request.id);
                                            setPendingRegistrationEmail(crResult.request.email);
                                            setCurrentPage('under-review');
                                        }
                                    } else {
                                        setCurrentPage('dashboard');
                                    }
                                    return;
                                }
                            }
                        } catch (innerError) {
                            console.error('Error handling existing user:', innerError);
                        }
                        setLoginError(
                            language === 'ar'
                                ? 'البريد الإلكتروني مستخدم مسبقاً. إذا سبق التسجيل، حاول تسجيل الدخول.'
                                : 'Email already in use. If you already registered, try logging in.'
                        );
                        return;
                    }

                    console.error('Registration failed:', result.error);
                    setLoginError(result.error || 'حدث خطأ أثناء التسجيل');
                    return;
                }

                // Firebase account created successfully
                // For companies/suppliers: also create local registration request for CR tracking
                if (data.userType === 'company' || data.userType === 'supplier') {
                    registrationService.createCompanyRegistrationRequest({
                        userType: data.userType,
                        name: data.name,
                        email: data.email,
                        phone: data.phone || '',
                        password: data.password,
                        companyName: data.company || '',
                        commercialRegister: data.commercialRegister || '',
                        businessType: data.businessType,
                        plan: data.userType === 'supplier' ? 'free' : ((data.plan === 'free' || data.plan === 'professional') ? data.plan : 'professional')
                    });
                }

                // Redirect to verification screen
                setPendingRegistrationEmail(data.email);
                setCurrentPage('verification');
                if (result.emailVerificationSent) {
                } else {
                }
            } catch (error: any) {
                console.error('Registration error (caught):', error);
                setLoginError(
                    language === 'ar'
                        ? 'حدث خطأ غير متوقع أثناء التسجيل. يرجى المحاولة مرة أخرى.'
                        : 'An unexpected error occurred during registration. Please try again.'
                );
            }
            return;
        }

        // ── Fallback: Local registration (when USE_FIREBASE is false) ──
        if (data.userType === 'individual') {
            const result = registrationService.createRegistrationRequest({
                name: data.name,
                email: data.email,
                phone: data.phone || '',
                password: data.password,
                plan: (data.plan === 'free' || data.plan === 'professional') ? data.plan : 'free'
            });
            if (!result.success) {
                setLoginError(result.error || 'حدث خطأ أثناء التسجيل');
                return;
            }
            if (result.request) {
                setRegistrationRequestId(result.request.id);
                setPendingRegistrationEmail(result.request.email);
                setPendingRegistrationPhone(result.request.phone);
                setCurrentPage('verification');
            }
            return;
        }

        if (data.userType === 'company' || data.userType === 'supplier') {
            const result = registrationService.createCompanyRegistrationRequest({
                userType: data.userType,
                name: data.name,
                email: data.email,
                phone: data.phone || '',
                password: data.password,
                companyName: data.company || '',
                commercialRegister: data.commercialRegister || '',
                businessType: data.businessType,
                plan: data.userType === 'supplier' ? 'free' : ((data.plan === 'free' || data.plan === 'professional') ? data.plan : 'professional')
            });
            if (!result.success) {
                setLoginError(result.error || 'حدث خطأ أثناء التسجيل');
                return;
            }
            if (result.request) {
                setRegistrationRequestId(result.request.id);
                setPendingRegistrationEmail(result.request.email);
                setPendingRegistrationPhone(result.request.phone);
                setCurrentPage('verification');
            }
            return;
        }

        // Local employee registration fallback (non-Firebase mode)
        const result = registerUser({
            userType: data.userType,
            name: data.name,
            email: data.email,
            phone: data.phone,
            company: data.company,
            commercialRegister: data.commercialRegister,
            businessType: data.businessType,
            password: data.password,
            plan: data.plan
        });

        if (!result.success) {
            console.error('Registration failed:', result.error);
            return;
        }

        if (result.user) {
            setUser({
                name: result.user.name,
                email: result.user.email,
                company: result.user.company,
                plan: result.user.plan,
                usedProjects: result.user.usedProjects,
                usedStorageMB: result.user.usedStorageMB
            });
            setRoleData(result.user.id || 'local', result.user.name || '', result.user.email || '').catch(console.error);
            setCurrentPage('dashboard');
        }
    };

    const handleLogout = async () => {
        if (USE_FIREBASE) {
            await logoutFromFirebase();
        } else {
            logoutUser();
        }
        setUser(null);
        setLoginError('');
        setAdminAccessGranted(false);
        setIsManager(false);
        setCurrentEmployee(null);
        // مسح جلسة الاختبار من الجهاز
        sessionStorage.removeItem('arba_test_mode_token');
        sessionStorage.removeItem('arba_test_mode_manager');
        setCurrentPage('landing');
    };

    // Handle logo upload
    const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (isFreePlan) {
            showUpgradePrompt(language === 'ar' ? 'شعار الشركة' : 'Company Logo');
            return;
        }
        const file = e.target.files?.[0];
        if (file && user) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const updatedUser = { ...user, companyLogo: reader.result as string };
                setUser(updatedUser);
                localStorage.setItem('arba_user', JSON.stringify(updatedUser));
            };
            reader.readAsDataURL(file);
        }
    };

    // Dashboard State Handlers
    const handleStateChange = (updates: Partial<AppState>) => {
        setState((prev) => {
            const merged = { ...prev, ...updates };
            // Auto-recalculate buildArea when landArea or floors change
            if (updates.landArea !== undefined || updates.floors !== undefined) {
                const landArea = updates.landArea ?? prev.landArea;
                const floors = updates.floors ?? prev.floors;
                merged.buildArea = Math.round(landArea * 0.60 * floors);
            }
            return merged;
        });
    };

    const handleBlueprintChange = (blueprint: BlueprintConfig) => {
        setState((prev) => ({ ...prev, blueprint }));
    };

    const handleUpdateTotalArea = (landArea: number, buildArea: number) => {
        setState((prev) => ({ ...prev, landArea, buildArea }));
    };

    const handleUpdateFinish = (roomId: string, surface: SurfaceLocation, materialId: string) => {
        setState(prev => {
            const existingRoomFinishIndex = prev.interiorFinishes.findIndex(f => f.roomId === roomId);
            let newFinishes = [...prev.interiorFinishes];

            if (existingRoomFinishIndex > -1) {
                newFinishes[existingRoomFinishIndex] = {
                    ...newFinishes[existingRoomFinishIndex],
                    surfaces: {
                        ...newFinishes[existingRoomFinishIndex].surfaces,
                        [surface]: materialId
                    }
                };
            } else {
                const newFinish: RoomFinishes = {
                    roomId,
                    surfaces: {
                        floor: null, ceiling: null, wall_north: null, wall_south: null, wall_east: null, wall_west: null
                    }
                };
                newFinish.surfaces[surface] = materialId;
                newFinishes.push(newFinish);
            }
            return { ...prev, interiorFinishes: newFinishes };
        });
    };

    const handleItemParamChange = (itemId: string, params: CustomParams) => {
        // 🧠 SOVEREIGN v8.0: Track price changes in temporal audit
        if (params.customPrice !== undefined) {
            const currentItem = calculationResult.items.find(i => i.id === itemId);
            if (currentItem) {
                temporalAuditService.recordPriceChange({
                    itemId,
                    itemName: currentItem.descriptionAr || currentItem.descriptionEn || itemId,
                    newPrice: params.customPrice,
                    previousPrice: currentItem.finalUnitPrice,
                    source: 'user',
                    userId: user?.uid,
                    projectType: state.projectType,
                });
            }
        }
        setState((prev) => ({
            ...prev,
            itemOverrides: {
                ...prev.itemOverrides,
                [itemId]: { ...(prev.itemOverrides[itemId] || {}), ...params }
            }
        }));
    };

    const handleAddCustomItem = (item: BaseItem) => {
        setState(prev => ({
            ...prev,
            customItems: [...prev.customItems, item]
        }));
    };

    const handleDeleteCustomItem = (itemId: string) => {
        setState(prev => ({
            ...prev,
            customItems: prev.customItems.filter(i => i.id !== itemId)
        }));
    };

    const checkPriceWithAI = async (item: CalculatedItem, manualPrice: number): Promise<string> => {
        // Check if AI is available for this plan
        if (isFreePlan) {
            return language === 'ar'
                ? '⚠️ التسعير الذكي غير متاح في الباقة المجانية. قم بالترقية للوصول لهذه الميزة.'
                : '⚠️ AI pricing is not available in the free plan. Upgrade to access this feature.';
        }

        try {
            // 🧠 SOVEREIGN v8.0: Budget Guardian — check if AI call is allowed
            const budgetCheck = budgetGuardian.shouldUseGemini({
                functionName: 'checkPriceWithAI',
                estimatedTokens: 500,
                requiresVision: false,
                requiresNLP: true,
                complexity: 0.5,
                userId: user?.uid || 'anonymous',
            });
            if (!budgetCheck.approved) {
                return language === 'ar'
                    ? `⚠️ ${budgetCheck.reason}. ${budgetCheck.fallback || ''}`
                    : `⚠️ ${budgetCheck.reason}. ${budgetCheck.fallback || ''}`;
            }

            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const prompt = `
          أنت مهندس مساح كميات خبير في السوق السعودي.
          قم بتقييم السعر التالي لبند في مشروع مقاولات:
          البند: ${item.name}
          الوحدة: ${item.unit}
          السعر المحسوب في النظام: ${item.finalUnitPrice.toFixed(2)} ريال
          السعر المدخل يدوياً من المستخدم: ${manualPrice} ريال
          
          هل السعر المدخل منطقي؟ أجب باختصار شديد (جملتين) بالعربية مع توضيح إذا كان مرتفعاً أو منخفضاً.
        `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: prompt,
            });

            // 🧠 SOVEREIGN v8.0: Record AI usage in budget guardian
            budgetGuardian.recordUsage({
                functionName: 'checkPriceWithAI',
                estimatedTokens: 500,
                requiresVision: false,
                requiresNLP: true,
                complexity: 0.5,
                userId: user?.uid || 'anonymous',
            }, 500);

            return response.text || "لم يتم استلام رد";
        } catch (error) {
            console.error("AI Error", error);
            return "حدث خطأ أثناء الاتصال بـ AI";
        }
    };

    const calculationResult = useMemo(() => {
        const start = performance.now();
        const res = calculateProjectCosts(state);
        silentBrainTracker.trackCalcTime(performance.now() - start);
        return res;
    }, [state]);
    // =================== 🧠 Brain Layer: Initialize Training Data (v2.0) ===================
    React.useEffect(() => {
        try {
            const brainData = initializeBrain();
            if (brainData) {
                console.log(`🧠 Brain v2.0: ${brainData.totalSources} sources | ${brainData.totalItems} items | ${Object.keys(brainData.categoryBenchmarks).length} benchmarks loaded`);
            }
        } catch { /* silent — brain initialization is non-blocking */ }
    }, []); // Run once on mount

    // =================== 📈 Brain Layer: Commodity Intelligence (V8.3) ===================
    React.useEffect(() => {
        try {
            const { commodityEngine } = require('./services/commodityIntelligenceEngine');
            const status = commodityEngine.initialize();
            const alerts = commodityEngine.getAlerts();
            const critical = alerts.filter((a: any) => a.severity === 'critical');
            console.log(`📈 Commodity Engine: ${status.commodities} commodities | ${status.historyDays} days | ${alerts.length} alerts (${critical.length} critical)`);
        } catch { /* silent — commodity engine is non-blocking */ }
    }, []); // Run once on mount

    // =================== 🧠 Brain Layer: Collective Learning (Silent) ===================
    React.useEffect(() => {
        if (calculationResult.items.length > 0 && state.buildArea > 0) {
            try {
                const totalConcrete = calculationResult.totalConcreteVolume || 0;
                const totalSteel = calculationResult.items
                    .filter(i => i.id?.startsWith('02'))
                    .reduce((s, i) => s + (i.quantity || 0) * (i.baseLabor || 0) / 3000, 0);
                const totalBlocks = calculationResult.items
                    .filter(i => i.id?.startsWith('03'))
                    .reduce((s, i) => s + (i.quantity || 0), 0);
                const costPerSqm = calculationResult.finalPrice / state.buildArea;

                collectiveBrainService.pushAnonymizedInsight(
                    state.projectType, state.location, state.buildArea,
                    state.floors || 2, costPerSqm,
                    totalConcrete, totalSteel, totalBlocks,
                    { concrete: 5, steel: 5, blocks: 7, tiles: 10, paint: 5 },
                    {
                        substructurePercent: 15, superstructurePercent: 30,
                        masonryPercent: 12, finishesPercent: 25,
                        mepPercent: 13, otherPercent: 5
                    }
                );
            } catch { /* silent — brain learning is non-blocking */ }
        }
    }, [state.projectType, state.buildArea, state.location]);

    // =================== 🧠 Brain Layer: Internal Metadata Stamping (Silent) ===================
    // ⚠️ RULE 1: These _internal_status fields NEVER appear in client UI
    React.useEffect(() => {
        if (calculationResult.items.length > 0) {
            try {
                // Stamp every calculated item with internal metadata
                internalMetadataService.bulkStamp(
                    calculationResult.items.map(item => ({
                        itemId: item.id,
                        materialName: item.descriptionAr || item.descriptionEn || item.name || '',
                        category: item.id?.substring(0, 2), // Section prefix as category
                        currentPrice: item.finalUnitPrice,
                        previousPrice: item.usedPrice !== item.finalUnitPrice ? item.usedPrice : undefined,
                    }))
                );

                // Eager check on volatile items (metals etc.)
                const volatileItems = calculationResult.items.filter(item => {
                    const name = (item.descriptionAr || item.name || '').toLowerCase();
                    return name.includes('حديد') || name.includes('نحاس') || name.includes('ألومنيوم') 
                        || name.includes('steel') || name.includes('rebar') || name.includes('copper');
                });
                if (volatileItems.length > 0) {
                    proactiveSweepEngine.batchEagerCheck(
                        volatileItems.map(i => ({
                            id: i.id,
                            name: i.descriptionAr || i.name || '',
                            price: i.finalUnitPrice,
                            category: i.id?.substring(0, 2),
                        }))
                    );
                }
            } catch { /* silent — internal metadata is non-blocking */ }
        }
    }, [calculationResult.items]);

    // =================== 🧠 Brain Layer: Insight Report ===================
    const brainInsights = useMemo<InsightReport | null>(() => {
        try {
            if (!calculationResult.items || calculationResult.items.length === 0) return null;
            return generateInsightReport(
                state,
                calculationResult.items,
                FULL_ITEMS_DATABASE
            );
        } catch (e) {
            console.warn('🧠 Brain insight generation failed:', e);
            return null;
        }
    }, [calculationResult, state]);

    // =================== 🧠 Brain Layer: Schedule Estimator ===================
    const scheduleEstimate = useMemo<ScheduleEstimate | null>(() => {
        try {
            if (!state.blueprint || state.blueprint.floors.length === 0) return null;
            return estimateSchedule(state.blueprint, state.soilType);
        } catch (e) {
            console.warn('🧠 Schedule estimation failed:', e);
            return null;
        }
    }, [state.blueprint, state.soilType]);

    const handleExport = () => {
        // PDF export available for all users
        setShowPriceQuote(true);
    };



    // Splash Screen - يظهر عند أول تسجيل دخول أثناء استرجاع البيانات
    if (showSplash) {
        return <SplashScreen language={language} onComplete={() => setShowSplash(false)} />;
    }

    // Render Pages Based on Route
    if (currentPage === 'landing') {
        return <LandingPage language={language} onNavigate={handleNavigate} onLanguageChange={setLanguage} />;
    }

    if (currentPage === 'team-login') {
        return <TeamLoginPage language={language} onNavigate={handleNavigate} onTeamLogin={(member) => {
            setTeamMember(member);
            setCurrentPage('team-dashboard');
        }} />;
    }

    if (currentPage === 'team-dashboard' && teamMember) {
        return <TeamDashboard language={language} member={teamMember} onLogout={() => {
            setTeamMember(null);
            sessionStorage.removeItem('arba_team_session');
            setCurrentPage('login');
        }} onNavigate={handleNavigate} />;
    }

    if (currentPage === 'login') {
        return <LoginPage language={language} onNavigate={(page) => { setLoginSuccess(''); handleNavigate(page); }} onLogin={handleLogin} onTeamLogin={(member) => { setTeamMember(member); setCurrentPage('team-dashboard'); }} loginError={loginError} loginSuccess={loginSuccess} />;
    }

    if (currentPage === 'employee-login') {
        return <LoginPage language={language} onNavigate={(page) => { setLoginSuccess(''); handleNavigate(page); }} onLogin={handleLogin} loginError={loginError} loginSuccess={loginSuccess} initialUserType="employee" />;
    }

    if (currentPage === 'register') {
        return <RegisterPage language={language} onNavigate={handleNavigate} onRegister={handleRegister} />;
    }

    if (currentPage === 'password-reset') {
        return <PasswordResetPage language={language} onNavigate={handleNavigate} />;
    }

    if (currentPage === 'about') {
        return <AboutPage language={language} onNavigate={handleNavigate} />;
    }

    if (currentPage === 'company') {
        return <CompanyPage language={language} onNavigate={handleNavigate} />;
    }

    if (currentPage === 'developer-brain') {
        return <DeveloperBrainDashboard language={language} onNavigate={handleNavigate} />;
    }

    if (currentPage === 'pricing') {
        return <PricingPage language={language} onNavigate={handleNavigate} currentPlan={user?.plan} onSelectPlan={() => handleNavigate('payment')} />;
    }

    if (currentPage === 'payment') {
        return <PaymentPage language={language} onNavigate={handleNavigate} currentPlan={user?.plan} />;
    }

    if (currentPage === 'verification') {
        return (
            <VerificationPage
                language={language}
                onNavigate={handleNavigate}
                email={pendingRegistrationEmail || user?.email}
                phone={pendingRegistrationPhone}
                registrationRequestId={registrationRequestId || undefined}
                onVerificationComplete={(nextStep) => {
                    if (nextStep === 'under_review' || nextStep === 'payment') {
                        setCurrentPage(nextStep === 'payment' ? 'payment-upload' : 'under-review');
                    } else {
                        setCurrentPage('dashboard');
                    }
                }}
            />
        );
    }

    if (currentPage === 'under-review') {
        return (
            <UnderReviewPage
                language={language}
                onNavigate={handleNavigate}
                registrationRequestId={registrationRequestId || undefined}
            />
        );
    }

    if (currentPage === 'payment-upload') {
        return (
            <PaymentUploadPage
                language={language}
                onNavigate={handleNavigate}
                registrationRequestId={registrationRequestId || undefined}
                onPaymentSubmitted={() => setCurrentPage('under-review')}
            />
        );
    }

    if (currentPage === 'cloud-sync') {
        return <CloudSyncPage language={language} onNavigate={handleNavigate} />;
    }

    // صفحة كتالوج الموردين (للمستخدمين المسجلين فقط)
    if (currentPage === 'supplier-catalog') {
        if (!user) {
            setCurrentPage('login');
            return null;
        }
        return <SupplierCatalog language={language} onNavigate={handleNavigate} />;
    }

    if (currentPage === 'support-center') {
        return (
            <SupportCenterPage
                language={language}
                onNavigate={handleNavigate}
                userId={user?.email || 'guest'}
                userName={user?.name}
                userEmail={user?.email}
                userType={user ? 'individual' : 'guest'}
            />
        );
    }

    // Admin Login Page (Secret Access)
    if (currentPage === 'admin-login') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6" dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-slate-700/50 p-8 shadow-2xl max-w-md w-full">
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                            <Lock className="w-8 h-8 text-white" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            {language === 'ar' ? 'الوصول المحمي' : 'Protected Access'}
                        </h1>
                        <p className="text-slate-400">
                            {language === 'ar' ? 'أدخل مفتاح الوصول للمتابعة' : 'Enter access key to continue'}
                        </p>
                    </div>
                    <div className="space-y-4">
                        <input
                            type="password"
                            value={adminKeyInput}
                            onChange={(e) => setAdminKeyInput(e.target.value)}
                            placeholder={language === 'ar' ? 'مفتاح الوصول السري' : 'Secret Access Key'}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-xl py-3 px-4 text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 focus:ring-1 focus:ring-purple-500"
                        />
                        {loginError && (
                            <p className="text-red-400 text-sm text-center">{loginError}</p>
                        )}
                        <button
                            onClick={() => {
                                if (adminKeyInput === ADMIN_SECRET_KEY) {
                                    setAdminAccessGranted(true);
                                    setLoginError('');
                                    setCurrentPage('login');
                                } else {
                                    setLoginError(language === 'ar' ? 'مفتاح الوصول غير صحيح' : 'Invalid access key');
                                }
                            }}
                            className="w-full py-3 bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl font-bold hover:from-purple-400 hover:to-indigo-500 transition-all"
                        >
                            {language === 'ar' ? 'تأكيد' : 'Confirm'}
                        </button>
                        <button
                            onClick={() => setCurrentPage('landing')}
                            className="w-full py-2 text-slate-400 hover:text-white transition-colors"
                        >
                            {language === 'ar' ? 'العودة' : 'Back'}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (currentPage === 'admin') {
        // تحقق من صلاحية الوصول للوحة المدير
        if (!adminAccessGranted || !user || user.plan !== 'enterprise') {
            return (
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-6" dir={isRtl ? 'rtl' : 'ltr'}>
                    <div className="text-center">
                        <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <AlertTriangle className="w-10 h-10 text-red-500" />
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">
                            {language === 'ar' ? 'غير مصرح' : 'Unauthorized'}
                        </h1>
                        <p className="text-slate-400 mb-6">
                            {language === 'ar' ? 'ليس لديك صلاحية الوصول لهذه الصفحة' : 'You do not have permission to access this page'}
                        </p>
                        <button
                            onClick={() => setCurrentPage('landing')}
                            className="px-6 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                        >
                            {language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
                        </button>
                    </div>
                </div>
            );
        }
        return <AdminDashboard language={language} onNavigate={handleNavigate} />;
    }

    // Admin Suppliers Management Page
    if (currentPage === 'admin-suppliers') {
        if (!adminAccessGranted || !user || user.plan !== 'enterprise') {
            setCurrentPage('admin');
            return null;
        }
        return <SuppliersManagementPage language={language} onNavigate={handleNavigate} />;
    }

    // Manager Dashboard
    if (currentPage === 'manager') {
        if (!isManager) {
            setCurrentPage('login');
            return null;
        }
        return (
            <ManagerDashboard
                language={language}
                onLogout={() => {
                    setUser(null);
                    setIsManager(false);
                    setCurrentEmployee(null);
                    setCurrentPage('landing');
                }}
                onNavigate={handleNavigate}
                onStartTestMode={(plan, userType) => {
                    // تحقق أماني: تأكد إن المدير مسجل دخول على نفس الجهاز
                    const deviceToken = Date.now().toString(36) + Math.random().toString(36).substr(2);
                    sessionStorage.setItem('arba_test_mode_token', deviceToken);
                    sessionStorage.setItem('arba_test_mode_manager', 'true');

                    // إنشاء مستخدم اختبار وهمي للوصول للصفحة
                    const testUser: AuthUser = {
                        name: userType === 'individual' ? 'مستخدم اختباري - أفراد' : userType === 'company' ? 'شركة اختبارية' : 'مورد اختباري',
                        email: 'test@arba-sys.com',
                        company: userType === 'company' ? 'شركة اختبارية' : undefined,
                        plan: plan === 'professional' ? 'professional' : plan === 'pro' ? 'professional' : plan,
                        usedProjects: 0,
                        usedStorageMB: 0,
                        userType: userType as 'individual' | 'company' | 'supplier'
                    };
                    setUser(testUser);
                    // التنقل للصفحة المناسبة
                    if (userType === 'supplier') {
                        setCurrentPage('supplier');
                    } else {
                        setCurrentPage('dashboard');
                    }
                }}
            />
        );
    }

    // Employee Dashboard
    if (currentPage === 'employee') {
        if (!currentEmployee) {
            setCurrentPage('login');
            return null;
        }
        return (
            <EmployeeDashboard
                language={language}
                employee={currentEmployee}
                onLogout={() => {
                    setUser(null);
                    setIsManager(false);
                    setCurrentEmployee(null);
                    setCurrentPage('landing');
                }}
                onNavigate={handleNavigate}
            />
        );
    }


    // Supplier Dashboard (لوحة تحكم الموردين)
    if (currentPage === 'supplier') {
        if (!user) {
            setCurrentPage('login');
            return null;
        }
        return (
            <SupplierDashboard
                language={language}
                onNavigate={handleNavigate}
                onLogout={() => {
                    setUser(null);
                    setCurrentPage('landing');
                }}
                isTestMode={user.plan === 'network'}
                supplierId={user.uid || user.email}
            />
        );
    }

    // HR Page (accessed from Manager Dashboard)
    if (currentPage === 'hr') {
        // Create a mock HR employee for viewing the page from manager dashboard
        const hrEmployee: Employee = currentEmployee || {
            id: 'manager-view',
            employeeNumber: 'MGR-001',
            password: '',
            name: isManager ? MANAGER_CREDENTIALS.name : 'مدير الموارد البشرية',
            email: 'hr@arba-sys.com',
            phone: '0500000000',
            role: 'hr',
            isActive: true,
            createdAt: new Date().toISOString()
        };

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                {/* Header */}
                <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between" dir={isRtl ? 'rtl' : 'ltr'}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">{language === 'ar' ? 'إدارة الموارد البشرية' : 'Human Resources Management'}</h1>
                                <p className="text-slate-400 text-sm">{language === 'ar' ? 'نظام إدارة شؤون الموظفين' : 'Employee Management System'}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setCurrentPage('manager')}
                            className="p-2 hover:bg-slate-700 rounded-lg text-slate-400 transition-colors"
                        >
                            <span className="sr-only">{language === 'ar' ? 'عودة' : 'Back'}</span>
                            <svg className="w-6 h-6 transform rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                            </svg>
                        </button>
                    </div>
                </header>
                <main className="p-6">
                    <HRPage
                        language={language}
                        employee={hrEmployee}
                    />
                </main>
            </div>
        );
    }

    // Quantity Surveyor Page (accessed from Manager Dashboard)
    if (currentPage === 'quantity_surveyor') {
        const qsEmployee: Employee = currentEmployee || {
            id: 'manager-view-qs',
            employeeNumber: 'MGR-QS-001',
            password: '',
            name: isManager ? MANAGER_CREDENTIALS.name : 'مهندس الكميات',
            email: 'qs@arba-sys.com',
            phone: '0500000000',
            role: 'quantity_surveyor',
            isActive: true,
            createdAt: new Date().toISOString()
        };

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <QuantitySurveyorPage
                    language={language}
                    employee={qsEmployee}
                    onLogout={() => {
                        if (isManager) {
                            setCurrentPage('manager');
                        } else {
                            setUser(null);
                            setCurrentEmployee(null);
                            setCurrentPage('landing');
                        }
                    }}
                />
            </div>
        );
    }

    // Accountant Page (accessed from Manager Dashboard)
    if (currentPage === 'accountant') {
        const accountantEmployee: Employee = currentEmployee || {
            id: 'manager-view',
            employeeNumber: 'MGR-001',
            password: '',
            name: isManager ? MANAGER_CREDENTIALS.name : 'المحاسب',
            email: 'accountant@arba-sys.com',
            phone: '0500000000',
            role: 'accountant',
            isActive: true,
            createdAt: new Date().toISOString()
        };

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between" dir={isRtl ? 'rtl' : 'ltr'}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
                                <Calculator className="w-7 h-7 text-white" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">{language === 'ar' ? 'نظام المحاسبة' : 'Accounting System'}</h1>
                                <p className="text-slate-400 text-sm">{language === 'ar' ? 'الفواتير والمدفوعات والقيود' : 'Invoices, Payments & Ledger'}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setCurrentPage(isManager ? 'manager' : 'employee')}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 text-slate-300 hover:bg-slate-700 rounded-lg transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>{language === 'ar' ? 'رجوع' : 'Back'}</span>
                        </button>
                    </div>
                </header>
                <div className="p-6">
                    <AccountantPage language={language} employee={accountantEmployee} />
                </div>
            </div>
        );
    }

    // Support Page (accessed from Manager Dashboard)
    if (currentPage === 'support') {
        const supportEmployee: Employee = currentEmployee || {
            id: 'manager-view',
            employeeNumber: 'MGR-001',
            password: '',
            name: isManager ? MANAGER_CREDENTIALS.name : 'موظف الدعم الفني',
            email: 'support@arba-sys.com',
            phone: '0500000000',
            role: 'support',
            isActive: true,
            createdAt: new Date().toISOString()
        };

        // SupportPage is now imported statically at the top of the file

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between" dir={isRtl ? 'rtl' : 'ltr'}>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                                <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                                </svg>
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white">{language === 'ar' ? 'الدعم الفني' : 'Technical Support'}</h1>
                                <p className="text-slate-400 text-sm">{language === 'ar' ? 'إدارة تذاكر الدعم' : 'Support Ticket Management'}</p>
                            </div>
                        </div>
                        <button
                            onClick={() => setCurrentPage(isManager ? 'manager' : 'employee')}
                            className="flex items-center gap-2 px-4 py-2 bg-slate-700/50 text-slate-300 hover:bg-slate-700 rounded-lg transition-all"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span>{language === 'ar' ? 'رجوع' : 'Back'}</span>
                        </button>
                    </div>
                </header>
                <div className="p-6">
                    <SupportPage language={language} employee={supportEmployee} />
                </div>
            </div>
        );
    }

    // Quantity Surveyor Page (مهندس الكميات والتسعيرات)
    if (currentPage === 'quantity_surveyor') {
        const qsEmployee: Employee = currentEmployee || {
            id: 'manager-view',
            employeeNumber: 'MGR-001',
            password: '',
            name: isManager ? MANAGER_CREDENTIALS.name : 'مهندس الكميات',
            email: 'qs@arba-sys.com',
            phone: '0500000000',
            role: 'quantity_surveyor',
            isActive: true,
            createdAt: new Date().toISOString()
        };

        return (
            <QuantitySurveyorPage
                language={language}
                employee={qsEmployee}
                onLogout={() => {
                    setUser(null);
                    setIsManager(false);
                    setCurrentEmployee(null);
                    setCurrentPage('landing');
                }}
            />
        );
    }

    // Developer/Marketing/Quality/Deputy — redirect to EmployeeDashboard (role pages are already wired there)
    if (['developer', 'marketing', 'quality', 'deputy'].includes(currentPage) && currentEmployee) {
        return (
            <EmployeeDashboard
                language={language}
                employee={currentEmployee}
                onLogout={() => {
                    setCurrentEmployee(null);
                    setCurrentPage('landing');
                }}
                onNavigate={(page) => setCurrentPage(page as PageRoute)}
            />
        );
    }

    // ═══════ BOQ ENGINE — ARBA V8.2 ═══════
    if (currentPage === 'boq-engine') {
        const BOQUploader = React.lazy(() => import('./components/BOQUploader'));
        return (
            <React.Suspense fallback={<div className="min-h-screen bg-slate-900 flex items-center justify-center"><div className="animate-pulse text-emerald-400 text-xl">⚡ ARBA Engine...</div></div>}>
                <BOQUploader language={language} />
            </React.Suspense>
        );
    }

    // ═══════ DUAL-ZONE ROUTING ═══════

    // Zone A: Employee Workspace (Admin & QS Engineers)
    if (currentPage === 'dashboard') {
        if (!user && !isDemoMode) {
            setCurrentPage('login');
            return null;
        }
        // تحقق أماني: إذا المستخدم اختباري، تأكد إنه على نفس الجهاز الي بدأ الاختبار
        if (user?.email === 'test@arba-sys.com' && !sessionStorage.getItem('arba_test_mode_manager')) {
            // External access — no valid test session on this device
            setUser(null);
            setCurrentPage('login');
            return null;
        }
        // Regular Firebase users (individual/company) — skip ZoneGuard, give direct access
        const userType = (user as any)?.userType;
        if (userType === 'individual' || userType === 'company') {
            return (
                <EmployeeWorkspace
                    language={language}
                    onOpenPricing={(project, setupData) => {
                        setActiveProject(project || null);
                        // Apply setup modal data to the pricing metadata
                        if (setupData && !setupData.skipped) {
                            const firstClient = setupData.clients[0];
                            setState(prev => ({
                                ...prev,
                                location: setupData.location || prev.location,
                                metadata: {
                                    ...prev.metadata,
                                    projectName: setupData.projectName || prev.metadata.projectName,
                                    clientName: firstClient?.name || prev.metadata.clientName,
                                    tenderNumber: firstClient?.tenderNumber || firstClient?.crNumber || prev.metadata.tenderNumber,
                                    companyName: firstClient?.type === 'company' ? firstClient.name : prev.metadata.companyName,
                                }
                            }));
                        }
                        setCurrentPage('pricing-calc');
                    }}
                    onLogout={handleLogout}
                    userId={user?.uid || user?.email || 'demo'}
                    userName={user?.name || 'Demo'}
                    isDemoMode={isDemoMode}
                />
            );
        }

        // Employees/Admins — require Zone A access
        return (
            <ZoneGuard requiredZone="A" language={language} isDemoMode={isDemoMode}>
                <EmployeeWorkspace
                    language={language}
                    onOpenPricing={(project, setupData) => {
                        setActiveProject(project || null);
                        if (setupData && !setupData.skipped) {
                            const firstClient = setupData.clients[0];
                            setState(prev => ({
                                ...prev,
                                metadata: {
                                    ...prev.metadata,
                                    projectName: setupData.projectName || prev.metadata.projectName,
                                    clientName: firstClient?.name || prev.metadata.clientName,
                                    tenderNumber: firstClient?.tenderNumber || firstClient?.crNumber || prev.metadata.tenderNumber,
                                    companyName: firstClient?.type === 'company' ? firstClient.name : prev.metadata.companyName,
                                }
                            }));
                        }
                        setCurrentPage('pricing-calc');
                    }}
                    onLogout={handleLogout}
                    userId={user?.uid || user?.email || 'demo'}
                    userName={user?.name || 'Demo'}
                    isDemoMode={isDemoMode}
                />
            </ZoneGuard>
        );
    }

    // Zone B: Client Portal (Clients & Viewers)
    if (currentPage === 'client-portal') {
        if (!user) {
            setCurrentPage('login');
            return null;
        }
        return (
            <ZoneGuard requiredZone="B" language={language}>
                <ClientPortal
                    language={language}
                    onLogout={handleLogout}
                />
            </ZoneGuard>
        );
    }

    // Private Tier: Individuals / Direct consumers
    if (currentPage === 'private') {
        return (
            <PrivatePortal
                language={language}
                onNavigate={handleNavigate}
                onLogout={handleLogout}
                userId={user?.uid || user?.email || 'guest'}
                userName={user?.name || 'Guest'}
                isDemoMode={isDemoMode}
            />
        )
    }

    // 403 Security Redirect
    if (currentPage === 'security-403') {
        return (
            <SecurityRedirect
                language={language}
                attemptedZone="A"
                onGoBack={() => setCurrentPage('landing')}
            />
        );
    }

    // Pricing Calculator (Protected)
    return (
        <div className={`flex min-h-screen lg:h-screen bg-slate-100 font-sans lg:overflow-hidden ${isRtl ? '' : 'flex-row-reverse'}`} dir={isRtl ? 'rtl' : 'ltr'}>

            {/* Test Mode Banner - شريط وضع الاختبار */}
            {(isInTestMode() && showTestBanner) && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-500 to-orange-500 text-white py-2 px-3 md:px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-lg gap-2 sm:gap-0">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center shrink-0">
                            <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5" />
                        </div>
                        <div className="min-w-0">
                            <span className="font-bold text-sm sm:text-base">
                                {language === 'ar' ? '🧪 وضع الاختبار نشط' : '🧪 Test Mode Active'}
                            </span>
                            <span className="hidden sm:inline mx-2">|</span>
                            <span className="hidden sm:inline text-sm">
                                {language === 'ar'
                                    ? `باقة: ${getCurrentTestSession()?.testingPackage.plan} - ${getCurrentTestSession()?.testingPackage.userType === 'individual' ? 'أفراد' : getCurrentTestSession()?.testingPackage.userType === 'company' ? 'شركات' : 'موردين'}`
                                    : `Package: ${getCurrentTestSession()?.testingPackage.plan} - ${getCurrentTestSession()?.testingPackage.userType}`
                                }
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto shrink-0">
                        <button
                            onClick={() => {
                                endTestMode();
                                setCurrentPage('manager');
                            }}
                            className="px-3 sm:px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors flex items-center gap-2 text-sm"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            <span className="hidden sm:inline">{language === 'ar' ? 'إنهاء الاختبار والعودة' : 'End Test & Return'}</span>
                            <span className="sm:hidden">{language === 'ar' ? 'إنهاء' : 'End'}</span>
                        </button>
                        <button
                            onClick={() => setShowTestBanner(false)}
                            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                            title={language === 'ar' ? 'إخفاء الشريط' : 'Dismiss Banner'}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Demo Mode Banner - شريط وضع العرض التجريبي */}
            {(isDemoMode && showDemoBanner) && (
                <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-blue-500 to-indigo-600 text-white py-2 sm:py-3 px-3 md:px-4 flex flex-col sm:flex-row items-start sm:items-center justify-between shadow-lg gap-2 sm:gap-0">
                    <div className="flex items-center gap-2 sm:gap-3 min-w-0">
                        <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-lg flex items-center justify-center animate-pulse shrink-0">
                            <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                        </div>
                        <div className="min-w-0">
                            <span className="font-bold text-sm sm:text-base">
                                {language === 'ar' ? '👁️ وضع العرض التجريبي' : '👁️ Demo Preview Mode'}
                            </span>
                            <span className="hidden sm:inline mx-2">|</span>
                            <span className="hidden sm:inline text-blue-100 text-sm">
                                {language === 'ar'
                                    ? 'هذه بيانات تجريبية للمعاينة فقط - للتسجيل اضغط "إنشاء حساب"'
                                    : 'This is demo data for preview only - Click "Sign Up" to register'
                                }
                            </span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3 self-end sm:self-auto shrink-0">
                        <button
                            onClick={() => {
                                handleExitDemoMode();
                                handleNavigate('register');
                            }}
                            className="px-3 sm:px-4 py-1.5 bg-white text-blue-600 hover:bg-blue-50 rounded-lg font-bold transition-colors text-sm sm:text-base"
                        >
                            {language === 'ar' ? 'إنشاء حساب' : 'Sign Up'}
                        </button>
                        <button
                            onClick={handleExitDemoMode}
                            className="px-3 sm:px-4 py-1.5 bg-white/20 hover:bg-white/30 rounded-lg font-medium transition-colors flex items-center gap-1 sm:gap-2 text-sm"
                        >
                            <LogOut className="w-4 h-4" />
                            <span className="hidden sm:inline">{language === 'ar' ? 'خروج من العرض' : 'Exit Demo'}</span>
                        </button>
                        <button
                            onClick={() => setShowDemoBanner(false)}
                            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                            title={language === 'ar' ? 'إخفاء الشريط' : 'Dismiss Banner'}
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    </div>
                </div>
            )}

            {/* Upgrade Modal */}
            {showUpgradeModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
                        <div className="text-center">
                            <div className="w-16 h-16 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                <Crown className="w-8 h-8 text-white" />
                            </div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">
                                {language === 'ar' ? 'ميزة مميزة' : 'Premium Feature'}
                            </h3>
                            <p className="text-slate-500 mb-6">
                                {language === 'ar'
                                    ? `"${upgradeFeature}" غير متاحة في الباقة المجانية. قم بالترقية للباقة الاحترافية للوصول لجميع المميزات.`
                                    : `"${upgradeFeature}" is not available in the free plan. Upgrade to Professional to access all features.`
                                }
                            </p>
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowUpgradeModal(false)}
                                    className="flex-1 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors"
                                >
                                    {language === 'ar' ? 'لاحقاً' : 'Later'}
                                </button>
                                <button
                                    onClick={() => {
                                        setShowUpgradeModal(false);
                                        handleNavigate('payment');
                                    }}
                                    className="flex-1 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-medium hover:from-emerald-400 hover:to-teal-400 transition-all"
                                >
                                    {language === 'ar' ? 'ترقية الآن' : 'Upgrade Now'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Settings Sidebar with Collapse Toggle */}
            {/* Mobile/Tablet: overlay mode with backdrop */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 z-30 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}
            <div className={`relative shrink-0 flex items-center z-40 h-full ${isSidebarOpen ? 'max-lg:fixed max-lg:top-0 max-lg:bottom-0 max-lg:z-40' : ''} ${isRtl ? (isSidebarOpen ? 'max-lg:right-0' : '') : (isSidebarOpen ? 'max-lg:left-0' : '')}`}>
                {/* The animated container that hides its overflow */}
                <div className={`transition-all h-full duration-300 ease-in-out shrink-0 overflow-hidden ${isSidebarOpen ? 'w-72 sm:w-80' : 'w-0'}`}>
                    {/* Fixed width inner container prevents squishing during animation */}
                    <div className="w-72 sm:w-80 h-full bg-slate-900 border-l border-slate-800">
                        <Sidebar state={state} onChange={handleStateChange} isDemoMode={isDemoMode} />
                    </div>
                </div>
                
                {/* Collapse Toggle Button - positioned absolutely to stick to the sidebar's edge */}
                <button
                    onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                    className={`absolute ${isRtl ? 'right-full' : 'left-full'} top-1/2 -translate-y-1/2 w-8 h-16 bg-white border border-slate-200 ${isRtl ? 'rounded-l-xl border-r-0' : 'rounded-r-xl border-l-0'} flex items-center justify-center text-slate-400 hover:text-emerald-500 shadow-md z-50 transition-colors`}
                >
                    {isRtl ? (
                        <svg className={`w-5 h-5 transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
                    ) : (
                        <svg className={`w-5 h-5 transition-transform duration-300 ${!isSidebarOpen ? 'rotate-180' : 'rotate-0'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
                    )}
                </button>
            </div>

            <main className="flex-1 flex flex-col overflow-y-auto lg:overflow-hidden bg-slate-50 relative z-10 transition-all duration-300">

                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-2 sm:px-4 md:px-8 py-2 sm:py-3 md:py-4 shadow-sm z-10 shrink-0">
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-2 sm:mb-3 md:mb-4 border-b border-slate-100 pb-2 sm:pb-3 md:pb-4">
                        <div className="flex items-center gap-2 sm:gap-4 min-w-0">
                            {/* Back to Dashboard Button / Exit Demo */}
                            <button
                                onClick={() => {
                                    if (isDemoMode) {
                                        handleExitDemoMode();
                                    } else {
                                        handleNavigate('dashboard');
                                    }
                                }}
                                className="w-10 h-10 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 hover:border-slate-300 flex items-center justify-center text-slate-500 hover:text-slate-700 transition-all shadow-sm shrink-0"
                                title={isDemoMode 
                                    ? (language === 'ar' ? 'خروج من العرض التجريبي' : 'Exit Demo')
                                    : (language === 'ar' ? 'العودة للوحة التحكم' : 'Back to Dashboard')
                                }
                            >
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={isRtl ? "M9 5l7 7-7 7" : "M15 19l-7-7 7-7"} />
                                </svg>
                            </button>
                            {/* Company Logo Section */}
                            <div className="relative group">
                                {user?.companyLogo ? (
                                    <img
                                        src={user.companyLogo}
                                        alt="Company Logo"
                                        className="w-12 h-12 object-contain rounded-lg border border-slate-200"
                                    />
                                ) : (
                                    <div className={`w-12 h-12 rounded-lg border-2 border-dashed flex items-center justify-center ${isFreePlan ? 'border-slate-300 bg-slate-50' : 'border-emerald-300 bg-emerald-50'}`}>
                                        <Image className={`w-5 h-5 ${isFreePlan ? 'text-slate-400' : 'text-emerald-500'}`} />
                                    </div>
                                )}
                                {!isFreePlan && (
                                    <label className="absolute inset-0 cursor-pointer opacity-0 group-hover:opacity-100 bg-black/50 rounded-lg flex items-center justify-center transition-opacity">
                                        <Upload className="w-5 h-5 text-white" />
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleLogoUpload}
                                            className="hidden"
                                        />
                                    </label>
                                )}
                                {isFreePlan && (
                                    <div
                                        onClick={() => showUpgradePrompt(language === 'ar' ? 'شعار الشركة' : 'Company Logo')}
                                        className="absolute -top-1 -right-1 w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center cursor-pointer"
                                    >
                                        <Lock className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-0.5 sm:gap-1 min-w-0">
                                <h2 className="text-sm sm:text-lg md:text-xl font-extrabold text-slate-800 truncate">{state.metadata.projectName || 'مشروع جديد'}</h2>
                                <div className="hidden sm:flex items-center gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {state.metadata.clientName || '---'}</span>
                                    <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> {state.metadata.tenderNumber || '---'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2 md:gap-4">
                            {/* Subscription Badge */}
                            <div className={`hidden sm:block px-3 py-1 rounded-full text-xs font-medium ${isFreePlan
                                ? 'bg-slate-100 text-slate-600'
                                : user?.plan === 'professional'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-purple-100 text-purple-700'
                                }`}>
                                {currentPlan.name[language]}
                            </div>

                            {/* Usage Stats */}
                            <div className="hidden md:flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 text-xs">
                                <div className="flex items-center gap-1" title={language === 'ar' ? 'المشاريع المتبقية' : 'Remaining Projects'}>
                                    <FolderOpen className="w-4 h-4 text-slate-400" />
                                    <span className={remainingProjects <= 0 && remainingProjects !== -1 ? 'text-red-500 font-bold' : 'text-slate-600'}>
                                        {remainingProjects === -1 ? '∞' : remainingProjects}/{currentPlan.projectsIncluded === -1 ? '∞' : currentPlan.projectsIncluded}
                                    </span>
                                </div>
                                <div className="w-px h-4 bg-slate-200"></div>
                                <div className="flex items-center gap-1" title={language === 'ar' ? 'التخزين' : 'Storage'}>
                                    <HardDrive className="w-4 h-4 text-slate-400" />
                                    <span className={storageInfo.percentage > 90 ? 'text-red-500 font-bold' : 'text-slate-600'}>
                                        {storageInfo.used}/{storageInfo.total >= 1024 ? `${storageInfo.total / 1024}GB` : `${storageInfo.total}MB`}
                                    </span>
                                </div>
                            </div>

                            {/* Quick Navigation */}
                            <div className="hidden lg:flex items-center gap-2">
                                <button
                                    onClick={() => handleNavigate('supplier-catalog')}
                                    className="px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
                                >
                                    {language === 'ar' ? 'كتالوج الموردين' : 'Supplier Catalog'}
                                </button>
                                <button
                                    onClick={() => handleNavigate('payment')}
                                    className="px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                                >
                                    {language === 'ar' ? 'الباقات' : 'Plans'}
                                </button>
                            </div>

                            {/* User Info */}
                            <div className="flex items-center gap-2 sm:gap-3 bg-slate-50 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-slate-100">
                                <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shrink-0">
                                    <User className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                                </div>
                                <div className="hidden sm:block text-sm">
                                    <div className="font-medium text-slate-700">{user?.name}</div>
                                    <div className="text-xs text-slate-400">{user?.email}</div>
                                </div>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="p-2 text-slate-400 hover:text-red-500 transition-colors"
                                title={isRtl ? 'تسجيل الخروج' : 'Logout'}
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* === COMPACT HEADER FOR BLUEPRINT MODE === */}
                    {state.viewMode === 'blueprint' ? (
                        <>
                            {isFreePlan && (
                                <div className="bg-amber-50/80 border border-amber-200 rounded-lg px-3 py-1.5 mb-2 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                                        <span className="text-xs font-medium text-amber-800">
                                            {language === 'ar' ? 'باقة مجانية — بعض الميزات محدودة' : 'Free Plan — Some features limited'}
                                        </span>
                                    </div>
                                    <button onClick={() => handleNavigate('payment')} className="px-2.5 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded-md hover:bg-emerald-400">
                                        {language === 'ar' ? 'ترقية' : 'Upgrade'}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : (
                        <>
                            {/* Free Plan Warning Banner */}
                            {isFreePlan && (
                                <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 mb-4 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                                        <div>
                                            <p className="text-sm font-medium text-amber-800">
                                                {language === 'ar' ? 'أنت تستخدم الباقة المجانية' : "You're on the Free Plan"}
                                            </p>
                                            <p className="text-xs text-amber-600">
                                                {language === 'ar'
                                                    ? 'بعض الميزات محدودة. قم بالترقية لفتح جميع المميزات.'
                                                    : 'Some features are limited. Upgrade to unlock all features.'
                                                }
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleNavigate('payment')}
                                        className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-lg hover:from-emerald-400 hover:to-teal-400 transition-all"
                                    >
                                        {language === 'ar' ? 'ترقية' : 'Upgrade'}
                                    </button>
                                </div>
                            )}

                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-0">
                                <div className="flex items-center gap-4">
                                    <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/20 text-white shrink-0">
                                        <Calculator className="w-6 h-6" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h1 className="text-base sm:text-xl md:text-2xl font-black text-slate-800 tracking-tight flex items-center gap-2 sm:gap-3">
                                            {state.viewMode === 'pricing' ? tt('boq_title') : state.viewMode === 'blueprint' ? tt('blueprint_title') : tt('materials')}
                                            <span className="bg-gradient-to-r from-emerald-400 to-emerald-600 text-white p-1 px-3 rounded-lg text-[10px] font-bold shadow-sm shadow-emerald-500/20 uppercase tracking-widest">PRO</span>
                                        </h1>
                                        <p className="text-slate-500 text-sm font-medium flex items-center gap-2">
                                            {PROJECT_TITLES[state.projectType]}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-1.5 sm:gap-2 md:gap-3 flex-wrap">
                                    <div className="text-sm font-medium text-slate-600 bg-white px-4 py-2.5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-2">
                                        <Calendar className="w-4 h-4 text-emerald-500" />
                                        <span>{state.metadata.pricingDate}</span>
                                    </div>
                                    <button
                                        onClick={() => setShowUniversalImporter(true)}
                                        disabled={isFreePlan || isDemoMode}
                                        title={(isFreePlan || isDemoMode) ? (state.language === 'ar' ? 'غير متاح في الباقة المجانية' : 'Not available in free plan') : (state.language === 'ar' ? 'محلل Arba الذكي' : 'Arba Intelligence Parser')}
                                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold text-sm shadow-lg ${
                                            (isFreePlan || isDemoMode)
                                            ? 'bg-slate-200 text-slate-400 cursor-not-allowed border border-slate-300'
                                            : 'bg-gradient-to-r from-violet-600 hover:from-violet-500 to-indigo-600 hover:to-indigo-500 text-white shadow-indigo-500/25 border border-indigo-400/30 active:scale-95'
                                        }`}
                                    >
                                        {(isFreePlan || isDemoMode) && <Lock className="w-4 h-4" />}
                                        <Zap className={`w-4 h-4 ${(isFreePlan || isDemoMode) ? '' : 'text-yellow-300 fill-yellow-300'}`} />
                                        {state.language === 'ar' ? 'استيراد ذكي' : 'Smart Import'}
                                    </button>
                                    <button
                                        onClick={handleExport}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl transition-all font-bold text-sm shadow-md bg-slate-900 hover:bg-slate-800 text-white border border-slate-700 active:scale-95"
                                    >
                                        <Download className="w-4 h-4 text-emerald-400" />
                                        PDF/Excel
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </header>

                {/* Content Area */}
                {state.viewMode === 'pricing' ? (
                    <div className="flex-1 overflow-y-auto p-3 sm:p-5 md:p-8">
                        <div className="max-w-7xl mx-auto">
                            <StatsGrid
                                totalDirect={calculationResult.totalDirect}
                                totalOverhead={calculationResult.totalOverhead}
                                totalProfit={calculationResult.totalProfit}
                                finalPrice={calculationResult.finalPrice}
                                totalConcreteVolume={calculationResult.totalConcreteVolume}
                                totalLaborCost={calculationResult.totalLaborCost}
                                totalMaterialCost={calculationResult.totalMaterialCost}
                                buildArea={state.buildArea}
                                language={state.language}
                            />

                            {/* Charts Section — Cost Analysis */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                                <CostBreakdownChart
                                    materialCost={calculationResult.totalMaterialCost}
                                    laborCost={calculationResult.totalLaborCost}
                                    overhead={calculationResult.totalOverhead}
                                    profit={calculationResult.totalProfit}
                                    language={state.language}
                                />
                                <CategoryBarChart
                                    sectionCosts={(() => {
                                        const costs: Record<string, number> = {};
                                        calculationResult.items.forEach(item => {
                                            const sec = item.id?.substring(0, 2) || '00';
                                            costs[sec] = (costs[sec] || 0) + (item.totalLinePrice || 0);
                                        });
                                        return costs;
                                    })()}
                                    language={state.language}
                                />
                                <PriceBenchmark
                                    pricePerSqm={state.buildArea > 0 ? calculationResult.finalPrice / state.buildArea : 0}
                                    projectType={state.projectType}
                                    language={state.language}
                                />
                            </div>

                            {/* Building Area Breakdown Section */}
                            <div className="mt-6 mb-6">
                                <AreaBreakdownDisplay
                                    breakdown={calculationResult.areaBreakdown}
                                    language={state.language}
                                />
                            </div>

                            {/* 🛡️ SOVEREIGN v8.0: Profitability & Brain Intelligence — HIDDEN from standard users */}
                            {/* Only Manager, Quality Employee, and Super Admin can see raw profit analysis */}
                            {(isManager || currentEmployee?.role === 'quality' || currentEmployee?.role === 'deputy' || user?.email === import.meta.env.VITE_SUPER_ADMIN_EMAIL) && (
                                <>
                                    {/* Item Profitability Detail Chart */}
                                    <ItemProfitabilityChart
                                        items={calculationResult.items}
                                        language={state.language}
                                    />
                                </>
                            )}

                            {/* 🧠 SOVEREIGN v8.0: Brain Insights Bar — visible only to Manager & Quality */}
                            {(isManager || currentEmployee?.role === 'quality' || currentEmployee?.role === 'deputy' || user?.email === import.meta.env.VITE_SUPER_ADMIN_EMAIL) && brainInsights && (
                                <BrainInsightsBar
                                    insightReport={brainInsights}
                                    scheduleEstimate={scheduleEstimate}
                                    language={state.language}
                                />
                            )}

                            <ItemTable
                                items={calculationResult.items}
                                language={state.language}
                                onParamChange={handleItemParamChange}
                                onCheckAI={checkPriceWithAI}
                                onAddCustomItem={handleAddCustomItem}
                                onDeleteCustomItem={handleDeleteCustomItem}
                                isFreePlan={isFreePlan}
                                encryptSupplierName={encryptSupplierName}
                                userPlan={user?.plan || 'free'}
                                isDemoMode={isDemoMode}
                                sections={SECTION_DEFINITIONS}
                                enabledSections={state.enabledSections}
                            />
                        </div>
                    </div>
                ) : state.viewMode === 'blueprint' ? (
                    <BlueprintEditor
                        blueprint={state.blueprint}
                        language={state.language}
                        soilType={state.soilType}
                        projectType={state.projectType}
                        projectMeta={{
                            ownerName: state.metadata.clientName,
                            projectName: state.metadata.projectName,
                            planNumber: state.metadata.planNumber,
                            companyName: state.metadata.companyName,
                            permitNumber: state.metadata.buildingPermitNumber,
                        }}
                        onChange={handleBlueprintChange}
                        onUpdateTotalArea={handleUpdateTotalArea}
                    />
                ) : (
                    <InteriorEditor
                        rooms={state.rooms}
                        finishes={state.interiorFinishes}
                        language={state.language}
                        onUpdateFinish={handleUpdateFinish}
                    />
                )}

            </main>

            {/* Price Quote Modal */}
            {showPriceQuote && (
                <PriceQuote
                    state={state}
                    calculatedItems={calculationResult.items}
                    totals={{
                        totalDirect: calculationResult.totalDirect,
                        totalOverhead: calculationResult.totalOverhead,
                        totalProfit: calculationResult.totalProfit,
                        finalPrice: calculationResult.finalPrice
                    }}
                    language={state.language}
                    onClose={() => setShowPriceQuote(false)}
                />
            )}

            {/* Universal Intelligence Parser Modal */}
            {showUniversalImporter && (
                <UniversalImporter
                    language={state.language}
                    onImport={(items) => {
                        // Add imported items to customItems
                        const newItems: BaseItem[] = items.map((item: any) => ({
                            id: item.id || `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            category: item.category || 'custom',
                            type: 'all' as any,
                            name: item.name || { ar: '', en: '', fr: '', zh: '' },
                            unit: item.unit || 'm²',
                            qty: item.qty || 1,
                            baseMaterial: item.totalUnitCost || 0,
                            baseLabor: 0,
                            waste: 0,
                            suppliers: [],
                            sbc: item.sbc || 'N/A',
                            soilFactor: false,
                            isCustom: true,
                        }));
                        setState(prev => ({
                            ...prev,
                            customItems: [...prev.customItems, ...newItems]
                        }));
                        setShowUniversalImporter(false);
                    }}
                    onClose={() => setShowUniversalImporter(false)}
                    overheadConfig={{
                        overheadMultiplier: 1 + (state.fixedOverhead / 100),
                        profitMargin: state.profitMargin / 100,
                        contingency: 0.05,
                    }}
                />
            )}
        </div>
    );
};

const RootApp = () => (
    <BrowserRouter>
        <RoleProvider>
            <AuthProvider>
                <App />
            </AuthProvider>
        </RoleProvider>
    </BrowserRouter>
);

export default RootApp;