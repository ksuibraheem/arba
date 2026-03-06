/**
 * Client Manager Component — إدارة العملاء
 * Client directory with CRUD and project linking
 */

import React, { useState } from 'react';
import { ArbaClient } from '../../services/projectTypes';

interface ClientManagerProps {
    clients: ArbaClient[];
    language: 'ar' | 'en';
    loading?: boolean;
    onCreateClient: (data: Partial<ArbaClient>) => void;
    onUpdateClient: (id: string, data: Partial<ArbaClient>) => void;
    onDeleteClient: (id: string) => void;
    onViewProjects: (clientId: string) => void;
}

const ClientManager: React.FC<ClientManagerProps> = ({
    clients, language, loading, onCreateClient, onUpdateClient, onDeleteClient, onViewProjects
}) => {
    const isAr = language === 'ar';
    const [showForm, setShowForm] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: '', phone: '', email: '', company: '', cr: '', vat: '', address: '', city: '', notes: '',
    });

    const filtered = clients.filter(c => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        return c.name.toLowerCase().includes(term) || c.phone.includes(term) || c.email.toLowerCase().includes(term);
    });

    const handleSubmit = () => {
        if (!formData.name) return;
        if (editingId) {
            onUpdateClient(editingId, formData);
            setEditingId(null);
        } else {
            onCreateClient(formData);
        }
        setFormData({ name: '', phone: '', email: '', company: '', cr: '', vat: '', address: '', city: '', notes: '' });
        setShowForm(false);
    };

    const handleEdit = (client: ArbaClient) => {
        setEditingId(client.id);
        setFormData({
            name: client.name, phone: client.phone, email: client.email,
            company: client.company || '', cr: client.cr || '', vat: client.vat || '',
            address: client.address || '', city: client.city || '', notes: client.notes || '',
        });
        setShowForm(true);
    };

    const formatValue = (v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}K` : v.toFixed(0);

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between flex-wrap gap-3">
                <h2 className="text-xl font-bold text-white">
                    {isAr ? '👥 قاعدة العملاء' : '👥 Client Directory'}
                </h2>
                <button
                    onClick={() => { setShowForm(!showForm); setEditingId(null); setFormData({ name: '', phone: '', email: '', company: '', cr: '', vat: '', address: '', city: '', notes: '' }); }}
                    className="px-4 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium text-sm hover:shadow-lg transition-all"
                >
                    {showForm ? (isAr ? '✕ إلغاء' : '✕ Cancel') : (isAr ? '+ عميل جديد' : '+ New Client')}
                </button>
            </div>

            {/* Search */}
            <input
                type="text"
                placeholder={isAr ? 'بحث بالاسم أو الجوال أو البريد...' : 'Search by name, phone, or email...'}
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700 text-white text-sm placeholder-slate-500 focus:outline-none focus:border-purple-500"
                dir={isAr ? 'rtl' : 'ltr'}
            />

            {/* Add/Edit Form */}
            {showForm && (
                <div className="rounded-2xl bg-slate-800/60 border border-slate-700 p-5 space-y-3">
                    <h3 className="text-white font-bold text-sm mb-3">
                        {editingId ? (isAr ? 'تعديل العميل' : 'Edit Client') : (isAr ? 'إضافة عميل جديد' : 'Add New Client')}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {[
                            { key: 'name', label: isAr ? 'الاسم *' : 'Name *', type: 'text' },
                            { key: 'phone', label: isAr ? 'الجوال' : 'Phone', type: 'tel' },
                            { key: 'email', label: isAr ? 'البريد' : 'Email', type: 'email' },
                            { key: 'company', label: isAr ? 'الشركة' : 'Company', type: 'text' },
                            { key: 'cr', label: isAr ? 'السجل التجاري' : 'CR', type: 'text' },
                            { key: 'vat', label: isAr ? 'الرقم الضريبي' : 'VAT', type: 'text' },
                            { key: 'city', label: isAr ? 'المدينة' : 'City', type: 'text' },
                            { key: 'address', label: isAr ? 'العنوان' : 'Address', type: 'text' },
                        ].map(field => (
                            <div key={field.key}>
                                <label className="text-xs text-slate-400 mb-1 block">{field.label}</label>
                                <input
                                    type={field.type}
                                    value={(formData as any)[field.key]}
                                    onChange={e => setFormData(prev => ({ ...prev, [field.key]: e.target.value }))}
                                    className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-600 text-white text-sm focus:outline-none focus:border-purple-500"
                                    dir={isAr ? 'rtl' : 'ltr'}
                                />
                            </div>
                        ))}
                    </div>
                    <div>
                        <label className="text-xs text-slate-400 mb-1 block">{isAr ? 'ملاحظات' : 'Notes'}</label>
                        <textarea
                            value={formData.notes}
                            onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                            className="w-full px-3 py-2 rounded-lg bg-slate-900/60 border border-slate-600 text-white text-sm focus:outline-none focus:border-purple-500 h-20 resize-none"
                            dir={isAr ? 'rtl' : 'ltr'}
                        />
                    </div>
                    <button
                        onClick={handleSubmit}
                        disabled={!formData.name}
                        className="px-6 py-2 rounded-xl bg-gradient-to-r from-purple-500 to-pink-600 text-white font-medium text-sm disabled:opacity-50 hover:shadow-lg transition-all"
                    >
                        {editingId ? (isAr ? 'تحديث' : 'Update') : (isAr ? 'إضافة' : 'Add')}
                    </button>
                </div>
            )}

            {/* Client Table */}
            {loading ? (
                <div className="space-y-3">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="rounded-xl bg-slate-800/40 border border-slate-700 p-4 animate-pulse h-16" />
                    ))}
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16 text-slate-500">
                    <div className="text-5xl mb-4">👥</div>
                    <p>{isAr ? 'لا يوجد عملاء' : 'No clients yet'}</p>
                </div>
            ) : (
                <div className="space-y-2">
                    {filtered.map(client => (
                        <div
                            key={client.id}
                            className="rounded-xl bg-slate-800/40 border border-slate-700/60 p-4 flex items-center justify-between hover:border-purple-500/30 transition-all group"
                        >
                            <div className="flex items-center gap-4 flex-1 min-w-0">
                                {/* Avatar */}
                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                                    {client.name.charAt(0)}
                                </div>
                                {/* Info */}
                                <div className="min-w-0">
                                    <h4 className="text-white font-medium text-sm truncate">{client.name}</h4>
                                    <p className="text-slate-500 text-xs truncate">
                                        {client.company && `${client.company} • `}
                                        {client.phone || client.email}
                                    </p>
                                </div>
                            </div>

                            {/* Projects count */}
                            <div className="text-center mx-4">
                                <span className="text-emerald-400 font-bold text-sm">{client.projectIds.length}</span>
                                <p className="text-slate-500 text-[10px]">{isAr ? 'مشاريع' : 'projects'}</p>
                            </div>

                            {/* Value */}
                            <div className="text-center mx-4">
                                <span className="text-white font-bold text-sm">{formatValue(client.totalValue)}</span>
                                <p className="text-slate-500 text-[10px]">{isAr ? 'ر.س' : 'SAR'}</p>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => onViewProjects(client.id)} className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 text-xs" title={isAr ? 'المشاريع' : 'Projects'}>📁</button>
                                <button onClick={() => handleEdit(client)} className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 hover:bg-amber-500/20 text-xs" title={isAr ? 'تعديل' : 'Edit'}>✏️</button>
                                <button onClick={() => onDeleteClient(client.id)} className="p-1.5 rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 text-xs" title={isAr ? 'حذف' : 'Delete'}>🗑</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ClientManager;
