/**
 * ProtectedRoute — Auth Guard Component
 * يمنع الوصول للصفحات المحمية بدون تسجيل دخول
 */

import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { ROUTES } from './routes';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
    const { user, isLoading, isDemoMode } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-900">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    if (!user && !isDemoMode) {
        return <Navigate to={ROUTES.LOGIN} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
