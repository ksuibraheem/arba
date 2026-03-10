import React, { useState, useEffect } from 'react';
import { Lock, Crown, LogOut, ArrowRight, User } from 'lucide-react';
import { ProjectType, Language } from '../../types';

interface PrivatePortalProps {
    language: Language;
    onNavigate: (page: string) => void;
    onLogout: () => void;
    userId: string;
    userName: string;
    isDemoMode?: boolean;
}

const PrivatePortal: React.FC<PrivatePortalProps> = ({
    language,
    onNavigate,
    onLogout,
    userId,
    userName,
    isDemoMode
}) => {
    // Basic styling specifically requested for "Private" users
    // This provides "visual isolation" logic with a purple theme + market rates filtered for consumers
    // We mock fetching "consumer-level" items here, or wrap ItemTable.

    const isRtl = language === 'ar';
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate data loading
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    // Theme Variables - Purple for Private Tier
    const themeGradient = 'from-violet-900 to-purple-900';
    const accentColor = 'text-purple-400';

    // In a real application, you would pass `isPrivateTier=true` to your pricing API to get consumer rates instead of wholesale.

    return (
        <div className={`flex min-h-screen bg-slate-900 font-sans overflow-hidden ${isRtl ? 'flex-row-reverse' : ''}`} dir={isRtl ? 'rtl' : 'ltr'}>
            <main className="flex-1 flex flex-col w-full text-white">
                <header className={`bg-gradient-to-r ${themeGradient} border-b border-purple-800/50 px-8 py-4 shadow-xl z-10`}>
                    <div className="flex justify-between items-center max-w-7xl mx-auto w-full">
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-purple-500/20 border border-purple-400/30 flex items-center justify-center">
                                <Crown className="w-6 h-6 text-purple-300" />
                            </div>
                            <div>
                                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                                    {language === 'ar' ? 'صفحة الأفراد' : 'Private Individuals Portal'}
                                </h1>
                                <p className="text-purple-300 text-sm">
                                    {language === 'ar' ? 'تسعير السوق للمستهلك' : 'Consumer Market Pricing'}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-3 bg-purple-950/40 px-3 py-2 rounded-lg border border-purple-800/50">
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-400 to-violet-500 rounded-full flex items-center justify-center shadow-lg shadow-purple-500/20">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <div className="text-sm">
                                    <div className="font-medium text-white">{userName}</div>
                                    <div className="text-xs text-purple-300">{language === 'ar' ? 'حساب أفراد' : 'Individual Account'}</div>
                                </div>
                            </div>
                            <button
                                onClick={onLogout}
                                className="p-2 text-purple-300 hover:text-white transition-colors"
                            >
                                <LogOut className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </header>

                <div className="flex-1 overflow-y-auto p-8 relative">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5"></div>

                    <div className="max-w-4xl mx-auto relative z-10">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center mt-32">
                                <div className="w-16 h-16 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
                                <p className="mt-4 text-purple-300">
                                    {language === 'ar' ? 'جاري تحميل أسعار المستهلكين...' : 'Loading Consumer Rates...'}
                                </p>
                            </div>
                        ) : (
                            <div className="bg-slate-800/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-8 shadow-2xl">
                                <div className="text-center mb-8">
                                    <h2 className="text-2xl font-bold text-white mb-2">
                                        {language === 'ar' ? 'مرحباً بك في صفحة الأفراد' : 'Welcome to the Private Portal'}
                                    </h2>
                                    <p className="text-slate-400">
                                        {language === 'ar'
                                            ? 'الأسعار المعروضة هنا مخصصة للمستهلكين المباشرين، وتم فلترتها لضمان الخصوصية.'
                                            : 'The rates shown here are for direct consumers and have been filtered for privacy.'}
                                    </p>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
                                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50 hover:border-purple-500/50 transition-colors cursor-pointer group">
                                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Crown className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2">
                                            {language === 'ar' ? 'أسعار السوق (أفراد)' : 'Market Rates (Consumer)'}
                                        </h3>
                                        <p className="text-sm text-slate-400">
                                            {language === 'ar' ? 'استعرض أحدث أسعار البناء والتشطيب في السوق' : 'Browse latest construction and finishing market rates'}
                                        </p>
                                    </div>
                                    <div className="bg-slate-900/50 p-6 rounded-xl border border-slate-700/50 hover:border-purple-500/50 transition-colors cursor-pointer group">
                                        <div className="w-12 h-12 rounded-full bg-purple-500/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                            <Lock className="w-6 h-6 text-purple-400" />
                                        </div>
                                        <h3 className="text-lg font-bold text-white mb-2">
                                            {language === 'ar' ? 'مشاريعي المحمية' : 'Protected Projects'}
                                        </h3>
                                        <p className="text-sm text-slate-400">
                                            {language === 'ar' ? 'عرض المشاريع الخاصة المرتبطة بهويتك' : 'View private projects linked to your identity'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    )
}

export default PrivatePortal;
