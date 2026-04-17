import React, { useState } from 'react';
import { Language } from '../types';
import {
    Truck,
    Wrench,
    Users as UsersIcon,
    Settings,
    BookOpen,
    TestTube,
    Phone,
    FolderKanban,
    Plus,
    Edit3,
    Trash2,
    Check,
    X,
    ChevronDown,
    ChevronUp,
    AlertCircle,
    Clock,
    DollarSign,
    MapPin
} from 'lucide-react';
import {
    SupplierServicesCatalog,
    DeliveryService,
    InstallationService,
    OperatorService,
    MaintenanceService,
    ConsultingService,
    TrainingService,
    InspectionService,
    EmergencyService,
    ProjectManagementService,
    ServiceCategory,
    SERVICE_CATEGORY_TRANSLATIONS,
    createDefaultServicesCatalog
} from '../services/supplierManagementService';

interface SupplierServicesCatalogProps {
    language: Language;
    services: SupplierServicesCatalog;
    onUpdate: (services: SupplierServicesCatalog) => void;
    readOnly?: boolean;
}

const SupplierServicesCatalogComponent: React.FC<SupplierServicesCatalogProps> = ({
    language,
    services,
    onUpdate,
    readOnly = false
}) => {
    const isRtl = language === 'ar';
    const [expandedCategory, setExpandedCategory] = useState<ServiceCategory | null>('delivery');
    const [editingService, setEditingService] = useState<string | null>(null);

    const t = {
        servicesCatalog: { ar: 'كتالوج الخدمات', en: 'Services Catalog' },
        freeNote: { ar: '⚠️ جميع الموردين لديهم باقة مجانية غير محدودة', en: '⚠️ All suppliers have unlimited free access' },
        enabled: { ar: 'مفعل', en: 'Enabled' },
        disabled: { ar: 'معطل', en: 'Disabled' },
        price: { ar: 'السعر', en: 'Price' },
        duration: { ar: 'المدة', en: 'Duration' },
        sar: { ar: 'ر.س', en: 'SAR' },
        hourly: { ar: 'بالساعة', en: 'Hourly' },
        daily: { ar: 'باليوم', en: 'Daily' },
        monthly: { ar: 'بالشهر', en: 'Monthly' },
        save: { ar: 'حفظ', en: 'Save' },
        cancel: { ar: 'إلغاء', en: 'Cancel' },
        edit: { ar: 'تعديل', en: 'Edit' },
        free: { ar: 'مجاني', en: 'Free' },
        // Delivery types
        standard: { ar: 'توصيل عادي', en: 'Standard Delivery' },
        express: { ar: 'توصيل سريع (نفس اليوم)', en: 'Express Delivery (Same Day)' },
        scheduled: { ar: 'توصيل مجدول', en: 'Scheduled Delivery' },
        project: { ar: 'توصيل للمشاريع', en: 'Project Delivery' },
        international: { ar: 'توصيل دولي', en: 'International Delivery' },
        // Installation types
        basic: { ar: 'تركيب أساسي', en: 'Basic Installation' },
        professional: { ar: 'تركيب احترافي', en: 'Professional Installation' },
        dismantle: { ar: 'تفكيك ونقل', en: 'Dismantle & Move' },
        reinstall: { ar: 'إعادة التركيب', en: 'Reinstallation' },
        complex: { ar: 'تركيب معقد', en: 'Complex Installation' },
        // Operator types
        operator: { ar: 'مشغل معدة', en: 'Equipment Operator' },
        driver: { ar: 'سائق', en: 'Driver' },
        team: { ar: 'فريق عمل كامل', en: 'Full Team' },
        supervisor: { ar: 'مشرف موقع', en: 'Site Supervisor' },
        // Maintenance types
        periodic_monthly: { ar: 'صيانة شهرية', en: 'Monthly Maintenance' },
        periodic_quarterly: { ar: 'صيانة ربع سنوية', en: 'Quarterly Maintenance' },
        emergency: { ar: 'صيانة طارئة', en: 'Emergency Maintenance' },
        annual_contract: { ar: 'عقد صيانة سنوي', en: 'Annual Contract' },
        overhaul: { ar: 'إصلاح شامل', en: 'Complete Overhaul' },
        // Consulting types
        technical: { ar: 'استشارة فنية', en: 'Technical Consultation' },
        site_visit: { ar: 'زيارة موقع', en: 'Site Visit' },
        design_simple: { ar: 'تصميم بسيط', en: 'Simple Design' },
        design_detailed: { ar: 'تصميم تفصيلي', en: 'Detailed Design' },
        feasibility: { ar: 'دراسة جدوى', en: 'Feasibility Study' },
        // Training types
        operation: { ar: 'تدريب على التشغيل', en: 'Operation Training' },
        basic_maintenance: { ar: 'صيانة أساسية', en: 'Basic Maintenance' },
        advanced: { ar: 'تدريب متقدم', en: 'Advanced Training' },
        safety: { ar: 'سلامة مهنية', en: 'Safety Training' },
        // Inspection types
        receiving: { ar: 'فحص استلام', en: 'Receiving Inspection' },
        periodic: { ar: 'فحص دوري', en: 'Periodic Inspection' },
        performance: { ar: 'اختبار أداء', en: 'Performance Test' },
        safety_certified: { ar: 'فحص سلامة معتمد', en: 'Certified Safety Inspection' },
        technical_report: { ar: 'تقرير فني', en: 'Technical Report' },
        // Emergency types
        hotline_24_7: { ar: 'خط طوارئ 24/7', en: '24/7 Emergency Hotline' },
        emergency_response: { ar: 'استجابة طارئة', en: 'Emergency Response' },
        temporary_replacement: { ar: 'بديل مؤقت', en: 'Temporary Replacement' },
        remote_support: { ar: 'دعم عن بُعد', en: 'Remote Support' },
        // Project Management types
        jit_delivery: { ar: 'توريد JIT', en: 'Just-In-Time Delivery' },
        project_manager: { ar: 'مدير مشروع مخصص', en: 'Dedicated Project Manager' },
        temporary_storage: { ar: 'تخزين مؤقت', en: 'Temporary Storage' },
        extended_warranty: { ar: 'ضمان ممتد', en: 'Extended Warranty' }
    };

    const getLabel = (key: string): string => {
        return (t as any)[key]?.[language as 'ar' | 'en'] || (t as any)[key]?.['en'] || key;
    };

    const categoryIcons: Record<ServiceCategory, React.ReactNode> = {
        delivery: <Truck className="w-5 h-5" />,
        installation: <Wrench className="w-5 h-5" />,
        operators: <UsersIcon className="w-5 h-5" />,
        maintenance: <Settings className="w-5 h-5" />,
        consulting: <BookOpen className="w-5 h-5" />,
        training: <BookOpen className="w-5 h-5" />,
        inspection: <TestTube className="w-5 h-5" />,
        emergency: <Phone className="w-5 h-5" />,
        project_management: <FolderKanban className="w-5 h-5" />
    };

    const toggleService = (category: ServiceCategory, serviceId: string) => {
        if (readOnly) return;

        const updatedServices = { ...services };
        const categoryServices = [...(updatedServices[category] as any[])];
        const serviceIndex = categoryServices.findIndex(s => s.id === serviceId);

        if (serviceIndex !== -1) {
            categoryServices[serviceIndex] = {
                ...categoryServices[serviceIndex],
                enabled: !categoryServices[serviceIndex].enabled
            };
            (updatedServices[category] as any) = categoryServices;
            onUpdate(updatedServices);
        }
    };

    const updateServiceField = (category: ServiceCategory, serviceId: string, field: string, value: any) => {
        if (readOnly) return;

        const updatedServices = { ...services };
        const categoryServices = [...(updatedServices[category] as any[])];
        const serviceIndex = categoryServices.findIndex(s => s.id === serviceId);

        if (serviceIndex !== -1) {
            categoryServices[serviceIndex] = {
                ...categoryServices[serviceIndex],
                [field]: value
            };
            (updatedServices[category] as any) = categoryServices;
            onUpdate(updatedServices);
        }
    };

    const getEnabledCount = (category: ServiceCategory): number => {
        const categoryServices = services[category] as any[];
        return categoryServices.filter(s => s.enabled).length;
    };

    const renderDeliveryService = (service: DeliveryService) => (
        <div key={service.id} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => toggleService('delivery', service.id)}
                        disabled={readOnly}
                        className={`w-10 h-6 rounded-full transition-colors ${service.enabled ? 'bg-emerald-500' : 'bg-slate-600'
                            } ${readOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform mx-1 ${service.enabled ? (isRtl ? '-translate-x-4' : 'translate-x-4') : ''
                            }`} />
                    </button>
                    <span className="text-white font-medium">{getLabel(service.type)}</span>
                </div>
                {!readOnly && service.enabled && (
                    <button
                        onClick={() => setEditingService(editingService === service.id ? null : service.id)}
                        className="text-slate-400 hover:text-blue-400 transition-colors"
                    >
                        <Edit3 className="w-4 h-4" />
                    </button>
                )}
            </div>

            {service.enabled && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                        <span className="text-slate-400">{getLabel('price')}:</span>
                        <span className="text-emerald-400 font-bold ms-2">
                            {service.price === 0 ? getLabel('free') : `${service.price} ${getLabel('sar')}`}
                        </span>
                    </div>
                    <div>
                        <span className="text-slate-400">{getLabel('duration')}:</span>
                        <span className="text-white ms-2">{service.duration}</span>
                    </div>
                </div>
            )}

            {editingService === service.id && (
                <div className="mt-4 pt-4 border-t border-slate-600/50 grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-slate-400 text-xs mb-1">{getLabel('price')} ({getLabel('sar')})</label>
                        <input
                            type="number"
                            value={service.price}
                            onChange={(e) => updateServiceField('delivery', service.id, 'price', parseFloat(e.target.value) || 0)}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-1.5 px-3 text-white text-sm"
                        />
                    </div>
                    <div>
                        <label className="block text-slate-400 text-xs mb-1">{getLabel('duration')}</label>
                        <input
                            type="text"
                            value={service.duration}
                            onChange={(e) => updateServiceField('delivery', service.id, 'duration', e.target.value)}
                            className="w-full bg-slate-700/50 border border-slate-600 rounded-lg py-1.5 px-3 text-white text-sm"
                        />
                    </div>
                </div>
            )}
        </div>
    );

    const renderOperatorService = (service: OperatorService) => (
        <div key={service.id} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => toggleService('operators', service.id)}
                        disabled={readOnly}
                        className={`w-10 h-6 rounded-full transition-colors ${service.enabled ? 'bg-emerald-500' : 'bg-slate-600'
                            } ${readOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform mx-1 ${service.enabled ? (isRtl ? '-translate-x-4' : 'translate-x-4') : ''
                            }`} />
                    </button>
                    <span className="text-white font-medium">{getLabel(service.type)}</span>
                </div>
            </div>

            {service.enabled && (
                <div className="grid grid-cols-3 gap-3 text-sm">
                    {service.hourlyRate && (
                        <div className="bg-slate-600/30 rounded-lg p-2 text-center">
                            <div className="text-slate-400 text-xs">{getLabel('hourly')}</div>
                            <div className="text-emerald-400 font-bold">{service.hourlyRate} {getLabel('sar')}</div>
                        </div>
                    )}
                    <div className="bg-slate-600/30 rounded-lg p-2 text-center">
                        <div className="text-slate-400 text-xs">{getLabel('daily')}</div>
                        <div className="text-emerald-400 font-bold">{service.dailyRate} {getLabel('sar')}</div>
                    </div>
                    {service.monthlyRate && (
                        <div className="bg-slate-600/30 rounded-lg p-2 text-center">
                            <div className="text-slate-400 text-xs">{getLabel('monthly')}</div>
                            <div className="text-emerald-400 font-bold">{service.monthlyRate.toLocaleString()} {getLabel('sar')}</div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const renderGenericService = (category: ServiceCategory, service: any) => (
        <div key={service.id} className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/50">
            <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => toggleService(category, service.id)}
                        disabled={readOnly}
                        className={`w-10 h-6 rounded-full transition-colors ${service.enabled ? 'bg-emerald-500' : 'bg-slate-600'
                            } ${readOnly ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                    >
                        <div className={`w-4 h-4 rounded-full bg-white transition-transform mx-1 ${service.enabled ? (isRtl ? '-translate-x-4' : 'translate-x-4') : ''
                            }`} />
                    </button>
                    <span className="text-white font-medium">{getLabel(service.type)}</span>
                </div>
            </div>

            {service.enabled && (
                <div className="grid grid-cols-2 gap-4 text-sm">
                    {service.price !== undefined && (
                        <div>
                            <span className="text-slate-400">{getLabel('price')}:</span>
                            <span className="text-emerald-400 font-bold ms-2">
                                {service.price === 0 ? getLabel('free') : `${service.price.toLocaleString()} ${getLabel('sar')}`}
                            </span>
                        </div>
                    )}
                    {service.priceIndividual !== undefined && (
                        <div>
                            <span className="text-slate-400">{getLabel('price')}:</span>
                            <span className="text-emerald-400 font-bold ms-2">{service.priceIndividual} {getLabel('sar')}</span>
                        </div>
                    )}
                    {service.duration && (
                        <div>
                            <span className="text-slate-400">{getLabel('duration')}:</span>
                            <span className="text-white ms-2">{service.duration}</span>
                        </div>
                    )}
                    {service.responseTime && (
                        <div>
                            <span className="text-slate-400">{getLabel('duration')}:</span>
                            <span className="text-white ms-2">{service.responseTime}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    const categories: ServiceCategory[] = [
        'delivery', 'installation', 'operators', 'maintenance',
        'consulting', 'training', 'inspection', 'emergency', 'project_management'
    ];

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500/10 to-teal-500/10 rounded-xl p-4 border border-emerald-500/30">
                <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                    {SERVICE_CATEGORY_TRANSLATIONS.delivery.icon} {getLabel('servicesCatalog')}
                </h3>
                <p className="text-emerald-400 text-sm">{getLabel('freeNote')}</p>
            </div>

            {/* Categories Accordion */}
            {categories.map((category) => {
                const categoryInfo = SERVICE_CATEGORY_TRANSLATIONS[category];
                const isExpanded = expandedCategory === category;
                const enabledCount = getEnabledCount(category);
                const categoryServices = services[category] as any[];

                return (
                    <div key={category} className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
                        <button
                            onClick={() => setExpandedCategory(isExpanded ? null : category)}
                            className="w-full p-4 flex items-center justify-between hover:bg-slate-700/30 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <span className="text-2xl">{categoryInfo.icon}</span>
                                <div className="text-start">
                                    <span className="text-white font-medium">{categoryInfo[language]}</span>
                                    <span className="text-slate-400 text-sm ms-2">
                                        ({enabledCount}/{categoryServices.length} {getLabel('enabled')})
                                    </span>
                                </div>
                            </div>
                            {isExpanded ? (
                                <ChevronUp className="w-5 h-5 text-slate-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-slate-400" />
                            )}
                        </button>

                        {isExpanded && (
                            <div className="p-4 pt-0 grid grid-cols-1 md:grid-cols-2 gap-3">
                                {category === 'delivery' && services.delivery.map(renderDeliveryService)}
                                {category === 'operators' && services.operators.map(renderOperatorService)}
                                {category !== 'delivery' && category !== 'operators' &&
                                    categoryServices.map((s: any) => renderGenericService(category, s))
                                }
                            </div>
                        )}
                    </div>
                );
            })}

            {/* Summary Table */}
            <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 p-4">
                <h4 className="text-white font-bold mb-4">{language === 'ar' ? '📊 ملخص الخدمات' : '📊 Services Summary'}</h4>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                    {categories.map((category) => {
                        const categoryInfo = SERVICE_CATEGORY_TRANSLATIONS[category];
                        const enabledCount = getEnabledCount(category);
                        const total = (services[category] as any[]).length;

                        return (
                            <div
                                key={category}
                                className={`p-3 rounded-xl text-center ${enabledCount > 0 ? 'bg-emerald-500/10 border border-emerald-500/30' : 'bg-slate-700/30'
                                    }`}
                            >
                                <div className="text-xl mb-1">{categoryInfo.icon}</div>
                                <div className="text-white font-bold text-sm">{enabledCount}/{total}</div>
                                <div className="text-slate-400 text-xs truncate">{categoryInfo[language]}</div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default SupplierServicesCatalogComponent;
