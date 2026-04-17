/**
 * صفحة دخول فريق المشروع — Premium Construction Gateway
 * Team Login Page — Password entry for project members
 * Theme: Professional Construction Slate (#0F172A)
 */

import React, { useState, useEffect } from 'react';
import { Phone, Lock, ArrowRight, ArrowLeft, Shield, Loader2, AlertCircle, CheckCircle2, Building2, Eye, EyeOff } from 'lucide-react';
import { projectSupplierService, ProjectMember } from '../services/projectSupplierService';
import { Language } from '../types';

interface TeamLoginPageProps {
    language: Language;
    onNavigate: (page: string) => void;
    onTeamLogin: (member: ProjectMember) => void;
}

const TeamLoginPage: React.FC<TeamLoginPageProps> = ({ language, onNavigate, onTeamLogin }) => {
    const isRtl = language === 'ar';
    const t = (ar: string, en: string) => { const map: Record<string, string> = { ar, en, fr: en, zh: en }; return map[language] || en; };
    const Arrow = isRtl ? ArrowRight : ArrowLeft;

    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    // Ensure sample data exists on mount
    useEffect(() => {
        projectSupplierService.initSampleData();
    }, []);

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault();
        const cleanPhone = phone.trim();
        if (!cleanPhone || cleanPhone.length < 10) { setError(t('يرجى إدخال رقم الجوال', 'Please enter phone number')); return; }
        if (!password) { setError(t('يرجى إدخال الرقم السري', 'Please enter password')); return; }
        setError(''); setLoading(true);
        try {
            const result = await projectSupplierService.authenticateTeamMember(cleanPhone, password);
            if (result.success && result.member) {
                setSuccess(true);
                sessionStorage.setItem('arba_team_session', JSON.stringify({
                    memberId: result.member.id, phone: cleanPhone,
                    projectId: result.member.projectId, loginAt: new Date().toISOString(),
                }));
                setTimeout(() => onTeamLogin(result.member!), 800);
            } else {
                setError(result.error || t('رقم الجوال أو الرقم السري غير صحيح', 'Invalid phone or password'));
            }
        } catch { setError(t('حدث خطأ، حاول مرة أخرى', 'An error occurred, try again')); }
        finally { setLoading(false); }
    };

    return (
        <div className="min-h-screen bg-[#0F172A] flex items-center justify-center p-4 sm:p-6 relative overflow-hidden" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Construction-themed background pattern */}
            <div className="absolute inset-0 pointer-events-none">
                <div className="absolute inset-0 opacity-[0.03]" style={{
                    backgroundImage: `linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)`,
                    backgroundSize: '40px 40px'
                }} />
                <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-emerald-500/8 rounded-full blur-[120px]" />
                <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-slate-500/5 rounded-full blur-[100px]" />
            </div>

            <div className="relative w-full max-w-md z-10">
                {/* Back Button */}
                <button
                    onClick={() => onNavigate('login')}
                    className="flex items-center gap-2 text-sm font-medium text-slate-400 hover:text-white transition-colors bg-slate-800/40 px-5 py-2 rounded-xl border border-slate-700/50 backdrop-blur-sm mb-6 hover:border-slate-600/50"
                >
                    <Arrow className="w-4 h-4" />
                    <span>{t('العودة لتسجيل الدخول', 'Back to Login')}</span>
                </button>

                {/* Main Card */}
                <div className="bg-slate-800/30 backdrop-blur-2xl rounded-3xl border border-slate-700/50 p-6 sm:p-8 shadow-2xl shadow-black/30">
                    {/* Logo & Header */}
                    <div className="text-center mb-8">
                        <div className="relative mx-auto w-20 h-20 mb-5">
                            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center shadow-lg shadow-emerald-500/20">
                                <Building2 className="w-10 h-10 text-white" />
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-lg bg-orange-500 flex items-center justify-center shadow-md">
                                <Shield className="w-4 h-4 text-white" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                            {t('بوابة فريق المشروع', 'Project Team Gateway')}
                        </h1>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            {t('ادخل برقم الجوال والرقم السري', 'Enter your phone and password')}
                        </p>
                    </div>

                    {/* Success State */}
                    {success && (
                        <div className="text-center py-10">
                            <div className="w-20 h-20 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4 ring-4 ring-emerald-500/20">
                                <CheckCircle2 className="w-12 h-12 text-emerald-400 animate-bounce" />
                            </div>
                            <p className="text-emerald-400 font-bold text-xl" style={{ fontFamily: 'Tajawal, sans-serif' }}>{t('تم التحقق بنجاح!', 'Verified!')}</p>
                            <p className="text-slate-400 text-sm mt-2">{t('جاري تحميل لوحة التحكم...', 'Loading your dashboard...')}</p>
                        </div>
                    )}

                    {!success && (
                        <form onSubmit={handleSubmit}>
                            {/* Error */}
                            {error && (
                                <div className="bg-orange-500/10 border border-orange-500/20 text-orange-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
                                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                    {error}
                                </div>
                            )}

                            {/* Phone Input */}
                            <div className="mb-5">
                                <label className="block text-slate-300 text-sm font-semibold mb-2.5 flex items-center gap-2" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                                    <Phone className="w-4 h-4 text-emerald-400" />
                                    {t('رقم الجوال', 'Phone Number')}
                                </label>
                                <div className="relative">
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        placeholder="05xxxxxxxx"
                                        className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl py-3.5 px-4 text-white text-lg tracking-wider placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all font-mono"
                                        dir="ltr"
                                        autoComplete="tel"
                                        id="team-phone"
                                    />
                                    {phone.length === 10 && (
                                        <CheckCircle2 className="absolute top-1/2 -translate-y-1/2 end-4 w-5 h-5 text-emerald-400" />
                                    )}
                                </div>
                            </div>

                            {/* Password */}
                            <div className="mb-6">
                                <label className="block text-slate-300 text-sm font-semibold mb-2.5 flex items-center gap-2" style={{ fontFamily: 'Tajawal, sans-serif' }}>
                                    <Lock className="w-4 h-4 text-emerald-400" />
                                    {t('الرقم السري', 'Password')}
                                </label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={t('أدخل الرقم السري', 'Enter password')}
                                        className="w-full bg-slate-900/60 border border-slate-700/60 rounded-xl py-3.5 px-4 pe-12 text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500/60 focus:ring-2 focus:ring-emerald-500/20 transition-all"
                                        autoComplete="current-password"
                                        id="team-password"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute top-1/2 -translate-y-1/2 end-4 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                                <p className="text-slate-500 text-xs mt-2">
                                    {t('اطلب الرقم السري من مدير المشروع', 'Request password from your project manager')}
                                </p>
                            </div>

                            {/* Submit */}
                            <button
                                type="submit"
                                disabled={loading || phone.length < 10 || !password}
                                className={`w-full py-3.5 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                                    loading || phone.length < 10 || !password
                                        ? 'bg-slate-800/60 text-slate-600 cursor-not-allowed border border-slate-700/30'
                                        : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/30 active:scale-[0.98] hover:from-emerald-400 hover:to-emerald-500'
                                }`}
                                id="team-login-submit"
                                style={{ fontFamily: 'Tajawal, sans-serif' }}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                        {t('جاري التحقق...', 'Verifying...')}
                                    </>
                                ) : (
                                    <>
                                        <Shield className="w-5 h-5" />
                                        {t('دخول المشروع', 'Access Project')}
                                    </>
                                )}
                            </button>
                        </form>
                    )}

                    {/* Footer Help */}
                    <div className="mt-6 pt-5 border-t border-slate-700/30 text-center">
                        <p className="text-slate-500 text-xs">
                            {t('هذا الدخول مخصص لأعضاء فريق المشروع فقط', 'This access is for project team members only')}
                        </p>
                        <button
                            onClick={() => onNavigate('login')}
                            className="text-emerald-400 hover:text-emerald-300 text-xs mt-2 transition-colors"
                        >
                            {t('هل أنت موظف آربا؟ سجل من هنا', 'ARBA employee? Login here')}
                        </button>
                    </div>
                </div>

                {/* Footer */}
                <p className="text-center text-slate-600 text-xs mt-6">
                    © 2025 ARBA Developer — ARBA Pricing
                </p>
            </div>
        </div>
    );
};

export default TeamLoginPage;
