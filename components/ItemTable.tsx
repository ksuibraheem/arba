import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Box, UserCheck, ShieldCheck, FileText, Settings2, AlertTriangle, TrendingUp, Star, Check, Edit3, Bot, Loader2, Plus, Trash2, Anchor, Lock, Brain } from 'lucide-react';
import { CalculatedItem, CustomParams, SupplierOption, Language, BaseItem, SectionDef } from '../types';
import { TRANSLATIONS } from '../constants';

interface ItemTableProps {
    items: CalculatedItem[];
    language: Language;
    onParamChange: (itemId: string, params: CustomParams) => void;
    onCheckAI: (item: CalculatedItem, manualPrice: number) => Promise<string>;
    onAddCustomItem: (item: BaseItem) => void;
    onDeleteCustomItem: (itemId: string) => void;
    isFreePlan?: boolean;
    encryptSupplierName?: (name: string, planId: string) => string;
    userPlan?: string;
    isDemoMode?: boolean;
    sections?: SectionDef[];
    enabledSections?: string[];
}

const SupplierBadge: React.FC<{ supplier: SupplierOption; language: Language; t: (k: string) => string; isFreePlan?: boolean }> = ({ supplier, language, t, isFreePlan }) => {
    let colorClass = "bg-slate-100 text-slate-600 border-slate-200";
    let tierText = t('supp_standard');
    let Icon = UserCheck;

    if (supplier.tier === 'premium') {
        colorClass = "bg-amber-50 text-amber-700 border-amber-200";
        tierText = t('supp_premium');
        Icon = Star;
    } else if (supplier.tier === 'budget') {
        colorClass = "bg-gray-50 text-gray-500 border-gray-200";
        tierText = t('supp_budget');
        Icon = TrendingUp;
    }

    // Encrypt supplier name for free plan
    const displayName = isFreePlan
        ? supplier.name[language].charAt(0) + '*'.repeat(Math.max(0, supplier.name[language].length - 2)) + supplier.name[language].charAt(supplier.name[language].length - 1)
        : supplier.name[language];

    return (
        <div className={`flex flex-col text-xs border rounded-md p-1.5 w-full ${colorClass} ${isFreePlan ? 'opacity-70' : ''}`}>
            <span className="font-bold flex items-center gap-1">
                {displayName}
                {isFreePlan && <Lock className="w-3 h-3 text-amber-500" />}
            </span>
            <div className="flex justify-between mt-1 opacity-80">
                <span>{tierText}</span>
                {supplier.priceMultiplier !== 1 && (
                    <span dir="ltr">x{supplier.priceMultiplier}</span>
                )}
            </div>
            {isFreePlan && (
                <span className="text-[9px] text-amber-600 mt-1">ترقية لعرض الاسم الكامل</span>
            )}
        </div>
    );
};

const ItemRow: React.FC<{
    item: CalculatedItem;
    language: Language;
    onParamChange: (id: string, p: CustomParams) => void;
    onCheckAI: (item: CalculatedItem, p: number) => Promise<string>;
    onDeleteCustomItem: (id: string) => void;
    isFreePlan?: boolean;
    encryptSupplierName?: (name: string, planId: string) => string;
    userPlan?: string;
}> = ({ item, language, onParamChange, onCheckAI, onDeleteCustomItem, isFreePlan, encryptSupplierName, userPlan }) => {
    const [isExpanded, setIsExpanded] = useState(false);
    const [aiLoading, setAiLoading] = useState(false);
    const [aiFeedback, setAiFeedback] = useState<string | null>(null);

    const t = (key: string) => TRANSLATIONS[key]?.[language] || key;
    const currency = t('currency');

    const formatCurrency = (val: number) => {
        // استخدام تنسيق: فاصلة للآلاف (,) ونقطة للهللات (.)
        // مثال: 100,955.26
        return new Intl.NumberFormat('en-US', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        }).format(val) + ' ' + currency;
    };

    const isGov = item.category === 'gov_fees';
    const hasParams = (item.activeParams && Object.keys(item.activeParams).length > 0) || item.category === 'structure'; // Structure always has hidden params like ratio

    const handleManualPriceChange = (val: string) => {
        const num = parseFloat(val);
        onParamChange(item.id, { manualPrice: isNaN(num) ? 0 : num });
        setAiFeedback(null);
    };

    const handleManualQtyChange = (val: string) => {
        const num = parseFloat(val);
        onParamChange(item.id, { manualQty: isNaN(num) ? 0 : num });
    };

    const triggerAICheck = async () => {
        if (!item.activeParams?.manualPrice) return;
        setAiLoading(true);
        const feedback = await onCheckAI(item, item.activeParams.manualPrice);
        setAiFeedback(feedback);
        setAiLoading(false);
    };

    const getTypeBadge = (type: string, category: string, isCustom?: boolean) => {
        if (isCustom) {
            return <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded flex items-center gap-1 text-xs"><Edit3 className="w-3 h-3" /> Custom</span>;
        }
        if (category === 'gov_fees') {
            return <span className="bg-purple-100 text-purple-700 px-1.5 py-0.5 rounded flex items-center gap-1 text-xs"><FileText className="w-3 h-3" /> {t('type_gov')}</span>;
        }
        if (category === 'production') {
            return <span className="bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded flex items-center gap-1 text-xs"><TrendingUp className="w-3 h-3" /> {t('type_prod')}</span>;
        }
        return <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded text-xs">{t('type_gen')}</span>;
    };

    return (
        <>
            <tr
                className={`hover:bg-slate-50 transition-colors border-b border-slate-200 cursor-pointer ${isExpanded ? 'bg-slate-50' : ''} ${isGov ? 'bg-purple-50/30' : ''} ${item.isOptimalPrice ? 'bg-amber-50/50' : ''}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <td className="p-2 sm:p-4 text-slate-500 font-mono text-sm">{item.id}</td>
                <td className="p-2 sm:p-4">
                    <div className="flex flex-col">
                        <span className={`font-bold text-sm sm:text-base flex items-center gap-1 sm:gap-2 ${isGov ? 'text-purple-900' : 'text-slate-800'}`}>
                            {item.displayName}
                            {hasParams && !isGov && <Settings2 className="w-3 h-3 text-slate-400 hidden sm:inline" />}
                            {item.isOptimalPrice && <span className="text-[10px] bg-amber-200 text-amber-800 px-1 rounded hidden sm:inline">{t('optimal')}</span>}
                            {item.isManualPrice && <span className="text-[10px] bg-blue-100 text-blue-800 px-1 rounded hidden sm:inline-flex items-center gap-1"><Edit3 className="w-3 h-3" /> {t('edit')}</span>}
                            {/* v8.5 Brain Insight Badge */}
                            {item.profitStatus === 'loss' && (
                                <span className="text-[10px] bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1 animate-pulse" title={item.brainWarnings?.[0] || ''}>
                                    🔴 {language === 'ar' ? 'خسارة' : 'Loss'}
                                </span>
                            )}
                            {item.profitStatus === 'exaggerated' && (
                                <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1" title={item.brainWarnings?.[0] || ''}>
                                    🟠 {language === 'ar' ? 'مبالغة' : 'High'}
                                </span>
                            )}
                            {item.profitStatus === 'balanced' && (
                                <span className="text-[10px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1">
                                    🟢
                                </span>
                            )}
                        </span>
                        <span className="text-xs text-slate-500 mt-1 hidden sm:flex items-center gap-1">
                            {getTypeBadge(item.type, item.category, item.isCustom)}
                        </span>
                    </div>
                </td>
                <td className="p-2 sm:p-4" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center gap-1">
                        <input
                            type="number"
                            value={item.qty}
                            onChange={(e) => handleManualQtyChange(e.target.value)}
                            className={`w-12 sm:w-16 bg-transparent border-b ${item.isManualQty ? 'border-blue-500 text-blue-700 font-bold' : 'border-slate-300 text-slate-700'} text-center outline-none focus:border-emerald-500 text-sm`}
                        />
                        <span className="text-slate-400 text-xs sm:text-sm">{item.unit}</span>
                    </div>
                </td>

                {/* Supplier Dropdown Column */}
                {/* Supplier - hidden on mobile */}
                <td className="p-2 sm:p-4 w-48 sm:w-64 hidden md:table-cell" onClick={(e) => e.stopPropagation()}>
                    <div className="relative group">
                        <select
                            className="w-full opacity-0 absolute inset-0 cursor-pointer z-10"
                            value={item.selectedSupplier.id}
                            onChange={(e) => onParamChange(item.id, { supplierId: e.target.value })}
                            disabled={item.suppliers.length <= 1}
                        >
                            {item.suppliers.map(s => {
                                const displayName = encryptSupplierName && userPlan
                                    ? encryptSupplierName(s.name[language], userPlan)
                                    : s.name[language];
                                return (
                                    <option key={s.id} value={s.id}>{displayName} - {s.tier}</option>
                                );
                            })}
                        </select>
                        {/* Visual Representation */}
                        <SupplierBadge supplier={item.selectedSupplier} language={language} t={t} isFreePlan={isFreePlan} />
                        {item.suppliers.length > 1 && (
                            <ChevronDown className="w-4 h-4 text-slate-400 absolute left-2 top-1/2 -translate-y-1/2 pointer-events-none" />
                        )}
                    </div>
                </td>

                {/* SBC Code - hidden on mobile */}
                <td className="p-2 sm:p-4 hidden lg:table-cell">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                        <ShieldCheck className="w-3 h-3" /> {item.sbc}
                    </span>
                </td>
                <td className="p-2 sm:p-4 text-right">
                    <div className="flex flex-col items-end">
                        <span className={`font-bold text-sm sm:text-base ${item.isManualPrice ? 'text-blue-700' : 'text-emerald-700'}`}>
                            {formatCurrency(item.usedPrice)}
                        </span>
                        {item.isManualPrice && (
                            <span className="text-[10px] text-slate-400 line-through decoration-slate-400 hidden sm:block">
                                {formatCurrency(item.finalUnitPrice)}
                            </span>
                        )}
                    </div>
                </td>
                <td className="p-2 sm:p-4 text-right font-bold text-slate-800 text-sm sm:text-base">{formatCurrency(item.totalLinePrice)}</td>
                <td className="p-2 sm:p-4 text-center text-slate-400">
                    {item.isCustom ? (
                        <button
                            onClick={(e) => { e.stopPropagation(); onDeleteCustomItem(item.id); }}
                            className="p-1 hover:bg-red-100 text-red-400 rounded-full transition-colors"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                    ) : (
                        <button className="p-1 hover:bg-slate-200 rounded-full transition-colors">
                            {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </button>
                    )}
                </td>
            </tr>

            {isExpanded && (
                <tr className="bg-slate-50 border-b border-slate-200">
                    <td colSpan={8} className="p-0">
                        <div className="p-6 bg-slate-100/50 shadow-inner">
                            {/* Manual Price Override Section */}
                            {!isGov && (
                                <div className="mb-4 bg-blue-50/50 p-4 rounded-lg border border-blue-100 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="flex flex-col gap-1">
                                            <label className="text-xs font-bold text-blue-800 flex items-center gap-1">
                                                <Edit3 className="w-3 h-3" /> {t('manual_edit')}
                                            </label>
                                            <div className="flex items-center gap-2">
                                                <input
                                                    type="number"
                                                    placeholder={item.finalUnitPrice.toFixed(2)}
                                                    value={item.activeParams?.manualPrice || ''}
                                                    onChange={(e) => handleManualPriceChange(e.target.value)}
                                                    className="border border-blue-300 rounded p-1.5 text-sm w-32 focus:ring-2 focus:ring-blue-500 outline-none"
                                                />
                                                <span className="text-xs text-slate-500">{currency}</span>
                                            </div>
                                        </div>

                                        {item.isManualPrice && (
                                            <button
                                                onClick={triggerAICheck}
                                                disabled={aiLoading}
                                                className="flex items-center gap-2 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded shadow transition-all disabled:opacity-50"
                                            >
                                                {aiLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Bot className="w-3 h-3" />}
                                                {t('ai_check')}
                                            </button>
                                        )}
                                    </div>

                                    {aiFeedback && (
                                        <div className="flex-1 mr-4 bg-indigo-100 border border-indigo-200 p-2 rounded text-xs text-indigo-800 flex items-start gap-2">
                                            <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <p>{aiFeedback}</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Custom Parameters Inputs */}
                            {hasParams && (
                                <div className="mb-6 bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
                                    <h4 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
                                        <Settings2 className="w-4 h-4 text-blue-500" />
                                        {t('tech_specs')}
                                    </h4>
                                    <div className="flex flex-wrap gap-4">

                                        {/* Steel Ratio Slider for Load Balancing */}
                                        {(item.category === 'structure' || item.activeParams?.steelRatio !== undefined) && (
                                            <div className="flex flex-col gap-1 w-48">
                                                <label className="text-xs font-medium text-slate-500 flex justify-between">
                                                    <span>Steel Ratio (Load Balance)</span>
                                                    <span className="text-blue-600">{item.activeParams?.steelRatio || 80} kg/mآ³</span>
                                                </label>
                                                <input
                                                    type="range"
                                                    min="60"
                                                    max="150"
                                                    step="5"
                                                    className="h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                    value={item.activeParams?.steelRatio || 80}
                                                    onChange={(e) => onParamChange(item.id, { steelRatio: parseFloat(e.target.value) })}
                                                />
                                                <span className="text-[10px] text-slate-400">Increase for heavier loads</span>
                                            </div>
                                        )}

                                        {item.activeParams?.depth !== undefined && (
                                            <div className="flex flex-col gap-1 w-32">
                                                <label className="text-xs font-medium text-slate-500">{t('depth_m')}</label>
                                                <input
                                                    type="number"
                                                    step="0.1"
                                                    className="border border-slate-300 rounded p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={item.activeParams.depth}
                                                    onChange={(e) => onParamChange(item.id, { depth: parseFloat(e.target.value) })}
                                                />
                                                {item.activeParams.depth > 3 && (
                                                    <span className="text-[10px] text-red-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> {t('high_risk')}</span>
                                                )}
                                            </div>
                                        )}

                                        {/* Excavation Depth */}
                                        {item.activeParams?.excavationDepth !== undefined && (
                                            <div className="flex flex-col gap-1 w-32">
                                                <label className="text-xs font-medium text-slate-500">عمق الحفر (م)</label>
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    min="0.5"
                                                    max="10"
                                                    className="border border-slate-300 rounded p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={item.activeParams.excavationDepth}
                                                    onChange={(e) => onParamChange(item.id, { excavationDepth: parseFloat(e.target.value) })}
                                                />
                                                {item.activeParams.excavationDepth > 4 && (
                                                    <span className="text-[10px] text-red-500 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> عمق خطر</span>
                                                )}
                                            </div>
                                        )}

                                        {/* Subsidence Ratio */}
                                        {item.activeParams?.subsidenceRatio !== undefined && (
                                            <div className="flex flex-col gap-1 w-40">
                                                <label className="text-xs font-medium text-slate-500 flex justify-between">
                                                    <span>نسبة الهبوط</span>
                                                    <span className="text-blue-600">{Math.round((item.activeParams.subsidenceRatio || 0) * 100)}%</span>
                                                </label>
                                                <input
                                                    type="range"
                                                    min="0"
                                                    max="0.20"
                                                    step="0.01"
                                                    className="h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                                                    value={item.activeParams.subsidenceRatio}
                                                    onChange={(e) => onParamChange(item.id, { subsidenceRatio: parseFloat(e.target.value) })}
                                                />
                                                <span className="text-[10px] text-slate-400">يؤثر على كمية الردم المطلوبة</span>
                                            </div>
                                        )}

                                        {/* Backfill Density */}
                                        {item.activeParams?.backfillDensity !== undefined && (
                                            <div className="flex flex-col gap-1 w-36">
                                                <label className="text-xs font-medium text-slate-500">كثافة الردم (كجم/م³)</label>
                                                <input
                                                    type="number"
                                                    step="50"
                                                    min="1500"
                                                    max="2200"
                                                    className="border border-slate-300 rounded p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={item.activeParams.backfillDensity}
                                                    onChange={(e) => onParamChange(item.id, { backfillDensity: parseFloat(e.target.value) })}
                                                />
                                            </div>
                                        )}

                                        {/* Compaction Layers */}
                                        {item.activeParams?.compactionLayers !== undefined && (
                                            <div className="flex flex-col gap-1 w-32">
                                                <label className="text-xs font-medium text-slate-500">طبقات الدمك</label>
                                                <input
                                                    type="number"
                                                    step="1"
                                                    min="1"
                                                    max="10"
                                                    className="border border-slate-300 rounded p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={item.activeParams.compactionLayers}
                                                    onChange={(e) => onParamChange(item.id, { compactionLayers: parseInt(e.target.value) })}
                                                />
                                                <span className="text-[10px] text-slate-400">عدد طبقات الدمك</span>
                                            </div>
                                        )}

                                        {(item.activeParams?.thickness !== undefined || item.category === 'structure') && item.unit === 'م2' && (
                                            <div className="flex flex-col gap-1 w-32">
                                                <label className="text-xs font-medium text-slate-500">{t('thickness_cm')}</label>
                                                <input
                                                    type="number"
                                                    className="border border-slate-300 rounded p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={item.activeParams?.thickness || 15}
                                                    onChange={(e) => onParamChange(item.id, { thickness: parseFloat(e.target.value) })}
                                                />
                                            </div>
                                        )}

                                        {item.activeParams?.cementContent !== undefined && (
                                            <div className="flex flex-col gap-1 w-32">
                                                <label className="text-xs font-medium text-slate-500">{t('cement_bags')}</label>
                                                <input
                                                    type="number"
                                                    className="border border-slate-300 rounded p-1.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                                    value={item.activeParams.cementContent}
                                                    onChange={(e) => onParamChange(item.id, { cementContent: parseFloat(e.target.value) })}
                                                />
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                                    <span className="block text-xs text-slate-500 mb-1">{t('mat_waste')} ({Math.round(item.waste * 100)}%)</span>
                                    <span className="font-semibold text-slate-800">{formatCurrency(item.matCost + item.wasteCost)}</span>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                                    <span className="block text-xs text-slate-500 mb-1">{t('labor_manu')}</span>
                                    <span className="font-semibold text-slate-800">{formatCurrency(item.labCost)}</span>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-200">
                                    <span className="block text-xs text-slate-500 mb-1">Overhead Share</span>
                                    <span className="font-semibold text-slate-800">{formatCurrency(item.overheadUnitShare)}</span>
                                </div>
                                <div className={`${isGov ? 'bg-slate-100 border-slate-200' : 'bg-emerald-50 border-emerald-100'} p-4 rounded-lg shadow-sm border`}>
                                    <span className={`block text-xs mb-1 ${isGov ? 'text-slate-500' : 'text-emerald-600'}`}>{t('profit_val')}</span>
                                    {isGov ? (
                                        <span className="font-semibold text-slate-400 text-sm">N/A (Gov)</span>
                                    ) : (
                                        <span className="font-semibold text-emerald-700">{formatCurrency(item.profitAmount)}</span>
                                    )}
                                </div>
                            </div>

                            {/* v8.5 Brain Warnings Display */}
                            {item.brainWarnings && item.brainWarnings.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    {item.brainWarnings.map((warning, idx) => (
                                        <div
                                            key={idx}
                                            className={`flex items-start gap-2 p-3 rounded-lg text-xs border ${
                                                item.profitStatus === 'loss'
                                                    ? 'bg-red-50 border-red-200 text-red-800'
                                                    : 'bg-orange-50 border-orange-200 text-orange-800'
                                            }`}
                                        >
                                            <Brain className="w-4 h-4 mt-0.5 flex-shrink-0" />
                                            <span>{warning}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </td>
                </tr>
            )}
        </>
    );
};

const NewItemForm: React.FC<{ onAdd: (item: BaseItem) => void; onCancel: () => void }> = ({ onAdd, onCancel }) => {
    const [name, setName] = useState('');
    const [unit, setUnit] = useState('ظ…2');
    const [qty, setQty] = useState(1);
    const [price, setPrice] = useState(0);

    const handleSubmit = () => {
        if (!name || price <= 0) return;
        const newItem: BaseItem = {
            id: `custom-${Date.now()}`,
            category: 'custom',
            type: 'all',
            name: { ar: name, en: name, fr: name, zh: name },
            unit,
            qty,
            baseMaterial: price * 0.6, // rough split
            baseLabor: price * 0.4,
            waste: 0,
            suppliers: [{ id: 'custom', name: { ar: 'مورد خاص', en: 'Custom Supplier', fr: 'Custom', zh: 'Custom' }, tier: 'standard', priceMultiplier: 1 }],
            sbc: 'Custom',
            soilFactor: false,
            dependency: 'fixed',
            isCustom: true
        };
        onAdd(newItem);
        onCancel();
    };

    return (
        <tr className="bg-emerald-50/50 border-t-2 border-emerald-200">
            <td className="p-4" colSpan={8}>
                <div className="flex items-center gap-4">
                    <div className="flex-1">
                        <label className="text-[10px] uppercase text-slate-500">اسم البند</label>
                        <input autoFocus type="text" className="w-full border rounded p-1" placeholder="مثال: ديكور خشب إضافي" value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="w-20">
                        <label className="text-[10px] uppercase text-slate-500">الوحدة</label>
                        <input type="text" className="w-full border rounded p-1" value={unit} onChange={e => setUnit(e.target.value)} />
                    </div>
                    <div className="w-20">
                        <label className="text-[10px] uppercase text-slate-500">الكمية</label>
                        <input type="number" className="w-full border rounded p-1" value={qty} onChange={e => setQty(Number(e.target.value))} />
                    </div>
                    <div className="w-32">
                        <label className="text-[10px] uppercase text-slate-500">السعر التقديري</label>
                        <input type="number" className="w-full border rounded p-1" value={price} onChange={e => setPrice(Number(e.target.value))} />
                    </div>
                    <div className="flex items-end gap-2 pt-4">
                        <button onClick={handleSubmit} className="bg-emerald-600 text-white px-3 py-1.5 rounded text-sm hover:bg-emerald-700">إضافة</button>
                        <button onClick={onCancel} className="bg-slate-200 text-slate-600 px-3 py-1.5 rounded text-sm hover:bg-slate-300">إلغاء</button>
                    </div>
                </div>
            </td>
        </tr>
    )
}

const ItemTable: React.FC<ItemTableProps> = ({ items, language, onParamChange, onCheckAI, onAddCustomItem, onDeleteCustomItem, isFreePlan, encryptSupplierName, userPlan, isDemoMode = false, sections = [], enabledSections }) => {
    const [isAdding, setIsAdding] = useState(false);
    const [collapsedSections, setCollapsedSections] = useState<Record<string, boolean>>({});
    const t = (key: string) => TRANSLATIONS[key]?.[language] || key;
    const isAr = language === 'ar';

    const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(val) + ' ' + t('currency');

    // Filter items for demo mode
    const DEMO_ALLOWED_CATEGORIES = ['site', 'structure'];
    const filteredItems = isDemoMode
        ? items.filter(item => DEMO_ALLOWED_CATEGORIES.includes(item.category))
        : items;

    // Sort items by ID (which already has section prefix like 01.xx, 05.xx)
    const sortedItems = [...filteredItems].sort((a, b) => a.id.localeCompare(b.id));

    // Group items by section code (first 2 chars of ID)
    const groupedItems = useMemo(() => {
        const groups: Record<string, CalculatedItem[]> = {};
        for (const item of sortedItems) {
            const sectionCode = item.id.split('.')[0] || '99';
            if (!groups[sectionCode]) groups[sectionCode] = [];
            groups[sectionCode].push(item);
        }
        return groups;
    }, [sortedItems]);

    // Get ordered section codes (use SECTION_DEFINITIONS order if available)
    const orderedSectionCodes = useMemo(() => {
        if (sections.length > 0) {
            const definedCodes = sections.map(s => s.code);
            const allCodes = Object.keys(groupedItems);
            const ordered = definedCodes.filter(c => allCodes.includes(c));
            const remaining = allCodes.filter(c => !definedCodes.includes(c)).sort();
            return [...ordered, ...remaining];
        }
        return Object.keys(groupedItems).sort();
    }, [sections, groupedItems]);

    const toggleSection = (code: string) => {
        setCollapsedSections(prev => ({ ...prev, [code]: !prev[code] }));
    };

    const isSectionEnabled = (code: string) => {
        if (!enabledSections || enabledSections.length === 0) return true;
        return enabledSections.includes(code);
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            {isFreePlan && (
                <div className="bg-amber-50 border-b border-amber-200 px-4 py-2 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-amber-500" />
                    <span className="text-xs text-amber-700">
                        {isAr ? 'أسماء الموردين مشفرة في الباقة المجانية. قم بالترقية لعرض الأسماء الكاملة.' : 'Supplier names are encrypted in the free plan. Upgrade to view full names.'}
                    </span>
                </div>
            )}
            {isDemoMode && (
                <div className="bg-blue-50 border-b border-blue-200 px-4 py-3 flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                        <Box className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <span className="text-sm font-medium text-blue-800">
                            {isAr ? '🏗️ وضع العرض التجريبي - يعرض بنود الحفر والخرسانة فقط' : '🏗️ Demo Mode - Showing excavation and concrete items only'}
                        </span>
                    </div>
                </div>
            )}
            <div className="overflow-x-auto">
            <table className="w-full text-right min-w-[640px]">
                <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs sm:text-sm uppercase tracking-wider">
                        <th className="p-2 sm:p-4 font-semibold w-12 sm:w-16">#</th>
                        <th className="p-2 sm:p-4 font-semibold">{t('item_desc')}</th>
                        <th className="p-2 sm:p-4 font-semibold w-20 sm:w-24">{t('qty')}</th>
                        <th className="p-2 sm:p-4 font-semibold w-48 sm:w-64 hidden md:table-cell">{t('supplier')}</th>
                        <th className="p-2 sm:p-4 font-semibold w-32 hidden lg:table-cell">{t('sbc_code')}</th>
                        <th className="p-2 sm:p-4 font-semibold text-right">{t('unit_price')}</th>
                        <th className="p-2 sm:p-4 font-semibold text-right">{t('total')}</th>
                        <th className="p-2 sm:p-4 font-semibold w-10 sm:w-12"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                    {orderedSectionCodes.map(sectionCode => {
                        const sectionDef = sections.find(s => s.code === sectionCode);
                        const sectionItems = groupedItems[sectionCode] || [];
                        const isEnabled = isSectionEnabled(sectionCode);
                        const isCollapsed = collapsedSections[sectionCode] ?? !isEnabled;
                        const subtotal = sectionItems.reduce((sum, item) => sum + item.totalLinePrice, 0);
                        const grandTotal = items.reduce((sum, item) => sum + item.totalLinePrice, 0);
                        const sectionPct = grandTotal > 0 ? (subtotal / grandTotal) * 100 : 0;
                        const sectionColor = sectionDef?.color || '#94a3b8';

                        if (sectionItems.length === 0) return null;

                        return (
                            <React.Fragment key={sectionCode}>
                                {/* Section Header Row */}
                                <tr
                                    className={`cursor-pointer select-none transition-colors ${isEnabled ? 'hover:bg-slate-50' : 'opacity-50'}`}
                                    onClick={() => toggleSection(sectionCode)}
                                    style={{ borderRight: `4px solid ${sectionDef?.color || '#94a3b8'}` }}
                                >
                                    <td colSpan={6} className="p-2 sm:p-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-lg">{sectionDef?.icon || 'ًں“¦'}</span>
                                            <span className="font-bold text-sm" style={{ color: sectionDef?.color || '#334155' }}>
                                                {sectionCode}.
                                            </span>
                                            <span className={`font-bold text-sm ${isEnabled ? 'text-slate-800' : 'text-slate-400'}`}>
                                                {isAr ? sectionDef?.nameAr : sectionDef?.nameEn || `Section ${sectionCode}`}
                                            </span>
                                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-full">
                                                {sectionItems.length} {isAr ? 'بند' : 'items'}
                                            </span>
                                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{
                                                backgroundColor: `${sectionColor}15`,
                                                color: sectionColor,
                                            }}>
                                                {sectionPct.toFixed(1)}%
                                            </span>
                                            {!isEnabled && (
                                                <span className="text-[10px] bg-red-50 text-red-400 px-1.5 py-0.5 rounded-full">
                                                    {isAr ? 'خارج النطاق' : 'Out of scope'}
                                                </span>
                                            )}
                                        </div>
                                        {/* Progress Bar */}
                                        <div className="mt-1.5 h-1.5 rounded-full bg-slate-100 overflow-hidden" style={{ maxWidth: '300px' }}>
                                            <div
                                                className="h-full rounded-full transition-all duration-500"
                                                style={{
                                                    width: `${Math.min(sectionPct, 100)}%`,
                                                    backgroundColor: sectionColor,
                                                    minWidth: sectionPct > 0 ? '4px' : '0',
                                                }}
                                            />
                                        </div>
                                    </td>
                                    <td className="p-2 sm:p-3 text-right">
                                        <span className={`font-bold text-sm ${isEnabled ? 'text-emerald-700' : 'text-slate-400'}`}>
                                            {formatCurrency(subtotal)}
                                        </span>
                                    </td>
                                    <td className="p-2 sm:p-3 text-center text-slate-400">
                                        {isCollapsed ? <ChevronDown className="w-4 h-4 inline" /> : <ChevronUp className="w-4 h-4 inline" />}
                                    </td>
                                </tr>

                                {/* Section Items (only when expanded) */}
                                {!isCollapsed && sectionItems.map((item, idx) => (
                                    <ItemRow
                                        key={item.id || idx}
                                        item={item}
                                        language={language}
                                        onParamChange={onParamChange}
                                        onCheckAI={onCheckAI}
                                        onDeleteCustomItem={onDeleteCustomItem}
                                        isFreePlan={isFreePlan}
                                        encryptSupplierName={encryptSupplierName}
                                        userPlan={userPlan}
                                    />
                                ))}

                                {/* Subtotal Row (only when expanded) */}
                                {!isCollapsed && (
                                    <tr style={{ borderRight: `4px solid ${sectionColor}` }}>
                                        <td colSpan={6} className="p-2 sm:p-3 text-right">
                                            <span className="text-xs font-bold" style={{ color: sectionColor }}>
                                                {isAr ? `إجمالي ${sectionDef?.nameAr || sectionCode}` : `${sectionDef?.nameEn || sectionCode} Subtotal`}
                                                <span className="text-slate-400 font-normal mr-2 ml-2">
                                                    ({sectionItems.length} {isAr ? 'بند' : 'items'})
                                                </span>
                                            </span>
                                        </td>
                                        <td className="p-2 sm:p-3 text-right">
                                            <span className="font-extrabold text-sm" style={{ color: sectionColor }}>
                                                {formatCurrency(subtotal)}
                                            </span>
                                        </td>
                                        <td className="p-2 sm:p-3"></td>
                                    </tr>
                                )}
                            </React.Fragment>
                        );
                    })}
                    {isAdding && <NewItemForm onAdd={onAddCustomItem} onCancel={() => setIsAdding(false)} />}
                </tbody>
            </table>
            </div>

            {!isAdding && (
                <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-center">
                    <button
                        onClick={() => setIsAdding(true)}
                        className="flex items-center gap-2 text-emerald-600 font-bold hover:bg-emerald-100 px-4 py-2 rounded-lg transition-colors border border-emerald-200"
                    >
                        <Plus className="w-4 h-4" /> {isAr ? 'إضافة بند جديد' : 'Add New Item'}
                    </button>
                </div>
            )}

            {items.length === 0 && !isAdding && (
                <div className="p-12 text-center text-slate-400 flex flex-col items-center">
                    <Box className="w-12 h-12 mb-2 opacity-50" />
                    <p>{t('no_items')}</p>
                </div>
            )}
        </div>
    );
};

export default ItemTable;
