import React, { useState, useMemo, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import Sidebar from './components/Sidebar';
import StatsGrid from './components/StatsGrid';
import ItemTable from './components/ItemTable';
import BlueprintEditor from './components/BlueprintEditor';
import InteriorEditor from './components/InteriorEditor';
import AreaBreakdownDisplay from './components/AreaBreakdown';
import PriceQuote from './components/PriceQuote';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage, { RegisterData } from './pages/RegisterPage';
import AboutPage from './pages/AboutPage';
import CompanyPage from './pages/CompanyPage';
import PaymentPage from './pages/PaymentPage';
import VerificationPage from './pages/VerificationPage';
import UnderReviewPage from './pages/UnderReviewPage';
import PaymentUploadPage from './pages/PaymentUploadPage';
import { registrationService } from './services/registrationService';
import AdminDashboard from './pages/admin/AdminDashboard';
import ManagerDashboard from './pages/employees/ManagerDashboard';
import EmployeeDashboard from './pages/employees/EmployeeDashboard';
import { employeeService, Employee, MANAGER_CREDENTIALS } from './services/employeeService';
import HRPage from './pages/employees/roles/HRPage';
import AccountantPage from './pages/employees/roles/AccountantPage';
import PasswordResetPage from './pages/PasswordResetPage';
import SupportCenterPage from './pages/SupportCenterPage';
import CloudSyncPage from './pages/CloudSyncPage';
import SupplierDashboard from './pages/supplier/SupplierDashboard';
import QuantitySurveyorPage from './pages/employees/roles/QuantitySurveyorPage';
import { AppState, CalculatedItem, ProjectType, CustomParams, BlueprintConfig, SurfaceLocation, RoomFinishes, BaseItem } from './types';
import { INITIAL_OVERHEAD, PROJECT_DEFAULTS, PROJECT_TITLES, TRANSLATIONS } from './constants';
import { calculateProjectCosts } from './utils/calculations';
import { Download, Calendar, User, Briefcase, Hash, LogOut, Calculator, Lock, Crown, AlertTriangle, HardDrive, FolderOpen, Upload, Image } from 'lucide-react';
import { COMPANY_INFO, SUBSCRIPTION_PLANS, encryptSupplierName, getStorageInfo, getRemainingProjects, FREE_PLAN_RESTRICTIONS } from './companyData';
// Local auth service (fallback)
import { registerUser, loginUser, logoutUser, getCurrentUser, StoredUser } from './services/authService';
// Firebase auth service
import { registerWithFirebase, loginWithFirebase, logoutFromFirebase, onAuthChange, getUserData, UserData } from './firebase/authService';

// Toggle Firebase mode - set to true to use Firebase
const USE_FIREBASE = true;

type PageRoute = 'landing' | 'login' | 'register' | 'about' | 'company' | 'payment' | 'verification' | 'under-review' | 'payment-upload' | 'admin' | 'dashboard' | 'admin-login' | 'manager' | 'employee' | 'hr' | 'accountant' | 'password-reset' | 'cloud-sync' | 'support-center' | 'support' | 'developer' | 'marketing' | 'quality' | 'deputy' | 'supplier' | 'quantity_surveyor';

// مفتاح الوصول السري للوحة المدير - غيره لمفتاح خاص بك
const ADMIN_SECRET_KEY = 'arba2025secure';

interface AuthUser {
    name: string;
    email: string;
    company?: string;
    companyLogo?: string; // Base64 logo
    plan: string;
    usedProjects: number;
    usedStorageMB: number;
}

const App: React.FC = () => {
    // Auth & Routing State
    const [currentPage, setCurrentPage] = useState<PageRoute>('landing');
    const [user, setUser] = useState<AuthUser | null>(null);
    const [language, setLanguage] = useState<'ar' | 'en'>('ar');
    const [showUpgradeModal, setShowUpgradeModal] = useState(false);
    const [upgradeFeature, setUpgradeFeature] = useState('');
    const [showPriceQuote, setShowPriceQuote] = useState(false);
    const [loginError, setLoginError] = useState<string>('');
    const [adminAccessGranted, setAdminAccessGranted] = useState(false);
    const [adminKeyInput, setAdminKeyInput] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    // Employee state
    const [currentEmployee, setCurrentEmployee] = useState<Employee | null>(null);
    const [isManager, setIsManager] = useState(false);
    // Registration flow state
    const [registrationRequestId, setRegistrationRequestId] = useState<string | null>(null);
    const [pendingRegistrationEmail, setPendingRegistrationEmail] = useState<string>('');
    const [pendingRegistrationPhone, setPendingRegistrationPhone] = useState<string>('');

    // Check for existing session on mount
    useEffect(() => {
        if (USE_FIREBASE) {
            // Firebase auth state listener
            const unsubscribe = onAuthChange(async (firebaseUser) => {
                if (firebaseUser) {
                    const userData = await getUserData(firebaseUser.uid);
                    if (userData) {
                        setUser({
                            name: userData.name,
                            email: userData.email,
                            company: userData.company,
                            companyLogo: userData.companyLogo,
                            plan: userData.plan,
                            usedProjects: userData.usedProjects,
                            usedStorageMB: userData.usedStorageMB
                        });
                    }
                } else {
                    setUser(null);
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
            }
            setIsLoading(false);
        }
    }, []);

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
            tenderNumber: '',
            projectName: 'مشروع جديد',
            companyName: '',
            preparedBy: '',
            confirmationCode: '',
            pricingDate: new Date().toISOString().split('T')[0],
            executionStartDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            projectDurationMonths: 12
        },

        pricingStrategy: 'fixed_margin',
        profitMargin: 15,
        targetROI: 20,
        totalInvestment: 1000000,
        fixedOverhead: INITIAL_OVERHEAD,

        landArea: 300,
        buildArea: 450,
        floors: 2,

        rooms: PROJECT_DEFAULTS['villa'].rooms,
        facades: PROJECT_DEFAULTS['villa'].facades,
        team: PROJECT_DEFAULTS['villa'].team,
        blueprint: PROJECT_DEFAULTS['villa'].blueprint,
        interiorFinishes: [],
        customItems: [],

        itemOverrides: {},
    });

    const t = (key: string) => TRANSLATIONS[key]?.[state.language] || key;

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
        if (page === 'dashboard' && !user) {
            setCurrentPage('login');
            return;
        }
        setCurrentPage(page as PageRoute);
    };

    // Auth Handlers
    const handleLogin = async (email: string, password: string, userType?: string) => {
        setLoginError('');

        // موظفين - تحقق خاص
        if (userType === 'employee') {
            // استخدام نظام الموظفين الجديد
            const result = employeeService.login(email, password);

            if (result.success && result.employee) {
                // التحقق إذا كان المدير
                if ('role' in result.employee && result.employee.role === 'manager') {
                    // المدير
                    setIsManager(true);
                    setCurrentEmployee(null);
                    setUser({
                        name: MANAGER_CREDENTIALS.name,
                        email: 'manager@arba-sys.com',
                        plan: 'enterprise',
                        usedProjects: 0,
                        usedStorageMB: 0
                    });
                    setCurrentPage('manager');
                } else if ('employeeNumber' in result.employee && result.employee.employeeNumber === MANAGER_CREDENTIALS.employeeNumber) {
                    // المدير (من بيانات الدخول الثابتة)
                    setIsManager(true);
                    setCurrentEmployee(null);
                    setUser({
                        name: MANAGER_CREDENTIALS.name,
                        email: 'manager@arba-sys.com',
                        plan: 'enterprise',
                        usedProjects: 0,
                        usedStorageMB: 0
                    });
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
                setCurrentPage('dashboard');
            }
        }
    };

    const handleRegister = async (data: RegisterData) => {
        // For individuals, use the new registration workflow with verification
        if (data.userType === 'individual') {
            const result = registrationService.createRegistrationRequest({
                name: data.name,
                email: data.email,
                phone: data.phone || '',
                password: data.password,
                plan: (data.plan === 'free' || data.plan === 'professional') ? data.plan : 'free'
            });

            if (!result.success) {
                console.error('Registration failed:', result.error);
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

        // For companies and suppliers, use the new workflow with commercial register verification
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
                // الموردين مجاناً دائماً، الشركات حسب اختيارهم
                plan: data.userType === 'supplier' ? 'free' : ((data.plan === 'free' || data.plan === 'professional') ? data.plan : 'professional')
            });

            if (!result.success) {
                console.error('Registration failed:', result.error);
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

        // For employees, use existing Firebase flow
        if (USE_FIREBASE) {
            // Firebase registration
            const result = await registerWithFirebase({
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
                setLoginError(result.error || 'حدث خطأ أثناء التسجيل');
                return;
            }
            // User state will be updated by onAuthChange listener
            setCurrentPage('dashboard');
        } else {
            // Local registration
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
                setCurrentPage('dashboard');
            }
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
        setState((prev) => ({ ...prev, ...updates }));
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
            return response.text || "لم يتم استلام رد";
        } catch (error) {
            console.error("AI Error", error);
            return "حدث خطأ أثناء الاتصال بـ AI";
        }
    };

    const calculationResult = useMemo(() => {
        return calculateProjectCosts(state);
    }, [state]);

    const handleExport = () => {
        // Show price quote for all users (free users get limited view if needed)
        setShowPriceQuote(true);
    };

    const isRtl = state.language === 'ar';

    // Render Pages Based on Route
    if (currentPage === 'landing') {
        return <LandingPage language={language} onNavigate={handleNavigate} onLanguageChange={setLanguage} />;
    }

    if (currentPage === 'login') {
        return <LoginPage language={language} onNavigate={handleNavigate} onLogin={handleLogin} loginError={loginError} />;
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
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
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
                <div className="min-h-screen bg-gradient-to-br from-slate-900 via-red-900 to-slate-900 flex items-center justify-center p-6" dir={language === 'ar' ? 'rtl' : 'ltr'}>
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
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between" dir={language === 'ar' ? 'rtl' : 'ltr'}>
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
                    <HRPage language={language} employee={hrEmployee} />
                </div>
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
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between" dir={language === 'ar' ? 'rtl' : 'ltr'}>
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

        // Import SupportPage dynamically
        const SupportPage = require('./pages/employees/roles/SupportPage').default;

        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
                <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between" dir={language === 'ar' ? 'rtl' : 'ltr'}>
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

    // Developer Page (placeholder)
    if (currentPage === 'developer') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">{language === 'ar' ? 'لوحة المطور' : 'Developer Dashboard'}</h1>
                    <p className="text-slate-400 mb-6">{language === 'ar' ? 'قريباً...' : 'Coming soon...'}</p>
                    <button
                        onClick={() => setCurrentPage(isManager ? 'manager' : 'employee')}
                        className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                    >
                        {language === 'ar' ? 'رجوع' : 'Back'}
                    </button>
                </div>
            </div>
        );
    }

    // Marketing Page (placeholder)
    if (currentPage === 'marketing') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">{language === 'ar' ? 'لوحة التسويق' : 'Marketing Dashboard'}</h1>
                    <p className="text-slate-400 mb-6">{language === 'ar' ? 'قريباً...' : 'Coming soon...'}</p>
                    <button
                        onClick={() => setCurrentPage(isManager ? 'manager' : 'employee')}
                        className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                    >
                        {language === 'ar' ? 'رجوع' : 'Back'}
                    </button>
                </div>
            </div>
        );
    }

    // Quality Page (placeholder)
    if (currentPage === 'quality') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-teal-500 to-green-600 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">{language === 'ar' ? 'لوحة الجودة' : 'Quality Dashboard'}</h1>
                    <p className="text-slate-400 mb-6">{language === 'ar' ? 'قريباً...' : 'Coming soon...'}</p>
                    <button
                        onClick={() => setCurrentPage(isManager ? 'manager' : 'employee')}
                        className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                    >
                        {language === 'ar' ? 'رجوع' : 'Back'}
                    </button>
                </div>
            </div>
        );
    }

    // Deputy Manager Page (placeholder)
    if (currentPage === 'deputy') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="text-center">
                    <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">{language === 'ar' ? 'لوحة نائب المدير' : 'Deputy Manager Dashboard'}</h1>
                    <p className="text-slate-400 mb-6">{language === 'ar' ? 'قريباً...' : 'Coming soon...'}</p>
                    <button
                        onClick={() => setCurrentPage(isManager ? 'manager' : 'employee')}
                        className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                    >
                        {language === 'ar' ? 'رجوع' : 'Back'}
                    </button>
                </div>
            </div>
        );
    }

    // Dashboard (Protected)
    return (
        <div className={`flex h-screen bg-slate-100 font-sans overflow-hidden ${isRtl ? '' : 'flex-row-reverse'}`} dir={isRtl ? 'rtl' : 'ltr'}>

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

            <Sidebar state={state} onChange={handleStateChange} />

            <main className="flex-1 flex flex-col overflow-hidden">

                {/* Header */}
                <header className="bg-white border-b border-slate-200 px-8 py-4 shadow-sm z-10">
                    <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-4">
                        <div className="flex items-center gap-4">
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

                            <div className="flex flex-col gap-1">
                                <h2 className="text-xl font-extrabold text-slate-800">{state.metadata.projectName || 'مشروع جديد'}</h2>
                                <div className="flex items-center gap-4 text-sm text-slate-500">
                                    <span className="flex items-center gap-1"><User className="w-3 h-3" /> {state.metadata.clientName || '---'}</span>
                                    <span className="flex items-center gap-1"><Hash className="w-3 h-3" /> {state.metadata.tenderNumber || '---'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            {/* Subscription Badge */}
                            <div className={`px-3 py-1 rounded-full text-xs font-medium ${isFreePlan
                                ? 'bg-slate-100 text-slate-600'
                                : user?.plan === 'professional'
                                    ? 'bg-emerald-100 text-emerald-700'
                                    : 'bg-purple-100 text-purple-700'
                                }`}>
                                {currentPlan.name[language]}
                            </div>

                            {/* Usage Stats */}
                            <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 text-xs">
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
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handleNavigate('payment')}
                                    className="px-3 py-1.5 text-xs font-medium text-emerald-600 bg-emerald-50 hover:bg-emerald-100 rounded-lg transition-colors"
                                >
                                    {language === 'ar' ? 'الباقات' : 'Plans'}
                                </button>
                            </div>

                            {/* User Info */}
                            <div className="flex items-center gap-3 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100">
                                <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <div className="text-sm">
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

                    <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                            <h1 className="text-lg font-bold text-slate-700 flex items-center gap-2">
                                <span className="bg-emerald-500 text-white p-0.5 px-2 rounded-md text-xs">PRO</span>
                                {state.viewMode === 'pricing' ? t('boq_title') : state.viewMode === 'blueprint' ? t('blueprint_title') : t('materials')}
                            </h1>
                            <p className="text-slate-400 text-xs flex items-center gap-2">
                                {PROJECT_TITLES[state.projectType]}
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-xs text-slate-500 bg-slate-50 p-2 rounded border border-slate-100 flex gap-4">
                                <div className="flex items-center gap-1">
                                    <Calendar className="w-3 h-3 text-slate-400" />
                                    <span>{state.metadata.pricingDate}</span>
                                </div>
                            </div>
                            <button
                                onClick={handleExport}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg shadow-md transition-all font-medium text-sm ${isFreePlan
                                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                    : 'bg-slate-800 hover:bg-slate-700 text-white'
                                    }`}
                            >
                                {isFreePlan && <Lock className="w-3 h-3" />}
                                <Download className="w-4 h-4" />
                                PDF/Excel
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                {state.viewMode === 'pricing' ? (
                    <div className="flex-1 overflow-y-auto p-8">
                        <div className="max-w-7xl mx-auto">
                            <StatsGrid
                                totalDirect={calculationResult.totalDirect}
                                totalOverhead={calculationResult.totalOverhead}
                                totalProfit={calculationResult.totalProfit}
                                finalPrice={calculationResult.finalPrice}
                                totalConcreteVolume={calculationResult.totalConcreteVolume}
                                totalLaborCost={calculationResult.totalLaborCost}
                                totalMaterialCost={calculationResult.totalMaterialCost}
                                language={state.language}
                            />

                            {/* Building Area Breakdown Section */}
                            <div className="mt-6 mb-6">
                                <AreaBreakdownDisplay
                                    breakdown={calculationResult.areaBreakdown}
                                    language={state.language}
                                />
                            </div>

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
                            />
                        </div>
                    </div>
                ) : state.viewMode === 'blueprint' ? (
                    <BlueprintEditor
                        blueprint={state.blueprint}
                        language={state.language}
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
        </div>
    );
};

export default App;