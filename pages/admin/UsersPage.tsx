import React, { useState } from 'react';
import {
    Users, Search, Plus, Edit2, Trash2, MoreVertical, Mail, Phone,
    Calendar, Shield, Check, X, ChevronLeft, ChevronRight, Download,
    Filter, ArrowUpDown
} from 'lucide-react';

interface UsersPageProps {
    language: 'ar' | 'en';
}

interface User {
    id: string;
    name: string;
    email: string;
    phone: string;
    company: string;
    plan: 'free' | 'professional' | 'enterprise';
    status: 'active' | 'inactive' | 'pending';
    joinDate: string;
    verified: boolean;
}

const UsersPage: React.FC<UsersPageProps> = ({ language }) => {
    const isRtl = language === 'ar';
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);

    const t = {
        title: { ar: 'إدارة المستخدمين', en: 'User Management' },
        search: { ar: 'بحث عن مستخدم...', en: 'Search users...' },
        addUser: { ar: 'إضافة مستخدم', en: 'Add User' },
        export: { ar: 'تصدير', en: 'Export' },
        filter: { ar: 'فلترة', en: 'Filter' },
        name: { ar: 'الاسم', en: 'Name' },
        email: { ar: 'البريد', en: 'Email' },
        phone: { ar: 'الجوال', en: 'Phone' },
        company: { ar: 'الشركة', en: 'Company' },
        plan: { ar: 'الباقة', en: 'Plan' },
        status: { ar: 'الحالة', en: 'Status' },
        actions: { ar: 'إجراءات', en: 'Actions' },
        active: { ar: 'نشط', en: 'Active' },
        inactive: { ar: 'غير نشط', en: 'Inactive' },
        pending: { ar: 'قيد الانتظار', en: 'Pending' },
        verified: { ar: 'موثق', en: 'Verified' },
        notVerified: { ar: 'غير موثق', en: 'Not Verified' },
        edit: { ar: 'تعديل', en: 'Edit' },
        delete: { ar: 'حذف', en: 'Delete' },
        showing: { ar: 'عرض', en: 'Showing' },
        of: { ar: 'من', en: 'of' },
        users: { ar: 'مستخدم', en: 'users' }
    };

    const getLabel = (key: keyof typeof t) => t[key][language];

    // Mock users data
    const users: User[] = [
        { id: '1', name: 'أحمد محمد', email: 'ahmed@example.com', phone: '+966501234567', company: 'شركة البناء', plan: 'professional', status: 'active', joinDate: '2024-01-15', verified: true },
        { id: '2', name: 'سارة أحمد', email: 'sara@example.com', phone: '+966507654321', company: 'مؤسسة التعمير', plan: 'free', status: 'active', joinDate: '2024-02-20', verified: false },
        { id: '3', name: 'محمد علي', email: 'mohamed@example.com', phone: '+966509876543', company: 'شركة الإنشاءات', plan: 'enterprise', status: 'active', joinDate: '2024-03-10', verified: true },
        { id: '4', name: 'فاطمة عبدالله', email: 'fatma@example.com', phone: '+966503456789', company: 'مجموعة التطوير', plan: 'professional', status: 'pending', joinDate: '2024-04-05', verified: false },
        { id: '5', name: 'خالد سعود', email: 'khaled@example.com', phone: '+966502345678', company: 'شركة المقاولات', plan: 'free', status: 'inactive', joinDate: '2024-01-01', verified: true }
    ];

    const planColors = {
        free: 'bg-slate-100 text-slate-600',
        professional: 'bg-emerald-100 text-emerald-700',
        enterprise: 'bg-purple-100 text-purple-700'
    };

    const statusColors = {
        active: 'bg-green-100 text-green-700',
        inactive: 'bg-red-100 text-red-700',
        pending: 'bg-amber-100 text-amber-700'
    };

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.company.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const toggleSelectUser = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const toggleSelectAll = () => {
        if (selectedUsers.length === filteredUsers.length) {
            setSelectedUsers([]);
        } else {
            setSelectedUsers(filteredUsers.map(u => u.id));
        }
    };

    return (
        <div className="p-8" dir={isRtl ? 'rtl' : 'ltr'}>
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                        <Users className="w-7 h-7 text-emerald-500" />
                        {getLabel('title')}
                    </h1>
                    <p className="text-slate-500 mt-1">{filteredUsers.length} {getLabel('users')}</p>
                </div>
                <div className="flex items-center gap-3">
                    <button className="flex items-center gap-2 px-4 py-2 border border-slate-200 rounded-xl text-slate-600 hover:bg-slate-50 transition-colors">
                        <Download className="w-4 h-4" />
                        {getLabel('export')}
                    </button>
                    <button
                        onClick={() => setShowAddModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl hover:from-emerald-400 hover:to-teal-400 transition-all"
                    >
                        <Plus className="w-4 h-4" />
                        {getLabel('addUser')}
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

            {/* Users Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-slate-50 border-b border-slate-100">
                        <tr>
                            <th className="p-4 text-right">
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                                    onChange={toggleSelectAll}
                                    className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                                />
                            </th>
                            <th className="p-4 text-right font-medium text-slate-600">
                                <div className="flex items-center gap-1 cursor-pointer hover:text-slate-800">
                                    {getLabel('name')}
                                    <ArrowUpDown className="w-4 h-4" />
                                </div>
                            </th>
                            <th className="p-4 text-right font-medium text-slate-600">{getLabel('email')}</th>
                            <th className="p-4 text-right font-medium text-slate-600">{getLabel('phone')}</th>
                            <th className="p-4 text-right font-medium text-slate-600">{getLabel('company')}</th>
                            <th className="p-4 text-right font-medium text-slate-600">{getLabel('plan')}</th>
                            <th className="p-4 text-right font-medium text-slate-600">{getLabel('status')}</th>
                            <th className="p-4 text-center font-medium text-slate-600">{getLabel('actions')}</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                                <td className="p-4">
                                    <input
                                        type="checkbox"
                                        checked={selectedUsers.includes(user.id)}
                                        onChange={() => toggleSelectUser(user.id)}
                                        className="w-4 h-4 rounded border-slate-300 text-emerald-500 focus:ring-emerald-500"
                                    />
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center text-white font-bold">
                                            {user.name.charAt(0)}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-800">{user.name}</p>
                                            <p className="text-xs text-slate-400 flex items-center gap-1">
                                                <Calendar className="w-3 h-3" />
                                                {user.joinDate}
                                            </p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-slate-600">
                                        <Mail className="w-4 h-4 text-slate-400" />
                                        {user.email}
                                        {user.verified && <Check className="w-4 h-4 text-emerald-500" />}
                                    </div>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center gap-2 text-slate-600" dir="ltr">
                                        <Phone className="w-4 h-4 text-slate-400" />
                                        {user.phone}
                                    </div>
                                </td>
                                <td className="p-4 text-slate-600">{user.company}</td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${planColors[user.plan]}`}>
                                        {user.plan}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[user.status]}`}>
                                        {getLabel(user.status as keyof typeof t)}
                                    </span>
                                </td>
                                <td className="p-4">
                                    <div className="flex items-center justify-center gap-2">
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
                        {getLabel('showing')} 1-{filteredUsers.length} {getLabel('of')} {users.length} {getLabel('users')}
                    </p>
                    <div className="flex items-center gap-2">
                        <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors disabled:opacity-50" disabled>
                            <ChevronRight className="w-4 h-4" />
                        </button>
                        <button className="px-3 py-1 bg-emerald-500 text-white rounded-lg">1</button>
                        <button className="px-3 py-1 hover:bg-slate-100 rounded-lg">2</button>
                        <button className="px-3 py-1 hover:bg-slate-100 rounded-lg">3</button>
                        <button className="p-2 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">
                            <ChevronLeft className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UsersPage;
