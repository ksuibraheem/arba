/**
 * ConnectHub — الصفحة الرئيسية لنظام التواصل الداخلي
 * حصري لباقة المؤسسات (Enterprise)
 */

import React, { useState, useEffect } from 'react';
import { MessageCircle, Mail, Camera, ClipboardList, StickyNote, Bell, Search, Settings, Database, ChevronLeft, TrendingUp, Clock, AlertTriangle, CheckCircle, Star, Plus, Truck, Users, Building2 } from 'lucide-react';
import { connectService, formatChatTime } from '../../services/connectService';
import { calculateStorageUsage, FREE_STORAGE_GB, STORAGE_PACKAGES, formatStorageSize } from '../../services/storagePackages';
import ProjectChat from './ProjectChat';
import InternalMail from './InternalMail';
import ProjectGallery from './ProjectGallery';
import DeliveryForms from './DeliveryForms';
import SmartNotes from './SmartNotes';
import SupplierManager from './SupplierManager';
import ProjectTeamManager from './ProjectTeamManager';
import CompanySettings from './CompanySettings';

type ConnectTab = 'overview' | 'chat' | 'mail' | 'gallery' | 'forms' | 'notes' | 'suppliers' | 'team' | 'company' | 'settings';

interface ConnectHubProps {
    language: 'ar' | 'en';
    userId: string;
    userName: string;
    userEmail?: string;
    companyName?: string;
    companyLogo?: string;
    onBack?: () => void;
}

const ConnectHub: React.FC<ConnectHubProps> = ({
    language, userId, userName, userEmail, companyName, companyLogo, onBack
}) => {
    const [activeTab, setActiveTab] = useState<ConnectTab>('overview');
    const [unreadChat, setUnreadChat] = useState(0);
    const [unreadMail, setUnreadMail] = useState(0);
    const [pendingForms, setPendingForms] = useState(0);
    const isRtl = language === 'ar';

    useEffect(() => {
        connectService.initializeSampleData();
        refreshCounts();
    }, []);

    const refreshCounts = () => {
        setUnreadChat(connectService.getUnreadCount(userId));
        setUnreadMail(connectService.getUnreadMailCount(userId));
        setPendingForms(connectService.getPendingFormsCount());
    };

    const storageUsed = connectService.getStorageUsed();
    const storageInfo = calculateStorageUsage(storageUsed, FREE_STORAGE_GB);
    const recentActivity = connectService.getRecentActivity(8);

    const tabs: { id: ConnectTab; icon: React.ReactNode; label: { ar: string; en: string }; badge?: number; color: string }[] = [
        { id: 'chat', icon: <MessageCircle className="w-5 h-5" />, label: { ar: 'شات', en: 'Chat' }, badge: unreadChat, color: 'from-blue-500 to-cyan-500' },
        { id: 'mail', icon: <Mail className="w-5 h-5" />, label: { ar: 'بريد', en: 'Mail' }, badge: unreadMail, color: 'from-purple-500 to-violet-500' },
        { id: 'gallery', icon: <Camera className="w-5 h-5" />, label: { ar: 'صور', en: 'Photos' }, color: 'from-emerald-500 to-teal-500' },
        { id: 'forms', icon: <ClipboardList className="w-5 h-5" />, label: { ar: 'نماذج', en: 'Forms' }, badge: pendingForms, color: 'from-amber-500 to-orange-500' },
        { id: 'notes', icon: <StickyNote className="w-5 h-5" />, label: { ar: 'ملاحظات', en: 'Notes' }, color: 'from-pink-500 to-rose-500' },
        { id: 'suppliers', icon: <Truck className="w-5 h-5" />, label: { ar: 'الموردين', en: 'Suppliers' }, color: 'from-orange-500 to-red-500' },
        { id: 'team', icon: <Users className="w-5 h-5" />, label: { ar: 'فريق المشروع', en: 'Team' }, color: 'from-violet-500 to-purple-500' },
        { id: 'company', icon: <Building2 className="w-5 h-5" />, label: { ar: 'الشركة', en: 'Company' }, color: 'from-teal-500 to-cyan-500' },
    ];

    const t = (ar: string, en: string) => language === 'ar' ? ar : en;

    // Render sub-components
    if (activeTab === 'chat') {
        return <ProjectChat language={language} userId={userId} userName={userName} companyName={companyName} onBack={() => { setActiveTab('overview'); refreshCounts(); }} />;
    }
    if (activeTab === 'mail') {
        return <InternalMail language={language} userId={userId} userName={userName} userEmail={userEmail} companyName={companyName} companyLogo={companyLogo} onBack={() => { setActiveTab('overview'); refreshCounts(); }} />;
    }
    if (activeTab === 'gallery') {
        return <ProjectGallery language={language} userId={userId} userName={userName} storageGB={FREE_STORAGE_GB} onBack={() => { setActiveTab('overview'); refreshCounts(); }} />;
    }
    if (activeTab === 'forms') {
        return <DeliveryForms language={language} userId={userId} userName={userName} companyName={companyName} onBack={() => { setActiveTab('overview'); refreshCounts(); }} />;
    }
    if (activeTab === 'notes') {
        return <SmartNotes language={language} userId={userId} userName={userName} onBack={() => { setActiveTab('overview'); refreshCounts(); }} />;
    }
    if (activeTab === 'suppliers') {
        return <SupplierManager language={language} userId={userId} onBack={() => { setActiveTab('overview'); refreshCounts(); }} onOpenChat={() => { setActiveTab('chat'); }} />;
    }
    if (activeTab === 'team') {
        return <ProjectTeamManager language={language} userId={userId} onBack={() => { setActiveTab('overview'); refreshCounts(); }} />;
    }
    if (activeTab === 'company') {
        return <CompanySettings language={language} userId={userId} onBack={() => { setActiveTab('overview'); refreshCounts(); }} />;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-30">
                <div className="max-w-6xl mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        {onBack && (
                            <button onClick={onBack} className="p-2 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-colors">
                                <ChevronLeft className={`w-5 h-5 ${isRtl ? 'rotate-180' : ''}`} />
                            </button>
                        )}
                        <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-lg sm:text-xl font-bold text-white">Arba Connect</h1>
                            <p className="text-xs sm:text-sm text-slate-400">{t('نظام التواصل الداخلي', 'Internal Communication')}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <button className="relative p-2 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-colors">
                            <Bell className="w-5 h-5" />
                            {(unreadChat + unreadMail + pendingForms) > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center">
                                    {unreadChat + unreadMail + pendingForms}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('settings')}
                            className="p-2 hover:bg-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-colors"
                        >
                            <Settings className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </header>

            <main className="max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6">
                {/* Navigation Tabs */}
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2 sm:gap-3">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className="relative bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-4 hover:bg-slate-700/60 hover:border-slate-600/50 transition-all group"
                        >
                            <div className={`w-9 h-9 sm:w-11 sm:h-11 rounded-lg sm:rounded-xl bg-gradient-to-br ${tab.color} flex items-center justify-center mx-auto mb-1.5 sm:mb-2 shadow-lg group-hover:scale-110 transition-transform`}>
                                {tab.icon}
                            </div>
                            <span className="text-[9px] sm:text-xs font-medium text-slate-300 block text-center leading-tight">{tab.label[language]}</span>
                            {tab.badge && tab.badge > 0 && (
                                <span className="absolute -top-1 -right-1 sm:top-1 sm:right-1 w-5 h-5 bg-red-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center shadow-lg animate-pulse">
                                    {tab.badge}
                                </span>
                            )}
                        </button>
                    ))}
                </div>

                {/* Storage Bar */}
                <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-xl sm:rounded-2xl p-3 sm:p-4">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                            <Database className="w-4 h-4 text-slate-400" />
                            <span className="text-xs sm:text-sm font-medium text-slate-300">{t('التخزين', 'Storage')}</span>
                        </div>
                        <span className="text-xs text-slate-400">
                            {storageInfo.usedGB} GB / {storageInfo.totalGB} GB
                        </span>
                    </div>
                    <div className="w-full h-2 sm:h-2.5 bg-slate-700 rounded-full overflow-hidden">
                        <div
                            className={`h-full rounded-full transition-all duration-500 ${
                                storageInfo.percentage > 90 ? 'bg-red-500' :
                                storageInfo.percentage > 70 ? 'bg-amber-500' :
                                'bg-gradient-to-r from-emerald-500 to-teal-500'
                            }`}
                            style={{ width: `${Math.min(100, storageInfo.percentage)}%` }}
                        />
                    </div>
                    {storageInfo.percentage > 80 && (
                        <p className="text-xs text-amber-400 mt-2 flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            {t('المساحة تقترب من الحد الأقصى. فكّر بترقية الباقة.', 'Storage nearing limit. Consider upgrading.')}
                        </p>
                    )}
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {[
                        { label: t('رسائل اليوم', 'Today\'s Messages'), value: connectService.getMessages().filter(m => new Date(m.createdAt as any).toDateString() === new Date().toDateString()).length, icon: <MessageCircle className="w-4 h-4" />, color: 'text-blue-400' },
                        { label: t('بريد غير مقروء', 'Unread Mail'), value: unreadMail, icon: <Mail className="w-4 h-4" />, color: 'text-purple-400' },
                        { label: t('نماذج معلقة', 'Pending Forms'), value: pendingForms, icon: <ClipboardList className="w-4 h-4" />, color: 'text-amber-400' },
                        { label: t('إجمالي الصور', 'Total Photos'), value: connectService.getPhotos().length, icon: <Camera className="w-4 h-4" />, color: 'text-emerald-400' },
                    ].map((stat, i) => (
                        <div key={i} className="bg-slate-800/40 border border-slate-700/30 rounded-xl p-3 sm:p-4">
                            <div className={`flex items-center gap-1.5 mb-1 ${stat.color}`}>
                                {stat.icon}
                                <span className="text-[10px] sm:text-xs font-medium">{stat.label}</span>
                            </div>
                            <span className="text-xl sm:text-2xl font-bold text-white">{stat.value}</span>
                        </div>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-xl sm:rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-700/50 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <h3 className="text-sm font-semibold text-white">{t('آخر النشاطات', 'Recent Activity')}</h3>
                        </div>
                        <span className="text-[10px] text-slate-500">{t('آخر 24 ساعة', 'Last 24 hours')}</span>
                    </div>
                    <div className="divide-y divide-slate-700/30">
                        {recentActivity.length === 0 ? (
                            <div className="py-10 text-center">
                                <TrendingUp className="w-10 h-10 text-slate-600 mx-auto mb-2" />
                                <p className="text-sm text-slate-500">{t('لا توجد نشاطات حديثة', 'No recent activity')}</p>
                                <p className="text-xs text-slate-600 mt-1">{t('ابدأ بإرسال رسالة أو رفع صورة', 'Start by sending a message or uploading a photo')}</p>
                            </div>
                        ) : (
                            recentActivity.map((activity, i) => (
                                <div key={i} className="px-4 py-3 hover:bg-slate-700/20 transition-colors cursor-pointer flex items-start gap-3">
                                    <span className="text-lg sm:text-xl shrink-0 mt-0.5">{activity.icon}</span>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-white truncate">{activity.title}</p>
                                        <p className="text-xs text-slate-400 truncate">{activity.description}</p>
                                    </div>
                                    <span className="text-[10px] text-slate-500 shrink-0 mt-1">{formatChatTime(activity.time)}</span>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Storage Packages */}
                <div className="bg-slate-800/60 backdrop-blur border border-slate-700/50 rounded-xl sm:rounded-2xl overflow-hidden">
                    <div className="px-4 py-3 border-b border-slate-700/50">
                        <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                            <Database className="w-4 h-4 text-emerald-400" />
                            {t('باقات التخزين', 'Storage Packages')}
                        </h3>
                    </div>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 p-4">
                        {STORAGE_PACKAGES.map(pkg => (
                            <div key={pkg.id} className={`relative border rounded-xl p-3 sm:p-4 transition-all hover:scale-[1.02] cursor-pointer ${pkg.popular ? 'border-blue-500/50 bg-blue-500/5' : 'border-slate-700/50 bg-slate-800/30'}`}>
                                {pkg.popular && (
                                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-blue-500 text-[9px] font-bold text-white rounded-full">
                                        {t('الأكثر طلباً', 'Popular')}
                                    </span>
                                )}
                                <div className="text-center">
                                    <span className="text-2xl">{pkg.icon}</span>
                                    <h4 className="text-sm font-bold text-white mt-1">{pkg.name[language]}</h4>
                                    <p className="text-xs text-slate-400">{pkg.sizeGB >= 1024 ? `${pkg.sizeGB / 1024} TB` : `${pkg.sizeGB} GB`}</p>
                                    <div className="mt-2">
                                        <span className="text-lg sm:text-xl font-bold text-emerald-400">{pkg.priceMonthSAR}</span>
                                        <span className="text-xs text-slate-500"> {t('ر.س/شهر', 'SAR/mo')}</span>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-0.5">
                                        {pkg.priceYearSAR} {t('ر.س/سنة', 'SAR/year')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ConnectHub;
