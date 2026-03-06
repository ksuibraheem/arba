/**
 * Project Service — خدمة إدارة المشاريع
 * Firestore CRUD for ArbaProject collection
 */

import { db } from '../firebase/config';
import {
    collection, doc, setDoc, getDoc, getDocs,
    updateDoc, deleteDoc, query, where, orderBy,
    serverTimestamp, Timestamp, limit
} from 'firebase/firestore';
import {
    ArbaProject, ArbaQuote, DashboardStats, SecurityAlert,
    ProjectStatus, UserRole, generateId
} from './projectTypes';

const PROJECTS_COL = 'projects';
const QUOTES_COL = 'quotes';
const ALERTS_COL = 'securityAlerts';
const CLIENTS_COL = 'clients';

// =================== PROJECT CRUD ===================

export async function createProject(data: Partial<ArbaProject>): Promise<string> {
    const id = data.id || generateId('proj');
    const project: ArbaProject = {
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
        createdAt: serverTimestamp() as unknown as Timestamp,
        updatedAt: serverTimestamp() as unknown as Timestamp,
    };

    await setDoc(doc(db, PROJECTS_COL, id), project);
    return id;
}

export async function getProject(id: string): Promise<ArbaProject | null> {
    const snap = await getDoc(doc(db, PROJECTS_COL, id));
    return snap.exists() ? ({ ...snap.data(), id: snap.id } as ArbaProject) : null;
}

export async function updateProject(id: string, updates: Partial<ArbaProject>): Promise<void> {
    await updateDoc(doc(db, PROJECTS_COL, id), {
        ...updates,
        updatedAt: serverTimestamp(),
    });
}

export async function deleteProject(id: string): Promise<void> {
    await deleteDoc(doc(db, PROJECTS_COL, id));
}

// =================== PROJECT QUERIES ===================

/**
 * Get projects for a user based on their role.
 * Admin sees all, QS engineer sees only owned/assigned.
 */
export async function getUserProjects(
    userId: string,
    role: UserRole
): Promise<ArbaProject[]> {
    let q;

    if (role === 'admin') {
        q = query(
            collection(db, PROJECTS_COL),
            orderBy('updatedAt', 'desc')
        );
    } else {
        // QS Engineer & Viewer: only see projects they own or are assigned to
        q = query(
            collection(db, PROJECTS_COL),
            where('assignedTo', 'array-contains', userId),
            orderBy('updatedAt', 'desc')
        );
    }

    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as ArbaProject));
}

export async function getProjectsByStatus(status: ProjectStatus): Promise<ArbaProject[]> {
    const q = query(
        collection(db, PROJECTS_COL),
        where('status', '==', status),
        orderBy('updatedAt', 'desc')
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ ...d.data(), id: d.id } as ArbaProject));
}

// =================== QUOTE LINKING ===================

export async function linkQuoteToProject(
    projectId: string,
    quoteData: Omit<ArbaQuote, 'id'>
): Promise<string> {
    const id = generateId('qt');
    const quote: ArbaQuote = { ...quoteData, id };

    await setDoc(doc(db, QUOTES_COL, id), quote);
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
        alerts = alertSnap.docs.map(d => ({ ...d.data(), id: d.id } as SecurityAlert));
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
