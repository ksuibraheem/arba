import React from 'react';
import { Building, Home, Users, Lock, Sun, Wrench, CheckCircle, Clock, Percent, Layers } from 'lucide-react';
import { AreaBreakdownSummary, Language } from '../types';
import { formatNumber } from '../utils/formatting';

interface AreaBreakdownProps {
    breakdown: AreaBreakdownSummary;
    language: Language;
}

const AreaBreakdownDisplay: React.FC<AreaBreakdownProps> = ({ breakdown, language }) => {
    const isRtl = language === 'ar';

    // Use centralized formatting with space separators
    const fmt = (val: number) => formatNumber(val, 0, language);

    const t = {
        title: { ar: 'توزيع مساحات البناء', en: 'Building Area Breakdown' },
        totalArea: { ar: 'إجمالي مساحة البناء', en: 'Total Building Area' },
        floors: { ar: 'عدد الطوابق', en: 'Number of Floors' },
        rooms: { ar: 'مساحة الغرف', en: 'Rooms Area' },
        common: { ar: 'المساحات المشتركة', en: 'Common Areas' },
        closed: { ar: 'المساحات المغلقة', en: 'Closed Areas' },
        open: { ar: 'المساحات المفتوحة', en: 'Open Areas' },
        annexes: { ar: 'الملحقات', en: 'Annexes' },
        service: { ar: 'مساحة الخدمات', en: 'Service Areas' },
        occupied: { ar: 'المساحات المشغولة', en: 'Occupied Areas' },
        available: { ar: 'المساحات المتاحة', en: 'Available Areas' },
        sqm: { ar: 'م²', en: 'm²' },
        quantity: { ar: 'الكمية', en: 'Quantity' },
        percent: { ar: 'النسبة', en: 'Percentage' }
    };

    const getLabel = (key: string) => t[key as keyof typeof t]?.[language] || key;

    const areaItems = [
        { key: 'rooms', area: breakdown.roomsArea, percent: breakdown.roomsPercent, icon: Home, color: 'emerald' },
        { key: 'common', area: breakdown.commonArea, percent: breakdown.commonPercent, icon: Users, color: 'blue' },
        { key: 'closed', area: breakdown.closedArea, percent: breakdown.closedPercent, icon: Lock, color: 'slate' },
        { key: 'open', area: breakdown.openArea, percent: breakdown.openPercent, icon: Sun, color: 'amber' },
        { key: 'annexes', area: breakdown.annexesArea, percent: breakdown.annexesPercent, icon: Building, color: 'purple' },
        { key: 'service', area: breakdown.serviceArea, percent: breakdown.servicePercent, icon: Wrench, color: 'orange' },
    ];

    const usageItems = [
        { key: 'occupied', area: breakdown.occupiedArea, percent: breakdown.occupiedPercent, icon: CheckCircle, color: 'green' },
        { key: 'available', area: breakdown.availableArea, percent: breakdown.availablePercent, icon: Clock, color: 'cyan' },
    ];

    return (
        <div className="bg-white rounded-2xl shadow-lg border border-slate-200 p-6" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-blue-500" />
                    {getLabel('title')}
                </h3>
                <div className="flex items-center gap-4 text-sm">
                    <div className="bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200">
                        <span className="text-blue-700 font-bold">{fmt(breakdown.totalBuildArea)} {getLabel('sqm')}</span>
                        <span className="text-blue-500 text-xs mr-2 ml-2">{getLabel('totalArea')}</span>
                    </div>
                    <div className="bg-slate-100 px-3 py-1.5 rounded-lg">
                        <span className="text-slate-700 font-bold">{breakdown.floorsCount}</span>
                        <span className="text-slate-500 text-xs mr-2 ml-2">{getLabel('floors')}</span>
                    </div>
                </div>
            </div>

            {/* Area Categories Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                {areaItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <div
                            key={item.key}
                            className={`relative bg-${item.color}-50 rounded-xl p-4 border border-${item.color}-100 overflow-hidden`}
                        >
                            {/* Background Percentage Bar */}
                            <div
                                className={`absolute bottom-0 left-0 h-1 bg-${item.color}-400 transition-all duration-500`}
                                style={{ width: `${item.percent}%` }}
                            />

                            <div className="flex items-start justify-between">
                                <div>
                                    <div className={`text-${item.color}-600 text-xs font-medium mb-1 flex items-center gap-1`}>
                                        <Icon className="w-3.5 h-3.5" />
                                        {getLabel(item.key)}
                                    </div>
                                    <div className={`text-lg font-bold text-${item.color}-800`}>
                                        {fmt(item.area)} <span className="text-xs font-normal">{getLabel('sqm')}</span>
                                    </div>
                                </div>
                                <div className={`bg-${item.color}-200 text-${item.color}-800 text-sm font-bold px-2 py-0.5 rounded-full flex items-center gap-1`}>
                                    <Percent className="w-3 h-3" />
                                    {item.percent}%
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Usage Section */}
            <div className="border-t border-slate-200 pt-4">
                <h4 className="text-sm font-semibold text-slate-600 mb-3 flex items-center gap-2">
                    نسبة الإشغال والتوفر
                </h4>
                <div className="grid grid-cols-2 gap-4">
                    {usageItems.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div
                                key={item.key}
                                className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl p-4 border border-slate-200"
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <div className={`text-${item.color}-600 text-sm font-medium flex items-center gap-2`}>
                                        <Icon className="w-4 h-4" />
                                        {getLabel(item.key)}
                                    </div>
                                    <span className={`text-${item.color}-700 font-bold text-lg`}>{item.percent}%</span>
                                </div>
                                {/* Progress Bar */}
                                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                                    <div
                                        className={`h-full bg-${item.color}-500 rounded-full transition-all duration-500`}
                                        style={{ width: `${item.percent}%` }}
                                    />
                                </div>
                                <div className="mt-1 text-xs text-slate-500 text-center">
                                    {fmt(item.area)} {getLabel('sqm')}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default AreaBreakdownDisplay;
