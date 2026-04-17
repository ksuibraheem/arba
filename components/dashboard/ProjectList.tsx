import { Language } from '../../types';
/**
 * Project List Component — قائمة المشاريع
 * Grid/Table view with status filtering and actions
 */

import React, { useState } from 'react';
import { ArbaProject, ProjectStatus } from '../../services/projectTypes';

interface ProjectListProps {
    projects: ArbaProject[];
    language: Language;
    loading?: boolean;
    onOpenProject: (project: ArbaProject) => void;
    onCreateProject: () => void;
    onDeleteProject: (id: string) => void;
    onStatusChange: (id: string, status: ProjectStatus) => void;
}

const STATUS_CONFIG: Record<ProjectStatus, { label: { ar: string; en: string }; color: string; bg: string }> = {
    draft: { label: { ar: 'مسودة', en: 'Draft' }, color: 'text-slate-400', bg: 'bg-slate-400/10 border-slate-400/30' },
    active: { label: { ar: 'نشط', en: 'Active' }, color: 'text-emerald-400', bg: 'bg-emerald-400/10 border-emerald-400/30' },
    submitted: { label: { ar: 'مُقدم', en: 'Submitted' }, color: 'text-blue-400', bg: 'bg-blue-400/10 border-blue-400/30' },
    approved: { label: { ar: 'مُعتمد', en: 'Approved' }, color: 'text-amber-400', bg: 'bg-amber-400/10 border-amber-400/30' },
    archived: { label: { ar: 'مؤرشف', en: 'Archived' }, color: 'text-zinc-500', bg: 'bg-zinc-500/10 border-zinc-500/30' },
};

const ProjectList: React.FC<ProjectListProps> = ({
    projects, language, loading, onOpenProject, onCreateProject, onDeleteProject, onStatusChange
}) => {
    const isAr = language === 'ar';
    const [filter, setFilter] = useState<ProjectStatus | 'all'>('all');
    const [searchTerm, setSearchTerm] = useState('');

    const filtered = projects.filter(p => {
        if (filter !== 'all' && p.status !== filter) return false;
        if (searchTerm && !p.name.toLowerCase().includes(searchTerm.toLowerCase())) return false;
        return true;
    });

    const formatDate = (d: any) => {
        if (!d) return '—';
        const date = d.toDate ? d.toDate() : new Date(d);
        return date.toLocaleDateString(isAr ? 'ar-SA' : 'en-GB');
    };

    const formatValue = (v: number) => {
        if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
        if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
        return v.toFixed(0);
    };

    return (
        <div className="space-y-6">
            {/* Header Area */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                    <span className="text-emerald-500">📁</span>
                    {isAr ? 'المشاريع' : 'Projects'}
                </h2>
                <button
                    onClick={onCreateProject}
                    className="group relative px-5 py-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-sm overflow-hidden transition-all hover:bg-emerald-500 hover:text-white hover:border-emerald-500 shadow-sm"
                >
                    <span className="relative z-10 flex items-center gap-2">
                        <span className="text-lg">+</span>
                        {isAr ? 'مشروع جديد' : 'New Project'}
                    </span>
                </button>
            </div>

            {/* Unified Control Bar */}
            <div className="flex items-center gap-4 flex-wrap bg-slate-900/40 p-1.5 rounded-xl border border-white/[0.05] backdrop-blur-md shadow-sm">
                {/* Search */}
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <input
                        type="text"
                        placeholder={isAr ? 'ابحث في المشاريع...' : 'Search projects...'}
                        value={searchTerm}
                        onChange={e => setSearchTerm(e.target.value)}
                        className="w-full px-4 py-1.5 bg-transparent text-white text-sm placeholder-slate-500 focus:outline-none focus:ring-0 transition-all border-none"
                        dir={isAr ? 'rtl' : 'ltr'}
                    />
                </div>

                {/* Vertical Divider */}
                <div className="hidden sm:block w-px h-6 bg-white/[0.05]" />

                {/* Status filters */}
                <div className="flex gap-1 overflow-x-auto scrollbar-hide py-1">
                    {(['all', 'draft', 'active', 'submitted', 'approved', 'archived'] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-4 py-1.5 rounded-md text-xs font-semibold tracking-wide whitespace-nowrap transition-all ${
                                filter === s
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 shadow-sm'
                                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50 hover:border-white/5 border border-transparent'
                            }`}
                        >
                            {s === 'all'
                                ? (isAr ? 'الكل' : 'All')
                                : STATUS_CONFIG[s].label[language]
                            }
                        </button>
                    ))}
                </div>
            </div>

            {/* Project Cards Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="rounded-2xl bg-slate-800/40 border border-slate-700 p-5 animate-pulse h-48" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 px-4 bg-slate-900/20 border border-dashed border-white/5 rounded-2xl mx-auto w-full transition-all">
                    <div className="w-16 h-16 mb-4 rounded-full bg-slate-800/50 border border-white/5 flex items-center justify-center shadow-inner">
                        <span className="text-2xl opacity-80">📄</span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-1">{isAr ? 'لا توجد مشاريع' : 'No projects found'}</h3>
                    <p className="text-slate-400 text-xs mb-6 max-w-sm text-center">
                        {isAr ? 'ابدأ رحلتك بإنشاء مشروع جديد لتسعيره وتنظيم مستنداته' : 'Start your journey by creating a new project to price and organize documents.'}
                    </p>
                    <button onClick={onCreateProject} className="px-5 py-2 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 text-sm font-semibold transition-all">
                        {isAr ? '+ المشروع الأول' : '+ First project'}
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(project => {
                        const statusConf = STATUS_CONFIG[project.status];
                        return (
                            <div
                                key={project.id}
                                onClick={() => onOpenProject(project)}
                                className="group relative rounded-2xl bg-slate-800/40 border border-white/5 p-6 cursor-pointer hover:-translate-y-1 hover:border-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/10 transition-all backdrop-blur-sm overflow-hidden"
                            >
                                {/* Decorative Gradient Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-b from-white/[0.02] to-transparent pointer-events-none" />

                                {/* Status badge */}
                                <div className={`absolute top-5 ${isAr ? 'left-5' : 'right-5'}`}>
                                    <span className={`px-2.5 py-1 rounded-md text-[10px] font-extrabold tracking-wider uppercase border ${statusConf.bg} ${statusConf.color}`}>
                                        {statusConf.label[language]}
                                    </span>
                                </div>

                                {/* Project name */}
                                <h3 className="text-white font-bold text-lg mb-1 pr-24 truncate">
                                    {project.name}
                                </h3>

                                {/* Type */}
                                <p className="text-slate-400 text-xs mb-6 font-medium">
                                    <span>{project.projectType}</span>
                                    <span className="mx-2 text-slate-600">•</span>
                                    <span>{project.location || (isAr ? 'بدون موقع' : 'No location')}</span>
                                </p>

                                {/* Info row */}
                                <div className="flex items-end justify-between text-sm bg-slate-900/40 p-3 rounded-xl border border-white/5">
                                    <div>
                                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1 block">
                                            {isAr ? 'القيمة التقديرية' : 'Estimated Value'}
                                        </span>
                                        <p className="text-emerald-400 font-extrabold text-lg leading-none">
                                            {formatValue(project.estimatedValue)} <span className="text-[10px] text-emerald-400/60">{isAr ? 'ر.س' : 'SAR'}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-slate-500 text-[10px] uppercase font-bold tracking-wider mb-1 block">
                                            {isAr ? 'آخر تحديث' : 'Last Updated'}
                                        </span>
                                        <p className="text-slate-300 text-xs font-medium leading-none">
                                            {formatDate(project.updatedAt)}
                                        </p>
                                    </div>
                                </div>

                                {/* Quotes count */}
                                {project.quoteCount > 0 && (
                                    <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400 font-medium">
                                        <div className="flex items-center gap-1.5">
                                            <span className="text-emerald-500">📄</span>
                                            <span>{project.quoteCount} {isAr ? 'عروض أسعار مرتبطة' : 'Linked Quotes'}</span>
                                        </div>
                                    </div>
                                )}

                                {/* Hover actions */}
                                <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); onDeleteProject(project.id); }}
                                        className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs"
                                        title={isAr ? 'حذف' : 'Delete'}
                                    >
                                        🗑
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default ProjectList;
