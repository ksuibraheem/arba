/**
 * ItemProfitabilityChart — رسومات مفصلة لتحليل ربحية البنود والتكلفة
 * يعرض كل قسم/بند مع تفصيل (التكلفة، هامش الربح، وقيمة الربح)
 */
import React, { useState } from 'react';
import { ProcessedItem, Language } from '../../types';
import { SECTION_DEFINITIONS } from '../../constants';
import { ChevronDown, ChevronUp, DollarSign, TrendingUp, AlertCircle } from 'lucide-react';

interface ItemProfitabilityChartProps {
  items: ProcessedItem[];
  language: Language;
}

interface SectionProfit {
  code: string;
  name: string;
  icon: string;
  color: string;
  totalCost: number; // Cost (material + labor)
  totalPrice: number; // Final selling price
  totalProfit: number;
  items: ProcessedItem[];
}

const ItemProfitabilityChart: React.FC<ItemProfitabilityChartProps> = ({ items, language }) => {
  const isAr = language === 'ar';
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  if (!items || items.length === 0) return null;

  // Group items by section
  const sectionsMap = new Map<string, SectionProfit>();
  
  items.forEach(item => {
    const secCode = item.id?.substring(0, 2) || '00';
    const def = SECTION_DEFINITIONS.find(d => d.code === secCode);
    
    if (!sectionsMap.has(secCode)) {
      sectionsMap.set(secCode, {
        code: secCode,
        name: isAr ? (def?.nameAr || 'عام') : (def?.nameEn || 'General'),
        icon: def?.icon || '📦',
        color: def?.color || '#94a3b8',
        totalCost: 0,
        totalPrice: 0,
        totalProfit: 0,
        items: [],
      });
    }
    
    const sec = sectionsMap.get(secCode)!;
    const cost = (item.totalMaterialCost || 0) + (item.totalLaborCost || 0);
    const price = item.totalLinePrice || 0;
    const profit = price - cost;
    
    sec.totalCost += cost;
    sec.totalPrice += price;
    sec.totalProfit += profit;
    sec.items.push(item);
  });

  // Sort sections by total profit descending
  const sortedSections = Array.from(sectionsMap.values()).sort((a, b) => b.totalProfit - a.totalProfit);

  const formatNum = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4 lg:p-6 mb-8 overflow-hidden">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-emerald-500" />
            {isAr ? 'التحليل المالي التفصيلي للبنود' : 'Detailed Item Financial Analysis'}
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            {isAr ? 'يعرض تكلفة كل بند مقابل الربح المحقق (لاكتشاف بنود الخسارة والمخاطر)' : 'Shows cost vs profit for each item (to discover loss-making items)'}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {sortedSections.map((sec) => {
          const marginPct = sec.totalPrice > 0 ? (sec.totalProfit / sec.totalPrice) * 100 : 0;
          const isExpanded = expandedSection === sec.code;
          
          return (
            <div key={sec.code} className="border border-slate-200 rounded-xl overflow-hidden transition-all duration-200">
              {/* Section Header (Clickable) */}
              <div 
                className={`flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-50 transition-colors ${isExpanded ? 'bg-slate-50 border-b border-slate-200' : ''}`}
                onClick={() => setExpandedSection(isExpanded ? null : sec.code)}
              >
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-xl flex-shrink-0"
                  style={{ backgroundColor: `${sec.color}15`, color: sec.color }}
                >
                  {sec.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-800 text-sm truncate">{sec.name}</h3>
                  <div className="flex items-center gap-4 mt-1 text-xs text-slate-500">
                    <span>{sec.items.length} {isAr ? 'بنود' : 'Items'}</span>
                    <span className="flex items-center gap-1 text-emerald-600 font-semibold">
                      <DollarSign className="w-3 h-3" />
                      {isAr ? 'الربح:' : 'Profit:'} {formatNum(sec.totalProfit)}
                    </span>
                  </div>
                </div>

                {/* Progress Bar Visual */}
                <div className="hidden md:flex flex-col items-end w-48 flex-shrink-0">
                  <div className="flex justify-between w-full text-[10px] mb-1 font-bold">
                    <span className="text-slate-500">{isAr ? 'التكلفة' : 'Cost'}</span>
                    <span className="text-emerald-600">{isAr ? 'الربح' : 'Profit'} {marginPct.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full flex overflow-hidden">
                    <div className="bg-slate-400 h-full" style={{ width: `${100 - marginPct}%` }} />
                    <div className="bg-emerald-500 h-full" style={{ width: `${marginPct}%` }} />
                  </div>
                </div>

                <div className="flex-shrink-0 text-slate-400">
                  {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                </div>
              </div>

              {/* Items Detail Dropdown */}
              {isExpanded && (
                <div className="bg-white p-4">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse" dir={isAr ? 'rtl' : 'ltr'}>
                      <thead>
                        <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-400 font-bold">
                          <th className="pb-3 pr-4 font-bold">{isAr ? 'البند / الوصف' : 'Item / Description'}</th>
                          <th className="pb-3 px-2 text-center">{isAr ? 'الكمية' : 'Qty'}</th>
                          <th className="pb-3 px-2 text-right">{isAr ? 'التكلفة' : 'Cost'}</th>
                          <th className="pb-3 px-2 text-right">{isAr ? 'الربح' : 'Profit'}</th>
                          <th className="pb-3 px-2 text-right">{isAr ? 'السعر النهائي' : 'Final Price'}</th>
                          <th className="pb-3 pl-2 text-center">{isAr ? 'الهامش' : 'Margin'}</th>
                        </tr>
                      </thead>
                      <tbody className="text-xs">
                        {sec.items.sort((a,b) => (b.totalLinePrice || 0) - (a.totalLinePrice || 0)).map((item, idx) => {
                          const iCost = (item.totalMaterialCost || 0) + (item.totalLaborCost || 0);
                          const iPrice = item.totalLinePrice || 0;
                          const iProfit = iPrice - iCost;
                          const iMargin = iPrice > 0 ? (iProfit / iPrice) * 100 : 0;
                          
                          const isLoss = iProfit <= 0;
                          const isLowMargin = iMargin > 0 && iMargin < 15;

                          return (
                            <tr key={idx} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                              <td className="py-2 pr-4 text-slate-700 font-medium max-w-[200px] truncate" title={isAr ? item.descriptionAr : item.descriptionEn}>
                                {isAr ? item.descriptionAr : item.descriptionEn}
                              </td>
                              <td className="py-2 px-2 text-center text-slate-500">{formatNum(item.quantity || 0)}</td>
                              <td className="py-2 px-2 text-right text-slate-600 font-mono">{formatNum(iCost)}</td>
                              <td className={`py-2 px-2 text-right font-mono font-bold ${isLoss ? 'text-red-500' : 'text-emerald-600'}`}>
                                {formatNum(iProfit)}
                              </td>
                              <td className="py-2 px-2 text-right text-slate-800 font-mono font-bold">{formatNum(iPrice)}</td>
                              <td className="py-2 pl-2 text-center">
                                <div className={`inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-bold ${
                                  isLoss ? 'bg-red-50 text-red-600' : 
                                  isLowMargin ? 'bg-amber-50 text-amber-600' : 
                                  'bg-emerald-50 text-emerald-600'
                                }`}>
                                  {isLoss || isLowMargin ? <AlertCircle className="w-3 h-3" /> : null}
                                  {iMargin.toFixed(1)}%
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ItemProfitabilityChart;
