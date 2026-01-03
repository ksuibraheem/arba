/**
 * صفحة مركز الدعم الفني
 * Support Center Page - Accessible to all users
 */

import React, { useState, useEffect } from 'react';
import {
    Headphones, Send, Paperclip, Search, ChevronLeft, ChevronRight,
    MessageSquare, Clock, CheckCircle, AlertCircle, X, Upload,
    FileText, Image, ArrowLeft, Eye, Plus, HelpCircle
} from 'lucide-react';
import {
    supportTicketService, SupportTicket, TicketCategory, TicketPriority, UserType,
    CATEGORY_TRANSLATIONS, PRIORITY_TRANSLATIONS, STATUS_TRANSLATIONS,
    PRIORITY_COLORS, STATUS_COLORS
} from '../services/supportTicketService';

interface SupportCenterPageProps {
    language: 'ar' | 'en';
    onNavigate: (page: string) => void;
    // Optional user info (if logged in)
    userId?: string;
    userName?: string;
    userEmail?: string;
    userType?: UserType;
}

type ViewMode = 'home' | 'new_ticket' | 'my_tickets' | 'track_ticket' | 'ticket_detail' | 'faq';

const SupportCenterPage: React.FC<SupportCenterPageProps> = ({
    language,
    onNavigate,
    userId = 'guest',
    userName = '',
    userEmail = '',
    userType = 'guest' as UserType
}) => {
    const isRtl = language === 'ar';
    const t = (ar: string, en: string) => language === 'ar' ? ar : en;

    // State
    const [viewMode, setViewMode] = useState<ViewMode>('home');
    const [myTickets, setMyTickets] = useState<SupportTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [trackingError, setTrackingError] = useState('');

    // New ticket form
    const [ticketForm, setTicketForm] = useState({
        name: userName,
        email: userEmail,
        phone: '',
        category: 'technical_bug' as TicketCategory,
        priority: 'medium' as TicketPriority,
        subject: '',
        description: ''
    });
    const [formError, setFormError] = useState('');
    const [formSuccess, setFormSuccess] = useState('');
    const [submittedTicket, setSubmittedTicket] = useState<SupportTicket | null>(null);

    // Response form
    const [responseMessage, setResponseMessage] = useState('');

    // Load demo data and user tickets
    useEffect(() => {
        supportTicketService.initializeDemoData();
        if (userId !== 'guest') {
            setMyTickets(supportTicketService.getUserTickets(userId));
        }
    }, [userId]);

    // Handle ticket submission
    const handleSubmitTicket = (e: React.FormEvent) => {
        e.preventDefault();
        setFormError('');
        setFormSuccess('');

        // Validation
        if (!ticketForm.name || !ticketForm.email || !ticketForm.subject || !ticketForm.description) {
            setFormError(t('جميع الحقول المطلوبة يجب تعبئتها', 'All required fields must be filled'));
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(ticketForm.email)) {
            setFormError(t('البريد الإلكتروني غير صحيح', 'Invalid email address'));
            return;
        }

        try {
            const newTicket = supportTicketService.createTicket({
                userId: userId,
                userType: userType,
                userName: ticketForm.name,
                userEmail: ticketForm.email,
                userPhone: ticketForm.phone,
                category: ticketForm.category,
                priority: ticketForm.priority,
                subject: ticketForm.subject,
                description: ticketForm.description
            });

            setSubmittedTicket(newTicket);
            setFormSuccess(t('تم إرسال التذكرة بنجاح!', 'Ticket submitted successfully!'));

            // Reset form
            setTicketForm({
                name: userName,
                email: userEmail,
                phone: '',
                category: 'technical_bug',
                priority: 'medium',
                subject: '',
                description: ''
            });

            // Refresh my tickets
            if (userId !== 'guest') {
                setMyTickets(supportTicketService.getUserTickets(userId));
            }
        } catch (error: any) {
            setFormError(error.message || t('حدث خطأ', 'An error occurred'));
        }
    };

    // Handle ticket tracking
    const handleTrackTicket = () => {
        setTrackingError('');

        if (!trackingNumber.trim()) {
            setTrackingError(t('أدخل رقم التذكرة', 'Enter ticket number'));
            return;
        }

        const ticket = supportTicketService.getTicketByNumber(trackingNumber.trim());

        if (ticket) {
            setSelectedTicket(ticket);
            setViewMode('ticket_detail');
        } else {
            setTrackingError(t('لم يتم العثور على التذكرة', 'Ticket not found'));
        }
    };

    // Handle adding response
    const handleAddResponse = () => {
        if (!selectedTicket || !responseMessage.trim()) return;

        const updatedTicket = supportTicketService.addResponse(selectedTicket.id, {
            responderId: userId,
            responderName: userName || ticketForm.name || t('زائر', 'Guest'),
            responderRole: 'user',
            message: responseMessage
        });

        if (updatedTicket) {
            setSelectedTicket(updatedTicket);
            setResponseMessage('');
        }
    };

    // FAQ Data
    const faqs = [
        {
            q: t('كيف أتتبع تذكرتي؟', 'How do I track my ticket?'),
            a: t('استخدم رقم التذكرة (TKT-XXXXX) في صفحة تتبع التذكرة للاطلاع على حالتها.',
                'Use your ticket number (TKT-XXXXX) on the track ticket page to view its status.')
        },
        {
            q: t('كم تستغرق الاستجابة؟', 'How long does a response take?'),
            a: t('نسعى للرد خلال 24 ساعة للتذاكر العادية و4 ساعات للتذاكر العاجلة.',
                'We aim to respond within 24 hours for regular tickets and 4 hours for urgent ones.')
        },
        {
            q: t('ما أنواع المشاكل التي يمكنني الإبلاغ عنها؟', 'What types of issues can I report?'),
            a: t('يمكنك الإبلاغ عن الأخطاء التقنية، الاستفسارات المالية، طلبات الموارد البشرية، أو طلب ميزات جديدة.',
                'You can report technical bugs, financial inquiries, HR requests, or request new features.')
        }
    ];

    // Render Home View
    const renderHome = () => (
        <div className="space-y-8">
            {/* Hero Section */}
            <div className="text-center py-12 bg-gradient-to-br from-orange-500/20 via-red-500/10 to-transparent rounded-3xl border border-orange-500/20">
                <div className="w-20 h-20 mx-auto rounded-2xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-6">
                    <Headphones className="w-10 h-10 text-white" />
                </div>
                <h1 className="text-3xl font-bold text-white mb-3">
                    {t('مركز الدعم الفني', 'Support Center')}
                </h1>
                <p className="text-slate-400 max-w-md mx-auto">
                    {t('نحن هنا لمساعدتك. أرسل تذكرة وسنرد عليك في أقرب وقت.',
                        'We\'re here to help. Submit a ticket and we\'ll respond as soon as possible.')}
                </p>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* New Ticket */}
                <button
                    onClick={() => setViewMode('new_ticket')}
                    className="group p-6 bg-gradient-to-br from-orange-500/10 to-red-500/10 rounded-2xl border border-orange-500/20 hover:border-orange-500/50 transition-all text-start"
                >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Plus className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                        {t('تذكرة جديدة', 'New Ticket')}
                    </h3>
                    <p className="text-slate-400 text-sm">
                        {t('أرسل استفسارك أو مشكلتك', 'Submit your inquiry or issue')}
                    </p>
                </button>

                {/* Track Ticket */}
                <button
                    onClick={() => setViewMode('track_ticket')}
                    className="group p-6 bg-gradient-to-br from-blue-500/10 to-cyan-500/10 rounded-2xl border border-blue-500/20 hover:border-blue-500/50 transition-all text-start"
                >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <Search className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                        {t('تتبع تذكرة', 'Track Ticket')}
                    </h3>
                    <p className="text-slate-400 text-sm">
                        {t('تابع حالة تذكرتك', 'Follow up on your ticket status')}
                    </p>
                </button>

                {/* FAQ */}
                <button
                    onClick={() => setViewMode('faq')}
                    className="group p-6 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-2xl border border-purple-500/20 hover:border-purple-500/50 transition-all text-start"
                >
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                        <HelpCircle className="w-7 h-7 text-white" />
                    </div>
                    <h3 className="text-lg font-bold text-white mb-2">
                        {t('الأسئلة الشائعة', 'FAQ')}
                    </h3>
                    <p className="text-slate-400 text-sm">
                        {t('إجابات للأسئلة المتكررة', 'Answers to common questions')}
                    </p>
                </button>
            </div>

            {/* My Tickets (if logged in) */}
            {userId !== 'guest' && myTickets.length > 0 && (
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white flex items-center gap-2">
                            <MessageSquare className="w-5 h-5 text-orange-400" />
                            {t('تذاكري الأخيرة', 'My Recent Tickets')}
                        </h3>
                        <button
                            onClick={() => setViewMode('my_tickets')}
                            className="text-orange-400 hover:text-orange-300 text-sm"
                        >
                            {t('عرض الكل', 'View All')}
                        </button>
                    </div>
                    <div className="space-y-3">
                        {myTickets.slice(0, 3).map(ticket => (
                            <button
                                key={ticket.id}
                                onClick={() => {
                                    setSelectedTicket(ticket);
                                    setViewMode('ticket_detail');
                                }}
                                className="w-full flex items-center justify-between p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors text-start"
                            >
                                <div className="flex items-center gap-3">
                                    <span className="text-slate-500 font-mono text-sm">{ticket.ticketNumber}</span>
                                    <span className="text-white">{ticket.subject}</span>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-xs ${STATUS_COLORS[ticket.status]}`}>
                                    {STATUS_TRANSLATIONS[ticket.status][language]}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );

    // Render New Ticket Form
    const renderNewTicket = () => (
        <div className="max-w-2xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
                <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                        <Plus className="w-5 h-5 text-white" />
                    </div>
                    {t('تذكرة دعم جديدة', 'New Support Ticket')}
                </h2>

                {formError && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-400">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        {formError}
                    </div>
                )}

                {formSuccess && submittedTicket ? (
                    <div className="text-center py-8">
                        <div className="w-20 h-20 mx-auto rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                            <CheckCircle className="w-10 h-10 text-green-400" />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">
                            {t('تم إرسال التذكرة بنجاح!', 'Ticket Submitted Successfully!')}
                        </h3>
                        <p className="text-slate-400 mb-4">
                            {t('رقم التذكرة الخاص بك:', 'Your ticket number:')}
                        </p>
                        <div className="inline-block px-6 py-3 bg-slate-700 rounded-xl font-mono text-2xl text-orange-400 mb-6">
                            {submittedTicket.ticketNumber}
                        </div>
                        <p className="text-slate-500 text-sm mb-6">
                            {t('احتفظ بهذا الرقم لتتبع حالة تذكرتك', 'Keep this number to track your ticket status')}
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => {
                                    setSelectedTicket(submittedTicket);
                                    setViewMode('ticket_detail');
                                    setFormSuccess('');
                                    setSubmittedTicket(null);
                                }}
                                className="px-6 py-3 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors"
                            >
                                {t('عرض التذكرة', 'View Ticket')}
                            </button>
                            <button
                                onClick={() => {
                                    setFormSuccess('');
                                    setSubmittedTicket(null);
                                    setViewMode('home');
                                }}
                                className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors"
                            >
                                {t('العودة للرئيسية', 'Back to Home')}
                            </button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmitTicket} className="space-y-5">
                        {/* Contact Info */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-400 mb-2 text-sm">
                                    {t('الاسم', 'Name')} *
                                </label>
                                <input
                                    type="text"
                                    value={ticketForm.name}
                                    onChange={(e) => setTicketForm({ ...ticketForm, name: e.target.value })}
                                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                                    placeholder={t('أدخل اسمك', 'Enter your name')}
                                />
                            </div>
                            <div>
                                <label className="block text-slate-400 mb-2 text-sm">
                                    {t('البريد الإلكتروني', 'Email')} *
                                </label>
                                <input
                                    type="email"
                                    value={ticketForm.email}
                                    onChange={(e) => setTicketForm({ ...ticketForm, email: e.target.value })}
                                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                                    placeholder="email@example.com"
                                    dir="ltr"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-slate-400 mb-2 text-sm">
                                {t('رقم الجوال', 'Phone')} ({t('اختياري', 'Optional')})
                            </label>
                            <input
                                type="tel"
                                value={ticketForm.phone}
                                onChange={(e) => setTicketForm({ ...ticketForm, phone: e.target.value })}
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                                placeholder="05XXXXXXXX"
                                dir="ltr"
                            />
                        </div>

                        {/* Category & Priority */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-slate-400 mb-2 text-sm">
                                    {t('التصنيف', 'Category')} *
                                </label>
                                <select
                                    value={ticketForm.category}
                                    onChange={(e) => setTicketForm({ ...ticketForm, category: e.target.value as TicketCategory })}
                                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                                >
                                    {(Object.keys(CATEGORY_TRANSLATIONS) as TicketCategory[]).map(cat => (
                                        <option key={cat} value={cat}>
                                            {CATEGORY_TRANSLATIONS[cat][language]}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-slate-400 mb-2 text-sm">
                                    {t('الأولوية', 'Priority')} *
                                </label>
                                <select
                                    value={ticketForm.priority}
                                    onChange={(e) => setTicketForm({ ...ticketForm, priority: e.target.value as TicketPriority })}
                                    className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                                >
                                    {(Object.keys(PRIORITY_TRANSLATIONS) as TicketPriority[]).map(pri => (
                                        <option key={pri} value={pri}>
                                            {PRIORITY_TRANSLATIONS[pri][language]}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Subject */}
                        <div>
                            <label className="block text-slate-400 mb-2 text-sm">
                                {t('الموضوع', 'Subject')} *
                            </label>
                            <input
                                type="text"
                                value={ticketForm.subject}
                                onChange={(e) => setTicketForm({ ...ticketForm, subject: e.target.value })}
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500"
                                placeholder={t('اكتب موضوع التذكرة', 'Enter ticket subject')}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="block text-slate-400 mb-2 text-sm">
                                {t('الوصف التفصيلي', 'Description')} *
                            </label>
                            <textarea
                                value={ticketForm.description}
                                onChange={(e) => setTicketForm({ ...ticketForm, description: e.target.value })}
                                className="w-full bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-orange-500 resize-none"
                                rows={5}
                                placeholder={t('اشرح المشكلة أو الاستفسار بالتفصيل...', 'Describe your issue or inquiry in detail...')}
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            className="w-full py-4 bg-gradient-to-r from-orange-500 to-red-600 text-white font-bold rounded-xl hover:from-orange-600 hover:to-red-700 transition-all flex items-center justify-center gap-2"
                        >
                            <Send className="w-5 h-5" />
                            {t('إرسال التذكرة', 'Submit Ticket')}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );

    // Render Track Ticket
    const renderTrackTicket = () => (
        <div className="max-w-xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50 text-center">
                <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center mb-6">
                    <Search className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">
                    {t('تتبع تذكرتك', 'Track Your Ticket')}
                </h2>
                <p className="text-slate-400 mb-6">
                    {t('أدخل رقم التذكرة للاطلاع على حالتها', 'Enter your ticket number to view its status')}
                </p>

                {trackingError && (
                    <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-xl text-red-400 text-sm">
                        {trackingError}
                    </div>
                )}

                <div className="flex gap-3">
                    <input
                        type="text"
                        value={trackingNumber}
                        onChange={(e) => {
                            setTrackingNumber(e.target.value.toUpperCase());
                            setTrackingError('');
                        }}
                        className="flex-1 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white font-mono text-center focus:outline-none focus:border-blue-500"
                        placeholder="TKT-00000"
                        dir="ltr"
                        onKeyDown={(e) => e.key === 'Enter' && handleTrackTicket()}
                    />
                    <button
                        onClick={handleTrackTicket}
                        className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors"
                    >
                        {t('بحث', 'Search')}
                    </button>
                </div>
            </div>
        </div>
    );

    // Render My Tickets List
    const renderMyTickets = () => (
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <MessageSquare className="w-6 h-6 text-orange-400" />
                {t('تذاكري', 'My Tickets')}
            </h2>

            {myTickets.length === 0 ? (
                <div className="text-center py-12">
                    <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                    <p className="text-slate-400">{t('لا توجد تذاكر', 'No tickets found')}</p>
                    <button
                        onClick={() => setViewMode('new_ticket')}
                        className="mt-4 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                    >
                        {t('إنشاء تذكرة جديدة', 'Create New Ticket')}
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {myTickets.map(ticket => (
                        <button
                            key={ticket.id}
                            onClick={() => {
                                setSelectedTicket(ticket);
                                setViewMode('ticket_detail');
                            }}
                            className="w-full flex items-center justify-between p-4 bg-slate-700/30 rounded-xl hover:bg-slate-700/50 transition-colors text-start"
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-1">
                                    <span className="text-slate-500 font-mono text-sm">{ticket.ticketNumber}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-xs ${PRIORITY_COLORS[ticket.priority]}`}>
                                        {PRIORITY_TRANSLATIONS[ticket.priority][language]}
                                    </span>
                                </div>
                                <p className="text-white font-medium">{ticket.subject}</p>
                                <p className="text-slate-500 text-sm mt-1">
                                    {new Date(ticket.createdAt).toLocaleDateString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                </p>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs ${STATUS_COLORS[ticket.status]}`}>
                                {STATUS_TRANSLATIONS[ticket.status][language]}
                            </span>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );

    // Render Ticket Detail
    const renderTicketDetail = () => {
        if (!selectedTicket) return null;

        return (
            <div className="space-y-6">
                {/* Ticket Header */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <div className="flex items-center gap-3 mb-2">
                                <span className="font-mono text-lg text-orange-400">{selectedTicket.ticketNumber}</span>
                                <span className={`px-3 py-1 rounded-full text-xs ${STATUS_COLORS[selectedTicket.status]}`}>
                                    {STATUS_TRANSLATIONS[selectedTicket.status][language]}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs ${PRIORITY_COLORS[selectedTicket.priority]}`}>
                                    {PRIORITY_TRANSLATIONS[selectedTicket.priority][language]}
                                </span>
                            </div>
                            <h2 className="text-xl font-bold text-white">{selectedTicket.subject}</h2>
                        </div>
                        <span className="text-slate-500 text-sm">
                            {new Date(selectedTicket.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                        </span>
                    </div>
                    <p className="text-slate-300 whitespace-pre-wrap">{selectedTicket.description}</p>
                    <div className="mt-4 pt-4 border-t border-slate-700 flex items-center gap-4 text-sm text-slate-500">
                        <span>{t('التصنيف:', 'Category:')} {CATEGORY_TRANSLATIONS[selectedTicket.category][language]}</span>
                        {selectedTicket.assignedToName && (
                            <span>{t('مسند إلى:', 'Assigned to:')} {selectedTicket.assignedToName}</span>
                        )}
                    </div>
                </div>

                {/* Responses */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 border border-slate-700/50">
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <MessageSquare className="w-5 h-5 text-blue-400" />
                        {t('المحادثة', 'Conversation')}
                    </h3>

                    <div className="space-y-4 mb-6">
                        {selectedTicket.responses.filter(r => !r.isInternal).length === 0 ? (
                            <p className="text-slate-500 text-center py-4">
                                {t('لا توجد ردود بعد', 'No responses yet')}
                            </p>
                        ) : (
                            selectedTicket.responses.filter(r => !r.isInternal).map(response => (
                                <div
                                    key={response.id}
                                    className={`p-4 rounded-xl ${response.responderRole === 'user'
                                        ? 'bg-blue-500/10 border border-blue-500/30 mr-8'
                                        : 'bg-slate-700/50 border border-slate-600 ml-8'
                                        }`}
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <span className={`font-medium ${response.responderRole === 'user' ? 'text-blue-400' : 'text-orange-400'
                                            }`}>
                                            {response.responderName}
                                            {response.responderRole !== 'user' && (
                                                <span className="text-xs text-slate-500 mr-2">
                                                    ({t('فريق الدعم', 'Support Team')})
                                                </span>
                                            )}
                                        </span>
                                        <span className="text-slate-500 text-xs">
                                            {new Date(response.createdAt).toLocaleString(language === 'ar' ? 'ar-SA' : 'en-US')}
                                        </span>
                                    </div>
                                    <p className="text-slate-300 whitespace-pre-wrap">{response.message}</p>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Add Response */}
                    {selectedTicket.status !== 'closed' && (
                        <div className="border-t border-slate-700 pt-4">
                            <div className="flex gap-3">
                                <textarea
                                    value={responseMessage}
                                    onChange={(e) => setResponseMessage(e.target.value)}
                                    className="flex-1 bg-slate-700/50 border border-slate-600 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-blue-500 resize-none"
                                    rows={2}
                                    placeholder={t('اكتب ردك هنا...', 'Write your response here...')}
                                />
                                <button
                                    onClick={handleAddResponse}
                                    disabled={!responseMessage.trim()}
                                    className="px-6 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Send className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Render FAQ
    const renderFAQ = () => (
        <div className="max-w-2xl mx-auto">
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700/50">
                <div className="text-center mb-8">
                    <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center mb-4">
                        <HelpCircle className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                        {t('الأسئلة الشائعة', 'Frequently Asked Questions')}
                    </h2>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, index) => (
                        <div key={index} className="p-4 bg-slate-700/30 rounded-xl">
                            <h4 className="font-bold text-white mb-2">{faq.q}</h4>
                            <p className="text-slate-400">{faq.a}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="bg-slate-800/50 backdrop-blur-lg border-b border-slate-700/50 sticky top-0 z-50">
                <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        {viewMode !== 'home' && (
                            <button
                                onClick={() => {
                                    if (viewMode === 'ticket_detail' && selectedTicket) {
                                        // Check if we came from my tickets or tracking
                                        if (userId !== 'guest') {
                                            setViewMode('my_tickets');
                                        } else {
                                            setViewMode('track_ticket');
                                        }
                                    } else {
                                        setViewMode('home');
                                    }
                                    setSelectedTicket(null);
                                }}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                            >
                                {isRtl ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
                            </button>
                        )}
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                                <Headphones className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h1 className="text-lg font-bold text-white">{t('مركز الدعم', 'Support Center')}</h1>
                                <p className="text-slate-500 text-xs">{t('أربا للتسعير', 'Arba Pricing')}</p>
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={() => onNavigate('landing')}
                        className="text-slate-400 hover:text-white text-sm"
                    >
                        {t('العودة للموقع', 'Back to Site')}
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-5xl mx-auto px-6 py-8">
                {viewMode === 'home' && renderHome()}
                {viewMode === 'new_ticket' && renderNewTicket()}
                {viewMode === 'track_ticket' && renderTrackTicket()}
                {viewMode === 'my_tickets' && renderMyTickets()}
                {viewMode === 'ticket_detail' && renderTicketDetail()}
                {viewMode === 'faq' && renderFAQ()}
            </main>
        </div>
    );
};

export default SupportCenterPage;
