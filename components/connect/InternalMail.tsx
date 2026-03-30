/**
 * InternalMail — البريد الداخلي
 * مراسلات رسمية + قوالب جاهزة + تتبع الحالة + ربط بالبريد الإلكتروني الحقيقي
 */

import React, { useState, useEffect } from 'react';
import { ChevronLeft, Send, Star, Paperclip, Reply, Plus, FileText, Mail, CheckCircle, Eye, Clock, Search, Inbox, SendHorizontal, StarOff, Tag } from 'lucide-react';
import { connectService, InternalMailMessage, MAIL_TEMPLATES, formatChatTime } from '../../services/connectService';

interface InternalMailProps {
    language: 'ar' | 'en';
    userId: string;
    userName: string;
    userEmail?: string;
    companyName?: string;
    companyLogo?: string;
    onBack: () => void;
}

type MailView = 'inbox' | 'sent' | 'starred' | 'compose' | 'detail';

const InternalMail: React.FC<InternalMailProps> = ({ language, userId, userName, userEmail, companyName, companyLogo, onBack }) => {
    const [mails, setMails] = useState<InternalMailMessage[]>([]);
    const [view, setView] = useState<MailView>('inbox');
    const [selectedMail, setSelectedMail] = useState<InternalMailMessage | null>(null);
    const [searchQuery, setSearchQuery] = useState('');

    // Compose state
    const [composeTo, setComposeTo] = useState('');
    const [composeSubject, setComposeSubject] = useState('');
    const [composeBody, setComposeBody] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [replyBody, setReplyBody] = useState('');

    const isRtl = language === 'ar';
    const t = (ar: string, en: string) => language === 'ar' ? ar : en;

    useEffect(() => { loadMails(); }, []);

    const loadMails = () => setMails(connectService.getMails());

    const handleSendMail = () => {
        if (!composeTo.trim() || !composeSubject.trim()) return;

        connectService.sendMail({
            from: { id: userId, name: userName, email: userEmail, role: 'contractor', company: companyName },
            to: [{ id: composeTo, name: composeTo, role: 'engineer' }],
            subject: composeSubject,
            body: composeBody,
            attachments: [],
        });

        setComposeTo('');
        setComposeSubject('');
        setComposeBody('');
        setSelectedTemplate('');
        setView('sent');
        loadMails();
    };

    const handleReply = (mailId: string) => {
        if (!replyBody.trim()) return;
        connectService.replyToMail(mailId, {
            from: { id: userId, name: userName, email: userEmail, role: 'contractor', company: companyName },
            body: replyBody,
        });
        setReplyBody('');
        loadMails();
    };

    const applyTemplate = (templateKey: string) => {
        const tmpl = MAIL_TEMPLATES[templateKey];
        if (tmpl) {
            setComposeSubject(tmpl.subject[language]);
            setComposeBody(tmpl.body[language]);
            setSelectedTemplate(templateKey);
        }
    };

    const STATUS_ICONS: Record<string, React.ReactNode> = {
        sent: <Clock className="w-3.5 h-3.5 text-slate-400" />,
        read: <Eye className="w-3.5 h-3.5 text-blue-400" />,
        replied: <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />,
    };

    const filteredMails = mails.filter(m => {
        if (view === 'starred') return m.starred;
        if (view === 'sent') return m.from.id === userId;
        return m.to.some(t => t.id === userId) || m.from.id === userId;
    }).filter(m => !searchQuery || m.subject.includes(searchQuery) || m.body.includes(searchQuery));

    // COMPOSE VIEW
    if (view === 'compose') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
                <header className="bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-30">
                    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={() => setView('inbox')} className="p-2 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-colors">
                                <ChevronLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                            </button>
                            <h1 className="text-lg font-bold text-white">{t('رسالة جديدة', 'New Message')}</h1>
                        </div>
                        <button
                            onClick={handleSendMail}
                            disabled={!composeTo.trim() || !composeSubject.trim()}
                            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${composeTo && composeSubject ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white shadow-lg active:scale-95' : 'bg-slate-700 text-slate-500'}`}
                        >
                            <Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                            {t('إرسال', 'Send')}
                        </button>
                    </div>
                </header>

                <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-3">
                    {/* Templates */}
                    <div>
                        <label className="text-xs text-slate-400 mb-1.5 block">{t('قالب جاهز', 'Template')}</label>
                        <div className="flex gap-2 overflow-x-auto pb-1">
                            {Object.entries(MAIL_TEMPLATES).map(([key, tmpl]) => (
                                <button
                                    key={key}
                                    onClick={() => applyTemplate(key)}
                                    className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors border ${selectedTemplate === key ? 'bg-purple-500/20 text-purple-400 border-purple-500/30' : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border-slate-700'}`}
                                >
                                    <FileText className="w-3 h-3 inline-block ml-1" />
                                    {tmpl[language]}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* To */}
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">{t('إلى', 'To')}</label>
                        <input
                            value={composeTo}
                            onChange={e => setComposeTo(e.target.value)}
                            placeholder={t('اسم المستلم أو البريد الإلكتروني', 'Recipient name or email')}
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                        />
                    </div>

                    {/* Subject */}
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">{t('الموضوع', 'Subject')}</label>
                        <input
                            value={composeSubject}
                            onChange={e => setComposeSubject(e.target.value)}
                            placeholder={t('موضوع الرسالة', 'Message subject')}
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                        />
                    </div>

                    {/* Body */}
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">{t('المحتوى', 'Body')}</label>
                        <textarea
                            value={composeBody}
                            onChange={e => setComposeBody(e.target.value)}
                            placeholder={t('اكتب رسالتك هنا...', 'Write your message here...')}
                            rows={10}
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50 resize-none"
                        />
                    </div>

                    {/* Email note */}
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl px-4 py-3 flex items-start gap-2">
                        <Mail className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-300">
                            {t(
                                `سيتم إرسال نسخة من هذه الرسالة إلى البريد الإلكتروني للمستلم باسم "${companyName || 'شركتك'}"`,
                                `A copy will be sent to recipient's email on behalf of "${companyName || 'Your Company'}"`
                            )}
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // DETAIL VIEW
    if (view === 'detail' && selectedMail) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
                <header className="bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-30">
                    <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <button onClick={() => { setView('inbox'); setSelectedMail(null); }} className="p-2 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-colors">
                                <ChevronLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                            </button>
                            <h1 className="text-base sm:text-lg font-bold text-white truncate max-w-[200px] sm:max-w-none">{selectedMail.subject}</h1>
                        </div>
                        <button
                            onClick={() => { connectService.toggleStarMail(selectedMail.id!); loadMails(); }}
                            className="p-2 hover:bg-slate-700/50 rounded-xl transition-colors"
                        >
                            <Star className={`w-5 h-5 ${selectedMail.starred ? 'text-yellow-400 fill-yellow-400' : 'text-slate-500'}`} />
                        </button>
                    </div>
                </header>

                <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4 space-y-4">
                    {/* Mail header */}
                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                        <div className="flex items-start justify-between mb-3">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                                    <span className="text-sm font-bold text-white">{selectedMail.from.name.charAt(0)}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-white">{selectedMail.from.name}</p>
                                    <p className="text-xs text-slate-400">{selectedMail.from.email || selectedMail.from.company}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5">
                                {STATUS_ICONS[selectedMail.status]}
                                <span className="text-[10px] text-slate-500">{formatChatTime(selectedMail.createdAt)}</span>
                            </div>
                        </div>
                        <p className="text-xs text-slate-400 mb-3">{t('إلى', 'To')}: {selectedMail.to.map(t => t.name).join(', ')}</p>
                        <div className="border-t border-slate-700/50 pt-3">
                            <p className="text-sm text-slate-200 whitespace-pre-wrap">{selectedMail.body}</p>
                        </div>
                    </div>

                    {/* Replies */}
                    {selectedMail.replies.length > 0 && (
                        <div className="space-y-3">
                            {selectedMail.replies.map((reply, i) => (
                                <div key={i} className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                                            <span className="text-[10px] font-bold text-white">{reply.from.name.charAt(0)}</span>
                                        </div>
                                        <span className="text-xs font-medium text-white">{reply.from.name}</span>
                                        <span className="text-[10px] text-slate-500">{formatChatTime(reply.createdAt)}</span>
                                    </div>
                                    <p className="text-sm text-slate-300 whitespace-pre-wrap">{reply.body}</p>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Reply input */}
                    <div className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-4">
                        <p className="text-xs text-slate-400 mb-2 flex items-center gap-1">
                            <Reply className="w-3 h-3" />
                            {t('رد على الرسالة', 'Reply to message')}
                        </p>
                        <textarea
                            value={replyBody}
                            onChange={e => setReplyBody(e.target.value)}
                            placeholder={t('اكتب ردك...', 'Write your reply...')}
                            rows={3}
                            className="w-full bg-slate-700/50 border border-slate-600/30 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-500 resize-none focus:outline-none focus:border-purple-500/50 mb-2"
                        />
                        <button
                            onClick={() => handleReply(selectedMail.id!)}
                            disabled={!replyBody.trim()}
                            className={`px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 transition-all ${replyBody.trim() ? 'bg-gradient-to-r from-purple-500 to-violet-600 text-white active:scale-95' : 'bg-slate-700 text-slate-500'}`}
                        >
                            <Send className={`w-4 h-4 ${isRtl ? 'rotate-180' : ''}`} />
                            {t('رد', 'Reply')}
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // INBOX / SENT / STARRED VIEW
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
            <header className="bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-30">
                <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={onBack} className="p-2 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-colors">
                            <ChevronLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                        </button>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center">
                            <span className="text-lg">📧</span>
                        </div>
                        <h1 className="text-lg font-bold text-white">{t('البريد الداخلي', 'Internal Mail')}</h1>
                    </div>
                    <button
                        onClick={() => setView('compose')}
                        className="px-3 sm:px-4 py-2 bg-gradient-to-r from-purple-500 to-violet-600 text-white rounded-xl text-sm font-bold flex items-center gap-1.5 shadow-lg active:scale-95 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        <span className="hidden sm:inline">{t('رسالة جديدة', 'New')}</span>
                    </button>
                </div>

                {/* Tabs */}
                <div className="max-w-4xl mx-auto px-3 sm:px-6 pb-2 flex gap-1">
                    {[
                        { id: 'inbox' as MailView, label: t('الوارد', 'Inbox'), icon: <Inbox className="w-3.5 h-3.5" /> },
                        { id: 'sent' as MailView, label: t('المرسل', 'Sent'), icon: <SendHorizontal className="w-3.5 h-3.5" /> },
                        { id: 'starred' as MailView, label: t('المميز', 'Starred'), icon: <Star className="w-3.5 h-3.5" /> },
                    ].map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setView(tab.id)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${view === tab.id ? 'bg-purple-500/20 text-purple-400' : 'text-slate-500 hover:bg-slate-700/50 hover:text-slate-300'}`}
                        >
                            {tab.icon}
                            {tab.label}
                        </button>
                    ))}
                </div>
            </header>

            <div className="max-w-4xl mx-auto px-3 sm:px-6 py-4">
                {/* Search */}
                <div className="relative mb-4">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        placeholder={t('بحث في البريد...', 'Search mail...')}
                        className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl pr-10 pl-4 py-2.5 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-purple-500/50"
                    />
                </div>

                {/* Mail List */}
                <div className="space-y-2">
                    {filteredMails.length === 0 ? (
                        <div className="text-center py-16">
                            <span className="text-5xl block mb-3">📧</span>
                            <p className="text-slate-400 text-sm">{t('لا توجد رسائل', 'No messages')}</p>
                        </div>
                    ) : (
                        filteredMails.map(mail => (
                            <div
                                key={mail.id}
                                onClick={() => { setSelectedMail(mail); setView('detail'); }}
                                className={`bg-slate-800/40 border rounded-xl p-3 sm:p-4 cursor-pointer hover:bg-slate-700/40 transition-all ${mail.status === 'sent' && mail.to.some(t => t.id === userId) ? 'border-purple-500/20' : 'border-slate-700/30'}`}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-3 min-w-0 flex-1">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shrink-0">
                                            <span className="text-xs font-bold text-white">{mail.from.name.charAt(0)}</span>
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex items-center gap-2 mb-0.5">
                                                <span className="text-sm font-semibold text-white truncate">{mail.from.name}</span>
                                                {STATUS_ICONS[mail.status]}
                                            </div>
                                            <p className="text-xs font-medium text-slate-300 truncate">{mail.subject}</p>
                                            <p className="text-[10px] text-slate-500 truncate mt-0.5">{mail.body.substring(0, 80)}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0 mr-1 sm:mr-0">
                                        <span className="text-[10px] text-slate-500">{formatChatTime(mail.createdAt)}</span>
                                        <button
                                            onClick={e => { e.stopPropagation(); connectService.toggleStarMail(mail.id!); loadMails(); }}
                                            className="p-0.5"
                                        >
                                            <Star className={`w-3.5 h-3.5 ${mail.starred ? 'text-yellow-400 fill-yellow-400' : 'text-slate-600'}`} />
                                        </button>
                                        {mail.replies.length > 0 && (
                                            <span className="text-[9px] text-slate-500 flex items-center gap-0.5">
                                                <Reply className="w-3 h-3" />
                                                {mail.replies.length}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default InternalMail;
