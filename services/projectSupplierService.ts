/**
 * Project Suppliers Service — ربط الموردين بالمشاريع + أعضاء الفريق
 * إدارة المشاريع × الموردين + صلاحية + قنوات شات + فريق العمل
 */

import { db } from '../firebase/config';
import { collection, doc, setDoc, getDocs, query, where, updateDoc, deleteDoc, serverTimestamp, getDoc } from 'firebase/firestore';

// ═══════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════

export type RenewalMode = 'manual' | 'auto';
export type ChannelType = 'project' | 'internal' | 'supplier';

export type ProjectRole =
    | 'project_manager'
    | 'site_engineer'
    | 'accountant'
    | 'site_supervisor'
    | 'safety_officer'
    | 'quantity_surveyor'
    | 'architect'
    | 'custom';

export interface ProjectMemberPermissions {
    chat: boolean;
    photos: boolean;
    invoices: boolean;
    forms: boolean;
    reports: boolean;
    team: boolean;
}

export const PROJECT_ROLES: Record<ProjectRole, { ar: string; en: string; icon: string; defaultPerms: ProjectMemberPermissions }> = {
    project_manager: { ar: 'مدير المشروع', en: 'Project Manager', icon: '👔', defaultPerms: { chat: true, photos: true, invoices: true, forms: true, reports: true, team: true } },
    site_engineer: { ar: 'مهندس الموقع', en: 'Site Engineer', icon: '🏗️', defaultPerms: { chat: true, photos: true, invoices: false, forms: true, reports: true, team: false } },
    accountant: { ar: 'محاسب', en: 'Accountant', icon: '🧮', defaultPerms: { chat: true, photos: false, invoices: true, forms: false, reports: true, team: false } },
    site_supervisor: { ar: 'مشرف الموقع', en: 'Site Supervisor', icon: '👷', defaultPerms: { chat: true, photos: true, invoices: false, forms: true, reports: false, team: false } },
    safety_officer: { ar: 'مسؤول السلامة', en: 'Safety Officer', icon: '🛡️', defaultPerms: { chat: true, photos: true, invoices: false, forms: true, reports: true, team: false } },
    quantity_surveyor: { ar: 'مساح الكميات', en: 'Quantity Surveyor', icon: '📐', defaultPerms: { chat: true, photos: false, invoices: false, forms: true, reports: true, team: false } },
    architect: { ar: 'مهندس معماري', en: 'Architect', icon: '📝', defaultPerms: { chat: true, photos: true, invoices: false, forms: false, reports: true, team: false } },
    custom: { ar: 'مخصص', en: 'Custom', icon: '⚙️', defaultPerms: { chat: true, photos: false, invoices: false, forms: false, reports: false, team: false } },
};

export interface ProjectMember {
    id: string;
    projectId: string;
    projectName: string;
    employeeId: string;
    employeeName: string;
    employeePhone?: string;
    password: string;              // رقم سري
    lastLogin?: string;           // آخر تسجيل دخول
    loginCount: number;           // عدد مرات الدخول
    role: ProjectRole;
    permissions: ProjectMemberPermissions;
    addedBy: string;
    addedAt: string;
    isActive: boolean;
}

export interface ProjectSupplier {
    id: string;
    supplierId: string;
    supplierName: string;
    supplierPhone: string;
    supplierCompany: string;
    projectId: string;
    projectName: string;
    assignedAt: string;
    expiryDate: string;
    renewalMode: RenewalMode;
    isActive: boolean;
    permissions: {
        chat: boolean;
        uploadInvoices: boolean;
        uploadPhotos: boolean;
        deliveryForms: boolean;
    };
    notes?: string;
}

export interface ChatChannel {
    id: string;
    name: { ar: string; en: string };
    type: ChannelType;
    projectId?: string;
    supplierId?: string;
    icon: string;
    memberIds: string[];
    lastMessage?: string;
    lastMessageTime?: string;
    unreadCount: number;
}

// ═══════════════════════════════════════════════
// LOCAL STORAGE
// ═══════════════════════════════════════════════

const KEYS = {
    projectSuppliers: 'arba_project_suppliers',
    channels: 'arba_chat_channels',
    projectMembers: 'arba_project_members',
};

function getLocal<T>(key: string): T[] {
    try { return JSON.parse(localStorage.getItem(key) || '[]'); } catch { return []; }
}
function saveLocal<T>(key: string, data: T[]) {
    localStorage.setItem(key, JSON.stringify(data));
}
function genId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * توليد رقم سري فريد من 6 أرقام
 */
function generatePassword(): string {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const existing = getLocal<ProjectMember>(KEYS.projectMembers);
    if (existing.some(m => m.password === code)) {
        return generatePassword();
    }
    return code;
}

const MEMBERS_COLLECTION = 'project_members';

// ═══════════════════════════════════════════════
// SERVICE
// ═══════════════════════════════════════════════

export const projectSupplierService = {

    // ═══ Project-Supplier Links ═══

    getProjectSuppliers(projectId?: string): ProjectSupplier[] {
        const all = getLocal<ProjectSupplier>(KEYS.projectSuppliers);
        if (projectId) return all.filter(ps => ps.projectId === projectId);
        return all;
    },

    getSupplierProjects(supplierId: string): ProjectSupplier[] {
        return getLocal<ProjectSupplier>(KEYS.projectSuppliers).filter(ps => ps.supplierId === supplierId);
    },

    findBySupplierIdOrName(query: string): ProjectSupplier[] {
        const q = query.toLowerCase();
        return getLocal<ProjectSupplier>(KEYS.projectSuppliers).filter(ps =>
            ps.supplierId.toLowerCase().includes(q) ||
            ps.supplierName.toLowerCase().includes(q) ||
            ps.supplierCompany.toLowerCase().includes(q) ||
            ps.supplierPhone.includes(q)
        );
    },

    assignSupplier(data: {
        supplierId: string; supplierName: string; supplierPhone: string; supplierCompany: string;
        projectId: string; projectName: string;
        expiryDate: string; renewalMode: RenewalMode;
        permissions?: Partial<ProjectSupplier['permissions']>;
        notes?: string;
    }): ProjectSupplier {
        const list = getLocal<ProjectSupplier>(KEYS.projectSuppliers);
        const exists = list.find(ps => ps.supplierId === data.supplierId && ps.projectId === data.projectId);
        if (exists) {
            exists.expiryDate = data.expiryDate;
            exists.renewalMode = data.renewalMode;
            exists.isActive = true;
            exists.notes = data.notes;
            if (data.permissions) exists.permissions = { ...exists.permissions, ...data.permissions };
            saveLocal(KEYS.projectSuppliers, list);
            return exists;
        }
        const ps: ProjectSupplier = {
            id: genId(), supplierId: data.supplierId, supplierName: data.supplierName,
            supplierPhone: data.supplierPhone, supplierCompany: data.supplierCompany,
            projectId: data.projectId, projectName: data.projectName,
            assignedAt: new Date().toISOString(), expiryDate: data.expiryDate,
            renewalMode: data.renewalMode, isActive: true,
            permissions: { chat: true, uploadInvoices: true, uploadPhotos: true, deliveryForms: true, ...data.permissions },
            notes: data.notes,
        };
        list.push(ps);
        saveLocal(KEYS.projectSuppliers, list);
        this.ensureSupplierChannel(data.projectId, data.projectName, data.supplierId, data.supplierName);
        return ps;
    },

    removeSupplier(projectId: string, supplierId: string) {
        const list = getLocal<ProjectSupplier>(KEYS.projectSuppliers).filter(
            ps => !(ps.projectId === projectId && ps.supplierId === supplierId)
        );
        saveLocal(KEYS.projectSuppliers, list);
    },

    updateSupplier(id: string, updates: Partial<ProjectSupplier>) {
        const list = getLocal<ProjectSupplier>(KEYS.projectSuppliers);
        const idx = list.findIndex(ps => ps.id === id);
        if (idx >= 0) { list[idx] = { ...list[idx], ...updates }; saveLocal(KEYS.projectSuppliers, list); }
    },

    checkExpiry(): { expired: ProjectSupplier[]; renewed: ProjectSupplier[] } {
        const list = getLocal<ProjectSupplier>(KEYS.projectSuppliers);
        const now = new Date();
        const expired: ProjectSupplier[] = [];
        const renewed: ProjectSupplier[] = [];
        list.forEach(ps => {
            if (!ps.isActive) return;
            const exp = new Date(ps.expiryDate);
            if (exp <= now) {
                if (ps.renewalMode === 'auto') {
                    const newExp = new Date(exp); newExp.setFullYear(newExp.getFullYear() + 1);
                    ps.expiryDate = newExp.toISOString(); renewed.push(ps);
                } else { ps.isActive = false; expired.push(ps); }
            }
        });
        saveLocal(KEYS.projectSuppliers, list);
        return { expired, renewed };
    },

    isSupplierExpired(ps: ProjectSupplier): boolean { return new Date(ps.expiryDate) <= new Date(); },
    getDaysUntilExpiry(ps: ProjectSupplier): number { return Math.ceil((new Date(ps.expiryDate).getTime() - Date.now()) / 86400000); },

    // ═══ Project Team Members ═══

    getProjectMembers(projectId?: string): ProjectMember[] {
        const all = getLocal<ProjectMember>(KEYS.projectMembers);
        if (projectId) return all.filter(m => m.projectId === projectId);
        return all;
    },

    addProjectMember(data: {
        projectId: string; projectName: string;
        employeeId: string; employeeName: string; employeePhone?: string;
        role: ProjectRole; addedBy: string;
        permissions?: Partial<ProjectMemberPermissions>;
    }): ProjectMember {
        const list = getLocal<ProjectMember>(KEYS.projectMembers);
        const existing = list.find(m => m.projectId === data.projectId && m.employeeId === data.employeeId);
        if (existing) {
            existing.role = data.role; existing.isActive = true;
            if (data.permissions) existing.permissions = { ...existing.permissions, ...data.permissions };
            saveLocal(KEYS.projectMembers, list);
            // Sync to Firestore
            setDoc(doc(db, MEMBERS_COLLECTION, existing.id), existing, { merge: true }).catch(console.warn);
            return existing;
        }
        const defaultPerms = PROJECT_ROLES[data.role]?.defaultPerms || PROJECT_ROLES.custom.defaultPerms;
        const code = generatePassword();
        const member: ProjectMember = {
            id: genId(), projectId: data.projectId, projectName: data.projectName,
            employeeId: data.employeeId, employeeName: data.employeeName, employeePhone: data.employeePhone,
            password: code, lastLogin: undefined, loginCount: 0,
            role: data.role, permissions: { ...defaultPerms, ...data.permissions },
            addedBy: data.addedBy, addedAt: new Date().toISOString(), isActive: true,
        };
        list.push(member);
        saveLocal(KEYS.projectMembers, list);
        // Sync to Firestore
        setDoc(doc(db, MEMBERS_COLLECTION, member.id), member).catch(console.warn);
        return member;
    },

    updateProjectMember(id: string, updates: Partial<ProjectMember>) {
        const list = getLocal<ProjectMember>(KEYS.projectMembers);
        const idx = list.findIndex(m => m.id === id);
        if (idx >= 0) {
            list[idx] = { ...list[idx], ...updates };
            saveLocal(KEYS.projectMembers, list);
            // Sync to Firestore
            setDoc(doc(db, MEMBERS_COLLECTION, id), list[idx], { merge: true }).catch(console.warn);
        }
    },

    removeProjectMember(id: string) {
        saveLocal(KEYS.projectMembers, getLocal<ProjectMember>(KEYS.projectMembers).filter(m => m.id !== id));
        // Remove from Firestore
        deleteDoc(doc(db, MEMBERS_COLLECTION, id)).catch(console.warn);
    },

    /**
     * تجديد الرقم السري لعضو
     */
    regeneratePassword(memberId: string): string {
        const code = generatePassword();
        this.updateProjectMember(memberId, { password: code });
        return code;
    },

    /**
     * مصادقة عضو فريق المشروع بالجوال والرمز
     */
    async authenticateTeamMember(phone: string, password: string): Promise<{ success: boolean; member?: ProjectMember; error?: string }> {
        // 1) Try Firestore first
        try {
            const q = query(
                collection(db, MEMBERS_COLLECTION),
                where('employeePhone', '==', phone),
                where('password', '==', password),
                where('isActive', '==', true)
            );
            const snapshot = await getDocs(q);
            if (!snapshot.empty) {
                const member = snapshot.docs[0].data() as ProjectMember;
                // Update login stats
                await updateDoc(doc(db, MEMBERS_COLLECTION, member.id), {
                    lastLogin: new Date().toISOString(),
                    loginCount: (member.loginCount || 0) + 1,
                });
                member.lastLogin = new Date().toISOString();
                member.loginCount = (member.loginCount || 0) + 1;
                // Sync to localStorage
                const list = getLocal<ProjectMember>(KEYS.projectMembers);
                const idx = list.findIndex(m => m.id === member.id);
                if (idx >= 0) { list[idx] = member; } else { list.push(member); }
                saveLocal(KEYS.projectMembers, list);
                return { success: true, member };
            }
        } catch (err) {
            console.warn('⚠️ Firestore auth failed, trying localStorage:', err);
        }
        // 2) Fallback to localStorage
        const all = getLocal<ProjectMember>(KEYS.projectMembers);
        const match = all.find(m => m.employeePhone === phone && m.password === password && m.isActive);
        if (match) {
            match.lastLogin = new Date().toISOString();
            match.loginCount = (match.loginCount || 0) + 1;
            saveLocal(KEYS.projectMembers, all);
            return { success: true, member: match };
        }
        return { success: false, error: 'رقم الجوال أو الرقم السري غير صحيح' };
    },

    // ═══ Full Project Kit ═══

    ensureProjectFullKit(projectId: string, projectName: string): { channel: ChatChannel } {
        return { channel: this.ensureProjectChannel(projectId, projectName) };
    },

    // ═══ Chat Channels ═══

    getChannels(): ChatChannel[] {
        const channels = getLocal<ChatChannel>(KEYS.channels);
        if (channels.length === 0) {
            const internal: ChatChannel = {
                id: 'ch_internal', name: { ar: 'المحادثة الداخلية', en: 'Internal Chat' },
                type: 'internal', icon: '🏢', memberIds: [], unreadCount: 0,
            };
            saveLocal(KEYS.channels, [internal]);
            return [internal];
        }
        return channels;
    },

    ensureProjectChannel(projectId: string, projectName: string): ChatChannel {
        const channels = this.getChannels();
        let ch = channels.find(c => c.type === 'project' && c.projectId === projectId);
        if (!ch) {
            ch = {
                id: `ch_proj_${projectId}`, name: { ar: projectName || 'مشروع', en: projectName || 'Project' },
                type: 'project', projectId, icon: '📁', memberIds: [], unreadCount: 0,
            };
            channels.push(ch);
            saveLocal(KEYS.channels, channels);
        }
        return ch;
    },

    ensureSupplierChannel(projectId: string, projectName: string, supplierId: string, supplierName: string): ChatChannel {
        const channels = this.getChannels();
        const chId = `ch_sup_${projectId}_${supplierId}`;
        let ch = channels.find(c => c.id === chId);
        if (!ch) {
            ch = {
                id: chId, name: { ar: supplierName, en: supplierName },
                type: 'supplier', projectId, supplierId, icon: '🚛', memberIds: [supplierId], unreadCount: 0,
            };
            channels.push(ch);
            saveLocal(KEYS.channels, channels);
        }
        return ch;
    },

    updateChannelLastMessage(channelId: string, message: string, time: string) {
        const channels = this.getChannels();
        const ch = channels.find(c => c.id === channelId);
        if (ch) { ch.lastMessage = message; ch.lastMessageTime = time; ch.unreadCount++; saveLocal(KEYS.channels, channels); }
    },

    // ═══ Sample Data ═══

    initSampleData() {
        const existingSuppliers = getLocal<ProjectSupplier>(KEYS.projectSuppliers);
        const existingMembers = getLocal<ProjectMember>(KEYS.projectMembers);

        const samples: ProjectSupplier[] = [
            {
                id: 'ps_1', supplierId: 'supplier-steel', supplierName: 'مصنع الشرقية للحديد',
                supplierPhone: '0501234567', supplierCompany: 'مصنع الشرقية',
                projectId: 'proj_1', projectName: 'فيلا الرياض — حي النرجس',
                assignedAt: new Date(Date.now() - 30 * 86400000).toISOString(),
                expiryDate: new Date(Date.now() + 335 * 86400000).toISOString(),
                renewalMode: 'auto', isActive: true,
                permissions: { chat: true, uploadInvoices: true, uploadPhotos: true, deliveryForms: true },
            },
            {
                id: 'ps_2', supplierId: 'supplier-cement', supplierName: 'شركة اليمامة للإسمنت',
                supplierPhone: '0559876543', supplierCompany: 'اليمامة للإسمنت',
                projectId: 'proj_1', projectName: 'فيلا الرياض — حي النرجس',
                assignedAt: new Date(Date.now() - 15 * 86400000).toISOString(),
                expiryDate: new Date(Date.now() + 350 * 86400000).toISOString(),
                renewalMode: 'manual', isActive: true,
                permissions: { chat: true, uploadInvoices: true, uploadPhotos: true, deliveryForms: false },
            },
            {
                id: 'ps_3', supplierId: 'supplier-electrical', supplierName: 'مؤسسة النور للكهربائيات',
                supplierPhone: '0541112233', supplierCompany: 'النور للكهربائيات',
                projectId: 'proj_1', projectName: 'فيلا الرياض — حي النرجس',
                assignedAt: new Date(Date.now() - 5 * 86400000).toISOString(),
                expiryDate: new Date(Date.now() + 10 * 86400000).toISOString(),
                renewalMode: 'manual', isActive: true,
                permissions: { chat: true, uploadInvoices: true, uploadPhotos: false, deliveryForms: false },
            },
        ];

        // Seed suppliers only if empty
        if (existingSuppliers.length === 0) {
            saveLocal(KEYS.projectSuppliers, samples);
        }

        // ALWAYS seed project members if empty (independent of suppliers)
        if (existingMembers.length === 0) {
            const sampleMembers: ProjectMember[] = [
                { id: 'pm_1', projectId: 'proj_1', projectName: 'فيلا الرياض — حي النرجس', employeeId: 'emp_1', employeeName: 'م. خالد الشمري', employeePhone: '0501001001', password: '123456', lastLogin: undefined, loginCount: 0, role: 'project_manager', permissions: { chat: true, photos: true, invoices: true, forms: true, reports: true, team: true }, addedBy: 'admin', addedAt: new Date(Date.now() - 30 * 86400000).toISOString(), isActive: true },
                { id: 'pm_2', projectId: 'proj_1', projectName: 'فيلا الرياض — حي النرجس', employeeId: 'emp_2', employeeName: 'م. سعد العتيبي', employeePhone: '0502002002', password: '123456', lastLogin: undefined, loginCount: 0, role: 'site_engineer', permissions: { chat: true, photos: true, invoices: false, forms: true, reports: true, team: false }, addedBy: 'admin', addedAt: new Date(Date.now() - 25 * 86400000).toISOString(), isActive: true },
                { id: 'pm_3', projectId: 'proj_1', projectName: 'فيلا الرياض — حي النرجس', employeeId: 'emp_3', employeeName: 'أحمد المالكي', employeePhone: '0503003003', password: '123456', lastLogin: undefined, loginCount: 0, role: 'accountant', permissions: { chat: true, photos: false, invoices: true, forms: false, reports: true, team: false }, addedBy: 'admin', addedAt: new Date(Date.now() - 20 * 86400000).toISOString(), isActive: true },
                { id: 'pm_4', projectId: 'proj_1', projectName: 'فيلا الرياض — حي النرجس', employeeId: 'emp_4', employeeName: 'عبدالله الحربي', employeePhone: '0504004004', password: '123456', lastLogin: undefined, loginCount: 0, role: 'safety_officer', permissions: { chat: true, photos: true, invoices: false, forms: true, reports: true, team: false }, addedBy: 'admin', addedAt: new Date(Date.now() - 15 * 86400000).toISOString(), isActive: true },
            ];
            saveLocal(KEYS.projectMembers, sampleMembers);
            // Sync samples to Firestore
            sampleMembers.forEach(m => setDoc(doc(db, MEMBERS_COLLECTION, m.id), m).catch(console.warn));
        }

        this.ensureProjectChannel('proj_1', 'فيلا الرياض — حي النرجس');
        samples.forEach(s => this.ensureSupplierChannel(s.projectId, s.projectName, s.supplierId, s.supplierName));
    },
};
