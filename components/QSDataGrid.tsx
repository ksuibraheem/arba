/**
 * QSDataGrid — جدول بيانات متطور يشبه Excel
 * Advanced Excel-like Data Grid with inline editing, sorting, filtering, grouping
 * Zero-Leak: No copy/export, watermark overlay, server-side calculation
 */
import React, { useState, useMemo, useCallback } from 'react';
import { ChevronDown, ChevronUp, ChevronsUpDown, ChevronRight, Search, Filter } from 'lucide-react';
import { BaseItem, Language } from '../types';
import WatermarkOverlay from './WatermarkOverlay';

interface QSDataGridProps {
    items: BaseItem[];
    language: Language;
    employeeName: string;
    employeeId: string;
    onItemUpdate?: (itemId: string, field: string, value: any) => void;
    onItemClick?: (item: BaseItem) => void;
    onActionLog?: (action: string, target: string, metadata?: any) => void;
}

type SortDirection = 'asc' | 'desc' | null;
type SortField = 'name' | 'category' | 'unit' | 'qty' | 'baseMaterial' | 'baseLabor' | 'waste' | 'type';

const CATEGORY_LABELS: Record<string, { ar: string; en: string; color: string }> = {
    site: { ar: 'أعمال الموقع', en: 'Site Work', color: 'from-amber-500/20 to-yellow-500/20 border-amber-500/30 text-amber-400' },
    structure: { ar: 'الهيكل الإنشائي', en: 'Structure', color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30 text-blue-400' },
    architecture: { ar: 'التشطيبات', en: 'Architecture', color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-400' },
    mep_elec: { ar: 'الكهرباء', en: 'Electrical', color: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30 text-yellow-400' },
    mep_plumb: { ar: 'السباكة', en: 'Plumbing', color: 'from-cyan-500/20 to-teal-500/20 border-cyan-500/30 text-cyan-400' },
    mep_hvac: { ar: 'التكييف', en: 'HVAC', color: 'from-green-500/20 to-emerald-500/20 border-green-500/30 text-green-400' },
    insulation: { ar: 'العزل', en: 'Insulation', color: 'from-indigo-500/20 to-blue-500/20 border-indigo-500/30 text-indigo-400' },
    safety: { ar: 'السلامة', en: 'Safety', color: 'from-red-500/20 to-rose-500/20 border-red-500/30 text-red-400' },
    gov_fees: { ar: 'الرسوم الحكومية', en: 'Gov. Fees', color: 'from-slate-500/20 to-gray-500/20 border-slate-500/30 text-slate-400' },
    production: { ar: 'الإنتاج', en: 'Production', color: 'from-orange-500/20 to-amber-500/20 border-orange-500/30 text-orange-400' },
    manpower: { ar: 'القوى العاملة', en: 'Manpower', color: 'from-teal-500/20 to-green-500/20 border-teal-500/30 text-teal-400' },
    custom: { ar: 'مخصص', en: 'Custom', color: 'from-pink-500/20 to-rose-500/20 border-pink-500/30 text-pink-400' },
};

const QSDataGrid: React.FC<QSDataGridProps> = ({
    items, language, employeeName, employeeId, onItemUpdate, onItemClick, onActionLog
}) => {
    const t = (ar: string, en: string) => { const m: Record<string, string> = { ar, en, fr: en, zh: en }; return m[language] || en; };
    const langKey = (language === 'ar' ? 'ar' : 'en') as 'ar' | 'en';

    // State
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState<string>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');
    const [sortField, setSortField] = useState<SortField | null>(null);
    const [sortDir, setSortDir] = useState<SortDirection>(null);
    const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(new Set());
    const [editingCell, setEditingCell] = useState<{ itemId: string; field: string } | null>(null);
    const [editValue, setEditValue] = useState<string>('');
    const [groupBy, setGroupBy] = useState<boolean>(true);

    // Columns definition
    const columns: { key: SortField; label: string; width: string; align: string; editable: boolean; numeric: boolean }[] = [
        { key: 'name', label: t('اسم البند', 'Item Name'), width: 'flex-[2.5]', align: 'text-right', editable: false, numeric: false },
        { key: 'category', label: t('الفئة', 'Category'), width: 'flex-[1]', align: 'text-center', editable: false, numeric: false },
        { key: 'type', label: t('النوع', 'Type'), width: 'flex-[0.8]', align: 'text-center', editable: false, numeric: false },
        { key: 'unit', label: t('الوحدة', 'Unit'), width: 'flex-[0.6]', align: 'text-center', editable: false, numeric: false },
        { key: 'qty', label: t('الكمية', 'Qty'), width: 'flex-[0.7]', align: 'text-center', editable: true, numeric: true },
        { key: 'baseMaterial', label: t('مواد', 'Material'), width: 'flex-[0.8]', align: 'text-center', editable: true, numeric: true },
        { key: 'baseLabor', label: t('عمالة', 'Labor'), width: 'flex-[0.8]', align: 'text-center', editable: true, numeric: true },
        { key: 'waste', label: t('هالك%', 'Waste%'), width: 'flex-[0.6]', align: 'text-center', editable: true, numeric: true },
    ];

    // Filter items
    const filteredItems = useMemo(() => {
        return items.filter(item => {
            const nameMatch = item.name.ar.includes(searchQuery) ||
                item.name.en.toLowerCase().includes(searchQuery.toLowerCase());
            const catMatch = categoryFilter === 'all' || item.category === categoryFilter;
            const typeMatch = typeFilter === 'all' || item.type === typeFilter;
            return nameMatch && catMatch && typeMatch;
        });
    }, [items, searchQuery, categoryFilter, typeFilter]);

    // Sort items
    const sortedItems = useMemo(() => {
        if (!sortField || !sortDir) return filteredItems;
        return [...filteredItems].sort((a, b) => {
            let aVal: any, bVal: any;
            if (sortField === 'name') {
                aVal = langKey === 'ar' ? a.name.ar : a.name.en;
                bVal = langKey === 'ar' ? b.name.ar : b.name.en;
            } else {
                aVal = (a as any)[sortField];
                bVal = (b as any)[sortField];
            }
            if (typeof aVal === 'number' && typeof bVal === 'number') {
                return sortDir === 'asc' ? aVal - bVal : bVal - aVal;
            }
            return sortDir === 'asc'
                ? String(aVal).localeCompare(String(bVal))
                : String(bVal).localeCompare(String(aVal));
        });
    }, [filteredItems, sortField, sortDir, language]);

    // Group items by category
    const groupedItems = useMemo(() => {
        if (!groupBy) return { _all: sortedItems };
        const groups: Record<string, BaseItem[]> = {};
        sortedItems.forEach(item => {
            if (!groups[item.category]) groups[item.category] = [];
            groups[item.category].push(item);
        });
        return groups;
    }, [sortedItems, groupBy]);

    // Handle sort click
    const handleSort = useCallback((field: SortField) => {
        if (sortField === field) {
            if (sortDir === 'asc') setSortDir('desc');
            else if (sortDir === 'desc') { setSortField(null); setSortDir(null); }
        } else {
            setSortField(field);
            setSortDir('asc');
        }
    }, [sortField, sortDir]);

    // Handle cell edit
    const startEdit = useCallback((itemId: string, field: string, currentValue: any) => {
        setEditingCell({ itemId, field });
        setEditValue(String(currentValue));
        onActionLog?.('edit_item', `item:${itemId}`, { field });
    }, [onActionLog]);

    const saveEdit = useCallback(() => {
        if (!editingCell) return;
        const numVal = parseFloat(editValue);
        if (!isNaN(numVal)) {
            onItemUpdate?.(editingCell.itemId, editingCell.field, numVal);
        }
        setEditingCell(null);
        setEditValue('');
    }, [editingCell, editValue, onItemUpdate]);

    const cancelEdit = useCallback(() => {
        setEditingCell(null);
        setEditValue('');
    }, []);

    // Toggle group collapse
    const toggleGroup = (cat: string) => {
        setCollapsedGroups(prev => {
            const next = new Set(prev);
            if (next.has(cat)) next.delete(cat);
            else next.add(cat);
            return next;
        });
    };

    // Stats
    const totalMaterial = filteredItems.reduce((s, i) => s + (i.baseMaterial * i.qty), 0);
    const totalLabor = filteredItems.reduce((s, i) => s + (i.baseLabor * i.qty), 0);

    // Sort icon
    const SortIcon = ({ field }: { field: SortField }) => {
        if (sortField !== field) return <ChevronsUpDown className="w-3.5 h-3.5 text-slate-500 opacity-0 group-hover:opacity-100 transition" />;
        if (sortDir === 'asc') return <ChevronUp className="w-3.5 h-3.5 text-cyan-400" />;
        return <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />;
    };

    // Get display value for a cell
    const getCellValue = (item: BaseItem, field: SortField): string => {
        switch (field) {
            case 'name': return langKey === 'ar' ? item.name.ar : item.name.en;
            case 'category': return CATEGORY_LABELS[item.category]?.[langKey] || item.category;
            case 'type': return item.type;
            case 'unit': return item.unit;
            case 'qty': return item.qty.toLocaleString();
            case 'baseMaterial': return item.baseMaterial.toLocaleString();
            case 'baseLabor': return item.baseLabor.toLocaleString();
            case 'waste': return `${(item.waste * 100).toFixed(0)}%`;
            default: return '';
        }
    };

    return (
        <div
            className="relative bg-slate-800/50 backdrop-blur-sm rounded-2xl border border-slate-700/50 overflow-hidden"
            onCopy={e => { e.preventDefault(); onActionLog?.('attempt_copy', 'data_grid'); }}
            onCut={e => e.preventDefault()}
            style={{ userSelect: 'none', WebkitUserSelect: 'none' } as React.CSSProperties}
        >
            {/* Watermark */}
            <WatermarkOverlay employeeName={employeeName} employeeId={employeeId} language={language} />

            {/* Toolbar */}
            <div className="px-5 py-4 border-b border-slate-700/50 flex flex-col md:flex-row gap-3 relative z-10">
                {/* Search */}
                <div className="flex-1 relative">
                    <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input
                        type="text"
                        placeholder={t('بحث عن بند...', 'Search items...')}
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900/60 border border-slate-700/50 rounded-lg pr-10 pl-4 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-cyan-500/50"
                    />
                </div>

                {/* Category filter */}
                <select
                    value={categoryFilter}
                    onChange={e => setCategoryFilter(e.target.value)}
                    className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white"
                >
                    <option value="all">{t('كل الفئات', 'All Categories')}</option>
                    {Object.entries(CATEGORY_LABELS).map(([k, v]) => (
                        <option key={k} value={k}>{v[langKey]}</option>
                    ))}
                </select>

                {/* Type filter */}
                <select
                    value={typeFilter}
                    onChange={e => setTypeFilter(e.target.value)}
                    className="bg-slate-900/60 border border-slate-700/50 rounded-lg px-3 py-2 text-sm text-white"
                >
                    <option value="all">{t('كل الأنواع', 'All Types')}</option>
                    <option value="villa">{t('فيلا', 'Villa')}</option>
                    <option value="tower">{t('برج', 'Tower')}</option>
                    <option value="rest_house">{t('استراحة', 'Rest House')}</option>
                    <option value="factory">{t('مصنع', 'Factory')}</option>
                </select>

                {/* Group toggle */}
                <button
                    onClick={() => setGroupBy(prev => !prev)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition border ${groupBy
                        ? 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
                        : 'bg-slate-900/60 text-slate-400 border-slate-700/50 hover:bg-slate-700/50'
                        }`}
                >
                    <Filter className="w-4 h-4" />
                    {t('تجميع', 'Group')}
                </button>
            </div>

            {/* Stats Bar */}
            <div className="px-5 py-2.5 bg-slate-900/40 border-b border-slate-700/30 flex items-center gap-6 text-xs relative z-10">
                <span className="text-slate-400">{t('البنود:', 'Items:')} <span className="text-white font-bold">{filteredItems.length}</span></span>
                <span className="text-slate-400">{t('إجمالي المواد:', 'Total Material:')} <span className="text-cyan-400 font-bold">{totalMaterial.toLocaleString()}</span></span>
                <span className="text-slate-400">{t('إجمالي العمالة:', 'Total Labor:')} <span className="text-green-400 font-bold">{totalLabor.toLocaleString()}</span></span>
            </div>

            {/* Table */}
            <div className="overflow-x-auto relative z-10">
                {/* Header */}
                <div className="flex items-center bg-slate-700/40 border-b border-slate-600/50 min-w-[900px]">
                    <div className="w-12 px-3 py-3 text-center text-xs text-slate-500 font-medium">#</div>
                    {columns.map(col => (
                        <div
                            key={col.key}
                            onClick={() => handleSort(col.key)}
                            className={`${col.width} px-3 py-3 ${col.align} text-xs text-slate-400 font-medium cursor-pointer hover:text-white transition group flex items-center justify-center gap-1`}
                        >
                            <span>{col.label}</span>
                            <SortIcon field={col.key} />
                        </div>
                    ))}
                </div>

                {/* Body */}
                <div className="max-h-[600px] overflow-y-auto min-w-[900px]">
                    {Object.entries(groupedItems).map(([category, catItems]) => {
                        const items = catItems as BaseItem[];
                        return (
                            <React.Fragment key={category}>
                                {/* Group Header */}
                                {groupBy && category !== '_all' && (
                                    <div
                                        onClick={() => toggleGroup(category)}
                                        className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer bg-gradient-to-r ${CATEGORY_LABELS[category]?.color || 'from-slate-500/20 to-gray-500/20 border-slate-500/30 text-slate-400'} border-y border-opacity-50 hover:brightness-110 transition`}
                                    >
                                        {collapsedGroups.has(category)
                                            ? <ChevronRight className="w-4 h-4" />
                                            : <ChevronDown className="w-4 h-4" />
                                        }
                                        <span className="text-sm font-bold">
                                            {CATEGORY_LABELS[category]?.[langKey] || category}
                                        </span>
                                        <span className="text-xs opacity-70">({items.length} {t('بند', 'items')})</span>
                                    </div>
                                )}

                                {/* Rows */}
                                {!collapsedGroups.has(category) && items.map((item, idx) => (
                                    <div
                                        key={item.id}
                                        className="flex items-center border-b border-slate-700/30 hover:bg-slate-700/20 transition group/row min-h-[44px]"
                                    >
                                        {/* Row number */}
                                        <div className="w-12 px-3 py-2 text-center text-xs text-slate-600">{idx + 1}</div>

                                        {columns.map(col => {
                                            const isEditing = editingCell?.itemId === item.id && editingCell?.field === col.key;

                                            return (
                                                <div
                                                    key={col.key}
                                                    className={`${col.width} px-3 py-2 ${col.align} text-sm`}
                                                    onDoubleClick={() => {
                                                        if (col.editable) {
                                                            const raw = col.key === 'waste' ? (item.waste * 100) : (item as any)[col.key];
                                                            startEdit(item.id, col.key, raw);
                                                        }
                                                    }}
                                                    onClick={() => {
                                                        if (col.key === 'name' && onItemClick) {
                                                            onItemClick(item);
                                                        }
                                                    }}
                                                >
                                                    {isEditing ? (
                                                        <input
                                                            type="number"
                                                            autoFocus
                                                            value={editValue}
                                                            onChange={e => setEditValue(e.target.value)}
                                                            onBlur={saveEdit}
                                                            onKeyDown={e => {
                                                                if (e.key === 'Enter') saveEdit();
                                                                if (e.key === 'Escape') cancelEdit();
                                                            }}
                                                            className="w-full bg-slate-900 border border-cyan-500/50 rounded px-2 py-1 text-white text-center text-sm focus:outline-none focus:ring-1 focus:ring-cyan-500/50"
                                                        />
                                                    ) : (
                                                        <span className={`${col.editable
                                                            ? 'cursor-pointer hover:text-cyan-400 hover:bg-cyan-500/10 px-2 py-0.5 rounded transition'
                                                            : ''
                                                            } ${col.key === 'name' && onItemClick ? 'cursor-pointer hover:text-cyan-400 transition' : ''} text-white`}>
                                                            {getCellValue(item, col.key)}
                                                        </span>
                                                    )}
                                                </div>
                                            );
                                        })}
                                    </div>
                                ))}
                            </React.Fragment>
                        );
                    })}

                    {filteredItems.length === 0 && (
                        <div className="text-center py-16 text-slate-500">
                            <p className="text-lg mb-2">{t('لا توجد بنود مطابقة', 'No matching items')}</p>
                            <p className="text-sm">{t('جرب تغيير معايير البحث', 'Try adjusting your search criteria')}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default QSDataGrid;
