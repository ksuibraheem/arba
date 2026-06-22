/**
 * Project Service — خدمة إدارة المشاريع
 * Firestore CRUD for ArbaProject collection
 */

import { db } from '../firebase/config';
import {
    collection, doc, setDoc, getDoc, getDocs,
    updateDoc, deleteDoc, query, where, orderBy,
    serverTimestamp, limit
} from 'firebase/firestore';
import {
    ArbaProject, ArbaQuote, DashboardStats, SecurityAlert,
    ProjectStatus, UserRole, generateId
} from './projectTypes';
import { offlineBufferService } from './offlineBufferService';

const PROJECTS_COL = 'projects';
const QUOTES_COL = 'quotes';
const ALERTS_COL = 'securityAlerts';
const CLIENTS_COL = 'clients';

/** Shared Firestore writer (setDoc+merge) used for both first writes and buffered replays. */
const fsMergeWriter = async (path: string, id: string, data: unknown): Promise<void> => {
    await setDoc(doc(db, path, id), data as Record<string, unknown>, { merge: true });
};

export interface ProjectWriteResult {
    status: 'written' | 'buffered' | 'conflict';
    serverData?: ArbaProject;
}

function toMillis(value: unknown): number {
    if (value && typeof (value as { toMillis?: () => number }).toMillis === 'function') {
        return (value as { toMillis: () => number }).toMillis();
    }
    return 0;
}

// =================== PROJECT CRUD ===================

export async function createProject(data: Partial<ArbaProject>): Promise<string> {
    const id = data.id || generateId('proj');
    // createdAt/updatedAt are NOT serverTimestamp() sentinels here: if offline this
    // object is JSON-buffered and the sentinel would corrupt. They are stamped by
    // safeWrite at the real write/replay moment via serverTimestampFields.
    const project = {
        id,
        ownerId: data.ownerId || '',
        assignedTo: data.assignedTo || [data.ownerId || ''],
        name: data.name || 'مشروع جديد',
        clientId: data.clientId || '',
        projectType: data.projectType || 'villa',
        status: data.status || 'draft',
        location: data.location,
        estimatedValue: data.estimatedValue || 0,
        currency: 'SAR',
        latestQuoteId: undefined,
        quoteCount: 0,
        stateSnapshot: data.stateSnapshot,
        isEditable: data.isEditable ?? true,     // V10: editable by default
    };

    // Offline-resilient: writes now if online, else buffers and auto-syncs later.
    await offlineBufferService.safeWrite(
        PROJECTS_COL, id, project, 'create', fsMergeWriter, ['createdAt', 'updatedAt']
    );
    return id;
}

export async function getProject(id: string): Promise<ArbaProject | null> {
    const snap = await getDoc(doc(db, PROJECTS_COL, id));
    return snap.exists() ? ({ ...snap.data(), id: snap.id } as ArbaProject) : null;
}

/** Backward-compatible update; offline-resilient, no conflict detection. */
export async function updateProject(id: string, updates: Partial<ArbaProject>): Promise<void> {
    await updateProjectChecked(id, updates);
}

/**
 * Conflict-aware update. If baseUpdatedAt (millis of the loaded version) is given
 * and the server copy is newer, the write is refused and { status: 'conflict' } is
 * returned with the fresher server data — no blind last-write-wins. Offline writes
 * are buffered and synced when the connection returns.
 */
export async function updateProjectChecked(
    id: string,
    updates: Partial<ArbaProject>,
    opts: { baseUpdatedAt?: number } = {}
): Promise<ProjectWriteResult> {
    if (opts.baseUpdatedAt && offlineBufferService.isOnline) {
        try {
            const snap = await getDoc(doc(db, PROJECTS_COL, id));
            if (snap.exists()) {
                const serverMs = toMillis(snap.data().updatedAt);
                if (serverMs > opts.baseUpdatedAt) {
                    return {
                        status: 'conflict',
                        serverData: { ...(snap.data() as Record<string, unknown>), id } as ArbaProject,
                    };
                }
            }
        } catch {
            // read failed (offline/flaky) -> fall through and buffer the write
        }
    }

    const clean: Record<string, unknown> = { ...updates };
    delete clean.updatedAt;

    const res = await offlineBufferService.safeWrite(
        PROJECTS_COL, id, clean, 'update', fsMergeWriter, ['updatedAt']
    );
    return { status: res.source === 'firebase' ? 'written' : 'buffered' };
}

export async function deleteProject(id: string): Promise<void> {
    await deleteDoc(doc(db, PROJECTS_COL, id));
}

// =================== PROJECT QUERIES ===================

/**
 * Get projects for a user based on their role.
 * Admin sees all, QS engineer sees only owned/assigned.
 * Clients see ONLY projects where they are explicitly the owner or assigned.
 */
export async function getUserProjects(
    userId: string,
    role: UserRole | 'client'
): Promise<ArbaProject[]> {
    let q;

    if (role === 'admin') {
        q = query(
            collection(db, PROJECTS_COL),
            orderBy('updatedAt', 'desc')
        );
    } else if (role === 'client') {
        // Identity Guard: Clients ONLY see projects they own
        q = query(
            collection(db, PROJECTS_COL),
            where('ownerId', '==', userId),
            orderBy('updatedAt', 'desc')
        );
    } else {
        // QS Engineer: only see projects they own or are assigned to
        q = query(
            collection(db, PROJECTS_COL),
            where('assignedTo', 'array-contains', userId),
            orderBy('updatedAt', 'desc')
        );
    }

    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...(d.data() as Record<string, unknown>), id: d.id } as ArbaProject));
}

export async function getProjectsByStatus(status: ProjectStatus): Promise<ArbaProject[]> {
    const q = query(
        collection(db, PROJECTS_COL),
        where('status', '==', status),
        orderBy('updatedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...(d.data() as Record<string, unknown>), id: d.id } as ArbaProject));
}

// =================== QUOTE LINKING ===================

export async function linkQuoteToProject(
    projectId: string,
    quoteData: Omit<ArbaQuote, 'id'>
): Promise<string> {
    const id = generateId('qt');
    const quote: ArbaQuote = { ...quoteData, id };

    // Offline-resilient quote write.
    await offlineBufferService.safeWrite(QUOTES_COL, id, quote, 'create', fsMergeWriter);
    await updateProject(projectId, {
        latestQuoteId: id,
        quoteCount: (quoteData.version || 1),
        estimatedValue: quoteData.finalPrice,
    });

    return id;
}

export async function getProjectQuotes(projectId: string): Promise<ArbaQuote[]> {
    const q = query(
        collection(db, QUOTES_COL),
        where('projectId', '==', projectId),
        orderBy('generatedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as ArbaQuote));
}

// =================== DASHBOARD STATS ===================

export async function getDashboardStats(
    userId: string,
    role: UserRole
): Promise<DashboardStats> {
    // Get projects
    const projects = await getUserProjects(userId, role);

    // Get security alerts
    let alertsQuery;
    if (role === 'admin') {
        alertsQuery = query(
            collection(db, ALERTS_COL),
            orderBy('createdAt', 'desc'),
            limit(10)
        );
    } else {
        alertsQuery = query(
            collection(db, ALERTS_COL),
            where('userId', '==', userId),
            orderBy('createdAt', 'desc'),
            limit(5)
        );
    }

    let alerts: SecurityAlert[] = [];
    try {
        const alertSnap = await getDocs(alertsQuery);
        alerts = alertSnap.docs.map(d => ({ ...(d.data() as Record<string, unknown>), id: d.id } as SecurityAlert));
    } catch { /* collection may not exist yet */ }

    // Get clients count
    let totalClients = 0;
    try {
        const clientSnap = await getDocs(collection(db, CLIENTS_COL));
        totalClients = clientSnap.size;
    } catch { /* */ }

    // Calculate stats
    const activeProjects = projects.filter(p => p.status === 'active' || p.status === 'draft');
    const totalEstimatedValue = projects.reduce((sum, p) => sum + (p.estimatedValue || 0), 0);
    const securityPurges = alerts.filter(a => a.type === 'purge_complete').length;

    return {
        totalEstimatedValue,
        activeProjects: activeProjects.length,
        totalProjects: projects.length,
        securityPurges,
        totalClients,
        recentProjects: projects.slice(0, 5),
        recentAlerts: alerts.slice(0, 5),
    };
}

// =================== SECURITY ALERTS ===================

export async function createSecurityAlert(alert: Omit<SecurityAlert, 'id'>): Promise<string> {
    const id = generateId('alert');
    await setDoc(doc(db, ALERTS_COL, id), { ...alert, id });
    return id;
}

export async function resolveSecurityAlert(alertId: string, resolvedBy: string): Promise<void> {
    await updateDoc(doc(db, ALERTS_COL, alertId), {
        resolved: true,
        resolvedBy,
        resolvedAt: serverTimestamp(),
    });
}

export async function getSecurityAlerts(limitCount: number = 50): Promise<SecurityAlert[]> {
    const q = query(
        collection(db, ALERTS_COL),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as SecurityAlert));
}

// =================== DEMO SESSION STORAGE ===================
// Ephemeral storage for demo/test mode — scoped to a session ID.
// Employees can read all demo data; only the session owner can write.

const DEMO_COL = 'demoSessions';

export async function saveDemoProject(
    sessionId: string,
    projectData: Partial<ArbaProject> & { clients?: any[] }
): Promise<string> {
    const id = projectData.id || generateId('demo_proj');
    await setDoc(
        doc(db, DEMO_COL, sessionId, 'projects', id),
        {
            ...projectData,
            id,
            sessionId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
        }
    );
    return id;
}

export async function updateDemoProject(
    sessionId: string,
    projectId: string,
    updates: Partial<ArbaProject> & { clients?: any[] }
): Promise<void> {
    await updateDoc(
        doc(db, DEMO_COL, sessionId, 'projects', projectId),
        { ...updates, updatedAt: serverTimestamp() }
    );
}

export async function getDemoProjects(sessionId: string): Promise<ArbaProject[]> {
    const q = query(
        collection(db, DEMO_COL, sessionId, 'projects'),
        orderBy('updatedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...(d.data() as Record<string, unknown>), id: d.id } as ArbaProject));
}
