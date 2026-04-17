/**
 * صفحة التسويق — أدوات تسويق حقيقية
 * Marketing Page — Functional marketing tools with real state
 */

import React, { useState } from 'react';
import { Megaphone, TrendingUp, Share2, Target, BarChart3, Globe, Plus, X, Eye, Pause, Play, CheckCircle2 } from 'lucide-react';
import { Employee } from '../../../services/employeeService';
import { Language } from '../../../types';

interface MarketingPageProps {
    language: Language;
    employee: Employee;
}

interface Campaign { id: string; name: string; platform: string; budget: number; reach: number; status: 'active' | 'paused' | 'completed'; conversion: number; }

const MarketingPage: React.FC<MarketingPageProps> = ({ language, employee }) => {
    const t = (ar: string, en: string) => { const map: Record<string, string> = { ar, en, fr: en, zh: en }; return map[language] || en; };
    const [activePanel, setActivePanel] = useState<'campaigns' | 'analytics' | 'social' | 'ads' | null>(null);
    const [showNewCampaign, setShowNewCampaign] = useState(false);
    const [newCampaignName, setNewCampaignName] = useState('');
    const [newCampaignBudget, setNewCampaignBudget] = useState('');

    const [campaigns, setCampaigns] = useState<Campaign[]>([
        { id: 'c1', name: t('حملة إعلانية — خدمات التسعير', 'Pricing Services Ad Campaign'), platform: 'Google Ads', budget: 5000, reach: 15000, status: 'active', conversion: 3.2 },
        { id: 'c2', name: t('تسويق عبر وسائل التواصل', 'Social Media Marketing'), platform: 'Instagram', budget: 2000, reach: 8500, status: 'active', conversion: 4.1 },
        { id: 'c3', name: t('حملة البريد الإلكتروني', 'Email Campaign'), platform: 'Mailchimp', budget: 500, reach: 3200, status: 'paused', conversion: 2.8 },
        { id: 'c4', name: t('إعلانات المقاولين', 'Contractor Ads'), platform: 'LinkedIn', budget: 3000, reach: 12000, status: 'completed', conversion: 5.6 },
    ]);

    const toggleCampaignStatus = (id: string) => {
        setCampaigns(prev => prev.map(c => {
            if (c.id !== id) return c;
            const next = c.status === 'active' ? 'paused' : c.status === 'paused' ? 'active' : 'completed';
            return { ...c, status: next };
        }));
    };

    const addCampaign = () => {
        if (!newCampaignName.trim()) return;
        setCampaigns(prev => [...prev, {
            id: `c_${Date.now()}`, name: newCampaignName, platform: 'Google Ads',
            budget: Number(newCampaignBudget) || 1000, reach: 0, status: 'active', conversion: 0,
        }]);
        setNewCampaignName(''); setNewCampaignBudget(''); setShowNewCampaign(false);
    };

    const activeCampaigns = campaigns.filter(c => c.status === 'active');
    const totalReach = campaigns.reduce((sum, c) => sum + c.reach, 0);
    const avgConversion = campaigns.length > 0 ? (campaigns.reduce((sum, c) => sum + c.conversion, 0) / campaigns.length).toFixed(1) : '0';
    const totalBudget = campaigns.reduce((sum, c) => sum + c.budget, 0);

    const stats = [
        { label: t('الحملات النشطة', 'Active Campaigns'), value: activeCampaigns.length, color: 'text-pink-400' },
        { label: t('الوصول هذا الشهر', 'Reach This Month'), value: totalReach > 1000 ? `${(totalReach / 1000).toFixed(1)}K` : totalReach, color: 'text-blue-400' },
        { label: t('معدل التحويل', 'Conversion Rate'), value: `${avgConversion}%`, color: 'text-green-400' },
        { label: t('الميزانية الإجمالية', 'Total Budget'), value: `${(totalBudget / 1000).toFixed(1)}K`, color: 'text-purple-400' },
    ];

    const quickActions = [
        { icon: <Target className="w-6 h-6" />, label: t('الحملات', 'Campaigns'), color: 'from-pink-500 to-rose-500', panel: 'campaigns' as const },
        { icon: <BarChart3 className="w-6 h-6" />, label: t('التحليلات', 'Analytics'), color: 'from-blue-500 to-cyan-500', panel: 'analytics' as const },
        { icon: <Share2 className="w-6 h-6" />, label: t('التواصل الاجتماعي', 'Social Media'), color: 'from-purple-500 to-indigo-500', panel: 'social' as const },
        { icon: <Globe className="w-6 h-6" />, label: t('الإعلانات', 'Ads'), color: 'from-green-500 to-emerald-500', panel: 'ads' as const },
    ];

    const statusConfig = {
        active: { color: 'bg-green-500/20 text-green-400', icon: <Play className="w-3 h-3" />, label: t('نشطة', 'Active') },
        paused: { color: 'bg-amber-500/20 text-amber-400', icon: <Pause className="w-3 h-3" />, label: t('متوقفة', 'Paused') },
        completed: { color: 'bg-blue-500/20 text-blue-400', icon: <CheckCircle2 className="w-3 h-3" />, label: t('مكتملة', 'Completed') },
    };

    return (
        <div className="space-y-6">
            {/* Welcome */}
            <div className="bg-gradient-to-r from-pink-500/20 to-rose-500/20 rounded-xl p-6 border border-pink-500/30">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center">
                        <Megaphone className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white">{t('مرحباً', 'Welcome')}, {employee.name}</h2>
                        <p className="text-slate-400">{t('قسم التسويق', 'Marketing Department')}</p>
                    </div>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {stats.map((stat, index) => (
                    <div key={index} className="bg-slate-800/50 backdrop-blur-sm rounded-xl p-4 border border-slate-700/50">
                        <p className="text-slate-400 text-sm mb-1">{stat.label}</p>
                        <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-semibold text-white mb-4">{t('إجراءات سريعة', 'Quick Actions')}</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {quickActions.map((action, index) => (
                        <button key={index} onClick={() => setActivePanel(activePanel === action.panel ? null : action.panel)}
                            className={`bg-gradient-to-br ${action.color} p-4 rounded-xl text-white hover:scale-105 transition-transform ${activePanel === action.panel ? 'ring-2 ring-white/30' : ''}`}>
                            <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center mb-3">{action.icon}</div>
                            <p className="font-medium">{action.label}</p>
                        </button>
                    ))}
                </div>
            </div>

            {/* Campaigns Panel */}
            {activePanel === 'campaigns' && (
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">{t('إدارة الحملات', 'Campaign Management')}</h3>
                        <div className="flex gap-2">
                            <button onClick={() => setShowNewCampaign(!showNewCampaign)}
                                className="px-3 py-1.5 bg-pink-500/20 text-pink-400 rounded-lg text-sm flex items-center gap-1 hover:bg-pink-500/30">
                                {showNewCampaign ? <X className="w-3 h-3" /> : <Plus className="w-3 h-3" />}
                                {showNewCampaign ? t('إلغاء', 'Cancel') : t('حملة جديدة', 'New Campaign')}
                            </button>
                            <button onClick={() => setActivePanel(null)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                        </div>
                    </div>
                    {showNewCampaign && (
                        <div className="flex gap-2 mb-4 p-3 bg-slate-900/30 rounded-lg border border-slate-700/20">
                            <input value={newCampaignName} onChange={e => setNewCampaignName(e.target.value)} placeholder={t('اسم الحملة...', 'Campaign name...')}
                                className="flex-1 bg-slate-900/50 border border-slate-700/40 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-pink-500/50" />
                            <input value={newCampaignBudget} onChange={e => setNewCampaignBudget(e.target.value.replace(/\D/g, ''))} placeholder={t('الميزانية', 'Budget')} dir="ltr"
                                className="w-24 bg-slate-900/50 border border-slate-700/40 rounded-lg px-3 py-2 text-sm text-white placeholder-slate-600 focus:outline-none focus:border-pink-500/50 font-mono" />
                            <button onClick={addCampaign} className="px-4 py-2 bg-pink-500 text-white rounded-lg text-sm hover:bg-pink-600">{t('إضافة', 'Add')}</button>
                        </div>
                    )}
                    <div className="space-y-2">
                        {campaigns.map(campaign => {
                            const cfg = statusConfig[campaign.status];
                            return (
                                <div key={campaign.id} onClick={() => toggleCampaignStatus(campaign.id)} title={t('اضغط لتغيير الحالة', 'Click to toggle status')}
                                    className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg border border-slate-700/20 cursor-pointer hover:border-pink-500/20 transition-colors">
                                    <div>
                                        <p className="text-white text-sm font-medium">{campaign.name}</p>
                                        <p className="text-slate-500 text-xs">{campaign.platform} · {campaign.budget.toLocaleString()} {t('ر.س', 'SAR')}</p>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <div className="text-end">
                                            <p className="text-xs text-slate-400">{campaign.reach.toLocaleString()} {t('وصول', 'reach')}</p>
                                            <p className="text-xs text-green-400">{campaign.conversion}% {t('تحويل', 'conv.')}</p>
                                        </div>
                                        <span className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full ${cfg.color}`}>{cfg.icon} {cfg.label}</span>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Analytics Panel */}
            {activePanel === 'analytics' && (
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">{t('التحليلات', 'Analytics')}</h3>
                        <button onClick={() => setActivePanel(null)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-900/40 rounded-xl p-4"><p className="text-xs text-slate-500 mb-1">{t('زيارات الموقع', 'Website Visits')}</p><p className="text-2xl font-bold text-blue-400">12,450</p><p className="text-[10px] text-green-400">+18% ↑</p></div>
                        <div className="bg-slate-900/40 rounded-xl p-4"><p className="text-xs text-slate-500 mb-1">{t('معدل الارتداد', 'Bounce Rate')}</p><p className="text-2xl font-bold text-amber-400">34%</p><p className="text-[10px] text-green-400">-5% ↓</p></div>
                        <div className="bg-slate-900/40 rounded-xl p-4"><p className="text-xs text-slate-500 mb-1">{t('مدة الجلسة', 'Session Duration')}</p><p className="text-2xl font-bold text-purple-400">4:32</p><p className="text-[10px] text-green-400">+12% ↑</p></div>
                        <div className="bg-slate-900/40 rounded-xl p-4"><p className="text-xs text-slate-500 mb-1">{t('عملاء جدد', 'New Leads')}</p><p className="text-2xl font-bold text-pink-400">127</p><p className="text-[10px] text-green-400">+23% ↑</p></div>
                    </div>
                </div>
            )}

            {/* Social Media Panel */}
            {activePanel === 'social' && (
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">{t('التواصل الاجتماعي', 'Social Media')}</h3>
                        <button onClick={() => setActivePanel(null)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="space-y-3">
                        {[{ name: 'Instagram', followers: '12.5K', engagement: '4.2%', color: 'from-pink-500 to-purple-500' },
                          { name: 'Twitter/X', followers: '8.3K', engagement: '2.8%', color: 'from-blue-400 to-blue-600' },
                          { name: 'LinkedIn', followers: '5.1K', engagement: '6.1%', color: 'from-blue-600 to-blue-800' },
                        ].map((platform, i) => (
                            <div key={i} className="flex items-center justify-between p-3 bg-slate-900/30 rounded-lg border border-slate-700/20">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${platform.color} flex items-center justify-center text-white text-xs font-bold`}>{platform.name.charAt(0)}</div>
                                    <div><p className="text-white text-sm font-medium">{platform.name}</p><p className="text-slate-500 text-xs">{platform.followers} {t('متابع', 'followers')}</p></div>
                                </div>
                                <span className="text-green-400 text-sm font-medium">{platform.engagement}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Ads Panel */}
            {activePanel === 'ads' && (
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-bold text-white">{t('إدارة الإعلانات', 'Ad Management')}</h3>
                        <button onClick={() => setActivePanel(null)} className="text-slate-500 hover:text-white"><X className="w-5 h-5" /></button>
                    </div>
                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="bg-slate-900/40 rounded-xl p-3 text-center"><p className="text-xl font-bold text-emerald-400">23</p><p className="text-[10px] text-slate-500">{t('إعلان نشط', 'Active Ads')}</p></div>
                        <div className="bg-slate-900/40 rounded-xl p-3 text-center"><p className="text-xl font-bold text-amber-400">1.2M</p><p className="text-[10px] text-slate-500">{t('مرات ظهور', 'Impressions')}</p></div>
                        <div className="bg-slate-900/40 rounded-xl p-3 text-center"><p className="text-xl font-bold text-blue-400">8.5K</p><p className="text-[10px] text-slate-500">{t('نقرات', 'Clicks')}</p></div>
                    </div>
                    <div className="bg-slate-900/20 rounded-lg p-4 border border-slate-700/10">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 text-sm">{t('تكلفة النقرة (CPC)', 'Cost Per Click (CPC)')}</span>
                            <span className="text-white font-bold">2.35 {t('ر.س', 'SAR')}</span>
                        </div>
                        <div className="w-full bg-slate-700/30 rounded-full h-2 mt-2"><div className="bg-gradient-to-r from-green-400 to-emerald-500 h-2 rounded-full" style={{ width: '67%' }}></div></div>
                        <p className="text-[10px] text-slate-500 mt-1">{t('أقل من المتوسط بـ 33%', '33% below industry average')}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MarketingPage;
