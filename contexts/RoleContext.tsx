/**
 * Role Context — سياق الأدوار العامل
 * Global React Context for user role state management
 * 
 * Provides: uid, role, zone, permissions to all components
 * Security: Auto-redirects users accessing wrong zone
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { UserRole, ZoneType, ROLE_ZONE, ROLE_PERMISSIONS } from '../services/projectTypes';
import * as rbacService from '../services/rbacService';

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
    /** Refresh role from Firestore */
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

    const loadRole = useCallback(async (uid: string, displayName: string, email: string) => {
        setState(prev => ({ ...prev, isLoading: true }));
        try {
            const roleData = await rbacService.ensureUserRole(uid, displayName, email);
            const role = roleData.role;
            const zone = ROLE_ZONE[role] || 'B';
            const permissions = ROLE_PERMISSIONS[role] || [];

            setState({
                uid,
                role,
                zone,
                permissions,
                displayName: roleData.displayName || displayName,
                email: roleData.email || email,
                isLoading: false,
                isAuthenticated: true,
            });
        } catch (err) {
            console.error('Role load error:', err);
            // Default to viewer on error
            setState({
                uid,
                role: 'viewer',
                zone: 'B',
                permissions: ROLE_PERMISSIONS.viewer,
                displayName,
                email,
                isLoading: false,
                isAuthenticated: true,
            });
        }
    }, []);

    const hasPermission = useCallback((permission: string): boolean => {
        return state.permissions.includes(permission);
    }, [state.permissions]);

    const canAccessZone = useCallback((zone: ZoneType): boolean => {
        // Admin can access both zones
        if (state.role === 'admin') return true;
        return state.zone === zone;
    }, [state.role, state.zone]);

    const refreshRole = useCallback(async () => {
        if (state.uid) {
            await loadRole(state.uid, state.displayName, state.email);
        }
    }, [state.uid, state.displayName, state.email, loadRole]);

    const setRoleData = useCallback(async (uid: string, displayName: string, email: string) => {
        await loadRole(uid, displayName, email);
    }, [loadRole]);

    const clearRole = useCallback(() => {
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
