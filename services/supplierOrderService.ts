/**
 * Supplier Order Service — V10 (RFQ System)
 * نظام طلبات عروض الأسعار من الموردين
 * 
 * التدفق:
 * 1. العميل يختار مورد ويطلب عرض سعر
 * 2. آربا ترسل بيانات الشحنة للمورد (بدون بيانات العميل)
 * 3. المورد يقبل → يدفع العمولة (6% + 10 ر.س)
 * 4. بيانات العميل تنفتح → تواصل مباشر
 * 5. المورد يوّرد → العملية تُسجّل في المحاسبة
 * 
 * العمولة:
 * - 2.5% رسوم بوابة الدفع
 * - 10 ر.س رسوم ثابتة
 * - 3.5% هامش ربح آربا
 */

import { doc, getDoc, updateDoc, serverTimestamp, collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db } from '../firebase/config';
import { accountingService } from './accountingService';

// ═══════════════════════════════════════════════════════════════
// Commission Configuration
// ═══════════════════════════════════════════════════════════════

export const RFQ_COMMISSION = {
    gatewayFeePercent: 2.5,    // رسوم بوابة الدفع
    fixedFee: 10,              // رسوم ثابتة بالريال
    arbaProfitPercent: 3.5,    // هامش ربح آربا
    // المجموع = 6% + 10 ر.س
};

/**
 * Calculate RFQ commission breakdown
 */
export function calculateRFQFee(orderValue: number): RFQCommission {
    const gatewayFee = Math.round(orderValue * (RFQ_COMMISSION.gatewayFeePercent / 100) * 100) / 100;
    const arbaProfit = Math.round(orderValue * (RFQ_COMMISSION.arbaProfitPercent / 100) * 100) / 100;
    const totalFee = Math.round((gatewayFee + RFQ_COMMISSION.fixedFee + arbaProfit) * 100) / 100;

    return {
        orderValue,
        gatewayFee,
        fixedFee: RFQ_COMMISSION.fixedFee,
        arbaProfit,
        totalFee,
        totalPercent: Math.round(((totalFee / orderValue) * 100) * 100) / 100,
    };
}

// ═══════════════════════════════════════════════════════════════
// Types
// ═══════════════════════════════════════════════════════════════

export interface RFQCommission {
    orderValue: number;
    gatewayFee: number;
    fixedFee: number;
    arbaProfit: number;
    totalFee: number;
    totalPercent: number;
}

export type RFQStatus = 'pending' | 'accepted' | 'paid' | 'delivered' | 'completed' | 'cancelled' | 'expired';

export interface RFQItem {
    materialName: string;         // اسم المادة
    materialNameEn?: string;
    quantity: number;             // الكمية
    unit: string;                 // الوحدة
    estimatedUnitPrice: number;   // السعر التقديري للوحدة
    estimatedTotal: number;       // الإجمالي التقديري
    notes?: string;
}

export interface SupplierRFQ {
    id: string;
    
    // العميل (بعض البيانات مخفية حتى الدفع)
    clientId: string;
    clientName: string;           // 🔒 مخفي حتى يدفع المورد
    clientPhone: string;          // 🔒 مخفي حتى يدفع المورد
    clientEmail: string;          // 🔒 مخفي حتى يدفع المورد
    clientAddress: string;        // 🔒 مخفي حتى يدفع المورد
    clientDataLocked: boolean;    // true = بيانات العميل مشفّرة
    
    // المورد
    supplierId: string;
    supplierName: string;
    
    // الشحنة (مرئية للمورد دائماً)
    items: RFQItem[];
    deliveryCity: string;
    requestedDeliveryDate?: string;
    totalEstimatedValue: number;
    projectName?: string;         // اسم المشروع المرتبط
    
    // العمولة
    commission: RFQCommission;
    
    // الحالة
    status: RFQStatus;
    
    // الدفع
    paymentId?: string;
    paidAt?: string;
    clientDataUnlockedAt?: string;
    
    // التسليم
    deliveredAt?: string;
    completedAt?: string;
    
    // التقييم
    clientRating?: number;        // 1-5
    clientFeedback?: string;
    
    // Metadata
    createdAt: string;
    updatedAt: string;
    expiresAt: string;            // صلاحية الطلب (48 ساعة افتراضي)
}

// ═══════════════════════════════════════════════════════════════
// Service
// ═══════════════════════════════════════════════════════════════

class SupplierOrderService {

    /**
     * Create a new RFQ (client → supplier)
     */
    async createRFQ(params: {
        clientId: string;
        clientName: string;
        clientPhone: string;
        clientEmail: string;
        clientAddress: string;
        supplierId: string;
        supplierName: string;
        items: RFQItem[];
        deliveryCity: string;
        requestedDeliveryDate?: string;
        projectName?: string;
    }): Promise<{ success: boolean; rfqId?: string; error?: string }> {
        try {
            const totalValue = params.items.reduce((sum, item) => sum + item.estimatedTotal, 0);
            const commission = calculateRFQFee(totalValue);

            const now = new Date();
            const expiresAt = new Date(now.getTime() + 48 * 60 * 60 * 1000); // 48 hours

            const rfq: Omit<SupplierRFQ, 'id'> = {
                clientId: params.clientId,
                clientName: params.clientName,
                clientPhone: params.clientPhone,
                clientEmail: params.clientEmail,
                clientAddress: params.clientAddress,
                clientDataLocked: true,              // 🔒 مقفل حتى الدفع

                supplierId: params.supplierId,
                supplierName: params.supplierName,

                items: params.items,
                deliveryCity: params.deliveryCity,
                requestedDeliveryDate: params.requestedDeliveryDate,
                totalEstimatedValue: totalValue,
                projectName: params.projectName,

                commission,
                status: 'pending',

                createdAt: now.toISOString(),
                updatedAt: now.toISOString(),
                expiresAt: expiresAt.toISOString(),
            };

            const docRef = await addDoc(collection(db, 'supplierRFQs'), rfq);

            return { success: true, rfqId: docRef.id };
        } catch (error) {
            console.error('❌ createRFQ error:', error);
            return { success: false, error: 'Failed to create RFQ' };
        }
    }

    /**
     * Supplier accepts and pays for RFQ → client data unlocked
     */
    async payAndAcceptRFQ(
        rfqId: string,
        paymentId: string
    ): Promise<{ success: boolean; error?: string }> {
        try {
            const rfqRef = doc(db, 'supplierRFQs', rfqId);
            const snap = await getDoc(rfqRef);
            if (!snap.exists()) return { success: false, error: 'RFQ not found' };

            const rfq = snap.data() as SupplierRFQ;
            if (rfq.status !== 'pending' && rfq.status !== 'accepted') {
                return { success: false, error: `Cannot pay RFQ in status: ${rfq.status}` };
            }

            const now = new Date();

            // Unlock client data + update status
            await updateDoc(rfqRef, {
                status: 'paid',
                clientDataLocked: false,
                paymentId,
                paidAt: now.toISOString(),
                clientDataUnlockedAt: now.toISOString(),
                updatedAt: now.toISOString(),
            });

            // Record accounting entries
            try {
                // 1. Gateway fee
                accountingService.addLedgerEntry({
                    description: `RFQ gateway fee: ${rfq.supplierName} → RFQ#${rfqId.slice(0, 8)}`,
                    type: 'debit',
                    amount: rfq.commission.gatewayFee,
                    reference: `rfq_gateway_${rfqId}`,
                    category: 'RFQ Fees',
                    createdBy: 'System',
                });

                // 2. Fixed fee
                accountingService.addLedgerEntry({
                    description: `RFQ fixed fee: ${rfq.supplierName} → RFQ#${rfqId.slice(0, 8)}`,
                    type: 'credit',
                    amount: rfq.commission.fixedFee,
                    reference: `rfq_fixed_${rfqId}`,
                    category: 'RFQ Revenue',
                    createdBy: 'System',
                });

                // 3. ARBA profit
                accountingService.addLedgerEntry({
                    description: `RFQ commission: ${rfq.supplierName} → RFQ#${rfqId.slice(0, 8)} (3.5%)`,
                    type: 'credit',
                    amount: rfq.commission.arbaProfit,
                    reference: `rfq_profit_${rfqId}`,
                    category: 'RFQ Revenue',
                    createdBy: 'System',
                });
            } catch (accErr) {
                console.warn('⚠️ Accounting entries failed:', accErr);
            }

            return { success: true };
        } catch (error) {
            console.error('❌ payAndAcceptRFQ error:', error);
            return { success: false, error: 'Payment processing failed' };
        }
    }

    /**
     * Mark RFQ as delivered by supplier
     */
    async markDelivered(rfqId: string): Promise<boolean> {
        try {
            const rfqRef = doc(db, 'supplierRFQs', rfqId);
            await updateDoc(rfqRef, {
                status: 'delivered',
                deliveredAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            });
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Client confirms receipt → complete the RFQ
     */
    async completeRFQ(rfqId: string, rating?: number, feedback?: string): Promise<boolean> {
        try {
            const rfqRef = doc(db, 'supplierRFQs', rfqId);
            const updates: any = {
                status: 'completed',
                completedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
            };
            if (rating) updates.clientRating = rating;
            if (feedback) updates.clientFeedback = feedback;

            await updateDoc(rfqRef, updates);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * Get RFQs for a supplier
     */
    async getSupplierRFQs(supplierId: string): Promise<SupplierRFQ[]> {
        try {
            const q = query(
                collection(db, 'supplierRFQs'),
                where('supplierId', '==', supplierId),
                orderBy('createdAt', 'desc')
            );
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() } as SupplierRFQ));
        } catch {
            return [];
        }
    }

    /**
     * Get RFQs for a client
     */
    async getClientRFQs(clientId: string): Promise<SupplierRFQ[]> {
        try {
            const q = query(
                collection(db, 'supplierRFQs'),
                where('clientId', '==', clientId),
                orderBy('createdAt', 'desc')
            );
            const snap = await getDocs(q);
            return snap.docs.map(d => ({ id: d.id, ...d.data() } as SupplierRFQ));
        } catch {
            return [];
        }
    }

    /**
     * Get masked client data (for unpaid RFQs)
     */
    getMaskedClientData(rfq: SupplierRFQ): {
        name: string;
        phone: string;
        email: string;
        address: string;
    } {
        if (!rfq.clientDataLocked) {
            return {
                name: rfq.clientName,
                phone: rfq.clientPhone,
                email: rfq.clientEmail,
                address: rfq.clientAddress,
            };
        }
        return {
            name: '🔒 ' + rfq.clientName.charAt(0) + '***',
            phone: '🔒 05X-XXX-XXXX',
            email: '🔒 ***@***.com',
            address: `🔒 ${rfq.deliveryCity}`,
        };
    }
}

// Singleton export
export const supplierOrderService = new SupplierOrderService();
