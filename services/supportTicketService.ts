/**
 * Support Ticket Service
 * خدمة تذاكر الدعم الفني
 * 
 * Ready for Firebase Integration
 */

// ====================== Types ======================

export type TicketCategory = 'technical_bug' | 'finance_boq' | 'hr_general' | 'feature_request' | 'other';
export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TicketStatus = 'open' | 'in_progress' | 'waiting_response' | 'resolved' | 'closed';
export type TicketRoute = 'github' | 'finance' | 'admin' | 'support';
export type UserType = 'admin' | 'employee' | 'company' | 'supplier' | 'individual' | 'guest';

export interface Attachment {
    id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    url: string;
    uploadedAt: string;
}

export interface TicketResponse {
    id: string;
    ticketId: string;
    responderId: string;
    responderName: string;
    responderRole: 'user' | 'support' | 'admin';
    message: string;
    attachments: Attachment[];
    createdAt: string;
    isInternal: boolean; // Internal notes not visible to user
}

export interface SupportTicket {
    id: string;
    ticketNumber: string;          // Format: TKT-XXXXX

    // User info
    userId: string;
    userType: UserType;
    userName: string;
    userEmail: string;
    userPhone?: string;

    // Ticket details
    category: TicketCategory;
    priority: TicketPriority;
    subject: string;
    description: string;
    attachments: Attachment[];

    // Status & routing
    status: TicketStatus;
    assignedTo?: string;
    assignedToName?: string;
    routedTo: TicketRoute;
    githubIssueUrl?: string;
    githubIssueNumber?: number;

    // Timeline
    createdAt: string;
    updatedAt: string;
    resolvedAt?: string;
    closedAt?: string;

    // Responses
    responses: TicketResponse[];

    // Metadata
    tags: string[];
    relatedTickets: string[];
}

// ====================== Translations ======================

export const CATEGORY_TRANSLATIONS: Record<TicketCategory, { ar: string; en: string }> = {
    technical_bug: { ar: 'خلل تقني', en: 'Technical Bug' },
    finance_boq: { ar: 'مالية / جدول كميات', en: 'Finance / BOQ' },
    hr_general: { ar: 'موارد بشرية / عام', en: 'HR / General' },
    feature_request: { ar: 'طلب ميزة جديدة', en: 'Feature Request' },
    other: { ar: 'أخرى', en: 'Other' }
};

export const PRIORITY_TRANSLATIONS: Record<TicketPriority, { ar: string; en: string }> = {
    low: { ar: 'منخفضة', en: 'Low' },
    medium: { ar: 'متوسطة', en: 'Medium' },
    high: { ar: 'عالية', en: 'High' },
    urgent: { ar: 'عاجلة', en: 'Urgent' }
};

export const STATUS_TRANSLATIONS: Record<TicketStatus, { ar: string; en: string }> = {
    open: { ar: 'مفتوحة', en: 'Open' },
    in_progress: { ar: 'قيد المعالجة', en: 'In Progress' },
    waiting_response: { ar: 'بانتظار الرد', en: 'Waiting Response' },
    resolved: { ar: 'تم الحل', en: 'Resolved' },
    closed: { ar: 'مغلقة', en: 'Closed' }
};

export const PRIORITY_COLORS: Record<TicketPriority, string> = {
    low: 'bg-slate-500/20 text-slate-400',
    medium: 'bg-blue-500/20 text-blue-400',
    high: 'bg-orange-500/20 text-orange-400',
    urgent: 'bg-red-500/20 text-red-400'
};

export const STATUS_COLORS: Record<TicketStatus, string> = {
    open: 'bg-red-500/20 text-red-400',
    in_progress: 'bg-blue-500/20 text-blue-400',
    waiting_response: 'bg-yellow-500/20 text-yellow-400',
    resolved: 'bg-green-500/20 text-green-400',
    closed: 'bg-slate-500/20 text-slate-400'
};

// ====================== Storage Keys ======================

const STORAGE_KEY = 'arba_support_tickets';
const TICKET_COUNTER_KEY = 'arba_ticket_counter';

// ====================== Helper Functions ======================

const generateTicketNumber = (): string => {
    const counter = parseInt(localStorage.getItem(TICKET_COUNTER_KEY) || '0') + 1;
    localStorage.setItem(TICKET_COUNTER_KEY, counter.toString());
    return `TKT-${counter.toString().padStart(5, '0')}`;
};

const generateId = (): string => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
};

const getTickets = (): SupportTicket[] => {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
};

const saveTickets = (tickets: SupportTicket[]): void => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tickets));
};

// Determine route based on category
const determineRoute = (category: TicketCategory): TicketRoute => {
    switch (category) {
        case 'technical_bug':
        case 'feature_request':
            return 'github';
        case 'finance_boq':
            return 'finance';
        case 'hr_general':
            return 'admin';
        default:
            return 'support';
    }
};

// ====================== Support Ticket Service ======================

class SupportTicketService {
    // ==================== Create Operations ====================

    /**
     * Create a new support ticket
     */
    createTicket(data: {
        userId: string;
        userType: UserType;
        userName: string;
        userEmail: string;
        userPhone?: string;
        category: TicketCategory;
        priority: TicketPriority;
        subject: string;
        description: string;
        attachments?: Attachment[];
    }): SupportTicket {
        const tickets = getTickets();
        const route = determineRoute(data.category);

        const newTicket: SupportTicket = {
            id: generateId(),
            ticketNumber: generateTicketNumber(),
            userId: data.userId,
            userType: data.userType,
            userName: data.userName,
            userEmail: data.userEmail,
            userPhone: data.userPhone,
            category: data.category,
            priority: data.priority,
            subject: data.subject,
            description: data.description,
            attachments: data.attachments || [],
            status: 'open',
            routedTo: route,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            responses: [],
            tags: [],
            relatedTickets: []
        };

        // If routed to GitHub, create mock issue
        if (route === 'github') {
            const issueResult = this.createGitHubIssue(newTicket);
            newTicket.githubIssueUrl = issueResult.url;
            newTicket.githubIssueNumber = issueResult.number;
        }

        tickets.unshift(newTicket);
        saveTickets(tickets);

        return newTicket;
    }

    /**
     * Create GitHub Issue (Mock - Ready for real integration)
     * عند ربط Firebase، يمكن استخدام Cloud Functions للتكامل الفعلي
     */
    createGitHubIssue(ticket: SupportTicket): { url: string; number: number } {
        // Mock implementation - ready for real GitHub API
        const mockIssueNumber = Math.floor(Math.random() * 1000) + 1;

        console.log('[GitHub Mock] Creating issue:', {
            title: `[${ticket.ticketNumber}] ${ticket.subject}`,
            body: ticket.description,
            labels: [ticket.category, ticket.priority]
        });

        // In real implementation:
        // 1. Use Firebase Cloud Function to call GitHub API
        // 2. Store GitHub credentials securely in Firebase
        // 3. Webhook to sync status back

        return {
            url: `https://github.com/arba-sys/issues/${mockIssueNumber}`,
            number: mockIssueNumber
        };
    }

    // ==================== Read Operations ====================

    /**
     * Get ticket by ID
     */
    getTicket(ticketId: string): SupportTicket | null {
        const tickets = getTickets();
        return tickets.find(t => t.id === ticketId) || null;
    }

    /**
     * Get ticket by ticket number
     */
    getTicketByNumber(ticketNumber: string): SupportTicket | null {
        const tickets = getTickets();
        return tickets.find(t => t.ticketNumber.toLowerCase() === ticketNumber.toLowerCase()) || null;
    }

    /**
     * Get all tickets for a user
     */
    getUserTickets(userId: string): SupportTicket[] {
        const tickets = getTickets();
        return tickets.filter(t => t.userId === userId);
    }

    /**
     * Get all tickets (for admin/support)
     */
    getAllTickets(): SupportTicket[] {
        return getTickets();
    }

    /**
     * Get tickets by status
     */
    getTicketsByStatus(status: TicketStatus): SupportTicket[] {
        const tickets = getTickets();
        return tickets.filter(t => t.status === status);
    }

    /**
     * Get tickets by category
     */
    getTicketsByCategory(category: TicketCategory): SupportTicket[] {
        const tickets = getTickets();
        return tickets.filter(t => t.category === category);
    }

    /**
     * Get tickets by route
     */
    getTicketsByRoute(route: TicketRoute): SupportTicket[] {
        const tickets = getTickets();
        return tickets.filter(t => t.routedTo === route);
    }

    /**
     * Get open tickets count
     */
    getOpenTicketsCount(): number {
        const tickets = getTickets();
        return tickets.filter(t => t.status === 'open' || t.status === 'in_progress').length;
    }

    /**
     * Get tickets assigned to a specific person
     */
    getAssignedTickets(assigneeId: string): SupportTicket[] {
        const tickets = getTickets();
        return tickets.filter(t => t.assignedTo === assigneeId);
    }

    // ==================== Update Operations ====================

    /**
     * Update ticket status
     */
    updateStatus(ticketId: string, status: TicketStatus): SupportTicket | null {
        const tickets = getTickets();
        const index = tickets.findIndex(t => t.id === ticketId);

        if (index === -1) return null;

        tickets[index].status = status;
        tickets[index].updatedAt = new Date().toISOString();

        if (status === 'resolved') {
            tickets[index].resolvedAt = new Date().toISOString();
        }
        if (status === 'closed') {
            tickets[index].closedAt = new Date().toISOString();
        }

        saveTickets(tickets);
        return tickets[index];
    }

    /**
     * Assign ticket to someone
     */
    assignTicket(ticketId: string, assigneeId: string, assigneeName: string): SupportTicket | null {
        const tickets = getTickets();
        const index = tickets.findIndex(t => t.id === ticketId);

        if (index === -1) return null;

        tickets[index].assignedTo = assigneeId;
        tickets[index].assignedToName = assigneeName;
        tickets[index].updatedAt = new Date().toISOString();

        if (tickets[index].status === 'open') {
            tickets[index].status = 'in_progress';
        }

        saveTickets(tickets);
        return tickets[index];
    }

    /**
     * Update ticket priority
     */
    updatePriority(ticketId: string, priority: TicketPriority): SupportTicket | null {
        const tickets = getTickets();
        const index = tickets.findIndex(t => t.id === ticketId);

        if (index === -1) return null;

        tickets[index].priority = priority;
        tickets[index].updatedAt = new Date().toISOString();

        saveTickets(tickets);
        return tickets[index];
    }

    /**
     * Add response to ticket
     */
    addResponse(ticketId: string, response: {
        responderId: string;
        responderName: string;
        responderRole: 'user' | 'support' | 'admin';
        message: string;
        attachments?: Attachment[];
        isInternal?: boolean;
    }): SupportTicket | null {
        const tickets = getTickets();
        const index = tickets.findIndex(t => t.id === ticketId);

        if (index === -1) return null;

        const newResponse: TicketResponse = {
            id: generateId(),
            ticketId,
            responderId: response.responderId,
            responderName: response.responderName,
            responderRole: response.responderRole,
            message: response.message,
            attachments: response.attachments || [],
            createdAt: new Date().toISOString(),
            isInternal: response.isInternal || false
        };

        tickets[index].responses.push(newResponse);
        tickets[index].updatedAt = new Date().toISOString();

        // Update status based on responder
        if (response.responderRole === 'user') {
            tickets[index].status = 'open';
        } else if (tickets[index].status === 'open') {
            tickets[index].status = 'in_progress';
        }

        saveTickets(tickets);
        return tickets[index];
    }

    /**
     * Add tags to ticket
     */
    addTags(ticketId: string, tags: string[]): SupportTicket | null {
        const tickets = getTickets();
        const index = tickets.findIndex(t => t.id === ticketId);

        if (index === -1) return null;

        const existingTags = new Set(tickets[index].tags);
        tags.forEach(tag => existingTags.add(tag));
        tickets[index].tags = Array.from(existingTags);
        tickets[index].updatedAt = new Date().toISOString();

        saveTickets(tickets);
        return tickets[index];
    }

    // ==================== Analytics ====================

    /**
     * Get ticket statistics
     */
    getStatistics(): {
        total: number;
        open: number;
        inProgress: number;
        resolved: number;
        closed: number;
        byCategory: Record<TicketCategory, number>;
        byPriority: Record<TicketPriority, number>;
        avgResponseTime: string;
        resolvedToday: number;
    } {
        const tickets = getTickets();
        const today = new Date().toDateString();

        const byCategory = Object.keys(CATEGORY_TRANSLATIONS).reduce((acc, cat) => {
            acc[cat as TicketCategory] = tickets.filter(t => t.category === cat).length;
            return acc;
        }, {} as Record<TicketCategory, number>);

        const byPriority = Object.keys(PRIORITY_TRANSLATIONS).reduce((acc, pri) => {
            acc[pri as TicketPriority] = tickets.filter(t => t.priority === pri).length;
            return acc;
        }, {} as Record<TicketPriority, number>);

        const resolvedToday = tickets.filter(t =>
            t.resolvedAt && new Date(t.resolvedAt).toDateString() === today
        ).length;

        // Calculate average response time (mock for now)
        const avgResponseTime = '15 د'; // 15 minutes mock

        return {
            total: tickets.length,
            open: tickets.filter(t => t.status === 'open').length,
            inProgress: tickets.filter(t => t.status === 'in_progress').length,
            resolved: tickets.filter(t => t.status === 'resolved').length,
            closed: tickets.filter(t => t.status === 'closed').length,
            byCategory,
            byPriority,
            avgResponseTime,
            resolvedToday
        };
    }

    // ==================== Search ====================

    /**
     * Search tickets
     */
    searchTickets(query: string): SupportTicket[] {
        const tickets = getTickets();
        const lowerQuery = query.toLowerCase();

        return tickets.filter(t =>
            t.ticketNumber.toLowerCase().includes(lowerQuery) ||
            t.subject.toLowerCase().includes(lowerQuery) ||
            t.description.toLowerCase().includes(lowerQuery) ||
            t.userName.toLowerCase().includes(lowerQuery) ||
            t.userEmail.toLowerCase().includes(lowerQuery)
        );
    }

    // ==================== Firebase Sync Preparation ====================

    /**
     * Prepare data for Firebase sync
     * استعداد البيانات للمزامنة مع Firebase
     */
    prepareForFirebaseSync(): {
        tickets: SupportTicket[];
        lastSyncAt: string;
    } {
        return {
            tickets: getTickets(),
            lastSyncAt: new Date().toISOString()
        };
    }

    /**
     * Import from Firebase
     * استيراد من Firebase
     */
    importFromFirebase(tickets: SupportTicket[]): void {
        saveTickets(tickets);
    }

    // ==================== Demo Data ====================

    /**
     * Initialize with demo data
     */
    initializeDemoData(): void {
        const existingTickets = getTickets();
        if (existingTickets.length > 0) return;

        const demoTickets: SupportTicket[] = [
            {
                id: generateId(),
                ticketNumber: 'TKT-00001',
                userId: 'demo-user-1',
                userType: 'individual',
                userName: 'أحمد محمد',
                userEmail: 'ahmed@example.com',
                category: 'technical_bug',
                priority: 'high',
                subject: 'مشكلة في تسجيل الدخول',
                description: 'لا أستطيع تسجيل الدخول إلى حسابي منذ أمس. تظهر رسالة خطأ عند إدخال البيانات.',
                attachments: [],
                status: 'open',
                routedTo: 'github',
                createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
                responses: [],
                tags: ['login', 'auth'],
                relatedTickets: []
            },
            {
                id: generateId(),
                ticketNumber: 'TKT-00002',
                userId: 'demo-user-2',
                userType: 'company',
                userName: 'شركة البناء الحديث',
                userEmail: 'info@modern-construction.com',
                category: 'finance_boq',
                priority: 'medium',
                subject: 'استفسار عن تسعير المرحلة الثانية',
                description: 'نحتاج توضيح بخصوص أسعار مواد البناء للمرحلة الثانية من المشروع.',
                attachments: [],
                status: 'in_progress',
                assignedTo: 'accountant-1',
                assignedToName: 'محمد المحاسب',
                routedTo: 'finance',
                createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                responses: [
                    {
                        id: generateId(),
                        ticketId: '',
                        responderId: 'accountant-1',
                        responderName: 'محمد المحاسب',
                        responderRole: 'support',
                        message: 'شكراً لتواصلكم. سأراجع التسعيرة وأرد عليكم خلال 24 ساعة.',
                        attachments: [],
                        createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
                        isInternal: false
                    }
                ],
                tags: ['pricing', 'boq'],
                relatedTickets: []
            },
            {
                id: generateId(),
                ticketNumber: 'TKT-00003',
                userId: 'demo-user-3',
                userType: 'supplier',
                userName: 'مصنع الحديد السعودي',
                userEmail: 'contact@saudi-steel.com',
                category: 'hr_general',
                priority: 'low',
                subject: 'طلب تحديث بيانات الشركة',
                description: 'نرغب في تحديث رقم السجل التجاري وبيانات التواصل.',
                attachments: [],
                status: 'resolved',
                assignedTo: 'hr-1',
                assignedToName: 'فاطمة الموارد البشرية',
                routedTo: 'admin',
                createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
                updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                resolvedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                responses: [
                    {
                        id: generateId(),
                        ticketId: '',
                        responderId: 'hr-1',
                        responderName: 'فاطمة الموارد البشرية',
                        responderRole: 'admin',
                        message: 'تم تحديث بياناتكم بنجاح. يمكنكم الاطلاع عليها في لوحة التحكم.',
                        attachments: [],
                        createdAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
                        isInternal: false
                    }
                ],
                tags: ['update', 'supplier'],
                relatedTickets: []
            }
        ];

        localStorage.setItem(TICKET_COUNTER_KEY, '3');
        saveTickets(demoTickets);
    }
}

export const supportTicketService = new SupportTicketService();
export default supportTicketService;
