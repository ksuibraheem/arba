/**
 * RBAC Service — خدمة التحكم بالأدوار والصلاحيات
 * Role-Based Access Control for Arba SaaS
 */

import { db } from '../firebase/config';
import {
    doc, setDoc, getDoc, updateDoc,
    serverTimestamp, Timestamp, arrayUnion, arrayRemove
} from 'firebase/firestore';
import {
    ArbaUserRole, UserRole, ROLE_PERMISSIONS, PERMISSIONS, generateId
} from './projectTypes';

const ROLES_COL = 'userRoles';

// =================== ROLE MANAGEMENT ===================

export async function getUserRole(uid: string): Promise<ArbaUserRole | null> {
    const snap = await getDoc(doc(db, ROLES_COL, uid));
    if (snap.exists()) {
        return snap.data() as ArbaUserRole;
    }
    return null;
}

export async function setUserRole(
    uid: string,
    role: UserRole,
    displayName: string,
    email: string,
    companyId: string = 'arba_default'
): Promise<void> {
    const userRole: ArbaUserRole = {
        uid,
        role,
        companyId,
        displayName,
        email,
        assignedProjectIds: [],
        permissions: ROLE_PERMISSIONS[role],
        createdAt: serverTimestamp() as unknown as Timestamp,
        updatedAt: serverTimestamp() as unknown as Timestamp,
    };
    await setDoc(doc(db, ROLES_COL, uid), userRole, { merge: true });
}

export async function updateUserRole(uid: string, role: UserRole): Promise<void> {
    await updateDoc(doc(db, ROLES_COL, uid), {
        role,
        permissions: ROLE_PERMISSIONS[role],
        updatedAt: serverTimestamp(),
    });
}

// =================== PERMISSION CHECKS ===================

export async function hasPermission(uid: string, permission: string): Promise<boolean> {
    const userRole = await getUserRole(uid);
    if (!userRole) return false;
    return userRole.permissions.includes(permission);
}

export async function canAccessProject(uid: string, projectId: string): Promise<boolean> {
    const userRole = await getUserRole(uid);
    if (!userRole) return false;

    // Admin can access everything
    if (userRole.role === 'admin') return true;

    // QS Engineer: check if assigned
    return userRole.assignedProjectIds.includes(projectId);
}

export async function canCreateProject(uid: string): Promise<boolean> {
    return hasPermission(uid, PERMISSIONS.PROJECTS_CREATE);
}

export async function canViewAllProjects(uid: string): Promise<boolean> {
    return hasPermission(uid, PERMISSIONS.PROJECTS_VIEW_ALL);
}

// =================== PROJECT ASSIGNMENT ===================

export async function assignProjectToUser(projectId: string, engineerUid: string): Promise<void> {
    await updateDoc(doc(db, ROLES_COL, engineerUid), {
        assignedProjectIds: arrayUnion(projectId),
        updatedAt: serverTimestamp(),
    });
}

export async function unassignProjectFromUser(projectId: string, engineerUid: string): Promise<void> {
    await updateDoc(doc(db, ROLES_COL, engineerUid), {
        assignedProjectIds: arrayRemove(projectId),
        updatedAt: serverTimestamp(),
    });
}

// =================== INITIALIZATION ===================

/** Super Admin email — gets 'superadmin' role automatically */
const SUPER_ADMIN_EMAIL = 'info@arba-sys.com';

/**
 * Ensure a user has a role record. If not, create a default one.
 * Called on first login.
 */
export async function ensureUserRole(
    uid: string,
    displayName: string,
    email: string
): Promise<ArbaUserRole> {
    let role = await getUserRole(uid);
    if (!role) {
        // Super Admin auto-assignment
        const isSuperAdmin = email.toLowerCase() === SUPER_ADMIN_EMAIL.toLowerCase();
        const defaultRole: UserRole = isSuperAdmin ? 'superadmin' : 'qs_engineer';
        await setUserRole(uid, defaultRole, displayName, email);
        role = await getUserRole(uid);
    }
    return role!;
}

/**
 * Get effective role string for the current user.
 * Returns 'admin' | 'qs_engineer' | 'viewer'
 */
export async function getEffectiveRole(uid: string): Promise<UserRole> {
    const role = await getUserRole(uid);
    return role?.role || 'viewer';
}
