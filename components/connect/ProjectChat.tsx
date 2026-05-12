import { Language } from '../../types';
/**
 * ProjectChat — شات المشروع الداخلي (محسّن)
 * رسائل نصية + صور + PDF + Excel + AutoCAD
 * عرض المرفقات داخل الشات بدون مغادرة المتصفح
 */

import React, { useState, useRef, useEffect } from 'react';
import { ChevronLeft, Send, Paperclip, Image, Tag, Reply, Trash2, CheckCheck, Check, Filter, X, ZoomIn, Download, FileText, FileSpreadsheet, PenTool, File, Eye, Hash, Truck, Building } from 'lucide-react';
import { connectService, ChatMessage, MessageCategory, formatChatTime, compressImage } from '../../services/connectService';
import { projectSupplierService, ChatChannel } from '../../services/projectSupplierService';

interface ProjectChatProps {
    language: Language;
    userId: string;
    userName: string;
    companyName?: string;
    onBack: () => void;
}

const CATEGORY_CONFIG: Record<MessageCategory, { label: { ar: string; en: string }; color: string; bg: string }> = {
    general: { label: { ar: 'عام', en: 'General' }, color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/20' },
    urgent: { label: { ar: 'عاجل', en: 'Urgent' }, color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20' },
    technical: { label: { ar: 'فني', en: 'Technical' }, color: 'text-emerald-400', bg: 'bg-emerald-500/10 border-emerald-500/20' },
    approval: { label: { ar: 'اعتماد', en: 'Approval' }, color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20' },
};

const ROLE_COLORS: Record<string, string> = {
    owner: 'from-amber-500 to-yellow-600',
    contractor: 'from-blue-500 to-indigo-600',
    engineer: 'from-emerald-500 to-teal-600',
    supplier: 'from-purple-500 to-violet-600',
    subcontractor: 'from-orange-500 to-red-600',
};

// File type detection
function getFileType(name: string): 'image' | 'pdf' | 'excel' | 'cad' | 'other' {
    const ext = name.toLowerCase().split('.').pop() || '';
    if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp', 'svg'].includes(ext)) return 'image';
    if (ext === 'pdf') return 'pdf';
    if (['xlsx', 'xls', 'csv'].includes(ext)) return 'excel';
    if (['dwg', 'dxf', 'dwf'].includes(ext)) return 'cad';
    return 'other';
}

function getFileIcon(type: string): { icon: React.ReactNode; color: string } {
    switch (type) {
        case 'image': return { icon: <Image className="w-5 h-5" />, color: 'text-emerald-400 bg-emerald-500/10' };
        case 'pdf': return { icon: <FileText className="w-5 h-5" />, color: 'text-red-400 bg-red-500/10' };
        case 'excel': return { icon: <FileSpreadsheet className="w-5 h-5" />, color: 'text-green-400 bg-green-500/10' };
        case 'cad': return { icon: <PenTool className="w-5 h-5" />, color: 'text-blue-400 bg-blue-500/10' };
        default: return { icon: <File className="w-5 h-5" />, color: 'text-slate-400 bg-slate-500/10' };
    }
}

// Read file as data URL
function fileToDataUrl(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
    });
}

// Parse CSV/Excel to table data
function parseCSV(text: string): string[][] {
    return text.split('\n').filter(r => r.trim()).map(row =>
        row.split(/[,;\t]/).map(cell => cell.replace(/^"|"$/g, '').trim())
    );
}

const ProjectChat: React.FC<ProjectChatProps> = ({ language, userId, userName, companyName, onBack }) => {
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<MessageCategory>('general');
    const [filterCategory, setFilterCategory] = useState<MessageCategory | 'all'>('all');
    const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
    const [linkedItem, setLinkedItem] = useState('');
    const [showItemInput, setShowItemInput] = useState(false);
    const [showFilters, setShowFilters] = useState(false);
    const [pendingFiles, setPendingFiles] = useState<{ file: File; dataUrl: string; type: string; name: string }[]>([]);
    const [isUploading, setIsUploading] = useState(false);

    // Channel system
    const [channels, setChannels] = useState<ChatChannel[]>([]);
    const [activeChannel, setActiveChannel] = useState<string>('ch_internal');
    const [showChannels, setShowChannels] = useState(false);

    // Viewer states
    const [viewerOpen, setViewerOpen] = useState(false);
    const [viewerType, setViewerType] = useState<'image' | 'pdf' | 'excel' | 'cad' | 'other'>('image');
    const [viewerUrl, setViewerUrl] = useState('');
    const [viewerName, setViewerName] = useState('');
    const [excelData, setExcelData] = useState<string[][]>([]);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const isRtl = language === 'ar';
    const t = (ar: string, en: string) => { const m: Record<string, string> = { ar, en, fr: en, zh: en }; return m[language] || en; };

    useEffect(() => {
        projectSupplierService.initSampleData();
        const chs = projectSupplierService.getChannels();
        setChannels(chs);
        if (chs.length > 0 && !chs.find(c => c.id === activeChannel)) {
            setActiveChannel(chs[0].id);
        }
        loadMessages();
    }, []);
    useEffect(() => { loadMessages(); }, [activeChannel]);
    useEffect(() => { messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

    const loadMessages = () => {
        const msgs = connectService.getMessages(activeChannel);
        setMessages(msgs);
        msgs.forEach(m => { if (m.id && !m.readBy.includes(userId)) connectService.markAsRead(m.id, userId); });
    };

    // Handle file selection
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        setIsUploading(true);

        const newFiles: typeof pendingFiles = [];
        const fileArray: File[] = Array.from(files) as File[];
        for (const file of fileArray) {
            const type = getFileType(file.name);
            let dataUrl: string;

            if (type === 'image') {
                // Compress images
                try {
                    const { blob } = await compressImage(file as File);
                    const reader = new FileReader();
                    dataUrl = await new Promise<string>((resolve) => {
                        reader.onload = () => resolve(reader.result as string);
                        reader.readAsDataURL(blob);
                    });
                } catch {
                    dataUrl = await fileToDataUrl(file as File);
                }
            } else {
                dataUrl = await fileToDataUrl(file as File);
            }

            newFiles.push({ file: file as File, dataUrl, type, name: file.name });
        }

        setPendingFiles(prev => [...prev, ...newFiles]);
        setIsUploading(false);
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const removePendingFile = (index: number) => {
        setPendingFiles(prev => prev.filter((_, i) => i !== index));
    };

    const handleSend = () => {
        if (!newMessage.trim() && pendingFiles.length === 0) return;

        const attachments = pendingFiles.map(f => ({
            url: f.dataUrl,
            name: f.name,
            size: f.file.size,
            type: f.file.type || f.type,
        }));

        connectService.sendMessage({
            channelId: activeChannel,
            senderId: userId,
            senderName: userName,
            senderRole: 'contractor',
            content: newMessage.trim(),
            type: pendingFiles.length > 0 ? (pendingFiles[0].type === 'image' ? 'image' : 'file') : 'text',
            category: selectedCategory,
            linkedItemCode: linkedItem || undefined,
            attachments,
            replyTo: replyTo?.id || undefined,
            replyToPreview: replyTo ? replyTo.content.substring(0, 50) : undefined,
        });

        setNewMessage('');
        setReplyTo(null);
        setLinkedItem('');
        setShowItemInput(false);
        setPendingFiles([]);
        loadMessages();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    // Open file viewer
    const openViewer = async (url: string, name: string) => {
        const type = getFileType(name);
        setViewerType(type);
        setViewerUrl(url);
        setViewerName(name);

        if (type === 'excel' && url.startsWith('data:')) {
            // Try to decode CSV/text data
            try {
                const base64 = url.split(',')[1];
                const text = atob(base64);
                const rows = parseCSV(text);
                setExcelData(rows);
            } catch {
                setExcelData([['Unable to parse file']]);
            }
        }

        setViewerOpen(true);
    };

    const downloadFile = (url: string, name: string) => {
        const a = document.createElement('a');
        a.href = url;
        a.download = name;
        a.click();
    };

    const filteredMessages = filterCategory === 'all' ? messages : messages.filter(m => m.category === filterCategory);

    // ═══════════════════════════════════════════════
    // FILE VIEWER — INLINE MODAL (not fullscreen)
    // ═══════════════════════════════════════════════

    const renderFileViewer = () => {
        if (!viewerOpen) return null;

        return (
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-3 sm:p-6" dir={isRtl ? 'rtl' : 'ltr'} onClick={() => setViewerOpen(false)}>
                {/* Modal Container — contained with max dimensions */}
                <div
                    className="bg-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Modal Header */}
                    <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/50 shrink-0">
                        <div className="flex items-center gap-2.5 min-w-0">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${getFileIcon(viewerType).color}`}>
                                {getFileIcon(viewerType).icon}
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-semibold text-white truncate">{viewerName}</p>
                                <p className="text-[10px] text-slate-400">
                                    {viewerType === 'image' ? t('صورة', 'Image') :
                                        viewerType === 'pdf' ? 'PDF' :
                                            viewerType === 'excel' ? 'Excel / CSV' :
                                                viewerType === 'cad' ? 'AutoCAD' : t('ملف', 'File')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                            <button
                                onClick={() => downloadFile(viewerUrl, viewerName)}
                                className="px-2.5 py-1.5 bg-slate-700/60 hover:bg-slate-600/60 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                            >
                                <Download className="w-3.5 h-3.5" />
                                {t('تحميل', 'Download')}
                            </button>
                            <button onClick={() => setViewerOpen(false)} className="p-1.5 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-colors">
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Modal Body */}
                    <div className="flex-1 overflow-auto p-4">
                        {/* IMAGE */}
                        {viewerType === 'image' && (
                            <div className="flex items-center justify-center">
                                <img
                                    src={viewerUrl}
                                    alt={viewerName}
                                    className="max-w-full max-h-[60vh] object-contain rounded-xl"
                                />
                            </div>
                        )}

                        {/* PDF */}
                        {viewerType === 'pdf' && (
                            <iframe
                                src={viewerUrl}
                                className="w-full h-[60vh] rounded-xl border border-slate-700/30 bg-white"
                                title={viewerName}
                            />
                        )}

                        {/* EXCEL/CSV */}
                        {viewerType === 'excel' && (
                            <div className="border border-slate-700/30 rounded-xl overflow-hidden">
                                <div className="px-3 py-2 bg-slate-700/30 border-b border-slate-700/30 flex items-center gap-2">
                                    <FileSpreadsheet className="w-3.5 h-3.5 text-green-400" />
                                    <span className="text-xs font-medium text-slate-300">{excelData.length} {t('صف', 'rows')}</span>
                                </div>
                                <div className="overflow-auto max-h-[55vh]">
                                    <table className="w-full text-xs">
                                        <thead className="sticky top-0">
                                            {excelData.length > 0 && (
                                                <tr>
                                                    <th className="py-2 px-3 text-right text-slate-400 border-b border-slate-700/50 bg-slate-800">#</th>
                                                    {excelData[0].map((cell, i) => (
                                                        <th key={i} className="py-2 px-3 text-right text-slate-300 font-semibold border-b border-slate-700/50 bg-slate-800 whitespace-nowrap">
                                                            {cell}
                                                        </th>
                                                    ))}
                                                </tr>
                                            )}
                                        </thead>
                                        <tbody>
                                            {excelData.slice(1).map((row, i) => (
                                                <tr key={i} className="border-b border-slate-700/20 hover:bg-slate-700/20">
                                                    <td className="py-1.5 px-3 text-slate-500">{i + 1}</td>
                                                    {row.map((cell, j) => (
                                                        <td key={j} className="py-1.5 px-3 text-slate-300 whitespace-nowrap">{cell}</td>
                                                    ))}
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

                        {/* CAD */}
                        {viewerType === 'cad' && (
                            <div className="text-center py-6">
                                <div className="w-16 h-16 mx-auto mb-3 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                    <PenTool className="w-8 h-8 text-blue-400" />
                                </div>
                                <h3 className="text-base font-bold text-white mb-1">{viewerName}</h3>
                                <p className="text-xs text-slate-400 mb-4 max-w-xs mx-auto">
                                    {t('ملف AutoCAD — حمّل الملف وافتحه في AutoCAD', 'AutoCAD file — Download and open in AutoCAD')}
                                </p>
                                <button
                                    onClick={() => downloadFile(viewerUrl, viewerName)}
                                    className="px-5 py-2.5 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 mx-auto shadow-lg active:scale-95 transition-all"
                                >
                                    <Download className="w-4 h-4" />
                                    {t('تحميل', 'Download')}
                                </button>
                                <p className="text-[10px] text-slate-500 mt-2">DWG · DXF · DWF</p>
                            </div>
                        )}

                        {/* OTHER */}
                        {viewerType === 'other' && (
                            <div className="text-center py-6">
                                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-slate-700/50 flex items-center justify-center">
                                    <File className="w-7 h-7 text-slate-400" />
                                </div>
                                <h3 className="text-base font-bold text-white mb-3">{viewerName}</h3>
                                <button
                                    onClick={() => downloadFile(viewerUrl, viewerName)}
                                    className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl text-sm font-bold flex items-center gap-2 mx-auto transition-all"
                                >
                                    <Download className="w-4 h-4" />
                                    {t('تحميل', 'Download')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    // ═══════════════════════════════════════════════
    // MAIN CHAT VIEW
    // ═══════════════════════════════════════════════

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* File Viewer Overlay */}
            {renderFileViewer()}
            <header className="bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-30 shrink-0">
                <div className="max-w-4xl mx-auto px-3 sm:px-6 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button onClick={onBack} className="p-2 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-colors">
                            <ChevronLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                        </button>
                        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center">
                            <span className="text-lg">{channels.find(c => c.id === activeChannel)?.icon || '💬'}</span>
                        </div>
                        <div>
                            <h1 className="text-base sm:text-lg font-bold text-white">
                                {channels.find(c => c.id === activeChannel)?.name[language] || t('الشات', 'Chat')}
                            </h1>
                            <p className="text-[10px] sm:text-xs text-slate-400">
                                {messages.length} {t('رسالة', 'messages')}
                                {channels.find(c => c.id === activeChannel)?.type === 'supplier' && <span className="text-orange-400 ms-1">🚛 {t('مورد', 'Supplier')}</span>}
                                {channels.find(c => c.id === activeChannel)?.type === 'internal' && <span className="text-blue-400 ms-1">🏢 {t('داخلي', 'Internal')}</span>}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowFilters(!showFilters)}
                        className={`p-2 rounded-xl transition-colors ${showFilters ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:bg-slate-700/50 hover:text-white'}`}
                    >
                        <Filter className="w-4 h-4" />
                    </button>
                </div>

                {/* ═══ Channel Switcher ═══ */}
                <div className="max-w-4xl mx-auto px-3 sm:px-6 pb-2 flex gap-1.5 overflow-x-auto scrollbar-hide">
                    {channels.map(ch => {
                        const isActive = ch.id === activeChannel;
                        const typeColor = ch.type === 'internal' ? 'from-blue-500 to-indigo-600' :
                            ch.type === 'supplier' ? 'from-orange-500 to-red-500' :
                                'from-emerald-500 to-teal-500';
                        return (
                            <button key={ch.id} onClick={() => setActiveChannel(ch.id)}
                                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-[10px] sm:text-xs font-medium whitespace-nowrap transition-all shrink-0 border ${isActive
                                    ? `bg-gradient-to-r ${typeColor} text-white border-transparent shadow-lg`
                                    : 'bg-slate-800/60 text-slate-400 hover:bg-slate-700/50 border-slate-700/30'
                                    }`}>
                                <span className="text-sm">{ch.icon}</span>
                                {ch.name[language]}
                                {ch.unreadCount > 0 && !isActive && (
                                    <span className="w-4 h-4 bg-red-500 rounded-full text-[8px] text-white flex items-center justify-center">{ch.unreadCount}</span>
                                )}
                            </button>
                        );
                    })}
                </div>

                {/* Category Filter */}
                {showFilters && (
                    <div className="max-w-4xl mx-auto px-3 sm:px-6 pb-3 flex gap-2 overflow-x-auto">
                        <button onClick={() => setFilterCategory('all')}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${filterCategory === 'all' ? 'bg-slate-600 text-white' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}>
                            {t('الكل', 'All')}
                        </button>
                        {(Object.keys(CATEGORY_CONFIG) as MessageCategory[]).map(cat => (
                            <button key={cat} onClick={() => setFilterCategory(cat)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap border ${filterCategory === cat ? CATEGORY_CONFIG[cat].bg + ' ' + CATEGORY_CONFIG[cat].color : 'bg-slate-800 text-slate-400 hover:bg-slate-700 border-transparent'}`}>
                                {CATEGORY_CONFIG[cat].label[language]}
                            </button>
                        ))}
                    </div>
                )}
            </header>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-3">
                <div className="max-w-4xl mx-auto space-y-3">
                    {filteredMessages.length === 0 ? (
                        <div className="text-center py-16">
                            <span className="text-5xl block mb-3">💬</span>
                            <p className="text-slate-400 text-sm">{t('لا توجد رسائل بعد', 'No messages yet')}</p>
                            <p className="text-slate-600 text-xs mt-1">{t('ابدأ المحادثة الآن!', 'Start the conversation!')}</p>
                        </div>
                    ) : (
                        filteredMessages.map((msg, i) => {
                            const isMine = msg.senderId === userId;
                            const roleColor = ROLE_COLORS[msg.senderRole] || 'from-slate-500 to-slate-600';

                            return (
                                <div key={msg.id || i} className={`flex gap-2 sm:gap-3 ${isMine ? 'flex-row-reverse' : ''} group`}>
                                    {/* Avatar */}
                                    <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br ${roleColor} flex items-center justify-center shrink-0 shadow-lg`}>
                                        <span className="text-[10px] sm:text-xs font-bold text-white">{msg.senderName.charAt(0)}</span>
                                    </div>

                                    {/* Message Bubble */}
                                    <div className={`max-w-[80%] sm:max-w-[70%] ${isMine ? 'items-end' : 'items-start'}`}>
                                        {!isMine && <p className="text-[10px] text-slate-500 mb-0.5 px-1">{msg.senderName}</p>}

                                        <div className={`rounded-2xl px-3 sm:px-4 py-2 sm:py-2.5 ${isMine ? 'bg-blue-600/90 text-white' : 'bg-slate-700/60 text-slate-100'
                                            } ${msg.category === 'urgent' ? 'border border-red-500/30' : ''}`}>

                                            {/* Reply preview */}
                                            {msg.replyToPreview && (
                                                <div className={`text-[10px] px-2 py-1 mb-1.5 rounded-lg border-r-2 ${isMine ? 'bg-blue-700/50 border-blue-300' : 'bg-slate-600/50 border-slate-400'}`}>
                                                    <Reply className="w-3 h-3 inline-block ml-1" />
                                                    {msg.replyToPreview}...
                                                </div>
                                            )}

                                            {/* Category badge */}
                                            {msg.category !== 'general' && (
                                                <span className={`inline-block text-[9px] px-1.5 py-0.5 rounded-full mb-1 ${CATEGORY_CONFIG[msg.category].bg} ${CATEGORY_CONFIG[msg.category].color} border`}>
                                                    {CATEGORY_CONFIG[msg.category].label[language]}
                                                </span>
                                            )}

                                            {/* Text content */}
                                            {msg.content && <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>}

                                            {/* ═══ ATTACHMENTS ═══ */}
                                            {msg.attachments && msg.attachments.length > 0 && (
                                                <div className="mt-2 space-y-2">
                                                    {msg.attachments.map((att, ai) => {
                                                        const fileType = getFileType(att.name);
                                                        const { icon, color } = getFileIcon(fileType);

                                                        // IMAGE INLINE PREVIEW
                                                        if (fileType === 'image') {
                                                            return (
                                                                <div key={ai} className="relative group/img cursor-pointer" onClick={() => openViewer(att.url, att.name)}>
                                                                    <img
                                                                        src={att.url}
                                                                        alt={att.name}
                                                                        className="max-w-full max-h-48 rounded-lg border border-white/10 object-cover"
                                                                        loading="lazy"
                                                                    />
                                                                    <div className="absolute inset-0 bg-black/40 rounded-lg opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                                                        <ZoomIn className="w-6 h-6 text-white" />
                                                                    </div>
                                                                    <span className="absolute bottom-1 right-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded">{att.name}</span>
                                                                </div>
                                                            );
                                                        }

                                                        // PDF / EXCEL / CAD / OTHER — File card
                                                        return (
                                                            <div
                                                                key={ai}
                                                                onClick={() => openViewer(att.url, att.name)}
                                                                className={`flex items-center gap-3 p-2.5 rounded-xl border cursor-pointer transition-all hover:scale-[1.01] ${isMine ? 'bg-blue-700/30 border-blue-400/20 hover:bg-blue-700/50' : 'bg-slate-600/30 border-slate-500/20 hover:bg-slate-600/50'
                                                                    }`}
                                                            >
                                                                <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${color}`}>
                                                                    {icon}
                                                                </div>
                                                                <div className="min-w-0 flex-1">
                                                                    <p className="text-xs font-medium truncate">{att.name}</p>
                                                                    <p className={`text-[10px] ${isMine ? 'text-blue-200' : 'text-slate-400'}`}>
                                                                        {fileType === 'pdf' ? 'PDF' :
                                                                            fileType === 'excel' ? 'Excel / CSV' :
                                                                                fileType === 'cad' ? 'AutoCAD' : t('ملف', 'File')}
                                                                        {att.size > 0 && ` · ${(att.size / 1024).toFixed(0)} KB`}
                                                                    </p>
                                                                </div>
                                                                <Eye className="w-4 h-4 shrink-0 opacity-50" />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            )}

                                            {/* Linked item */}
                                            {msg.linkedItemCode && (
                                                <div className={`mt-1.5 text-[10px] px-2 py-0.5 rounded-lg inline-flex items-center gap-1 ${isMine ? 'bg-blue-700/50' : 'bg-slate-600/50'}`}>
                                                    <Tag className="w-3 h-3" />
                                                    {t('بند', 'Item')}: {msg.linkedItemCode}
                                                </div>
                                            )}

                                            {/* Time + read */}
                                            <div className={`flex items-center gap-1 mt-1 ${isMine ? 'justify-end' : 'justify-start'}`}>
                                                <span className={`text-[9px] ${isMine ? 'text-blue-200' : 'text-slate-500'}`}>{formatChatTime(msg.createdAt)}</span>
                                                {isMine && (msg.readBy.length > 1 ? <CheckCheck className="w-3 h-3 text-blue-200" /> : <Check className="w-3 h-3 text-blue-300/50" />)}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 mt-0.5 px-1">
                                            <button onClick={() => setReplyTo(msg)} className="p-1 text-slate-500 hover:text-blue-400 transition-colors">
                                                <Reply className="w-3.5 h-3.5" />
                                            </button>
                                            {isMine && (
                                                <button onClick={() => { connectService.deleteMessage(msg.id!); loadMessages(); }} className="p-1 text-slate-500 hover:text-red-400 transition-colors">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={messagesEndRef} />
                </div>
            </div>

            {/* Reply Preview */}
            {replyTo && (
                <div className="bg-slate-800/80 border-t border-slate-700/50 px-3 sm:px-6 py-2">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                            <Reply className="w-4 h-4 text-blue-400 shrink-0" />
                            <div className="min-w-0">
                                <p className="text-[10px] text-blue-400 font-medium">{t('رد على', 'Replying to')} {replyTo.senderName}</p>
                                <p className="text-xs text-slate-400 truncate">{replyTo.content.substring(0, 60)}</p>
                            </div>
                        </div>
                        <button onClick={() => setReplyTo(null)} className="p-1 text-slate-500 hover:text-white">✕</button>
                    </div>
                </div>
            )}

            {/* Pending files preview */}
            {pendingFiles.length > 0 && (
                <div className="bg-slate-800/80 border-t border-slate-700/50 px-3 sm:px-6 py-2">
                    <div className="max-w-4xl mx-auto flex gap-2 overflow-x-auto pb-1">
                        {pendingFiles.map((pf, i) => {
                            const { icon, color } = getFileIcon(pf.type);
                            return (
                                <div key={i} className="relative shrink-0">
                                    {pf.type === 'image' ? (
                                        <img src={pf.dataUrl} alt={pf.name} className="w-16 h-16 object-cover rounded-lg border border-slate-600" />
                                    ) : (
                                        <div className={`w-16 h-16 rounded-lg border border-slate-600 flex flex-col items-center justify-center gap-1 ${color}`}>
                                            {icon}
                                            <span className="text-[8px] text-slate-400 truncate max-w-[56px]">{pf.name.split('.').pop()?.toUpperCase()}</span>
                                        </div>
                                    )}
                                    <button
                                        onClick={() => removePendingFile(i)}
                                        className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center text-white text-[8px]"
                                    >✕</button>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Input Area */}
            <div className="bg-slate-800/60 backdrop-blur-xl border-t border-slate-700/50 px-3 sm:px-6 py-3 shrink-0">
                <div className="max-w-4xl mx-auto">
                    {/* Category + item link */}
                    <div className="flex items-center gap-2 mb-2 overflow-x-auto">
                        {(Object.keys(CATEGORY_CONFIG) as MessageCategory[]).map(cat => (
                            <button key={cat} onClick={() => setSelectedCategory(cat)}
                                className={`px-2 sm:px-3 py-1 rounded-lg text-[10px] sm:text-xs font-medium transition-colors whitespace-nowrap border ${selectedCategory === cat ? CATEGORY_CONFIG[cat].bg + ' ' + CATEGORY_CONFIG[cat].color : 'bg-slate-800 text-slate-500 hover:bg-slate-700 border-transparent'
                                    }`}>
                                {CATEGORY_CONFIG[cat].label[language]}
                            </button>
                        ))}
                        <button onClick={() => setShowItemInput(!showItemInput)}
                            className={`px-2 py-1 rounded-lg text-[10px] sm:text-xs transition-colors flex items-center gap-1 ${showItemInput || linkedItem ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:text-slate-300'
                                }`}>
                            <Tag className="w-3 h-3" />
                            {linkedItem || t('ربط بند', 'Link Item')}
                        </button>
                    </div>

                    {showItemInput && (
                        <input type="text" value={linkedItem} onChange={e => setLinkedItem(e.target.value)}
                            placeholder={t('رقم البند (مثال: 11.01)', 'Item code (e.g. 11.01)')}
                            className="w-full bg-slate-700/50 border border-slate-600/50 rounded-lg px-3 py-1.5 text-xs text-white placeholder-slate-500 mb-2 focus:outline-none focus:border-emerald-500/50"
                        />
                    )}

                    {/* Message input + file upload */}
                    <div className="flex items-end gap-2">
                        {/* Attachment button */}
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="p-2.5 sm:p-3 rounded-xl text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors shrink-0"
                            title={t('إرفاق ملف', 'Attach file')}
                        >
                            <Paperclip className="w-5 h-5" />
                        </button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept="image/*,.pdf,.xlsx,.xls,.csv,.dwg,.dxf,.dwf,.doc,.docx"
                            onChange={handleFileSelect}
                            className="hidden"
                        />

                        {/* Text input */}
                        <div className="flex-1 bg-slate-700/50 border border-slate-600/30 rounded-xl overflow-hidden focus-within:border-blue-500/50 transition-colors">
                            <textarea
                                ref={inputRef}
                                value={newMessage}
                                onChange={e => setNewMessage(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder={t('اكتب رسالة أو أرفق ملف...', 'Type a message or attach a file...')}
                                rows={1}
                                className="w-full bg-transparent px-3 sm:px-4 py-2.5 text-sm text-white placeholder-slate-500 resize-none focus:outline-none max-h-24"
                                style={{ minHeight: '42px' }}
                            />
                        </div>

                        {/* Send */}
                        <button
                            onClick={handleSend}
                            disabled={!newMessage.trim() && pendingFiles.length === 0}
                            className={`p-2.5 sm:p-3 rounded-xl transition-all shrink-0 ${(newMessage.trim() || pendingFiles.length > 0)
                                ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 active:scale-95'
                                : 'bg-slate-700 text-slate-500'
                                }`}
                        >
                            <Send className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                        </button>
                    </div>

                    {/* Supported formats hint */}
                    <p className="text-[9px] text-slate-600 mt-1.5 flex items-center gap-1">
                        <Paperclip className="w-2.5 h-2.5" />
                        {t('الملفات المدعومة: صور، PDF، Excel، AutoCAD', 'Supported: Images, PDF, Excel, AutoCAD')}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default ProjectChat;
