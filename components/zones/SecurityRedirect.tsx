/**
 * Security Redirect — صفحة إعادة التوجيه الأمني
 * 403 Forbidden page with Arba branding
 * 
 * Shown when a user attempts to access a zone they don't have permission for.
 */

import React from 'react';
import { ZoneType } from '../../services/projectTypes';

interface SecurityRedirectProps {
    language: 'ar' | 'en';
    attemptedZone: ZoneType;
    onGoBack?: () => void;
}

const SecurityRedirect: React.FC<SecurityRedirectProps> = ({ language, attemptedZone, onGoBack }) => {
    const isAr = language === 'ar';

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950/20 to-slate-950 flex items-center justify-center p-6" dir={isAr ? 'rtl' : 'ltr'}>
            <div className="max-w-md w-full text-center">
                {/* Shield icon with pulse */}
                <div className="relative mx-auto mb-8 w-24 h-24">
                    <div className="absolute inset-0 bg-red-500/10 rounded-full animate-ping" />
                    <div className="relative w-24 h-24 bg-gradient-to-br from-red-500/20 to-red-600/20 rounded-full flex items-center justify-center border-2 border-red-500/30">
                        <span className="text-5xl">🛡️</span>
                    </div>
                </div>

                {/* Error code */}
                <div className="mb-4">
                    <span className="text-8xl font-black bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent">
                        403
                    </span>
                </div>

                {/* Title */}
                <h1 className="text-2xl font-bold text-white mb-3">
                    {isAr ? 'وصول غير مصرح' : 'Unauthorized Access'}
                </h1>

                {/* Description */}
                <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                    {isAr
                        ? `ليس لديك صلاحية الوصول إلى ${attemptedZone === 'A' ? 'مساحة عمل الفريق التقني' : 'بوابة العميل'}. هذه المحاولة تم تسجيلها في سجل الأمان.`
                        : `You don't have permission to access the ${attemptedZone === 'A' ? 'Employee Workspace' : 'Client Portal'}. This attempt has been logged.`
                    }
                </p>

                {/* Security notice */}
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 justify-center mb-2">
                        <span className="text-red-400 text-sm">🔒</span>
                        <span className="text-red-400 text-xs font-bold uppercase tracking-wider">
                            {isAr ? 'تنبيه أمني' : 'Security Notice'}
                        </span>
                    </div>
                    <p className="text-red-300/70 text-xs">
                        {isAr
                            ? 'تم تسجيل هذه المحاولة تلقائياً وسيتم مراجعتها من فريق الأمان.'
                            : 'This attempt has been automatically logged and will be reviewed by the security team.'
                        }
                    </p>
                </div>

                {/* Action button */}
                {onGoBack ? (
                    <button
                        onClick={onGoBack}
                        className="px-6 py-3 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-all border border-slate-700"
                    >
                        {isAr ? 'العودة للصفحة الرئيسية' : 'Return to Home'}
                    </button>
                ) : (
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 rounded-xl bg-slate-800 text-white font-medium hover:bg-slate-700 transition-all border border-slate-700"
                    >
                        {isAr ? 'إعادة تحميل الصفحة' : 'Reload Page'}
                    </button>
                )}

                {/* Arba branding */}
                <div className="mt-10 flex items-center justify-center gap-2 opacity-40">
                    <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-black text-[10px]">
                        A
                    </div>
                    <span className="text-slate-500 text-xs">Arba Pricing Security</span>
                </div>
            </div>
        </div>
    );
};

export default SecurityRedirect;
