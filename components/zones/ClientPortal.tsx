/**
 * Client Portal — بوابة العميل (Zone B)
 * 
 * A clean, minimal interface for Contractors & Project Owners.
 * Shows ONLY: Project Gallery, Clean Price Summaries, PDF Export.
 * 
 * SECURITY: NO raw uploads, NO sanitization logs, NO formula breakdowns,
 *           NO competitor names, NO internal cost components.
 *           Only finalized, Arba-branded outputs.
 */

import React, { useState, useEffect, useCallback } from 'react';
import { useRole } from '../../contexts/RoleContext';
import {
    ArbaProject, ArbaQuote, PERMISSIONS
} from '../../services/projectTypes';
import {
    ClientProjectView, ClientQuoteView,
    sanitizeProjectsForClient, sanitizeQuoteForClient
} from '../../services/clientDataFilter';
import * as projectService from '../../services/projectService';

// =================== TYPES ===================

type PortalSection = 'gallery' | 'summary' | 'documents';

interface ClientPortalProps {
    language: 'ar' | 'en';
    onLogout: () => void;
}

// =================== COMPONENT ===================

const ClientPortal: React.FC<ClientPortalProps> = ({ language, onLogout }) => {
    const { uid, displayName, email } = useRole();
    const isAr = language === 'ar';

    // State
    const [section, setSection] = useState<PortalSection>('gallery');
    const [loading, setLoading] = useState(true);
    const [projects, setProjects] = useState<ClientProjectView[]>([]);
    const [selectedProject, setSelectedProject] = useState<ClientProjectView | null>(null);

    // =================== DATA LOADING ===================

    const loadProjects = useCallback(async () => {
        setLoading(true);
        try {
            // Load projects assigned to this client
            const rawProjects = await projectService.getUserProjects(uid, 'client');
            // CRITICAL: Sanitize before rendering — strip all internal data
            const safe = sanitizeProjectsForClient(rawProjects);
            setProjects(safe);
        } catch (err) {
            console.error('Portal load error:', err);
        } finally {
            setLoading(false);
        }
    }, [uid]);

    useEffect(() => { loadProjects(); }, [loadProjects]);

    // =================== STATUS HELPERS ===================

    const getStatusConfig = (status: string) => {
        switch (status) {
            case 'submitted': return { label: isAr ? 'مُقدَّم' : 'Submitted', color: 'bg-blue-500/10 text-blue-400 border-blue-500/20' };
            case 'approved': return { label: isAr ? 'مُعتمد' : 'Approved', color: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' };
            case 'archived': return { label: isAr ? 'مؤرشف' : 'Archived', color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
            default: return { label: status, color: 'bg-slate-500/10 text-slate-400 border-slate-500/20' };
        }
    };

    const formatValue = (v: number) => new Intl.NumberFormat(isAr ? 'ar-SA' : 'en-SA', {
        style: 'currency', currency: 'SAR', maximumFractionDigits: 0,
    }).format(v);

    // =================== RENDER SECTIONS ===================

    const renderGallery = () => (
        <div className="space-y-6">
            {/* Summary cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 flex items-center justify-center">
                            <span className="text-xl">📋</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-white">{projects.length}</p>
                            <p className="text-slate-500 text-xs">{isAr ? 'المشاريع' : 'Projects'}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/20 flex items-center justify-center">
                            <span className="text-xl">✅</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-emerald-400">
                                {projects.filter(p => p.status === 'approved').length}
                            </p>
                            <p className="text-slate-500 text-xs">{isAr ? 'معتمدة' : 'Approved'}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-5">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 flex items-center justify-center">
                            <span className="text-xl">💰</span>
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-amber-400">
                                {formatValue(projects.reduce((sum, p) => sum + (p.estimatedValue || 0), 0))}
                            </p>
                            <p className="text-slate-500 text-xs">{isAr ? 'القيمة الإجمالية' : 'Total Value'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Project cards */}
            <h3 className="text-lg font-bold text-white">{isAr ? '🖼️ معرض المشاريع' : '🖼️ Project Gallery'}</h3>

            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="bg-slate-800/50 rounded-2xl border border-slate-700/50 p-6 animate-pulse">
                            <div className="h-4 bg-slate-700 rounded w-2/3 mb-3" />
                            <div className="h-3 bg-slate-700/50 rounded w-1/3 mb-6" />
                            <div className="h-8 bg-slate-700/30 rounded w-1/2" />
                        </div>
                    ))}
                </div>
            ) : projects.length === 0 ? (
                <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-12 text-center">
                    <span className="text-5xl block mb-4">📂</span>
                    <h4 className="text-lg font-bold text-white mb-2">
                        {isAr ? 'لا توجد مشاريع' : 'No Projects'}
                    </h4>
                    <p className="text-slate-400 text-sm">
                        {isAr ? 'ستظهر المشاريع هنا بعد تقديمها من فريق أربا' : 'Projects will appear here after submission by the Arba team'}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {projects.map(project => {
                        const statusConfig = getStatusConfig(project.status);
                        return (
                            <div
                                key={project.id}
                                onClick={() => { setSelectedProject(project); setSection('summary'); }}
                                className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6 hover:border-indigo-500/30 hover:bg-slate-800/70 transition-all cursor-pointer group"
                            >
                                {/* Project header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="min-w-0 flex-1">
                                        <h4 className="text-white font-bold truncate group-hover:text-indigo-300 transition-colors">
                                            {project.name}
                                        </h4>
                                        <p className="text-slate-500 text-xs mt-0.5 capitalize">{project.projectType}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold border ${statusConfig.color}`}>
                                        {statusConfig.label}
                                    </span>
                                </div>

                                {/* Value */}
                                <div className="bg-slate-900/40 rounded-xl p-3 mb-4">
                                    <p className="text-slate-400 text-[10px] mb-1">
                                        {isAr ? 'القيمة التقديرية' : 'Estimated Value'}
                                    </p>
                                    <p className="text-xl font-bold text-white">
                                        {formatValue(project.estimatedValue || 0)}
                                    </p>
                                </div>

                                {/* Footer */}
                                <div className="flex items-center justify-between">
                                    <span className="text-slate-500 text-xs">
                                        {project.quoteCount || 0} {isAr ? 'عروض' : 'quotes'}
                                    </span>
                                    <span className="text-indigo-400 text-xs opacity-0 group-hover:opacity-100 transition-opacity">
                                        {isAr ? 'عرض التفاصيل →' : 'View Details →'}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );

    const renderSummary = () => (
        <div className="space-y-6">
            {/* Back button */}
            <button
                onClick={() => { setSelectedProject(null); setSection('gallery'); }}
                className="flex items-center gap-2 text-slate-400 hover:text-white text-sm transition-colors"
            >
                <span>{isAr ? '→' : '←'}</span>
                <span>{isAr ? 'العودة للمعرض' : 'Back to Gallery'}</span>
            </button>

            {!selectedProject ? (
                <div className="text-center py-12">
                    <p className="text-slate-400">{isAr ? 'اختر مشروعاً من المعرض' : 'Select a project from the gallery'}</p>
                </div>
            ) : (
                <>
                    {/* Project header */}
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-xl font-bold text-white">{selectedProject.name}</h3>
                            <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusConfig(selectedProject.status).color}`}>
                                {getStatusConfig(selectedProject.status).label}
                            </span>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <p className="text-slate-500 text-xs">{isAr ? 'نوع المشروع' : 'Project Type'}</p>
                                <p className="text-white text-sm font-medium capitalize">{selectedProject.projectType}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">{isAr ? 'الموقع' : 'Location'}</p>
                                <p className="text-white text-sm font-medium">{selectedProject.location || '-'}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">{isAr ? 'عروض الأسعار' : 'Quotes'}</p>
                                <p className="text-white text-sm font-medium">{selectedProject.quoteCount || 0}</p>
                            </div>
                            <div>
                                <p className="text-slate-500 text-xs">{isAr ? 'القيمة' : 'Value'}</p>
                                <p className="text-emerald-400 text-sm font-bold">{formatValue(selectedProject.estimatedValue || 0)}</p>
                            </div>
                        </div>
                    </div>

                    {/* Clean Price Summary — FINAL RATES ONLY */}
                    <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                        <h4 className="text-lg font-bold text-white mb-4">
                            {isAr ? '💰 ملخص الأسعار' : '💰 Price Summary'}
                        </h4>
                        <p className="text-slate-400 text-xs mb-4">
                            {isAr ? 'أسعار الوحدات النهائية — جميع التكاليف مُدرجة' : 'Final unit rates — all costs included'}
                        </p>

                        {/* Clean table headers — NO formula columns */}
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-slate-400 text-xs border-b border-slate-700">
                                        <th className="py-3 text-right w-12">#</th>
                                        <th className="py-3 text-right">{isAr ? 'الوصف' : 'Description'}</th>
                                        <th className="py-3 text-center">{isAr ? 'الوحدة' : 'Unit'}</th>
                                        <th className="py-3 text-center">{isAr ? 'الكمية' : 'Qty'}</th>
                                        <th className="py-3 text-center">{isAr ? 'سعر الوحدة' : 'Unit Rate'}</th>
                                        <th className="py-3 text-center text-emerald-400">{isAr ? 'الإجمالي' : 'Total'}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* NOTE: Data is sanitized — no matCost, labCost, waste, etc. */}
                                    <tr>
                                        <td colSpan={6} className="py-8 text-center text-slate-500">
                                            {isAr ? 'سيتم عرض البيانات عند ربط عرض سعر بالمشروع' : 'Data will appear when a quote is linked to the project'}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* PDF Download */}
                    {selectedProject.latestQuoteId && (
                        <div className="bg-gradient-to-r from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 rounded-2xl p-6 text-center">
                            <span className="text-4xl block mb-3">📄</span>
                            <h4 className="text-lg font-bold text-white mb-2">
                                {isAr ? 'عرض السعر الاحترافي' : 'Professional Price Quote'}
                            </h4>
                            <p className="text-slate-400 text-sm mb-4">
                                {isAr ? 'تحميل PDF بعلامة أربا المائية' : 'Download Arba-watermarked PDF'}
                            </p>
                            <button className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-bold hover:shadow-lg hover:shadow-indigo-500/20 transition-all">
                                {isAr ? '📥 تحميل عرض السعر' : '📥 Download Quote'}
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );

    const renderDocuments = () => (
        <div className="space-y-6">
            <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6">
                <h3 className="text-lg font-bold text-white mb-4">
                    {isAr ? '📄 المستندات' : '📄 Documents'}
                </h3>
                <p className="text-slate-400 text-sm mb-6">
                    {isAr ? 'جميع عروض الأسعار المُعتمدة المتاحة للتحميل' : 'All approved quotes available for download'}
                </p>

                {projects.filter(p => p.latestQuoteId).length === 0 ? (
                    <div className="text-center py-8">
                        <span className="text-4xl block mb-3">📭</span>
                        <p className="text-slate-500 text-sm">
                            {isAr ? 'لا توجد مستندات متاحة بعد' : 'No documents available yet'}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {projects.filter(p => p.latestQuoteId).map(project => (
                            <div key={project.id} className="flex items-center justify-between bg-slate-900/40 rounded-xl p-4 hover:bg-slate-900/60 transition-all">
                                <div className="flex items-center gap-3">
                                    <span className="text-2xl">📄</span>
                                    <div>
                                        <p className="text-white font-medium text-sm">{project.name}</p>
                                        <p className="text-slate-500 text-xs">{project.quoteCount} {isAr ? 'نسخة' : 'versions'}</p>
                                    </div>
                                </div>
                                <button className="px-4 py-2 rounded-lg bg-indigo-500/10 text-indigo-400 text-xs font-medium border border-indigo-500/20 hover:border-indigo-500/40 transition-all">
                                    {isAr ? '📥 تحميل' : '📥 Download'}
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );

    // =================== LAYOUT ===================

    const navItems: { id: PortalSection; icon: string; label: string }[] = [
        { id: 'gallery', icon: '🖼️', label: isAr ? 'معرض المشاريع' : 'Project Gallery' },
        { id: 'summary', icon: '💰', label: isAr ? 'ملخص الأسعار' : 'Price Summary' },
        { id: 'documents', icon: '📄', label: isAr ? 'المستندات' : 'Documents' },
    ];

    return (
        <div className="flex h-screen bg-gradient-to-br from-slate-950 via-indigo-950/20 to-slate-950 overflow-hidden" dir={isAr ? 'rtl' : 'ltr'}>
            {/* ═══════ SIDEBAR ═══════ */}
            <aside className={`flex flex-col w-64 ${isAr ? 'border-l' : 'border-r'} border-slate-700/50 bg-slate-900/80 backdrop-blur-xl`}>
                {/* Logo */}
                <div className="p-4 flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-black text-lg flex-shrink-0 shadow-lg shadow-indigo-500/20">
                        A
                    </div>
                    <div className="min-w-0">
                        <h1 className="text-white font-bold text-sm truncate">{isAr ? 'أربا للتسعير' : 'Arba Pricing'}</h1>
                        <span className="text-indigo-400 text-[10px] font-medium">
                            {isAr ? 'بوابة العميل' : 'Client Portal'}
                        </span>
                    </div>
                </div>

                {/* Zone B badge */}
                <div className="mx-3 mb-2 px-3 py-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-center">
                    <span className="text-indigo-400 text-[10px] font-bold uppercase tracking-wider">ZONE B — {isAr ? 'عرض آمن' : 'SECURE VIEW'}</span>
                </div>

                {/* Nav */}
                <nav className="flex-1 px-2 space-y-1 mt-2">
                    {navItems.map(item => (
                        <button
                            key={item.id}
                            onClick={() => setSection(item.id)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${section === item.id
                                    ? 'bg-indigo-500/15 text-indigo-400 shadow-sm'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                                }`}
                        >
                            <span className="text-lg flex-shrink-0">{item.icon}</span>
                            <span>{item.label}</span>
                        </button>
                    ))}
                </nav>

                {/* Security notice */}
                <div className="mx-3 mb-3 px-3 py-2 rounded-lg bg-slate-800/60 border border-slate-700/40">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px]">🔒</span>
                        <span className="text-slate-500 text-[10px] font-bold uppercase tracking-wider">
                            {isAr ? 'بيانات محمية' : 'Secured Data'}
                        </span>
                    </div>
                    <p className="text-slate-600 text-[9px]">
                        {isAr ? 'يتم عرض البيانات المُعتمدة فقط' : 'Only approved data is displayed'}
                    </p>
                </div>

                <div className="px-4"><div className="border-t border-slate-700/50" /></div>

                {/* User */}
                <div className="p-2 space-y-1">
                    <div className="flex items-center gap-2 px-3 py-2">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {displayName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-white text-xs font-medium truncate">{displayName}</p>
                            <p className="text-slate-500 text-[10px] truncate">{isAr ? 'عميل' : 'Client'}</p>
                        </div>
                    </div>
                    <button onClick={onLogout}
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 transition-all">
                        <span className="text-base">🚪</span>
                        <span>{isAr ? 'تسجيل خروج' : 'Logout'}</span>
                    </button>
                </div>
            </aside>

            {/* ═══════ MAIN CONTENT ═══════ */}
            <main className="flex-1 overflow-auto">
                <header className="sticky top-0 z-10 px-6 py-4 bg-slate-950/80 backdrop-blur-xl border-b border-slate-700/30">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-lg font-bold text-white">
                                {navItems.find(n => n.id === section)?.label}
                            </h2>
                            <p className="text-xs text-slate-500">
                                {new Date().toLocaleDateString(isAr ? 'ar-SA' : 'en-GB', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase border bg-indigo-500/10 text-indigo-400 border-indigo-500/30">
                                ZONE B
                            </span>
                            <button onClick={loadProjects} className="p-2 rounded-lg bg-slate-800/60 text-slate-400 hover:text-white transition-all text-sm" title={isAr ? 'تحديث' : 'Refresh'}>
                                🔄
                            </button>
                        </div>
                    </div>
                </header>

                <div className="p-6">
                    {section === 'gallery' && renderGallery()}
                    {section === 'summary' && renderSummary()}
                    {section === 'documents' && renderDocuments()}
                </div>
            </main>
        </div>
    );
};

export default ClientPortal;
