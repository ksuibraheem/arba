import React from 'react';
import {
    Calculator,
    Target,
    Eye,
    Mail,
    Phone,
    MapPin,
    Clock,
    ArrowLeft,
    ArrowRight,
    Users,
    Award,
    TrendingUp,
    Shield
} from 'lucide-react';
import { COMPANY_INFO, SERVICES, PAGE_TRANSLATIONS } from '../companyData';

interface AboutPageProps {
    language: 'ar' | 'en';
    onNavigate: (page: string) => void;
}

const AboutPage: React.FC<AboutPageProps> = ({ language, onNavigate }) => {
    const t = (key: string) => PAGE_TRANSLATIONS[key]?.[language] || key;
    const isRtl = language === 'ar';
    const Arrow = isRtl ? ArrowRight : ArrowLeft;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Navigation */}
            <nav className="fixed top-0 left-0 right-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50">
                <div className="max-w-7xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={() => onNavigate('landing')}
                            className="flex items-center gap-3"
                        >
                            <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                                <Calculator className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-xl font-bold text-white">{COMPANY_INFO.systemName[language]}</span>
                        </button>

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
            <section className="pt-32 pb-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <button
                        onClick={() => onNavigate('landing')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8"
                    >
                        <Arrow className="w-5 h-5" />
                        <span>{language === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}</span>
                    </button>

                    <div className="text-center max-w-3xl mx-auto">
                        <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6">
                            {t('about_title')}
                        </h1>
                        <p className="text-xl text-slate-400 leading-relaxed">
                            {COMPANY_INFO.about[language]}
                        </p>
                    </div>
                </div>
            </section>

            {/* Vision & Mission */}
            <section className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Vision */}
                        <div className="bg-slate-800/50 rounded-3xl border border-slate-700/50 p-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mb-6">
                                <Eye className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4">{t('about_vision')}</h2>
                            <p className="text-slate-400 leading-relaxed">
                                {COMPANY_INFO.vision[language]}
                            </p>
                        </div>

                        {/* Mission */}
                        <div className="bg-slate-800/50 rounded-3xl border border-slate-700/50 p-8">
                            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl flex items-center justify-center mb-6">
                                <Target className="w-8 h-8 text-emerald-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-4">{t('about_mission')}</h2>
                            <p className="text-slate-400 leading-relaxed">
                                {COMPANY_INFO.mission[language]}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stats */}
            <section className="py-16 px-6 bg-slate-800/30">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                        {[
                            { icon: TrendingUp, value: '500+', label: language === 'ar' ? 'مشروع تم تسعيره' : 'Projects Priced' },
                            { icon: Users, value: '150+', label: language === 'ar' ? 'عميل راضٍ' : 'Happy Clients' },
                            { icon: Shield, value: '99%', label: language === 'ar' ? 'دقة التسعير' : 'Pricing Accuracy' },
                            { icon: Award, value: '10+', label: language === 'ar' ? 'سنوات خبرة' : 'Years Experience' }
                        ].map((stat, index) => (
                            <div key={index} className="text-center p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                                <stat.icon className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                                <div className="text-3xl font-extrabold text-white mb-1">{stat.value}</div>
                                <div className="text-slate-400 text-sm">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Services */}
            <section className="py-16 px-6">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">{t('section_services')}</h2>
                    <div className="grid md:grid-cols-2 gap-6">
                        {SERVICES.map((service, index) => (
                            <div
                                key={service.id}
                                className="flex gap-5 p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50"
                            >
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center flex-shrink-0">
                                    <span className="text-white font-bold">{index + 1}</span>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-white mb-2">{service.title[language]}</h3>
                                    <p className="text-slate-400 text-sm">{service.description[language]}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Contact Info */}
            <section className="py-16 px-6 bg-slate-800/30">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-white text-center mb-12">{t('section_contact')}</h2>
                    <div className="grid md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                        {[
                            { icon: Phone, label: language === 'ar' ? 'الهاتف' : 'Phone', value: COMPANY_INFO.phone, isLtr: true },
                            { icon: Mail, label: language === 'ar' ? 'البريد' : 'Email', value: COMPANY_INFO.email, isLtr: true },
                            { icon: MapPin, label: language === 'ar' ? 'الموقع' : 'Location', value: COMPANY_INFO.location[language], isLtr: false },
                            { icon: Clock, label: language === 'ar' ? 'ساعات العمل' : 'Hours', value: COMPANY_INFO.workingHours[language], isLtr: false }
                        ].map((item, index) => (
                            <div key={index} className="text-center p-6 bg-slate-800/50 rounded-2xl border border-slate-700/50">
                                <div className="w-12 h-12 bg-emerald-500/10 rounded-xl flex items-center justify-center mx-auto mb-4">
                                    <item.icon className="w-6 h-6 text-emerald-400" />
                                </div>
                                <div className="text-slate-400 text-sm mb-1">{item.label}</div>
                                <div className="text-white font-medium text-sm" dir={item.isLtr ? 'ltr' : undefined}>{item.value}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6">
                <div className="max-w-3xl mx-auto text-center">
                    <h2 className="text-3xl font-bold text-white mb-6">
                        {language === 'ar' ? 'جاهز للبدء؟' : 'Ready to Get Started?'}
                    </h2>
                    <p className="text-slate-400 mb-8">
                        {language === 'ar'
                            ? 'انضم إلى مئات العملاء الذين يثقون بخدماتنا في تسعير مشاريعهم'
                            : 'Join hundreds of clients who trust our services in pricing their projects'
                        }
                    </p>
                    <button
                        onClick={() => onNavigate('register')}
                        className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-white rounded-xl font-bold text-lg transition-all shadow-xl shadow-emerald-500/30"
                    >
                        {t('get_started')}
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 px-6 border-t border-slate-700/50">
                <div className="max-w-7xl mx-auto text-center text-slate-400 text-sm">
                    © 2025 {COMPANY_INFO.companyName[language]} - {COMPANY_INFO.systemName[language]}. {t('footer_rights')}
                </div>
            </footer>
        </div>
    );
};

export default AboutPage;
