/**
 * Employee Workspace — مساحة عمل الفريق التقني (Zone A)
 * 
 * The full technical workspace for Admin & QS Engineers.
 * Features: File Upload Center, Purge Monitoring, Calculation Grid,
 *           plus all existing SaaS Dashboard sections.
 * 
 * Security: Full access to raw data, formula breakdowns, sanitization logs.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRole } from '../../contexts/RoleContext';
import QuickStats from '../dashboard/QuickStats';
import ProjectList from '../dashboard/ProjectList';
import ClientManager from '../dashboard/ClientManager';
import SecurityAlerts from '../dashboard/SecurityAlerts';
import RateLibrary from '../dashboard/RateLibrary';
import ProjectSetupModal, { ProjectSetupData } from '../modals/ProjectSetupModal';
import {
    ArbaProject, ArbaClient, SecurityAlert as SecurityAlertType,
    DashboardStats, ProjectStatus, PERMISSIONS
} from '../../services/projectTypes';
import * as projectService from '../../services/projectService';
import * as clientService from '../../services/clientService';

// =================== TYPES ===================

type WorkspaceSection =
    | 'overview' | 'projects' | 'clients' | 'security' | 'rates'
    | 'upload' | 'purge' | 'calc-grid';

interface EmployeeWorkspaceProps {
    language: 'ar' | 'en';
    onOpenPricing: (project?: ArbaProject, setupData?: ProjectSetupData) => void;
    onLogout: () => void;
    userId?: string;
    userName?: string;
    isDemoMode?: boolean;
}

// =================== NAV CONFIG ===================

const NAV_ITEMS: { id: WorkspaceSection; icon: string; label: { ar: string; en: string }; divider?: boolean }[] = [
    { id: 'overview', icon: '📊', label: { ar: 'لوحة التحكم', en: 'Dashboard' } },
    { id: 'projects', icon: '📁', label: { ar: 'المشاريع', en: 'Projects' } },
    { id: 'clients', icon: '👥', label: { ar: 'العملاء', en: 'Clients' } },
    { id: 'security', icon: '🔒', label: { ar: 'الأمان', en: 'Security' }, divider: true },
    // ── Zone A Exclusive ──
    { id: 'upload', icon: '📤', label: { ar: 'مركز الرفع', en: 'Upload Center' } },
    { id: 'purge', icon: '🛡️', label: { ar: 'الدرع الأمني', en: 'Purge Monitor' } },
    { id: 'calc-grid', icon: '🧮', label: { ar: 'شبكة الحسابات', en: 'Calc Grid' }, divider: true },
    // ──
    { id: 'rates', icon: '📖', label: { ar: 'مكتبة الأسعار', en: 'Rate Library' } },
];

// =================== COMPONENT ===================

const EmployeeWorkspace: React.FC<EmployeeWorkspaceProps> = ({
    language, onOpenPricing, onLogout, userId: propUserId, userName: propUserName, isDemoMode
}) => {
    const roleCtx = useRole();
    // Demo mode: use props. Authenticated: use RoleContext.
    const uid = isDemoMode ? (propUserId || 'demo') : (roleCtx.uid || propUserId || 'demo');
    const displayName = isDemoMode ? (propUserName || 'Demo') : (roleCtx.displayName || propUserName || 'Demo');
    const role = isDemoMode ? 'admin' as const : (roleCtx.role || 'qs_engineer');
    const isAr = language === 'ar';

    // State
    const [section, setSection] = useState<WorkspaceSection>('overview');
    const [showSetupModal, setShowSetupModal] = useState(false);
    const [pendingProject, setPendingProject] = useState<ArbaProject | undefined>(undefined);
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

    const loadData = useCallback(async () => {
        setLoading(true);
        try {
            if (isDemoMode) {
                // Demo mode: load projects from demoSessions collection only
                const [demoProjects, statsData] = await Promise.all([
                    projectService.getDemoProjects(uid).catch(() => [] as typeof projects),
                    projectService.getDashboardStats(uid, role).catch(() => ({
                        totalEstimatedValue: 0, activeProjects: 0, totalProjects: 0,
                        securityPurges: 0, totalClients: 0, recentProjects: [], recentAlerts: [],
                    })),
                ]);
                setProjects(demoProjects);
                setStats({ ...statsData, recentProjects: demoProjects.slice(0, 5), totalProjects: demoProjects.length });
            } else {
                const [statsData, projectsData, clientsData, alertsData] = await Promise.all([
                    projectService.getDashboardStats(uid, role),
                    projectService.getUserProjects(uid, role),
                    clientService.getAllClients(role === 'admin' ? undefined : uid),
                    projectService.getSecurityAlerts(50),
                ]);
                setStats(statsData);
                setProjects(projectsData);
                setClients(clientsData);
                setAlerts(alertsData);
            }
        } catch (err) {
            console.error('Workspace load error:', err);
        } finally {
            setLoading(false);
        }
    }, [uid, role, isDemoMode]);

    useEffect(() => { loadData(); }, [loadData]);

    // =================== HANDLERS ===================

    // Show setup modal instead of going directly to pricer
    const handleCreateProject = () => {
        setPendingProject(undefined);
        setShowSetupModal(true);
    };

    const handleOpenExistingProject = (project: ArbaProject) => {
        setPendingProject(project);
        setShowSetupModal(true);
    };

    // Called when user confirms or skips the setup modal
    const handleSetupConfirm = async (data: ProjectSetupData) => {
        setShowSetupModal(false);

        // Save project data — demo mode goes to demoSessions, real users go to projects
        if (!data.skipped) {
            try {
                const firstClient = data.clients[0];
                const projectPayload: any = {
                    ownerId: uid,
                    assignedTo: [uid],
                    name: data.projectName,
                    projectType: pendingProject?.projectType || 'villa',
                    status: pendingProject?.status || 'draft',
                    clientName: firstClient?.name || '',
                    clientType: firstClient?.type || 'individual',
                    clientPhone: firstClient?.phone || '',
                    clientEmail: firstClient?.email || '',
                    location: data.location,
                    clients: data.clients,
                };

                if (isDemoMode) {
                    // Demo mode: save to demoSessions/{uid}/projects
                    const demoId = pendingProject?.id;
                    if (demoId) {
                        await projectService.updateDemoProject(uid, demoId, projectPayload);
                    } else {
                        await projectService.saveDemoProject(uid, projectPayload);
                    }
                    // Reload projects from demo collection
                    const demoProjects = await projectService.getDemoProjects(uid);
                    setProjects(demoProjects);
                } else {
                    // Real users: save to main projects collection
                    if (!pendingProject) {
                        await projectService.createProject(projectPayload);
                    } else {
                        await projectService.updateProject(pendingProject.id, projectPayload);
                    }
                    await loadData();
                }
            } catch (err) {
                console.error('Save project error:', err);
            }
        }

        onOpenPricing(pendingProject, data);
    };

    const handleSetupClose = () => setShowSetupModal(false);

    const handleDeleteProject = async (id: string) => {
        if (!confirm(isAr ? 'هل تريد حذف هذا المشروع؟' : 'Delete this project?')) return;
        try { await projectService.deleteProject(id); await loadData(); }
        catch (err) { console.error(err); }
    };

    const handleStatusChange = async (id: string, status: ProjectStatus) => {
        try { await projectService.updateProject(id, { status }); await loadData(); }
        catch (err) { console.error(err); }
    };

    const handleCreateClient = async (data: Partial<ArbaClient>) => {
        try { await clientService.createClient({ ...data, ownerId: uid }); await loadData(); }
        catch (err) { console.error(err); }
    };

    const handleUpdateClient = async (id: string, data: Partial<ArbaClient>) => {
        try { await clientService.updateClient(id, data); await loadData(); }
        catch (err) { console.error(err); }
    };

    const handleDeleteClient = async (id: string) => {
        if (!confirm(isAr ? 'حذف العميل؟' : 'Delete client?')) return;
        try { await clientService.deleteClient(id); await loadData(); }
        catch (err) { console.error(err); }
    };

    const handleResolveAlert = async (alertId: string) => {
        try { await projectService.resolveSecurityAlert(alertId, uid); await loadData(); }
        catch (err) { console.error(err); }
    };

    // =================== ZONE A SECTIONS ===================

    const renderUploadCenter = () => (
        <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8">
                <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border-2 border-dashed border-blue-500/40 flex items-center justify-center">
                        <span className="text-4xl">📤</span>
                    </div>
                    <h3 className="text-xl font-bold text-white mb-2">
                        {isAr ? 'مركز رفع الملفات' : 'File Upload Center'}
                    </h3>
                    <p className="text-slate-400 text-sm mb-6">
                        {isAr
                            ? 'ارفع ملفات Excel أو PDF — سيتم تشغيل خط أنابيب التطهير والتسعير تلقائياً'
                            : 'Upload Excel or PDF files — the sanitization & pricing pipeline will run automatically'
                        }
                    </p>

                    {/* Drop zone */}
                    <div className="max-w-lg mx-auto border-2 border-dashed border-slate-600/50 rounded-xl p-10 hover:border-emerald-500/50 hover:bg-emerald-500/5 transition-all cursor-pointer group">
                        <span className="text-5xl block mb-3 group-hover:scale-110 transition-transform">📁</span>
                        <p className="text-slate-300 font-medium">
                            {isAr ? 'اسحب الملفات هنا' : 'Drop files here'}
                        </p>
                        <p className="text-slate-500 text-xs mt-1">.xlsx, .xls, .pdf</p>
                    </div>

                    {/* Pipeline status */}
                    <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-xl mx-auto">
                        {[
                            { icon: '📂', label: isAr ? 'استقبال' : 'Receive', status: 'ready' },
                            { icon: '🔍', label: isAr ? 'تحليل' : 'Parse', status: 'ready' },
                            { icon: '🛡️', label: isAr ? 'تطهير' : 'Sanitize', status: 'ready' },
                            { icon: '🧮', label: isAr ? 'تسعير' : 'Price', status: 'ready' },
                        ].map((step, i) => (
                            <div key={i} className="bg-slate-700/30 rounded-lg p-3 text-center">
                                <span className="text-xl">{step.icon}</span>
                                <p className="text-slate-400 text-[10px] mt-1">{step.label}</p>
                                <div className="w-full h-1 bg-slate-600 rounded-full mt-2">
                                    <div className="h-full bg-slate-500 rounded-full" style={{ width: '0%' }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );

    const renderPurgeMonitor = () => (
        <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                        <span className="text-xl">🛡️</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">
                            {isAr ? 'الدرع الأمني — مراقبة التطهير' : 'Security Shield — Purge Monitor'}
                        </h3>
                        <p className="text-slate-400 text-xs">
                            {isAr ? 'نتائج OCR / RegEx في الوقت الفعلي' : 'Real-time OCR / RegEx results'}
                        </p>
                    </div>
                </div>

                {/* Pipeline Results Dashboard */}
                <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                        <span className="text-2xl font-bold text-emerald-400">{stats.totalProjects}</span>
                        <p className="text-emerald-300/60 text-xs mt-1">{isAr ? 'ملفات نظيفة' : 'Clean Files'}</p>
                    </div>
                    <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-center">
                        <span className="text-2xl font-bold text-amber-400">{stats.securityPurges}</span>
                        <p className="text-amber-300/60 text-xs mt-1">{isAr ? 'عمليات تطهير' : 'Purge Ops'}</p>
                    </div>
                    <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-center">
                        <span className="text-2xl font-bold text-red-400">
                            {alerts.filter(a => a.severity === 'critical' && !a.resolved).length}
                        </span>
                        <p className="text-red-300/60 text-xs mt-1">{isAr ? 'محظورات نشطة' : 'Active Blocks'}</p>
                    </div>
                </div>

                {/* Security alerts inline */}
                <SecurityAlerts
                    alerts={alerts}
                    language={language}
                    loading={loading}
                    onResolve={handleResolveAlert}
                />
            </div>
        </div>
    );

    const renderCalcGrid = () => (
        <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                        <span className="text-xl">🧮</span>
                    </div>
                    <div>
                        <h3 className="text-lg font-bold text-white">
                            {isAr ? 'شبكة حسابات التسعير' : 'Pricing Calculation Grid'}
                        </h3>
                        <p className="text-slate-400 text-xs">
                            {isAr ? 'المعادلة: الإجمالي = [(المواد × الهدر) + العمالة + المعدات] × المصاريف العامة' : 'Formula: Total = [(Materials × Wastage) + Labor + Equipment] × Overheads'}
                        </p>
                    </div>
                </div>

                {/* Formula display */}
                <div className="bg-slate-900/60 rounded-xl p-4 border border-emerald-500/10 mb-6 font-mono text-sm">
                    <div className="text-emerald-400/80 mb-2">// {isAr ? 'المعادلة المحمية — خادم التسعير' : 'Secured Formula — Pricing Server'}</div>
                    <div className="text-slate-300">
                        <span className="text-purple-400">Total</span> = [(<span className="text-blue-400">Materials</span> × <span className="text-amber-400">Wastage</span>) + <span className="text-green-400">Labor</span> + <span className="text-orange-400">Equipment</span>] × <span className="text-pink-400">Overheads</span>
                    </div>
                </div>

                {/* Sample grid */}
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-slate-400 text-xs border-b border-slate-700">
                                <th className="py-2 text-right">{isAr ? 'البند' : 'Item'}</th>
                                <th className="py-2 text-center">{isAr ? 'المواد' : 'Materials'}</th>
                                <th className="py-2 text-center">{isAr ? 'الهدر%' : 'Waste%'}</th>
                                <th className="py-2 text-center">{isAr ? 'العمالة' : 'Labor'}</th>
                                <th className="py-2 text-center">{isAr ? 'المعدات' : 'Equipment'}</th>
                                <th className="py-2 text-center">{isAr ? 'م. عامة%' : 'OH%'}</th>
                                <th className="py-2 text-center text-emerald-400">{isAr ? 'الإجمالي' : 'Total'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-8 text-center text-slate-500">
                                        {isAr ? 'افتح مشروعاً لعرض البيانات' : 'Open a project to view data'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Open calculator CTA */}
                <button
                    onClick={() => onOpenPricing()}
                    className="mt-4 w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-400 font-medium border border-emerald-500/20 hover:border-emerald-500/40 transition-all"
                >
                    {isAr ? '🧮 فتح الآلة الحاسبة التفصيلية' : '🧮 Open Detailed Calculator'}
                </button>
            </div>
        </div>
    );

    // =================== RENDER CONTENT ===================

    const renderContent = () => {
        switch (section) {
            case 'overview':
                return (
                    <div className="space-y-6">
                        <QuickStats stats={stats} language={language} loading={loading} />
                        <div className="flex items-center justify-between">
                            <h3 className="text-lg font-bold text-white">
                                {isAr ? '📁 المشاريع الأخيرة' : '📁 Recent Projects'}
                            </h3>
                            <button onClick={() => setSection('projects')} className="text-sm text-emerald-400 hover:underline">
                                {isAr ? 'عرض الكل →' : 'View All →'}
                            </button>
                        </div>
                        <ProjectList
                            projects={stats.recentProjects}
                            language={language} loading={loading}
                            onOpenProject={(p) => onOpenPricing(p)}
                            onCreateProject={handleCreateProject}
                            onDeleteProject={handleDeleteProject}
                            onStatusChange={handleStatusChange}
                        />
                    </div>
                );
            case 'projects':
                return <ProjectList projects={projects} language={language} loading={loading}
                    onOpenProject={handleOpenExistingProject} onCreateProject={handleCreateProject}
                    onDeleteProject={handleDeleteProject} onStatusChange={handleStatusChange} />;
            case 'clients':
                return <ClientManager clients={clients} language={language} loading={loading}
                    onCreateClient={handleCreateClient} onUpdateClient={handleUpdateClient}
                    onDeleteClient={handleDeleteClient} onViewProjects={() => setSection('projects')} />;
            case 'security':
                return <SecurityAlerts alerts={alerts} language={language} loading={loading} onResolve={handleResolveAlert} />;
            case 'upload':
                return renderUploadCenter();
            case 'purge':
                return renderPurgeMonitor();
            case 'calc-grid':
                return renderCalcGrid();
            case 'rates':
                return <RateLibrary language={language} />;
            default:
                return null;
        }
    };

    // =================== LAYOUT ===================

    const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

    return (
        <div className="flex h-dvh h-screen bg-slate-950 overflow-hidden relative" dir={isAr ? 'rtl' : 'ltr'}>
            {/* Ambient Background */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-900/20 via-slate-950 to-slate-950 pointer-events-none" />

            {/* ═══════════════════════════════════════
                SIDEBAR — hidden on mobile, full on md+
            ═══════════════════════════════════════ */}
            <aside className={`
                hidden md:flex flex-col relative z-20 transition-all duration-300
                ${sidebarCollapsed ? 'w-[72px]' : 'w-72'}
                bg-slate-900/40 backdrop-blur-2xl border-e border-white/5
            `}>
                {/* Logo */}
                <div className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-[0_0_20px_rgba(16,185,129,0.4)]">A</div>
                    {!sidebarCollapsed && (
                        <div className="min-w-0">
                            <h1 className="text-white font-extrabold text-sm tracking-wide truncate">{isAr ? 'أربا للتسعير' : 'Arba Pricing'}</h1>
                            <span className="text-emerald-400 text-[10px] font-semibold tracking-wider uppercase">{isAr ? 'مساحة الفريق' : 'Team Workspace'}</span>
                        </div>
                    )}
                </div>

                {/* Zone badge */}
                {!sidebarCollapsed && (
                    <div className="mx-3 mb-2 px-3 py-1 rounded-lg bg-teal-500/10 border border-teal-500/20 text-center">
                        <span className="text-teal-400 text-[9px] font-bold uppercase tracking-wider">ZONE A</span>
                    </div>
                )}

                {/* Nav */}
                <nav className="flex-1 px-2 space-y-0.5 mt-1 overflow-y-auto [&::-webkit-scrollbar]:hidden">
                    {NAV_ITEMS.map(item => (
                        <React.Fragment key={item.id}>
                            {item.divider && <div className="my-3 mx-2 border-t border-white/5" />}
                            <button
                                onClick={() => setSection(item.id)}
                                title={sidebarCollapsed ? item.label[language] : undefined}
                                className={`group relative w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${section === item.id ? 'text-white bg-white/5' : 'text-slate-400 hover:text-white hover:bg-white/[0.02]'
                                    } ${sidebarCollapsed ? 'justify-center' : ''}`}
                            >
                                {section === item.id && <div className={`absolute ${isAr ? 'right-0' : 'left-0'} top-0 bottom-0 w-0.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]`} />}
                                <span className={`text-lg flex-shrink-0 transition-transform ${section === item.id ? 'scale-110' : 'group-hover:scale-105'}`}>{item.icon}</span>
                                {!sidebarCollapsed && <span className="truncate">{item.label[language]}</span>}
                            </button>
                        </React.Fragment>
                    ))}
                </nav>

                {/* Open Pricer button */}
                <div className="px-2 mb-2">
                    <button onClick={() => onOpenPricing()}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
                    >
                        <span className="text-base">🧮</span>
                        {!sidebarCollapsed && <span>{isAr ? 'فتح المُسعّر' : 'Open Pricer'}</span>}
                    </button>
                </div>

                <div className="px-3"><div className="border-t border-slate-700/50" /></div>

                {/* Bottom user + collapse */}
                <div className="p-3 space-y-2 mt-auto bg-slate-900/50 border-t border-white/5">
                    <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="w-full flex items-center justify-center gap-2 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 hover:bg-white/5 transition-all">
                        <span>{sidebarCollapsed ? (isAr ? '→' : '←') : (isAr ? '←' : '→')}</span>
                        {!sidebarCollapsed && <span>{isAr ? 'تصغير' : 'Collapse'}</span>}
                    </button>

                    <div className={`flex items-center gap-2 p-2 rounded-xl bg-white/5 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-slate-700 to-slate-800 border border-slate-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        {!sidebarCollapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="text-white text-xs font-bold truncate">{displayName}</p>
                                <p className="text-emerald-400/80 text-[10px] font-medium truncate uppercase">
                                    {role === 'admin' ? (isAr ? 'مدير' : 'Admin') : (isAr ? 'مهندس' : 'QS')}
                                </p>
                            </div>
                        )}
                    </div>

                    <button onClick={onLogout}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium text-red-400/80 hover:text-white hover:bg-red-500/20 border border-transparent transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}>
                        <span>🚪</span>
                        {!sidebarCollapsed && <span>{isAr ? 'خروج' : 'Logout'}</span>}
                    </button>
                </div>
            </aside>

            {/* ═══════════════════════════════════════
                MOBILE DRAWER OVERLAY
            ═══════════════════════════════════════ */}
            {mobileDrawerOpen && (
                <div className="md:hidden fixed inset-0 z-50 flex" dir={isAr ? 'rtl' : 'ltr'}>
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileDrawerOpen(false)} />

                    {/* Drawer */}
                    <div className={`relative z-10 w-72 max-w-[80vw] bg-slate-900 border-e border-white/10 flex flex-col h-full shadow-2xl`}>
                        <div className="p-5 flex items-center justify-between border-b border-white/5">
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-emerald-400 to-teal-600 flex items-center justify-center text-white font-black text-lg">A</div>
                                <div>
                                    <p className="text-white font-bold text-sm">{isAr ? 'أربا للتسعير' : 'Arba Pricing'}</p>
                                    <p className="text-teal-400 text-[10px] uppercase font-bold tracking-wider">Zone A</p>
                                </div>
                            </div>
                            <button onClick={() => setMobileDrawerOpen(false)} className="p-2 rounded-xl text-slate-500 hover:text-white hover:bg-slate-800 transition-colors text-xl">✕</button>
                        </div>

                        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                            {NAV_ITEMS.map(item => (
                                <React.Fragment key={item.id}>
                                    {item.divider && <div className="my-3 border-t border-white/5" />}
                                    <button
                                        onClick={() => { setSection(item.id); setMobileDrawerOpen(false); }}
                                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${section === item.id ? 'text-white bg-white/10' : 'text-slate-400 hover:text-white hover:bg-white/5'
                                            }`}
                                    >
                                        <span className="text-xl">{item.icon}</span>
                                        <span>{item.label[language]}</span>
                                        {section === item.id && <div className="ms-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                                    </button>
                                </React.Fragment>
                            ))}
                        </nav>

                        <div className="p-3 border-t border-white/5 space-y-2">
                            <button onClick={() => { onOpenPricing(); setMobileDrawerOpen(false); }}
                                className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <span className="text-xl">🧮</span>
                                <span>{isAr ? 'فتح المُسعّر' : 'Open Pricer'}</span>
                            </button>

                            <div className="flex items-center gap-3 px-4 py-2">
                                <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-white text-xs font-bold">
                                    {displayName.charAt(0).toUpperCase()}
                                </div>
                                <div className="min-w-0 flex-1">
                                    <p className="text-white text-xs font-bold truncate">{displayName}</p>
                                    <p className="text-emerald-400/70 text-[10px] uppercase">{role === 'admin' ? 'Admin' : 'QS'}</p>
                                </div>
                                <button onClick={onLogout} className="text-red-400 text-xs font-medium hover:text-red-300 transition-colors">
                                    {isAr ? 'خروج' : 'Logout'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* ═══════════════════════════════════════
                MAIN CONTENT
            ═══════════════════════════════════════ */}
            <main className="flex-1 overflow-auto relative z-10 flex flex-col [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">

                {/* Header */}
                <header className="sticky top-0 z-30 px-4 md:px-6 py-3 md:py-4 bg-slate-900/60 backdrop-blur-2xl border-b border-white/5 flex-shrink-0">
                    <div className="flex items-center justify-between gap-3">
                        {/* Mobile: hamburger */}
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setMobileDrawerOpen(true)}
                                className="md:hidden p-2 rounded-xl bg-slate-800/60 text-slate-400 hover:text-white transition-colors"
                            >
                                ☰
                            </button>
                            <div>
                                <h2 className="text-base md:text-xl font-extrabold text-white tracking-tight">
                                    {NAV_ITEMS.find(n => n.id === section)?.icon} {NAV_ITEMS.find(n => n.id === section)?.label[language]}
                                </h2>
                                <p className="hidden sm:flex text-xs text-slate-400 font-medium items-center gap-1.5 mt-0.5">
                                    <span className="text-emerald-500/70">🗓</span>
                                    {new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="hidden sm:inline px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border bg-teal-500/10 text-teal-400 border-teal-500/30">ZONE A</span>
                            <span className={`hidden sm:inline px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${role === 'admin' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'}`}>
                                {role === 'admin' ? 'ADMIN' : 'QS'}
                            </span>
                            <button onClick={loadData} className="p-2 rounded-lg bg-slate-800/60 text-slate-400 hover:text-white transition-all text-sm" title={isAr ? 'تحديث' : 'Refresh'}>🔄</button>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 p-4 md:p-6 pb-24 md:pb-6">
                    {renderContent()}
                </div>

                {/* ═══════════════════════════════════════
                    MOBILE BOTTOM NAV — only on mobile
                ═══════════════════════════════════════ */}
                <nav className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-900/95 backdrop-blur-2xl border-t border-white/10 flex items-center justify-around px-2 py-2 pb-[env(safe-area-inset-bottom)]">
                    {NAV_ITEMS.filter(i => !i.divider).slice(0, 5).map(item => (
                        <button
                            key={item.id}
                            onClick={() => setSection(item.id)}
                            className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl flex-1 transition-all ${section === item.id ? 'text-white bg-white/5' : 'text-slate-500'
                                }`}
                        >
                            <span className={`text-xl transition-transform ${section === item.id ? 'scale-110' : ''}`}>{item.icon}</span>
                            <span className="text-[9px] font-semibold truncate max-w-[60px]">{item.label[language]}</span>
                        </button>
                    ))}
                    {/* Open Pricer on mobile */}
                    <button
                        onClick={() => onOpenPricing()}
                        className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl flex-1 text-emerald-400"
                    >
                        <span className="text-xl">🧮</span>
                        <span className="text-[9px] font-semibold">{isAr ? 'المُسعّر' : 'Pricer'}</span>
                    </button>
                </nav>
            </main>

            {/* Project Setup Modal */}
            {showSetupModal && (
                <ProjectSetupModal
                    language={language}
                    onConfirm={handleSetupConfirm}
                    onClose={handleSetupClose}
                />
            )}
        </div>
    );
};

export default EmployeeWorkspace;
