import React, { useState, useMemo } from 'react';
import {
  Ruler, Maximize, Layers, LayoutTemplate, Square, Plus, Trash2, AlertTriangle, PieChart,
  Shovel, Building2, Paintbrush, ChevronRight, ChevronLeft, Info, Zap, MapPin, ArrowDown,
  Columns3, Grid3X3, Home, Bath, CookingPot, Bed, Sofa, Download, FileText, Sparkles, X,
  Shield, CheckCircle2, XCircle, AlertOctagon, Package
} from 'lucide-react';
import {
  BlueprintConfig, FloorDetails, SlabType, FloorZone, Language, ProjectType,
  ExcavationConfig, FoundationConfig, RoomFinishSchedule, FacadeSchedule,
  SoilType, FoundationType, FinishMaterial, FacadeFinishType, RoomType, FacadeDirection,
  ShoringType, DewateringType
} from '../types';
import { TRANSLATIONS } from '../constants';
import { runCognitiveEngine, CognitiveEngineOutput } from '../services/cognitiveCalculations';
import { downloadDxf } from '../services/dxfExportService';
import DrawingsPanel from './DrawingsPanel';
import { generateComplianceReport, ComplianceReport, ComplianceStatus } from '../services/complianceEngine';
import { getTemplatesForType, BlueprintTemplate } from '../constants/blueprintTemplates';
import { blueprintIntelligence } from '../services/blueprintIntelligence';

interface BlueprintEditorProps {
    blueprint: BlueprintConfig;
    language: Language;
    soilType?: SoilType;
    projectType?: ProjectType;
    /** بيانات المشروع لإطار المخططات (Title Block) */
    projectMeta?: {
        ownerName?: string;
        projectName?: string;
        planNumber?: string;
        companyName?: string;
        permitNumber?: string;
    };
    onChange: (updates: Partial<BlueprintConfig>) => void;
    onUpdateTotalArea: (landArea: number, buildArea: number) => void;
}

type WizardStep = 'architectural' | 'structural' | 'executive' | 'drawings' | 'compliance';

const BlueprintEditor: React.FC<BlueprintEditorProps> = ({ blueprint, language, soilType, projectType, projectMeta, onChange, onUpdateTotalArea }) => {

    const resolvedSoilType: SoilType = soilType || 'normal';

    const t = (key: string) => TRANSLATIONS[key]?.[language] || key;
    const isRtl = language === 'ar';
    const [activeStep, setActiveStep] = useState<WizardStep>('architectural');
    const [showCognitiveOutput, setShowCognitiveOutput] = useState(false);
    const [appliedTemplateId, setAppliedTemplateId] = useState<string | null>(null);
    const [showTemplates, setShowTemplates] = useState(true);
    const [collapsedSections, setCollapsedSections] = useState<Set<string>>(new Set());

    const toggleSection = (id: string) => {
        setCollapsedSections(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
    };

    // =================== Templates for current project type ===================
    const availableTemplates = useMemo(() => {
        if (!projectType) return [];
        return getTemplatesForType(projectType);
    }, [projectType]);

    const applyTemplate = (template: BlueprintTemplate) => {
        const config = template.config;
        onChange(config);
        setAppliedTemplateId(template.id);
        const landArea = config.plotLength * config.plotWidth;
        const buildArea = config.floors.reduce((acc, f) => acc + f.area, 0);
        onUpdateTotalArea(landArea, buildArea);
    };

    const clearTemplate = () => {
        setAppliedTemplateId(null);
    };

    const applySmartPrediction = () => {
        if (!projectType) return;
        const currentPlotArea = blueprint.plotLength * blueprint.plotWidth;
        const currentFloors = blueprint.floors.length || 2;
        
        const prediction = blueprintIntelligence.predict({
            projectType,
            plotArea: currentPlotArea || 300,
            floorsCount: currentFloors,
        });
        
        onChange(prediction.config);
        setAppliedTemplateId('ai-prediction');
        const landArea = prediction.config.plotLength * prediction.config.plotWidth;
        const buildArea = prediction.config.floors.reduce((acc, f) => acc + f.area, 0);
        onUpdateTotalArea(landArea, buildArea);
    };

    // =================== Cognitive Engine Output ===================
    const cognitiveOutput = useMemo(() => {
        try {
            return runCognitiveEngine(blueprint, resolvedSoilType);
        } catch {
            return null;
        }
    }, [blueprint, resolvedSoilType]);

    // =================== AI Engineering Validator ===================
    const aiErrors = useMemo(() => {
        if (!projectType) return [];
        const landArea = blueprint.plotLength * blueprint.plotWidth;
        return blueprintIntelligence.analyzeBlueprint(blueprint, projectType, landArea || 300);
    }, [blueprint, projectType]);

    // =================== Handlers ===================
    const handleDimensionChange = (field: keyof BlueprintConfig, value: number) => {
        const newConfig = { ...blueprint, [field]: value };
        onChange(newConfig);
        recalculateTotals(newConfig);
    };

    const updateFloor = (id: string, updates: Partial<FloorDetails>) => {
        const newFloors = blueprint.floors.map(f => f.id === id ? { ...f, ...updates } : f);
        const newConfig = { ...blueprint, floors: newFloors };
        onChange(newConfig);
        recalculateTotals(newConfig);
    };

    const addFloor = () => {
        const lastFloor = blueprint.floors[blueprint.floors.length - 1];
        const newFloor: FloorDetails = {
            id: Math.random().toString(36).substr(2, 9),
            name: `${language === 'ar' ? 'طابق' : 'Floor'} ${blueprint.floors.length + 1}`,
            area: lastFloor ? lastFloor.area : 150,
            height: 3.2,
            slabType: 'flat',
            columnsCount: lastFloor ? lastFloor.columnsCount : 12,
            zones: [],
            perimeterWallLength: 0,
            internalWallLength: 0,
        };
        const newConfig = { ...blueprint, floors: [...blueprint.floors, newFloor] };
        onChange(newConfig);
        recalculateTotals(newConfig);
    };

    const removeFloor = (id: string) => {
        if (blueprint.floors.length <= 1) return;
        const newConfig = { ...blueprint, floors: blueprint.floors.filter(f => f.id !== id) };
        onChange(newConfig);
        recalculateTotals(newConfig);
    };

    const updateExcavation = (updates: Partial<ExcavationConfig>) => {
        const current = blueprint.excavation || { excavationDepth: 1.5, soilReplacementNeeded: false, soilReplacementThickness: 0, zeroLevel: 0.3 };
        onChange({ ...blueprint, excavation: { ...current, ...updates } });
    };

    const updateFoundation = (updates: Partial<FoundationConfig>) => {
        const current = blueprint.foundation || { type: 'isolated_footings', neckColumnHeight: 0.5, tieBeamDepth: 0.6, tieBeamWidth: 0.3, footingDepth: 0.5, footingWidth: 1.2, raftThickness: 0 };
        onChange({ ...blueprint, foundation: { ...current, ...updates } });
    };

    const addRoomFinish = () => {
        const existing = blueprint.roomFinishes || [];
        const newRoom: RoomFinishSchedule = {
            id: `rf_${Date.now()}`,
            roomName: language === 'ar' ? 'غرفة جديدة' : 'New Room',
            roomType: 'bedroom',
            length: 5, width: 4, height: 3.2,
            floorFinish: 'ceramic_60x60',
            wallFinish: 'paint_plastic',
            ceilingFinish: 'paint_plastic',
            windowDoorRatio: 0.12,
            floorId: blueprint.floors[0]?.id || '',
        };
        onChange({ ...blueprint, roomFinishes: [...existing, newRoom] });
    };

    const updateRoomFinish = (id: string, updates: Partial<RoomFinishSchedule>) => {
        const rooms = (blueprint.roomFinishes || []).map(r => r.id === id ? { ...r, ...updates } : r);
        onChange({ ...blueprint, roomFinishes: rooms });
    };

    const removeRoomFinish = (id: string) => {
        onChange({ ...blueprint, roomFinishes: (blueprint.roomFinishes || []).filter(r => r.id !== id) });
    };

    const addFacade = () => {
        const existing = blueprint.facadeSchedules || [];
        const totalHeight = blueprint.floors.reduce((s, f) => s + f.height, 0);
        const newFacade: FacadeSchedule = {
            id: `fs_${Date.now()}`,
            direction: 'north',
            width: blueprint.plotWidth,
            totalHeight,
            finishType: 'plaster_paint',
            windowDoorRatio: 0.15,
        };
        onChange({ ...blueprint, facadeSchedules: [...existing, newFacade] });
    };

    const updateFacade = (id: string, updates: Partial<FacadeSchedule>) => {
        const facades = (blueprint.facadeSchedules || []).map(f => f.id === id ? { ...f, ...updates } : f);
        onChange({ ...blueprint, facadeSchedules: facades });
    };

    const removeFacade = (id: string) => {
        onChange({ ...blueprint, facadeSchedules: (blueprint.facadeSchedules || []).filter(f => f.id !== id) });
    };

    const recalculateTotals = (config: BlueprintConfig) => {
        const landArea = config.plotLength * config.plotWidth;
        const buildArea = config.floors.reduce((acc, f) => acc + f.area, 0);
        onUpdateTotalArea(landArea, buildArea);
    };

    // =================== Step Definitions ===================
    const steps: { key: WizardStep; label: string; icon: React.ReactNode; color: string }[] = [
        { key: 'architectural', label: language === 'ar' ? 'المخطط المعماري' : 'Architectural Plan', icon: <Home className="w-5 h-5" />, color: 'from-indigo-500 to-violet-600' },
        { key: 'structural', label: language === 'ar' ? 'المخطط الإنشائي' : 'Structural Plan', icon: <Building2 className="w-5 h-5" />, color: 'from-amber-500 to-orange-600' },
        { key: 'executive', label: language === 'ar' ? 'المخطط التنفيذي' : 'Executive Plan', icon: <Paintbrush className="w-5 h-5" />, color: 'from-emerald-500 to-teal-600' },
        { key: 'drawings', label: language === 'ar' ? 'الرسومات والطباعة' : 'Drawings & AutoCAD', icon: <FileText className="w-5 h-5" />, color: 'from-rose-500 to-pink-600' },
        { key: 'compliance', label: language === 'ar' ? 'الامتثال التنظيمي' : 'Compliance', icon: <Shield className="w-5 h-5" />, color: 'from-cyan-500 to-blue-600' },
    ];

    const SLAB_TYPES: { id: SlabType; label: string }[] = [
        { id: 'solid', label: language === 'ar' ? 'عادي (Solid)' : 'Solid Slab' },
        { id: 'hordi', label: language === 'ar' ? 'هوردي (Hollow Block)' : 'Hordi Slab' },
        { id: 'flat', label: language === 'ar' ? 'فلات بليت (Flat)' : 'Flat Slab' },
        { id: 'waffle', label: language === 'ar' ? 'وافل (Waffle)' : 'Waffle Slab' },
    ];

    const FOUNDATION_TYPES: { id: FoundationType; label: string }[] = [
        { id: 'isolated_footings', label: language === 'ar' ? 'قواعد منفصلة' : 'Isolated Footings' },
        { id: 'strip_footings', label: language === 'ar' ? 'قواعد شريطية' : 'Strip Footings' },
        { id: 'raft', label: language === 'ar' ? 'لبشة (Raft)' : 'Raft Foundation' },
        { id: 'piles', label: language === 'ar' ? 'خوازيق' : 'Piles' },
    ];

    const FINISH_MATERIALS: { id: FinishMaterial; label: string }[] = [
        { id: 'ceramic_60x60', label: language === 'ar' ? 'سيراميك 60×60' : 'Ceramic 60×60' },
        { id: 'ceramic_30x60', label: language === 'ar' ? 'سيراميك 30×60' : 'Ceramic 30×60' },
        { id: 'porcelain_120x60', label: language === 'ar' ? 'بورسلان 120×60' : 'Porcelain 120×60' },
        { id: 'marble', label: language === 'ar' ? 'رخام' : 'Marble' },
        { id: 'granite', label: language === 'ar' ? 'جرانيت' : 'Granite' },
        { id: 'paint_plastic', label: language === 'ar' ? 'دهان بلاستيك' : 'Plastic Paint' },
        { id: 'paint_velvet', label: language === 'ar' ? 'دهان مخمل' : 'Velvet Paint' },
        { id: 'gypsum_board', label: language === 'ar' ? 'جبس بورد' : 'Gypsum Board' },
        { id: 'gypsum_plaster', label: language === 'ar' ? 'جبس بلدي' : 'Local Gypsum' },
        { id: 'cement_plaster', label: language === 'ar' ? 'لياسة إسمنتية' : 'Cement Plaster' },
        { id: 'none', label: language === 'ar' ? 'بدون' : 'None' },
    ];

    const FACADE_TYPES: { id: FacadeFinishType; label: string }[] = [
        { id: 'stone_mechanical', label: language === 'ar' ? 'حجر ميكانيكي' : 'Mechanical Stone' },
        { id: 'stone_glued', label: language === 'ar' ? 'حجر لصق' : 'Glued Stone' },
        { id: 'profile_paint', label: language === 'ar' ? 'دهان بروفايل' : 'Profile Paint' },
        { id: 'grc', label: language === 'ar' ? 'GRC' : 'GRC Panels' },
        { id: 'glass_curtain', label: language === 'ar' ? 'زجاج ستائري' : 'Glass Curtain' },
        { id: 'cladding_alucobond', label: language === 'ar' ? 'كلادينج' : 'Alucobond' },
        { id: 'plaster_paint', label: language === 'ar' ? 'لياسة ودهان' : 'Plaster & Paint' },
    ];

    const ROOM_TYPE_OPTIONS: { id: RoomType; label: string }[] = [
        { id: 'majlis', label: language === 'ar' ? 'مجلس' : 'Majlis' },
        { id: 'living', label: language === 'ar' ? 'صالة' : 'Living' },
        { id: 'bedroom', label: language === 'ar' ? 'غرفة نوم' : 'Bedroom' },
        { id: 'kitchen', label: language === 'ar' ? 'مطبخ' : 'Kitchen' },
        { id: 'bathroom', label: language === 'ar' ? 'حمام' : 'Bathroom' },
        { id: 'office', label: language === 'ar' ? 'مكتب' : 'Office' },
        { id: 'corridor', label: language === 'ar' ? 'ممر' : 'Corridor' },
        { id: 'storage', label: language === 'ar' ? 'مخزن' : 'Storage' },
    ];

    // =================== Shared Input Component ===================
    const InputField = ({ label, value, onChange, unit, step = 1, min = 0, max }: { label: string; value: number; onChange: (v: number) => void; unit?: string; step?: number; min?: number; max?: number }) => (
        <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase mb-1 block">{label}</label>
            <div className="relative">
                <input type="number" step={step} min={min} max={max} value={value} onChange={e => onChange(Number(e.target.value))}
                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm" />
                {unit && <span className="absolute left-2 top-2.5 text-xs text-slate-400">{unit}</span>}
            </div>
        </div>
    );

    const SelectField = ({ label, value, options, onChange }: { label: string; value: string; options: { id: string; label: string }[]; onChange: (v: string) => void }) => (
        <div>
            <label className="text-[11px] font-bold text-slate-500 uppercase mb-1 block">{label}</label>
            <select value={value} onChange={e => onChange(e.target.value)}
                className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none text-sm">
                {options.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
            </select>
        </div>
    );

    // =================== RENDER ===================

    // Collapsible section wrapper
    const Section = ({ id, title, icon, color, badge, children, actions }: {
        id: string; title: string; icon: React.ReactNode; color: string; badge?: string; children: React.ReactNode; actions?: React.ReactNode;
    }) => {
        const collapsed = collapsedSections.has(id);
        return (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <button
                    onClick={() => toggleSection(id)}
                    className="w-full flex items-center justify-between px-5 py-3 hover:bg-slate-50 transition-colors"
                >
                    <div className="flex items-center gap-2">
                        <div className={`p-1.5 rounded-lg ${color}`}>{icon}</div>
                        <h3 className="font-bold text-slate-700 text-[15px]">{title}</h3>
                        {badge && <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full font-bold">{badge}</span>}
                    </div>
                    <div className="flex items-center gap-2">
                        {!collapsed && actions && <div onClick={e => e.stopPropagation()}>{actions}</div>}
                        <ChevronRight className={`w-4 h-4 text-slate-400 transition-transform ${collapsed ? '' : 'rotate-90'}`} />
                    </div>
                </button>
                {!collapsed && <div className="px-5 pb-5 pt-1">{children}</div>}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full overflow-hidden bg-slate-50" dir={isRtl ? 'rtl' : 'ltr'}>

            {/* ============ TEMPLATE SELECTOR — COLLAPSIBLE ============ */}
            {availableTemplates.length > 0 && (
                <div className="border-b border-slate-200">
                    {/* Toggle bar */}
                    <button
                        onClick={() => setShowTemplates(!showTemplates)}
                        className="w-full flex items-center justify-between px-4 py-2 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white hover:from-slate-800 hover:via-indigo-900 hover:to-slate-800 transition-all"
                    >
                        <div className="flex items-center gap-2">
                            <LayoutTemplate className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-bold tracking-wide">
                                {isRtl ? 'نماذج جاهزة' : 'Ready Templates'}
                                <span className="text-indigo-400 mx-1">({availableTemplates.length})</span>
                            </span>
                            {appliedTemplateId && (
                                <span className="flex items-center gap-1 bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-bold">
                                    <Sparkles className="w-3 h-3" />
                                    {availableTemplates.find(t => t.id === appliedTemplateId)?.name[language]}
                                </span>
                            )}
                        </div>
                        <ChevronRight className={`w-4 h-4 text-indigo-400 transition-transform ${showTemplates ? 'rotate-90' : ''}`} />
                    </button>

                    {/* Template cards — collapsible */}
                    {showTemplates && (
                        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 px-4 pb-3 pt-1">
                            <div className="flex gap-2.5 overflow-x-auto pb-1">
                                {availableTemplates.map(tmpl => {
                                    const isActive = appliedTemplateId === tmpl.id;
                                    return (
                                        <button
                                            key={tmpl.id}
                                            onClick={() => applyTemplate(tmpl)}
                                            className={`group flex-shrink-0 relative rounded-lg p-2.5 transition-all duration-200 min-w-[180px] max-w-[220px] text-left ${
                                                isActive
                                                    ? 'bg-gradient-to-br from-indigo-600 to-violet-700 text-white shadow-lg shadow-indigo-500/30 ring-2 ring-indigo-400'
                                                    : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 hover:border-indigo-500/40'
                                            }`}
                                        >
                                            <div className="absolute top-1.5 right-1.5 flex gap-0.5">
                                                {Array.from({ length: tmpl.priority }).map((_, i) => (
                                                    <span key={i} className={`text-[9px] ${isActive ? 'text-yellow-300' : 'text-yellow-500/60'}`}>★</span>
                                                ))}
                                            </div>
                                            <div className="flex items-start gap-2">
                                                <span className="text-xl leading-none">{tmpl.icon}</span>
                                                <div className="flex-1 min-w-0">
                                                    <div className={`font-bold text-xs truncate ${isActive ? 'text-white' : 'text-slate-100'}`}>
                                                        {tmpl.name[language]}
                                                    </div>
                                                    <div className={`text-[10px] mt-0.5 truncate ${isActive ? 'text-indigo-200' : 'text-slate-400'}`}>
                                                        {tmpl.description[language]}
                                                    </div>
                                                    <div className={`flex gap-2 mt-1.5 text-[9px] font-bold ${isActive ? 'text-indigo-100' : 'text-slate-500'}`}>
                                                        <span>{tmpl.plotArea.toLocaleString()}م²</span>
                                                        <span>•</span>
                                                        <span>{tmpl.floorsCount}{isRtl ? 'ط' : 'F'}</span>
                                                        <span>•</span>
                                                        <span>{tmpl.config.roomFinishes?.length || 0}{isRtl ? 'غ' : 'R'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </button>
                                    );
                                })}

                                {/* AI Prediction Button */}
                                <button
                                    onClick={applySmartPrediction}
                                    className={`group flex-shrink-0 relative rounded-lg p-2.5 transition-all duration-200 min-w-[180px] max-w-[220px] text-left ${
                                        appliedTemplateId === 'ai-prediction'
                                            ? 'bg-gradient-to-br from-fuchsia-600 to-pink-600 text-white shadow-lg shadow-fuchsia-500/30 ring-2 ring-fuchsia-400'
                                            : 'bg-white/5 hover:bg-white/10 text-slate-200 border border-fuchsia-500/30 hover:border-fuchsia-400'
                                    }`}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className="p-1.5 bg-fuchsia-500/20 rounded-lg">
                                            <Sparkles className={`w-5 h-5 ${appliedTemplateId === 'ai-prediction' ? 'text-white' : 'text-fuchsia-400'}`} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className={`font-bold text-xs truncate ${appliedTemplateId === 'ai-prediction' ? 'text-white' : 'text-fuchsia-300'}`}>
                                                {isRtl ? 'توليد ذكي (Arba Brain)' : 'Smart Generate'}
                                            </div>
                                            <div className={`text-[10px] mt-0.5 truncate ${appliedTemplateId === 'ai-prediction' ? 'text-fuchsia-100' : 'text-slate-400'}`}>
                                                {isRtl ? 'تنبؤ مبني على الذكاء الاصطناعي' : 'AI-based prediction'}
                                            </div>
                                            <div className={`flex gap-2 mt-1.5 text-[9px] font-bold ${appliedTemplateId === 'ai-prediction' ? 'text-fuchsia-100' : 'text-fuchsia-500/70'}`}>
                                                <span>✨ Auto</span>
                                            </div>
                                        </div>
                                    </div>
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Wizard Step Bar — Compact */}
            <div className="bg-white border-b border-slate-200 px-4 py-2">
                <div className="flex items-center gap-1.5 max-w-full overflow-x-auto">
                    {steps.map((step, idx) => (
                        <React.Fragment key={step.key}>
                            <button
                                onClick={() => setActiveStep(step.key)}
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                                    activeStep === step.key
                                        ? `bg-gradient-to-r ${step.color} text-white shadow-md`
                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700'
                                }`}
                            >
                                {step.icon}
                                <span className="hidden sm:inline">{step.label}</span>
                            </button>
                            {idx < steps.length - 1 && (
                                <ChevronRight className={`w-3 h-3 text-slate-300 flex-shrink-0 ${isRtl ? 'rotate-180' : ''}`} />
                            )}
                        </React.Fragment>
                    ))}
                </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6">
                <div className="max-w-6xl mx-auto">

                    {/* AI Validator Banner */}
                    {aiErrors.length > 0 && (
                        <div className="mb-6 bg-gradient-to-br from-fuchsia-50 to-pink-50 border border-fuchsia-200 rounded-xl p-4 shadow-sm">
                            <div className="flex items-start gap-3">
                                <div className="p-2 bg-fuchsia-100 text-fuchsia-600 rounded-lg">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-fuchsia-900 text-sm mb-2">
                                        {isRtl ? 'المدقق الهندسي (Arba Brain)' : 'AI Engineering Validator'}
                                    </h3>
                                    <div className="space-y-2">
                                        {aiErrors.map((error, idx) => (
                                            <div key={idx} className={`flex items-start gap-2 p-2 rounded-lg text-xs ${
                                                error.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
                                            }`}>
                                                {error.type === 'error' ? <AlertOctagon className="w-4 h-4 flex-shrink-0 mt-0.5" /> : <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />}
                                                <div>
                                                    <span className="font-bold">{error.field}: </span>
                                                    {error.message}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* ============ TAB 1: ARCHITECTURAL ============ */}
                    {activeStep === 'architectural' && (
                        <div className="space-y-6">
                            {/* Plot Dimensions */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2 text-lg">
                                    <MapPin className="w-5 h-5 text-indigo-600" />
                                    {language === 'ar' ? 'أبعاد الأرض والارتدادات' : 'Plot Dimensions & Setbacks'}
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                                    <InputField label={language === 'ar' ? 'العرض (م)' : 'Width (m)'} value={blueprint.plotWidth} onChange={v => handleDimensionChange('plotWidth', v)} unit="m" />
                                    <InputField label={language === 'ar' ? 'الطول/العمق (م)' : 'Length (m)'} value={blueprint.plotLength} onChange={v => handleDimensionChange('plotLength', v)} unit="m" />
                                    <InputField label={language === 'ar' ? 'ارتداد أمامي' : 'Front Setback'} value={blueprint.setbackFront} onChange={v => handleDimensionChange('setbackFront', v)} unit="m" />
                                    <InputField label={language === 'ar' ? 'ارتداد جانبي' : 'Side Setback'} value={blueprint.setbackSide} onChange={v => handleDimensionChange('setbackSide', v)} unit="m" />
                                    <InputField label={language === 'ar' ? 'ارتداد خلفي' : 'Rear Setback'} value={blueprint.setbackRear || 2} onChange={v => onChange({ ...blueprint, setbackRear: v })} unit="m" />
                                </div>
                                <div className="mt-4 bg-indigo-50 p-3 rounded-lg flex justify-between items-center">
                                    <span className="text-sm font-medium text-indigo-900">{language === 'ar' ? 'مساحة الأرض' : 'Plot Area'}</span>
                                    <span className="font-bold text-indigo-700 text-lg">{(blueprint.plotLength * blueprint.plotWidth).toLocaleString()} m²</span>
                                </div>
                            </div>

                            {/* Floors */}
                            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2 text-lg">
                                        <Layers className="w-5 h-5 text-indigo-600" />
                                        {language === 'ar' ? 'تفاصيل الطوابق والأسقف' : 'Floor Details'}
                                    </h3>
                                    <button onClick={addFloor} className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-500 flex items-center gap-2">
                                        <Plus className="w-4 h-4" /> {language === 'ar' ? 'إضافة طابق' : 'Add Floor'}
                                    </button>
                                </div>
                                <div className="space-y-4">
                                    {blueprint.floors.map((floor, index) => (
                                        <div key={floor.id} className="bg-slate-50 p-4 rounded-xl border border-slate-200 relative group">
                                            <div className="flex justify-between items-center mb-3">
                                                <div className="flex items-center gap-3">
                                                    <span className="bg-indigo-100 text-indigo-700 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm">
                                                        {index === 0 ? 'G' : index}
                                                    </span>
                                                    <input type="text" value={floor.name} onChange={e => updateFloor(floor.id, { name: e.target.value })}
                                                        className="font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 outline-none w-48" />
                                                </div>
                                                {index > 0 && (
                                                    <button onClick={() => removeFloor(floor.id)} className="text-red-400 hover:text-red-600 p-1">
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                            <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
                                                <InputField label={language === 'ar' ? 'مساحة (م2)' : 'Area (m²)'} value={floor.area} onChange={v => updateFloor(floor.id, { area: v })} />
                                                <InputField label={language === 'ar' ? 'ارتفاع (م)' : 'Height (m)'} value={floor.height} onChange={v => updateFloor(floor.id, { height: v })} step={0.1} />
                                                <SelectField label={language === 'ar' ? 'نوع السقف' : 'Slab Type'} value={floor.slabType} options={SLAB_TYPES} onChange={v => updateFloor(floor.id, { slabType: v as SlabType })} />
                                                <InputField label={language === 'ar' ? 'عدد الأعمدة' : 'Columns'} value={floor.columnsCount} onChange={v => updateFloor(floor.id, { columnsCount: v })} />
                                                <InputField label={language === 'ar' ? 'محيط خارجي (م.ط)' : 'Ext. Perimeter (m)'} value={floor.perimeterWallLength || 0} onChange={v => updateFloor(floor.id, { perimeterWallLength: v })} />
                                                <InputField label={language === 'ar' ? 'قواطع داخلية (م.ط)' : 'Int. Walls (m)'} value={floor.internalWallLength || 0} onChange={v => updateFloor(floor.id, { internalWallLength: v })} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {/* Total summary bar */}
                                <div className="bg-indigo-900 text-white p-4 rounded-xl flex justify-between items-center mt-4">
                                    <div>
                                        <span className="text-indigo-200 text-sm">{language === 'ar' ? 'إجمالي مسطح البناء' : 'Total Build Area'}</span>
                                        <div className="text-2xl font-bold">{blueprint.floors.reduce((s, f) => s + f.area, 0).toLocaleString()} m²</div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-indigo-200 text-sm">{language === 'ar' ? 'عدد الطوابق' : 'Floors'}</span>
                                        <div className="text-2xl font-bold">{blueprint.floors.length}</div>
                                    </div>
                                </div>
                            </div>

                            {/* ===== LIVE INTERACTIVE FLOOR PLAN ===== */}
                            <Section id="liveFloorPlan" title={language === 'ar' ? 'المسقط الأفقي التفاعلي' : 'Live Floor Plan'}
                                icon={<Home className="w-4 h-4 text-violet-600" />} color="bg-violet-50"
                                badge={`${(blueprint.plotWidth * blueprint.plotLength).toLocaleString()} م²`}>
                                <LiveFloorPlan blueprint={blueprint} language={language} />
                            </Section>
                        </div>
                    )}

                    {/* ============ TAB 2: STRUCTURAL ============ */}
                    {activeStep === 'structural' && (
                        <div className="space-y-3">
                            {/* Excavation */}
                            <Section id="excavation" title={language === 'ar' ? 'بيانات الحفر والتربة' : 'Excavation & Soil Data'}
                                icon={<Shovel className="w-4 h-4 text-amber-600" />} color="bg-amber-50">
                                {/* الصف الأول: بيانات الحفر الأساسية */}
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                    <InputField label={language === 'ar' ? 'عمق الحفر (م)' : 'Depth (m)'} value={blueprint.excavation?.excavationDepth || 1.5} onChange={v => updateExcavation({ excavationDepth: v })} step={0.1} unit="m" />
                                    <InputField label={language === 'ar' ? 'منسوب الصفر (م)' : 'Zero Level (m)'} value={blueprint.excavation?.zeroLevel || 0.3} onChange={v => updateExcavation({ zeroLevel: v })} step={0.05} unit="m" />
                                    <div>
                                        <label className="text-[11px] font-bold text-slate-500 uppercase mb-1 block">{language === 'ar' ? 'إحلال تربة؟' : 'Soil Replacement?'}</label>
                                        <button onClick={() => updateExcavation({ soilReplacementNeeded: !blueprint.excavation?.soilReplacementNeeded })}
                                            className={`w-full p-2 rounded-lg text-sm font-bold border ${blueprint.excavation?.soilReplacementNeeded ? 'bg-amber-100 border-amber-400 text-amber-800' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                            {blueprint.excavation?.soilReplacementNeeded ? (language === 'ar' ? '✓ نعم' : '✓ Yes') : (language === 'ar' ? '✗ لا' : '✗ No')}
                                        </button>
                                    </div>
                                    {blueprint.excavation?.soilReplacementNeeded && (
                                        <InputField label={language === 'ar' ? 'سماكة الإحلال (م)' : 'Thickness (m)'} value={blueprint.excavation?.soilReplacementThickness || 0} onChange={v => updateExcavation({ soilReplacementThickness: v })} step={0.1} unit="m" />
                                    )}
                                </div>

                                {/* الصف الثاني: البنود الحرجة الجديدة v8.0 */}
                                <div className="mt-3 pt-3 border-t border-amber-200">
                                    <h4 className="text-[10px] font-bold text-amber-700 mb-2 uppercase tracking-wider">{language === 'ar' ? '⚙️ بنود حرجة — SBC 303' : '⚙️ Critical Items — SBC 303'}</h4>
                                    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
                                        {/* تنظيف الموقع */}
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-500 uppercase mb-1 block">{language === 'ar' ? 'تنظيف الموقع' : 'Site Clearance'}</label>
                                            <button onClick={() => updateExcavation({ siteClearanceRequired: blueprint.excavation?.siteClearanceRequired === false ? true : !(blueprint.excavation?.siteClearanceRequired !== false) })}
                                                className={`w-full p-2 rounded-lg text-sm font-bold border ${blueprint.excavation?.siteClearanceRequired !== false ? 'bg-green-100 border-green-400 text-green-800' : 'bg-slate-50 border-slate-200 text-slate-500'}`}>
                                                {blueprint.excavation?.siteClearanceRequired !== false ? (language === 'ar' ? '✓ مطلوب' : '✓ Yes') : (language === 'ar' ? '✗ لا' : '✗ No')}
                                            </button>
                                        </div>

                                        {/* نسبة الحفر الصخري */}
                                        <InputField label={language === 'ar' ? 'حفر صخري (%)' : 'Rock Exc. (%)'} value={blueprint.excavation?.rockExcavationPercent || 0} onChange={v => updateExcavation({ rockExcavationPercent: v })} step={5} unit="%" min={0} max={100} />

                                        {/* سند جوانب الحفر */}
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-500 uppercase mb-1 block">{language === 'ar' ? 'سند الجوانب' : 'Shoring'}</label>
                                            <select value={blueprint.excavation?.shoringType || 'none'}
                                                onChange={e => updateExcavation({ shoringRequired: e.target.value !== 'none', shoringType: e.target.value as ShoringType })}
                                                className="w-full p-2 rounded-lg text-sm border border-slate-200 bg-white">
                                                <option value="none">{language === 'ar' ? 'لا يحتاج' : 'None'}</option>
                                                <option value="timber">{language === 'ar' ? 'ألواح خشب' : 'Timber'}</option>
                                                <option value="steel_sheet">{language === 'ar' ? 'ستائر حديد' : 'Steel Sheet'}</option>
                                                <option value="soldier_piles">{language === 'ar' ? 'خوازيق حديد' : 'Soldier Piles'}</option>
                                                <option value="concrete_piles">{language === 'ar' ? 'خوازيق خرسانة' : 'Concrete Piles'}</option>
                                            </select>
                                        </div>

                                        {/* نزح المياه الجوفية */}
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-500 uppercase mb-1 block">{language === 'ar' ? 'نزح المياه' : 'Dewatering'}</label>
                                            <select value={blueprint.excavation?.dewateringType || 'none'}
                                                onChange={e => updateExcavation({ dewateringRequired: e.target.value !== 'none', dewateringType: e.target.value as DewateringType })}
                                                className="w-full p-2 rounded-lg text-sm border border-slate-200 bg-white">
                                                <option value="none">{language === 'ar' ? 'لا يحتاج' : 'None'}</option>
                                                <option value="surface_pumps">{language === 'ar' ? 'مضخات سطحية' : 'Surface Pumps'}</option>
                                                <option value="wellpoint">{language === 'ar' ? 'آبار نقطية' : 'WellPoint'}</option>
                                                <option value="deep_well">{language === 'ar' ? 'آبار عميقة' : 'Deep Well'}</option>
                                            </select>
                                        </div>

                                        {/* ردم مستورد */}
                                        <InputField label={language === 'ar' ? 'ردم مستورد (%)' : 'Imported Fill (%)'} value={blueprint.excavation?.importedFillPercent || 0} onChange={v => updateExcavation({ importedFillRequired: v > 0, importedFillPercent: v })} step={10} unit="%" min={0} max={100} />
                                    </div>

                                    {/* حقول فرعية مشروطة */}
                                    {(blueprint.excavation?.dewateringRequired || blueprint.excavation?.shoringRequired) && (
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-2">
                                            {blueprint.excavation?.dewateringRequired && (
                                                <InputField label={language === 'ar' ? 'منسوب المياه الجوفية (م)' : 'Water Table (m)'} value={blueprint.excavation?.waterTableDepth || 0} onChange={v => updateExcavation({ waterTableDepth: v })} step={0.5} unit="m" />
                                            )}
                                            {blueprint.excavation?.shoringRequired && (
                                                <InputField label={language === 'ar' ? 'عمق السند (م)' : 'Shoring Depth (m)'} value={blueprint.excavation?.shoringDepth || blueprint.excavation?.excavationDepth || 1.5} onChange={v => updateExcavation({ shoringDepth: v })} step={0.5} unit="m" />
                                            )}
                                        </div>
                                    )}
                                </div>
                                {cognitiveOutput && (
                                    <div className="mt-3 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                        <h4 className="text-[10px] font-bold text-amber-800 mb-2 flex items-center gap-1"><Zap className="w-3 h-3" /> {language === 'ar' ? 'المخرجات الذكية' : 'Live Output'}</h4>
                                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                                            {cognitiveOutput.excavation.map(item => (
                                                <div key={item.id} className="bg-white p-2 rounded border border-amber-100">
                                                    <div className="text-[10px] text-slate-500">{item.name[language]}</div>
                                                    <div className="font-bold text-slate-800 text-sm">{item.procurementQty.toLocaleString()} {item.unit}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Section>

                            {/* Foundation */}
                            <Section id="foundation" title={language === 'ar' ? 'نظام الأساسات' : 'Foundation System'}
                                icon={<Grid3X3 className="w-4 h-4 text-amber-600" />} color="bg-amber-50"
                                badge={blueprint.foundation?.type || 'isolated_footings'}>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                                    <SelectField label={language === 'ar' ? 'نوع الأساس' : 'Type'} value={blueprint.foundation?.type || 'isolated_footings'} options={FOUNDATION_TYPES} onChange={v => updateFoundation({ type: v as FoundationType })} />
                                    <InputField label={language === 'ar' ? 'رقاب أعمدة (م)' : 'Neck Height (m)'} value={blueprint.foundation?.neckColumnHeight || 0.5} onChange={v => updateFoundation({ neckColumnHeight: v })} step={0.1} />
                                    <InputField label={language === 'ar' ? 'عمق الميد (م)' : 'Tie Beam Depth'} value={blueprint.foundation?.tieBeamDepth || 0.6} onChange={v => updateFoundation({ tieBeamDepth: v })} step={0.1} />
                                    <InputField label={language === 'ar' ? 'عرض الميد (م)' : 'Tie Beam Width'} value={blueprint.foundation?.tieBeamWidth || 0.3} onChange={v => updateFoundation({ tieBeamWidth: v })} step={0.05} />
                                    {(blueprint.foundation?.type === 'isolated_footings' || blueprint.foundation?.type === 'strip_footings') && (
                                        <>
                                            <InputField label={language === 'ar' ? 'عمق القاعدة (م)' : 'Footing Depth'} value={blueprint.foundation?.footingDepth || 0.5} onChange={v => updateFoundation({ footingDepth: v })} step={0.1} />
                                            <InputField label={language === 'ar' ? 'عرض القاعدة (م)' : 'Footing Width'} value={blueprint.foundation?.footingWidth || 1.2} onChange={v => updateFoundation({ footingWidth: v })} step={0.1} />
                                        </>
                                    )}
                                    {blueprint.foundation?.type === 'raft' && (
                                        <InputField label={language === 'ar' ? 'سمك اللبشة (م)' : 'Raft Thickness'} value={blueprint.foundation?.raftThickness || 0.6} onChange={v => updateFoundation({ raftThickness: v })} step={0.1} />
                                    )}
                                </div>
                                {cognitiveOutput && (
                                    <div className="mt-3 bg-amber-50 p-3 rounded-lg border border-amber-200">
                                        <h4 className="text-[10px] font-bold text-amber-800 mb-2 flex items-center gap-1"><Zap className="w-3 h-3" /> {language === 'ar' ? 'كميات الأساسات' : 'Foundation Quantities'}</h4>
                                        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 text-sm">
                                            {cognitiveOutput.substructure.slice(0, 6).map(item => (
                                                <div key={item.id} className="bg-white p-2 rounded border border-amber-100">
                                                    <div className="text-[10px] text-slate-500">{item.name[language]}</div>
                                                    <div className="font-bold text-slate-800 text-sm">{item.grossQty.toLocaleString()} {item.unit}</div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </Section>

                            {/* Superstructure */}
                            {cognitiveOutput && (
                                <Section id="superstructure" title={language === 'ar' ? 'ملخص العظم (أسقف وأعمدة)' : 'Superstructure Summary'}
                                    icon={<Columns3 className="w-4 h-4 text-amber-600" />} color="bg-amber-50">
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 text-sm">
                                        {cognitiveOutput.superstructure.map(item => (
                                            <div key={item.id} className="bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                                                <div className="text-[10px] text-slate-500">{item.name[language]}</div>
                                                <div className="font-bold text-slate-800">{item.grossQty.toLocaleString()} {item.unit}</div>
                                                {item.notes && <div className="text-[9px] text-amber-700 mt-0.5">{item.notes}</div>}
                                            </div>
                                        ))}
                                    </div>
                                </Section>
                            )}
                        </div>
                    )}

                    {/* ============ TAB 3: EXECUTIVE (FINISHES) ============ */}
                    {activeStep === 'executive' && (
                        <div className="space-y-3">
                            {/* Room Finish Schedule */}
                            <Section id="roomFinishes" title={language === 'ar' ? 'جدول تشطيبات الفراغات' : 'Room Finish Schedule'}
                                icon={<Paintbrush className="w-4 h-4 text-emerald-600" />} color="bg-emerald-50"
                                badge={`${(blueprint.roomFinishes || []).length} ${isRtl ? 'فراغ' : 'rooms'}`}
                                actions={
                                    <button onClick={addRoomFinish} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-500 flex items-center gap-1">
                                        <Plus className="w-3.5 h-3.5" /> {language === 'ar' ? 'إضافة' : 'Add'}
                                    </button>
                                }
                            >
                                <div className="space-y-2">
                                    {(blueprint.roomFinishes || []).map(room => (
                                        <div key={room.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 group">
                                            <div className="flex justify-between items-start mb-2">
                                                <input type="text" value={room.roomName} onChange={e => updateRoomFinish(room.id, { roomName: e.target.value })}
                                                    className="font-bold text-sm text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-emerald-500 outline-none" />
                                                <button onClick={() => removeRoomFinish(room.id)} className="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </button>
                                            </div>
                                            <div className="grid grid-cols-3 lg:grid-cols-5 gap-2 mb-2">
                                                <SelectField label={language === 'ar' ? 'النوع' : 'Type'} value={room.roomType} options={ROOM_TYPE_OPTIONS} onChange={v => updateRoomFinish(room.id, { roomType: v as RoomType })} />
                                                <InputField label={language === 'ar' ? 'طول' : 'L'} value={room.length} onChange={v => updateRoomFinish(room.id, { length: v })} step={0.1} />
                                                <InputField label={language === 'ar' ? 'عرض' : 'W'} value={room.width} onChange={v => updateRoomFinish(room.id, { width: v })} step={0.1} />
                                                <InputField label={language === 'ar' ? 'ارتفاع' : 'H'} value={room.height} onChange={v => updateRoomFinish(room.id, { height: v })} step={0.1} />
                                                <InputField label={language === 'ar' ? 'فتحات%' : 'Open%'} value={Math.round(room.windowDoorRatio * 100)} onChange={v => updateRoomFinish(room.id, { windowDoorRatio: v / 100 })} />
                                            </div>
                                            <div className="grid grid-cols-3 gap-2">
                                                <SelectField label={language === 'ar' ? 'أرضية' : 'Floor'} value={room.floorFinish} options={FINISH_MATERIALS} onChange={v => updateRoomFinish(room.id, { floorFinish: v as FinishMaterial })} />
                                                <SelectField label={language === 'ar' ? 'حوائط' : 'Walls'} value={room.wallFinish} options={FINISH_MATERIALS} onChange={v => updateRoomFinish(room.id, { wallFinish: v as FinishMaterial })} />
                                                <SelectField label={language === 'ar' ? 'سقف' : 'Ceiling'} value={room.ceilingFinish} options={FINISH_MATERIALS} onChange={v => updateRoomFinish(room.id, { ceilingFinish: v as FinishMaterial })} />
                                            </div>
                                            <div className="mt-1.5 text-[10px] text-emerald-700 bg-emerald-50 p-1.5 rounded flex gap-3">
                                                <span>🟩 {(room.length * room.width).toFixed(1)}م²</span>
                                                <span>🟧 {((room.length + room.width) * 2 * room.height * (1 - room.windowDoorRatio)).toFixed(1)}م²</span>
                                                <span>🟦 {(room.length * room.width).toFixed(1)}م²</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Section>

                            {/* Facades */}
                            <Section id="facades" title={language === 'ar' ? 'الواجهات الخارجية' : 'Facade Schedule'}
                                icon={<Building2 className="w-4 h-4 text-emerald-600" />} color="bg-emerald-50"
                                badge={`${(blueprint.facadeSchedules || []).length} ${isRtl ? 'واجهة' : 'facades'}`}
                                actions={
                                    <button onClick={addFacade} className="bg-emerald-600 text-white px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-500 flex items-center gap-1">
                                        <Plus className="w-3.5 h-3.5" /> {language === 'ar' ? 'إضافة' : 'Add'}
                                    </button>
                                }
                            >
                                <div className="space-y-2">
                                    {(blueprint.facadeSchedules || []).map(facade => (
                                        <div key={facade.id} className="bg-slate-50 p-3 rounded-lg border border-slate-200 group">
                                            <div className="grid grid-cols-3 lg:grid-cols-5 gap-2">
                                                <SelectField label={language === 'ar' ? 'الجهة' : 'Direction'} value={facade.direction}
                                                    options={[
                                                        { id: 'north', label: language === 'ar' ? 'شمال' : 'North' },
                                                        { id: 'south', label: language === 'ar' ? 'جنوب' : 'South' },
                                                        { id: 'east', label: language === 'ar' ? 'شرق' : 'East' },
                                                        { id: 'west', label: language === 'ar' ? 'غرب' : 'West' },
                                                    ]}
                                                    onChange={v => updateFacade(facade.id, { direction: v as FacadeDirection })} />
                                                <InputField label={language === 'ar' ? 'عرض' : 'W'} value={facade.width} onChange={v => updateFacade(facade.id, { width: v })} />
                                                <InputField label={language === 'ar' ? 'ارتفاع' : 'H'} value={facade.totalHeight} onChange={v => updateFacade(facade.id, { totalHeight: v })} step={0.1} />
                                                <SelectField label={language === 'ar' ? 'تشطيب' : 'Finish'} value={facade.finishType} options={FACADE_TYPES} onChange={v => updateFacade(facade.id, { finishType: v as FacadeFinishType })} />
                                                <div className="flex items-end gap-1">
                                                    <div className="flex-1">
                                                        <InputField label={language === 'ar' ? 'فتحات%' : 'Open%'} value={Math.round(facade.windowDoorRatio * 100)} onChange={v => updateFacade(facade.id, { windowDoorRatio: v / 100 })} />
                                                    </div>
                                                    <button onClick={() => removeFacade(facade.id)} className="text-red-400 hover:text-red-600 p-1.5 mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Trash2 className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="mt-1.5 text-[10px] text-emerald-700 bg-emerald-50 p-1.5 rounded">
                                                {language === 'ar' ? 'صافي' : 'Net'}: {(facade.width * facade.totalHeight * (1 - facade.windowDoorRatio)).toFixed(1)} م²
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </Section>

                            {/* Finishes live preview */}
                            {cognitiveOutput && cognitiveOutput.finishes.length > 0 && (
                                <Section id="finishesPreview" title={language === 'ar' ? 'الكميات الذكية (تشطيبات + واجهات)' : 'Smart Quantities (Finishes + Facades)'}
                                    icon={<Zap className="w-4 h-4 text-emerald-600" />} color="bg-emerald-50">
                                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                        {[...cognitiveOutput.finishes, ...cognitiveOutput.facades].map(item => (
                                            <div key={item.id} className="bg-emerald-50 p-2.5 rounded-lg border border-emerald-200">
                                                <div className="text-[10px] text-slate-500">{item.name[language]}</div>
                                                <div className="font-bold text-slate-800 text-sm">{item.procurementQty.toLocaleString()} {item.unit}</div>
                                            </div>
                                        ))}
                                    </div>
                                </Section>
                            )}
                        </div>
                    )}

                    {/* ============ TAB 4: DRAWINGS ============ */}
                    {activeStep === 'drawings' && (
                        <DrawingsPanel blueprint={blueprint} language={language} projectMeta={projectMeta} />
                    )}
                    {/* ============ TAB 5: COMPLIANCE ============ */}
                    {activeStep === 'compliance' && (() => {
                        const report: ComplianceReport = generateComplianceReport(
                            projectType || 'villa', blueprint,
                            { streetWidth_m: 15 }
                        );
                        const statusIcon = (s: ComplianceStatus) => {
                            if (s === 'PASS') return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
                            if (s === 'FAIL') return <XCircle className="w-4 h-4 text-red-500" />;
                            if (s === 'WARNING') return <AlertOctagon className="w-4 h-4 text-amber-500" />;
                            return <Info className="w-4 h-4 text-blue-400" />;
                        };
                        const statusBg = (s: ComplianceStatus) => {
                            if (s === 'PASS') return 'bg-emerald-50 border-emerald-200';
                            if (s === 'FAIL') return 'bg-red-50 border-red-200';
                            if (s === 'WARNING') return 'bg-amber-50 border-amber-200';
                            return 'bg-blue-50 border-blue-200';
                        };
                        return (
                            <div className="space-y-6">
                                {/* Header */}
                                <div className="bg-gradient-to-br from-slate-900 via-cyan-950 to-slate-900 p-6 rounded-2xl shadow-xl text-white">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="bg-cyan-500/20 p-3 rounded-xl">
                                                <Shield className="w-8 h-8 text-cyan-400" />
                                            </div>
                                            <div>
                                                <h2 className="text-xl font-bold">{isRtl ? 'محرك الامتثال التنظيمي' : 'Regulatory Compliance Engine'}</h2>
                                                <p className="text-cyan-300 text-sm">{report.activityNameAr} — {report.checks.length} {isRtl ? 'فحص' : 'checks'} | {report.additionalBOQ.length} {isRtl ? 'بند تنظيمي' : 'items'}</p>
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className={`text-4xl font-black ${report.passRate >= 80 ? 'text-emerald-400' : report.passRate >= 50 ? 'text-amber-400' : 'text-red-400'}`}>
                                                {report.passRate}%
                                            </div>
                                            <div className="text-xs text-slate-400">{isRtl ? 'نسبة الامتثال' : 'Pass Rate'}</div>
                                        </div>
                                    </div>
                                    {/* Progress Bar */}
                                    <div className="mt-4 bg-slate-700 rounded-full h-3 overflow-hidden">
                                        <div className={`h-full rounded-full transition-all duration-700 ${report.passRate >= 80 ? 'bg-gradient-to-r from-emerald-500 to-green-400' : report.passRate >= 50 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' : 'bg-gradient-to-r from-red-500 to-red-400'}`}
                                            style={{ width: `${report.passRate}%` }} />
                                    </div>
                                </div>

                                {/* Compliance Checks */}
                                {report.checks.length > 0 && (
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-cyan-600" />
                                            <h3 className="font-bold text-slate-700 text-sm">{isRtl ? 'قائمة فحص الامتثال' : 'Compliance Checklist'}</h3>
                                        </div>
                                        <div className="divide-y divide-slate-100">
                                            {report.checks.map(check => (
                                                <div key={check.id} className={`flex items-center justify-between px-5 py-3 ${statusBg(check.status)} border-l-4 ${check.status === 'PASS' ? 'border-l-emerald-500' : check.status === 'FAIL' ? 'border-l-red-500' : check.status === 'WARNING' ? 'border-l-amber-500' : 'border-l-blue-400'}`}>
                                                    <div className="flex items-center gap-3">
                                                        {statusIcon(check.status)}
                                                        <div>
                                                            <div className="font-bold text-sm text-slate-800">{isRtl ? check.nameAr : check.nameEn}</div>
                                                            <div className="text-[10px] text-slate-500">{check.regulation}</div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-xs font-bold text-slate-700">{isRtl ? 'المطلوب' : 'Required'}: {check.required}</div>
                                                        <div className="text-xs text-slate-500">{isRtl ? 'الفعلي' : 'Actual'}: {check.actual}</div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Regulatory BOQ Items */}
                                {report.additionalBOQ.length > 0 && (
                                    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                                        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex items-center gap-2">
                                            <Package className="w-4 h-4 text-violet-600" />
                                            <h3 className="font-bold text-slate-700 text-sm">{isRtl ? 'بنود BOQ التنظيمية الإضافية' : 'Regulatory BOQ Items'}</h3>
                                            <span className="bg-violet-100 text-violet-700 text-[10px] px-2 py-0.5 rounded-full font-bold">{report.additionalBOQ.length} {isRtl ? 'بند' : 'items'}</span>
                                        </div>
                                        <div className="overflow-x-auto">
                                            <table className="w-full text-sm">
                                                <thead className="bg-slate-50">
                                                    <tr>
                                                        <th className="px-4 py-2 text-right text-[10px] font-bold text-slate-500 uppercase">{isRtl ? 'البند' : 'Item'}</th>
                                                        <th className="px-4 py-2 text-center text-[10px] font-bold text-slate-500 uppercase">{isRtl ? 'الكمية' : 'Qty'}</th>
                                                        <th className="px-4 py-2 text-center text-[10px] font-bold text-slate-500 uppercase">{isRtl ? 'الوحدة' : 'Unit'}</th>
                                                        <th className="px-4 py-2 text-right text-[10px] font-bold text-slate-500 uppercase">{isRtl ? 'المرجع' : 'Regulation'}</th>
                                                        <th className="px-4 py-2 text-center text-[10px] font-bold text-slate-500 uppercase">{isRtl ? 'إلزامي' : 'Mandatory'}</th>
                                                    </tr>
                                                </thead>
                                                <tbody className="divide-y divide-slate-100">
                                                    {report.additionalBOQ.map(item => (
                                                        <tr key={item.id} className="hover:bg-violet-50/50 transition-colors">
                                                            <td className="px-4 py-2.5 font-medium text-slate-800">{isRtl ? item.nameAr : item.nameEn}</td>
                                                            <td className="px-4 py-2.5 text-center font-bold text-violet-700">{item.qty.toLocaleString()}</td>
                                                            <td className="px-4 py-2.5 text-center text-slate-500">{item.unit}</td>
                                                            <td className="px-4 py-2.5 text-[10px] text-slate-400">{item.regulation}</td>
                                                            <td className="px-4 py-2.5 text-center">
                                                                {item.mandatory
                                                                    ? <span className="bg-red-100 text-red-700 text-[9px] px-1.5 py-0.5 rounded font-bold">{isRtl ? 'إلزامي' : 'YES'}</span>
                                                                    : <span className="bg-slate-100 text-slate-500 text-[9px] px-1.5 py-0.5 rounded">{isRtl ? 'اختياري' : 'OPT'}</span>
                                                                }
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    </div>
                                )}
                            </div>
                        );
                    })()}

                    {/* ============ COGNITIVE ENGINE PANEL ============ */}
                    <div className="mt-4">
                        <button
                            onClick={() => setShowCognitiveOutput(!showCognitiveOutput)}
                            className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 text-white p-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:from-violet-500 hover:to-indigo-500 shadow-md"
                        >
                            <Zap className="w-4 h-4 text-yellow-300" />
                            {language === 'ar' ? '⚡ ملخص المحرك المعرفي' : '⚡ Cognitive Engine Summary'}
                            <ChevronRight className={`w-4 h-4 transition-transform ${showCognitiveOutput ? 'rotate-90' : ''}`} />
                        </button>
                        {showCognitiveOutput && cognitiveOutput && (
                            <div className="mt-2 bg-slate-900 text-white p-4 rounded-xl">
                                <h3 className="text-sm font-bold mb-3 text-yellow-300">ARBA Cognitive Engine v6.0</h3>
                                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                                    <div className="bg-slate-800 p-3 rounded-lg">
                                        <div className="text-slate-400 text-[10px]">{language === 'ar' ? 'إجمالي الخرسانة' : 'Total Concrete'}</div>
                                        <div className="text-xl font-bold text-blue-400">{cognitiveOutput.summary.totalConcreteM3} م³</div>
                                    </div>
                                    <div className="bg-slate-800 p-3 rounded-lg">
                                        <div className="text-slate-400 text-[10px]">{language === 'ar' ? 'إجمالي الحديد' : 'Total Steel'}</div>
                                        <div className="text-xl font-bold text-red-400">{cognitiveOutput.summary.totalSteelTons} {language === 'ar' ? 'طن' : 'T'}</div>
                                    </div>
                                    <div className="bg-slate-800 p-3 rounded-lg">
                                        <div className="text-slate-400 text-[10px]">{language === 'ar' ? 'إجمالي البلوك' : 'Total Blocks'}</div>
                                        <div className="text-xl font-bold text-amber-400">{cognitiveOutput.summary.totalBlockCount.toLocaleString()}</div>
                                    </div>
                                    <div className="bg-slate-800 p-3 rounded-lg">
                                        <div className="text-slate-400 text-[10px]">{language === 'ar' ? 'مياه إنشائية' : 'Water'}</div>
                                        <div className="text-xl font-bold text-cyan-400">{cognitiveOutput.summary.totalWaterLiters.toLocaleString()}L</div>
                                    </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3">
                                    <div className="bg-slate-800 p-2.5 rounded-lg">
                                        <div className="text-slate-400 text-[10px]">{language === 'ar' ? 'قلابات' : 'Trucks'}</div>
                                        <div className="text-lg font-bold text-orange-400">{cognitiveOutput.summary.totalTruckLoads}</div>
                                    </div>
                                    <div className="bg-slate-800 p-2.5 rounded-lg">
                                        <div className="text-slate-400 text-[10px]">{language === 'ar' ? 'شدة خشبية' : 'Formwork'}</div>
                                        <div className="text-lg font-bold text-yellow-400">{cognitiveOutput.summary.totalFormworkM2} م²</div>
                                    </div>
                                    <div className="bg-slate-800 p-2.5 rounded-lg">
                                        <div className="text-slate-400 text-[10px]">{language === 'ar' ? 'براميل دهان' : 'Paint'}</div>
                                        <div className="text-lg font-bold text-green-400">{cognitiveOutput.summary.totalPaintDrums}</div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

// =================== SVG Drawing Components ===================

const SvgSitePlan: React.FC<{ blueprint: BlueprintConfig }> = ({ blueprint: bp }) => {
    const scale = 12; // pixels per meter
    const margin = 40;
    const W = bp.plotWidth * scale;
    const L = bp.plotLength * scale;
    const svgW = W + margin * 2;
    const svgH = L + margin * 2;

    const sf = bp.setbackFront * scale;
    const ss = bp.setbackSide * scale;
    const sr = (bp.setbackRear || 2) * scale;

    const bx = margin + ss;
    const by = margin + sr;
    const bw = W - ss * 2;
    const bh = L - sf - sr;

    return (
        <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="bg-slate-50 rounded-lg border border-slate-200" style={{ maxHeight: 500 }}>
            {/* Grid */}
            <defs><pattern id="grid" width={scale} height={scale} patternUnits="userSpaceOnUse"><path d={`M ${scale} 0 L 0 0 0 ${scale}`} fill="none" stroke="#e2e8f0" strokeWidth="0.5" /></pattern></defs>
            <rect width={svgW} height={svgH} fill="url(#grid)" />
            {/* Plot boundary */}
            <rect x={margin} y={margin} width={W} height={L} fill="none" stroke="#22c55e" strokeWidth="2.5" strokeDasharray="8,4" />
            {/* Setback zone */}
            <rect x={bx} y={by} width={bw} height={bh} fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="1.5" strokeDasharray="5,3" />
            {/* Buildable area fill */}
            <rect x={bx} y={by} width={bw} height={bh} fill="rgba(99,102,241,0.05)" />
            {/* Dimension text */}
            <text x={margin + W / 2} y={margin - 10} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#334155">{bp.plotWidth}m</text>
            <text x={margin - 15} y={margin + L / 2} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#334155" transform={`rotate(-90, ${margin - 15}, ${margin + L / 2})`}>{bp.plotLength}m</text>
            {/* Labels */}
            <text x={margin + W / 2} y={margin + L + 25} textAnchor="middle" fontSize="11" fill="#64748b">
                مساحة الأرض: {bp.plotWidth * bp.plotLength} م²  |  مساحة البناء المتاحة: {((bw / scale) * (bh / scale)).toFixed(0)} م²
            </text>
            {/* Setback labels */}
            <text x={margin + 5} y={margin + 15} fontSize="9" fill="#ef4444">ارتداد {bp.setbackSide}م</text>
            <text x={margin + W / 2} y={margin + L - 5} textAnchor="middle" fontSize="9" fill="#ef4444">ارتداد أمامي {bp.setbackFront}م</text>
            {/* Compass */}
            <g transform={`translate(${svgW - 35}, ${margin + 10})`}>
                <polygon points="0,-12 -5,5 5,5" fill="#6366f1" opacity="0.8" />
                <text x="0" y="-15" textAnchor="middle" fontSize="10" fontWeight="bold" fill="#6366f1">N</text>
            </g>
            <text x={margin + W / 2} y={svgH - 5} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1e293b">مخطط الموقع | SITE PLAN</text>
        </svg>
    );
};

const SvgFloorPlan: React.FC<{ blueprint: BlueprintConfig; floor: FloorDetails; rooms: RoomFinishSchedule[] }> = ({ blueprint: bp, floor, rooms }) => {
    const scale = 14;
    const margin = 50;
    const ss = bp.setbackSide;
    const bw = bp.plotWidth - ss * 2;
    const aspectR = bw / (bp.plotLength - bp.setbackFront - (bp.setbackRear || 2));
    const floorW = Math.min(bw, Math.sqrt(floor.area * aspectR));
    const floorL = floor.area / floorW;
    const W = floorW * scale;
    const H = floorL * scale;
    const svgW = W + margin * 2;
    const svgH = H + margin * 2;
    const wallT = 3; // wall thickness in px

    // Columns grid
    const colCount = floor.columnsCount || 12;
    const colRows = Math.ceil(Math.sqrt(colCount * (floorL / floorW)));
    const colCols = Math.ceil(colCount / colRows);

    // Room colors
    const roomColors: Record<string, string> = {
        majlis: '#dbeafe', living: '#fef3c7', bedroom: '#ede9fe', kitchen: '#dcfce7',
        bathroom: '#ccfbf1', office: '#fce7f3', corridor: '#f1f5f9', storage: '#e2e8f0',
    };

    let rx = margin + wallT + 2;
    let ry = margin + wallT + 2;
    let rowMaxH = 0;

    return (
        <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="bg-white rounded-lg border border-slate-200" style={{ maxHeight: 550 }}>
            {/* Outer walls */}
            <rect x={margin} y={margin} width={W} height={H} fill="none" stroke="#1e293b" strokeWidth="3" />
            <rect x={margin + wallT} y={margin + wallT} width={W - wallT * 2} height={H - wallT * 2} fill="#fafafa" stroke="#475569" strokeWidth="1" />

            {/* Columns */}
            {Array.from({ length: colCount }).map((_, i) => {
                const r = Math.floor(i / colCols);
                const c = i % colCols;
                if (r >= colRows) return null;
                const cx = margin + (c / Math.max(colCols - 1, 1)) * (W - 10) + 5;
                const cy = margin + (r / Math.max(colRows - 1, 1)) * (H - 14) + 5;
                return <rect key={i} x={cx} y={cy} width={6} height={10} fill="#334155" rx="1" />;
            })}

            {/* Rooms */}
            {rooms.map(room => {
                const rw = Math.min(room.length * scale, W - wallT * 2 - 4);
                const rh = room.width * scale;
                if (rx + rw > margin + W - wallT) {
                    rx = margin + wallT + 2;
                    ry += rowMaxH + 2;
                    rowMaxH = 0;
                }
                const x = rx; const y = ry;
                rx += rw + 2;
                rowMaxH = Math.max(rowMaxH, rh);
                const fill = roomColors[room.roomType] || '#f8fafc';
                return (
                    <g key={room.id}>
                        <rect x={x} y={y} width={rw} height={rh} fill={fill} stroke="#94a3b8" strokeWidth="1" rx="2" />
                        <text x={x + rw / 2} y={y + rh / 2} textAnchor="middle" dominantBaseline="middle" fontSize="10" fontWeight="bold" fill="#475569">{room.roomName}</text>
                        <text x={x + rw / 2} y={y + rh / 2 + 12} textAnchor="middle" fontSize="8" fill="#94a3b8">{room.length}×{room.width}m = {(room.length * room.width).toFixed(0)}م²</text>
                    </g>
                );
            })}

            {/* Dimensions */}
            <text x={margin + W / 2} y={margin - 10} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#475569">{floorW.toFixed(1)}m</text>
            <text x={margin - 15} y={margin + H / 2} textAnchor="middle" fontSize="12" fontWeight="bold" fill="#475569" transform={`rotate(-90, ${margin - 15}, ${margin + H / 2})`}>{floorL.toFixed(1)}m</text>
            <text x={margin + W / 2} y={svgH - 5} textAnchor="middle" fontSize="13" fontWeight="bold" fill="#1e293b">{floor.name} — {floor.area}م² — سقف {floor.slabType}</text>
        </svg>
    );
};

const SvgCrossSection: React.FC<{ blueprint: BlueprintConfig }> = ({ blueprint: bp }) => {
    const scale = 25;
    const margin = 60;
    const excDepth = bp.excavation?.excavationDepth || 1.5;
    const zeroLevel = bp.excavation?.zeroLevel || 0.3;
    const totalHeight = bp.floors.reduce((s, f) => s + f.height, 0) + excDepth + zeroLevel + 2;
    const sectionW = (bp.plotWidth - bp.setbackSide * 2);

    const W = sectionW * scale;
    const H = totalHeight * scale;
    const svgW = W + margin * 2 + 100;
    const svgH = H + margin * 2;

    const groundY = margin + (zeroLevel + 1.5) * scale; // ground level Y position

    return (
        <svg width="100%" viewBox={`0 0 ${svgW} ${svgH}`} className="bg-white rounded-lg border border-slate-200" style={{ maxHeight: 500 }}>
            {/* Ground Level */}
            <line x1={margin - 20} y1={groundY} x2={margin + W + 20} y2={groundY} stroke="#22c55e" strokeWidth="2" strokeDasharray="6,3" />
            <text x={margin + W + 25} y={groundY + 4} fontSize="10" fill="#22c55e" fontWeight="bold">± 0.00 (أرض طبيعية)</text>

            {/* Excavation */}
            <rect x={margin} y={groundY} width={W} height={excDepth * scale} fill="rgba(139,92,42,0.15)" stroke="#8b5c2a" strokeWidth="1" strokeDasharray="4,2" />
            <text x={margin + W + 25} y={groundY + excDepth * scale / 2} fontSize="10" fill="#8b5c2a">حفر {excDepth}م</text>

            {/* Foundation */}
            <rect x={margin + 20} y={groundY + (excDepth - 0.1) * scale} width={W - 40} height={0.1 * scale} fill="#94a3b8" stroke="#475569" />
            <text x={margin + W + 25} y={groundY + excDepth * scale - 5} fontSize="9" fill="#475569">خ. نظافة</text>

            {/* Footing */}
            {bp.foundation && (
                <rect x={margin + 40} y={groundY + (excDepth - 0.1 - (bp.foundation.footingDepth || 0.5)) * scale}
                    width={(bp.foundation.footingWidth || 1.2) * scale} height={(bp.foundation.footingDepth || 0.5) * scale}
                    fill="rgba(99,102,241,0.3)" stroke="#6366f1" strokeWidth="1.5" />
            )}

            {/* Zero Level */}
            <line x1={margin - 10} y1={groundY - zeroLevel * scale} x2={margin + W + 10} y2={groundY - zeroLevel * scale} stroke="#ef4444" strokeWidth="1.5" strokeDasharray="4,2" />
            <text x={margin + W + 25} y={groundY - zeroLevel * scale + 4} fontSize="10" fill="#ef4444" fontWeight="bold">+{zeroLevel} (صفر معماري)</text>

            {/* Floors */}
            {(() => {
                let currentY = groundY - zeroLevel * scale;
                return bp.floors.map((floor, idx) => {
                    const floorH = floor.height * scale;
                    const y = currentY - floorH;
                    currentY = y;
                    return (
                        <g key={floor.id}>
                            <rect x={margin} y={y} width={W} height={floorH} fill={`rgba(99,102,241,${0.05 + idx * 0.03})`} stroke="#6366f1" strokeWidth="1" />
                            {/* Column */}
                            <rect x={margin + 50} y={y} width={8} height={floorH} fill="#334155" />
                            {/* Slab */}
                            <rect x={margin} y={y} width={W} height={5} fill="#475569" />
                            {/* Label */}
                            <text x={margin + W + 25} y={y + floorH / 2} fontSize="10" fill="#475569">{floor.name} ({floor.height}م)</text>
                        </g>
                    );
                });
            })()}

            <text x={margin + W / 2} y={svgH - 5} textAnchor="middle" fontSize="14" fontWeight="bold" fill="#1e293b">القطاع الرأسي | CROSS SECTION</text>
        </svg>
    );
};

// =================== LIVE INTERACTIVE FLOOR PLAN V2 ===================
const LiveFloorPlan: React.FC<{ blueprint: BlueprintConfig; language: Language }> = ({ blueprint: bp, language }) => {
    const isAr = language === 'ar';
    const [zoom, setZoom] = useState(1);
    const [selectedFloorIdx, setSelectedFloorIdx] = useState(0);

    const plotW = bp.plotWidth;
    const plotL = bp.plotLength;
    const sf = bp.setbackFront;
    const ss = bp.setbackSide;
    const sr = bp.setbackRear || 2;

    const bW = plotW - ss * 2;
    const bL = plotL - sf - sr;
    const buildableArea = Math.max(0, bW * bL);

    // Dynamic scale
    const baseScale = Math.min(16, Math.max(6, 480 / Math.max(plotW, 1)));
    const sc = baseScale;
    const margin = 55;

    const W = plotW * sc;
    const H = plotL * sc;
    const svgW = W + margin * 2;
    const svgH = H + margin * 2 + 30;

    const rooms = bp.roomFinishes || [];
    const floors = bp.floors || [];
    const colCount = floors[0]?.columnsCount || Math.max(4, Math.ceil(buildableArea / 16));
    const colW_cm = bp.columnWidth_cm || 30;
    const colD_cm = bp.columnDepth_cm || 50;

    // Room colors
    const RC: Record<string, { bg: string; bd: string; lb: string }> = {
        majlis: { bg: 'rgba(99,102,241,0.18)', bd: '#6366f1', lb: '#4338ca' },
        living: { bg: 'rgba(251,191,36,0.18)', bd: '#f59e0b', lb: '#92400e' },
        bedroom: { bg: 'rgba(167,139,250,0.18)', bd: '#8b5cf6', lb: '#6d28d9' },
        kitchen: { bg: 'rgba(34,197,94,0.18)', bd: '#22c55e', lb: '#166534' },
        bathroom: { bg: 'rgba(6,182,212,0.18)', bd: '#06b6d4', lb: '#0e7490' },
        office: { bg: 'rgba(244,63,94,0.15)', bd: '#f43f5e', lb: '#9f1239' },
        corridor: { bg: 'rgba(148,163,184,0.12)', bd: '#94a3b8', lb: '#475569' },
        storage: { bg: 'rgba(120,113,108,0.12)', bd: '#78716c', lb: '#44403c' },
        prayer: { bg: 'rgba(16,185,129,0.18)', bd: '#10b981', lb: '#065f46' },
        shop: { bg: 'rgba(249,115,22,0.18)', bd: '#f97316', lb: '#9a3412' },
        clinic: { bg: 'rgba(239,68,68,0.15)', bd: '#ef4444', lb: '#991b1b' },
        gym: { bg: 'rgba(124,58,237,0.15)', bd: '#7c3aed', lb: '#5b21b6' },
        restaurant: { bg: 'rgba(245,158,11,0.15)', bd: '#f59e0b', lb: '#78350f' },
        reception: { bg: 'rgba(236,72,153,0.15)', bd: '#ec4899', lb: '#9d174d' },
        service: { bg: 'rgba(107,114,128,0.12)', bd: '#6b7280', lb: '#374151' },
    };
    const defRC = { bg: 'rgba(148,163,184,0.12)', bd: '#94a3b8', lb: '#475569' };

    // Buildable zone pixel coords
    const bx = margin + ss * sc;
    const by = margin + sr * sc;
    const bWpx = Math.max(0, bW * sc);
    const bLpx = Math.max(0, bL * sc);
    const wallExt = 3; // external wall thickness px
    const wallInt = 2; // internal wall thickness px
    const pad = wallExt + 2;

    // ========== ZONE-BASED SQUARIFIED TREEMAP LAYOUT ==========
    const frontTypes = new Set(['majlis', 'reception', 'shop', 'prayer', 'restaurant', 'gym']);
    const middleTypes = new Set(['living', 'kitchen', 'corridor', 'dining', 'service']);
    // backTypes = everything else (bedroom, bathroom, office, storage, etc.)

    const frontRooms = rooms.filter(r => frontTypes.has(r.roomType));
    const middleRooms = rooms.filter(r => middleTypes.has(r.roomType));
    const backRooms = rooms.filter(r => !frontTypes.has(r.roomType) && !middleTypes.has(r.roomType));

    const totalFrontArea = frontRooms.reduce((s, r) => s + r.length * r.width, 0);
    const totalMiddleArea = middleRooms.reduce((s, r) => s + r.length * r.width, 0);
    const totalBackArea = backRooms.reduce((s, r) => s + r.length * r.width, 0);
    const totalRoomArea = totalFrontArea + totalMiddleArea + totalBackArea;

    // Zone height ratios (clamped)
    const innerW = bWpx - pad * 2;
    const innerH = bLpx - pad * 2;

    const rawFrontR = totalRoomArea > 0 ? totalFrontArea / totalRoomArea : 0.33;
    const rawMiddleR = totalRoomArea > 0 ? totalMiddleArea / totalRoomArea : 0.34;
    const frontR = Math.max(0.15, Math.min(0.45, rawFrontR));
    const middleR = Math.max(0.15, Math.min(0.50, rawMiddleR));
    const backR = Math.max(0.10, 1 - frontR - middleR);

    const frontH = frontRooms.length > 0 ? innerH * frontR : 0;
    const middleH = middleRooms.length > 0 ? innerH * middleR : 0;
    const allocatedH = frontH + middleH;
    const backH = backRooms.length > 0 ? innerH - allocatedH : 0;

    // Squarified treemap for a zone
    function treemapLayout(
        zoneRooms: typeof rooms,
        zx: number, zy: number, zw: number, zh: number
    ): Array<typeof rooms[0] & { rx: number; ry: number; rw: number; rh: number }> {
        if (zoneRooms.length === 0 || zw < 5 || zh < 5) return [];
        if (zoneRooms.length === 1) {
            return [{ ...zoneRooms[0], rx: zx, ry: zy, rw: zw, rh: zh }];
        }
        // Sort by area descending
        const sorted = [...zoneRooms].sort((a, b) => (b.length * b.width) - (a.length * a.width));
        const totalA = sorted.reduce((s, r) => s + r.length * r.width, 0);
        if (totalA <= 0) return [];

        const results: Array<typeof rooms[0] & { rx: number; ry: number; rw: number; rh: number }> = [];
        let cx = zx, cy = zy, cw = zw, ch = zh;

        for (let i = 0; i < sorted.length; i++) {
            const remaining = sorted.slice(i);
            const remArea = remaining.reduce((s, r) => s + r.length * r.width, 0);
            if (remaining.length === 1 || cw < 10 || ch < 10) {
                // Last room(s) — fill remaining space equally
                const perRoom = remaining.length;
                if (cw >= ch) {
                    // Stack horizontally
                    const segW = cw / perRoom;
                    remaining.forEach((r, j) => {
                        results.push({ ...r, rx: cx + j * segW, ry: cy, rw: segW, rh: ch });
                    });
                } else {
                    const segH = ch / perRoom;
                    remaining.forEach((r, j) => {
                        results.push({ ...r, rx: cx, ry: cy + j * segH, rw: cw, rh: segH });
                    });
                }
                break;
            }

            const roomArea = sorted[i].length * sorted[i].width;
            const ratio = roomArea / remArea;

            if (cw >= ch) {
                // Slice vertically
                const sliceW = cw * ratio;
                results.push({ ...sorted[i], rx: cx, ry: cy, rw: Math.max(sliceW, 15), rh: ch });
                cx += sliceW;
                cw -= sliceW;
            } else {
                // Slice horizontally
                const sliceH = ch * ratio;
                results.push({ ...sorted[i], rx: cx, ry: cy, rw: cw, rh: Math.max(sliceH, 12) });
                cy += sliceH;
                ch -= sliceH;
            }
        }
        return results;
    }

    const ix = bx + pad;
    const iy = by + pad;

    const frontRects = treemapLayout(frontRooms, ix, iy, innerW, frontH);
    const middleRects = treemapLayout(middleRooms, ix, iy + frontH, innerW, middleH);
    const backRects = treemapLayout(backRooms, ix, iy + frontH + middleH, innerW, backH);
    const allRoomRects = [...frontRects, ...middleRects, ...backRects];

    // ========== DYNAMIC COLUMNS ON ROOM BOUNDARIES ==========
    function generateColumns() {
        if (allRoomRects.length === 0 || bWpx <= 0 || bLpx <= 0) return [];

        // Collect unique X and Y edges from room boundaries
        const xSet = new Set<number>();
        const ySet = new Set<number>();
        // Always add buildable corners
        xSet.add(bx + wallExt); xSet.add(bx + bWpx - wallExt);
        ySet.add(by + wallExt); ySet.add(by + bLpx - wallExt);

        allRoomRects.forEach(r => {
            xSet.add(r.rx); xSet.add(r.rx + r.rw);
            ySet.add(r.ry); ySet.add(r.ry + r.rh);
        });

        const xs = Array.from(xSet).sort((a, b) => a - b);
        const ys = Array.from(ySet).sort((a, b) => a - b);

        // Generate all intersections
        const all: { x: number; y: number; isPerimeter: boolean }[] = [];
        xs.forEach(x => ys.forEach(y => {
            const isP = x <= bx + wallExt + 1 || x >= bx + bWpx - wallExt - 1 ||
                        y <= by + wallExt + 1 || y >= by + bLpx - wallExt - 1;
            all.push({ x, y, isPerimeter: isP });
        }));

        // Select: all perimeter + evenly spaced internal, up to colCount
        const perimeter = all.filter(c => c.isPerimeter);
        const internal = all.filter(c => !c.isPerimeter);

        // Ensure max spacing ~6m between columns
        const maxSpacingPx = 6 * sc;
        const needed = Math.max(0, colCount - perimeter.length);
        
        // Distribute internal columns evenly
        let selected = internal;
        if (selected.length > needed && needed > 0) {
            const step = Math.max(1, Math.floor(selected.length / needed));
            selected = selected.filter((_, i) => i % step === 0).slice(0, needed);
        }

        return [...perimeter.slice(0, colCount), ...selected.slice(0, Math.max(0, colCount - perimeter.length))].slice(0, Math.max(colCount, 4));
    }

    const columns = generateColumns();
    const cWpx = (colW_cm / 100) * sc;
    const cDpx = (colD_cm / 100) * sc;

    // ========== SMART TEXT ABBREVIATION ==========
    function smartLabel(name: string, maxW: number, maxH: number): { text: string; sub: string; fontSize: number } {
        const fontSize = Math.min(11, Math.max(6.5, Math.min(maxW / 5.5, maxH / 3.5)));
        const maxChars = Math.max(3, Math.floor(maxW / (fontSize * 0.65)));
        const abbr: Record<string, string> = {
            'مجلس رجال كبير': 'مجلس ♂', 'مجلس رجال': 'مجلس ♂', 'مجلس نساء': 'مجلس ♀',
            'صالة معيشة': 'صالة', 'صالة كبيرة': 'صالة', 'صالة طعام': 'طعام',
            'مطبخ رئيسي': 'مطبخ', 'مطبخ تحضيري': 'تحضيري',
            'حمام ضيوف': 'حمام', 'حمام ماستر': 'حمام M', 'حمام مشترك': 'حمام',
            'نوم ماستر': 'ماستر', 'غرفة نوم': 'نوم',
        };
        let label = abbr[name] || name;
        if (label.length > maxChars) label = label.substring(0, maxChars - 1) + '…';
        return { text: label, sub: '', fontSize };
    }

    // ========== FENCE (BOUNDARY WALL) ==========
    const fenceThick = 2;
    const gateW = 4 * sc; // 4m gate
    const gateX = margin + W / 2 - gateW / 2;

    // Total build area across all floors
    const totalBuildArea = floors.reduce((s, f) => s + f.area, 0);
    // Floor 0 area (ground floor)
    const groundFloorArea = floors[0]?.area || 0;

    // ========== SUMMARY DATA ==========
    const totalBlockExt = Math.ceil(
        floors.reduce((s, f) => s + (f.perimeterWallLength || Math.sqrt(f.area) * 4) * f.height * 0.85, 0) * 12.5
    );
    const totalBlockInt = Math.ceil(
        floors.reduce((s, f) => s + (f.internalWallLength || (f.perimeterWallLength || Math.sqrt(f.area) * 4) * 0.5) * f.height * 0.9, 0) * 12.5
    );
    const fencePerimeter = (plotW + plotL) * 2;
    const fenceBlocks = Math.ceil(fencePerimeter * 3 * 12.5); // 3m height

    // Plumbing fixture count
    const plumbingCount = rooms.filter(r => ['bathroom', 'kitchen'].includes(r.roomType)).length * 4;

    // Electrical points estimate
    const elecPoints = rooms.reduce((s, r) => {
        const area = r.length * r.width;
        const sockets = Math.max(2, Math.ceil(area / 4));
        const lights = Math.max(1, Math.ceil(area / 8));
        return s + sockets + lights;
    }, 0);

    // HVAC total tons
    const coolingBTU: Record<string, number> = {
        majlis: 600, living: 550, bedroom: 500, kitchen: 650, bathroom: 400,
        office: 550, corridor: 350, storage: 250, prayer: 550, reception: 600,
        restaurant: 700, shop: 600, service: 300,
    };
    const totalCoolingTons = rooms.reduce((s, r) => {
        const btu = r.length * r.width * (coolingBTU[r.roomType] || 500);
        return s + btu / 12000;
    }, 0);

    return (
        <div className="space-y-3">
            {/* Floor selector + Zoom */}
            <div className="flex items-center gap-2 justify-between flex-wrap">
                {/* Floor tabs */}
                {floors.length > 1 && (
                    <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-0.5">
                        {floors.map((f, idx) => (
                            <button key={f.id} onClick={() => setSelectedFloorIdx(idx)}
                                className={`px-3 py-1.5 rounded-md text-[11px] font-bold transition-all ${
                                    selectedFloorIdx === idx
                                        ? 'bg-indigo-600 text-white shadow-sm'
                                        : 'text-slate-500 hover:bg-slate-200'
                                }`}>
                                {f.name}
                            </button>
                        ))}
                    </div>
                )}
                {/* Zoom */}
                <div className="flex items-center gap-1">
                    <button onClick={() => setZoom(z => Math.min(z + 0.2, 3))}
                        className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-bold text-lg flex items-center justify-center transition-colors">+</button>
                    <button onClick={() => setZoom(z => Math.max(z - 0.2, 0.4))}
                        className="w-8 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 font-bold text-lg flex items-center justify-center transition-colors">−</button>
                    <button onClick={() => setZoom(1)}
                        className="px-2.5 h-8 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-500 text-[10px] font-bold transition-colors">
                        {Math.round(zoom * 100)}%
                    </button>
                    <span className="text-[10px] text-slate-400 font-bold mr-2">
                        {isAr ? 'مقياس 1م = ' : 'Scale 1m = '}{sc.toFixed(0)}px
                    </span>
                </div>
            </div>

            {/* SVG Container */}
            <div className="overflow-auto rounded-xl border border-slate-200 bg-white shadow-inner" style={{ maxHeight: 580 }}>
                <svg
                    width={svgW * zoom}
                    height={svgH * zoom}
                    viewBox={`0 0 ${svgW} ${svgH}`}
                    className="bg-white"
                >
                    <defs>
                        <pattern id="floorGrid2" width={sc} height={sc} patternUnits="userSpaceOnUse">
                            <path d={`M ${sc} 0 L 0 0 0 ${sc}`} fill="none" stroke="#e2e8f0" strokeWidth="0.3" />
                        </pattern>
                        <pattern id="setbackHatch2" width={4} height={4} patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                            <line x1="0" y1="0" x2="0" y2="4" stroke="#ef4444" strokeWidth="0.4" opacity="0.15" />
                        </pattern>
                        <pattern id="gardenPattern" width={8} height={8} patternUnits="userSpaceOnUse">
                            <circle cx="4" cy="4" r="1" fill="#86efac" opacity="0.4" />
                        </pattern>
                        <clipPath id="buildClip2">
                            <rect x={bx} y={by} width={bWpx} height={bLpx} />
                        </clipPath>
                    </defs>

                    {/* Grid */}
                    <rect width={svgW} height={svgH} fill="url(#floorGrid2)" />

                    {/* ── FENCE / BOUNDARY WALL ── */}
                    <rect x={margin - fenceThick} y={margin - fenceThick}
                        width={W + fenceThick * 2} height={H + fenceThick * 2}
                        fill="none" stroke="#78716c" strokeWidth={fenceThick} />
                    {/* Gate opening (front) */}
                    <line x1={gateX} y1={margin + H + fenceThick / 2} x2={gateX + gateW} y2={margin + H + fenceThick / 2}
                        stroke="white" strokeWidth={fenceThick + 2} />
                    <line x1={gateX} y1={margin + H} x2={gateX} y2={margin + H + 5} stroke="#78716c" strokeWidth="1.5" />
                    <line x1={gateX + gateW} y1={margin + H} x2={gateX + gateW} y2={margin + H + 5} stroke="#78716c" strokeWidth="1.5" />
                    <text x={gateX + gateW / 2} y={margin + H + 14} textAnchor="middle" fontSize="7" fill="#78716c" fontWeight="bold">
                        {isAr ? 'بوابة' : 'Gate'}
                    </text>

                    {/* ── GARDEN / YARD AREA ── */}
                    <rect x={margin} y={margin} width={W} height={H} fill="url(#gardenPattern)" opacity="0.3" />

                    {/* ── PLOT BOUNDARY ── */}
                    <rect x={margin} y={margin} width={W} height={H}
                        fill="none" stroke="#22c55e" strokeWidth="2" strokeDasharray="8,4" />

                    {/* ── SETBACK ZONES ── */}
                    <rect x={margin} y={margin + H - sf * sc} width={W} height={sf * sc} fill="url(#setbackHatch2)" />
                    <rect x={margin} y={margin} width={W} height={sr * sc} fill="url(#setbackHatch2)" />
                    <rect x={margin} y={margin} width={ss * sc} height={H} fill="url(#setbackHatch2)" />
                    <rect x={margin + W - ss * sc} y={margin} width={ss * sc} height={H} fill="url(#setbackHatch2)" />

                    {/* ── BUILDING OUTER WALLS (thick) ── */}
                    <rect x={bx} y={by} width={bWpx} height={bLpx}
                        fill="rgba(250,250,250,0.95)" stroke="#1e293b" strokeWidth={wallExt} rx="1" />

                    {/* ── ZONE DIVIDERS (internal walls between zones) ── */}
                    {frontRooms.length > 0 && middleRooms.length > 0 && (
                        <line x1={bx + wallExt} y1={iy + frontH} x2={bx + bWpx - wallExt} y2={iy + frontH}
                            stroke="#475569" strokeWidth={wallInt} />
                    )}
                    {middleRooms.length > 0 && backRooms.length > 0 && (
                        <line x1={bx + wallExt} y1={iy + frontH + middleH} x2={bx + bWpx - wallExt} y2={iy + frontH + middleH}
                            stroke="#475569" strokeWidth={wallInt} />
                    )}

                    {/* ── ROOMS ── */}
                    <g clipPath="url(#buildClip2)">
                        {allRoomRects.map(room => {
                            const c = RC[room.roomType] || defRC;
                            const lab = smartLabel(room.roomName, room.rw, room.rh);
                            const showLabel = room.rw > 25 && room.rh > 18;
                            const showDims = room.rw > 40 && room.rh > 28;
                            return (
                                <g key={room.id}>
                                    {/* Room fill */}
                                    <rect x={room.rx} y={room.ry} width={room.rw} height={room.rh}
                                        fill={c.bg} stroke={c.bd} strokeWidth="1" rx="1" />
                                    {/* Internal wall lines */}
                                    <rect x={room.rx} y={room.ry} width={room.rw} height={room.rh}
                                        fill="none" stroke="#64748b" strokeWidth={wallInt * 0.5} rx="1" />
                                    {/* Labels */}
                                    {showLabel && (
                                        <text x={room.rx + room.rw / 2} y={room.ry + room.rh / 2 + (showDims ? -2 : 3)}
                                            textAnchor="middle" dominantBaseline="middle"
                                            fontSize={lab.fontSize} fontWeight="bold" fill={c.lb}>
                                            {lab.text}
                                        </text>
                                    )}
                                    {showDims && (
                                        <text x={room.rx + room.rw / 2} y={room.ry + room.rh / 2 + lab.fontSize * 0.8 + 2}
                                            textAnchor="middle" fontSize={Math.max(6, lab.fontSize - 2)} fill={c.lb} opacity="0.55">
                                            {room.length}×{room.width}
                                        </text>
                                    )}
                                    {/* Door arc */}
                                    {room.rh > 22 && room.rw > 18 && (
                                        <path d={`M ${room.rx + 1} ${room.ry + room.rh - 6} A 6 6 0 0 1 ${room.rx + 7} ${room.ry + room.rh - 1}`}
                                            fill="none" stroke={c.bd} strokeWidth="0.6" opacity="0.5" />
                                    )}
                                </g>
                            );
                        })}
                    </g>

                    {/* ── COLUMNS (on room boundaries) ── */}
                    {columns.map((col, i) => (
                        <rect key={`col${i}`}
                            x={col.x - Math.max(cWpx, 3) / 2}
                            y={col.y - Math.max(cDpx, 4) / 2}
                            width={Math.max(cWpx, 3)}
                            height={Math.max(cDpx, 4)}
                            fill="#334155" rx="0.5" opacity="0.7" />
                    ))}

                    {/* ── DRIVEWAY from gate to building ── */}
                    {sf > 0 && (
                        <rect x={margin + W / 2 - 2 * sc} y={by + bLpx}
                            width={4 * sc} height={sf * sc - 2}
                            fill="rgba(148,163,184,0.1)" stroke="#94a3b8" strokeWidth="0.5" strokeDasharray="3,2" rx="2" />
                    )}

                    {/* ── DIMENSION LABELS ── */}
                    {/* Top: Width */}
                    <line x1={margin} y1={margin - 18} x2={margin + W} y2={margin - 18} stroke="#64748b" strokeWidth="0.8" />
                    <line x1={margin} y1={margin - 12} x2={margin} y2={margin - 24} stroke="#64748b" strokeWidth="0.5" />
                    <line x1={margin + W} y1={margin - 12} x2={margin + W} y2={margin - 24} stroke="#64748b" strokeWidth="0.5" />
                    <rect x={margin + W / 2 - 22} y={margin - 32} width={44} height={16} rx="3" fill="white" stroke="#cbd5e1" strokeWidth="0.5" />
                    <text x={margin + W / 2} y={margin - 21} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1e293b">{plotW} م</text>

                    {/* Left: Length */}
                    <line x1={margin - 18} y1={margin} x2={margin - 18} y2={margin + H} stroke="#64748b" strokeWidth="0.8" />
                    <line x1={margin - 12} y1={margin} x2={margin - 24} y2={margin} stroke="#64748b" strokeWidth="0.5" />
                    <line x1={margin - 12} y1={margin + H} x2={margin - 24} y2={margin + H} stroke="#64748b" strokeWidth="0.5" />
                    <rect x={margin - 43} y={margin + H / 2 - 8} width={44} height={16} rx="3" fill="white" stroke="#cbd5e1" strokeWidth="0.5" />
                    <text x={margin - 21} y={margin + H / 2 + 4} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#1e293b">{plotL} م</text>

                    {/* Setback labels */}
                    <text x={margin + W / 2} y={margin + H - sf * sc / 2 + 4} textAnchor="middle" fontSize="7.5" fill="#ef4444" fontWeight="bold" opacity="0.7">
                        {isAr ? 'أمامي' : 'F'} {sf}م
                    </text>
                    <text x={margin + W / 2} y={margin + sr * sc / 2 + 4} textAnchor="middle" fontSize="7.5" fill="#ef4444" fontWeight="bold" opacity="0.7">
                        {isAr ? 'خلفي' : 'R'} {sr}م
                    </text>
                    {ss > 0 && (
                        <>
                            <text x={margin + ss * sc / 2} y={margin + H / 2} textAnchor="middle" fontSize="7" fill="#ef4444" fontWeight="bold" opacity="0.6"
                                transform={`rotate(-90, ${margin + ss * sc / 2}, ${margin + H / 2})`}>
                                {isAr ? 'جانبي' : 'S'} {ss}م
                            </text>
                        </>
                    )}

                    {/* Buildable dimensions */}
                    <text x={bx + bWpx / 2} y={by + bLpx + 15} textAnchor="middle" fontSize="9" fill="#6366f1" fontWeight="bold">
                        {isAr ? 'قابل للبناء: ' : 'Buildable: '}{bW.toFixed(1)}×{bL.toFixed(1)}م = {buildableArea.toFixed(0)}م²
                    </text>

                    {/* ── COMPASS ── */}
                    <g transform={`translate(${svgW - 30}, 25)`}>
                        <circle r={12} fill="rgba(99,102,241,0.08)" stroke="#6366f1" strokeWidth="0.6" />
                        <polygon points="0,-10 -2.5,2 2.5,2" fill="#6366f1" />
                        <polygon points="0,10 -2.5,-2 2.5,-2" fill="#c7d2fe" />
                        <text x="0" y="-13" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#6366f1">N</text>
                    </g>

                    {/* Title */}
                    <text x={svgW / 2} y={svgH - 6} textAnchor="middle" fontSize="11" fontWeight="bold" fill="#94a3b8">
                        {isAr ? `المسقط الأفقي — ${floors[selectedFloorIdx]?.name || 'الأرضي'}` : `Floor Plan — ${floors[selectedFloorIdx]?.name || 'Ground'}`} | ARBA v7
                    </text>
                </svg>
            </div>

            {/* ── INFO CARDS (improved: 5 per row, icons, detailed) ── */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
                {[
                    { icon: '📐', l: isAr ? 'مساحة الأرض' : 'Plot Area', v: `${plotW}×${plotL}`, u: `= ${(plotW * plotL).toLocaleString()} م²`, c: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                    { icon: '🏗️', l: isAr ? 'قابل للبناء' : 'Buildable', v: `${bW.toFixed(0)}×${bL.toFixed(0)}`, u: `= ${buildableArea.toFixed(0)} م²`, c: 'text-indigo-700 bg-indigo-50 border-indigo-200' },
                    { icon: '🏢', l: isAr ? 'مسطح البناء' : 'Total Build', v: `${totalBuildArea.toLocaleString()}`, u: `م² (${floors.length} ${isAr ? 'طابق' : 'F'})`, c: 'text-violet-700 bg-violet-50 border-violet-200' },
                    { icon: '🏛️', l: isAr ? 'الأعمدة' : 'Columns', v: `${colCount}`, u: `(${colW_cm}×${colD_cm} سم)`, c: 'text-slate-700 bg-slate-100 border-slate-300' },
                    { icon: '🚪', l: isAr ? 'الفراغات' : 'Rooms', v: `${rooms.length}`, u: isAr ? 'غرفة' : 'rooms', c: 'text-teal-700 bg-teal-50 border-teal-200' },
                    { icon: '↕️', l: isAr ? 'ارتداد أمامي' : 'Front Setback', v: `${sf}`, u: 'م', c: 'text-red-600 bg-red-50 border-red-200' },
                    { icon: '↔️', l: isAr ? 'ارتداد جانبي' : 'Side Setback', v: `${ss}`, u: 'م', c: 'text-red-600 bg-red-50 border-red-200' },
                    { icon: '🧱', l: isAr ? 'بلوك خارجي' : 'Ext. Block', v: `${totalBlockExt.toLocaleString()}`, u: isAr ? 'بلكة 20سم' : 'pcs', c: 'text-amber-700 bg-amber-50 border-amber-200' },
                    { icon: '⚡', l: isAr ? 'نقاط كهرباء' : 'Elec. Points', v: `${elecPoints}`, u: isAr ? 'نقطة' : 'pts', c: 'text-yellow-700 bg-yellow-50 border-yellow-200' },
                    { icon: '❄️', l: isAr ? 'حمل التكييف' : 'HVAC Load', v: `${totalCoolingTons.toFixed(1)}`, u: isAr ? 'طن' : 'TR', c: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
                ].map((item, i) => (
                    <div key={i} className={`rounded-xl border-2 p-2.5 flex items-center gap-2 hover:shadow-md transition-shadow ${item.c}`}>
                        <span className="text-lg">{item.icon}</span>
                        <div className="min-w-0">
                            <div className="text-[9px] font-bold opacity-60 truncate">{item.l}</div>
                            <div className="text-sm font-black leading-tight">{item.v} <span className="text-[9px] font-medium opacity-50">{item.u}</span></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Room Legend chips */}
            {rooms.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {rooms.map(room => {
                        const c = RC[room.roomType] || defRC;
                        return (
                            <span key={room.id} className="inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-md border"
                                style={{ backgroundColor: c.bg, borderColor: c.bd, color: c.lb }}>
                                <span className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: c.bd }} />
                                {room.roomName} ({(room.length * room.width).toFixed(0)}م²)
                            </span>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default BlueprintEditor;
