import React from 'react';
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
    Star
} from 'lucide-react';
import { COMPANY_INFO, SERVICES, FEATURES, SUBSCRIPTION_PLANS, PAGE_TRANSLATIONS } from '../companyData';

interface LandingPageProps {
    language: 'ar' | 'en';
    onNavigate: (page: string) => void;
}

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

const LandingPage: React.FC<LandingPageProps> = ({ language, onNavigate }) => {
    const t = (key: string) => PAGE_TRANSLATIONS[key]?.[language] || key;
    const isRtl = language === 'ar';
    const Arrow = isRtl ? ArrowLeft : ArrowRight;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                                <Calculator className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">{COMPANY_INFO.name[language]}</span>
                        </div>

                        <div className="hidden md:flex items-center gap-8">
                            <a href="#services" className="text-slate-300 hover:text-white transition-colors">{t('nav_services')}</a>
                            <a href="#features" className="text-slate-300 hover:text-white transition-colors">{t('nav_why_us') || t('section_why_us')}</a>
                            <a href="#pricing" className="text-slate-300 hover:text-white transition-colors">{t('nav_pricing')}</a>
                            <button
                                onClick={() => onNavigate('company')}
                                className="text-slate-300 hover:text-white transition-colors"
                            >
                                {language === 'ar' ? 'الشركة' : 'Company'}
                            </button>
                            <button
                                onClick={() => onNavigate('about')}
                                className="text-slate-300 hover:text-white transition-colors"
                            >
                                {t('nav_about')}
                            </button>
                        </div>

                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => onNavigate('login')}
                                className="px-4 py-2 text-slate-300 hover:text-white transition-colors"
                            >
                                {t('nav_login')}
                            </button>
                            <button
                                onClick={() => onNavigate('register')}
                                className="px-5 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-lg font-medium transition-all shadow-lg shadow-emerald-500/25"
                            >
                                {t('nav_register')}
                            </button>
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center max-w-4xl mx-auto">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-400 text-sm mb-8">
                            <Star className="w-4 h-4" />
                            <span>{COMPANY_INFO.tagline[language]}</span>
                        </div>

                        <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-6 leading-tight">
                            {t('hero_title')}
                        </h1>

                        <p className="text-xl text-slate-400 mb-10">
                            {t('hero_subtitle')}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            <button
                                onClick={() => onNavigate('register')}
                                className="group px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-emerald-500/30 flex items-center gap-2"
                            >
                                {t('hero_cta')}
                                <Arrow className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                            </button>
                            <button
                                onClick={() => onNavigate('about')}
                                className="px-8 py-4 border border-slate-600 hover:border-slate-500 text-slate-300 hover:text-white rounded-xl font-medium transition-all"
                            >
                                {t('hero_cta_secondary')}
                            </button>
                        </div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-20">
                        {[
                            { value: '500+', label: language === 'ar' ? 'مشروع تم تسعيره' : 'Projects Priced' },
                            { value: '150+', label: language === 'ar' ? 'عميل راضٍ' : 'Happy Clients' },
                            { value: '99%', label: language === 'ar' ? 'دقة التسعير' : 'Pricing Accuracy' },
                            { value: '24/7', label: language === 'ar' ? 'دعم متواصل' : 'Support Available' }
                        ].map((stat, index) => (
                            <div key={index} className="text-center p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                                <div className="text-3xl md:text-4xl font-extrabold text-emerald-400 mb-2">{stat.value}</div>
                                <div className="text-slate-400 text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services Section */}
            <section id="services" className="py-20 px-6 bg-slate-800/30">
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
                                    className="group p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50 hover:border-emerald-500/50 transition-all hover:-translate-y-1"
                                >
                                    <div className="w-14 h-14 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-xl flex items-center justify-center mb-5 group-hover:from-emerald-500/30 group-hover:to-teal-500/30 transition-colors">
                                        <Icon className="w-7 h-7 text-emerald-400" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-3">{service.title[language]}</h3>
                                    <p className="text-slate-400 text-sm leading-relaxed">{service.description[language]}</p>
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
                                    <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-emerald-500/25">
                                        <Icon className="w-8 h-8 text-white" />
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">{feature.title[language]}</h3>
                                    <p className="text-slate-400 text-sm">{feature.description[language]}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-20 px-6 bg-slate-800/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('section_plans')}</h2>
                        <p className="text-slate-400">{language === 'ar' ? 'اختر الخطة المناسبة لاحتياجاتك' : 'Choose the plan that fits your needs'}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
                        {SUBSCRIPTION_PLANS.map((plan) => (
                            <div
                                key={plan.id}
                                className={`relative p-8 rounded-2xl border transition-all ${plan.popular
                                    ? 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/50 scale-105'
                                    : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'
                                    }`}
                            >
                                {plan.popular && (
                                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white text-sm font-medium rounded-full">
                                        {t('popular')}
                                    </div>
                                )}

                                <h3 className="text-xl font-bold text-white mb-2">{plan.name[language]}</h3>
                                <div className="flex items-baseline gap-1 mb-2">
                                    <span className="text-4xl font-extrabold text-white">{plan.price}</span>
                                    <span className="text-slate-400">{t('sar')} / {plan.period[language]}</span>
                                </div>

                                {/* Projects & Storage Info */}
                                <div className="flex gap-4 mb-6 text-sm">
                                    <div className="bg-slate-700/50 px-3 py-1 rounded-lg text-slate-300">
                                        {plan.projectsIncluded === -1
                                            ? (language === 'ar' ? '∞ مشاريع' : '∞ projects')
                                            : `${plan.projectsIncluded} ${language === 'ar' ? 'مشاريع' : 'projects'}`
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
                                    {plan.features[language].map((feature, index) => (
                                        <li key={index} className="flex items-center gap-3 text-slate-300 text-sm">
                                            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                                            <span>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Show restrictions for free plan */}
                                {plan.id === 'free' && (
                                    <div className="border-t border-slate-600/50 pt-4 mb-6">
                                        <p className="text-xs text-orange-400 mb-2">{language === 'ar' ? 'القيود:' : 'Limitations:'}</p>
                                        <ul className="space-y-1 text-xs text-slate-500">
                                            <li>• {language === 'ar' ? 'أسماء الموردين مشفرة' : 'Encrypted supplier names'}</li>
                                            <li>• {language === 'ar' ? 'التنزيل غير متاح' : 'Download not available'}</li>
                                            <li>• {language === 'ar' ? 'بدون تسعير ذكي AI' : 'No AI pricing'}</li>
                                            <li>• {language === 'ar' ? 'بدون شعار الشركة' : 'No company logo'}</li>
                                        </ul>
                                    </div>
                                )}

                                {/* Extra project price for professional */}
                                {plan.extraProjectPrice > 0 && (
                                    <div className="text-xs text-center text-slate-400 mb-4">
                                        {language === 'ar'
                                            ? `${plan.extraProjectPrice} ريال لكل مشروع إضافي`
                                            : `${plan.extraProjectPrice} SAR per extra project`
                                        }
                                    </div>
                                )}

                                <button
                                    onClick={() => onNavigate('payment')}
                                    className={`w-full py-3 rounded-xl font-medium transition-all ${plan.popular
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white shadow-lg shadow-emerald-500/25'
                                        : 'bg-slate-700 hover:bg-slate-600 text-white'
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
                            { icon: Phone, label: language === 'ar' ? 'الهاتف' : 'Phone', value: COMPANY_INFO.phone },
                            { icon: Mail, label: language === 'ar' ? 'البريد' : 'Email', value: COMPANY_INFO.email },
                            { icon: MapPin, label: language === 'ar' ? 'الموقع' : 'Location', value: COMPANY_INFO.location[language] },
                            { icon: Clock, label: language === 'ar' ? 'ساعات العمل' : 'Working Hours', value: COMPANY_INFO.workingHours[language] }
                        ].map((item, index) => (
                            <div key={index} className="text-center p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <item.icon className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div className="text-slate-400 text-sm mb-1">{item.label}</div>
                                <div className="text-white font-medium text-sm">{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 px-6 border-t border-slate-700/50">
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-lg flex items-center justify-center">
                                <Calculator className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-white font-bold">{COMPANY_INFO.name[language]}</span>
                        </div>

                        <div className="flex items-center gap-6 text-sm text-slate-400">
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
