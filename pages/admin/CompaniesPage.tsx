import React, { useState } from 'react';
import {
    Building2, Search, Plus, Edit2, Trash2, Mail, Phone, MapPin,
    Calendar, Users, FolderOpen, Star, Check, ChevronLeft, ChevronRight,
    Download, Filter, ArrowUpDown, Eye, CreditCard
} from 'lucide-react';

interface CompaniesPageProps {
    language: 'ar' | 'en';
}

interface Company {
    id: string;
    name: string;
    email: string;
    phone: string;
    address: string;
    plan: 'free' | 'professional' | 'enterprise';
    status: 'active' | 'inactive' | 'trial';
    usersCount: number;
    projectsCount: number;
    joinDate: string;
    logo?: string;
}

const CompaniesPage: React.FC<CompaniesPageProps> = ({ language }) => {
    const isRtl = language === 'ar';
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

    const t = {
        title: { ar: 'إدارة الشركات', en: 'Company Management' },
        search: { ar: 'بحث عن شركة...', en: 'Search companies...' },
        addCompany: { ar: 'إضافة شركة', en: 'Add Company' },
        export: { ar: 'تصدير', en: 'Export' },
        filter: { ar: 'فلترة', en: 'Filter' },
        name: { ar: 'اسم الشركة', en: 'Company Name' },
        contact: { ar: 'معلومات الاتصال', en: 'Contact Info' },
        plan: { ar: 'الباقة', en: 'Plan' },
        status: { ar: 'الحالة', en: 'Status' },
        users: { ar: 'المستخدمين', en: 'Users' },
        projects: { ar: 'المشاريع', en: 'Projects' },
        actions: { ar: 'إجراءات', en: 'Actions' },
        active: { ar: 'نشط', en: 'Active' },
        inactive: { ar: 'غير نشط', en: 'Inactive' },
        trial: { ar: 'تجريبي', en: 'Trial' },
        view: { ar: 'عرض', en: 'View' },
        edit: { ar: 'تعديل', en: 'Edit' },
        delete: { ar: 'حذف', en: 'Delete' },
        showing: { ar: 'عرض', en: 'Showing' },
        of: { ar: 'من', en: 'of' },
        companies: { ar: 'شركة', en: 'companies' },
        subscription: { ar: 'الاشتراك', en: 'Subscription' }
    };

    const getLabel = (key: keyof typeof t) => t[key][language];

    // Mock companies data
    const companies: Company[] = [
        { id: '1', name: 'شركة البناء المتقدم', email: 'info@advanced-construction.com', phone: '+966501234567', address: 'الرياض، حي العليا', plan: 'enterprise', status: 'active', usersCount: 25, projectsCount: 48, joinDate: '2023-06-15' },
        { id: '2', name: 'مؤسسة التعمير', email: 'contact@tameer.sa', phone: '+966507654321', address: 'جدة، حي الروضة', plan: 'professional', status: 'active', usersCount: 12, projectsCount: 23, joinDate: '2023-09-20' },
        { id: '3', name: 'شركة الإنشاءات العالمية', email: 'global@construction.com', phone: '+966509876543', address: 'الدمام، حي الفيصلية', plan: 'professional', status: 'active', usersCount: 8, projectsCount: 15, joinDate: '2024-01-10' },
        { id: '4', name: 'مجموعة التطوير العمراني', email: 'dev@urban-group.sa', phone: '+966503456789', address: 'الرياض، حي النخيل', plan: 'free', status: 'trial', usersCount: 3, projectsCount: 2, joinDate: '2024-04-05' },
        { id: '5', name: 'شركة المقاولات السعودية', email: 'saudi@contractors.com', phone: '+966502345678', address: 'مكة، حي الشوقية', plan: 'enterprise', status: 'inactive', usersCount: 45, projectsCount: 120, joinDate: '2022-03-01' }
    ];

    const planColors = {
        free: 'bg-slate-100 text-slate-600',
        professional: 'bg-emerald-100 text-emerald-700',
        enterprise: 'bg-purple-100 text-purple-700'
    };

    const statusColors = {
        active: 'bg-green-100 text-green-700',
        inactive: 'bg-red-100 text-red-700',
        trial: 'bg-amber-100 text-amber-700'
    };

    const filteredCompanies = companies.filter(company =>
        company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-8" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <Building2 className="w-7 h-7 text-emerald-500" />
                        {getLabel('title')}
                    </h1>
                    <p className="text-slate-500 mt-1">{filteredCompanies.length} {getLabel('companies')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
                        <Download className="w-4 h-4" />
                        {getLabel('export')}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-400 hover:to-teal-400 transition-all">
                        <Plus className="w-4 h-4" />
                        {getLabel('addCompany')}
                    </button>
                </div>
            </div>

            {/* Search & Filter Bar */}
            <div className="flex items-center gap-4 mb-6">
                <div className="relative flex-1 max-w-md">
                    <Search className="w-5 h-5 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                    <input
                        type="text"
                        placeholder={getLabel('search')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pr-10 pl-4 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
                    />
                </div>
                <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
                    <Filter className="w-4 h-4" />
                    {getLabel('filter')}
                </button>
            </div>

            {/* Companies Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="p-4 text-right font-medium text-slate-600">
                                <div className="flex items-center gap-1 cursor-pointer hover:text-slate-800">
                                    {getLabel('name')}
                                    <ArrowUpDown className="w-4 h-4" />
                                </div>
                            </th>
                            <th className="p-4 text-right font-medium text-slate-600">{getLabel('contact')}</th>
                            <th className="p-4 text-center font-medium text-slate-600">{getLabel('users')}</th>
                            <th className="p-4 text-center font-medium text-slate-600">{getLabel('projects')}</th>
                            <th className="p-4 text-center font-medium text-slate-600">{getLabel('plan')}</th>
                            <th className="p-4 text-center font-medium text-slate-600">{getLabel('status')}</th>
                            <th className="p-4 text-center font-medium text-slate-600">{getLabel('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredCompanies.map((company) => (
                            <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 bg-gradient-to-br from-slate-200 to-slate-300 rounded-xl flex items-center justify-center">
                                            <Building2 className="w-6 h-6 text-slate-500" />
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800">{company.name}</p>
                                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {company.address}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="space-y-1">
                                        <div className="flex items-center gap-2 text-sm text-slate-600">
                                            <Mail className="w-4 h-4 text-slate-400" />
                                            {company.email}
                                        </div>
                                        <div className="flex items-center gap-2 text-sm text-slate-600" dir="ltr">
                                            <Phone className="w-4 h-4 text-slate-400" />
                                            {company.phone}
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <div className="flex items-center justify-center gap-1 text-slate-600">
                                        <Users className="w-4 h-4 text-slate-400" />
                                        {company.usersCount}
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <div className="flex items-center justify-center gap-1 text-slate-600">
                                        <FolderOpen className="w-4 h-4 text-slate-400" />
                                        {company.projectsCount}
                                    </div>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${planColors[company.plan]}`}>
                                        {company.plan}
                                    </span>
                                </td>
                                <td className="p-4 text-center">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[company.status]}`}>
                                        {getLabel(company.status as keyof typeof t)}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-center gap-2">
                                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title={getLabel('view')}>
                                            <Eye className="w-4 h-4 text-slate-500" />
                                        </button>
                                        <button className="p-2 hover:bg-blue-50 rounded-lg transition-colors" title={getLabel('subscription')}>
                                            <CreditCard className="w-4 h-4 text-blue-500" />
                                        </button>
                                        <button className="p-2 hover:bg-slate-100 rounded-lg transition-colors" title={getLabel('edit')}>
                                            <Edit2 className="w-4 h-4 text-slate-500" />
                                        </button>
                                        <button className="p-2 hover:bg-red-50 rounded-lg transition-colors" title={getLabel('delete')}>
                                            <Trash2 className="w-4 h-4 text-red-500" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>

                {/* Pagination */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        {getLabel('showing')} 1-{filteredCompanies.length} {getLabel('of')} {companies.length} {getLabel('companies')}
                    </p>
                    <div className="flex items-center gap-2">
                        <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button className="px-3 py-1 bg-emerald-500 text-white rounded-lg">1</button>
                        <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompaniesPage;
