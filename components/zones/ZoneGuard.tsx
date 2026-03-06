/**
 * Zone Guard — حارس المنطقة
 * Route-level access control component
 * 
 * Wraps zone content and prevents unauthorized access.
 * Logs violations as SecurityAlerts.
 */

import React, { useEffect, useRef } from 'react';
import { useRole } from '../../contexts/RoleContext';
import { ZoneType } from '../../services/projectTypes';
import { createSecurityAlert } from '../../services/projectService';
import SecurityRedirect from './SecurityRedirect';

interface ZoneGuardProps {
    requiredZone: ZoneType;
    children: React.ReactNode;
    language: 'ar' | 'en';
    isDemoMode?: boolean;
}

const ZoneGuard: React.FC<ZoneGuardProps> = ({ requiredZone, children, language, isDemoMode }) => {
    const { canAccessZone, uid, displayName, isLoading, isAuthenticated } = useRole();
    const hasLoggedViolation = useRef(false);

    // In demo mode, always grant access (no Firestore role data)
    if (isDemoMode) {
        return <>{children}</>;
    }

    const hasAccess = canAccessZone(requiredZone);

    // Log unauthorized access attempt
    useEffect(() => {
        if (!isLoading && isAuthenticated && !hasAccess && !hasLoggedViolation.current) {
            hasLoggedViolation.current = true;
            createSecurityAlert({
                type: 'unauthorized_access',
                severity: 'critical',
                userId: uid,
                userName: displayName,
                description: language === 'ar'
                    ? `محاولة وصول غير مصرح: ${displayName} حاول الدخول إلى المنطقة ${requiredZone}`
                    : `Unauthorized access attempt: ${displayName} tried to access Zone ${requiredZone}`,
                resolved: false,
                createdAt: new Date(),
            }).catch(err => console.error('Failed to log security alert:', err));
        }
    }, [isLoading, isAuthenticated, hasAccess, uid, displayName, requiredZone, language]);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-12 h-12 border-4 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-slate-400 text-sm">
                        {language === 'ar' ? 'جارٍ التحقق من الصلاحيات...' : 'Verifying access...'}
                    </p>
                </div>
            </div>
        );
    }

    // Access denied
    if (!hasAccess) {
        return <SecurityRedirect language={language} attemptedZone={requiredZone} />;
    }

    // Access granted
    return <>{children}</>;
};

export default ZoneGuard;
