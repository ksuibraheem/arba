/**
 * ProjectTeamManager — إدارة فريق المشروع
 * تحديد من يدخل على المشروع مع صلاحيات لكل عضو
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, Users, Trash2, CheckCircle, XCircle, Search, Shield, MessageCircle, Camera, FileText, ClipboardList, BarChart3, UserPlus, X, Copy, RefreshCw, LogIn, Clock } from 'lucide-react';
import { projectSupplierService, ProjectMember, ProjectRole, PROJECT_ROLES, ProjectMemberPermissions } from '../../services/projectSupplierService';
import { Language } from '../../types';

interface ProjectTeamManagerProps {
    language: Language;
    userId: string;
    projectId?: string;
    projectName?: string;
    onBack: () => void;
}

const ProjectTeamManager: React.FC<ProjectTeamManagerProps> = ({ language, userId, projectId = 'proj_1', projectName = 'فيلا الرياض — حي النرجس', onBack }) => {
    const [members, setMembers] = useState<ProjectMember[]>([]);
    const [showAdd, setShowAdd] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Add form
    const [newName, setNewName] = useState('');
    const [newPhone, setNewPhone] = useState('');
    const [newRole, setNewRole] = useState<ProjectRole>('site_engineer');

    const isRtl = language === 'ar';
    const t = (ar: string, en: string) => { const m: Record<string, string> = { ar, en, fr: en, zh: en }; return m[language] || en; };
    const langKey = (language === 'ar' ? 'ar' : 'en') as 'ar' | 'en';

    useEffect(() => { loadMembers(); }, [projectId]);

    const loadMembers = () => {
        projectSupplierService.initSampleData();
        setMembers(projectSupplierService.getProjectMembers(projectId));
    };

    const handleAdd = () => {
        if (!newName.trim()) return;
        projectSupplierService.addProjectMember({
            projectId, projectName,
            employeeId: `emp_${Date.now()}`,
            employeeName: newName, employeePhone: newPhone,
            role: newRole, addedBy: userId,
        });
        setNewName(''); setNewPhone(''); setNewRole('site_engineer');
        setShowAdd(false);
        loadMembers();
    };

    const handleRemove = (id: string) => {
        projectSupplierService.removeProjectMember(id);
        loadMembers();
    };

    const handleTogglePerm = (member: ProjectMember, perm: keyof ProjectMemberPermissions) => {
        const updated = { ...member.permissions, [perm]: !member.permissions[perm] };
        projectSupplierService.updateProjectMember(member.id, { permissions: updated });
        loadMembers();
    };

    const handleChangeRole = (member: ProjectMember, role: ProjectRole) => {
        const defaultPerms = PROJECT_ROLES[role]?.defaultPerms || PROJECT_ROLES.custom.defaultPerms;
        projectSupplierService.updateProjectMember(member.id, { role, permissions: { ...defaultPerms } });
        loadMembers();
    };

    const filtered = searchQuery
        ? members.filter(m => m.employeeName.includes(searchQuery) || (m.employeePhone || '').includes(searchQuery))
        : members;

    // Copy/Regenerate state
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const handleCopyCode = (memberId: string, code: string) => {
        navigator.clipboard.writeText(code).then(() => {
            setCopiedId(memberId);
            setTimeout(() => setCopiedId(null), 2000);
        });
    };

    const handleRegenerateCode = (memberId: string) => {
        projectSupplierService.regeneratePassword(memberId);
        loadMembers();
    };

    const permIcons: { key: keyof ProjectMemberPermissions; icon: React.ReactNode; label: { ar: string; en: string }; color: string }[] = [
        { key: 'chat', icon: <MessageCircle className="w-3 h-3" />, label: { ar: 'شات', en: 'Chat' }, color: 'blue' },
        { key: 'photos', icon: <Camera className="w-3 h-3" />, label: { ar: 'صور', en: 'Photos' }, color: 'purple' },
        { key: 'invoices', icon: <FileText className="w-3 h-3" />, label: { ar: 'فواتير', en: 'Invoices' }, color: 'green' },
        { key: 'forms', icon: <ClipboardList className="w-3 h-3" />, label: { ar: 'نماذج', en: 'Forms' }, color: 'amber' },
        { key: 'reports', icon: <BarChart3 className="w-3 h-3" />, label: { ar: 'تقارير', en: 'Reports' }, color: 'cyan' },
        { key: 'team', icon: <Shield className="w-3 h-3" />, label: { ar: 'إدارة الفريق', en: 'Team' }, color: 'red' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-colors">
                            <ChevronLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                        </button>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
                            <Users className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h1 className="text-base sm:text-lg font-bold text-white">{t('فريق المشروع', 'Project Team')}</h1>
                            <p className="text-[10px] sm:text-xs text-slate-400">📁 {projectName} · {members.length} {t('عضو', 'members')}</p>
                        </div>
                    </div>
                    <button onClick={() => setShowAdd(true)}
                        className="px-3 sm:px-4 py-2 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition-all">
                        <UserPlus className="w-4 h-4" /> <span className="hidden sm:inline">{t('إضافة عضو', 'Add')}</span>
                    </button>
                </div>
            </header>

            {/* Search */}
            <div className="max-w-4xl mx-auto px-3 sm:px-6 pt-4">
                <div className="relative">
                    <Search className={`absolute ${isRtl ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500`} />
                    <input value={searchQuery} onChange={e => setSearchQuery(e.target.value)}
                        placeholder={t('بحث في الفريق...', 'Search team...')}
                        className={`w-full bg-slate-800/50 border border-slate-700/50 rounded-xl ${isRtl ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50`} />
                </div>
            </div>

            {/* Members List */}
            <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-2">
                {filtered.length === 0 ? (
                    <div className="text-center py-16">
                        <Users className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">{t('لم يتم إضافة أعضاء بعد', 'No team members yet')}</p>
                    </div>
                ) : filtered.map(member => {
                    const roleInfo = PROJECT_ROLES[member.role] || PROJECT_ROLES.custom;
                    return (
                        <div key={member.id} className={`bg-slate-800/40 border rounded-xl p-3 sm:p-4 transition-all ${member.isActive ? 'border-slate-700/30' : 'border-slate-700/20 opacity-50'}`}>
                            {/* Member Info */}
                            <div className="flex items-start justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 flex items-center justify-center text-lg">
                                        {roleInfo.icon}
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">{member.employeeName}</p>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-violet-400 bg-violet-500/10 px-1.5 py-0.5 rounded">{roleInfo[langKey]}</span>
                                            {member.employeePhone && <span className="text-[10px] text-slate-500">{member.employeePhone}</span>}
                                        </div>
                                    </div>
                                </div>
                                <button onClick={() => handleRemove(member.id)}
                                    className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors">
                                    <Trash2 className="w-3.5 h-3.5" />
                                </button>
                            </div>

                            {/* Password & Status */}
                            <div className="flex items-center justify-between bg-slate-900/40 rounded-lg px-3 py-2 mb-2 border border-slate-700/20">
                                <div className="flex items-center gap-2">
                                    <Shield className="w-3.5 h-3.5 text-violet-400" />
                                    <span className="text-[10px] text-slate-400">{t('الرقم السري:', 'Password:')}</span>
                                    <span className="font-mono text-sm font-bold text-violet-300 tracking-widest">{member.password || '------'}</span>
                                    <button onClick={() => handleCopyCode(member.id, member.password)}
                                        className="p-1 text-slate-500 hover:text-violet-400 rounded transition-colors">
                                        {copiedId === member.id
                                            ? <CheckCircle className="w-3 h-3 text-green-400" />
                                            : <Copy className="w-3 h-3" />}
                                    </button>
                                    <button onClick={() => handleRegenerateCode(member.id)}
                                        className="p-1 text-slate-500 hover:text-amber-400 rounded transition-colors" title={t('تجديد الرمز', 'Regenerate')}>
                                        <RefreshCw className="w-3 h-3" />
                                    </button>
                                </div>
                                <div className="flex items-center gap-1.5">
                                    {member.lastLogin ? (
                                        <span className="flex items-center gap-1 text-[9px] text-green-400 bg-green-500/10 px-1.5 py-0.5 rounded">
                                            <LogIn className="w-2.5 h-2.5" />
                                            {new Date(member.lastLogin).toLocaleDateString(language === 'ar' ? 'ar-SA' : language === 'fr' ? 'fr-FR' : language === 'zh' ? 'zh-CN' : 'en-US')}
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-1 text-[9px] text-slate-500 bg-slate-700/30 px-1.5 py-0.5 rounded">
                                            <Clock className="w-2.5 h-2.5" />
                                            {t('لم يدخل بعد', 'Never logged in')}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Role Selector */}
                            <div className="mb-2">
                                <select value={member.role} onChange={e => handleChangeRole(member, e.target.value as ProjectRole)}
                                    className="w-full bg-slate-700/40 border border-slate-600/30 rounded-lg px-2 py-1.5 text-xs text-white focus:outline-none focus:border-violet-500/50">
                                    {(Object.keys(PROJECT_ROLES) as ProjectRole[]).map(role => (
                                        <option key={role} value={role}>
                                            {PROJECT_ROLES[role].icon} {PROJECT_ROLES[role][langKey]}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Permissions Grid */}
                            <div className="flex flex-wrap gap-1.5">
                                {permIcons.map(p => {
                                    const active = member.permissions[p.key];
                                    return (
                                        <button key={p.key} onClick={() => handleTogglePerm(member, p.key)}
                                            className={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium border transition-all ${
                                                active
                                                    ? `bg-${p.color}-500/10 text-${p.color}-400 border-${p.color}-500/20`
                                                    : 'bg-slate-700/20 text-slate-600 border-slate-700/20'
                                            }`}>
                                            {p.icon}
                                            {p.label[langKey]}
                                            {active && <CheckCircle className="w-2.5 h-2.5" />}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Add Modal */}
            {showAdd && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setShowAdd(false)}>
                    <div className="bg-slate-800 border border-slate-700 rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-bold text-white flex items-center gap-2">
                                <UserPlus className="w-5 h-5 text-violet-400" />
                                {t('إضافة عضو للمشروع', 'Add Team Member')}
                            </h3>
                            <button onClick={() => setShowAdd(false)} className="p-1.5 text-slate-500 hover:text-white rounded-lg"><X className="w-4 h-4" /></button>
                        </div>

                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">{t('اسم الموظف', 'Employee Name')}</label>
                                <input value={newName} onChange={e => setNewName(e.target.value)} placeholder={t('الاسم الكامل', 'Full name')}
                                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-violet-500/50" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">{t('رقم الجوال', 'Phone')}</label>
                                <input value={newPhone} onChange={e => setNewPhone(e.target.value)} placeholder="05xxxxxxxx"
                                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">{t('الدور في المشروع', 'Project Role')}</label>
                                <select value={newRole} onChange={e => setNewRole(e.target.value as ProjectRole)}
                                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-violet-500/50">
                                    {(Object.keys(PROJECT_ROLES) as ProjectRole[]).map(role => (
                                        <option key={role} value={role}>{PROJECT_ROLES[role].icon} {PROJECT_ROLES[role][langKey]}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Role default permissions preview */}
                            <div className="bg-slate-700/30 rounded-lg p-2.5">
                                <p className="text-[10px] text-slate-500 mb-1.5">{t('الصلاحيات الافتراضية:', 'Default permissions:')}</p>
                                <div className="flex flex-wrap gap-1">
                                    {permIcons.map(p => {
                                        const active = PROJECT_ROLES[newRole]?.defaultPerms?.[p.key];
                                        return (
                                            <span key={p.key} className={`text-[9px] px-1.5 py-0.5 rounded flex items-center gap-0.5 ${
                                                active ? `bg-${p.color}-500/10 text-${p.color}-400` : 'bg-slate-700/30 text-slate-600'
                                            }`}>
                                                {p.icon} {p.label[langKey]}
                                            </span>
                                        );
                                    })}
                                </div>
                            </div>

                            <button onClick={handleAdd} disabled={!newName.trim()}
                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                                    newName.trim() ? 'bg-gradient-to-r from-violet-500 to-purple-600 text-white shadow-lg active:scale-[0.98]' : 'bg-slate-700 text-slate-500'
                                }`}>
                                <UserPlus className="w-4 h-4" /> {t('إضافة العضو', 'Add Member')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ProjectTeamManager;
