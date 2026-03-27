import React from 'react';
import { Calculator, Wallet, TrendingUp, CircleDollarSign, Box, Users } from 'lucide-react';
import { Language } from '../types';
import { TRANSLATIONS } from '../constants';
import { formatCurrency, formatNumber } from '../utils/formatting';

interface StatsGridProps {
    totalDirect: number;
    totalOverhead: number;
    totalProfit: number;
    finalPrice: number;
    totalConcreteVolume: number;
    totalLaborCost: number;
    totalMaterialCost: number;
    language: Language;
}

const StatsGrid: React.FC<StatsGridProps> = ({
    totalDirect, totalOverhead, totalProfit, finalPrice,
    totalConcreteVolume, totalLaborCost, totalMaterialCost,
    language
}) => {
    const t = (key: string) => TRANSLATIONS[key]?.[language] || key;
    const isRtl = language === 'ar';

    return (
        <>
            {/* Row 1: Key Financials */}
            <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 ${isRtl ? '' : 'flex-row-reverse'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                {/* Direct Cost */}
                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 border border-slate-100 relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 duration-300 group">
                    <div className={`absolute top-0 ${isRtl ? 'right-0' : 'left-0'} w-1.5 h-full bg-gradient-to-b from-blue-400 to-blue-600`}></div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-500 text-sm font-semibold">{t('total_direct_cost')}</h3>
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Calculator className="w-5 h-5 text-blue-500" />
                        </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-800 tracking-tight">{formatCurrency(totalDirect, language)}</div>
                </div>

                {/* Overhead */}
                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 border border-slate-100 relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 duration-300 group">
                    <div className={`absolute top-0 ${isRtl ? 'right-0' : 'left-0'} w-1.5 h-full bg-gradient-to-b from-orange-400 to-orange-600`}></div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-500 text-sm font-semibold">{t('overhead_distributed')}</h3>
                        <div className="w-10 h-10 rounded-full bg-orange-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <Wallet className="w-5 h-5 text-orange-500" />
                        </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-800 tracking-tight">{formatCurrency(totalOverhead, language)}</div>
                </div>

                {/* Profit */}
                <div className="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] p-6 border border-slate-100 relative overflow-hidden transition-all hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)] hover:-translate-y-1 duration-300 group">
                    <div className={`absolute top-0 ${isRtl ? 'right-0' : 'left-0'} w-1.5 h-full bg-gradient-to-b from-emerald-400 to-emerald-600`}></div>
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-500 text-sm font-semibold">{t('net_profit')}</h3>
                        <div className="w-10 h-10 rounded-full bg-emerald-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                            <TrendingUp className="w-5 h-5 text-emerald-500" />
                        </div>
                    </div>
                    <div className="text-3xl font-extrabold text-slate-800 tracking-tight">{formatCurrency(totalProfit, language)}</div>
                </div>

                {/* Final Price */}
                <div className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] p-6 border border-slate-700 overflow-hidden transition-all hover:shadow-[0_12px_40px_rgba(16,185,129,0.15)] hover:-translate-y-1 duration-300 group">
                    <div className="absolute -right-6 -top-6 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-colors"></div>
                    <div className="flex items-center justify-between mb-4 relative z-10">
                        <h3 className="text-slate-300 text-sm font-semibold">{t('final_offer_price')}</h3>
                        <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20 group-hover:scale-110 transition-transform">
                            <CircleDollarSign className="w-5 h-5 text-emerald-400" />
                        </div>
                    </div>
                    <div className="text-3xl font-black text-white tracking-tight relative z-10">{formatCurrency(finalPrice, language)}</div>
                </div>
            </div>

            {/* Row 2: Technical Breakdown */}
            <div className={`grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 ${isRtl ? '' : 'flex-row-reverse'}`} dir={isRtl ? 'rtl' : 'ltr'}>
                <div className="bg-gradient-to-br from-indigo-50/80 to-indigo-100/50 rounded-2xl p-6 border border-indigo-100/80 flex items-center justify-between transition-all hover:shadow-md hover:border-indigo-200">
                    <div>
                        <h4 className="text-indigo-600/80 text-xs font-bold uppercase tracking-wider mb-2">{t('total_concrete')}</h4>
                        <span className="text-2xl font-black text-indigo-950">{formatNumber(totalConcreteVolume, 0, language)} <span className="text-base font-medium text-indigo-700">m³</span></span>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-1">
                        <Box className="w-6 h-6 text-indigo-400" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-rose-50/80 to-rose-100/50 rounded-2xl p-6 border border-rose-100/80 flex items-center justify-between transition-all hover:shadow-md hover:border-rose-200">
                    <div>
                        <h4 className="text-rose-600/80 text-xs font-bold uppercase tracking-wider mb-2">{t('total_labor')}</h4>
                        <span className="text-2xl font-black text-rose-950">{formatCurrency(totalLaborCost, language)}</span>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-1">
                        <Users className="w-6 h-6 text-rose-400" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-cyan-50/80 to-cyan-100/50 rounded-2xl p-6 border border-cyan-100/80 flex items-center justify-between transition-all hover:shadow-md hover:border-cyan-200">
                    <div>
                        <h4 className="text-cyan-600/80 text-xs font-bold uppercase tracking-wider mb-2">{t('total_material')}</h4>
                        <span className="text-2xl font-black text-cyan-950">{formatCurrency(totalMaterialCost, language)}</span>
                    </div>
                    <div className="w-12 h-12 bg-white rounded-full shadow-sm flex items-center justify-center mb-1">
                        <Box className="w-6 h-6 text-cyan-400" />
                    </div>
                </div>
            </div>
        </>
    );
};

export default StatsGrid;

