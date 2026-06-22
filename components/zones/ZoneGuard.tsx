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
import { Language } from '../../types';

interface ZoneGuardProps {
    requiredZone: ZoneType;
    children: React.ReactNode;
    language: Language;
    isDemoMode?: boolean;
}

const ZoneGuard: React.FC<ZoneGuardProps> = ({ requiredZone, children, language, isDemoMode }) => {
    const { canAccessZone, uid, displayName, isLoading, isAuthenticated } = useRole();
    const hasLoggedViolation = useRef(false);
    const t = (ar: string, en: string) => { const m: Record<string, string> = { ar, en, fr: en, zh: en }; return m[language] || en; };

    // In demo mode, show content with demo restriction banner
    if (isDemoMode) {
        return (
            <div className="relative">
                <div className="pointer-events-none opacity-75">
                    {children}
                </div>
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 bg-amber-500/90 backdrop-blur-sm text-black px-6 py-3 rounded-full shadow-lg flex items-center gap-2 text-sm font-medium">
                    <span>🔒</span>
                    <span>{t('وضع المعاينة — سجّل للوصول الكامل', 'Preview Mode — Sign up for full access')}</span>
                </div>
            </div>
        );
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
                description: t(
                    `محاولة وصول غير مصرح: ${displayName} حاول الدخول إلى المنطقة ${requiredZone}`,
                    `Unauthorized access attempt: ${displayName} tried to access Zone ${requiredZone}`
                ),
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
                        {t('جارٍ التحقق من الصلاحيات...', 'Verifying access...')}
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
