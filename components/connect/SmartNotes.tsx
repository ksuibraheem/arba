/**
 * SmartNotes — الملاحظات الذكية
 * ملاحظات مرتبطة ببنود BOQ + أولوية + مشاركة + تذكيرات
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Plus, StickyNote, Tag, AlertTriangle, Clock, CheckCircle, Trash2, Edit3, Share2, Bell, Star, Search, Filter, X } from 'lucide-react';
import { connectService, SmartNote, formatChatTime } from '../../services/connectService';
import type { NotePriority } from '../../services/connectService';

interface SmartNotesProps {
    language: 'ar' | 'en';
    userId: string;
    userName: string;
    onBack: () => void;
}

const PRIORITY_CONFIG: Record<NotePriority, { label: { ar: string; en: string }; color: string; icon: React.ReactNode }> = {
    normal: { label: { ar: 'عادي', en: 'Normal' }, color: 'bg-slate-500/20 text-slate-400 border-slate-500/30', icon: <StickyNote className="w-3 h-3" /> },
    important: { label: { ar: 'مهم', en: 'Important' }, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30', icon: <Star className="w-3 h-3" /> },
    urgent: { label: { ar: 'عاجل', en: 'Urgent' }, color: 'bg-red-500/20 text-red-400 border-red-500/30', icon: <AlertTriangle className="w-3 h-3" /> },
};

const SmartNotes: React.FC<SmartNotesProps> = ({ language, userId, userName, onBack }) => {
    const [notes, setNotes] = useState<SmartNote[]>([]);
    const [showCreate, setShowCreate] = useState(false);
    const [editingNote, setEditingNote] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterPriority, setFilterPriority] = useState<NotePriority | 'all'>('all');
    const [showCompleted, setShowCompleted] = useState(false);

    // Create state
    const [newContent, setNewContent] = useState('');
    const [newPriority, setNewPriority] = useState<NotePriority>('normal');
    const [newItemCode, setNewItemCode] = useState('');

    const isRtl = language === 'ar';
    const t = (ar: string, en: string) => language === 'ar' ? ar : en;

    useEffect(() => { loadNotes(); }, []);

    const loadNotes = () => setNotes(connectService.getNotes());

    const handleCreate = () => {
        if (!newContent.trim()) return;
        connectService.addNote({
            createdBy: { id: userId, name: userName, role: 'contractor' },
            content: newContent.trim(),
            linkedItemCode: newItemCode || undefined,
            priority: newPriority,
            sharedWith: [],
            attachments: [],
        });
        setNewContent('');
        setNewPriority('normal');
        setNewItemCode('');
        setShowCreate(false);
        loadNotes();
    };

    const handleToggleComplete = (noteId: string) => {
        connectService.toggleNoteComplete(noteId);
        loadNotes();
    };

    const handleDelete = (noteId: string) => {
        connectService.deleteNote(noteId);
        loadNotes();
    };

    const handleUpdateContent = (noteId: string, content: string) => {
        connectService.updateNote(noteId, { content });
        setEditingNote(null);
        loadNotes();
    };

    const filteredNotes = notes
        .filter(n => showCompleted || !n.completed)
        .filter(n => filterPriority === 'all' || n.priority === filterPriority)
        .filter(n => !searchQuery || n.content.includes(searchQuery) || (n.linkedItemCode && n.linkedItemCode.includes(searchQuery)));

    const activeCount = notes.filter(n => !n.completed).length;
    const completedCount = notes.filter(n => n.completed).length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-colors">
                            <ChevronLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                        </button>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                            <span className="text-lg">📝</span>
                        </div>
                        <div>
                            <h1 className="text-base sm:text-lg font-bold text-white">{t('الملاحظات', 'Notes')}</h1>
                            <p className="text-[10px] sm:text-xs text-slate-400">
                                {activeCount} {t('نشطة', 'active')} · {completedCount} {t('مكتملة', 'done')}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="px-3 sm:px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-600 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('ملاحظة جديدة', 'New Note')}</span>
                    </button>
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-4">
                {/* Search + filters */}
                <div className="flex gap-2">
                    <div className="relative flex-1">
                        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            placeholder={t('بحث...', 'Search...')}
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pr-10 pl-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500/50"
                        />
                    </div>
                    <button
                        onClick={() => setShowCompleted(!showCompleted)}
                        className={`px-3 py-2 rounded-xl text-xs font-medium transition-colors ${showCompleted ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        <CheckCircle className="w-4 h-4" />
                    </button>
                </div>

                {/* Priority filter */}
                <div className="flex gap-2 overflow-x-auto">
                    <button
                        onClick={() => setFilterPriority('all')}
                        className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${filterPriority === 'all' ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                    >
                        {t('الكل', 'All')}
                    </button>
                    {(Object.keys(PRIORITY_CONFIG) as NotePriority[]).map(pri => (
                        <button
                            key={pri}
                            onClick={() => setFilterPriority(filterPriority === pri ? 'all' : pri)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border flex items-center gap-1 ${filterPriority === pri ? PRIORITY_CONFIG[pri].color : 'bg-slate-800 text-slate-400 border-transparent hover:bg-slate-700'}`}
                        >
                            {PRIORITY_CONFIG[pri].icon}
                            {PRIORITY_CONFIG[pri].label[language]}
                        </button>
                    ))}
                </div>

                {/* Notes list */}
                {filteredNotes.length === 0 ? (
                    <div className="text-center py-16">
                        <StickyNote className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                        <p className="text-slate-400 text-sm">{t('لا توجد ملاحظات', 'No notes')}</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filteredNotes.map(note => (
                            <div
                                key={note.id}
                                className={`bg-slate-800/40 border rounded-xl p-3 sm:p-4 transition-all ${
                                    note.completed ? 'border-slate-700/20 opacity-60' :
                                    note.priority === 'urgent' ? 'border-red-500/20 bg-red-500/5' :
                                    note.priority === 'important' ? 'border-amber-500/20 bg-amber-500/5' :
                                    'border-slate-700/30'
                                }`}
                            >
                                <div className="flex items-start gap-3">
                                    {/* Checkbox */}
                                    <button
                                        onClick={() => handleToggleComplete(note.id!)}
                                        className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                                            note.completed ? 'bg-emerald-500 border-emerald-500' : 'border-slate-500 hover:border-emerald-500'
                                        }`}
                                    >
                                        {note.completed && <CheckCircle className="w-3 h-3 text-white" />}
                                    </button>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0">
                                        {editingNote === note.id ? (
                                            <textarea
                                                defaultValue={note.content}
                                                onBlur={e => handleUpdateContent(note.id!, e.target.value)}
                                                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleUpdateContent(note.id!, (e.target as HTMLTextAreaElement).value); } }}
                                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-pink-500/50 resize-none"
                                                rows={3}
                                                autoFocus
                                            />
                                        ) : (
                                            <p className={`text-sm whitespace-pre-wrap ${note.completed ? 'text-slate-500 line-through' : 'text-slate-200'}`}>
                                                {note.content}
                                            </p>
                                        )}

                                        <div className="flex items-center gap-2 mt-2 flex-wrap">
                                            {/* Priority badge */}
                                            <span className={`text-[9px] px-1.5 py-0.5 rounded-md font-medium border flex items-center gap-0.5 ${PRIORITY_CONFIG[note.priority].color}`}>
                                                {PRIORITY_CONFIG[note.priority].icon}
                                                {PRIORITY_CONFIG[note.priority].label[language]}
                                            </span>
                                            {/* Item code */}
                                            {note.linkedItemCode && (
                                                <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-slate-700/50 text-slate-400 flex items-center gap-0.5">
                                                    <Tag className="w-2.5 h-2.5" />
                                                    {note.linkedItemCode}
                                                </span>
                                            )}
                                            {/* Time */}
                                            <span className="text-[9px] text-slate-500 flex items-center gap-0.5">
                                                <Clock className="w-2.5 h-2.5" />
                                                {formatChatTime(note.createdAt)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-1 shrink-0">
                                        <button
                                            onClick={() => setEditingNote(editingNote === note.id ? null : note.id!)}
                                            className="p-1.5 text-slate-500 hover:text-blue-400 rounded-lg hover:bg-slate-700/50 transition-colors"
                                        >
                                            <Edit3 className="w-3.5 h-3.5" />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(note.id!)}
                                            className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg hover:bg-slate-700/50 transition-colors"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Create Note Modal */}
            {showCreate && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center" onClick={() => setShowCreate(false)}>
                    <div className="bg-slate-800 border border-slate-700 rounded-t-2xl sm:rounded-2xl p-5 w-full sm:max-w-md shadow-2xl" onClick={e => e.stopPropagation()}>
                        <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                            <StickyNote className="w-5 h-5 text-pink-400" />
                            {t('ملاحظة جديدة', 'New Note')}
                        </h3>

                        <div className="space-y-3">
                            <textarea
                                value={newContent}
                                onChange={e => setNewContent(e.target.value)}
                                placeholder={t('اكتب ملاحظتك...', 'Write your note...')}
                                rows={4}
                                className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-pink-500/50 resize-none"
                                autoFocus
                            />

                            <div>
                                <label className="text-xs text-slate-400 mb-1.5 block">{t('الأولوية', 'Priority')}</label>
                                <div className="flex gap-2">
                                    {(Object.keys(PRIORITY_CONFIG) as NotePriority[]).map(pri => (
                                        <button
                                            key={pri}
                                            onClick={() => setNewPriority(pri)}
                                            className={`flex-1 py-2 rounded-lg text-xs font-medium border flex items-center justify-center gap-1 transition-colors ${newPriority === pri ? PRIORITY_CONFIG[pri].color : 'bg-slate-700 text-slate-400 border-slate-600'}`}
                                        >
                                            {PRIORITY_CONFIG[pri].icon}
                                            {PRIORITY_CONFIG[pri].label[language]}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs text-slate-400 mb-1 block">{t('رقم البند (اختياري)', 'Item code (optional)')}</label>
                                <input
                                    value={newItemCode}
                                    onChange={e => setNewItemCode(e.target.value)}
                                    placeholder="11.01"
                                    className="w-full bg-slate-700/50 border border-slate-600/50 rounded-xl px-3 py-2 text-sm text-white placeholder-slate-500 focus:outline-none"
                                />
                            </div>

                            <button
                                onClick={handleCreate}
                                disabled={!newContent.trim()}
                                className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${newContent.trim() ? 'bg-gradient-to-r from-pink-500 to-rose-600 text-white shadow-lg active:scale-[0.98]' : 'bg-slate-700 text-slate-500'}`}
                            >
                                <Plus className="w-4 h-4" />
                                {t('إضافة ملاحظة', 'Add Note')}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SmartNotes;
