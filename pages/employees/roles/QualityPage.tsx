/**
 * صفحة الجودة — تقارير الفحص الحقيقية via Firestore
 * Quality Page — Real inspection report submission
 */

import React, { useState, useEffect } from 'react';
import { CheckCircle, ClipboardCheck, AlertTriangle, TrendingUp, FileSearch, Award, Plus, X, Loader2, Calendar, Send, Image } from 'lucide-react';
import { Employee } from '../../../services/employeeService';
import { db } from '../../../firebase/config';
import { collection, getDocs, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { Language } from '../../../types';

interface QualityPageProps {
    language: Language;
    employee: Employee;
}

interface InspectionReport {
    id: string;
    item: string;
    location: string;
    result: 'passed' | 'failed' | 'pending';
    notes: string;
    inspector: string;
    date: string;
    severity?: 'low' | 'medium' | 'high';
}

const INSPECTIONS_COLLECTION = 'quality_inspections';

const QualityPage: React.FC<QualityPageProps> = ({ language, employee }) => {
    const t = (ar: string, en: string) => { const map: Record<string, string> = { ar, en, fr: en, zh: en }; return map[language] || en; };
    const [inspections, setInspections] = useState<InspectionReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [submitting, setSubmitting] = useState(false);

    // Form state
    const [formItem, setFormItem] = useState('');
    const [formLocation, setFormLocation] = useState('');
    const [formResult, setFormResult] = useState<'passed' | 'failed' | 'pending'>('pending');
    const [formNotes, setFormNotes] = useState('');
    const [formSeverity, setFormSeverity] = useState<'low' | 'medium' | 'high'>('low');

    // Load inspections
    useEffect(() => {
        const load = async () => {
            try {
                const snap = await getDocs(collection(db, INSPECTIONS_COLLECTION));
                if (snap.empty) {
                    const seeds: InspectionReport[] = [
                        { id: 'qc_1', item: t('خرسانة الأساسات', 'Foundation Concrete'), location: t('المبنى A — الطابق الأرضي', 'Building A — Ground Floor'), result: 'passed', notes: t('مطابق للمواصفات، قوة ضغط 350 كجم/سم²', 'Meets specs, 350 kg/cm² compressive strength'), inspector: employee.name, date: new Date(Date.now() - 86400000).toISOString() },
                        { id: 'qc_2', item: t('حديد التسليح', 'Reinforcement Steel'), location: t('المبنى B — الأعمدة', 'Building B — Columns'), result: 'passed', notes: t('التباعد مطابق للمخططات', 'Spacing matches blueprints'), inspector: employee.name, date: new Date(Date.now() - 2 * 86400000).toISOString() },
                        { id: 'qc_3', item: t('العزل المائي', 'Waterproofing'), location: t('السرداب الأول', 'Basement 1'), result: 'failed', notes: t('تسرب مكتشف في الزاوية الشمالية', 'Leak detected in north corner'), inspector: employee.name, date: new Date(Date.now() - 3 * 86400000).toISOString(), severity: 'high' },
                        { id: 'qc_4', item: t('أعمال التمديدات الكهربائية', 'Electrical Conduit'), location: t('الطابق الثاني', '2nd Floor'), result: 'pending', notes: t('بانتظار اختبار العزل', 'Awaiting insulation test'), inspector: employee.name, date: new Date(Date.now() - 4 * 86400000).toISOString() },
                    ];
                    for (const s of seeds) await setDoc(doc(db, INSPECTIONS_COLLECTION, s.id), s);
                    setInspections(seeds);
                } else {
                    setInspections(snap.docs.map(d => d.data() as InspectionReport));
                }
            } catch {
                const cached = localStorage.getItem('arba_quality_inspections');
                if (cached) setInspections(JSON.parse(cached));
            } finally { setLoading(false); }
        };
        load();
    }, []);

    // Submit new inspection
    const handleSubmit = async () => {
        if (!formItem.trim() || !formLocation.trim()) return;
        setSubmitting(true);
        const newInspection: InspectionReport = {
            id: `qc_${Date.now()}`,
            item: formItem, location: formLocation, result: formResult,
            notes: formNotes, inspector: employee.name,
            date: new Date().toISOString(),
            severity: formResult === 'failed' ? formSeverity : undefined,
        };
        const updated = [newInspection, ...inspections];
        setInspections(updated);
        localStorage.setItem('arba_quality_inspections', JSON.stringify(updated));
        try {
            await setDoc(doc(db, INSPECTIONS_COLLECTION, newInspection.id), newInspection);
        } catch (e) { console.warn('Firestore write failed:', e); }
        setSubmitting(false);
        setShowForm(false);
        setFormItem(''); setFormLocation(''); setFormResult('pending'); setFormNotes(''); setFormSeverity('low');
    };

    const passedCount = inspections.filter(i => i.result === 'passed').length;
    const failedCount = inspections.filter(i => i.result === 'failed').length;
    const pendingCount = inspections.filter(i => i.result === 'pending').length;
    const qualityRate = inspections.length > 0 ? ((passedCount / inspections.length) * 100).toFixed(1) : '0';

    const resultColors = {
        passed: 'bg-green-500/20 text-green-400 border-green-500/20',
        failed: 'bg-red-500/20 text-red-400 border-red-500/20',
        pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
    };

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-teal-500/20 to-green-500/20 rounded-xl p-6 border border-teal-500/30">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-green-600 flex items-center justify-center">
                            <CheckCircle className="w-8 h-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">{t('مرحباً', 'Welcome')}, {employee.name}</h2>
                            <p className="text-slate-400">{t('قسم الجودة', 'Quality Department')}</p>
                        </div>
                    </div>
                    <button onClick={() => setShowForm(true)}
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors flex items-center gap-2 font-medium">
                        <Plus className="w-4 h-4" />
                        {t('فحص جديد', 'New Inspection')}
                    </button>
                </div>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                    <p className="text-slate-400 text-sm mb-1">{t('إجمالي الفحوصات', 'Total Inspections')}</p>
                    <p className="text-2xl font-bold text-teal-400">{inspections.length}</p>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-green-500/20">
                    <p className="text-slate-400 text-sm mb-1">{t('معدل الجودة', 'Quality Rate')}</p>
                    <p className="text-2xl font-bold text-green-400">{qualityRate}%</p>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-red-500/20">
                    <p className="text-slate-400 text-sm mb-1">{t('مشاكل مكتشفة', 'Issues Found')}</p>
                    <p className="text-2xl font-bold text-red-400">{failedCount}</p>
                </div>
                <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-yellow-500/20">
                    <p className="text-slate-400 text-sm mb-1">{t('قيد الفحص', 'Pending')}</p>
                    <p className="text-2xl font-bold text-yellow-400">{pendingCount}</p>
                </div>
            </div>

            {/* New Inspection Form Modal */}
            {showForm && (
                <div className="bg-slate-800/80 backdrop-blur-xl rounded-xl p-6 border border-teal-500/30 relative">
                    <button onClick={() => setShowForm(false)} className="absolute top-4 end-4 text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                    <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <ClipboardCheck className="w-5 h-5 text-teal-400" />
                        {t('تقرير فحص جديد', 'New Inspection Report')}
                    </h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-slate-300 text-sm mb-1">{t('العنصر المفحوص', 'Inspected Item')}</label>
                            <input value={formItem} onChange={e => setFormItem(e.target.value)}
                                placeholder={t('مثال: خرسانة الأعمدة', 'e.g. Column Concrete')}
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-teal-500/50" />
                        </div>
                        <div>
                            <label className="block text-slate-300 text-sm mb-1">{t('الموقع', 'Location')}</label>
                            <input value={formLocation} onChange={e => setFormLocation(e.target.value)}
                                placeholder={t('مثال: المبنى A — الطابق 2', 'e.g. Building A — Floor 2')}
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-teal-500/50" />
                        </div>
                        <div>
                            <label className="block text-slate-300 text-sm mb-1">{t('النتيجة', 'Result')}</label>
                            <select value={formResult} onChange={e => setFormResult(e.target.value as any)}
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500/50">
                                <option value="pending">{t('قيد الفحص', 'Pending')}</option>
                                <option value="passed">{t('ناجح', 'Passed')}</option>
                                <option value="failed">{t('فاشل', 'Failed')}</option>
                            </select>
                        </div>
                        {formResult === 'failed' && (
                            <div>
                                <label className="block text-slate-300 text-sm mb-1">{t('مستوى الخطورة', 'Severity')}</label>
                                <select value={formSeverity} onChange={e => setFormSeverity(e.target.value as any)}
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm focus:outline-none focus:border-teal-500/50">
                                    <option value="low">{t('منخفض', 'Low')}</option>
                                    <option value="medium">{t('متوسط', 'Medium')}</option>
                                    <option value="high">{t('عالي', 'High')}</option>
                                </select>
                            </div>
                        )}
                        <div className="md:col-span-2">
                            <label className="block text-slate-300 text-sm mb-1">{t('ملاحظات الفحص', 'Inspection Notes')}</label>
                            <textarea value={formNotes} onChange={e => setFormNotes(e.target.value)} rows={3}
                                placeholder={t('وصف تفصيلي للنتائج...', 'Detailed results description...')}
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-lg px-3 py-2 text-white text-sm placeholder-slate-600 focus:outline-none focus:border-teal-500/50 resize-none" />
                        </div>
                    </div>
                    <button onClick={handleSubmit} disabled={submitting || !formItem || !formLocation}
                        className="mt-4 px-6 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-medium flex items-center gap-2 disabled:opacity-50">
                        {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        {t('إرسال التقرير', 'Submit Report')}
                    </button>
                </div>
            )}

            {/* Inspections List */}
            <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-700/50">
                    <h3 className="text-lg font-semibold text-white">{t('سجل الفحوصات', 'Inspection Log')}</h3>
                </div>
                {loading ? (
                    <div className="p-8 text-center"><Loader2 className="w-8 h-8 text-teal-400 animate-spin mx-auto" /></div>
                ) : (
                    <div className="divide-y divide-slate-700/30">
                        {inspections.map((inspection) => (
                            <div key={inspection.id} className="p-4 hover:bg-slate-700/10 transition-colors">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-white font-medium text-sm">{inspection.item}</span>
                                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium border ${resultColors[inspection.result]}`}>
                                                {inspection.result === 'passed' ? t('ناجح', 'Passed') : inspection.result === 'failed' ? t('فاشل', 'Failed') : t('قيد الفحص', 'Pending')}
                                            </span>
                                            {inspection.severity === 'high' && (
                                                <span className="flex items-center gap-0.5 text-red-400 text-[10px]">
                                                    <AlertTriangle className="w-3 h-3" />{t('خطورة عالية', 'High Severity')}
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-slate-500 text-xs mb-1">{inspection.location}</p>
                                        {inspection.notes && <p className="text-slate-400 text-sm">{inspection.notes}</p>}
                                    </div>
                                    <div className="text-end flex-shrink-0">
                                        <p className="text-slate-500 text-xs">{new Date(inspection.date).toLocaleDateString(t('ar-SA', 'en-US'))}</p>
                                        <p className="text-slate-600 text-[10px]">{inspection.inspector}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default QualityPage;
