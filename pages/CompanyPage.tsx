import React from 'react';
import { Building2, Phone, Mail, MapPin, Globe, Award, Users, Briefcase, ArrowRight, ArrowLeft } from 'lucide-react';
import { PAGE_TRANSLATIONS } from '../companyData';

interface CompanyPageProps {
    language: 'ar' | 'en';
    onNavigate: (page: string) => void;
    companyData?: {
        name: string;
        logo?: string;
        phone: string;
        email: string;
        address: string;
        website?: string;
        description: string;
        services: string[];
        employees: number;
        projects: number;
        established: number;
    };
}

const CompanyPage: React.FC<CompanyPageProps> = ({ language, onNavigate, companyData }) => {
    const isRtl = language === 'ar';
    const Arrow = isRtl ? ArrowLeft : ArrowRight;
    const t = (key: string) => PAGE_TRANSLATIONS[key]?.[language] || key;

    // Default company data if none provided
    const company = companyData || {
        name: language === 'ar' ? 'شركة أربا للتسعير' : 'ARBA Pricing Company',
        phone: '+966 91 529 3394',
        email: 'info@arba-sys.com',
        address: language === 'ar' ? 'الرياض، المملكة العربية السعودية' : 'Riyadh, Saudi Arabia',
        website: 'www.arba-sys.com',
        description: language === 'ar'
            ? 'شركة رائدة في مجال تسعير مشاريع البناء والمقاولات في المملكة العربية السعودية. نقدم حلولاً متكاملة لإدارة التكاليف وتسعير المشاريع بدقة عالية.'
            : 'A leading company in construction project pricing in Saudi Arabia. We provide integrated solutions for cost management and accurate project pricing.',
        services: language === 'ar'
            ? ['تسعير المشاريع', 'حساب الكميات', 'إدارة التكاليف', 'استشارات هندسية']
            : ['Project Pricing', 'Quantity Surveying', 'Cost Management', 'Engineering Consultancy'],
        employees: 50,
        projects: 500,
        established: 2020
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <header className="bg-slate-900/80 backdrop-blur-md border-b border-slate-700/50 sticky top-0 z-50">
                <div className="container mx-auto px-6 py-4 flex justify-between items-center">
                    <button
                        onClick={() => onNavigate('landing')}
                        className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
                    >
                        <Arrow className="w-4 h-4 rotate-180" />
                        {t('company_back_to_home')}
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center">
                            <Building2 className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">{company.name}</span>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="py-20 px-6">
                <div className="container mx-auto max-w-5xl">
                    <div className="text-center mb-16">
                        <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-2xl">
                            {company.logo ? (
                                <img src={company.logo} alt={company.name} className="w-16 h-16 object-contain" />
                            ) : (
                                <Building2 className="w-12 h-12 text-white" />
                            )}
                        </div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{company.name}</h1>
                        <p className="text-xl text-slate-300 max-w-2xl mx-auto">{company.description}</p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-6 mb-16">
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-slate-700/50">
                            <Users className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                            <div className="text-3xl font-bold text-white mb-1">{company.employees}+</div>
                            <div className="text-slate-400">{t('company_employees')}</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-slate-700/50">
                            <Briefcase className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                            <div className="text-3xl font-bold text-white mb-1">{company.projects}+</div>
                            <div className="text-slate-400">{t('company_projects_completed')}</div>
                        </div>
                        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-6 text-center border border-slate-700/50">
                            <Award className="w-8 h-8 text-emerald-400 mx-auto mb-3" />
                            <div className="text-3xl font-bold text-white mb-1">{new Date().getFullYear() - company.established}+</div>
                            <div className="text-slate-400">{t('company_years_experience')}</div>
                        </div>
                    </div>

                    {/* Services */}
                    <div className="bg-slate-800/30 backdrop-blur-sm rounded-3xl p-8 border border-slate-700/50 mb-16">
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">{t('company_our_services')}</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {company.services.map((service, index) => (
                                <div key={index} className="bg-slate-700/30 rounded-xl p-4 text-center hover:bg-emerald-500/20 transition-colors">
                                    <span className="text-white font-medium">{service}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-3xl p-8 border border-emerald-500/30">
                        <h2 className="text-2xl font-bold text-white mb-6 text-center">{t('company_contact_us')}</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            <div className="flex items-center gap-3 text-slate-300">
                                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                    <Phone className="w-5 h-5 text-emerald-400" />
                                </div>
                                <span dir="ltr">{company.phone}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                    <Mail className="w-5 h-5 text-emerald-400" />
                                </div>
                                <span>{company.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-300">
                                <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                    <MapPin className="w-5 h-5 text-emerald-400" />
                                </div>
                                <span>{company.address}</span>
                            </div>
                            {company.website && (
                                <div className="flex items-center gap-3 text-slate-300">
                                    <div className="w-10 h-10 bg-emerald-500/20 rounded-lg flex items-center justify-center">
                                        <Globe className="w-5 h-5 text-emerald-400" />
                                    </div>
                                    <span>{company.website}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* CTA */}
                    <div className="text-center mt-12">
                        <button
                            onClick={() => onNavigate('register')}
                            className="px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-bold text-lg hover:from-emerald-400 hover:to-teal-400 transition-all shadow-xl flex items-center gap-2 mx-auto"
                        >
                            {t('company_start_now')}
                            <Arrow className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default CompanyPage;
