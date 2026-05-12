import { Language } from '../../types';
/**
 * Arba SaaS Dashboard — لوحة تحكم أربا السحابية
 * Main dashboard layout with collapsible sidebar navigation
 * 
 * Sections: Dashboard, Projects, Clients, Security, Rates
 */

import React, { useState, useEffect, useCallback } from 'react';
import QuickStats from './QuickStats';
import ProjectList from './ProjectList';
import ClientManager from './ClientManager';
import SecurityAlerts from './SecurityAlerts';
import RateLibrary from './RateLibrary';
import UsageNudgeBanner from './UsageNudgeBanner';
import UsageQuotaBar from './UsageQuotaBar';
import {
    ArbaProject, ArbaClient, SecurityAlert as SecurityAlertType,
    DashboardStats, ProjectStatus, UserRole, generateId
} from '../../services/projectTypes';
import * as projectService from '../../services/projectService';
import * as clientService from '../../services/clientService';
import * as rbacService from '../../services/rbacService';

const LazyBOQUploader = React.lazy(() => import('../BOQUploader'));

// =================== TYPES ===================

type DashboardSection = 'overview' | 'projects' | 'clients' | 'security' | 'rates' | 'boq-engine';

interface SaaSDashboardProps {
    userId: string;
    userName: string;
    userEmail: string;
    userPlan?: string;
    language: Language;
    onOpenPricing: (project?: ArbaProject) => void;
    onLogout: () => void;
    onUpgrade?: () => void;
}

// =================== SIDEBAR NAV CONFIG ===================

const NAV_ITEMS: { id: DashboardSection; icon: string; label: { ar: string; en: string } }[] = [
    { id: 'overview', icon: '📊', label: { ar: 'لوحة التحكم', en: 'Dashboard' } },
    { id: 'projects', icon: '📁', label: { ar: 'المشاريع', en: 'Projects' } },
    { id: 'clients', icon: '👥', label: { ar: 'العملاء', en: 'Clients' } },
    { id: 'security', icon: '🔒', label: { ar: 'الأمان', en: 'Security' } },
    { id: 'rates', icon: '📖', label: { ar: 'مكتبة الأسعار', en: 'Rate Library' } },
    { id: 'boq-engine', icon: '📊', label: { ar: 'محرك BOQ', en: 'BOQ Engine' } },
];

// =================== COMPONENT ===================

const SaaSDashboard: React.FC<SaaSDashboardProps> = ({
    userId, userName, userEmail, userPlan = 'free', language, onOpenPricing, onLogout, onUpgrade
}) => {
    const isAr = language === 'ar';

    // State
    const [section, setSection] = useState<DashboardSection>('overview');
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [userRole, setUserRole] = useState<UserRole>('qs_engineer');
    const [loading, setLoading] = useState(true);

    // Data
    const [stats, setStats] = useState<DashboardStats>({
        totalEstimatedValue: 0, activeProjects: 0, totalProjects: 0,
        securityPurges: 0, totalClients: 0, recentProjects: [], recentAlerts: [],
    });
    const [projects, setProjects] = useState<ArbaProject[]>([]);
    const [clients, setClients] = useState<ArbaClient[]>([]);
    const [alerts, setAlerts] = useState<SecurityAlertType[]>([]);

    // =================== DATA LOADING ===================

    const loadDashboardData = useCallback(async () => {
        setLoading(true);
        try {
            // Ensure role exists
            const role = await rbacService.ensureUserRole(userId, userName, userEmail);
            setUserRole(role.role);

            // Load data in parallel
            const [statsData, projectsData, clientsData, alertsData] = await Promise.all([
                projectService.getDashboardStats(userId, role.role),
                projectService.getUserProjects(userId, role.role),
                clientService.getAllClients(role.role === 'admin' ? undefined : userId),
                projectService.getSecurityAlerts(50),
            ]);

            setStats(statsData);
            setProjects(projectsData);
            setClients(clientsData);
            setAlerts(alertsData);
        } catch (err) {
            console.error('Dashboard load error:', err);
            // Use empty defaults on error (new deployment)
        } finally {
            setLoading(false);
        }
    }, [userId, userName, userEmail]);

    useEffect(() => {
        loadDashboardData();
    }, [loadDashboardData]);

    // =================== PROJECT HANDLERS ===================

    const handleCreateProject = async () => {
        try {
            const id = await projectService.createProject({
                ownerId: userId,
                assignedTo: [userId],
                name: isAr ? 'مشروع جديد' : 'New Project',
                projectType: 'villa',
                status: 'draft',
            });
            await loadDashboardData();
            // Open the pricing calculator with the new project
            const project = await projectService.getProject(id);
            if (project) onOpenPricing(project);
        } catch (err) {
            console.error('Create project error:', err);
        }
    };

    const handleOpenProject = (project: ArbaProject) => {
        onOpenPricing(project);
    };

    const handleDeleteProject = async (id: string) => {
        if (!confirm(isAr ? 'هل تريد حذف هذا المشروع؟' : 'Delete this project?')) return;
        try {
            await projectService.deleteProject(id);
            await loadDashboardData();
        } catch (err) {
            console.error('Delete project error:', err);
        }
    };

    const handleStatusChange = async (id: string, status: ProjectStatus) => {
        try {
            await projectService.updateProject(id, { status });
            await loadDashboardData();
        } catch (err) {
            console.error('Status change error:', err);
        }
    };

    // =================== CLIENT HANDLERS ===================

    const handleCreateClient = async (data: Partial<ArbaClient>) => {
        try {
            await clientService.createClient({ ...data, ownerId: userId });
            await loadDashboardData();
        } catch (err) {
            console.error('Create client error:', err);
        }
    };

    const handleUpdateClient = async (id: string, data: Partial<ArbaClient>) => {
        try {
            await clientService.updateClient(id, data);
            await loadDashboardData();
        } catch (err) {
            console.error('Update client error:', err);
        }
    };

    const handleDeleteClient = async (id: string) => {
        if (!confirm(isAr ? 'هل تريد حذف هذا العميل؟' : 'Delete this client?')) return;
        try {
            await clientService.deleteClient(id);
            await loadDashboardData();
        } catch (err) {
            console.error('Delete client error:', err);
        }
    };

    // =================== SECURITY HANDLERS ===================

    const handleResolveAlert = async (alertId: string) => {
        try {
            await projectService.resolveSecurityAlert(alertId, userId);
            await loadDashboardData();
        } catch (err) {
            console.error('Resolve alert error:', err);
        }
    };

    // =================== RENDER ===================

    const renderContent = () => {
        switch (section) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        {/* V2: Usage Alerts */}
                        <UsageNudgeBanner userId={userId} planId={userPlan} language={language} onUpgrade={onUpgrade} />

                        {/* V2: Usage Quota Bars */}
                        <UsageQuotaBar userId={userId} planId={userPlan} language={language} />

                        <QuickStats stats={stats} language={language} loading={loading} />

                        {/* Recent Projects */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold text-white">
                                    {isAr ? '📁 المشاريع الأخيرة' : '📁 Recent Projects'}
                                </h3>
                                <button
                                    onClick={() => setSection('projects')}
                                    className="text-sm text-emerald-400 hover:underline"
                                >
                                    {isAr ? 'عرض الكل →' : 'View All →'}
                                </button>
                            </div>
                            <ProjectList
                                projects={stats.recentProjects}
                                language={language}
                                loading={loading}
                                onOpenProject={handleOpenProject}
                                onCreateProject={handleCreateProject}
                                onDeleteProject={handleDeleteProject}
                                onStatusChange={handleStatusChange}
                            />
                        </div>

                        {/* Recent Alerts */}
                        {stats.recentAlerts.length > 0 && (
                            <div className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-lg font-bold text-white">
                                        {isAr ? '🔒 آخر التنبيهات' : '🔒 Recent Alerts'}
                                    </h3>
                                    <button
                                        onClick={() => setSection('security')}
                                        className="text-sm text-amber-400 hover:underline"
                                    >
                                        {isAr ? 'عرض الكل →' : 'View All →'}
                                    </button>
                                </div>
                                <SecurityAlerts
                                    alerts={stats.recentAlerts.slice(0, 3)}
                                    language={language}
                                    onResolve={handleResolveAlert}
                                />
                            </div>
                        )}
                    </div>
                );
            case 'projects':
                return (
                    <ProjectList
                        projects={projects}
                        language={language}
                        loading={loading}
                        onOpenProject={handleOpenProject}
                        onCreateProject={handleCreateProject}
                        onDeleteProject={handleDeleteProject}
                        onStatusChange={handleStatusChange}
                    />
                );
            case 'clients':
                return (
                    <ClientManager
                        clients={clients}
                        language={language}
                        loading={loading}
                        onCreateClient={handleCreateClient}
                        onUpdateClient={handleUpdateClient}
                        onDeleteClient={handleDeleteClient}
                        onViewProjects={(clientId) => {
                            setSection('projects');
                            // Future: filter projects by clientId
                        }}
                    />
                );
            case 'security':
                return (
                    <SecurityAlerts
                        alerts={alerts}
                        language={language}
                        loading={loading}
                        onResolve={handleResolveAlert}
                    />
                );
            case 'rates':
                return <RateLibrary language={language} />;
            case 'boq-engine':
                return (
                    <React.Suspense fallback={<div className="text-center py-20 text-slate-400">⏳ {isAr ? 'جاري تحميل محرك BOQ...' : 'Loading BOQ Engine...'}</div>}>
                        <LazyBOQUploader />
                    </React.Suspense>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
            {/* ═══════ SIDEBAR ═══════ */}
            <aside
                className={`flex flex-col border-slate-700/50 transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'
                    } ${isAr ? 'border-l' : 'border-r'} bg-slate-900/80 backdrop-blur-xl`}
            >
                {/* Logo */}
                <div className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-lg shadow-emerald-500/20">
                        A
                    </div>
                    {!sidebarCollapsed && (
                        <div className="min-w-0">
                            <h1 className="text-white font-bold text-sm truncate">
                                {isAr ? 'أربا للتسعير' : 'Arba Pricing'}
                            </h1>
                            <span className="text-emerald-400 text-[10px] font-medium">SaaS Dashboard</span>
                        </div>
                    )}
                </div>

                {/* Nav Items */}
                <nav className="flex-1 px-2 space-y-1 mt-2">
                    {NAV_ITEMS.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setSection(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${section === item.id
                                ? 'bg-emerald-500/15 text-emerald-400 shadow-sm'
                                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                }`}
                            title={sidebarCollapsed ? item.label[language] : undefined}
                        >
                            <span className="text-lg flex-shrink-0">{item.icon}</span>
                            {!sidebarCollapsed && <span>{item.label[language]}</span>}
                        </button>
                    ))}
                </nav>

                {/* Open Pricing */}
                <div className="px-2 mb-2">
                    <button
                        onClick={() => onOpenPricing()}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
                    >
                        <span className="text-lg">🧮</span>
                        {!sidebarCollapsed && <span>{isAr ? 'فتح المُسعِّر' : 'Open Calculator'}</span>}
                    </button>
                </div>

                {/* Divider */}
                <div className="px-4">
                    <div className="border-t border-slate-700/50" />
                </div>

                {/* Bottom section */}
                <div className="p-2 space-y-1">
                    {/* Collapse toggle */}
                    <button
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 transition-all"
                    >
                        <span className="text-base">{sidebarCollapsed ? (isAr ? '←' : '→') : (isAr ? '→' : '←')}</span>
                        {!sidebarCollapsed && <span>{isAr ? 'تصغير' : 'Collapse'}</span>}
                    </button>

                    {/* User info */}
                    <div className={`flex items-center gap-2 px-3 py-2 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {userName.charAt(0).toUpperCase()}
                        </div>
                        {!sidebarCollapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="text-white text-xs font-medium truncate">{userName}</p>
                                <p className="text-slate-500 text-[10px] truncate">
                                    {userRole === 'admin' ? (isAr ? 'مدير' : 'Admin') : (isAr ? 'مهندس كميات' : 'QS Engineer')}
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Logout */}
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all"
                    >
                        <span className="text-base">🚪</span>
                        {!sidebarCollapsed && <span>{isAr ? 'تسجيل خروج' : 'Logout'}</span>}
                    </button>
                </div>
            </aside>

            {/* ═══════ MAIN CONTENT ═══════ */}
            <main className="flex-1 overflow-auto">
                {/* Top Bar */}
                <header className="sticky top-0 z-10 px-6 py-4 bg-slate-950/80 backdrop-blur-xl border-b border-slate-700/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                {NAV_ITEMS.find(n => n.id === section)?.label[language]}
                            </h2>
                            <p className="text-xs text-slate-500">
                                {new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', {
                                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
                                })}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            {/* Plan badge */}
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${
                                userPlan === 'enterprise' ? 'bg-purple-500/10 text-purple-400 border-purple-500/30' :
                                userPlan === 'business' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' :
                                userPlan === 'professional' ? 'bg-blue-500/10 text-blue-400 border-blue-500/30' :
                                userPlan === 'starter' ? 'bg-green-500/10 text-green-400 border-green-500/30' :
                                'bg-slate-500/10 text-slate-400 border-slate-500/30'
                            }`}>
                                {userPlan.toUpperCase()}
                            </span>

                            {/* Role badge */}
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${userRole === 'admin'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                                : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                }`}>
                                {userRole === 'admin' ? 'ADMIN' : 'QS'}
                            </span>

                            {/* Refresh */}
                            <button
                                onClick={loadDashboardData}
                                className="p-2 rounded-lg bg-slate-800/60 text-slate-400 hover:text-white transition-all text-sm"
                                title={isAr ? 'تحديث' : 'Refresh'}
                            >
                                🔄
                            </button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="p-6">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
};

export default SaaSDashboard;
