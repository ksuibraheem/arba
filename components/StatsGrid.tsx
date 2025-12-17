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

    return (
        <>
            {/* Row 1: Key Financials */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
                {/* Direct Cost */}
                <div className="bg-white rounded-xl shadow-sm p-6 border-r-4 border-blue-500 transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">{t('total_direct_cost')}</h3>
                        <Calculator className="w-5 h-5 text-blue-500 bg-blue-50 p-1 rounded" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{formatCurrency(totalDirect, language)}</div>
                </div>

                {/* Overhead */}
                <div className="bg-white rounded-xl shadow-sm p-6 border-r-4 border-orange-500 transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">{t('overhead_distributed')}</h3>
                        <Wallet className="w-5 h-5 text-orange-500 bg-orange-50 p-1 rounded" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{formatCurrency(totalOverhead, language)}</div>
                </div>

                {/* Profit */}
                <div className="bg-white rounded-xl shadow-sm p-6 border-r-4 border-emerald-500 transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-gray-500 text-sm font-medium">{t('net_profit')}</h3>
                        <TrendingUp className="w-5 h-5 text-emerald-500 bg-emerald-50 p-1 rounded" />
                    </div>
                    <div className="text-2xl font-bold text-slate-800">{formatCurrency(totalProfit, language)}</div>
                </div>

                {/* Final Price */}
                <div className="bg-slate-800 rounded-xl shadow-lg p-6 border border-slate-700 transition-transform hover:-translate-y-1 duration-300">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-slate-400 text-sm font-medium">{t('final_offer_price')}</h3>
                        <CircleDollarSign className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div className="text-3xl font-bold text-white">{formatCurrency(finalPrice, language)}</div>
                </div>
            </div>

            {/* Row 2: Technical Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 flex items-center justify-between">
                    <div>
                        <h4 className="text-indigo-800 text-xs font-bold uppercase mb-1">{t('total_concrete')}</h4>
                        <span className="text-2xl font-black text-indigo-900">{formatNumber(totalConcreteVolume, 0, language)} <span className="text-sm font-medium">m³</span></span>
                    </div>
                    <Box className="w-8 h-8 text-indigo-300" />
                </div>

                <div className="bg-rose-50 rounded-xl p-5 border border-rose-100 flex items-center justify-between">
                    <div>
                        <h4 className="text-rose-800 text-xs font-bold uppercase mb-1">{t('total_labor')}</h4>
                        <span className="text-xl font-bold text-rose-900">{formatCurrency(totalLaborCost, language)}</span>
                    </div>
                    <Users className="w-8 h-8 text-rose-300" />
                </div>

                <div className="bg-cyan-50 rounded-xl p-5 border border-cyan-100 flex items-center justify-between">
                    <div>
                        <h4 className="text-cyan-800 text-xs font-bold uppercase mb-1">{t('total_material')}</h4>
                        <span className="text-xl font-bold text-cyan-900">{formatCurrency(totalMaterialCost, language)}</span>
                    </div>
                    <Box className="w-8 h-8 text-cyan-300" />
                </div>
            </div>
        </>
    );
};

export default StatsGrid;
