/**
 * Connect Service — خدمة التواصل الداخلي
 * Firestore CRUD + Image compression + Storage management
 * حصري لباقة المؤسسات (Enterprise)
 */

import { db, storage } from '../firebase/config';
import {
    collection, doc, addDoc, updateDoc, deleteDoc, getDocs,
    query, where, orderBy, limit, onSnapshot, serverTimestamp,
    Timestamp, writeBatch
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { formatStorageSize } from './storagePackages';
import { firestoreDataService } from './firestoreDataService';

// ═══════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════

export type MessageCategory = 'general' | 'urgent' | 'technical' | 'approval';
export type MessageType = 'text' | 'image' | 'file' | 'approval_request' | 'system';
export type UserRole = 'owner' | 'contractor' | 'engineer' | 'supplier' | 'subcontractor';
export type FormType = 'material_receipt' | 'work_delivery' | 'quality_check' | 'meeting';
export type FormStatus = 'draft' | 'pending' | 'approved' | 'rejected';
export type MailStatus = 'sent' | 'read' | 'replied';
export type PhotoCategory = 'before' | 'during' | 'after';
export type NotePriority = 'normal' | 'important' | 'urgent';

export interface ConnectUser {
    id: string;
    name: string;
    email?: string;
    role: UserRole;
    avatar?: string;
    company?: string;
    companyLogo?: string;
}

export interface ChatMessage {
    id?: string;
    channelId?: string; // per-project/supplier channel
    senderId: string;
    senderName: string;
    senderRole: UserRole;
    senderAvatar?: string;
    content: string;
    type: MessageType;
    category: MessageCategory;
    linkedItemCode?: string;
    attachments?: FileAttachment[];
    replyTo?: string;
    replyToPreview?: string;
    readBy: string[];
    emailSent: boolean;
    createdAt: Timestamp | Date;
}

export interface FileAttachment {
    url: string;
    thumbnailUrl?: string;
    name: string;
    size: number;
    type: string; // MIME type
}

export interface InternalMailMessage {
    id?: string;
    from: ConnectUser;
    to: ConnectUser[];
    cc?: ConnectUser[];
    subject: string;
    body: string;
    template?: string;
    attachments: FileAttachment[];
    status: MailStatus;
    linkedItemCode?: string;
    externalEmailSent: boolean;
    replies: MailReply[];
    starred: boolean;
    createdAt: Timestamp | Date;
}

export interface MailReply {
    from: ConnectUser;
    body: string;
    attachments?: FileAttachment[];
    createdAt: Timestamp | Date;
}

export interface ProjectPhoto {
    id?: string;
    uploadedBy: ConnectUser;
    originalUrl: string;
    thumbnailUrl: string;
    originalSize: number;
    compressedSize: number;
    category: PhotoCategory;
    linkedItemCode?: string;
    description?: string;
    geoLocation?: { lat: number; lng: number };
    createdAt: Timestamp | Date;
}

export interface DeliveryForm {
    id?: string;
    type: FormType;
    formNumber: string;
    title: string;
    status: FormStatus;
    createdBy: ConnectUser;
    projectName: string;
    data: Record<string, any>;
    photos: { url: string; description: string }[];
    signatures: FormSignature[];
    linkedItemCodes: string[];
    pdfUrl?: string;
    createdAt: Timestamp | Date;
    updatedAt?: Timestamp | Date;
}

export interface FormSignature {
    role: string;
    name: string;
    signatureDataUrl?: string;
    signedAt?: Timestamp | Date;
    status: 'pending' | 'signed' | 'rejected';
}

export interface SmartNote {
    id?: string;
    createdBy: ConnectUser;
    content: string;
    linkedItemCode?: string;
    priority: NotePriority;
    reminder?: Timestamp | Date;
    sharedWith: string[];
    attachments: FileAttachment[];
    completed: boolean;
    createdAt: Timestamp | Date;
}

// ═══════════════════════════════════════════════
// MAIL TEMPLATES
// ═══════════════════════════════════════════════

export const MAIL_TEMPLATES: Record<string, { ar: string; en: string; subject: { ar: string; en: string }; body: { ar: string; en: string } }> = {
    price_request: {
        ar: 'طلب تسعير',
        en: 'Price Request',
        subject: { ar: 'طلب تسعير مواد — {{projectName}}', en: 'Material Price Request — {{projectName}}' },
        body: {
            ar: 'السلام عليكم ورحمة الله وبركاته\n\nنرجو تزويدنا بعرض أسعار للمواد التالية لمشروع {{projectName}}:\n\n{{items}}\n\nنأمل الرد في أقرب وقت.\n\nمع التقدير',
            en: 'Dear Sir/Madam,\n\nPlease provide us with a quotation for the following materials for project {{projectName}}:\n\n{{items}}\n\nLooking forward to your prompt response.\n\nBest regards'
        }
    },
    material_approval: {
        ar: 'اعتماد مواد',
        en: 'Material Approval',
        subject: { ar: 'طلب اعتماد مواد — {{projectName}}', en: 'Material Approval Request — {{projectName}}' },
        body: {
            ar: 'السلام عليكم\n\nنرجو اعتماد المواد التالية:\n\n{{items}}\n\nمع إرفاق عينات وشهادات الجودة.\n\nمع التقدير',
            en: 'Dear Sir/Madam,\n\nPlease approve the following materials:\n\n{{items}}\n\nSamples and quality certificates are attached.\n\nBest regards'
        }
    },
    quantity_change: {
        ar: 'تعديل كميات',
        en: 'Quantity Change',
        subject: { ar: 'طلب تعديل كميات — {{projectName}}', en: 'Quantity Change Request — {{projectName}}' },
        body: {
            ar: 'السلام عليكم\n\nنود إبلاغكم بتعديل الكميات التالية في مشروع {{projectName}}:\n\n{{items}}\n\nسبب التعديل: {{reason}}\n\nمع التقدير',
            en: 'Dear Sir/Madam,\n\nWe would like to inform you of the following quantity changes in project {{projectName}}:\n\n{{items}}\n\nReason: {{reason}}\n\nBest regards'
        }
    },
    payment_request: {
        ar: 'طلب دفعة',
        en: 'Payment Request',
        subject: { ar: 'طلب صرف دفعة — {{projectName}}', en: 'Payment Request — {{projectName}}' },
        body: {
            ar: 'السلام عليكم\n\nنرجو صرف الدفعة رقم {{paymentNumber}} عن مشروع {{projectName}} بمبلغ {{amount}} ريال.\n\nمرفق المستخلص والمستندات المؤيدة.\n\nمع التقدير',
            en: 'Dear Sir/Madam,\n\nPlease process payment #{{paymentNumber}} for project {{projectName}} in the amount of {{amount}} SAR.\n\nInvoice and supporting documents are attached.\n\nBest regards'
        }
    },
};

// ═══════════════════════════════════════════════
// FORM TEMPLATES
// ═══════════════════════════════════════════════

export const FORM_TEMPLATES: Record<FormType, { name: { ar: string; en: string }; icon: string; fields: string[] }> = {
    material_receipt: {
        name: { ar: 'محضر استلام مواد', en: 'Material Receipt' },
        icon: '📦',
        fields: ['supplier', 'materials', 'quantity', 'condition', 'notes'],
    },
    work_delivery: {
        name: { ar: 'مستخلص أعمال', en: 'Work Delivery' },
        icon: '🏗️',
        fields: ['items', 'completion_percentage', 'notes', 'defects'],
    },
    quality_check: {
        name: { ar: 'فحص جودة', en: 'Quality Check' },
        icon: '✅',
        fields: ['checklist', 'rating', 'defects', 'corrective_actions'],
    },
    meeting: {
        name: { ar: 'محضر اجتماع', en: 'Meeting Minutes' },
        icon: '📋',
        fields: ['attendees', 'agenda', 'decisions', 'action_items'],
    },
};

// ═══════════════════════════════════════════════
// IMAGE COMPRESSION
// ═══════════════════════════════════════════════

/**
 * Compress image using Canvas API — reduces size by ~90%
 * Converts to WebP format with resizing
 */
export async function compressImage(
    file: File,
    maxWidth: number = 1920,
    quality: number = 0.8
): Promise<{ blob: Blob; originalSize: number; compressedSize: number }> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                // Resize if larger than maxWidth
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Canvas not supported'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);

                // Convert to WebP
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Compression failed'));
                            return;
                        }
                        resolve({
                            blob,
                            originalSize: file.size,
                            compressedSize: blob.size,
                        });
                    },
                    'image/webp',
                    quality
                );
            };
            img.onerror = () => reject(new Error('Failed to load image'));
            img.src = e.target?.result as string;
        };
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(file);
    });
}

/**
 * Create thumbnail from image
 */
export async function createThumbnail(
    file: File | Blob,
    size: number = 200
): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const reader = new FileReader();

        reader.onload = (e) => {
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ratio = Math.min(size / img.width, size / img.height);
                canvas.width = img.width * ratio;
                canvas.height = img.height * ratio;

                const ctx = canvas.getContext('2d');
                if (!ctx) { reject(new Error('Canvas not supported')); return; }

                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

                canvas.toBlob(
                    (blob) => blob ? resolve(blob) : reject(new Error('Thumbnail failed')),
                    'image/webp',
                    0.6
                );
            };
            img.src = e.target?.result as string;
        };
        reader.readAsDataURL(file instanceof File ? file : file);
    });
}

// ═══════════════════════════════════════════════
// LOCAL STORAGE CRUD (fallback when Firestore is unavailable)
// ═══════════════════════════════════════════════

const CONNECT_KEYS = {
    messages: 'arba_connect_messages',
    mail: 'arba_connect_mail',
    gallery: 'arba_connect_gallery',
    forms: 'arba_connect_forms',
    notes: 'arba_connect_notes',
    storage: 'arba_connect_storage_used',
    settings: 'arba_connect_settings',
};

// ═══════════════════════════════════════════════
// FIRESTORE-FIRST CACHES + LISTENERS
// ═══════════════════════════════════════════════

const FS_COLLECTIONS: Record<string, string> = {
    [CONNECT_KEYS.messages]: 'connect_messages',
    [CONNECT_KEYS.mail]: 'connect_mail',
    [CONNECT_KEYS.forms]: 'connect_forms',
    [CONNECT_KEYS.notes]: 'connect_notes',
};

// In-memory caches populated by onSnapshot
const _caches: Record<string, any[] | null> = {
    [CONNECT_KEYS.messages]: null,
    [CONNECT_KEYS.mail]: null,
    [CONNECT_KEYS.forms]: null,
    [CONNECT_KEYS.notes]: null,
};

let _listenersInit = false;

function initConnectListeners(): void {
    if (_listenersInit) return;
    _listenersInit = true;

    Object.entries(FS_COLLECTIONS).forEach(([localKey, fsCollection]) => {
        firestoreDataService.subscribeToCollection(
            fsCollection,
            (items: any[]) => {
                _caches[localKey] = items;
                localStorage.setItem(localKey, JSON.stringify(items));
            },
            undefined,
            localKey
        );
    });
}

// Initialize on module load
initConnectListeners();

function getLocalData<T>(key: string): T[] {
    // Firestore-first: use cache if available
    if (_caches[key] !== null && _caches[key] !== undefined) {
        return _caches[key] as T[];
    }
    // Fallback to localStorage
    try {
        const data = localStorage.getItem(key);
        return data ? JSON.parse(data) : [];
    } catch { return []; }
}

function saveLocalData<T>(key: string, data: T[]) {
    // Update cache immediately
    _caches[key] = data as any[];
    localStorage.setItem(key, JSON.stringify(data));
    // Write to Firestore (source of truth)
    const fsCollection = FS_COLLECTIONS[key];
    if (fsCollection && Array.isArray(data)) {
        const items = (data as any[]).map((item: any) => ({
            id: item.id || crypto.randomUUID(),
            data: { ...item },
        }));
        firestoreDataService.batchWrite(fsCollection, items).catch((err) => {
            console.error(`❌ [Connect] Batch write failed for ${fsCollection}:`, err);
        });
    }
}

function generateId(): string {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// ═══════════════════════════════════════════════
// CONNECT SERVICE
// ═══════════════════════════════════════════════

export const connectService = {

    // ——— CHAT MESSAGES ———

    getMessages(channelId?: string): ChatMessage[] {
        let messages = getLocalData<ChatMessage>(CONNECT_KEYS.messages);
        if (channelId) {
            messages = messages.filter(m => m.channelId === channelId);
        }
        return messages.sort((a, b) => {
            const dateA = a.createdAt instanceof Date ? a.createdAt.getTime() : new Date(a.createdAt as any).getTime();
            const dateB = b.createdAt instanceof Date ? b.createdAt.getTime() : new Date(b.createdAt as any).getTime();
            return dateA - dateB;
        });
    },

    sendMessage(message: Omit<ChatMessage, 'id' | 'createdAt' | 'readBy' | 'emailSent'>): ChatMessage {
        const messages = getLocalData<ChatMessage>(CONNECT_KEYS.messages);
        const newMsg: ChatMessage = {
            ...message,
            id: generateId(),
            readBy: [message.senderId],
            emailSent: false,
            createdAt: new Date(),
        };
        messages.push(newMsg);
        saveLocalData(CONNECT_KEYS.messages, messages);
        return newMsg;
    },

    markAsRead(messageId: string, userId: string) {
        const messages = getLocalData<ChatMessage>(CONNECT_KEYS.messages);
        const msg = messages.find(m => m.id === messageId);
        if (msg && !msg.readBy.includes(userId)) {
            msg.readBy.push(userId);
            saveLocalData(CONNECT_KEYS.messages, messages);
        }
    },

    deleteMessage(messageId: string) {
        const messages = getLocalData<ChatMessage>(CONNECT_KEYS.messages).filter(m => m.id !== messageId);
        saveLocalData(CONNECT_KEYS.messages, messages);
    },

    getUnreadCount(userId: string): number {
        const messages = getLocalData<ChatMessage>(CONNECT_KEYS.messages);
        return messages.filter(m => !m.readBy.includes(userId)).length;
    },

    // ——— INTERNAL MAIL ———

    getMails(): InternalMailMessage[] {
        return getLocalData<InternalMailMessage>(CONNECT_KEYS.mail)
            .sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime());
    },

    sendMail(mail: Omit<InternalMailMessage, 'id' | 'createdAt' | 'status' | 'externalEmailSent' | 'replies' | 'starred'>): InternalMailMessage {
        const mails = getLocalData<InternalMailMessage>(CONNECT_KEYS.mail);
        const newMail: InternalMailMessage = {
            ...mail,
            id: generateId(),
            status: 'sent',
            externalEmailSent: false,
            replies: [],
            starred: false,
            createdAt: new Date(),
        };
        mails.push(newMail);
        saveLocalData(CONNECT_KEYS.mail, mails);
        return newMail;
    },

    replyToMail(mailId: string, reply: Omit<MailReply, 'createdAt'>) {
        const mails = getLocalData<InternalMailMessage>(CONNECT_KEYS.mail);
        const mail = mails.find(m => m.id === mailId);
        if (mail) {
            mail.replies.push({ ...reply, createdAt: new Date() });
            mail.status = 'replied';
            saveLocalData(CONNECT_KEYS.mail, mails);
        }
    },

    toggleStarMail(mailId: string) {
        const mails = getLocalData<InternalMailMessage>(CONNECT_KEYS.mail);
        const mail = mails.find(m => m.id === mailId);
        if (mail) {
            mail.starred = !mail.starred;
            saveLocalData(CONNECT_KEYS.mail, mails);
        }
    },

    getUnreadMailCount(userId: string): number {
        const mails = getLocalData<InternalMailMessage>(CONNECT_KEYS.mail);
        return mails.filter(m => m.status === 'sent' && m.to.some(t => t.id === userId)).length;
    },

    // ——— PROJECT GALLERY ———

    getPhotos(): ProjectPhoto[] {
        return getLocalData<ProjectPhoto>(CONNECT_KEYS.gallery)
            .sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime());
    },

    async addPhoto(
        file: File,
        metadata: Omit<ProjectPhoto, 'id' | 'createdAt' | 'originalUrl' | 'thumbnailUrl' | 'originalSize' | 'compressedSize'>
    ): Promise<ProjectPhoto> {
        // Compress image
        const { blob, originalSize, compressedSize } = await compressImage(file);
        const thumbnailBlob = await createThumbnail(file);

        // Convert to data URL for local storage
        const originalUrl = await blobToDataUrl(blob);
        const thumbnailUrl = await blobToDataUrl(thumbnailBlob);

        const photos = getLocalData<ProjectPhoto>(CONNECT_KEYS.gallery);
        const newPhoto: ProjectPhoto = {
            ...metadata,
            id: generateId(),
            originalUrl,
            thumbnailUrl,
            originalSize,
            compressedSize,
            createdAt: new Date(),
        };
        photos.push(newPhoto);
        saveLocalData(CONNECT_KEYS.gallery, photos);

        // Update storage usage
        this.updateStorageUsed(compressedSize + thumbnailBlob.size);

        return newPhoto;
    },

    deletePhoto(photoId: string) {
        const photos = getLocalData<ProjectPhoto>(CONNECT_KEYS.gallery);
        const photo = photos.find(p => p.id === photoId);
        if (photo) {
            this.updateStorageUsed(-(photo.compressedSize || 0));
        }
        saveLocalData(CONNECT_KEYS.gallery, photos.filter(p => p.id !== photoId));
    },

    // ——— DELIVERY FORMS ———

    getForms(): DeliveryForm[] {
        return getLocalData<DeliveryForm>(CONNECT_KEYS.forms)
            .sort((a, b) => new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime());
    },

    createForm(form: Omit<DeliveryForm, 'id' | 'createdAt' | 'formNumber'>): DeliveryForm {
        const forms = getLocalData<DeliveryForm>(CONNECT_KEYS.forms);
        const prefix = form.type === 'material_receipt' ? 'MAT' :
                       form.type === 'work_delivery' ? 'WRK' :
                       form.type === 'quality_check' ? 'QC' : 'MTG';
        const formNumber = `${prefix}-${new Date().getFullYear()}-${String(forms.length + 1).padStart(4, '0')}`;

        const newForm: DeliveryForm = {
            ...form,
            id: generateId(),
            formNumber,
            createdAt: new Date(),
        };
        forms.push(newForm);
        saveLocalData(CONNECT_KEYS.forms, forms);
        return newForm;
    },

    updateForm(formId: string, updates: Partial<DeliveryForm>) {
        const forms = getLocalData<DeliveryForm>(CONNECT_KEYS.forms);
        const idx = forms.findIndex(f => f.id === formId);
        if (idx >= 0) {
            forms[idx] = { ...forms[idx], ...updates, updatedAt: new Date() as any };
            saveLocalData(CONNECT_KEYS.forms, forms);
        }
    },

    signForm(formId: string, signature: FormSignature) {
        const forms = getLocalData<DeliveryForm>(CONNECT_KEYS.forms);
        const form = forms.find(f => f.id === formId);
        if (form) {
            const sigIdx = form.signatures.findIndex(s => s.role === signature.role);
            if (sigIdx >= 0) {
                form.signatures[sigIdx] = { ...signature, status: 'signed', signedAt: new Date() as any };
            } else {
                form.signatures.push({ ...signature, status: 'signed', signedAt: new Date() as any });
            }
            // Auto-approve if all signatures are complete
            if (form.signatures.every(s => s.status === 'signed')) {
                form.status = 'approved';
            }
            saveLocalData(CONNECT_KEYS.forms, forms);
        }
    },

    deleteForm(formId: string) {
        const forms = getLocalData<DeliveryForm>(CONNECT_KEYS.forms).filter(f => f.id !== formId);
        saveLocalData(CONNECT_KEYS.forms, forms);
        // Also delete from Firestore directly
        firestoreDataService.deleteDocument('connect_forms', formId).catch(() => {});
    },

    getPendingFormsCount(): number {
        const forms = getLocalData<DeliveryForm>(CONNECT_KEYS.forms);
        return forms.filter(f => f.status === 'pending').length;
    },

    // ——— SMART NOTES ———

    getNotes(): SmartNote[] {
        return getLocalData<SmartNote>(CONNECT_KEYS.notes)
            .sort((a, b) => {
                // Urgent first, then by date
                if (a.priority === 'urgent' && b.priority !== 'urgent') return -1;
                if (b.priority === 'urgent' && a.priority !== 'urgent') return 1;
                return new Date(b.createdAt as any).getTime() - new Date(a.createdAt as any).getTime();
            });
    },

    addNote(note: Omit<SmartNote, 'id' | 'createdAt' | 'completed'>): SmartNote {
        const notes = getLocalData<SmartNote>(CONNECT_KEYS.notes);
        const newNote: SmartNote = {
            ...note,
            id: generateId(),
            completed: false,
            createdAt: new Date(),
        };
        notes.push(newNote);
        saveLocalData(CONNECT_KEYS.notes, notes);
        return newNote;
    },

    updateNote(noteId: string, updates: Partial<SmartNote>) {
        const notes = getLocalData<SmartNote>(CONNECT_KEYS.notes);
        const idx = notes.findIndex(n => n.id === noteId);
        if (idx >= 0) {
            notes[idx] = { ...notes[idx], ...updates };
            saveLocalData(CONNECT_KEYS.notes, notes);
        }
    },

    deleteNote(noteId: string) {
        const notes = getLocalData<SmartNote>(CONNECT_KEYS.notes).filter(n => n.id !== noteId);
        saveLocalData(CONNECT_KEYS.notes, notes);
    },

    toggleNoteComplete(noteId: string) {
        const notes = getLocalData<SmartNote>(CONNECT_KEYS.notes);
        const note = notes.find(n => n.id === noteId);
        if (note) {
            note.completed = !note.completed;
            saveLocalData(CONNECT_KEYS.notes, notes);
        }
    },

    // ——— STORAGE ———

    getStorageUsed(): number {
        try {
            return parseInt(localStorage.getItem(CONNECT_KEYS.storage) || '0', 10);
        } catch { return 0; }
    },

    updateStorageUsed(deltaBytes: number) {
        const current = this.getStorageUsed();
        const updated = Math.max(0, current + deltaBytes);
        localStorage.setItem(CONNECT_KEYS.storage, String(updated));
    },

    // ——— NOTIFICATION SETTINGS ———

    getEmailSettings(): { email: string; enabled: boolean; onChat: boolean; onMail: boolean; onApproval: boolean; onForm: boolean; onNote: boolean; frequency: 'instant' | 'hourly' | 'daily' } {
        try {
            const data = localStorage.getItem(CONNECT_KEYS.settings);
            return data ? JSON.parse(data) : {
                email: '',
                enabled: false,
                onChat: true,
                onMail: true,
                onApproval: true,
                onForm: true,
                onNote: false,
                frequency: 'instant',
            };
        } catch {
            return { email: '', enabled: false, onChat: true, onMail: true, onApproval: true, onForm: true, onNote: false, frequency: 'instant' };
        }
    },

    saveEmailSettings(settings: any) {
        localStorage.setItem(CONNECT_KEYS.settings, JSON.stringify(settings));
    },

    // ——— ACTIVITY FEED ———

    getRecentActivity(limit: number = 10): { type: string; title: string; description: string; time: Date; icon: string }[] {
        const activities: any[] = [];

        // Recent messages
        const messages = this.getMessages().slice(-5);
        messages.forEach(m => {
            activities.push({
                type: 'chat',
                title: m.senderName,
                description: m.content.substring(0, 60) + (m.content.length > 60 ? '...' : ''),
                time: new Date(m.createdAt as any),
                icon: '💬',
            });
        });

        // Recent mails
        const mails = this.getMails().slice(0, 3);
        mails.forEach(m => {
            activities.push({
                type: 'mail',
                title: m.subject,
                description: `${m.from.name} → ${m.to.map(t => t.name).join(', ')}`,
                time: new Date(m.createdAt as any),
                icon: '📧',
            });
        });

        // Recent forms
        const forms = this.getForms().slice(0, 3);
        forms.forEach(f => {
            activities.push({
                type: 'form',
                title: f.title,
                description: `${f.formNumber} — ${f.status}`,
                time: new Date(f.createdAt as any),
                icon: '📋',
            });
        });

        // Recent photos
        const photos = this.getPhotos().slice(0, 3);
        photos.forEach(p => {
            activities.push({
                type: 'gallery',
                title: p.description || 'صورة جديدة',
                description: `${p.uploadedBy.name} — ${formatStorageSize(p.compressedSize)}`,
                time: new Date(p.createdAt as any),
                icon: '📸',
            });
        });

        // Sort by time, most recent first
        return activities
            .sort((a, b) => b.time.getTime() - a.time.getTime())
            .slice(0, limit);
    },

    // ——— SAMPLE DATA ———

    initializeSampleData() {
        if (getLocalData(CONNECT_KEYS.messages).length > 0) return;

        // Sample messages
        const sampleMessages: ChatMessage[] = [
            {
                id: 'msg_1',
                senderId: 'eng_1',
                senderName: 'أحمد المهندس',
                senderRole: 'engineer',
                content: 'تم الانتهاء من صب خرسانة الدور الأول بنجاح. الجودة ممتازة والمقاسات مطابقة للمخططات.',
                type: 'text',
                category: 'general',
                linkedItemCode: '11.01',
                attachments: [],
                readBy: ['eng_1'],
                emailSent: false,
                createdAt: new Date(Date.now() - 3600000),
            },
            {
                id: 'msg_2',
                senderId: 'sup_1',
                senderName: 'مورد الحديد — مصنع الشرقية',
                senderRole: 'supplier',
                content: 'شحنة حديد التسليح 16مم جاهزة للتوريد غداً الساعة 8 صباحاً. الكمية: 5 طن.',
                type: 'text',
                category: 'general',
                linkedItemCode: '11.02',
                attachments: [],
                readBy: ['sup_1'],
                emailSent: false,
                createdAt: new Date(Date.now() - 1800000),
            },
            {
                id: 'msg_3',
                senderId: 'mgr_1',
                senderName: 'المدير',
                senderRole: 'contractor',
                content: 'ممتاز أحمد. يرجى إرسال صور التسليح قبل الصب للتوثيق.',
                type: 'text',
                category: 'general',
                replyTo: 'msg_1',
                replyToPreview: 'تم الانتهاء من صب خرسانة...',
                attachments: [],
                readBy: ['mgr_1', 'eng_1'],
                emailSent: false,
                createdAt: new Date(Date.now() - 900000),
            },
        ];
        saveLocalData(CONNECT_KEYS.messages, sampleMessages);

        // Sample forms
        const sampleForms: DeliveryForm[] = [
            {
                id: 'form_1',
                type: 'material_receipt',
                formNumber: 'MAT-2026-0001',
                title: 'استلام حديد تسليح — الدور الأول',
                status: 'pending',
                createdBy: { id: 'eng_1', name: 'أحمد المهندس', role: 'engineer' },
                projectName: 'فيلا الرياض — حي النرجس',
                data: {
                    supplier: 'مصنع الشرقية للحديد',
                    materials: [
                        { name: 'حديد 16مم', quantity: '5 طن', condition: 'ممتاز' },
                        { name: 'حديد 12مم', quantity: '3 طن', condition: 'ممتاز' },
                        { name: 'حديد 8مم', quantity: '2 طن', condition: 'عيوب سطحية' },
                    ],
                    notes: 'حديد 8مم فيه عيوب سطحية بسيطة — مقبول مع التحفظ',
                },
                photos: [],
                signatures: [
                    { role: 'المستلم', name: 'أحمد المهندس', status: 'signed', signedAt: new Date() },
                    { role: 'المورد', name: 'خالد — مصنع الشرقية', status: 'signed', signedAt: new Date() },
                    { role: 'مدير المشروع', name: '', status: 'pending' },
                ],
                linkedItemCodes: ['11.02'],
                createdAt: new Date(Date.now() - 7200000),
            },
        ];
        saveLocalData(CONNECT_KEYS.forms, sampleForms);

        // Sample notes
        const sampleNotes: SmartNote[] = [
            {
                id: 'note_1',
                createdBy: { id: 'mgr_1', name: 'المدير', role: 'contractor' },
                content: 'متابعة: التأكد من جدول توريد البلاط الأسبوع القادم. التواصل مع مورد السيراميك.',
                priority: 'important',
                sharedWith: ['eng_1'],
                attachments: [],
                completed: false,
                createdAt: new Date(Date.now() - 86400000),
            },
        ];
        saveLocalData(CONNECT_KEYS.notes, sampleNotes);
    },
};

// ═══════════════════════════════════════════════
// UTILITY
// ═══════════════════════════════════════════════

function blobToDataUrl(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = () => reject(new Error('Failed to convert blob'));
        reader.readAsDataURL(blob);
    });
}

/**
 * Format time for chat display
 */
export function formatChatTime(date: Date | Timestamp | any): string {
    const d = date instanceof Date ? date : new Date(date);
    const now = new Date();
    const diff = now.getTime() - d.getTime();

    if (diff < 60000) return 'الآن';
    if (diff < 3600000) return `قبل ${Math.floor(diff / 60000)} دقيقة`;
    if (diff < 86400000) {
        return d.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    }
    if (diff < 604800000) {
        return d.toLocaleDateString('ar-SA', { weekday: 'long' });
    }
    return d.toLocaleDateString('ar-SA', { year: 'numeric', month: 'short', day: 'numeric' });
}
