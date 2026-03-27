/**
 * In-App Notification Service
 * خدمة الإشعارات الداخلية
 * 
 * localStorage-based notification system for real-time in-app alerts.
 * Each notification targets a specific role (manager, accountant, etc.)
 */

// ====================== Types ======================

export type NotificationType = 
    | 'edit_request'        // طلب تعديل فاتورة
    | 'edit_request_decision' // قرار المدير على طلب التعديل
    | 'support_ticket'      // تذكرة دعم فني جديدة
    | 'ticket_response'     // رد على تذكرة
    | 'ticket_closed'       // إغلاق تذكرة
    | 'employee_action'     // إجراء موظف عام
    | 'system';             // إشعار نظام

export type NotificationPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface AppNotification {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    targetRole: string;         // 'manager' | 'accountant' | 'support' | 'hr' | etc.
    sourceRole?: string;        // الدور المرسل
    sourceName?: string;        // اسم المرسل
    priority: NotificationPriority;
    isRead: boolean;
    createdAt: string;
    relatedId?: string;         // معرف العنصر المرتبط (تذكرة، طلب تعديل، إلخ)
    relatedType?: string;       // نوع العنصر المرتبط
    actionUrl?: string;         // رابط الإجراء
}

// ====================== Constants ======================

const NOTIFICATIONS_KEY = 'arba_notifications';
const MAX_NOTIFICATIONS = 100; // أقصى عدد إشعارات مخزنة

// ====================== Translations ======================

export const NOTIFICATION_TYPE_TRANSLATIONS: Record<NotificationType, { ar: string; en: string }> = {
    edit_request: { ar: 'طلب تعديل', en: 'Edit Request' },
    edit_request_decision: { ar: 'قرار طلب تعديل', en: 'Edit Request Decision' },
    support_ticket: { ar: 'تذكرة دعم', en: 'Support Ticket' },
    ticket_response: { ar: 'رد على تذكرة', en: 'Ticket Response' },
    ticket_closed: { ar: 'إغلاق تذكرة', en: 'Ticket Closed' },
    employee_action: { ar: 'إجراء موظف', en: 'Employee Action' },
    system: { ar: 'إشعار نظام', en: 'System Notice' },
};

export const NOTIFICATION_PRIORITY_COLORS: Record<NotificationPriority, string> = {
    low: 'text-slate-400',
    medium: 'text-blue-400',
    high: 'text-orange-400',
    urgent: 'text-red-400',
};

// ====================== Service ======================

class NotificationService {
    // =================== Core CRUD ===================

    private getAll(): AppNotification[] {
        try {
            const data = localStorage.getItem(NOTIFICATIONS_KEY);
            return data ? JSON.parse(data) : [];
        } catch {
            return [];
        }
    }

    private saveAll(notifications: AppNotification[]): void {
        // Trim to max
        const trimmed = notifications.slice(0, MAX_NOTIFICATIONS);
        localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(trimmed));
    }

    // =================== Public API ===================

    /**
     * Add a new notification
     * إضافة إشعار جديد
     */
    addNotification(params: {
        type: NotificationType;
        title: string;
        message: string;
        targetRole: string;
        sourceRole?: string;
        sourceName?: string;
        priority?: NotificationPriority;
        relatedId?: string;
        relatedType?: string;
    }): AppNotification {
        const notifications = this.getAll();

        const newNotification: AppNotification = {
            id: Date.now().toString(36) + Math.random().toString(36).substr(2, 9),
            type: params.type,
            title: params.title,
            message: params.message,
            targetRole: params.targetRole,
            sourceRole: params.sourceRole,
            sourceName: params.sourceName,
            priority: params.priority || 'medium',
            isRead: false,
            createdAt: new Date().toISOString(),
            relatedId: params.relatedId,
            relatedType: params.relatedType,
        };

        // Insert at top (newest first)
        notifications.unshift(newNotification);
        this.saveAll(notifications);

        console.log(`🔔 Notification added: [${params.type}] ${params.title} → ${params.targetRole}`);
        return newNotification;
    }

    /**
     * Get notifications for a specific role
     * جلب إشعارات دور معين
     */
    getNotifications(role: string): AppNotification[] {
        return this.getAll().filter(n => n.targetRole === role);
    }

    /**
     * Get unread notifications for a role
     * جلب الإشعارات غير المقروءة
     */
    getUnreadNotifications(role: string): AppNotification[] {
        return this.getAll().filter(n => n.targetRole === role && !n.isRead);
    }

    /**
     * Get unread count for badge display
     * عدد الإشعارات غير المقروءة
     */
    getUnreadCount(role: string): number {
        return this.getUnreadNotifications(role).length;
    }

    /**
     * Mark a notification as read
     * تحديد إشعار كمقروء
     */
    markAsRead(id: string): void {
        const notifications = this.getAll();
        const index = notifications.findIndex(n => n.id === id);
        if (index !== -1) {
            notifications[index].isRead = true;
            this.saveAll(notifications);
        }
    }

    /**
     * Mark all notifications for a role as read
     * تحديد جميع إشعارات دور كمقروءة
     */
    markAllAsRead(role: string): void {
        const notifications = this.getAll();
        notifications.forEach(n => {
            if (n.targetRole === role) {
                n.isRead = true;
            }
        });
        this.saveAll(notifications);
    }

    /**
     * Delete a notification
     */
    deleteNotification(id: string): void {
        const notifications = this.getAll().filter(n => n.id !== id);
        this.saveAll(notifications);
    }

    /**
     * Clear all notifications for a role
     */
    clearAll(role: string): void {
        const notifications = this.getAll().filter(n => n.targetRole !== role);
        this.saveAll(notifications);
    }

    // =================== Convenience Methods ===================

    /**
     * Notify manager about a new edit request
     * إشعار المدير بطلب تعديل جديد
     */
    notifyManagerEditRequest(params: {
        invoiceNumber: string;
        requestedByName: string;
        reason: string;
        requestId: string;
    }): void {
        this.addNotification({
            type: 'edit_request',
            title: `طلب تعديل فاتورة #${params.invoiceNumber}`,
            message: `${params.requestedByName} يطلب تعديل فاتورة: ${params.reason}`,
            targetRole: 'manager',
            sourceRole: 'accountant',
            sourceName: params.requestedByName,
            priority: 'high',
            relatedId: params.requestId,
            relatedType: 'edit_request',
        });
    }

    /**
     * Notify employee about edit request decision
     * إشعار الموظف بقرار طلب التعديل
     */
    notifyEmployeeEditDecision(params: {
        invoiceNumber: string;
        decision: 'approved' | 'rejected';
        decisionByName: string;
        targetRole: string;
        requestId: string;
        reason?: string;
    }): void {
        const isApproved = params.decision === 'approved';
        this.addNotification({
            type: 'edit_request_decision',
            title: isApproved ? `تمت الموافقة على تعديل فاتورة #${params.invoiceNumber}` : `تم رفض تعديل فاتورة #${params.invoiceNumber}`,
            message: isApproved
                ? `${params.decisionByName} وافق على طلب التعديل. لديك 3 أيام لإتمام التعديل.`
                : `${params.decisionByName} رفض طلب التعديل. ${params.reason || ''}`,
            targetRole: params.targetRole,
            sourceRole: 'manager',
            sourceName: params.decisionByName,
            priority: isApproved ? 'medium' : 'high',
            relatedId: params.requestId,
            relatedType: 'edit_request',
        });
    }

    /**
     * Notify manager about a new support ticket
     * إشعار المدير بتذكرة دعم جديدة
     */
    notifyManagerNewTicket(params: {
        ticketNumber: string;
        subject: string;
        userName: string;
        category: string;
        ticketId: string;
    }): void {
        this.addNotification({
            type: 'support_ticket',
            title: `تذكرة جديدة #${params.ticketNumber}`,
            message: `${params.userName} أرسل تذكرة: ${params.subject} (${params.category})`,
            targetRole: 'manager',
            sourceName: params.userName,
            priority: 'high',
            relatedId: params.ticketId,
            relatedType: 'support_ticket',
        });
    }

    /**
     * Notify about a ticket response
     * إشعار بالرد على تذكرة
     */
    notifyTicketResponse(params: {
        ticketNumber: string;
        responderName: string;
        targetRole: string;
        preview: string;
        ticketId: string;
    }): void {
        this.addNotification({
            type: 'ticket_response',
            title: `رد جديد على تذكرة #${params.ticketNumber}`,
            message: `${params.responderName}: ${params.preview.substring(0, 100)}`,
            targetRole: params.targetRole,
            sourceName: params.responderName,
            priority: 'medium',
            relatedId: params.ticketId,
            relatedType: 'support_ticket',
        });
    }

    /**
     * Notify about ticket closure
     */
    notifyTicketClosed(params: {
        ticketNumber: string;
        closedByName: string;
        targetRole: string;
        ticketId: string;
    }): void {
        this.addNotification({
            type: 'ticket_closed',
            title: `تم إغلاق تذكرة #${params.ticketNumber}`,
            message: `تم إغلاق التذكرة بواسطة ${params.closedByName}`,
            targetRole: params.targetRole,
            sourceName: params.closedByName,
            priority: 'low',
            relatedId: params.ticketId,
            relatedType: 'support_ticket',
        });
    }
}

export const notificationService = new NotificationService();
export default notificationService;
