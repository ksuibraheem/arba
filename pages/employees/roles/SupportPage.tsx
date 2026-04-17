/**
 * صفحة الدعم الفني للموظفين
 * Technical Support Page - Employee Dashboard
 */

import React, { useState, useEffect, useRef } from 'react';
import {
    Headphones, MessageSquare, Phone, Mail, Clock, CheckCircle, Search,
    Filter, User, ChevronDown, Send, AlertCircle, X, RefreshCw,
    GitBranch, Building, Users, Eye, ArrowRight, Upload, Download, FileText,
    Image as ImageIcon, Paperclip, HelpCircle
} from 'lucide-react';
import { Employee } from '../../../services/employeeService';
import { Language } from '../../../types';
import {
    supportTicketService, SupportTicket, TicketCategory, TicketPriority, TicketStatus, Attachment,
    CATEGORY_TRANSLATIONS, PRIORITY_TRANSLATIONS, STATUS_TRANSLATIONS,
    PRIORITY_COLORS, STATUS_COLORS
} from '../../../services/supportTicketService';

interface SupportPageProps {
    language: Language;
    employee: Employee;
}

const SupportPage: React.FC<SupportPageProps> = ({ language, employee }) => {
    const t = (ar: string, en: string) => { const map: Record<string, string> = { ar, en, fr: en, zh: en }; return map[language] || en; };

    // State
    const [tickets, setTickets] = useState<SupportTicket[]>([]);
    const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [filterStatus, setFilterStatus] = useState<TicketStatus | 'all'>('all');
    const [filterCategory, setFilterCategory] = useState<TicketCategory | 'all'>('all');
    const [responseMessage, setResponseMessage] = useState('');
    const [isInternalNote, setIsInternalNote] = useState(false);
    const [isInquiryMode, setIsInquiryMode] = useState(false);
    const [responseFiles, setResponseFiles] = useState<Attachment[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [stats, setStats] = useState({
        total: 0,
        open: 0,
        inProgress: 0,
        resolved: 0,
        avgResponseTime: '0 د',
        resolvedToday: 0
    });

    // Load tickets
    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = () => {
        supportTicketService.initializeDemoData();
        const allTickets = supportTicketService.getAllTickets();
        setTickets(allTickets);

        const statistics = supportTicketService.getStatistics();
        setStats({
            total: statistics.total,
            open: statistics.open,
            inProgress: statistics.inProgress,
            resolved: statistics.resolved,
            avgResponseTime: statistics.avgResponseTime,
            resolvedToday: statistics.resolvedToday
        });
    };

    // Filter tickets
    const filteredTickets = tickets.filter(ticket => {
        const matchesSearch =
            ticket.ticketNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
            ticket.userName.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
        const matchesCategory = filterCategory === 'all' || ticket.category === filterCategory;
        return matchesSearch && matchesStatus && matchesCategory;
    });

    // Handle status change
    const handleStatusChange = (ticketId: string, newStatus: TicketStatus) => {
        const updated = supportTicketService.updateStatus(ticketId, newStatus);
        if (updated) {
            loadTickets();
            if (selectedTicket?.id === ticketId) {
                setSelectedTicket(updated);
            }
        }
    };

    // Handle assign to self
    const handleAssignToSelf = (ticketId: string) => {
        const updated = supportTicketService.assignTicket(ticketId, employee.id, employee.name);
        if (updated) {
            loadTickets();
            if (selectedTicket?.id === ticketId) {
                setSelectedTicket(updated);
            }
        }
    };

    // Handle send response
    const handleSendResponse = () => {
        if (!selectedTicket || (!responseMessage.trim() && responseFiles.length === 0)) return;

        const updated = supportTicketService.addResponse(selectedTicket.id, {
            responderId: employee.id,
            responderName: employee.name,
            responderRole: 'support',
            message: responseMessage,
            attachments: responseFiles,
            isInternal: isInternalNote
        });

        if (updated) {
            setSelectedTicket(updated);
            setResponseMessage('');
            setIsInternalNote(false);
            setResponseFiles([]);
            loadTickets();
        }
    };

    // Handle send inquiry
    const handleSendInquiry = () => {
        if (!selectedTicket || !responseMessage.trim()) return;

        const updated = supportTicketService.sendInquiry(selectedTicket.id, {
            agentId: employee.id,
            agentName: employee.name,
            message: responseMessage,
            attachments: responseFiles
        });

        if (updated) {
            setSelectedTicket(updated);
            setResponseMessage('');
            setIsInquiryMode(false);
            setResponseFiles([]);
            loadTickets();
        }
    };

    // File upload handler
    const handleFileUpload = (files: FileList | null) => {
        if (!files) return;
        Array.from(files).forEach(file => {
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf'];
            if (!validTypes.includes(file.type)) return;
            if (file.size > 5 * 1024 * 1024) return;
            if (responseFiles.length >= 3) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                const attachment: Attachment = {
                    id: Date.now().toString(36) + Math.random().toString(36).substr(2, 5),
                    fileName: file.name,
                    fileType: file.type,
                    fileSize: file.size,
                    url: e.target?.result as string,
                    uploadedAt: new Date().toISOString()
                };
                setResponseFiles(prev => [...prev, attachment]);
            };
            reader.readAsDataURL(file);
        });
    };

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    // Get route icon
    const getRouteIcon = (route: string) => {
        switch (route) {
            case 'github': return <GitBranch className="w-4 h-4" />;
            case 'finance': return <Building className="w-4 h-4" />;
            case 'admin': return <Users className="w-4 h-4" />;
            default: return <Headphones className="w-4 h-4" />;
        }
    };

    // Stats cards
    const statCards = [
        { label: t('التذاكر المفتوحة', 'Open Tickets'), value: stats.open, color: 'text-red-400', bg: 'bg-red-500/20' },
        { label: t('قيد المعالجة', 'In Progress'), value: stats.inProgress, color: 'text-blue-400', bg: 'bg-blue-500/20' },
        { label: t('تم حلها اليوم', 'Resolved Today'), value: stats.resolvedToday, color: 'text-green-400', bg: 'bg-green-500/20' },
        { label: t('متوسط الاستجابة', 'Avg Response'), value: stats.avgResponseTime, color: 'text-amber-400', bg: 'bg-amber-500/20' },
    ];

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl p-6 border border-orange-500/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center">
                            <Headphones className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{t('مرحباً', 'Welcome')}, {employee.name}</h2>
                            <p className="text-slate-400">{t('قسم الدعم الفني', 'Technical Support Department')}</p>
                        </div>
                    </div>
                    <button
                        onClick={loadTickets}
                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-all"
                        title={t('تحديث', 'Refresh')}
                    >
                        <RefreshCw className="w-5 h-5" />
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {statCards.map((stat, index) => (
                    <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                        <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                                <span className={`text-lg font-bold ${stat.color}`}>
                                    {typeof stat.value === 'number' ? stat.value : ''}
                                </span>
                            </div>
                            <div>
                                <p className={`text-xl font-bold ${stat.color}`}>
                                    {typeof stat.value === 'string' ? stat.value : ''}
                                </p>
                                <p className="text-slate-400 text-sm">{stat.label}</p>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
                {/* Tickets List */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
                    {/* Filters */}
                    <div className="p-4 border-b border-slate-700/50">
                        <div className="flex flex-wrap gap-3">
                            <div className="flex-1 min-w-[200px] relative">
                                <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    placeholder={t('بحث...', 'Search...')}
                                    className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-4 py-2 pr-10 text-white text-sm focus:outline-none focus:border-orange-500"
                                />
                            </div>
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value as TicketStatus | 'all')}
                                className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                            >
                                <option value="all">{t('كل الحالات', 'All Status')}</option>
                                {(Object.keys(STATUS_TRANSLATIONS) as TicketStatus[]).map(status => (
                                    <option key={status} value={status}>{STATUS_TRANSLATIONS[status][language]}</option>
                                ))}
                            </select>
                            <select
                                value={filterCategory}
                                onChange={(e) => setFilterCategory(e.target.value as TicketCategory | 'all')}
                                className="bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500"
                            >
                                <option value="all">{t('كل التصنيفات', 'All Categories')}</option>
                                {(Object.keys(CATEGORY_TRANSLATIONS) as TicketCategory[]).map(cat => (
                                    <option key={cat} value={cat}>{CATEGORY_TRANSLATIONS[cat][language]}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Tickets */}
                    <div className="max-h-[500px] overflow-y-auto">
                        {filteredTickets.length === 0 ? (
                            <div className="text-center py-12">
                                <MessageSquare className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                                <p className="text-slate-400">{t('لا توجد تذاكر', 'No tickets found')}</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-700/50">
                                {filteredTickets.map(ticket => (
                                    <button
                                        key={ticket.id}
                                        onClick={() => setSelectedTicket(ticket)}
                                        className={`w-full p-4 text-start hover:bg-slate-700/30 transition-colors ${selectedTicket?.id === ticket.id ? 'bg-slate-700/50 border-r-2 border-orange-500' : ''
                                            }`}
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-500 font-mono text-xs">{ticket.ticketNumber}</span>
                                                <span className={`px-2 py-0.5 rounded-full text-xs ${PRIORITY_COLORS[ticket.priority]}`}>
                                                    {PRIORITY_TRANSLATIONS[ticket.priority][language]}
                                                </span>
                                            </div>
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${STATUS_COLORS[ticket.status]}`}>
                                                {STATUS_TRANSLATIONS[ticket.status][language]}
                                            </span>
                                        </div>
                                        <p className="text-white font-medium text-sm mb-1 line-clamp-1">{ticket.subject}</p>
                                        <div className="flex items-center gap-2 text-xs text-slate-500">
                                            <span className="flex items-center gap-1">
                                                <User className="w-3 h-3" />
                                                {ticket.userName}
                                            </span>
                                            <span>•</span>
                                            <span className="flex items-center gap-1">
                                                {getRouteIcon(ticket.routedTo)}
                                                {ticket.routedTo}
                                            </span>
                                            <span>•</span>
                                            <span>{new Date(ticket.createdAt).toLocaleDateString(t('ar-SA', 'en-US'))}</span>
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Ticket Detail */}
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
                    {selectedTicket ? (
                        <div className="flex flex-col h-full">
                            {/* Header */}
                            <div className="p-4 border-b border-slate-700/50">
                                <div className="flex items-start justify-between mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="font-mono text-orange-400">{selectedTicket.ticketNumber}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs ${PRIORITY_COLORS[selectedTicket.priority]}`}>
                                                {PRIORITY_TRANSLATIONS[selectedTicket.priority][language]}
                                            </span>
                                        </div>
                                        <h3 className="text-lg font-bold text-white">{selectedTicket.subject}</h3>
                                    </div>
                                    <button
                                        onClick={() => setSelectedTicket(null)}
                                        className="p-1 text-slate-400 hover:text-white"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                {/* Quick Actions */}
                                <div className="flex flex-wrap gap-2">
                                    <select
                                        value={selectedTicket.status}
                                        onChange={(e) => handleStatusChange(selectedTicket.id, e.target.value as TicketStatus)}
                                        className="bg-slate-700 border border-slate-600 rounded-lg px-3 py-1.5 text-white text-sm focus:outline-none"
                                    >
                                        {(Object.keys(STATUS_TRANSLATIONS) as TicketStatus[]).map(status => (
                                            <option key={status} value={status}>{STATUS_TRANSLATIONS[status][language]}</option>
                                        ))}
                                    </select>
                                    {!selectedTicket.assignedTo && (
                                        <button
                                            onClick={() => handleAssignToSelf(selectedTicket.id)}
                                            className="px-3 py-1.5 bg-blue-500/20 text-blue-400 rounded-lg text-sm hover:bg-blue-500/30 transition-colors"
                                        >
                                            {t('استلام التذكرة', 'Assign to Me')}
                                        </button>
                                    )}
                                    {selectedTicket.githubIssueUrl && (
                                        <a
                                            href={selectedTicket.githubIssueUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="px-3 py-1.5 bg-purple-500/20 text-purple-400 rounded-lg text-sm hover:bg-purple-500/30 transition-colors flex items-center gap-1"
                                        >
                                            <GitBranch className="w-4 h-4" />
                                            GitHub
                                        </a>
                                    )}
                                </div>
                            </div>

                            {/* User & Ticket Info */}
                            <div className="p-4 border-b border-slate-700/50 text-sm">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <p className="text-slate-500">{t('المرسل', 'Sender')}</p>
                                        <p className="text-white">{selectedTicket.userName}</p>
                                        <p className="text-slate-400 text-xs">{selectedTicket.userEmail}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">{t('التصنيف', 'Category')}</p>
                                        <p className="text-white">{CATEGORY_TRANSLATIONS[selectedTicket.category][language]}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">{t('تاريخ الإنشاء', 'Created')}</p>
                                        <p className="text-white">{new Date(selectedTicket.createdAt).toLocaleString(t('ar-SA', 'en-US'))}</p>
                                    </div>
                                    <div>
                                        <p className="text-slate-500">{t('مسند إلى', 'Assigned To')}</p>
                                        <p className="text-white">{selectedTicket.assignedToName || t('غير مسند', 'Unassigned')}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Description */}
                            <div className="p-4 border-b border-slate-700/50">
                                <p className="text-slate-500 text-sm mb-2">{t('الوصف', 'Description')}</p>
                                <p className="text-slate-300 text-sm whitespace-pre-wrap">{selectedTicket.description}</p>
                            </div>

                            {/* Responses */}
                            <div className="flex-1 overflow-y-auto p-4 space-y-3 max-h-[200px]">
                                {selectedTicket.responses.map(response => (
                                    <div
                                        key={response.id}
                                        className={`p-3 rounded-lg text-sm ${response.isInternal
                                                ? 'bg-amber-500/10 border border-amber-500/30'
                                                : response.responderRole === 'user'
                                                    ? 'bg-blue-500/10 border border-blue-500/30'
                                                    : 'bg-slate-700/50 border border-slate-600'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between mb-1">
                                            <span className={`font-medium ${response.isInternal ? 'text-amber-400' :
                                                    response.responderRole === 'user' ? 'text-blue-400' : 'text-orange-400'
                                                }`}>
                                                {response.responderName}
                                                {response.isInternal && <span className="text-xs mr-1">({t('ملاحظة داخلية', 'Internal')})</span>}
                                            </span>
                                            <span className="text-slate-500 text-xs">
                                                {new Date(response.createdAt).toLocaleString(t('ar-SA', 'en-US'))}
                                            </span>
                                        </div>
                                        <p className="text-slate-300">{response.message}</p>
                                        {/* Attachments */}
                                        {response.attachments && response.attachments.length > 0 && (
                                            <div className="mt-2 flex flex-wrap gap-2">
                                                {response.attachments.map(att => (
                                                    <a
                                                        key={att.id}
                                                        href={att.url}
                                                        download={att.fileName}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex items-center gap-1.5 bg-slate-600/30 hover:bg-slate-600/50 rounded-lg px-2 py-1.5 text-xs transition-colors"
                                                    >
                                                        {att.fileType.startsWith('image/') ? (
                                                            <img src={att.url} alt={att.fileName} className="w-8 h-8 object-cover rounded" />
                                                        ) : (
                                                            <FileText className="w-4 h-4 text-red-400" />
                                                        )}
                                                        <span className="text-slate-300 truncate max-w-[80px]">{att.fileName}</span>
                                                        <Download className="w-3 h-3 text-slate-400" />
                                                    </a>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>

                            {/* Response Input */}
                            {selectedTicket.status !== 'closed' && (
                                <div className="p-4 border-t border-slate-700/50">
                                    <div className="flex items-center gap-2 mb-2">
                                        <label className="flex items-center gap-2 text-sm text-slate-400 cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={isInternalNote}
                                                onChange={(e) => { setIsInternalNote(e.target.checked); setIsInquiryMode(false); }}
                                                className="rounded border-slate-600 text-amber-500 focus:ring-amber-500"
                                                disabled={isInquiryMode}
                                            />
                                            {t('ملاحظة داخلية', 'Internal Note')}
                                        </label>
                                        <span className="text-slate-600">|</span>
                                        <button
                                            onClick={() => { setIsInquiryMode(!isInquiryMode); setIsInternalNote(false); }}
                                            className={`flex items-center gap-1.5 text-sm px-3 py-1 rounded-lg transition-colors ${
                                                isInquiryMode
                                                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                                                    : 'text-slate-400 hover:text-cyan-400 hover:bg-slate-700/50'
                                            }`}
                                        >
                                            <HelpCircle className="w-4 h-4" />
                                            {t('إرسال استفسار', 'Send Inquiry')}
                                        </button>
                                    </div>
                                    <div className="flex gap-2">
                                        <div className="flex-1 space-y-2">
                                            <textarea
                                                value={responseMessage}
                                                onChange={(e) => setResponseMessage(e.target.value)}
                                                placeholder={isInquiryMode
                                                    ? t('اكتب استفسارك للمستفيد...', 'Write your inquiry to the user...')
                                                    : isInternalNote
                                                        ? t('اكتب ملاحظة داخلية...', 'Write internal note...')
                                                        : t('اكتب ردك...', 'Write your response...')}
                                                className="w-full bg-slate-700/50 border border-slate-600 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-orange-500 resize-none"
                                                rows={2}
                                            />
                                            {/* File attachment area */}
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => fileInputRef.current?.click()}
                                                    className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-orange-400 px-2 py-1.5 rounded-lg hover:bg-slate-700/50 transition-colors"
                                                >
                                                    <Paperclip className="w-4 h-4" />
                                                    {t('إرفاق ملف', 'Attach File')}
                                                </button>
                                                <input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    className="hidden"
                                                    accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
                                                    multiple
                                                    onChange={(e) => handleFileUpload(e.target.files)}
                                                />
                                                {responseFiles.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {responseFiles.map(f => (
                                                            <span key={f.id} className="flex items-center gap-1 bg-slate-700 rounded px-2 py-1 text-xs text-slate-300">
                                                                {f.fileType.startsWith('image/') ? <ImageIcon className="w-3 h-3 text-blue-400" /> : <FileText className="w-3 h-3 text-red-400" />}
                                                                <span className="truncate max-w-[80px]">{f.fileName}</span>
                                                                <button onClick={() => setResponseFiles(prev => prev.filter(x => x.id !== f.id))} className="text-slate-500 hover:text-red-400">
                                                                    <X className="w-3 h-3" />
                                                                </button>
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <button
                                            onClick={isInquiryMode ? handleSendInquiry : handleSendResponse}
                                            disabled={!responseMessage.trim() && responseFiles.length === 0}
                                            className={`px-4 rounded-lg transition-colors disabled:opacity-50 self-start ${isInquiryMode
                                                    ? 'bg-cyan-500 text-white hover:bg-cyan-600'
                                                    : isInternalNote
                                                        ? 'bg-amber-500 text-white hover:bg-amber-600'
                                                        : 'bg-orange-500 text-white hover:bg-orange-600'
                                                }`}
                                        >
                                            {isInquiryMode ? <HelpCircle className="w-5 h-5" /> : <Send className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full py-12">
                            <div className="text-center">
                                <Eye className="w-12 h-12 text-slate-500 mx-auto mb-3" />
                                <p className="text-slate-400">{t('اختر تذكرة لعرض التفاصيل', 'Select a ticket to view details')}</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SupportPage;
