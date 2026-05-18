/**
 * Client RFQ Button — V10
 * زر "طلب من مورد" في واجهة التسعير
 * 
 * يظهر بجانب المواد ذات الكميات الكبيرة
 * عند الضغط: يفتح modal لاختيار المورد وإرسال الطلب
 */

import React, { useState } from 'react';
import { Language } from '../types';
import { calculateRFQFee } from '../services/supplierOrderService';
import { Package, Truck, Calculator, X, ArrowLeft, ArrowRight } from 'lucide-react';

interface ClientRFQButtonProps {
    materialName: string;
    quantity: number;
    unit: string;
    estimatedUnitPrice: number;
    language: Language;
    onRequestRFQ?: (params: {
        materialName: string;
        quantity: number;
        unit: string;
        estimatedUnitPrice: number;
        estimatedTotal: number;
    }) => void;
}

const ClientRFQButton: React.FC<ClientRFQButtonProps> = ({
    materialName, quantity, unit, estimatedUnitPrice, language, onRequestRFQ
}) => {
    const isAr = language === 'ar';
    const [showPreview, setShowPreview] = useState(false);
    const estimatedTotal = quantity * estimatedUnitPrice;
    const commission = calculateRFQFee(estimatedTotal);
    const Arrow = isAr ? ArrowLeft : ArrowRight;

    const handleRequest = () => {
        onRequestRFQ?.({
            materialName,
            quantity,
            unit,
            estimatedUnitPrice,
            estimatedTotal,
        });
        setShowPreview(false);
    };

    return (
        <>
            {/* RFQ Button */}
            <button
                onClick={() => setShowPreview(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-blue-500/10 to-indigo-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium hover:border-blue-500/40 hover:bg-blue-500/15 transition-all"
                title={isAr ? 'طلب من مورد' : 'Request from Supplier'}
            >
                <Truck className="w-3.5 h-3.5" />
                {isAr ? 'طلب مورد' : 'Request Supplier'}
            </button>

            {/* Preview Modal */}
            {showPreview && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                    <div
                        className="relative w-full max-w-md rounded-2xl border border-slate-700/50 bg-slate-900 shadow-2xl overflow-hidden"
                        onClick={e => e.stopPropagation()}
                        dir={isAr ? 'rtl' : 'ltr'}
                    >
                        {/* Header */}
                        <div className="h-1.5 bg-gradient-to-r from-blue-500 to-indigo-600" />
                        <div className="p-6">
                            <button onClick={() => setShowPreview(false)} className="absolute top-4 right-4 text-slate-400 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
                                    <Package className="w-6 h-6 text-blue-400" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white">{isAr ? 'طلب عرض سعر' : 'Request Quote'}</h3>
                                    <p className="text-xs text-slate-400">{isAr ? 'من المورد عبر آربا' : 'From supplier via ARBA'}</p>
                                </div>
                            </div>

                            {/* Material Details */}
                            <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/30 mb-4">
                                <p className="text-sm font-bold text-white mb-2">{materialName}</p>
                                <div className="flex items-center gap-4 text-xs text-slate-400">
                                    <span>📦 {quantity.toLocaleString()} {unit}</span>
                                    <span>💰 {estimatedUnitPrice} {isAr ? 'ر.س/وحدة' : 'SAR/unit'}</span>
                                </div>
                                <div className="mt-2 pt-2 border-t border-slate-700/30 flex justify-between">
                                    <span className="text-xs text-slate-400">{isAr ? 'القيمة التقديرية' : 'Est. Value'}</span>
                                    <span className="text-sm font-bold text-white">{estimatedTotal.toLocaleString()} {isAr ? 'ر.س' : 'SAR'}</span>
                                </div>
                            </div>

                            {/* Commission Info */}
                            <div className="p-3 rounded-xl bg-blue-500/5 border border-blue-500/20 mb-4">
                                <div className="flex items-center gap-1.5 text-xs text-blue-400 font-bold mb-2">
                                    <Calculator className="w-3.5 h-3.5" />
                                    {isAr ? 'رسوم الخدمة (يدفعها المورد)' : 'Service fees (paid by supplier)'}
                                </div>
                                <div className="text-xs text-slate-400 space-y-1">
                                    <div className="flex justify-between">
                                        <span>{isAr ? 'رسوم الدفع' : 'Payment fee'} (2.5%)</span>
                                        <span>{commission.gatewayFee.toFixed(2)} {isAr ? 'ر.س' : 'SAR'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{isAr ? 'رسوم ثابتة' : 'Fixed fee'}</span>
                                        <span>10 {isAr ? 'ر.س' : 'SAR'}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span>{isAr ? 'خدمة آربا' : 'ARBA service'} (3.5%)</span>
                                        <span>{commission.arbaProfit.toFixed(2)} {isAr ? 'ر.س' : 'SAR'}</span>
                                    </div>
                                    <div className="flex justify-between font-bold text-white pt-1 border-t border-blue-500/20">
                                        <span>{isAr ? 'المجموع' : 'Total'}</span>
                                        <span>{commission.totalFee.toFixed(2)} {isAr ? 'ر.س' : 'SAR'}</span>
                                    </div>
                                </div>
                            </div>

                            <p className="text-[10px] text-slate-500 mb-4 leading-relaxed">
                                {isAr 
                                    ? '* العميل يختار المورد ← آربا ترسل بيانات الشحنة ← المورد يدفع الرسوم ← تنفتح بيانات العميل ← التوريد والتواصل المباشر'
                                    : '* Client picks supplier → ARBA sends shipment data → Supplier pays fees → Client data unlocked → Direct communication & delivery'
                                }
                            </p>

                            {/* Actions */}
                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowPreview(false)}
                                    className="flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-sm transition-all"
                                >
                                    {isAr ? 'إلغاء' : 'Cancel'}
                                </button>
                                <button
                                    onClick={handleRequest}
                                    className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 hover:scale-[1.02] transition-all"
                                >
                                    <Truck className="w-4 h-4" />
                                    {isAr ? 'إرسال الطلب' : 'Send Request'}
                                    <Arrow className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default ClientRFQButton;
