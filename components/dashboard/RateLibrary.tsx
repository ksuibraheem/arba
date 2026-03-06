/**
 * Rate Library Component — مكتبة الأسعار
 * Material rates reference for Saudi construction
 */

import React, { useState } from 'react';

interface RateItem {
    id: string;
    name: { ar: string; en: string };
    category: string;
    unit: string;
    baseRate: number;
    marketRate?: number;
    lastUpdated: string;
    source: string;
}

interface RateLibraryProps {
    language: 'ar' | 'en';
}

// Initial Saudi market rates (50 materials as per market rates engine spec)
const MARKET_RATES: RateItem[] = [
    { id: 'r01', name: { ar: 'خرسانة جاهزة C30', en: 'Ready-mix Concrete C30' }, category: 'structure', unit: 'm³', baseRate: 280, source: 'SBC', lastUpdated: '2026-01' },
    { id: 'r02', name: { ar: 'حديد تسليح', en: 'Rebar Steel' }, category: 'structure', unit: 'ton', baseRate: 3200, source: 'SABIC', lastUpdated: '2026-01' },
    { id: 'r03', name: { ar: 'بلوك خرساني 20سم', en: 'Concrete Block 20cm' }, category: 'structure', unit: 'unit', baseRate: 4.5, source: 'Market', lastUpdated: '2026-01' },
    { id: 'r04', name: { ar: 'رمل نظيف', en: 'Clean Sand' }, category: 'site', unit: 'm³', baseRate: 45, source: 'Market', lastUpdated: '2026-01' },
    { id: 'r05', name: { ar: 'حصى (بحص)', en: 'Gravel' }, category: 'site', unit: 'm³', baseRate: 55, source: 'Market', lastUpdated: '2026-01' },
    { id: 'r06', name: { ar: 'أسمنت بورتلاندي', en: 'Portland Cement' }, category: 'structure', unit: 'bag', baseRate: 18, source: 'YCCI', lastUpdated: '2026-01' },
    { id: 'r07', name: { ar: 'خشب جاوي (ملل)', en: 'Plywood Formwork' }, category: 'structure', unit: 'm²', baseRate: 35, source: 'Market', lastUpdated: '2026-01' },
    { id: 'r08', name: { ar: 'دهان داخلي (جوتن)', en: 'Interior Paint (Jotun)' }, category: 'finishing', unit: 'L', baseRate: 45, source: 'Jotun', lastUpdated: '2026-01' },
    { id: 'r09', name: { ar: 'بلاط سيراميك 60×60', en: 'Ceramic Tile 60x60' }, category: 'finishing', unit: 'm²', baseRate: 55, source: 'RAK', lastUpdated: '2026-01' },
    { id: 'r10', name: { ar: 'رخام مستورد', en: 'Imported Marble' }, category: 'finishing', unit: 'm²', baseRate: 250, source: 'Import', lastUpdated: '2026-01' },
    { id: 'r11', name: { ar: 'أنابيب PVC 4"', en: 'PVC Pipes 4"' }, category: 'mep', unit: 'm', baseRate: 18, source: 'Saudi Pipe', lastUpdated: '2026-01' },
    { id: 'r12', name: { ar: 'كابل كهرباء 4مم', en: 'Electric Cable 4mm' }, category: 'mep', unit: 'm', baseRate: 8, source: 'Riyadh Cables', lastUpdated: '2026-01' },
    { id: 'r13', name: { ar: 'مكيف سبليت 2 طن', en: 'Split AC 2 Ton' }, category: 'mep', unit: 'unit', baseRate: 2800, source: 'Samsung', lastUpdated: '2026-01' },
    { id: 'r14', name: { ar: 'عزل مائي (رولات)', en: 'Waterproofing Membrane' }, category: 'insulation', unit: 'm²', baseRate: 28, source: 'Sika', lastUpdated: '2026-01' },
    { id: 'r15', name: { ar: 'عزل حراري (فوم)', en: 'Thermal Insulation Foam' }, category: 'insulation', unit: 'm²', baseRate: 22, source: 'Market', lastUpdated: '2026-01' },
    { id: 'r16', name: { ar: 'ألمنيوم نوافذ', en: 'Window Aluminum' }, category: 'finishing', unit: 'm²', baseRate: 380, source: 'Sapa', lastUpdated: '2026-01' },
    { id: 'r17', name: { ar: 'باب خشبي داخلي', en: 'Interior Wood Door' }, category: 'finishing', unit: 'unit', baseRate: 650, source: 'Market', lastUpdated: '2026-01' },
    { id: 'r18', name: { ar: 'باب حديد خارجي', en: 'Steel Exterior Door' }, category: 'finishing', unit: 'unit', baseRate: 2200, source: 'Market', lastUpdated: '2026-01' },
    { id: 'r19', name: { ar: 'جبس بورد', en: 'Gypsum Board' }, category: 'finishing', unit: 'm²', baseRate: 32, source: 'Knauf', lastUpdated: '2026-01' },
    { id: 'r20', name: { ar: 'حفر وتنظيف', en: 'Excavation & Cleaning' }, category: 'site', unit: 'm³', baseRate: 15, source: 'Market', lastUpdated: '2026-01' },
];

const CATEGORY_LABELS: Record<string, { ar: string; en: string }> = {
    structure: { ar: 'هيكل إنشائي', en: 'Structure' },
    site: { ar: 'أعمال موقع', en: 'Site Work' },
    finishing: { ar: 'تشطيبات', en: 'Finishing' },
    mep: { ar: 'كهروميكانيك', en: 'MEP' },
    insulation: { ar: 'عزل', en: 'Insulation' },
};

const RateLibrary: React.FC<RateLibraryProps> = ({ language }) => {
    const isAr = language === 'ar';
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');

    const filteredRates = MARKET_RATES.filter(r => {
        if (categoryFilter !== 'all' && r.category !== categoryFilter) return false;
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            return r.name.ar.includes(term) || r.name.en.toLowerCase().includes(term);
        }
        return true;
    });

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-xl font-bold text-white">
                    {isAr ? '📖 مكتبة أسعار السوق' : '📖 Market Rate Library'}
                </h2>
                <span className="text-xs text-slate-500">
                    {isAr ? `${MARKET_RATES.length} مادة` : `${MARKET_RATES.length} materials`} •
                    {isAr ? ' آخر تحديث: يناير 2026' : ' Last updated: Jan 2026'}
                </span>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 flex-wrap">
                <input
                    type="text"
                    placeholder={isAr ? 'بحث بالاسم...' : 'Search materials...'}
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                    className="px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-48"
                    dir={isAr ? 'rtl' : 'ltr'}
                />
                <div className="flex gap-1.5">
                    {['all', ...Object.keys(CATEGORY_LABELS)].map(cat => (
                        <button
                            key={cat}
                            onClick={() => setCategoryFilter(cat)}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${categoryFilter === cat
                                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                    : 'bg-slate-800/40 text-slate-400 border border-slate-700 hover:border-slate-500'
                                }`}
                        >
                            {cat === 'all' ? (isAr ? 'الكل' : 'All') : CATEGORY_LABELS[cat]?.[language] || cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Rates Table */}
            <div className="rounded-2xl border border-slate-700/60 overflow-hidden">
                <table className="w-full">
                    <thead>
                        <tr className="bg-slate-800/80">
                            <th className={`px-4 py-3 text-xs font-bold text-slate-400 uppercase ${isAr ? 'text-right' : 'text-left'}`}>
                                {isAr ? 'المادة' : 'Material'}
                            </th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-400 text-center uppercase">
                                {isAr ? 'التصنيف' : 'Category'}
                            </th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-400 text-center uppercase">
                                {isAr ? 'الوحدة' : 'Unit'}
                            </th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-400 text-center uppercase">
                                {isAr ? 'السعر (ر.س)' : 'Rate (SAR)'}
                            </th>
                            <th className="px-4 py-3 text-xs font-bold text-slate-400 text-center uppercase">
                                {isAr ? 'المصدر' : 'Source'}
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredRates.map((rate, i) => (
                            <tr key={rate.id} className={`border-t border-slate-700/40 ${i % 2 === 0 ? 'bg-slate-800/20' : 'bg-slate-800/40'} hover:bg-slate-700/30 transition-colors`}>
                                <td className={`px-4 py-3 ${isAr ? 'text-right' : 'text-left'}`}>
                                    <span className="text-white text-sm font-medium">{rate.name[language]}</span>
                                </td>
                                <td className="px-4 py-3 text-center">
                                    <span className="px-2 py-0.5 rounded-lg bg-slate-700/50 text-slate-300 text-[10px]">
                                        {CATEGORY_LABELS[rate.category]?.[language] || rate.category}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center text-slate-400 text-sm">{rate.unit}</td>
                                <td className="px-4 py-3 text-center">
                                    <span className="text-emerald-400 font-bold text-sm">
                                        {rate.baseRate.toLocaleString()}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-center text-slate-500 text-xs">{rate.source}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default RateLibrary;
