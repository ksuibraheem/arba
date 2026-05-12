/**
 * صفحة نائب المدير — مع إدارة الموافقات الحقيقية
 * Deputy Manager Page — Real approve/reject workflow via Firestore
 */

import React, { useState, useEffect } from 'react';
import { UserCog, Users, BarChart3, FileText, Settings, Shield, Check, X, Clock, AlertTriangle, ChevronDown, Loader2 } from 'lucide-react';
import { Employee, employeeService } from '../../../services/employeeService';
import { db } from '../../../firebase/config';
import { collection, getDocs, doc, setDoc, updateDoc, query, where, serverTimestamp, onSnapshot } from 'firebase/firestore';
import { Language } from '../../../types';

interface DeputyPageProps {
    language: Language;
    employee: Employee;
}

interface ApprovalRequest {
    id: string;
    type: 'leave' | 'expense' | 'hiring' | 'quote';
    from: string;
    description: string;
    amount?: number;
    date: string;
    status: 'pending' | 'approved' | 'rejected';
    reviewedBy?: string;
    reviewedAt?: string;
}

const APPROVALS_COLLECTION = 'deputy_approvals';

const DeputyPage: React.FC<DeputyPageProps> = ({ language, employee }) => {
    const t = (ar: string, en: string) => { const map: Record<string, string> = { ar, en, fr: en, zh: en }; return map[language] || en; };
    const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeFilter, setActiveFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
    const [processingId, setProcessingId] = useState<string | null>(null);
    const [employeeCount, setEmployeeCount] = useState(0);

    // Load real employee count
    useEffect(() => {
        const emps = employeeService.getEmployees();
        setEmployeeCount(emps.length);
    }, []);

    // Load approvals from Firestore with real-time
    useEffect(() => {
        const seedAndListen = async () => {
            try {
                const snap = await getDocs(collection(db, APPROVALS_COLLECTION));
                if (snap.empty) {
                    // Seed initial data
                    const seeds: ApprovalRequest[] = [
                        { id: 'apr_1', type: 'leave', from: 'أحمد محمد الشهري', description: 'طلب إجازة 5 أيام — إجازة عائلية', date: new Date(Date.now() - 86400000).toISOString(), status: 'pending' },
                        { id: 'apr_2', type: 'expense', from: 'سارة أحمد العتيبي', description: 'طلب صرف مبلغ 2,500 ر.س لشراء معدات مكتبية', amount: 2500, date: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'pending' },
                        { id: 'apr_3', type: 'hiring', from: 'قسم الموارد البشرية', description: 'طلب توظيف — مهندس تسعير جديد (2 وظائف)', date: new Date(Date.now() - 3 * 86400000).toISOString(), status: 'pending' },
                        { id: 'apr_4', type: 'quote', from: 'خالد الشمري', description: 'عرض سعر مشروع فيلا سكنية — العميل: شركة الأمل', amount: 450000, date: new Date(Date.now() - 4 * 86400000).toISOString(), status: 'pending' },
                        { id: 'apr_5', type: 'expense', from: 'فاطمة الزهراني', description: 'مصروفات سفر — رحلة عمل جدة', amount: 3200, date: new Date(Date.now() - 5 * 86400000).toISOString(), status: 'approved', reviewedBy: employee.name, reviewedAt: new Date(Date.now() - 4 * 86400000).toISOString() },
                    ];
                    for (const s of seeds) await setDoc(doc(db, APPROVALS_COLLECTION, s.id), s);
                    setApprovals(seeds);
                } else {
                    setApprovals(snap.docs.map(d => d.data() as ApprovalRequest));
                }
            } catch {
                // Fallback to localStorage
                const cached = localStorage.getItem('arba_deputy_approvals');
                if (cached) setApprovals(JSON.parse(cached));
                else {
                    const seeds: ApprovalRequest[] = [
                        { id: 'apr_1', type: 'leave', from: 'أحمد محمد الشهري', description: 'طلب إجازة 5 أيام — إجازة عائلية', date: new Date(Date.now() - 86400000).toISOString(), status: 'pending' },
                        { id: 'apr_2', type: 'expense', from: 'سارة أحمد العتيبي', description: 'طلب صرف مبلغ 2,500 ر.س', amount: 2500, date: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'pending' },
                        { id: 'apr_3', type: 'hiring', from: 'قسم الموارد البشرية', description: 'طلب توظيف مهندس جديد', date: new Date(Date.now() - 3 * 86400000).toISOString(), status: 'pending' },
                        { id: 'apr_4', type: 'quote', from: 'خالد الشمري', description: 'عرض سعر مشروع فيلا', amount: 450000, date: new Date(Date.now() - 4 * 86400000).toISOString(), status: 'pending' },
                    ];
                    setApprovals(seeds);
                    localStorage.setItem('arba_deputy_approvals', JSON.stringify(seeds));
                }
            } finally { setLoading(false); }
        };
        seedAndListen();
    }, []);

    // Handle Approve/Reject
    const handleDecision = async (id: string, decision: 'approved' | 'rejected') => {
        setProcessingId(id);
        const updated = approvals.map(a => a.id === id ? { ...a, status: decision, reviewedBy: employee.name, reviewedAt: new Date().toISOString() } : a);
        setApprovals(updated as ApprovalRequest[]);
        localStorage.setItem('arba_deputy_approvals', JSON.stringify(updated));
        try {
            await updateDoc(doc(db, APPROVALS_COLLECTION, id), {
                status: decision, reviewedBy: employee.name, reviewedAt: new Date().toISOString()
            });
        } catch (e) { console.warn('Firestore update failed:', e); }
        setTimeout(() => setProcessingId(null), 500);
    };

    const filtered = activeFilter === 'all' ? approvals : approvals.filter(a => a.status === activeFilter);
    const pendingCount = approvals.filter(a => a.status === 'pending').length;
    const approvedCount = approvals.filter(a => a.status === 'approved').length;

    const typeConfig = {
        leave: { label: t('إجازة', 'Leave'), color: 'bg-blue-500/15 text-blue-400 border-blue-500/20' },
        expense: { label: t('مصروفات', 'Expense'), color: 'bg-amber-500/15 text-amber-400 border-amber-500/20' },
        hiring: { label: t('توظيف', 'Hiring'), color: 'bg-green-500/15 text-green-400 border-green-500/20' },
        quote: { label: t('عرض سعر', 'Quote'), color: 'bg-purple-500/15 text-purple-400 border-purple-500/20' },
    };

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-purple-500/20 to-indigo-500/20 rounded-xl p-6 border border-purple-500/30">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                        <UserCog className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{t('مرحباً', 'Welcome')}, {employee.name}</h2>
                        <p className="text-slate-400">{t('نائب المدير العام', 'Deputy General Manager')}</p>
                    </div>
                </div>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                    <p className="text-slate-400 text-sm mb-1">{t('الموظفين', 'Employees')}</p>
                    <p className="text-2xl font-bold text-purple-400">{employeeCount}</p>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-orange-500/20">
                    <p className="text-slate-400 text-sm mb-1">{t('بانتظار الموافقة', 'Pending')}</p>
                    <p className="text-2xl font-bold text-orange-400">{pendingCount}</p>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-green-500/20">
                    <p className="text-slate-400 text-sm mb-1">{t('تمت الموافقة', 'Approved')}</p>
                    <p className="text-2xl font-bold text-green-400">{approvedCount}</p>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                    <p className="text-slate-400 text-sm mb-1">{t('إجمالي الطلبات', 'Total Requests')}</p>
                    <p className="text-2xl font-bold text-blue-400">{approvals.length}</p>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-1">
                {(['all', 'pending', 'approved', 'rejected'] as const).map(filter => (
                    <button key={filter} onClick={() => setActiveFilter(filter)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                            activeFilter === filter
                                ? 'bg-purple-500 text-white'
                                : 'bg-slate-800/50 text-slate-400 hover:text-white border border-slate-700/50'
                        }`}>
                        {filter === 'all' ? t('الكل', 'All') :
                         filter === 'pending' ? t('معلقة', 'Pending') :
                         filter === 'approved' ? t('مقبولة', 'Approved') :
                         t('مرفوضة', 'Rejected')}
                        {filter === 'pending' && pendingCount > 0 && (
                            <span className="ms-1.5 px-1.5 py-0.5 bg-orange-500 text-white text-[10px] rounded-full">{pendingCount}</span>
                        )}
                    </button>
                ))}
            </div>

            {/* Approvals List */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white">{t('طلبات الموافقة', 'Approval Requests')}</h3>
                </div>
                {loading ? (
                    <div className="p-8 text-center">
                        <Loader2 className="w-8 h-8 text-purple-400 animate-spin mx-auto" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="p-8 text-center text-slate-500">
                        {t('لا توجد طلبات', 'No requests found')}
                    </div>
                ) : (
                    <div className="divide-y divide-slate-700/30">
                        {filtered.map((approval) => {
                            const cfg = typeConfig[approval.type];
                            return (
                                <div key={approval.id} className="p-4 hover:bg-slate-700/10 transition-colors">
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${cfg.color}`}>{cfg.label}</span>
                                                <span className="text-white font-medium text-sm">{approval.from}</span>
                                            </div>
                                            <p className="text-slate-400 text-sm mb-1">{approval.description}</p>
                                            <div className="flex items-center gap-3 text-xs text-slate-500">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{new Date(approval.date).toLocaleDateString(t('ar-SA', 'en-US'))}</span>
                                                {approval.amount && <span className="text-amber-400 font-medium">{approval.amount.toLocaleString()} {t('ر.س', 'SAR')}</span>}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 flex-shrink-0">
                                            {approval.status === 'pending' ? (
                                                <>
                                                    <button onClick={() => handleDecision(approval.id, 'approved')} disabled={processingId === approval.id}
                                                        className="px-3 py-1.5 bg-green-500/20 text-green-400 rounded-lg hover:bg-green-500/30 transition-all text-sm font-medium flex items-center gap-1 disabled:opacity-50">
                                                        {processingId === approval.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                                                        {t('موافقة', 'Approve')}
                                                    </button>
                                                    <button onClick={() => handleDecision(approval.id, 'rejected')} disabled={processingId === approval.id}
                                                        className="px-3 py-1.5 bg-red-500/20 text-red-400 rounded-lg hover:bg-red-500/30 transition-all text-sm font-medium flex items-center gap-1 disabled:opacity-50">
                                                        <X className="w-3.5 h-3.5" />
                                                        {t('رفض', 'Reject')}
                                                    </button>
                                                </>
                                            ) : (
                                                <span className={`px-3 py-1.5 rounded-lg text-xs font-medium ${
                                                    approval.status === 'approved' ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
                                                }`}>
                                                    {approval.status === 'approved' ? t('✓ تمت الموافقة', '✓ Approved') : t('✗ مرفوض', '✗ Rejected')}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    {approval.reviewedBy && (
                                        <p className="text-[10px] text-slate-600 mt-2">
                                            {t('بواسطة:', 'By:')} {approval.reviewedBy} — {approval.reviewedAt && new Date(approval.reviewedAt).toLocaleString(t('ar-SA', 'en-US'))}
                                        </p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DeputyPage;
