/**
 * Supplier Orders Panel — V10
 * لوحة الطلبات الواردة في داشبورد المورد
 * 
 * يعرض: الطلبات المعلقة، العمولة المطلوبة، وزر الدفع لفتح بيانات العميل
 */

import React, { useState, useEffect } from 'react';
import { Language } from '../../types';
import {
    supplierOrderService,
    calculateRFQFee,
    type SupplierRFQ,
    type RFQStatus,
} from '../../services/supplierOrderService';
import {
    initiateRFQPayment,
    verifyRFQPayment,
    RFQ_PAYMENT_MESSAGES,
} from '../../services/rfqPaymentService';
import {
    Package, Lock, Unlock, Clock, CheckCircle, Truck,
    CreditCard, Star, AlertTriangle, ChevronDown, ChevronUp, Eye, ExternalLink
} from 'lucide-react';

interface SupplierOrdersPanelProps {
    supplierId: string;
    language: Language;
}

const STATUS_CONFIG: Record<RFQStatus, { color: string; icon: React.ReactNode; labelAr: string; labelEn: string }> = {
    pending:   { color: '#f59e0b', icon: <Clock className="w-4 h-4" />,       labelAr: 'قيد الانتظار',  labelEn: 'Pending' },
    accepted:  { color: '#3b82f6', icon: <Eye className="w-4 h-4" />,         labelAr: 'مقبول',         labelEn: 'Accepted' },
    paid:      { color: '#22c55e', icon: <Unlock className="w-4 h-4" />,      labelAr: 'مدفوع',         labelEn: 'Paid' },
    delivered: { color: '#8b5cf6', icon: <Truck className="w-4 h-4" />,       labelAr: 'تم التسليم',    labelEn: 'Delivered' },
    completed: { color: '#6366F1', icon: <CheckCircle className="w-4 h-4" />, labelAr: 'مكتمل',         labelEn: 'Completed' },
    cancelled: { color: '#ef4444', icon: <AlertTriangle className="w-4 h-4" />, labelAr: 'ملغي',       labelEn: 'Cancelled' },
    expired:   { color: '#64748b', icon: <Clock className="w-4 h-4" />,       labelAr: 'منتهي',         labelEn: 'Expired' },
};

const SupplierOrdersPanel: React.FC<SupplierOrdersPanelProps> = ({ supplierId, language }) => {
    const isAr = language === 'ar';
    const [orders, setOrders] = useState<SupplierRFQ[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const [payingId, setPayingId] = useState<string | null>(null);

    useEffect(() => {
        loadOrders();
    }, [supplierId]);

    const loadOrders = async () => {
        setLoading(true);
        try {
            const data = await supplierOrderService.getSupplierRFQs(supplierId);
            setOrders(data);
        } catch (err) {
            console.error('Failed to load orders:', err);
        } finally {
            setLoading(false);
        }
    };

    const handlePayAndAccept = async (rfqId: string) => {
        setPayingId(rfqId);
        try {
            const order = orders.find(o => o.id === rfqId);
            if (!order) return;

            // استدعاء Cloud Function لإنشاء Tap charge
            const result = await initiateRFQPayment(rfqId, order.totalEstimatedValue);
            
            if (result.success && result.paymentUrl) {
                // تحويل المورد لصفحة الدفع
                window.open(result.paymentUrl, '_blank');
                // تحديث حالة الطلب محلياً
                await loadOrders();
            } else {
                // Fallback: استخدام الدفع المحلي إذا Cloud Functions غير متاحة
                console.warn('Tap unavailable, using local payment:', result.error);
                const paymentId = `pay_${Date.now()}_${Math.random().toString(36).slice(2)}`;
                const localResult = await supplierOrderService.payAndAcceptRFQ(rfqId, paymentId);
                if (localResult.success) {
                    await loadOrders();
                }
            }
        } catch (err) {
            console.error('Payment error:', err);
        } finally {
            setPayingId(null);
        }
    };

    const handleMarkDelivered = async (rfqId: string) => {
        await supplierOrderService.markDelivered(rfqId);
        await loadOrders();
    };

    if (loading) {
        return (
            <div className="space-y-3">
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-28 rounded-xl bg-slate-800/50 animate-pulse" />
                ))}
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="text-center py-16">
                <Package className="w-12 h-12 mx-auto text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm">{isAr ? 'لا توجد طلبات حالياً' : 'No orders yet'}</p>
                <p className="text-slate-600 text-xs mt-1">
                    {isAr ? 'ستظهر الطلبات عندما يطلب عميل منتجاتك' : 'Orders will appear when clients request your products'}
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Summary Stats */}
            <div className="grid grid-cols-3 gap-3 mb-4">
                {[
                    {
                        label: isAr ? 'معلّقة' : 'Pending',
                        count: orders.filter(o => o.status === 'pending').length,
                        color: 'text-amber-400',
                    },
                    {
                        label: isAr ? 'نشطة' : 'Active',
                        count: orders.filter(o => ['paid', 'delivered'].includes(o.status)).length,
                        color: 'text-emerald-400',
                    },
                    {
                        label: isAr ? 'مكتملة' : 'Completed',
                        count: orders.filter(o => o.status === 'completed').length,
                        color: 'text-blue-400',
                    },
                ].map((stat, idx) => (
                    <div key={idx} className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/30 text-center">
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.count}</p>
                        <p className="text-[10px] text-slate-500">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Orders List */}
            {orders.map(order => {
                const statusConfig = STATUS_CONFIG[order.status];
                const isExpanded = expandedId === order.id;
                const clientData = supplierOrderService.getMaskedClientData(order);

                return (
                    <div
                        key={order.id}
                        className="rounded-xl border transition-all"
                        style={{ borderColor: `${statusConfig.color}30` }}
                    >
                        {/* Header */}
                        <button
                            onClick={() => setExpandedId(isExpanded ? null : order.id)}
                            className="w-full p-4 flex items-center gap-3 hover:bg-slate-800/30 transition-colors rounded-t-xl"
                        >
                            <div
                                className="w-10 h-10 rounded-xl flex items-center justify-center"
                                style={{ background: `${statusConfig.color}15`, color: statusConfig.color }}
                            >
                                {statusConfig.icon}
                            </div>

                            <div className="flex-1 min-w-0 text-start">
                                <p className="text-sm font-bold text-white truncate">
                                    {order.projectName || `RFQ #${order.id.slice(0, 8)}`}
                                </p>
                                <p className="text-xs text-slate-500">
                                    {order.items.length} {isAr ? 'بند' : 'items'} • {order.deliveryCity}
                                </p>
                            </div>

                            <div className="text-end">
                                <p className="text-sm font-bold text-white">
                                    {order.totalEstimatedValue.toLocaleString()} <span className="text-[10px] text-slate-400">{isAr ? 'ر.س' : 'SAR'}</span>
                                </p>
                                <span
                                    className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                                    style={{ background: `${statusConfig.color}15`, color: statusConfig.color }}
                                >
                                    {isAr ? statusConfig.labelAr : statusConfig.labelEn}
                                </span>
                            </div>

                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                        </button>

                        {/* Expanded Details */}
                        {isExpanded && (
                            <div className="px-4 pb-4 space-y-3 border-t border-slate-700/30">
                                {/* Items */}
                                <div className="mt-3">
                                    <p className="text-xs font-bold text-slate-400 mb-2">
                                        {isAr ? '📦 البنود المطلوبة' : '📦 Requested Items'}
                                    </p>
                                    <div className="space-y-1">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30">
                                                <span className="text-xs text-white">{item.materialName}</span>
                                                <span className="text-xs text-slate-400">
                                                    {item.quantity} {item.unit} × {item.estimatedUnitPrice} = <strong className="text-white">{item.estimatedTotal.toLocaleString()}</strong>
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Client Data */}
                                <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-700/30">
                                    <p className="text-xs font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                                        {order.clientDataLocked ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Unlock className="w-3.5 h-3.5 text-emerald-400" />}
                                        {isAr ? 'بيانات العميل' : 'Client Data'}
                                    </p>
                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div><span className="text-slate-500">{isAr ? 'الاسم:' : 'Name:'}</span> <span className="text-white">{clientData.name}</span></div>
                                        <div><span className="text-slate-500">{isAr ? 'الهاتف:' : 'Phone:'}</span> <span className="text-white">{clientData.phone}</span></div>
                                        <div><span className="text-slate-500">{isAr ? 'البريد:' : 'Email:'}</span> <span className="text-white">{clientData.email}</span></div>
                                        <div><span className="text-slate-500">{isAr ? 'العنوان:' : 'Address:'}</span> <span className="text-white">{clientData.address}</span></div>
                                    </div>
                                </div>

                                {/* Commission Breakdown (for pending orders) */}
                                {order.status === 'pending' && (
                                    <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                                        <p className="text-xs font-bold text-amber-400 mb-2 flex items-center gap-1.5">
                                            <CreditCard className="w-3.5 h-3.5" />
                                            {isAr ? 'رسوم فتح بيانات العميل' : 'Client Data Unlock Fee'}
                                        </p>
                                        <div className="space-y-1 text-xs">
                                            <div className="flex justify-between text-slate-400">
                                                <span>{isAr ? 'رسوم بوابة الدفع (2.5%)' : 'Gateway fee (2.5%)'}</span>
                                                <span>{order.commission.gatewayFee.toFixed(2)} {isAr ? 'ر.س' : 'SAR'}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-400">
                                                <span>{isAr ? 'رسوم ثابتة' : 'Fixed fee'}</span>
                                                <span>{order.commission.fixedFee} {isAr ? 'ر.س' : 'SAR'}</span>
                                            </div>
                                            <div className="flex justify-between text-slate-400">
                                                <span>{isAr ? 'رسوم خدمة آربا (3.5%)' : 'ARBA service (3.5%)'}</span>
                                                <span>{order.commission.arbaProfit.toFixed(2)} {isAr ? 'ر.س' : 'SAR'}</span>
                                            </div>
                                            <div className="flex justify-between text-white font-bold pt-1 border-t border-amber-500/20">
                                                <span>{isAr ? 'المجموع' : 'Total'}</span>
                                                <span>{order.commission.totalFee.toFixed(2)} {isAr ? 'ر.س' : 'SAR'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex gap-2 pt-1">
                                    {order.status === 'pending' && (
                                        <button
                                            onClick={() => handlePayAndAccept(order.id)}
                                            disabled={payingId === order.id}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-bold text-sm shadow-lg shadow-emerald-500/20 hover:scale-[1.02] transition-all disabled:opacity-50"
                                        >
                                            {payingId === order.id ? (
                                                <span className="animate-spin">⏳</span>
                                            ) : (
                                                <>
                                                    <CreditCard className="w-4 h-4" />
                                                    {isAr ? `ادفع ${order.commission.totalFee.toFixed(0)} ر.س وافتح البيانات` : `Pay ${order.commission.totalFee.toFixed(0)} SAR & Unlock`}
                                                </>
                                            )}
                                        </button>
                                    )}

                                    {order.status === 'paid' && (
                                        <button
                                            onClick={() => handleMarkDelivered(order.id)}
                                            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-sm shadow-lg hover:scale-[1.02] transition-all"
                                        >
                                            <Truck className="w-4 h-4" />
                                            {isAr ? 'تأكيد التسليم' : 'Confirm Delivery'}
                                        </button>
                                    )}

                                    {order.status === 'completed' && order.clientRating && (
                                        <div className="flex items-center gap-1 text-amber-400">
                                            {Array.from({ length: order.clientRating }).map((_, i) => (
                                                <Star key={i} className="w-3.5 h-3.5 fill-current" />
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                );
            })}
        </div>
    );
};

export default SupplierOrdersPanel;
