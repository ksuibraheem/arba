import React, { useState, useMemo } from 'react';
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
import AdminDashboard from './pages/admin/AdminDashboard';
import { AppState, CalculatedItem, ProjectType, CustomParams, BlueprintConfig, SurfaceLocation, RoomFinishes, BaseItem } from './types';
import { INITIAL_OVERHEAD, PROJECT_DEFAULTS, PROJECT_TITLES, TRANSLATIONS } from './constants';
import { calculateProjectCosts } from './utils/calculations';
import { Download, Calendar, User, Briefcase, Hash, LogOut, Calculator, Lock, Crown, AlertTriangle, HardDrive, FolderOpen, Upload, Image } from 'lucide-react';
import { COMPANY_INFO, SUBSCRIPTION_PLANS, encryptSupplierName, getStorageInfo, getRemainingProjects, FREE_PLAN_RESTRICTIONS } from './companyData';

type PageRoute = 'landing' | 'login' | 'register' | 'about' | 'company' | 'payment' | 'verification' | 'admin' | 'dashboard';

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
    const handleLogin = (email: string, password: string) => {
        const storedUser = localStorage.getItem('arba_user');
        if (storedUser) {
            const userData = JSON.parse(storedUser);
            if (userData.email === email) {
                setUser(userData);
                setCurrentPage('dashboard');
                return;
            }
        }
        // Demo login
        setUser({
            name: 'مستخدم تجريبي',
            email: email,
            plan: 'free',
            usedProjects: 0,
            usedStorageMB: 10
        });
        setCurrentPage('dashboard');
    };

    const handleRegister = (data: RegisterData) => {
        const userData: AuthUser = {
            name: data.name,
            email: data.email,
            company: data.company,
            plan: data.plan,
            usedProjects: 0,
            usedStorageMB: 0
        };
        localStorage.setItem('arba_user', JSON.stringify(userData));
        setUser(userData);
        setCurrentPage('dashboard');
    };

    const handleLogout = () => {
        setUser(null);
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
        return <LoginPage language={language} onNavigate={handleNavigate} onLogin={handleLogin} />;
    }

    if (currentPage === 'register') {
        return <RegisterPage language={language} onNavigate={handleNavigate} onRegister={handleRegister} />;
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
                email={user?.email}
                onVerificationComplete={() => setCurrentPage('dashboard')}
            />
        );
    }

    if (currentPage === 'admin') {
        return <AdminDashboard language={language} onNavigate={handleNavigate} />;
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
                                <button
                                    onClick={() => handleNavigate('admin')}
                                    className="px-3 py-1.5 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors"
                                >
                                    {language === 'ar' ? 'لوحة المدير' : 'Admin'}
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