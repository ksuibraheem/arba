/**
 * Role Context v2 — سياق الأدوار العامل (مع التخزين المؤقت)
 * Global React Context for user role state management
 * 
 * Provides: uid, role, zone, permissions to all components
 * Security: Auto-redirects users accessing wrong zone
 * 
 * v2 Upgrade: LocalStorage caching with 30-minute TTL
 * 🏰 THE FORTRESS — Performance + Security
 */

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { UserRole, ZoneType, ROLE_ZONE, ROLE_PERMISSIONS } from '../services/projectTypes';
import * as rbacService from '../services/rbacService';

// =================== CACHE CONFIG ===================

const ROLE_CACHE_KEY = 'arba_role_cache';
const ROLE_CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutes

interface CachedRoleData {
    uid: string;
    role: UserRole;
    displayName: string;
    email: string;
    cachedAt: number;
}

function getCachedRole(uid: string): CachedRoleData | null {
    try {
        const raw = localStorage.getItem(ROLE_CACHE_KEY);
        if (!raw) return null;
        const cached: CachedRoleData = JSON.parse(raw);
        // Validate: same user + not expired
        if (cached.uid !== uid) return null;
        if (Date.now() - cached.cachedAt > ROLE_CACHE_TTL_MS) {
            localStorage.removeItem(ROLE_CACHE_KEY);
            return null;
        }
        return cached;
    } catch {
        localStorage.removeItem(ROLE_CACHE_KEY);
        return null;
    }
}

function setCachedRole(uid: string, role: UserRole, displayName: string, email: string): void {
    try {
        const data: CachedRoleData = { uid, role, displayName, email, cachedAt: Date.now() };
        localStorage.setItem(ROLE_CACHE_KEY, JSON.stringify(data));
    } catch {
        // Silently fail if localStorage is full or unavailable
    }
}

function clearCachedRole(): void {
    try {
        localStorage.removeItem(ROLE_CACHE_KEY);
    } catch {
        // Silently fail
    }
}

// =================== TYPES ===================

interface RoleState {
    uid: string;
    role: UserRole;
    zone: ZoneType;
    permissions: string[];
    displayName: string;
    email: string;
    isLoading: boolean;
    isAuthenticated: boolean;
}

interface RoleContextValue extends RoleState {
    /** Check if user has a specific permission */
    hasPermission: (permission: string) => boolean;
    /** Check if user can access a specific zone */
    canAccessZone: (zone: ZoneType) => boolean;
    /** Refresh role from Firestore (bypasses cache) */
    refreshRole: () => Promise<void>;
    /** Set role data (used during login) */
    setRoleData: (uid: string, displayName: string, email: string) => Promise<void>;
    /** Clear role data (used during logout) */
    clearRole: () => void;
}

const DEFAULT_STATE: RoleState = {
    uid: '',
    role: 'viewer',
    zone: 'B',
    permissions: [],
    displayName: '',
    email: '',
    isLoading: true,
    isAuthenticated: false,
};

// =================== CONTEXT ===================

const RoleContext = createContext<RoleContextValue>({
    ...DEFAULT_STATE,
    hasPermission: () => false,
    canAccessZone: () => false,
    refreshRole: async () => { },
    setRoleData: async () => { },
    clearRole: () => { },
});

// =================== PROVIDER ===================

interface RoleProviderProps {
    children: ReactNode;
}

export const RoleProvider: React.FC<RoleProviderProps> = ({ children }) => {
    const [state, setState] = useState<RoleState>(DEFAULT_STATE);

    const applyRole = useCallback((uid: string, role: UserRole, displayName: string, email: string) => {
        const zone = ROLE_ZONE[role] || 'B';
        const permissions = ROLE_PERMISSIONS[role] || [];
        setState({
            uid,
            role,
            zone,
            permissions,
            displayName,
            email,
            isLoading: false,
            isAuthenticated: true,
        });
    }, []);

    const loadRole = useCallback(async (uid: string, displayName: string, email: string, bypassCache = false) => {
        setState(prev => ({ ...prev, isLoading: true }));

        // Check LocalStorage cache first (unless bypassing)
        if (!bypassCache) {
            const cached = getCachedRole(uid);
            if (cached) {
                console.log('[RoleContext] Using cached role:', cached.role);
                applyRole(uid, cached.role, cached.displayName || displayName, cached.email || email);
                return;
            }
        }

        try {
            const roleData = await rbacService.ensureUserRole(uid, displayName, email);
            const role = roleData.role;

            // Cache the result
            setCachedRole(uid, role, roleData.displayName || displayName, roleData.email || email);
            applyRole(uid, role, roleData.displayName || displayName, roleData.email || email);
        } catch (err) {
            console.error('Role load error:', err);
            // Default to viewer on error (don't cache errors)
            applyRole(uid, 'viewer', displayName, email);
        }
    }, [applyRole]);

    const hasPermission = useCallback((permission: string): boolean => {
        return state.permissions.includes(permission);
    }, [state.permissions]);

    const canAccessZone = useCallback((zone: ZoneType): boolean => {
        // Admin and SuperAdmin can access both zones
        if (state.role === 'admin' || state.role === 'superadmin') return true;
        return state.zone === zone;
    }, [state.role, state.zone]);

    const refreshRole = useCallback(async () => {
        if (state.uid) {
            // Bypass cache on manual refresh
            await loadRole(state.uid, state.displayName, state.email, true);
        }
    }, [state.uid, state.displayName, state.email, loadRole]);

    const setRoleData = useCallback(async (uid: string, displayName: string, email: string) => {
        await loadRole(uid, displayName, email);
    }, [loadRole]);

    const clearRole = useCallback(() => {
        clearCachedRole(); // Clear LocalStorage cache on logout
        setState(DEFAULT_STATE);
    }, []);

    const value: RoleContextValue = {
        ...state,
        hasPermission,
        canAccessZone,
        refreshRole,
        setRoleData,
        clearRole,
    };

    return (
        <RoleContext.Provider value={value}>
            {children}
        </RoleContext.Provider>
    );
};

// =================== HOOK ===================

export function useRole(): RoleContextValue {
    return useContext(RoleContext);
}

export default RoleContext;
