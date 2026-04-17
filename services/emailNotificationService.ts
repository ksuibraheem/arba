/**
 * Email Notification Service
 * خدمة إشعارات البريد الإلكتروني للدعم الفني
 * 
 * Uses EmailJS for client-side email sending (no backend required)
 * Free tier: 200 emails/month
 */

import emailjs from '@emailjs/browser';

// ====================== Configuration ======================
// EmailJS credentials — read from .env (VITE_EMAILJS_*)
const EMAILJS_CONFIG = {
    serviceId: import.meta.env.VITE_EMAILJS_SERVICE_ID || 'service_arba_support',
    publicKey: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || '',
    templates: {
        ticketCreated: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'template_ticket_created',
        ticketResponse: 'template_ticket_response',
        ticketInquiry: 'template_ticket_inquiry',
        ticketClosed: 'template_ticket_closed',
    }
};

// Centralized admin email — always use env var
const ADMIN_EMAIL = import.meta.env.VITE_SUPER_ADMIN_EMAIL || 'info@arba-sys.com';
const SUPPORT_EMAIL = import.meta.env.VITE_SUPPORT_EMAIL || ADMIN_EMAIL;

// Track initialization
let initialized = false;

/**
 * Initialize EmailJS - call once at app startup
 */
export function initEmailService() {
    if (initialized) return;
    try {
        emailjs.init(EMAILJS_CONFIG.publicKey);
        initialized = true;

    } catch (error) {
        console.warn('📧 Email service initialization failed:', error);
    }
}

// ====================== Email Templates ======================

/**
 * Send ticket creation confirmation to user
 * إرسال تأكيد إنشاء التذكرة
 */
export async function sendTicketConfirmation(params: {
    userEmail: string;
    userName: string;
    ticketNumber: string;
    subject: string;
    category: string;
    priority: string;
}): Promise<boolean> {
    try {
        await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templates.ticketCreated, {
            to_email: params.userEmail,
            to_name: params.userName,
            ticket_number: params.ticketNumber,
            ticket_subject: params.subject,
            ticket_category: params.category,
            ticket_priority: params.priority,
            company_name: 'أربا للتسعير | Arba Pricing',
            support_email: SUPPORT_EMAIL,
            message: `تم استلام تذكرتك بنجاح برقم ${params.ticketNumber}. سيقوم فريق الدعم الفني بمراجعتها والرد عليك في أقرب وقت.`,
        });

        return true;
    } catch (error) {
        console.warn('📧 Failed to send confirmation email:', error);
        return false;
    }
}

/**
 * Send notification when support responds to ticket
 * إرسال إشعار عند رد الدعم الفني
 */
export async function sendResponseNotification(params: {
    userEmail: string;
    userName: string;
    ticketNumber: string;
    subject: string;
    responderName: string;
    responsePreview: string;
}): Promise<boolean> {
    try {
        await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templates.ticketResponse, {
            to_email: params.userEmail,
            to_name: params.userName,
            ticket_number: params.ticketNumber,
            ticket_subject: params.subject,
            responder_name: params.responderName,
            response_preview: params.responsePreview.substring(0, 200),
            company_name: 'أربا للتسعير | Arba Pricing',
            message: `تم إضافة رد جديد على تذكرتك رقم ${params.ticketNumber} من قبل ${params.responderName}.`,
        });

        return true;
    } catch (error) {
        console.warn('📧 Failed to send response notification:', error);
        return false;
    }
}

/**
 * Send inquiry from support team to user
 * إرسال استفسار من فريق الدعم للمستفيد
 */
export async function sendInquiryNotification(params: {
    userEmail: string;
    userName: string;
    ticketNumber: string;
    subject: string;
    inquiryMessage: string;
    supportAgentName: string;
}): Promise<boolean> {
    try {
        await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templates.ticketInquiry, {
            to_email: params.userEmail,
            to_name: params.userName,
            ticket_number: params.ticketNumber,
            ticket_subject: params.subject,
            agent_name: params.supportAgentName,
            inquiry_message: params.inquiryMessage,
            company_name: 'أربا للتسعير | Arba Pricing',
            message: `لدينا استفسار بخصوص تذكرتك رقم ${params.ticketNumber}. يرجى الرد في أقرب وقت ممكن.`,
        });

        return true;
    } catch (error) {
        console.warn('📧 Failed to send inquiry notification:', error);
        return false;
    }
}

/**
 * Send ticket closed/resolved notification
 * إرسال إشعار إغلاق/حل التذكرة
 */
export async function sendTicketClosedNotification(params: {
    userEmail: string;
    userName: string;
    ticketNumber: string;
    subject: string;
    resolution: 'resolved' | 'closed';
}): Promise<boolean> {
    const statusText = params.resolution === 'resolved' ? 'تم حل المشكلة' : 'تم إغلاق التذكرة';
    
    try {
        await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templates.ticketClosed, {
            to_email: params.userEmail,
            to_name: params.userName,
            ticket_number: params.ticketNumber,
            ticket_subject: params.subject,
            status_text: statusText,
            company_name: 'أربا للتسعير | Arba Pricing',
            support_email: SUPPORT_EMAIL,
            message: `${statusText} - تذكرة رقم ${params.ticketNumber}: "${params.subject}". إذا كنت بحاجة لمزيد من المساعدة، لا تتردد في فتح تذكرة جديدة.`,
        });

        return true;
    } catch (error) {
        console.warn('📧 Failed to send closure notification:', error);
        return false;
    }
}

/**
 * Send alert to staff when a new ticket is created
 * إشعار الموظفين/المدير عند إنشاء تذكرة جديدة
 */
export async function sendNewTicketAlertToStaff(params: {
    ticketNumber: string;
    subject: string;
    category: string;
    priority: string;
    userName: string;
    userEmail: string;
}): Promise<boolean> {
    try {
        await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templates.ticketCreated, {
            to_email: ADMIN_EMAIL, // Sending to staff email
            to_name: 'فريق الدعم الفني والإدارة',
            ticket_number: params.ticketNumber,
            ticket_subject: params.subject,
            ticket_category: params.category,
            ticket_priority: params.priority,
            company_name: 'أربا للتسعير | Arba Pricing',
            support_email: SUPPORT_EMAIL,
            message: `تذكرة جديدة رقم ${params.ticketNumber} تم إنشاؤها بواسطة ${params.userName} (${params.userEmail}). يُرجى متابعتها.`,
        });

        return true;
    } catch (error) {
        console.warn('📧 Failed to send staff alert for new ticket:', error);
        return false;
    }
}

/**
 * Send alert to staff when a user responds to a ticket
 * إشعار الموظفين عند رد العميل
 */
export async function sendResponseAlertToStaff(params: {
    ticketNumber: string;
    subject: string;
    userName: string;
    responsePreview: string;
}): Promise<boolean> {
    try {
        await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templates.ticketResponse, {
            to_email: ADMIN_EMAIL, // Sending to staff email
            to_name: 'فريق الدعم الفني والإدارة',
            ticket_number: params.ticketNumber,
            ticket_subject: params.subject,
            responder_name: params.userName,
            response_preview: params.responsePreview.substring(0, 200),
            company_name: 'أربا للتسعير | Arba Pricing',
            message: `قام العميل ${params.userName} بإضافة رد جديد على التذكرة رقم ${params.ticketNumber}.`,
        });

        return true;
    } catch (error) {
        console.warn('📧 Failed to send staff alert for response:', error);
        return false;
    }
}

// ====================== Edit Request Email Alerts ======================

/**
 * Send alert to manager when an accountant creates an edit request
 * إشعار المدير عند طلب تعديل فاتورة
 */
export async function sendEditRequestAlertToManager(params: {
    invoiceNumber: string;
    requestedByName: string;
    reason: string;
}): Promise<boolean> {
    try {
        await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templates.ticketCreated, {
            to_email: ADMIN_EMAIL,
            to_name: 'المدير العام',
            ticket_number: params.invoiceNumber,
            ticket_subject: `طلب تعديل فاتورة #${params.invoiceNumber}`,
            ticket_category: 'طلب تعديل فاتورة',
            ticket_priority: 'عاجل',
            company_name: 'أربا للتسعير | Arba Pricing',
            support_email: ADMIN_EMAIL,
            message: `قام ${params.requestedByName} بإرسال طلب تعديل للفاتورة رقم ${params.invoiceNumber}. السبب: ${params.reason}. يُرجى مراجعة الطلب من لوحة التحكم.`,
        });

        return true;
    } catch (error) {
        console.warn('📧 Failed to send edit request alert to manager:', error);
        return false;
    }
}

/**
 * Send notification to employee about edit request decision
 * إشعار الموظف بقرار المدير على طلب التعديل
 */
export async function sendEditRequestDecisionToEmployee(params: {
    employeeEmail: string;
    employeeName: string;
    invoiceNumber: string;
    decision: 'approved' | 'rejected';
    decisionByName: string;
    reason?: string;
}): Promise<boolean> {
    const isApproved = params.decision === 'approved';
    const statusText = isApproved ? 'تمت الموافقة' : 'تم الرفض';

    try {
        await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templates.ticketResponse, {
            to_email: params.employeeEmail || ADMIN_EMAIL,
            to_name: params.employeeName,
            ticket_number: params.invoiceNumber,
            ticket_subject: `${statusText} على طلب تعديل فاتورة #${params.invoiceNumber}`,
            responder_name: params.decisionByName,
            response_preview: isApproved
                ? 'تمت الموافقة على طلبك. لديك 3 أيام لإتمام التعديل.'
                : `تم رفض طلبك. ${params.reason || ''}`,
            company_name: 'أربا للتسعير | Arba Pricing',
            message: `${statusText} على طلب تعديل الفاتورة رقم ${params.invoiceNumber} بواسطة ${params.decisionByName}.`,
        });
        // Decision email sent
        return true;
    } catch (error) {
        console.warn('📧 Failed to send edit request decision email:', error);
        return false;
    }
}

/**
 * Send generic staff alert (for any employee action that needs manager attention)
 * إشعار عام للموظفين
 */
export async function sendGenericStaffAlert(params: {
    subject: string;
    message: string;
    fromName: string;
}): Promise<boolean> {
    try {
        await emailjs.send(EMAILJS_CONFIG.serviceId, EMAILJS_CONFIG.templates.ticketCreated, {
            to_email: ADMIN_EMAIL,
            to_name: 'فريق الإدارة',
            ticket_number: '-',
            ticket_subject: params.subject,
            ticket_category: 'إشعار عام',
            ticket_priority: 'متوسط',
            company_name: 'أربا للتسعير | Arba Pricing',
            support_email: ADMIN_EMAIL,
            message: `${params.fromName}: ${params.message}`,
        });

        return true;
    } catch (error) {
        console.warn('📧 Failed to send generic staff alert:', error);
        return false;
    }
}
