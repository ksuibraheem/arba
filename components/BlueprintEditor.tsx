import React from 'react';
import { Ruler, Maximize, Layers, LayoutTemplate, Square, Plus, Trash2, AlertTriangle, PieChart } from 'lucide-react';
import { BlueprintConfig, FloorDetails, SlabType, FloorZone, Language } from '../types';
import { TRANSLATIONS } from '../constants';

interface BlueprintEditorProps {
    blueprint: BlueprintConfig;
    language: Language;
    onChange: (updates: Partial<BlueprintConfig>) => void;
    onUpdateTotalArea: (landArea: number, buildArea: number) => void;
}

const BlueprintEditor: React.FC<BlueprintEditorProps> = ({ blueprint, language, onChange, onUpdateTotalArea }) => {
    
    const t = (key: string) => TRANSLATIONS[key]?.[language] || key;

    const SLAB_TYPES: { id: SlabType; label: string; factor: number }[] = [
        { id: 'solid', label: t('slab_solid'), factor: 1.0 },
        { id: 'hordi', label: t('slab_hordi'), factor: 1.2 },
        { id: 'flat', label: t('slab_flat'), factor: 1.4 },
        { id: 'waffle', label: t('slab_waffle'), factor: 1.5 },
    ];

    const ZONE_TYPES = [
        { id: 'room', label: t('zone_room') },
        { id: 'service', label: t('zone_service') },
        { id: 'corridor', label: t('zone_corridor') },
        { id: 'open', label: t('zone_open') },
    ];

    const handleDimensionChange = (field: 'plotLength' | 'plotWidth' | 'setbackFront' | 'setbackSide', value: number) => {
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
            name: `Floor ${blueprint.floors.length + 1}`,
            area: lastFloor ? lastFloor.area : 150,
            height: 3.2,
            slabType: 'flat',
            columnsCount: lastFloor ? lastFloor.columnsCount : 12,
            zones: []
        };
        const newConfig = { ...blueprint, floors: [...blueprint.floors, newFloor] };
        onChange(newConfig);
        recalculateTotals(newConfig);
    };

    const removeFloor = (id: string) => {
        if(blueprint.floors.length <= 1) return;
        const newConfig = { ...blueprint, floors: blueprint.floors.filter(f => f.id !== id) };
        onChange(newConfig);
        recalculateTotals(newConfig);
    };

    // --- Zoning Functions ---
    const addZone = (floorId: string) => {
        const floor = blueprint.floors.find(f => f.id === floorId);
        if(!floor) return;
        
        const usedArea = floor.zones.reduce((acc, z) => acc + z.area, 0);
        const remaining = Math.max(0, floor.area - usedArea);

        const newZone: FloorZone = {
            id: Math.random().toString(36).substr(2, 9),
            name: t('zone_room'),
            area: remaining > 20 ? 20 : remaining, // Default to 20 or remaining
            type: 'room'
        };

        const newFloors = blueprint.floors.map(f => f.id === floorId ? { ...f, zones: [...f.zones, newZone] } : f);
        onChange({ ...blueprint, floors: newFloors });
    };

    const updateZone = (floorId: string, zoneId: string, updates: Partial<FloorZone>) => {
        const newFloors = blueprint.floors.map(f => {
            if (f.id === floorId) {
                return {
                    ...f,
                    zones: f.zones.map(z => z.id === zoneId ? { ...z, ...updates } : z)
                };
            }
            return f;
        });
        onChange({ ...blueprint, floors: newFloors });
    };

    const removeZone = (floorId: string, zoneId: string) => {
        const newFloors = blueprint.floors.map(f => {
            if (f.id === floorId) {
                return {
                    ...f,
                    zones: f.zones.filter(z => z.id !== zoneId)
                };
            }
            return f;
        });
        onChange({ ...blueprint, floors: newFloors });
    };

    const recalculateTotals = (config: BlueprintConfig) => {
        const landArea = config.plotLength * config.plotWidth;
        const buildArea = config.floors.reduce((acc, f) => acc + f.area, 0);
        onUpdateTotalArea(landArea, buildArea);
    };

    // Calculate dynamic styles for the plot visualization
    const plotRatio = blueprint.plotLength > 0 ? blueprint.plotWidth / blueprint.plotLength : 1;
    const maxDisplayHeight = 300;
    const displayWidth = 300;
    const displayHeight = displayWidth * plotRatio;

    const buildWidthPerc = Math.max(0, (blueprint.plotWidth - (blueprint.setbackSide * 2)) / blueprint.plotWidth) * 100;
    const buildLengthPerc = Math.max(0, (blueprint.plotLength - blueprint.setbackFront - 2) / blueprint.plotLength) * 100; // Assuming 2m rear setback

    return (
        <div className="flex flex-col h-full overflow-hidden bg-slate-50">
            <div className="bg-white border-b border-slate-200 p-6">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    <LayoutTemplate className="w-6 h-6 text-indigo-600" />
                    {t('blueprint_title')}
                </h2>
                <p className="text-slate-500 text-sm mt-1">{t('blueprint_desc')}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
                    
                    {/* Left Column: Dimensions */}
                    <div className="space-y-6">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                            <h3 className="font-bold text-slate-700 mb-4 flex items-center gap-2">
                                <Maximize className="w-4 h-4" /> {t('plot_dims')}
                            </h3>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">{t('width')}</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={blueprint.plotWidth}
                                            onChange={(e) => handleDimensionChange('plotWidth', Number(e.target.value))}
                                        />
                                        <span className="absolute left-3 top-2.5 text-xs text-slate-400">m</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">{t('depth')}</label>
                                    <div className="relative">
                                        <input 
                                            type="number" 
                                            className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-indigo-500 outline-none"
                                            value={blueprint.plotLength}
                                            onChange={(e) => handleDimensionChange('plotLength', Number(e.target.value))}
                                        />
                                        <span className="absolute left-3 top-2.5 text-xs text-slate-400">m</span>
                                    </div>
                                </div>
                            </div>
                            <div className="mt-4 pt-4 border-t border-slate-100 grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">{t('setback_f')}</label>
                                    <input 
                                        type="number" 
                                        className="w-full p-2 border border-slate-300 rounded text-sm"
                                        value={blueprint.setbackFront}
                                        onChange={(e) => handleDimensionChange('setbackFront', Number(e.target.value))}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 mb-1 block">{t('setback_s')}</label>
                                    <input 
                                        type="number" 
                                        className="w-full p-2 border border-slate-300 rounded text-sm"
                                        value={blueprint.setbackSide}
                                        onChange={(e) => handleDimensionChange('setbackSide', Number(e.target.value))}
                                    />
                                </div>
                            </div>
                            
                            <div className="mt-4 bg-indigo-50 p-3 rounded-lg flex justify-between items-center">
                                <span className="text-sm font-medium text-indigo-900">{t('plot_area')}</span>
                                <span className="font-bold text-indigo-700">{(blueprint.plotLength * blueprint.plotWidth).toLocaleString()} m²</span>
                            </div>
                        </div>

                        {/* Visualization */}
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex flex-col items-center justify-center min-h-[300px]">
                            <h3 className="font-bold text-slate-700 mb-4 w-full text-right flex items-center gap-2">
                                <Square className="w-4 h-4" /> {t('preview')}
                            </h3>
                            <div 
                                className="border-2 border-slate-800 bg-slate-100 relative transition-all duration-300"
                                style={{ width: `${displayWidth}px`, height: `${displayHeight}px`, maxHeight: `${maxDisplayHeight}px` }}
                            >
                                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-mono text-slate-500">{blueprint.plotWidth}m</span>
                                <span className="absolute -right-8 top-1/2 -translate-y-1/2 text-xs font-mono text-slate-500 rotate-90">{blueprint.plotLength}m</span>
                                
                                {/* Building Footprint Estimate */}
                                <div 
                                    className="absolute bg-indigo-200/50 border border-indigo-400 flex items-center justify-center"
                                    style={{
                                        width: `${buildWidthPerc}%`,
                                        height: `${buildLengthPerc}%`,
                                        top: `${(blueprint.setbackFront / blueprint.plotLength) * 100}%`,
                                        left: '50%',
                                        transform: 'translateX(-50%)'
                                    }}
                                >
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Middle & Right: Floors Configuration */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                <Layers className="w-5 h-5" /> {t('floors_details')}
                            </h3>
                            <button 
                                onClick={addFloor}
                                className="bg-slate-800 text-white px-4 py-2 rounded-lg text-sm hover:bg-slate-700 flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" /> {t('add_floor')}
                            </button>
                        </div>

                        <div className="space-y-4">
                            {blueprint.floors.map((floor, index) => {
                                const usedArea = floor.zones?.reduce((acc, z) => acc + z.area, 0) || 0;
                                const isOverLimit = usedArea > floor.area;
                                const remainingArea = floor.area - usedArea;
                                const usagePercentage = Math.min(100, (usedArea / floor.area) * 100);

                                return (
                                <div key={floor.id} className="bg-white p-5 rounded-xl shadow-sm border border-slate-200 relative group">
                                    <div className="flex justify-between items-start mb-4 border-b border-slate-100 pb-3">
                                        <div className="flex items-center gap-3">
                                            <span className="bg-indigo-100 text-indigo-700 w-8 h-8 flex items-center justify-center rounded-full font-bold text-sm">
                                                {index === 0 ? 'G' : index}
                                            </span>
                                            <input 
                                                type="text" 
                                                value={floor.name}
                                                onChange={(e) => updateFloor(floor.id, { name: e.target.value })}
                                                className="font-bold text-slate-800 bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 outline-none w-48"
                                            />
                                        </div>
                                        {index > 0 && (
                                            <button 
                                                onClick={() => removeFloor(floor.id)}
                                                className="text-red-400 hover:text-red-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-500 uppercase mb-1 block">{t('floor_area')} (m²)</label>
                                            <div className="relative">
                                                <input 
                                                    type="number"
                                                    value={floor.area}
                                                    onChange={(e) => updateFloor(floor.id, { area: Number(e.target.value) })}
                                                    className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                                />
                                                <Ruler className="w-3 h-3 text-slate-400 absolute left-2 top-3" />
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-bold text-slate-500 uppercase mb-1 block">{t('slab_type')}</label>
                                            <select 
                                                value={floor.slabType}
                                                onChange={(e) => updateFloor(floor.id, { slabType: e.target.value as SlabType })}
                                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 outline-none text-sm"
                                            >
                                                {SLAB_TYPES.map(t => (
                                                    <option key={t.id} value={t.id}>{t.label}</option>
                                                ))}
                                            </select>
                                        </div>

                                        <div>
                                            <label className="text-[11px] font-bold text-slate-500 uppercase mb-1 block">{t('columns_count')}</label>
                                            <input 
                                                type="number"
                                                value={floor.columnsCount}
                                                onChange={(e) => updateFloor(floor.id, { columnsCount: Number(e.target.value) })}
                                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                        
                                        <div>
                                            <label className="text-[11px] font-bold text-slate-500 uppercase mb-1 block">{t('floor_height')} (m)</label>
                                            <input 
                                                type="number"
                                                step="0.1"
                                                value={floor.height}
                                                onChange={(e) => updateFloor(floor.id, { height: Number(e.target.value) })}
                                                className="w-full p-2 bg-slate-50 border border-slate-200 rounded focus:ring-1 focus:ring-indigo-500 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Zoning / Subdivisions Section */}
                                    <div className="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                        <div className="flex justify-between items-center mb-3">
                                            <h4 className="text-xs font-bold text-slate-600 flex items-center gap-2">
                                                <PieChart className="w-4 h-4" />
                                                {t('area_distribution')}
                                                {isOverLimit && <span className="text-red-500 flex items-center gap-1 text-[10px] bg-red-100 px-2 py-0.5 rounded-full"><AlertTriangle className="w-3 h-3"/> {t('area_full')}</span>}
                                            </h4>
                                            <div className="flex items-center gap-4 text-xs">
                                                <span className={isOverLimit ? "text-red-600 font-bold" : "text-slate-600"}>{t('used')}: {usedArea}m²</span>
                                                <span className="text-slate-400">|</span>
                                                <span className={remainingArea < 0 ? "text-red-600" : "text-emerald-600"}>{t('remaining')}: {remainingArea}m²</span>
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden mb-4">
                                            <div 
                                                className={`h-full transition-all duration-500 ${isOverLimit ? 'bg-red-500' : 'bg-emerald-500'}`} 
                                                style={{ width: `${usagePercentage}%` }}
                                            />
                                        </div>

                                        {/* Zones List */}
                                        <div className="space-y-2 mb-3">
                                            {floor.zones?.map((zone) => (
                                                <div key={zone.id} className="flex items-center gap-2 bg-white p-2 rounded border border-slate-100">
                                                    <select 
                                                        value={zone.type}
                                                        onChange={(e) => updateZone(floor.id, zone.id, { type: e.target.value as any })}
                                                        className="text-xs bg-transparent border-none focus:ring-0 text-slate-500 w-24"
                                                    >
                                                        {ZONE_TYPES.map(z => <option key={z.id} value={z.id}>{z.label}</option>)}
                                                    </select>
                                                    <input 
                                                        type="text" 
                                                        value={zone.name}
                                                        onChange={(e) => updateZone(floor.id, zone.id, { name: e.target.value })}
                                                        className="flex-1 text-sm bg-transparent border-b border-dashed border-slate-300 focus:border-indigo-500 outline-none px-1"
                                                        placeholder={t('zone_name')}
                                                    />
                                                    <div className="flex items-center gap-1 bg-slate-50 rounded px-2 py-1">
                                                        <input 
                                                            type="number" 
                                                            value={zone.area}
                                                            onChange={(e) => updateZone(floor.id, zone.id, { area: Number(e.target.value) })}
                                                            className="w-12 text-sm bg-transparent outline-none text-center"
                                                        />
                                                        <span className="text-xs text-slate-400">m²</span>
                                                    </div>
                                                    <button 
                                                        onClick={() => removeZone(floor.id, zone.id)}
                                                        className="text-slate-400 hover:text-red-500 p-1"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                            {(!floor.zones || floor.zones.length === 0) && (
                                                <div className="text-center py-2 text-xs text-slate-400 italic">
                                                    {t('no_zones')}
                                                </div>
                                            )}
                                        </div>

                                        <button 
                                            onClick={() => addZone(floor.id)}
                                            className="w-full py-1.5 border border-dashed border-indigo-300 text-indigo-600 rounded text-xs hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" /> {t('add_zone')}
                                        </button>
                                    </div>
                                </div>
                            )})}
                        </div>

                        <div className="bg-indigo-900 text-white p-6 rounded-xl flex justify-between items-center shadow-lg mt-6">
                            <div>
                                <h4 className="text-indigo-200 text-sm font-medium mb-1">{t('total_build_area')}</h4>
                                <div className="text-3xl font-bold">{blueprint.floors.reduce((acc, f) => acc + f.area, 0).toLocaleString()} m²</div>
                            </div>
                            <div className="text-right">
                                <h4 className="text-indigo-200 text-sm font-medium mb-1">{t('total_floors')}</h4>
                                <div className="text-2xl font-bold">{blueprint.floors.length}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BlueprintEditor;
