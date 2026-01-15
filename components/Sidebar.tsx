import React, { useState } from 'react';
import { Settings, MapPin, TrendingUp, Calculator, Briefcase, Ruler, Plus, Trash2, Home, Zap, FileText, User, LayoutGrid, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RefreshCw, Users, HardHat, DollarSign, LayoutTemplate, Palette, Languages, Check } from 'lucide-react';
import { AppState, ProjectType, LocationType, RoomConfig, FacadeConfig, TeamMember, ExecutionMethod, ViewMode, Language } from '../types';
import { PROJECT_DEFAULTS, TRANSLATIONS } from '../constants';

interface SidebarProps {
    state: AppState;
    onChange: (updates: Partial<AppState>) => void;
    isDemoMode?: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ state, onChange, isDemoMode = false }) => {
    const [activeTab, setActiveTab] = useState<'main' | 'rooms' | 'facades' | 'team' | 'info'>('main');
    const [langMenuOpen, setLangMenuOpen] = useState(false);

    const t = (key: string) => TRANSLATIONS[key]?.[state.language] || key;

    const getRoomOptions = (projectType: ProjectType) => {
        switch (projectType) {
            case 'tower':
                return [
                    { label: t('room_office'), value: 'office' },
                    { label: t('room_shop'), value: 'shop' },
                    { label: t('room_corridor'), value: 'corridor' },
                    { label: t('room_service'), value: 'service' },
                    { label: t('room_bathroom'), value: 'bathroom' }
                ];
            case 'villa':
            case 'rest_house':
                return [
                    { label: t('room_majlis'), value: 'majlis' },
                    { label: t('room_bedroom'), value: 'bedroom' },
                    { label: t('room_kitchen'), value: 'kitchen' },
                    { label: t('room_living'), value: 'living' },
                    { label: t('room_bathroom'), value: 'bathroom' }
                ];
            default:
                return [
                    { label: t('room_general'), value: 'living' },
                    { label: t('room_office'), value: 'office' }
                ];
        }
    };

    const getFacadeOptions = () => {
        return [
            { label: t('mat_paint'), value: 'paint' },
            { label: t('mat_stone'), value: 'stone' },
            { label: t('mat_glass'), value: 'glass' },
            { label: t('mat_cladding'), value: 'cladding' },
            { label: t('mat_grc'), value: 'grc' },
        ];
    };

    const addRoom = () => {
        const newRoom: RoomConfig = {
            id: Math.random().toString(36).substr(2, 9),
            type: state.projectType === 'tower' ? 'office' : 'bedroom',
            name: t('new_room_name'),
            count: 1,
            area: 20,
            sockets: 4,
            switches: 2,
            acPoints: 1
        };
        onChange({ rooms: [...state.rooms, newRoom] });
    };

    const addFacade = () => {
        const newFacade: FacadeConfig = {
            id: Math.random().toString(36).substr(2, 9),
            direction: 'north',
            material: 'paint',
            area: 50
        };
        onChange({ facades: [...state.facades, newFacade] });
    };

    const addTeamMember = () => {
        const newMember: TeamMember = {
            id: Math.random().toString(36).substr(2, 9),
            role: t('new_member_role'),
            count: 1,
            monthlyCost: 3000,
            durationMonths: state.metadata.projectDurationMonths || 6
        };
        onChange({ team: [...state.team, newMember] });
    };

    const updateRoom = (id: string, field: keyof RoomConfig, value: string | number) => {
        const updatedRooms = state.rooms.map(room => {
            if (room.id === id) {
                return { ...room, [field]: value };
            }
            return room;
        });
        onChange({ rooms: updatedRooms });
    };

    const updateFacade = (id: string, field: keyof FacadeConfig, value: string | number) => {
        const updatedFacades = state.facades.map(facade => {
            if (facade.id === id) {
                return { ...facade, [field]: value };
            }
            return facade;
        });
        onChange({ facades: updatedFacades });
    };

    const updateTeamMember = (id: string, field: keyof TeamMember, value: string | number) => {
        const updatedTeam = state.team.map(member => {
            if (member.id === id) {
                return { ...member, [field]: value };
            }
            return member;
        });
        onChange({ team: updatedTeam });
    };

    const removeRoom = (id: string) => {
        onChange({ rooms: state.rooms.filter(r => r.id !== id) });
    };

    const removeFacade = (id: string) => {
        onChange({ facades: state.facades.filter(f => f.id !== id) });
    };

    const removeTeamMember = (id: string) => {
        onChange({ team: state.team.filter(t => t.id !== id) });
    };

    const updateMetadata = (field: keyof typeof state.metadata, value: string | number) => {
        onChange({
            metadata: { ...state.metadata, [field]: value }
        });
    };

    const handleResetDefaults = () => {
        if (confirm(t('confirm_reset'))) {
            const defaults = PROJECT_DEFAULTS[state.projectType];
            onChange({
                rooms: defaults.rooms,
                facades: defaults.facades,
                team: defaults.team,
                blueprint: defaults.blueprint
            });
        }
    };

    const changeLanguage = (lang: Language) => {
        onChange({ language: lang });
        setLangMenuOpen(false);
    }

    const roomOptions = getRoomOptions(state.projectType);
    const facadeOptions = getFacadeOptions();

    const LANG_OPTIONS: { id: Language, label: string }[] = [
        { id: 'ar', label: 'العربية' },
        { id: 'en', label: 'English' },
        { id: 'fr', label: 'Français' },
        { id: 'zh', label: '中文' },
    ];

    return (
        <div className="w-80 bg-slate-800 text-white flex flex-col h-full shadow-xl overflow-hidden relative">
            {/* Navigation Switch */}
            <div className="bg-slate-900 p-2 flex gap-1">
                <button
                    onClick={() => onChange({ viewMode: 'pricing' })}
                    className={`flex-1 flex flex-col items-center justify-center py-2 px-1 text-[10px] font-bold rounded ${state.viewMode === 'pricing' ? 'bg-emerald-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                    <Calculator className="w-4 h-4 mb-1" /> {t('pricing')}
                </button>
                <button
                    onClick={() => onChange({ viewMode: 'blueprint' })}
                    className={`flex-1 flex flex-col items-center justify-center py-2 px-1 text-[10px] font-bold rounded ${state.viewMode === 'blueprint' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                    <LayoutTemplate className="w-4 h-4 mb-1" /> {t('blueprint')}
                </button>
                <button
                    onClick={() => onChange({ viewMode: 'materials' })}
                    className={`flex-1 flex flex-col items-center justify-center py-2 px-1 text-[10px] font-bold rounded ${state.viewMode === 'materials' ? 'bg-rose-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                    <Palette className="w-4 h-4 mb-1" /> {t('materials')}
                </button>
            </div>

            {/* Language Switcher - More Visible */}
            <div className="bg-gradient-to-r from-slate-700 to-slate-800 border-b border-slate-600 px-4 py-2 flex items-center justify-between">
                <span className="text-xs text-slate-400 flex items-center gap-1.5">
                    <Languages className="w-3.5 h-3.5" />
                    {state.language === 'ar' ? 'اللغة' : 'Language'}
                </span>
                <button
                    onClick={() => setLangMenuOpen(!langMenuOpen)}
                    className="flex items-center gap-2 text-sm font-medium text-white bg-slate-600 hover:bg-slate-500 px-3 py-1.5 rounded-lg border border-slate-500 transition-all hover:scale-105"
                >
                    <span className="text-lg">
                        {state.language === 'ar' ? '🇸🇦' : state.language === 'en' ? '🇬🇧' : state.language === 'fr' ? '🇫🇷' : '🇨🇳'}
                    </span>
                    {LANG_OPTIONS.find(l => l.id === state.language)?.label}
                </button>
            </div>

            {/* Language Menu Dropdown */}
            {langMenuOpen && (
                <div className="absolute top-24 right-4 z-50 bg-white text-slate-800 shadow-xl rounded-lg border border-slate-200 w-32 overflow-hidden">
                    {LANG_OPTIONS.map(opt => (
                        <button
                            key={opt.id}
                            onClick={() => changeLanguage(opt.id)}
                            className="w-full text-right px-4 py-2 text-sm hover:bg-slate-100 flex items-center justify-between"
                        >
                            <span>{opt.label}</span>
                            {state.language === opt.id && <Check className="w-3 h-3 text-emerald-500" />}
                        </button>
                    ))}
                </div>
            )}

            {/* Tab Header */}
            <div className="grid grid-cols-5 border-b border-slate-700">
                <button onClick={() => setActiveTab('main')} className={`p-3 flex justify-center ${activeTab === 'main' ? 'bg-slate-700 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:bg-slate-750'}`} title={t('settings')}><Settings className="w-4 h-4" /></button>
                <button onClick={() => setActiveTab('team')} className={`p-3 flex justify-center ${activeTab === 'team' ? 'bg-slate-700 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:bg-slate-750'}`} title={t('tab_team')}><Users className="w-4 h-4" /></button>
                <button onClick={() => setActiveTab('rooms')} className={`p-3 flex justify-center ${activeTab === 'rooms' ? 'bg-slate-700 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:bg-slate-750'}`} title={t('tab_zones')}><Home className="w-4 h-4" /></button>
                <button onClick={() => setActiveTab('facades')} className={`p-3 flex justify-center ${activeTab === 'facades' ? 'bg-slate-700 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:bg-slate-750'}`} title={t('tab_facades')}><LayoutGrid className="w-4 h-4" /></button>
                <button onClick={() => setActiveTab('info')} className={`p-3 flex justify-center ${activeTab === 'info' ? 'bg-slate-700 text-emerald-400 border-b-2 border-emerald-400' : 'text-slate-400 hover:bg-slate-750'}`} title={t('tab_data')}><FileText className="w-4 h-4" /></button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar">

                {activeTab === 'info' && (
                    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="space-y-4">
                            <h3 className="text-emerald-400 font-semibold text-sm flex items-center gap-2 border-b border-slate-600 pb-2">
                                <User className="w-4 h-4" /> {t('client_info')}
                            </h3>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400">{t('client_name')}</label>
                                <input type="text" className="sidebar-input" value={state.metadata.clientName} onChange={(e) => updateMetadata('clientName', e.target.value)} />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400">{t('tender_number')}</label>
                                <input type="text" className="sidebar-input" value={state.metadata.tenderNumber} onChange={(e) => updateMetadata('tenderNumber', e.target.value)} />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4">
                            <h3 className="text-emerald-400 font-semibold text-sm flex items-center gap-2 border-b border-slate-600 pb-2">
                                <Briefcase className="w-4 h-4" /> {t('bidder_info')}
                            </h3>
                            <div className="space-y-2">
                                <label className="text-xs text-slate-400">{t('company_name')}</label>
                                <input type="text" className="sidebar-input" value={state.metadata.companyName} onChange={(e) => updateMetadata('companyName', e.target.value)} />
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'main' && (
                    <div className="p-6 space-y-6 animate-in fade-in slide-in-from-right-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                <Settings className="w-4 h-4" /> {t('projectType')}
                            </label>
                            <select
                                value={state.projectType}
                                onChange={(e) => {
                                    const value = e.target.value as ProjectType;
                                    // في وضع العرض التجريبي، لا يسمح بتغيير لغير الفيلا فقط
                                    if (isDemoMode && value !== 'villa') {
                                        return;
                                    }
                                    onChange({ projectType: value });
                                }}
                                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                            >
                                <option value="villa">🏠 {t('proj_villa')}</option>
                                <option value="rest_house" disabled={isDemoMode} className={isDemoMode ? 'opacity-40' : ''}>🏖️ {t('proj_rest')} {isDemoMode ? '🔒' : ''}</option>
                                <option value="tower" disabled={isDemoMode} className={isDemoMode ? 'opacity-40' : ''}>🏢 {t('proj_tower')} {isDemoMode ? '🔒' : ''}</option>
                                <option value="factory" disabled={isDemoMode} className={isDemoMode ? 'opacity-40' : ''}>🏭 {t('proj_factory')} {isDemoMode ? '🔒' : ''}</option>
                                <option value="school" disabled={isDemoMode} className={isDemoMode ? 'opacity-40' : ''}>🏫 {t('proj_school')} {isDemoMode ? '🔒' : ''}</option>
                                <option value="hospital" disabled={isDemoMode} className={isDemoMode ? 'opacity-40' : ''}>🏥 {t('proj_hospital')} {isDemoMode ? '🔒' : ''}</option>
                                <option value="mosque" disabled={isDemoMode} className={isDemoMode ? 'opacity-40' : ''}>🕌 {t('proj_mosque')} {isDemoMode ? '🔒' : ''}</option>
                                <option value="hotel" disabled={isDemoMode} className={isDemoMode ? 'opacity-40' : ''}>🏨 {t('proj_hotel')} {isDemoMode ? '🔒' : ''}</option>
                                <option value="residential_building" disabled={isDemoMode} className={isDemoMode ? 'opacity-40' : ''}>🏬 {t('proj_residential')} {isDemoMode ? '🔒' : ''}</option>
                                <option value="sports_complex" disabled={isDemoMode} className={isDemoMode ? 'opacity-40' : ''}>🏟️ {t('proj_sports')} {isDemoMode ? '🔒' : ''}</option>
                            </select>
                            {isDemoMode && (
                                <p className="text-xs text-blue-400 mt-1">
                                    ℹ️ {state.language === 'ar' ? 'في وضع العرض التجريبي، يمكنك استعراض الفيلا السكنية فقط' : 'In demo mode, only Villa is available'}
                                </p>
                            )}
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-700">
                            <h3 className="text-blue-400 font-semibold text-sm flex items-center gap-2">
                                <HardHat className="w-4 h-4" /> {t('execution_method')}
                                {isDemoMode && <span className="text-xs text-slate-500 mr-auto">🔒</span>}
                            </h3>
                            {isDemoMode ? (
                                <div className="relative">
                                    <div className="blur-sm opacity-40 pointer-events-none">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 p-2 rounded bg-slate-700/50">
                                                <div className="w-3 h-3 rounded-full border border-slate-500"></div>
                                                <span className="text-sm text-slate-400">{t('exec_in_house')}</span>
                                            </div>
                                            <div className="flex items-center gap-2 p-2 rounded bg-slate-700/50">
                                                <div className="w-3 h-3 rounded-full border border-slate-500"></div>
                                                <span className="text-sm text-slate-400">{t('exec_sub')}</span>
                                            </div>
                                            <div className="flex items-center gap-2 p-2 rounded bg-slate-700/50">
                                                <div className="w-3 h-3 rounded-full border border-slate-500"></div>
                                                <span className="text-sm text-slate-400">{t('exec_turnkey')}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xs text-blue-400 bg-slate-800 px-2 py-1 rounded">
                                            {state.language === 'ar' ? 'متاح في النسخة الكاملة' : 'Available in full version'}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    {[
                                        { id: 'in_house', label: t('exec_in_house') },
                                        { id: 'subcontractor', label: t('exec_sub') },
                                        { id: 'turnkey', label: t('exec_turnkey') }
                                    ].map((method) => (
                                        <label key={method.id} className="flex items-center gap-2 p-2 rounded hover:bg-slate-700 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="execMethod"
                                                checked={state.executionMethod === method.id}
                                                onChange={() => onChange({ executionMethod: method.id as ExecutionMethod })}
                                                className="text-emerald-500 focus:ring-emerald-500"
                                            />
                                            <span className="text-sm">{method.label}</span>
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-700">
                            <h3 className="text-blue-400 font-semibold text-sm flex items-center gap-2">
                                <Calculator className="w-4 h-4" /> {t('pricing_strategy')}
                                {isDemoMode && <span className="text-xs text-slate-500 mr-auto">🔒</span>}
                            </h3>

                            {isDemoMode ? (
                                <div className="relative">
                                    <div className="blur-sm opacity-40 pointer-events-none space-y-3">
                                        <div className="flex flex-col gap-2">
                                            <div className="flex items-center gap-2 p-2 rounded bg-slate-700/50">
                                                <div className="w-3 h-3 rounded-full border border-slate-500"></div>
                                                <span className="text-sm text-slate-400">{t('strat_fixed')}</span>
                                            </div>
                                            <div className="flex items-center gap-2 p-2 rounded bg-slate-700/50">
                                                <div className="w-3 h-3 rounded-full border border-slate-500"></div>
                                                <span className="text-sm text-slate-400">{t('strat_roi')}</span>
                                            </div>
                                        </div>
                                        <div className="bg-slate-700/50 rounded p-3">
                                            <div className="text-xs text-slate-500 mb-1">{t('profit_margin')}</div>
                                            <div className="bg-slate-600 h-8 rounded"></div>
                                        </div>
                                        <div className="bg-slate-700/50 rounded p-3">
                                            <div className="text-xs text-slate-500 mb-1">{t('global_adjustment')}</div>
                                            <div className="bg-slate-600 h-8 rounded"></div>
                                        </div>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <span className="text-xs text-blue-400 bg-slate-800 px-2 py-1 rounded">
                                            {state.language === 'ar' ? 'متاح في النسخة الكاملة' : 'Available in full version'}
                                        </span>
                                    </div>
                                </div>
                            ) : (
                                <>
                                    <div className="flex flex-col gap-2">
                                        <label className="flex items-center gap-2 p-2 rounded hover:bg-slate-700 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="strategy"
                                                checked={state.pricingStrategy === 'fixed_margin'}
                                                onChange={() => onChange({ pricingStrategy: 'fixed_margin' })}
                                                className="text-emerald-500 focus:ring-emerald-500"
                                            />
                                            <span className="text-sm">{t('strat_fixed')}</span>
                                        </label>
                                        <label className="flex items-center gap-2 p-2 rounded hover:bg-slate-700 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="strategy"
                                                checked={state.pricingStrategy === 'target_roi'}
                                                onChange={() => onChange({ pricingStrategy: 'target_roi' })}
                                                className="text-emerald-500 focus:ring-emerald-500"
                                            />
                                            <span className="text-sm">{t('strat_roi')}</span>
                                        </label>
                                    </div>

                                    {state.pricingStrategy === 'fixed_margin' ? (
                                        <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                            <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                                <TrendingUp className="w-4 h-4" /> {t('profit_margin')}
                                            </label>
                                            <div className="relative">
                                                <input
                                                    type="number"
                                                    min="5"
                                                    max="200"
                                                    value={state.profitMargin}
                                                    onChange={(e) => onChange({ profitMargin: Number(e.target.value) })}
                                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 pr-10 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                                                />
                                                <span className="absolute left-3 top-3.5 text-slate-400 font-bold">%</span>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-2 bg-slate-700/50 p-3 rounded-lg border border-slate-600">
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-slate-300">{t('invested_capital')}</label>
                                                <input
                                                    type="number"
                                                    value={state.totalInvestment}
                                                    onChange={(e) => onChange({ totalInvestment: Number(e.target.value) })}
                                                    className="w-full bg-slate-700 border border-slate-600 rounded p-2 text-white text-sm"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-medium text-slate-300">{t('target_roi')}</label>
                                                <div className="relative">
                                                    <input
                                                        type="number"
                                                        value={state.targetROI}
                                                        onChange={(e) => onChange({ targetROI: Number(e.target.value) })}
                                                        className="w-full bg-slate-700 border border-slate-600 rounded p-2 pr-8 text-white text-sm"
                                                    />
                                                    <span className="absolute left-2 top-2 text-slate-400 text-xs">%</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-2 pt-2">
                                        <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                            <DollarSign className="w-4 h-4" /> {t('global_adjustment')}
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                value={state.globalPriceAdjustment}
                                                onChange={(e) => onChange({ globalPriceAdjustment: Number(e.target.value) })}
                                                className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 pr-10 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                                                placeholder="0"
                                            />
                                            <span className="absolute left-3 top-3.5 text-slate-400 font-bold">%</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500">{t('discount_hint')}</p>
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="space-y-4 pt-4 border-t border-slate-700">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <MapPin className="w-4 h-4" /> {t('location')}
                                </label>
                                <select
                                    value={state.location}
                                    onChange={(e) => onChange({ location: e.target.value as LocationType })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                                >
                                    <option value="riyadh">{t('loc_riyadh')}</option>
                                    <option value="jeddah">{t('loc_jeddah')}</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                                    <Ruler className="w-4 h-4" /> {t('land_area')}
                                </label>
                                <input
                                    type="number"
                                    value={state.landArea}
                                    onChange={(e) => onChange({ landArea: Number(e.target.value) })}
                                    className="w-full bg-slate-700 border border-slate-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-emerald-500 focus:outline-none transition-all"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* Rooms Tab */}
                {activeTab === 'rooms' && (
                    <div className="p-6 space-y-4 animate-in fade-in slide-in-from-right-4">
                        <button
                            onClick={addRoom}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-bold"
                        >
                            <Plus className="w-4 h-4" /> {t('add_room')}
                        </button>

                        <div className="space-y-3">
                            {state.rooms.map((room) => (
                                <div key={room.id} className="bg-slate-700 rounded-lg p-3 border border-slate-600 group hover:border-emerald-500 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <input
                                                type="text"
                                                value={room.name}
                                                onChange={(e) => updateRoom(room.id, 'name', e.target.value)}
                                                className="bg-transparent border-b border-transparent focus:border-emerald-500 outline-none text-sm font-bold w-full mb-1"
                                            />
                                            <select
                                                value={room.type}
                                                onChange={(e) => updateRoom(room.id, 'type', e.target.value)}
                                                className="bg-slate-800 text-xs text-slate-400 rounded p-1 outline-none w-full"
                                            >
                                                {roomOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                            </select>
                                        </div>
                                        <button onClick={() => removeRoom(room.id)} className="text-slate-500 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div>
                                            <label className="text-slate-500 block mb-0.5">{t('count')}</label>
                                            <input type="number" min="1" value={room.count} onChange={(e) => updateRoom(room.id, 'count', Number(e.target.value))} className="w-full bg-slate-800 rounded px-2 py-1" />
                                        </div>
                                        <div>
                                            <label className="text-slate-500 block mb-0.5">{t('area_m2')}</label>
                                            <input type="number" value={room.area} onChange={(e) => updateRoom(room.id, 'area', Number(e.target.value))} className="w-full bg-slate-800 rounded px-2 py-1" />
                                        </div>
                                    </div>

                                    <div className="mt-2 pt-2 border-t border-slate-600 grid grid-cols-3 gap-2">
                                        <div className="flex flex-col items-center bg-slate-800/50 p-1 rounded" title={t('sockets')}>
                                            <Zap className="w-3 h-3 text-yellow-400 mb-1" />
                                            <input type="number" value={room.sockets} onChange={(e) => updateRoom(room.id, 'sockets', Number(e.target.value))} className="w-full bg-transparent text-center text-xs outline-none" />
                                        </div>
                                        <div className="flex flex-col items-center bg-slate-800/50 p-1 rounded" title={t('switches')}>
                                            <ToggleLeftIcon className="w-3 h-3 text-blue-400 mb-1" />
                                            <input type="number" value={room.switches} onChange={(e) => updateRoom(room.id, 'switches', Number(e.target.value))} className="w-full bg-transparent text-center text-xs outline-none" />
                                        </div>
                                        <div className="flex flex-col items-center bg-slate-800/50 p-1 rounded" title={t('ac_points')}>
                                            <RefreshCw className="w-3 h-3 text-cyan-400 mb-1" />
                                            <input type="number" value={room.acPoints} onChange={(e) => updateRoom(room.id, 'acPoints', Number(e.target.value))} className="w-full bg-transparent text-center text-xs outline-none" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Facades Tab */}
                {activeTab === 'facades' && (
                    <div className="p-6 space-y-4 animate-in fade-in slide-in-from-right-4">
                        <button
                            onClick={addFacade}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-bold"
                        >
                            <Plus className="w-4 h-4" /> {t('add_facade')}
                        </button>

                        <div className="space-y-3">
                            {state.facades.map((facade) => (
                                <div key={facade.id} className="bg-slate-700 rounded-lg p-3 border border-slate-600 group hover:border-emerald-500 transition-colors">
                                    <div className="flex justify-between items-center mb-2">
                                        <h4 className="text-sm font-bold flex items-center gap-2">
                                            <LayoutGrid className="w-4 h-4 text-emerald-400" />
                                            {t('direction')}
                                        </h4>
                                        <button onClick={() => removeFacade(facade.id)} className="text-slate-500 hover:text-red-400 p-1"><Trash2 className="w-4 h-4" /></button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-2 mb-2">
                                        <div className="flex items-center justify-center bg-slate-800 rounded p-1">
                                            {facade.direction === 'north' && <ArrowUp className="w-4 h-4 text-slate-300" />}
                                            {facade.direction === 'south' && <ArrowDown className="w-4 h-4 text-slate-300" />}
                                            {facade.direction === 'east' && <ArrowRight className="w-4 h-4 text-slate-300" />}
                                            {facade.direction === 'west' && <ArrowLeft className="w-4 h-4 text-slate-300" />}
                                        </div>
                                        <select
                                            value={facade.direction}
                                            onChange={(e) => updateFacade(facade.id, 'direction', e.target.value as any)}
                                            className="bg-slate-800 text-xs rounded p-1 outline-none w-full"
                                        >
                                            <option value="north">North</option>
                                            <option value="south">South</option>
                                            <option value="east">East</option>
                                            <option value="west">West</option>
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <div>
                                            <label className="text-[10px] text-slate-500 uppercase">{t('material')}</label>
                                            <select
                                                value={facade.material}
                                                onChange={(e) => updateFacade(facade.id, 'material', e.target.value as any)}
                                                className="w-full bg-slate-800 text-xs rounded p-2 outline-none border border-slate-600"
                                            >
                                                {facadeOptions.map(opt => (
                                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500 uppercase">{t('area_m2')}</label>
                                            <input
                                                type="number"
                                                value={facade.area}
                                                onChange={(e) => updateFacade(facade.id, 'area', Number(e.target.value))}
                                                className="w-full bg-slate-800 text-xs rounded p-2 outline-none border border-slate-600"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Team Tab */}
                {activeTab === 'team' && (
                    <div className="p-6 space-y-4 animate-in fade-in slide-in-from-right-4">
                        <button
                            onClick={addTeamMember}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white p-2 rounded-lg flex items-center justify-center gap-2 transition-colors text-sm font-bold"
                        >
                            <Plus className="w-4 h-4" /> {t('add_member')}
                        </button>

                        <div className="space-y-3">
                            {state.team.map((member) => (
                                <div key={member.id} className="bg-slate-700 rounded-lg p-3 border border-slate-600 group hover:border-emerald-500 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1">
                                            <label className="text-[10px] text-slate-500 uppercase block mb-1">{t('role')}</label>
                                            <input
                                                type="text"
                                                value={member.role}
                                                onChange={(e) => updateTeamMember(member.id, 'role', e.target.value)}
                                                className="bg-slate-800 border border-slate-600 rounded p-1 text-sm w-full outline-none focus:border-emerald-500"
                                            />
                                        </div>
                                        <button onClick={() => removeTeamMember(member.id)} className="text-slate-500 hover:text-red-400 p-1 ml-2 mt-4"><Trash2 className="w-4 h-4" /></button>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 text-xs">
                                        <div>
                                            <label className="text-slate-500 block mb-0.5">{t('count')}</label>
                                            <input type="number" min="1" value={member.count} onChange={(e) => updateTeamMember(member.id, 'count', Number(e.target.value))} className="w-full bg-slate-800 rounded px-2 py-1" />
                                        </div>
                                        <div>
                                            <label className="text-slate-500 block mb-0.5">{t('salary')}</label>
                                            <input type="number" value={member.monthlyCost} onChange={(e) => updateTeamMember(member.id, 'monthlyCost', Number(e.target.value))} className="w-full bg-slate-800 rounded px-2 py-1" />
                                        </div>
                                        <div>
                                            <label className="text-slate-500 block mb-0.5">{t('duration_mo')}</label>
                                            <input type="number" value={member.durationMonths} onChange={(e) => updateTeamMember(member.id, 'durationMonths', Number(e.target.value))} className="w-full bg-slate-800 rounded px-2 py-1" />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

            </div>
            <style>{`
        .sidebar-input {
            width: 100%;
            background-color: #334155;
            border: 1px solid #475569;
            border-radius: 0.375rem;
            padding: 0.5rem;
            font-size: 0.875rem;
            color: white;
            outline: none;
        }
        .sidebar-input:focus {
            border-color: #10b981;
            ring: 2px;
            ring-color: #10b981;
        }
      `}</style>
        </div>
    );
};

const ToggleLeftIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect width="20" height="12" x="2" y="6" rx="6" ry="6" />
        <circle cx="8" cy="12" r="2" />
    </svg>
);

export default Sidebar;
