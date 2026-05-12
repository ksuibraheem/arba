import React, { useState } from 'react';
import ArbaLogo from '../components/ArbaLogo';
import {
    Calculator,
    FileSpreadsheet,
    TrendingUp,
    MessageSquare,
    Shield,
    Zap,
    Users,
    Award,
    ArrowLeft,
    ArrowRight,
    Phone,
    Mail,
    MapPin,
    Clock,
    Check,
    Star,
    Globe,
    Headphones,
    Eye,
    ChevronDown
} from 'lucide-react';
import { Language } from '../types';
import { COMPANY_INFO, SERVICES, FEATURES, SUBSCRIPTION_PLANS, PAGE_TRANSLATIONS, getLocalizedText, getLocalizedArray } from '../companyData';

interface LandingPageProps {
    language: Language;
    onNavigate: (page: string) => void;
    onLanguageChange?: (lang: Language) => void;
}

const LANG_OPTIONS: { id: Language; label: string; flag: string }[] = [
    { id: 'ar', label: 'العربية', flag: '🇸🇦' },
    { id: 'en', label: 'English', flag: '🇬🇧' },
    { id: 'fr', label: 'Français', flag: '🇫🇷' },
    { id: 'zh', label: '中文', flag: '🇨🇳' },
];

const IconMap: Record<string, React.ElementType> = {
    Calculator,
    FileSpreadsheet,
    TrendingUp,
    MessageSquare,
    Shield,
    Zap,
    Users,
    Award
};

const LandingPage: React.FC<LandingPageProps> = ({ language, onNavigate, onLanguageChange }) => {
    const [langMenuOpen, setLangMenuOpen] = useState(false);
    const t = (key: string) => PAGE_TRANSLATIONS[key]?.[language] || PAGE_TRANSLATIONS[key]?.['en'] || key;
    const tl = (obj: Record<string, string> | undefined) => getLocalizedText(obj, language);
    const isRtl = language === 'ar';
    const Arrow = isRtl ? ArrowLeft : ArrowRight;
    const currentLang = LANG_OPTIONS.find(l => l.id === language) || LANG_OPTIONS[0];

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#070914] via-[#0E132B] to-[#050711]" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-[#070A18]/90 backdrop-blur-xl border-b border-green-500/10 shadow-lg shadow-[#000000]/20">
                <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl flex items-center justify-center bg-[#131A3B]/60 border border-[#2B2D6E]/40 shadow-lg shadow-green-500/10">
                                <ArbaLogo size={32} />
                            </div>
                            <span className="text-base sm:text-xl font-bold text-white">{tl(COMPANY_INFO.systemName)}</span>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <a href="#services" className="text-slate-300 hover:text-white transition-colors">{t('nav_services')}</a>
                            <a href="#features" className="text-slate-300 hover:text-white transition-colors">{t('nav_why_us') || t('section_why_us')}</a>
                            <button onClick={() => onNavigate('pricing')} className="text-slate-300 hover:text-white transition-colors">{t('nav_pricing')}</button>
                            <button
                                onClick={() => onNavigate('about')}
                                className="text-slate-300 hover:text-white transition-colors"
                            >
                                {t('nav_about')}
                            </button>
                            <button
                                onClick={() => onNavigate('support-center')}
                                className="text-slate-300 hover:text-white transition-colors flex items-center gap-1"
                            >
                                <Headphones className="w-4 h-4" />
                                {t('nav_support')}
                            </button>
                            <button
                                onClick={() => onNavigate('employee-login')}
                                className="text-slate-300 hover:text-white transition-colors"
                            >
                                {t('nav_staff')}
                            </button>
                        </div>

                        <div className="flex items-center gap-1.5 sm:gap-3">
                            {/* Language Dropdown */}
                            {onLanguageChange && (
                                <div className="relative">
                                    <button
                                        onClick={() => setLangMenuOpen(!langMenuOpen)}
                                        className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-slate-300 hover:text-white transition-all border border-slate-600/50"
                                    >
                                        <span className="text-sm">{currentLang.flag}</span>
                                        <span className="text-xs sm:text-sm font-medium hidden sm:inline">{currentLang.label}</span>
                                        <ChevronDown className="w-3 h-3" />
                                    </button>
                                    {langMenuOpen && (
                                        <div className="absolute top-full mt-1 right-0 bg-[#0E132B] border border-[#2B2D6E]/60 rounded-lg shadow-xl z-50 min-w-[140px] overflow-hidden">
                                            {LANG_OPTIONS.map(opt => (
                                                <button
                                                    key={opt.id}
                                                    onClick={() => { onLanguageChange(opt.id); setLangMenuOpen(false); }}
                                                    className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition-colors ${
                                                        language === opt.id ? 'bg-green-500/20 text-green-400' : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
                                                    }`}
                                                >
                                                    <span>{opt.flag}</span>
                                                    <span>{opt.label}</span>
                                                    {language === opt.id && <Check className="w-3 h-3 ml-auto" />}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                            <button
                                onClick={() => onNavigate('login')}
                                className="hidden sm:block px-4 py-2 text-slate-300 hover:text-white transition-colors"
                            >
                                {t('nav_login')}
                            </button>
                            <button
                                onClick={() => onNavigate('register')}
                                className="px-3 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-400 hover:to-lime-400 text-white rounded-lg font-medium text-xs sm:text-base transition-all shadow-lg shadow-green-500/25"
                            >
                                {t('nav_register')}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-24 sm:pt-32 pb-12 sm:pb-20 px-4 sm:px-6 relative overflow-hidden">
                {/* Background decorations */}
                <div className="absolute top-20 right-0 w-[500px] h-[500px] bg-green-500/[0.04] rounded-full blur-[120px] pointer-events-none"></div>
                <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-indigo-500/[0.05] rounded-full blur-[100px] pointer-events-none"></div>
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-green-500/10 border border-green-500/20 rounded-full text-green-400 text-xs sm:text-sm mb-4 sm:mb-8">
                            <Star className="w-4 h-4" />
                            <span>{tl(COMPANY_INFO.tagline)}</span>
                        </div>

                        <h1 className="text-2xl sm:text-4xl md:text-6xl font-extrabold text-white mb-4 sm:mb-6 leading-tight">
                            {t('hero_title')}
                        </h1>

                        <p className="text-sm sm:text-xl text-slate-400 mb-6 sm:mb-10">
                            {t('hero_subtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => onNavigate('register')}
                                className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-400 hover:to-lime-400 text-white rounded-xl font-bold text-base sm:text-lg transition-all shadow-xl shadow-green-500/30 flex items-center justify-center gap-2"
                            >
                                {t('hero_cta')}
                                <Arrow className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => onNavigate('demo')}
                                className="group w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-[#2B2D6E] to-[#3B3E8E] hover:from-[#3B3E8E] hover:to-[#4A4D9A] text-white rounded-xl font-bold text-base sm:text-lg transition-all shadow-xl shadow-[#2B2D6E]/30 flex items-center justify-center gap-2"
                            >
                                <Eye className="w-5 h-5" />
                                {t('hero_demo')}
                            </button>
                            <button
                                onClick={() => onNavigate('about')}
                                className="w-full sm:w-auto px-6 sm:px-8 py-3 sm:py-4 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white rounded-xl font-medium transition-all"
                            >
                                {t('hero_cta_secondary')}
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
                        {[
                            { value: '500+', label: t('stat_items') },
                            { value: '150+', label: t('stat_clients') },
                            { value: '99%', label: t('stat_accuracy') },
                            { value: '24/7', label: t('stat_support') }
                        ].map((stat, index) => (
                            <div key={index} className="text-center p-6 bg-[#0E132B]/70 rounded-2xl border border-[#2B2D6E]/40 backdrop-blur-sm hover:border-green-500/20 transition-colors">
                                <div className="text-3xl md:text-4xl font-extrabold text-green-400 mb-2">{stat.value}</div>
                                <div className="text-slate-400 text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-20 px-6 bg-[#050711]/60 border-y border-[#2B2D6E]/20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('section_services')}</h2>
                        <p className="text-slate-400 text-lg">{t('section_services_subtitle')}</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {SERVICES.map((service) => {
                            const Icon = IconMap[service.icon] || Calculator;
                            return (
                                <div
                                    key={service.id}
                                    className="group p-6 bg-[#0B0F24]/70 rounded-2xl border border-[#2B2D6E]/40 hover:border-green-500/40 transition-all hover:-translate-y-1 hover:shadow-lg hover:shadow-green-500/10"
                                >
                                    <div className="w-14 h-14 bg-gradient-to-br from-green-500/20 to-indigo-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:from-green-500/30 group-hover:to-indigo-500/30 transition-colors">
                                        <Icon className="w-7 h-7 text-green-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-3">{tl(service.title)}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{tl(service.description)}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('section_why_us')}</h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {FEATURES.map((feature, index) => {
                            const Icon = IconMap[feature.icon] || Shield;
                            return (
                                <div
                                    key={index}
                                    className="text-center p-6"
                                >
                                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-green-500/25">
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">{tl(feature.title)}</h3>
                                    <p className="text-slate-400 text-sm">{tl(feature.description)}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 px-6 bg-[#050711]/60 border-t border-[#2B2D6E]/20">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('section_plans')}</h2>
                        <p className="text-slate-400">{t('payment_subtitle')}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {SUBSCRIPTION_PLANS.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative p-8 rounded-2xl border transition-all ${plan.popular
                                    ? 'bg-[#0E132B] border-green-500 scale-105 shadow-2xl shadow-green-500/10 ring-1 ring-green-500/30'
                                    : 'bg-[#0B0F24]/60 border-[#2B2D6E]/40 hover:border-[#2B2D6E]/70'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-green-500 to-indigo-600 text-white text-sm font-medium rounded-full">
                                        {t('popular')}
                                    </div>
                                )}

                                <h3 className="text-xl font-bold text-white mb-2">{tl(plan.name)}</h3>
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                                    <span className="text-slate-400">{t('sar')} / {tl(plan.period)}</span>
                                </div>

                                {/* Projects & Storage Info */}
                                <div className="flex gap-4 mb-6 text-sm">
                                    <div className="bg-slate-700/50 px-3 py-1 rounded-lg text-slate-300">
                                        {plan.projectsIncluded === -1
                                            ? `∞ ${t('payment_projects')}`
                                            : `${plan.projectsIncluded} ${t('payment_projects')}`
                                        }
                                    </div>
                                    <div className="bg-slate-700/50 px-3 py-1 rounded-lg text-slate-300">
                                        {plan.storageMB >= 1024
                                            ? `${plan.storageMB / 1024} GB`
                                            : `${plan.storageMB} MB`
                                        }
                                    </div>
                                </div>

                                <ul className="space-y-3 mb-6">
                                    {getLocalizedArray(plan.features, language).map((feature, index) => (
                                        <li key={index} className="flex items-center gap-3 text-slate-300 text-sm">
                                            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Show restrictions for free plan */}
                                {plan.id === 'free' && (
                                    <div className="border-t border-slate-600/50 pt-4 mb-6">
                                        <p className="text-xs text-orange-400 mb-2">{t('warning')}:</p>
                                        <ul className="space-y-1 text-xs text-slate-500">
                                            <li>• {t('encrypted_suppliers')}</li>
                                            <li>• {t('no_download')}</li>
                                            <li>• {t('no_ai_pricing')}</li>
                                            <li>• {t('limited_support')}</li>
                                        </ul>
                                    </div>
                                )}

                                {/* Extra project price for professional */}
                                {plan.extraProjectPrice > 0 && (
                                    <div className="text-xs text-center text-slate-400 mb-4">
                                        {`${plan.extraProjectPrice} ${t('sar')} ${t('per_project')}`}
                                    </div>
                                )}

                                <button
                                    onClick={() => onNavigate('payment')}
                                    className={`w-full py-3 rounded-xl font-medium transition-all ${plan.popular
                                        ? 'bg-gradient-to-r from-green-500 to-lime-500 hover:from-green-400 hover:to-lime-400 text-white shadow-lg shadow-green-500/25'
                                        : 'bg-[#2B2D6E] hover:bg-[#34378A] text-white shadow-lg shadow-[#2B2D6E]/20'
                                        }`}
                                >
                                    {t('choose_plan')}
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Section */}
            <section id="contact" className="py-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('section_contact')}</h2>
                    </div>

                    <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        {[
                            { icon: Phone, label: t('contact_phone'), value: COMPANY_INFO.phone, isLtr: true },
                            { icon: Mail, label: t('contact_email'), value: COMPANY_INFO.email, isLtr: true },
                            { icon: MapPin, label: t('contact_location'), value: tl(COMPANY_INFO.location), isLtr: false },
                            { icon: Clock, label: t('contact_hours'), value: tl(COMPANY_INFO.workingHours), isLtr: false }
                        ].map((item, index) => (
                            <div key={index} className="text-center p-6 bg-[#0E132B]/60 rounded-2xl border border-[#2B2D6E]/40 hover:border-green-500/20 transition-colors">
                                <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <item.icon className="w-6 h-6 text-green-400" />
                                </div>
                                <div className="text-slate-400 text-sm mb-1">{item.label}</div>
                                <div className="text-white font-medium text-sm" dir={item.isLtr ? 'ltr' : undefined}>{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-6 sm:py-10 px-4 sm:px-6 border-t border-[#2B2D6E]/30 bg-[#03050C]">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg flex items-center justify-center bg-[#0E132B] border border-[#2B2D6E]/40">
                                <ArbaLogo size={30} />
                            </div>
                            <span className="text-sm sm:text-base text-white font-bold">{tl(COMPANY_INFO.systemName)}</span>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6 text-xs sm:text-sm text-slate-400">
                            <span>© 2025 {t('footer_rights')}</span>
                            <a href="#" className="hover:text-white transition-colors">{t('footer_privacy')}</a>
                            <a href="#" className="hover:text-white transition-colors">{t('footer_terms')}</a>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
