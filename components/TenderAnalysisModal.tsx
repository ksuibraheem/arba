import React, { useState } from 'react';
import { AppState, CalculatedItem, Language } from '../types';
import { X, Search, AlertTriangle, TrendingDown, DollarSign, BrainCircuit, ChevronDown, ChevronUp } from 'lucide-react';

interface TenderAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  ourPrice: number;
  calculatedItems: CalculatedItem[];
  language: Language;
}

const TenderAnalysisModal: React.FC<TenderAnalysisModalProps> = ({
  isOpen,
  onClose,
  ourPrice,
  calculatedItems,
  language
}) => {
  const [winningBidStr, setWinningBidStr] = useState('3607778');
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<null | any>(null);
  const [expandedItemId, setExpandedItemId] = useState<string | null>(null);

  const isAr = language === 'ar';

  if (!isOpen) return null;

  const handleAnalyze = () => {
    const winningBid = parseFloat(winningBidStr.replace(/,/g, ''));
    if (isNaN(winningBid)) return;

    setAnalyzing(true);

    setTimeout(() => {
      const difference = ourPrice - winningBid;
      const percentDiff = (difference / ourPrice) * 100;

      // Calculate realistic margins for each item
      const enrichedItems = calculatedItems.map(item => {
        const baseCost = (item.baseMaterial + item.baseLabor) * (1 + item.waste);
        const supplierMultiplier = item.selectedSupplier?.priceMultiplier || 1;
        const totalBaseUnitCost = baseCost * supplierMultiplier;

        // Final Unit Price is what we bid.
        const unitPrice = item.usedPrice || item.finalUnitPrice;

        const profitPerUnit = unitPrice - totalBaseUnitCost;
        const profitMargin = totalBaseUnitCost > 0 ? (profitPerUnit / totalBaseUnitCost) * 100 : 0;

        return {
          ...item,
          totalBaseUnitCost,
          profitMargin,
          isLoss: profitMargin < 0,
          isHighProfit: profitMargin > 40
        };
      });

      // Sort items by absolute total price impact (descending)
      const sortedByImpact = [...enrichedItems].sort((a, b) => b.totalLinePrice - a.totalLinePrice);

      // Separate the dangerous items (Losses and Unbalanced high profit)
      const lossItems = enrichedItems.filter(i => i.isLoss).sort((a, b) => a.profitMargin - b.profitMargin);
      const highProfitItems = enrichedItems.filter(i => i.isHighProfit).sort((a, b) => b.totalLinePrice - a.totalLinePrice);

      setAnalysisResult({
        winningBid,
        difference,
        percentDiff,
        topItems: sortedByImpact.slice(0, 8), // Show top 8 items
        lossItems,
        highProfitItems
      });
      setAnalyzing(false);
    }, 1500);
  };

  const formatNum = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 });

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4 backdrop-blur-sm" dir={isAr ? 'rtl' : 'ltr'}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">

        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-slate-900 to-slate-800 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
              <BrainCircuit className="w-6 h-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{isAr ? 'تحليل المناقصة الذكي (Tender AI)' : 'Smart Tender Analysis'}</h2>
              <p className="text-xs text-slate-300">
                {isAr ? 'اكتشف أسباب خسارة أو فوز المناقصة بناءً على الدماغ المعرفي' : 'Discover reasons for winning/losing based on cognitive brain'}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-xl transition-colors">
            <X className="w-5 h-5 text-slate-300" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 bg-slate-50">

          {/* Input Section */}
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm mb-6">
            <label className="block text-sm font-bold text-slate-700 mb-2">
              {isAr ? 'أدخل مبلغ العطاء الفائز (الذي تم ترسيته):' : 'Enter the Winning Bid Amount:'}
            </label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                  <DollarSign className="w-5 h-5 text-slate-400" />
                </div>
                <input
                  type="text"
                  value={winningBidStr}
                  onChange={(e) => setWinningBidStr(e.target.value)}
                  className="w-full pl-4 pr-10 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-lg font-mono font-bold"
                  placeholder="مثال: 3607778"
                />
              </div>
              <button
                onClick={handleAnalyze}
                disabled={analyzing || !winningBidStr}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-bold flex items-center gap-2 transition-all disabled:opacity-50"
              >
                {analyzing ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Search className="w-5 h-5" />
                )}
                {isAr ? 'تحليل الآن' : 'Analyze Now'}
              </button>
            </div>
          </div>

          {/* Analysis Results */}
          {analysisResult && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">

              {/* Summary Cards */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm text-center">
                  <div className="text-xs text-slate-500 mb-1">{isAr ? 'عرضنا المالي' : 'Our Bid'}</div>
                  <div className="text-xl font-bold text-slate-800 font-mono">{formatNum(ourPrice)}</div>
                </div>
                <div className="bg-white p-4 rounded-xl border border-emerald-200 shadow-sm text-center bg-emerald-50/50">
                  <div className="text-xs text-emerald-600 mb-1 font-bold">{isAr ? 'العرض الفائز' : 'Winning Bid'}</div>
                  <div className="text-xl font-bold text-emerald-700 font-mono">{formatNum(analysisResult.winningBid)}</div>
                </div>
              </div>

              {/* The Insight */}
              <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 w-2 bg-rose-500 h-full" />
                <h3 className="font-bold text-slate-800 text-lg mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-rose-500" />
                  {isAr ? 'التحليل المالي الدقيق وتفكيك الأسعار' : 'Detailed Financial Breakdown'}
                </h3>

                <p className="text-slate-600 leading-relaxed text-sm mb-4">
                  {isAr
                    ? `الفارق المالي بين عرضنا والعرض الفائز هو ${formatNum(analysisResult.difference)} ر.س (حوالي ${Math.round(analysisResult.percentDiff)}%). بناءً على تحليل الدماغ المعرفي وقاعدة بيانات الموردين، مشكلتك في التسعير غير المتوازن (Unbalanced Bidding).`
                    : `The difference is ${formatNum(analysisResult.difference)} SAR (~${Math.round(analysisResult.percentDiff)}%). Based on the AI analysis, the issue is Unbalanced Bidding.`}
                </p>

                {/* Detailed Accordion List */}
                <div className="space-y-3 mt-6">
                  <h4 className="font-bold text-slate-700 text-sm">{isAr ? 'البنود المؤثرة في العطاء:' : 'Impactful Items:'}</h4>

                  {analysisResult.topItems.map((item: any, i: number) => (
                    <div key={item.id} className="border border-slate-200 rounded-lg overflow-hidden bg-white">
                      <div
                        onClick={() => setExpandedItemId(expandedItemId === item.id ? null : item.id)}
                        className={`flex justify-between items-center p-4 cursor-pointer hover:bg-slate-50 transition-colors ${item.isLoss ? 'bg-rose-50/30' : ''}`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`px-2 py-1 rounded text-xs font-bold ${item.isLoss ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-600'}`}>
                            {item.qty} {item.unit}
                          </div>
                          <span className="font-bold text-sm text-slate-800">
                            {item.displayName || (isAr ? item.name?.ar : item.name?.en)}
                          </span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-right hidden sm:block">
                            <div className="text-[10px] text-slate-500">{isAr ? 'السعر/وحدة' : 'Unit Price'}</div>
                            <div className="font-bold text-sm">{formatNum(item.usedPrice || item.finalUnitPrice)}</div>
                          </div>
                          <div className="text-right">
                            <div className="text-[10px] text-slate-500">{isAr ? 'نسبة الربح' : 'Margin'}</div>
                            <div className={`font-bold text-sm ${item.isLoss ? 'text-rose-600' : 'text-emerald-600'}`}>
                              {item.profitMargin > 0 ? '+' : ''}{Math.round(item.profitMargin)}%
                            </div>
                          </div>
                          {expandedItemId === item.id ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                        </div>
                      </div>

                      {expandedItemId === item.id && (
                        <div className="p-4 bg-slate-50 border-t border-slate-100 text-sm">
                          <div className="grid grid-cols-2 gap-4 mb-4">
                            <div>
                              <div className="text-slate-500 text-xs">{isAr ? 'تكلفة المورد التقديرية (Base)' : 'Base Supplier Cost'}</div>
                              <div className="font-bold text-slate-800">{formatNum(item.totalBaseUnitCost)} {isAr ? 'ر.س' : 'SAR'}</div>
                            </div>
                            <div>
                              <div className="text-slate-500 text-xs">{isAr ? 'إجمالي سعر البند' : 'Total Line Price'}</div>
                              <div className="font-bold text-slate-800">{formatNum(item.totalLinePrice)} {isAr ? 'ر.س' : 'SAR'}</div>
                            </div>
                          </div>

                          <div className="p-3 bg-white rounded border border-slate-200">
                            <div className="font-bold text-slate-700 text-xs mb-2">{isAr ? 'تشخيص الذكاء الاصطناعي:' : 'AI Diagnosis:'}</div>
                            {item.isLoss ? (
                              <p className="text-rose-600 text-xs leading-relaxed">
                                {isAr ? 'تحذير: تسعيرك في هذا البند أقل من تكلفة الموردين الفعليين! لو فزت بالمشروع لكنت ستتكبد خسارة في هذا البند.' : 'Warning: Priced below cost! You would have lost money on this item.'}
                              </p>
                            ) : item.profitMargin > 50 ? (
                              <p className="text-emerald-600 text-xs leading-relaxed">
                                {isAr ? 'مبالغة في التسعير: المورد يكلف أقل بكثير، وهذا ما أتاح للمنافس كسر السعر بسهولة والفوز بالمناقصة.' : 'Overpriced: Competitor easily undercut this item to win the bid.'}
                              </p>
                            ) : (
                              <p className="text-slate-600 text-xs leading-relaxed">
                                {isAr ? 'تسعير متوازن نسبياً.' : 'Relatively balanced pricing.'}
                              </p>
                            )}

                            {item.suppliers && item.suppliers.length > 0 && (
                              <div className="mt-3">
                                <div className="text-[10px] text-slate-400 mb-1">{isAr ? 'خيارات الموردين:' : 'Supplier Options:'}</div>
                                <div className="flex flex-wrap gap-2">
                                  {item.suppliers.slice(0, 3).map((sup: any) => (
                                    <div key={sup.id} className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-600 border border-slate-200">
                                      {isAr ? sup.name.ar : sup.name.en} <span className="opacity-50">({sup.tier})</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="mt-6 p-4 bg-emerald-50 rounded-lg border border-emerald-100">
                  <div className="font-bold text-sm text-emerald-800 mb-2">{isAr ? '💡 توصية الذكاء الاصطناعي للمشروع القادم:' : '💡 AI Recommendation:'}</div>
                  <div className="text-xs text-emerald-700 leading-relaxed">
                    {isAr
                      ? 'تم تحديد مشكلة "Unbalanced Bidding". نوصي باستخدام النظام لضبط التكلفة الفعلية (Base Cost) ثم إضافة هامش ربح موحد (Flat Margin) 15% على جميع البنود، بدلاً من وضع 100% على العظم و -30% على المصاعد والواجهات.'
                      : 'Unbalanced Bidding detected. We recommend using the system to calculate exact Base Costs, then applying a flat 15% margin across all items.'}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TenderAnalysisModal;
