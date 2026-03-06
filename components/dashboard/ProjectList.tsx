/**
 * Project List Component — قائمة المشاريع
 * Grid/Table view with status filtering and actions
 */

import React, { useState } from 'react';
import { ArbaProject, ProjectStatus } from '../../services/projectTypes';

interface ProjectListProps {
    projects: ArbaProject[];
    language: 'ar' | 'en';
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
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-xl font-bold text-white">
                    {isAr ? '📁 المشاريع' : '📁 Projects'}
                </h2>
                <button
                    onClick={onCreateProject}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-medium text-sm hover:shadow-lg hover:shadow-emerald-500/20 transition-all"
                >
                    {isAr ? '+ مشروع جديد' : '+ New Project'}
                </button>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                {/* Search */}
                <input
                    type="text"
                    placeholder={isAr ? 'بحث...' : 'Search...'}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-48"
                    dir={isAr ? 'rtl' : 'ltr'}
                />

                {/* Status filters */}
                <div className="flex gap-1.5">
                    {(['all', 'draft', 'active', 'submitted', 'approved', 'archived'] as const).map(s => (
                        <button
                            key={s}
                            onClick={() => setFilter(s)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === s
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : 'bg-slate-800/40 text-slate-400 border border-slate-700 hover:border-slate-500'
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
                <div className="text-center py-16 text-slate-500">
                    <div className="text-5xl mb-4">📁</div>
                    <p className="text-lg">{isAr ? 'لا توجد مشاريع' : 'No projects found'}</p>
                    <button onClick={onCreateProject} className="mt-4 text-emerald-400 hover:underline text-sm">
                        {isAr ? 'أنشئ مشروعك الأول' : 'Create your first project'}
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
                                className="relative rounded-2xl bg-slate-800/50 border border-slate-700/60 p-5 cursor-pointer hover:border-emerald-500/40 hover:shadow-lg hover:shadow-emerald-500/5 transition-all group"
                            >
                                {/* Status badge */}
                                <div className={`absolute top-4 ${isAr ? 'left-4' : 'right-4'}`}>
                                    <span className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase border ${statusConf.bg} ${statusConf.color}`}>
                                        {statusConf.label[language]}
                                    </span>
                                </div>

                                {/* Project name */}
                                <h3 className="text-white font-bold text-base mb-2 pr-20 truncate">
                                    {project.name}
                                </h3>

                                {/* Type */}
                                <p className="text-slate-400 text-xs mb-4">
                                    {project.projectType} • {project.location || (isAr ? 'بدون موقع' : 'No location')}
                                </p>

                                {/* Info row */}
                                <div className="flex items-center justify-between text-sm">
                                    <div>
                                        <span className="text-slate-500 text-xs">{isAr ? 'القيمة' : 'Value'}</span>
                                        <p className="text-emerald-400 font-bold">
                                            {formatValue(project.estimatedValue)} <span className="text-[10px] text-slate-500">{isAr ? 'ر.س' : 'SAR'}</span>
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-slate-500 text-xs">{isAr ? 'التحديث' : 'Updated'}</span>
                                        <p className="text-slate-300 text-xs">{formatDate(project.updatedAt)}</p>
                                    </div>
                                </div>

                                {/* Quotes count */}
                                {project.quoteCount > 0 && (
                                    <div className="mt-3 pt-3 border-t border-slate-700/50 flex items-center gap-2 text-xs text-slate-500">
                                        <span>📄</span>
                                        <span>{project.quoteCount} {isAr ? 'عرض سعر' : 'quotes'}</span>
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
