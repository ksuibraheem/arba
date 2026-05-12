/**
 * لوحة تحكم عضو فريق المشروع — Construction Slate Theme
 * TeamDashboard — All buttons FUNCTIONAL with real state management
 * Colors: Deep Slate (#0F172A), Emerald success, Orange alerts
 */

import React, { useState, useRef, useEffect } from 'react';
import {
    LogOut, MessageCircle, Camera, FileText, ClipboardList,
    BarChart3, Shield, Users, Building2, Phone, Clock,
    ChevronLeft, ChevronRight, Upload, Image,
    Send, Plus, Eye, Activity, HardHat, X,
    CheckCircle2, Trash2, Download
} from 'lucide-react';
import { ProjectMember, PROJECT_ROLES, ProjectMemberPermissions } from '../services/projectSupplierService';
import { Language } from '../types';

interface TeamDashboardProps {
    language: Language;
    member: ProjectMember;
    onLogout: () => void;
    onNavigate: (page: string) => void;
}

type ActiveTool = 'home' | 'chat' | 'photos' | 'invoices' | 'forms' | 'reports';

interface ChatMessage {
    id: string;
    sender: string;
    senderInitial: string;
    text: string;
    time: string;
    isOwn: boolean;
}

interface SitePhoto {
    id: string;
    label: string;
    date: string;
    dataUrl?: string; // real image data
}

interface Invoice {
    id: string;
    vendor: string;
    amount: string;
    status: 'paid' | 'pending' | 'draft';
}

const TeamDashboard: React.FC<TeamDashboardProps> = ({ language, member, onLogout, onNavigate }) => {
    const isRtl = language === 'ar';
    const t = (ar: string, en: string) => { const map: Record<string, string> = { ar, en, fr: en, zh: en }; return map[language] || en; };
    const [activeTool, setActiveTool] = useState<ActiveTool>('home');

    // ===== REAL STATE for Chat =====
    const [chatInput, setChatInput] = useState('');
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
        { id: '1', sender: t('م. خالد الشمري', 'K. Al-Shamri'), senderInitial: 'خ', text: t('يرجى رفع صور التقدم اليومي قبل نهاية الدوام', 'Please upload daily progress photos before end of shift'), time: '10:30 AM', isOwn: false },
        { id: '2', sender: member.employeeName, senderInitial: member.employeeName.charAt(0), text: t('تم، سأرفعها خلال ساعة', 'Done, I will upload them within an hour'), time: '10:45 AM', isOwn: true },
    ]);
    const chatEndRef = useRef<HTMLDivElement>(null);

    // ===== REAL STATE for Photos =====
    const [photos, setPhotos] = useState<SitePhoto[]>([
        { id: 'p1', label: t('الأساسات', 'Foundation'), date: '12/04' },
        { id: 'p2', label: t('الحديد', 'Steel'), date: '12/03' },
        { id: 'p3', label: t('الصب', 'Concrete'), date: '12/02' },
        { id: 'p4', label: t('الكهرباء', 'Electrical'), date: '12/01' },
        { id: 'p5', label: t('السباكة', 'Plumbing'), date: '11/30' },
    ]);
    const photoInputRef = useRef<HTMLInputElement>(null);

    // ===== REAL STATE for Invoices =====
    const [invoices, setInvoices] = useState<Invoice[]>([
        { id: '#INV-001', vendor: t('مصنع الشرقية', 'Eastern Factory'), amount: '45,000', status: 'paid' },
        { id: '#INV-002', vendor: t('اليمامة للإسمنت', 'Yamama Cement'), amount: '12,300', status: 'pending' },
        { id: '#INV-003', vendor: t('النور للكهربائيات', 'Al-Nour Electric'), amount: '8,750', status: 'draft' },
    ]);
    const [showInvoiceForm, setShowInvoiceForm] = useState(false);
    const [newInvVendor, setNewInvVendor] = useState('');
    const [newInvAmount, setNewInvAmount] = useState('');

    // ===== REAL STATE for Forms =====
    const [formEntries, setFormEntries] = useState([
        { id: 'f1', title: t('نموذج استلام مواد', 'Material Receipt Form'), count: 5, color: 'bg-emerald-500', expanded: false },
        { id: 'f2', title: t('تقرير تقدم يومي', 'Daily Progress Report'), count: 22, color: 'bg-blue-500', expanded: false },
        { id: 'f3', title: t('محضر اجتماع', 'Meeting Minutes'), count: 3, color: 'bg-orange-500', expanded: false },
    ]);

    const roleInfo = PROJECT_ROLES[member.role] || PROJECT_ROLES.custom;

    const tools: { key: keyof ProjectMemberPermissions; tool: ActiveTool; icon: React.ReactNode; label: { ar: string; en: string }; color: string; accent: string; desc: { ar: string; en: string } }[] = [
        { key: 'chat', tool: 'chat', icon: <MessageCircle className="w-6 h-6" />, label: { ar: 'المحادثات', en: 'Chat' }, color: 'from-blue-500/15 to-blue-600/5', accent: 'text-blue-400', desc: { ar: 'تواصل مع الفريق', en: 'Team Communication' } },
        { key: 'photos', tool: 'photos', icon: <Camera className="w-6 h-6" />, label: { ar: 'صور الموقع', en: 'Site Photos' }, color: 'from-emerald-500/15 to-emerald-600/5', accent: 'text-emerald-400', desc: { ar: 'توثيق العمل', en: 'Work Documentation' } },
        { key: 'invoices', tool: 'invoices', icon: <FileText className="w-6 h-6" />, label: { ar: 'الفواتير', en: 'Invoices' }, color: 'from-amber-500/15 to-amber-600/5', accent: 'text-amber-400', desc: { ar: 'إدارة الحسابات', en: 'Account Management' } },
        { key: 'forms', tool: 'forms', icon: <ClipboardList className="w-6 h-6" />, label: { ar: 'النماذج', en: 'Forms' }, color: 'from-orange-500/15 to-orange-600/5', accent: 'text-orange-400', desc: { ar: 'نماذج العمل', en: 'Work Forms' } },
        { key: 'reports', tool: 'reports', icon: <BarChart3 className="w-6 h-6" />, label: { ar: 'التقارير', en: 'Reports' }, color: 'from-cyan-500/15 to-cyan-600/5', accent: 'text-cyan-400', desc: { ar: 'تقارير الأداء', en: 'Performance Reports' } },
    ];

    const allowedTools = tools.filter(tool => member.permissions[tool.key]);

    // Scroll chat to bottom on new message
    useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [chatMessages]);

    // ===== CHAT: Send Message Function =====
    const sendMessage = () => {
        const text = chatInput.trim();
        if (!text) return;
        const now = new Date();
        const timeStr = now.toLocaleTimeString(t('ar-SA', 'en-US'), { hour: '2-digit', minute: '2-digit', hour12: true });
        const newMsg: ChatMessage = {
            id: `msg_${Date.now()}`,
            sender: member.employeeName,
            senderInitial: member.employeeName.charAt(0),
            text, time: timeStr, isOwn: true,
        };
        setChatMessages(prev => [...prev, newMsg]);
        setChatInput('');
        // Simulate auto-reply after 2 seconds
        setTimeout(() => {
            const replies = [
                t('تمام، ممتاز 👍', 'Great, excellent 👍'),
                t('شكراً على التحديث', 'Thanks for the update'),
                t('تم الاستلام ✓', 'Received ✓'),
                t('أحسنت، استمر', 'Well done, keep going'),
            ];
            const autoReply: ChatMessage = {
                id: `msg_${Date.now() + 1}`,
                sender: t('م. خالد الشمري', 'K. Al-Shamri'),
                senderInitial: 'خ',
                text: replies[Math.floor(Math.random() * replies.length)],
                time: new Date().toLocaleTimeString(t('ar-SA', 'en-US'), { hour: '2-digit', minute: '2-digit', hour12: true }),
                isOwn: false,
            };
            setChatMessages(prev => [...prev, autoReply]);
        }, 2000);
    };

    // ===== PHOTOS: Upload handler =====
    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files) return;
        Array.from(files).forEach((file: File) => {
            const reader = new FileReader();
            reader.onload = (ev) => {
                const now = new Date();
                const dateStr = `${String(now.getMonth() + 1).padStart(2, '0')}/${String(now.getDate()).padStart(2, '0')}`;
                const newPhoto: SitePhoto = {
                    id: `p_${Date.now()}_${Math.random()}`,
                    label: file.name.replace(/\.[^.]+$/, '').slice(0, 15),
                    date: dateStr,
                    dataUrl: ev.target?.result as string,
                };
                setPhotos(prev => [...prev, newPhoto]);
            };
            reader.readAsDataURL(file);
        });
        e.target.value = ''; // reset input
    };

    const deletePhoto = (id: string) => {
        setPhotos(prev => prev.filter(p => p.id !== id));
    };

    // ===== INVOICES: Add new invoice =====
    const addInvoice = () => {
        if (!newInvVendor.trim() || !newInvAmount.trim()) return;
        const count = invoices.length + 1;
        const newInv: Invoice = {
            id: `#INV-${String(count).padStart(3, '0')}`,
            vendor: newInvVendor,
            amount: Number(newInvAmount).toLocaleString(),
            status: 'draft',
        };
        setInvoices(prev => [...prev, newInv]);
        setNewInvVendor(''); setNewInvAmount('');
        setShowInvoiceForm(false);
    };

    const toggleInvoiceStatus = (id: string) => {
        setInvoices(prev => prev.map(inv => {
            if (inv.id !== id) return inv;
            const nextStatus = inv.status === 'draft' ? 'pending' : inv.status === 'pending' ? 'paid' : 'draft';
            return { ...inv, status: nextStatus };
        }));
    };

    // ===== FORMS: Toggle expand =====
    const toggleForm = (id: string) => {
        setFormEntries(prev => prev.map(f => f.id === id ? { ...f, expanded: !f.expanded } : f));
    };

    // ============= Widget Panels =============

    const renderChatWidget = () => (
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden h-full flex flex-col">
            <div className="px-4 py-3 border-b border-slate-700/30 flex items-center justify-between bg-slate-800/40">
                <h3 className="text-white font-bold text-sm flex items-center gap-2" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                    <MessageCircle className="w-4 h-4 text-blue-400" />
                    {t('محادثة المشروع', 'Project Chat')}
                    <span className="text-slate-500 text-[10px] font-normal">({chatMessages.length})</span>
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <div className="flex-1 p-4 space-y-3 overflow-y-auto max-h-[400px]">
                {/* System message */}
                <div className="text-center">
                    <span className="text-[10px] text-slate-500 bg-slate-800/50 px-3 py-1 rounded-full">{t('اليوم', 'Today')}</span>
                </div>
                {chatMessages.map(msg => (
                    msg.isOwn ? (
                        <div key={msg.id} className="flex gap-2.5 justify-end animate-fade-in">
                            <div className="bg-emerald-500/15 rounded-xl rounded-te-none px-3 py-2 max-w-[80%] border border-emerald-500/10">
                                <p className="text-sm text-slate-200">{msg.text}</p>
                                <p className="text-[10px] text-emerald-400/60 mt-1">{msg.time} ✓✓</p>
                            </div>
                        </div>
                    ) : (
                        <div key={msg.id} className="flex gap-2.5 animate-fade-in">
                            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center text-emerald-400 text-xs font-bold flex-shrink-0">{msg.senderInitial}</div>
                            <div className="bg-slate-700/30 rounded-xl rounded-ts-none px-3 py-2 max-w-[80%] border border-slate-700/20">
                                <p className="text-[11px] text-emerald-400 font-semibold mb-0.5">{msg.sender}</p>
                                <p className="text-sm text-slate-200">{msg.text}</p>
                                <p className="text-[10px] text-slate-500 mt-1">{msg.time}</p>
                            </div>
                        </div>
                    )
                ))}
                <div ref={chatEndRef} />
            </div>
            <div className="p-3 border-t border-slate-700/30 bg-slate-800/20">
                <div className="flex gap-2">
                    <input
                        type="text" value={chatInput} onChange={e => setChatInput(e.target.value)}
                        placeholder={t('اكتب رسالة...', 'Type a message...')}
                        className="flex-1 bg-slate-900/50 border border-slate-700/40 rounded-xl px-4 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/40 transition-colors"
                        onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
                    />
                    <button onClick={sendMessage} disabled={!chatInput.trim()}
                        className={`px-3 rounded-xl text-white transition-all active:scale-95 ${chatInput.trim() ? 'bg-emerald-500 hover:bg-emerald-600' : 'bg-slate-700 text-slate-500 cursor-not-allowed'}`}>
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    );

    const renderPhotosWidget = () => (
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden h-full">
            {/* Hidden file input */}
            <input ref={photoInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handlePhotoUpload} />
            <div className="px-4 py-3 border-b border-slate-700/30 flex items-center justify-between bg-slate-800/40">
                <h3 className="text-white font-bold text-sm flex items-center gap-2" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                    <Camera className="w-4 h-4 text-emerald-400" />
                    {t('صور الموقع', 'Site Photos')}
                    <span className="text-slate-500 text-[10px] font-normal">({photos.length})</span>
                </h3>
                <button onClick={() => photoInputRef.current?.click()}
                    className="px-2.5 py-1 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded-lg text-[11px] font-medium flex items-center gap-1 hover:bg-emerald-500/25 transition-colors active:scale-95">
                    <Upload className="w-3 h-3" />
                    {t('رفع', 'Upload')}
                </button>
            </div>
            <div className="p-4 grid grid-cols-3 gap-2.5 max-h-[400px] overflow-y-auto">
                {photos.map((photo) => (
                    <div key={photo.id} className="aspect-square rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer group bg-slate-700/20 border border-slate-700/30 hover:border-emerald-500/30 relative overflow-hidden">
                        {photo.dataUrl ? (
                            <img src={photo.dataUrl} alt={photo.label} className="w-full h-full object-cover rounded-xl" />
                        ) : (
                            <>
                                <Image className="w-6 h-6 text-slate-500 group-hover:text-emerald-400 transition-colors mb-1" />
                                <p className="text-[9px] text-slate-500 font-medium">{photo.label}</p>
                                <p className="text-[8px] text-slate-600">{photo.date}</p>
                            </>
                        )}
                        {/* Delete overlay */}
                        <button onClick={(e) => { e.stopPropagation(); deletePhoto(photo.id); }}
                            className="absolute top-1 end-1 w-5 h-5 bg-red-500/80 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                            <X className="w-3 h-3" />
                        </button>
                        {photo.dataUrl && (
                            <div className="absolute bottom-0 inset-x-0 bg-black/60 px-1.5 py-0.5">
                                <p className="text-[8px] text-white truncate">{photo.label}</p>
                            </div>
                        )}
                    </div>
                ))}
                {/* Add new button */}
                <div onClick={() => photoInputRef.current?.click()}
                    className="aspect-square rounded-xl flex flex-col items-center justify-center transition-all cursor-pointer group border-2 border-dashed border-slate-600/50 hover:border-emerald-500/40 bg-slate-900/30">
                    <Plus className="w-6 h-6 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                    <p className="text-[9px] text-slate-500 group-hover:text-emerald-400 mt-1">{t('إضافة', 'Add')}</p>
                </div>
            </div>
        </div>
    );

    const renderInvoicesWidget = () => (
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden h-full">
            <div className="px-4 py-3 border-b border-slate-700/30 flex items-center justify-between bg-slate-800/40">
                <h3 className="text-white font-bold text-sm flex items-center gap-2" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                    <FileText className="w-4 h-4 text-amber-400" />
                    {t('الفواتير', 'Invoices')}
                    <span className="text-slate-500 text-[10px] font-normal">({invoices.length})</span>
                </h3>
                <button onClick={() => setShowInvoiceForm(!showInvoiceForm)}
                    className="px-2.5 py-1 bg-amber-500/15 border border-amber-500/20 text-amber-400 rounded-lg text-[11px] font-medium flex items-center gap-1 hover:bg-amber-500/25 transition-colors active:scale-95">
                    {showInvoiceForm ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                    {showInvoiceForm ? t('إلغاء', 'Cancel') : t('جديدة', 'New')}
                </button>
            </div>

            {/* New Invoice Form */}
            {showInvoiceForm && (
                <div className="p-3 border-b border-slate-700/20 bg-slate-800/20 space-y-2">
                    <input value={newInvVendor} onChange={e => setNewInvVendor(e.target.value)}
                        placeholder={t('اسم المورد / الجهة...', 'Vendor name...')}
                        className="w-full bg-slate-900/50 border border-slate-700/40 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/40" />
                    <div className="flex gap-2">
                        <input value={newInvAmount} onChange={e => setNewInvAmount(e.target.value.replace(/\D/g, ''))}
                            placeholder={t('المبلغ (ر.س)', 'Amount (SAR)')}
                            type="text" dir="ltr"
                            className="flex-1 bg-slate-900/50 border border-slate-700/40 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-amber-500/40 font-mono" />
                        <button onClick={addInvoice} disabled={!newInvVendor.trim() || !newInvAmount.trim()}
                            className="px-4 py-2 bg-amber-500 text-white rounded-lg text-sm font-medium hover:bg-amber-600 transition-all disabled:opacity-40 disabled:cursor-not-allowed active:scale-95">
                            {t('إضافة', 'Add')}
                        </button>
                    </div>
                </div>
            )}

            <div className="p-3 space-y-2 max-h-[350px] overflow-y-auto">
                {invoices.map((inv) => (
                    <div key={inv.id} onClick={() => toggleInvoiceStatus(inv.id)} title={t('اضغط لتغيير الحالة', 'Click to change status')}
                        className="bg-slate-900/30 rounded-xl p-3 border border-slate-700/20 flex items-center justify-between hover:border-amber-500/15 transition-colors cursor-pointer group">
                        <div>
                            <p className="text-white text-sm font-medium group-hover:text-amber-200 transition-colors">{inv.vendor}</p>
                            <p className="text-slate-600 text-xs font-mono">{inv.id}</p>
                        </div>
                        <div className="text-end">
                            <p className="text-white font-bold text-sm">{inv.amount} <span className="text-slate-500 text-xs">{t('ر.س', 'SAR')}</span></p>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                                inv.status === 'paid' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/20' :
                                inv.status === 'pending' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/20' :
                                'bg-slate-700/30 text-slate-400 border border-slate-600/20'
                            }`}>
                                {inv.status === 'paid' ? t('مدفوعة ✓', 'Paid ✓') :
                                 inv.status === 'pending' ? t('معلقة', 'Pending') :
                                 t('مسودة', 'Draft')}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderFormsWidget = () => (
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden h-full">
            <div className="px-4 py-3 border-b border-slate-700/30 bg-slate-800/40">
                <h3 className="text-white font-bold text-sm flex items-center gap-2" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                    <ClipboardList className="w-4 h-4 text-orange-400" />
                    {t('النماذج', 'Forms')}
                </h3>
            </div>
            <div className="p-3 space-y-2">
                {formEntries.map((form) => (
                    <div key={form.id}>
                        <div onClick={() => toggleForm(form.id)}
                            className="bg-slate-900/30 rounded-xl p-3 border border-slate-700/20 flex items-center justify-between hover:border-orange-500/15 transition-colors cursor-pointer group">
                            <div className="flex items-center gap-3">
                                <div className={`w-1.5 h-8 rounded-full ${form.color}`} />
                                <div>
                                    <p className="text-white text-sm font-medium">{form.title}</p>
                                    <p className="text-slate-500 text-xs">{form.count} {t('نموذج', 'entries')}</p>
                                </div>
                            </div>
                            <ChevronLeft className={`w-4 h-4 text-slate-600 group-hover:text-orange-400 transition-all ${form.expanded ? (isRtl ? 'rotate-90' : '-rotate-90') : ''}`} />
                        </div>
                        {form.expanded && (
                            <div className="mt-1 ms-5 p-3 bg-slate-900/20 border border-slate-700/10 rounded-lg space-y-1.5 animate-fade-in">
                                {Array.from({ length: Math.min(form.count, 3) }).map((_, i) => (
                                    <div key={i} className="flex items-center justify-between text-xs">
                                        <span className="text-slate-400">{form.title} #{form.count - i}</span>
                                        <span className="text-slate-500">{new Date(Date.now() - i * 86400000).toLocaleDateString(t('ar-SA', 'en-US'))}</span>
                                    </div>
                                ))}
                                {form.count > 3 && <p className="text-[10px] text-slate-600 text-center pt-1">... {t(`وعدد ${form.count - 3} نماذج أخرى`, `and ${form.count - 3} more`)}</p>}
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );

    const renderReportsWidget = () => (
        <div className="bg-slate-800/30 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden h-full">
            <div className="px-4 py-3 border-b border-slate-700/30 bg-slate-800/40">
                <h3 className="text-white font-bold text-sm flex items-center gap-2" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                    <BarChart3 className="w-4 h-4 text-cyan-400" />
                    {t('التقارير', 'Reports')}
                </h3>
            </div>
            <div className="p-4 space-y-4">
                <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-900/40 rounded-xl p-3 border border-emerald-500/10 text-center">
                        <p className="text-2xl font-bold text-emerald-400">68%</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">{t('نسبة الإنجاز', 'Completion')}</p>
                    </div>
                    <div className="bg-slate-900/40 rounded-xl p-3 border border-cyan-500/10 text-center">
                        <p className="text-2xl font-bold text-cyan-400">12</p>
                        <p className="text-slate-500 text-[10px] mt-0.5">{t('مهام مكتملة', 'Tasks Done')}</p>
                    </div>
                </div>
                <div className="space-y-2">
                    {[
                        { text: t('صب أساسات المبنى A', 'Building A Foundation'), status: 'done' },
                        { text: t('تركيب حديد التسليح', 'Reinforcement Steel'), status: 'progress' },
                        { text: t('أعمال الكهرباء الأرضية', 'Ground Electrical'), status: 'active' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-2.5 text-sm bg-slate-900/30 rounded-lg p-2.5 border border-slate-700/20">
                            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${item.status === 'done' ? 'bg-emerald-400' : item.status === 'progress' ? 'bg-orange-400' : 'bg-blue-400'}`} />
                            <span className="text-slate-300 text-xs">{item.text}</span>
                            <span className={`ms-auto text-[9px] px-1.5 py-0.5 rounded ${item.status === 'done' ? 'bg-emerald-500/10 text-emerald-400' : item.status === 'progress' ? 'bg-orange-500/10 text-orange-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                {item.status === 'done' ? '✓' : item.status === 'progress' ? '80%' : t('جاري', 'Active')}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

    const renderToolContent = () => {
        switch (activeTool) {
            case 'chat': return renderChatWidget();
            case 'photos': return renderPhotosWidget();
            case 'invoices': return renderInvoicesWidget();
            case 'forms': return renderFormsWidget();
            case 'reports': return renderReportsWidget();
            default: return null;
        }
    };

    return (
        <div className="min-h-screen bg-[#0F172A]" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Background pattern */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.02]" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }} />
            </div>

            {/* CSS for fade-in animation */}
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                .animate-fade-in { animation: fadeIn 0.3s ease-out; }
            `}</style>

            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-xl border-b border-slate-700/30 sticky top-0 z-30">
                <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-emerald-500/10">
                            {member.employeeName.charAt(0)}
                        </div>
                        <div>
                            <p className="text-white font-bold text-sm" style={{ fontFamily: 'Tajawal, sans-serif' }}>{member.employeeName}</p>
                            <div className="flex items-center gap-2">
                                <span className="text-emerald-400 text-xs">{roleInfo.icon} {roleInfo[isRtl ? 'ar' : 'en']}</span>
                                <span className="text-slate-700 text-[10px]">|</span>
                                <span className="text-slate-500 text-xs truncate max-w-[150px]">{member.projectName}</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="hidden sm:flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/15">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-emerald-400 text-xs font-medium">{t('متصل', 'Online')}</span>
                        </div>
                        <button onClick={onLogout}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all"
                            title={t('تسجيل الخروج', 'Logout')}>
                            <LogOut className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <div className="max-w-5xl mx-auto px-4 py-6 relative z-10">
                {activeTool === 'home' ? (
                    <>
                        {/* Project Banner */}
                        <div className="bg-gradient-to-r from-slate-800/50 to-slate-800/30 rounded-2xl p-5 border border-slate-700/40 mb-6 backdrop-blur-sm">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-xl bg-emerald-500/15 flex items-center justify-center border border-emerald-500/20">
                                        <Building2 className="w-7 h-7 text-emerald-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-white font-bold text-lg" style={{ fontFamily: 'Tajawal, sans-serif' }}>{member.projectName}</h2>
                                        <div className="flex items-center gap-3 mt-1">
                                            {member.employeePhone && (
                                                <span className="flex items-center gap-1 text-slate-500 text-xs"><Phone className="w-3 h-3" /> {member.employeePhone}</span>
                                            )}
                                            {member.lastLogin && (
                                                <span className="flex items-center gap-1 text-slate-500 text-xs"><Clock className="w-3 h-3" /> {new Date(member.lastLogin).toLocaleDateString(isRtl ? 'ar-SA' : 'en-US')}</span>
                                            )}
                                            {member.loginCount > 0 && (
                                                <span className="flex items-center gap-1 text-slate-500 text-xs"><Activity className="w-3 h-3" /> {member.loginCount} {t('دخول', 'logins')}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tools Label */}
                        <h3 className="text-slate-400 text-sm font-semibold mb-4 flex items-center gap-2" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                            <HardHat className="w-4 h-4 text-emerald-500" />
                            {t('أدواتك المتاحة', 'Your Available Tools')}
                        </h3>

                        {/* Widget-style Tool Cards */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {allowedTools.map(tool => (
                                <button key={tool.key} onClick={() => setActiveTool(tool.tool)}
                                    className={`bg-gradient-to-br ${tool.color} rounded-2xl p-5 border border-slate-700/40 hover:border-slate-600/60 transition-all hover:scale-[1.02] active:scale-[0.98] text-start backdrop-blur-sm group`}
                                    id={`team-tool-${tool.key}`}>
                                    <div className={`${tool.accent} mb-3 group-hover:scale-110 transition-transform`}>{tool.icon}</div>
                                    <p className="text-white font-bold text-sm" style={{ fontFamily: 'Tajawal, sans-serif' }}>{tool.label[language]}</p>
                                    <p className="text-slate-500 text-[10px] mt-0.5">{tool.desc[language]}</p>
                                </button>
                            ))}
                            {member.permissions.team && (
                                <button onClick={() => onNavigate('team-manager')}
                                    className="bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-2xl p-5 border border-slate-700/40 hover:border-red-500/30 transition-all hover:scale-[1.02] active:scale-[0.98] text-start backdrop-blur-sm group"
                                    id="team-tool-manage">
                                    <Shield className="w-6 h-6 text-red-400 mb-3 group-hover:scale-110 transition-transform" />
                                    <p className="text-white font-bold text-sm" style={{ fontFamily: 'Tajawal, sans-serif' }}>{t('إدارة الفريق', 'Team Management')}</p>
                                    <p className="text-slate-500 text-[10px] mt-0.5">{t('صلاحيات ورموز', 'Permissions & Codes')}</p>
                                </button>
                            )}
                        </div>
                        {allowedTools.length === 0 && (
                            <div className="text-center py-16 bg-slate-800/20 rounded-2xl border border-slate-700/30 mt-4">
                                <Shield className="w-14 h-14 text-slate-700 mx-auto mb-4" />
                                <p className="text-slate-400 font-bold" style={{ fontFamily: 'Tajawal, sans-serif' }}>{t('لا توجد أدوات متاحة حالياً', 'No tools available yet')}</p>
                                <p className="text-slate-600 text-sm mt-2">{t('تواصل مع مدير المشروع لتفعيل صلاحياتك', 'Contact your project manager to activate permissions')}</p>
                            </div>
                        )}
                    </>
                ) : (
                    <>
                        <button onClick={() => setActiveTool('home')}
                            className="flex items-center gap-2 text-slate-400 hover:text-emerald-400 mb-4 transition-colors text-sm bg-slate-800/30 px-4 py-2 rounded-xl border border-slate-700/30">
                            {isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                            {t('العودة للرئيسية', 'Back to Home')}
                        </button>
                        {renderToolContent()}
                    </>
                )}
            </div>
        </div>
    );
};

export default TeamDashboard;
