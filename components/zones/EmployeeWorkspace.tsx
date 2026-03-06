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
    onOpenPricing: (project?: ArbaProject) => void;
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
        } catch (err) {
            console.error('Workspace load error:', err);
        } finally {
            setLoading(false);
        }
    }, [uid, role]);

    useEffect(() => { loadData(); }, [loadData]);

    // =================== HANDLERS ===================

    const handleCreateProject = async () => {
        try {
            const id = await projectService.createProject({
                ownerId: uid, assignedTo: [uid],
                name: isAr ? 'مشروع جديد' : 'New Project',
                projectType: 'villa', status: 'draft',
            });
            await loadData();
            const project = await projectService.getProject(id);
            if (project) onOpenPricing(project);
        } catch (err) { console.error('Create project error:', err); }
    };

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
                    <div className="mt-8 grid grid-cols-4 gap-3 max-w-xl mx-auto">
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
                    onOpenProject={(p) => onOpenPricing(p)} onCreateProject={handleCreateProject}
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

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
            {/* ═══════ SIDEBAR ═══════ */}
            <aside className={`flex flex-col transition-all duration-300 ${sidebarCollapsed ? 'w-16' : 'w-64'} ${isAr ? 'border-l' : 'border-r'} border-slate-700/50 bg-slate-900/80 backdrop-blur-xl`}>
                {/* Logo */}
                <div className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-lg shadow-emerald-500/20">
                        A
                    </div>
                    {!sidebarCollapsed && (
                        <div className="min-w-0">
                            <h1 className="text-white font-bold text-sm truncate">{isAr ? 'أربا للتسعير' : 'Arba Pricing'}</h1>
                            <span className="text-emerald-400 text-[10px] font-medium">
                                {isAr ? 'مساحة عمل الفريق' : 'Employee Workspace'}
                            </span>
                        </div>
                    )}
                </div>

                {/* Zone A badge */}
                {!sidebarCollapsed && (
                    <div className="mx-3 mb-2 px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 text-center">
                        <span className="text-teal-400 text-[10px] font-bold uppercase tracking-wider">ZONE A</span>
                    </div>
                )}

                {/* Nav */}
                <nav className="flex-1 px-2 space-y-0.5 mt-1 overflow-y-auto">
                    {NAV_ITEMS.map(item => (
                        <React.Fragment key={item.id}>
                            {item.divider && <div className="my-2 mx-3 border-t border-slate-700/40" />}
                            <button
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
                        </React.Fragment>
                    ))}
                </nav>

                {/* Open Pricing */}
                <div className="px-2 mb-2">
                    <button
                        onClick={() => onOpenPricing()}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium bg-gradient-to-r from-emerald-500/10 to-teal-500/10 text-emerald-400 border border-emerald-500/20 hover:border-emerald-500/40 transition-all ${sidebarCollapsed ? 'justify-center' : ''}`}
                    >
                        <span className="text-lg">🧮</span>
                        {!sidebarCollapsed && <span>{isAr ? 'فتح المُسعّر' : 'Open Calculator'}</span>}
                    </button>
                </div>

                <div className="px-4"><div className="border-t border-slate-700/50" /></div>

                {/* Bottom */}
                <div className="p-2 space-y-1">
                    <button onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-slate-500 hover:text-slate-300 transition-all">
                        <span className="text-base">{sidebarCollapsed ? (isAr ? '←' : '→') : (isAr ? '→' : '←')}</span>
                        {!sidebarCollapsed && <span>{isAr ? 'تصغير' : 'Collapse'}</span>}
                    </button>

                    <div className={`flex items-center gap-2 px-3 py-2 ${sidebarCollapsed ? 'justify-center' : ''}`}>
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        {!sidebarCollapsed && (
                            <div className="min-w-0 flex-1">
                                <p className="text-white text-xs font-medium truncate">{displayName}</p>
                                <p className="text-slate-500 text-[10px] truncate">
                                    {role === 'admin' ? (isAr ? 'مدير' : 'Admin') : (isAr ? 'مهندس كميات' : 'QS Engineer')}
                                </p>
                            </div>
                        )}
                    </div>

                    <button onClick={onLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <span className="text-base">🚪</span>
                        {!sidebarCollapsed && <span>{isAr ? 'تسجيل خروج' : 'Logout'}</span>}
                    </button>
                </div>
            </aside>

            {/* ═══════ MAIN CONTENT ═══════ */}
            <main className="flex-1 overflow-auto">
                <header className="sticky top-0 z-10 px-6 py-4 bg-slate-950/80 backdrop-blur-xl border-b border-slate-700/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                {NAV_ITEMS.find(n => n.id === section)?.label[language]}
                            </h2>
                            <p className="text-xs text-slate-500">
                                {new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase border bg-teal-500/10 text-teal-400 border-teal-500/30">
                                ZONE A
                            </span>
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase border ${role === 'admin' ? 'bg-amber-500/10 text-amber-400 border-amber-500/30' : 'bg-blue-500/10 text-blue-400 border-blue-500/30'
                                }`}>
                                {role === 'admin' ? 'ADMIN' : 'QS'}
                            </span>
                            <button onClick={loadData} className="p-2 rounded-lg bg-slate-800/60 text-slate-400 hover:text-white transition-all text-sm" title={isAr ? 'تحديث' : 'Refresh'}>
                                🔄
                            </button>
                        </div>
                    </div>
                </header>

                <div className="p-6">{renderContent()}</div>
            </main>
        </div>
    );
};

export default EmployeeWorkspace;
